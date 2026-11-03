/**
 * GPIO interrupts — the timeline. Single source of truth for picture AND sound.
 * PURE ESP-IDF: gpio_config, gpio_install_isr_service, gpio_isr_handler_add,
 * FreeRTOS queue + FromISR. No Arduino.
 *
 *   problem (polling's cost) → answer (INTERRUPT) → gpio_config → gpio_install_isr_service
 *     → gpio_isr_handler_add → the ISR → the queue → demo → bounce → second knob
 *     (trigger types) → under the hood → payoff
 *
 * Every time is SCENE-RELATIVE. Cue = vo.at + word offset (Whisper word
 * timestamps, `npm run vo -- gpio-interrupts`), noted inline as `// "word"`.
 * Import-free on purpose (type-only imports are erased): Node runs it as-is.
 * Every claim on screen or in the VO is sourced in ./FACTS.md.
 */
import type { Caption, Mark } from '../../components/pwm';

export type IrqSceneId = 'problem' | 'answer' | 'config' | 'service' | 'handler' | 'isr' | 'queue' | 'demo' | 'bounce' | 'types' | 'idf' | 'payoff';
export type SceneId = IrqSceneId;

export const FPS = 30;

export const SCENES: { id: IrqSceneId; dur: number }[] = [
  { id: 'problem', dur: 22.8 },
  { id: 'answer', dur: 16.0 },
  { id: 'config', dur: 49.4 },
  { id: 'service', dur: 30.1 },
  { id: 'handler', dur: 27.1 },
  { id: 'isr', dur: 55.1 },
  { id: 'queue', dur: 25.6 },
  { id: 'demo', dur: 23.4 },
  { id: 'bounce', dur: 31.2 },
  { id: 'types', dur: 28.8 },
  { id: 'idf', dur: 36.8 },
  { id: 'payoff', dur: 9.6 },
];

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
export const IRQ_FRAMES = Math.round(SECONDS * FPS);

// ── shared numbers (FACTS.md) ──────────────────────────────────────────────

export const BTN = 18;
export const TICK_MS = 10;
export const READS_PER_HOUR = 100 * 3600; // 360 000
export const ISR_STACK = 1536; // CONFIG_FREERTOS_ISR_STACKSIZE default
export const QUEUE_LEN = 10;
export const SETTLE_MS = 30; // pdMS_TO_TICKS(30) = 3 ticks
export const STATUS_ADDR = '0x3FF44044';
export const PCPU_INT_ADDR = '0x3FF44068';
export const PIN18_ADDR = '0x3FF440D0';

/** the program, as shown in the code panels */
export const ISR_CODE = [
  'static void button_isr(void *arg)',
  '{',
  '    uint32_t pin = (uint32_t) arg;',
  '    BaseType_t woken = pdFALSE;',
  '    xQueueSendFromISR(button_events, &pin, &woken);',
  '    portYIELD_FROM_ISR(woken);',
  '}',
];
export const CONFIG_CODE = [
  'gpio_config_t io = {',
  '    .pin_bit_mask = 1ULL << BUTTON,',
  '    .mode         = GPIO_MODE_INPUT,',
  '    .pull_up_en   = GPIO_PULLUP_ENABLE,',
  '    .pull_down_en = GPIO_PULLDOWN_DISABLE,',
  '    .intr_type    = GPIO_INTR_NEGEDGE,',
  '};',
  'ESP_ERROR_CHECK(gpio_config(&io));',
];
export const LOOP_CODE = [
  'int presses = 0;',
  'uint32_t pin;',
  'while (1) {',
  '    xQueueReceive(button_events, &pin, portMAX_DELAY);',
  '    vTaskDelay(pdMS_TO_TICKS(30));   // let the bounce settle',
  '    xQueueReset(button_events);       // drop the extra edges',
  '    if (gpio_get_level(BUTTON) == 0) {',
  '        presses++;',
  '        ESP_LOGI(TAG, "presses: %d", presses);',
  '    }',
  '}',
];

/** the bounce from the input video (ms from first contact): LOW stretches */
export const BOUNCE_LOWS: [number, number][] = [
  [0, 0.25],
  [0.45, 0.8],
  [1.0, 1.15],
  [1.35, 1.55],
  [1.62, 99],
];
export const bounceLow = (ms: number) => BOUNCE_LOWS.some(([a, b]) => ms >= a && ms < b);
/** falling edges in the press bounce (one interrupt each) */
export const PRESS_FALLS = BOUNCE_LOWS.map(([a]) => a);
/** the release bounce: HIGH stretches after letting go; it falls back once in between */
export const RELEASE_HIGHS: [number, number][] = [
  [0, 0.4],
  [0.7, 99],
];

// ── 1. problem ─────────────────────────────────────────────────────────────

export const PROBLEM = {
  codeIn: 0.94, // "Last time" 0.60+0.34
  hundred: 3.18, // "a hundred times a second" 0.6+2.58
  same: 6.16, // "the same thing" 0.6+5.56
  notPressed: 7.22, // "not pressed" 0.6+6.62
  hour: 8.9, // "three hundred and sixty thousand" 8.4+0.50
  justInCase: 11.16, // "just in case" 8.4+2.76
  pulse: 12.74, // "a pulse" 8.4+4.34
  slip: 14.9, // "slip between two reads" 8.4+6.50
  never: 16.88, // "never be seen" 8.4+8.48
  question: 18.14,
};

// ── 2. answer ──────────────────────────────────────────────────────────────

export const ANSWER = {
  watches: 2.44, // "watches the pin" 0.5+1.94
  edge: 4.04, // "for an edge" 0.5+3.54
  interrupts: 6.16, // "interrupts the CPU" 0.5+5.66
  runs: 8.16, // "runs a function" 0.5+7.66
  back: 11.18, // "goes back" 10.18+1.00
  word: 12.98, // "interrupt" 10.18+2.80
};

// ── 3. gpio_config ─────────────────────────────────────────────────────────

export const CONFIG = {
  views: { struct: 0.5, mask: 8.72, fields: 21.06, intr: 27.3, errors: 39.14 },
  struct: {
    one: 4.38, // "one struct" 0.5+3.88
    every: 6.12, // "every pin in its mask" 0.5+5.62
  },
  mask: {
    bit: 9.62, // "one bit per GPIO" 8.72+0.90
    shift: 11.66, // "shifted left by eighteen" 8.72+2.94
    b18: 13.72, // "sets bit eighteen" 8.72+5.00
    sixty4: 14.9, // "sixty-four-bit" 8.72+6.18
    to39: 17.42, // "up to thirty-nine" 8.72+8.70
    ull: 20.08, // "1ULL" 8.72+11.36
  },
  fields: {
    input: 23.84, // "an input" 21.06+2.78
    up: 24.7, // "the pull-up on" 21.06+3.64
    down: 25.94, // "the pull-down off" 21.06+4.88
  },
  intr: {
    type: 28.82, // "interrupt type" 27.3+1.52
    neg: 30.14, // "GPIO_INTR_NEGEDGE" 27.3+2.84
    falling: 33.54, // "a falling edge" 27.3+6.24
    oneToZero: 34.8, // "from one to zero" 27.3+7.50
    down: 37.92, // "goes down" 27.3+10.62
  },
  errors: {
    wrap: 39.98, // "ESP_ERROR_CHECK" 39.14+0.84
    empty: 42.14, // "An empty mask" 39.14+3.00
    exist: 43.98, // "doesn't exist" 39.14+4.84
    ret: 44.7, // "returns ESP_ERR_INVALID_ARG" 39.14+5.56
  },
  captions: [
    { at: 0.5, text: 'gpio_config(&io): one struct configures every pin in pin_bit_mask' },
    { at: 8.72, text: '1ULL << 18 → bit 18 of a 64-bit mask (GPIOs go up to 39)' },
    { at: 21.06, text: 'mode INPUT · pull-up ENABLE · pull-down DISABLE — as in the input video' },
    { at: 27.3, text: 'intr_type = GPIO_INTR_NEGEDGE → fires on 1 → 0: the press' },
    { at: 39.14, text: 'mask 0 or a GPIO that doesn\'t exist → ESP_ERR_INVALID_ARG' },
  ] as Caption[],
};

// ── 4. gpio_install_isr_service ───────────────────────────────────────────

export const SERVICE = {
  code: 'gpio_install_isr_service(0);',
  run: 1.76, // "gpio_install_isr_service" 0.5+1.26
  args: [{ token: '0', at: 12.52, title: 'flags', value: '0', sub: 'ESP_INTR_FLAG_* · 0 = defaults' }], // "The argument" 12.3+0.22
  views: { shared: 3.84, flags: 12.3, once: 23.14 },
  shared: {
    share: 5.0, // "share one interrupt" 3.84+1.16
    installs: 7.74, // "installs the driver's handler" 3.84+3.90
    each: 10.46, // "a function for each pin" 3.84+6.62
  },
  flags: {
    zero: 14.94, // "Zero picks the defaults" 12.3+2.64
    prio: 17.0, // "low or medium priority" 12.3+4.70
    c: 19.36, // "written in C" 12.3+7.06
    flash: 21.2, // "while the flash is being written" 12.3+8.90
  },
  once: {
    second: 24.66, // "A second call" 23.14+1.52
    ret: 25.76, // "ESP_ERR_INVALID_STATE" 23.14+2.62
  },
  captions: [
    { at: 0.5, text: 'gpio_install_isr_service(flags) — one CPU interrupt for every GPIO' },
    { at: 3.84, text: 'all GPIOs → one interrupt → the driver\'s handler → your function, per pin' },
    { at: 12.3, text: 'flags 0 → level 1–3 interrupt, in C · not IRAM: postponed during flash writes' },
    { at: 23.14, text: 'install once — a second call → ESP_ERR_INVALID_STATE' },
  ] as Caption[],
};

// ── 5. gpio_isr_handler_add ───────────────────────────────────────────────

export const HANDLER = {
  code: 'gpio_isr_handler_add(BUTTON, button_isr, (void *) BUTTON);',
  run: 0.86, // "gpio_isr_handler_add" 0.5+0.36
  args: [
    { token: 'BUTTON', at: 6.66, title: 'pin', value: 'GPIO_NUM_18', sub: 'which pin' }, // "the pin" 0.5+6.16
    { token: 'button_isr', at: 7.48, title: 'function', value: 'button_isr', sub: 'void fn(void *arg)' }, // "the function" 0.5+6.98
    { token: '(void *) BUTTON', at: 8.46, title: 'argument', value: '(void *) 18', sub: 'handed back as arg' }, // "an argument" 0.5+7.96
  ],
  views: { table: 5.28, arg: 9.34, order: 17.56 },
  arg: {
    back: 10.22, // "handed back" 9.34+0.88
    every: 11.78, // "every time it runs" 9.34+2.44
    pin: 14.0, // "the pin number" 9.34+4.66
    several: 16.34, // "several buttons" 9.34+7.00
  },
  order: {
    on: 18.04, // "switches the pin's interrupt on" 17.56+0.48
    before: 20.7, // "before installing the service" 17.56+3.14
    ret: 22.62, // "returns ESP_ERR_INVALID_STATE" 17.56+5.06
  },
  captions: [
    { at: 0.5, text: 'gpio_isr_handler_add(pin, function, argument)' },
    { at: 9.34, text: 'the argument comes back as arg on every call → one function, many buttons' },
    { at: 17.56, text: 'it enables the pin\'s interrupt · before the service → ESP_ERR_INVALID_STATE' },
  ] as Caption[],
};

// ── 6. the ISR ─────────────────────────────────────────────────────────────

export const ISR = {
  views: { context: 0.5, rules: 7.4, stack: 16.54, fromisr: 24.94, yield: 33.94, iram: 44.86 },
  context: {
    inside: 2.92, // "inside the interrupt" 0.5+2.42
    notTask: 4.72, // "not in a task" 0.5+4.22
    rules: 6.16, // "the rules change" 0.5+5.66
  },
  rules: {
    wait: 7.96, // "can't wait" 7.4+0.56
    delay: 10.22, // "vTaskDelay" 7.4+2.82
    receive: 11.86, // "xQueueReceive" 7.4+4.46
    log: 13.54, // "no logging calls" 7.4+6.14
  },
  stack: {
    own: 18.24, // "of its own" 16.54+1.70
    bytes: 19.0, // "fifteen hundred and thirty-six bytes" 16.54+2.46
    short: 22.06, // "keep it short" 16.54+5.52
    minimum: 23.24, // "do the minimum" 16.54+6.70
  },
  fromisr: {
    ends: 27.58, // "ends in FromISR" 24.94+2.64
    send: 30.28, // "xQueueSendFromISR" 24.94+5.34
    copies: 31.68, // "copies the pin number" 24.94+6.74
  },
  yield: {
    wakes: 34.38, // "wakes a task" 33.94+0.44
    woken: 35.74, // "woken comes back true" 33.94+1.80
    port: 37.62, // "portYIELD_FROM_ISR" 33.94+3.68
    ends: 40.36, // "as the interrupt ends" 33.94+6.42
    leave: 41.74, // "Leave it out" 33.94+7.80
    tick: 43.86, // "the next tick" 33.94+9.92
  },
  iram: {
    marks: 45.96, // "marks its function" 44.86+1.10
    attr: 47.7, // "IRAM_ATTR" 44.86+2.84
    zero: 51.38, // "flags of zero" 44.86+6.52
    need: 53.04, // "don't need to" 44.86+8.18
  },
  /** which ISR_CODE lines each view lights */
  lines: { context: [0], rules: [], stack: [], fromisr: [2, 4], yield: [3, 4, 5], iram: [0] } as Record<string, number[]>,
  captions: [
    { at: 0.5, text: 'button_isr runs inside the interrupt — not in a task' },
    { at: 7.4, text: 'no blocking (vTaskDelay, xQueueReceive) · no ESP_LOGx in an ISR' },
    { at: 16.54, text: 'its own small stack: CONFIG_FREERTOS_ISR_STACKSIZE = 1536 bytes → do the minimum' },
    { at: 24.94, text: 'only …FromISR calls: xQueueSendFromISR copies the pin number into the queue' },
    { at: 33.94, text: 'woken + portYIELD_FROM_ISR → the task runs as the ISR ends, not at the next tick' },
    { at: 44.86, text: 'flags 0 → IRAM_ATTR not required (driver/gpio.h)' },
  ] as Caption[],
};

// ── 7. the queue ───────────────────────────────────────────────────────────

export const QUEUE = {
  views: { create: 0.5, receive: 7.34, suspended: 13.7 },
  create: {
    worlds: 1.94, // "the two worlds" 0.5+1.44
    create: 3.06, // "xQueueCreate" 0.5+2.56
    ten: 4.46, // "ten pin numbers" 0.5+3.96
    four: 6.08, // "four bytes each" 0.5+5.58
  },
  receive: {
    receive: 9.16, // "xQueueReceive" 7.34+1.82
    max: 10.38, // "portMAX_DELAY" 7.34+3.04
    long: 11.96, // "as long as it takes" 7.34+4.62
  },
  suspended: {
    parks: 15.96, // "parks the task" 13.7+2.26
    list: 17.5, // "its suspended list" 13.7+3.80
    timer: 18.9, // "Nothing wakes it on a timer" 13.7+5.20
    nothing: 21.26, // "costs nothing" 13.7+7.56
    arrives: 22.52, // "until a press arrives" 13.7+8.82
  },
  captions: [
    { at: 0.5, text: 'xQueueCreate(10, sizeof(uint32_t)) → 10 slots × 4 bytes' },
    { at: 7.34, text: 'xQueueReceive(…, portMAX_DELAY) → wait with no timeout' },
    { at: 13.7, text: 'portMAX_DELAY → the suspended list: no timer wakes it — zero cost while waiting' },
  ] as Caption[],
};

// ── 8. demo ────────────────────────────────────────────────────────────────

export const DEMO = {
  press: 1.9, // "falling edge" 0.6+1.30
  status: 3.34, // "a status bit" 0.6+2.74
  jumps: 5.04, // "the CPU jumps" 0.6+4.44
  handler: 6.28, // "the driver's handler" 0.6+5.68
  isr: 7.46, // "button_isr" 0.6+6.86
  drops: 9.98, // "drops eighteen into the queue" 9.08+0.90
  returns: 12.14, // "returns" 9.08+3.06
  wakes: 13.94, // "wakes up" 9.08+4.86
  logs: 14.9, // "logs the press" 9.08+5.82
  release: 15.4,
  polling: 16.6, // "woke up a hundred times a second" 16.18+0.42
  once: 19.08, // "once per press" 16.18+2.90
  captions: [
    { at: 0.6, text: 'edge → status bit → GPIO interrupt → driver handler → button_isr' },
    { at: 9.08, text: 'button_isr: 18 into the queue, return → the task wakes and logs' },
    { at: 16.18, text: 'polling: 100 wake-ups a second · interrupts: one per press' },
  ] as Caption[],
};

// ── 9. bounce ──────────────────────────────────────────────────────────────

export const BOUNCE = {
  views: { storm: 0.5, fix: 12.32 },
  storm: {
    bounce: 1.1, // "the bounce" 0.5+0.60
    several: 2.94, // "several falling edges" 0.5+2.44
    every: 4.94, // "every one of them is an interrupt" 0.5+4.44
    five: 8.16, // "logs five" 7.24+0.92
    letting: 9.2, // "letting go" 7.24+1.96
    falling: 10.98, // "a falling edge" 7.24+3.74
  },
  fix: {
    task: 13.5, // "lives in the task" 12.32+1.18
    first: 14.7, // "the first event" 12.32+2.38
    wait: 15.9, // "wait thirty milliseconds" 12.32+3.58
    reset: 19.74, // "xQueueReset" 12.32+7.42
    read: 21.44, // "read the pin once" 21.18+0.26
    zero: 23.26, // "Still zero?" 21.18+2.08
    press: 24.5, // "That was a press" 21.18+3.32
    one: 25.82, // "One press, one count" 21.18+4.64
    sleeps: 28.22, // "the CPU sleeps" 21.18+7.04
  },
  captions: [
    { at: 0.5, text: 'one press → five falling edges → five interrupts · release bounces too' },
    { at: 12.32, text: 'in the task: first event → wait 30 ms → xQueueReset → read once → still 0? count it' },
  ] as Caption[],
};

// ── 10. second knob: trigger types ────────────────────────────────────────

export const TYPES = {
  views: { edges: 0.5, level: 12.12, wake: 20.86 },
  edges: {
    knob: 2.14, // "the second knob" 0.5+1.64
    neg: 3.14, // "NEGEDGE" 0.5+2.64
    pos: 5.66, // "POSEDGE" 0.5+5.16
    any: 8.08, // "ANYEDGE" 0.5+7.58
    read: 10.18, // "read the level" 0.5+9.68
  },
  level: {
    low: 13.96, // "LOW_LEVEL" 12.12+1.84
    firing: 14.54, // "keeps firing" 12.12+2.42
    held: 17.96, // "a held button" 12.12+5.84
    again: 18.92, // "again, and again" 12.12+6.80
  },
  wake: {
    sleep: 22.56, // "light sleep" 20.86+1.70
    enable: 23.84, // "gpio_wakeup_enable" 20.86+2.98
    two: 26.5, // "the two level types" 20.86+5.64
  },
  captions: [
    { at: 0.5, text: 'NEGEDGE → press · POSEDGE → release · ANYEDGE → both (read the level)' },
    { at: 12.12, text: 'LOW_LEVEL fires as long as the pin is low → a held button, again and again' },
    { at: 20.86, text: 'levels are for wake-up: gpio_wakeup_enable() takes LOW_LEVEL or HIGH_LEVEL only' },
  ] as Caption[],
};

// ── 11. under the hood ────────────────────────────────────────────────────

export type LineMark = Mark & { line: number };

export const IDF_VERSION = 'ESP-IDF v5.5 · ESP32 TRM · real source, trimmed with …';

export const IDF = {
  pin18: 4.58, // "Pin eighteen's register" 4.58+0
  type: 8.26, // "interrupt type" 4.58+3.68
  two: 9.46, // "two for a falling edge" 4.58+4.88
  ena: 11.44, // "an enable bit" 4.58+6.86
  cpu0: 12.34, // "CPU zero" 4.58+7.76
  status: 13.66, // "The edge sets" 13.66+0
  bit18: 14.76, // "bit eighteen" 13.66+1.10
  takes: 18.1, // "the CPU takes the GPIO interrupt" 13.66+4.44
  driver: 20.52, // "The driver's handler" 20.52+0
  code: [
    'static void IRAM_ATTR gpio_intr_service(void *arg)',
    '    gpio_hal_get_intr_status(…, core_id, &gpio_intr_status);   // pcpu_int',
    '    gpio_isr_loop(gpio_intr_status, 0);',
    '…',
    'while (status) {',
    '    int nbit = __builtin_ffs(status) - 1;',
    '    if ((1ULL << gpio_num) & gpio_context.isr_clr_on_entry_mask)',
    '        gpio_hal_clear_intr_status_bit(…, gpio_num);   // edge: clear first',
    '    gpio_context.gpio_isr_func[gpio_num].fn(… .args);',
    '    …',
  ],
  marks: [
    { line: 1, at: 21.42, token: 'gpio_hal_get_intr_status', label: 'which bits are set?' }, // "reads" 20.52+0.90
    { line: 5, at: 23.52, token: '__builtin_ffs', label: 'find the lowest set bit → 18', strong: true }, // "finds eighteen" 20.52+3.00
    { line: 7, at: 25.02, token: 'gpio_hal_clear_intr_status_bit', label: 'clear it' }, // "clears it" 20.52+4.50
    { line: 8, at: 26.04, token: 'fn', label: 'button_isr((void *) 18)', strong: true }, // "calls your function" 20.52+5.52
    { line: 6, at: 30.1, token: 'isr_clr_on_entry_mask', label: 'edge types: before the call' }, // "before it calls you" 27.94+2.16
  ] as LineMark[],
  again: 31.82, // "a new edge" 27.94+3.88
  fires: 34.56, // "it fires again" 27.94+6.62
};

// ── 12. payoff ─────────────────────────────────────────────────────────────

export const PAYOFF = {
  ask: 0.92, // "Don't keep asking" 0.6+0.32
  tell: 1.84, // "Let the pin tell you" 0.6+1.24
  line: 3.16, // "That's an interrupt" 0.6+2.56
  recap: [
    { at: 4.4, k: 'gpio_config(.intr_type = NEGEDGE)', v: 'the pin watches for the edge' },
    { at: 4.75, k: 'gpio_install_isr_service(0)', v: 'one interrupt, the driver dispatches' },
    { at: 5.1, k: 'gpio_isr_handler_add(pin, fn, arg)', v: 'your function, for that pin' },
    { at: 5.45, k: 'xQueueSendFromISR → xQueueReceive', v: 'the task sleeps until it happens' },
    { at: 5.8, k: 'wait · xQueueReset · read once', v: 'bounce handled · next: PWM' },
  ],
};

// ── voiceover (scratch: edge-tts) ─────────────────────────────────────────

/** `text` is the script as written; `say` is what the TTS reads, if different */
export type VoLine = { id: string; scene: IrqSceneId; at: number; text: string; say?: string };
export const VOICE = 'en-US-AndrewMultilingualNeural';

export const VO: VoLine[] = [
  { id: 'p1', scene: 'problem', at: 0.6, text: 'Last time, the loop read the button a hundred times a second. Almost every read said the same thing: not pressed.' },
  {
    id: 'p2',
    scene: 'problem',
    at: 8.4,
    text: "That's three hundred and sixty thousand reads an hour, just in case. And a pulse shorter than one tick can slip between two reads, and never be seen.",
  },
  { id: 'p3', scene: 'problem', at: 18.14, text: 'What if the pin could tell you when something happens?' },

  {
    id: 'a1',
    scene: 'answer',
    at: 0.5,
    text: 'It can. The GPIO hardware watches the pin for an edge. When it sees one, it interrupts the CPU, and runs a function you gave it.',
  },
  { id: 'a2', scene: 'answer', at: 10.18, text: "Then the CPU goes back to what it was doing. That's an interrupt." },

  {
    id: 'f1',
    scene: 'config',
    at: 0.5,
    text: 'This time, set the pin up with gpio_config. It takes one struct, and configures every pin in its mask at once.',
    say: 'This time, set the pin up with GPIO config. It takes one struct, and configures every pin in its mask at once.',
  },
  {
    id: 'f2',
    scene: 'config',
    at: 8.72,
    text: "The mask has one bit per GPIO. One, shifted left by eighteen, sets bit eighteen. It's a sixty-four-bit value, because the pins go up to thirty-nine, so write the one as 1ULL.",
    say: "The mask has one bit per GPIO. One, shifted left by eighteen, sets bit eighteen. It's a sixty-four-bit value, because the pins go up to thirty-nine, so write the one as one, U, L, L.",
  },
  { id: 'f3', scene: 'config', at: 21.06, text: 'Mode and pulls are the same as last time: an input, with the pull-up on, and the pull-down off.', say: 'Mode and pulls are the same as last time: an input, with the pull up on, and the pull down off.' },
  {
    id: 'f4',
    scene: 'config',
    at: 27.3,
    text: "The new field is the interrupt type. GPIO_INTR_NEGEDGE fires on a falling edge, from one to zero. With a pull-up, that's the moment the button goes down.",
    say: "The new field is the interrupt type. GPIO interrupt, neg edge, fires on a falling edge, from one to zero. With a pull up, that's the moment the button goes down.",
  },
  {
    id: 'f5',
    scene: 'config',
    at: 39.14,
    text: "Wrap it in ESP_ERROR_CHECK. An empty mask, or a pin that doesn't exist, returns ESP_ERR_INVALID_ARG.",
    say: "Wrap it in E S P error check. An empty mask, or a pin that doesn't exist, returns E S P error invalid arg.",
  },

  {
    id: 'v1',
    scene: 'service',
    at: 0.5,
    text: "Next, gpio_install_isr_service. All the GPIO pins share one interrupt on the CPU. This installs the driver's handler for it, which then calls a function for each pin.",
    say: "Next, GPIO install I S R service. All the GPIO pins share one interrupt on the CPU. This installs the driver's handler for it, which then calls a function for each pin.",
  },
  {
    id: 'v2',
    scene: 'service',
    at: 12.3,
    text: 'The argument is a set of flags. Zero picks the defaults: a low or medium priority interrupt, written in C, that waits while the flash is being written.',
  },
  {
    id: 'v3',
    scene: 'service',
    at: 23.14,
    text: 'Install it once. A second call returns ESP_ERR_INVALID_STATE.',
    say: 'Install it once. A second call returns E S P error invalid state.',
  },

  {
    id: 'h1',
    scene: 'handler',
    at: 0.5,
    text: 'Then gpio_isr_handler_add hooks your function to one pin. Three things: the pin, the function, and an argument.',
    say: 'Then GPIO I S R handler add hooks your function to one pin. Three things: the pin, the function, and an argument.',
  },
  {
    id: 'h2',
    scene: 'handler',
    at: 9.34,
    text: 'The argument is handed back to your function every time it runs. Here it is the pin number, so one function can serve several buttons.',
  },
  {
    id: 'h3',
    scene: 'handler',
    at: 17.56,
    text: "It also switches the pin's interrupt on. Call it before installing the service, and it returns ESP_ERR_INVALID_STATE.",
    say: "It also switches the pin's interrupt on. Call it before installing the service, and it returns E S P error invalid state.",
  },

  { id: 'n1', scene: 'isr', at: 0.5, text: 'Now the function itself. It runs inside the interrupt, not in a task, so the rules change.' },
  {
    id: 'n2',
    scene: 'isr',
    at: 7.4,
    text: "It can't wait. Nothing that blocks: no vTaskDelay, no xQueueReceive. And no ESP_LOGI calls: logging is for tasks.",
    say: "It can't wait. Nothing that blocks: no V task delay, no X queue receive. And no logging calls: logging is for tasks.",
  },
  {
    id: 'n3',
    scene: 'isr',
    at: 16.54,
    text: 'It runs on a small stack of its own, fifteen hundred and thirty-six bytes by default. So keep it short: do the minimum, and get out.',
  },
  {
    id: 'n4',
    scene: 'isr',
    at: 24.94,
    text: 'To pass the news on, use a function whose name ends in FromISR. xQueueSendFromISR copies the pin number into a queue.',
    say: 'To pass the news on, use a function whose name ends in, from I S R. X queue send from I S R copies the pin number into a queue.',
  },
  {
    id: 'n5',
    scene: 'isr',
    at: 33.94,
    text: 'If that wakes a task, woken comes back true, and portYIELD_FROM_ISR switches to it as the interrupt ends. Leave it out, and the task can wait for the next tick.',
    say: 'If that wakes a task, woken comes back true, and port yield from I S R switches to it as the interrupt ends. Leave it out, and the task can wait for the next tick.',
  },
  {
    id: 'n6',
    scene: 'isr',
    at: 44.86,
    text: "Espressif's example marks its function with IRAM_ATTR, to keep it in internal RAM. With flags of zero, the driver says you don't need to.",
    say: "Espressif's example marks its function with the I-RAM attribute, to keep it in internal RAM. With flags of zero, the driver says you don't need to.",
  },

  {
    id: 'w1',
    scene: 'queue',
    at: 0.5,
    text: 'The queue joins the two worlds. xQueueCreate makes room for ten pin numbers, four bytes each.',
    say: 'The queue joins the two worlds. X queue create makes room for ten pin numbers, four bytes each.',
  },
  {
    id: 'w2',
    scene: 'queue',
    at: 7.34,
    text: 'In app_main, the loop calls xQueueReceive with portMAX_DELAY: wait for as long as it takes.',
    say: 'In app main, the loop calls X queue receive with port max delay: wait for as long as it takes.',
  },
  {
    id: 'w3',
    scene: 'queue',
    at: 13.7,
    text: 'With that delay, FreeRTOS parks the task on its suspended list. Nothing wakes it on a timer. The task costs nothing until a press arrives.',
    say: 'With that delay, Free R-TOS parks the task on its suspended list. Nothing wakes it on a timer. The task costs nothing until a press arrives.',
  },

  {
    id: 'd1',
    scene: 'demo',
    at: 0.6,
    text: "Press the button. The falling edge sets a status bit, the CPU jumps to the driver's handler, and it calls button_isr.",
    say: "Press the button. The falling edge sets a status bit, the CPU jumps to the driver's handler, and it calls button I S R.",
  },
  {
    id: 'd2',
    scene: 'demo',
    at: 9.08,
    text: 'button_isr drops eighteen into the queue, and returns. The waiting task wakes up, and logs the press.',
    say: 'Button I S R drops eighteen into the queue, and returns. The waiting task wakes up, and logs the press.',
  },
  { id: 'd3', scene: 'demo', at: 16.18, text: 'Polling woke up a hundred times a second. This wakes up once per press.' },

  { id: 'b1', scene: 'bounce', at: 0.5, text: 'But remember the bounce. One press can be several falling edges, and every one of them is an interrupt.' },
  { id: 'b2', scene: 'bounce', at: 7.24, text: 'So one press logs five. Even letting go can bounce through a falling edge.' },
  {
    id: 'b3',
    scene: 'bounce',
    at: 12.32,
    text: 'The fix lives in the task. After the first event, wait thirty milliseconds, then throw the extra events away with xQueueReset.',
    say: 'The fix lives in the task. After the first event, wait thirty milliseconds, then throw the extra events away with X queue reset.',
  },
  { id: 'b4', scene: 'bounce', at: 21.18, text: 'Then read the pin once. Still zero? That was a press. One press, one count, and the CPU sleeps in between.' },

  {
    id: 'k1',
    scene: 'types',
    at: 0.5,
    text: 'The interrupt type is the second knob. NEGEDGE catches the press. POSEDGE catches the release. ANYEDGE catches both, so read the level to tell them apart.',
    say: 'The interrupt type is the second knob. Negative edge catches the press. Positive edge catches the release. Any edge catches both, so read the level to tell them apart.',
  },
  {
    id: 'k2',
    scene: 'types',
    at: 12.12,
    text: 'The level types are different. LOW_LEVEL keeps firing for as long as the pin stays low, so a held button interrupts again, and again.',
    say: 'The level types are different. Low level keeps firing for as long as the pin stays low, so a held button interrupts again, and again.',
  },
  {
    id: 'k3',
    scene: 'types',
    at: 20.86,
    text: 'Levels are for waking the chip from light sleep: gpio_wakeup_enable only accepts the two level types.',
    say: 'Levels are for waking the chip from light sleep: GPIO wake-up enable only accepts the two level types.',
  },

  { id: 'u1', scene: 'idf', at: 0.5, text: 'So what happens between the edge and your function? Follow it down.' },
  {
    id: 'u2',
    scene: 'idf',
    at: 4.58,
    text: "Pin eighteen's register in the GPIO peripheral holds its interrupt type, two for a falling edge, and an enable bit for CPU zero.",
  },
  { id: 'u3', scene: 'idf', at: 13.66, text: 'The edge sets bit eighteen in the interrupt status register, and the CPU takes the GPIO interrupt.' },
  {
    id: 'u4',
    scene: 'idf',
    at: 20.52,
    text: "The driver's handler reads which bits are set, finds eighteen, clears it, and calls your function with its argument.",
  },
  {
    id: 'u5',
    scene: 'idf',
    at: 27.94,
    text: "For edges, it clears the bit before it calls you. So a new edge during your function isn't lost: it fires again.",
  },

  { id: 'x1', scene: 'payoff', at: 0.6, text: "Don't keep asking. Let the pin tell you. That's an interrupt." },
];
