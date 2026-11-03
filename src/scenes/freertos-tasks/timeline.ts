/**
 * FreeRTOS tasks — the timeline. Single source of truth for picture AND sound.
 * PURE ESP-IDF: xTaskCreate, vTaskDelay, vTaskDelete; GPIO output calls only.
 *
 *   problem (one loop, two rates) → answer (TASK) → the task function
 *     → xTaskCreate ① (in app_main; function, name, stack) → xTaskCreate ②
 *     (param, priority, handle, return) → demo → what vTaskDelay does → payoff
 *
 * Every time is SCENE-RELATIVE. Cue = vo.at + word offset (Whisper word
 * timestamps, `npm run vo -- freertos-tasks`), noted inline as `// "word"`.
 * Import-free on purpose (type-only imports are erased): Node runs it as-is.
 * Every claim on screen or in the VO is sourced in ./FACTS.md.
 */
import type { Caption } from '../../components/pwm';

export type SceneId = 'problem' | 'answer' | 'fn' | 'create' | 'params' | 'demo' | 'delay' | 'payoff';

export const FPS = 30;

export const SCENES: { id: SceneId; dur: number }[] = [
  { id: 'problem', dur: 31.5 },
  { id: 'answer', dur: 25.7 },
  { id: 'fn', dur: 43.4 },
  { id: 'create', dur: 92.2 },
  { id: 'params', dur: 61.4 },
  { id: 'demo', dur: 32.9 },
  { id: 'delay', dur: 37.7 },
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
export const TASKS_FRAMES = Math.round(SECONDS * FPS);

// ── shared numbers (FACTS.md) ──────────────────────────────────────────────

export const FAST = { pin: 2, ms: 200, name: 'blink_fast' };
export const SLOW = { pin: 19, ms: 500, name: 'blink_slow' };
export const TICK_MS = 10; // CONFIG_FREERTOS_HZ 100
export const STACK = 2048;
export const MAIN_STACK = 4096; // 3584 + 512
export const IDLE_STACK = 1536;
export const PRIO = 5;

/** wanted: each LED switches every `ms` → on while floor(t/ms) is even */
export const wanted = (ms: number, t: number) => (Math.floor(t / ms) % 2 === 0 ? 1 : 0);
/** one loop: fast on 0–200, off; slow on 400–900, off; period 1400 ms */
export const LOOP_PERIOD = 2 * FAST.ms + 2 * SLOW.ms;
export const oneLoop = (which: 'fast' | 'slow', t: number) => {
  const u = ((t % LOOP_PERIOD) + LOOP_PERIOD) % LOOP_PERIOD;
  return which === 'fast' ? (u < FAST.ms ? 1 : 0) : u >= 2 * FAST.ms && u < 2 * FAST.ms + SLOW.ms ? 1 : 0;
};

export const TASK_CODE = [
  'static void blink_task(void *arg)',
  '{',
  '    const blink_t *b = arg;',
  '    gpio_reset_pin(b->pin);',
  '    gpio_set_direction(b->pin, GPIO_MODE_OUTPUT);',
  '',
  '    while (1) {',
  '        gpio_set_level(b->pin, 1);',
  '        vTaskDelay(pdMS_TO_TICKS(b->delay_ms));',
  '        gpio_set_level(b->pin, 0);',
  '        vTaskDelay(pdMS_TO_TICKS(b->delay_ms));',
  '    }',
  '}',
];

export const ONE_LOOP_CODE = [
  'while (1) {',
  '    gpio_set_level(LED_FAST, 1);',
  '    vTaskDelay(pdMS_TO_TICKS(200));',
  '    gpio_set_level(LED_FAST, 0);',
  '    vTaskDelay(pdMS_TO_TICKS(200));',
  '    gpio_set_level(LED_SLOW, 1);',
  '    vTaskDelay(pdMS_TO_TICKS(500));',
  '    gpio_set_level(LED_SLOW, 0);',
  '    vTaskDelay(pdMS_TO_TICKS(500));',
  '}',
];

export const CREATE_CODE = 'xTaskCreate(blink_task, "blink_fast", 2048, &fast, 5, NULL);';

/** the task function, ended on purpose: a counted loop, then vTaskDelete(NULL) */
export const TASK_CODE_DEL = [
  ...TASK_CODE.slice(0, 6),
  '    for (int i = 0; i < 10; i++) {',
  ...TASK_CODE.slice(7, 12),
  '    vTaskDelete(NULL);   // NULL = this task',
  '}',
];

/** app_main: where xTaskCreate is called (the create scene opens here) */
export const MAIN_CODE = [
  'static blink_t fast = { GPIO_NUM_2,  200 };',
  'static blink_t slow = { GPIO_NUM_19, 500 };',
  '',
  'void app_main(void)',
  '{',
  '    ' + CREATE_CODE,
  '    xTaskCreate(blink_task, "blink_slow", 2048, &slow, 5, NULL);',
  '}',
];
export const MAIN_CREATE_LINE = 5;

// ── 1. problem ─────────────────────────────────────────────────────────────

export const PROBLEM = {
  leds: 0.96, // "LEDs" 0.60+0.36
  fast: 3.9, // "every 200" 0.6+3.30
  slow: 6.26, // "the other every 500"
  loop: 8.92, // "one loop" 7.84+1.08
  holds: 10.92, // "holds up" 7.84+3.08
  pass: 13.04, // "One pass" 7.84+5.20
  sum: [13.74, 14.88, 16.02, 17.18] as number[], // "200, plus 200, plus 500, plus 500"
  total: 18.64, // "1400" 7.84+10.80
  both: 20.4, // "for both"
  hand: 22.7, // "juggle" 21.26+1.44
  already: 27.06, // "already running" 21.26+5.80
  captions: [
    { at: 0.6, text: 'GPIO 2: switch every 200 ms · GPIO 19: every 500 ms' },
    { at: 7.84, text: 'one loop: each vTaskDelay holds up the other LED → both repeat every 1400 ms' },
    { at: 21.26, text: 'counting ticks by hand = writing a scheduler · one is already running' },
  ] as Caption[],
};

// ── 2. answer ──────────────────────────────────────────────────────────────

export const ANSWER = {
  own: 1.92, // "its own loop" 0.5+1.42
  becomes: 4.62, // "becomes a task" 0.5+4.12
  sched: 6.24, // "A scheduler" 6.0+0.24
  waits: 9.72, // "waits" 6.0+3.72
  runs: 10.52, // "another one runs" 6.0+4.52
  rtos: 12.84, // "FreeRTOS" 11.84+1.00
  before: 15.1, // "before your code did" 11.84+3.26
  main: 16.66, // "app_main itself" 11.84+4.82
  called: 18.6, // "called main" 11.84+6.76
  stack: 21.1, // "its own stack" 19.84+1.26
  scheduler: 22.7, // "by the scheduler" 19.84+2.86
  word: 23.78, // "That's a task" 19.84+3.94
};

// ── 3. the task function ──────────────────────────────────────────────────

export const FN = {
  views: { sig: 0.5, body: 5.88, never: 17.5, del: 25.35 },
  sig: {
    fn: 1.88, // "a function" 0.5+1.38
    voidp: 3.24, // "one void pointer" 0.5+2.74
    nothing: 4.52, // "returns nothing" 0.5+4.02
  },
  body: {
    setup: 6.42, // "sets up" 5.88+0.54
    loops: 7.76, // "loops forever" 5.88+1.88
    on: 9.3, // f2a "LED on."
    wait1: 10.95, // f2b "Wait."
    off: 12.3, // f2c "LED off."
    wait2: 13.9, // f2d "Wait."
    same: 15.44, // f2e "same calls" 15.2+0.24
  },
  never: {
    never: 18.9, // "must never return" 17.5+1.40
    does: 20.32, // "If it does" 17.5+2.82
    logs: 23.18, // "logs an error" 17.5+5.68
    aborts: 24.42, // "aborts" 17.5+6.92
  },
  del: {
    ten: 26.29, // "ten blinks" 25.35+0.94
    swap: 27.75, // "Swap the forever loop" 25.35+2.40 → while (1) becomes for (… 10 …)
    counted: 29.23, // "a counted one" 25.35+3.88
    done: 30.53, // "when it's done" 25.35+5.18
    deletes: 31.73, // "deletes itself" 25.35+6.38 → vTaskDelete(NULL) appears
    vtd: 33.63, // "vTaskDelete" 25.35+8.28
    nul: 35.75, // f5 "NULL means"
    ends: 38.99, // "the task ends" 35.75+3.24
    frees: 40.89, // "frees its stack" 35.75+5.14
  },
  lines: { sig: [0], body: [3, 4, 6, 7, 8, 9, 10], never: [11, 12], del: [6, 12] } as Record<string, number[]>,
  captions: [
    { at: 0.5, text: 'a task function: void fn(void *arg) — one pointer in, nothing out' },
    { at: 5.88, text: 'set up the pin, then loop forever — the blink video\'s calls' },
    { at: 17.5, text: 'never return: ESP-IDF logs an error and aborts' },
    { at: 25.35, text: 'to end on purpose: a counted loop, then vTaskDelete(NULL)' },
    { at: 35.75, text: 'vTaskDelete(NULL) = delete the calling task · the idle task frees its stack' },
  ] as Caption[],
};

// ── 4. xTaskCreate ①: function, name, stack ──────────────────────────────

export const CREATE = {
  // the opening: app_main, with both calls; the first one is pulled out
  main: {
    show: 0.5, // c0 "Back in app_main" → the app_main panel
    two: 1.72, // "two calls" 0.5+1.22
    each: 3.96, // "one for each LED" 0.5+3.46
    pick: 6.14, // c0b "the first one" 5.76+0.38 → the rest fades, the first call lights
    out: 7.3, // c1 "xTaskCreate" → the panel goes, the big call line arrives
  },
  run: 7.3, // "xTaskCreate" 7.3+0.00
  six: 11.32, // "six arguments" 7.3+4.02
  args: [13.76, 21.16, 33.66], // "the function" 12.74+1.02 · "a name" 20.02+1.14 · "the stack size" 33.28+0.38
  views: { fn: 12.74, name: 20.02, bytes: 33.28, holds: 49.98, scale: 58.8, overflow: 65.66 },
  fn: {
    brackets: 16.18, // "without brackets" 12.74+3.44
    handing: 17.46, // "handing it over" 12.74+4.72
    calling: 18.8, // "not calling it" 12.74+6.06
  },
  name: {
    show: 20.26, // the "blink_fast" cells
    debug: 22.48, // "debugging" 20.02+2.46
    fifteen: 24.86, // "15 characters" 20.02+4.84
    cut: 27.84, // "cut short" 20.02+7.82
    example: 29.94, // "own GPIO example" 20.02+9.92
    loses: 31.06, // "loses its last two letters" 20.02+11.04
  },
  bytes: {
    n: 34.76, // "2048" 33.28+1.48
    bytes: 38.92, // "that's bytes" 33.28+5.64
    vanilla: 39.84, // "In vanilla FreeRTOS" 33.28+6.56
    words: 42.96, // "words" 33.28+9.68
    word4: 44.46, // "a word is four bytes" 33.28+11.18
    four: 45.88, // c4b "Four times as much memory"
    same: 47.64, // "Same number" 45.88+1.76
    fourStack: 48.4, // "four times the stack" 45.88+2.52
  },
  holds: {
    locals: 51.3, // "local variables" 49.98+1.32
    calls: 52.64, // "function calls" 49.98+2.66
    regs: 54.06, // "registers while it's switched out" 49.98+4.08
    heap: 56.4, // "from the heap" 49.98+6.42
  },
  scale: {
    main: 60.22, // "app_main's task" 58.8+1.42
    k4: 61.04, // "4096" 58.8+2.24
    ours: 58.84,
    idle: 63.28, // "the idle task" 58.8+4.48
  },
  overflow: {
    trap: 66.06, // "the trap" 65.66+0.40
    small: 67.66, // "too small" 65.66+2.00 → the stack grows, call by call
    past: 69.78, // "run past the end" 65.66+4.12
    overflow: 71.76, // "a stack overflow" 65.66+6.10
    check: 75.7, // c7b "checks the end" 72.8+2.90
    catches: 78.38, // "been overwritten" 72.8+5.58
    prints: 79.68, // "prints the task's name" 72.8+6.88
    restarts: 81.44, // "restarts" 72.8+8.64
    meet: 82.9, // c7c "meet this one" 82.6+0.30
    reboots: 84.66, // "reboots the chip" 82.6+2.06
    outgrown: 87.52, // "outgrown its stack" 82.6+4.92
    fix: 89.28, // "The fix" 82.6+6.68
    bigger: 90.22, // "a bigger one" 82.6+7.62
  },
  captions: [
    { at: 0.5, text: 'app_main: two calls to xTaskCreate — one task per LED' },
    { at: 7.3, text: 'xTaskCreate(function, name, stack, parameter, priority, handle)' },
    { at: 12.74, text: 'the function, without () — passed, not called' },
    { at: 20.02, text: 'a name for debugging · at most 15 characters are kept' },
    { at: 33.28, text: 'ESP-IDF: stack size in BYTES · vanilla FreeRTOS: words' },
    { at: 45.88, text: '1 word = 4 bytes → the same 2048 is four times as much stack' },
    { at: 49.98, text: 'the stack: locals, calls, saved registers · from the heap at creation' },
    { at: 58.8, text: 'main task 4096 B · ours 2048 B · idle 1536 B' },
    { at: 65.66, text: 'too small → the calls run past the end of the stack: a stack overflow' },
    { at: 72.8, text: 'checked at every task switch → the task\'s name is printed, the chip restarts' },
    { at: 82.6, text: 'the usual fix: a bigger stack' },
  ] as Caption[],
};

// ── 5. xTaskCreate ②: parameter, priority, handle, return ────────────────

export const PARAMS = {
  args: [0.25, 0.35, 0.45, 1.3, 21.98, 42.3], // first three already known · "parameter" 0.5+0.80 · "priority" 21.64+0.36 · "the handle" 41.2+1.10
  views: { arg: 0.5, two: 6.2, life: 12.56, prio: 21.64, preempt: 35.26, handle: 41.2, ret: 47.16 },
  arg: {
    pointer: 2.68, // "Whatever pointer" 0.5+2.18
    arrives: 3.68, // "arrives in the task" 0.5+3.18
    asArg: 5.34, // "as arg" 0.5+4.84
  },
  two: {
    one: 6.48, // "one function" 6.2+0.28
    two: 7.76, // "two LEDs" 6.2+1.56
    pin: 10.52, // "its own pin" 6.2+4.32
    delay: 11.64, // "its own delay" 6.2+5.44
  },
  life: {
    valid: 13.7, // "stay valid" 12.56+1.14
    statik: 17.68, // "are static" 12.56+5.12
    local: 18.74, // "A local in app_main" 12.56+6.18
    gone: 19.78, // "is gone" 12.56+7.22
    returns: 20.66, // "returns" 12.56+8.10
  },
  prio: {
    ours: 22.3, // our 5 lands on the ladder
    higher: 23.26, // "Higher numbers win" 21.64+1.62
    ready: 25.56, // "two tasks are ready" 21.64+3.92
    first: 28.66, // "the higher priority first" 21.64+7.02
    zero: 29.62, // q4b "Zero"
    one: 32.84, // "runs at one" 29.62+3.22
    top: 34.06, // "the top is 24" 29.62+4.44
  },
  preempt: {
    outranks: 35.64, // "outranks" 35.26+0.38
    straight: 38.3, // "straight away" 35.26+3.04
    carries: 39.64, // "carries on once it waits" 35.26+4.38
    waits: 40.38,
  },
  handle: {
    refer: 43.58, // "refer to the task later" 41.2+2.38
    nul: 45.62, // "Pass NULL" 41.2+4.42
  },
  ret: {
    pdpass: 47.74, // "pdPASS" 47.16+0.58
    one: 49.32, // "which is one" 47.16+2.16
    notErr: 50.22, // "not an esp_err_t" 47.16+3.06
    check: 53.1, // "ESP_ERROR_CHECK" 47.16+5.94
    abort: 54.96, // "Success would abort" 47.16+7.80
    heap: 56.64, // "If the heap can't fit" 56.3+0.34
    minus: 58.62, // "minus one" 56.3+2.32
  },
  captions: [
    { at: 0.5, text: 'the parameter: any pointer → arrives as arg' },
    { at: 6.2, text: 'one function, two tasks: each gets its own pin and delay' },
    { at: 12.56, text: 'it must outlive the task → static, not a local in app_main' },
    { at: 21.64, text: 'priority: a higher number runs first when both are ready' },
    { at: 29.62, text: 'priority 0…24 · idle 0 · app_main 1 · ours 5' },
    { at: 35.26, text: '5 > 1 → the new task runs at once; app_main resumes when it blocks' },
    { at: 41.2, text: 'the handle: refer to the task later — or NULL' },
    { at: 47.16, text: 'returns pdPASS (1), not ESP_OK (0) → no ESP_ERROR_CHECK · −1 = out of memory' },
  ] as Caption[],
};

// ── 6. demo ────────────────────────────────────────────────────────────────

export const DEMO = {
  flash: 0.6,
  creates: 1.94, // "creates both tasks" 0.6+1.34
  returns: 3.86, // "and returns" 0.6+3.26
  log: 4.94, // "The log" 0.6+4.34
  deleted: 7.7, // "is deleted" 0.6+7.10
  blink: 1.94, // the LEDs start when the tasks are created
  own: 11.8, // "its own LED" 8.58+3.22
  ms200: 14.58, // "200"
  ms500: 15.46, // "500 milliseconds"
  same: 18.42, // "the same function" 17.08+1.34
  stack: 20.56, // "its own stack" 17.08+3.48
  b: 22.2, // "its own b" 17.08+5.12
  pointer: 23.1, // "the pointer blink_task reads" 17.08+6.02 → the line of code
  arg: 24.72, // "from arg" 17.08+7.64
  fastB: 26.76, // d3b "One b points at fast"
  slowB: 28.58, // "the other at slow" 26.76+1.82
  settings: 29.98, // "Same code, different settings" 26.76+3.22
  captions: [
    { at: 0.6, text: 'app_main creates two tasks and returns — the main task is deleted' },
    { at: 8.58, text: 'the LEDs keep going: GPIO 2 every 200 ms · GPIO 19 every 500 ms' },
    { at: 17.08, text: 'same function, two stacks → two copies of b = the pointer taken from arg' },
    { at: 26.76, text: 'b → &fast in one task, b → &slow in the other' },
  ] as Caption[],
};

// ── 7. what vTaskDelay does ────────────────────────────────────────────────

export const DELAY = {
  views: { states: 0.5, ticks: 7.92, idle: 21.98, cores: 28.5 },
  states: {
    off: 4.04, // "off the CPU" 0.5+3.54
    blocks: 5.66, // "blocks it" 0.5+5.16
    ticks: 7.1, // "ticks" 0.5+6.60
  },
  ticks: {
    ten: 9.06, // "every 10 milliseconds" 7.92+1.14
    ms200: 10.74, // "200 milliseconds" 7.92+2.82
    twenty: 12.44, // "is 20 ticks" 7.92+4.52
    every: 13.88, // "On every tick" 13.64+0.24
    checks: 15.66, // "checks whose time is up" 13.64+2.02
    after: 17.5, // "After 20 ticks" 13.64+3.86
    ready: 19.92, // "is ready again" 13.64+6.28
    runs: 21.1, // "and runs" 13.64+7.46
  },
  idle: {
    blocked: 23.0, // "both tasks are blocked" 21.98+1.02
    idle: 24.86, // "the idle task" 21.98+2.88
    most: 26.02, // "Most of the time" 21.98+4.04
  },
  cores: {
    two: 30.44, // "two cores" 28.5+1.94
    either: 34.0, // "either one" 28.5+5.50
    own: 35.4, // "a video of its own" 28.5+6.90
  },
  captions: [
    { at: 0.5, text: 'vTaskDelay: Running → Blocked, for a number of ticks' },
    { at: 7.92, text: '1 tick = 10 ms → pdMS_TO_TICKS(200) = 20 ticks' },
    { at: 13.64, text: 'every tick: whose time is up? → Ready → Running' },
    { at: 21.98, text: 'both blocked → the CPU runs the idle task' },
    { at: 28.5, text: 'two cores · xTaskCreate → either one (tskNO_AFFINITY)' },
  ] as Caption[],
};

// ── 8. payoff ──────────────────────────────────────────────────────────────

export const PAYOFF = {
  job: 1.32, // "every job" 0.6+0.72
  line: 2.7, // "That's a task" 0.6+2.10
  recap: [
    { at: 3.9, k: 'void fn(void *arg) { while (1) … }', v: 'never returns' },
    { at: 4.25, k: 'xTaskCreate(fn, name, bytes, arg, prio, &h)', v: 'a task, ready to run' },
    { at: 4.6, k: 'vTaskDelay(pdMS_TO_TICKS(ms))', v: 'blocks only this task' },
    { at: 4.95, k: 'static params · pdPASS ≠ ESP_OK', v: 'the traps' },
    { at: 5.3, k: 'priority 0…24', v: 'next: the scheduler' },
  ],
};

// ── voiceover (scratch: edge-tts) ─────────────────────────────────────────

export type VoLine = { id: string; scene: SceneId; at: number; text: string; say?: string };
export const VOICE = 'en-US-AndrewMultilingualNeural';

export const VO: VoLine[] = [
  { id: 'p1', scene: 'problem', at: 0.6, text: 'Two LEDs, two speeds. One should switch every two hundred milliseconds, the other every five hundred.' },
  {
    id: 'p2',
    scene: 'problem',
    at: 7.84,
    text: 'Put both in one loop, and each vTaskDelay holds up the other LED. One pass takes two hundred, plus two hundred, plus five hundred, plus five hundred: fourteen hundred milliseconds, for both.',
    say: 'Put both in one loop, and each V task delay holds up the other LED. One pass takes two hundred, plus two hundred, plus five hundred, plus five hundred: fourteen hundred milliseconds, for both.',
  },
  { id: 'p3', scene: 'problem', at: 21.26, text: 'You could count ticks, and juggle both LEDs by hand. But your ESP32 is already running something that does the juggling for you.' },

  { id: 'a1', scene: 'answer', at: 0.5, text: 'Give each LED its own loop, with its own delay. Each loop becomes a task.' },
  { id: 'a2', scene: 'answer', at: 6, text: 'A scheduler shares the CPU between them. While one task waits, another one runs.' },
  {
    id: 'a3',
    scene: 'answer',
    at: 11.84,
    text: 'That scheduler is FreeRTOS, and it started before your code did. app_main itself runs in a task, called main.',
    say: 'That scheduler is free R-T-O-S, and it started before your code did. App main itself runs in a task, called main.',
  },
  { id: 'a4', scene: 'answer', at: 19.84, text: "A function with its own stack, run by the scheduler. That's a task." },

  { id: 'f1', scene: 'fn', at: 0.5, text: 'A task starts as a function. It takes one void pointer, and returns nothing.' },
  { id: 'f2', scene: 'fn', at: 5.88, text: 'This one sets up its pin, then loops forever.' },
  // the four steps, one at a time, with air between them
  { id: 'f2a', scene: 'fn', at: 9.3, text: 'LED on.' },
  { id: 'f2b', scene: 'fn', at: 10.95, text: 'Wait.' },
  { id: 'f2c', scene: 'fn', at: 12.3, text: 'LED off.' },
  { id: 'f2d', scene: 'fn', at: 13.9, text: 'Wait.' },
  { id: 'f2e', scene: 'fn', at: 15.2, text: 'The same calls as the blink video.' },
  { id: 'f3', scene: 'fn', at: 17.5, text: 'A task function must never return. If it does, ESP-IDF logs an error, and aborts.', say: 'A task function must never return. If it does, E S P I D F logs an error, and aborts.' },
  {
    id: 'f4',
    scene: 'fn',
    at: 25.35,
    text: "Suppose you only want ten blinks. Swap the forever loop for a counted one. And when it's done, the task deletes itself: vTaskDelete, with NULL.",
    say: "Suppose you only want ten blinks. Swap the forever loop for a counted one. And when it's done, the task deletes itself: V task delete, with null.",
  },
  { id: 'f5', scene: 'fn', at: 35.75, text: 'NULL means: the task making the call. The task ends, and the idle task frees its stack.', say: 'Null means: the task making the call. The task ends, and the idle task frees its stack.' },

  { id: 'c0', scene: 'create', at: 0.5, text: 'Back in app_main. Two calls to xTaskCreate: one for each LED.', say: 'Back in app main. Two calls to X task create: one for each LED.' },
  { id: 'c0b', scene: 'create', at: 5.76, text: 'Take the first one.' },
  { id: 'c1', scene: 'create', at: 7.3, text: 'xTaskCreate turns blink_task into a task. It takes six arguments.', say: 'X task create turns blink task into a task. It takes six arguments.' },
  { id: 'c2', scene: 'create', at: 12.74, text: "First, the function itself. Pass its name without brackets: you're handing it over, not calling it." },
  {
    id: 'c3',
    scene: 'create',
    at: 20.02,
    text: "Next, a name, used only for debugging. FreeRTOS keeps fifteen characters, so a longer name is cut short: Espressif's own GPIO example loses its last two letters.",
    say: "Next, a name, used only for debugging. free R-T-O-S keeps fifteen characters, so a longer name is cut short: Espressif's own GPIO example loses its last two letters.",
  },
  {
    id: 'c4',
    scene: 'create',
    at: 33.28,
    text: "Then the stack size: two thousand and forty-eight. In ESP-IDF, that's bytes. In vanilla FreeRTOS, the same number would mean words, and a word is four bytes.",
    say: "Then the stack size: two thousand and forty-eight. In E S P I D F, that's bytes. In vanilla free R-T-O-S, the same number would mean words, and a word is four bytes.",
  },
  { id: 'c4b', scene: 'create', at: 45.88, text: 'Four times as much memory. Same number, four times the stack.' },
  {
    id: 'c5',
    scene: 'create',
    at: 49.98,
    text: "The stack holds the task's local variables, its function calls, and its registers while it's switched out. It comes from the heap, when the task is created.",
  },
  {
    id: 'c6',
    scene: 'create',
    at: 58.8,
    text: "For scale: app_main's task has four thousand and ninety-six bytes, and the idle task fifteen hundred and thirty-six.",
    say: "For scale: app main's task has four thousand and ninety-six bytes, and the idle task fifteen hundred and thirty-six.",
  },
  {
    id: 'c7',
    scene: 'create',
    at: 65.66,
    text: "Now the trap. Make the stack too small, and the task's calls run past the end of it. That's a stack overflow.",
  },
  {
    id: 'c7b',
    scene: 'create',
    at: 72.8,
    text: "At every task switch, FreeRTOS checks the end of each stack. If it's been overwritten, the chip prints the task's name, and restarts.",
    say: "At every task switch, free R-T-O-S checks the end of each stack. If it's been overwritten, the chip prints the task's name, and restarts.",
  },
  {
    id: 'c7c',
    scene: 'create',
    at: 82.6,
    text: 'You will meet this one. A task that reboots the chip, with this message, has outgrown its stack. The fix: give it a bigger one.',
  },

  { id: 'q1', scene: 'params', at: 0.5, text: 'Next, the parameter. Whatever pointer you pass here arrives in the task as arg.' },
  { id: 'q2', scene: 'params', at: 6.2, text: 'So one function can blink two LEDs. Each task gets its own pin, and its own delay.' },
  {
    id: 'q3',
    scene: 'params',
    at: 12.56,
    text: "The pointer has to stay valid for as long as the task runs. That's why fast and slow are static. A local in app_main is gone when app_main returns.",
    say: "The pointer has to stay valid for as long as the task runs. That's why fast and slow are static. A local in app main is gone when app main returns.",
  },
  {
    id: 'q4',
    scene: 'params',
    at: 21.64,
    text: 'Then the priority. Higher numbers win: when two tasks are ready, the scheduler runs the one with the higher priority first.',
  },
  {
    id: 'q4b',
    scene: 'params',
    at: 29.62,
    text: 'Zero belongs to the idle tasks, app_main runs at one, and the top is twenty-four.',
    say: 'Zero belongs to the idle tasks, app main runs at one, and the top is twenty-four.',
  },
  {
    id: 'q5',
    scene: 'params',
    at: 35.26,
    text: 'Five outranks app_main, so the new task starts running straight away. app_main carries on once it waits.',
    say: 'Five outranks app main, so the new task starts running straight away. App main carries on once it waits.',
  },
  { id: 'q6', scene: 'params', at: 41.2, text: "Last, the handle: a way to refer to the task later. Pass NULL if you don't need it.", say: "Last, the handle: a way to refer to the task later. Pass null if you don't need it." },
  {
    id: 'q7',
    scene: 'params',
    at: 47.16,
    text: "It returns pdPASS, which is one. That's not an esp_err_t, so don't wrap it in ESP_ERROR_CHECK: success would abort.",
    say: "It returns P D pass, which is one. That's not an E S P error code, so don't wrap it in E S P error check: success would abort.",
  },
  { id: 'q8', scene: 'params', at: 56.3, text: "If the heap can't fit the stack, it returns minus one instead." },

  {
    id: 'd1',
    scene: 'demo',
    at: 0.6,
    text: 'Flash it. app_main creates both tasks, and returns. The log says so, and the main task is deleted.',
    say: 'Flash it. App main creates both tasks, and returns. The log says so, and the main task is deleted.',
  },
  { id: 'd2', scene: 'demo', at: 8.58, text: "The LEDs don't notice. Each task switches its own LED at its own pace: two hundred, and five hundred milliseconds." },
  {
    id: 'd3',
    scene: 'demo',
    at: 17.08,
    text: 'Both tasks run the same function. But each has its own stack, so each has its own b: the pointer blink_task reads from arg, at the top of the function.',
    say: 'Both tasks run the same function. But each has its own stack, so each has its own B: the pointer blink task reads from arg, at the top of the function.',
  },
  { id: 'd3b', scene: 'demo', at: 26.76, text: 'One b points at fast, the other at slow. Same code, different settings.', say: 'One B points at fast, the other at slow. Same code, different settings.' },

  {
    id: 'v1',
    scene: 'delay',
    at: 0.5,
    text: "Here's what vTaskDelay really does. It takes the task off the CPU, and blocks it, for a number of ticks.",
    say: "Here's what V task delay really does. It takes the task off the CPU, and blocks it, for a number of ticks.",
  },
  { id: 'v2', scene: 'delay', at: 7.92, text: 'A tick comes every ten milliseconds, so two hundred milliseconds is twenty ticks.' },
  { id: 'v3', scene: 'delay', at: 13.64, text: 'On every tick, FreeRTOS checks whose time is up. After twenty ticks, blink_fast is ready again, and runs.', say: 'On every tick, free R-T-O-S checks whose time is up. After twenty ticks, blink fast is ready again, and runs.' },
  { id: 'v4', scene: 'delay', at: 21.98, text: "While both tasks are blocked, the CPU runs the idle task. Most of the time, that's all it's doing." },
  {
    id: 'v5',
    scene: 'delay',
    at: 28.5,
    text: "And the ESP32 has two cores. xTaskCreate lets a task run on either one. That's a video of its own.",
    say: "And the ESP32 has two cores. X task create lets a task run on either one. That's a video of its own.",
  },


  { id: 'x1', scene: 'payoff', at: 0.6, text: "Give every job its own loop. That's a task." },
];
