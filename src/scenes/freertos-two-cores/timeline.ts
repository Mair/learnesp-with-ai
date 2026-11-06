/**
 * FreeRTOS two cores — the timeline. Single source of truth for picture AND sound.
 * PURE ESP-IDF: xTaskCreatePinnedToCore, tskNO_AFFINITY, esp_cpu_get_core_id,
 * pcTaskGetName; GPIO output only (the scheduler video's program, no button).
 *
 *   problem (workers take both cores → the LED stumbles) → answer (PIN) → who lives on
 *     core 0 → xTaskCreatePinnedToCore → which core am I on → demo (LEDs on the beat)
 *     → the price (workers share core 1) → payoff
 *
 * Times are SCENE-RELATIVE. `node scripts/vo-plan.ts freertos-two-cores` voices every
 * line and writes VO_AT / VO_WORDS / SCENE_DUR below; cues are `w(line, word)`.
 * Import-free (type-only imports are erased): Node runs it as-is.
 * Every claim on screen or in the VO is sourced in ./FACTS.md.
 */
import type { Caption } from '../../components/pwm';

export const FPS = 30;
export const SECTION = '2-freertos';

// ── generated: VO plan (node scripts/vo-plan.ts freertos-two-cores) — do not edit by hand ──
export const VO_AT: Record<string, number> = {"p1":0.5,"p2":4.8,"p3":9.04,"p4":11.42,"p5":15.88,"p6":19.96,"p7":24.12,"a1":0.5,"a2":4.2,"a3":7.1,"a4":10.96,"h1":0.5,"h2":2.5,"h3":4.62,"h4":11.56,"e0":0.5,"e1":2.82,"e2":6.9,"e3":12.12,"e4":14.6,"e5":17.54,"e6":20.1,"e7":25.62,"e8":28.86,"e9":32.86,"c1":0.5,"c2":2.84,"c3":8.9,"c4":12.96,"c5":16.36,"c6":21.76,"c7":26.7,"c8":29.36,"d1":0.5,"d2":1.76,"d3":5.58,"d4":10.46,"t1":0.5,"t2":1.98,"t3":7.62,"t4":12.68,"t5":15.76,"t6":19.82,"t7":22.26,"t8":28.3,"z1":0.5};
export const SCENE_DUR: Record<string, number> = {"problem":28.46,"answer":14.32,"home":16.56,"pin":39.04,"which":35.7,"demo":16.88,"price":34.06,"payoff":13.22};
export const VO_WORDS: Record<string, [string, number][]> = {
  p1: [["In",0],["the",0.22],["scheduler",0.36],["video,",0.7],["two",1.66],["busy",1.82],["workers",2.16],["had",2.54],["priority",2.86],["six.",3.24]],
  p2: [["The",0],["LEDs",0.24],["had",0.66],["priority",1.08],["5,",1.48],["so",2.32],["the",2.54],["workers",2.66],["went",2.98],["first.",3.22]],
  p3: [["and",0],["the",0.22],["workers",0.3],["could",0.62],["use",0.84],["both",1.18],["cores.",1.4]],
  p4: [["So",0],["sometimes",0.28],["the",0.68],["LED",0.86],["found",1.16],["no",1.86],["free",2.18],["core",2.5],["and",2.84],["it",3.34],["was",3.44],["late.",3.54]],
  p5: [["That's",0],["because",0.34],["xTaskCreate",0.54],["lets",1.44],["a",1.66],["task",1.86],["run",2.14],["on",2.52],["either",2.92],["core.",3.14]],
  p6: [["FreeRTOS",0.74],["picks",1.1],["the",1.46],["core.",1.64],["It",2.4],["can",2.46],["pick",2.56],["a",2.68],["different",2.78],["one",2.94],["next",3.1],["time.",3.28]],
  p7: [["What",0],["if",0.26],["the",0.34],["workers",0.4],["could",0.84],["only",1.16],["use",1.42],["Core",1.7],["One?",1.9]],
  a1: [["then",0],["Core",0.34],["Zero",0.56],["would",0.94],["always",1.2],["be",1.54],["free",1.76],["for",2.2],["the",2.68],["LEDs.",2.8]],
  a2: [["You",0],["can",0.22],["do",0.32],["that.",0.46],["You",1.22],["pin",1.28],["a",1.4],["task",1.52],["to",1.78],["a",2],["core.",2.08]],
  a3: [["A",0],["task",0.26],["you",0.48],["pin",0.64],["only",0.88],["runs",1.14],["on",1.5],["that",1.7],["core.",1.86],["It",2.62],["never",2.72],["moves.",2.9]],
  a4: [["That's",0],["called",0.32],["pinning.",0.5]],
  h1: [["Which",0],["core",0.26],["should",0.48],["the",0.68],["workers",0.78],["use?",1.08]],
  h2: [["At",0],["main",0.28],["runs",0.46],["on",0.76],["core",0.94],["zero",1.2]],
  h3: [["So",0],["do",0.34],["ESP",0.68],["-IDF's",1.4],["own",2.62],["tasks,",2.7],["like",3.68],["Wi",3.82],["-Fi",4.1],["and",4.42],["Bluetooth,",4.68],["when",5.56],["you",5.78],["use",5.92],["them.",6.12]],
  h4: [["So",0],["Core",0.3],["One",0.54],["is",0.84],["a",1.08],["good",1.22],["home",1.36],["for",1.7],["your",1.94],["own",2.08],["heavy",2.34],["work.",2.58]],
  e0: [["Here's",0],["App",0.4],["Main",0.54],["from",0.74],["the",0.94],["scheduler",1.08],["video.",1.42]],
  e1: [["Change",0],["the",0.38],["two",0.54],["workers",0.76],["to",1.12],["xTAS",1.38],["create",2.1],["pin",2.48],["to",2.9],["core.",3.2]],
  e2: [["It",0],["takes",0.22],["the",0.38],["same",0.56],["six",0.86],["arguments",1.16],["as",1.56],["xTaskCreate",2.12],["in",3.3],["the",3.9],["same",4.08],["order.",4.28]],
  e3: [["The",0],["new",0.22],["one",0.38],["is",0.56],["last,",0.7],["the",1.56],["core.",1.64]],
  e4: [["Zero",0],["pins",0.44],["the",0.78],["task",1],["to",1.4],["core",1.82],["zero.",2.08]],
  e5: [["One",0],["pins",0.36],["the",0.66],["task",0.86],["to",1.18],["Core",1.42],["One.",1.66]],
  e6: [["TSK",0],["no",0.72],["affinity",1.06],["means",1.48],["either",2.22],["core.",2.64],["That's",3.52],["what",3.7],["xTAS",3.78],["create",4.22],["does",4.5]],
  e7: [["Any",0],["other",0.3],["number,",0.48],["like",1.16],["2,",1.28],["is",1.96],["a",2.24],["mistake.",2.34]],
  e8: [["The",0],["program",0.24],["stops",0.56],["with",0.98],["an",1.62],["error",1.76],["that",2.02],["starts",2.2],["with",2.52],["assert",2.74],["failed.",3.06]],
  e9: [["Like",0],["xTaskCreate,",0.34],["it",1.78],["returns",1.9],["pdPass",2.22],["when",3.02],["a",3.3],["task",3.44],["is",3.7],["made.",3.9]],
  c1: [["How",0],["can",0.22],["you",0.32],["tell",0.4],["which",0.54],["core",0.72],["task",0.94],["is",1.32],["on?",1.52]],
  c2: [["Ask",0],["it.",0.36],["ESPCP",1.28],["you",1.86],["get",2.14],["core.",2.34],["ID",3.22],["returns",3.36],["the",3.86],["core",4.06],["that",4.34],["is",4.64],["running",4.76],["this",4.96],["line.",5.16]],
  c3: [["on",0],["the",0.24],["ESP32.",0.36],["That's",2.22],["zero",2.46],["or",2.82],["one.",3.18]],
  c4: [["It",0],["comes",0.2],["from",0.4],["ESP",0.66],["CPU",1.24],["dot",2.14],["h",2.52]],
  c5: [["PC",0],["task",0.54],["get",1.02],["name",1.34],["with",1.64],["null",2.16],["gives",2.54],["the",3.06],["name",3.26],["of",3.42],["the",3.58],["task",3.68],["that",4.06],["calls",4.24],["it",4.5]],
  c6: [["Each",0],["worker",0.3],["now",0.64],["prints",1.02],["its",1.36],["name",1.58],["and",1.88],["its",2.3],["core",2.44],["every",2.8],["time",3.56],["around",3.82],["the",4.04],["loop.",4.14]],
  c7: [["With",0],["pinning,",0.28],["they",0.94],["always",1.04],["say",1.32],["Core",1.6],["One.",1.8]],
  c8: [["Without",0],["pinning,",0.44],["the",1.14],["same",1.28],["line",1.54],["could",1.86],["say",2.06],["Core",2.4],["0",2.66],["or",3],["Core",3.6],["1.",3.82]],
  d1: [["Flash",0],["it.",0.44]],
  d2: [["The",0],["workers",0.22],["are",0.5],["on",0.68],["core",0.84],["1.",1.06],["They",1.68],["still",1.88],["have",2.06],["priority",2.34],["6.",2.74]],
  d3: [["But",0],["Core",0.28],["Zero",0.48],["is",0.88],["always",1.26],["free,",1.64],["so",2.54],["both",2.82],["LEDs",3.08],["keep",3.46],["their",3.9],["beat.",4.08]],
  d4: [["Pinning",0],["fixed",0.42],["the",0.8],["stumble",1.02],["without",1.42],["changing",2.16],["a",2.58],["single",2.8],["priority.",3]],
  t1: [["But",0],["look",0.22],["at",0.36],["Core",0.48],["One.",0.64]],
  t2: [["Both",0],["workers",0.3],["are",0.62],["on",0.8],["it",0.98],["with",1.14],["the",1.5],["same",1.6],["priority,",1.9],["so",2.62],["they",3.14],["take",3.28],["turns",3.5],["a",4.02],["tick",4.42],["at",4.6],["a",4.74],["time.",4.78]],
  t3: [["Each",0],["worker",0.28],["now",0.54],["gets",0.96],["about",1.48],["half",1.72],["as",2.08],["much",2.78],["CPU",3.22],["time",3.54],["as",3.98],["before.",4.14]],
  t4: [["and",0],["Core",0.28],["Zero",0.54],["sits",1.18],["almost",1.76],["empty.",2.08]],
  t5: [["A",0],["task",0.24],["you",0.52],["pin",0.68],["never",1.02],["moves,",1.3],["not",2.22],["even",2.44],["to",2.58],["a",2.7],["free",2.86],["core.",3.14]],
  t6: [["Only",0],["pin",0.32],["a",0.46],["task",0.6],["when",0.98],["you",1.28],["have",1.38],["a",1.5],["reason.",1.6]],
  t7: [["Here,",0],["the",0.72],["better",0.84],["fix",1.02],["was",1.3],["the",1.72],["one",1.88],["from",2.1],["the",2.28],["scheduler",2.4],["video,",2.72],["priority",3.82],["4",3.9],["and",4.44],["no",4.9],["pinning.",5.12]],
  t8: [["Both",0],["LEDs",0.38],["keep",0.8],["their",1.2],["beat,",1.42],["and",2.1],["the",2.16],["workers",2.24],["get",2.52],["both",2.78],["cores.",3.02]],
  z1: [["Pin",0],["a",0.26],["task",0.4],["when",0.72],["you",0.96],["have",1.04],["a",1.16],["reason.",1.26],["Otherwise,",2.1],["let",2.84],["free",3.04],["RTOS",3.52],["choose.",4.46],["That's",5.56],["how",5.72],["you",5.82],["use",5.96],["both",6.2],["cores.",6.4]],
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

export const TAIL: Record<string, number> = { problem: 2.2, answer: 2.4, home: 2.0, pin: 2.0, which: 2.2, demo: 3.0, price: 2.4, payoff: 6.0 };
const dur = (id: string, fallback: number) => SCENE_DUR[id] ?? fallback;
export const SCENES = [
  { id: 'problem', dur: dur('problem', 30) },
  { id: 'answer', dur: dur('answer', 15) },
  { id: 'home', dur: dur('home', 15) },
  { id: 'pin', dur: dur('pin', 45) },
  { id: 'which', dur: dur('which', 35) },
  { id: 'demo', dur: dur('demo', 18) },
  { id: 'price', dur: dur('price', 40) },
  { id: 'payoff', dur: dur('payoff', 10) },
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
export const CORES_FRAMES = Math.round(SECONDS * FPS);

// ── voiceover ──────────────────────────────────────────────────────────────

export type VoLine = { id: string; scene: SceneId; at: number; text: string; say?: string; pause?: number };
export const VOICE = 'en-US-AndrewMultilingualNeural';
const L = (id: string, scene: SceneId, text: string, say?: string, pause?: number): VoLine => ({ id, scene, at: at(id), text, say, pause });

const XTC = 'X task create';
const PINNED = 'X task create pinned to core';

export const VO: VoLine[] = [
  // 1 · problem
  L('p1', 'problem', 'In the scheduler video, two busy workers had priority six.'),
  L('p2', 'problem', 'The LEDs had priority five, so the workers went first.'),
  L('p3', 'problem', 'And the workers could use both cores.'),
  L('p4', 'problem', 'So sometimes the LED found no free core, and it was late.'),
  L('p5', 'problem', "That's because xTaskCreate lets a task run on either core.", `That's because ${XTC} lets a task run on either core.`),
  L('p6', 'problem', 'FreeRTOS picks the core. It can pick a different one next time.', 'Free R-TOS picks the core. It can pick a different one next time.'),
  L('p7', 'problem', 'What if the workers could only use core 1?', 'What if the workers could only use core one?'),
  // 2 · answer
  L('a1', 'answer', 'Then core 0 would always be free for the LEDs.', 'Then core zero would always be free for the LEDs.'),
  L('a2', 'answer', 'You can do that. You pin a task to a core.'),
  L('a3', 'answer', 'A task you pin only runs on that core. It never moves.'),
  L('a4', 'answer', "That's called pinning."),
  // 3 · who lives on core 0
  L('h1', 'home', 'Which core should the workers use?'),
  L('h2', 'home', 'app_main runs on core 0.', 'App main runs on core zero.'),
  L('h3', 'home', "So do ESP-IDF's own tasks, like Wi-Fi and Bluetooth, when you use them.", "So do E S P I D F's own tasks, like Wi-Fi and Bluetooth, when you use them."),
  L('h4', 'home', 'So core 1 is a good home for your own heavy work.', 'So core one is a good home for your own heavy work.'),
  // 4 · xTaskCreatePinnedToCore
  L('e0', 'pin', "Here's app_main from the scheduler video.", "Here's app main from the scheduler video."),
  L('e1', 'pin', 'Change the two workers to xTaskCreatePinnedToCore.', `Change the two workers to ${PINNED}.`),
  L('e2', 'pin', 'It takes the same six arguments as xTaskCreate, in the same order.', `It takes the same six arguments as ${XTC}, in the same order.`),
  L('e3', 'pin', 'The new one is last: the core.'),
  L('e4', 'pin', 'Zero pins the task to core 0.', 'Zero pins the task to core zero.'),
  L('e5', 'pin', 'One pins the task to core 1.', 'One pins the task to core one.'),
  L('e6', 'pin', "tskNO_AFFINITY means either core. That's what xTaskCreate does.", `T S K no affinity means either core. That's what ${XTC} does.`),
  L('e7', 'pin', 'Any other number, like two, is a mistake.'),
  L('e8', 'pin', 'The program stops, with an error that starts with assert failed.'),
  L('e9', 'pin', 'Like xTaskCreate, it returns pdPASS when the task is made.', `Like ${XTC}, it returns P D pass when the task is made.`),
  // 5 · which core am I on?
  L('c1', 'which', 'How can you tell which core a task is on?'),
  L('c2', 'which', 'Ask it. esp_cpu_get_core_id returns the core that is running this line.', 'Ask it. E S P C P U get core I D returns the core that is running this line.'),
  L('c3', 'which', "On the ESP32, that's zero or one.", "On the E S P thirty-two, that's zero or one."),
  L('c4', 'which', 'It comes from esp_cpu.h.', 'It comes from E S P C P U dot H.'),
  L('c5', 'which', 'pcTaskGetName, with NULL, gives the name of the task that calls it.', 'P C task get name, with null, gives the name of the task that calls it.'),
  L('c6', 'which', 'Each worker now prints its name and its core, every time round the loop.'),
  L('c7', 'which', 'With pinning, they always say core 1.', 'With pinning, they always say core one.'),
  L('c8', 'which', 'Without pinning, the same line could say core 0 or core 1.', 'Without pinning, the same line could say core zero or core one.'),
  // 6 · demo
  L('d1', 'demo', 'Flash it.'),
  L('d2', 'demo', 'The workers are on core 1. They still have priority six.', 'The workers are on core one. They still have priority six.'),
  L('d3', 'demo', 'But core 0 is always free, so both LEDs keep their beat.', 'But core zero is always free, so both LEDs keep their beat.'),
  L('d4', 'demo', 'Pinning fixed the stumble, without changing a single priority.'),
  // 7 · the price
  L('t1', 'price', 'But look at core 1.', 'But look at core one.'),
  L('t2', 'price', 'Both workers are on it, with the same priority. So they take turns, a tick at a time.'),
  L('t3', 'price', 'Each worker now gets about half as much CPU time as before.'),
  L('t4', 'price', 'And core 0 sits almost empty.', 'And core zero sits almost empty.'),
  L('t5', 'price', 'A task you pin never moves. Not even to a free core.'),
  L('t6', 'price', 'Only pin a task when you have a reason.'),
  L('t7', 'price', 'Here, the better fix was the one from the scheduler video: priority four, and no pinning.'),
  L('t8', 'price', 'Both LEDs keep their beat, and the workers get both cores.'),
  // 8 · payoff
  L('z1', 'payoff', "Pin a task when you have a reason. Otherwise, let FreeRTOS choose. That's how you use both cores.", "Pin a task when you have a reason. Otherwise, let Free R-TOS choose. That's how you use both cores."),
];

// ── shared numbers and code (FACTS.md) ────────────────────────────────────

export const FAST = { pin: 2, ms: 200, name: 'blink_fast' };
export const SLOW = { pin: 19, ms: 500, name: 'blink_slow' };

const blinkLines = [
  '    xTaskCreate(blink_task, "blink_fast", 2048, &fast, 5, NULL);',
  '    xTaskCreate(blink_task, "blink_slow", 2048, &slow, 5, NULL);',
];
/** app_main with the workers made by xTaskCreate at priority `p` */
export const mainFree = (p: number) => [
  'void app_main(void)',
  '{',
  ...blinkLines,
  `    xTaskCreate(work_task, "work_a", 2048, NULL, ${p}, NULL);`,
  `    xTaskCreate(work_task, "work_b", 2048, NULL, ${p}, NULL);`,
  '}',
];
/** app_main with the workers pinned to `core` */
export const mainPinned = (core: string | number = 1) => [
  'void app_main(void)',
  '{',
  ...blinkLines,
  `    xTaskCreatePinnedToCore(work_task, "work_a", 2048, NULL, 6, NULL, ${core});`,
  `    xTaskCreatePinnedToCore(work_task, "work_b", 2048, NULL, 6, NULL, ${core});`,
  '}',
];
export const WORKER_LINES = [4, 5];
export const PIN_CALL = 'xTaskCreatePinnedToCore(work_task, "work_a", 2048, NULL, 6, NULL, 1);';
export const SIX_ARGS = 'work_task, "work_a", 2048, NULL, 6, NULL';

export const LOG_LINE = '        ESP_LOGI(TAG, "%s on core %d", pcTaskGetName(NULL), esp_cpu_get_core_id());';
/** the worker; `log` adds TAG and the log line, `include` the #include */
export const workCode = (log: boolean, include = log) => [
  ...(include ? ['#include "esp_cpu.h"', ''] : []),
  ...(log ? ['static const char *TAG = "cores";', ''] : []),
  'static void work_task(void *arg)',
  '{',
  '    while (1) {',
  ...(log ? [LOG_LINE] : []),
  '        int64_t end = esp_timer_get_time() + 300 * 1000;',
  '        while (esp_timer_get_time() < end) {',
  '            // busy: keep the CPU until then',
  '        }',
  '        vTaskDelay(pdMS_TO_TICKS(100));   // rest',
  '    }',
  '}',
];

/** the three runs of the model (sim.ts): seconds of model time */
export const RUN_MS = 30000;

// ── 1. problem ─────────────────────────────────────────────────────────────

export const PROBLEM = {
  workers: w('p1', 'workers'),
  six: w('p1', 'priority'),
  leds: w('p2', 'LEDs'),
  five: w('p2', 'priority'),
  first: w('p2', 'first'),
  both: w('p3', 'both'),
  free: w('p4', 'free'),
  late: w('p4', 'late'),
  xtc: at('p5'),
  either: w('p5', 'either'),
  picks: w('p6', 'picks'),
  different: w('p6', 'different'),
  what: at('p7'),
  only: w('p7', 'only'),
  captions: [
    { at: at('p1'), text: 'the scheduler video: two busy workers at priority 6' },
    { at: at('p2'), text: 'LEDs at 5 → the workers go first' },
    { at: at('p3'), text: 'the workers can use both cores → sometimes no free core → the LED is late' },
    { at: at('p5'), text: 'xTaskCreate → either core · FreeRTOS picks, and can pick another next time' },
    { at: at('p7'), text: 'what if the workers could only use core 1?' },
  ] as Caption[],
};

// ── 2. answer ──────────────────────────────────────────────────────────────

export const ANSWER = {
  free: w('a1', 'free'),
  pin: w('a2', 'pin'),
  only: w('a3', 'only'),
  never: w('a3', 'never'),
  word: w('a4', 'pinning'),
  captions: [
    { at: at('a1'), text: 'workers on core 1 only → core 0 always free for the LEDs' },
    { at: at('a2'), text: 'pin a task to a core → it only runs there, it never moves' },
  ] as Caption[],
};

// ── 3. who lives on core 0 ─────────────────────────────────────────────────

export const HOME = {
  ask: at('h1'),
  main: w('h2', 'core'),
  idf: w('h3', 'own'),
  wifi: w('h3', 'Wi'),
  bt: w('h3', 'Bluetooth'),
  use: w('h3', 'use'),
  heavy: w('h4', 'heavy'),
  captions: [
    { at: at('h2'), text: 'core 0: app_main · ESP-IDF\'s own tasks (Wi-Fi, Bluetooth, when you use them)' },
    { at: at('h4'), text: 'core 1: a good home for your own heavy work' },
  ] as Caption[],
};

// ── 4. xTaskCreatePinnedToCore ─────────────────────────────────────────────

export const PIN = {
  intro: { show: at('e0'), change: w('e1', 'Change'), out: at('e2') },
  run: at('e2'),
  args: [w('e2', 'same'), w('e3', 'core')],
  views: { same: at('e2'), core: at('e3'), wrong: at('e7'), ret: at('e9') },
  zero: at('e4'),
  one: at('e5'),
  either: at('e6'),
  xtc: w('e6', 'what'),
  two: w('e7', 'like'),
  mistake: w('e7', 'mistake'),
  stops: w('e8', 'stops'),
  assert: w('e8', 'assert'),
  pdpass: w('e9', 'returns'),
  made: w('e9', 'made'),
  captions: [
    { at: at('e0'), text: 'app_main from the scheduler video' },
    { at: at('e1'), text: 'the workers: xTaskCreate → xTaskCreatePinnedToCore' },
    { at: at('e2'), text: 'the same six arguments as xTaskCreate, in the same order' },
    { at: at('e3'), text: 'new, last: the core' },
    { at: at('e4'), text: '0 → core 0 · 1 → core 1 · tskNO_AFFINITY → either core (= xTaskCreate)' },
    { at: at('e7'), text: 'any other number → assert failed → the program stops' },
    { at: at('e9'), text: 'returns pdPASS when the task is made, like xTaskCreate' },
  ] as Caption[],
};

// ── 5. which core am I on? ─────────────────────────────────────────────────

export const WHICH = {
  views: { ask: at('c2'), name: at('c5'), pinned: at('c6'), free: at('c8') },
  ask: at('c1'),
  insert: w('c2', 'Ask'),
  running: w('c2', 'running'),
  zero: w('c3', 'zero'),
  one: w('c3', 'one'),
  include: at('c4'),
  name: at('c5'),
  calls: w('c5', 'calls'),
  prints: w('c6', 'prints'),
  always: w('c7', 'always'),
  free: at('c8'),
  either: w('c8', 'core'),
  captions: [
    { at: at('c1'), text: 'which core is a task on?' },
    { at: at('c2'), text: 'esp_cpu_get_core_id() → the core running this line: 0 or 1' },
    { at: at('c4'), text: '#include "esp_cpu.h"' },
    { at: at('c5'), text: 'pcTaskGetName(NULL) → the name of the task that calls it' },
    { at: at('c7'), text: 'pinned → always core 1' },
    { at: at('c8'), text: 'not pinned → core 0 or core 1' },
  ] as Caption[],
};

// ── 6. demo ────────────────────────────────────────────────────────────────

export const DEMO = {
  flash: at('d1'),
  core1: w('d2', 'core'),
  six: w('d2', 'still'),
  free: w('d3', 'free'),
  beat: w('d3', 'beat'),
  fixed: w('d4', 'fixed'),
  captions: [
    { at: at('d2'), text: 'workers on core 1 · still priority 6' },
    { at: at('d3'), text: 'core 0 always free → both LEDs keep their beat' },
    { at: at('d4'), text: 'the stumble is fixed — no priority changed' },
  ] as Caption[],
};

// ── 7. the price ───────────────────────────────────────────────────────────

export const PRICE = {
  views: { zoom: at('t1'), half: at('t3'), empty: at('t4'), never: at('t5'), fix: at('t7') },
  look: w('t1', 'look'),
  turns: w('t2', 'turns'),
  tick: w('t2', 'tick'),
  half: w('t3', 'half'),
  empty: w('t4', 'empty'),
  moves: w('t5', 'moves'),
  free: w('t5', 'free'),
  reason: w('t6', 'reason'),
  better: w('t7', 'better'),
  four: w('t7', 'priority'),
  noPin: w('t7', 'no'),
  beat: w('t8', 'beat'),
  both: w('t8', 'both'),
  captions: [
    { at: at('t1'), text: 'core 1: both workers, same priority → turns, a tick (10 ms) at a time' },
    { at: at('t3'), text: 'each worker: about half as much CPU time' },
    { at: at('t4'), text: 'core 0: almost empty' },
    { at: at('t5'), text: 'a pinned task never moves — not even to a free core' },
    { at: at('t6'), text: 'pin only when you have a reason' },
    { at: at('t7'), text: 'the better fix here: priority 4, not pinned (the scheduler video)' },
  ] as Caption[],
};

// ── 8. payoff ──────────────────────────────────────────────────────────────

export const PAYOFF = {
  word: w('z1', 'both'),
  recap: [
    { at: w('z1', 'both', 0, 1.2), k: 'xTaskCreate(…)', v: 'either core · FreeRTOS picks' },
    { at: w('z1', 'both', 0, 1.55), k: 'xTaskCreatePinnedToCore(…, 1)', v: 'only core 1 · never moves' },
    { at: w('z1', 'both', 0, 1.9), k: 'tskNO_AFFINITY', v: 'either core' },
    { at: w('z1', 'both', 0, 2.25), k: 'esp_cpu_get_core_id()', v: 'the core running this line' },
    { at: w('z1', 'both', 0, 2.6), k: 'next', v: 'stacks & watchdog' },
  ],
};
