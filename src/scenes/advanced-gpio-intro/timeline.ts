/**
 * Advanced GPIO intro: the timeline. Single source of truth for picture AND sound.
 *
 *   want (more than on/off) → what (peripherals) → map (pwm, gpio-interrupts,
 *     adc, dac) → needs (parts, both earlier sections) → go ("First up: PWM")
 *
 * Times are SCENE-RELATIVE. `node scripts/vo-plan.ts advanced-gpio-intro` writes
 * VO_AT / VO_WORDS / SCENE_DUR below; cues are `w(line, word)`.
 * Import-free (type-only imports are erased): Node runs it as-is.
 */
import type { Caption } from '../../components/pwm';

export const FPS = 30;
export const SECTION = '3-advanced-gpio';

// ── generated: VO plan (node scripts/vo-plan.ts advanced-gpio-intro) — do not edit by hand ──
export const VO_AT: Record<string, number> = {"w1":0.8,"w2":7.28,"w3":14.98,"g1":0.5,"g2":7.08,"g3":12.34,"m1":0.5,"m2":2.8,"m3":10.48,"m4":17.78,"m5":25.12,"n1":0.5,"n2":9.5,"z1":0.6};
export const SCENE_DUR: Record<string, number> = {"want":18.56,"what":16.62,"map":40.54,"needs":20.02,"go":6.46};
export const VO_WORDS: Record<string, [string, number][]> = {
  w1: [["So",0],["far,",0.38],["a",1.06],["pin",1.2],["is",1.5],["on",1.84],["or",2.1],["off,",2.26],["and",2.96],["your",3.2],["code",3.32],["keeps",3.7],["asking",4.26],["the",4.72],["button",4.86],["how",5.06],["it",5.26],["is.",5.38]],
  w2: [["Now",0],["you'll",0.24],["dim",0.44],["a",0.54],["light,",0.68],["play",1.24],["a",1.46],["note,",1.62],["catch",2.14],["a",2.32],["press",2.52],["the",2.66],["instant",2.86],["it",3.04],["happens,",3.24],["read",3.98],["a",4.2],["voltage",4.38],["and",4.78],["make",5.38],["one",5.54],["of",5.68],["your",5.76],["own.",5.86]],
  w3: [["So",0],["how",0.28],["do",0.36],["you",0.42],["get",0.48],["more",0.6],["out",0.78],["of",0.94],["pin",1.06],["than",1.32],["on",1.58],["and",1.74],["off?",1.84]],
  g1: [["Behind",0],["the",0.42],["pins,",0.58],["the",1.44],["ESP32",1.5],["has",2.7],["pieces",3.28],["of",3.66],["hardware",3.88],["that",4.26],["each",4.54],["do",4.76],["one",5.04],["job.",5.38]],
  g2: [["They're",0],["called",0.26],["peripherals.",0.48],["You",1.74],["set",1.76],["one",1.92],["up",2.08],["with",2.2],["a",2.32],["few",2.42],["calls,",2.64],["and",3.32],["then",3.58],["it",3.68],["does",3.78],["the",3.9],["work",4.02],["on",4.2],["its",4.34],["own.",4.46]],
  g3: [["That",0],["leaves",0.28],["your",0.48],["code",0.62],["free",0.88],["to",1.24],["do",1.54],["something",1.72],["else.",1.96]],
  m1: [["This",0],["section",0.26],["has",0.6],["four",0.94],["videos.",1.3]],
  m2: [["First",0],["comes",0.38],["PWM,",0.74],["where",2.2],["you",2.32],["switch",2.42],["a",2.58],["pin",2.76],["so",2.94],["fast",3.24],["that",3.68],["an",3.94],["LED",4.1],["looks",4.48],["dim",4.94],["and",5.28],["a",5.92],["speaker",6],["plays",6.3],["a",6.58],["note.",6.74]],
  m3: [["Then",0],["GPIO",0.42],["interrupts,",1.02],["where",2.28],["the",2.4],["pin",2.5],["tells",2.76],["you",3.06],["when",3.28],["the",3.4],["button",3.52],["is",3.72],["pressed",3.94],["instead",4.42],["of",5.26],["your",5.38],["code",5.46],["asking",5.78],["it.",6.22]],
  m4: [["Then",0],["the",0.34],["ADC,",0.52],["which",2.06],["turns",2.2],["a",2.46],["voltage",2.62],["into",2.98],["a",3.3],["number",3.48],["from",3.78],["0",4.28],["to",4.7],["4095.",5]],
  m5: [["and",0],["finally",0.24],["the",0.68],["DAC,",0.92],["which",2.38],["goes",2.7],["the",2.92],["other",3.1],["way,",3.26],["and",3.94],["turns",4.14],["a",4.32],["number",4.46],["from",4.6],["0",4.84],["to",5.12],["255",5.38],["into",6.1],["a",6.94],["voltage.",7.12],["Only",8.12],["the",8.24],["original",8.44],["ESP32",8.8],["and",10.14],["the",10.76],["S2",10.86],["have",11.44],["one.",12.1]],
  n1: [["On",0],["the",0.24],["bench,",0.32],["you",1.2],["need",1.28],["the",1.38],["LED",1.52],["and",1.86],["button",2.24],["from",2.46],["before,",2.76],["a",3.62],["small",3.68],["speaker",3.94],["on",4.28],["GPIO4,",4.5],["and",5.68],["a",5.84],["potentiometer,",5.94],["which",7.02],["is",7.14],["a",7.24],["knob",7.38],["that",7.58],["give",7.76],["you",7.9],["a",8.04],["voltage.",8.14]],
  n2: [["You",0],["also",0.22],["need",0.5],["both",0.76],["earlier",1.14],["sections",1.54],["because",2.02],["the",2.56],["interrupt",2.76],["video",3.12],["hands",3.5],["each",4.04],["press",4.46],["to",4.86],["a",5.3],["task",5.4],["through",5.8],["a",6.1],["cue",6.24],["and",6.44],["that",7.1],["needs",7.26],["free",7.62],["RTOS.",7.98]],
  z1: [["First",0],["up,",0.42],["PWM.",0.94]],
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
  { id: 'want', dur: dur('want', 18) },
  { id: 'what', dur: dur('what', 18) },
  { id: 'map', dur: dur('map', 30) },
  { id: 'needs', dur: dur('needs', 18) },
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
  onOff: w('w1', 'on'),
  asking: w('w1', 'asking'),
  row: at('w2'),
  wants: [w('w2', 'dim'), w('w2', 'play'), w('w2', 'catch'), w('w2', 'read'), w('w2', 'make')],
  dim: at('w3'),
  captions: [
    { at: at('w1'), text: 'so far: on or off · and your code keeps asking' },
    { at: at('w2'), text: 'now: dim · play a note · catch a press · read a voltage · make one' },
    { at: at('w3'), text: 'more than on and off?' },
  ] as Caption[],
};

// ── 2. what it is ──────────────────────────────────────────────────────────

export const WHAT = {
  blocks: [w('g1', 'pieces'), w('g1', 'pieces', 0, 0.3), w('g1', 'pieces', 0, 0.6), w('g1', 'pieces', 0, 0.9)],
  job: w('g1', 'job'),
  word: w('g2', 'peripherals'),
  setup: w('g2', 'set'),
  own: w('g2', 'own'),
  free: w('g3', 'free'),
  captions: [
    { at: at('g1'), text: 'behind the pins: hardware that does one job each' },
    { at: at('g2'), text: 'peripherals: set one up with a few calls, then it works on its own' },
    { at: at('g3'), text: 'your code is free to do something else' },
  ] as Caption[],
};

// ── 3. the map ─────────────────────────────────────────────────────────────

export const MAP = {
  in: at('m1'),
  cards: [
    { title: 'PWM', slug: 'pwm', promise: 'switch a pin so fast an LED looks dim, and a speaker plays a note', calls: ['ledc_set_duty', 'ledc_set_freq'], at: at('m2') },
    { title: 'GPIO interrupts', slug: 'gpio-interrupts', promise: 'let the pin tell you when the button is pressed', calls: ['gpio_isr_handler_add', 'xQueueReceive'], at: at('m3') },
    { title: 'ADC', slug: 'adc', promise: 'turn a voltage into a number, 0\u00a0…\u00a04095', calls: ['adc_oneshot_read'], at: at('m4') },
    { title: 'DAC', slug: 'dac', promise: 'turn a number, 0\u00a0…\u00a0255, into a voltage · ESP32 and ESP32-S2 only', calls: ['dac_oneshot_output_voltage'], at: at('m5') },
  ],
  captions: [
    { at: at('m1'), text: 'this section: four videos' },
    { at: at('m2'), text: '1 · PWM: dim an LED, play a note' },
    { at: at('m3'), text: '2 · GPIO interrupts: the pin tells you' },
    { at: at('m4'), text: '3 · ADC: a voltage → a number, 0 … 4095' },
    { at: at('m5'), text: '4 · DAC: a number → a voltage · ESP32 / ESP32-S2 only' },
  ] as Caption[],
};

// ── 4. what you need ───────────────────────────────────────────────────────

export const NEEDS = {
  items: [
    { at: w('n1', 'LED'), kind: 'led', label: 'the LED', sub: 'GPIO 2 · + 220 Ω' },
    { at: w('n1', 'button'), kind: 'button', label: 'the button', sub: 'GPIO 18' },
    { at: w('n1', 'speaker'), kind: 'speaker', label: 'a small speaker', sub: 'GPIO 4' },
    { at: w('n1', 'potentiometer'), kind: 'pot', label: 'a potentiometer', sub: 'a knob that gives a voltage' },
  ] as { at: number; kind: 'led' | 'button' | 'speaker' | 'pot'; label: string; sub?: string }[],
  sections: [
    { at: w('n2', 'both', 0, 0.2), label: 'Basic GPIO', sub: 'pins: output, input' },
    { at: w('n2', 'both', 0, 0.6), label: 'FreeRTOS', sub: 'tasks, queues' },
  ],
  queue: w('n2', 'cue'),
  captions: [
    { at: at('n1'), text: 'on the bench: the LED + button · a speaker on GPIO 4 · a potentiometer' },
    { at: at('n2'), text: 'both earlier sections · interrupts hand presses to a task through a queue' },
  ] as Caption[],
};

// ── 5. go ──────────────────────────────────────────────────────────────────

export const GO = { line: at('z1'), card: 0, nextLabel: 'PWM' };

// ── sound (scripts/intro-audio.ts) ─────────────────────────────────────────

type Sound = { scene: SceneId; at: number; kind: 'tick' | 'thump' | 'clack' | 'buzz' | 'blip'; f?: number; amp?: number };
export const SOUND: Sound[] = [
  { scene: 'want', at: WANT.onOff, kind: 'clack', amp: 0.12 },
  { scene: 'want', at: WANT.onOff + 0.5, kind: 'clack', amp: 0.1 },
  ...[0, 1, 2].map((k) => ({ scene: 'want' as SceneId, at: WANT.asking + 0.4 * k, kind: 'tick' as const, f: 3100, amp: 0.05 })),
  ...WANT.wants.map((x, i) => ({ scene: 'want' as SceneId, at: x, kind: 'tick' as const, f: 2400 + 200 * i, amp: 0.09 })),
  { scene: 'want', at: WANT.dim, kind: 'thump', amp: 0.18 },
  ...WHAT.blocks.map((x, i) => ({ scene: 'what' as SceneId, at: x, kind: 'tick' as const, f: 2600 + 250 * i, amp: 0.08 })),
  { scene: 'what', at: WHAT.word, kind: 'thump', amp: 0.26 },
  { scene: 'what', at: WHAT.setup, kind: 'tick', f: 2350, amp: 0.12 },
  { scene: 'what', at: WHAT.own, kind: 'clack', amp: 0.14 },
  { scene: 'what', at: WHAT.free, kind: 'blip', amp: 0.07 },
  { scene: 'map', at: MAP.in, kind: 'tick', f: 2000, amp: 0.09 },
  ...MAP.cards.map((c, i) => ({ scene: 'map' as SceneId, at: c.at, kind: 'tick' as const, f: 2600 + 250 * i, amp: 0.1 })),
  ...NEEDS.items.map((x, i) => ({ scene: 'needs' as SceneId, at: x.at, kind: 'tick' as const, f: 2400 + 120 * i, amp: 0.07 })),
  ...NEEDS.sections.map((x) => ({ scene: 'needs' as SceneId, at: x.at, kind: 'blip' as const, amp: 0.05 })),
  { scene: 'go', at: GO.line, kind: 'thump', amp: 0.4 },
];

// ── voice-over ─────────────────────────────────────────────────────────────

export type VoLine = { id: string; scene: SceneId; at: number; text: string; say?: string; pause?: number; fixed?: boolean };
export const VOICE = 'en-US-AndrewMultilingualNeural';
const L = (id: string, scene: SceneId, text: string, say?: string, pause?: number): VoLine => ({ id, scene, at: at(id), text, say, pause });

export const VO: VoLine[] = [
  L('w1', 'want', 'So far, a pin is on or off, and your code keeps asking the button how it is.', undefined, 0.8),
  L('w2', 'want', "Now you'll dim a light, play a note, catch a press the instant it happens, read a voltage, and make one of your own.", undefined, 0.9),
  L('w3', 'want', 'So how do you get more out of a pin than on and off?', undefined, 1.6),
  L('g1', 'what', 'Behind the pins, the ESP32 has pieces of hardware that each do one job.'),
  L('g2', 'what', "They're called peripherals. You set one up with a few calls, and then it does the work on its own.", undefined, 0.9),
  L('g3', 'what', 'That leaves your code free to do something else.'),
  L('m1', 'map', 'This section has four videos.'),
  L('m2', 'map', 'First comes PWM, where you switch a pin so fast that an LED looks dim, and a speaker plays a note.', 'First comes P W M, where you switch a pin so fast that an LED looks dim, and a speaker plays a note.'),
  L('m3', 'map', 'Then GPIO interrupts, where the pin tells you when the button is pressed, instead of your code asking it.', undefined, 0.8),
  L('m4', 'map', 'Then the ADC, which turns a voltage into a number, from 0 to 4095.', 'Then the A D C, which turns a voltage into a number, from zero to four thousand and ninety-five.', 0.8),
  L('m5', 'map', 'And finally the DAC, which goes the other way, and turns a number from 0 to 255 into a voltage. Only the original ESP32 and the S2 have one.', 'And finally the D A C, which goes the other way, and turns a number from zero to two fifty-five into a voltage. Only the original ESP32, and the S2, have one.', 0.9),
  L('n1', 'needs', 'On the bench, you need the LED and button from before, a small speaker on GPIO 4, and a potentiometer, which is a knob that gives you a voltage.', 'On the bench, you need the LED and button from before, a small speaker on GPIO four, and a potentiometer, which is a knob that gives you a voltage.'),
  L('n2', 'needs', 'You also need both earlier sections, because the interrupt video hands each press to a task through a queue, and that needs FreeRTOS.', 'You also need both earlier sections, because the interrupt video hands each press to a task through a queue, and that needs free R-T-O-S.'),
  L('z1', 'go', 'First up: PWM.', 'First up: P W M.', 0.6),
];
