/**
 * FreeRTOS queues — the timeline. Single source of truth for picture AND sound.
 * PURE ESP-IDF: xQueueCreate, xQueueSend, xQueueReceive, portMAX_DELAY; GPIO as Basic GPIO
 * taught (polled button, one LED).
 *
 *   want (let's say you want: a press → three blinks; two tasks, left and right) →
 *     flag (the first try, run for real: simple, but it polls and loses a press) →
 *     queue (the same presses through a row of boxes: every press, in order, the LED task
 *     sleeps; the catch: only five boxes → QUEUE) → tasks (the code, both sides at once) →
 *     xQueueSend → xQueueReceive → xQueueCreate → full (eight presses, five boxes: 7 and 8
 *     dropped) → trap (queue made after the tasks: assert, boot loop) → payoff
 *
 * v2 (review pass): opens on the want; the problem is shown on two sides (button task left,
 * LED task right) with a shared flag first, then a queue; then the code of both tasks; every
 * call's views show both ends of the queue at once. The old demo scene became the queue
 * scene's run.
 *
 * Every log line is REAL output: the program in ./lab, built with ESP-IDF v6.0.2 and run
 * in QEMU (./lab/logs; presses simulated). Times are SCENE-RELATIVE. `node
 * scripts/vo-plan.ts freertos-queues` voices every line and writes VO_AT / VO_WORDS /
 * SCENE_DUR below; cues are `w(line, word)`. Import-free (type-only imports are erased).
 * Every claim on screen or in the VO is sourced in ./FACTS.md.
 */
import type { Caption } from '../../components/pwm';

export const FPS = 30;
export const SECTION = '2-freertos';

// ── generated: VO plan (node scripts/vo-plan.ts freertos-queues) — do not edit by hand ──
export const VO_AT: Record<string, number> = {"w1":0.5,"w2":5.56,"w3":8.7,"w4":13.64,"w5":19.22,"w6":22.86,"g1":0.6,"g2":5.6,"g3":9.88,"g4":13.76,"g5":18.64,"g6":20.88,"g7":22.94,"g8":29.66,"g9":32.32,"g10":38.34,"q1":0.6,"q2":5.48,"q3":9.8,"q4":14.26,"q5":20.18,"q6":24.74,"q7":27.34,"q8":29.6,"q9":34.74,"q10":38.46,"q11":40.16,"k1":0.6,"k2":6.56,"k3":12.98,"k4":20.14,"k5":23.9,"s1":0.6,"s2":6.02,"s3":12.3,"s3b":17.88,"s4":23.12,"s4b":26.96,"s5":29.42,"s6":32.54,"s7":37.72,"r0":0.5,"r1":4.66,"r2":10.86,"r2b":15.84,"r3":19.84,"r4":23.98,"r4b":26.4,"r5":31.32,"r6":34.42,"e0":0.5,"e1":5.14,"e2":7.7,"e3":13.32,"e4":20.4,"e5":26.7,"e6":33.12,"e7":37.06,"e8":41.18,"f1":0.5,"f2":5.58,"f3":10.24,"f4":17.34,"t1":0.5,"t2":3.38,"t3":6.32,"t4":11.64,"t5":18.42,"t6":26.18,"z1":0.5};
export const SCENE_DUR: Record<string, number> = {"want":28.94,"flag":46.02,"queue":48.04,"tasks":28.38,"send":40.62,"receive":42.32,"create":47.24,"full":24.96,"trap":32.34,"payoff":14.32};
export const VO_WORDS: Record<string, [string, number][]> = {
  w1: [["Let's",0],["say",0.32],["you",0.44],["want",0.56],["an",0.66],["LED",0.78],["to",1.14],["blink",1.56],["three",1.86],["times,",2.3],["every",3.28],["time",3.54],["you",3.78],["press",3.94],["a",4.08],["button.",4.22]],
  w2: [["Three",0],["blinks",0.38],["take",0.7],["one",1.04],["and",1.4],["a",1.52],["half",1.64],["seconds.",1.86]],
  w3: [["If",0],["one",0.24],["loop",0.52],["did",0.76],["both,",1.02],["it",1.84],["would",1.92],["miss",2.02],["any",2.24],["press",2.54],["that",2.94],["comes",3.18],["while",3.42],["it's",3.64],["blinking.",3.82]],
  w4: [["So",0],["each",0.3],["job",0.5],["gets",0.84],["its",1.06],["own",1.18],["task.",1.32],["The",2.36],["button",2.4],["task,",2.66],["on",3.48],["the",3.58],["left,",3.72],["watches",4.46],["the",4.72],["button.",4.96]],
  w5: [["The",0],["LED",0.26],["task",0.52],["on",1.12],["the",1.52],["right",1.62],["blinks",1.88],["the",2.24],["LED.",2.42]],
  w6: [["But",0],["only",0.2],["the",0.4],["button",0.6],["task",0.82],["sees",1.38],["the",1.76],["press,",1.98],["so",2.76],["how",3.02],["does",3.14],["it",3.24],["tell",3.36],["the",3.56],["LED",3.72],["task?",4.02]],
  g1: [["The",0],["first",0.22],["thing",0.4],["most",0.58],["people",0.84],["try",1.1],["is",1.54],["a",1.8],["share",1.92],["variable,",2.18],["a",3.18],["flag",3.26],["called",3.68],["pressed.",3.98]],
  g2: [["When",0],["a",0.22],["button",0.34],["task",0.54],["sees",1],["a",1.26],["press,",1.44],["it",2.26],["sets",2.4],["the",2.64],["flag",2.86],["to",3.14],["true.",3.36]],
  g3: [["The",0],["LED",0.26],["task",0.58],["checks",1.14],["the",1.42],["flag",1.62],["every",1.96],["10",2.48],["milliseconds.",2.84]],
  g4: [["If",0],["the",0.22],["flag",0.34],["is",0.6],["set,",0.78],["the",1.52],["LED",1.54],["task",1.86],["clears",2.42],["it",2.84],["and",3.18],["blinks.",3.64]],
  g5: [["Let's",0],["press",0.32],["the",0.5],["button",0.7],["once.",0.92]],
  g6: [["It",0],["works",0.24],["and",0.44],["it's",0.68],["simple.",0.9]],
  g7: [["But",0],["the",0.26],["LED",0.38],["task",0.7],["has",1.3],["to",1.64],["keep",1.8],["checking",2.02],["100",2.5],["times",3.18],["a",3.5],["second,",3.66],["even",4.42],["when",4.78],["nothing",5],["happens.",5.22]],
  g8: [["Now",0],["let's",0.28],["try",0.52],["three",0.72],["quick",1.32],["presses.",1.7]],
  g9: [["Presses",0],["three",0.52],["and",0.82],["four",1.06],["come",1.56],["while",2.1],["it's",2.34],["blinking",2.52],["and",2.82],["they",3.44],["set",3.54],["a",3.7],["flag",3.84],["that's",4.22],["already",4.52],["set",4.74]],
  g10: [["That's",0],["three",0.4],["presses,",0.68],["but",1.58],["the",1.76],["LED",1.86],["task",2.2],["saw",2.74],["only",3.16],["two,",3.6],["so",4.44],["one",4.74],["press",5],["is",5.22],["lost.",5.4]],
  q1: [["Now",0],["let's",0.3],["swap",0.54],["the",0.72],["flag",0.9],["for",1.2],["a",1.48],["cue,",1.6],["a",2.34],["row",2.48],["of",2.64],["boxes",2.8],["between",3.14],["the",3.48],["two",3.6],["tasks.",3.76]],
  q2: [["The",0],["button",0.24],["task",0.48],["puts",1.02],["a",1.42],["copy",1.58],["of",1.88],["each",2.2],["press",2.48],["in",2.88],["at",3.22],["the",3.48],["back.",3.56]],
  q3: [["The",0],["LED",0.24],["task",0.58],["takes",1.28],["them",1.74],["out",1.92],["at",2.04],["the",2.12],["front,",2.28],["oldest",2.88],["first.",3.12]],
  q4: [["When",0],["the",0.22],["queue",0.34],["is",0.54],["empty,",0.82],["the",1.88],["LED",1.92],["task",2.24],["sleeps",2.74],["and",3.14],["there's",3.9],["no",4.08],["checking",4.3],["at",4.6],["all.",4.78]],
  q5: [["Here",0],["are",0.24],["the",0.32],["same",0.4],["presses",0.74],["again,",1.08],["starting",1.86],["with",2.1],["one",2.26],["press.",2.58]],
  q6: [["Now,",0],["three",0.66],["quick",1.04],["presses.",1.36]],
  q7: [["3",0],["and",0.46],["4",0.7],["wait",1.02],["their",1.32],["turn.",1.56]],
  q8: [["and",0],["come",0.24],["out",0.38],["one",0.52],["at",0.68],["a",0.78],["time,",0.94],["in",1.56],["order",1.8],["as",2.12],["each",2.92],["blink",3.32],["ends.",3.66]],
  q9: [["Every",0],["press",0.34],["gets",0.68],["through,",0.98],["and",1.84],["nothing",2.08],["is",2.3],["lost.",2.48]],
  q10: [["That's",0],["a",0.32],["cue.",0.4]],
  q11: [["The",0],["catch",0.22],["is",0.46],["that",0.78],["a",0.92],["queue",0.98],["has",1.2],["a",1.38],["fixed",1.54],["number",1.74],["of",1.94],["boxes.",2.1],["When",3.02],["they're",3.2],["all",3.32],["full,",3.5],["a",4.28],["new",4.42],["press",4.66],["is",4.94],["dropped.",5.14]],
  k1: [["Here's",0],["the",0.36],["code.",0.48],["The",1.18],["button",1.28],["task",1.52],["is",1.9],["on",2.24],["the",2.36],["left",2.48],["and",2.76],["the",3.28],["LED",3.4],["task",3.68],["is",4.32],["on",4.64],["the",4.78],["right.",4.9]],
  k2: [["When",0],["a",0.2],["button",0.34],["task",0.56],["sees",1],["a",1.24],["press,",1.4],["it",2.16],["calls",2.2],["XQ",2.56],["Send",3.22],["and",3.54],["the",4.24],["press",4.36],["goes",4.64],["in",4.84],["at",5.06],["the",5.18],["back.",5.26]],
  k3: [["The",0],["LED",0.24],["task",0.5],["calls",1],["XQReceive.",1.6],["It",3.22],["waits",3.34],["right",3.56],["there",3.86],["until",4.36],["a",4.92],["press",5.08],["comes",5.4],["out",5.72],["of",5.88],["the",6],["front.",6.02]],
  k4: [["Both",0],["tasks",0.32],["name",0.78],["the",1.06],["same",1.22],["queue.",1.48],["Press",2.42],["Q.",2.54]],
  k5: [["Let's",0],["take",0.3],["each",0.4],["call",0.58],["apart,",0.8],["starting",1.62],["with",1.9],["XQ",2.1],["Send.",2.62]],
  s1: [["XQ's",0],["sin",0.64],["takes",0.78],["three",1.14],["arguments.",1.66],["The",2.64],["first",2.9],["is",3.2],["the",3.68],["Q's",3.82],["handle.",4.24]],
  s2: [["Then",0],["comes",0.24],["a",0.44],["pointer",0.58],["to",0.82],["the",1.02],["item.",1.14],["Here",2.16],["presses",2.2],["an",2.74],["int.",3.38],["The",4.12],["queue",4.2],["copies",4.4],["its",4.86],["4",5.04],["bytes.",5.3]],
  s3: [["It's",0],["a",0.28],["copy,",0.42],["so",1],["presses",1.32],["can",1.64],["change",1.9],["straight",2.26],["away,",2.58],["and",3.42],["the",3.56],["cue",3.64],["keeps",3.9],["the",4.22],["old",4.42],["value.",4.58]],
  s3b: [["Meanwhile,",0],["at",0.66],["the",0.7],["other",0.8],["end,",0.98],["the",1.72],["LED",1.76],["task",2.08],["takes",2.72],["out",3.18],["the",3.52],["oldest",3.7],["one.",4.04]],
  s4: [["The",0],["last",0.22],["argument",0.44],["is",0.74],["how",1.06],["many",1.24],["ticks",1.44],["to",1.64],["wait",1.82],["if",2.08],["the",2.68],["queue",2.8],["is",3.02],["full.",3.16]],
  s4b: [["Zero",0],["means",0.34],["don't",0.6],["wait",1],["at",1.18],["all.",1.32]],
  s5: [["It",0],["returns",0.22],["PD",0.56],["true",0.96],["when",1.34],["the",1.78],["item",1.88],["went",2.1],["in.",2.32]],
  s6: [["If",0],["the",0.24],["cue",0.34],["is",0.52],["full,",0.68],["it",1.5],["returns",1.64],["air",2.14],["cue",2.52],["full",2.82],["and",3.18],["this",3.84],["press",4],["is",4.22],["dropped.",4.44]],
  s7: [["So",0],["you",0.26],["log",0.36],["a",0.54],["warning.",0.68]],
  r0: [["Now",0],["the",0.3],["other",0.46],["end,",0.66],["the",1.48],["LED",1.5],["tasks",1.82],["XQ",2.48],["receive.",3.16]],
  r1: [["Its",0],["first",0.24],["argument",0.54],["is",0.86],["the",1.34],["handle.",1.5],["Then",2.42],["comes",2.54],["where",2.78],["to",2.92],["put",2.96],["the",3.08],["item.",3.22],["Here,",4.08],["the",4.72],["variable",4.84],["press.",5.14]],
  r2: [["It",0],["copies",0.22],["the",0.64],["oldest",0.9],["item",1.34],["into",1.82],["press",2.16],["and",2.7],["takes",3.5],["it",3.68],["out",3.8],["of",3.88],["the",3.98],["queue.",4.04]],
  r2b: [["Meanwhile,",0],["the",0.66],["button",0.76],["task",1.02],["can",1.46],["keep",1.72],["adding",1.94],["presses",2.24],["at",2.52],["the",2.74],["back.",2.82]],
  r3: [["The",0],["last",0.22],["argument",0.44],["is",0.72],["how",1.02],["long",1.26],["to",1.6],["wait",1.8],["if",2.08],["the",2.68],["queue",2.8],["is",3.08],["empty.",3.26]],
  r4: [["PortMaxDelay",0],["means",0.96],["wait",1.24],["forever.",1.58]],
  r4b: [["The",0],["task",0.26],["sleeps",0.56],["and",1],["costs",1.62],["nothing",2.02],["until",2.54],["press",3.26],["arrives.",3.52]],
  r5: [["It",0],["returns",0.22],["PD",0.58],["true",1.1],["when",1.5],["it",1.9],["got",1.98],["an",2.1],["item.",2.22]],
  r6: [["With",0],["a",0.24],["time",0.34],["limit",0.52],["instead,",0.76],["like",1.64],["2",1.78],["seconds,",2.12],["it",3.02],["can",3.16],["return",3.26],["PD",3.62],["false,",3.86],["which",4.78],["means",4.86],["nothing",5.1],["came.",5.36]],
  e0: [["Both",0],["tasks",0.32],["use",0.74],["press",1],["Q",1.3],["and",1.68],["App",2.26],["main",2.46],["makes",2.64],["it",2.9],["before",3.04],["it",3.3],["starts",3.42],["them.",3.66]],
  e1: [["XQ",0],["create",0.5],["takes",0.86],["two",1.22],["numbers",1.52]],
  e2: [["The",0],["first",0.22],["is",0.46],["the",0.84],["length.",0.98],["How",1.84],["many",2.04],["items",2.3],["it",2.6],["can",2.76],["hold",2.84],["at",3],["once.",3.12],["Here,",4.02],["that's",4.3],["five.",4.48]],
  e3: [["The",0],["second",0.24],["is",0.52],["the",0.88],["item",1.06],["size",1.38],["in",1.8],["bytes.",2.4],["Each",3.42],["press",3.58],["is",3.88],["an",4.32],["int",4.44],["and",4.68],["size",5.3],["of",5.58],["int",5.72],["is",5.9],["4.",6.02]],
  e4: [["Every",0],["item",0.36],["is",0.72],["the",1.12],["same",1.3],["size.",1.52],["The",2.62],["queue",2.7],["copies",2.9],["that",3.44],["many",3.82],["bytes",4.26],["every",4.72],["time.",5.08]],
  e5: [["So",0],["it",0.28],["takes",0.38],["5",0.56],["times",0.88],["4,",1.12],["which",1.62],["is",1.68],["20",1.84],["bytes,",2.2],["plus",2.94],["a",3.18],["little",3.34],["bookkeeping",3.46],["from",4.12],["the",4.54],["heap",4.68],["once.",4.94]],
  e6: [["It",0],["returns",0.22],["a",0.54],["handle,",0.76],["the",1.46],["name",1.64],["both",1.82],["tasks",2.12],["use",2.6],["for",2.82],["this",3],["queue.",3.14]],
  e7: [["If",0],["the",0.24],["heap",0.34],["is",0.5],["too",0.72],["full,",0.98],["it",1.88],["returns",1.98],["null",2.42],["instead.",2.76]],
  e8: [["It",0],["comes",0.22],["from",0.4],["the",0.58],["header",0.68],["FreeRTOS,",0.92],["slash",3.04],["q",3.12],[".h.",3.52]],
  f1: [["Back",0],["to",0.26],["the",0.4],["catch,",0.48],["there",1.3],["are",1.42],["only",1.52],["5",1.76],["boxes.",2.1],["Let's",3.2],["press",3.4],["8",3.52],["times",3.74],["fast.",4.12]],
  f2: [["Press",0],["1",0.32],["is",0.62],["taken",0.92],["straight",1.14],["away.",1.4],["Presses",2.28],["2",2.48],["to",2.78],["6",3.02],["fill",3.32],["the",3.54],["queue.",3.66]],
  f3: [["Presses",0],["seven",0.54],["and",0.98],["eight",1.44],["find",1.74],["it",2.1],["full",2.24],["xq",2.54],["send",3.38],["gives",3.74],["up",4.16],["at",4.34],["once",4.48],["and",4.92],["a",5.4],["warnings",5.48],["print",5.78]],
  f4: [["If",0],["every",0.26],["press",0.66],["matters,",0.98],["make",1.94],["the",2.02],["queue",2.18],["longer",2.4],["or",2.84],["let",3.52],["the",3.64],["button",3.8],["task",4.04],["wait",4.46],["a",4.7],["few",4.82],["ticks.",4.96]],
  t1: [["Now",0],["for",0.3],["the",0.44],["mistake",0.54],["everyone",0.92],["makes",1.5],["once.",1.88]],
  t2: [["Say",0],["you",0.3],["create",0.44],["the",0.7],["queue",0.86],["after",1.16],["the",1.5],["tasks.",1.66]],
  t3: [["Remember,",0],["a",0.96],["new",1.16],["task",1.36],["with",1.68],["a",1.86],["higher",1.98],["priority",2.2],["than",2.7],["app",3.06],["main",3.4],["run",3.74],["straight",4.04],["away.",4.34]],
  t4: [["So",0],["the",0.26],["LED",0.36],["task",0.64],["calls",1.2],["XQReceive",1.7],["before",2.78],["the",3.14],["queue",3.26],["exists",3.46],["and",3.96],["its",4.56],["handle",4.68],["is",5.06],["still",5.34],["null.",5.64]],
  t5: [["The",0],["program",0.24],["stops",0.52],["with",0.88],["assert",1.18],["failed",1.52],["and",2.02],["x",2.52],["-key",2.8],["receive.",3],["The",3.96],["chip",4.06],["restarts",4.24],["and",4.96],["does",5.42],["it",5.6],["again",5.72],["forever.",6.1]],
  t6: [["The",0],["fix",0.24],["is",0.44],["to",0.68],["create",0.82],["the",1.08],["queue",1.28],["first,",1.54],["then",2.52],["the",2.64],["tasks",2.78],["that",3.14],["use",3.36],["it.",3.56]],
  z1: [["So",0],["a",0.28],["queue",0.46],["carries",0.62],["copies",1.04],["from",1.38],["one",1.74],["task",2.08],["to",2.48],["another,",2.74],["in",3.46],["order,",3.62],["and",4.62],["the",4.7],["receiver",4.78],["sleeps",5.16],["until",5.62],["they",6.24],["arrive.",6.4],["That's",7.32],["a",7.54],["queue.",7.6]],
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

export const TAIL: Record<string, number> = { want: 1.6, flag: 2.0, queue: 2.4, tasks: 1.6, send: 2.0, receive: 2.2, create: 2.0, full: 2.4, trap: 2.4, payoff: 6.0 };
const dur = (id: string, fallback: number) => SCENE_DUR[id] ?? fallback;
export const SCENES = [
  { id: 'want', dur: dur('want', 25) },
  { id: 'flag', dur: dur('flag', 45) },
  { id: 'queue', dur: dur('queue', 45) },
  { id: 'tasks', dur: dur('tasks', 30) },
  { id: 'send', dur: dur('send', 35) },
  { id: 'receive', dur: dur('receive', 35) },
  { id: 'create', dur: dur('create', 40) },
  { id: 'full', dur: dur('full', 28) },
  { id: 'trap', dur: dur('trap', 30) },
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
export const QUEUES_FRAMES = Math.round(SECONDS * FPS);

// ── voiceover ──────────────────────────────────────────────────────────────
//
// Pauses and emphasis (SCRIPT.md "Pauses and emphasis"): `pause` = the silence before a
// line (default 0.6 s): ~1.0 s for a new beat, 0.3–0.4 s for a line that finishes the
// last one's thought, longer when the picture carries the moment alone. Inside a line, in
// `say`: "..." = a beat (≈0.5 s) and the words after it are stressed ("that... many
// bytes"); a full stop starts a fresh phrase; a comma is a short breath.

export type VoLine = { id: string; scene: SceneId; at: number; text: string; say?: string; pause?: number };
export const VOICE = 'en-US-AndrewMultilingualNeural';
const L = (id: string, scene: SceneId, text: string, o: { say?: string; pause?: number } = {}): VoLine => ({ id, scene, at: at(id), text, ...o });

const SAY_CREATE = 'X queue create';
const SAY_SEND = 'X queue send';
const SAY_RECV = 'X queue receive';

export const VO: VoLine[] = [
  // 1 · want
  L('w1', 'want', "Let's say you want an LED to blink three times, every time you press a button."),
  L('w2', 'want', 'Three blinks take one and a half seconds.', { pause: 0.7 }),
  L('w3', 'want', "If one loop did both, it would miss any press that comes while it's blinking.", { pause: 0.9 }),
  L('w4', 'want', 'So each job gets its own task. The button task, on the left, watches the button.', { pause: 0.9 }),
  L('w5', 'want', 'The LED task, on the right, blinks the LED.', { pause: 0.4 }),
  L('w6', 'want', 'But only the button task sees the press, so how does it tell the LED task?', { pause: 0.9 }),
  // 2 · flag: the first try
  L('g1', 'flag', 'The first thing most people try is a shared variable: a flag, called pressed.', { pause: 0.6 }),
  L('g2', 'flag', 'When the button task sees a press, it sets the flag to true.', { pause: 0.7 }),
  L('g3', 'flag', 'The LED task checks the flag every ten milliseconds.', { pause: 0.7 }),
  L('g4', 'flag', 'If the flag is set, the LED task clears it, and blinks.', { pause: 0.6 }),
  L('g5', 'flag', "Let's press the button once.", { pause: 0.9 }),
  L('g6', 'flag', "It works, and it's simple.", { pause: 1.0 }),
  L('g7', 'flag', 'But the LED task has to keep checking, a hundred times a second, even when nothing happens.', { pause: 0.9 }),
  L('g8', 'flag', "Now let's try three quick presses.", { pause: 1.1 }),
  L('g9', 'flag', "Presses three and four come while it's blinking, and they set a flag that's already set.", { pause: 0.6 }),
  L('g10', 'flag', "That's three presses, but the LED task saw only two, so one press is lost.", { pause: 0.9 }),
  // 3 · queue: the answer, run on the same presses
  L('q1', 'queue', "Now let's swap the flag for a queue: a row of boxes between the two tasks.", { pause: 0.6 }),
  L('q2', 'queue', 'The button task puts a copy of each press in at the back.', { pause: 0.7 }),
  L('q3', 'queue', 'The LED task takes them out at the front, oldest first.', { pause: 0.5 }),
  L('q4', 'queue', "When the queue is empty, the LED task sleeps, and there's no checking at all.", { pause: 0.9 }),
  L('q5', 'queue', "Here are the same presses again, starting with one press.", { pause: 0.9 }),
  L('q6', 'queue', 'Now, three quick presses.', { pause: 1.6 }),
  L('q7', 'queue', 'Three and four wait their turn,', { pause: 0.9 }),
  L('q8', 'queue', 'and come out one at a time, in order, as each blink ends.', { pause: 0.4 }),
  L('q9', 'queue', 'Every press gets through, and nothing is lost.', { pause: 1.1 }),
  L('q10', 'queue', "That's a queue.", { pause: 0.9 }),
  L('q11', 'queue', "The catch is that a queue has a fixed number of boxes. When they're all full, a new press is dropped.", { pause: 1.1 }),
  // 4 · tasks: the code, both sides
  L('k1', 'tasks', "Here's the code. The button task is on the left, and the LED task is on the right.", { pause: 0.6 }),
  L('k2', 'tasks', 'When the button task sees a press, it calls xQueueSend, and the press goes in at the back.', { say: `When the button task sees a press, it calls ${SAY_SEND}, and the press goes in at the back.`, pause: 0.9 }),
  L('k3', 'tasks', 'The LED task calls xQueueReceive. It waits right there, until a press comes out at the front.', { say: `The LED task calls ${SAY_RECV}. It waits right there, until a press comes out at the front.`, pause: 0.9 }),
  L('k4', 'tasks', 'Both tasks name the same queue: press_queue.', { say: 'Both tasks name the same queue: press queue.', pause: 0.9 }),
  L('k5', 'tasks', "Let's take each call apart, starting with xQueueSend.", { say: `Let's take each call apart, starting with ${SAY_SEND}.`, pause: 0.9 }),
  // 5 · xQueueSend
  L('s1', 'send', "xQueueSend takes three arguments. The first is the queue's handle.", { say: `${SAY_SEND} takes three arguments. The first is the queue's handle.`, pause: 0.6 }),
  L('s2', 'send', 'Then comes a pointer to the item: here, presses, an int. The queue copies its four bytes.', { pause: 0.9 }),
  L('s3', 'send', "It's a copy, so presses can change straight away, and the queue keeps the old value.", { pause: 0.7 }),
  L('s3b', 'send', 'Meanwhile, at the other end, the LED task takes out the oldest one.', { pause: 0.7 }),
  L('s4', 'send', 'The last argument is how many ticks to wait, if the queue is full.', { pause: 0.9 }),
  L('s4b', 'send', "Zero means don't wait at all.", { pause: 0.4 }),
  L('s5', 'send', 'It returns pdTRUE when the item went in.', { say: 'It returns P D true when the item went in.', pause: 0.9 }),
  L('s6', 'send', 'If the queue is full, it returns errQUEUE_FULL, and this press is dropped.', { say: 'If the queue is full, it returns err queue full, and this press is dropped.', pause: 0.6 }),
  L('s7', 'send', 'So you log a warning.', { pause: 0.4 }),
  // 6 · xQueueReceive
  L('r0', 'receive', "Now the other end: the LED task's xQueueReceive.", { say: `Now the other end: the LED task's ${SAY_RECV}.` }),
  L('r1', 'receive', 'Its first argument is the handle. Then comes where to put the item: here, the variable press.', { pause: 0.7 }),
  L('r2', 'receive', 'It copies the oldest item into press, and takes it out of the queue.', { pause: 0.7 }),
  L('r2b', 'receive', 'Meanwhile, the button task can keep adding presses at the back.', { pause: 0.7 }),
  L('r3', 'receive', 'The last argument is how long to wait, if the queue is empty.', { pause: 0.9 }),
  L('r4', 'receive', 'portMAX_DELAY means wait forever.', { say: 'Port-max-delay means wait forever.', pause: 0.6 }),
  L('r4b', 'receive', 'The task sleeps, and costs nothing, until a press arrives.', { pause: 0.4 }),
  L('r5', 'receive', 'It returns pdTRUE when it got an item.', { say: 'It returns P D true when it got an item.', pause: 0.9 }),
  L('r6', 'receive', 'With a time limit instead, like two seconds, it can return pdFALSE, which means nothing came.', { say: 'With a time limit instead, like two seconds, it can return P D false, which means nothing came.', pause: 0.7 }),
  // 7 · xQueueCreate
  L('e0', 'create', 'Both tasks use press_queue, and app_main makes it before it starts them.', { say: 'Both tasks use press queue, and app main makes it before it starts them.' }),
  L('e1', 'create', 'xQueueCreate takes two numbers.', { say: `${SAY_CREATE} takes two numbers.`, pause: 0.7 }),
  L('e2', 'create', "The first is the length: how many items it can hold at once. Here, that's five.", { pause: 0.7 }),
  L('e3', 'create', 'The second is the item size, in bytes. Each press is an int, and sizeof int is four.', { say: 'The second is the item size, in bytes. Each press is an int, and size of int is four.', pause: 0.9 }),
  L('e4', 'create', 'Every item is the same size. The queue copies that many bytes, every time.', { say: 'Every item is the same size. The queue copies that... many bytes, every time.', pause: 0.7 }),
  L('e5', 'create', 'So it takes five times four, which is twenty bytes, plus a little bookkeeping, from the heap, once.', { pause: 0.9 }),
  L('e6', 'create', 'It returns a handle: the name both tasks use for this queue.', { pause: 0.9 }),
  L('e7', 'create', 'If the heap is too full, it returns NULL instead.', { say: 'If the heap is too full, it returns null instead.', pause: 0.6 }),
  L('e8', 'create', 'It comes from the header freertos/queue.h.', { say: 'It comes from the header Free R-TOS, slash queue dot H.', pause: 0.9 }),
  // 8 · full
  L('f1', 'full', "Back to the catch: there are only five boxes. Let's press eight times, fast."),
  L('f2', 'full', 'Press one is taken straight away. Presses two to six fill the queue.', { pause: 0.6 }),
  L('f3', 'full', 'Presses seven and eight find it full. xQueueSend gives up at once, and the warnings print.', { say: `Presses seven and eight find it full. ${SAY_SEND} gives up at once, and the warnings print.`, pause: 0.8 }),
  L('f4', 'full', 'If every press matters, make the queue longer, or let the button task wait a few ticks.', { pause: 0.9 }),
  // 9 · trap
  L('t1', 'trap', 'Now for the mistake everyone makes once.'),
  L('t2', 'trap', 'Say you create the queue after the tasks.', { pause: 0.7 }),
  L('t3', 'trap', 'Remember: a new task with a higher priority than app_main runs straight away.', { say: 'Remember: a new task with a higher priority than app main runs straight away.', pause: 0.9 }),
  L('t4', 'trap', 'So the LED task calls xQueueReceive before the queue exists, and its handle is still NULL.', { say: `So the LED task calls ${SAY_RECV} before the queue exists, and its handle is still null.`, pause: 0.7 }),
  L('t5', 'trap', 'The program stops with assert failed, in xQueueReceive. The chip restarts, and does it again, forever.', { say: `The program stops with assert failed, in ${SAY_RECV}. The chip restarts, and does it again, forever.`, pause: 0.9 }),
  L('t6', 'trap', 'The fix is to create the queue first, then the tasks that use it.', { pause: 1.1 }),
  // 10 · payoff
  L('z1', 'payoff', "So a queue carries copies from one task to another, in order, and the receiver sleeps until they arrive. That's a queue."),
];

// ── shared numbers and code (FACTS.md) ────────────────────────────────────

export const LENGTH = 5;
export const ITEM = 4; // sizeof(int) on the ESP32
export const BLINK_MS = 250; // on, then off; three times = 1.5 s per press
export const PRESS_BLINK_S = (3 * 2 * BLINK_MS) / 1000;

export const GLOBAL_LINE = 'static QueueHandle_t press_queue;';
export const CREATE_LINE = '    press_queue = xQueueCreate(5, sizeof(int));';
export const CREATE_CALL = 'xQueueCreate(5, sizeof(int))';
export const SEND_CALL = 'xQueueSend(press_queue, &presses, 0)';
export const RECV_CALL = 'xQueueReceive(press_queue, &press, portMAX_DELAY)';
export const TASK_LINES = ['    xTaskCreate(button_task, "button", 2048, NULL, 5, NULL);', '    xTaskCreate(led_task,    "led",    2048, NULL, 5, NULL);'];

/** app_main; `late` = the queue is created after the tasks (the trap) */
export const mainCode = (late = false) => ['void app_main(void)', '{', ...(late ? [...TASK_LINES, CREATE_LINE] : [CREATE_LINE, ...TASK_LINES]), '}'];
export const headCode = ['#include "freertos/queue.h"', '', GLOBAL_LINE, ''];

export const SEND_IF = '            if (xQueueSend(press_queue, &presses, 0) != pdTRUE) {';
export const SEND_WARN = '                ESP_LOGW(TAG, "queue full: press %d dropped", presses);';
export const buttonCode = [
  'static void button_task(void *arg)',
  '{',
  '    // GPIO 18: input + pull-up (as before)',
  '    int last = 1;',
  '    int presses = 0;',
  '    while (1) {',
  '        int level = gpio_get_level(BUTTON);',
  '        if (last == 1 && level == 0) {      // just pressed',
  '            presses++;',
  SEND_IF,
  SEND_WARN,
  '            }',
  '        }',
  '        last = level;',
  '        vTaskDelay(pdMS_TO_TICKS(10));',
  '    }',
  '}',
];

export const RECV_LINE = '        xQueueReceive(press_queue, &press, portMAX_DELAY);   // sleeps until a press arrives';
/** the receive line without its comment (the side-by-side code) */
export const RECV_SHORT = '        xQueueReceive(press_queue, &press, portMAX_DELAY);';
export const ledCode = [
  'static void led_task(void *arg)',
  '{',
  '    // GPIO 2: output (as before)',
  '    int press;',
  '    while (1) {',
  RECV_LINE,
  '        ESP_LOGI(TAG, "press %d: blink", press);',
  '        for (int i = 0; i < 3; i++) {',
  '            gpio_set_level(LED, 1);',
  '            vTaskDelay(pdMS_TO_TICKS(250));',
  '            gpio_set_level(LED, 0);',
  '            vTaskDelay(pdMS_TO_TICKS(250));',
  '        }',
  '    }',
  '}',
];
export const ledCodeShort = ledCode.map((l) => (l === RECV_LINE ? RECV_SHORT : l));

/** the first try (lab variant 5): the lines that differ */
export const FLAG_GLOBAL = 'static bool pressed = false;';
export const FLAG_SET = ['presses++;', 'pressed = true;'];
export const FLAG_CHECK = ['if (pressed) {', '    pressed = false;', '    // blink 3 times', '}', 'vTaskDelay(pdMS_TO_TICKS(10));'];

/** a run from the lab: presses (scheduler ms), what happened to each (received at / dropped
 *  at, scheduler ms) and the log lines (log ms = scheduler ms + boot) */
export type Run = { boot: number; presses: number[]; recv: Record<number, number>; dropped: number[]; log: { ms: number; text: string; warn?: boolean }[] };
const runFrom = (boot: number, presses: number[], recvLog: number[], droppedIdx: number[]): Run => {
  const recv: Record<number, number> = {};
  let k = 0;
  presses.forEach((_, i) => {
    if (!droppedIdx.includes(i + 1)) recv[i + 1] = recvLog[k++] - boot;
  });
  const log = [
    ...Object.entries(recv).map(([n, ms]) => ({ ms: ms + boot, text: `I (${ms + boot}) queue: press ${n}: blink` })),
    ...droppedIdx.map((n) => ({ ms: presses[n - 1] + boot, text: `W (${presses[n - 1] + boot}) queue: queue full: press ${n} dropped`, warn: true })),
  ].sort((a, b) => a.ms - b.ms);
  return { boot, presses, recv, dropped: droppedIdx, log };
};
/** lab/logs/v1.log — the queue, one press then three quick ones */
export const RUN_DEMO = runFrom(1633, [1000, 8940, 9090, 9240], [2633, 10573, 12073, 13573], []);
/** lab/logs/v2.log */
export const RUN_BURST = runFrom(1643, [1000, 1120, 1240, 1360, 1480, 1600, 1720, 1840], [2643, 4143, 5643, 7143, 8643, 10143], [7, 8]);

/** lab/logs/v5.log — the shared flag, the same presses as v1. `blinks` = scheduler ms the
 *  LED task found the flag set (and cleared it) */
export const FLAG_BOOT = 1553;
export const RUN_FLAG = {
  presses: [1000, 8940, 9090, 9240],
  blinks: [1000, 8950, 10460],
  log: (
    [
      [2553, 'press 1'],
      [2553, 'flag set: blink'],
      [10493, 'press 2'],
      [10503, 'flag set: blink'],
      [10643, 'press 3'],
      [10793, 'press 4'],
      [12013, 'flag set: blink'],
    ] as [number, string][]
  ).map(([ms, text]) => ({ ms, text: `I (${ms}) queue: ${text}` })),
};
/** the flag (0/1) at scheduler ms m: set by a press, cleared when the LED task reads it */
export const flagAt = (m: number) => {
  const lastPress = Math.max(-1, ...RUN_FLAG.presses.filter((p) => p <= m));
  if (lastPress < 0) return 0;
  const read = RUN_FLAG.blinks.find((b) => b >= lastPress) ?? Infinity;
  // press 1 is read in the same tick: keep it visible for 150 ms
  return m < Math.max(read, lastPress + 150) ? 1 : 0;
};

/** v1/v5 clock in two pieces: press 1 from tA, the three quick presses from tB (the quiet
 *  gap between them in the run is skipped; inside each piece it is real time) */
export const clock2 = (tA: number, tB: number) => (m: number) => +(m < 8000 ? tA + (m - 1000) / 1000 : tB + (m - 8940) / 1000).toFixed(3);
/** …and back: scheduler ms at scene time t */
export const msAt2 = (tA: number, tB: number) => (t: number) => (t < tB - 0.9 ? Math.min(7999, 1000 + (t - tA) * 1000) : 8940 + (t - tB) * 1000);

/** lab/logs/v4.log (receive with a 2 s limit) */
export const LOG_TIMEOUT = ['I (3613) queue: no press for 2 s', 'I (5613) queue: no press for 2 s', 'I (6613) queue: press 1: blink', 'I (10113) queue: no press for 2 s'];
/** lab/logs/v3.log (the queue created after the tasks) */
export const LOG_TRAP = [
  'I (1610) main_task: Calling app_main()',
  'assert failed: xQueueReceive queue.c:1531 (( pxQueue ))',
  'Rebooting...',
  'I (7432) main_task: Calling app_main()',
  'assert failed: xQueueReceive queue.c:1531 (( pxQueue ))',
  'Rebooting...',
  'I (3246) main_task: Calling app_main()',
  'assert failed: xQueueReceive queue.c:1531 (( pxQueue ))',
  'Rebooting...',
];

// ── 1. want ────────────────────────────────────────────────────────────────

export const WANT = {
  led: w('w1', 'LED'),
  button: w('w1', 'button'),
  press: w('w1', 'button', 0, 0.3),
  math: at('w2'),
  half: w('w2', 'half'),
  loop: at('w3'),
  /** the press the single loop misses (mid-blink) */
  miss: w('w3', 'miss', 0, 0.1),
  split: w('w4', 'own'),
  btask: w('w4', 'button'),
  ltask: w('w5', 'LED'),
  how: w('w6', 'how'),
  captions: [
    { at: at('w1'), text: 'you want: a press → the LED blinks 3 times' },
    { at: at('w2'), text: '3 × (250 ms on + 250 ms off) = 1.5 s' },
    { at: at('w3'), text: 'one loop doing both → presses during a blink are missed' },
    { at: at('w4'), text: 'two tasks: one watches the button, one blinks the LED' },
    { at: at('w6'), text: 'how does the button task tell the LED task?' },
  ] as Caption[],
};

// ── 2. flag ────────────────────────────────────────────────────────────────

const FLAG_TA = +(end('g5') + 0.2).toFixed(2);
const FLAG_TB = +(end('g8') + 0.3).toFixed(2);
export const FLAG = {
  box: w('g1', 'share'),
  name: w('g1', 'pressed'),
  set: w('g2', 'sets'),
  checks: w('g3', 'checks'),
  ten: w('g3', '10'),
  clears: w('g4', 'clears'),
  /** scene time of scheduler ms m, and back */
  t: clock2(FLAG_TA, FLAG_TB),
  ms: msAt2(FLAG_TA, FLAG_TB),
  tB: FLAG_TB,
  works: w('g6', 'works'),
  simple: w('g6', 'simple'),
  hundred: w('g7', '100'),
  quick: at('g8'),
  already: w('g9', 'already'),
  two: w('g10', 'two'),
  lost: w('g10', 'lost'),
  captions: [
    { at: at('g1'), text: 'try 1: a shared variable — bool pressed' },
    { at: at('g2'), text: 'button task: a press → pressed = true' },
    { at: at('g3'), text: 'LED task: is it set? every 10 ms' },
    { at: at('g4'), text: 'set → clear it → blink' },
    { at: at('g6'), text: '✓ one press works · ✓ simple' },
    { at: at('g7'), text: '✗ it checks 100 times a second, even when nothing happens' },
    { at: at('g8'), text: 'three quick presses' },
    { at: at('g9'), text: 'presses 3 and 4 set a flag that is already set' },
    { at: at('g10'), text: '✗ 3 presses → 2 seen: one press lost' },
  ] as Caption[],
};

// ── 3. queue ───────────────────────────────────────────────────────────────

const Q_TA = +(end('q5') + 0.2).toFixed(2);
const Q_TB = +(end('q6') + 0.3).toFixed(2);
export const QUEUE = {
  row: at('q1'),
  boxes: w('q1', 'boxes'),
  back: w('q2', 'back'),
  front: w('q3', 'front'),
  sleeps: w('q4', 'sleeps'),
  checking: w('q4', 'checking'),
  t: clock2(Q_TA, Q_TB),
  tB: Q_TB,
  wait: w('q7', 'wait'),
  order: w('q8', 'order'),
  every: at('q9'),
  word: w('q10', 'cue'),
  catch: at('q11'),
  full: w('q11', 'full'),
  dropped: w('q11', 'dropped'),
  captions: [
    { at: at('q1'), text: 'try 2: a queue — a row of boxes between the tasks' },
    { at: at('q2'), text: 'a copy of each press goes in at the back' },
    { at: at('q3'), text: 'out at the front, oldest first' },
    { at: at('q4'), text: '✓ empty → the LED task sleeps · no checking' },
    { at: at('q5'), text: 'the same presses · press 1' },
    { at: at('q6'), text: 'three quick presses' },
    { at: at('q7'), text: 'presses 3 and 4 wait in the boxes → out in order' },
    { at: at('q9'), text: '✓ every press, in order · nothing lost' },
    { at: at('q11'), text: '✗ a fixed number of boxes: all full → a new press is dropped' },
  ] as Caption[],
};

// ── 4. tasks ───────────────────────────────────────────────────────────────

export const TASKS = {
  left: w('k1', 'button'),
  right: w('k1', 'LED'),
  send: w('k2', 'calls'),
  goesIn: w('k2', 'goes'),
  recv: w('k3', 'calls'),
  waits: w('k3', 'waits'),
  comesOut: w('k3', 'out'),
  same: w('k4', 'same'),
  handle: w('k4', 'press'),
  apart: at('k5'),
  captions: [
    { at: at('k1'), text: 'button_task (left) · led_task (right)' },
    { at: at('k2'), text: 'a press → xQueueSend → in at the back' },
    { at: at('k3'), text: 'xQueueReceive: waits until a press comes out at the front' },
    { at: at('k4'), text: 'both name the same queue: press_queue' },
    { at: at('k5'), text: 'each call, taken apart' },
  ] as Caption[],
};

// ── 5. xQueueSend ──────────────────────────────────────────────────────────

export const SEND = {
  run: w('s1', 'takes', 0, -0.7),
  args: [w('s1', 'handle'), w('s2', 'pointer'), w('s4', 'ticks')],
  views: { copy: at('s2'), wait: at('s4'), ret: at('s5') },
  presses: w('s2', 'presses'),
  four: w('s2', '4'),
  change: w('s3', 'change'),
  keeps: w('s3', 'keeps'),
  meanwhile: w('s3b', 'other'),
  takes: w('s3b', 'takes'),
  full: w('s4', 'full'),
  zero: at('s4b'),
  pdtrue: w('s5', 'P'),
  errfull: w('s6', 'returns', 0, 0.5),
  dropped: w('s6', 'dropped'),
  warning: w('s7', 'warning'),
  captions: [
    { at: at('s1'), text: 'xQueueSend(queue, pointer to the item, ticks to wait)' },
    { at: at('s2'), text: '&presses → the queue copies its 4 bytes' },
    { at: at('s3'), text: 'a copy: presses can change, the queue keeps the old value' },
    { at: at('s3b'), text: 'meanwhile the LED task takes out the oldest' },
    { at: at('s4'), text: 'ticks to wait if full · 0 = don’t wait' },
    { at: at('s5'), text: 'pdTRUE → it went in' },
    { at: at('s6'), text: 'errQUEUE_FULL → this press is dropped → log a warning' },
  ] as Caption[],
};

// ── 6. xQueueReceive ───────────────────────────────────────────────────────

export const RECV = {
  intro: { show: at('r0'), out: w('r0', 'LED', 0, 0.2) },
  run: w('r0', 'receive', 0, -0.4),
  args: [w('r1', 'handle'), w('r1', 'variable'), w('r3', 'wait')],
  views: { into: w('r1', 'Then'), wait: at('r3'), ret: at('r5') },
  oldest: w('r2', 'oldest'),
  takes: w('r2', 'takes'),
  adding: w('r2b', 'adding'),
  empty: w('r3', 'empty'),
  forever: w('r4', 'forever'),
  sleeps: w('r4b', 'sleeps'),
  arrives: w('r4b', 'arrives'),
  pdtrue: w('r5', 'P'),
  limit: w('r6', 'limit'),
  pdfalse: w('r6', 'P'),
  nothing: w('r6', 'Nothing'),
  captions: [
    { at: at('r0'), text: 'the other end: xQueueReceive in led_task' },
    { at: at('r1'), text: 'xQueueReceive(queue, where to copy the item, ticks to wait)' },
    { at: at('r2'), text: 'the oldest item → press · and it leaves the queue' },
    { at: at('r2b'), text: 'meanwhile the button task adds presses at the back' },
    { at: at('r3'), text: 'ticks to wait if empty' },
    { at: at('r4'), text: 'portMAX_DELAY = forever: the task sleeps, no CPU, until a press' },
    { at: at('r5'), text: 'pdTRUE → got one' },
    { at: at('r6'), text: 'with a time limit: pdFALSE → nothing came' },
  ] as Caption[],
};

// ── 7. xQueueCreate ────────────────────────────────────────────────────────

export const CREATE = {
  intro: { show: at('e0'), out: at('e1') },
  run: w('e1', 'X'),
  args: [w('e2', 'length'), w('e3', 'size')],
  views: { length: w('e2', 'length'), size: w('e3', 'size'), mem: at('e5'), handle: at('e6'), inc: at('e8') },
  five: w('e2', 'five'),
  int: w('e3', 'int'),
  four: w('e3', '4'),
  same: w('e4', 'same'),
  many: w('e4', 'many'),
  times: w('e5', 'times'),
  twenty: w('e5', '20'),
  heap: w('e5', 'heap'),
  both: w('e6', 'both'),
  null: w('e7', 'null'),
  captions: [
    { at: at('e0'), text: 'app_main makes the queue, before it starts the tasks' },
    { at: at('e2'), text: 'length: how many items it holds — 5' },
    { at: at('e3'), text: 'item size in bytes: sizeof(int) = 4' },
    { at: at('e4'), text: 'every item the same size · 4 bytes copied, every time' },
    { at: at('e5'), text: '5 × 4 = 20 bytes + bookkeeping, from the heap, once' },
    { at: at('e6'), text: 'returns a handle: press_queue, used by both tasks' },
    { at: at('e7'), text: 'NULL if the heap is too full' },
    { at: at('e8'), text: '#include "freertos/queue.h"' },
  ] as Caption[],
};

// ── 8. full ────────────────────────────────────────────────────────────────

const FULL_T0 = w('f1', 'fast', 0, 0.5);
export const FULL = {
  t0: FULL_T0,
  t: (m: number) => +(FULL_T0 + (m - 1000) / 1000).toFixed(3),
  five: w('f1', '5'),
  taken: w('f2', 'taken'),
  fill: w('f2', 'fill'),
  seven: w('f3', 'seven'),
  gives: w('f3', 'gives'),
  longer: w('f4', 'longer'),
  waitT: w('f4', 'wait'),
  captions: [
    { at: at('f1'), text: 'five boxes · eight fast presses' },
    { at: at('f2'), text: 'press 1 taken at once · presses 2–6 fill the queue' },
    { at: at('f3'), text: 'presses 7 and 8: full → dropped at once → warnings' },
    { at: at('f4'), text: 'every press matters? a longer queue, or let the sender wait' },
  ] as Caption[],
};

// ── 9. trap ────────────────────────────────────────────────────────────────

export const TRAP = {
  views: { order: at('t2'), crash: at('t5'), fix: at('t6') },
  now: at('t1'),
  move: w('t2', 'after'),
  higher: w('t3', 'higher'),
  straight: w('t3', 'straight'),
  calls: w('t4', 'calls'),
  null: w('t4', 'null'),
  stops: w('t5', 'stops'),
  again: w('t5', 'again'),
  fix: w('t6', 'create'),
  captions: [
    { at: at('t1'), text: 'the mistake everyone makes once' },
    { at: at('t2'), text: 'the queue created after the tasks' },
    { at: at('t3'), text: 'a new task above app_main (5 > 1) runs straight away' },
    { at: at('t4'), text: 'xQueueReceive(NULL …) — the queue doesn’t exist yet' },
    { at: at('t5'), text: 'assert failed → restart → again, forever' },
    { at: at('t6'), text: 'fix: create the queue first, then its tasks' },
  ] as Caption[],
};

// ── 10. payoff ─────────────────────────────────────────────────────────────

export const PAYOFF = {
  word: w('z1', 'That'),
  recap: [
    { at: w('z1', 'That', 0, 1.3), k: 'xQueueCreate(5, sizeof(int))', v: 'room for five ints · NULL if no memory' },
    { at: w('z1', 'That', 0, 1.65), k: 'xQueueSend(q, &x, 0)', v: 'a copy in at the back · errQUEUE_FULL when full' },
    { at: w('z1', 'That', 0, 2.0), k: 'xQueueReceive(q, &press, portMAX_DELAY)', v: 'the oldest out · sleeps until one arrives' },
    { at: w('z1', 'That', 0, 2.35), k: 'order', v: 'create the queue before its tasks' },
    { at: w('z1', 'That', 0, 2.7), k: 'next', v: 'mutexes' },
  ],
};
