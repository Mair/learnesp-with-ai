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
export const VO_AT: Record<string, number> = {"p1":0.5,"p2":6.48,"p3":10.94,"p4":14.62,"p5":16.6,"p6":20.68,"p7":25.28,"p8":31.04,"a1":0.5,"a2":6.28,"a3":9.24,"a4":13.8,"a5":20.66,"s1":0.5,"s2":4.58,"s3":10.02,"s4":13.22,"s5":16.36,"s6":20.8,"s7":24.72,"r1":0.5,"r2":7.4,"r3":11.04,"r4":16.52,"r5":22.14,"r6":26.5,"r7":30.72,"r8":34.5,"r9":40.74,"r10":42.8,"r11":47.58,"r12":52,"r13":54.88,"k1":0.5,"k2":4.64,"k3":8.26,"k4":13.12,"k5":18.48,"k6":21.7,"k7":28.26,"k8":31.44,"k9":34.68,"k10":37.82,"k11":43.42,"k12":49.38,"k13":53.34,"k14":60.04,"e0":0.5,"e1":6.82,"e2":11.16,"e3":17.62,"e4":20.54,"e5":24.82,"e6":28.5,"e7":32.68,"e8":36.1,"e9":42.34,"e10":49.08,"e11":55.28,"e12":57.06,"d1":0.5,"d2":6.46,"d3":7.82,"d4":9.52,"d5":14.24,"t1":0.5,"t2":2.9,"t3":6.18,"t4":10.44,"t5":16.34,"t6":22.46,"t7":24.4,"t8":28.86,"t9":32.26,"t10":37.82,"t11":42.62,"z1":0.5};
export const SCENE_DUR: Record<string, number> = {"problem":35.7,"rule":26.44,"states":31.64,"cases":61.26,"fix":69.86,"prio":65.86,"demo":21.66,"trap":49.06,"payoff":10.38};
export const VO_WORDS: Record<string, [string, number][]> = {
  p1: [["Let's",0],["say",0.28],["you",0.38],["have",0.48],["the",0.6],["two",0.78],["blinking",1.04],["LEDs",1.46],["from",1.98],["the",2.24],["TAS",2.36],["video,",2.58],["one",3.38],["fast",3.64],["and",4.06],["one",4.86],["slow.",5.06]],
  p2: [["Now",0],["you",0.28],["add",0.44],["two",0.68],["more",0.96],["tasks,",1.18],["and",2.24],["each",2.38],["one",2.64],["has",2.8],["a",2.92],["long",3.06],["job",3.26],["to",3.52],["do.",3.7]],
  p3: [["Each",0],["worker",0.32],["is",0.72],["busy",1.32],["for",1.68],["300",2.02],["milliseconds.",2.74]],
  p4: [["And",0],["then",0.24],["it",0.32],["rests",0.44],["for",0.74],["100.",0.96]],
  p5: [["The",0],["job",0.22],["feels",0.48],["important,",0.84],["so",1.82],["you",1.98],["give",2.1],["these",2.24],["tasks",2.42],["priority",2.74],["six.",3.1]],
  p6: [["The",0],["LEDs",0.22],["have",0.62],["priority",1.02],["5,",1.42],["so",2.36],["the",2.56],["workers",2.7],["have",2.96],["a",3.2],["bigger",3.34],["number.",3.48]],
  p7: [["Now",0],["watch",0.32],["the",0.58],["fast",0.76],["LED.",1.2],["It",2.22],["stumbles",2.32],["and",2.78],["misses",3.16],["its",3.36],["beat.",3.56]],
  p8: [["You",0],["didn't",0.24],["change",0.48],["the",0.7],["LED",0.84],["code",1.16],["at",1.58],["all,",1.68],["so",2.14],["what",2.3],["happened?",2.44]],
  a1: [["Many",0],["tasks",0.34],["want",0.76],["the",1],["CPU",1.14],["at",1.48],["the",1.74],["same",1.88],["time,",2.08],["so",2.84],["FreeRTOS",3.06],["has",3.84],["to",4.04],["choose",4.2],["which",4.46],["one",4.7],["runs.",4.98]],
  a2: [["To",0],["choose,",0.22],["it",0.96],["uses",1.04],["one",1.32],["simple",1.7],["rule.",2.06]],
  a3: [["Of",0],["all",0.24],["the",0.46],["tasks",0.58],["that",0.96],["are",1.16],["ready,",1.28],["the",2],["one",2.1],["with",2.34],["the",2.52],["highest",2.66],["priority",3],["runs.",3.42]],
  a4: [["The",0],["priority",0.26],["is",0.64],["just",1.2],["the",1.42],["number",1.62],["you",1.8],["gave",2.04],["the",2.24],["task",2.42],["in",2.9],["xTaskCreate,",3.36],["and",5.02],["a",5.12],["bigger",5.22],["number",5.44],["goes",5.64],["first.",5.92]],
  a5: [["So",0],["everything",0.3],["in",0.58],["this",0.78],["video",0.88],["comes",1.2],["down",1.54],["to",1.88],["that",2.06],["one",2.24],["number,",2.56],["the",3.36],["priority.",3.4]],
  s1: [["At",0],["any",0.26],["moment,",0.5],["a",1.38],["task",1.46],["is",2],["in",2.44],["one",2.56],["of",2.66],["three",2.82],["states.",3.08]],
  s2: [["Blocked",0],["means",0.42],["the",0.6],["task",0.82],["is",1.18],["waiting.",1.68],["A",2.56],["task",2.62],["inside",2.88],["V",3.24],["task",3.66],["delay",4],["is",4.32],["blocked.",4.7]],
  s3: [["A",0],["blocked",0.22],["task",0.48],["doesn't",1.06],["want",1.52],["a",1.66],["CPU",1.8],["at",2.1],["all.",2.36]],
  s4: [["When",0],["its",0.22],["delay",0.36],["is",0.66],["over,",0.94],["it",1.74],["becomes",2],["ready.",2.28]],
  s5: [["Ready",0],["means",0.24],["the",0.5],["task",0.68],["wants",1.12],["the",1.5],["CPU,",1.72],["and",2.8],["it's",2.92],["waiting",3.06],["for",3.28],["its",3.52],["turn.",3.64]],
  s6: [["Running",0],["means",0.32],["the",0.54],["task",0.72],["is",1.16],["using",1.76],["the",2.06],["CPU",2.22],["right",2.58],["now.",2.96]],
  s7: [["And",0],["because",0.22],["the",0.52],["ESP32",0.7],["has",1.76],["two",2.24],["cores,",2.6],["two",3.56],["tasks",3.68],["can",4.06],["be",4.28],["running",4.38],["at",4.58],["the",4.74],["same",4.86],["time.",5.08]],
  r1: [["Let's",0],["look",0.28],["at",0.36],["four",0.48],["cases.",0.78],["In",1.9],["the",1.92],["first,",2.02],["each",2.78],["core",2.96],["simply",3.26],["takes",3.86],["the",4.18],["ready",4.38],["task",4.52],["with",4.94],["the",5.24],["highest",5.36],["number.",5.6]],
  r2: [["In",0],["the",0.22],["second",0.34],["case,",0.54],["a",1.38],["task",1.44],["with",1.68],["a",1.88],["higher",2.02],["number",2.26],["becomes",2.52],["ready.",2.82]],
  r3: [["It",0],["doesn't",0.24],["wait.",0.54],["It",1.24],["takes",1.36],["a",1.54],["core",1.72],["straight",2.2],["away",2.8],["from",3.16],["a",3.66],["task",3.78],["with",4.14],["a",4.34],["lower",4.44],["number.",4.6]],
  r4: [["The",0],["task",0.26],["that",0.58],["was",0.72],["pushed",0.86],["out",1.08],["goes",1.32],["back",1.66],["to",2.02],["Ready,",2.26],["and",2.9],["later",3.12],["it",3.36],["carries",3.58],["on",3.86],["from",4.1],["where",4.26],["it",4.38],["stopped.",4.48]],
  r5: [["In",0],["the",0.22],["third",0.34],["case,",0.54],["two",1.32],["tasks",1.5],["with",1.88],["higher",2.1],["numbers",2.32],["are",2.62],["using",2.8],["both",3.14],["cores.",3.52]],
  r6: [["Now",0],["a",0.28],["task",0.42],["with",0.78],["a",0.96],["lower",1.08],["number",1.26],["must",1.54],["wait,",1.8],["even",2.62],["though",2.84],["it's",3.02],["ready.",3.14]],
  r7: [["In",0],["the",0.22],["fourth",0.34],["case,",0.54],["tasks",1.66],["with",1.76],["the",1.98],["same",2.12],["number",2.34],["take",2.6],["turns.",2.9]],
  r8: [["Each",0],["one",0.28],["gets",0.48],["a",0.66],["core",0.8],["for",1.02],["one",1.26],["tick,",1.6],["which",2.38],["is",2.44],["10",2.6],["milliseconds,",2.84],["and",3.98],["then",4.14],["the",4.26],["next",4.38],["one",4.6],["gets",4.8],["a",4.92],["go.",5.04]],
  r9: [["Now,",0],["let's",0.56],["go",0.74],["back",0.84],["to",1.06],["our",1.22],["LED.",1.34]],
  r10: [["Both",0],["workers",0.32],["are",0.6],["busy.",0.78],["They",1.6],["have",1.62],["priority",1.76],["6,",2.08],["and",3.1],["they're",3.14],["using",3.28],["both",3.52],["cores.",3.84]],
  r11: [["The",0],["fast",0.24],["LED's",0.58],["delay",1.18],["is",1.42],["over,",1.76],["so",2.38],["it's",2.62],["ready",2.76],["to",2.88],["switch",3.08],["the",3.38],["LED.",3.64]],
  r12: [["But",0],["5",0.22],["is",0.46],["lower",0.6],["than",0.76],["6,",0.94],["so",1.38],["it",1.62],["has",1.72],["to",1.9],["wait.",2.06]],
  r13: [["It",0],["only",0.22],["gets",0.34],["a",0.52],["core",0.64],["when",0.9],["a",1.1],["worker",1.2],["rests,",1.44],["and",2.38],["that's",2.46],["why",2.66],["the",2.78],["LED",2.92],["is",3.22],["late.",3.6]],
  k1: [["The",0],["fix",0.24],["is",0.46],["simple.",0.88],["Give",1.82],["the",1.96],["workers",2.08],["a",2.3],["lower",2.52],["number",2.74],["than",3.02],["the",3.2],["LEDs.",3.32]],
  k2: [["So",0],["you",0.24],["set",0.36],["them",0.56],["to",0.7],["priority",0.86],["4",1.14],["instead",1.72],["of",2.54],["6.",2.68]],
  k3: [["Now,",0],["when",0.86],["the",1.04],["LED's",1.18],["delay",1.72],["is",1.96],["over,",2.26],["it",2.98],["gets",3.16],["a",3.3],["core",3.44],["straight",3.78],["away.",4.08]],
  k4: [["It",0],["switches",0.22],["the",0.54],["LED",0.78],["and",1.12],["goes",1.74],["back",1.98],["to",2.28],["waiting,",2.48],["which",3.26],["takes",3.36],["just",3.56],["a",3.8],["few",3.96],["microseconds.",4.22]],
  k5: [["So",0],["the",0.26],["workers",0.36],["lose",0.72],["almost",1.14],["nothing.",1.84]],
  k6: [["That",0],["means",0.26],["priority",0.46],["isn't",0.98],["about",1.8],["how",1.98],["important",2.22],["a",2.58],["job",2.76],["is,",2.98],["it's",3.78],["about",4.06],["how",4.26],["quickly",4.6],["it",5.02],["has",5.34],["to",5.54],["happen.",5.7]],
  k7: [["Quick",0],["jobs",0.32],["that",0.7],["must",0.94],["be",1.08],["on",1.24],["time.",1.42],["Get",2.02],["high",2.08],["numbers.",2.32]],
  k8: [["and",0],["long",0.26],["jobs",0.5],["that",0.86],["can",1.04],["wait",1.14],["get",1.5],["low",1.78],["numbers.",2]],
  k9: [["Now",0],["let's",0.24],["look",0.4],["at",0.5],["what",0.6],["makes",0.72],["the",0.96],["worker",1.14],["so",1.52],["heavy.",2.24]],
  k10: [["ESP",0],["timer",0.5],["get",0.96],["time",1.16],["tells",1.52],["you",1.98],["how",2.18],["many",2.36],["microseconds",2.7],["have",3.36],["passed",3.7],["since",4.1],["the",4.42],["chip",4.58],["started.",4.72]],
  k11: [["The",0],["loop",0.22],["keeps",0.42],["checking",0.76],["it",1.14],["again",1.64],["and",2.16],["again",2.5],["until",3],["300",3.62],["milliseconds",4.28],["have",4.72],["passed.",5]],
  k12: [["All",0],["that",0.26],["time,",0.46],["the",1.18],["task",1.3],["is",1.54],["running,",1.72],["so",2.38],["it",2.62],["keeps",2.74],["its",2.92],["core.",3.12]],
  k13: [["V",0],["-Task",0.34],["Delay",0.64],["is",0.98],["the",1.4],["opposite,",1.56],["the",2.48],["task",2.58],["is",2.84],["blocked,",3.1],["and",4.04],["the",4.08],["core",4.18],["is",4.36],["free",4.56],["for",5],["someone",5.26],["else.",5.52]],
  k14: [["One",0],["more",0.3],["thing.",0.5],["Keep",1.44],["your",1.56],["numbers",1.68],["low",1.86],["because",2.16],["ESP",2.8],["-IDF's",3.42],["own",4.44],["tasks",4.6],["use",5],["the",5.28],["top",5.44],["numbers,",5.64],["like",6.38],["ESP",6.6],["timer",7.18],["22.",7.64]],
  e0: [["You",0],["can",0.2],["also",0.32],["change",0.52],["a",0.86],["task",1],["priority",1.3],["while",1.74],["the",2.3],["program",2.42],["runs,",2.74],["and",3.72],["this",3.82],["button",4.02],["task",4.24],["does",4.7],["just",5.12],["that.",5.48]],
  e1: [["It",0],["checks",0.22],["for",0.38],["a",0.56],["press",0.66],["the",0.9],["same",1.1],["way",1.38],["as",1.74],["in",2.08],["the",2.18],["GPIO",2.3],["input",2.8],["video.",3.34]],
  e2: [["To",0],["change",0.22],["a",0.48],["task,",0.64],["you",1.48],["need",1.5],["its",1.62],["handle,",1.76],["so",2.44],["AppMain",2.78],["now",3.34],["keeps",3.78],["the",4.34],["handles",4.56],["of",4.88],["the",5.14],["two",5.24],["workers.",5.42]],
  e3: [["The",0],["first",0.22],["call",0.38],["is",0.72],["V",1.06],["-Task",1.34],["Priority",1.64],["Set.",2.04]],
  e4: [["Its",0],["first",0.22],["argument",0.48],["is",0.84],["the",1.24],["handle,",1.4],["which",2.16],["says",2.3],["which",2.54],["task",2.88],["to",3.24],["change.",3.48]],
  e5: [["If",0],["you",0.24],["pass",0.36],["null,",0.62],["it",1.4],["changes",1.48],["the",1.8],["task",2],["that's",2.38],["calling",2.64],["it.",2.92]],
  e6: [["The",0],["second",0.22],["argument",0.46],["is",0.78],["the",1.1],["new",1.24],["priority",1.46],["from",2.06],["0",2.6],["to",2.98],["24.",3.22]],
  e7: [["25",0],["or",0.64],["more",0.94],["stops",1.16],["the",1.46],["program",1.68],["with",2.04],["an",2.46],["error.",2.58]],
  e8: [["The",0],["change",0.24],["happens",0.46],["at",0.78],["once,",0.94],["lower",1.84],["a",2.16],["running",2.34],["task,",2.52],["and",3.52],["its",3.64],["core",3.76],["chooses",4.06],["again",4.48],["straight",4.8],["away.",5.08]],
  e9: [["The",0],["second",0.24],["call",0.48],["is",0.86],["you",1.18],["x",1.32],["-task",1.66],["priority",1.86],["get.",2.22],["You",2.96],["give",3.12],["a",3.22],["handle",3.36],["and",3.72],["it",4.26],["gives",4.34],["you",4.52],["back",4.7],["that",5.14],["task",5.38],["priority.",5.7]],
  e10: [["So",0],["if",0.32],["the",0.44],["workers",0.54],["are",0.8],["at",1],["4,",1.16],["the",1.9],["button",2.16],["sets",2.44],["them",2.86],["to",3.08],["6",3.24],["and",3.62],["otherwise",4.24],["back",4.72],["to",5.34],["4.",5.54]],
  e11: [["Then",0],["it",0.22],["prints",0.32],["the",0.52],["new",0.72],["number.",0.9]],
  e12: [["The",0],["button",0.24],["task",0.48],["itself",0.9],["has",1.34],["priority",1.98],["7,",2.38],["the",3.22],["highest",3.44],["of",3.72],["all.",3.98],["It's",4.64],["very",4.8],["quick,",5.06],["so",5.8],["it",5.98],["doesn't",6.08],["get",6.28],["in",6.44],["anyone's",6.58],["way.",7.06]],
  d1: [["Flash",0],["it.",0.44],["The",1.08],["workers",1.16],["start",1.4],["at",1.7],["4,",1.84],["and",2.56],["both",2.82],["LEDs",3.02],["keep",3.58],["their",3.98],["beat.",4.14]],
  d2: [["Now",0],["press",0.26],["the",0.48],["button.",0.64]],
  d3: [["The",0],["log",0.22],["says",0.44],["6.",0.76]],
  d4: [["and",0],["the",0.22],["fast",0.3],["LED",0.78],["stumbles",1.32],["again.",2]],
  d5: [["Press",0],["it",0.3],["again,",0.42],["and",0.96],["it's",1.04],["back",1.18],["to",1.34],["4.",1.52],["The",2.28],["LED",2.46],["is",2.7],["back",3.16],["on",3.4],["its",3.58],["beat.",3.7]],
  t1: [["Now",0],["for",0.3],["the",0.44],["mistake",0.54],["everyone",0.9],["makes.",1.4]],
  t2: [["Take",0],["the",0.28],["rest",0.44],["out",0.72],["of",0.96],["the",1.06],["worker",1.14],["so",1.46],["it",2.16],["never",2.26],["waits.",2.38]],
  t3: [["The",0],["LEDs",0.26],["still",0.66],["blink,",1.4],["because",2.1],["5",2.46],["is",2.8],["higher",2.98],["than",3.2],["4.",3.44]],
  t4: [["But",0],["now",0.24],["the",0.42],["two",0.54],["workers",0.74],["fill",1.14],["both",1.52],["cores,",1.86],["whenever",2.78],["the",2.98],["LEDs",3.22],["and",3.62],["the",4.06],["button",4.16],["don't",4.38],["need",4.84],["them.",4.98]],
  t5: [["Remember",0],["the",0.32],["idle",0.48],["task?",0.68],["It",1.56],["has",1.72],["priority",1.92],["zero,",2.36],["and",3.66],["it",3.8],["only",3.88],["runs",4.12],["when",4.46],["no",4.68],["one",4.86],["else",5],["wants",5.16],["the",5.38],["core.",5.54]],
  t6: [["Now",0],["it",0.28],["never",0.38],["runs",0.6],["at",0.88],["all.",1]],
  t7: [["After",0],["5",0.34],["seconds,",0.68],["the",1.68],["watchdog",1.78],["notices",2.2],["and",2.76],["prints",3.3],["an",3.58],["error.",3.76]],
  t8: [["Then",0],["it",0.24],["prints",0.34],["it",0.52],["again",0.68],["every",0.96],["5",1.58],["seconds.",2]],
  t9: [["You",0],["will",0.2],["see",0.32],["this",0.52],["message",0.7],["one",1.06],["day.",1.52],["It",2.36],["means",2.42],["some",2.58],["task",2.84],["never",3.38],["lets",3.82],["go",4.02],["of",4.2],["its",4.32],["core.",4.42]],
  t10: [["The",0],["fix",0.22],["is",0.42],["that",0.62],["every",0.82],["task",1.14],["loop",1.48],["must",1.8],["wait",2.04],["somewhere,",2.34],["so",3.12],["put",3.38],["the",3.54],["delay",3.64],["back.",3.84]],
  t11: [["Now",0],["the",0.26],["message",0.4],["is",0.7],["gone.",0.94],["The",1.7],["Staxen",1.78],["watchdog",2.26],["video",2.58],["tells",3.18],["you",3.76],["more",3.92],["about",4.08],["it.",4.3]],
  z1: [["So",0],["the",0.24],["highest",0.38],["priority",0.66],["task",1],["that's",1.54],["ready",1.88],["gets",2],["to",2.22],["run.",2.4],["That's",3.1],["the",3.34],["scheduler.",3.42]],
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
  // 1 · the problem: the want, and the first try
  L('p1', 'problem', "Let's say you have the two blinking LEDs from the tasks video, one fast and one slow."),
  L('p2', 'problem', 'Now you add two more tasks, and each one has a long job to do.', undefined, 0.6),
  L('p3', 'problem', 'Each worker is busy for 300 milliseconds,', 'Each worker is busy for three hundred milliseconds,', 0.5),
  L('p4', 'problem', 'and then it rests for 100.', 'and then it rests for a hundred.', 0.5),
  L('p5', 'problem', 'The job feels important, so you give these tasks priority six.', undefined, 0.7),
  L('p6', 'problem', 'The LEDs have priority five, so the workers have the bigger number.', undefined, 0.5),
  L('p7', 'problem', 'Now watch the fast LED. It stumbles, and misses its beat.', undefined, 0.8),
  L('p8', 'problem', "You didn't change the LED code at all, so what happened?", undefined, 2.0),
  // 2 · the rule
  L('a1', 'rule', 'Many tasks want the CPU at the same time, so FreeRTOS has to choose which one runs.', 'Many tasks want the CPU at the same time, so free R-T-O-S has to choose which one runs.'),
  L('a2', 'rule', 'To choose, it uses one simple rule.', undefined, 0.5),
  L('a3', 'rule', 'Of all the tasks that are ready, the one with the highest priority runs.', undefined, 0.6),
  L('a4', 'rule', 'The priority is just the number you gave the task in xTaskCreate, and a bigger number goes first.', 'The priority is just the number you gave the task in X task create, and a bigger number goes first.', 0.7),
  L('a5', 'rule', 'So everything in this video comes down to that one number: the priority.', undefined, 0.6),
  // 3 · states
  L('s1', 'states', 'At any moment, a task is in one of three states.'),
  L('s2', 'states', 'Blocked means the task is waiting. A task inside vTaskDelay is blocked.', 'Blocked means the task is waiting. A task inside V task delay is blocked.', 0.6),
  L('s3', 'states', "A blocked task doesn't want the CPU at all.", undefined, 0.4),
  L('s4', 'states', 'When its delay is over, it becomes ready.', undefined, 0.6),
  L('s5', 'states', "Ready means the task wants the CPU, and it's waiting for its turn.", undefined, 0.5),
  L('s6', 'states', 'Running means the task is using the CPU right now.', undefined, 0.6),
  L('s7', 'states', 'And because the ESP32 has two cores, two tasks can be running at the same time.', undefined, 0.6),
  // 4 · the cases
  L('r1', 'cases', "Let's look at four cases. In the first, each core simply takes the ready task with the highest number."),
  L('r2', 'cases', 'In the second case, a task with a higher number becomes ready.', undefined, 0.9),
  L('r3', 'cases', "It doesn't wait. It takes a core straight away, from a task with a lower number.", undefined, 0.5),
  L('r4', 'cases', 'The task that was pushed out goes back to ready, and later it carries on from where it stopped.', undefined, 0.6),
  L('r5', 'cases', 'In the third case, two tasks with higher numbers are using both cores.', undefined, 0.9),
  L('r6', 'cases', "Now a task with a lower number must wait, even though it's ready.", undefined, 0.5),
  L('r7', 'cases', 'In the fourth case, tasks with the same number take turns.', undefined, 0.9),
  L('r8', 'cases', 'Each one gets a core for one tick, which is ten milliseconds, and then the next one gets a go.', undefined, 0.5),
  L('r9', 'cases', "Now let's go back to our LED.", undefined, 1.0),
  L('r10', 'cases', "Both workers are busy. They have priority six, and they're using both cores.", undefined, 0.5),
  L('r11', 'cases', "The fast LED's delay is over, so it's ready to switch the LED.", undefined, 0.6),
  L('r12', 'cases', 'But five is lower than six, so it has to wait.', undefined, 0.5),
  L('r13', 'cases', "It only gets a core when a worker rests, and that's why the LED is late.", undefined, 0.6),
  // 5 · the fix
  L('k1', 'fix', 'The fix is simple: give the workers a lower number than the LEDs.'),
  L('k2', 'fix', 'So you set them to priority four, instead of six.', undefined, 0.5),
  L('k3', 'fix', "Now, when the LED's delay is over, it gets a core straight away.", undefined, 0.6),
  L('k4', 'fix', 'It switches the LED and goes back to waiting, which takes just a few microseconds.', undefined, 0.5),
  L('k5', 'fix', 'So the workers lose almost nothing.', undefined, 0.5),
  L('k6', 'fix', "That means priority isn't about how important a job is. It's about how quickly it has to happen.", undefined, 0.9),
  L('k7', 'fix', 'Quick jobs that must be on time get high numbers,', undefined, 0.6),
  L('k8', 'fix', 'and long jobs that can wait get low numbers.', undefined, 0.5),
  L('k9', 'fix', "Now let's look at what makes the worker so heavy.", undefined, 0.9),
  L('k10', 'fix', 'esp_timer_get_time tells you how many microseconds have passed since the chip started.', 'E S P timer get time tells you how many microseconds have passed since the chip started.', 0.6),
  L('k11', 'fix', 'The loop keeps checking it, again and again, until 300 milliseconds have passed.', 'The loop keeps checking it, again and again, until three hundred milliseconds have passed.', 0.5),
  L('k12', 'fix', 'All that time, the task is running, so it keeps its core.', undefined, 0.6),
  L('k13', 'fix', 'vTaskDelay is the opposite: the task is blocked, and the core is free for someone else.', 'V task delay is the opposite: the task is blocked, and the core is free for someone else.', 0.6),
  L(
    'k14',
    'fix',
    "One more thing: keep your numbers low, because ESP-IDF's own tasks use the top numbers, like esp_timer at twenty-two.",
    "One more thing: keep your numbers low, because E S P I D F's own tasks use the top numbers, like E S P timer at twenty-two.",
    0.9,
  ),

  // 6 · changing priority
  L('e0', 'prio', "You can also change a task's priority while the program runs, and this button task does just that."),
  L('e1', 'prio', 'It checks for a press the same way as in the GPIO input video.', undefined, 0.5),
  L('e2', 'prio', 'To change a task, you need its handle, so app_main now keeps the handles of the two workers.', 'To change a task, you need its handle, so app main now keeps the handles of the two workers.', 0.6),
  L('e3', 'prio', 'The first call is vTaskPrioritySet.', 'The first call is V task priority set.', 0.7),
  L('e4', 'prio', 'Its first argument is the handle, which says which task to change.', undefined, 0.5),
  L('e5', 'prio', "If you pass NULL, it changes the task that's calling it.", "If you pass null, it changes the task that's calling it.", 0.5),
  L('e6', 'prio', 'The second argument is the new priority, from zero to twenty-four.', undefined, 0.6),
  L('e7', 'prio', 'Twenty-five or more stops the program with an error.', undefined, 0.5),
  L('e8', 'prio', 'The change happens at once: lower a running task, and its core chooses again straight away.', undefined, 0.6),
  L('e9', 'prio', "The second call is uxTaskPriorityGet. You give it a handle, and it gives you back that task's priority.", "The second call is U X task priority get. You give it a handle, and it gives you back that task's priority.", 0.9),
  L('e10', 'prio', 'So if the workers are at four, the button sets them to six, and otherwise, back to four.', undefined, 0.6),
  L('e11', 'prio', 'Then it prints the new number.', undefined, 0.4),
  L('e12', 'prio', "The button task itself has priority seven, the highest of all. It's very quick, so it doesn't get in anyone's way.", undefined, 0.6),

  // 7 · demo
  L('d1', 'demo', 'Flash it. The workers start at four, and both LEDs keep their beat.'),
  L('d2', 'demo', 'Now press the button.', undefined, 1.6),
  L('d3', 'demo', 'The log says six,', undefined, 0.5),
  L('d4', 'demo', 'and the fast LED stumbles again.', undefined, 0.5),
  L('d5', 'demo', "Press it again, and it's back to four. The LED is back on its beat.", undefined, 2.4),

  // 8 · trap
  L('t1', 'trap', 'Now for the mistake everyone makes.'),
  L('t2', 'trap', 'Take the rest out of the worker, so it never waits.', undefined, 0.6),
  L('t3', 'trap', 'The LEDs still blink, because five is higher than four.', undefined, 0.6),
  L('t4', 'trap', "But now the two workers fill both cores, whenever the LEDs and the button don't need them.", undefined, 0.5),
  L('t5', 'trap', 'Remember the idle task? It has priority zero, and it only runs when no one else wants the core.', undefined, 0.7),
  L('t6', 'trap', 'Now it never runs at all.', undefined, 0.4),
  L('t7', 'trap', 'After five seconds, the watchdog notices, and prints an error.', undefined, 0.7),
  L('t8', 'trap', 'Then it prints it again, every five seconds.', undefined, 0.5),
  L('t9', 'trap', 'You will see this message one day. It means some task never lets go of its core.', undefined, 1.0),
  L('t10', 'trap', 'The fix is that every task loop must wait somewhere, so put the delay back.', undefined, 0.9),
  L('t11', 'trap', 'Now the message is gone. The stacks and watchdog video tells you more about it.', undefined, 0.6),

  // 9 · payoff
  L('z1', 'payoff', "So the highest-priority task that's ready gets to run. That's the scheduler."),
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
    waits: w('r12', 'wait'),
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
  away: w('k3', 'straight'),
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
  run: w('e3', 'V'),
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
  get: w('e9', 'call', 0, 0.5),
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
  backFour: w('d5', 'back', 0, 0.3),
  back: w('d5', 'back', 1),
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
  five: w('t7', '5'),
  watchdog: w('t7', 'watchdog'),
  prints: w('t7', 'prints'),
  again: w('t8', 'again'),
  meet: w('t9', 'message'),
  lets: w('t9', 'lets'),
  fix: w('t10', 'fix'),
  put: w('t10', 'Put'),
  gone: w('t11', 'gone'),
  more: w('t11', 'watchdog', 0, -0.6),
  captions: [
    { at: at('t1'), text: 'the trap: a task that never waits' },
    { at: at('t3'), text: 'workers at 4: the LEDs (5) still blink' },
    { at: at('t4'), text: 'but the workers fill both cores — the idle task (0) never runs' },
    { at: at('t7'), text: '5 s without idle → the task watchdog prints an error, every 5 s' },
    { at: at('t9'), text: 'IDLE0 / IDLE1 in that list = some task never waits' },
    { at: at('t10'), text: 'the fix: every task loop waits somewhere' },
  ] as Caption[],
};

/** the watchdog's report on a board, two cores starved (task_wdt.c L803–816). An illustration: QEMU
 *  keeps both workers on core 0 under this load (lab/logs/v2.log, v4.log), so it lists only IDLE0. */
/** QEMU, lab/logs/v3.log: vTaskPrioritySet(NULL, 25) */
export const LOG_PRIO_25 = 'assert failed: vTaskPrioritySet tasks.c:1792 (uxNewPriority < ( 25 ))';

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
  line: w('z1', 'run'),
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
