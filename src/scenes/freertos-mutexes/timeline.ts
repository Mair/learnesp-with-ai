/**
 * FreeRTOS mutexes — the timeline. Single source of truth for picture AND sound.
 * PURE ESP-IDF: xSemaphoreCreateMutex, xSemaphoreTake, xSemaphoreGive; the workers are
 * pinned with xTaskCreatePinnedToCore (freertos-two-cores).
 *
 *   want (let's say you want two tasks, one per core, to add to one total → 2,000,000) →
 *     race (try 1, total++, run for real: 1,455,343, different every run; read/add/write) →
 *     mutex (try 2, a key, run for real: exactly 2,000,000 → MUTEX; the catch: it costs time)
 *     → code (one function, two tasks, two cursors) → xSemaphoreCreateMutex →
 *     xSemaphoreTake → xSemaphoreGive → short (count in mine, lock once) → trap (break while
 *     holding the key: a silent hang; give before every way out; a time limit shows it) →
 *     payoff
 *
 * Every log line is REAL output: the program in ./lab, built with ESP-IDF v6.0.2 and run in
 * QEMU (./lab/logs). Times are SCENE-RELATIVE. `node scripts/vo-plan.ts freertos-mutexes`
 * voices every line and writes VO_AT / VO_WORDS / SCENE_DUR below; cues are `w(line, word)`.
 * Import-free (type-only imports are erased). Every claim is sourced in ./FACTS.md.
 */
import type { Caption } from '../../components/pwm';

export const FPS = 30;
export const SECTION = '2-freertos';

// ── generated: VO plan (node scripts/vo-plan.ts freertos-mutexes) — do not edit by hand ──
export const VO_AT: Record<string, number> = {"w1":0.5,"w2":4.8,"w3":10.9,"w4":17.1,"w5":20.92,"r1":0.5,"r2":7.44,"r3":9.9,"r4":15.94,"r5":19.22,"r6":23.34,"r7":28.18,"r8":38.6,"r9":45.52,"r10":52.28,"m1":0.5,"m2":6.1,"m3":12.42,"m4":17.14,"m5":24.82,"m6":31.38,"m7":33.44,"m8":39.38,"m9":44.72,"k1":0.5,"k2":5.38,"k3":12.38,"k4":16.8,"k5":21.72,"e1":0.5,"e2":6.76,"e3":12.74,"e4":18.64,"e5":22.04,"e6":29.44,"e7":36.36,"t1":0.5,"t2":6.58,"t3":11.96,"t4":18.56,"t5":24.88,"t6":32.9,"g1":0.5,"g2":4.22,"g3":7.5,"g4":12.1,"g5":16.44,"s1":0.5,"s2":5.22,"s3":11.56,"s4":16.64,"s5":23.32,"x1":0.5,"x2":4.02,"x3":11.64,"x4":17,"x5":25.08,"x6":30.06,"z1":0.5};
export const SCENE_DUR: Record<string, number> = {"want":25.78,"race":61.58,"mutex":56.7,"code":29.44,"create":41.7,"take":36.64,"give":24.14,"short":28.58,"trap":38.54,"payoff":15.86};
export const VO_WORDS: Record<string, [string, number][]> = {
  w1: [["Let's",0],["say",0.32],["you",0.42],["want",0.54],["two",0.68],["tasks",0.9],["to",1.22],["share",1.5],["one",1.72],["number,",2.04],["a",2.88],["running",3.08],["total.",3.34]],
  w2: [["Work",0],["A",0.3],["runs",0.5],["on",0.88],["Core",1.22],["0",1.42],["on",1.92],["the",2.46],["left",2.58],["and",2.8],["Work",3.38],["B",3.62],["runs",3.82],["on",4.04],["Core",4.28],["1",4.52],["on",4.9],["the",5.28],["right.",5.38]],
  w3: [["Because",0],["they're",0.36],["on",0.56],["different",0.68],["cores",0.98],["they",1.38],["really",2.02],["do",2.22],["run",2.46],["at",2.82],["the",3],["same",3.12],["moment",3.42],["as",3.8],["you",4.2],["saw",4.34],["in",4.58],["the",4.68],["two",4.76],["cores",4.94],["video",5.18]],
  w4: [["Each",0],["task",0.28],["adds",0.66],["one",1.18],["to",1.48],["total",1.64],["a",1.98],["million",2.44],["times.",2.78]],
  w5: [["So",0],["when",0.26],["both",0.38],["are",0.58],["done,",0.76],["total",1.76],["should",1.8],["be",2.04],["exactly",2.18],["2",2.6],["million.",3.02]],
  r1: [["The",0],["first",0.24],["thing",0.38],["most",0.56],["people",0.76],["write",1.04],["is",1.42],["a",1.86],["simple",2],["loop",2.34],["with",2.76],["total",3.26],["plus",3.6],["plus",3.9],["inside.",4.28],["It's",5.32],["short",5.58],["and",5.8],["it",5.94],["looks",6.02],["right.",6.16]],
  r2: [["Let's",0],["flash",0.3],["it",0.56],["and",0.74],["see",0.88],["what",1.04],["we",1.14],["get.",1.24]],
  r3: [["The",0],["last",0.24],["task",0.5],["to",0.82],["finish",1.04],["prints",1.32],["the",1.72],["final",2.02],["total.",2.36],["It's",3.2],["1",3.34],[".45",3.5],["million,",4.1],["not",4.84],["2",5.08],["million.",5.32]],
  r4: [["More",0],["than",0.26],["half",0.4],["a",0.6],["million",0.74],["counts",1],["have",1.48],["simply",1.72],["disappeared.",2.16]],
  r5: [["And",0],["if",0.22],["you",0.32],["run",0.44],["it",0.56],["again,",0.68],["you",1.38],["get",1.52],["a",1.64],["different",1.76],["wrong",2],["number",2.28],["every",2.58],["time.",2.94]],
  r6: [["So",0],["what's",0.26],["going",0.4],["on?",0.54],["Total",1.46],["plus",1.46],["plus",1.8],["looks",2.18],["like",2.48],["a",2.64],["single",2.78],["step,",3.02],["but",3.74],["it",3.84],["isn't.",3.96]],
  r7: [["Behind",0],["the",0.38],["scenes,",0.54],["it",1.38],["happens",1.48],["in",1.82],["three",2.04],["steps.",2.36],["First,",3.6],["the",4.2],["task",4.36],["reads",4.72],["the",5.12],["value",5.36],["of",5.72],["total.",5.96],["Then",6.8],["it",6.86],["adds",6.94],["one",7.14],["to",7.42],["it.",7.64],["Then",8.24],["it",8.34],["writes",8.44],["the",8.68],["new",8.88],["value",9.1],["back.",9.4]],
  r8: [["Now",0],["picture",0.38],["both",0.9],["cores",1.3],["doing",1.66],["this",2],["at",2.3],["the",2.44],["same",2.56],["moment.",2.78],["Both",3.78],["read",3.94],["total",4.34],["and",4.8],["both",5.46],["see",5.68],["41.",6.08]],
  r9: [["Both",0],["add",0.3],["one,",0.5],["and",1.16],["both",1.48],["write",1.68],["back",1.98],["42.",2.22],["That's",3.24],["two",3.52],["counts,",3.68],["but",4.46],["total",4.64],["only",4.9],["grew",5.26],["by",5.48],["one.",5.68]],
  r10: [["In",0],["slower",0.26],["code,",0.56],["this",1.28],["happens",1.46],["less",1.78],["often,",2.1],["which",2.84],["actually",3.02],["makes",3.3],["it",3.5],["worse.",3.66],["The",4.6],["bug",4.68],["hides",4.9],["and",5.32],["only",5.9],["shows",6.2],["up",6.46],["once",6.7],["in",6.84],["a",7],["while.",7.06]],
  m1: [["What",0],["you",0.22],["need",0.32],["is",0.52],["a",0.68],["simple",0.9],["rule.",1.1],["Only",2.26],["one",2.28],["task",2.58],["at",2.88],["a",3.02],["time",3.14],["is",3.44],["allowed",3.72],["to",4.06],["change",4.36],["total.",4.66]],
  m2: [["Think",0],["of",0.32],["it",0.44],["as",0.52],["a",0.66],["key.",0.8],["Whichever",1.6],["task",1.86],["is",2.42],["holding",2.76],["the",3],["key",3.2],["is",3.52],["the",3.98],["only",4.14],["one",4.42],["that",4.76],["may",4.92],["touch",5.08],["total.",5.36]],
  m3: [["So",0],["work",0.3],["A",0.46],["takes",0.66],["the",0.96],["key,",1.14],["adds",1.86],["1,",2.2],["and",2.96],["then",3.2],["hands",3.32],["the",3.6],["key",3.76],["back.",3.9]],
  m4: [["If",0],["Work",0.28],["B",0.46],["wants",0.64],["the",0.9],["key",1.08],["while",1.28],["Work",1.56],["A",1.84],["has",2.12],["it,",2.56],["Work",3.2],["B",3.3],["simply",3.7],["waits",4.26],["asleep",4.74],["until",5.6],["the",6.18],["key",6.32],["comes",6.5],["back.",6.7]],
  m5: [["And",0],["taking",0.44],["the",0.88],["key",1.08],["happens",1.32],["in",1.78],["one",2.02],["single",2.4],["step,",2.76],["so",3.48],["two",3.82],["tasks",4.3],["can",4.72],["never",4.96],["both",5.12],["get",5.34],["it.",5.58]],
  m6: [["Let's",0],["flash",0.34],["this",0.6],["version.",0.84]],
  m7: [["This",0],["time,",0.28],["the",1],["total",1.2],["is",1.46],["exactly",1.76],["2",2.24],["million",2.74],["and",3.18],["it's",3.86],["the",3.98],["same",4.12],["on",4.38],["every",4.58],["run.",4.9]],
  m8: [["That",0],["key",0.26],["has",0.44],["a",0.6],["name.",0.7],["It's",1.4],["called",1.48],["a",1.6],["mutex,",1.74],["which",2.82],["is",2.92],["short",3.08],["for",3.32],["mutual",3.6],["exclusion.",3.96]],
  m9: [["There's",0],["a",0.26],["catch",0.34],["though,",0.64],["the",1.36],["key",1.52],["isn't",1.72],["free.",2],["In",2.98],["QEMU,",3.02],["this",4.02],["run",4.2],["took",4.54],["about",4.98],["23",5.28],["seconds,",5.92],["where",6.94],["the",7.1],["first",7.2],["version",7.4],["took",7.82],["almost",8.18],["no",8.66],["time",9],["at",9.24],["all.",9.38]],
  k1: [["Here's",0],["what",0.3],["that",0.4],["looks",0.54],["like",0.7],["in",0.88],["code.",1.02],["Both",1.84],["tasks",1.96],["run",2.34],["the",2.64],["same",2.82],["function,",3.02],["WorkTask.",3.9]],
  k2: [["Right",0],["before",0.28],["total",0.62],["plus",0.92],["plus,",1.2],["we",2.1],["call",2.22],["X",2.44],["semaphore",2.66],["take.",3.12],["That",3.88],["gets",4.04],["the",4.18],["key",4.34],["or",4.62],["waits",5.28],["until",5.5],["the",5.76],["key",5.86],["is",6.04],["free.",6.18]],
  k3: [["Right",0],["after",0.3],["it,",0.56],["we",1],["call",1.12],["X",1.34],["semaphore",1.68],["give,",2.24],["which",2.86],["hands",3.06],["the",3.26],["key",3.38],["back.",3.52]],
  k4: [["So",0],["the",0.28],["line",0.4],["in",0.6],["between",0.72],["is",1.04],["only",1.56],["ever",1.98],["run",2.28],["by",2.62],["one",2.88],["task",3.26],["at",3.68],["a",3.88],["time.",3.96]],
  k5: [["In",0],["an",0.26],["app",0.42],["main,",0.58],["we",1.24],["create",1.48],["the",1.72],["mutex",1.86],["with",2.36],["x",2.56],["semaphore",2.94],["create",3.58],["mutex",3.94],["before",4.68],["we",5.26],["start",5.38],["the",5.58],["tasks.",5.74]],
  e1: [["Let's",0],["look",0.28],["at",0.36],["each",0.48],["call,",0.64],["starting",1.36],["with",1.64],["X",1.84],["semaphore",2.12],["create",2.76],["new",3.12],["text.",3.34],["It",4.34],["takes",4.42],["no",4.58],["arguments",4.8],["at",5.2],["all.",5.38]],
  e2: [["It",0],["makes",0.2],["one",0.36],["key,",0.72],["and",1.56],["that",1.7],["key",1.86],["starts",2.04],["out",2.36],["free.",2.54],["So",3.34],["the",3.54],["first",3.66],["task",3.9],["to",4.18],["ask",4.34],["for",4.56],["it",4.74],["gets",4.86],["it",5.04]],
  e3: [["It",0],["returns",0.22],["a",0.54],["handle,",0.76],["which",1.52],["we",1.58],["store",1.72],["in",2.02],["Total",2.2],["Lock.",2.38],["That's",3.3],["the",3.48],["name",3.58],["both",3.74],["tasks",4.02],["use",4.52],["to",4.76],["find",4.92],["a",5.1],["key.",5.22]],
  e4: [["If",0],["the",0.24],["heap",0.34],["has",0.46],["run",0.64],["out,",0.84],["it",1.4],["returns",1.48],["null",1.9],["instead.",2.24]],
  e5: [["The",0],["function",0.22],["comes",0.42],["from",0.78],["the",0.98],["header",1.08],["free",1.24],["RTOS",1.74],["slash",2.78],["semphr",3.42],[".h,",4.44],["which",5.58],["is",5.64],["short",5.78],["for",6.08],["semaphore.",6.34]],
  e6: [["A",0],["mutex",0.24],["is",0.76],["one",1.26],["kind",1.58],["of",1.76],["semaphore.",1.92],["Semaphores",3.12],["get",3.52],["a",3.74],["video",3.88],["of",4.1],["their",4.32],["own",4.46],["later",4.8],["in",5.48],["this",5.72],["section.",5.86]],
  e7: [["And",0],["just",0.2],["like",0.3],["a",0.44],["cue,",0.56],["create",1.44],["it",1.72],["before",1.9],["the",2.18],["tasks",2.36],["that",2.72],["use",2.92],["it.",3.12]],
  t1: [["Next,",0],["X",0.8],["semaphore",0.9],["take.",1.36],["The",2.2],["first",2.28],["argument",2.48],["says",2.82],["which",3.16],["mutex",3.44],["you",3.94],["want.",4.1],["Total",5.02],["lock.",5.08]],
  t2: [["If",0],["the",0.24],["key",0.36],["is",0.54],["free,",0.74],["you",1.6],["get",1.84],["it",1.96],["straight",2.1],["away,",2.28],["and",3.12],["the",3.2],["call",3.3],["returns",3.52],["PD",4],["true.",4.34]],
  t3: [["If",0],["the",0.22],["other",0.36],["task",0.54],["is",0.86],["holding",1.04],["it,",1.34],["your",1.86],["task",1.9],["waits,",2.28],["asleep,",3.08],["and",4.16],["uses",4.22],["no",4.5],["CPU",4.82],["while",5.22],["it",5.6],["waits.",5.72]],
  t4: [["The",0],["second",0.24],["argument",0.46],["says",0.8],["how",1.32],["long",1.6],["to",1.98],["wait.",2.16],["Poor",3.12],["max",3.14],["delay",3.36],["means",3.66],["wait",3.98],["as",4.4],["long",4.8],["as",5.1],["it",5.28],["takes.",5.34]],
  t5: [["If",0],["you",0.24],["give",0.32],["a",0.44],["time",0.58],["limit",0.82],["instead,",1.08],["say",2.1],["100",2.34],["ticks,",2.76],["it",3.52],["can",3.56],["return",3.66],["PD",4],["false.",4.22],["That",5.28],["means",5.4],["the",5.52],["time",5.68],["ran",5.88],["out",6.08],["and",6.4],["you",6.8],["don't",6.92],["have",7.16],["a",7.32],["key.",7.44]],
  t6: [["In",0],["that",0.24],["case,",0.4],["don't",1.06],["touch",1.28],["total.",1.46]],
  g1: [["Then",0],["there's",0.24],["X",0.48],["semaphore",0.72],["GIF.",1.2],["It",2.02],["takes",2.1],["just",2.3],["a",2.66],["handle.",2.84]],
  g2: [["It",0],["hands",0.2],["the",0.44],["key",0.58],["back",0.78],["straight",1.06],["away,",1.38],["and",2.1],["it",2.26],["never",2.34],["waits.",2.5]],
  g3: [["If",0],["the",0.24],["other",0.36],["task",0.54],["was",0.88],["waiting",1.08],["for",1.36],["the",1.56],["key,",1.66],["it",2.46],["wakes",2.6],["up",2.8],["and",3.08],["gets",3.36],["it.",3.56]],
  g4: [["One",0],["important",0.24],["rule.",0.56],["Only",1.5],["the",1.64],["task",1.82],["that",2.1],["took",2.34],["the",2.48],["key",2.64],["may",2.96],["give",3.32],["it",3.48],["back.",3.6]],
  g5: [["If",0],["Work",0.28],["B",0.4],["tries",0.58],["to",0.84],["give",1.02],["back",1.12],["a",1.34],["key",1.48],["that",1.78],["Work",2.16],["A",2.32],["is",2.62],["holding,",3.04],["the",3.86],["program",3.98],["stops",4.24],["with",4.64],["Assert",4.9],["failed.",5.26]],
  s1: [["Each",0],["take",0.28],["and",0.58],["give",0.94],["costs",1.12],["a",1.44],["little",1.58],["time,",1.68],["and",2.56],["a",2.76],["million",2.84],["of",3.22],["them",3.38],["add",3.52],["up",3.56],["to",3.68],["a",3.8],["lot.",3.9]],
  s2: [["So",0],["do",0.26],["the",0.38],["work",0.52],["outside",0.72],["the",1.14],["lock.",1.32],["Each",2.14],["task",2.24],["keeps",2.58],["its",2.86],["own",3.06],["count",3.34],["in",3.74],["a",4.42],["local",4.56],["variable",4.78],["called",5.22],["mine.",5.52]],
  s3: [["Then",0],["it",0.22],["takes",0.3],["the",0.44],["key",0.62],["just",0.86],["once,",1.16],["adds",2.08],["mine",2.32],["to",2.58],["total,",2.74],["and",3.48],["gives",3.64],["the",3.78],["key",3.94],["back.",4.08]],
  s4: [["The",0],["total",0.24],["is",0.58],["2",0.82],["million",1.1],["again,",1.48],["but",2.28],["now",2.38],["each",2.62],["task",2.9],["takes",3.28],["the",3.56],["key",3.74],["once,",3.96],["instead",4.84],["of",5.12],["a",5.24],["million",5.36],["times.",5.54]],
  s5: [["The",0],["lesson.",0.26],["Hold",1.18],["the",1.3],["key",1.44],["for",1.68],["as",1.88],["few",2],["lines",2.22],["as",2.54],["you",2.7],["can.",2.8]],
  x1: [["Now",0],["for",0.26],["the",0.42],["mistake,",0.52],["almost",1.26],["everyone",1.42],["makes",2],["at",2.26],["least",2.44],["once.",2.58]],
  x2: [["Say",0],["you",0.3],["want",0.4],["a",0.5],["task",0.64],["to",0.88],["stop",1.1],["early,",1.38],["once",2.36],["total",2.48],["reaches",2.8],["one",3.22],["and",3.54],["a",3.68],["half",3.8],["million.",3.94],["So",4.8],["you",4.92],["put",5],["a",5.1],["break",5.24],["inside",5.52],["the",6],["locked",6.26],["section.",6.44]],
  x3: [["Work",0],["A",0.28],["hits",0.5],["the",0.7],["brake",0.86],["and",1.12],["leaves",1.72],["the",1.96],["loop",2.16],["while",2.38],["it's",2.58],["still",2.8],["holding",3],["the",3.32],["key,",3.46],["but",4.12],["it",4.3],["ends.",4.38]],
  x4: [["WorkB",0],["is",0.5],["now",0.9],["waiting",1.2],["for",1.46],["a",1.76],["key",1.88],["that",2.16],["will",2.54],["never",2.64],["come",2.82],["back.",3.06],["There's",3.9],["no",4.08],["error",4.28],["and",4.66],["no",5.08],["crash.",5.3],["The",6.26],["log",6.42],["just",6.6],["stops.",6.82]],
  x5: [["The",0],["fix",0.26],["is",0.46],["to",0.68],["give",0.82],["the",0.94],["key",1.08],["back",1.28],["before",1.7],["every",2.3],["way",3.02],["out",3.26],["of",3.5],["the",3.6],["lock",3.66],["section.",3.86]],
  x6: [["And",0],["if",0.2],["you",0.28],["put",0.38],["a",0.5],["time",0.64],["limit",0.84],["on",1.1],["the",1.3],["take,",1.44],["a",2.02],["silent",2.1],["hang",2.58],["turns",2.98],["into",3.68],["a",4.02],["warning",4.24],["you",4.6],["can",5.02],["actually",5.16],["see.",5.48]],
  z1: [["So",0],["a",0.3],["mutex",0.4],["is",0.9],["a",1.34],["key.",1.44],["You",2.24],["take",2.26],["it,",2.46],["touch",2.96],["the",3.14],["shared",3.36],["thing,",3.58],["and",4.24],["give",4.54],["it",4.84],["back",4.96],["so",5.28],["only",5.9],["one",6.28],["task",6.64],["at",6.96],["a",7.12],["time",7.24],["can",7.44],["change",7.64],["it.",7.9],["That's",8.56],["a",8.74],["mutex.",8.8]],
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

export const TAIL: Record<string, number> = { want: 1.6, race: 2.0, mutex: 2.4, code: 1.6, create: 2.0, take: 2.0, give: 2.2, short: 2.2, trap: 2.6, payoff: 6.0 };
const dur = (id: string, fallback: number) => SCENE_DUR[id] ?? fallback;
export const SCENES = [
  { id: 'want', dur: dur('want', 25) },
  { id: 'race', dur: dur('race', 50) },
  { id: 'mutex', dur: dur('mutex', 45) },
  { id: 'code', dur: dur('code', 30) },
  { id: 'create', dur: dur('create', 35) },
  { id: 'take', dur: dur('take', 35) },
  { id: 'give', dur: dur('give', 30) },
  { id: 'short', dur: dur('short', 30) },
  { id: 'trap', dur: dur('trap', 40) },
  { id: 'payoff', dur: dur('payoff', 14) },
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
export const MUTEXES_FRAMES = Math.round(SECONDS * FPS);

// ── voiceover ──────────────────────────────────────────────────────────────
//
// Pauses and emphasis (SCRIPT.md): `pause` = the silence before a line (default 0.6 s);
// ~1.0 s for a new beat, 0.3–0.4 s to finish a thought. In `say`, "..." = a beat with the
// words after it stressed; a full stop starts a fresh phrase.

export type VoLine = { id: string; scene: SceneId; at: number; text: string; say?: string; pause?: number };
export const VOICE = 'en-US-AndrewMultilingualNeural';
const L = (id: string, scene: SceneId, text: string, o: { say?: string; pause?: number } = {}): VoLine => ({ id, scene, at: at(id), text, ...o });

const SAY_CREATE = 'X semaphore create mutex';
const SAY_TAKE = 'X semaphore take';
const SAY_GIVE = 'X semaphore give';

export const VO: VoLine[] = [
  // 1 · want
  L('w1', 'want', "Let's say you want two tasks to share one number: a running total."),
  L('w2', 'want', 'work_a runs on core 0, on the left, and work_b runs on core 1, on the right.', { say: 'Work-A runs on core zero, on the left, and Work-B runs on core one, on the right.', pause: 0.6 }),
  L('w3', 'want', "Because they're on different cores, they really do run at the same moment, as you saw in the two cores video.", { pause: 0.5 }),
  L('w4', 'want', 'Each task adds one to total, a million times.', { pause: 0.7 }),
  L('w5', 'want', 'So when both are done, total should be exactly two million.', { pause: 0.5 }),
  // 2 · race: try 1
  L('r1', 'race', "The first thing most people write is a simple loop, with total plus plus inside. It's short, and it looks right."),
  L('r2', 'race', "Let's flash it, and see what we get.", { pause: 0.5 }),
  L('r3', 'race', "The last task to finish prints the final total. It's one point four five million, not two million.", { pause: 1.0 }),
  L('r4', 'race', 'More than half a million counts have simply disappeared.', { pause: 0.5 }),
  L('r5', 'race', 'And if you run it again, you get a different wrong number every time.', { pause: 0.6 }),
  L('r6', 'race', "So what's going on? total plus plus looks like a single step, but it isn't.", { say: "So what's going on? Total plus plus looks like a single step, but it isn't.", pause: 0.9 }),
  L('r7', 'race', 'Behind the scenes, it happens in three steps. First, the task reads the value of total. Then it adds one to it. Then it writes the new value back.', { pause: 0.5 }),
  L('r8', 'race', 'Now picture both cores doing this at the same moment. Both read total, and both see forty-one.', { pause: 0.7 }),
  L('r9', 'race', "Both add one, and both write back forty-two. That's two counts, but total only grew by one.", { pause: 0.4 }),
  L('r10', 'race', 'In slower code, this happens less often, which actually makes it worse: the bug hides, and only shows up once in a while.', { pause: 0.8 }),
  // 3 · mutex: try 2
  L('m1', 'mutex', 'What you need is a simple rule: only one task at a time is allowed to change total.'),
  L('m2', 'mutex', 'Think of it as a key. Whichever task is holding the key is the only one that may touch total.', { pause: 0.6 }),
  L('m3', 'mutex', 'So work_a takes the key, adds one, and then hands the key back.', { say: 'So Work-A takes the key, adds one, and then hands the key back.', pause: 0.6 }),
  L('m4', 'mutex', 'If work_b wants the key while work_a has it, work_b simply waits, asleep, until the key comes back.', { say: 'If Work-B wants the key while Work-A has it, Work-B simply waits, asleep, until the key comes back.', pause: 0.5 }),
  L('m5', 'mutex', 'And taking the key happens in one single step, so two tasks can never both get it.', { pause: 0.6 }),
  L('m6', 'mutex', "Let's flash this version.", { pause: 0.8 }),
  L('m7', 'mutex', "This time, the total is exactly two million, and it's the same on every run.", { pause: 0.9 }),
  L('m8', 'mutex', "That key has a name. It's called a mutex, which is short for mutual exclusion.", { pause: 0.8 }),
  L('m9', 'mutex', "There's a catch, though: the key isn't free. In QEMU, this run took about twenty-three seconds, where the first version took almost no time at all.", { say: "There's a catch, though: the key isn't free. In Q-E-M-U, this run took about twenty-three seconds, where the first version took almost no time at all.", pause: 0.9 }),
  // 4 · code
  L('k1', 'code', "Here's what that looks like in code. Both tasks run the same function, work_task.", { say: "Here's what that looks like in code. Both tasks run the same function, work task." }),
  L('k2', 'code', 'Right before total plus plus, we call xSemaphoreTake. That gets the key, or waits until the key is free.', { say: `Right before total plus plus, we call ${SAY_TAKE}. That gets the key, or waits until the key is free.`, pause: 0.6 }),
  L('k3', 'code', 'Right after it, we call xSemaphoreGive, which hands the key back.', { say: `Right after it, we call ${SAY_GIVE}, which hands the key back.`, pause: 0.5 }),
  L('k4', 'code', 'So the line in between is only ever run by one task at a time.', { pause: 0.6 }),
  L('k5', 'code', 'And in app_main, we create the mutex with xSemaphoreCreateMutex, before we start the tasks.', { say: `And in app main, we create the mutex with ${SAY_CREATE}, before we start the tasks.`, pause: 0.7 }),
  // 5 · xSemaphoreCreateMutex
  L('e1', 'create', "Let's look at each call, starting with xSemaphoreCreateMutex. It takes no arguments at all.", { say: `Let's look at each call, starting with ${SAY_CREATE}. It takes no arguments at all.` }),
  L('e2', 'create', 'It makes one key, and that key starts out free, so the first task to ask for it gets it.', { pause: 0.6 }),
  L('e3', 'create', "It returns a handle, which we store in total_lock. That's the name both tasks use to find the key.", { say: "It returns a handle, which we store in total lock. That's the name both tasks use to find the key.", pause: 0.7 }),
  L('e4', 'create', 'If the heap has run out, it returns NULL instead.', { say: 'If the heap has run out, it returns null instead.', pause: 0.5 }),
  L('e5', 'create', 'The function comes from the header freertos/semphr.h, which is short for semaphore.', { say: 'The function comes from the header Free R-TOS slash sem-P-H-R dot H, which is short for semaphore.', pause: 0.7 }),
  L('e6', 'create', 'A mutex is one kind of semaphore. Semaphores get a video of their own, later in this section.', { pause: 0.5 }),
  L('e7', 'create', 'And just like a queue, create it before the tasks that use it.', { pause: 0.7 }),
  // 6 · xSemaphoreTake
  L('t1', 'take', 'Next, xSemaphoreTake. The first argument says which mutex you want: total_lock.', { say: `Next, ${SAY_TAKE}. The first argument says which mutex you want: total lock.` }),
  L('t2', 'take', 'If the key is free, you get it straight away, and the call returns pdTRUE.', { say: 'If the key is free, you get it straight away, and the call returns P D true.', pause: 0.7 }),
  L('t3', 'take', 'If the other task is holding it, your task waits, asleep, and uses no CPU while it waits.', { pause: 0.7 }),
  L('t4', 'take', 'The second argument says how long to wait. portMAX_DELAY means wait as long as it takes.', { say: 'The second argument says how long to wait. Port-max-delay means wait as long as it takes.', pause: 0.7 }),
  L('t5', 'take', "If you give it a time limit instead, say a hundred ticks, it can return pdFALSE. That means the time ran out, and you don't have the key.", { say: "If you give it a time limit instead, say a hundred ticks, it can return P D false. That means the time ran out, and you don't have the key.", pause: 0.7 }),
  L('t6', 'take', "In that case, don't touch total.", { pause: 0.4 }),
  // 7 · xSemaphoreGive
  L('g1', 'give', 'Then there\'s xSemaphoreGive. It takes just the handle.', { say: `Then there's ${SAY_GIVE}. It takes just the handle.` }),
  L('g2', 'give', 'It hands the key back straight away, and it never waits.', { pause: 0.6 }),
  L('g3', 'give', 'If the other task was waiting for the key, it wakes up and gets it.', { pause: 0.5 }),
  L('g4', 'give', 'One important rule: only the task that took the key may give it back.', { pause: 0.8 }),
  L('g5', 'give', 'If work_b tries to give back a key that work_a is holding, the program stops with assert failed.', { say: 'If Work-B tries to give back a key that Work-A is holding, the program stops with assert failed.', pause: 0.5 }),
  // 8 · short
  L('s1', 'short', 'Each take and give costs a little time, and a million of them add up to a lot.'),
  L('s2', 'short', 'So do the work outside the lock. Each task keeps its own count, in a local variable called mine.', { pause: 0.6 }),
  L('s3', 'short', 'Then it takes the key just once, adds mine to total, and gives the key back.', { pause: 0.5 }),
  L('s4', 'short', 'The total is two million again, but now each task takes the key once, instead of a million times.', { pause: 0.7 }),
  L('s5', 'short', 'The lesson: hold the key for as few lines as you can.', { pause: 0.7 }),
  // 9 · trap
  L('x1', 'trap', 'Now for the mistake almost everyone makes at least once.'),
  L('x2', 'trap', 'Say you want a task to stop early, once total reaches one and a half million. So you put a break inside the locked section.', { pause: 0.6 }),
  L('x3', 'trap', "work_a hits the break, and leaves the loop while it's still holding the key. Then it ends.", { say: "Work-A hits the break, and leaves the loop while it's still holding the key. Then it ends.", pause: 0.7 }),
  L('x4', 'trap', "work_b is now waiting for a key that will never come back. There's no error, and no crash. The log just stops.", { say: "Work-B is now waiting for a key that will never come back. There's no error, and no crash. The log just stops.", pause: 0.7 }),
  L('x5', 'trap', 'The fix is to give the key back before every way out of the locked section.', { pause: 0.9 }),
  L('x6', 'trap', 'And if you put a time limit on the take, a silent hang turns into a warning you can actually see.', { pause: 0.7 }),
  // 10 · payoff
  L('z1', 'payoff', "So a mutex is a key. You take it, touch the shared thing, and give it back, so only one task at a time can change it. That's a mutex."),
];

// ── shared numbers and code (FACTS.md) ────────────────────────────────────

export const N = 1000000;
export const EXPECTED = 2 * N;
export const LIMIT = 1500000;
export const WORKER_COLOR: Record<string, string> = { work_a: '#b28dff', work_b: '#5b7cff' };

export const GLOBAL_LINES = ['static int total = 0;', 'static SemaphoreHandle_t total_lock;'];
export const TAKE_LINE = '        xSemaphoreTake(total_lock, portMAX_DELAY);';
export const INC_LINE = '        total++;';
export const GIVE_LINE = '        xSemaphoreGive(total_lock);';
export const CREATE_LINE = '    total_lock = xSemaphoreCreateMutex();';
export const CREATE_CALL = 'xSemaphoreCreateMutex()';
export const TAKE_CALL = 'xSemaphoreTake(total_lock, portMAX_DELAY)';
export const GIVE_CALL = 'xSemaphoreGive(total_lock)';
export const DONE_LINE = '    ESP_LOGI(TAG, "%s done: total = %d", pcTaskGetName(NULL), total);';

/** the worker: `locked` = with take/give around total++ */
export const workCode = (locked: boolean) => [
  'static void work_task(void *arg)',
  '{',
  '    for (int i = 0; i < 1000000; i++) {',
  ...(locked ? [TAKE_LINE, INC_LINE, GIVE_LINE] : [INC_LINE]),
  '    }',
  DONE_LINE,
  '    vTaskDelete(NULL);',
  '}',
];
export const mainCode = (locked: boolean) => [
  'void app_main(void)',
  '{',
  ...(locked ? [CREATE_LINE] : []),
  '    xTaskCreatePinnedToCore(work_task, "work_b", 2048, NULL, 5, NULL, 1);',
  '    xTaskCreatePinnedToCore(work_task, "work_a", 2048, NULL, 5, NULL, 0);',
  '}',
];

/** the short version (variant 5) */
export const shortCode = [
  'static void work_task(void *arg)',
  '{',
  '    int mine = 0;',
  '    for (int i = 0; i < 1000000; i++) {',
  '        mine++;',
  '    }',
  '    xSemaphoreTake(total_lock, portMAX_DELAY);',
  '    total += mine;',
  '    xSemaphoreGive(total_lock);',
  DONE_LINE,
  '    vTaskDelete(NULL);',
  '}',
];

/** the trap (variant 3); `fixed` adds the give before break */
export const BREAK_IF = '        if (total >= 1500000) {   // enough: stop early';
export const BREAK_GIVE = '            xSemaphoreGive(total_lock);';
export const trapCode = (fixed: boolean) => [
  'static void work_task(void *arg)',
  '{',
  '    for (int i = 0; i < 1000000; i++) {',
  TAKE_LINE,
  BREAK_IF,
  ...(fixed ? [BREAK_GIVE] : []),
  '            break;',
  '        }',
  INC_LINE,
  GIVE_LINE,
  '    }',
  DONE_LINE,
  '    vTaskDelete(NULL);',
  '}',
];

/** real logs (lab/logs) */
export const LOG_RACE = ['I (1583) total: work_b done: total = 1149796', 'I (1583) total: work_a done: total = 1455343'];
export const RACE_RUNS = [1455343, 1260172, 1284719]; // v1, v1-run2, v1-run3: the final totals
export const LOG_LOCKED = ['I (1600) main_task: Returned from app_main()', 'I (24930) total: work_b done: total = 1939261', 'I (25140) total: work_a done: total = 2000000'];
export const LOG_LOCKED_2 = 'I (34048) total: work_b done: total = 2000000'; // v0-run2
export const LOG_ASSERT = ['I (1574) total: work_a took total_lock', 'I (1674) total: work_b gives total_lock', 'assert failed: xTaskPriorityDisinherit tasks.c:5156 (pxTCB == pxCurrentTCBs[ xPortGetCoreID() ])', 'Rebooting...'];
export const LOG_SHORT = ['I (1767) total: work_a done: total = 1000000', 'I (1767) total: work_b done: total = 2000000'];
export const LOG_TRAP = ['I (1574) main_task: Returned from app_main()', 'I (20234) total: work_a done: total = 1500000'];
export const LOG_TIMEOUT = ['I (20144) total: work_b done: total = 1500000', 'W (21144) total: work_a: total_lock not free for 1 s', 'W (22144) total: work_a: total_lock not free for 1 s', 'W (23144) total: work_a: total_lock not free for 1 s'];
export const TAKE_LIMIT_LINE = '        if (xSemaphoreTake(total_lock, pdMS_TO_TICKS(1000)) != pdTRUE) {';

// ── 1. want ────────────────────────────────────────────────────────────────

export const WANT = {
  total: w('w1', 'total'),
  a: w('w2', 'runs'),
  b: w('w2', 'runs', 1),
  same: w('w3', 'same'),
  adds: w('w4', 'adds'),
  million: w('w4', 'million'),
  expect: w('w5', '2'),
  captions: [
    { at: at('w1'), text: 'you want: two tasks sharing one number — total' },
    { at: at('w2'), text: 'work_a on core 0 · work_b on core 1' },
    { at: at('w3'), text: 'both run at the same moment' },
    { at: at('w4'), text: 'each adds 1 to total, 1,000,000 times' },
    { at: at('w5'), text: 'expected: 2,000,000' },
  ] as Caption[],
};

// ── 2. race ────────────────────────────────────────────────────────────────

export const RACE = {
  code: at('r1'),
  simple: end('r1') - 0.6,
  flash: at('r2'),
  /** the log lines land just after "Flash it." */
  log: end('r2') + 0.3,
  final: w('r3', 'final'),
  number: w('r3', '1'),
  gone: w('r4', 'disappeared'),
  again: w('r5', 'again'),
  different: w('r5', 'different'),
  why: at('r6'),
  read: w('r7', 'reads'),
  add: w('r7', 'adds'),
  write: w('r7', 'writes'),
  both: at('r8'),
  read41: w('r8', '41'),
  write42: w('r9', 'write'),
  upOne: w('r9', 'grew'),
  hides: w('r10', 'bug'),
  captions: [
    { at: at('r1'), text: 'try 1: just total++, in both tasks · ✓ simple' },
    { at: at('r2'), text: 'flash it' },
    { at: at('r3'), text: 'the final total: 1,455,343 — not 2,000,000' },
    { at: at('r4'), text: '544,657 counts disappeared' },
    { at: at('r5'), text: 'every run: a different wrong number' },
    { at: at('r6'), text: 'total++ looks like one step — it isn’t' },
    { at: at('r7'), text: 'behind the scenes: read total → add 1 → write it back' },
    { at: at('r8'), text: 'both cores at once: both read 41' },
    { at: at('r9'), text: 'both write 42: two counts, total +1' },
    { at: at('r10'), text: 'slower code: rarer — so the bug hides' },
  ] as Caption[],
};

// ── 3. mutex ───────────────────────────────────────────────────────────────

export const MUTEX = {
  one: w('m1', 'one'),
  key: w('m2', 'key'),
  holding: w('m2', 'holding'),
  aTakes: w('m3', 'takes'),
  aAdds: w('m3', 'adds'),
  aGives: w('m3', 'hands'),
  bWants: w('m4', 'wants'),
  bWaits: w('m4', 'waits'),
  bBack: w('m4', 'back'),
  step: w('m5', 'step'),
  flash: at('m6'),
  log: end('m6') + 0.3,
  exactly: w('m7', 'exactly'),
  word: w('m8', 'mutex'),
  mutual: w('m8', 'mutual'),
  catch: at('m9'),
  seconds: w('m9', 'seconds'),
  captions: [
    { at: at('m1'), text: 'the rule: only one task at a time may change total' },
    { at: at('m2'), text: 'a key: only the holder may change total' },
    { at: at('m3'), text: 'work_a: take the key → total++ → hand it back' },
    { at: at('m4'), text: 'work_b wants it meanwhile → waits, asleep' },
    { at: at('m5'), text: 'taking the key is one step: never both' },
    { at: at('m6'), text: 'flash it' },
    { at: at('m7'), text: '✓ 2,000,000 exactly, every run' },
    { at: at('m8'), text: 'the key = a mutex (mutual exclusion)' },
    { at: at('m9'), text: '✗ it costs time: 23 s in QEMU, against ~0 without' },
  ] as Caption[],
};

// ── 4. code ────────────────────────────────────────────────────────────────

export const CODE = {
  same: w('k1', 'same'),
  take: w('k2', 'X'),
  orWait: w('k2', 'waits'),
  give: w('k3', 'X'),
  between: w('k4', 'between'),
  one: w('k4', 'one'),
  create: w('k5', 'X'),
  before: w('k5', 'before'),
  captions: [
    { at: at('k1'), text: 'one function, work_task, run by both tasks' },
    { at: at('k2'), text: 'xSemaphoreTake: get the key, or wait for it' },
    { at: at('k3'), text: 'xSemaphoreGive: hand it back' },
    { at: at('k4'), text: 'total++: one task at a time' },
    { at: at('k5'), text: 'app_main: xSemaphoreCreateMutex, before the tasks' },
  ] as Caption[],
};

// ── 5. xSemaphoreCreateMutex ───────────────────────────────────────────────

export const CREATE = {
  run: w('e1', 'X'),
  views: { key: at('e2'), handle: at('e3'), header: at('e5'), order: at('e7') },
  free: w('e2', 'free'),
  first: w('e2', 'first'),
  both: w('e3', 'both'),
  null: w('e4', 'null'),
  kind: w('e6', 'kind'),
  later: w('e6', 'later'),
  captions: [
    { at: at('e1'), text: 'xSemaphoreCreateMutex(): no arguments' },
    { at: at('e2'), text: 'one key, and it starts free' },
    { at: at('e3'), text: 'returns a handle: total_lock, used by both tasks' },
    { at: at('e4'), text: 'NULL if the heap is too full' },
    { at: at('e5'), text: '#include "freertos/semphr.h"' },
    { at: at('e6'), text: 'a mutex is one kind of semaphore (semaphores: later)' },
    { at: at('e7'), text: 'like a queue: make it before the tasks that use it' },
  ] as Caption[],
};

// ── 6. xSemaphoreTake ──────────────────────────────────────────────────────

export const TAKE = {
  run: w('t1', 'X'),
  args: [w('t1', 'first'), w('t4', 'second')],
  views: { free: at('t2'), held: at('t3'), limit: at('t5') },
  once: w('t2', 'straight'),
  pdtrue: w('t2', 'P'),
  asleep: w('t3', 'asleep'),
  forever: w('t4', 'long', 1),
  pdfalse: w('t5', 'P'),
  dont: at('t6'),
  captions: [
    { at: at('t1'), text: 'xSemaphoreTake(which mutex, ticks to wait)' },
    { at: at('t2'), text: 'free → you get it straight away · pdTRUE' },
    { at: at('t3'), text: 'held by the other task → you wait, asleep, no CPU' },
    { at: at('t4'), text: 'portMAX_DELAY = wait as long as it takes' },
    { at: at('t5'), text: 'with a limit: pdFALSE → you don’t have the key' },
    { at: at('t6'), text: '…so don’t touch total' },
  ] as Caption[],
};

// ── 7. xSemaphoreGive ──────────────────────────────────────────────────────

export const GIVE = {
  run: w('g1', 'X'),
  args: [w('g1', 'handle')],
  views: { back: at('g2'), owner: at('g4') },
  never: w('g2', 'never'),
  wakes: w('g3', 'wakes'),
  gets: w('g3', 'gets'),
  only: w('g4', 'only'),
  holds: w('g5', 'holding'),
  stops: w('g5', 'stops'),
  assert: w('g5', 'assert'),
  captions: [
    { at: at('g1'), text: 'xSemaphoreGive(which mutex)' },
    { at: at('g2'), text: 'the key goes back at once · it never waits' },
    { at: at('g3'), text: 'a waiting task wakes up and gets it' },
    { at: at('g4'), text: 'only the task that took it may give it back' },
    { at: at('g5'), text: 'the wrong task gives → assert failed → restart' },
  ] as Caption[],
};

// ── 8. short ───────────────────────────────────────────────────────────────

export const SHORT = {
  cost: at('s1'),
  lot: w('s1', 'lot'),
  outside: w('s2', 'outside'),
  mine: w('s2', 'mine'),
  once: w('s3', 'once'),
  add: w('s3', 'adds'),
  again: at('s4'),
  instead: w('s4', 'instead'),
  few: w('s5', 'few'),
  captions: [
    { at: at('s1'), text: 'every take + give costs a little — a million cost a lot' },
    { at: at('s2'), text: 'do the work outside the lock: count in mine' },
    { at: at('s3'), text: 'then lock once: total += mine' },
    { at: at('s4'), text: '2,000,000 · one take, one give per task' },
    { at: at('s5'), text: 'hold the key for as few lines as you can' },
  ] as Caption[],
};

// ── 9. trap ────────────────────────────────────────────────────────────────

export const TRAP = {
  now: at('x1'),
  stop: w('x2', 'stop'),
  add: w('x2', 'break'),
  breaks: w('x3', 'leaves'),
  holding: w('x3', 'holding'),
  ends: w('x3', 'ends'),
  waits: w('x4', 'waiting'),
  forever: w('x4', 'never'),
  stops: w('x4', 'stops'),
  fix: at('x5'),
  every: w('x5', 'every'),
  limit: at('x6'),
  warning: w('x6', 'warning'),
  views: { bug: at('x2'), hang: at('x4'), fix: at('x5'), limit: at('x6') },
  captions: [
    { at: at('x1'), text: 'the mistake everyone makes once' },
    { at: at('x2'), text: 'a break between take and give' },
    { at: at('x3'), text: 'work_a leaves, still holding the key' },
    { at: at('x4'), text: 'work_b waits forever · no error, no crash, no more log' },
    { at: at('x5'), text: 'fix: give the key back before every way out' },
    { at: at('x6'), text: 'a time limit on the take → a warning you can see' },
  ] as Caption[],
};

// ── 10. payoff ─────────────────────────────────────────────────────────────

export const PAYOFF = {
  word: w('z1', 'That'),
  recap: [
    { at: w('z1', 'That', 0, 1.3), k: 'xSemaphoreCreateMutex()', v: 'one key, starts free · NULL if no memory' },
    { at: w('z1', 'That', 0, 1.65), k: 'xSemaphoreTake(lock, portMAX_DELAY)', v: 'get the key, or sleep until it’s free' },
    { at: w('z1', 'That', 0, 2.0), k: 'xSemaphoreGive(lock)', v: 'back at once · only by the task that took it' },
    { at: w('z1', 'That', 0, 2.35), k: 'rule', v: 'give it back on every path · hold it briefly' },
    { at: w('z1', 'That', 0, 2.7), k: 'next', v: 'priority inversion' },
  ],
};
