/**
 * FreeRTOS scheduler & priorities — the timeline. Single source of truth for picture AND sound.
 * PURE ESP-IDF: xTaskCreate, vTaskDelay, vTaskPrioritySet, uxTaskPriorityGet,
 * esp_timer_get_time; GPIO calls from Basic GPIO only.
 *
 *   problem (workers at 6 → the LED stumbles) → rule (PRIORITY) → three states
 *     → the rule case by case → the fix (6 → 4; urgency, not importance; busy vs blocked)
 *     → vTaskPrioritySet / uxTaskPriorityGet → demo (button flips 4 ↔ 6)
 *     → the trap (a task that never waits → task watchdog) → payoff
 *
 * Times are SCENE-RELATIVE. `node scripts/vo-plan.ts freertos-scheduler` voices every
 * line and writes VO_AT / VO_WORDS / SCENE_DUR below; cues are `w(line, word)`.
 * Import-free (type-only imports are erased): Node runs it as-is.
 * Every claim on screen or in the VO is sourced in ./FACTS.md.
 */
import type { Caption } from '../../components/pwm';

export const FPS = 30;
export const SECTION = '2-freertos';

// ── generated: VO plan (node scripts/vo-plan.ts freertos-scheduler) — do not edit by hand ──
export const VO_AT: Record<string, number> = {"p1":0.5,"p2":5.94,"p3":9.5,"p4":11.84,"p5":13.7,"p6":17.86,"p7":22.4,"p8":27.44,"a1":0.5,"a2":6.14,"a3":7.82,"a4":11.88,"a5":18.4,"s1":0.5,"s2":4,"s3":8.28,"s4":11.16,"s5":14.4,"s6":18.44,"s7":22.02,"r1":0.5,"r2":5.42,"r3":8.98,"r4":13.84,"r5":19.44,"r6":24.04,"r7":28.22,"r8":31.78,"r9":37.62,"r10":39.28,"r11":44.12,"r12":48.84,"r13":52,"k1":0.5,"k2":4.62,"k3":7.3,"k4":11.44,"k5":16.52,"k6":19.54,"k7":26.16,"k8":29.2,"k9":32.28,"k10":35.16,"k11":40.86,"k12":46.82,"k13":50.6,"k14":57.4,"e0":0.5,"e1":5.8,"e2":9.88,"e3":15.96,"e4":18.82,"e5":23.12,"e6":27.02,"e7":31.44,"e8":34.86,"e9":41.26,"e10":47.48,"e11":54.14,"e12":55.92,"d1":0.5,"d2":6.5,"d3":7.82,"d4":9.56,"d5":14.88,"t1":0.5,"t2":3.2,"t3":6.84,"t4":10.84,"t5":16.72,"t6":22.38,"t7":23.9,"t8":29.28,"t9":31.72,"t10":37.38,"t11":41.94,"z1":0.5};
export const SCENE_DUR: Record<string, number> = {"problem":32.4,"rule":24.2,"states":28.86,"cases":58.46,"fix":67.36,"prio":64.34,"demo":22.14,"trap":47.96,"payoff":10.46};
export const VO_WORDS: Record<string, [string, number][]> = {
  p1: [["Here",0],["are",0.28],["the",0.54],["two",0.7],["blinking",0.94],["LEDs",1.32],["from",1.98],["the",2.3],["TAS",2.42],["video.",2.68],["One",3.58],["fast,",3.78],["one",4.4],["slow.",4.5]],
  p2: [["Now",0],["we",0.24],["had",0.36],["two",0.5],["more",0.66],["tasks.",0.86],["Each",1.92],["one",2],["has",2.12],["a",2.24],["long",2.38],["job.",2.56]],
  p3: [["It",0],["works",0.24],["for",0.4],["300",0.66],["milliseconds.",1.3]],
  p4: [["Then",0],["it",0.22],["rests",0.32],["for",0.64],["a",0.9],["hundred.",1]],
  p5: [["The",0],["job",0.22],["feels",0.48],["important,",0.78],["so",1.72],["we",1.9],["give",2],["these",2.12],["tasks",2.3],["priority",2.7],["six.",3.08]],
  p6: [["The",0],["LEDs",0.26],["have",0.64],["priority",1.02],["5,",1.42],["so",2.2],["the",2.52],["workers",2.62],["have",2.98],["the",3.28],["bigger",3.42],["number.",3.66]],
  p7: [["Now",0],["watch",0.28],["the",0.52],["fast",0.7],["LED.",1.14],["It",2.12],["stumbles.",2.24]],
  p8: [["We",0],["didn't",0.22],["change",0.46],["the",0.7],["LED",0.9],["code",1.28],["at",1.68],["all.",1.8],["So",2.46],["what",2.58],["happened?",2.72]],
  a1: [["Many",0],["tasks",0.32],["want",0.74],["a",1],["CPU.",1.14],["FreeRTOS",2.26],["has",3],["to",3.42],["choose",3.58],["which",4],["one",4.42],["runs.",4.74]],
  a2: [["It",0],["uses",0.22],["one",0.46],["rule.",0.78]],
  a3: [["of",0],["the",0.2],["tasks",0.32],["that",0.7],["are",0.9],["ready,",1.02],["the",1.68],["one",1.78],["with",2],["the",2.14],["highest",2.28],["priority",2.62],["runs.",3]],
  a4: [["Priority",0],["is",0.48],["just",0.88],["the",1.14],["number",1.34],["you",1.5],["gave",1.7],["the",1.88],["task",2.06],["in",2.5],["xTask",3.08],["Create.",3.74],["A",4.64],["bigger",4.72],["number",4.94],["goes",5.14],["first.",5.48]],
  a5: [["So",0],["everything",0.3],["in",0.64],["this",0.86],["video",0.98],["comes",1.32],["down",1.68],["to",2],["one",2.18],["number,",2.48],["the",3.32],["priority.",3.44]],
  s1: [["A",0],["task",0.22],["is",0.58],["always",1.14],["in",1.68],["one",1.96],["of",2.04],["three",2.2],["states.",2.46]],
  s2: [["Blocked",0],["means",0.4],["waiting.",0.66],["A",1.54],["task",1.66],["in",1.88],["V",2.12],["-Task",2.38],["Delay",2.66],["is",3],["blocked.",3.36]],
  s3: [["A",0],["task",0.24],["that",0.5],["is",0.66],["blocked",0.78],["doesn't",1.16],["want",1.68],["the",1.8],["CPU.",1.96]],
  s4: [["When",0],["its",0.22],["delay",0.36],["is",0.66],["over,",0.94],["it",1.74],["becomes",2],["ready.",2.28]],
  s5: [["Ready",0],["means?",0.28],["I",1.14],["want",1.22],["the",1.38],["CPU.",1.56],["I'm",2.54],["waiting",2.68],["for",2.82],["my",3.02],["turn.",3.16]],
  s6: [["Running",0],["means,",0.3],["I'm",1.24],["using",1.54],["the",1.78],["CPU",1.94],["right",2.26],["now.",2.64]],
  s7: [["The",0],["ESP32",0.26],["has",1.28],["two",1.82],["cores,",2.18],["so",3.16],["two",3.38],["tasks",3.62],["can",4.04],["be",4.26],["running",4.36],["at",4.54],["the",4.7],["same",4.82],["time.",5]],
  r1: [["Case",0],["1,",0.28],["each",0.96],["core",1.22],["takes",1.56],["the",2.02],["ready",2.24],["task",2.36],["with",2.74],["the",3.06],["highest",3.22],["number.",3.48]],
  r2: [["Case",0],["2.",0.3],["A",1.04],["task",1.16],["with",1.46],["a",1.7],["higher",1.82],["number",2.06],["becomes",2.32],["ready.",2.66]],
  r3: [["It",0],["doesn't",0.24],["wait.",0.52],["It",1.22],["takes",1.3],["a",1.46],["core",1.62],["right",1.88],["away",2.12],["from",2.46],["a",3.08],["task",3.18],["with",3.52],["a",3.72],["lower",3.82],["number.",3.98]],
  r4: [["The",0],["task",0.22],["that",0.52],["was",0.66],["pushed",0.78],["out",1],["goes",1.22],["back",1.52],["to",1.9],["ready.",2.12],["Later",2.98],["it",3.1],["carries",3.28],["on",3.56],["from",3.9],["where",4.1],["it",4.24],["stopped.",4.32]],
  r5: [["Case",0],["3.",0.32],["Two",1.14],["tasks",1.38],["with",1.8],["higher",2.06],["numbers",2.3],["are",2.68],["using",2.94],["both",3.28],["cores.",3.64]],
  r6: [["Now",0],["a",0.3],["task",0.44],["with",0.74],["a",0.92],["lower",1.02],["number",1.2],["must",1.5],["wait,",1.76],["even",2.6],["if",2.76],["it's",2.88],["ready.",3]],
  r7: [["Case",0],["4.",0.3],["Tasks",1.14],["with",1.4],["the",1.56],["same",1.72],["number",1.92],["take",2.22],["turns.",2.62]],
  r8: [["Each",0],["one",0.28],["gets",0.46],["a",0.62],["core",0.78],["for",0.98],["one",1.24],["tick,",1.62],["10",2.36],["milliseconds,",2.58],["then",3.66],["the",3.82],["next",3.94],["one",4.12],["gets",4.34],["a",4.5],["go.",4.64]],
  r9: [["Now",0],["back",0.26],["to",0.5],["our",0.7],["LED.",0.82]],
  r10: [["Both",0],["workers",0.3],["are",0.6],["busy.",0.78],["They",1.6],["have",1.62],["priority",1.76],["6.",2.06],["They're",3.16],["using",3.32],["both",3.58],["cores.",3.88]],
  r11: [["The",0],["fast",0.24],["LED's",0.58],["delay",1.24],["is",1.5],["over.",2.02],["It's",2.86],["ready",3],["to",3.1],["switch",3.3],["the",3.56],["LED.",3.78]],
  r12: [["But",0],["5",0.24],["is",0.5],["lower",0.66],["than",0.84],["6.",1.04],["So",2],["it",2.24],["waits.",2.38]],
  r13: [["It",0],["only",0.22],["gets",0.36],["a",0.52],["core",0.66],["when",0.94],["a",1.18],["worker",1.28],["rests,",1.46],["that's",2.38],["why",2.76],["the",2.88],["LED",3],["is",3.3],["late.",3.68]],
  k1: [["The",0],["fix",0.24],["is",0.42],["simple.",0.66],["Give",1.58],["the",1.7],["workers",1.84],["a",2.08],["lower",2.3],["number",2.58],["than",2.86],["the",3.06],["LEDs.",3.2]],
  k2: [["Priority",0],["4,",0.48],["instead",1.3],["of",1.6],["6.",1.74]],
  k3: [["Now,",0],["when",0.42],["the",0.48],["LED's",0.6],["delay",1.14],["is",1.4],["over,",1.74],["it",2.4],["gets",2.58],["a",2.7],["core",2.82],["right",3.08],["away.",3.28]],
  k4: [["It",0],["switches",0.22],["the",0.5],["LED",0.74],["and",1.06],["goes",1.64],["back",1.84],["to",2.06],["waiting.",2.22],["That",2.92],["takes",3.08],["a",3.26],["few",3.46],["microseconds.",3.72]],
  k5: [["The",0],["workers",0.22],["lose",0.58],["almost",1.04],["nothing.",1.6]],
  k6: [["So",0],["priority",0.34],["is",0.84],["not",1.5],["about",1.8],["how",2.04],["important",2.26],["a",2.58],["job",2.8],["is,",2.96],["it's",3.86],["about",4.18],["how",4.38],["quickly",4.68],["it",5.04],["has",5.4],["to",5.58],["happen.",5.76]],
  k7: [["Quick",0],["jobs",0.34],["that",0.7],["must",0.9],["be",1.06],["on",1.22],["time",1.4],["get",1.66],["high",1.84],["numbers.",2.06]],
  k8: [["Long",0],["jobs",0.36],["that",0.68],["can",0.82],["wait",0.92],["get",1.24],["low",1.5],["numbers.",1.8]],
  k9: [["Let's",0],["look",0.26],["at",0.36],["what",0.44],["makes",0.54],["the",0.72],["worker",0.88],["so",1.22],["heavy.",1.96]],
  k10: [["ESP",0],["timer",0.5],["get",0.96],["time",1.16],["tells",1.52],["you",1.98],["how",2.18],["many",2.36],["microseconds",2.7],["have",3.36],["passed",3.7],["since",4.1],["the",4.42],["chip",4.58],["started.",4.72]],
  k11: [["The",0],["loop",0.22],["keeps",0.42],["checking",0.76],["it",1.14],["again",1.64],["and",2.16],["again",2.5],["until",3],["300",3.62],["milliseconds",4.28],["have",4.72],["passed.",5]],
  k12: [["All",0],["that",0.26],["time,",0.44],["the",1.06],["task",1.22],["is",1.52],["running.",1.68],["It",2.44],["keeps",2.58],["its",2.74],["core.",2.92]],
  k13: [["V",0],["-Task",0.32],["Delay",0.62],["is",0.96],["the",1.46],["opposite.",1.6],["The",2.54],["task",2.64],["is",2.9],["blocked",3.16],["and",3.52],["the",4.04],["core",4.14],["is",4.34],["free",4.54],["for",4.98],["someone",5.26],["else.",5.52]],
  k14: [["One",0],["more",0.24],["thing.",0.4],["Keep",1.2],["your",1.32],["numbers",1.44],["low.",1.62],["ESP",2.62],["-IDF's",2.78],["own",3.88],["tasks",4.16],["use",4.82],["the",5.12],["top",5.32],["numbers.",5.52],["Like",6.46],["ESP",6.64],["timer",7.14],["at",7.64],["22.",7.82]],
  e0: [["You",0],["can",0.22],["change",0.34],["a",0.56],["task",0.72],["priority",1],["while",1.46],["the",1.96],["program",2.08],["runs.",2.42],["This",3.34],["button",3.5],["task",3.76],["does",4.1],["that.",4.4]],
  e1: [["The",0],["press",0.24],["check",0.44],["is",0.72],["the",1.02],["same",1.18],["as",1.5],["in",1.98],["the",2.08],["GPIO",2.2],["input",2.66],["video.",3.1]],
  e2: [["To",0],["change",0.24],["a",0.46],["task,",0.62],["you",1.44],["need",1.48],["its",1.62],["handle.",1.78],["So",2.76],["AppMain",2.78],["now",3.12],["keeps",3.56],["the",4.04],["handles",4.26],["of",4.58],["the",4.88],["two",4.98],["workers.",5.16]],
  e3: [["First",0],["call,",0.34],["vTAS",0.94],["Priorities",1.5],["Set.",2.04]],
  e4: [["The",0],["first",0.24],["argument",0.44],["is",0.78],["the",1.3],["handle.",1.42],["It",2.24],["says",2.38],["which",2.54],["task",2.8],["to",3.14],["change.",3.38]],
  e5: [["If",0],["you",0.24],["pass",0.34],["null,",0.62],["it",1.42],["changes",1.52],["the",1.86],["task",2.08],["that",2.4],["is",2.66],["calling",2.78],["it.",3.08]],
  e6: [["The",0],["second",0.24],["argument",0.46],["is",0.8],["the",1.16],["new",1.3],["priority,",1.52],["from",2.6],["0",2.84],["to",3.14],["24.",3.38]],
  e7: [["25",0],["or",0.64],["more",0.94],["stops",1.16],["the",1.46],["program",1.68],["with",2.04],["an",2.46],["error.",2.58]],
  e8: [["The",0],["change",0.22],["happens",0.44],["at",0.74],["once,",0.9],["lower",1.72],["a",2.06],["running",2.3],["task,",2.5],["and",3.58],["its",3.74],["core",3.88],["chooses",4.18],["again",4.6],["right",4.94],["away.",5.14]],
  e9: [["Second",0],["call,",0.4],["UX",1.12],["task",1.5],["priority",1.8],["get.",2.2],["Give",2.92],["it",3.1],["a",3.18],["handle.",3.28],["It",4.04],["gives",4.1],["you",4.2],["back",4.34],["that",4.64],["task",4.88],["priority.",5.2]],
  e10: [["So,",0],["if",0.68],["the",1.06],["workers",1.16],["are",1.4],["at",1.6],["4,",1.72],["the",2.44],["button",2.66],["sets",2.94],["them",3.4],["to",3.66],["6,",3.82],["otherwise",4.82],["back",5.18],["to",5.56],["4.",5.76]],
  e11: [["Then",0],["it",0.22],["prints",0.32],["the",0.52],["new",0.72],["number.",0.9]],
  e12: [["The",0],["button",0.24],["task",0.48],["itself",0.9],["has",1.3],["priority",1.88],["7,",2.32],["the",3.1],["highest.",3.26],["It's",4.2],["very",4.34],["quick,",4.62],["so",5.4],["it",5.64],["doesn't",5.72],["get",5.94],["in",6.06],["anyone's",6.18],["way.",6.66]],
  d1: [["Flash",0],["it.",0.46],["The",1.08],["workers",1.16],["start",1.4],["at",1.72],["4.",1.84],["Both",2.56],["LEDs",2.84],["keep",3.26],["their",3.96],["beat.",4.18]],
  d2: [["Press",0],["the",0.3],["button.",0.46]],
  d3: [["The",0],["log",0.22],["says",0.42],["6.",0.72]],
  d4: [["and",0],["the",0.24],["fast",0.32],["LED",0.8],["stumbles",1.5],["again.",2.42]],
  d5: [["Press",0],["it",0.28],["again.",0.4],["Four.",1.32],["The",1.92],["LED",2],["is",2.3],["back",2.9],["on",3.22],["its",3.4],["beat.",3.54]],
  t1: [["Now,",0],["the",0.82],["mistake",0.96],["everyone",1.26],["makes.",1.64]],
  t2: [["Take",0],["the",0.26],["rest",0.44],["out",0.84],["of",1.32],["the",1.38],["worker.",1.46],["Now",2.34],["it",2.48],["never",2.58],["waits.",2.72]],
  t3: [["The",0],["LEDs",0.26],["still",0.66],["blink.",1.4],["5",2.48],["is",2.5],["higher",2.68],["than",2.9],["4.",3.1]],
  t4: [["But",0],["now",0.24],["the",0.42],["two",0.54],["workers",0.78],["fill",1.2],["both",1.58],["cores",1.98],["whenever",2.42],["the",2.8],["LEDs",3.04],["and",3.44],["the",4.02],["button",4.1],["don't",4.36],["need",4.88],["them.",5.04]],
  t5: [["Remember",0],["the",0.36],["idle",0.54],["task,",0.72],["priority",2.06],["zero.",2.06],["It",3.08],["only",3.16],["runs",3.38],["when",3.68],["no",3.94],["one",4.16],["else",4.3],["wants",4.48],["the",4.7],["core.",4.86]],
  t6: [["Now",0],["it",0.28],["never",0.4],["runs.",0.58]],
  t7: [["After",0],["five",0.34],["seconds,",0.64],["the",1.52],["watchdog",1.66],["sees",2.08],["this",2.5],["and",2.92],["prints",3.38],["an",3.6],["error.",3.74]],
  t8: [["Then",0],["again,",0.22],["every",0.8],["5",1.08],["seconds.",1.44]],
  t9: [["You",0],["will",0.2],["see",0.32],["this",0.52],["message",0.7],["one",1.06],["day.",1.52],["It",2.36],["means",2.42],["some",2.58],["task",2.84],["never",3.38],["lets",3.82],["go",4.02],["of",4.2],["its",4.32],["core.",4.42]],
  t10: [["The",0],["fix.",0.22],["Every",1.02],["task",1.3],["loop",1.62],["must",1.84],["wait",2.04],["somewhere.",2.28],["Put",3.22],["the",3.36],["delay",3.46],["back.",3.64]],
  t11: [["The",0],["message",0.24],["is",0.52],["gone.",0.76],["The",1.5],["Stacks",1.6],["and",1.94],["Watchdog",2.2],["video",2.7],["tells",3.08],["you",3.62],["more.",3.8]],
  z1: [["The",0],["highest",0.24],["priority",0.54],["ready",1.08],["task",1.4],["runs.",1.98],["That's",3.2],["the",3.4],["scheduler.",3.48]],
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

export const TAIL: Record<string, number> = { problem: 2.0, rule: 2.0, cases: 2.5, fix: 1.8, demo: 3.5, trap: 2.0, payoff: 6.0 };
const dur = (id: string, fallback: number) => SCENE_DUR[id] ?? fallback;
export const SCENES = [
  { id: 'problem', dur: dur('problem', 40) },
  { id: 'rule', dur: dur('rule', 25) },
  { id: 'states', dur: dur('states', 30) },
  { id: 'cases', dur: dur('cases', 75) },
  { id: 'fix', dur: dur('fix', 80) },
  { id: 'prio', dur: dur('prio', 75) },
  { id: 'demo', dur: dur('demo', 20) },
  { id: 'trap', dur: dur('trap', 50) },
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
export const SCHED_FRAMES = Math.round(SECONDS * FPS);

// ── voiceover ──────────────────────────────────────────────────────────────

export type VoLine = { id: string; scene: SceneId; at: number; text: string; say?: string; pause?: number };
export const VOICE = 'en-US-AndrewMultilingualNeural';
const L = (id: string, scene: SceneId, text: string, say?: string, pause?: number): VoLine => ({ id, scene, at: at(id), text, say, pause });

export const VO: VoLine[] = [
  // 1 · the problem
  L('p1', 'problem', 'Here are the two blinking LEDs from the tasks video. One fast, one slow.'),
  L('p2', 'problem', 'Now we add two more tasks. Each one has a long job.'),
  L('p3', 'problem', 'It works for 300 milliseconds.', 'It works for three hundred milliseconds.'),
  L('p4', 'problem', 'Then it rests for 100.', 'Then it rests for a hundred.'),
  L('p5', 'problem', 'The job feels important. So we give these tasks priority six.'),
  L('p6', 'problem', 'The LEDs have priority five. So the workers have the bigger number.'),
  L('p7', 'problem', 'Now watch the fast LED. It stumbles.'),
  L('p8', 'problem', "We didn't change the LED code at all. So what happened?", undefined, 2.4),

  // 2 · the rule
  L('a1', 'rule', 'Many tasks want the CPU. FreeRTOS has to choose which one runs.', 'Many tasks want the CPU. Free R-T-O-S has to choose which one runs.'),
  L('a2', 'rule', 'It uses one rule.'),
  L('a3', 'rule', 'Of the tasks that are ready, the one with the highest priority runs.'),
  L('a4', 'rule', 'Priority is just the number you gave the task in xTaskCreate. A bigger number goes first.', 'Priority is just the number you gave the task in X task create. A bigger number goes first.'),
  L('a5', 'rule', 'So everything in this video comes down to one number: the priority.'),

  // 3 · three states
  L('s1', 'states', 'A task is always in one of three states.'),
  L('s2', 'states', 'Blocked means waiting. A task in vTaskDelay is blocked.', 'Blocked means waiting. A task in V task delay is blocked.'),
  L('s3', 'states', "A task that is blocked doesn't want the CPU."),
  L('s4', 'states', 'When its delay is over, it becomes ready.'),
  L('s5', 'states', "Ready means: I want the CPU. I'm waiting for my turn."),
  L('s6', 'states', "Running means: I'm using the CPU right now."),
  L('s7', 'states', 'The ESP32 has two cores. So two tasks can be running at the same time.'),

  // 4 · the rule in action
  L('r1', 'cases', 'Case one. Each core takes the ready task with the highest number.'),
  L('r2', 'cases', 'Case two. A task with a higher number becomes ready.', undefined, 1.0),
  L('r3', 'cases', "It doesn't wait. It takes a core right away, from a task with a lower number."),
  L('r4', 'cases', 'The task that was pushed out goes back to ready. Later it carries on from where it stopped.'),
  L('r5', 'cases', 'Case three. Two tasks with higher numbers are using both cores.', undefined, 1.0),
  L('r6', 'cases', "Now a task with a lower number must wait. Even if it's ready."),
  L('r7', 'cases', 'Case four. Tasks with the same number take turns.', undefined, 1.0),
  L('r8', 'cases', 'Each one gets a core for one tick, ten milliseconds, then the next one gets a go.'),
  L('r9', 'cases', 'Now back to our LED.', undefined, 1.0),
  L('r10', 'cases', 'Both workers are busy. They have priority six. They are using both cores.'),
  L('r11', 'cases', "The fast LED's delay is over. It's ready to switch the LED."),
  L('r12', 'cases', 'But five is lower than six. So it waits.'),
  L('r13', 'cases', "It only gets a core when a worker rests. That's why the LED is late."),

  // 5 · the fix
  L('k1', 'fix', 'The fix is simple. Give the workers a lower number than the LEDs.'),
  L('k2', 'fix', 'Priority four, instead of six.'),
  L('k3', 'fix', "Now, when the LED's delay is over, it gets a core right away."),
  L('k4', 'fix', 'It switches the LED and goes back to waiting. That takes a few microseconds.'),
  L('k5', 'fix', 'The workers lose almost nothing.'),
  L('k6', 'fix', "So priority is not about how important a job is. It's about how quickly it has to happen.", undefined, 1.0),
  L('k7', 'fix', 'Quick jobs that must be on time get high numbers.'),
  L('k8', 'fix', 'Long jobs that can wait get low numbers.'),
  L('k9', 'fix', "Let's look at what makes the worker so heavy.", undefined, 1.0),
  L('k10', 'fix', 'esp_timer_get_time tells you how many microseconds have passed since the chip started.', 'E S P timer get time tells you how many microseconds have passed since the chip started.'),
  L('k11', 'fix', 'The loop keeps checking it, again and again, until 300 milliseconds have passed.', 'The loop keeps checking it, again and again, until three hundred milliseconds have passed.'),
  L('k12', 'fix', 'All that time, the task is running. It keeps its core.'),
  L('k13', 'fix', 'vTaskDelay is the opposite. The task is blocked, and the core is free for someone else.', 'V task delay is the opposite. The task is blocked, and the core is free for someone else.'),
  L(
    'k14',
    'fix',
    "One more thing. Keep your numbers low. ESP-IDF's own tasks use the top numbers, like esp_timer at twenty-two.",
    "One more thing. Keep your numbers low. E S P I D F's own tasks use the top numbers, like E S P timer at twenty-two.",
    1.0,
  ),

  // 6 · changing priority
  L('e0', 'prio', "You can change a task's priority while the program runs. This button task does that."),
  L('e1', 'prio', 'The press check is the same as in the GPIO input video.'),
  L('e2', 'prio', 'To change a task, you need its handle. So app_main now keeps the handles of the two workers.', 'To change a task, you need its handle. So app main now keeps the handles of the two workers.'),
  L('e3', 'prio', 'First call: vTaskPrioritySet.', 'First call: V task priority set.'),
  L('e4', 'prio', 'The first argument is the handle. It says which task to change.'),
  L('e5', 'prio', 'If you pass NULL, it changes the task that is calling it.', 'If you pass null, it changes the task that is calling it.'),
  L('e6', 'prio', 'The second argument is the new priority. From zero to twenty-four.'),
  L('e7', 'prio', 'Twenty-five or more stops the program with an error.'),
  L('e8', 'prio', 'The change happens at once. Lower a running task, and its core chooses again right away.'),
  L('e9', 'prio', "Second call: uxTaskPriorityGet. Give it a handle. It gives you back that task's priority.", "Second call: U X task priority get. Give it a handle. It gives you back that task's priority.", 1.0),
  L('e10', 'prio', 'So: if the workers are at four, the button sets them to six. Otherwise, back to four.'),
  L('e11', 'prio', 'Then it prints the new number.'),
  L('e12', 'prio', "The button task itself has priority seven, the highest. It's very quick, so it doesn't get in anyone's way."),

  // 7 · demo
  L('d1', 'demo', 'Flash it. The workers start at four. Both LEDs keep their beat.'),
  L('d2', 'demo', 'Press the button.', undefined, 1.6),
  L('d3', 'demo', 'The log says six.'),
  L('d4', 'demo', 'And the fast LED stumbles again.'),
  L('d5', 'demo', 'Press it again. Four. The LED is back on its beat.', undefined, 2.6),

  // 8 · the trap
  L('t1', 'trap', 'Now, the mistake everyone makes.'),
  L('t2', 'trap', 'Take the rest out of the worker. Now it never waits.'),
  L('t3', 'trap', 'The LEDs still blink. Five is higher than four.'),
  L('t4', 'trap', "But now the two workers fill both cores whenever the LEDs and the button don't need them."),
  L('t5', 'trap', 'Remember the idle task? Priority zero. It only runs when no one else wants the core.'),
  L('t6', 'trap', 'Now it never runs.'),
  L('t7', 'trap', 'After five seconds, the watchdog sees this, and prints an error.'),
  L('t8', 'trap', 'Then again every five seconds.', undefined, 1.4),
  L('t9', 'trap', 'You will see this message one day. It means some task never lets go of its core.'),
  L('t10', 'trap', 'The fix: every task loop must wait somewhere. Put the delay back.', undefined, 1.0),
  L('t11', 'trap', 'The message is gone. The stacks and watchdog video tells you more.'),

  // 9 · payoff
  L('z1', 'payoff', "The highest-priority ready task runs. That's the scheduler."),
];

// ── shared numbers and code (FACTS.md) ────────────────────────────────────

export const FAST = { pin: 2, ms: 200, name: 'blink_fast' };
export const SLOW = { pin: 19, ms: 500, name: 'blink_slow' };
export const BUTTON_PIN = 18;

export const WORK_CODE = [
  'static void work_task(void *arg)',
  '{',
  '    while (1) {',
  '        int64_t end = esp_timer_get_time() + 300 * 1000;',
  '        while (esp_timer_get_time() < end) {',
  '            // busy: keep the CPU until then',
  '        }',
  '        vTaskDelay(pdMS_TO_TICKS(100));   // rest',
  '    }',
  '}',
];
export const WORK_REST_LINE = 7;

/** app_main with the workers at `p`; `handles` = &work_a / &work_b instead of NULL */
export const mainCode = (p: number, handles = false) => [
  'void app_main(void)',
  '{',
  '    xTaskCreate(blink_task, "blink_fast", 2048, &fast, 5, NULL);',
  '    xTaskCreate(blink_task, "blink_slow", 2048, &slow, 5, NULL);',
  `    xTaskCreate(work_task, "work_a", 2048, NULL, ${p}, ${handles ? '&work_a' : 'NULL'});`,
  `    xTaskCreate(work_task, "work_b", 2048, NULL, ${p}, ${handles ? '&work_b' : 'NULL'});`,
  ...(handles ? ['    xTaskCreate(button_task, "button", 2048, NULL, 7, NULL);'] : []),
  '}',
];

export const BUTTON_CODE = [
  'static void button_task(void *arg)',
  '{',
  '    // GPIO 18: input + pull-up (the GPIO input video)',
  '    int last = 1;',
  '    while (1) {',
  '        int level = gpio_get_level(BUTTON);',
  '        if (last == 1 && level == 0) {      // just pressed',
  '            UBaseType_t p = 4;',
  '            if (uxTaskPriorityGet(work_a) == 4) {',
  '                p = 6;',
  '            }',
  '            vTaskPrioritySet(work_a, p);',
  '            vTaskPrioritySet(work_b, p);',
  '            ESP_LOGI(TAG, "work tasks now at %u", p);',
  '        }',
  '        last = level;',
  '        vTaskDelay(pdMS_TO_TICKS(10));',
  '    }',
  '}',
];
export const SET_CODE = 'vTaskPrioritySet(work_a, p);';

// ── 1. problem ─────────────────────────────────────────────────────────────

export const PROBLEM = {
  leds: w('p1', 'LEDs'),
  fast: w('p1', 'fast'),
  slow: w('p1', 'slow'),
  add: at('p2'),
  job: w('p2', 'long'),
  busy: w('p3', '300'),
  rest: w('p4', 'rests'),
  six: w('p5', 'six'),
  five: w('p6', '5'),
  bigger: w('p6', 'bigger'),
  watch: w('p7', 'watch'),
  stumbles: w('p7', 'stumbles'),
  unchanged: w('p8', 'change'),
  what: w('p8', 'what'),
  captions: [
    { at: at('p1'), text: 'two LED tasks from the tasks video · priority 5' },
    { at: at('p2'), text: 'two worker tasks: busy 300 ms, rest 100 ms, again and again' },
    { at: at('p5'), text: 'workers at priority 6 — a bigger number than the LEDs (5)' },
    { at: at('p7'), text: 'the fast LED misses its beat' },
    { at: at('p8'), text: 'the LED code didn\'t change — so who decides who runs?' },
  ] as Caption[],
};

// ── 2. rule ────────────────────────────────────────────────────────────────

export const RULE = {
  many: w('a1', 'tasks'),
  choose: w('a1', 'choose'),
  one: w('a2', 'rule'),
  ready: w('a3', 'ready'),
  highest: w('a3', 'highest'),
  runs: w('a3', 'runs'),
  number: w('a4', 'number'),
  create: w('a4', 'xTask'),
  bigger: w('a4', 'bigger'),
  first: w('a4', 'first'),
  word: w('a5', 'priority'),
  captions: [
    { at: at('a1'), text: 'many tasks want the CPU — FreeRTOS chooses which one runs' },
    { at: at('a3'), text: 'the rule: of the ready tasks, the highest priority runs' },
    { at: at('a4'), text: 'priority = the number you gave xTaskCreate · bigger goes first' },
  ] as Caption[],
};

// ── 3. three states ───────────────────────────────────────────────────────

export const STATES = {
  three: w('s1', 'three'),
  blocked: at('s2'),
  delay: w('s2', 'V'),
  noCpu: w('s3', 'want'),
  over: w('s4', 'over'),
  ready: w('s4', 'ready'),
  readyMeans: at('s5'),
  turn: w('s5', 'turn'),
  running: at('s6'),
  now: w('s6', 'right'),
  two: w('s7', 'two'),
  same: w('s7', 'same'),
  captions: [
    { at: at('s1'), text: 'every task: Running, Ready or Blocked' },
    { at: at('s2'), text: 'Blocked = waiting (vTaskDelay) · doesn\'t want the CPU' },
    { at: at('s4'), text: 'the delay ends → Ready = wants the CPU, waits for a turn' },
    { at: at('s6'), text: 'Running = using the CPU now' },
    { at: at('s7'), text: 'two cores → two tasks running at the same time' },
  ] as Caption[],
};

// ── 4. the rule in action ─────────────────────────────────────────────────

export const CASES = {
  c1: { at: at('r1'), takes: w('r1', 'takes'), highest: w('r1', 'highest') },
  c2: {
    at: at('r2'),
    ready: w('r2', 'becomes'),
    wait: w('r3', 'wait'),
    takes: w('r3', 'takes'),
    lower: w('r3', 'lower'),
    back: w('r4', 'back'),
    later: w('r4', 'Later'),
    stopped: w('r4', 'stopped'),
  },
  c3: { at: at('r5'), both: w('r5', 'both'), ready: w('r6', 'task'), must: w('r6', 'must'), even: w('r6', 'even') },
  c4: { at: at('r7'), same: w('r7', 'same'), turns: w('r7', 'turns'), tick: w('r8', 'tick'), ms: w('r8', '10'), next: w('r8', 'next') },
  led: {
    at: at('r9'),
    busy: w('r10', 'busy'),
    six: w('r10', '6'),
    both: w('r10', 'both'),
    over: w('r11', 'over'),
    ready: w('r11', 'ready'),
    lower: w('r12', 'lower'),
    waits: w('r12', 'waits'),
    rests: w('r13', 'rests'),
    late: w('r13', 'late'),
  },
  captions: [
    { at: at('r1'), text: '① each core takes the ready task with the highest number' },
    { at: at('r2'), text: '② a higher number becomes ready → takes a core right away' },
    { at: at('r4'), text: 'the task pushed out waits in Ready, then carries on where it stopped' },
    { at: at('r5'), text: '③ both cores busy with higher numbers → a lower one waits, even if ready' },
    { at: at('r7'), text: '④ same number → take turns, one tick (10 ms) each' },
    { at: at('r9'), text: 'workers 6 on both cores · blink_fast 5 is ready, but waits' },
    { at: at('r13'), text: 'it only runs when a worker rests → the LED is late' },
  ] as Caption[],
};

// ── 5. the fix ─────────────────────────────────────────────────────────────

export const FIX = {
  views: {
    swap: at('k1'),
    board: at('k3'),
    lanes: w('k4', 'microseconds', 0, 0.6),
    hero: at('k6'),
    ladder: at('k7'),
    busy: at('k9'),
    held: at('k12'),
    versus: at('k13'),
    system: at('k14'),
  },
  lower: w('k1', 'lower'),
  four: w('k2', '4'),
  ready: w('k3', 'over'),
  away: w('k3', 'right'),
  switches: w('k4', 'switches'),
  waiting: w('k4', 'waiting'),
  micro: w('k4', 'microseconds'),
  nothing: w('k5', 'nothing'),
  important: w('k6', 'important'),
  quickly: w('k6', 'quickly'),
  quick: w('k7', 'Quick'),
  high: w('k7', 'high'),
  long: w('k8', 'Long'),
  low: w('k8', 'low'),
  heavy: w('k9', 'heavy'),
  timer: w('k10', 'ESP'),
  micros: w('k10', 'microseconds'),
  checking: w('k11', 'checking'),
  again: w('k11', 'again'),
  until: w('k11', '300'),
  running: w('k12', 'running'),
  keeps: w('k12', 'keeps'),
  delay: w('k13', 'V'),
  blocked: w('k13', 'blocked'),
  free: w('k13', 'free'),
  keepLow: w('k14', 'Keep'),
  top: w('k14', 'top'),
  espTimer: w('k14', 'ESP', 1),
  captions: [
    { at: at('k1'), text: 'workers 6 → 4: now lower than the LEDs (5)' },
    { at: at('k3'), text: 'the LED\'s delay ends → it takes a core at once, then waits again' },
    { at: at('k5'), text: 'the LEDs keep their beat · the workers lose almost nothing' },
    { at: at('k6'), text: 'priority = how soon it must happen, not how important it is' },
    { at: at('k9'), text: 'esp_timer_get_time() = microseconds since the chip started' },
    { at: at('k12'), text: 'a busy loop keeps its core · vTaskDelay gives it away' },
    { at: at('k14'), text: 'stay low: ESP-IDF\'s own tasks use the top numbers' },
  ] as Caption[],
};

// ── 6. vTaskPrioritySet / uxTaskPriorityGet ───────────────────────────────

export const PRIO = {
  intro: { show: at('e0'), button: w('e0', 'button'), check: at('e1'), gpio: w('e1', 'GPIO'), main: at('e2'), handle: w('e2', 'handle'), keeps: w('e2', 'keeps'), out: at('e3') },
  run: w('e3', 'vTAS'),
  args: [w('e4', 'handle'), w('e6', 'new')],
  views: { handle: at('e4'), nul: at('e5'), range: at('e6'), once: at('e8'), get: at('e9'), flip: at('e10'), log: at('e11'), seven: at('e12') },
  which: w('e4', 'which'),
  nul: w('e5', 'null'),
  calling: w('e5', 'calling'),
  zero: w('e6', '0'),
  top: w('e6', '24'),
  over: w('e7', '25'),
  stops: w('e7', 'stops'),
  once: w('e8', 'once'),
  lower: w('e8', 'lower'),
  chooses: w('e8', 'chooses'),
  get: w('e9', 'UX'),
  give: w('e9', 'Give'),
  back: w('e9', 'back'),
  ifFour: w('e10', '4'),
  six: w('e10', '6'),
  otherwise: w('e10', 'otherwise'),
  prints: w('e11', 'prints'),
  seven: w('e12', '7'),
  quick: w('e12', 'quick'),
  captions: [
    { at: at('e0'), text: 'a button task changes the workers\' priority while the program runs' },
    { at: at('e2'), text: 'app_main keeps the workers\' handles: &work_a, &work_b' },
    { at: at('e3'), text: 'vTaskPrioritySet(handle, new priority)' },
    { at: at('e5'), text: 'handle NULL → the task that calls it' },
    { at: at('e6'), text: 'new priority: 0 … 24 · 25 or more stops the program' },
    { at: at('e8'), text: 'it takes effect at once' },
    { at: at('e9'), text: 'uxTaskPriorityGet(handle) → that task\'s priority' },
    { at: at('e10'), text: 'workers at 4 → set 6 · otherwise → set 4 · then log it' },
    { at: at('e12'), text: 'the button task: priority 7 — quick, so it never gets in the way' },
  ] as Caption[],
};

// ── 7. demo ────────────────────────────────────────────────────────────────

export const DEMO = {
  flash: at('d1'),
  four: w('d1', '4'),
  beat: w('d1', 'beat'),
  press1: w('d2', 'button', 0, 0.15),
  six: w('d3', '6'),
  stumbles: w('d4', 'stumbles'),
  press2: w('d5', 'Press', 0, 0.15),
  backFour: w('d5', 'Four'),
  back: w('d5', 'back'),
  captions: [
    { at: at('d1'), text: 'real time · workers at 4: both LEDs on their beat' },
    { at: at('d2'), text: 'press → the workers go to 6 → the fast LED stumbles' },
    { at: at('d5'), text: 'press again → back to 4 → back on the beat' },
  ] as Caption[],
};
/** the workers' priority during the demo, `ms` after the flash */
export const demoPrio = (ms: number) => {
  const p1 = (DEMO.press1 - DEMO.flash) * 1000;
  const p2 = (DEMO.press2 - DEMO.flash) * 1000;
  return ms >= p1 && ms < p2 ? 6 : 4;
};
/** the log's timestamp for scene time t (app_main starts ~300 ms after boot) */
export const demoLogMs = (t: number) => Math.round(310 + (t - DEMO.flash) * 1000);

// ── 8. the trap ────────────────────────────────────────────────────────────

export const TRAP = {
  views: { trap: at('t1'), cut: at('t2'), leds: at('t3'), cores: at('t4'), idle: at('t5'), log: at('t7'), meet: at('t9'), fix: at('t10') },
  mistake: w('t1', 'mistake'),
  cut: w('t2', 'rest'),
  never: w('t2', 'never'),
  still: w('t3', 'still'),
  higher: w('t3', 'higher'),
  fill: w('t4', 'fill'),
  idle: w('t5', 'idle'),
  zero: w('t5', 'zero'),
  only: w('t5', 'only'),
  neverRuns: w('t6', 'never'),
  five: w('t7', 'five'),
  watchdog: w('t7', 'watchdog'),
  prints: w('t7', 'prints'),
  again: w('t8', 'again'),
  meet: w('t9', 'message'),
  lets: w('t9', 'lets'),
  fix: w('t10', 'fix'),
  put: w('t10', 'Put'),
  gone: w('t11', 'gone'),
  more: w('t11', 'Stacks'),
  captions: [
    { at: at('t1'), text: 'the trap: a task that never waits' },
    { at: at('t3'), text: 'workers at 4: the LEDs (5) still blink' },
    { at: at('t4'), text: 'but the workers fill both cores — the idle task (0) never runs' },
    { at: at('t7'), text: '5 s without idle → the task watchdog prints an error, every 5 s' },
    { at: at('t9'), text: 'IDLE0 / IDLE1 in that list = some task never waits' },
    { at: at('t10'), text: 'the fix: every task loop waits somewhere' },
  ] as Caption[],
};

/** the watchdog's report, as printed (task_wdt.c) */
export const WDT_LOG = [
  'E (5310) task_wdt: Task watchdog got triggered. The following tasks/users did not reset the watchdog in time:',
  'E (5310) task_wdt:  - IDLE0 (CPU 0)',
  'E (5310) task_wdt:  - IDLE1 (CPU 1)',
  'E (5310) task_wdt: Tasks currently running:',
  'E (5310) task_wdt: CPU 0: work_a',
  'E (5310) task_wdt: CPU 1: work_b',
  'E (5310) task_wdt: Print CPU 0 (current core) backtrace',
];

// ── 9. payoff ──────────────────────────────────────────────────────────────

export const PAYOFF = {
  line: w('z1', 'runs'),
  sched: w('z1', 'scheduler'),
  recap: [
    { at: w('z1', 'scheduler', 0, 1.0), k: 'Running · Ready · Blocked', v: 'two cores → two run at once' },
    { at: w('z1', 'scheduler', 0, 1.35), k: 'higher number', v: 'takes a core right away' },
    { at: w('z1', 'scheduler', 0, 1.7), k: 'priority', v: 'how soon, not how important' },
    { at: w('z1', 'scheduler', 0, 2.05), k: 'every task waits', v: 'or the watchdog complains' },
    { at: w('z1', 'scheduler', 0, 2.4), k: 'vTaskPrioritySet · uxTaskPriorityGet', v: 'change it · read it' },
    { at: w('z1', 'scheduler', 0, 2.75), k: 'next', v: 'delay-until: a steady beat' },
  ],
};
