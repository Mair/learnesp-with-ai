/**
 * GPIO input — the timeline. Single source of truth for picture AND sound.
 * PURE ESP-IDF: app_main, driver/gpio.h, vTaskDelay(pdMS_TO_TICKS(ms)). No Arduino.
 *
 *   problem → answer (pull-up) → circuit → gpio_reset_pin → gpio_set_direction
 *     → gpio_set_pull_mode → gpio_get_level → demo → counting presses (bounce)
 *     → second knob (pull-up vs pull-down) → under the hood → payoff
 *
 * Every time below is SCENE-RELATIVE. Cue = vo.at + word offset (Whisper word
 * timestamps from `npm run vo -- gpio-input`), noted inline as `// "word"`.
 *
 * Import-free on purpose (type-only imports are erased): Node runs it as-is.
 * Every claim on screen or in the VO is sourced in ./FACTS.md.
 */
import type { Caption, Mark } from '../../components/pwm';

export type InSceneId =
  | 'problem'
  | 'answer'
  | 'circuit'
  | 'reset'
  | 'direction'
  | 'pull'
  | 'read'
  | 'demo'
  | 'count'
  | 'pulls'
  | 'payoff';

export const FPS = 30;

// ── scenes ─────────────────────────────────────────────────────────────────

export const SCENES: { id: InSceneId; dur: number }[] = [
  { id: 'problem', dur: 29.2 },
  { id: 'answer', dur: 21.4 },
  { id: 'circuit', dur: 34.8 },
  { id: 'reset', dur: 23.6 },
  { id: 'direction', dur: 33.9 },
  { id: 'pull', dur: 51.3 },
  { id: 'read', dur: 31.1 },
  { id: 'demo', dur: 32.6 },
  { id: 'count', dur: 57.3 },
  { id: 'pulls', dur: 25.7 },
  { id: 'payoff', dur: 9.6 },
];
export type SceneId = InSceneId;

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
export const INPUT_FRAMES = Math.round(SECONDS * FPS);

// ── shared numbers (FACTS.md) ──────────────────────────────────────────────

export const BTN = 18;
export const BTN_MODULE_PIN = 30; // WROOM-32E: IO18 is module pin 30
export const GND_MODULE_PIN = 38; // the GND pad at the top of the same side
export const LED_PIN = 2;
export const VDD = 3.3;
export const VIH = 0.75 * VDD; // 2.475
export const VIL = 0.25 * VDD; // 0.825
export const R_PULL_K = 45;
export const PULL_UA = (VDD / (R_PULL_K * 1000)) * 1e6; // ≈ 73
export const TICK_MS = 10; // pdMS_TO_TICKS(10) = 1 tick at CONFIG_FREERTOS_HZ = 100

/** a floating input: wanders through the undefined band (illustrative, deterministic) */
export function floatV(s: number): number {
  const v = 1.65 + 1.15 * Math.sin(2.3 * s + 0.4) + 0.55 * Math.sin(5.9 * s + 1.3) + 0.35 * Math.sin(13.7 * s + 2.1);
  return Math.min(VDD, Math.max(0, v));
}
/** what gpio_get_level reads at voltage v: 0, 1, or a coin-flip inside the undefined band */
export function readAt(v: number, salt: number): 0 | 1 {
  if (v >= VIH) return 1;
  if (v <= VIL) return 0;
  const h = Math.sin(salt * 12.9898 + v * 78.233) * 43758.5453;
  return h - Math.floor(h) > 0.5 ? 1 : 0;
}

/** press windows → is the button down at scene time t? */
export const downAt = (presses: [number, number][], t: number) => presses.some(([a, b]) => t >= a && t < b);

// ── 1. the problem ─────────────────────────────────────────────────────────

export const PROBLEM = {
  ledIn: 0.92, // "Last time" 0.60+0.32
  button: 7.44, // "a button" 0.6+6.84
  wire: 9.76, // "to ground" 8.22+1.54
  press: 10.7, // "Press it" 8.22+2.48
  zeroV: 12.7, // "zero volts" 8.22+4.48
  readsZero: 14.4, // "reads zero" 8.22+6.18
  letGo: 16.14, // "let go" 15.72+0.42
  nothing: 18.0, // "nothing at all" 15.72+2.28
  floats: 19.26, // "It floats" 15.72+3.54
  one: 20.86, // "read one" 15.72+5.14
  zero: 22.14, // "read zero" 15.72+6.42
  own: 23.6, // "change on its own" 15.72+7.88
  question: 24.9,
  /** the program reads every 0.5 s on screen (an illustrative loop) */
  readEvery: 0.5,
};

// ── 2. the answer ──────────────────────────────────────────────────────────

export const ANSWER = {
  diagramIn: 0.3,
  resistor: 2.14, // "A resistor" 0.5+1.64
  volts: 2.82, // "three point three volts" 0.5+2.32
  high: 5.24, // "holds the pin high" 0.5+4.74
  press: 9.06, // "Press the button" 8.68+0.38
  takes: 11.6, // "takes over" 8.68+2.92
  zero: 13.72, // "drops to zero" 8.68+5.04
  release: 14.4,
  released: 15.22, // "Released is one" 14.56+0.66
  pressed: 15.88, // "Pressed is zero" 14.56+1.32
  pressed2: 16.62,
  word: 18.72, // "pull-up" 14.56+4.16
};

// ── 3. the circuit ─────────────────────────────────────────────────────────

export const CIRCUIT = {
  views: { wiring: 0.5, pins: 11.16, bands: 21.84 },
  wiring: {
    leg: 1.88, // "one leg of the button" 0.5+1.38
    gpio18: 3.84, // "GPIO 18" 0.5+3.34
    ground: 5.74, // "to ground" 0.5+5.24
    noR: 6.8, // "No resistor" 0.5+6.30
    builtIn: 9.76, // "pull-up built in" 0.5+9.26
  },
  pins: {
    strap: 12.72, // "strapping pin" 11.16+1.56
    flash: 14.74, // "the flash" 11.16+3.58
    pullup: 17.5, // "internal pull-up" 11.16+6.34
    noPull: 18.66, // "GPIO 34 to 39" 11.16+7.50
  },
  bands: {
    one: 23.52, // "a one" 21.84+1.68
    vih: 24.02, // "two point four seven five" 21.84+2.18
    zero: 26.94, // "a zero" 21.84+5.10
    vil: 27.6, // "zero point eight two five" 21.84+5.76
    between: 30.02, // "In between" 21.84+8.18
    floating: 32.34, // "a floating pin" 21.84+10.50
  },
  captions: [
    { at: 0.5, text: 'GPIO 18 (module pin 30) → button → GND · the pull-up is inside the chip' },
    { at: 11.16, text: 'GPIO 18: not strapping · not flash · has an internal pull-up (34–39 have none)' },
    { at: 21.84, text: 'guaranteed: 1 above 2.475 V · 0 below 0.825 V · in between: undefined' },
  ] as Caption[],
};

// ── 4. gpio_reset_pin ──────────────────────────────────────────────────────

export const RESET = {
  code: 'gpio_reset_pin(BUTTON);',
  run: 3.7, // "gpio_reset_pin" 0.5+3.20
  args: [{ token: 'BUTTON', at: 5.38, title: 'pin', value: 'GPIO_NUM_18', sub: '#define BUTTON GPIO_NUM_18' }], // "the button's pin" 0.5+4.88
  views: { state: 6.5, read: 15.34 },
  state: {
    known: 7.46, // "a known state" 6.5+0.96
    gpio: 8.74, // "a plain GPIO" 6.5+2.24
    output: 9.28, // "output off" 6.5+2.78
    pullup: 12.24, // "a weak pull-up" 6.5+5.74
    input: 13.64, // "the input is off too" 6.5+7.14
  },
  read: {
    cant: 16.84, // "can't be read" 15.34+1.50
    zero: 19.64, // "returns zero" 15.34+4.30
    /** the button is pressed on screen while it still reads 0 */
    presses: [
      [17.2, 18.4],
      [20.4, 21.6],
    ] as [number, number][],
  },
  captions: [
    { at: 0.5, text: 'gpio_reset_pin(BUTTON) — the same first step as the LED' },
    { at: 6.5, text: 'reset → plain GPIO · output off · weak pull-up on · input OFF' },
    { at: 15.34, text: 'input off → gpio_get_level() returns 0, pressed or not' },
  ] as Caption[],
};

// ── 5. gpio_set_direction ──────────────────────────────────────────────────

export const DIRECTION = {
  code: 'gpio_set_direction(BUTTON, GPIO_MODE_INPUT);',
  run: 0.82, // "gpio_set_direction" 0.5+0.32
  args: [
    { token: 'BUTTON', at: 4.7, title: 'pin', value: 'GPIO_NUM_18', sub: 'which pin' }, // "the pin" 0.5+4.20
    { token: 'GPIO_MODE_INPUT', at: 5.54, title: 'mode', value: 'GPIO_MODE_INPUT', sub: 'what the pin does' }, // "the mode" 0.5+5.04
  ],
  views: { buffer: 6.38, forget: 14.24, any: 25.3 },
  buffer: {
    on: 8.12, // "switches on" 6.38+1.74
    buffer: 9.66, // "input buffer" 6.38+3.28
    driverOff: 11.04, // "output driver off" 6.38+4.66
    listens: 13.28, // "only listens" 6.38+6.90
  },
  forget: {
    line: 14.64, // "this line" 14.24+0.40
    zero: 17.58, // "always returns zero" 14.24+3.34
    pressed: 20.74, // "zero means pressed" 14.24+6.50
    forever: 23.66, // "held down forever" 14.24+9.42
  },
  any: {
    every: 26.66, // "every GPIO" 25.3+1.36
    gpio34: 28.44, // "thirty-four to thirty-nine" 25.3+3.14
    outputs: 31.74, // "only for outputs" 25.3+6.44
  },
  captions: [
    { at: 0.5, text: 'gpio_set_direction(pin, mode)' },
    { at: 6.38, text: 'GPIO_MODE_INPUT: input buffer on, output driver off — the pin only listens' },
    { at: 14.24, text: 'forget it → gpio_get_level() is always 0 → with a button to GND, "pressed" forever' },
    { at: 25.3, text: 'input mode works on every GPIO — even 34–39 (only output modes are refused)' },
  ] as Caption[],
};

// ── 6. gpio_set_pull_mode ──────────────────────────────────────────────────

export const PULL = {
  code: 'gpio_set_pull_mode(BUTTON, GPIO_PULLUP_ONLY);',
  run: 1.66, // "gpio_set_pull_mode" 0.5+1.16
  args: [
    { token: 'BUTTON', at: 6.22, title: 'pin', value: 'GPIO_NUM_18', sub: 'which pin' }, // "the pin" 0.5+5.72
    { token: 'GPIO_PULLUP_ONLY', at: 7.06, title: 'pull', value: 'GPIO_PULLUP_ONLY', sub: 'the default level' }, // "the pull" 0.5+6.56
  ],
  views: { modes: 7.88, current: 20.0, already: 28.58, gpio34: 37.74 },
  modes: {
    up: 9.58, // "Up only" 7.88+1.70
    down: 10.52, // "down only" 7.88+2.64
    both: 11.5, // "both" 7.88+3.62
    floating: 11.96, // "floating" 7.88+4.08
    connects: 14.22, // "connects" 7.88+6.34
    disconnects: 18.06, // "disconnects" 7.88+10.18
  },
  current: {
    k45: 20.44, // "forty-five kilohms" 20+0.44
    press: 22.48, // "Press the button" 20+2.48
    ua: 23.78, // "seventy-three microamps" 20+3.78
    harmless: 27.1, // "Tiny, and harmless" 20+7.10
    release: 27.9,
  },
  already: {
    reset: 29.14, // "gpio_reset_pin" 28.58+0.56
    side: 32.26, // "side effect" 28.58+3.68
    say: 33.4, // "Say it in your code" 28.58+4.82
    reader: 35.16, // "the next reader" 28.58+6.58
  },
  gpio34: {
    code: 38.0, // "On GPIO 34" 37.74+0.26
    none: 40.1, // "no resistor" 37.74+2.36
    log: 41.84, // "logs an error" 37.74+4.10
    ok: 43.1, // "returns ESP_OK" 37.74+5.36
    check: 45.98, // "ESP_ERROR_CHECK" 37.74+8.24
    board: 48.26, // "Those pins need a resistor" 37.74+10.52
  },
  captions: [
    { at: 0.5, text: 'gpio_set_pull_mode(pin, pull) — the level when nothing else drives the pin' },
    { at: 7.88, text: 'GPIO_PULLUP_ONLY: pull-up to 3.3 V connected · pull-down disconnected' },
    { at: 20.0, text: '3.3 V ÷ 45 kΩ ≈ 73 µA when pressed (datasheet: ~75 µA) — tiny' },
    { at: 28.58, text: 'gpio_reset_pin turned it on as a side effect — say it on purpose' },
    { at: 37.74, text: 'GPIO 34–39: no pull resistors · logs an error, returns ESP_OK → add a resistor' },
  ] as Caption[],
};

// ── 7. gpio_get_level ──────────────────────────────────────────────────────

export const READ = {
  code: 'int level = gpio_get_level(BUTTON);',
  run: 2.04, // "gpio_get_level" 0.5+1.54
  args: [
    { token: 'int', at: 4.1, title: 'returns', value: 'int · 1 or 0', sub: 'the level, right now' }, // "returns its level" 0.5+3.60
    { token: 'BUTTON', at: 3.12, title: 'pin', value: 'GPIO_NUM_18', sub: 'which pin' }, // "the pin" 0.5+2.62
  ],
  views: { ret: 7.1, snap: 18.16, compare: 24.94 },
  ret: {
    plain: 8.78, // "a plain int" 7.1+1.68
    notErr: 10.28, // "not an esp_err_t" 7.1+3.18
    wrap: 13.8, // "don't wrap it" 7.1+6.70
    fail: 16.6, // "A one would look like a failure" 7.1+9.50
  },
  snap: {
    moment: 20.1, // "the moment you ask" 18.16+1.94
    wait: 21.86, // "doesn't wait for a press" 18.16+3.70
    remember: 23.78, // "doesn't remember one" 18.16+5.62
    /** a short press that slips between two reads */
    press: [22.6, 23.2] as [number, number],
    reads: [21.4, 23.9] as const,
  },
  compare: {
    zero: 26.58, // "pressed is zero" 24.94+1.64
    compare: 27.68, // "compare with zero" 24.94+2.74
    mean: 29.04, // "the answer you mean" 24.94+4.10
  },
  captions: [
    { at: 0.5, text: 'gpio_get_level(pin) → 1 or 0' },
    { at: 7.1, text: 'returns int, not esp_err_t → nothing to check · ESP_ERROR_CHECK(1) would abort' },
    { at: 18.16, text: 'a snapshot: the level at the moment of the call — no waiting, no memory' },
    { at: 24.94, text: 'pull-up → pressed reads 0 → pressed = (gpio_get_level(BUTTON) == 0)' },
  ] as Caption[],
};

// ── 8. demo: button → LED ─────────────────────────────────────────────────

export const DEMO = {
  preamble: ['#define LED    GPIO_NUM_2', '#define BUTTON GPIO_NUM_18', ''],
  lines: [
    'void app_main(void)',
    '{',
    '    gpio_reset_pin(LED);',
    '    gpio_set_direction(LED, GPIO_MODE_OUTPUT);',
    '    gpio_reset_pin(BUTTON);',
    '    gpio_set_direction(BUTTON, GPIO_MODE_INPUT);',
    '    gpio_set_pull_mode(BUTTON, GPIO_PULLUP_ONLY);',
    '',
    '    while (1) {',
    '        bool pressed = (gpio_get_level(BUTTON) == 0);',
    '        gpio_set_level(LED, pressed);',
    '        vTaskDelay(pdMS_TO_TICKS(10));',
    '    }',
    '}',
  ],
  idx: { led: [2, 3], btn: [4, 5, 6], read: 9, write: 10, delay: 11 },
  led: 2.3, // "the LED" 0.6+1.70
  button: 3.5, // "the button" 0.6+2.90
  run: 4.92, // "forever" 0.6+4.32 — the loop starts, in real time
  read: 5.84, // "read the button" 0.6+5.24
  copy: 7.0, // "copy it to the LED" 0.6+6.40
  wait: 8.72, // "wait one tick" 0.6+8.12
  tick: 11.54, // "one tick" 10.1+1.44
  hundred: 16.42, // "a hundred times a second" 10.1+6.32
  free: 19.36, // "the CPU is free" 10.1+9.26
  press: 21.0, // "Press" 21+0
  follows: 22.62, // "follows" 21+1.62
  ten: 23.6, // "within ten milliseconds" 21+2.60
  fifty: 26.5, // "fifty milliseconds" 21+5.50
  instant: 28.06, // "feels instant" 21+7.06
  /** when the finger is down (scene seconds) — the reads, the LED and the clicks all follow this */
  presses: [
    [6.1, 7.3],
    [12.2, 13.4],
    [15.4, 15.9],
    [16.8, 17.3],
    [21.004, 22.7], // 4 ms after a tick → the LED follows 6 ms later
    [24.6, 25.4],
    [29.2, 30.6],
  ] as [number, number][],
  /** the first press after "Press" — its read is zoomed in the latency inset */
  zoomPress: 4,
  captions: [
    { at: 0.6, text: 'read the button → copy it to the LED → wait one tick · forever' },
    { at: 10.1, text: 'pdMS_TO_TICKS(10) = 1 tick → ~100 reads a second · CPU free in between' },
    { at: 21.0, text: 'the LED follows within ~10 ms — 50 ms already feels instant (Ganssle)' },
  ] as Caption[],
};

/** demo: the loop reads the pin at each tick from `run`; the LED shows the last read */
export function demoRead(t: number): { down: boolean; led: boolean; lastRead: number } {
  const down = downAt(DEMO.presses, t);
  if (t < DEMO.run) return { down, led: false, lastRead: -1 };
  const k = Math.floor(((t - DEMO.run) * 1000) / TICK_MS);
  const lastRead = DEMO.run + (k * TICK_MS) / 1000;
  return { down, led: downAt(DEMO.presses, lastRead), lastRead };
}

// ── 9. counting presses ───────────────────────────────────────────────────

export const COUNT = {
  code: [
    'int last = 1, presses = 0;',
    'while (1) {',
    '    int level = gpio_get_level(BUTTON);',
    '    if (last == 1 && level == 0) {',
    '        presses++;',
    '        ESP_LOGI(TAG, "presses: %d", presses);',
    '    }',
    '    last = level;',
    '    vTaskDelay(pdMS_TO_TICKS(10));',
    '}',
  ],
  views: { hold: 0.5, edge: 8.12, bounce: 15.66, stats: 22.66, grids: 29.9, debounce: 42.62 },
  hold: {
    zeros: 2.52, // "Counting zeros" 0.5+2.02
    hold: 4.52, // "Hold the button" 0.5+4.02
    second: 5.56, // "one second" 0.5+5.06
    hundred: 6.78, // "a hundred zeros" 0.5+6.28
  },
  edge: {
    change: 8.88, // "a change" 8.12+0.76
    one: 9.7, // "one" 8.12+1.58
    zero: 10.8, // "then zero" 8.12+2.68
    remember: 11.86, // "Remember the last level" 8.12+3.74
    falls: 14.78, // "when it falls" 8.12+6.66
  },
  bounce: {
    zoom: 15.9, // "zoom in" 15.66+0.24
    bounces: 17.98, // "bounces" 15.66+2.32
    hit: 19.92, // "hit" 15.66+4.26
    apart: 20.82, // "spring apart" 15.66+5.16
    again: 21.82, // "hit again" 15.66+6.16
  },
  stats: {
    ganssle: 22.92, // "Jack Ganssle's tests" 22.66+0.26
    avg: 26.06, // "one and a half milliseconds" 22.66+3.40
    worst: 28.3, // "the worst of them" 22.66+5.64
    six: 28.98, // "for six" 22.66+6.32
  },
  grids: {
    fast: 30.88, // "a million times a second" 29.9+0.98
    several: 34.12, // "count as several" 29.9+4.22
    slow: 35.92, // "every ten milliseconds" 29.9+6.02
    inside: 38.32, // "at most one reading" 29.9+8.42
    one: 41.08, // "One press, one count" 29.9+11.18
  },
  debounce: {
    debouncer: 44.36, // "your debouncer" 42.62+1.74
    filter: 47.16, // "no hardware filter" 42.62+4.54
    job: 49.36, // "your code's job" 42.62+6.74
    most: 50.48, // "Most switches" 42.62+7.86
    bad: 54.42, // "a bad one" 42.62+11.80
  },
  /** the bounce, in ms from first contact: [start, end] of each LOW stretch before it settles */
  bounceLows: [
    [0, 0.25],
    [0.45, 0.8],
    [1.0, 1.15],
    [1.35, 1.55],
    [1.62, 99],
  ] as [number, number][],
  captions: [
    { at: 0.5, text: 'counting zeros counts "held down": 1 s × 100 reads = 100' },
    { at: 8.12, text: 'a press is a change: last == 1 && level == 0 → count it' },
    { at: 15.66, text: 'zoomed in: the contacts bounce before they settle' },
    { at: 22.66, text: 'Ganssle, 16 switches: ~1.6 ms bounce on average · 6.2 ms worst' },
    { at: 29.9, text: 'reads 10 ms apart → at most one lands in the bounce → one press, one count' },
    { at: 42.62, text: 'ESP32: no hardware glitch filter → the 10 ms poll is your debouncer' },
  ] as Caption[],
};

/** is the bouncing contact LOW (closed), `ms` after first contact? */
export const bounceLow = (ms: number) => COUNT.bounceLows.some(([a, b]) => ms >= a && ms < b);
/** falling edges seen by samples every `dtMs` from `offMs` over [fromMs, toMs] */
export function countFalls(dtMs: number, offMs: number, fromMs: number, toMs: number): number {
  let last = 1;
  let n = 0;
  for (let s = offMs; s <= toMs; s += dtMs) {
    if (s < fromMs) continue;
    const v = bounceLow(s) ? 0 : 1;
    if (last === 1 && v === 0) n++;
    last = v;
  }
  return n;
}

// ── 10. second knob: pull-up vs pull-down ─────────────────────────────────

export const PULLS = {
  views: { split: 0.5, both: 15.3 },
  split: {
    flip: 1.0, // "flip it" 0.5+0.50
    vcc: 2.74, // "three point three volts" 0.5+2.24
    down: 5.3, // "GPIO_PULLDOWN_ONLY" 0.5+4.80
    released: 8.12, // "released is zero" 7.8+0.32
    pressed: 10.14, // "pressed is one" 7.8+2.34
    same: 11.46, // "Same resistor" 7.8+3.66
    opposite: 14.02, // "opposite logic" 7.8+6.22
    presses: [
      [9.9, 11.2],
      [12.4, 13.6],
    ] as [number, number][],
  },
  both: {
    never: 15.54, // "never turn on both" 15.3+0.24
    split: 18.02, // "split the voltage" 15.3+2.72
    v165: 20.4, // "one point six five" 15.3+5.10
    zone: 22.74, // "the zone" 15.3+7.44
  },
  captions: [
    { at: 0.5, text: 'button to 3.3 V + GPIO_PULLDOWN_ONLY → released 0 · pressed 1' },
    { at: 15.3, text: 'GPIO_PULLUP_PULLDOWN: 45 kΩ + 45 kΩ → ≈ 1.65 V → undefined ✗' },
  ] as Caption[],
};

// ── 11. payoff ─────────────────────────────────────────────────────────────

export const PAYOFF = {
  input: 1.0, // "Make it an input" 0.6+0.40
  pull: 1.74, // "Give it a pull" 0.6+1.14
  level: 2.86, // "Read its level" 0.6+2.26
  line: 3.86, // "That's a GPIO input" 0.6+3.26
  recap: [
    { at: 5.0, k: 'gpio_set_direction(…, INPUT)', v: 'input buffer on' },
    { at: 5.35, k: 'gpio_set_pull_mode(…, PULLUP_ONLY)', v: 'a default level · 45 kΩ' },
    { at: 5.7, k: 'gpio_get_level(pin)', v: '0 or 1 · right now' },
    { at: 6.05, k: 'read every tick', v: 'one press, one count — bounce ignored' },
    { at: 6.4, k: 'polling', v: 'next: let the pin tell you → interrupts' },
  ],
};

// ── voiceover (scratch: edge-tts) ─────────────────────────────────────────

/** `text` is the script as written; `say` is what the TTS reads, if different */
export type VoLine = { id: string; scene: InSceneId; at: number; text: string; say?: string };
export const VOICE = 'en-US-AndrewMultilingualNeural';

export const VO: VoLine[] = [
  { id: 'p1', scene: 'problem', at: 0.6, text: "Last time, the ESP32 drove an LED. Now let's go the other way, and let it listen to a button." },
  { id: 'p2', scene: 'problem', at: 8.22, text: 'Wire the button from a pin to ground. Press it, and the pin is tied to zero volts. The program reads zero.' },
  {
    id: 'p3',
    scene: 'problem',
    at: 15.72,
    text: 'But let go, and the pin is connected to nothing at all. It floats. It might read one, it might read zero, and it can change on its own.',
  },
  { id: 'p4', scene: 'problem', at: 24.9, text: 'So how do you give a pin a level when nothing is driving it?' },

  {
    id: 'a1',
    scene: 'answer',
    at: 0.5,
    text: 'Give it a gentle default. A resistor to three point three volts holds the pin high, as long as nothing else is in charge.',
  },
  { id: 'a2', scene: 'answer', at: 8.68, text: 'Press the button, and its short path to ground takes over. The pin drops to zero.' },
  {
    id: 'a3',
    scene: 'answer',
    at: 14.56,
    text: 'Released is one. Pressed is zero. That resistor is called a pull-up.',
    say: 'Released is one. Pressed is zero. That resistor is called a pull up.',
  },

  {
    id: 'c1',
    scene: 'circuit',
    at: 0.5,
    text: 'On the breadboard, one leg of the button goes to GPIO 18, and the other to ground. No resistor needed: the ESP32 has the pull-up built in.',
    say: 'On the breadboard, one leg of the button goes to GPIO eighteen, and the other to ground. No resistor needed: the ESP32 has the pull up built in.',
  },
  {
    id: 'c2',
    scene: 'circuit',
    at: 11.16,
    text: "Why eighteen? It isn't a strapping pin, it isn't wired to the flash, and it has an internal pull-up. GPIO 34 to 39 don't have one.",
    say: "Why eighteen? It isn't a strapping pin, it isn't wired to the flash, and it has an internal pull up. GPIO thirty-four to thirty-nine don't have one.",
  },
  {
    id: 'c3',
    scene: 'circuit',
    at: 21.84,
    text: "The datasheet guarantees a one above two point four seven five volts, and a zero below zero point eight two five. In between, it promises nothing. That's where a floating pin lives.",
  },

  {
    id: 'r1',
    scene: 'reset',
    at: 0.5,
    text: "In app_main, start the same way as last time: gpio_reset_pin, with the button's pin.",
    say: "In app main, start the same way as last time: GPIO reset pin, with the button's pin.",
  },
  {
    id: 'r2',
    scene: 'reset',
    at: 6.5,
    text: 'It puts the pin in a known state: a plain GPIO, output off, and, to save power, a weak pull-up. But the input is off too.',
    say: 'It puts the pin in a known state: a plain GPIO, output off, and, to save power, a weak pull up. But the input is off too.',
  },
  {
    id: 'r3',
    scene: 'reset',
    at: 15.34,
    text: "So right now, the pin can't be read at all. gpio_get_level returns zero, whatever the button does.",
    say: "So right now, the pin can't be read at all. GPIO get level returns zero, whatever the button does.",
  },

  {
    id: 's1',
    scene: 'direction',
    at: 0.5,
    text: 'Then gpio_set_direction makes it an input. Two things: the pin, and the mode.',
    say: 'Then GPIO set direction makes it an input. Two things: the pin, and the mode.',
  },
  {
    id: 's2',
    scene: 'direction',
    at: 6.38,
    text: "GPIO_MODE_INPUT switches on the pin's input buffer, and leaves its output driver off. The pin only listens.",
    say: "GPIO mode input switches on the pin's input buffer, and leaves its output driver off. The pin only listens.",
  },
  {
    id: 's3',
    scene: 'direction',
    at: 14.24,
    text: 'Forget this line, and gpio_get_level always returns zero. With a button to ground, zero means pressed, so your program sees the button held down forever.',
    say: 'Forget this line, and GPIO get level always returns zero. With a button to ground, zero means pressed, so your program sees the button held down forever.',
  },
  {
    id: 's4',
    scene: 'direction',
    at: 25.3,
    text: 'Input mode works on every GPIO, even thirty-four to thirty-nine. The error from last time was only for outputs.',
  },

  {
    id: 'u1',
    scene: 'pull',
    at: 0.5,
    text: "Then gpio_set_pull_mode chooses the pin's default level. Two things again: the pin, and the pull.",
    say: "Then GPIO set pull mode chooses the pin's default level. Two things again: the pin, and the pull.",
  },
  {
    id: 'u2',
    scene: 'pull',
    at: 7.88,
    text: 'There are four choices: up only, down only, both, or floating. GPIO_PULLUP_ONLY connects the internal resistor to three point three volts, and disconnects the one to ground.',
    say: 'There are four choices: up only, down only, both, or floating. GPIO pull up only connects the internal resistor to three point three volts, and disconnects the one to ground.',
  },
  {
    id: 'u3',
    scene: 'pull',
    at: 20,
    text: "It's about forty-five kilohms. Press the button, and about seventy-three microamps flow through it. Tiny, and harmless.",
  },
  {
    id: 'u4',
    scene: 'pull',
    at: 28.58,
    text: 'gpio_reset_pin had already turned it on, but only as a side effect. Say it in your code, so the next reader knows the button needs it.',
    say: 'GPIO reset pin had already turned it on, but only as a side effect. Say it in your code, so the next reader knows the button needs it.',
  },
  {
    id: 'u5',
    scene: 'pull',
    at: 37.74,
    text: "On GPIO 34, there's no resistor to connect. The call logs an error, then returns ESP_OK anyway, so ESP_ERROR_CHECK won't catch it. Those pins need a resistor on the board.",
    say: "On GPIO thirty-four, there's no resistor to connect. The call logs an error, then returns E S P OK anyway, so E S P error check won't catch it. Those pins need a resistor on the board.",
  },

  {
    id: 'g1',
    scene: 'read',
    at: 0.5,
    text: 'Now read it. gpio_get_level takes the pin, and returns its level: one or zero.',
    say: 'Now read it. GPIO get level takes the pin, and returns its level: one or zero.',
  },
  {
    id: 'g2',
    scene: 'read',
    at: 7.1,
    text: "Notice what it returns: a plain int, not an esp_err_t. There's no error to check, so don't wrap it in ESP_ERROR_CHECK. A one would look like a failure.",
    say: "Notice what it returns: a plain int, not an E S P error code. There's no error to check, so don't wrap it in E S P error check. A one would look like a failure.",
  },
  {
    id: 'g3',
    scene: 'read',
    at: 18.16,
    text: "It's a snapshot: the level at the moment you ask. It doesn't wait for a press, and it doesn't remember one.",
  },
  { id: 'g4', scene: 'read', at: 24.94, text: 'And with a pull-up, pressed is zero. So compare with zero to get the answer you mean.', say: 'And with a pull up, pressed is zero. So compare with zero to get the answer you mean.' },

  {
    id: 'd1',
    scene: 'demo',
    at: 0.6,
    text: 'Put it together. Set up the LED and the button. Then, forever: read the button, copy it to the LED, and wait one tick.',
  },
  {
    id: 'd2',
    scene: 'demo',
    at: 10.1,
    text: 'Ten milliseconds is one tick, the shortest wait there is. So the loop reads the button about a hundred times a second, and the CPU is free in between.',
  },
  {
    id: 'd3',
    scene: 'demo',
    at: 21,
    text: 'Press, and the LED follows within ten milliseconds. Jack Ganssle found that fifty milliseconds already feels instant.',
  },

  {
    id: 'e1',
    scene: 'count',
    at: 0.5,
    text: "Now count presses. Counting zeros doesn't work: hold the button for one second, and that's a hundred zeros.",
  },
  { id: 'e2', scene: 'count', at: 8.12, text: 'A press is a change: one, then zero. Remember the last level, and count only when it falls.' },
  { id: 'e3', scene: 'count', at: 15.66, text: 'But zoom in on that edge. A real switch bounces. The metal contacts hit, spring apart, and hit again.' },
  {
    id: 'e4',
    scene: 'count',
    at: 22.66,
    text: "In Jack Ganssle's tests, most switches bounced for about one and a half milliseconds, and the worst of them for six.",
  },
  {
    id: 'e5',
    scene: 'count',
    at: 29.9,
    text: 'Read the pin a million times a second, and one press can count as several. Read it every ten milliseconds, and at most one reading lands inside the bounce. One press, one count.',
  },
  {
    id: 'e6',
    scene: 'count',
    at: 42.62,
    text: "That one-tick wait is your debouncer. The ESP32 has no hardware filter for this, so it's your code's job. Most switches settle well inside ten milliseconds, but a bad one can bounce for longer.",
  },

  {
    id: 'k1',
    scene: 'pulls',
    at: 0.5,
    text: 'You can also flip it. Wire the button to three point three volts instead, and choose GPIO_PULLDOWN_ONLY.',
    say: 'You can also flip it. Wire the button to three point three volts instead, and choose GPIO pull down only.',
  },
  { id: 'k2', scene: 'pulls', at: 7.8, text: 'Now released is zero, and pressed is one. Same resistor, same tiny current, opposite logic.' },
  {
    id: 'k3',
    scene: 'pulls',
    at: 15.3,
    text: "Just never turn on both. Two equal resistors split the voltage in half, about one point six five volts, right in the zone the datasheet doesn't promise.",
  },

  {
    id: 'x1',
    scene: 'payoff',
    at: 0.6,
    text: "Make it an input. Give it a pull. Read its level. That's a GPIO input.",
  },
];
