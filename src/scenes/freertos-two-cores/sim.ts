/**
 * A small model of the ESP32's scheduler running this video's program, 1 ms at a time —
 * the scheduler video's model (../freertos-scheduler/sim.ts) plus core pinning and turn-
 * taking between equal priorities. It drives the CPU lanes, the LED lanes and the LED
 * ticks in the soundtrack. Worked out from the rules in FACTS.md; a drawing, not a
 * measurement.
 *
 *   - 2 cores; 1 tick = 10 ms, on both cores at once; delays end on a tick
 *     (vTaskDelay counts from the tick it was called in).
 *   - blink_fast (5, 20 ticks), blink_slow (5, 50 ticks), unpinned: run for ~0 ms,
 *     switch their LED, block again.
 *   - work_a, work_b (priority `workPrio`, core `workCore`, null = either): busy for
 *     300 ms of clock time, then vTaskDelay(10 ticks).
 *   - app_main (1, core 0) creates the four tasks in order; while a new task holds
 *     core 0, app_main waits, so work_b is created when core 0 is free again.
 *   - each moment: the highest-priority ready task takes, of the cores it may use, the
 *     one whose task has the lowest priority (an empty core counts lowest; tie → core 0),
 *     if it outranks it.
 *   - at each tick, a core running a worker hands over to a ready task of the same
 *     priority that may use that core (they take turns, a tick at a time).
 *
 * Import-free: Node runs it as-is (the audio build imports it).
 */

export const TICK = 10;
export const FAST_MS = 200;
export const SLOW_MS = 500;
export const BUSY_MS = 300;
export const REST_MS = 100;

export type Worker = 'work_a' | 'work_b';
export type Span = { a: number; b: number; task: Worker };
export type Sim = {
  until: number;
  /** LED switch times (ms); the LED is on after even-indexed edges */
  edges: { fast: number[]; slow: number[] };
  /** fast-LED edges more than a tick after their beat */
  late: number[];
  /** what each core runs (workers only; gaps = idle or an LED blip) */
  cores: [Span[], Span[]];
  /** each worker loop start: which core it was on (for the example log) */
  starts: { t: number; task: Worker; core: number }[];
  /** CPU ms each worker got */
  cpu: Record<Worker, number>;
};
export type SimOpts = { until: number; workPrio: number; workCore: 0 | 1 | null };

type Task = {
  id: string;
  prio: number;
  aff: number | null;
  instant: boolean;
  delayTicks: number;
  state: 'ready' | 'blocked' | 'running' | 'unborn';
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
  const mk = (id: string, prio: number, aff: number | null, instant: boolean, delayTicks: number): Task => ({
    id,
    prio,
    aff,
    instant,
    delayTicks,
    state: 'unborn',
    wake: 0,
    readySince: 0,
    busyEnd: 0,
    fresh: true,
    core: -1,
  });
  const tasks: Task[] = [
    mk('blink_fast', 5, null, true, FAST_MS / TICK),
    mk('blink_slow', 5, null, true, SLOW_MS / TICK),
    mk('work_a', o.workPrio, o.workCore, false, REST_MS / TICK),
    mk('work_b', o.workPrio, o.workCore, false, REST_MS / TICK),
  ];
  const core: (Task | null)[] = [null, null];
  const sim: Sim = { until: o.until, edges: { fast: [], slow: [] }, late: [], cores: [[], []], starts: [], cpu: { work_a: 0, work_b: 0 } };
  const block = (k: Task, t: number) => {
    k.state = 'blocked';
    k.wake = (Math.floor(t / TICK) + k.delayTicks) * TICK;
    if (k.core >= 0) core[k.core] = null;
    k.core = -1;
    k.fresh = true;
  };
  const canUse = (k: Task, c: number) => k.aff === null || k.aff === c;
  const open: (Span | null)[] = [null, null];
  let created = 0; // app_main's progress through its four xTaskCreate calls

  for (let t = 0; t <= o.until; t++) {
    // 0. app_main (core 0, priority 1) creates the next task when core 0 is free
    while (created < tasks.length && (core[0] === null || core[0].prio < 1)) {
      const k = tasks[created++];
      k.state = 'ready';
      k.readySince = t;
      schedule(t);
    }
    const tick = t % TICK === 0;
    // 1. a tick: delays that have run out end now
    if (tick) for (const k of tasks) if (k.state === 'blocked' && k.wake <= t) ((k.state = 'ready'), (k.readySince = t));
    // 2. a worker whose 300 ms are up rests
    for (const k of tasks) if (!k.instant && k.state === 'running' && t >= k.busyEnd) block(k, t);
    // 3. turns: at a tick, a worker hands its core to a ready equal that may use it
    if (tick)
      for (let c = 0; c < 2; c++) {
        const cur = core[c];
        if (!cur || cur.instant) continue;
        const next = tasks
          .filter((k) => k.state === 'ready' && k.prio === cur.prio && canUse(k, c))
          .sort((x, y) => x.readySince - y.readySince)[0];
        if (!next) continue;
        cur.state = 'ready';
        cur.readySince = t;
        cur.core = -1;
        core[c] = null;
        place(next, c, t);
      }
    schedule(t);
    // 4. record
    for (let c = 0; c < 2; c++) {
      const k = core[c];
      const id = k && !k.instant ? (k.id as Worker) : null;
      if (id) sim.cpu[id]++;
      const cur = open[c];
      if (cur && cur.task !== id) {
        cur.b = t;
        sim.cores[c].push(cur);
        open[c] = null;
      }
      if (id && !open[c]) open[c] = { a: t, b: t, task: id };
    }
  }
  for (let c = 0; c < 2; c++) if (open[c]) ((open[c]!.b = o.until), sim.cores[c].push(open[c]!));
  const f = sim.edges.fast;
  for (let i = 1; i < f.length; i++) if (f[i] - f[i - 1] > FAST_MS + TICK) sim.late.push(f[i]);
  cache.set(key, sim);
  return sim;

  function place(r: Task, c: number, t: number) {
    core[c] = r;
    r.state = 'running';
    r.core = c;
    if (r.instant) {
      sim.edges[r.id === 'blink_fast' ? 'fast' : 'slow'].push(t);
      block(r, t);
    } else if (r.fresh) {
      r.busyEnd = t + BUSY_MS;
      r.fresh = false;
      sim.starts.push({ t, task: r.id as Worker, core: c });
    }
  }
  function schedule(t: number) {
    for (;;) {
      const ready = tasks.filter((k) => k.state === 'ready').sort((x, y) => y.prio - x.prio || x.readySince - y.readySince);
      let moved = false;
      for (const r of ready) {
        const pr = (c: number) => core[c]?.prio ?? -1;
        const cs = [0, 1].filter((c) => canUse(r, c) && r.prio > pr(c)).sort((x, y) => pr(x) - pr(y) || x - y);
        if (!cs.length) continue;
        const c = cs[0];
        const out = core[c];
        if (out) ((out.state = 'ready'), (out.readySince = t), (out.core = -1));
        place(r, c, t);
        moved = true;
        break;
      }
      if (!moved) break;
    }
  }
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
