/**
 * FreeRTOS priority inversion — the timeline. Single source of truth for picture AND sound.
 * PURE ESP-IDF, only what earlier videos taught: xTaskCreatePinnedToCore (two cores),
 * priorities + uxTaskPriorityGet (scheduler), esp_timer_get_time busy work (scheduler),
 * xSemaphoreCreateMutex / Take / Give (mutexes), vTaskDelay(pdMS_TO_TICKS()).
 *
 *   want (a fast high task shares a buffer with a slow low one; a medium one crunches; all on
 *   core 0) → flag (try 1, a home-made lock, run for real: high waits 1019 ms behind medium →
 *   PRIORITY INVERSION) → mutex (try 2, the mutex, run for real: 28 ms; low runs at 3 while
 *   high waits → PRIORITY INHERITANCE) → code (three tasks, one mutex, nothing extra) →
 *   inherit (the two rules; uxTaskPriorityGet shows it; only mutexes do it) → trap (sleeping
 *   while holding it: 470 ms; keep the locked part short) → payoff
 *
 * Every log line is REAL output: the program in ./lab, built with ESP-IDF v6.0.2 and run in
 * QEMU (./lab/logs). Times are SCENE-RELATIVE. `node scripts/vo-plan.ts
 * freertos-priority-inversion` voices every line and writes VO_AT / VO_WORDS / SCENE_DUR
 * below; cues are `w(line, word)`. Import-free (type-only imports are erased). Every claim is
 * sourced in ./FACTS.md.
 */
import type { Caption } from '../../components/pwm';

export const FPS = 30;
export const SECTION = '2-freertos';
export const VOICE = 'en-US-AndrewMultilingualNeural';

// ── generated: VO plan (node scripts/vo-plan.ts freertos-priority-inversion) — do not edit by hand ──
export const VO_AT: Record<string, number> = {"w1":0.5,"w2":5.76,"w3":14.22,"w4":23.04,"w5":28.1,"f1":1,"f2":10.32,"f3":17.64,"f4":28.26,"f5":33.76,"f6":42.18,"f7":47.14,"f8":50.38,"f9":60.3,"f10":68.74,"m1":1,"m2":9.42,"m3":17.44,"m4":28.24,"m5":36.7,"m6":43.08,"m7":45.24,"m8":53.84,"m9":62.9,"k1":1,"k2":9.72,"k3":16.88,"k4":22.1,"k5":28.26,"h1":1,"h2":6.24,"h3":14.88,"h4":20.56,"h5":30,"h6":36.64,"x1":1,"x2":4.6,"x3":13.96,"x4":23.8,"x5":32.52,"z1":0.6,"z2":14.64};
export const SCENE_DUR: Record<string, number> = {"want":33.06,"flag":78.18,"mutex":72.94,"code":36.26,"inherit":47.88,"trap":41.96,"payoff":22.06};
export const VO_WORDS: Record<string, [string, number][]> = {
  w1: [["Let's",0],["say",0.3],["you",0.38],["want",0.48],["a",0.58],["task",0.78],["that",1.06],["reacts",1.28],["quickly,",1.62],["so",2.58],["you",2.78],["give",2.92],["it",3.06],["a",3.14],["high",3.2],["priority.",3.38],["Three.",4.42]],
  w2: [["It",0],["shares",0.2],["a",0.42],["buffer",0.68],["with",0.92],["a",1.36],["slower",1.56],["task",1.8],["at",2.32],["priority",2.64],["1,",2.98],["and",3.7],["the",4.04],["two",4.14],["of",4.38],["them",4.48],["use",4.62],["a",4.78],["lock,",4.92],["so",5.52],["that",5.68],["only",5.84],["one",6.1],["of",6.36],["them",6.42],["touches",6.58],["the",6.96],["buffer",7.22],["at",7.5],["time.",7.68]],
  w3: [["There's",0],["also",0.32],["a",0.56],["medium",0.76],["task",0.96],["at",1.62],["priority",2.14],["two.",2.52],["It",3.36],["has",3.48],["a",3.58],["long",3.72],["calculation,",4],["a",5.22],["whole",5.38],["second",5.68],["of",6.02],["work,",6.22],["and",6.9],["it",7.02],["never",7.12],["touches",7.42],["the",7.8],["buffer.",8]],
  w4: [["All",0],["three",0.3],["are",0.58],["pinned",0.88],["to",1.22],["core",1.56],["zero,",1.84],["so",2.66],["they",2.9],["really",3.02],["do",3.16],["take",3.36],["turns",3.58],["on",3.88],["one",4.06],["CPU.",4.28]],
  w5: [["So",0],["when",0.26],["a",0.34],["high",0.42],["task",0.62],["needs",1.02],["the",1.32],["buffer,",1.52],["how",2.26],["long",2.52],["does",2.86],["it",3.04],["have",3.12],["to",3.24],["wait?",3.38]],
  f1: [["The",0],["simplest",0.24],["lock",0.58],["you",0.9],["could",1.1],["write",1.22],["is",1.48],["a",1.66],["flag.",1.82],["A",2.74],["task",2.76],["waits",3.08],["while",3.38],["busy",3.68],["is",4.06],["true,",4.3],["then",5.24],["sets",5.42],["it,",5.72],["uses",6.46],["the",6.74],["buffer,",7],["and",7.98],["clears",8.08],["it",8.34],["again.",8.52]],
  f2: [["Here",0],["is",0.38],["the",0.84],["order",0.96],["things",1.12],["happen",1.42],["in.",1.78],["First,",2.6],["low",3.4],["takes",3.44],["the",3.72],["lock",3.92],["and",4.22],["starts",4.66],["at",4.94],["50",5.08],["milliseconds",5.72],["of",6.22],["work.",6.5]],
  f3: [["30",0],["milliseconds",0.42],["in,",0.86],["medium",1.72],["wakes",1.84],["up.",2.14],["Its",2.9],["priority",3],["is",3.46],["higher",3.86],["than",4.2],["low,",4.5],["so",5.22],["it",5.46],["takes",5.56],["over",5.72],["the",5.96],["CPU",6.1],["and",6.42],["low",7.32],["is",7.58],["left",7.78],["waiting",8.08],["with",8.44],["the",8.68],["lock",8.82],["still",9.1],["in",9.42],["its",9.6],["hand.",9.74]],
  f4: [["Then",0],["Hye",0.26],["wakes",0.52],["up",0.68],["and",0.98],["needs",1.28],["the",1.48],["buffer.",1.64],["The",2.5],["flag",2.6],["says",2.84],["busy,",3.18],["so",3.92],["Hye",4.16],["has",4.4],["to",4.56],["wait.",4.7]],
  f5: [["But",0],["Low",0.26],["can't",0.44],["finish",1.12],["its",1.12],["work",1.26],["and",1.6],["clear",2.08],["the",2.36],["flag,",2.54],["because",3.26],["Medium",3.64],["has",3.98],["the",4.38],["CPU.",4.56],["So",5.64],["Medium",5.72],["runs",6.08],["its",6.52],["whole",6.8],["second",7.04],["of",7.38],["work.",7.58]],
  f6: [["Only",0],["then",0.28],["does",0.46],["low",0.68],["get",1.04],["to",1.26],["finish,",1.44],["and",2.34],["only",2.48],["then",2.8],["does",3.02],["high",3.2],["get",3.54],["the",3.78],["lock.",3.92]],
  f7: [["Let's",0],["flash",0.32],["it",0.58],["and",0.84],["see",1.24],["what",1.42],["the",1.54],["log",1.66],["says.",1.88]],
  f8: [["The",0],["high",0.24],["task",0.42],["waited",0.84],["1",1.14],[",019",1.58],["milliseconds",2.42],["and",2.92],["almost",3.66],["all",4.06],["of",4.34],["that",4.44],["time,",4.6],["it",5.34],["was",5.5],["waiting",5.62],["for",5.96],["medium,",6.24],["a",7.22],["task",7.34],["that",7.64],["never",7.88],["even",8.22],["touches",8.54],["the",8.88],["buffer.",9.1]],
  f9: [["The",0],["priorities",0.24],["have",0.7],["been",0.94],["turned",1.1],["upside",1.3],["down.",1.68],["The",2.68],["most",2.76],["important",2.92],["task",3.34],["is",3.7],["stuck",4.12],["behind",4.4],["a",4.74],["less",4.9],["important",5.18],["one.",5.58],["This",6.34],["is",6.46],["called",6.62],["priority",6.86],["inversion.",7.4]],
  f10: [["The",0],["flag",0.24],["does",0.54],["keep",0.78],["high",1.06],["and",1.4],["low",1.56],["apart,",1.76],["but",2.5],["how",2.64],["long",2.84],["high",3.12],["weights",3.36],["now",3.68],["depends",4.06],["on",4.54],["whatever",4.72],["else",4.96],["is",5.24],["running,",5.4],["and",6.2],["that",6.34],["could",6.5],["be",6.6],["any",6.72],["length",6.86],["of",7.04],["time.",7.2]],
  m1: [["Now",0],["let's",0.3],["swap",0.54],["the",0.72],["flag",0.9],["for",1.18],["the",1.4],["mutex",1.5],["from",1.94],["the",2.1],["last",2.2],["video.",2.44],["X",3.42],["semaphore,",3.5],["take",4.34],["to",4.56],["get",4.7],["it.",4.84],["And",5.48],["X",5.64],["semaphore,",6.06],["give",6.98],["the",7.16],["hand",7.28],["it",7.44],["back.",7.54]],
  m2: [["Same",0],["three",0.4],["tasks",0.78],["and",1.3],["the",1.88],["same",1.98],["timing.",2.24],["Low",3.2],["takes",3.26],["the",3.5],["mutex",3.7],["and",4.24],["medium",4.84],["takes",5.16],["over",5.48],["the",5.7],["CPU,",5.86],["just",6.8],["like",6.96],["before.",7.12]],
  m3: [["But",0],["this",0.26],["time,",0.44],["when",0.76],["high",0.98],["asks",1.18],["for",1.5],["the",1.64],["mutex",1.72],["and",2.22],["has",2.76],["to",2.98],["wait,",3.16],["Freer",4.04],["2's",4.12],["raises",4.46],["the",4.84],["task",5.08],["that",5.46],["holds",5.7],["it",5.96],["to",6.12],["high's",6.26],["priority.",6.56],["For",7.58],["a",7.74],["moment,",7.86],["low",8.68],["runs",8.94],["at",9.26],["priority",9.44],["3.",9.76]],
  m4: [["Now",0],["medium",0.26],["can't",0.62],["interrupt,",1.18],["low",2.02],["anymore.",2.34],["So",3.32],["low",3.48],["finishes",3.8],["its",4.26],["last",4.48],["20",4.86],["milliseconds",5.34],["and",5.76],["gives",6.5],["them",6.7],["mutex",6.9],["back.",7.48]],
  m5: [["As",0],["soon",0.26],["as",0.44],["it",0.56],["does,",0.68],["low",1.74],["drops",1.82],["back",2.14],["to",2.44],["priority",2.6],["1,",2.9],["and",3.74],["high",3.98],["gets",4.16],["the",4.34],["mutex",4.52],["straight",5.02],["away.",5.3]],
  m6: [["Let's",0],["flash",0.34],["this",0.6],["version.",0.84]],
  m7: [["This",0],["time,",0.26],["I",1.22],["weighted",1.22],["28",1.52],["milliseconds",2],["instead",2.5],["of",3.28],["a",3.42],["whole",3.52],["second",3.68],["and",4.1],["low",4.78],["printed",5.04],["priority",5.34],["3",5.72],["because",6.26],["I",6.94],["was",7.14],["waiting",7.3],["for",7.54],["it.",7.84]],
  m8: [["This",0],["has",0.22],["a",0.32],["name,",0.42],["too.",0.7],["It",1.4],["is",1.48],["called",1.6],["priority",1.94],["inheritance.",2.62],["The",3.72],["task",3.74],["holding",4.06],["the",4.34],["mutex",4.48],["inherits",5.04],["the",5.98],["priority",6.16],["of",6.56],["the",6.78],["task",6.9],["that",7.36],["is",7.66],["waiting",7.76],["for",8],["it.",8.3]],
  m9: [["There's",0],["a",0.26],["catch",0.34],["though.",0.62],["High",1.5],["still",1.52],["waits",1.76],["until",2.04],["low",2.58],["gives",2.96],["the",3.28],["mutex",3.44],["back.",3.86],["Inheritance",5.06],["only",5.38],["stops",5.82],["other",6.36],["tasks",6.68],["from",7.14],["getting",7.4],["in",7.58],["between.",7.74]],
  k1: [["Here's",0],["the",0.32],["whole",0.42],["program.",0.6],["Each",1.48],["task",1.64],["gets",1.94],["its",2.14],["own",2.28],["priority",2.5],["when",3.06],["it's",3.4],["created.",3.56],["Low",4.68],["is",4.72],["1,",4.88],["medium",5.94],["is",6.1],["2,",6.34],["and",7.38],["high",7.46],["is",7.64],["3.",7.82]],
  k2: [["Low",0],["and",0.42],["High",0.8],["both",1.06],["take",1.44],["the",1.68],["same",1.86],["mutex",2.16],["around",2.72],["the",3.3],["work",3.46],["on",3.6],["the",3.74],["buffer,",3.88],["exactly",4.76],["as",5.14],["in",5.62],["the",5.72],["mutex's",5.78],["video.",6.3]],
  k3: [["Medium",0],["never",0.46],["touches",1.06],["the",1.46],["mutex.",1.66],["It",2.78],["only",2.9],["does",3.06],["its",3.3],["long",3.48],["calculation.",3.96]],
  k4: [["In",0],["App",0.26],["Main,",0.42],["we",1.04],["create",1.2],["the",1.56],["mutex",1.72],["first,",2.26],["and",3.12],["then",3.36],["pin",3.48],["all",3.74],["three",4.06],["tasks",4.4],["to",4.84],["Core",5.1],["Zero.",5.28]],
  k5: [["Notice",0],["that",0.3],["there",0.54],["is",0.66],["no",0.78],["extra",1.06],["call",1.42],["for",1.76],["priority",2.28],["inheritance.",2.76],["You",3.88],["get",4.04],["it",4.14],["automatically",4.26],["just",4.84],["by",5.42],["using",5.58],["a",5.84],["mutex.",5.96]],
  h1: [["Let's",0],["pin",0.3],["down",0.44],["exactly",0.74],["what",1.18],["priority",1.8],["inheritance",2.32],["does.",2.76],["There",3.98],["are",4.04],["two",4.16],["rules.",4.32]],
  h2: [["First,",0],["when",0.62],["a",0.76],["task",0.9],["has",1.14],["to",1.32],["wait",1.48],["for",1.74],["a",2],["mutex",2.12],["and",2.58],["the",3.2],["task",3.32],["holding",3.62],["it",3.92],["has",4.08],["a",4.2],["lower",4.34],["priority,",4.54],["the",5.54],["holder",5.72],["is",5.92],["raised",6.16],["to",6.56],["the",6.8],["waiting",6.92],["task",7.14],["priority.",7.56]],
  h3: [["Second,",0],["when",0.86],["the",0.96],["holder",1.1],["gives",1.32],["the",1.54],["mutex",1.72],["back,",2.1],["it",2.78],["drops",2.88],["straight",3.14],["back",3.52],["to",3.9],["its",4.14],["own",4.24],["priority.",4.42]],
  h4: [["You",0],["can",0.2],["watch",0.32],["it",0.46],["happen",0.6],["with",0.82],["you",1.02],["xTaskPriorityGet",1.16],["from",2.54],["the",3.02],["scheduler",3.16],["video.",3.5],["Called",4.54],["with",4.58],["null,",4.76],["it",5.58],["returns",5.7],["the",6.06],["priority",6.26],["of",6.62],["the",6.9],["task",7],["that",7.4],["calls",7.64],["it",7.92],["right",8.18],["now.",8.56]],
  h5: [["with",0],["the",0.24],["flag",0.38],["low",0.76],["-printed",1.34],["priority",1.62],["1.",2.02],["With",2.74],["the",3],["mutex,",3.16],["it",4.04],["printed",4.14],["3",4.38],["because",4.78],["high",5.16],["was",5.4],["waiting.",5.56]],
  h6: [["Only",0],["a",0.3],["mutex",0.42],["does",0.88],["this.",1.36],["A",2.34],["flag",2.4],["can't,",2.7],["and",3.44],["neither",3.52],["can",3.7],["the",3.94],["semaphores",4.08],["in",4.58],["the",4.72],["next",4.82],["video.",4.98],["So",5.88],["use",5.94],["a",6.1],["mutex",6.24],["whenever",6.8],["tasks",7.1],["with",7.6],["different",7.86],["priorities",8.12],["share",8.54],["something.",8.88]],
  x1: [["Now",0],["for",0.3],["the",0.48],["mistake",0.58],["that",0.94],["inheritance",1.22],["cannot",1.8],["fix.",2.56]],
  x2: [["Say",0],["low",0.32],["waits",0.58],["for",0.82],["something",1],["while",1.36],["it",1.8],["holds",1.92],["the",2.16],["mutex.",2.34],["Here",3.58],["it",3.82],["calls",4.14],["VTAS",4.38],["delay",5.02],["for",5.32],["500",5.94],["milliseconds",6.52],["inside",7.04],["the",8.02],["lock",8.26],["part.",8.46]],
  x3: [["Low",0],["still",0.3],["gets",0.56],["priority",0.8],["3,",1.16],["but",2.22],["a",2.44],["sleeping",2.56],["task",2.84],["doesn't",3.4],["need",3.84],["the",4.02],["CPU,",4.2],["so",5.16],["the",5.4],["boost",5.56],["doesn't",5.84],["help",6.22],["at",6.36],["all.",6.44],["High",7.3],["weighted",7.32],["470",7.58],["milliseconds.",8.54]],
  x4: [["The",0],["fix",0.24],["is",0.42],["to",0.68],["keep",0.84],["the",1],["locked",1.16],["part",1.44],["short.",1.74],["Do",2.6],["any",2.66],["waiting",3],["and",3.4],["any",3.94],["slow",4.24],["work",4.56],["you",4.84],["can",5.02],["before",5.36],["you",5.78],["take",5.96],["the",6.16],["mutex",6.38],["or",6.92],["after",7.4],["you",7.52],["give",7.64],["it",7.76],["back.",7.88]],
  x5: [["With",0],["only",0.26],["five",0.5],["milliseconds",0.86],["of",1.34],["work",1.6],["inside,",1.78],["low",3.24],["is",3.26],["finished",3.62],["before",3.96],["high",4.44],["even",4.7],["wakes",4.94],["up",5.16],["and",5.52],["high",6.12],["doesn't",6.32],["wait",6.54],["at",6.7],["all.",6.8]],
  z1: [["When",0],["a",0.22],["high",0.34],["priority",0.52],["task",0.88],["waits",1.3],["for",1.6],["a",2.02],["low",2.14],["one",2.34],["and",2.76],["a",3.46],["medium",3.7],["task",3.96],["gets",4.54],["in",4.78],["between,",4.94],["that's",5.9],["priority",6.06],["inversion.",6.48],["A",7.52],["mutex",7.58],["fixes",8],["it",8.52],["by",8.76],["lending",8.92],["the",9.16],["waiting",9.44],["task",9.74],["priority",10.2],["to",10.64],["the",10.98],["holder,",11.1],["and",11.88],["that's",12.1],["priority",12.36],["inheritance.",12.84]],
  z2: [["Next",0],["up,",0.28],["semaphores.",1.02]],
};
// ── end generated ──

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9.]/g, '').replace(/\.$/, '');
export const at = (id: string) => VO_AT[id] ?? 0;
export function w(id: string, word: string, n = 0, plus = 0): number {
  const ws = VO_WORDS[id];
  if (!ws) return at(id) + plus;
  const target = norm(word);
  let k = 0;
  for (const [x, s] of ws) if (norm(x).startsWith(target) && k++ === n) return +(at(id) + s + plus).toFixed(2);
  throw new Error(`cue: no "${word}" #${n} in VO line ${id}: ${ws.map((x) => x[0]).join(' ')}`);
}
export function end(id: string): number {
  const ws = VO_WORDS[id];
  return ws?.length ? +(at(id) + ws[ws.length - 1][1] + 0.4).toFixed(2) : at(id) + 3;
}

// ── scenes ─────────────────────────────────────────────────────────────────

export const TAIL: Record<string, number> = { want: 1.4, flag: 2.0, mutex: 2.0, code: 1.6, inherit: 2.0, trap: 2.4, payoff: 6.0 };
const dur = (id: string, fallback: number) => SCENE_DUR[id] ?? fallback;
export const SCENES = [
  { id: 'want', dur: dur('want', 25) },
  { id: 'flag', dur: dur('flag', 60) },
  { id: 'mutex', dur: dur('mutex', 55) },
  { id: 'code', dur: dur('code', 30) },
  { id: 'inherit', dur: dur('inherit', 40) },
  { id: 'trap', dur: dur('trap', 35) },
  { id: 'payoff', dur: dur('payoff', 16) },
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
export const INVERSION_FRAMES = Math.round(SECONDS * FPS);

// ── the tasks ──────────────────────────────────────────────────────────────

export type Lane = 'high' | 'medium' | 'low';
export const LANES: Lane[] = ['high', 'medium', 'low'];
export const PRIO: Record<Lane, number> = { high: 3, medium: 2, low: 1 };
/** high magenta, medium purple, low blue; the shared buffer amber; the lock / mutex cyan */
export const LANE_COLOR: Record<Lane, string> = { high: '#ff2bd1', medium: '#9d4edd', low: '#4d8dff' };

// ── the runs (QEMU, ./lab/logs; ms after "low: took the lock") ──────────────
//
// A segment is what a lane is doing: running, waiting for the lock, running with a borrowed
// priority (boost), or asleep. The log lines are the real ones (timestamps from the logs).

export type Seg = { lane: Lane; from: number; to: number; kind: 'run' | 'wait' | 'boost' | 'sleep' };
export type Run = {
  segs: Seg[];
  /** the lock is held by low from 0 until `give` */
  give: number;
  /** high gets the lock at `got`, after waiting `waited` ms (its own measurement, from the log) */
  got: number;
  waited: number;
  log: string[];
};

/** try 1, the flag (lab v1): medium runs its whole second while high waits */
export const RUN_FLAG: Run = {
  segs: [
    { lane: 'low', from: 0, to: 30, kind: 'run' },
    { lane: 'medium', from: 30, to: 1030, kind: 'run' },
    { lane: 'high', from: 50, to: 1070, kind: 'wait' },
    { lane: 'low', from: 1030, to: 1060, kind: 'run' },
    { lane: 'high', from: 1070, to: 1085, kind: 'run' },
  ],
  give: 1060,
  got: 1070,
  waited: 1019,
  log: [
    'I (1636) inv: low: took the lock',
    'I (1666) inv: medium: busy for 1000 ms',
    'I (1686) inv: high: needs the lock',
    'I (2666) inv: medium: done',
    'I (2696) inv: low: priority 1, giving it back',
    'I (2706) inv: high: got it after 1019 ms',
  ],
};

/** try 2, the mutex (lab v0): low runs at priority 3 while high waits */
export const RUN_MUTEX: Run = {
  segs: [
    { lane: 'low', from: 0, to: 30, kind: 'run' },
    { lane: 'medium', from: 30, to: 50, kind: 'run' },
    { lane: 'high', from: 50, to: 70, kind: 'wait' },
    { lane: 'low', from: 50, to: 70, kind: 'boost' },
    { lane: 'high', from: 70, to: 85, kind: 'run' },
    { lane: 'medium', from: 85, to: 1060, kind: 'run' },
  ],
  give: 70,
  got: 70,
  waited: 28,
  log: [
    'I (1602) inv: low: took the lock',
    'I (1632) inv: medium: busy for 1000 ms',
    'I (1652) inv: high: needs the lock',
    'I (1672) inv: low: priority 3, giving it back',
    'I (1672) inv: high: got it after 28 ms',
    'I (2662) inv: medium: done',
  ],
};

/** the trap (lab v2): low sleeps 500 ms while it holds the mutex */
export const RUN_SLEEP: Run = {
  segs: [
    { lane: 'low', from: 0, to: 500, kind: 'sleep' },
    { lane: 'medium', from: 20, to: 500, kind: 'run' },
    { lane: 'high', from: 30, to: 500, kind: 'wait' },
    { lane: 'high', from: 500, to: 515, kind: 'run' },
    { lane: 'medium', from: 515, to: 1020, kind: 'run' },
  ],
  give: 500,
  got: 500,
  waited: 470,
  log: [
    'I (1620) inv: low: took the lock',
    'I (1640) inv: medium: busy for 1000 ms',
    'I (1650) inv: high: needs the lock',
    'I (2120) inv: low: priority 3, giving it back',
    'I (2120) inv: high: got it after 470 ms',
    'I (2640) inv: medium: done',
  ],
};

/** the fix (lab v3): a 5 ms locked part is over before anyone else wakes */
export const LOG_SHORT = [
  'I (1625) inv: low: took the lock',
  'I (1635) inv: low: priority 1, giving it back',
  'I (1655) inv: medium: busy for 1000 ms',
  'I (1665) inv: high: needs the lock',
  'I (1665) inv: high: got it after 0 ms',
  'I (2655) inv: medium: done',
];

/** chart x (px from the chart's left) for a time in ms: a broken axis, 0–100 | 100–1000 | 1000–1100 */
export const CHART_W = 1300;
export function xOf(ms: number): number {
  const a = 560;
  const b = 180; // the squeezed middle (900 ms)
  if (ms <= 100) return (ms / 100) * a;
  if (ms <= 1000) return a + ((ms - 100) / 900) * b;
  return a + b + (Math.min(ms, 1100) - 1000) / 100 * (CHART_W - a - b);
}
/** the playhead (ms) at scene time t, from [t, ms] keyframes (linear in between) */
export function playMs(t: number, keys: [number, number][]): number {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, m1] = keys[i];
    const [t0, m0] = keys[i - 1];
    if (t < t1) return m0 + ((t - t0) / (t1 - t0)) * (m1 - m0);
  }
  return keys[keys.length - 1][1];
}

// ── voiceover ──────────────────────────────────────────────────────────────

export type VoLine = { id: string; scene: SceneId; at: number; text: string; say?: string; pause?: number };
const L = (id: string, scene: SceneId, text: string, say?: string, pause?: number): VoLine => ({ id, scene, at: at(id), text, say, pause });

export const VO: VoLine[] = [
  // 1 · want
  L('w1', 'want', "Let's say you want a task that reacts quickly, so you give it a high priority: three.", "Let's say you want a task that reacts quickly, so you give it a high priority. Three.", 0.5),
  L('w2', 'want', 'It shares a buffer with a slower task at priority one, and the two of them use a lock, so that only one of them touches the buffer at a time.'),
  L('w3', 'want', 'There is also a medium task at priority two. It does a long calculation, a whole second of work, and it never touches the buffer.', undefined, 0.5),
  L('w4', 'want', 'All three are pinned to core zero, so they really do take turns on one CPU.'),
  L('w5', 'want', 'So when the high task needs the buffer, how long does it have to wait?', undefined, 0.5),

  // 2 · flag (try 1)
  L('f1', 'flag', 'The simplest lock you could write is a flag. A task waits while busy is true, then sets it, uses the buffer, and clears it again.', undefined, 1.0),
  L('f2', 'flag', 'Here is the order things happen in. First, low takes the lock, and starts its fifty milliseconds of work.', undefined, 0.6),
  L('f3', 'flag', 'Thirty milliseconds in, medium wakes up. Its priority is higher than low, so it takes over the CPU, and low is left waiting with the lock still in its hand.'),
  L('f4', 'flag', 'Then high wakes up and needs the buffer. The flag says busy, so high has to wait.'),
  L('f5', 'flag', "But low can't finish its work and clear the flag, because medium has the CPU. So medium runs its whole second of work."),
  L('f6', 'flag', 'Only then does low get to finish, and only then does high get the lock.'),
  L('f7', 'flag', "Let's flash it, and see what the log says.", undefined, 0.8),
  L('f8', 'flag', 'The high task waited one thousand and nineteen milliseconds, and almost all of that time, it was waiting for medium, a task that never even touches the buffer.', undefined, 1.0),
  L('f9', 'flag', 'The priorities have been turned upside down: the most important task is stuck behind a less important one. This is called priority inversion.', undefined, 0.6),
  L('f10', 'flag', "The flag does keep high and low apart, but how long high waits now depends on whatever else is running, and that could be any length of time."),

  // 3 · mutex (try 2)
  L('m1', 'mutex', "Now let's swap the flag for the mutex from the last video: xSemaphoreTake to get it, and xSemaphoreGive to hand it back.", "Now let's swap the flag for the mutex from the last video. X semaphore take to get it, and X semaphore give to hand it back.", 1.0),
  L('m2', 'mutex', 'Same three tasks, and the same timing. Low takes the mutex, and medium takes over the CPU, just like before.'),
  L('m3', 'mutex', "But this time, when high asks for the mutex and has to wait, FreeRTOS raises the task that holds it to high's priority. For a moment, low runs at priority three."),
  L('m4', 'mutex', "Now medium can't interrupt low any more, so low finishes its last twenty milliseconds and gives the mutex back."),
  L('m5', 'mutex', 'As soon as it does, low drops back to priority one, and high gets the mutex straight away.'),
  L('m6', 'mutex', "Let's flash this version.", undefined, 0.8),
  L('m7', 'mutex', 'This time, high waited twenty-eight milliseconds instead of a whole second, and low printed priority three, because high was waiting for it.', undefined, 1.0),
  L('m8', 'mutex', 'This has a name, too. It is called priority inheritance: the task holding the mutex inherits the priority of the task that is waiting for it.', undefined, 0.6),
  L('m9', 'mutex', "There's a catch, though. High still waits until low gives the mutex back. Inheritance only stops other tasks from getting in between."),

  // 4 · code
  L('k1', 'code', "Here's the whole program. Each task gets its own priority when it's created: low is one, medium is two, and high is three.", undefined, 1.0),
  L('k2', 'code', 'Low and high both take the same mutex around the work on the buffer, exactly as in the mutexes video.'),
  L('k3', 'code', 'Medium never touches the mutex. It only does its long calculation.'),
  L('k4', 'code', 'In app_main, we create the mutex first, and then pin all three tasks to core zero.', 'In app main, we create the mutex first, and then pin all three tasks to core zero.'),
  L('k5', 'code', "Notice that there is no extra call for priority inheritance. You get it automatically, just by using a mutex.", undefined, 0.6),

  // 5 · inherit
  L('h1', 'inherit', "Let's pin down exactly what priority inheritance does. There are two rules.", undefined, 1.0),
  L('h2', 'inherit', 'First, when a task has to wait for a mutex, and the task holding it has a lower priority, the holder is raised to the waiting task\'s priority.'),
  L('h3', 'inherit', 'Second, when the holder gives the mutex back, it drops straight back to its own priority.'),
  L('h4', 'inherit', 'You can watch it happen with uxTaskPriorityGet, from the scheduler video. Called with NULL, it returns the priority of the task that calls it, right now.', 'You can watch it happen with U X task priority get, from the scheduler video. Called with null, it returns the priority of the task that calls it, right now.', 0.8),
  L('h5', 'inherit', 'With the flag, low printed priority one. With the mutex, it printed three, because high was waiting.'),
  L('h6', 'inherit', 'Only a mutex does this. A flag can\'t, and neither can the semaphores in the next video, so use a mutex whenever tasks with different priorities share something.', undefined, 0.8),

  // 6 · trap
  L('x1', 'trap', 'Now for the mistake that inheritance cannot fix.', undefined, 1.0),
  L('x2', 'trap', 'Say low waits for something while it holds the mutex. Here, it calls vTaskDelay for five hundred milliseconds, inside the locked part.', 'Say low waits for something while it holds the mutex. Here, it calls V task delay for five hundred milliseconds, inside the locked part.'),
  L('x3', 'trap', "Low still gets priority three, but a sleeping task doesn't need the CPU, so the boost doesn't help at all. High waited four hundred and seventy milliseconds."),
  L('x4', 'trap', 'The fix is to keep the locked part short. Do any waiting, and any slow work you can, before you take the mutex or after you give it back.', undefined, 0.8),
  L('x5', 'trap', "With only five milliseconds of work inside, low is finished before high even wakes up, and high doesn't wait at all."),

  // 7 · payoff
  L('z1', 'payoff', "When a high-priority task waits for a low one, and a medium task gets in between, that's priority inversion. A mutex fixes it by lending the waiting task's priority to the holder, and that's priority inheritance.", undefined, 0.6),
  L('z2', 'payoff', 'Next up: semaphores.', undefined, 0.8),
];

// ── cues (scene-relative) ──────────────────────────────────────────────────

export const WANT = {
  high: w('w1', 'high'),
  three: w('w1', 'three'),
  low: w('w2', 'slower'),
  lock: w('w2', 'lock'),
  medium: w('w3', 'medium'),
  second: w('w3', 'second'),
  never: w('w3', 'never'),
  core: w('w4', 'core'),
  question: w('w5', 'how'),
  captions: [
    { at: at('w1'), text: 'high: reacts fast · priority 3' },
    { at: at('w2'), text: 'low: priority 1 · shares the buffer with high, behind a lock' },
    { at: at('w3'), text: 'medium: priority 2 · 1 s of work · never touches the buffer' },
    { at: at('w4'), text: 'all three pinned to core 0: one CPU' },
    { at: at('w5'), text: 'how long does high wait for the buffer?' },
  ] as Caption[],
};

export const FLAG = {
  code: at('f1'),
  waits: w('f1', 'waits'),
  sets: w('f1', 'sets'),
  clears: w('f1', 'clears'),
  chart: at('f2'),
  lowTakes: w('f2', 'low'),
  mediumWakes: w('f3', 'medium'),
  takesOver: w('f3', 'takes'),
  highWakes: w('f4', 'wakes', 0, -0.3),
  busy: w('f4', 'busy'),
  whole: w('f5', 'whole'),
  finish: w('f6', 'finish'),
  gets: w('f6', 'get', 1),
  flash: w('f7', 'flash'),
  log: end('f7'),
  waited: w('f8', 'milliseconds', 0, -1.0),
  medium: w('f8', 'medium'),
  upside: w('f9', 'upside'),
  name: w('f9', 'priority', 0),
  apart: w('f10', 'apart'),
  depends: w('f10', 'depends'),
  any: w('f10', 'any', 0),
  captions: [
    { at: at('f1'), text: 'try 1 · a flag: wait while busy, set it, use the buffer, clear it' },
    { at: at('f2'), text: 'low takes the lock · 50 ms of work' },
    { at: at('f3'), text: 'medium (2) wakes → takes the CPU from low (1)' },
    { at: at('f4'), text: 'high (3) needs the buffer → busy → waits' },
    { at: at('f5'), text: "low can't run → medium runs its whole second" },
    { at: at('f6'), text: 'then low finishes, then high gets the lock' },
    { at: at('f8'), text: 'high waited 1019 ms · almost all of it behind medium' },
    { at: at('f9'), text: 'high stuck behind a lower priority = priority inversion' },
    { at: at('f10'), text: "high's wait depends on whatever else runs" },
  ] as Caption[],
};
/** the flag run's playhead: [scene t, ms] */
export const FLAG_PLAY: [number, number][] = [
  [FLAG.lowTakes, 0],
  [FLAG.lowTakes + 1.4, 30],
  [FLAG.mediumWakes, 30],
  [FLAG.mediumWakes + 1.2, 50],
  [FLAG.highWakes, 50],
  [FLAG.highWakes + 0.6, 60],
  [FLAG.whole - 0.6, 60],
  [FLAG.whole + 2.2, 1030],
  [FLAG.finish, 1030],
  [FLAG.gets + 0.5, 1085],
];

export const MUTEX = {
  code: at('m1'),
  take: w('m1', 'X'),
  give: w('m1', 'X', 1),
  chart: at('m2'),
  lowTakes: w('m2', 'low'),
  mediumTakes: w('m2', 'medium'),
  asks: w('m3', 'asks'),
  lends: w('m3', 'raises'),
  three: w('m3', '3'),
  cant: w('m4', 'can'),
  gives: w('m4', 'gives'),
  drops: w('m5', 'drops'),
  gets: w('m5', 'gets'),
  flash: w('m6', 'flash'),
  log: end('m6'),
  waited: w('m7', 'milliseconds', 0, -0.4),
  printed: w('m7', 'printed'),
  name: w('m8', 'priority'),
  inherits: w('m8', 'inherits'),
  catch: at('m9'),
  between: w('m9', 'between'),
  captions: [
    { at: at('m1'), text: 'try 2 · the mutex: xSemaphoreTake … xSemaphoreGive' },
    { at: at('m2'), text: 'same tasks, same timing: low takes it, medium takes the CPU' },
    { at: at('m3'), text: 'high waits → FreeRTOS lends low priority 3' },
    { at: at('m4'), text: "medium (2) can't interrupt low (3) → low finishes, gives it back" },
    { at: at('m5'), text: 'low drops back to 1 · high gets the mutex' },
    { at: at('m7'), text: 'high waited 28 ms · low printed priority 3' },
    { at: at('m8'), text: 'the holder inherits the waiter’s priority = priority inheritance' },
    { at: at('m9'), text: 'high still waits for low’s locked part' },
  ] as Caption[],
};
export const MUTEX_PLAY: [number, number][] = [
  [MUTEX.lowTakes, 0],
  [MUTEX.lowTakes + 1.2, 30],
  [MUTEX.mediumTakes, 30],
  [MUTEX.mediumTakes + 1.0, 50],
  [MUTEX.lends, 50],
  [MUTEX.three, 52],
  [MUTEX.cant, 52],
  [MUTEX.gives, 70],
  [MUTEX.drops, 70],
  [MUTEX.gets + 0.6, 85],
  [MUTEX.gets + 2.6, 1060],
];

export const CODE = {
  prios: w('k1', 'priority'),
  one: w('k1', '1'),
  two: w('k1', '2'),
  three: w('k1', '3'),
  take: w('k2', 'take'),
  medium: at('k3'),
  appMain: at('k4'),
  create: w('k4', 'create'),
  pin: w('k4', 'pin'),
  noExtra: w('k5', 'no'),
  captions: [
    { at: at('k1'), text: 'priorities at creation: low 1 · medium 2 · high 3' },
    { at: at('k2'), text: 'low and high: take … work on the buffer … give' },
    { at: at('k3'), text: 'medium: no mutex, just work' },
    { at: at('k4'), text: 'app_main: create the mutex, then pin all three to core 0' },
    { at: at('k5'), text: 'no extra call: a mutex does priority inheritance by itself' },
  ] as Caption[],
};

export const INHERIT = {
  rules: at('h1'),
  rule1: at('h2'),
  raised: w('h2', 'raised'),
  rule2: at('h3'),
  drops: w('h3', 'drops'),
  get: w('h4', 'xtask'),
  null: w('h4', 'null'),
  flag1: w('h5', '1'),
  mutex3: w('h5', '3'),
  only: at('h6'),
  semaphores: w('h6', 'semaphores'),
  use: w('h6', 'use'),
  captions: [
    { at: at('h1'), text: 'priority inheritance: two rules' },
    { at: at('h2'), text: '1 · a higher task waits for your mutex → you run at its priority' },
    { at: at('h3'), text: '2 · you give it back → straight back to your own priority' },
    { at: at('h4'), text: 'uxTaskPriorityGet(NULL): my priority, right now' },
    { at: at('h5'), text: 'flag → 1 · mutex → 3 (high was waiting)' },
    { at: at('h6'), text: 'only a mutex inherits · tasks of different priorities → mutex' },
  ] as Caption[],
};

export const TRAP = {
  bug: at('x2'),
  delay: w('x2', 'V'),
  three: w('x3', '3'),
  sleeping: w('x3', 'sleeping'),
  waited: w('x3', 'milliseconds', 0, -0.9),
  fix: at('x4'),
  short: w('x4', 'short'),
  before: w('x4', 'before'),
  five: w('x5', 'five'),
  wait: w('x5', 'wait'),
  captions: [
    { at: at('x1'), text: 'the mistake inheritance can’t fix' },
    { at: at('x2'), text: 'vTaskDelay(500 ms) inside the locked part' },
    { at: at('x3'), text: 'low is at 3, but asleep → high waited 470 ms' },
    { at: at('x4'), text: 'keep the locked part short: wait and do slow work outside it' },
    { at: at('x5'), text: '5 ms inside → done before high wakes → high waits 0 ms' },
  ] as Caption[],
};
export const SLEEP_PLAY: [number, number][] = [
  [TRAP.delay, 0],
  [TRAP.delay + 1.0, 30],
  [TRAP.three, 30],
  [TRAP.waited, 500],
  [TRAP.waited + 1.5, 1020],
];

export const PAYOFF = {
  word: w('z1', 'that'),
  word2: w('z1', 'that', 1),
  recap: [
    { at: w('z1', 'that', 1, 1.0), k: 'a flag (any lock without inheritance)', v: 'high waits behind medium: 1019 ms' },
    { at: w('z1', 'that', 1, 1.35), k: 'a mutex', v: 'the holder borrows high’s priority: 28 ms' },
    { at: w('z1', 'that', 1, 1.7), k: 'uxTaskPriorityGet(NULL)', v: 'shows the borrowed priority' },
    { at: w('z1', 'that', 1, 2.05), k: 'keep the locked part short', v: 'no waiting, no slow work inside' },
    { at: w('z2', 'semaphores'), k: 'next', v: 'semaphores' },
  ],
};

/** SFX, cued from the same values as the visuals (absolute seconds) */
const A = (s: SceneId, t: number) => +(sceneStart(s) + t).toFixed(2);
export const SOUND: { t: number; kind: 'tick' | 'thump' | 'clack' | 'buzz' | 'blip'; f?: number; amp?: number }[] = [
  { t: A('want', WANT.high), kind: 'tick', f: 2600, amp: 0.07 },
  { t: A('want', WANT.low), kind: 'tick', f: 2200, amp: 0.07 },
  { t: A('want', WANT.medium), kind: 'tick', f: 2400, amp: 0.07 },
  { t: A('want', WANT.core), kind: 'tick', f: 2000, amp: 0.06 },
  { t: A('flag', FLAG.code), kind: 'tick', f: 2000, amp: 0.08 },
  { t: A('flag', FLAG.lowTakes), kind: 'clack', amp: 0.1 },
  { t: A('flag', FLAG.mediumWakes), kind: 'tick', f: 2400, amp: 0.07 },
  { t: A('flag', FLAG.highWakes), kind: 'tick', f: 2800, amp: 0.07 },
  { t: A('flag', FLAG.gets), kind: 'clack', amp: 0.1 },
  { t: A('flag', FLAG.flash), kind: 'thump', amp: 0.14 },
  { t: A('flag', FLAG.waited), kind: 'buzz', amp: 0.08 },
  { t: A('flag', FLAG.name), kind: 'thump', amp: 0.2 },
  { t: A('mutex', MUTEX.code), kind: 'tick', f: 2000, amp: 0.08 },
  { t: A('mutex', MUTEX.lowTakes), kind: 'clack', amp: 0.1 },
  { t: A('mutex', MUTEX.lends), kind: 'blip', amp: 0.05 },
  { t: A('mutex', MUTEX.gets), kind: 'clack', amp: 0.1 },
  { t: A('mutex', MUTEX.flash), kind: 'thump', amp: 0.14 },
  { t: A('mutex', MUTEX.waited), kind: 'blip', amp: 0.06 },
  { t: A('mutex', MUTEX.name), kind: 'thump', amp: 0.2 },
  { t: A('code', CODE.one), kind: 'tick', f: 2200, amp: 0.05 },
  { t: A('code', CODE.two), kind: 'tick', f: 2400, amp: 0.05 },
  { t: A('code', CODE.three), kind: 'tick', f: 2600, amp: 0.05 },
  { t: A('inherit', INHERIT.rule1), kind: 'tick', f: 2400, amp: 0.07 },
  { t: A('inherit', INHERIT.rule2), kind: 'tick', f: 2400, amp: 0.07 },
  { t: A('inherit', INHERIT.mutex3), kind: 'blip', amp: 0.05 },
  { t: A('trap', TRAP.delay), kind: 'tick', f: 2000, amp: 0.08 },
  { t: A('trap', TRAP.waited), kind: 'buzz', amp: 0.08 },
  { t: A('trap', TRAP.five), kind: 'blip', amp: 0.06 },
  { t: A('payoff', PAYOFF.word2), kind: 'thump', amp: 0.2 },
];
