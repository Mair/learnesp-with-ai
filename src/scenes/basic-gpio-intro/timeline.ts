/**
 * Basic GPIO intro: the timeline. Single source of truth for picture AND sound.
 *
 *   want → what (GPIO: output / input, two levels) → map (gpio, gpio-input)
 *     → needs (parts + ESP-IDF v6) → go ("First up: GPIO output")
 *
 * Times are SCENE-RELATIVE. `node scripts/vo-plan.ts basic-gpio-intro` voices
 * every line and writes VO_AT / VO_WORDS / SCENE_DUR below; cues are `w(line, word)`.
 * Import-free (type-only imports are erased): Node runs it as-is.
 *
 *   node scripts/vo-plan.ts basic-gpio-intro   # re-time from the voice
 *   npm run basic-gpio-intro                   # soundtrack + render
 */
import type { Caption } from '../../components/pwm';

export const FPS = 30;
export const SECTION = '1-basic-gpio';

// ── generated: VO plan (node scripts/vo-plan.ts basic-gpio-intro) — do not edit by hand ──
export const VO_AT: Record<string, number> = {"w1":0.8,"w2":5.76,"w3":13.26,"g1":0.5,"g2":7.4,"g3":11.6,"g4":17.94,"g5":22.82,"m1":0.5,"m2":2.86,"m3":9.56,"n1":0.5,"n2":7.66,"n3":13.62,"n4":21.34,"z1":0.6};
export const SCENE_DUR: Record<string, number> = {"want":16.68,"what":28.14,"map":20.16,"needs":26.18,"go":6.94};
export const VO_WORDS: Record<string, [string, number][]> = {
  w1: [["Here's",0],["an",0.36],["ESP32",0.46],["on",1.56],["a",1.92],["breadboard",2.06],["with",2.5],["an",2.94],["LED",3.08],["and",3.5],["a",4.1],["button.",4.2]],
  w2: [["By",0],["the",0.24],["end",0.36],["of",0.48],["this",0.58],["section,",0.74],["your",1.56],["code",1.64],["will",1.9],["switch",2.1],["that",2.42],["LED",2.7],["on",3.08],["and",3.58],["off",3.72],["and",4.02],["read",4.7],["that",4.9],["button.",5.12]],
  w3: [["So",0],["how",0.26],["does",0.4],["code",0.58],["reach",0.86],["the",1.34],["outside",1.56],["world?",1.92]],
  g1: [["through",0],["its",0.32],["pins.",0.44],["Most",1.52],["of",1.6],["them",1.76],["are",1.88],["GPIOs,",2.06],["general",4.3],["purpose",4.44],["input",4.78],["and",5.26],["output.",5.52]],
  g2: [["General",0],["purpose,",0.42],["because",1.22],["your",1.48],["code",1.64],["decides",1.96],["what",2.44],["each",2.74],["pin",2.98],["does.",3.26]],
  g3: [["Make",0],["one",0.24],["an",0.38],["output,",0.48],["and",1.24],["your",1.4],["code",1.5],["sets",1.76],["it",2],["high,",2.16],["3",3.1],[".3",3.26],["volts",3.82],["or",4.04],["low",4.62],["zero.",4.82]],
  g4: [["Make",0],["it",0.26],["an",0.34],["input",0.46],["and",0.84],["your",1.42],["code",1.52],["reads",1.94],["which",2.48],["of",2.7],["the",2.8],["two",2.88],["it",3.06],["sees.",3.18]],
  g5: [["Two",0],["levels,",0.3],["nothing",1.18],["in",1.32],["between.",1.52],["That's",2.5],["what",2.58],["digital",2.66],["means.",2.88]],
  m1: [["This",0],["section",0.28],["has",0.7],["two",1.12],["videos.",1.38]],
  m2: [["First,",0],["GPIO",0.9],["output.",1.22],["You",2.26],["set",2.3],["up",2.44],["a",2.54],["pin",2.64],["to",2.84],["drive",3.04],["an",3.3],["LED,",3.44],["then",4.54],["blink",4.76],["it.",5.08]],
  m3: [["Then,",0],["GPIO",0.78],["input.",1.18],["Your",2.22],["code",2.32],["reads",2.66],["a",3.12],["button,",3.32],["lights",4],["the",4.42],["LED",4.64],["while",5],["it's",5.44],["held,",5.6],["and",6.36],["counts",6.46],["the",6.7],["presses.",6.86]],
  n1: [["On",0],["the",0.22],["bench,",0.34],["an",1.28],["ESP32",1.5],["board,",2.66],["a",3.58],["USB",3.62],["cable,",4.06],["a",5.14],["breadboard,",5.18],["and",5.88],["a",5.92],["few",6.02],["wires.",6.22]],
  n2: [["An",0],["LED",0.24],["with",0.72],["a",1.36],["220",1.58],["ohm",2.22],["resistor",2.52],["to",2.72],["go",2.94],["with",3.06],["it,",3.22],["and",3.84],["a",4.3],["push",4.56],["button.",4.74]],
  n3: [["On",0],["your",0.24],["computer,",0.36],["ESP",1.42],["-IDF",1.68],["version",3.16],["6,",3.76],["so",4.66],["you",4.84],["can",4.94],["build,",5.06],["flash,",5.72],["and",6.46],["watch",6.5],["the",6.7],["log.",6.88]],
  n4: [["This",0],["is",0.22],["the",0.34],["first",0.46],["section,",0.66],["so",1.46],["that's",1.68],["all",1.84],["you",1.96],["need.",2.12]],
  z1: [["First",0],["up,",0.36],["GPIO",1.02],["output.",1.34]],
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

export const TAIL: Record<string, number> = { want: 1.2, what: 2.0, map: 3.5, needs: 2.5, go: 4.5 };
const dur = (id: string, fallback: number) => SCENE_DUR[id] ?? fallback;
export const SCENES = [
  { id: 'want', dur: dur('want', 14) },
  { id: 'what', dur: dur('what', 30) },
  { id: 'map', dur: dur('map', 18) },
  { id: 'needs', dur: dur('needs', 24) },
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

// ── 1. the want ────────────────────────────────────────────────────────────

export const WANT = {
  board: 0.3,
  led: w('w1', 'LED'),
  button: w('w1', 'button'),
  blink: w('w2', 'switch'),
  press: w('w2', 'read'),
  dim: at('w3'),
  pins: w('w3', 'outside'),
  captions: [
    { at: at('w1'), text: 'an ESP32, an LED, a button' },
    { at: at('w2'), text: 'by the end of this section: switch the LED · read the button' },
    { at: at('w3'), text: 'how does code reach the outside world?' },
  ] as Caption[],
};

// ── 2. what it is ──────────────────────────────────────────────────────────

export const WHAT = {
  views: [at('g1'), at('g2'), at('g5')],
  sweep: w('g1', 'pins'),
  gpio: w('g1', 'most'),
  spell: w('g1', 'general'),
  pick: w('g2', 'decides'),
  out: at('g3'),
  high: w('g3', 'high'),
  low: w('g3', 'low'),
  in: at('g4'),
  reads: w('g4', 'reads'),
  wave: at('g5'),
  between: w('g5', 'nothing'),
  digital: w('g5', 'digital'),
  captions: [
    { at: at('g1'), text: 'GPIO = general-purpose input / output' },
    { at: at('g2'), text: 'your code decides what each pin does' },
    { at: at('g3'), text: 'output: your code sets it · 1 = 3.3 V · 0 = 0 V' },
    { at: at('g4'), text: 'input: your code reads it · 1 or 0' },
    { at: at('g5'), text: 'two levels, nothing in between: digital' },
  ] as Caption[],
};

// ── 3. the map ─────────────────────────────────────────────────────────────

export const MAP = {
  in: at('m1'),
  cards: [
    {
      title: 'GPIO output',
      slug: 'gpio',
      promise: 'set up a pin to drive an LED, then blink it',
      calls: ['gpio_set_direction', 'gpio_set_level'],
      at: at('m2'),
    },
    {
      title: 'GPIO input',
      slug: 'gpio-input',
      promise: 'read a button, light the LED while it’s held, count the presses',
      calls: ['gpio_set_pull_mode', 'gpio_get_level'],
      at: at('m3'),
    },
  ],
  captions: [
    { at: at('m1'), text: 'this section: two videos' },
    { at: at('m2'), text: '1 · GPIO output: drive an LED, blink it' },
    { at: at('m3'), text: '2 · GPIO input: read a button, count the presses' },
  ] as Caption[],
};

// ── 4. what you need ───────────────────────────────────────────────────────

export const NEEDS = {
  items: [
    { at: w('n1', 'ESP32'), kind: 'board', label: 'ESP32 board', sub: 'WROOM-32 module' },
    { at: w('n1', 'USB'), kind: 'usb', label: 'USB cable' },
    { at: w('n1', 'breadboard'), kind: 'breadboard', label: 'breadboard' },
    { at: w('n1', 'wires'), kind: 'wires', label: 'jumper wires' },
    { at: w('n2', 'LED'), kind: 'led', label: 'an LED' },
    { at: w('n2', 'resistor'), kind: 'resistor', label: '220 Ω resistor', sub: 'red · red · brown · gold' },
    { at: w('n2', 'button'), kind: 'button', label: 'push button' },
  ] as { at: number; kind: 'board' | 'usb' | 'breadboard' | 'wires' | 'led' | 'resistor' | 'button'; label: string; sub?: string }[],
  terminal: [
    { at: w('n3', 'build'), text: 'idf.py build' },
    { at: w('n3', 'flash'), text: 'idf.py -p PORT flash monitor' },
  ],
  terminalIn: at('n3'),
  check: [
    { at: w('n4', 'first', 0, 0.1), label: 'board · LED + 220 Ω · button' },
    { at: w('n4', 'first', 0, 0.5), label: 'ESP-IDF v6' },
    { at: w('n4', 'all', 0, 0.2), label: 'no earlier section needed' },
  ],
  captions: [
    { at: at('n1'), text: 'on the bench: board · USB cable · breadboard · wires' },
    { at: at('n2'), text: 'an LED + 220 Ω resistor · a push button' },
    { at: at('n3'), text: 'on your computer: ESP-IDF v6 — build, flash, monitor' },
    { at: at('n4'), text: 'the first section: that’s everything' },
  ] as Caption[],
};

// ── 5. go ──────────────────────────────────────────────────────────────────

export const GO = { line: at('z1'), card: 0, nextLabel: 'GPIO output' };

// ── sound (scripts/intro-audio.ts) ─────────────────────────────────────────

type Sound = { scene: SceneId; at: number; kind: 'tick' | 'thump' | 'clack' | 'buzz' | 'blip'; f?: number; amp?: number };
export const SOUND: Sound[] = [
  { scene: 'want', at: WANT.led, kind: 'tick', f: 2600, amp: 0.08 },
  { scene: 'want', at: WANT.button, kind: 'tick', f: 2850, amp: 0.08 },
  { scene: 'want', at: WANT.blink, kind: 'clack', amp: 0.14 },
  { scene: 'want', at: WANT.blink + 1, kind: 'clack', amp: 0.12 },
  { scene: 'want', at: WANT.press + 0.2, kind: 'clack', amp: 0.14 },
  { scene: 'want', at: WANT.pins, kind: 'thump', amp: 0.2 },
  { scene: 'what', at: WHAT.gpio, kind: 'thump', amp: 0.26 },
  ...[0, 1, 2, 3].map((i) => ({ scene: 'what' as SceneId, at: WHAT.spell + 0.18 * i, kind: 'tick' as const, f: 1800 + 250 * i, amp: 0.1 })),
  { scene: 'what', at: WHAT.views[1], kind: 'tick', f: 2000, amp: 0.09 },
  { scene: 'what', at: WHAT.pick, kind: 'tick', f: 3100, amp: 0.05 },
  { scene: 'what', at: WHAT.high, kind: 'clack', amp: 0.16 },
  { scene: 'what', at: WHAT.low, kind: 'clack', amp: 0.14 },
  { scene: 'what', at: WHAT.reads, kind: 'clack', amp: 0.14 },
  { scene: 'what', at: WHAT.views[2], kind: 'tick', f: 2000, amp: 0.09 },
  { scene: 'what', at: WHAT.digital, kind: 'thump', amp: 0.22 },
  { scene: 'map', at: MAP.in, kind: 'tick', f: 2000, amp: 0.09 },
  ...MAP.cards.map((c, i) => ({ scene: 'map' as SceneId, at: c.at, kind: 'tick' as const, f: 2600 + 250 * i, amp: 0.1 })),
  ...NEEDS.items.map((x, i) => ({ scene: 'needs' as SceneId, at: x.at, kind: 'tick' as const, f: 2400 + 80 * i, amp: 0.07 })),
  ...NEEDS.terminal.map((x) => ({ scene: 'needs' as SceneId, at: x.at, kind: 'tick' as const, f: 2350, amp: 0.1 })),
  ...NEEDS.check.map((x) => ({ scene: 'needs' as SceneId, at: x.at, kind: 'blip' as const, amp: 0.05 })),
  { scene: 'go', at: GO.line, kind: 'thump', amp: 0.4 },
];

// ── voice-over ─────────────────────────────────────────────────────────────

export type VoLine = { id: string; scene: SceneId; at: number; text: string; say?: string; pause?: number; fixed?: boolean };
export const VOICE = 'en-US-AndrewMultilingualNeural';
const L = (id: string, scene: SceneId, text: string, say?: string, pause?: number): VoLine => ({ id, scene, at: at(id), text, say, pause });

export const VO: VoLine[] = [
  L('w1', 'want', "Here's an ESP32 on a breadboard, with an LED and a button.", undefined, 0.8),
  L('w2', 'want', 'By the end of this section, your code will switch that LED on and off, and read that button.'),
  L('w3', 'want', 'So how does code reach the outside world?', undefined, 2.2),
  L('g1', 'what', 'Through its pins. Most of them are GPIOs: general-purpose input and output.', 'Through its pins. Most of them are G P I Os: general-purpose input and output.'),
  L('g2', 'what', 'General-purpose, because your code decides what each pin does.', undefined, 1.0),
  L('g3', 'what', 'Make one an output, and your code sets it high, 3.3 volts, or low, zero.', 'Make one an output, and your code sets it high, three point three volts, or low, zero.'),
  L('g4', 'what', 'Make it an input, and your code reads which of the two it sees.', undefined, 1.2),
  L('g5', 'what', "Two levels, nothing in between. That's what digital means.", undefined, 1.4),
  L('m1', 'map', 'This section has two videos.'),
  L('m2', 'map', 'First, GPIO output. You set up a pin to drive an LED, then blink it.'),
  L('m3', 'map', "Then GPIO input. Your code reads a button, lights the LED while it's held, and counts the presses.", undefined, 1.4),
  L('n1', 'needs', 'On the bench: an ESP32 board, a USB cable, a breadboard and a few wires.'),
  L('n2', 'needs', 'An LED, with a 220 ohm resistor to go with it, and a push button.', 'An LED, with a two hundred and twenty ohm resistor to go with it, and a push button.'),
  L('n3', 'needs', 'On your computer: ESP-IDF, version six, so you can build, flash and watch the log.', 'On your computer: E S P I D F, version six, so you can build, flash, and watch the log.', 0.9),
  L('n4', 'needs', "This is the first section, so that's all you need."),
  L('z1', 'go', 'First up: GPIO output.', undefined, 0.6),
];
