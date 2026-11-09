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

// ── generated: VO plan (node scripts/vo-plan.ts freertos-tasks) — do not edit by hand ──
export const VO_AT: Record<string, number> = {"p1":0.6,"p2":10.12,"p3":28,"a1":0.5,"a2":7.4,"a3":13.82,"a4":22.62,"f1":0.5,"f2":5.92,"f3":16.58,"f4":24.62,"f5":35.1,"c0":0.5,"c0b":5.94,"c1":7.48,"c2":13.02,"c3":20.72,"c4":34.38,"c4b":47.64,"c5":53.38,"c6":62.3,"c7":69.76,"c7b":77.4,"c7c":86.9,"q1":0.5,"q2":6.18,"q3":12.92,"q4":23.98,"q4b":32.42,"q5":38.76,"q6":45.64,"q7":51.74,"q8":61.72,"d1":0.5,"d2":8.34,"d3":18.96,"d3b":28.9,"v1":0.5,"v2":7.76,"v3":13.48,"v4":21.66,"v5":28.42,"x1":0.5};
export const SCENE_DUR: Record<string, number> = {"problem":39.1,"answer":30.28,"fn":42.86,"create":96.26,"params":67.64,"demo":37.06,"delay":38.38,"payoff":10.72};
export const VO_WORDS: Record<string, [string, number][]> = {
  p1: [["Let's",0],["say",0.3],["you",0.42],["want",0.54],["two",0.72],["LEDs",1.04],["blinking",1.64],["at",2.06],["two",2.64],["different",2.94],["speeds.",3.26],["One",4.34],["switching",4.54],["every",4.94],["200",5.52],["milliseconds",6.16],["and",6.54],["the",7.4],["other",7.52],["every",7.82],["500.",8.42]],
  p2: [["The",0],["obvious",0.24],["first",0.5],["tries",0.86],["to",1.26],["put",1.48],["both",1.64],["in",1.94],["one",2.28],["loop,",2.5],["but",3.26],["then",3.36],["each",3.54],["V",3.86],["-TAS",4.04],["delay",4.36],["holds",4.74],["up",5.12],["the",5.34],["other",5.54],["LED.",5.88],["One",6.88],["pass",7.12],["takes",7.42],["200,",7.72],["plus",8.94],["200,",9],["plus",10],["500,",10.3],["plus",11.42],["500",11.68],["milliseconds,",12.3],["so",13.38],["both",13.62],["LEDs",13.92],["only",14.34],["repeat",14.88],["every",15.34],["1400",15.88],["milliseconds.",16.48]],
  p3: [["You",0],["could",0.22],["count",0.34],["ticks,",0.56],["and",1.32],["juggle",1.44],["both",1.8],["LEDs",2],["by",2.44],["hand,",2.84],["but",3.66],["your",3.84],["ESP32",3.96],["is",5.04],["already",5.8],["running",6.26],["something",6.6],["that",7.08],["does",7.5],["the",7.7],["juggling",7.88],["for",8.16],["you.",8.48]],
  a1: [["The",0],["fix",0.22],["is",0.4],["to",0.56],["give",0.68],["each",0.82],["LED",1.2],["its",1.68],["own",2.34],["loop",2.66],["with",3],["its",3.44],["own",3.56],["delay.",3.7],["Each",4.54],["of",4.64],["those",4.78],["loops",4.94],["becomes",5.3],["a",5.78],["task.",5.98]],
  a2: [["A",0],["scheduler",0.24],["shares",0.72],["the",1.12],["CPU",1.34],["between",1.86],["the",2.28],["tasks.",2.44],["While",3.42],["one",3.64],["task",3.92],["waits,",4.3],["another",5.12],["one",5.28],["runs.",5.54]],
  a3: [["That",0],["scheduler",0.24],["is",0.72],["free",1],["RTOS",1.46],["and",2.24],["it",2.96],["started",3.06],["before",3.42],["your",3.74],["code",3.9],["did.",4.12],["In",4.84],["fact,",4.9],["App",5.84],["main",5.9],["itself",6.08],["runs",6.44],["in",6.86],["a",7.04],["task",7.14],["called",7.52],["main.",7.82]],
  a4: [["Each",0],["one",0.28],["is",0.52],["a",0.68],["function",0.96],["with",1.14],["its",1.48],["own",1.6],["stack,",1.9],["run",2.94],["by",3.26],["the",3.46],["scheduler,",3.58],["and",4.38],["that's",4.54],["called",4.7],["a",4.82],["task.",4.92]],
  f1: [["A",0],["task",0.2],["starts",0.42],["out",0.72],["as",1.02],["a",1.34],["function.",1.5],["It",2.26],["takes",2.42],["one",2.58],["void",2.88],["pointer",3.14],["and",3.54],["returns",4.1],["nothing.",4.48]],
  f2: [["This",0],["one",0.22],["sets",0.38],["up",0.56],["its",0.72],["pin",0.86],["and",1.16],["then",1.82],["loops",1.92],["forever.",2.22],["It",3.32],["turns",3.42],["the",3.64],["LED",3.76],["on,",4.04],["waits,",4.98],["turns",5.74],["it",5.94],["off,",6.12],["and",6.8],["waits",6.86],["again",7.14],["using",7.52],["the",8],["same",8.22],["calls",8.48],["as",8.78],["in",9],["the",9.1],["GPIO",9.18],["video.",9.54]],
  f3: [["A",0],["task",0.22],["function",0.44],["must",0.86],["never",1.4],["return.",1.8],["If",2.74],["it",2.82],["does,",2.94],["ESP",4.5],["-ID",4.5],["-F",5.02],["logs",5.68],["an",5.94],["error",6.2],["and",6.44],["aborts.",6.92]],
  f4: [["Suppose",0],["you",0.38],["only",0.56],["want",0.66],["10",0.88],["blinks.",1.08],["Then",2.1],["you",2.18],["swap",2.34],["the",2.6],["forever",2.82],["loop",3.24],["for",3.56],["a",3.82],["loop",3.96],["that",4.16],["counts",4.38],["to",4.64],["10",4.82],["and",5.1],["when",5.72],["it's",5.84],["done,",5.98],["the",6.56],["task",6.66],["deletes",6.98],["itself",7.42],["with",7.84],["vtaskdelete",8.44],["and",9.44],["null.",9.74]],
  f5: [["Null",0],["means",0.26],["the",0.46],["task",0.72],["that's",1.12],["making",1.38],["a",1.52],["call.",1.7],["The",2.46],["task",2.56],["ends,",2.9],["and",3.84],["the",3.92],["idle",4.04],["task",4.28],["frees",4.76],["its",5.28],["stack.",5.42]],
  c0: [["Back",0],["in",0.3],["App",0.44],["Main,",0.58],["there",1.18],["are",1.28],["two",1.4],["calls",1.56],["to",1.86],["xTask",2.08],["Create,",2.6],["one",3.5],["for",3.8],["each",4.1],["LED.",4.52]],
  c0b: [["Let's",0],["take",0.28],["the",0.38],["first",0.52],["one.",0.74]],
  c1: [["X",0],["task",0.3],["create",0.54],["turns",0.94],["blink",1.36],["task",1.74],["into",2.2],["a",2.8],["task",2.96],["and",3.42],["it",3.98],["takes",4.06],["six",4.26],["arguments",4.5]],
  c2: [["First",0],["comes",0.36],["the",0.6],["function",0.8],["itself.",1.08],["You",2.1],["pass",2.22],["its",2.44],["name",2.62],["without",2.84],["brackets,",3.2],["because",4.1],["you're",4.42],["handing",4.72],["the",4.92],["function",5.12],["over,",5.4],["not",6.18],["calling",6.42],["it.",6.76]],
  c3: [["Next",0],["comes",0.28],["a",0.48],["name,",0.64],["which",1.38],["is",1.52],["used",1.66],["only",1.96],["for",2.3],["debugging.",2.56],["FreeRTOS",3.82],["keeps",4.44],["15",4.86],["characters,",5.48],["so",6.48],["a",6.66],["longer",6.78],["name",7.02],["is",7.34],["cut",7.66],["short.",7.9],["Even",8.82],["Espressif's",8.98],["own",9.68],["GPIO",10.04],["example",10.6],["loses",11.2],["its",11.74],["last",12.04],["two",12.42],["letters.",12.7]],
  c4: [["Then",0],["comes",0.32],["the",0.58],["stack",0.74],["size,",1.02],["2048.",1.86],["In",3.52],["ESP",3.62],["-IDF,",4.06],["that",5.86],["number",5.98],["is",6.26],["in",6.48],["bytes.",6.6],["In",7.52],["vanilla",7.66],["-free",7.98],["RTOS,",8.34],["the",9.64],["same",9.72],["number",9.98],["would",10.16],["mean",10.34],["words,",10.56],["and",11.46],["a",11.7],["word",11.8],["is",11.98],["4",12.14],["bytes.",12.48]],
  c4b: [["So",0],["in",0.34],["vanilla",0.48],["-free",0.82],["RTOS,",1.24],["the",2.8],["same",2.86],["number",3.1],["gives",3.34],["you",3.56],["four",3.78],["times",4.2],["the",4.54],["stack.",4.74]],
  c5: [["The",0],["stack",0.24],["holds",0.42],["the",0.66],["task's",0.86],["local",1.32],["variables,",1.54],["its",2.54],["function",2.66],["calls,",3],["and",3.78],["its",3.94],["registers",4.08],["while",4.46],["it's",4.72],["switched",4.86],["out.",5.04],["It",5.82],["comes",5.92],["from",6.12],["a",6.32],["heap",6.42],["when",6.66],["the",7.12],["task",7.24],["is",7.58],["created.",7.8]],
  c6: [["For",0],["scale,",0.3],["Atmane's",1.32],["task",1.72],["has",1.94],["4096",2.22],["bytes,",2.98],["and",4.4],["the",4.48],["idle",4.6],["task",4.78],["has",5.26],["1536.",5.42]],
  c7: [["Now",0],["for",0.28],["the",0.44],["trap.",0.54],["If",1.32],["you",1.4],["make",1.48],["the",1.6],["stack",1.72],["too",1.98],["small,",2.24],["the",3.16],["task",3.24],["calls",3.56],["run",3.88],["past",4.3],["the",4.8],["end",5.04],["of",5.2],["it.",5.32],["That's",5.9],["called",6.04],["a",6.14],["stack",6.26],["overflow.",6.58]],
  c7b: [["At",0],["every",0.26],["task",0.64],["switch,",0.98],["FreeRTOS",1.84],["checks",2.74],["the",3.24],["end",3.48],["of",3.74],["each",3.88],["stack.",4.06],["If",4.94],["it's",5.12],["been",5.24],["overwritten,",5.34],["the",6.3],["chip",6.34],["prints",6.54],["the",6.86],["task's",7.08],["name",7.54],["and",7.74],["restarts.",8.22]],
  c7c: [["You",0],["will",0.22],["meet",0.32],["this",0.5],["one.",0.7],["A",1.46],["task",1.56],["that",1.84],["reboots",2.08],["the",2.7],["chip",2.92],["with",3.12],["this",3.32],["message",3.5],["has",3.86],["outgrown",4.04],["its",4.56],["stack,",4.74],["and",5.5],["the",5.74],["fix",5.84],["is",6.04],["to",6.26],["give",6.4],["it",6.52],["a",6.6],["bigger",6.7],["one.",6.88]],
  q1: [["Next",0],["comes",0.28],["the",0.52],["parameter.",0.7],["Whatever",1.76],["pointer",2],["you",2.34],["pass",2.52],["here",2.82],["arrives",3.08],["in",3.48],["the",3.72],["task",3.82],["as",4.3],["arg.",4.78]],
  q2: [["That's",0],["how",0.32],["one",0.46],["function",0.76],["can",1.18],["blink",1.44],["two",1.72],["LEDs.",2.14],["Each",3.58],["task",3.72],["gets",4],["its",4.22],["own",4.38],["pin",4.54],["and",4.94],["its",5.54],["own",5.64],["delay.",5.78]],
  q3: [["The",0],["pointer",0.24],["has",0.46],["to",0.7],["stay",0.86],["valid",1.08],["for",1.42],["as",1.64],["long",1.76],["as",2.1],["the",2.3],["task",2.4],["runs.",2.72],["That's",3.64],["why",3.8],["fast",3.94],["and",4.34],["slow",4.62],["are",4.98],["static.",5.12],["A",6.06],["local",6.16],["variable",6.42],["in",6.88],["app",7.06],["main",7.26],["will",7.48],["be",7.66],["gone",7.8],["as",8.06],["soon",8.4],["as",8.84],["app",9.34],["main",9.64],["returns.",9.88]],
  q4: [["Then",0],["comes",0.3],["the",0.64],["priority.",0.8],["Higher",1.96],["numbers",2.12],["win.",2.44],["When",3.38],["two",3.52],["tasks",3.76],["are",4.16],["ready,",4.42],["the",5.16],["scheduler",5.22],["runs",5.68],["the",5.98],["one",6.18],["with",6.44],["the",6.64],["higher",6.76],["priority",7.04],["first.",7.48]],
  q4b: [["Zero",0],["belongs",0.38],["to",0.82],["the",1.04],["idle",1.14],["tasks.",1.36],["App",2.56],["main",2.66],["runs",2.86],["at",3.14],["1,",3.32],["and",4.08],["the",4.28],["highest",4.38],["priority",4.64],["is",5.08],["24.",5.44]],
  q5: [["5",0],["outranks",0.4],["App",0.94],["main,",1.16],["so",1.82],["the",2.02],["new",2.14],["task",2.3],["starts",2.6],["running",2.86],["straight",3.12],["away,",3.36],["and",4.24],["App",4.34],["main",4.6],["carries",4.78],["on",5.08],["once",5.3],["the",5.44],["task",5.58],["waits.",5.86]],
  q6: [["Last",0],["comes",0.44],["the",0.76],["handle,",0.94],["which",1.82],["is",1.86],["a",2],["way",2.08],["to",2.18],["refer",2.36],["to",2.66],["the",2.9],["task",3],["later.",3.28],["Pass",4.08],["null",4.32],["if",4.54],["you",4.7],["don't",4.78],["need",5.02],["it.",5.14]],
  q7: [["X",0],["task",0.28],["create",0.52],["returns",0.94],["pd",1.42],["pass,",1.94],["which",2.64],["is",2.9],["one.",3.02],["That's",3.6],["not",3.9],["an",4.06],["ESP",4.2],["error",4.6],["code.",4.98],["So",5.66],["don't",5.94],["wrap",6.24],["it",6.46],["in",6.6],["ESP",6.7],["error",7.18],["check,",7.56],["or",8.28],["success",8.5],["would",9],["abort.",9.24]],
  q8: [["And",0],["if",0.2],["the",0.32],["heap",0.4],["can't",0.52],["fit",0.9],["the",1],["stack,",1.16],["it",2],["returns",2.16],["minus",2.6],["one",3.08],["instead.",3.5]],
  d1: [["Now",0],["flash",0.3],["it.",0.62],["App",1.4],["main",1.42],["creates",1.62],["both",1.96],["tasks",2.22],["and",2.72],["returns.",3.18],["The",4.2],["log",4.3],["shows",4.5],["it,",4.82],["and",5.38],["then",5.58],["the",5.68],["main",5.78],["task",6.02],["is",6.54],["deleted.",6.82]],
  d2: [["The",0],["LEDs",0.24],["don't",0.62],["notice.",1.16],["Each",2.08],["task",2.24],["switches",2.56],["its",2.9],["own",3.22],["LED",3.62],["at",4.08],["its",4.5],["own",4.62],["pace.",4.8],["One",5.8],["every",6.16],["200",6.7],["milliseconds",7.32],["and",7.74],["the",8.46],["other",8.6],["every",8.88],["500.",9.42]],
  d3: [["Both",0],["tasks",0.34],["run",0.76],["the",1.08],["same",1.26],["function,",1.52],["but",2.36],["each",2.54],["one",2.76],["has",3.02],["its",3.24],["own",3.4],["stack.",3.62],["And",4.6],["so",4.66],["its",4.84],["own",4.98],["b.",5.16],["The",5.92],["pointer",6.14],["that",6.38],["blink",6.62],["task",6.94],["reads",7.32],["from",7.66],["arg",7.92],["at",8.22],["the",8.6],["top",8.7],["of",8.88],["the",8.98],["function.",9.06]],
  d3b: [["One",0],["B",0.36],["points",0.5],["at",0.82],["fast",0.98],["and",1.44],["the",1.96],["other",2.06],["points",2.22],["at",2.46],["slow.",2.62],["It's",3.52],["the",3.66],["same",3.8],["code",4.04],["with",4.42],["different",4.92],["settings.",5.22]],
  v1: [["So",0],["what",0.26],["does",0.36],["VTAS",0.5],["delay",1.04],["really",1.32],["do?",1.62],["It",2.48],["takes",2.54],["the",2.7],["task",2.88],["off",3.26],["the",3.7],["CPU",3.9],["and",4.2],["blocks",4.9],["it",5.2],["for",5.52],["a",6.04],["number",6.08],["of",6.18],["ticks.",6.36]],
  v2: [["A",0],["tick",0.26],["comes",0.38],["every",0.68],["10",1.14],["milliseconds,",1.5],["so",2.52],["200",2.82],["milliseconds",3.46],["is",3.94],["20",4.52],["ticks.",4.88]],
  v3: [["On",0],["every",0.26],["tick,",0.7],["free",1.36],["RTOS",1.58],["checks",2.1],["whose",2.5],["time",2.76],["is",3],["up.",3.16],["After",4.04],["20",4.04],["ticks,",4.3],["blink",5.08],["fast,",5.18],["is",6.06],["ready",6.16],["again,",6.36],["and",7.08],["it",7.16],["runs.",7.24]],
  v4: [["While",0],["both",0.26],["tasks",0.5],["are",0.84],["blocked,",1.04],["the",1.92],["CPU",1.96],["runs",2.32],["the",2.8],["idle",3],["task,",3.22],["and",4.02],["most",4.18],["of",4.34],["the",4.5],["time,",4.56],["that's",5.26],["all",5.56],["it's",5.68],["doing.",5.86]],
  v5: [["and",0],["the",0.26],["ESP32",0.34],["has",1.46],["two",2.02],["cores.",2.3],["X",3.36],["-Task",3.44],["Create",3.64],["lets",4.06],["a",4.28],["task",4.48],["run",4.76],["on",5.16],["either",5.52],["one",5.76],["and",6.28],["that",6.82],["gets",6.96],["a",7.1],["video",7.22],["of",7.42],["its",7.64],["own.",7.74]],
  x1: [["So",0],["give",0.34],["every",0.52],["job",1],["its",1.3],["own",1.5],["loop",1.72],["and",2.08],["let",2.64],["the",2.74],["scheduler",2.88],["run",3.3],["them",3.46],["all.",3.58],["That's",4.22],["a",4.4],["task.",4.46]],
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

export const TAIL: Record<string, number> = { problem: 2.4, answer: 2.4, fn: 2.0, create: 2.2, params: 2.0, demo: 2.6, delay: 2.0, payoff: 5.4 };
const dur = (id: string, fallback: number) => SCENE_DUR[id] ?? fallback;
export const SCENES: { id: SceneId; dur: number }[] = (
  [
    ['problem', 31.5],
    ['answer', 25.7],
    ['fn', 43.4],
    ['create', 92.2],
    ['params', 61.4],
    ['demo', 32.9],
    ['delay', 37.7],
    ['payoff', 9.6],
  ] as [SceneId, number][]
).map(([id, f]) => ({ id, dur: dur(id, f) }));

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
  leds: w('p1', 'LEDs'),
  fast: w('p1', 'switching'),
  slow: w('p1', 'other'),
  loop: w('p2', 'loop'),
  holds: w('p2', 'holds'),
  pass: w('p2', 'pass'),
  sum: [w('p2', 'plus', 0, -0.7), w('p2', 'plus', 0, 0.2), w('p2', 'plus', 1, 0.2), w('p2', 'plus', 2, 0.2)] as number[],
  total: w('p2', 'milliseconds', 1, -0.9),
  both: w('p2', 'both'),
  hand: w('p3', 'juggle'),
  already: w('p3', 'already'),
  captions: [
    { at: at('p1'), text: 'GPIO 2: switch every 200 ms · GPIO 19: every 500 ms' },
    { at: at('p2'), text: 'one loop: each vTaskDelay holds up the other LED → both repeat every 1400 ms' },
    { at: at('p3'), text: 'counting ticks by hand = writing a scheduler · one is already running' },
  ] as Caption[],
};

// ── 2. answer ──────────────────────────────────────────────────────────────

export const ANSWER = {
  own: w('a1', 'own'),
  becomes: w('a1', 'becomes'),
  sched: w('a2', 'scheduler'),
  waits: w('a2', 'waits'),
  runs: w('a2', 'runs'),
  rtos: w('a3', 'is', 0, 0.25),
  before: w('a3', 'before'),
  main: w('a3', 'app'),
  called: w('a3', 'called'),
  stack: w('a4', 'stack'),
  scheduler: w('a4', 'scheduler'),
  word: w('a4', 'called', 0, 0.3),
};

// ── 3. the task function ──────────────────────────────────────────────────

export const FN = {
  views: { sig: at('f1'), body: at('f2'), never: at('f3'), del: at('f4') },
  sig: {
    fn: w('f1', 'function'),
    voidp: w('f1', 'void'),
    nothing: w('f1', 'nothing'),
  },
  body: {
    setup: w('f2', 'sets'),
    loops: w('f2', 'loops'),
    on: w('f2', 'on'),
    wait1: w('f2', 'waits'),
    off: w('f2', 'off'),
    wait2: w('f2', 'waits', 1),
    same: w('f2', 'same'),
  },
  never: {
    never: w('f3', 'never'),
    does: w('f3', 'does'),
    logs: w('f3', 'logs'),
    aborts: w('f3', 'aborts'),
  },
  del: {
    ten: w('f4', 'blinks', 0, -0.4),
    swap: w('f4', 'swap'), // → while (1) becomes for (… 10 …)
    counted: w('f4', 'counts'),
    done: w('f4', 'done'),
    deletes: w('f4', 'deletes'), // → vTaskDelete(NULL) appears
    vtd: w('f4', 'with', 0, 0.3),
    nul: at('f5'),
    ends: w('f5', 'ends'),
    frees: w('f5', 'frees'),
  },
  lines: { sig: [0], body: [3, 4, 6, 7, 8, 9, 10], never: [11, 12], del: [6, 12] } as Record<string, number[]>,
  captions: [
    { at: at('f1'), text: 'a task function: void fn(void *arg) — one pointer in, nothing out' },
    { at: at('f2'), text: 'set up the pin, then loop forever — the GPIO video\'s calls' },
    { at: at('f3'), text: 'never return: ESP-IDF logs an error and aborts' },
    { at: at('f4'), text: 'to end on purpose: a counted loop, then vTaskDelete(NULL)' },
    { at: at('f5'), text: 'vTaskDelete(NULL) = delete the calling task · the idle task frees its stack' },
  ] as Caption[],
};

/** QEMU, lab/logs/v1.log and v2.log */
export const LOG_RETURN = 'E (1759) FreeRTOS: FreeRTOS Task "blink_fast" should not return, Aborting now!';
export const LOG_OVERFLOW = '***ERROR*** A stack overflow in task blink_fast has been detected.';

// ── 4. xTaskCreate ①: function, name, stack ──────────────────────────────

export const CREATE = {
  // the opening: app_main, with both calls; the first one is pulled out
  main: {
    show: at('c0'),
    two: w('c0', 'two'),
    each: w('c0', 'each'),
    pick: w('c0b', 'first'), // → the rest fades, the first call lights
    out: at('c1'), // → the panel goes, the big call line arrives
  },
  run: at('c1'),
  six: w('c1', 'six'),
  args: [w('c2', 'function'), w('c3', 'name'), w('c4', 'stack')],
  views: { fn: at('c2'), name: at('c3'), bytes: at('c4'), holds: at('c5'), scale: at('c6'), overflow: at('c7') },
  fn: {
    brackets: w('c2', 'brackets'),
    handing: w('c2', 'handing'),
    calling: w('c2', 'calling'),
  },
  name: {
    show: at('c3') + 0.24,
    debug: w('c3', 'debugging'),
    fifteen: w('c3', 'characters', 0, -0.6),
    cut: w('c3', 'cut'),
    example: w('c3', 'example'),
    loses: w('c3', 'loses'),
  },
  bytes: {
    n: w('c4', 'size', 0, 0.6),
    bytes: w('c4', 'bytes'),
    vanilla: w('c4', 'vanilla'),
    words: w('c4', 'words'),
    word4: w('c4', 'bytes', 1, -0.6),
    four: at('c4b'),
    same: w('c4b', 'same'),
    fourStack: w('c4b', 'times'),
  },
  holds: {
    locals: w('c5', 'local'),
    calls: w('c5', 'calls'),
    regs: w('c5', 'registers'),
    heap: w('c5', 'heap'),
  },
  scale: {
    main: w('c6', 'scale', 0, 0.6),
    k4: w('c6', 'has', 0, 0.4),
    ours: at('c6'),
    idle: w('c6', 'idle'),
  },
  overflow: {
    trap: w('c7', 'trap'),
    small: w('c7', 'small'), // → the stack grows, call by call
    past: w('c7', 'past'),
    overflow: w('c7', 'overflow'),
    check: w('c7b', 'checks'),
    catches: w('c7b', 'overwritten'),
    prints: w('c7b', 'prints'),
    restarts: w('c7b', 'restarts'),
    meet: w('c7c', 'meet'),
    reboots: w('c7c', 'reboots'),
    outgrown: w('c7c', 'outgrown'),
    fix: w('c7c', 'fix'),
    bigger: w('c7c', 'bigger'),
  },
  captions: [
    { at: at('c0'), text: 'app_main: two calls to xTaskCreate — one task per LED' },
    { at: at('c1'), text: 'xTaskCreate(function, name, stack, parameter, priority, handle)' },
    { at: at('c2'), text: 'the function, without () — passed, not called' },
    { at: at('c3'), text: 'a name for debugging · at most 15 characters are kept' },
    { at: at('c4'), text: 'ESP-IDF: stack size in BYTES · vanilla FreeRTOS: words' },
    { at: at('c4b'), text: '1 word = 4 bytes → the same 2048 is four times as much stack' },
    { at: at('c5'), text: 'the stack: locals, calls, saved registers · from the heap at creation' },
    { at: at('c6'), text: 'main task 4096 B · ours 2048 B · idle 1536 B' },
    { at: at('c7'), text: 'too small → the calls run past the end of the stack: a stack overflow' },
    { at: at('c7b'), text: 'checked at every task switch → the task\'s name is printed, the chip restarts' },
    { at: at('c7c'), text: 'the usual fix: a bigger stack' },
  ] as Caption[],
};

// ── 5. xTaskCreate ②: parameter, priority, handle, return ────────────────

export const PARAMS = {
  args: [0.25, 0.35, 0.45, w('q1', 'parameter'), w('q4', 'priority'), w('q6', 'handle')], // the first three are already known
  views: { arg: at('q1'), two: at('q2'), life: at('q3'), prio: at('q4'), preempt: at('q5'), handle: at('q6'), ret: at('q7') },
  arg: {
    pointer: w('q1', 'Whatever'),
    arrives: w('q1', 'arrives'),
    asArg: w('q1', 'arg'),
  },
  two: {
    one: w('q2', 'one'),
    two: w('q2', 'two'),
    pin: w('q2', 'pin'),
    delay: w('q2', 'delay'),
  },
  life: {
    valid: w('q3', 'valid'),
    statik: w('q3', 'static'),
    local: w('q3', 'local'),
    gone: w('q3', 'gone'),
    returns: w('q3', 'returns'),
  },
  prio: {
    ours: at('q4') + 0.66, // our 5 lands on the ladder
    higher: w('q4', 'Higher'),
    ready: w('q4', 'ready'),
    first: w('q4', 'first'),
    zero: at('q4b'),
    one: w('q4b', '1'),
    top: w('q4b', 'highest'),
  },
  preempt: {
    outranks: w('q5', 'outranks'),
    straight: w('q5', 'straight'),
    carries: w('q5', 'carries'),
    waits: w('q5', 'waits'),
  },
  handle: {
    refer: w('q6', 'refer'),
    nul: w('q6', 'Pass'),
  },
  ret: {
    pdpass: w('q7', 'returns', 0, 0.4),
    one: w('q7', 'one'),
    notErr: w('q7', 'not'),
    check: w('q7', 'wrap', 0, 0.8),
    abort: w('q7', 'abort'),
    heap: w('q8', 'heap'),
    minus: w('q8', 'minus'),
  },
  captions: [
    { at: at('q1'), text: 'the parameter: any pointer → arrives as arg' },
    { at: at('q2'), text: 'one function, two tasks: each gets its own pin and delay' },
    { at: at('q3'), text: 'it must outlive the task → static, not a local in app_main' },
    { at: at('q4'), text: 'priority: a higher number runs first when both are ready' },
    { at: at('q4b'), text: 'priority 0…24 · idle 0 · app_main 1 · ours 5' },
    { at: at('q5'), text: '5 > 1 → the new task runs at once; app_main resumes when it blocks' },
    { at: at('q6'), text: 'the handle: refer to the task later — or NULL' },
    { at: at('q7'), text: 'returns pdPASS (1), not ESP_OK (0) → no ESP_ERROR_CHECK · −1 = out of memory' },
  ] as Caption[],
};

// ── 6. demo ────────────────────────────────────────────────────────────────

/** QEMU, lab/logs/v0.log */
export const LOG_BOOT = ['I (3200) main_task: Started on CPU0', 'I (3210) main_task: Calling app_main()', 'I (3210) main_task: Returned from app_main()'];

export const DEMO = {
  flash: at('d1'),
  creates: w('d1', 'creates'),
  returns: w('d1', 'returns'),
  log: w('d1', 'log'),
  deleted: w('d1', 'deleted'),
  blink: w('d1', 'creates'), // the LEDs start when the tasks are created
  own: w('d2', 'own'),
  ms200: w('d2', 'milliseconds', 0, -0.9),
  ms500: w('d2', 'other', 0, 0.3),
  same: w('d3', 'same'),
  stack: w('d3', 'stack'),
  b: w('d3', 'own', 1, 0.3),
  pointer: w('d3', 'pointer'), // → the line of code
  arg: w('d3', 'arg'),
  fastB: at('d3b'),
  slowB: w('d3b', 'other'),
  settings: w('d3b', 'same'),
  captions: [
    { at: at('d1'), text: 'app_main creates two tasks and returns — the main task is deleted' },
    { at: at('d2'), text: 'the LEDs keep going: GPIO 2 every 200 ms · GPIO 19 every 500 ms' },
    { at: at('d3'), text: 'same function, two stacks → two copies of b = the pointer taken from arg' },
    { at: at('d3b'), text: 'b → &fast in one task, b → &slow in the other' },
  ] as Caption[],
};

// ── 7. what vTaskDelay does ────────────────────────────────────────────────

export const DELAY = {
  views: { states: at('v1'), ticks: at('v2'), idle: at('v4'), cores: at('v5') },
  states: {
    off: w('v1', 'off'),
    blocks: w('v1', 'blocks'),
    ticks: w('v1', 'ticks'),
  },
  ticks: {
    ten: w('v2', 'every'),
    ms200: w('v2', 'so', 0, 0.3),
    twenty: w('v2', 'ticks', 0, -0.6),
    every: at('v3') + 0.24,
    checks: w('v3', 'checks'),
    after: w('v3', 'After'),
    ready: w('v3', 'ready'),
    runs: w('v3', 'runs'),
  },
  idle: {
    blocked: w('v4', 'blocked'),
    idle: w('v4', 'idle'),
    most: w('v4', 'most'),
  },
  cores: {
    two: w('v5', 'two'),
    either: w('v5', 'either'),
    own: w('v5', 'own'),
  },
  captions: [
    { at: at('v1'), text: 'vTaskDelay: Running → Blocked, for a number of ticks' },
    { at: at('v2'), text: '1 tick = 10 ms → pdMS_TO_TICKS(200) = 20 ticks' },
    { at: at('v3'), text: 'every tick: whose time is up? → Ready → Running' },
    { at: at('v4'), text: 'both blocked → the CPU runs the idle task' },
    { at: at('v5'), text: 'two cores · xTaskCreate → either one (tskNO_AFFINITY)' },
  ] as Caption[],
};

// ── 8. payoff ──────────────────────────────────────────────────────────────

const PAY_LINE = w('x1', 'That');
export const PAYOFF = {
  job: w('x1', 'every'),
  line: PAY_LINE,
  recap: [
    { at: PAY_LINE + 1.2, k: 'void fn(void *arg) { while (1) … }', v: 'never returns' },
    { at: PAY_LINE + 1.55, k: 'xTaskCreate(fn, name, bytes, arg, prio, &h)', v: 'a task, ready to run' },
    { at: PAY_LINE + 1.9, k: 'vTaskDelay(pdMS_TO_TICKS(ms))', v: 'blocks only this task' },
    { at: PAY_LINE + 2.25, k: 'static params · pdPASS ≠ ESP_OK', v: 'the traps' },
    { at: PAY_LINE + 2.6, k: 'priority 0…24', v: 'next: the scheduler' },
  ],
};

// ── voiceover (scratch: edge-tts) ─────────────────────────────────────────

export type VoLine = { id: string; scene: SceneId; at: number; text: string; say?: string; pause?: number };
export const VOICE = 'en-US-AndrewMultilingualNeural';
const L = (id: string, scene: SceneId, text: string, o: { say?: string; pause?: number } = {}): VoLine => ({ id, scene, at: at(id), text, ...o });
const RTOS = 'free R-T-O-S';

export const VO: VoLine[] = [
  // 1 · problem: the want, and the first try
  L('p1', 'problem', "Let's say you want two LEDs blinking at two different speeds: one switching every two hundred milliseconds, and the other every five hundred.", { pause: 0.6 }),
  L('p2', 'problem', 'The obvious first try is to put both in one loop. But then each vTaskDelay holds up the other LED. One pass takes two hundred, plus two hundred, plus five hundred, plus five hundred milliseconds, so both LEDs only repeat every fourteen hundred milliseconds.', { say: 'The obvious first try is to put both in one loop. But then each V task delay holds up the other LED. One pass takes two hundred, plus two hundred, plus five hundred, plus five hundred milliseconds, so both LEDs only repeat every fourteen hundred milliseconds.', pause: 0.7 }),
  L('p3', 'problem', 'You could count ticks, and juggle both LEDs by hand. But your ESP32 is already running something that does the juggling for you.', { pause: 0.8 }),
  // 2 · answer
  L('a1', 'answer', 'The fix is to give each LED its own loop, with its own delay. Each of those loops becomes a task.'),
  L('a2', 'answer', 'A scheduler shares the CPU between the tasks. While one task waits, another one runs.', { pause: 0.6 }),
  L('a3', 'answer', 'That scheduler is FreeRTOS, and it started before your code did. In fact, app_main itself runs in a task, called main.', { say: `That scheduler is ${RTOS}, and it started before your code did. In fact, app main itself runs in a task, called main.`, pause: 0.6 }),
  L('a4', 'answer', "Each one is a function with its own stack, run by the scheduler, and that's called a task.", { pause: 0.7 }),
  // 3 · the task function
  L('f1', 'fn', 'A task starts out as a function. It takes one void pointer, and returns nothing.'),
  L('f2', 'fn', 'This one sets up its pin, and then loops forever. It turns the LED on, waits, turns it off, and waits again, using the same calls as in the GPIO video.', { pause: 0.6 }),
  L('f3', 'fn', 'A task function must never return. If it does, ESP-IDF logs an error, and aborts.', { say: 'A task function must never return. If it does, E S P I D F logs an error, and aborts.', pause: 0.8 }),
  L('f4', 'fn', "Suppose you only want ten blinks. Then you swap the forever loop for a loop that counts to ten, and when it's done, the task deletes itself, with vTaskDelete and NULL.", { say: "Suppose you only want ten blinks. Then you swap the forever loop for a loop that counts to ten, and when it's done, the task deletes itself, with V task delete and null.", pause: 0.8 }),
  L('f5', 'fn', "NULL means the task that's making the call. The task ends, and the idle task frees its stack.", { say: "Null means the task that's making the call. The task ends, and the idle task frees its stack.", pause: 0.5 }),
  // 4 · xTaskCreate ①
  L('c0', 'create', 'Back in app_main, there are two calls to xTaskCreate, one for each LED.', { say: 'Back in app main, there are two calls to X task create, one for each LED.' }),
  L('c0b', 'create', "Let's take the first one.", { pause: 0.5 }),
  L('c1', 'create', 'xTaskCreate turns blink_task into a task, and it takes six arguments.', { say: 'X task create turns blink task into a task, and it takes six arguments.', pause: 0.5 }),
  L('c2', 'create', "First comes the function itself. You pass its name without brackets, because you're handing the function over, not calling it.", { pause: 0.6 }),
  L('c3', 'create', "Next comes a name, which is used only for debugging. FreeRTOS keeps fifteen characters, so a longer name is cut short. Even Espressif's own GPIO example loses its last two letters.", { say: `Next comes a name, which is used only for debugging. ${RTOS} keeps fifteen characters, so a longer name is cut short. Even Espressif's own GPIO example loses its last two letters.`, pause: 0.7 }),
  L('c4', 'create', "Then comes the stack size: two thousand and forty-eight. In ESP-IDF, that number is in bytes. In vanilla FreeRTOS, the same number would mean words, and a word is four bytes.", { say: `Then comes the stack size: two thousand and forty-eight. In E S P I D F, that number is in bytes. In vanilla ${RTOS}, the same number would mean words, and a word is four bytes.`, pause: 0.7 }),
  L('c4b', 'create', 'So in vanilla FreeRTOS, the same number gives you four times the stack.', { say: `So in vanilla ${RTOS}, the same number gives you four times the stack.`, pause: 0.5 }),
  L('c5', 'create', "The stack holds the task's local variables, its function calls, and its registers while it's switched out. It comes from the heap, when the task is created.", { pause: 0.7 }),
  L('c6', 'create', "For scale, app_main's task has four thousand and ninety-six bytes, and the idle task has fifteen hundred and thirty-six.", { say: "For scale, app main's task has four thousand and ninety-six bytes, and the idle task has fifteen hundred and thirty-six.", pause: 0.7 }),
  L('c7', 'create', "Now for the trap. If you make the stack too small, the task's calls run past the end of it. That's called a stack overflow.", { pause: 0.9 }),
  L('c7b', 'create', "At every task switch, FreeRTOS checks the end of each stack. If it's been overwritten, the chip prints the task's name, and restarts.", { say: `At every task switch, ${RTOS} checks the end of each stack. If it's been overwritten, the chip prints the task's name, and restarts.`, pause: 0.6 }),
  L('c7c', 'create', 'You will meet this one. A task that reboots the chip with this message has outgrown its stack, and the fix is to give it a bigger one.', { pause: 0.7 }),
  // 5 · xTaskCreate ②
  L('q1', 'params', 'Next comes the parameter. Whatever pointer you pass here arrives in the task as arg.'),
  L('q2', 'params', "That's how one function can blink two LEDs: each task gets its own pin, and its own delay.", { pause: 0.6 }),
  L('q3', 'params', "The pointer has to stay valid for as long as the task runs. That's why fast and slow are static. A local variable in app_main would be gone as soon as app_main returns.", { say: "The pointer has to stay valid for as long as the task runs. That's why fast and slow are static. A local variable in app main would be gone as soon as app main returns.", pause: 0.7 }),
  L('q4', 'params', 'Then comes the priority. Higher numbers win: when two tasks are ready, the scheduler runs the one with the higher priority first.', { pause: 0.8 }),
  L('q4b', 'params', 'Zero belongs to the idle tasks, app_main runs at one, and the highest priority is twenty-four.', { say: 'Zero belongs to the idle tasks, app main runs at one, and the highest priority is twenty-four.', pause: 0.6 }),
  L('q5', 'params', 'Five outranks app_main, so the new task starts running straight away, and app_main carries on once the task waits.', { say: 'Five outranks app main, so the new task starts running straight away, and app main carries on once the task waits.', pause: 0.6 }),
  L('q6', 'params', "Last comes the handle, which is a way to refer to the task later. Pass NULL if you don't need it.", { say: "Last comes the handle, which is a way to refer to the task later. Pass null if you don't need it.", pause: 0.8 }),
  L('q7', 'params', "xTaskCreate returns pdPASS, which is one. That's not an esp_err_t, so don't wrap it in ESP_ERROR_CHECK, or success would abort.", { say: "X task create returns P D pass, which is one. That's not an E S P error code, so don't wrap it in E S P error check, or success would abort.", pause: 0.8 }),
  L('q8', 'params', "And if the heap can't fit the stack, it returns minus one instead.", { pause: 0.5 }),
  // 6 · demo
  L('d1', 'demo', 'Now flash it. app_main creates both tasks and returns. The log shows it, and then the main task is deleted.', { say: 'Now flash it. App main creates both tasks and returns. The log shows it, and then the main task is deleted.' }),
  L('d2', 'demo', "The LEDs don't notice. Each task switches its own LED at its own pace: one every two hundred milliseconds, and the other every five hundred.", { pause: 0.7 }),
  L('d3', 'demo', 'Both tasks run the same function, but each one has its own stack, and so its own b: the pointer that blink_task reads from arg, at the top of the function.', { say: 'Both tasks run the same function, but each one has its own stack, and so its own B: the pointer that blink task reads from arg, at the top of the function.', pause: 0.8 }),
  L('d3b', 'demo', "One b points at fast, and the other points at slow. It's the same code, with different settings.", { say: "One B points at fast, and the other points at slow. It's the same code, with different settings.", pause: 0.6 }),
  // 7 · vTaskDelay
  L('v1', 'delay', 'So what does vTaskDelay really do? It takes the task off the CPU, and blocks it, for a number of ticks.', { say: 'So what does V task delay really do? It takes the task off the CPU, and blocks it, for a number of ticks.' }),
  L('v2', 'delay', 'A tick comes every ten milliseconds, so two hundred milliseconds is twenty ticks.', { pause: 0.7 }),
  L('v3', 'delay', 'On every tick, FreeRTOS checks whose time is up. After twenty ticks, blink_fast is ready again, and it runs.', { say: `On every tick, ${RTOS} checks whose time is up. After twenty ticks, blink fast is ready again, and it runs.`, pause: 0.6 }),
  L('v4', 'delay', "While both tasks are blocked, the CPU runs the idle task, and most of the time, that's all it's doing.", { pause: 0.7 }),
  L('v5', 'delay', 'And the ESP32 has two cores. xTaskCreate lets a task run on either one, and that gets a video of its own.', { say: 'And the ESP32 has two cores. X task create lets a task run on either one, and that gets a video of its own.', pause: 0.7 }),
  // 8 · payoff
  L('x1', 'payoff', "So give every job its own loop, and let the scheduler run them all. That's a task."),
];
