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
export const VO_AT: Record<string, number> = {"w1":0.5,"w2":5.66,"w3":8.9,"w4":13.66,"w5":19.24,"w6":22.98,"g1":0.6,"g2":5.7,"g3":10.08,"g4":13.96,"g5":17.08,"g6":18.78,"g7":21.46,"g8":28.24,"g9":30.16,"g10":36.62,"q1":0.6,"q2":5.38,"q3":9.8,"q4":14.36,"q5":20.16,"q6":23.72,"q7":26.32,"q8":28.58,"q9":33.82,"q10":36.6,"q11":38.4,"k1":0.6,"k2":6.08,"k3":12.4,"k4":19.72,"k5":23.18,"s1":0.6,"s2":4.3,"s3":10.58,"s3b":16.84,"s4":22.18,"s4b":25.66,"s5":27.42,"s6":30.54,"s7":35.9,"r0":0.5,"r1":4.76,"r2":10.72,"r2b":15.72,"r3":19.82,"r4":23.96,"r4b":26.04,"r5":31.32,"r6":34.52,"e0":0.5,"e1":5.2,"e2":7.86,"e3":12.6,"e4":18.6,"e5":25,"e6":31.78,"e7":35.72,"e8":39.94,"f1":0.5,"f2":5.18,"f3":9.84,"f4":17.04,"t1":0.5,"t2":3.44,"t3":6.04,"t4":11.46,"t5":17.98,"t6":25.6,"z1":0.5};
export const SCENE_DUR: Record<string, number> = {"want":29.1,"flag":43.88,"queue":46.26,"tasks":27.66,"send":38.8,"receive":42.1,"create":45.12,"full":24.66,"trap":31.92,"payoff":14.7};
export const VO_WORDS: Record<string, [string, number][]> = {
  w1: [["Let's",0],["say",0.32],["you",0.44],["want",0.56],["an",0.66],["LED",0.78],["to",1.14],["blink",1.56],["three",1.86],["times,",2.3],["every",3.28],["time",3.54],["you",3.78],["press",3.94],["a",4.08],["button.",4.22]],
  w2: [["Three",0],["blinks",0.38],["take",0.7],["one",1.04],["and",1.4],["a",1.52],["half",1.64],["seconds.",1.86]],
  w3: [["If",0],["one",0.26],["loop",0.5],["did",0.7],["both,",0.92],["it",1.68],["would",1.78],["miss",1.86],["any",2.06],["press",2.34],["that",2.72],["comes",2.94],["while",3.18],["it's",3.4],["blinking.",3.52]],
  w4: [["So",0],["each",0.3],["job",0.5],["gets",0.84],["its",1.06],["own",1.18],["task.",1.32],["The",2.36],["button",2.4],["task,",2.66],["on",3.48],["the",3.58],["left,",3.72],["watches",4.46],["the",4.72],["button.",4.96]],
  w5: [["The",0],["LED",0.26],["task",0.52],["on",1.12],["the",1.52],["right",1.62],["blinks",1.88],["the",2.24],["LED.",2.42]],
  w6: [["But",0],["only",0.24],["the",0.46],["button",0.64],["task",0.86],["sees",1.4],["the",1.84],["press,",2.04],["so",2.84],["how",3.16],["does",3.26],["it",3.36],["tell",3.44],["the",3.6],["LED",3.74],["task?",4.02]],
  g1: [["The",0],["first",0.22],["thing",0.4],["most",0.58],["people",0.84],["try",1.1],["is",1.54],["a",1.8],["share",1.92],["variable,",2.18],["a",3.18],["flag",3.26],["called",3.68],["pressed.",3.98]],
  g2: [["When",0],["a",0.22],["button",0.34],["task",0.54],["sees",1],["a",1.26],["press,",1.44],["it",2.26],["sets",2.4],["the",2.64],["flag",2.86],["to",3.14],["true.",3.36]],
  g3: [["The",0],["LED",0.26],["task",0.58],["checks",1.14],["the",1.42],["flag",1.62],["every",1.96],["10",2.48],["milliseconds.",2.84]],
  g4: [["If",0],["it's",0.24],["set,",0.4],["it",0.74],["clears",0.74],["it",0.98],["and",1.28],["blinks.",1.64]],
  g5: [["Press",0],["once.",0.3]],
  g6: [["It",0],["works,",0.24],["and",0.98],["it's",1.2],["simple.",1.42]],
  g7: [["But",0],["the",0.24],["LED",0.38],["task",0.74],["has",1.3],["to",1.52],["keep",1.68],["checking",1.88],["100",2.36],["times",3.28],["a",3.56],["second",3.78],["even",4.08],["when",4.68],["nothing",4.9],["happens.",5.12]],
  g8: [["Now,",0],["three",0.54],["quick",0.7],["presses.",0.98]],
  g9: [["Presses",0],["three",0.56],["and",0.96],["four",1.4],["come",1.94],["while",2.38],["it's",2.64],["blinking",2.8],["and",3.06],["set",3.72],["a",4.16],["flag",4.28],["that's",4.7],["already",4.96],["set",5.14]],
  g10: [["Three",0],["presses",0.48],["but",0.88],["the",1.6],["LED",1.72],["task",2],["saw",2.64],["only",3.12],["two",3.54],["one",3.92],["press",4.54],["is",4.76],["lost",4.94]],
  q1: [["Now",0],["swap",0.28],["the",0.62],["flag",0.8],["for",1.1],["a",1.32],["cue.",1.46],["A",2.1],["row",2.26],["of",2.44],["boxes",2.6],["between",2.92],["the",3.26],["two",3.4],["tasks.",3.54]],
  q2: [["The",0],["button",0.24],["task",0.48],["puts",1.02],["a",1.42],["copy",1.58],["of",1.88],["each",2.2],["press",2.48],["in",2.88],["at",3.22],["the",3.48],["back.",3.56]],
  q3: [["The",0],["LED",0.24],["task",0.58],["takes",1.28],["them",1.74],["out",1.92],["at",2.04],["the",2.12],["front,",2.28],["oldest",2.88],["first.",3.12]],
  q4: [["When",0],["the",0.24],["queue",0.34],["is",0.48],["empty,",0.66],["the",1.54],["LED",1.6],["task",2],["sleeps.",2.64],["No",3.84],["checking",3.94],["at",4.24],["all.",4.52]],
  q5: [["The",0],["same",0.22],["presses.",0.48],["Press",1.52],["once.",1.66]],
  q6: [["Now,",0],["three",0.66],["quick",1.04],["presses.",1.36]],
  q7: [["3",0],["and",0.46],["4",0.7],["wait",1.02],["their",1.32],["turn.",1.56]],
  q8: [["and",0],["come",0.24],["out",0.38],["one",0.52],["at",0.68],["a",0.78],["time,",0.94],["in",1.56],["order",1.8],["as",2.12],["each",2.92],["blink",3.32],["ends.",3.66]],
  q9: [["Every",0],["press,",0.32],["nothing",1.28],["lost.",1.4]],
  q10: [["That's",0],["a",0.32],["cue.",0.4]],
  q11: [["The",0],["catch,",0.22],["it",0.96],["has",1.14],["a",1.26],["fixed",1.4],["number",1.6],["of",1.82],["boxes.",2],["When",2.92],["they're",3.06],["all",3.22],["full,",3.44],["a",4.36],["new",4.48],["press",4.68],["is",4.94],["dropped.",5.14]],
  k1: [["Here's",0],["the",0.38],["code.",0.5],["The",1.2],["button",1.3],["task",1.52],["on",1.9],["the",2.12],["left.",2.24],["The",3.1],["LED",3.12],["task",3.42],["on",3.96],["the",4.18],["right.",4.26]],
  k2: [["When",0],["the",0.2],["button",0.32],["task",0.56],["sees",0.94],["a",1.18],["press,",1.32],["it",2.08],["calls",2.12],["execute",2.52],["send",3.16],["and",3.56],["the",4.26],["press",4.36],["goes",4.58],["in",4.76],["at",4.92],["the",5],["back.",5.08]],
  k3: [["The",0],["LED",0.24],["task",0.5],["calls",1.06],["XQReceive.",1.66],["It",3.2],["waits",3.4],["right",3.68],["there",4.02],["until",4.52],["a",5.22],["press",5.36],["comes",5.56],["out",5.78],["of",5.96],["the",6.06],["front.",6.1]],
  k4: [["Both",0],["name",0.28],["the",0.48],["same",0.62],["cue.",0.88],["Press",2],["Q.",2.12]],
  k5: [["Let's",0],["take",0.3],["each",0.4],["call",0.58],["apart,",0.8],["starting",1.62],["with",1.9],["XQ",2.1],["Send.",2.62]],
  s1: [["Excuse",0],["send",0.52],["first",0.8],["the",1.66],["cues",2.06],["handle",2.32]],
  s2: [["Then",0],["a",0.24],["pointer",0.38],["to",0.6],["the",0.8],["item.",0.92],["Here,",1.92],["presses",2.52],["an",2.68],["int.",3.26],["The",4.06],["queue",4.14],["copies",4.36],["its",4.8],["4",4.98],["bytes.",5.24]],
  s3: [["It's",0],["a",0.28],["copy,",0.38],["so",1.04],["presses",1.38],["can",1.68],["change",1.94],["straight",2.48],["away,",2.88],["and",3.76],["the",3.88],["cue",3.98],["keeps",4.32],["the",4.78],["old",4.98],["value.",5.14]],
  s3b: [["Meanwhile,",0],["at",0.66],["the",0.7],["other",0.8],["end,",0.98],["the",1.72],["LED",1.76],["task",2.08],["takes",2.72],["out",3.18],["the",3.52],["oldest",3.7],["one.",4.04]],
  s4: [["Last,",0],["how",1.04],["many",1.22],["ticks",1.38],["to",1.58],["wait",1.76],["if",1.98],["the",2.38],["queue",2.48],["is",2.66],["full?",2.8]],
  s4b: [["Zero,",0],["don't",0.44],["wait.",0.54]],
  s5: [["It",0],["returns",0.22],["PD",0.56],["true",0.96],["when",1.34],["the",1.78],["item",1.88],["went",2.1],["in.",2.32]],
  s6: [["If",0],["the",0.24],["cue",0.36],["is",0.54],["full,",0.72],["it",1.52],["returns",1.56],["air",2.12],["cue",2.6],["full,",2.9],["and",3.56],["this",4],["press",4.16],["is",4.4],["dropped.",4.62]],
  s7: [["So",0],["you",0.26],["log",0.36],["a",0.54],["warning.",0.68]],
  r0: [["Now",0],["the",0.3],["other",0.46],["end,",0.66],["the",1.48],["LED",1.5],["tasks",1.82],["XQ",2.48],["receive.",3.16]],
  r1: [["First,",0],["the",0.84],["handle.",0.96],["Then,",1.94],["where",2.34],["to",2.52],["put",2.64],["the",2.76],["item.",2.88],["Here,",3.78],["the",4.4],["variable",4.5],["press.",4.82]],
  r2: [["It",0],["copies",0.24],["the",0.66],["oldest",0.92],["item",1.36],["into",1.8],["press",2.06],["and",2.6],["takes",3.42],["out",3.6],["of",3.78],["the",3.86],["queue.",3.94]],
  r2b: [["Meanwhile,",0],["the",0.66],["button",0.76],["task",1.02],["can",1.46],["keep",1.72],["adding",1.94],["presses",2.24],["at",2.52],["the",2.74],["back.",2.82]],
  r3: [["The",0],["last",0.22],["argument",0.44],["is",0.72],["how",1.02],["long",1.26],["to",1.6],["wait",1.8],["if",2.08],["the",2.68],["queue",2.8],["is",3.08],["empty.",3.26]],
  r4: [["PortMaxDelay",0],["means",0.98],["forever.",1.28]],
  r4b: [["The",0],["task",0.24],["sleeps",0.52],["and",1.02],["costs",1.68],["nothing",2.28],["until",2.82],["a",3.58],["press",3.7],["arrives.",3.86]],
  r5: [["It",0],["returns",0.22],["PD",0.58],["true",1.1],["when",1.5],["it",1.9],["got",1.98],["an",2.1],["item.",2.22]],
  r6: [["With",0],["a",0.22],["time",0.36],["limit",0.56],["instead,",0.8],["like",1.68],["2",1.8],["seconds,",2.2],["it",3.02],["can",3.08],["return",3.2],["PD",3.52],["false.",3.78],["Nothing",4.9],["came.",5.06]],
  e0: [["Both",0],["tasks",0.3],["use",0.66],["press",0.88],["Q.",1.1],["App",1.94],["main",2.04],["makes",2.24],["it",2.54],["before",2.76],["it",3.26],["starts",3.38],["them.",3.62]],
  e1: [["XQ",0],["create",0.5],["takes",0.86],["two",1.22],["numbers",1.52]],
  e2: [["The",0],["length.",0.22],["How",1.1],["many",1.22],["items",1.44],["it",1.76],["can",1.92],["hold",2.02],["at",2.22],["once.",2.32],["Here,",3.22],["5.",3.5]],
  e3: [["The",0],["item",0.24],["size",0.5],["in",0.88],["bytes.",1.24],["Each",2.24],["press",2.38],["is",2.7],["an",3.14],["int",3.26],["and",3.48],["size",4.1],["of",4.4],["int",4.58],["is",4.72],["4.",4.86]],
  e4: [["Every",0],["item",0.36],["is",0.72],["the",1.12],["same",1.3],["size.",1.52],["The",2.62],["queue",2.7],["copies",2.9],["that",3.44],["many",3.82],["bytes",4.26],["every",4.72],["time.",5.08]],
  e5: [["So,",0],["it",0.44],["takes",0.58],["five",0.74],["times",1.02],["for",1.36],["20",1.82],["bytes,",2.68],["plus",3.4],["a",3.64],["little",3.8],["bookkeeping",3.92],["from",4.54],["a",4.96],["heap",5.08],["once.",5.28]],
  e6: [["It",0],["returns",0.22],["a",0.54],["handle,",0.76],["the",1.46],["name",1.64],["both",1.82],["tasks",2.12],["use",2.6],["for",2.82],["this",3],["queue.",3.14]],
  e7: [["If",0],["the",0.24],["heap",0.34],["is",0.5],["too",0.72],["full,",0.98],["it",1.88],["returns",1.98],["null",2.42],["instead.",2.76]],
  e8: [["It",0],["comes",0.22],["from",0.38],["free",0.6],["RTOS",0.96],["slash",1.9],["Q2H.",2.58]],
  f1: [["Back",0],["to",0.28],["the",0.4],["catch.",0.5],["Only",1.4],["five",1.56],["boxes.",1.86],["Press",2.98],["eight",3.08],["times",3.3],["fast.",3.7]],
  f2: [["Press",0],["1",0.32],["is",0.62],["taken",0.92],["straight",1.14],["away.",1.4],["Presses",2.28],["2",2.48],["to",2.78],["6",3.02],["fill",3.32],["the",3.54],["queue.",3.66]],
  f3: [["Presses",0],["seven",0.54],["and",0.98],["eight",1.44],["find",1.74],["it",2.1],["full",2.24],["xq",2.54],["send",3.38],["gives",3.74],["up",4.16],["at",4.34],["once",4.48],["and",4.92],["a",5.4],["warnings",5.48],["print",5.78]],
  f4: [["If",0],["every",0.26],["press",0.66],["matters,",0.98],["make",1.94],["the",2.02],["queue",2.18],["longer",2.4],["or",2.84],["let",3.52],["the",3.64],["button",3.8],["task",4.04],["wait",4.46],["a",4.7],["few",4.82],["ticks.",4.96]],
  t1: [["Now",0],["the",0.3],["mistake",0.44],["everyone",0.86],["makes",1.38],["once.",1.78]],
  t2: [["Create",0],["the",0.34],["queue",0.52],["after",0.82],["the",1.1],["tasks.",1.24]],
  t3: [["Remember,",0],["a",0.96],["new",1.16],["task",1.36],["with",1.68],["a",1.86],["higher",1.98],["priority",2.2],["than",2.7],["app",3.06],["main",3.4],["run",3.74],["straight",4.04],["away.",4.34]],
  t4: [["So",0],["the",0.26],["LED",0.38],["task",0.68],["calls",1.12],["xqreceive",1.72],["before",2.64],["the",3.02],["queue",3.14],["exists.",3.3],["Its",4.34],["handle",4.46],["is",4.74],["still",4.94],["null.",5.24]],
  t5: [["The",0],["program",0.26],["stops",0.54],["with",0.94],["Assert",1.2],["Failed",1.58],["and",2.02],["XQ",2.56],["Receive.",3],["The",3.94],["chip",4.04],["restarts",4.22],["and",4.86],["does",5.18],["it",5.34],["again",5.48],["forever.",5.84]],
  t6: [["To",0],["fix,",0.24],["create",0.98],["the",1.3],["queue",1.46],["first,",1.66],["then",2.66],["the",2.82],["tasks",2.98],["that",3.32],["use",3.52],["it.",3.72]],
  z1: [["A",0],["cue",0.26],["carries",0.42],["copies",0.82],["from",1.18],["one",1.52],["task",1.86],["to",2.22],["another,",2.5],["in",3.36],["order,",3.5],["and",4.52],["the",4.92],["receiver",5.22],["sleeps",5.58],["until",6.06],["they",6.66],["arrive.",6.84],["That's",7.68],["a",7.92],["cue.",8]],
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
  L('w2', 'want', 'Three blinks take one and a half seconds.', { pause: 0.8 }),
  L('w3', 'want', "If one loop did both, it would miss any press that comes while it's blinking.", { say: "If one loop did both... it would miss any press that comes while it's blinking.", pause: 1.0 }),
  L('w4', 'want', 'So each job gets its own task. The button task, on the left, watches the button.', { pause: 1.0 }),
  L('w5', 'want', 'The LED task, on the right, blinks the LED.', { pause: 0.4 }),
  L('w6', 'want', 'But only the button task sees the press. How does it tell the LED task?', { say: 'But only the button task sees the press. So how does it tell the LED task?', pause: 1.0 }),
  // 2 · flag: the first try
  L('g1', 'flag', 'The first thing most people try is a shared variable: a flag, called pressed.', { pause: 0.6 }),
  L('g2', 'flag', 'When the button task sees a press, it sets the flag to true.', { pause: 0.8 }),
  L('g3', 'flag', 'The LED task checks the flag every ten milliseconds.', { pause: 0.8 }),
  L('g4', 'flag', "If it's set, it clears it, and blinks.", { say: "If it's set, it clears it... and blinks.", pause: 0.6 }),
  L('g5', 'flag', 'Press once.', { pause: 1.0 }),
  L('g6', 'flag', "It works. And it's simple.", { pause: 1.0 }),
  L('g7', 'flag', 'But the LED task has to keep checking, a hundred times a second, even when nothing happens.', { say: 'But the LED task has to keep checking... a hundred times a second, even when nothing happens.', pause: 1.0 }),
  L('g8', 'flag', 'Now, three quick presses.', { pause: 1.2 }),
  L('g9', 'flag', "Presses three and four come while it's blinking, and set a flag that's already set.", { say: "Presses three and four come while it's blinking... and set a flag that's already set.", pause: 0.6 }),
  L('g10', 'flag', 'Three presses. But the LED task saw only two. One press is lost.', { say: 'Three presses. But the LED task saw only two... One press is lost.', pause: 1.0 }),
  // 3 · queue: the answer, run on the same presses
  L('q1', 'queue', 'Now swap the flag for a queue: a row of boxes between the two tasks.', { pause: 0.6 }),
  L('q2', 'queue', 'The button task puts a copy of each press in at the back.', { pause: 0.8 }),
  L('q3', 'queue', 'The LED task takes them out at the front, oldest first.', { pause: 0.6 }),
  L('q4', 'queue', 'When the queue is empty, the LED task sleeps. No checking at all.', { say: 'When the queue is empty, the LED task sleeps. No checking... at all.', pause: 1.0 }),
  L('q5', 'queue', 'The same presses. Press once.', { pause: 1.0 }),
  L('q6', 'queue', 'Now, three quick presses.', { pause: 1.6 }),
  L('q7', 'queue', 'Three and four wait their turn,', { pause: 0.9 }),
  L('q8', 'queue', 'and come out one at a time, in order, as each blink ends.', { pause: 0.4 }),
  L('q9', 'queue', 'Every press. Nothing lost.', { say: 'Every press... nothing lost.', pause: 1.2 }),
  L('q10', 'queue', "That's a queue.", { pause: 1.0 }),
  L('q11', 'queue', 'The catch: it has a fixed number of boxes. When they are all full, a new press is dropped.', { say: 'The catch: it has a fixed number of boxes. When they are all full... a new press is dropped.', pause: 1.2 }),
  // 4 · tasks: the code, both sides
  L('k1', 'tasks', "Here's the code. The button task on the left. The LED task on the right.", { pause: 0.6 }),
  L('k2', 'tasks', 'When the button task sees a press, it calls xQueueSend, and the press goes in at the back.', { say: `When the button task sees a press, it calls ${SAY_SEND}... and the press goes in at the back.`, pause: 1.0 }),
  L('k3', 'tasks', 'The LED task calls xQueueReceive. It waits right there, until a press comes out at the front.', { say: `The LED task calls ${SAY_RECV}. It waits right there... until a press comes out at the front.`, pause: 1.0 }),
  L('k4', 'tasks', 'Both name the same queue: press_queue.', { say: 'Both name the same queue... press queue.', pause: 1.0 }),
  L('k5', 'tasks', "Let's take each call apart, starting with xQueueSend.", { say: `Let's take each call apart, starting with ${SAY_SEND}.`, pause: 1.0 }),
  // 5 · xQueueSend
  L('s1', 'send', "xQueueSend. First, the queue's handle.", { say: `${SAY_SEND}. First, the queue's handle.`, pause: 0.6 }),
  L('s2', 'send', 'Then a pointer to the item: here, presses, an int. The queue copies its four bytes.', { say: 'Then a pointer to the item: here, presses, an int. The queue copies its four bytes.', pause: 1.0 }),
  L('s3', 'send', "It's a copy. So presses can change straight away, and the queue keeps the old value.", { pause: 0.8 }),
  L('s3b', 'send', 'Meanwhile, at the other end, the LED task takes out the oldest one.', { pause: 0.8 }),
  L('s4', 'send', 'Last: how many ticks to wait, if the queue is full.', { pause: 1.0 }),
  L('s4b', 'send', "Zero. Don't wait.", { say: "Zero... don't wait.", pause: 0.4 }),
  L('s5', 'send', 'It returns pdTRUE when the item went in.', { say: 'It returns P D true when the item went in.', pause: 1.0 }),
  L('s6', 'send', 'If the queue is full, it returns errQUEUE_FULL, and this press is dropped.', { say: 'If the queue is full, it returns err queue full... and this press is dropped.', pause: 0.6 }),
  L('s7', 'send', 'So you log a warning.', { pause: 0.4 }),
  // 6 · xQueueReceive
  L('r0', 'receive', "Now the other end: the LED task's xQueueReceive.", { say: `Now the other end: the LED task's ${SAY_RECV}.` }),
  L('r1', 'receive', 'First the handle. Then where to put the item: here, the variable press.', { say: 'First, the handle. Then, where to put the item: here, the variable press.', pause: 0.8 }),
  L('r2', 'receive', 'It copies the oldest item into press, and takes it out of the queue.', { say: 'It copies the oldest item into press... and takes it out of the queue.', pause: 0.8 }),
  L('r2b', 'receive', 'Meanwhile, the button task can keep adding presses at the back.', { pause: 0.8 }),
  L('r3', 'receive', 'The last argument is how long to wait, if the queue is empty.', { pause: 1.0 }),
  L('r4', 'receive', 'portMAX_DELAY means forever.', { say: 'Port-max-delay means forever.', pause: 0.6 }),
  L('r4b', 'receive', 'The task sleeps, and costs nothing, until a press arrives.', { say: 'The task sleeps, and costs nothing... until a press arrives.', pause: 0.4 }),
  L('r5', 'receive', 'It returns pdTRUE when it got an item.', { say: 'It returns P D true when it got an item.', pause: 1.0 }),
  L('r6', 'receive', 'With a time limit instead, like two seconds, it can return pdFALSE: nothing came.', { say: 'With a time limit instead, like two seconds, it can return P D false. Nothing came.', pause: 0.8 }),
  // 7 · xQueueCreate
  L('e0', 'create', 'Both tasks use press_queue. app_main makes it, before it starts them.', { say: 'Both tasks use press queue. App main makes it, before it starts them.' }),
  L('e1', 'create', 'xQueueCreate takes two numbers.', { say: `${SAY_CREATE} takes two numbers.`, pause: 0.8 }),
  L('e2', 'create', 'The length: how many items it can hold at once. Here, five.', { say: 'The length: how many items it can hold at once. Here, five.', pause: 0.8 }),
  L('e3', 'create', 'The item size, in bytes. Each press is an int, and sizeof int is four.', { say: 'The item size, in bytes. Each press is an int, and size of int is four.', pause: 1.0 }),
  L('e4', 'create', 'Every item is the same size. The queue copies that many bytes, every time.', { say: 'Every item is the same size. The queue copies that... many bytes, every time.', pause: 0.8 }),
  L('e5', 'create', 'So it takes five times four, twenty bytes, plus a little bookkeeping, from the heap, once.', { say: 'So it takes five times four... twenty bytes, plus a little bookkeeping, from the heap, once.', pause: 1.0 }),
  L('e6', 'create', 'It returns a handle: the name both tasks use for this queue.', { pause: 1.0 }),
  L('e7', 'create', 'If the heap is too full, it returns NULL instead.', { say: 'If the heap is too full, it returns null instead.', pause: 0.6 }),
  L('e8', 'create', 'It comes from freertos/queue.h.', { say: 'It comes from Free R-TOS, slash queue dot H.', pause: 1.0 }),
  // 8 · full
  L('f1', 'full', 'Back to the catch: only five boxes. Press eight times, fast.', { say: 'Back to the catch: only five boxes. Press eight times... fast.' }),
  L('f2', 'full', 'Press one is taken straight away. Presses two to six fill the queue.', { pause: 0.6 }),
  L('f3', 'full', 'Presses seven and eight find it full. xQueueSend gives up at once, and the warnings print.', { say: `Presses seven and eight find it full. ${SAY_SEND} gives up at once, and the warnings print.`, pause: 0.8 }),
  L('f4', 'full', 'If every press matters, make the queue longer, or let the button task wait a few ticks.', { pause: 1.0 }),
  // 9 · trap
  L('t1', 'trap', 'Now the mistake everyone makes once.'),
  L('t2', 'trap', 'Create the queue after the tasks.', { pause: 0.8 }),
  L('t3', 'trap', 'Remember: a new task with a higher priority than app_main runs straight away.', { say: 'Remember: a new task with a higher priority than app main runs straight away.', pause: 1.0 }),
  L('t4', 'trap', 'So the LED task calls xQueueReceive before the queue exists. Its handle is still NULL.', { say: `So the LED task calls ${SAY_RECV} before the queue exists. Its handle is still... null.`, pause: 0.8 }),
  L('t5', 'trap', 'The program stops with assert failed, in xQueueReceive. The chip restarts, and does it again, forever.', { say: `The program stops with assert failed, in ${SAY_RECV}. The chip restarts, and does it again... forever.`, pause: 1.0 }),
  L('t6', 'trap', 'The fix: create the queue first, then the tasks that use it.', { pause: 1.2 }),
  // 10 · payoff
  L('z1', 'payoff', "A queue carries copies from one task to another, in order, and the receiver sleeps until they arrive. That's a queue.", { say: "A queue carries copies from one task to another, in order... and the receiver sleeps until they arrive. That's a queue." }),
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
  run: w('s1', 'send', 0, -0.1),
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
  five: w('e2', '5'),
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
  five: w('f1', 'five'),
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
