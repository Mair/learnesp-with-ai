/**
 * FreeRTOS tasks — the timeline. Single source of truth for picture AND sound.
 * PURE ESP-IDF: xTaskCreate, vTaskDelay, vTaskDelete; GPIO output calls only.
 *
 *   problem (one loop, two rates) → answer (TASK) → the task function
 *     → xTaskCreate ① (function, name, stack) → xTaskCreate ② (param, priority,
 *     handle, return) → demo → what vTaskDelay does → under the hood → payoff
 *
 * Every time is SCENE-RELATIVE. Cue = vo.at + word offset (Whisper word
 * timestamps, `npm run vo -- freertos-tasks`), noted inline as `// "word"`.
 * Import-free on purpose (type-only imports are erased): Node runs it as-is.
 * Every claim on screen or in the VO is sourced in ./FACTS.md.
 */
import type { Caption, Mark } from '../../components/pwm';

export type SceneId = 'problem' | 'answer' | 'fn' | 'create' | 'params' | 'demo' | 'delay' | 'idf' | 'payoff';

export const FPS = 30;

export const SCENES: { id: SceneId; dur: number }[] = [
  { id: 'problem', dur: 31.5 },
  { id: 'answer', dur: 25.7 },
  { id: 'fn', dur: 28.3 },
  { id: 'create', dur: 62.1 },
  { id: 'params', dur: 54.6 },
  { id: 'demo', dur: 27.0 },
  { id: 'delay', dur: 37.7 },
  { id: 'idf', dur: 35.0 },
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
  views: { sig: 0.5, body: 5.88, never: 13.8, del: 21.64 },
  sig: {
    fn: 1.88, // "a function" 0.5+1.38
    voidp: 3.24, // "one void pointer" 0.5+2.74
    nothing: 4.52, // "returns nothing" 0.5+4.02
  },
  body: {
    setup: 6.26, // "sets up its pin" 5.88+0.38
    loops: 7.66, // "loops forever" 5.88+1.78
    on: 9.26, // "LED on" 5.88+3.38
    wait1: 9.96, // "wait"
    off: 10.18, // "LED off"
    wait2: 11.14, // "wait"
    same: 11.86, // "The same calls" 5.88+5.98
  },
  never: {
    never: 15.2, // "must never return" 13.8+1.40
    does: 16.62, // "If it does" 13.8+2.82
    logs: 19.48, // "logs an error" 13.8+5.68
    aborts: 20.72, // "aborts" 13.8+6.92
  },
  del: {
    purpose: 22.54, // "on purpose" 21.64+0.90
    deletes: 23.52, // "deletes itself" 21.64+1.88
    vtd: 25.32, // "vTaskDelete" 21.64+3.68
  },
  lines: { sig: [0], body: [3, 4, 6, 7, 8, 9, 10], never: [11, 12], del: [12] } as Record<string, number[]>,
  captions: [
    { at: 0.5, text: 'a task function: void fn(void *arg) — one pointer in, nothing out' },
    { at: 5.88, text: 'set up the pin, then loop forever — the blink video\'s calls' },
    { at: 13.8, text: 'never return: ESP-IDF logs an error and aborts' },
    { at: 21.64, text: 'to end on purpose: vTaskDelete(NULL) deletes the calling task' },
  ] as Caption[],
};

// ── 4. xTaskCreate ①: function, name, stack ──────────────────────────────

export const CREATE = {
  run: 1.06, // "xTaskCreate" 0.5+0.56
  six: 4.42, // "six arguments" 0.5+3.92
  args: [6.8, 14.2, 26.68], // "the function" 5.78+1.02 · "a name" 13.06+1.14 · "the stack size" 26.32+0.36
  views: { fn: 5.78, name: 13.06, bytes: 26.32, holds: 37.74, scale: 46.56, overflow: 53.42 },
  fn: {
    brackets: 9.22, // "without brackets" 5.78+3.44
    handing: 10.5, // "handing it over" 5.78+4.72
    calling: 11.84, // "not calling it" 5.78+6.06
  },
  name: {
    debug: 15.52, // "debugging" 13.06+2.46
    fifteen: 17.9, // "15 characters" 13.06+4.84
    cut: 20.88, // "cut short" 13.06+7.82
    example: 22.98, // "own GPIO example" 13.06+9.92
    loses: 24.1, // "loses its last two letters" 13.06+11.04
  },
  bytes: {
    n: 27.7, // "2048" 26.32+1.38
    bytes: 31.76, // "that's bytes" 26.32+5.44
    vanilla: 32.8, // "In vanilla FreeRTOS" 26.32+6.48
    words: 35.44, // "words" 26.32+9.12
    four: 36.28, // "four times as much" 26.32+9.96
  },
  holds: {
    locals: 39.06, // "local variables" 37.74+1.32
    calls: 40.4, // "function calls" 37.74+2.66
    regs: 41.82, // "registers while it's switched out" 37.74+4.08
    heap: 44.16, // "from the heap" 37.74+6.42
  },
  scale: {
    main: 47.98, // "app_main's task" 46.56+1.42
    k4: 48.8, // "4096" 46.56+2.24
    idle: 51.04, // "the idle task" 46.56+4.48
  },
  overflow: {
    small: 53.72, // "Too small" 53.42+0.30
    check: 54.88, // "a check" 53.42+1.46
    sw: 56.0, // "task switch" 53.42+2.58
    catches: 56.26, // "catches the overflow"
    prints: 58.34, // "prints the task's name" 53.42+4.92
    restarts: 60.02, // "restarts" 53.42+6.60
  },
  captions: [
    { at: 0.5, text: 'xTaskCreate(function, name, stack, parameter, priority, handle)' },
    { at: 5.78, text: 'the function, without () — passed, not called' },
    { at: 13.06, text: 'a name for debugging · at most 15 characters are kept' },
    { at: 26.32, text: 'ESP-IDF: stack size in BYTES · vanilla FreeRTOS: words (×4)' },
    { at: 37.74, text: 'the stack: locals, calls, saved registers · from the heap at creation' },
    { at: 46.56, text: 'main task 4096 B · ours 2048 B · idle 1536 B' },
    { at: 53.42, text: 'overflow → caught at the next task switch → name printed, chip restarts' },
  ] as Caption[],
};

// ── 5. xTaskCreate ②: parameter, priority, handle, return ────────────────

export const PARAMS = {
  args: [0.25, 0.35, 0.45, 1.3, 21.98, 35.5], // first three already known · "parameter" 0.5+0.80 · "priority" · "the handle"
  views: { arg: 0.5, two: 6.2, life: 12.56, prio: 21.64, preempt: 28.46, handle: 34.4, ret: 40.36 },
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
    zero: 23.02, // "Zero" 21.64+1.38
    one: 26.2, // "runs at one" 21.64+4.56
    top: 27.22, // "the top is 24" 21.64+5.58
  },
  preempt: {
    outranks: 28.84, // "outranks" 28.46+0.38
    straight: 31.5, // "straight away" 28.46+3.04
    carries: 32.84, // "carries on once it waits" 28.46+4.38
    waits: 33.58,
  },
  handle: {
    refer: 36.78, // "refer to the task later" 34.4+2.38
    nul: 38.82, // "Pass NULL" 34.4+4.42
  },
  ret: {
    pdpass: 40.94, // "pdPASS" 40.36+0.58
    one: 42.52, // "which is one" 40.36+2.16
    notErr: 43.42, // "not an esp_err_t" 40.36+3.06
    check: 46.3, // "ESP_ERROR_CHECK" 40.36+5.94
    abort: 48.16, // "Success would abort" 40.36+7.80
    heap: 49.84, // "If the heap can't fit" 49.5+0.34
    minus: 51.82, // "minus one" 49.5+2.32
  },
  captions: [
    { at: 0.5, text: 'the parameter: any pointer → arrives as arg' },
    { at: 6.2, text: 'one function, two tasks: each gets its own pin and delay' },
    { at: 12.56, text: 'it must outlive the task → static, not a local in app_main' },
    { at: 21.64, text: 'priority 0…24 · idle 0 · app_main 1 · ours 5' },
    { at: 28.46, text: '5 > 1 → the new task runs at once; app_main resumes when it blocks' },
    { at: 34.4, text: 'the handle: refer to the task later — or NULL' },
    { at: 40.36, text: 'returns pdPASS (1), not ESP_OK (0) → no ESP_ERROR_CHECK · −1 = out of memory' },
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
  same: 18.32, // "the same function" 17.08+1.24
  stack: 20.4, // "its own stack" 17.08+3.32
  b: 21.74, // "its own b" 17.08+4.66
  settings: 23.32, // "its own settings"
  captions: [
    { at: 0.6, text: 'app_main creates two tasks and returns — the main task is deleted' },
    { at: 8.58, text: 'the LEDs keep going: GPIO 2 every 200 ms · GPIO 19 every 500 ms' },
    { at: 17.08, text: 'same function, two stacks → each task has its own b' },
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

// ── 8. under the hood ─────────────────────────────────────────────────────

export type LineMark = Mark & { line: number };
export const IDF_VERSION = 'ESP-IDF v5.5 · FreeRTOS V10.5.1 · real source, trimmed with …';

export const IDF = {
  layers: [
    {
      at: 2.7, // "It calls xTaskCreatePinnedToCore"
      file: 'components/freertos/FreeRTOS-Kernel/include/freertos/task.h',
      title: 'xTaskCreate',
      code: ['static inline BaseType_t xTaskCreate(…)', '{', '    return xTaskCreatePinnedToCore(pxTaskCode, pcName, usStackDepth,', '                                   pvParameters, uxPriority, pxCreatedTask,', '                                   tskNO_AFFINITY);', '}'],
      marks: [{ line: 4, at: 5.56, token: 'tskNO_AFFINITY', label: 'either core' }] as LineMark[], // "no affinity" 2.7+2.86
    },
    {
      at: 6.64, // "That takes the stack"
      file: 'components/freertos/esp_additions/freertos_tasks_c_additions.h',
      title: 'xTaskCreatePinnedToCore',
      code: ['pxStack = pvPortMallocStack( usStackDepth * sizeof( StackType_t ) );   // 2048 bytes', 'pxNewTCB = ( TCB_t * ) pvPortMalloc( sizeof( TCB_t ) );', '…', 'prvInitialiseNewTask( pxTaskCode, pcName, usStackDepth, pvParameters, uxPriority, … );', 'prvAddNewTaskToReadyList( pxNewTCB );'],
      marks: [
        { line: 0, at: 7.24, token: 'pvPortMallocStack', label: 'the stack, from the heap', strong: true }, // "the stack" 2.7+4.54
        { line: 1, at: 8.5, token: 'pvPortMalloc', label: 'the task control block' }, // "task control block" 2.7+5.80
      ] as LineMark[],
    },
    {
      at: 10.34, // "It fills the stack"
      file: 'components/freertos/FreeRTOS-Kernel/tasks.c · prvInitialiseNewTask',
      title: 'prvInitialiseNewTask',
      code: ['memset( pxNewTCB->pxStack, ( int ) tskSTACK_FILL_BYTE, ulStackDepth );   // 0xa5', '…', 'pxNewTCB->pcTaskName[ x ] = pcName[ x ];', 'pxNewTCB->pcTaskName[ configMAX_TASK_NAME_LEN - 1 ] = \'\\0\';', '…', 'pxNewTCB->uxPriority = uxPriority;'],
      marks: [
        { line: 0, at: 11.5, token: 'tskSTACK_FILL_BYTE', label: '0xa5 everywhere', strong: true }, // "A5 bytes" 10.34+1.16
        { line: 3, at: 15.86, token: "pcTaskName[ configMAX_TASK_NAME_LEN - 1 ]", label: 'cut at 15' }, // "copies the name" 10.34+5.52
        { line: 5, at: 17.22, token: 'uxPriority', label: '5' }, // "stores the priority" 10.34+6.88
      ] as LineMark[],
    },
    {
      at: 18.78, // "It builds a first frame"
      file: 'components/freertos/FreeRTOS-Kernel/portable/xtensa/port.c · pxPortInitialiseStack',
      title: 'pxPortInitialiseStack',
      code: ['XtExcFrame *frame = ( XtExcFrame * ) uxStackPointer;', 'frame->pc = ( UBaseType_t ) vPortTaskWrapper;   // task entry point is the wrapper', 'frame->a6 = ( UBaseType_t ) pxCode;             // your function', 'frame->a7 = ( UBaseType_t ) pvParameters;       // your parameter'],
      marks: [
        { line: 1, at: 22.38, token: 'vPortTaskWrapper', label: 'starts here', strong: true }, // "a wrapper" 18.78+3.60
        { line: 2, at: 22.94, token: 'pxCode', label: 'blink_task' }, // "calls your function" 18.78+4.16
      ] as LineMark[],
    },
    {
      at: 26.24, // "Finally, it puts the task on the ready list"
      file: 'components/freertos/FreeRTOS-Kernel/tasks.c · prvAddNewTaskToReadyList',
      title: 'prvAddNewTaskToReadyList',
      code: ['prvAddTaskToReadyList( pxNewTCB );', '…', 'if( taskIS_YIELD_REQUIRED( pxNewTCB, pdTRUE ) == pdTRUE )', '{', '    taskYIELD_IF_USING_PREEMPTION();', '}'],
      marks: [
        { line: 0, at: 28.16, token: 'prvAddTaskToReadyList', label: 'ready' }, // "ready list" 26.24+1.92
        { line: 2, at: 29.44, token: 'taskIS_YIELD_REQUIRED', label: 'outranks the running task?' }, // "outranks" 26.24+3.20
        { line: 4, at: 31.72, token: 'taskYIELD_IF_USING_PREEMPTION', label: 'switch to it', strong: true }, // "switches to it" 26.24+5.48
      ] as LineMark[],
    },
  ],
};

// ── 9. payoff ──────────────────────────────────────────────────────────────

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
  { id: 'f2', scene: 'fn', at: 5.88, text: 'This one sets up its pin, then loops forever: LED on, wait, LED off, wait. The same calls as the blink video.' },
  { id: 'f3', scene: 'fn', at: 13.8, text: 'A task function must never return. If it does, ESP-IDF logs an error, and aborts.', say: 'A task function must never return. If it does, E S P I D F logs an error, and aborts.' },
  { id: 'f4', scene: 'fn', at: 21.64, text: 'To end a task on purpose, it deletes itself: vTaskDelete, with NULL.', say: 'To end a task on purpose, it deletes itself: V task delete, with null.' },

  { id: 'c1', scene: 'create', at: 0.5, text: 'xTaskCreate turns that function into a task. It takes six arguments.', say: 'X task create turns that function into a task. It takes six arguments.' },
  { id: 'c2', scene: 'create', at: 5.78, text: "First, the function itself. Pass its name without brackets: you're handing it over, not calling it." },
  {
    id: 'c3',
    scene: 'create',
    at: 13.06,
    text: "Next, a name, used only for debugging. FreeRTOS keeps fifteen characters, so a longer name is cut short: Espressif's own GPIO example loses its last two letters.",
    say: "Next, a name, used only for debugging. free R-T-O-S keeps fifteen characters, so a longer name is cut short: Espressif's own GPIO example loses its last two letters.",
  },
  {
    id: 'c4',
    scene: 'create',
    at: 26.32,
    text: "Then the stack size: two thousand and forty-eight. In ESP-IDF, that's bytes. In vanilla FreeRTOS, it would be words: four times as much.",
    say: "Then the stack size: two thousand and forty-eight. In E S P I D F, that's bytes. In vanilla free R-T-O-S, it would be words: four times as much.",
  },
  {
    id: 'c5',
    scene: 'create',
    at: 37.74,
    text: "The stack holds the task's local variables, its function calls, and its registers while it's switched out. It comes from the heap, when the task is created.",
  },
  {
    id: 'c6',
    scene: 'create',
    at: 46.56,
    text: "For scale: app_main's task has four thousand and ninety-six bytes, and the idle task fifteen hundred and thirty-six.",
    say: "For scale: app main's task has four thousand and ninety-six bytes, and the idle task fifteen hundred and thirty-six.",
  },
  {
    id: 'c7',
    scene: 'create',
    at: 53.42,
    text: "Too small, and a check at the next task switch catches the overflow. The chip prints the task's name, and restarts.",
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
    text: 'Then the priority. Zero belongs to the idle tasks, app_main runs at one, and the top is twenty-four.',
    say: 'Then the priority. Zero belongs to the idle tasks, app main runs at one, and the top is twenty-four.',
  },
  {
    id: 'q5',
    scene: 'params',
    at: 28.46,
    text: 'Five outranks app_main, so the new task starts running straight away. app_main carries on once it waits.',
    say: 'Five outranks app main, so the new task starts running straight away. App main carries on once it waits.',
  },
  { id: 'q6', scene: 'params', at: 34.4, text: "Last, the handle: a way to refer to the task later. Pass NULL if you don't need it.", say: "Last, the handle: a way to refer to the task later. Pass null if you don't need it." },
  {
    id: 'q7',
    scene: 'params',
    at: 40.36,
    text: "It returns pdPASS, which is one. That's not an esp_err_t, so don't wrap it in ESP_ERROR_CHECK: success would abort.",
    say: "It returns P D pass, which is one. That's not an E S P error code, so don't wrap it in E S P error check: success would abort.",
  },
  { id: 'q8', scene: 'params', at: 49.5, text: "If the heap can't fit the stack, it returns minus one instead." },

  {
    id: 'd1',
    scene: 'demo',
    at: 0.6,
    text: 'Flash it. app_main creates both tasks, and returns. The log says so, and the main task is deleted.',
    say: 'Flash it. App main creates both tasks, and returns. The log says so, and the main task is deleted.',
  },
  { id: 'd2', scene: 'demo', at: 8.58, text: "The LEDs don't notice. Each task switches its own LED at its own pace: two hundred, and five hundred milliseconds." },
  { id: 'd3', scene: 'demo', at: 17.08, text: 'Both tasks run the same function. But each has its own stack, so each has its own b, pointing at its own settings.', say: 'Both tasks run the same function. But each has its own stack, so each has its own B, pointing at its own settings.' },

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

  { id: 'i1', scene: 'idf', at: 0.5, text: 'Follow xTaskCreate down.', say: 'Follow X task create down.' },
  {
    id: 'i2',
    scene: 'idf',
    at: 2.7,
    text: 'It calls xTaskCreatePinnedToCore, with no affinity. That takes the stack, then the task control block, from the heap.',
    say: 'It calls X task create pinned to core, with no affinity. That takes the stack, then the task control block, from the heap.',
  },
  { id: 'i3', scene: 'idf', at: 10.34, text: 'It fills the stack with A5 bytes, the pattern the overflow check looks for. Then it copies the name, and stores the priority.', say: 'It fills the stack with A-five bytes, the pattern the overflow check looks for. Then it copies the name, and stores the priority.' },
  { id: 'i4', scene: 'idf', at: 18.78, text: 'It builds a first frame on the stack, so the task starts in a wrapper that calls your function, and aborts if it returns.' },
  { id: 'i5', scene: 'idf', at: 26.24, text: "Finally, it puts the task on the ready list. If it outranks what's running, the scheduler switches to it." },

  { id: 'x1', scene: 'payoff', at: 0.6, text: "Give every job its own loop. That's a task." },
];
