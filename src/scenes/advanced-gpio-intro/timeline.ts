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
export const VO_AT: Record<string, number> = {"w1":0.8,"w2":7.28,"w3":14.98,"g1":0.5,"g2":7.08,"g3":12.34,"m1":0.5,"m2":2.8,"m3":9.46,"m4":15.72,"m5":22.32,"n1":0.5,"n2":9.48,"z1":0.6};
export const SCENE_DUR: Record<string, number> = {"want":18.56,"what":17.1,"map":36.74,"needs":19.48,"go":6.46};
export const VO_WORDS: Record<string, [string, number][]> = {
  w1: [["So",0],["far,",0.38],["a",1.06],["pin",1.2],["is",1.5],["on",1.84],["or",2.1],["off,",2.26],["and",2.96],["your",3.2],["code",3.32],["keeps",3.7],["asking",4.26],["the",4.72],["button",4.86],["how",5.06],["it",5.26],["is.",5.38]],
  w2: [["Now",0],["you'll",0.24],["dim",0.44],["a",0.54],["light,",0.68],["play",1.24],["a",1.46],["note,",1.62],["catch",2.14],["a",2.32],["press",2.52],["the",2.66],["instant",2.86],["it",3.04],["happens,",3.24],["read",3.98],["a",4.2],["voltage",4.38],["and",4.78],["make",5.38],["one",5.54],["of",5.68],["your",5.76],["own.",5.86]],
  w3: [["So",0],["how",0.28],["do",0.36],["you",0.42],["get",0.48],["more",0.6],["out",0.78],["of",0.94],["pin",1.06],["than",1.32],["on",1.58],["and",1.74],["off?",1.84]],
  g1: [["Behind",0],["the",0.42],["pins,",0.58],["the",1.44],["ESP32",1.5],["has",2.7],["pieces",3.28],["of",3.66],["hardware",3.88],["that",4.26],["each",4.54],["do",4.76],["one",5.04],["job.",5.38]],
  g2: [["They're",0],["called",0.26],["peripherals.",0.48],["You",1.74],["set",1.76],["one",1.92],["up",2.08],["with",2.2],["a",2.32],["few",2.42],["calls,",2.64],["and",3.32],["then",3.58],["it",3.68],["does",3.78],["the",3.9],["work",4.02],["on",4.2],["its",4.34],["own.",4.46]],
  g3: [["So",0],["your",0.3],["code",0.4],["is",0.76],["free",1.26],["to",1.62],["do",1.94],["something",2.1],["else.",2.36]],
  m1: [["This",0],["section",0.26],["has",0.6],["four",0.94],["videos.",1.3]],
  m2: [["PWM.",0],["Switch",1.3],["a",1.62],["pin",1.78],["so",1.98],["fast",2.24],["that",2.68],["an",2.9],["LED",3.06],["looks",3.38],["dim",3.8],["and",4.14],["a",4.74],["speaker",4.82],["plays",5.08],["a",5.38],["note.",5.56]],
  m3: [["GPIO",0],["interrupts.",0.62],["Let",1.94],["the",2.02],["pin",2.12],["tell",2.28],["you",2.48],["when",2.62],["the",2.74],["button",2.84],["is",3.04],["pressed",3.24],["instead",3.84],["of",4.56],["asking",4.68],["it.",4.98]],
  m4: [["A",0],["DC.",0.24],["Turn",1.4],["a",1.58],["voltage",1.7],["into",2.08],["a",2.38],["number",2.58],["from",2.9],["0",3.46],["to",3.88],["4095.",4.18]],
  m5: [["and",0],["DAC",0.28],["the",1.06],["other",2.18],["way.",2.34],["Turn",3.12],["a",3.32],["number",3.58],["from",3.58],["0",3.8],["to",4.14],["255",4.44],["into",5.16],["a",5.96],["voltage.",6.14],["Only",7.18],["the",7.24],["original",7.44],["ESP32",8.56],["and",9.24],["the",9.92],["S2",10.02],["have",10.62],["one.",11.12]],
  n1: [["On",0],["the",0.22],["bench,",0.34],["the",1.2],["LED",1.28],["and",1.68],["button",2.06],["from",2.28],["before,",2.6],["a",3.44],["small",3.48],["speaker",3.74],["on",4.08],["GPIO4,",4.3],["and",5.5],["a",5.68],["potentiometer,",5.78],["a",6.94],["knob",7.1],["that",7.44],["gives",7.68],["you",7.86],["a",8.04],["voltage.",8.12]],
  n2: [["In",0],["both",0.26],["earlier",0.5],["sections,",0.84],["the",1.98],["interrupt",2.08],["video",2.4],["hands",2.84],["each",3.46],["press",3.8],["to",4.2],["a",4.48],["task",4.62],["through",5],["a",5.32],["queue,",5.44],["so",6.08],["it",6.32],["needs",6.44],["free",6.8],["RTOS.",7.3]],
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
  queue: w('n2', 'queue'),
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
  L('g3', 'what', 'So your code is free to do something else.'),
  L('m1', 'map', 'This section has four videos.'),
  L('m2', 'map', 'PWM. Switch a pin so fast that an LED looks dim and a speaker plays a note.', 'P W M. Switch a pin so fast that an LED looks dim, and a speaker plays a note.'),
  L('m3', 'map', 'GPIO interrupts. Let the pin tell you when the button is pressed, instead of asking it.', undefined, 0.9),
  L('m4', 'map', 'ADC. Turn a voltage into a number, from 0 to 4095.', 'A D C. Turn a voltage into a number, from zero to four thousand and ninety-five.', 0.9),
  L('m5', 'map', 'And DAC, the other way: turn a number from 0 to 255 into a voltage. Only the original ESP32 and the S2 have one.', 'And D A C, the other way: turn a number from zero to two fifty-five into a voltage. Only the original ESP32, and the S2, have one.', 0.9),
  L('n1', 'needs', 'On the bench: the LED and button from before, a small speaker on GPIO 4, and a potentiometer: a knob that gives you a voltage.', 'On the bench: the LED and button from before, a small speaker on GPIO four, and a potentiometer: a knob that gives you a voltage.'),
  L('n2', 'needs', 'And both earlier sections. The interrupt video hands each press to a task through a queue, so it needs FreeRTOS.', 'And both earlier sections. The interrupt video hands each press to a task through a queue, so it needs free R-T-O-S.'),
  L('z1', 'go', 'First up: PWM.', 'First up: P W M.', 0.6),
];
