/**
 * A small model of the ESP32's scheduler running this video's program, 1 ms at a time.
 * It drives the LED lanes, the CPU lanes and the LED ticks in the soundtrack, so the
 * picture and the sound show the same schedule. Worked out from the rules in FACTS.md
 * ("The demo, worked through"); it is a drawing, not a measurement.
 *
 *   - 2 cores; 1 tick = 10 ms; delays end on a tick (vTaskDelay counts from the tick
 *     it was called in).
 *   - blink_fast (5, 20 ticks), blink_slow (5, 50 ticks): run for ~0 ms, switch their
 *     LED, block again.
 *   - work_a, work_b (priority from `workPrio`): busy for 300 ms of clock time, then
 *     vTaskDelay(10 ticks) — unless `rest` is false. work_b starts 300 ms after work_a
 *     (app_main is held up while work_a, which outranks it, runs on CPU 0).
 *   - each moment: the highest-priority ready task takes the core whose task has the
 *     lowest priority (an empty core counts as 0), if it outranks it.
 *   - the button task (7, every tick, ~0 ms) never changes the outcome; it isn't drawn.
 *
 * Import-free: Node runs it as-is (the audio build imports it).
 */

export const TICK = 10;
export const FAST_MS = 200;
export const SLOW_MS = 500;
export const BUSY_MS = 300;
export const REST_MS = 100;
export const WORK_B_START = 300;

export type WorkerSpan = { a: number; b: number; task: 'work_a' | 'work_b'; prio: number };
export type BlinkEvent = { t: number; core: number; task: 'blink_fast' | 'blink_slow' };
export type Sim = {
  until: number;
  /** LED switch times (ms); the LED is on after even-indexed edges */
  edges: { fast: number[]; slow: number[] };
  /** fast-LED edges that came late (more than a tick after their beat) */
  late: number[];
  cores: WorkerSpan[][];
  blinks: BlinkEvent[];
};

export type SimOpts = { until: number; workPrio: (ms: number) => number; rest?: boolean };

type Task = {
  id: string;
  prio: () => number;
  instant: boolean;
  delayTicks: number;
  state: 'ready' | 'blocked' | 'running';
  wake: number;
  readySince: number;
  busyEnd: number;
  fresh: boolean;
  core: number;
};

const cache = new Map<string, Sim>();

export function simulate(key: string, o: SimOpts): Sim {
  const hit = cache.get(key);
  if (hit) return hit;
  const rest = o.rest ?? true;
  let now = 0;
  const mk = (id: string, prio: () => number, instant: boolean, delayTicks: number, start: number): Task => ({
    id,
    prio,
    instant,
    delayTicks,
    state: start === 0 ? 'ready' : 'blocked',
    wake: start,
    readySince: 0,
    busyEnd: 0,
    fresh: true,
    core: -1,
  });
  const wp = () => o.workPrio(now);
  const tasks: Task[] = [
    mk('blink_fast', () => 5, true, FAST_MS / TICK, 0),
    mk('blink_slow', () => 5, true, SLOW_MS / TICK, 0),
    mk('work_a', wp, false, REST_MS / TICK, 0),
    mk('work_b', wp, false, REST_MS / TICK, WORK_B_START),
  ];
  const core: (Task | null)[] = [null, null];
  const sim: Sim = { until: o.until, edges: { fast: [], slow: [] }, late: [], cores: [[], []], blinks: [] };
  const level = { blink_fast: 0, blink_slow: 0 } as Record<string, number>;
  const block = (k: Task, t: number) => {
    k.state = 'blocked';
    k.wake = (Math.floor(t / TICK) + k.delayTicks) * TICK;
    if (k.core >= 0) core[k.core] = null;
    k.core = -1;
    k.fresh = true;
  };
  const open: (WorkerSpan | null)[] = [null, null];

  for (now = 0; now <= o.until; now++) {
    const t = now;
    // 1. a tick: delays that have run out end now
    if (t % TICK === 0) for (const k of tasks) if (k.state === 'blocked' && k.wake <= t) ((k.state = 'ready'), (k.readySince = t));
    // 2. a worker whose 300 ms are up rests (or starts over)
    for (const k of tasks) {
      if (k.instant || k.state !== 'running' || t < k.busyEnd) continue;
      if (rest) block(k, t);
      else k.busyEnd = t + BUSY_MS;
    }
    // 3. the rule: the highest-priority ready task takes the lowest-priority core
    for (;;) {
      const ready = tasks.filter((k) => k.state === 'ready').sort((x, y) => y.prio() - x.prio() || x.readySince - y.readySince);
      if (!ready.length) break;
      const r = ready[0];
      // an empty core counts lowest; on a tie, core 0
      const pr = (c: number) => core[c]?.prio() ?? -1;
      const c = pr(0) <= pr(1) ? 0 : 1;
      if (!(r.prio() > pr(c))) break;
      const out = core[c];
      if (out) ((out.state = 'ready'), (out.readySince = t), (out.core = -1));
      core[c] = r;
      r.state = 'running';
      r.core = c;
      if (r.instant) {
        const which = r.id === 'blink_fast' ? 'fast' : 'slow';
        level[r.id] ^= 1;
        sim.edges[which].push(t);
        sim.blinks.push({ t, core: c, task: r.id as BlinkEvent['task'] });
        block(r, t);
      } else if (r.fresh) {
        r.busyEnd = t + BUSY_MS;
        r.fresh = false;
      }
    }
    // 4. record what each core runs
    for (let c = 0; c < 2; c++) {
      const k = core[c];
      const id = k && !k.instant ? (k.id as WorkerSpan['task']) : null;
      const cur = open[c];
      if (cur && (cur.task !== id || cur.prio !== (k?.prio() ?? -1))) {
        cur.b = t;
        sim.cores[c].push(cur);
        open[c] = null;
      }
      if (id && !open[c]) open[c] = { a: t, b: t, task: id, prio: k!.prio() };
    }
  }
  for (let c = 0; c < 2; c++) if (open[c]) ((open[c]!.b = o.until), sim.cores[c].push(open[c]!));
  const f = sim.edges.fast;
  for (let i = 1; i < f.length; i++) if (f[i] - f[i - 1] > FAST_MS + TICK) sim.late.push(f[i]);
  cache.set(key, sim);
  return sim;
}

/** LED level at ms `s` from its edges (on after even-indexed edges) */
export function ledAt(edges: number[], s: number): number {
  let n = 0;
  for (const e of edges) {
    if (e > s) break;
    n++;
  }
  return n % 2;
}

/** an LED that switches every `ms`, from 0 */
export const wanted = (ms: number, s: number) => (s < 0 ? 0 : Math.floor(s / ms) % 2 === 0 ? 1 : 0);
