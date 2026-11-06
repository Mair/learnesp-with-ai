/**
 * FreeRTOS stacks & watchdog — the timeline. Single source of truth for picture AND sound.
 * PURE ESP-IDF: uxTaskGetStackHighWaterMark, esp_task_wdt_add, esp_task_wdt_reset, the
 * task watchdog's menuconfig options; GPIO as Basic GPIO taught (polled button).
 *
 *   problem (2048 everywhere: too small crashes, too big wastes) → the high water mark →
 *     uxTaskGetStackHighWaterMark → demo (1556, then 1124) → size it → the stack trap
 *     (sized from the first reading: 768 → overflow) → a stuck task the idle watchdog
 *     can't see → esp_task_wdt_add / _reset → caught (5 s, "- button") → menuconfig →
 *     the mistake (a 10 s wait) → payoff
 *
 * Every log line is REAL output: the program in ./lab, built with ESP-IDF v6.0.2 and run
 * in QEMU (./lab/logs). Times are SCENE-RELATIVE. `node scripts/vo-plan.ts
 * freertos-stacks-watchdog` voices every line and writes VO_AT / VO_WORDS / SCENE_DUR
 * below; cues are `w(line, word)`. Import-free (type-only imports are erased).
 * Every claim on screen or in the VO is sourced in ./FACTS.md.
 */
import type { Caption } from '../../components/pwm';

export const FPS = 30;
export const SECTION = '2-freertos';

// ── generated: VO plan (node scripts/vo-plan.ts freertos-stacks-watchdog) — do not edit by hand ──
export const VO_AT: Record<string, number> = {"p1":0.5,"p2":5.1,"p3":12.1,"p4":18.74,"a1":0.5,"a2":3.08,"a3":7.38,"a4":11.84,"a5":15.28,"e0":0.5,"e1":3.08,"e2":5.48,"e3":10.88,"e4":17.78,"e5":22.86,"e6":31.12,"d1":0.5,"d2":2.16,"d3":6.12,"d4":11.58,"d5":16.2,"d6":19.82,"s1":0.5,"s2":8.04,"s3":13.62,"s4":19.58,"k1":0.5,"k2":4.2,"k3":12.78,"k4":19.02,"k5":26.3,"k6":29.56,"w1":0.5,"w2":3.8,"w3":12.04,"w4":15.4,"w5":20.66,"w6":24.78,"w7":30.9,"h1":0.5,"h2":3.36,"h3":9.56,"h4":17.62,"h5":22.06,"h6":27.72,"h7":31.9,"c1":0.5,"c2":3.64,"c3":9.56,"c4":14.78,"c5":19.48,"m1":0.5,"m2":3.98,"m3":8.64,"x1":0.5,"x2":4.32,"x3":9.32,"x4":16.64,"x5":21.76,"z1":0.5};
export const SCENE_DUR: Record<string, number> = {"problem":24.98,"mark":22.3,"measure":38.46,"demo":25.96,"size":24.04,"trap":36.78,"stuck":37.46,"watch":37.96,"caught":26.06,"config":16.68,"mistake":30.34,"payoff":12.38};
export const VO_WORDS: Record<string, [string, number][]> = {
  p1: [["Every",0],["task",0.36],["in",0.72],["this",0.96],["course",1.1],["has",1.42],["had",1.76],["a",1.9],["stack",1.96],["of",2.3],["2048",2.5],["bytes.",3.38]],
  p2: [["In",0],["the",0.22],["tasks",0.34],["video,",0.58],["you",1.46],["saw",1.62],["what",1.82],["happens",2],["when",2.34],["it's",2.52],["too",2.7],["small,",2.9],["a",3.86],["stack",3.98],["overflow,",4.24],["and",5.34],["a",5.58],["chip",5.66],["restarts.",5.82]],
  p3: [["Too",0],["big",0.28],["waste",0.54],["memory.",0.82],["The",1.74],["whole",1.8],["stack",1.92],["is",2.22],["set",2.4],["aside",2.62],["when",2.94],["the",3.2],["task",3.32],["is",3.6],["created,",3.82],["even",4.78],["the",4.94],["part",5.06],["it",5.26],["never",5.4],["uses.",5.68]],
  p4: [["So",0],["how",0.26],["much",0.38],["does",0.54],["Blink",0.74],["task",1.1],["really",1.58],["need?",1.9],["Don't",2.74],["guess.",2.9],["Measure",3.74],["it.",3.96]],
  a1: [["Picture",0],["the",0.32],["stack",0.52],["as",0.84],["the",1.22],["task",1.36],["runs.",1.7]],
  a2: [["Each",0],["call",0.24],["takes",0.44],["some",0.72],["of",1.06],["it",1.2],["and",1.4],["gives",1.84],["it",2.02],["back",2.18],["when",2.46],["it",2.66],["returns.",2.76]],
  a3: [["The",0],["highest",0.28],["it",0.66],["ever",1.04],["gets",1.34],["leaves",1.58],["a",1.84],["mark",2.02],["like",2.34],["a",2.74],["flood",2.88],["line",3.12],["on",3.4],["a",3.54],["wall.",3.64]],
  a4: [["FreeRTOS",0],["calls",0.96],["at",1.28],["the",1.46],["high",1.58],["watermark.",1.8]],
  a5: [["Above",0],["that",0.36],["line",0.58],["is",0.92],["the",1.2],["stack",1.34],["the",1.64],["task",1.8],["has",2.22],["never",2.42],["used.",2.68],["That's",3.6],["the",3.8],["number",3.92],["you",4.02],["can",4.16],["ask",4.28],["for.",4.5]],
  e0: [["Here's",0],["Blink",0.4],["Task",0.66],["from",1.02],["the",1.24],["Tasks",1.36],["video.",1.7]],
  e1: [["Add",0],["one",0.28],["line",0.5],["at",0.88],["the",1.24],["end",1.34],["of",1.46],["the",1.56],["loop.",1.62]],
  e2: [["It",0],["logs",0.22],["the",0.4],["task's",0.6],["name",1],["and",1.2],["one",1.62],["new",1.88],["call.",2.08],["UX",3.02],["task",3.24],["at",3.56],["Stack",3.74],["High",4.02],["Watermark.",4.24]],
  e3: [["Its",0],["one",0.22],["argument",0.44],["is",0.72],["the",1.14],["task",1.3],["to",1.56],["check.",1.78],["Passing",2.96],["null",2.96],["means",3.22],["this",3.58],["task,",3.86],["just",4.64],["like",4.78],["PC",4.96],["task",5.4],["get",5.86],["name.",6.12]],
  e4: [["It",0],["returns",0.22],["the",0.54],["smallest",0.76],["amount",1.3],["of",1.74],["free",2.2],["stack",2.64],["this",3.02],["task",3.26],["has",3.66],["ever",3.84],["had.",4.1]],
  e5: [["In",0],["ESP",0.28],["-IDF,",0.88],["that",2.64],["number",2.72],["is",3.14],["in",3.6],["bytes,",3.78],["the",4.64],["same",4.88],["unit",5.14],["as",5.46],["the",5.86],["2048",6],["you",6.8],["passed.",7.32]],
  e6: [["A",0],["big",0.22],["number",0.38],["means",0.68],["lots",1.22],["of",1.64],["room.",1.88],["Close",2.64],["to",2.72],["zero",2.94],["means",3.3],["the",3.68],["task",3.88],["nearly",4.28],["ran",4.62],["out.",5.04]],
  d1: [["Flash",0],["it.",0.44]],
  d2: [["The",0],["first",0.24],["line",0.42],["says",0.72],["1556",0.98],["bytes",2.16],["never",2.56],["used.",2.98]],
  d3: [["The",0],["next",0.22],["line",0.4],["says",0.8],["11",1.26],["-24,",1.68],["and",2.66],["then",2.88],["11",3],["-24",3.26],["every",3.86],["time.",4.48]],
  d4: [["Why",0],["the",0.24],["drop?",0.34],["The",1.06],["first",1.18],["number",1.36],["was",1.56],["read",1.76],["before",2.04],["the",2.4],["task",2.56],["had",3],["logged",3.16],["anything.",3.52]],
  d5: [["Printing",0],["a",0.32],["logline",0.46],["is",1],["one",1.36],["of",1.48],["the",1.6],["biggest",1.68],["users",2.04],["of",2.48],["Stack.",2.74]],
  d6: [["After",0],["that,",0.38],["the",0.94],["number",1.12],["never",1.3],["goes",1.5],["back",1.78],["up.",2.04],["It's",2.74],["the",2.9],["lowest",3],["so",3.26],["far.",3.6]],
  s1: [["So",0],["Blink",0.36],["task",0.62],["uses",0.96],["at",1.4],["most",1.62],["2048,",1.84],["minus",4.02],["1124,",4.24],["924",5.84],["bytes.",6.64]],
  s2: [["Espressif's",0],["advice.",0.72],["You",1.7],["can",1.78],["give",1.9],["back",2.06],["most",2.32],["of",2.62],["the",2.8],["unused",2.92],["part,",3.22],["but",3.82],["keep",4.02],["a",4.18],["safety",4.34],["margin.",4.62]],
  s3: [["1536,",0],["for",1.66],["example,",1.74],["still",2.82],["leaves",2.88],["612",3.14],["bytes,",4.06],["never",4.78],["used.",4.98]],
  s4: [["That's",0],["512",0.34],["bytes",0.74],["back",1.16],["for",1.56],["everything",1.84],["else.",2.16]],
  k1: [["Now",0],["the",0.26],["trap.",0.38],["Size",1.12],["the",1.38],["stack",1.58],["from",1.84],["that",2.02],["first",2.2],["number",2.46],["instead.",2.72]],
  k2: [["2048",0],["minus",1.24],["1556",2.04],["is",3.14],["about",3.84],["500",4.1],["bytes",4.66],["used,",5.02],["plus",5.78],["a",6.2],["margin",6.36],["768.",6.7]],
  k3: [["Flash",0],["it.",0.4],["The",1],["first",1.08],["line",1.28],["says",1.6],["272",1.9],["bytes,",2.84],["never",4.08],["used.",4.24],["Looks",5.18],["fine.",5.3]],
  k4: [["But",0],["that",0.22],["log",0.42],["line",0.7],["itself",1.02],["runs",1.4],["past",1.96],["the",2.6],["end",2.86],["of",3],["the",3.12],["stack.",3.2],["Stack",4.32],["overflow.",4.32],["The",5.34],["chip",5.46],["restarts.",5.66]],
  k5: [["The",0],["number",0.24],["only",0.42],["counts",0.82],["code",1.14],["that",1.52],["has",1.74],["run",1.84],["so",2.04],["far.",2.28]],
  k6: [["So",0],["read",0.32],["it",0.52],["after",0.72],["the",1],["task",1.16],["has",1.56],["done",1.8],["everything",2.1],["it",2.6],["ever",2.88],["does",3.02],["then",3.56],["pick",4.12],["the",4.3],["size",4.46]],
  w1: [["Now",0],["the",0.24],["second",0.4],["half,",0.66],["a",1.62],["task",1.74],["that",2.02],["gets",2.22],["stuck.",2.36]],
  w2: [["In",0],["the",0.22],["scheduler",0.36],["video,",0.68],["the",1.52],["watchdog",1.6],["caught",2.1],["a",2.7],["task",2.94],["that",3.34],["never",3.74],["let",4.1],["go",4.36],["of",4.6],["its",4.76],["core.",4.86],["It",5.66],["does",5.8],["that",5.98],["by",6.26],["watching",6.48],["the",6.84],["idle",7],["tasks.",7.14]],
  w3: [["but",0],["a",0.22],["task",0.32],["can",0.56],["get",0.74],["stuck",0.84],["and",1.22],["still",1.7],["let",1.98],["go",2.16],["of",2.32],["the",2.46],["core.",2.54]],
  w4: [["This",0],["button",0.28],["task",0.54],["counts",1],["presses.",1.34],["After",2.48],["each",2.66],["press,",2.86],["it",3.64],["waits",3.86],["for",4.1],["the",4.28],["release.",4.38]],
  w5: [["If",0],["the",0.24],["button",0.38],["jams,",0.68],["it",1.72],["waits",1.86],["for",2.06],["a",2.3],["release",2.38],["that",2.66],["never",2.92],["comes.",3.12]],
  w6: [["It",0],["waits",0.24],["with",0.44],["V",0.66],["-Task",0.96],["delay,",1.32],["so",2.1],["the",2.36],["idle",2.5],["tasks",2.74],["still",3.2],["run.",3.54],["The",4.28],["watchdog",4.38],["says",4.8],["nothing.",5.18]],
  w7: [["The",0],["LEDs",0.26],["keep",0.64],["blinking.",1.34],["Nothing",2.24],["tells",2.38],["you",2.62],["the",2.78],["button",2.88],["task",3.1],["is",3.58],["stuck.",4.22]],
  h1: [["So",0],["ask",0.3],["the",0.5],["watchdog",0.64],["to",1],["watch",1.24],["this",1.48],["task",1.72],["too.",1.98]],
  h2: [["ESP",0],["task",0.7],["wdt",1.32],["add,",2.32],["with",3.24],["null,",3.36],["adds",4.1],["this",4.38],["task",4.64],["to",4.98],["its",5.22],["list.",5.34]],
  h3: [["It",0],["returns",0.22],["an",0.54],["ESP",0.8],["error",1.4],["code,",1.88],["so",2.62],["wrap",2.84],["it",3.1],["in",3.28],["ESP",3.5],["error",4.12],["check.",4.48],["That's",5.38],["the",5.58],["opposite",5.7],["of",6.12],["XTaskCreate.",6.5]],
  h4: [["From",0],["now",0.3],["on,",0.56],["the",1.14],["task",1.3],["must",1.56],["check",1.78],["in",2.06],["at",2.28],["least",2.42],["every",2.7],["5",3.18],["seconds.",3.48]],
  h5: [["ESP",0],["task",0.66],["WDT",1.24],["reset",2.04],["is",2.56],["the",3.08],["check",3.2],["-in",3.42],["put",3.7],["at",4.2],["the",4.32],["top",4.42],["of",4.64],["the",4.78],["loop",4.86]],
  h6: [["Every",0],["time",0.32],["round,",0.56],["the",1.24],["loop",1.32],["tells",1.58],["the",1.9],["watchdog,",2.04],["still",3.02],["running.",3.3]],
  h7: [["Both",0],["come",0.28],["from",0.54],["ESP",0.78],["taskwdt",1.54],[".h.",3.4]],
  c1: [["Flash",0],["it,",0.44],["press",1.08],["the",1.24],["button,",1.42],["and",2],["let",2.06],["it",2.16],["jam.",2.28]],
  c2: [["Press",0],["1",0.28],["is",0.42],["logged,",0.56],["then",1.24],["the",1.48],["task",1.6],["is",1.86],["stuck,",2.1],["waiting",2.92],["for",3.18],["the",3.4],["release,",3.48],["and",4.36],["stops",4.42],["checking",4.68],["in.",5.06]],
  c3: [["Five",0],["seconds",0.42],["later,",0.72],["the",1.44],["watchdog",1.5],["prints",1.94],["an",2.28],["error",2.46],["and",2.82],["names",3.3],["the",3.5],["task",3.7],["button.",4.18]],
  c4: [["It",0],["repeats",0.24],["every",0.6],["five",1.16],["seconds",1.56],["until",2.14],["the",2.8],["task",2.96],["checks",3.28],["in",3.6],["again.",3.82]],
  c5: [["The",0],["LEDs",0.26],["never",0.64],["stopped,",1.16],["but",2.1],["now",2.22],["you",2.38],["know",2.48],["exactly",2.62],["which",3.04],["task",3.38],["is",3.68],["stuck.",3.9]],
  m1: [["In",0],["menu",0.24],["config,",0.48],["two",1.34],["settings",1.62],["change",1.94],["the",2.28],["watchdog.",2.5]],
  m2: [["The",0],["timeout,",0.24],["5",1.28],["seconds",1.48],["by",1.84],["default,",2.04],["anything",2.96],["from",3.1],["1",3.42],["to",3.6],["60.",3.7]],
  m3: [["By",0],["default",0.28],["it",0.66],["only",0.82],["prints,",1.02],["turn",1.92],["on",2.18],["invoke",2.38],["panic",2.72],["handler,",3.08],["and",3.94],["it",4],["restarts",4.1],["the",4.72],["chip",4.9],["instead.",5.14]],
  x1: [["Now",0],["the",0.28],["mistake.",0.42],["The",1.38],["watchdog",1.48],["can't",1.86],["tell",2.3],["stuck",2.46],["from",2.74],["slow.",2.94]],
  x2: [["Make",0],["the",0.24],["button",0.42],["task",0.7],["wait",1.22],["10",1.72],["seconds",2.12],["each",2.68],["time",3.12],["round",3.56],["its",4],["loop.",4.16]],
  x3: [["Nothing",0],["is",0.32],["stuck,",0.48],["but",1.22],["it",1.44],["checks",1.52],["in",1.72],["only",1.96],["every",2.32],["10",2.76],["seconds,",3.04],["so",3.62],["the",4.22],["watchdog",4.44],["fires",4.86],["every",5.32],["time",5.7],["round.",5.96]],
  x4: [["In",0],["a",0.2],["task",0.32],["on",0.66],["the",0.84],["watch",0.94],["list,",1.12],["every",2.04],["delay",2.26],["must",2.66],["be",3.1],["shorter",3.3],["than",3.68],["the",3.92],["time",4.04],["out.",4.24]],
  x5: [["and",0],["keep",0.26],["the",0.58],["check",0.74],["-in",0.96],["in",1.1],["the",1.18],["main",1.28],["loop,",1.5],["not",2.38],["inside",2.48],["the",2.86],["release",3.02],["loop.",3.26],["Otherwise,",4.1],["a",5.02],["jam",5.22],["is",5.5],["never",5.66],["caught.",5.88]],
  z1: [["Measure",0],["your",0.34],["stacks",0.58],["and",0.9],["let",1.5],["the",1.62],["watchdog",1.76],["watch",2.2],["the",2.58],["tasks",2.8],["that",3.16],["matter.",3.42],["That's",4.26],["stacks",4.54],["and",4.9],["a",5.46],["watchdog.",5.56]],
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

export const TAIL: Record<string, number> = {
  problem: 2.0,
  mark: 2.2,
  measure: 2.0,
  demo: 2.2,
  size: 2.0,
  trap: 2.4,
  stuck: 2.0,
  watch: 2.0,
  caught: 2.4,
  config: 2.4,
  mistake: 2.4,
  payoff: 6.0,
};
const dur = (id: string, fallback: number) => SCENE_DUR[id] ?? fallback;
export const SCENES = [
  { id: 'problem', dur: dur('problem', 25) },
  { id: 'mark', dur: dur('mark', 25) },
  { id: 'measure', dur: dur('measure', 35) },
  { id: 'demo', dur: dur('demo', 25) },
  { id: 'size', dur: dur('size', 20) },
  { id: 'trap', dur: dur('trap', 30) },
  { id: 'stuck', dur: dur('stuck', 35) },
  { id: 'watch', dur: dur('watch', 35) },
  { id: 'caught', dur: dur('caught', 25) },
  { id: 'config', dur: dur('config', 18) },
  { id: 'mistake', dur: dur('mistake', 30) },
  { id: 'payoff', dur: dur('payoff', 12) },
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
export const STACKS_FRAMES = Math.round(SECONDS * FPS);

// ── voiceover ──────────────────────────────────────────────────────────────

export type VoLine = { id: string; scene: SceneId; at: number; text: string; say?: string; pause?: number };
export const VOICE = 'en-US-AndrewMultilingualNeural';
const L = (id: string, scene: SceneId, text: string, say?: string, pause?: number): VoLine => ({ id, scene, at: at(id), text, say, pause });

const HWM = 'U X task get stack high water mark';
const ADD = 'E S P task W D T add';
const RESET = 'E S P task W D T reset';

export const VO: VoLine[] = [
  // 1 · problem
  L('p1', 'problem', 'Every task in this course has had a stack of 2048 bytes.', 'Every task in this course has had a stack of two thousand and forty-eight bytes.'),
  L('p2', 'problem', "In the tasks video, you saw what happens when it's too small: a stack overflow, and the chip restarts."),
  L('p3', 'problem', 'Too big wastes memory. The whole stack is set aside when the task is created, even the part it never uses.'),
  L('p4', 'problem', "So how much does blink_task really need? Don't guess. Measure it.", "So how much does blink task really need? Don't guess. Measure it."),
  // 2 · the high water mark
  L('a1', 'mark', 'Picture the stack as the task runs.'),
  L('a2', 'mark', 'Each call takes some of it, and gives it back when it returns.'),
  L('a3', 'mark', 'The highest it ever gets leaves a mark, like a flood line on a wall.', undefined, 1.2),
  L('a4', 'mark', 'FreeRTOS calls it the high water mark.', 'Free R-TOS calls it the high water mark.'),
  L('a5', 'mark', "Above that line is the stack the task has never used. That's the number you can ask for.", undefined, 1.0),
  // 3 · uxTaskGetStackHighWaterMark
  L('e0', 'measure', "Here's blink_task from the tasks video.", "Here's blink task from the tasks video."),
  L('e1', 'measure', 'Add one line at the end of the loop.'),
  L('e2', 'measure', "It logs the task's name, and one new call: uxTaskGetStackHighWaterMark.", `It logs the task's name, and one new call: ${HWM}.`),
  L('e3', 'measure', 'Its one argument is the task to check. Passing NULL means this task, just like pcTaskGetName.', 'Its one argument is the task to check. Passing null means this task, just like P C task get name.'),
  L('e4', 'measure', 'It returns the smallest amount of free stack this task has ever had.'),
  L('e5', 'measure', 'In ESP-IDF, that number is in bytes: the same unit as the 2048 you passed.', 'In E S P I D F, that number is in bytes: the same unit as the two thousand and forty-eight you passed.'),
  L('e6', 'measure', 'A big number means lots of room. Close to zero means the task nearly ran out.'),
  // 4 · demo
  L('d1', 'demo', 'Flash it.'),
  L('d2', 'demo', 'The first line says 1556 bytes never used.', 'The first line says fifteen fifty-six bytes never used.', 1.0),
  L('d3', 'demo', 'The next line says 1124. And then 1124, every time.', 'The next line says eleven twenty-four. And then eleven twenty-four, every time.'),
  L('d4', 'demo', 'Why the drop? The first number was read before the task had logged anything.'),
  L('d5', 'demo', 'Printing a log line is one of the biggest users of stack.'),
  L('d6', 'demo', "After that, the number never goes back up. It's the lowest so far."),
  // 5 · size it
  L('s1', 'size', 'So blink_task uses at most 2048 minus 1124: 924 bytes.', 'So blink task uses at most two thousand and forty-eight, minus eleven twenty-four: nine hundred and twenty-four bytes.'),
  L('s2', 'size', "Espressif's advice: you can give back most of the unused part, but keep a safety margin."),
  L('s3', 'size', '1536, for example, still leaves 612 bytes never used.', 'Fifteen thirty-six, for example, still leaves six hundred and twelve bytes never used.'),
  L('s4', 'size', "That's 512 bytes back for everything else.", "That's five hundred and twelve bytes back, for everything else."),
  // 6 · the stack trap
  L('k1', 'trap', 'Now the trap. Size the stack from that first number instead.'),
  L('k2', 'trap', '2048 minus 1556 is about 500 bytes used. Plus a margin: 768.', 'Two thousand and forty-eight, minus fifteen fifty-six, is about five hundred bytes used. Plus a margin: seven sixty-eight.'),
  L('k3', 'trap', 'Flash it. The first line says 272 bytes never used. Looks fine.', 'Flash it. The first line says two hundred and seventy-two bytes never used. Looks fine.', 0.9),
  L('k4', 'trap', 'But that log line itself runs past the end of the stack. Stack overflow. The chip restarts.'),
  L('k5', 'trap', 'The number only counts code that has run so far.', undefined, 1.0),
  L('k6', 'trap', 'So read it after the task has done everything it ever does. Then pick the size.'),
  // 7 · a stuck task
  L('w1', 'stuck', 'Now the second half: a task that gets stuck.'),
  L('w2', 'stuck', 'In the scheduler video, the watchdog caught a task that never let go of its core. It does that by watching the idle tasks.'),
  L('w3', 'stuck', 'But a task can get stuck, and still let go of the core.'),
  L('w4', 'stuck', 'This button task counts presses. After each press, it waits for the release.'),
  L('w5', 'stuck', 'If the button jams, it waits for a release that never comes.'),
  L('w6', 'stuck', 'It waits with vTaskDelay, so the idle tasks still run. The watchdog says nothing.', 'It waits with V task delay, so the idle tasks still run. The watchdog says nothing.'),
  L('w7', 'stuck', 'The LEDs keep blinking. Nothing tells you the button task is stuck.'),
  // 8 · esp_task_wdt_add / esp_task_wdt_reset
  L('h1', 'watch', 'So ask the watchdog to watch this task too.'),
  L('h2', 'watch', 'esp_task_wdt_add, with NULL, adds this task to its list.', `${ADD}, with null, adds this task to its list.`),
  L('h3', 'watch', "It returns an esp_err_t, so wrap it in ESP_ERROR_CHECK. That's the opposite of xTaskCreate.", "It returns an E S P error code, so wrap it in E S P error check. That's the opposite of X task create."),
  L('h4', 'watch', 'From now on, the task must check in at least every five seconds.'),
  L('h5', 'watch', 'esp_task_wdt_reset is the check-in. Put it at the top of the loop.', `${RESET} is the check-in. Put it at the top of the loop.`),
  L('h6', 'watch', 'Every time round, the loop tells the watchdog: still running.'),
  L('h7', 'watch', 'Both come from esp_task_wdt.h.', 'Both come from E S P task W D T dot H.'),
  // 9 · caught
  L('c1', 'caught', 'Flash it. Press the button, and let it jam.'),
  L('c2', 'caught', 'Press one is logged. Then the task is stuck, waiting for the release, and stops checking in.'),
  L('c3', 'caught', 'Five seconds later, the watchdog prints an error, and names the task: button.'),
  L('c4', 'caught', 'It repeats every five seconds, until the task checks in again.'),
  L('c5', 'caught', 'The LEDs never stopped. But now you know exactly which task is stuck.'),
  // 10 · menuconfig
  L('m1', 'config', 'In menuconfig, two settings change the watchdog.', 'In menu config, two settings change the watchdog.'),
  L('m2', 'config', 'The timeout: five seconds by default, anything from one to sixty.'),
  L('m3', 'config', 'By default, it only prints. Turn on Invoke panic handler, and it restarts the chip instead.'),
  // 11 · the mistake
  L('x1', 'mistake', "Now the mistake. The watchdog can't tell stuck from slow."),
  L('x2', 'mistake', 'Make the button task wait ten seconds each time round its loop.'),
  L('x3', 'mistake', 'Nothing is stuck. But it checks in only every ten seconds, so the watchdog fires every time round.'),
  L('x4', 'mistake', 'In a task on the watch list, every delay must be shorter than the timeout.', undefined, 1.0),
  L('x5', 'mistake', 'And keep the check-in in the main loop, not inside the release loop. Otherwise, a jam is never caught.'),
  // 12 · payoff
  L('z1', 'payoff', "Measure your stacks, and let the watchdog watch the tasks that matter. That's stacks and the watchdog."),
];

// ── shared numbers and code (FACTS.md) ────────────────────────────────────

export const STACK = 2048;
/** QEMU, lab/logs/v0.log: blink_fast's first reading, then every reading after */
export const FIRST_FREE = 1556;
export const FREE = 1124;
export const USED = STACK - FREE; // 924
export const FIRST_USED = STACK - FIRST_FREE; // 492
/** QEMU, lab/logs/v5.log (stack 1536) and v4.log (stack 768) */
export const SMALLER = 1536;
export const SMALLER_FREE = 612;
export const TOO_SMALL = 768;
export const TOO_SMALL_FREE = 272;
export const TIMEOUT_S = 5;

export const LOG_A = '        ESP_LOGI(TAG, "%s: %u bytes never used", pcTaskGetName(NULL),';
export const LOG_B = '                 uxTaskGetStackHighWaterMark(NULL));';
export const HWM_CALL = 'uxTaskGetStackHighWaterMark(NULL)';

/** blink_task from the tasks video; `log` adds the high-water-mark line */
export const blinkCode = (log: boolean) => [
  'static void blink_task(void *arg)',
  '{',
  '    const blink_t *b = arg;',
  '    gpio_reset_pin(b->pin);',
  '    gpio_set_direction(b->pin, GPIO_MODE_OUTPUT);',
  '    while (1) {',
  '        gpio_set_level(b->pin, 1);',
  '        vTaskDelay(pdMS_TO_TICKS(b->delay_ms));',
  '        gpio_set_level(b->pin, 0);',
  '        vTaskDelay(pdMS_TO_TICKS(b->delay_ms));',
  ...(log ? [LOG_A, LOG_B] : []),
  '    }',
  '}',
];

/** app_main with the blink tasks' stack size `stack` */
export const mainCode = (stack: number) => [
  'void app_main(void)',
  '{',
  `    xTaskCreate(blink_task,  "blink_fast", ${stack}, &fast, 5, NULL);`,
  `    xTaskCreate(blink_task,  "blink_slow", ${stack}, &slow, 5, NULL);`,
  '    xTaskCreate(button_task, "button",     2048, NULL,  5, NULL);',
  '}',
];
export const BLINK_STACK_LINES = [2, 3];

export const WDT_ADD = '    ESP_ERROR_CHECK(esp_task_wdt_add(NULL));';
export const WDT_RESET = '        esp_task_wdt_reset();';
export const WDT_INCLUDE = '#include "esp_task_wdt.h"';
export const RELEASE_LOOP = '            while (gpio_get_level(BUTTON) == 0) {   // wait for the release';
/** the button task; `add` / `reset` / `include` add the watchdog lines; `delayMs` the loop's last wait */
export const buttonCode = (o: { add?: boolean; reset?: boolean; include?: boolean; delayMs?: number } = {}) => [
  ...(o.include ? [WDT_INCLUDE, ''] : []),
  'static void button_task(void *arg)',
  '{',
  '    gpio_reset_pin(BUTTON);',
  '    gpio_set_direction(BUTTON, GPIO_MODE_INPUT);',
  '    gpio_set_pull_mode(BUTTON, GPIO_PULLUP_ONLY);',
  ...(o.add ? [WDT_ADD] : []),
  '    int presses = 0;',
  '    while (1) {',
  ...(o.reset ? [WDT_RESET] : []),
  '        if (gpio_get_level(BUTTON) == 0) {          // pressed',
  '            presses++;',
  '            ESP_LOGI(TAG, "press %d", presses);',
  RELEASE_LOOP,
  '                vTaskDelay(pdMS_TO_TICKS(10));',
  '            }',
  '        }',
  `        vTaskDelay(pdMS_TO_TICKS(${o.delayMs ?? 10}));`,
  '    }',
  '}',
];

export type LogLine = { ms: number; text: string; kind: 'info' | 'err' | 'boot' };
const I = (ms: number, s: string): LogLine => ({ ms, text: `I (${ms}) stacks: ${s}`, kind: 'info' });
const E = (ms: number, s: string): LogLine => ({ ms, text: `E (${ms}) task_wdt: ${s}`, kind: 'err' });
const fast = (ms: number, n = FREE) => I(ms, `blink_fast: ${n} bytes never used`);
const slow = (ms: number, n = FREE - 4) => I(ms, `blink_slow: ${n} bytes never used`);
const WDT = (ms: number): LogLine[] => [
  E(ms, 'Task watchdog got triggered. The following tasks/users did not reset the watchdog in time:'),
  E(ms, ' - button (CPU 0/1)'),
  E(ms, 'Tasks currently running:'),
  E(ms, 'CPU 0: IDLE0'),
  E(ms, 'CPU 1: IDLE1'),
];

/** lab/logs/v0.log — the first readings */
export const LOG_DEMO: LogLine[] = [fast(1976, FIRST_FREE), fast(2376), slow(2576, FIRST_FREE - 4), fast(2776), fast(3176), slow(3576), fast(3576), fast(3976)];
/** lab/logs/v5.log — stack 1536 */
export const LOG_1536: LogLine[] = [fast(1971, 1044), fast(2371, SMALLER_FREE), fast(2771, SMALLER_FREE)];
/** lab/logs/v4.log — stack 768 */
export const LOG_768: LogLine[] = [
  fast(1957, TOO_SMALL_FREE),
  { ms: 1957, text: '***ERROR*** A stack overflow in task blink_fast has been detected.', kind: 'err' },
  { ms: 1957, text: 'Rebooting...', kind: 'boot' },
  { ms: 1957, text: 'rst:0xc (SW_CPU_RESET),boot:0x12 (SPI_FAST_FLASH_BOOT)', kind: 'boot' },
];
/** lab/logs/v1.log, 3173 … 14000 ms: the press at 3573, the watchdog at 8573 and 13573 */
export const LOG_CAUGHT: LogLine[] = (() => {
  const out: LogLine[] = [I(3573, 'press 1')];
  for (let ms = 1973; ms <= 14000; ms += 400) out.push(fast(ms, ms === 1973 ? FIRST_FREE : FREE));
  for (let ms = 2573; ms <= 14000; ms += 1000) out.push(slow(ms, ms === 2573 ? FIRST_FREE - 4 : FREE - 4));
  out.push(...WDT(8573), ...WDT(13573));
  // QEMU's order for equal timestamps: blink_slow, blink_fast, then the button / watchdog
  const rank = (l: LogLine) => (l.text.includes('blink_slow') ? 0 : l.text.includes('blink_fast') ? 1 : 2);
  return out.map((l, i) => ({ l, i })).sort((a, b) => a.l.ms - b.l.ms || rank(a.l) - rank(b.l) || a.i - b.i).map((x) => x.l);
})();
export const PRESS_MS = 3573;
/** lab/logs/vp.log — panic on */
export const LOG_PANIC: LogLine[] = [
  E(8553, ' - button (CPU 0/1)'),
  E(8553, 'Aborting.'),
  { ms: 8553, text: 'Rebooting...', kind: 'boot' },
  { ms: 8553, text: 'rst:0xc (SW_CPU_RESET),boot:0x12 (SPI_FAST_FLASH_BOOT)', kind: 'boot' },
];
/** lab/logs/v3.log — not on the watch list, jammed: only the LEDs log */
export const LOG_SILENT: LogLine[] = [I(3678, 'press 1'), fast(3778), slow(4278), fast(4178), fast(4578), fast(4978), slow(5278), fast(5378)].sort((a, b) => a.ms - b.ms);
/** lab/logs/v2.log — a 10 s wait: check-ins (derived, every loop) and the errors (logged) */
export const TRAP_CHECKINS_S = [1.57, 11.57, 21.57];
export const TRAP_ERRORS_S = [6.576, 16.566, 26.566];

/** blink_fast / blink_slow levels at scene time t, if they started at t0 (real time) */
export const ledOn = (t: number, t0: number, ms: number) => t >= t0 && Math.floor(((t - t0) * 1000) / ms) % 2 === 0;

// ── 1. problem ─────────────────────────────────────────────────────────────

export const PROBLEM = {
  cols: at('p1'),
  bytes: w('p1', '2048'),
  small: at('p2'),
  overflow: w('p2', 'overflow'),
  restarts: w('p2', 'restarts'),
  big: at('p3'),
  aside: w('p3', 'aside'),
  never: w('p3', 'never'),
  q: at('p4'),
  guess: w('p4', 'guess'),
  measure: w('p4', 'Measure'),
  captions: [
    { at: at('p1'), text: 'every task so far: a 2048-byte stack' },
    { at: at('p2'), text: 'too small → stack overflow → the chip restarts (the tasks video)' },
    { at: at('p3'), text: 'too big → wasted: the whole stack is taken when the task is made' },
    { at: at('p4'), text: 'how much does blink_task need? → measure it' },
  ] as Caption[],
};

// ── 2. the high water mark ─────────────────────────────────────────────────

/** the illustration's calls: [start, length, level as a fraction of the stack]; the peaks
 *  are the measured ones (492 and 924 of 2048 bytes), the rest is drawn for the picture */
const callsFrom = (t0: number, until: number) => {
  const out: { name: string; t: number; d: number; lvl: number }[] = [];
  const cycle: [string, number, number][] = [
    ['gpio_set_level', 0.55, 0.17],
    ['vTaskDelay', 0.75, FIRST_USED / STACK],
    ['gpio_set_level', 0.55, 0.17],
    ['vTaskDelay', 0.75, FIRST_USED / STACK],
    ['ESP_LOGI', 1.0, USED / STACK],
  ];
  let t = t0;
  for (let k = 0; t < until; k++) {
    const [name, d, lvl] = cycle[k % cycle.length];
    out.push({ name, t, d, lvl });
    t += d + 0.2;
  }
  return out;
};
export const MARK_BASE = 0.1;
export const MARK = {
  col: at('a1'),
  calls: callsFrom(at('a1') + 1.2, 60),
  back: w('a2', 'back'),
  mark: w('a3', 'mark'),
  flood: w('a3', 'flood'),
  hero: w('a4', 'high'),
  never: w('a5', 'never'),
  ask: w('a5', 'ask'),
  captions: [
    { at: at('a1'), text: 'the stack while the task runs' },
    { at: at('a2'), text: 'each call takes some · gives it back when it returns' },
    { at: at('a3'), text: 'the highest level ever reached leaves a mark' },
    { at: at('a5'), text: 'above the mark: never used → that is the number you get' },
  ] as Caption[],
};
/** the stack level (fraction) and the highest level so far, at scene time t */
export function markLevel(t: number): { level: number; high: number } {
  let level = MARK_BASE;
  let high = MARK_BASE;
  for (const c of MARK.calls) {
    if (t < c.t) break;
    const u = (t - c.t) / c.d;
    const shape = u >= 1 ? 0 : u < 0.25 ? u / 0.25 : u > 0.8 ? (1 - u) / 0.2 : 1;
    const lv = MARK_BASE + (c.lvl - MARK_BASE) * shape;
    high = Math.max(high, u >= 0.25 ? c.lvl : lv);
    if (u < 1) level = lv;
  }
  return { level, high };
}

// ── 3. uxTaskGetStackHighWaterMark ─────────────────────────────────────────

export const MEASURE = {
  intro: { show: at('e0'), insert: w('e1', 'Add'), out: w('e2', 'UX', 0, -0.4) },
  run: w('e2', 'UX'),
  args: [w('e3', 'task')],
  views: { task: at('e3'), ret: at('e4'), unit: at('e5'), range: at('e6') },
  passing: w('e3', 'Passing'),
  pc: w('e3', 'PC'),
  smallest: w('e4', 'smallest'),
  ever: w('e4', 'ever'),
  bytes: w('e5', 'bytes'),
  n2048: w('e5', '2048'),
  room: w('e6', 'room'),
  zero: w('e6', 'zero'),
  ran: w('e6', 'ran'),
  captions: [
    { at: at('e0'), text: 'blink_task from the tasks video' },
    { at: at('e1'), text: 'one new line at the end of the loop' },
    { at: w('e2', 'UX'), text: 'uxTaskGetStackHighWaterMark(NULL)' },
    { at: at('e3'), text: 'NULL → this task (like pcTaskGetName(NULL))' },
    { at: at('e4'), text: 'returns the smallest free stack this task has ever had' },
    { at: at('e5'), text: 'in bytes — the same unit as the 2048 you passed' },
    { at: at('e6'), text: 'big → lots of room · near 0 → it nearly ran out' },
  ] as Caption[],
};

// ── 4. demo ────────────────────────────────────────────────────────────────

export const DEMO = {
  flash: at('d1'),
  first: w('d2', '1556'),
  next: w('d3', '11'),
  every: w('d3', 'every'),
  why: at('d4'),
  before: w('d4', 'before'),
  log: w('d5', 'Printing'),
  biggest: w('d5', 'biggest'),
  never: w('d6', 'never'),
  lowest: w('d6', 'lowest'),
  /** when each LOG_DEMO line appears (on the VO, not real time) */
  lineAt: [at('d2') - 0.2, w('d3', '11', 0, -0.4), w('d3', '11', 1, -0.5), w('d3', 'every', 0, -0.2), w('d3', 'every', 0, 0.2), w('d3', 'every', 0, 0.6), w('d3', 'every', 0, 0.8), w('d3', 'every', 0, 1.2)],
  captions: [
    { at: at('d2'), text: 'first reading: 1556 bytes never used' },
    { at: at('d3'), text: 'then 1124 — every time' },
    { at: at('d4'), text: 'the first reading came before the first log line' },
    { at: at('d5'), text: 'a log line (printf-style formatting) takes a lot of stack: 432 bytes here' },
    { at: at('d6'), text: 'it never goes back up: the lowest so far' },
  ] as Caption[],
};

// ── 5. size it ─────────────────────────────────────────────────────────────

export const SIZE = {
  chain: at('s1'),
  minus: w('s1', 'minus'),
  used: w('s1', '924'),
  advice: at('s2'),
  margin: w('s2', 'margin'),
  n1536: at('s3'),
  spare: w('s3', '612'),
  back: w('s4', '512'),
  captions: [
    { at: at('s1'), text: '2048 − 1124 = 924 bytes used, at most' },
    { at: at('s2'), text: 'Espressif: give back most of the unused part · keep a safety margin' },
    { at: at('s3'), text: 'e.g. 1536 → 612 bytes never used (measured)' },
    { at: at('s4'), text: '512 bytes back for everything else' },
  ] as Caption[],
};

// ── 6. the stack trap ──────────────────────────────────────────────────────

export const TRAP = {
  views: { sum: at('k1'), run: at('k3'), fix: at('k5') },
  now: at('k1'),
  first: w('k1', 'first'),
  minus: w('k2', 'minus'),
  about: w('k2', '500'),
  plus: w('k2', 'plus'),
  n768: w('k2', '768'),
  flash: at('k3'),
  line272: w('k3', '272', 0, -0.6),
  fine: w('k3', 'Looks'),
  past: w('k4', 'past'),
  overflow: w('k4', 'Stack', 1),
  restarts: w('k4', 'restarts'),
  counts: at('k5'),
  fix: at('k6'),
  everything: w('k6', 'everything'),
  size: w('k6', 'size'),
  captions: [
    { at: at('k1'), text: 'the trap: size it from the first reading' },
    { at: at('k2'), text: '2048 − 1556 ≈ 500 used · + a margin → 768' },
    { at: at('k3'), text: 'first line: 272 bytes never used — looks fine' },
    { at: at('k4'), text: 'that log line runs past the end → stack overflow → restart' },
    { at: at('k5'), text: 'the number only counts code that has run so far' },
    { at: at('k6'), text: 'read it after the task has done everything it ever does' },
  ] as Caption[],
};

// ── 7. a stuck task ────────────────────────────────────────────────────────

export const STUCK = {
  half: at('w1'),
  scheduler: at('w2'),
  caught: w('w2', 'caught'),
  idle: w('w2', 'idle'),
  but: at('w3'),
  still: w('w3', 'still'),
  code: at('w4'),
  counts: w('w4', 'counts'),
  waits: w('w4', 'waits'),
  jam: w('w5', 'jams'),
  never: w('w5', 'never'),
  delay: w('w6', 'V'),
  run: w('w6', 'run'),
  nothing: w('w6', 'nothing'),
  leds: at('w7'),
  tells: w('w7', 'Nothing'),
  captions: [
    { at: at('w1'), text: 'part two: a task that gets stuck' },
    { at: at('w2'), text: 'the watchdog watches the idle tasks → it catches a task that never lets go of its core' },
    { at: at('w3'), text: 'but a task can be stuck and still let go of the core' },
    { at: at('w4'), text: 'button_task: count a press, then wait for the release' },
    { at: at('w5'), text: 'the button jams → it waits forever' },
    { at: at('w6'), text: 'it waits with vTaskDelay → the idle tasks run → no error' },
    { at: at('w7'), text: 'the LEDs keep blinking · nothing says the button task is stuck' },
  ] as Caption[],
};

// ── 8. esp_task_wdt_add / esp_task_wdt_reset ───────────────────────────────

export const WATCH = {
  views: { list: at('h1'), check: at('h3'), clock: at('h4'), inc: at('h7') },
  ask: at('h1'),
  add: w('h2', 'ESP'),
  null: w('h2', 'null'),
  list: w('h2', 'list'),
  ret: w('h3', 'returns'),
  check: w('h3', 'check'),
  opposite: w('h3', 'opposite'),
  every5: w('h4', '5'),
  reset: w('h5', 'ESP'),
  top: w('h5', 'top'),
  round: at('h6'),
  still: w('h6', 'still'),
  include: w('h7', 'ESP'),
  captions: [
    { at: at('h1'), text: 'ask the watchdog to watch this task too' },
    { at: at('h2'), text: 'esp_task_wdt_add(NULL) → this task joins the watch list' },
    { at: at('h3'), text: 'returns esp_err_t (ESP_OK = 0) → ESP_ERROR_CHECK · unlike xTaskCreate (pdPASS = 1)' },
    { at: at('h4'), text: 'now it must check in at least every 5 s' },
    { at: at('h5'), text: 'esp_task_wdt_reset() = the check-in · top of the loop' },
    { at: at('h7'), text: '#include "esp_task_wdt.h"' },
  ] as Caption[],
};

// ── 9. caught ──────────────────────────────────────────────────────────────

const PRESS_T = w('c2', 'Press', 0, -0.25);
export const CAUGHT = {
  flash: at('c1'),
  /** scene time of the log's 3573 ms (the press); the log runs in real time around it */
  press: PRESS_T,
  stuck: w('c2', 'stuck'),
  stops: w('c2', 'stops'),
  err1: +(PRESS_T + TIMEOUT_S).toFixed(2),
  err2: +(PRESS_T + 2 * TIMEOUT_S).toFixed(2),
  names: w('c3', 'names'),
  button: w('c3', 'button'),
  repeats: w('c4', 'repeats'),
  leds: at('c5'),
  exactly: w('c5', 'exactly'),
  captions: [
    { at: at('c1'), text: 'flash it · press the button · let it jam' },
    { at: at('c2'), text: 'press 1 → stuck in the release wait → no more check-ins' },
    { at: at('c3'), text: '5 s later: the watchdog names the task — button' },
    { at: at('c4'), text: 'every 5 s, until the task checks in again' },
    { at: at('c5'), text: 'the LEDs never stopped · now you know which task is stuck' },
  ] as Caption[],
};
/** the caught log's clock (ms) at scene time t */
export const caughtMs = (t: number) => PRESS_MS + (t - CAUGHT.press) * 1000;

// ── 10. menuconfig ─────────────────────────────────────────────────────────

export const CONFIG = {
  menu: at('m1'),
  timeout: w('m2', 'timeout'),
  five: w('m2', '5'),
  range: w('m2', 'anything'),
  prints: w('m3', 'prints'),
  panic: w('m3', 'invoke'),
  restarts: w('m3', 'restarts'),
  captions: [
    { at: at('m1'), text: 'idf.py menuconfig → Component config → ESP System Settings' },
    { at: at('m2'), text: 'timeout: 5 s by default · 1 to 60' },
    { at: at('m3'), text: 'Invoke panic handler → it restarts the chip instead of just printing' },
  ] as Caption[],
};

// ── 11. the mistake ────────────────────────────────────────────────────────

export const MISTAKE = {
  views: { lane: at('x2'), fix: at('x4') },
  now: at('x1'),
  slow: w('x1', 'slow'),
  ten: w('x2', '10'),
  nothing: at('x3'),
  every10: w('x3', '10'),
  fires: w('x3', 'fires'),
  /** the lane sweeps the 30 s of v2.log over this window */
  sweep: [at('x3'), end('x3') + 0.4] as [number, number],
  fix: at('x4'),
  shorter: w('x4', 'shorter'),
  main: w('x5', 'main'),
  release: w('x5', 'release'),
  never: w('x5', 'never'),
  captions: [
    { at: at('x1'), text: 'the watchdog can’t tell stuck from slow' },
    { at: at('x2'), text: 'the loop now waits 10 s' },
    { at: at('x3'), text: 'nothing stuck · a check-in every 10 s → an error every loop' },
    { at: at('x4'), text: 'every delay in a watched task < the timeout (or raise the timeout)' },
    { at: at('x5'), text: 'check in from the main loop — not inside the release wait' },
  ] as Caption[],
};

// ── 12. payoff ─────────────────────────────────────────────────────────────

export const PAYOFF = {
  word: w('z1', 'That'),
  recap: [
    { at: w('z1', 'That', 0, 1.6), k: 'uxTaskGetStackHighWaterMark(NULL)', v: 'the least free stack so far, in bytes' },
    { at: w('z1', 'That', 0, 1.95), k: 'stack size', v: 'most used + a margin · measure after everything ran' },
    { at: w('z1', 'That', 0, 2.3), k: 'esp_task_wdt_add(NULL)', v: 'watch this task' },
    { at: w('z1', 'That', 0, 2.65), k: 'esp_task_wdt_reset()', v: 'check in, every time round the main loop' },
    { at: w('z1', 'That', 0, 3.0), k: 'next', v: 'queues' },
  ],
};
