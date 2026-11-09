/**
 * FreeRTOS intro: the timeline. Single source of truth for picture AND sound.
 *
 *   want (two LEDs + a button in one loop) → what (tasks, the scheduler,
 *     app_main is a task, two cores) → map (14 videos, three rows)
 *     → needs (second LED, Basic GPIO calls) → go ("First up: tasks")
 *
 * Times are SCENE-RELATIVE. `node scripts/vo-plan.ts freertos-intro` writes
 * VO_AT / VO_WORDS / SCENE_DUR below; cues are `w(line, word)`.
 * Import-free (type-only imports are erased): Node runs it as-is.
 */
import type { Caption } from '../../components/pwm';

export const FPS = 30;
export const SECTION = '2-freertos';

// ── generated: VO plan (node scripts/vo-plan.ts freertos-intro) — do not edit by hand ──
export const VO_AT: Record<string, number> = {"w1":0.8,"w2":8.14,"w3":15.76,"g1":0.5,"g2":7.66,"g3":13.52,"g4":19.7,"g5":23.82,"g6":28,"m1":0.5,"m2":3.42,"m3":13.78,"m4":22.88,"n1":0.5,"n2":6.76,"z1":0.6};
export const SCENE_DUR: Record<string, number> = {"want":18.88,"what":35.7,"map":31.26,"needs":14.74,"go":6.38};
export const VO_WORDS: Record<string, [string, number][]> = {
  w1: [["Let's",0],["say",0.3],["you",0.42],["want",0.56],["one",0.74],["LED",1.12],["blinking",1.7],["fast,",2.12],["another",3.26],["blinking",3.44],["slow,",3.76],["and",4.78],["a",5],["button",5.12],["you",5.34],["can",5.52],["press",5.66],["at",5.92],["any",6.12],["moment.",6.26]],
  w2: [["Each",0],["one",0.28],["is",0.46],["easy",0.62],["on",0.98],["its",1.22],["own,",1.36],["but",2],["put",2.16],["all",2.32],["three",2.58],["in",3.02],["one",3.3],["loop,",3.54],["and",4.24],["every",4.4],["delay",4.74],["holds",5.12],["up",5.46],["the",5.62],["others.",5.78]],
  w3: [["So",0],["how",0.26],["do",0.36],["you",0.44],["do",0.52],["several",0.66],["things",0.98],["at",1.22],["once?",1.4]],
  g1: [["with",0],["FreeRTOS,",0.28],["a",2],["small",2.1],["operating",2.36],["system",2.8],["that",3.28],["comes",3.6],["built",3.86],["into",4.16],["ESP",4.52],["-IDF.",5.08]],
  g2: [["You",0],["split",0.22],["your",0.4],["program",0.54],["into",0.88],["tasks.",1.12],["Each",2.26],["task",2.42],["is",2.92],["a",3.24],["loop",3.4],["of",3.6],["its",3.76],["own",3.88],["with",4.2],["its",4.58],["own",4.72],["delays.",4.94]],
  g3: [["The",0],["scheduler",0.24],["shares",0.72],["the",1.2],["CPU",1.42],["between",1.86],["them.",2.28],["Whenever",2.96],["one",3.14],["task",3.56],["waits,",3.96],["another",4.78],["one",4.98],["runs.",5.3]],
  g4: [["It",0],["switches",0.24],["so",0.5],["fast",0.94],["that",1.38],["they",1.64],["all",1.78],["seem",1.92],["to",2.2],["run",2.4],["at",2.54],["once.",2.66]],
  g5: [["and",0],["it's",0.2],["already",0.34],["running.",0.58],["Your",1.42],["app",1.54],["main",1.74],["is",1.96],["itself",2.14],["a",2.46],["task.",2.62]],
  g6: [["The",0],["ESP32",0.24],["has",1.22],["two",1.78],["cores,",2.1],["so",2.98],["two",3.22],["tasks",3.5],["can",3.88],["even",4.12],["run",4.32],["at",4.6],["the",4.76],["very",4.88],["same",5.1],["moment.",5.38]],
  m1: [["This",0],["section",0.26],["builds",0.58],["it",0.96],["up",1.08],["one",1.2],["piece",1.5],["at",1.78],["a",2],["time.",2.06]],
  m2: [["First,",0],["task",1.08],["themselves,",1.14],["how",2.26],["the",2.46],["scheduler",2.6],["picks",2.98],["which",3.2],["one",3.48],["runs,",3.72],["keeping",4.66],["a",4.92],["steady",5.12],["beat,",5.32],["using",6.16],["both",6.42],["cores,",6.78],["and",7.7],["giving",7.84],["each",8.06],["task",8.42],["enough",8.88],["memory.",9.12]],
  m3: [["then",0],["tasks",0.34],["working",0.76],["together,",1.16],["passing",2.1],["data,",2.5],["sharing",3.38],["safely,",3.76],["a",4.92],["trap",5],["called",5.28],["priority",5.54],["inversion,",5.94],["and",6.94],["ways",7.1],["to",7.34],["signal",7.54],["each",7.8],["other.",8]],
  m4: [["and",0],["the",0.22],["tools",0.3],["around",0.56],["them,",0.86],["timers,",1.62],["critical",2.28],["sections,",2.4],["and",3.52],["stats",3.66],["on",3.96],["where",4.18],["the",4.28],["CPU",4.4],["time",4.72],["goes.",5.08]],
  n1: [["You",0],["need",0.24],["the",0.36],["same",0.48],["board",0.72],["as",0.98],["in",1.16],["basic",1.32],["GPIO",1.66],["with",2.24],["a",2.88],["second",3.02],["LED",3.28],["and",3.62],["resistor",4.14],["on",4.5],["GPIO",4.86],["19.",5.26]],
  n2: [["You",0],["also",0.24],["need",0.48],["the",0.76],["calls",0.92],["from",1.2],["that",1.42],["section,",1.6],["setting",2.48],["a",2.74],["pin's",2.9],["direction,",3.18],["writing",4.1],["a",4.36],["level,",4.54],["and",5.26],["reading",5.46],["one.",5.68]],
  z1: [["First",0],["up,",0.34],["Tasks.",0.94]],
};
// ── end generated ──

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9.]/g, '').replace(/\.$/, '');
export const at = (id: string) => VO_AT[id] ?? 0;
export function w(id: string, word: string, n = 0, plus = 0): number {
  const ws = VO_WORDS[id];
  if (!ws) return 0;
  const target = norm(word);
  let k = 0;
  for (const [x, s] of ws) if (norm(x).startsWith(target) && k++ === n) return +(at(id) + s + plus).toFixed(2);
  throw new Error(`cue: no "${word}" #${n} in VO line ${id}: ${ws.map((x) => x[0]).join(' ')}`);
}
export function end(id: string): number {
  const ws = VO_WORDS[id];
  return ws?.length ? +(at(id) + ws[ws.length - 1][1] + 0.4).toFixed(2) : at(id);
}

// ── scenes ─────────────────────────────────────────────────────────────────

export const TAIL: Record<string, number> = { want: 1.5, what: 2.0, map: 3.0, needs: 2.0, go: 4.5 };
const dur = (id: string, fallback: number) => SCENE_DUR[id] ?? fallback;
export const SCENES = [
  { id: 'want', dur: dur('want', 16) },
  { id: 'what', dur: dur('what', 36) },
  { id: 'map', dur: dur('map', 30) },
  { id: 'needs', dur: dur('needs', 14) },
  { id: 'go', dur: dur('go', 6) },
] as const;
export type SceneId = (typeof SCENES)[number]['id'];
export function sceneStart(id: SceneId): number {
  let t = 0;
  for (const s of SCENES) {
    if (s.id === id) return t;
    t += s.dur;
  }
  throw new Error(`no scene ${id}`);
}
export const sceneDur = (id: SceneId) => SCENES.find((s) => s.id === id)!.dur;
export const SECONDS = SCENES.reduce((a, s) => a + s.dur, 0);
export const INTRO_FRAMES = Math.round(SECONDS * FPS);

// ── shared numbers (FACTS.md) ──────────────────────────────────────────────

/** half-periods of the two LEDs (freertos-tasks) */
export const FAST_MS = 200;
export const SLOW_MS = 500;
/** the one-loop round: 200 + 200 + 500 + 500 */
export const LOOP_MS = 2 * FAST_MS + 2 * SLOW_MS;
/** button presses in the 4 s lane window (s, s) */
export const PRESSES: [number, number][] = [
  [0.6, 0.9],
  [2.6, 3.0],
];

/** wanted: each at its own rate; one loop: fast on 0–0.2 of every 1.4 s, slow on 0.4–0.9 */
export function laneLevel(lane: 'fast' | 'slow' | 'button', s: number, oneLoop: boolean): number {
  if (lane === 'button') return PRESSES.some(([a, b]) => s >= a && s < b) ? 0 : 1;
  if (!oneLoop) {
    const half = lane === 'fast' ? FAST_MS : SLOW_MS;
    return Math.floor((s * 1000) / half) % 2 === 0 ? 1 : 0;
  }
  const u = (s * 1000) % LOOP_MS;
  return lane === 'fast' ? (u < FAST_MS ? 1 : 0) : u >= 2 * FAST_MS && u < 2 * FAST_MS + SLOW_MS ? 1 : 0;
}
/** one loop reads the button once per round, at its end */
export const LOOP_READS = [1.4, 2.8];

// ── 1. the want ────────────────────────────────────────────────────────────

export const WANT = {
  board: 0.3,
  fast: w('w1', 'fast'),
  slow: w('w1', 'slow'),
  button: w('w1', 'button'),
  easy: at('w2'),
  loop: w('w2', 'loop'),
  holds: w('w2', 'holds'),
  dim: at('w3'),
  captions: [
    { at: at('w1'), text: 'one LED fast · one slow · a button, any time' },
    { at: at('w2'), text: 'one loop: every delay holds up the others' },
    { at: at('w3'), text: 'several things at once?' },
  ] as Caption[],
};

// ── 2. what it is ──────────────────────────────────────────────────────────

export const WHAT = {
  views: [at('g1'), at('g2'), at('g5'), at('g6')],
  hero: w('g1', 'with', 0, 0.3),
  badge: w('g1', 'built'),
  tasks: w('g2', 'tasks'),
  ownLoop: w('g2', 'loop'),
  cpu: w('g3', 'shares'),
  waits: w('g3', 'whenever'),
  fast: w('g4', 'fast'),
  chain: [at('g5'), w('g5', 'running'), w('g5', 'app'), w('g5', 'task')],
  cores: w('g6', 'two'),
  same: w('g6', 'same'),
  captions: [
    { at: at('g1'), text: 'FreeRTOS: a small operating system, built into ESP-IDF' },
    { at: at('g2'), text: 'tasks: each one its own loop, with its own delays' },
    { at: at('g3'), text: 'the scheduler shares the CPU — when one waits, another runs' },
    { at: at('g4'), text: 'so fast, they all seem to run at once' },
    { at: at('g5'), text: 'already running: app_main is itself a task' },
    { at: at('g6'), text: 'two cores: two tasks at the very same moment' },
  ] as Caption[],
};

// ── 3. the map ─────────────────────────────────────────────────────────────

const card = (title: string, promise: string, cue: number, slug = '') => ({ title, slug, promise, at: cue });
export const MAP = {
  in: at('m1'),
  rowSizes: [5, 6, 3],
  cards: [
    card('tasks', 'give every job its own loop', w('m2', 'task'), 'freertos-tasks'),
    card('scheduler & priorities', 'who runs first', w('m2', 'scheduler')),
    card('delay-until', 'keep a steady beat', w('m2', 'steady')),
    card('two cores', 'pin a task to a CPU', w('m2', 'both')),
    card('stacks & watchdog', 'enough memory · the stuck-task alarm', w('m2', 'memory')),
    card('queues', 'pass data between tasks', w('m3', 'passing')),
    card('mutexes', 'share one thing safely', w('m3', 'sharing')),
    card('priority inversion', 'when low holds up high', w('m3', 'trap')),
    card('semaphores', 'signal, and count', w('m3', 'signal')),
    card('task notifications', 'the lightweight signal', w('m3', 'signal', 0, 0.35)),
    card('event groups', 'wait for several things', w('m3', 'signal', 0, 0.7)),
    card('timers', 'run code later, or every N ms', w('m4', 'timers')),
    card('critical sections', 'lines nothing can interrupt', w('m4', 'critical')),
    card('task stats', 'who uses the CPU', w('m4', 'stats')),
  ],
  captions: [
    { at: at('m1'), text: 'this section: one piece at a time' },
    { at: at('m2'), text: 'tasks and scheduling' },
    { at: at('m3'), text: 'tasks working together' },
    { at: at('m4'), text: 'the tools around them' },
  ] as Caption[],
};

// ── 4. what you need ───────────────────────────────────────────────────────

export const NEEDS = {
  board: 0.2,
  led2: w('n1', 'second'),
  calls: [w('n2', 'direction'), w('n2', 'writing'), w('n2', 'reading')],
  heading: at('n2'),
  captions: [
    { at: at('n1'), text: 'the Basic GPIO board + a second LED and 220 Ω on GPIO 19' },
    { at: at('n2'), text: 'and the calls from Basic GPIO' },
  ] as Caption[],
};

// ── 5. go ──────────────────────────────────────────────────────────────────

export const GO = { line: at('z1'), card: 0, nextLabel: 'tasks' };

// ── sound (scripts/intro-audio.ts) ─────────────────────────────────────────

type Sound = { scene: SceneId; at: number; kind: 'tick' | 'thump' | 'clack' | 'buzz' | 'blip'; f?: number; amp?: number };
export const SOUND: Sound[] = [
  { scene: 'want', at: WANT.fast, kind: 'tick', f: 2600, amp: 0.08 },
  { scene: 'want', at: WANT.slow, kind: 'tick', f: 2850, amp: 0.08 },
  { scene: 'want', at: WANT.button, kind: 'tick', f: 3100, amp: 0.08 },
  { scene: 'want', at: WANT.loop, kind: 'tick', f: 2350, amp: 0.12 },
  { scene: 'want', at: WANT.holds, kind: 'buzz', amp: 0.07 },
  { scene: 'want', at: WANT.dim, kind: 'thump', amp: 0.18 },
  { scene: 'what', at: WHAT.hero, kind: 'thump', amp: 0.26 },
  { scene: 'what', at: WHAT.badge, kind: 'tick', f: 3100, amp: 0.05 },
  { scene: 'what', at: WHAT.views[1], kind: 'tick', f: 2000, amp: 0.09 },
  ...[0, 1, 2].map((i) => ({ scene: 'what' as SceneId, at: WHAT.tasks + 0.15 * i, kind: 'tick' as const, f: 2600 + 250 * i, amp: 0.08 })),
  { scene: 'what', at: WHAT.cpu, kind: 'clack', amp: 0.14 },
  { scene: 'what', at: WHAT.fast, kind: 'blip', amp: 0.06 },
  { scene: 'what', at: WHAT.views[2], kind: 'tick', f: 2000, amp: 0.09 },
  ...WHAT.chain.slice(1).map((c, i) => ({ scene: 'what' as SceneId, at: c, kind: 'tick' as const, f: 2400 + 200 * i, amp: 0.08 })),
  { scene: 'what', at: WHAT.views[3], kind: 'tick', f: 2000, amp: 0.09 },
  { scene: 'what', at: WHAT.cores, kind: 'thump', amp: 0.2 },
  { scene: 'map', at: MAP.in, kind: 'tick', f: 2000, amp: 0.09 },
  ...MAP.cards.map((c, i) => ({ scene: 'map' as SceneId, at: c.at, kind: 'tick' as const, f: 2400 + 60 * i, amp: 0.07 })),
  { scene: 'needs', at: NEEDS.led2, kind: 'clack', amp: 0.14 },
  ...NEEDS.calls.map((c) => ({ scene: 'needs' as SceneId, at: c, kind: 'blip' as const, amp: 0.05 })),
  { scene: 'go', at: GO.line, kind: 'thump', amp: 0.4 },
];

// ── voice-over ─────────────────────────────────────────────────────────────

export type VoLine = { id: string; scene: SceneId; at: number; text: string; say?: string; pause?: number; fixed?: boolean };
export const VOICE = 'en-US-AndrewMultilingualNeural';
const L = (id: string, scene: SceneId, text: string, say?: string, pause?: number): VoLine => ({ id, scene, at: at(id), text, say, pause });

export const VO: VoLine[] = [
  L('w1', 'want', "Let's say you want one LED blinking fast, another blinking slow, and a button you can press at any moment.", undefined, 0.8),
  L('w2', 'want', 'Each one is easy on its own. But put all three in one loop, and every delay holds up the others.', undefined, 0.8),
  L('w3', 'want', 'So how do you do several things at once?', undefined, 1.6),
  L('g1', 'what', 'With FreeRTOS, a small operating system that comes built into ESP-IDF.', 'With free R-T-O-S, a small operating system that comes built into E S P I D F.'),
  L('g2', 'what', 'You split your program into tasks. Each task is a loop of its own, with its own delays.', undefined, 1.0),
  L('g3', 'what', 'The scheduler shares the CPU between them. Whenever one task waits, another one runs.'),
  L('g4', 'what', 'It switches so fast that they all seem to run at once.'),
  L('g5', 'what', "And it's already running. Your app_main is itself a task.", "And it's already running. Your app main is itself a task.", 1.2),
  L('g6', 'what', 'The ESP32 has two cores, so two tasks can even run at the very same moment.', undefined, 1.2),
  L('m1', 'map', 'This section builds it up one piece at a time.'),
  L('m2', 'map', 'First, tasks themselves: how the scheduler picks which one runs, keeping a steady beat, using both cores, and giving each task enough memory.'),
  L('m3', 'map', 'Then tasks working together: passing data, sharing safely, a trap called priority inversion, and ways to signal each other.', undefined, 0.9),
  L('m4', 'map', 'And the tools around them: timers, critical sections, and stats on where the CPU time goes.', undefined, 0.9),
  L('n1', 'needs', 'You need the same board as in Basic GPIO, with a second LED and resistor on GPIO 19.', 'You need the same board as in Basic GPIO, with a second LED and resistor on GPIO nineteen.'),
  L('n2', 'needs', "You also need the calls from that section: setting a pin's direction, writing a level, and reading one."),
  L('z1', 'go', 'First up: tasks.', undefined, 0.6),
];
