/**
 * GPIO — the timeline. Single source of truth for picture AND sound.
 * PURE ESP-IDF: app_main, driver/gpio.h, vTaskDelay(pdMS_TO_TICKS(ms)). No Arduino.
 *
 *   problem → answer → circuit → gpio_reset_pin → gpio_set_direction
 *     → gpio_set_level → blink → vTaskDelay → second knob (current)
 *     → under the hood → payoff
 *
 * Every time below is SCENE-RELATIVE (seconds from that scene's start), so a
 * scene can be lengthened without touching any other. The audio generator
 * converts to absolute time with `sceneStart()`.
 *
 * Cue times come from Whisper word timestamps on the edge-tts clips
 * (`npm run vo -- gpio`): `cue = vo.at + word offset`, noted inline as
 * e.g. `// "reset" 4.44+0.80`. Re-time if the VO changes.
 *
 * Import-free on purpose (type-only imports are erased): Node runs it as-is.
 *
 *   npm run gpio:audio   # regenerate soundtrack
 *   npm run gpio         # audio + render
 *
 * Every claim on screen or in the VO is sourced in ./FACTS.md.
 */
import type { Caption, Mark } from '../../components/pwm';

export const FPS = 30;

// ── scenes ─────────────────────────────────────────────────────────────────

export const SCENES = [
  { id: 'problem', dur: 19.1 },
  { id: 'answer', dur: 12.6 },
  { id: 'circuit', dur: 66.7 },
  { id: 'reset', dur: 30.7 },
  { id: 'direction', dur: 54.0 },
  { id: 'write', dur: 44.5 },
  { id: 'blink', dur: 19.0 },
  { id: 'delay', dur: 52.4 },
  { id: 'current', dur: 33.7 },
  { id: 'idf', dur: 37.7 },
  { id: 'payoff', dur: 8.7 },
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
export const GPIO_FRAMES = Math.round(SECONDS * FPS);

// ── shared numbers (FACTS.md) ──────────────────────────────────────────────

export const PIN = 2;
export const MODULE_PIN = 24; // ESP32-WROOM-32E: IO2 is module pin 24
export const VDD = 3.3;
export const LED_VF = 2.0; // typical red LED — UNVERIFIED for the kit
export const R1 = 220;
export const R2 = 1000;
/** LED current through resistor r, mA */
export const ledMa = (r: number) => ((VDD - LED_VF) / r) * 1000;
export const VOH_MIN = 2.64; // 0.8 × VDD
export const VOL_MAX = 0.33; // 0.1 × VDD
export const DRIVE_DEFAULT_MA = 20;
export const DRIVE_MAX_MA = 40;
export const W1TS_ADDR = '0x3FF44008';
/** FreeRTOS: CONFIG_FREERTOS_HZ default */
export const TICK_HZ = 100;
export const DELAY_MS = 500;
/** pdMS_TO_TICKS — integer division, rounds down (projdefs.h) */
export const msToTicks = (ms: number) => Math.floor((ms * TICK_HZ) / 1000);

/** blink: is the pin high, `s` real seconds after the loop starts? (HIGH first) */
export const blinkHigh = (s: number) => s >= 0 && s % ((2 * DELAY_MS) / 1000) < DELAY_MS / 1000;

// ── 1. the problem ─────────────────────────────────────────────────────────

export const PROBLEM = {
  codeIn: 0.94, // "a line of code" 0.6+0.34
  ledIn: 2.62, // "breadboard" 0.6+2.02
  reset: 5.24, // "reset" 4.44+0.80
  listening: 8.5, // "listening" 4.44+4.06
  run: 10.74, // "this call" 4.44+6.30
  espOk: 11.5, // "returns ESP_OK" 4.44+7.06
  dark: 13.76, // "the LED stays dark" 4.44+9.32
  question: 15.9,
};

// ── 2. the answer ──────────────────────────────────────────────────────────

export const ANSWER = {
  diagramIn: 0.3,
  output: 2.5, // "make the pin an output" 0.5+2.0
  high: 4.7, // "high" 0.5+4.2
  low: 5.94, // "low" 0.5+5.44
  /** G·P·I·O — onsets from the clip's energy contour (6.68 + 0.72/1.12/1.40/1.62) */
  letters: [7.4, 7.8, 8.08, 8.3] as const,
  words: [9.08, 9.36, 9.8, 10.34] as const, // "general" "purpose" "input" "output" 6.68+2.40/2.68/3.12/3.66
};

// ── 3. the circuit ─────────────────────────────────────────────────────────

export const CIRCUIT = {
  code: 'GPIO 2 → 220 Ω → LED → GND',
  run: 1.44, // "circuit" 0.5+0.94
  args: [
    { token: 'GPIO 2', at: 2.42, title: 'pin', value: 'GPIO 2', sub: 'module pin 24 · IO2' }, // "GPIO 2" 0.5+1.92
    { token: '220 Ω', at: 4.66, title: 'resistor', value: '220 Ω', sub: 'red · red · brown · gold' }, // "two-twenty ohm" 0.5+4.16
    { token: 'LED', at: 6.68, title: 'LED', value: 'long leg → +', sub: 'short leg → ground' }, // "long leg" 0.5+6.18
    { token: 'GND', at: 10.18, title: 'ground', value: 'GND · 0 V', sub: 'module pin 15' }, // "ground" 0.5+9.68
  ],
  views: {
    wiring: 1.2,
    ohm: 20.12,
    pins: 36.26,
    strap: 48.0,
  },
  wiring: {
    module: 3.62, // "on the module" 0.5+3.12
    high: 11.84, // "high" 11.1+0.74
    volts: 13.28, // "three point three" 11.1+2.18
    current: 15.5, // "Current flows" 11.1+4.40
    lights: 19.22, // "lights" 11.1+8.12
  },
  ohm: {
    same: 22.16, // "the same loop" 20.12+2.04
    drops: 26.54, // "drops about two volts" 20.12+6.42
    leaving: 28.44, // "leaving one point three" 20.12+8.32
    over: 32.66, // "over two hundred and twenty ohms" 20.12+12.54
    ma: 34.76, // "about six milliamps" 20.12+14.64
  },
  pins: {
    inputs: 38.52, // "thirty-four to thirty-nine" 36.26+2.26
    flash: 41.54, // "six to eleven" 36.26+5.28
    uploads: 44.82, // "one and three" 36.26+8.56
  },
  strap: {
    strap: 49.4, // "strapping pin" 48.0+1.40
    reset: 51.32, // "at reset" 48.0+3.32
    ground: 53.8, // "ground through the LED" 48.0+5.80
    safe: 57.24, // "safe for both" 48.0+9.24
    boards: 59.96, // "Many boards" 59.96+0
    check: 64.74, // "check yours" 59.96+4.78
  },
  captions: [
    { at: 0.5, text: 'GPIO 2 (module pin 24) → 220 Ω → LED (long leg +) → GND' },
    { at: 11.1, text: 'pin HIGH ≈ 3.3 V → current flows → the LED lights' },
    { at: 20.12, text: '3.3 V − 2.0 V = 1.3 V across the resistor → 1.3 V ÷ 220 Ω ≈ 5.9 mA' },
    { at: 36.26, text: 'avoid: 34–39 input only · 6–11 flash · 1 & 3 flashing / console' },
    { at: 48.0, text: 'GPIO 2 is read at reset — an LED to ground keeps it low ✓' },
    { at: 59.96, text: 'an LED already on GPIO 2? depends on the board — check yours' },
  ] as Caption[],
};

// ── 4. gpio_reset_pin ──────────────────────────────────────────────────────

export const RESET = {
  code: 'gpio_reset_pin(LED);',
  run: 1.94, // "gpio_reset_pin" 0.5+1.44
  args: [{ token: 'LED', at: 4.92, title: 'pin', value: 'GPIO_NUM_2', sub: '#define LED GPIO_NUM_2' }], // "the pin" 0.5+4.42
  views: {
    module: 5.86,
    count: 15.54,
    state: 21.28,
  },
  module: {
    gpio: 6.3, // "a GPIO number" 5.86+0.44
    notPos: 7.56, // "not a position on the package" 5.86+1.70
    wroom: 9.7, // "the WROOM module" 5.86+3.84
    pin24: 12.48, // "pin twenty-four" 5.86+6.62
    io2: 13.88, // "labelled IO2" 5.86+8.02
  },
  count: {
    has34: 17.16, // "thirty-four GPIOs" 15.54+1.62
    out28: 19.1, // "twenty-eight of them" 15.54+3.56
  },
  state: {
    known: 22.62, // "a known state" 21.28+1.34
    gpio: 23.82, // "a plain GPIO" 21.28+2.54
    input: 25.14, // "input off" 21.28+3.86
    output: 26.08, // "output off" 21.28+4.80
    pullup: 27.26, // "a weak pull-up" 21.28+5.98
    floating: 28.92, // "isn't left floating" 21.28+7.64
  },
  captions: [
    { at: 0.5, text: 'gpio_reset_pin(pin) — first thing in app_main()' },
    { at: 5.86, text: 'GPIO number ≠ module pin number · WROOM-32E: IO2 = pin 24' },
    { at: 15.54, text: '34 GPIOs · 28 can be outputs (34–39 are input only)' },
    { at: 21.28, text: 'reset → plain GPIO · input off · output off · weak pull-up on' },
  ] as Caption[],
};

// ── 5. gpio_set_direction ──────────────────────────────────────────────────

export const DIRECTION = {
  code: 'gpio_set_direction(LED, GPIO_MODE_OUTPUT);',
  run: 0.8, // "gpio_set_direction" 0.5+0.30
  args: [
    { token: 'LED', at: 5.14, title: 'pin', value: 'GPIO_NUM_2', sub: 'which pin' }, // "the pin" 0.5+4.64
    { token: 'GPIO_MODE_OUTPUT', at: 5.98, title: 'mode', value: 'GPIO_MODE_OUTPUT', sub: 'what the pin does' }, // "the mode" 0.5+5.48
  ],
  views: {
    driver: 6.82,
    modes: 15.64,
    fail: 25.8,
    start: 40.26,
  },
  driver: {
    on: 8.28, // "switches on" 6.82+1.46
    listening: 11.94, // "only listening" 6.82+5.12
    drive: 13.22, // "drive the wire" 6.82+6.40
    high: 14.02, // "high" 6.82+7.20
    low: 14.8, // "low" 6.82+7.98
  },
  modes: {
    outOnly: 16.18, // "output only" 15.64+0.54
    inputOff: 17.52, // "the input is switched off" 15.64+1.88
    readZero: 19.34, // "gpio_get_level would always read zero" 15.64+3.70
    inout: 23.36, // "GPIO_MODE_INPUT_OUTPUT" 15.64+7.72
  },
  fail: {
    code: 27.64, // "like thirty-four" 25.8+1.84
    log: 29.0, // "It logs an error" 25.8+3.20
    ret: 30.2, // "returns ESP_ERR_INVALID_ARG" 25.8+4.40
    wrap: 33.8, // "Put the call" 25.8+8.00
    stops: 37.48, // "stops the program" 25.8+11.68
  },
  start: {
    unknown: 41.62, // "doesn't promise" 40.26+1.36
    first: 45.06, // "call gpio_set_level first" 40.26+4.80
    waits: 48.2, // "waits in its register" 40.26+7.94
    on: 51.76, // "its output turns on" 40.26+11.50
  },
  captions: [
    { at: 0.5, text: 'gpio_set_direction(pin, mode)' },
    { at: 6.82, text: 'GPIO_MODE_OUTPUT turns on the output driver: listening → driving' },
    { at: 15.64, text: 'OUTPUT = output only → gpio_get_level() reads 0 · use INPUT_OUTPUT to read back' },
    { at: 25.8, text: 'GPIO 34 → E gpio: io_num=34 can only be input → ESP_ERR_INVALID_ARG' },
    { at: 33.8, text: 'ESP_ERROR_CHECK(…) turns that error into a stop (abort)' },
    { at: 40.26, text: 'gpio_set_level() first → the pin starts at that level when its output turns on' },
  ] as Caption[],
};

// ── 6. gpio_set_level ──────────────────────────────────────────────────────

export const WRITE = {
  code: 'gpio_set_level(LED, 1);',
  run: 0.9, // "gpio_set_level" 0.5+0.40
  args: [
    { token: 'LED', at: 6.08, title: 'pin', value: 'GPIO_NUM_2', sub: 'the pin you set up' }, // "the pin" 0.5+5.58
    { token: '1', at: 7.02, title: 'level', value: '1 or 0', sub: '1 = high · 0 = low' }, // "the level" 0.5+6.52
  ],
  views: {
    level: 9.98,
    bands: 17.74,
    value: 28.5,
    cpu: 33.62,
  },
  level: {
    high: 9.98, // "One drives" 9.98+0
    volts: 11.18, // "three point three volts" 9.98+1.20
    lights: 13.1, // "the LED lights" 9.98+3.12
    low: 14.76, // "Zero pulls it" 9.98+4.78
    dark: 16.84, // "goes dark" 9.98+6.86
  },
  bands: {
    highAt: 18.86, // "high is at least" 17.74+1.12
    voh: 19.98, // "two point six four" 17.74+2.24
    lowAt: 22.24, // "low is at most" 17.74+4.50
    vol: 23.16, // "zero point three three" 17.74+5.42
    only: 25.32, // "the only two levels" 17.74+7.58
  },
  value: {
    whole: 29.36, // "a whole number" 28.5+0.86
    any: 30.58, // "any number that isn't zero" 28.5+2.08
  },
  cpu: {
    wait: 34.2, // "doesn't wait" 33.62+0.58
    returns: 37.88, // "returns ESP_OK" 33.62+4.26
    holds: 40.64, // "holds that level" 33.62+7.02
  },
  captions: [
    { at: 0.5, text: 'gpio_set_level(pin, level) — sets the level' },
    { at: 9.98, text: '1 → 3.3 V, LED on · 0 → 0 V, LED off' },
    { at: 17.74, text: 'guaranteed: HIGH ≥ 2.64 V · LOW ≤ 0.33 V — just two levels' },
    { at: 28.5, text: 'uint32_t level · 0 → LOW · anything else → HIGH' },
    { at: 33.62, text: 'one register write, returns ESP_OK — the pin holds its level by itself' },
  ] as Caption[],
};

// ── 7. blink ───────────────────────────────────────────────────────────────

export const BLINK = {
  preamble: ['#include "driver/gpio.h"', '#include "freertos/FreeRTOS.h"', '#include "freertos/task.h"', '#define LED GPIO_NUM_2', ''],
  lines: [
    'void app_main(void)',
    '{',
    '    gpio_reset_pin(LED);',
    '    gpio_set_direction(LED, GPIO_MODE_OUTPUT);',
    '',
    '    while (1) {',
    '        gpio_set_level(LED, 1);',
    '        vTaskDelay(pdMS_TO_TICKS(500));',
    '        gpio_set_level(LED, 0);',
    '        vTaskDelay(pdMS_TO_TICKS(500));',
    '    }',
    '}',
  ],
  /** indices into `lines` */
  idx: { reset: 2, direction: 3, high: 6, delay1: 7, low: 8, delay2: 9 },
  resetLine: 4.7, // "reset the pin" 0.6+4.10
  directionLine: 5.72, // "make it an output" 0.6+5.12
  run: 8.36, // "forever: high" 0.6+7.76 — the loop starts, in real time
  second: 13.66, // "once a second" 12.34+1.32
  captions: [
    { at: 0.6, text: 'app_main(): set the pin up once, then loop forever' },
    { at: 12.34, text: 'HIGH 500 ms · LOW 500 ms → one blink a second · real time' },
  ] as Caption[],
};

// ── 8. vTaskDelay(pdMS_TO_TICKS(500)) ─────────────────────────────────────

export const DELAY = {
  code: 'vTaskDelay(pdMS_TO_TICKS(500));',
  run: 0.72, // "To wait" 0.5+0.22
  args: [
    { token: 'vTaskDelay', at: 4.22, title: 'FreeRTOS', value: 'vTaskDelay', sub: 'block this task for n ticks' }, // "vTaskDelay" 0.5+3.72
    { token: 'pdMS_TO_TICKS(500)', at: 6.5, title: 'ms → ticks', value: 'pdMS_TO_TICKS(500)', sub: '500 ms → ticks' }, // "pdMS_TO_TICKS" 0.5+6.00
  ],
  views: {
    ticks: 8.32,
    round: 19.42,
    sleep: 27.02,
    wdt: 37.62,
    dimmer: 45.14,
  },
  ticks: {
    hz: 11.74, // "ticks a hundred times every second" 8.32+3.42
    tick10: 14.94, // "one tick is ten milliseconds" 8.32+6.62
    fifty: 18.18, // "fifty ticks" 8.32+9.86 — 50 ticks sweep in a real half second
  },
  round: {
    down: 20.04, // "rounds down" 19.42+0.62
    five: 21.62, // "five milliseconds" 19.42+2.20
    zero: 23.12, // "zero ticks" 19.42+3.70
    noWait: 25.36, // "doesn't wait at all" 19.42+5.94
  },
  sleep: {
    blocked: 28.58, // "it's blocked" 27.02+1.56
    free: 30.32, // "the CPU is free" 27.02+3.30
    keeps: 33.08, // "the pin keeps its level" 27.02+6.06
    bit: 36.42, // "a bit in a register" 27.02+9.40
  },
  wdt: {
    out: 38.04, // "Take the delays out" 37.62+0.42
    wdt: 39.66, // "the task watchdog" 37.62+2.04
    five: 41.02, // "after five seconds" 37.62+3.40
    idle: 43.68, // "the idle task" 37.62+6.06
  },
  dimmer: {
    fast: 45.68, // "flips far too fast" 45.14+0.54
    dim: 49.28, // "looks dimmer" 45.14+4.14
    hold: 50.26, // "Hold that thought" 45.14+5.12
  },
  captions: [
    { at: 0.5, text: 'vTaskDelay(ticks) · pdMS_TO_TICKS(ms) converts' },
    { at: 8.32, text: 'CONFIG_FREERTOS_HZ = 100 → 1 tick = 10 ms → 500 ms = 50 ticks' },
    { at: 19.42, text: 'rounds down: pdMS_TO_TICKS(5) = 0 → vTaskDelay(0) doesn\'t wait' },
    { at: 27.02, text: 'your task is blocked — the CPU is free, and the pin holds its level' },
    { at: 37.62, text: 'no delay → IDLE0 never runs → task watchdog after 5 s' },
    { at: 45.14, text: 'and the pin flips too fast to see → the LED looks dimmer' },
  ] as Caption[],
};

// ── 9. second knob: current ───────────────────────────────────────────────

export const CURRENT = {
  views: {
    knob: 0.6,
    budget: 15.62,
  },
  knob: {
    code: 0.84, // "Your code decides" 0.6+0.24
    resistor: 3.18, // "The resistor decides" 0.6+2.58
    bright: 6.14, // "how bright" 0.6+5.54
    r220: 7.0, // "Two twenty ohms" 7.0+0
    ma6: 8.58, // "about six milliamps" 7.0+1.58
    r1k: 10.14, // "One kilohm" 7.0+3.14
    ma13: 11.68, // "one point three" 7.0+4.68
    dimmer: 14.6, // "dimmer" 7.0+7.60
  },
  budget: {
    signal: 16.38, // "a signal" 15.62+0.76
    def20: 20.16, // "about twenty milliamps" 15.62+4.54
    max40: 21.78, // "about forty at most" 15.62+6.16
    motor: 23.38, // "A motor" 23.14+0.24
    far: 26.12, // "far more" 23.14+2.98
    transistor: 29.22, // "a transistor" 23.14+6.08
    load: 31.98, // "switches the load" 23.14+8.84
  },
  captions: [
    { at: 0.6, text: 'code → on or off · resistor → how much current' },
    { at: 7.0, text: '220 Ω ≈ 5.9 mA · 1 kΩ ≈ 1.3 mA → dimmer' },
    { at: 15.62, text: 'a pin is a signal: ~20 mA by default, ~40 mA at most' },
    { at: 23.14, text: 'bigger loads → the pin switches a transistor, the transistor switches the load' },
  ] as Caption[],
};

// ── 10. under the hood ────────────────────────────────────────────────────

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

export const IDF_VERSION = 'ESP-IDF v5.5 · real source, trimmed with …';

export const IDF = {
  layers: [
    {
      at: 0.3,
      name: 'your code',
      path: 'main/main.c',
      code: ['gpio_set_level(LED, 1);'],
      marks: [
        { line: 0, at: 1.04, token: 'gpio_set_level' }, // "gpio_set_level" 0.5+0.54
      ],
    },
    {
      at: 5.5, // "In the ESP-IDF driver" 5.18+0.32
      name: 'ESP-IDF · GPIO driver',
      path: 'components/esp_driver_gpio/src/gpio.c',
      via: 'gpio_set_level()',
      code: [
        'esp_err_t gpio_set_level(gpio_num_t gpio_num, uint32_t level)',
        '{',
        '    GPIO_CHECK(GPIO_IS_VALID_OUTPUT_GPIO(gpio_num), "GPIO output gpio_num error", …);',
        '    gpio_hal_set_level(gpio_context.gpio_hal, gpio_num, level);',
        '    return ESP_OK;',
        '}',
      ],
      marks: [
        { line: 2, at: 7.24, token: 'GPIO_IS_VALID_OUTPUT_GPIO', label: 'can this pin be an output?' }, // "checks" 5.18+2.06
        { line: 3, at: 9.34, token: 'gpio_hal_set_level', label: 'down to the hardware layer', strong: true }, // "passes it down" 5.18+4.16
      ],
    },
    {
      at: 11.52, // "And at the bottom" 11.52+0
      name: 'HAL · one store',
      path: 'components/hal/esp32/include/hal/gpio_ll.h',
      via: 'gpio_hal_set_level() → gpio_ll_set_level()',
      code: [
        'if (level) {',
        '    hw->out_w1ts = 1 << gpio_num;      // pins 0–31',
        '} else {',
        '    hw->out_w1tc = 1 << gpio_num;',
        '}',
      ],
      marks: [
        { line: 1, at: 14.22, token: 'out_w1ts', label: 'high → the SET register', strong: true }, // "High writes" 11.52+2.70
        { line: 1, at: 14.96, token: '1 << gpio_num' }, // "bit two" 11.52+3.44
        { line: 3, at: 17.32, token: 'out_w1tc', label: 'low → the CLEAR register' }, // "Low writes" 11.52+5.80
      ],
    },
  ] as Layer[],
  /** the register in silicon: GPIO_OUT_W1TS_REG → GPIO_OUT_REG */
  register: 19.32, // "Write-one-to-set" 19.32+0
  write: 19.92, // the store lands
  only: 21.14, // "only your pin's bit" 19.32+1.82
  others: 22.86, // "Every other pin" 19.32+3.54
  /** gpio_set_direction underneath */
  direction: 26.18, // "gpio_set_direction, underneath" 26.18+0
  route: 31.14, // "route the plain GPIO output" 26.18+4.96
  enable: 33.6, // "set its bit in the output-enable register" 26.18+7.42
  /** the other pins' existing levels — arbitrary, just has to stay put */
  outBefore: 0b0000_0000_0010_0000_1000_0000_0001_0000,
};

// ── 11. payoff ─────────────────────────────────────────────────────────────

export const PAYOFF = {
  output: 1.1, // "Make it an output" 0.7+0.40
  level: 1.9, // "Set its level" 0.7+1.20
  line: 3.14, // "That's GPIO" 0.7+2.44
  recap: [
    { at: 4.0, k: 'gpio_reset_pin(pin)', v: 'a known state' },
    { at: 4.35, k: 'gpio_set_direction(…, OUTPUT)', v: 'output driver on' },
    { at: 4.7, k: 'gpio_set_level(pin, 1)', v: 'one bit, one register' },
    { at: 5.05, k: 'vTaskDelay(pdMS_TO_TICKS(ms))', v: 'ticks · the CPU is free' },
    { at: 5.4, k: 'HIGH or LOW', v: 'nothing in between → next: PWM' },
  ],
};

// ── voiceover (scratch: edge-tts) ─────────────────────────────────────────

/** `text` is the script as written; `say` is what the TTS reads, if different */
export type VoLine = { id: string; scene: SceneId; at: number; text: string; say?: string };
export const VOICE = 'en-US-AndrewMultilingualNeural';

export const VO: VoLine[] = [
  { id: 'p1', scene: 'problem', at: 0.6, text: "You've written a line of code, and on the breadboard there's an LED." },
  {
    id: 'p2',
    scene: 'problem',
    at: 4.44,
    text: "But right after reset, every ESP32 pin is listening, not driving. So this call returns ESP_OK, and the LED stays dark.",
    say: "But right after reset, every ESP32 pin is listening, not driving. So this call returns E S P OK, and the LED stays dark.",
  },
  { id: 'p3', scene: 'problem', at: 15.9, text: "So how do you make a pin switch something on?" },

  { id: 'a1', scene: 'answer', at: 0.5, text: "Two steps. First, make the pin an output. Then set its level: high, or low." },
  {
    id: 'a2',
    scene: 'answer',
    at: 6.68,
    text: "That's a GPIO: a general-purpose input/output pin.",
    say: "That's a G P I O: a general purpose input output pin.",
  },

  { id: 'c1', scene: 'circuit', at: 0.5, text: "First, the circuit. From GPIO 2 on the module, through a two-twenty ohm resistor, into the long leg of the LED, and out of the short leg to ground." },
  { id: 'c2', scene: 'circuit', at: 11.1, text: "When the pin is high, it sits at about three point three volts. Current flows out of the pin, through the LED, to ground, and it lights." },
  { id: 'c3', scene: 'circuit', at: 20.12, text: "Drawn as a schematic, it's the same loop. The resistor sets how much current flows. The LED drops about two volts, leaving one point three across the resistor. One point three volts over two hundred and twenty ohms is about six milliamps." },
  { id: 'c4', scene: 'circuit', at: 36.26, text: "Which pin? Not just any. Thirty-four to thirty-nine can only be inputs. Six to eleven are wired to the flash chip. And one and three are used for uploading." },
  { id: 'c5', scene: 'circuit', at: 48.0, text: "GPIO 2 is a strapping pin: the chip reads it at reset to decide how to boot. Wired to ground through the LED, it stays low, and low is safe for both booting and flashing." },
  { id: 'c6', scene: 'circuit', at: 59.96, text: "Many boards already have an LED on GPIO 2, but not all, so check yours." },

  {
    id: 'r1',
    scene: 'reset',
    at: 0.5,
    text: "In app_main, start with gpio_reset_pin. It takes one thing: the pin.",
    say: "In app main, start with GPIO reset pin. It takes one thing: the pin.",
  },
  {
    id: 'r2',
    scene: 'reset',
    at: 5.86,
    text: "That's a GPIO number, not a position on the package. On the WROOM module, GPIO 2 comes out on pin twenty-four, labelled IO2.",
    say: "That's a GPIO number, not a position on the package. On the WROOM module, GPIO 2 comes out on pin twenty-four, labelled I O 2.",
  },
  { id: 'r3', scene: 'reset', at: 15.54, text: "The ESP32 has thirty-four GPIOs, and twenty-eight of them can be outputs." },
  { id: 'r4', scene: 'reset', at: 21.28, text: "Reset puts the pin in a known state: a plain GPIO, input off, output off, and a weak pull-up, so it isn't left floating." },

  {
    id: 's1',
    scene: 'direction',
    at: 0.5,
    text: "Then gpio_set_direction makes it an output. It takes two things: the pin, and the mode.",
    say: "Then GPIO set direction makes it an output. It takes two things: the pin, and the mode.",
  },
  {
    id: 's2',
    scene: 'direction',
    at: 6.82,
    text: "GPIO_MODE_OUTPUT switches on the pin's output driver. Until now it was only listening. Now it can drive the wire high or low.",
    say: "GPIO mode output switches on the pin's output driver. Until now it was only listening. Now it can drive the wire high or low.",
  },
  {
    id: 's3',
    scene: 'direction',
    at: 15.64,
    text: "It's output only, though. The input is switched off, so gpio_get_level would always read zero. To read the pin back, use GPIO_MODE_INPUT_OUTPUT.",
    say: "It's output only, though. The input is switched off, so GPIO get level would always read zero. To read the pin back, use GPIO mode input output.",
  },
  {
    id: 's4',
    scene: 'direction',
    at: 25.8,
    text: "Try it on a pin that can't drive, like thirty-four. It logs an error and returns ESP_ERR_INVALID_ARG. Put the call inside ESP_ERROR_CHECK, and that error stops the program instead of slipping by.",
    say: "Try it on a pin that can't drive, like thirty-four. It logs an error and returns E S P error invalid arg. Put the call inside E S P error check, and that error stops the program instead of slipping by.",
  },
  {
    id: 's5',
    scene: 'direction',
    at: 40.26,
    text: "And the datasheet doesn't promise which level the pin starts at. If that matters, call gpio_set_level first. The level waits in its register, and the pin starts there the moment its output turns on.",
    say: "And the datasheet doesn't promise which level the pin starts at. If that matters, call GPIO set level first. The level waits in its register, and the pin starts there the moment its output turns on.",
  },

  {
    id: 'd1',
    scene: 'write',
    at: 0.5,
    text: "Then gpio_set_level sets the level. It takes two things: the pin, and the level: one for high, zero for low.",
    say: "Then GPIO set level sets the level. It takes two things: the pin, and the level: one for high, zero for low.",
  },
  { id: 'd2', scene: 'write', at: 9.98, text: "One drives the pin to three point three volts, and the LED lights. Zero pulls it to zero volts, and it goes dark." },
  { id: 'd3', scene: 'write', at: 17.74, text: "The datasheet guarantees high is at least two point six four volts, and low is at most zero point three three. Those are the only two levels a digital output gives you." },
  { id: 'd4', scene: 'write', at: 28.5, text: "The level is a whole number, and any number that isn't zero counts as high." },
  {
    id: 'd5',
    scene: 'write',
    at: 33.62,
    text: "And it doesn't wait. gpio_set_level writes one register, returns ESP_OK, and the pin holds that level on its own until you write it again.",
    say: "And it doesn't wait. GPIO set level writes one register, returns E S P OK, and the pin holds that level on its own until you write it again.",
  },

  {
    id: 'b1',
    scene: 'blink',
    at: 0.6,
    text: "Put it together and you get a blinking LED. In app_main, reset the pin and make it an output. Then, forever: high, wait half a second, low, wait half a second.",
    say: "Put it together and you get a blinking LED. In app main, reset the pin and make it an output. Then, forever: high, wait half a second, low, wait half a second.",
  },
  { id: 'b2', scene: 'blink', at: 12.34, text: "On, off, about once a second, for as long as it has power." },

  {
    id: 'y1',
    scene: 'delay',
    at: 0.5,
    text: "To wait, you ask FreeRTOS: vTaskDelay, with the time converted by pdMS_TO_TICKS.",
    say: "To wait, you ask Free R-TOS: V-Task Delay, with the time converted by P D M S to ticks.",
  },
  {
    id: 'y2',
    scene: 'delay',
    at: 8.32,
    text: "FreeRTOS counts time in ticks. By default it ticks a hundred times every second, so one tick is ten milliseconds, and five hundred milliseconds is fifty ticks.",
    say: "Free R-TOS counts time in ticks. By default it ticks a hundred times every second, so one tick is ten milliseconds, and five hundred milliseconds is fifty ticks.",
  },
  { id: 'y3', scene: 'delay', at: 19.42, text: "The conversion rounds down. Ask for five milliseconds and you get zero ticks, and a delay of zero doesn't wait at all." },
  { id: 'y4', scene: 'delay', at: 27.02, text: "While your task waits, it's blocked. The CPU is free for other work, and the pin keeps its level. Nothing is holding it high. It's a bit in a register." },
  { id: 'y5', scene: 'delay', at: 37.62, text: "Take the delays out, and the task watchdog complains after five seconds, because your loop never lets the idle task run." },
  { id: 'y6', scene: 'delay', at: 45.14, text: "And the pin flips far too fast to see. The LED just looks dimmer. Hold that thought." },

  { id: 'k1', scene: 'current', at: 0.6, text: "Your code decides on or off. The resistor decides how much current, and so how bright." },
  { id: 'k2', scene: 'current', at: 7.0, text: "Two twenty ohms: about six milliamps. One kilohm: about one point three, and the LED is dimmer." },
  { id: 'k3', scene: 'current', at: 15.62, text: "But a pin is a signal, not a power supply. By default it's set to deliver about twenty milliamps, and about forty at most." },
  { id: 'k4', scene: 'current', at: 23.14, text: "A motor, a relay or a strip of LEDs needs far more. For those, the pin switches a transistor, and the transistor switches the load." },

  {
    id: 'i1',
    scene: 'idf',
    at: 0.5,
    text: "So what does gpio_set_level really do? Let's follow it down.",
    say: "So what does GPIO set level really do? Let's follow it down.",
  },
  { id: 'i2', scene: 'idf', at: 5.18, text: "In the ESP-IDF driver, it checks that the pin can be an output, and passes it down to the hardware layer." },
  { id: 'i3', scene: 'idf', at: 11.52, text: "And at the bottom, it's one line. High writes a one to bit two of the set register. Low writes it to the clear register." },
  { id: 'i4', scene: 'idf', at: 19.32, text: "Write-one-to-set means only your pin's bit changes. Every other pin stays exactly as it was." },
  {
    id: 'i5',
    scene: 'idf',
    at: 26.18,
    text: "gpio_set_direction, underneath, is a few writes like this one: route the plain GPIO output to the pin, and set its bit in the output-enable register.",
    say: "GPIO set direction, underneath, is a few writes like this one: route the plain GPIO output to the pin, and set its bit in the output enable register.",
  },

  {
    id: 'x1',
    scene: 'payoff',
    at: 0.7,
    text: "Make it an output. Set its level. That's GPIO.",
    say: "Make it an output. Set its level. That's G P I O.",
  },
];
