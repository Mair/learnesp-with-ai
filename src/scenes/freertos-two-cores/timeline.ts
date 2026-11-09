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
export const VO_AT: Record<string, number> = {"p1":0.5,"p2":7.16,"p3":12.36,"p4":14.64,"p5":19.3,"p6":23.28,"p7":28,"a1":0.5,"a2":4.2,"a3":7.12,"a4":11.64,"h1":0.5,"h2":2.8,"h3":4.98,"h4":12.08,"e0":0.5,"e1":2.82,"e2":6.9,"e3":11.82,"e4":14.7,"e5":17.54,"e6":20.4,"e7":26,"e8":29.04,"e9":33.14,"c1":0.5,"c2":3.04,"c3":8.76,"c4":12.62,"c5":16.02,"c6":21.82,"c7":26.66,"c8":29.32,"d1":0.5,"d2":2.18,"d3":6.12,"d4":11,"t1":0.5,"t2":2.08,"t3":7.88,"t4":12.84,"t5":16.08,"t6":20.34,"t7":23.32,"t8":29.26,"z1":0.5};
export const SCENE_DUR: Record<string, number> = {"problem":32.48,"answer":15,"home":16.6,"pin":39.4,"which":35.66,"demo":17.42,"price":35.6,"payoff":14.22};
export const VO_WORDS: Record<string, [string, number][]> = {
  p1: [["Let's",0],["say",0.3],["you",0.42],["want",0.54],["the",0.66],["LEDs",0.8],["from",1.24],["the",1.5],["scheduler",1.64],["video",2],["to",2.28],["keep",2.64],["their",2.84],["beat,",3.08],["while",3.82],["the",3.98],["two",4.12],["busy",4.34],["workers",4.6],["keep",4.94],["priority",5.24],["6.",5.6]],
  p2: [["In",0],["that",0.24],["video,",0.44],["the",1.38],["LEDs",1.46],["had",1.94],["priority",2.36],["5,",2.76],["so",3.56],["the",3.78],["workers",3.9],["went",4.18],["first.",4.4]],
  p3: [["and",0],["the",0.22],["workers",0.3],["could",0.62],["use",0.84],["both",1.18],["cores.",1.4]],
  p4: [["So",0],["sometimes",0.28],["the",0.68],["LED",0.86],["found",1.16],["no",1.86],["free",2.18],["core",2.5],["and",2.84],["it",3.34],["was",3.44],["late.",3.54]],
  p5: [["That's",0],["because",0.34],["xTaskCreate",0.54],["lets",1.44],["a",1.66],["task",1.86],["run",2.14],["on",2.52],["either",2.92],["core.",3.14]],
  p6: [["FreeRTOS",0.62],["picks",1.06],["the",1.38],["core,",1.62],["and",2.46],["it",2.52],["can",2.58],["pick",2.68],["a",2.82],["different",2.96],["one",3.18],["next",3.34],["time.",3.52]],
  p7: [["So",0],["what",0.26],["if",0.34],["the",0.46],["workers",0.54],["could",0.94],["only",1.34],["use",1.58],["Core",1.86],["One?",2.04]],
  a1: [["then",0],["Core",0.34],["Zero",0.56],["would",0.94],["always",1.2],["be",1.54],["free",1.76],["for",2.2],["the",2.68],["LEDs.",2.8]],
  a2: [["And",0],["you",0.22],["can",0.3],["do",0.44],["that.",0.64],["You",1.44],["pin",1.48],["a",1.6],["task",1.74],["to",1.9],["a",2.1],["core.",2.2]],
  a3: [["A",0],["task",0.22],["that",0.54],["you",0.72],["pin",0.84],["only",1.04],["runs",1.34],["on",1.7],["that",1.88],["one",2.04],["core",2.32],["and",2.72],["it",3.22],["never",3.32],["moves.",3.48]],
  a4: [["That's",0],["called",0.32],["pinning.",0.5]],
  h1: [["So",0],["which",0.28],["core",0.46],["should",0.78],["the",1.02],["workers",1.12],["use?",1.4]],
  h2: [["Your",0],["app",0.28],["main",0.46],["runs",0.68],["on",0.98],["Core",1.24],["Zero.",1.48]],
  h3: [["And",0],["so",0.24],["do",0.44],["ESP",0.82],["-IDF's",1.64],["own",2.84],["tasks,",2.9],["like",3.84],["WiFi",3.98],["and",4.36],["Bluetooth,",4.8],["when",5.62],["you",5.98],["use",6.12],["them.",6.3]],
  h4: [["That",0],["makes",0.26],["Core",0.44],["one",0.66],["a",0.82],["good",0.96],["home",1.14],["for",1.44],["your",1.66],["own",1.78],["heavy",2],["work.",2.16]],
  e0: [["Here's",0],["App",0.4],["Main",0.54],["from",0.74],["the",0.94],["scheduler",1.08],["video.",1.42]],
  e1: [["Change",0],["the",0.38],["two",0.54],["workers",0.76],["to",1.12],["xTAS",1.38],["create",2.1],["pin",2.48],["to",2.9],["core.",3.2]],
  e2: [["It",0],["takes",0.22],["the",0.38],["same",0.56],["six",0.9],["arguments",1.24],["as",1.64],["xTaskCreate",2.08],["in",3.2],["the",3.8],["same",3.94],["order.",4.2]],
  e3: [["plus",0],["a",0.28],["new",0.44],["one",0.7],["at",0.96],["the",1.1],["end,",1.22],["the",1.86],["core.",1.94]],
  e4: [["Zero",0],["pins",0.44],["the",0.74],["task",0.96],["to",1.38],["core",1.84],["zero.",2.14]],
  e5: [["and",0],["one",0.28],["pins",0.56],["the",0.98],["task",1.18],["to",1.54],["core",1.76],["one.",1.98]],
  e6: [["TSK",0],["no",0.66],["affinity",0.96],["means",1.36],["either",2.1],["core,",2.54],["which",3.42],["is",3.58],["what",3.66],["xTAS",3.78],["create",4.28],["does",4.54]],
  e7: [["Any",0],["other",0.3],["number,",0.48],["like",1.16],["2,",1.28],["is",1.96],["a",2.24],["mistake.",2.34]],
  e8: [["The",0],["program",0.24],["stops",0.56],["with",0.98],["an",1.62],["error",1.76],["that",2.02],["starts",2.2],["with",2.52],["assert",2.74],["failed.",3.06]],
  e9: [["And",0],["like",0.22],["xTaskCreate,",0.38],["it",1.82],["returns",1.92],["PDPass",2.3],["when",3.22],["a",3.4],["task",3.52],["is",3.8],["made.",3.98]],
  c1: [["So",0],["how",0.28],["can",0.42],["you",0.56],["tell",0.66],["which",0.84],["core",1.04],["task",1.28],["is",1.62],["on?",1.8]],
  c2: [["You",0],["ask",0.22],["it.",0.42],["ESPCP,",1.46],["you",1.98],["get",2.22],["core.",2.4],["ID",3.28],["returns",3.42],["the",3.9],["core",4.1],["that's",4.34],["running",4.62],["this",4.84],["line.",5.04]],
  c3: [["on",0],["the",0.24],["ESP32.",0.36],["That's",2.22],["zero",2.46],["or",2.82],["one.",3.18]],
  c4: [["It",0],["comes",0.2],["from",0.4],["ESP",0.66],["CPU",1.24],["dot",2.14],["h",2.52]],
  c5: [["and",0],["PC",0.28],["task",0.86],["get",1.4],["name",1.84],["with",2.1],["null",2.66],["gives",2.98],["the",3.5],["name",3.7],["of",3.88],["the",4.02],["task",4.12],["that",4.48],["calls",4.68],["it",4.94]],
  c6: [["Each",0],["worker",0.3],["now",0.64],["prints",1.02],["its",1.36],["name",1.58],["and",1.88],["its",2.3],["core",2.44],["every",2.8],["time",3.56],["around",3.82],["the",4.04],["loop.",4.14]],
  c7: [["With",0],["pinning,",0.28],["they",0.94],["always",1.04],["say",1.32],["Core",1.6],["One.",1.8]],
  c8: [["Without",0],["pinning,",0.44],["the",1.14],["same",1.28],["line",1.54],["could",1.86],["say",2.06],["Core",2.4],["0",2.66],["or",3],["Core",3.6],["1.",3.82]],
  d1: [["Now",0],["flash",0.32],["it.",0.64]],
  d2: [["The",0],["workers",0.22],["are",0.48],["on",0.66],["core",0.82],["1,",1.06],["and",1.76],["they",1.94],["still",2.08],["have",2.34],["priority",2.6],["6.",2.98]],
  d3: [["But",0],["Core",0.28],["Zero",0.48],["is",0.88],["always",1.26],["free,",1.64],["so",2.54],["both",2.82],["LEDs",3.08],["keep",3.46],["their",3.9],["beat.",4.08]],
  d4: [["Pinning",0],["fixed",0.42],["the",0.8],["stumble",1.02],["without",1.42],["changing",2.16],["a",2.58],["single",2.8],["priority.",3]],
  t1: [["But",0],["now",0.22],["look",0.38],["at",0.54],["Core",0.7],["One.",0.84]],
  t2: [["Both",0],["workers",0.38],["are",0.7],["on",0.88],["it,",1.04],["with",1.38],["the",1.54],["same",1.68],["priority,",1.96],["so",2.78],["they",2.98],["take",3.1],["turns,",3.3],["sharing",4.08],["it",4.42],["tick",4.62],["by",4.78],["tick.",5.02]],
  t3: [["Each",0],["worker",0.28],["now",0.54],["gets",0.96],["about",1.48],["half",1.72],["as",2.08],["much",2.78],["CPU",3.22],["time",3.54],["as",3.98],["before.",4.14]],
  t4: [["Meanwhile,",0],["Core",1.14],["Zero",1.2],["sits",1.66],["almost",1.92],["empty.",2.18]],
  t5: [["A",0],["task",0.26],["you",0.5],["pin",0.68],["never",1.04],["moves,",1.48],["not",2.54],["even",2.76],["to",2.96],["a",3.12],["free",3.24],["core.",3.46]],
  t6: [["So",0],["only",0.36],["pin",0.64],["a",0.84],["task",0.98],["when",1.34],["you",1.66],["have",1.76],["a",1.86],["reason.",1.94]],
  t7: [["Here,",0],["the",0.72],["better",0.84],["fix",1.02],["was",1.3],["the",1.72],["one",1.88],["from",2.1],["the",2.28],["scheduler",2.4],["video,",2.72],["priority",3.82],["4",3.9],["and",4.44],["no",4.9],["pinning.",5.12]],
  t8: [["Then",0],["both",0.34],["LEDs",0.7],["keep",1.22],["their",1.62],["beat,",1.84],["and",2.68],["the",2.76],["workers",2.84],["get",3.12],["both",3.34],["cores.",3.6]],
  z1: [["So,",0],["only",1.04],["pin",1.2],["a",1.36],["task",1.52],["when",1.82],["you",2.04],["have",2.14],["a",2.26],["reason,",2.38],["and",3.04],["otherwise,",3.18],["let",4.08],["free",4.28],["RTOS",4.7],["choose.",5.36],["That's",6.46],["how",6.64],["you",6.74],["use",6.88],["both",7.14],["cores.",7.36]],
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
  L('p1', 'problem', "Let's say you want the LEDs from the scheduler video to keep their beat, while the two busy workers keep priority six."),
  L('p2', 'problem', 'In that video, the LEDs had priority five, so the workers went first.', undefined, 0.6),
  L('p3', 'problem', 'And the workers could use both cores.', undefined, 0.4),
  L('p4', 'problem', 'So sometimes the LED found no free core, and it was late.', undefined, 0.5),
  L('p5', 'problem', "That's because xTaskCreate lets a task run on either core.", `That's because ${XTC} lets a task run on either core.`, 0.8),
  L('p6', 'problem', 'FreeRTOS picks the core, and it can pick a different one next time.', 'Free R-TOS picks the core, and it can pick a different one next time.', 0.5),
  L('p7', 'problem', 'So what if the workers could only use core 1?', 'So what if the workers could only use core one?', 0.9),
  // 2 · answer
  L('a1', 'answer', 'Then core 0 would always be free for the LEDs.', 'Then core zero would always be free for the LEDs.'),
  L('a2', 'answer', 'And you can do that: you pin a task to a core.', undefined, 0.6),
  L('a3', 'answer', 'A task that you pin only runs on that one core, and it never moves.', undefined, 0.5),
  L('a4', 'answer', "That's called pinning.", undefined, 0.7),
  // 3 · home
  L('h1', 'home', 'So which core should the workers use?'),
  L('h2', 'home', 'Your app_main runs on core 0,', 'Your app main runs on core zero,', 0.6),
  L('h3', 'home', "and so do ESP-IDF's own tasks, like Wi-Fi and Bluetooth, when you use them.", "and so do E S P I D F's own tasks, like Wi-Fi and Bluetooth, when you use them.", 0.4),
  L('h4', 'home', 'That makes core 1 a good home for your own heavy work.', 'That makes core one a good home for your own heavy work.', 0.6),
  // 4 · pin
  L('e0', 'pin', "Here's app_main from the scheduler video.", "Here's app main from the scheduler video."),
  L('e1', 'pin', 'Change the two workers to xTaskCreatePinnedToCore.', `Change the two workers to ${PINNED}.`, 0.6),
  L('e2', 'pin', 'It takes the same six arguments as xTaskCreate, in the same order,', `It takes the same six arguments as ${XTC}, in the same order,`, 0.6),
  L('e3', 'pin', 'plus a new one at the end: the core.', undefined, 0.4),
  L('e4', 'pin', 'Zero pins the task to core 0,', 'Zero pins the task to core zero,', 0.7),
  L('e5', 'pin', 'and one pins the task to core 1.', 'and one pins the task to core one.', 0.4),
  L('e6', 'pin', "tskNO_AFFINITY means either core, which is what xTaskCreate does.", `T S K no affinity means either core, which is what ${XTC} does.`, 0.6),
  L('e7', 'pin', 'Any other number, like two, is a mistake.', undefined, 0.7),
  L('e8', 'pin', 'The program stops, with an error that starts with assert failed.', undefined, 0.4),
  L('e9', 'pin', 'And like xTaskCreate, it returns pdPASS when the task is made.', `And like ${XTC}, it returns P D pass when the task is made.`, 0.7),
  // 5 · which core
  L('c1', 'which', 'So how can you tell which core a task is on?'),
  L('c2', 'which', "You ask it. esp_cpu_get_core_id returns the core that's running this line.", "You ask it. E S P C P U get core I D returns the core that's running this line.", 0.5),
  L('c3', 'which', "On the ESP32, that's zero or one.", "On the E S P thirty-two, that's zero or one.", 0.4),
  L('c4', 'which', 'It comes from esp_cpu.h.', 'It comes from E S P C P U dot H.', 0.4),
  L('c5', 'which', 'And pcTaskGetName, with NULL, gives the name of the task that calls it.', 'And P C task get name, with null, gives the name of the task that calls it.', 0.6),
  L('c6', 'which', 'Each worker now prints its name and its core, every time round the loop.', undefined, 0.6),
  L('c7', 'which', 'With pinning, they always say core 1.', 'With pinning, they always say core one.', 0.5),
  L('c8', 'which', 'Without pinning, the same line could say core 0 or core 1.', 'Without pinning, the same line could say core zero or core one.', 0.6),
  // 6 · demo
  L('d1', 'demo', 'Now flash it.'),
  L('d2', 'demo', 'The workers are on core 1, and they still have priority six.', 'The workers are on core one, and they still have priority six.', 0.6),
  L('d3', 'demo', 'But core 0 is always free, so both LEDs keep their beat.', 'But core zero is always free, so both LEDs keep their beat.', 0.5),
  L('d4', 'demo', 'Pinning fixed the stumble, without changing a single priority.', undefined, 0.6),
  // 7 · the price
  L('t1', 'price', 'But now look at core 1.', 'But now look at core one.'),
  L('t2', 'price', 'Both workers are on it, with the same priority, so they take turns, sharing it tick by tick.', undefined, 0.5),
  L('t3', 'price', 'Each worker now gets about half as much CPU time as before.', undefined, 0.5),
  L('t4', 'price', 'Meanwhile, core 0 sits almost empty.', 'Meanwhile, core zero sits almost empty.', 0.5),
  L('t5', 'price', 'A task you pin never moves, not even to a free core.', undefined, 0.7),
  L('t6', 'price', 'So only pin a task when you have a reason.', undefined, 0.5),
  L('t7', 'price', 'Here, the better fix was the one from the scheduler video: priority four, and no pinning.', undefined, 0.8),
  L('t8', 'price', 'Then both LEDs keep their beat, and the workers get both cores.', undefined, 0.5),
  // 8 · payoff
  L('z1', 'payoff', "So, only pin a task when you have a reason, and otherwise, let FreeRTOS choose. That's how you use both cores.", "So, only pin a task when you have a reason, and otherwise, let Free R-TOS choose. That's how you use both cores."),
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
  both: w('t8', 'beat', 0, 1.2),
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
