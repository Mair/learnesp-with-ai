/**
 * PWM — the timeline. Single source of truth for picture AND sound.
 *
 *   problem → answer → setup (ledcAttach) → write (ledcWrite) → knob 1 (width)
 *     → fade (ledcFade) → knob 2 (frequency) → under the hood → payoff
 *
 * Every time below is SCENE-RELATIVE (seconds from that scene's start), so a
 * scene can be lengthened without touching any other. The audio generator
 * converts to absolute time with `sceneStart()`.
 *
 * Cue times come from edge-tts WORD BOUNDARIES: `cue = vo.at + word offset`,
 * noted inline as e.g. `// "thousand hertz" 0.6+3.17`. Re-time if the VO
 * changes. Pronunciation was checked by transcribing the TTS with Whisper:
 * write "LED-C" and "ESP-IDF" — spelled-out letters ("L E D C") stall.
 *
 * Import-free on purpose (type-only imports are erased): Node runs it as-is.
 *
 *   npm run pwm:audio   # regenerate soundtrack
 *   npm run pwm         # audio + render
 */
import type { Beat, Caption, Mark, RateKey } from '../../components/pwm';

export const FPS = 30;

// ── scenes ─────────────────────────────────────────────────────────────────

export const SCENES = [
  { id: 'problem', dur: 15.0 },
  { id: 'answer', dur: 7.0 },
  { id: 'setup', dur: 78.0 },
  { id: 'write', dur: 44.5 },
  { id: 'duty', dur: 34.4 },
  { id: 'fade', dur: 64.0 },
  { id: 'tone', dur: 15.4 },
  { id: 'idf', dur: 45.0 },
  { id: 'payoff', dur: 7.0 },
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
export const PWM_FRAMES = Math.round(SECONDS * FPS);

// ── 1. the problem ─────────────────────────────────────────────────────────

export const PROBLEM = {
  cardsIn: 0.3,
  /** "dim a light" — dimmer slider sweeps down */
  dim: [0.9, 2.6] as const,
  /** "change the pitch of a sound" — audible glide */
  pitch: [2.2, 4.3] as const,
  pitchHz: [440, 659.25] as const,
  /** cross to the pin */
  pinIn: 4.6,
  high: 8.58, // "Three point three volts" 5.2+3.38
  low: 10.42, // "or zero" 5.2+5.22
  tryMid: 11.31, // "Nothing in between" 5.2+6.11
  reject: 11.9,
  question: 12.6,
};

// ── 2. the answer ──────────────────────────────────────────────────────────

export const ANSWER = {
  wave: 0.5, // "switch it on and off"
  fast: 1.4, // "really fast"
  fastEnd: 2.3,
  letters: [2.78, 3.05, 3.46] as const, // "P" "W" "M" 0.4+2.38/2.65/3.06
  words: [4.15, 4.56, 4.9] as const, // "pulse" "width" "modulation"
};

// ── 3. setup: what ledcAttach(pin, frequency, resolution) actually means ──

export const PWM_HZ = 1000;
export const BITS = 8;
export const MAX = 2 ** BITS - 1;
export const STEPS = 2 ** BITS;
const d = (raw: number) => raw / MAX;

/** the LEDC timer's fastest clock source (APB) */
export const CLOCK_HZ = 80e6;

/**
 * One view on the stage per idea. Cue comments are `vo.at + word offset`,
 * offsets from Whisper word timestamps on the edge-tts clip.
 */
export const SETUP = {
  code: 'ledcAttach(LED, 1000, 8);',
  run: 1.5, // "LED-C attach" 0.5+1.0
  args: [
    { token: 'LED', at: 5.26, title: 'pin', value: 'GPIO 2', sub: 'which pin' }, // "which pin" 0.5+4.76
    { token: '1000', at: 6.1, title: 'frequency', value: '1000 Hz', sub: 'how fast' }, // "how fast" 0.5+5.6
    { token: '8', at: 7.2, title: 'resolution', value: '8 bits', sub: 'how fine' }, // "how fine" 0.5+6.7
  ],
  /** stage views, in order — each runs until the next starts */
  views: {
    freq: 8.3,
    flicker: 23.8,
    counter: 30.6,
    duty: 47.6,
    bits: 56.9, // "More bits" 47.6+9.32
    clock: 60.3,
  },
  freq: {
    /** scroll speed while slowed (cycles per screen-second) → slowed 2000× */
    scroll: 0.5,
    freeze: [9.9, 10.6] as const,
    cycle: 10.64, // "on-off cycles" 8.3+2.34
    hz: 13.76, // "a thousand hertz" 8.3+5.46
    perSec: 16.5, // "a thousand times a second" 8.3+8.22
    ms: 20.2, // "one millisecond" 8.3+11.9
    period: 22.7, // "the period" 8.3+14.4
  },
  flicker: {
    slowHz: 5,
    same: 25.6, // "brightness" 23.8+1.84
    fast: 27.4, // "fast enough" 23.8+3.62
  },
  counter: {
    eight: 30.84, // "The eight" 30.6+0.24
    appear: 34.74, // "hardware counter" 30.6+4.14
    pow: 37.04, // "two to the eighth" 30.6+6.44
    steps: 38.58, // "two hundred and fifty-six" 30.6+7.98
    tiny: 40.0, // "tiny steps" 30.6+8.92(+0.5)
    sweep: [42.06, 43.0] as const, // "zero" 30.6+11.46 … "two fifty-five" 30.6+12.40
    wrap: 44.5, // "starts again" 30.6+13.86
    fast: [45.4, 46.8] as const, // "a thousand times a second" 30.6+14.82
  },
  duty: {
    value: 64,
    line: 49.0, // "a line" 47.6+1.42
    trace: 50.0,
    /** screen-seconds per period while tracing */
    period: 2.4,
    on: 51.74, // "below the line" 47.6+4.14
    off: 54.26, // "passes the line" 47.6+6.66
  },
  bits: {
    fade: [57.8, 60.0] as const, // "smoother dimming" 47.6+11.12
  },
  clock: {
    steps: 62.3, // "two hundred and fifty-six steps" 60.3+2.0
    perSec: 63.6, // "a thousand times" 60.3+3.32
    ticks: 65.48, // "two hundred and fifty-six thousand" 60.3+5.18
    clock: 70.0, // "eighty megahertz" 60.3+9.72
    rows: [
      { at: 70.6, hz: 1000, bits: 8 },
      { at: 72.26, hz: 300_000, bits: 8 }, // "higher frequency" 60.3+11.96
      { at: 73.86, hz: 1000, bits: 16 }, // "more bits" 60.3+13.56
      { at: 74.6, hz: 1000, bits: 17 },
    ],
    out: 75.6, // "run out of clock" 60.3+15.32
  },
  captions: [
    { at: 0.5, text: 'ledcAttach(pin, frequency, resolution)' },
    { at: 8.3, text: 'frequency = complete on–off cycles per second' },
    { at: 20.2, text: '1000 Hz → each cycle (the period) lasts 1 ms' },
    { at: 23.8, text: "frequency doesn't set brightness — it just has to beat your eye" },
    { at: 30.6, text: 'resolution = how many steps each period is cut into' },
    { at: 38.6, text: '8 bits → 2⁸ = 256 steps, counted 0 … 255' },
    { at: 47.6, text: 'your duty is a line across the counter' },
    { at: 51.7, text: 'counter below the line → pin ON · past it → pin OFF' },
    { at: 56.9, text: 'more bits → finer steps → smoother dimming' },
    { at: 60.3, text: 'steps × frequency = counter ticks per second' },
    { at: 70.0, text: 'and that has to fit inside an 80 MHz clock' },
  ] as Caption[],
};

/**
 * The setup counter, shared by picture and sound: where the LEDC counter is
 * (0..1 of a period, plus whole periods done) at scene time t.
 * Sweeps once on "zero … two fifty-five", holds, wraps, then speeds up.
 */
export function setupCounter(t: number): { u: number; n: number; live: boolean } {
  const K = SETUP.counter;
  const [s0, s1] = K.sweep;
  if (t < s0) return { u: 0, n: 0, live: false };
  if (t < s1) return { u: (t - s0) / (s1 - s0), n: 0, live: true };
  if (t < K.wrap) return { u: 0.9999, n: 0, live: false };
  // after the wrap: 1 period/s, accelerating (rate 1 + 6v²) to 7 periods/s across `fast`
  const [f0, f1] = K.fast;
  const L = f1 - f0;
  const v = Math.min(1, Math.max(0, (t - f0) / L));
  const p = t - K.wrap + 2 * L * v ** 3 + 6 * Math.max(0, t - f1);
  return { u: p - Math.floor(p), n: 1 + Math.floor(p), live: true };
}

// ── 4. write: what ledcWrite's second argument (the duty) means ────────────

export const WRITE = {
  /** the duty shown in the call follows `duty.keys` (see writeKey) */
  code: (v: number) => `ledcWrite(LED, ${v});`,
  run: 1.48, // "LED-C write" 0.5+0.98
  args: [
    { at: 4.48, title: 'pin', value: 'GPIO 2', sub: 'the pin you attached' }, // "the pin" 0.5+3.98
    { at: 5.84, title: 'duty', value: '', sub: 'a number' }, // value follows writeKey(); "a number" 0.5+5.34
  ],
  views: {
    what: 7.6,
    duty: 13.3,
    range: 32.9,
  },
  what: {
    notVolt: 8.86, // "a voltage" 7.6+1.26
    howLong: 10.12, // "how long" 7.6+2.52
  },
  duty: {
    line: 13.58, // "the line" 7.6+5.98
    on: 15.82, // "the pin is on" 7.6+8.4(-0.2)
    /** screen-seconds per period → slowed 2000× */
    period: 2.0,
    stepsOn: 20.84, // "first one twenty-eight steps" 19.0+1.84
    stepsOff: 23.22, // "the other one twenty-eight" 19.0+4.22
    half: 24.24, // "Half of every period" 19.0+5.24
    light: 26.14, // "half the light" 19.0+7.14
    /** the duty value written, over time */
    keys: [
      { at: 0, v: 128 },
      { at: 27.4, v: 0 }, // "Zero" 27.4+0
      { at: 28.98, v: 255 }, // "two fifty-five" 27.4+1.58
      { at: 32.2, v: 128 },
    ],
    top: 30.4, // "the top value" 27.4+3.0
  },
  range: {
    r8: 35.12, // "Eight bits" 32.9+2.22
    r10: 37.84, // "Ten bits" 32.9+4.94
    max10: 39.38, // "ten twenty-three" 32.9+6.48
    half: 41.1, // "the same half" 32.9+8.2
    h512: 42.08, // "five twelve" 32.9+9.18
  },
  captions: [
    { at: 0.5, text: 'ledcWrite(pin, duty)' },
    { at: 7.6, text: "the duty isn't a voltage — it's how long the pin is on" },
    { at: 13.3, text: 'your duty is the line across the counter' },
    { at: 15.8, text: 'counter below your number → pin ON' },
    { at: 20.8, text: '128 steps on + 128 steps off = half of every period' },
    { at: 27.4, text: '0 → never on · 255, the top value → always on' },
    { at: 32.9, text: 'the range comes from the resolution' },
    { at: 41.1, text: 'same half: 128 of 256 = 512 of 1024' },
  ] as Caption[],
};

/** the duty value written at scene time t (what the code shows) */
export function writeKey(t: number): number {
  let v = WRITE.duty.keys[0].v;
  for (const k of WRITE.duty.keys) if (t >= k.at) v = k.v;
  return v;
}

/**
 * Fraction of each period the pin is on at scene time t, gliding 0.35 s
 * between writes so the eye can follow. The Arduino core treats the top
 * value (2^bits − 1) as fully on: ledcWrite() bumps it to 2^bits.
 */
export function writeOn(t: number): number {
  const frac = (v: number) => (v >= MAX ? 1 : v / STEPS);
  const ks = WRITE.duty.keys;
  let i = 0;
  for (let j = 0; j < ks.length; j++) if (t >= ks[j].at) i = j;
  const to = frac(ks[i].v);
  if (i === 0) return to;
  const from = frac(ks[i - 1].v);
  const u = Math.min(1, Math.max(0, (t - ks[i].at) / 0.35));
  return from + (to - from) * u * u * (3 - 2 * u);
}

// ── 5. knob 1: pulse width → brightness ────────────────────────────────────

export const DUTY = {
  preamble: ['const int LED = 2;'],
  beats: [
    {
      at: 0.5,
      code: 'ledcAttach(LED, 1000, 8);',
      duty: 0,
      marks: [
        { at: 1.62, token: 'LED', label: 'pin 2' }, // "real LED" 0.6+1.02
        { at: 4.06, token: '1000', label: '1000 Hz' }, // "thousand hertz" 0.6+3.46
        { at: 5.14, token: '8', label: '8 bits → duty 0 … 255' }, // "eight bits" 0.6+4.54
      ],
    },
    {
      at: 6.5,
      code: 'ledcWrite(LED, 128);',
      duty: d(128),
      marks: [{ at: 8.0, token: '128', label: 'on 128 of 256 steps = half' }], // "one twenty-eight" 6.4+1.29
    },
    {
      at: 19.3,
      code: 'ledcWrite(LED, 64);',
      duty: d(64),
      marks: [{ at: 19.5, token: '64', label: 'on 64 of 256 steps = ¼' }], // "Sixty-four" 19.4+0.1
    },
    {
      at: 23.5,
      code: 'ledcWrite(LED, 230);',
      duty: d(230),
      marks: [{ at: 23.7, token: '230', label: 'on 230 of 256 steps ≈ 90%' }], // "Two thirty" 23.6+0.1
    },
    {
      at: 28.1,
      code: 'ledcFade(LED, 230, 0, 2800);',
      duty: 0,
      glide: 2.8,
      marks: [
        { at: 28.5, token: '230', label: 'from' },
        { at: 28.75, token: '0', label: 'to' },
        { at: 29.0, token: '2800', label: 'over 2.8 s' }, // "slides it down" 28.0+1.21
      ],
    },
  ] as Beat[],
  /** we slow the camera, not the chip — the code stays real */
  timescale: [
    { at: 0, rate: 1 / 500 },
    { at: 13.9, rate: 1 / 500 },
    { at: 16.1, rate: 1 },
  ] as RateKey[],
  captions: [
    { at: 0.5, text: 'pin 2 · 1000 Hz · 8 bits → duty 0 … 255' },
    { at: 6.5, text: 'slowed 500× — only ever fully on, or fully off' },
    { at: 14.1, text: '1000 times a second — your eye sees the average' },
    { at: 19.3, text: 'on ¼ of each cycle → ¼ of the light' },
    { at: 23.5, text: 'on 90% of each cycle → nearly full' },
    { at: 28.1, text: 'the pin never dims — it spends less time on' },
  ] as Caption[],
};

// ── 6. fade: what ledcFade(pin, from, to, ms) actually does ────────────────

/**
 * ESP-IDF's _ledc_set_fade_with_time(): total = ms × Hz / 1000 periods;
 * if total > |Δduty|: scale = 1, cycle = total / |Δduty| (integer division).
 * 2800 ms at 1 kHz, 230 → 0: 230 steps of −1, one every 12 periods = 2.76 s.
 */
export const FADE_FROM = 230;
export const FADE_TO = 0;
export const FADE_MS = 2800;
export const FADE_STEPS = Math.abs(FADE_FROM - FADE_TO);
export const FADE_TOTAL = (FADE_MS * PWM_HZ) / 1000; // periods asked for
export const FADE_CYCLE = Math.floor(FADE_TOTAL / FADE_STEPS); // periods per step
export const FADE_REAL_S = (FADE_STEPS * FADE_CYCLE) / PWM_HZ; // what you actually get
/** duty, real seconds after the fade starts */
export const fadeDutyAt = (s: number) =>
  Math.max(FADE_TO, FADE_FROM - Math.floor(Math.max(0, s) * PWM_HZ / FADE_CYCLE));

export const FADE = {
  code: `ledcFade(LED, ${FADE_FROM}, ${FADE_TO}, ${FADE_MS});`,
  run: 1.62, // "LED-C fade" 0.5+1.12
  args: [
    { token: 'LED', at: 4.92, title: 'pin', value: 'GPIO 2', sub: 'the pin' }, // "the pin" 0.5+4.42
    { token: String(FADE_FROM), at: 5.88, title: 'from', value: String(FADE_FROM), sub: 'start duty' }, // "where to start" 0.5+5.38
    { token: String(FADE_TO), at: 6.86, title: 'to', value: String(FADE_TO), sub: 'end duty' }, // "where to end" 0.5+6.36
    { token: String(FADE_MS), at: 8.04, title: 'time', value: `${FADE_MS} ms`, sub: 'how long' }, // "how long" 0.5+7.54
  ],
  views: {
    ramp: 10.1,
    stairs: 24.6,
    engine: 39.7,
  },
  ramp: {
    /** the fade plays once, in real time, on "slides" */
    sweep: 11.28, // "slide" 10.1+1.18
    loopEvery: 4.0,
    onOff: 17.68, // "only on or off" 10.1+7.58
    start: 19.38, // "Near the start" 10.1+9.28
    end: 22.16, // "Near the end" 10.1+12.06
    /** snapshot times, real seconds into the fade */
    snaps: [0.3, 1.4, 2.5],
  },
  stairs: {
    whole: 25.68, // "whole number" 24.6+1.08
    stairs: 28.22, // "staircase" 24.6+3.62
    time: 29.4, // "two point eight seconds" 24.6+4.8
    periods: 31.86, // "two thousand eight hundred periods" 24.6+7.26
    steps: 34.72, // "two thirty steps" 24.6+10.12
    drop: 36.66, // "drops by one" 24.6+12.06
    every: 38.32, // "every twelve periods" 24.6+13.72
  },
  engine: {
    hands: 43.04, // "hands four numbers" 39.7+3.34
    card: 44.7, // "fade engine" 39.7+5.0
    rows: [45.98, 46.86, 48.18, 49.68], // "count down" "230 steps" "12 periods" "one at a time"
    returns: 51.0, // "returns" 39.7+11.3
    /** the engine runs, slowed so it ends on "at the end" */
    run: [52.6, 62.06] as const, // "the hardware" 39.7+12.9 … "at the end" 54.5+7.56
    loop: 54.72, // "loop keeps running" 54.5+0.22
    callback: 59.54, // "LED-C fade with interrupt" 54.5+5.04
  },
  captions: [
    { at: 0.5, text: 'ledcFade(pin, from, to, milliseconds)' },
    { at: 10.1, text: 'the duty slides 230 → 0 over 2.8 s' },
    { at: 17.6, text: 'but the pin is still only ever on or off' },
    { at: 24.6, text: 'the duty is a whole number → the fade is a staircase' },
    { at: 31.9, text: '2800 periods ÷ 230 steps → −1 every 12 periods' },
    { at: 39.7, text: "the LEDC fade engine does the stepping — not your code" },
    { at: 51.0, text: 'ledcFade() returns straight away — the hardware does the rest' },
    { at: 58.5, text: 'ledcFadeWithInterrupt() → your function runs when it ends' },
  ] as Caption[],
};

// ── 7. knob 2: frequency → pitch ───────────────────────────────────────────

export const TONE = {
  preamble: ['const int SPK = 4;'],
  beats: [
    {
      at: 0.5,
      code: 'ledcAttach(SPK, 440, 10);',
      duty: 0,
      hz: 440,
      marks: [
        { at: 0.7, token: 'SPK', label: 'pin 4' },
        { at: 0.95, token: '440', label: '440 Hz' },
        { at: 1.2, token: '10', label: '10 bits' },
      ],
    },
    { at: 7.4, code: 'ledcWriteTone(SPK, 440);', duty: 0.5, hz: 440, marks: [{ at: 7.4, token: '440', label: 'A4' }] },
    { at: 8.0, code: 'ledcWriteTone(SPK, 523);', duty: 0.5, hz: 523, marks: [{ at: 8.0, token: '523', label: 'C5' }] },
    { at: 8.6, code: 'ledcWriteTone(SPK, 659);', duty: 0.5, hz: 659, marks: [{ at: 8.6, token: '659', label: 'E5' }] },
    {
      at: 9.2,
      code: 'ledcWriteTone(SPK, 880);',
      duty: 0.5,
      hz: 880,
      marks: [{ at: 9.2, token: '880', label: 'A5 — double 440, an octave up' }],
    },
    { at: 10.5, code: 'ledcWriteTone(SPK, 0);', duty: 0, marks: [{ at: 10.5, token: '0', label: '0 = off' }] },
  ] as Beat[],
  captions: [
    { at: 0.5, text: 'ledcWriteTone: width fixed at half — only the frequency changes' },
    { at: 7.4, text: 'faster pulses → higher pitch' },
    { at: 10.8, text: 'pulse width → brightness · frequency → pitch' },
  ] as Caption[],
  /** scope shows a fixed 10 ms of real time, so you can count the cycles */
  windowMs: 10,
};

// ── 8. under the hood: the IDF does the work ──────────────────────────────

/** a mark on a specific line of a layer's code */
export type LineMark = Mark & { line: number };

export type Layer = {
  at: number;
  name: string;
  path: string;
  /** arrow label from the layer above — the call that gets us here */
  via?: string;
  code: string[];
  marks: LineMark[];
};

export const IDF_VERSION = 'arduino-esp32 3.3 · ESP-IDF v5.5 · real source, trimmed with …';

export const IDF = {
  layers: [
    {
      at: 0.3,
      name: 'your sketch',
      path: 'sketch.ino',
      code: ['ledcWrite(LED, 64);'],
      marks: [
        { line: 0, at: 0.8, token: 'LED', label: 'pin' },
        { line: 0, at: 1.1, token: '64', label: 'duty: on for 64 of 256 steps' },
      ],
    },
    {
      at: 5.9, // "LED-C write is a thin wrapper" 5.1+0.09
      name: 'Arduino core',
      path: 'cores/esp32/esp32-hal-ledc.c',
      via: 'ledcWrite()',
      code: [
        'bool ledcWrite(uint8_t pin, uint32_t duty) {',
        '  // … finds the LEDC channel this pin is attached to …',
        '  ledc_set_duty(group, channel, duty);',
        '  ledc_update_duty(group, channel);',
        '}',
      ],
      marks: [
        { line: 1, at: 7.0 }, // "thin wrapper" 5.1+1.84
        { line: 2, at: 12.7, token: 'ledc_set_duty', label: '① load the new number — nothing changes yet' }, // "LED-C set duty" 12.3+0.07
        { line: 3, at: 17.5, token: 'ledc_update_duty', label: '② go — this makes it take effect', strong: true }, // "update duty" 16.9+0.61
      ],
    },
    {
      at: 19.6, // "ESP-IDF's own header" 19.6+0.1
      name: 'ESP-IDF · public API',
      path: 'components/esp_driver_ledc/include/driver/ledc.h',
      via: 'ledc_update_duty()',
      code: [
        '/**',
        ' * @brief LEDC update channel parameters',
        ' *',
        ' * @note  Call this function to activate the LEDC updated parameters.',
        ' *        After ledc_set_duty, we need to call this function to update the settings.',
        " *        And the new LEDC parameters don't take effect until the next PWM cycle.",
        ' */',
        'esp_err_t ledc_update_duty(ledc_mode_t speed_mode, ledc_channel_t channel);',
      ],
      marks: [
        { line: 7, at: 20.2, token: 'ledc_update_duty' },
        { line: 3, at: 22.6, token: 'Call this function to activate the LEDC updated parameters.', strong: true }, // "call this to activate" 19.6+2.98
        { line: 5, at: 25.7, token: "don't take effect until the next PWM cycle" }, // "next PWM cycle" 19.6+6.14
      ],
    },
    {
      at: 27.5, // "Underneath, that's two register writes" 27.5+0.1
      name: 'HAL · two register writes',
      path: 'components/hal/esp32/include/hal/ledc_ll.h',
      via: 'both calls bottom out in the HAL',
      code: [
        '// ledc_set_duty()    →  ledc_ll_set_duty_int_part()',
        'hw->channel_group[speed_mode].channel[channel_num].duty.duty = duty_val << 4;',
        '// ledc_update_duty() →  ledc_ll_set_duty_start()',
        'hw->channel_group[speed_mode].channel[channel_num].conf1.duty_start = 1;',
      ],
      marks: [
        { line: 1, at: 30.9, token: 'duty.duty = duty_val', label: '① your 64 → duty register' }, // "sixty-four" 27.5+3.58, checked against Whisper
        { line: 1, at: 31.9, token: '<< 4', label: '(low 4 bits = fraction)' },
        { line: 3, at: 34.2, token: 'conf1.duty_start = 1', label: '② one bit: go', strong: true }, // "duty start" 27.5+6.39(+0.3 per Whisper)
      ],
    },
  ] as Layer[],
  /** the LEDC peripheral: counter vs duty → pin */
  hardware: 35.6, // "the LED-C hardware" 35.4+1.25
  counter: 39.4, // "a counter" 35.4+4.01
  compare: 40.2, // "compared against your duty" 35.4+4.84
  free: 42.85, // "free" 41.9+0.95
  duty: 64,
};

// ── 9. payoff ──────────────────────────────────────────────────────────────

export const PAYOFF = {
  line: 0.7,
  recap: [
    { at: 1.7, k: 'pulse width', v: 'brightness' },
    { at: 2.1, k: 'frequency', v: 'pitch' },
    { at: 2.5, k: 'ledc_update_duty()', v: 'makes it take effect' },
    { at: 2.9, k: 'LEDC hardware', v: 'does the switching' },
  ],
};

// ── voiceover (scratch: edge-tts) ─────────────────────────────────────────

/** `text` is the script as written; `say` is what the TTS reads, if different */
export type VoLine = { id: string; scene: SceneId; at: number; text: string; say?: string };
export const VOICE = 'en-US-AndrewMultilingualNeural';

export const VO: VoLine[] = [
  { id: 'p1', scene: 'problem', at: 0.6, text: 'Say you want to dim a light. Or change the pitch of a sound.' },
  { id: 'p2', scene: 'problem', at: 5.2, text: 'But an ESP32 pin is digital. Three point three volts, or zero. Nothing in between.' },
  { id: 'p3', scene: 'problem', at: 12.6, text: 'So how do you get something in between?' },

  {
    id: 'a1',
    scene: 'answer',
    at: 0.4,
    text: "You switch it on and off, really fast. That's PWM: pulse width modulation.",
    // spelled so P·W·M can land on each letter
    say: "You switch it on and off, really fast. That's P W M: pulse width modulation.",
  },

  {
    id: 's1',
    scene: 'setup',
    at: 0.5,
    text: 'First, ledcAttach sets up the pin. It takes three things: which pin, how fast, and how fine.',
    say: 'First, LED-C attach sets up the pin. It takes three things: which pin, how fast, and how fine.',
  },
  {
    id: 's2',
    scene: 'setup',
    at: 8.3,
    text:
      'The frequency is how many complete on-off cycles happen every second. At a thousand hertz, the pin repeats its pattern a thousand times a second, so each cycle lasts exactly one millisecond. That window is called the period.',
  },
  {
    id: 's3',
    scene: 'setup',
    at: 23.8,
    text: "Frequency doesn't change the brightness. It only has to be fast enough that your eye can't see the flicker.",
  },
  {
    id: 's4',
    scene: 'setup',
    at: 30.6,
    text: 'The eight is the resolution: eight bits. Inside, a hardware counter splits every period into two to the eighth, or two hundred and fifty-six, tiny steps. It counts from zero up to two fifty-five, then starts again, a thousand times a second.',
  },
  {
    id: 's5',
    scene: 'setup',
    at: 47.6,
    text: 'Your duty value is a line drawn across that counter. While the counter is below the line, the pin is on. Once it passes the line, the pin is off. More bits means finer steps, and smoother dimming.',
  },
  {
    id: 's6',
    scene: 'setup',
    at: 60.3,
    text: "There's a limit, though. Two hundred and fifty-six steps, a thousand times a second, is two hundred and fifty-six thousand ticks every second, and the counter runs off an eighty-megahertz clock. Ask for a higher frequency or more bits, and eventually you run out of clock.",
  },

  {
    id: 'w1',
    scene: 'write',
    at: 0.5,
    text: 'Next, ledcWrite. It takes two things: the pin you attached, and a number: the duty.',
    say: 'Next, LED-C write. It takes two things: the pin you attached, and a number: the duty.',
  },
  {
    id: 'w2',
    scene: 'write',
    at: 7.6,
    text: "The duty doesn't set a voltage. It sets how long the pin stays on in every period. It's the line across the counter from before: the pin is on while the counter is below your number.",
  },
  {
    id: 'w3',
    scene: 'write',
    at: 19.0,
    text: 'So one twenty-eight means on for the first one twenty-eight steps, then off for the other one twenty-eight. Half of every period, so half the light.',
  },
  { id: 'w4', scene: 'write', at: 27.4, text: 'Zero means never on. Two fifty-five, the top value, means on the whole time.' },
  {
    id: 'w5',
    scene: 'write',
    at: 32.9,
    text: 'The range comes from the resolution. Eight bits gives you zero to two fifty-five. Ten bits would give you zero to ten twenty-three, and the same half becomes five twelve.',
  },

  { id: 'd0', scene: 'duty', at: 0.6, text: 'Now on a real LED. Same setup: a thousand hertz, eight bits.' },
  {
    id: 'd1',
    scene: 'duty',
    at: 6.4,
    text: "ledcWrite, one twenty-eight: that's half. Slowed down five hundred times, it's fully on, then fully off.",
    say: "LED-C write, one twenty-eight: that's half. Slowed down five hundred times, it's fully on, then fully off.",
  },
  { id: 'd2', scene: 'duty', at: 14.1, text: 'At full speed, a thousand times a second, your eye just sees the average.' },
  { id: 'd3', scene: 'duty', at: 19.4, text: 'Sixty-four: on a quarter of the time, a quarter of the light.' },
  { id: 'd4', scene: 'duty', at: 23.6, text: 'Two thirty: nearly all the time, nearly full brightness.' },
  {
    id: 'd5',
    scene: 'duty',
    at: 28.0,
    text: 'ledcFade slides it down for you. The pin never dims. It just spends less time on.',
    say: 'LED-C fade slides it down for you. The pin never dims. It just spends less time on.',
  },

  {
    id: 'f1',
    scene: 'fade',
    at: 0.5,
    text: "Let's look closer at ledcFade. It takes four things: the pin, where to start, where to end, and how long to take, in milliseconds.",
    say: "Let's look closer at LED-C fade. It takes four things: the pin, where to start, where to end, and how long to take, in milliseconds.",
  },
  {
    id: 'f2',
    scene: 'fade',
    at: 10.1,
    text: "Here, the duty slides from two thirty down to zero over two point eight seconds. But at every moment, the pin is still only on or off. Near the start, each period is mostly on. Near the end, it's barely on at all.",
  },
  {
    id: 'f3',
    scene: 'fade',
    at: 24.6,
    text: "And the duty is a whole number, so the fade is really a staircase. Two point eight seconds at a thousand hertz is two thousand eight hundred periods. That's two thirty steps to take, so the duty drops by one every twelve periods.",
  },
  {
    id: 'f4',
    scene: 'fade',
    at: 39.7,
    text: "Your code doesn't do the stepping. ledcFade hands four numbers to the LEDC fade engine: count down, two thirty steps, twelve periods per step, one at a time. Then it returns, and the hardware does the rest.",
    say: "Your code doesn't do the stepping. LED-C fade hands four numbers to the LED-C fade engine: count down, two thirty steps, twelve periods per step, one at a time. Then it returns, and the hardware does the rest.",
  },
  {
    id: 'f5',
    scene: 'fade',
    at: 54.5,
    text: "Your loop keeps running while the light fades. And if you need to know when it's done, ledcFadeWithInterrupt calls your function at the end.",
    say: "Your loop keeps running while the light fades. And if you need to know when it's done, LED-C fade with interrupt calls your function at the end.",
  },

  {
    id: 't1',
    scene: 'tone',
    at: 0.8,
    text: 'Second knob. ledcWriteTone keeps the width at half, and changes how often it repeats.',
    say: 'Second knob. LED-C write tone keeps the width at half, and changes how often it repeats.',
  },
  { id: 't2', scene: 'tone', at: 10.8, text: 'Pulse width sets brightness. Frequency sets pitch.' },

  { id: 'i1', scene: 'idf', at: 0.5, text: "So who's actually flipping the pin, a thousand times a second? Not your code." },
  {
    id: 'i2',
    scene: 'idf',
    at: 5.1,
    text: 'ledcWrite is a thin wrapper. It makes two calls into the ESP-IDF LEDC driver.',
    say: 'LED-C write is a thin wrapper. It makes two calls into the ESP-IDF LED-C driver.',
  },
  {
    id: 'i3',
    scene: 'idf',
    at: 12.3,
    text: 'ledc_set_duty loads the new number. Nothing changes yet.',
    say: 'LED-C set duty loads the new number. Nothing changes yet.',
  },
  { id: 'i4', scene: 'idf', at: 16.9, text: 'ledc_update_duty says go.', say: 'LED-C update duty says go.' },
  {
    id: 'i5',
    scene: 'idf',
    at: 19.6,
    text: "ESP-IDF's own header spells it out: call this to activate the new settings. They take effect on the next PWM cycle.",
  },
  {
    id: 'i6',
    scene: 'idf',
    at: 27.5,
    text: "Underneath, that's two register writes. One stores your sixty-four. The other sets a single bit: duty start.",
  },
  {
    id: 'i7',
    scene: 'idf',
    at: 35.4,
    text: 'From then on, the LEDC hardware does the switching: a counter, compared against your duty.',
    say: 'From then on, the LED-C hardware does the switching: a counter, compared against your duty.',
  },
  { id: 'i8', scene: 'idf', at: 41.9, text: 'Your code is free to do something else.' },

  { id: 'z1', scene: 'payoff', at: 0.7, text: "That's PWM." },
];
