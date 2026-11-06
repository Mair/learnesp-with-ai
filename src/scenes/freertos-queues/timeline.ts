/**
 * FreeRTOS queues — the timeline. Single source of truth for picture AND sound.
 * PURE ESP-IDF: xQueueCreate, xQueueSend, xQueueReceive, portMAX_DELAY; GPIO as Basic GPIO
 * taught (polled button, one LED).
 *
 *   problem (a shared flag: polling, lost presses) → answer (a row of boxes: QUEUE) →
 *     xQueueCreate → xQueueSend → xQueueReceive → demo (three quick presses wait, in order)
 *     → full (eight presses, five boxes: press 8 dropped) → trap (queue made after the
 *     tasks: assert, boot loop) → payoff
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
export const VO_AT: Record<string, number> = {"p1":0.5,"p2":4.22,"p3":9.2,"p4":11.28,"p5":15.22,"p6":18.34,"a1":0.5,"a2":3.52,"a3":7.94,"a4":12.1,"a5":17.64,"e0":0.5,"e1":4.24,"e2":6.7,"e3":11.04,"e4":16.84,"e5":22.62,"e6":27.58,"e7":31.52,"e8":35.34,"s0":0.5,"s1":3.26,"s2":6.56,"s3":10.58,"s4":15.82,"s5":20.92,"s6":24.04,"r0":0.5,"r1":3.2,"r2":9.18,"r3":14.06,"r4":18.2,"r5":25.3,"r6":28.3,"d1":0.5,"d2":3.32,"d3":8.74,"d4":11.08,"d5":17.14,"d6":22.62,"f1":0.5,"f2":4.16,"f3":8.62,"f4":15.42,"t1":0.5,"t2":3.24,"t3":5.44,"t4":10.66,"t5":16.7,"t6":24.36,"z1":0.5};
export const SCENE_DUR: Record<string, number> = {"problem":25.96,"answer":20.64,"create":40.52,"send":31.9,"receive":36.02,"demo":28.5,"full":23.04,"trap":30.68,"payoff":14};
export const VO_WORDS: Record<string, [string, number][]> = {
  p1: [["The",0],["button",0.24],["task",0.54],["knows",1.12],["when",1.86],["you",2.42],["press",2.56],["the",2.74],["button.",2.92]],
  p2: [["Now",0],["you",0.3],["want",0.42],["the",0.54],["LED",0.66],["task",0.96],["to",1.58],["blink",2.1],["three",2.36],["times",2.84],["for",3.34],["every",3.68],["press.",4.04]],
  p3: [["How",0],["does",0.22],["the",0.3],["button",0.42],["task",0.62],["tell",1.06],["it?",1.3]],
  p4: [["A",0],["shared",0.26],["variable,",0.54],["like",1.52],["a",1.64],["press",1.78],["flag,",1.98],["sort",2.92],["of",3],["works.",3.14]],
  p5: [["But",0],["the",0.24],["LED",0.38],["task",0.68],["has",1.26],["to",1.6],["keep",1.76],["checking",1.94],["it.",2.26]],
  p6: [["In",0],["two",0.28],["quick",0.5],["presses,",0.74],["set",1.42],["the",1.68],["same",1.84],["flag.",2.08],["The",3.06],["LED",3.12],["task",3.4],["sees",4.12],["only",4.72],["one.",5.22]],
  a1: [["Picture",0],["a",0.32],["row",0.56],["of",0.7],["boxes",0.86],["between",1.24],["the",1.62],["two",1.76],["tasks.",1.96]],
  a2: [["The",0],["button",0.24],["task",0.48],["puts",1],["a",1.42],["copy",1.58],["of",1.88],["each",2.2],["press",2.48],["in",2.88],["at",3.22],["the",3.48],["back.",3.56]],
  a3: [["The",0],["LED",0.24],["task",0.58],["takes",1.28],["them",1.74],["out",1.92],["at",2.04],["the",2.12],["front,",2.3],["oldest",2.88],["first.",3.12]],
  a4: [["When",0],["the",0.2],["row",0.32],["is",0.54],["empty,",0.74],["the",1.74],["LED",1.8],["task",2.18],["sleeps",2.76],["until",3.22],["something",3.84],["arrives.",4.16]],
  a5: [["That's",0],["a",0.32],["cue.",0.4]],
  e0: [["First,",0],["make",0.9],["the",1.12],["cue.",1.26],["Do",2],["it",2.12],["at",2.2],["the",2.3],["start",2.36],["of",2.6],["AppMaine.",2.74]],
  e1: [["XQ",0],["create",0.5],["takes",0.86],["two",1.22],["numbers",1.52]],
  e2: [["The",0],["length.",0.22],["How",1.1],["many",1.22],["items",1.44],["it",1.76],["can",1.92],["hold",2.02],["at",2.22],["once.",2.32],["Here,",3.22],["5.",3.5]],
  e3: [["The",0],["item",0.24],["size",0.5],["in",0.88],["bytes.",1.24],["Each",2.24],["press",2.38],["is",2.7],["an",3.14],["int",3.26],["and",3.48],["size",4.1],["of",4.4],["int",4.58],["is",4.72],["4.",4.86]],
  e4: [["Every",0],["item",0.36],["has",0.68],["the",1.1],["same",1.3],["size.",1.54],["The",2.64],["queue",2.7],["copies",2.84],["that",3.32],["many",3.52],["bytes",3.86],["each",4.3],["time.",4.84]],
  e5: [["So",0],["it",0.3],["takes",0.38],["5",0.52],["x",0.82],["4",1.04],["x",1.34],["20",1.5],["bytes,",1.66],["plus",2.34],["a",2.52],["little",2.68],["bookkeeping",2.82],["from",3.44],["the",3.68],["heap",3.82],["once.",4.02]],
  e6: [["It",0],["returns",0.22],["a",0.54],["handle,",0.76],["the",1.46],["name",1.64],["both",1.82],["tasks",2.12],["use",2.6],["for",2.82],["this",3],["queue.",3.14]],
  e7: [["If",0],["the",0.24],["heap",0.34],["is",0.5],["too",0.72],["full,",0.98],["it",1.88],["returns",1.98],["null",2.42],["instead.",2.76]],
  e8: [["It",0],["comes",0.22],["from",0.38],["free",0.6],["RTOS",0.96],["slash",1.9],["Q2H.",2.58]],
  s0: [["The",0],["button",0.24],["task",0.5],["sends",0.96],["each",1.36],["press.",1.76]],
  s1: [["Excuse",0],["send",0.52],["first",0.8],["the",1.66],["cues",2.06],["handle",2.32]],
  s2: [["Then",0],["a",0.24],["pointer",0.38],["to",0.62],["the",0.86],["item.",0.98],["The",1.7],["queue",1.8],["copies",1.96],["4",2.34],["bytes",2.72],["from",2.96],["there.",3.16]],
  s3: [["It's",0],["a",0.28],["copy,",0.42],["so",0.96],["presses",1.26],["can",1.56],["change",1.82],["straight",2.14],["away.",2.36],["The",3.16],["cue",3.26],["keeps",3.54],["the",3.9],["old",4.1],["value.",4.28]],
  s4: [["Last,",0],["how",0.96],["many",1.1],["ticks",1.24],["to",1.46],["wait",1.64],["if",1.86],["the",2.16],["queue",2.24],["is",2.44],["full?",2.58],["Zero,",3.34],["don't",4.08],["wait.",4.32]],
  s5: [["It",0],["returns",0.22],["PD",0.56],["true",0.96],["when",1.34],["the",1.78],["item",1.88],["went",2.1],["in.",2.32]],
  s6: [["If",0],["the",0.22],["queue",0.34],["is",0.5],["full,",0.66],["it",1.38],["returns",1.42],["air",1.94],["queue",2.38],["full,",2.66],["and",3.42],["this",3.52],["press",3.7],["is",3.96],["dropped.",4.16],["So",5.1],["log",5.3],["a",5.5],["warning.",5.68]],
  r0: [["The",0],["LED",0.26],["task",0.56],["waits",1.12],["for",1.46],["presses.",1.8]],
  r1: [["Execute",0],["receive",0.5],["the",0.86],["handle",1.46],["then",1.9],["where",2.5],["to",2.7],["put",2.8],["the",2.94],["item",3.1],["here",3.42],["the",4.22],["variable",4.66],["press",5.02]],
  r2: [["It",0],["copies",0.22],["the",0.64],["oldest",0.9],["item",1.34],["into",1.82],["press",2.16],["and",2.7],["takes",3.5],["it",3.68],["out",3.8],["of",3.88],["the",3.98],["queue.",4.04]],
  r3: [["The",0],["last",0.22],["argument",0.44],["is",0.72],["how",1.02],["long",1.26],["to",1.6],["wait",1.8],["if",2.08],["the",2.68],["queue",2.8],["is",3.08],["empty.",3.26]],
  r4: [["Port",0],["max",0.32],["delay",0.56],["means",0.88],["forever.",1.34],["The",2.4],["task",2.44],["sleeps",2.76],["and",3.22],["costs",4.04],["nothing",4.56],["until",5.06],["a",5.74],["press",5.86],["arrives.",6.02]],
  r5: [["It",0],["returns",0.22],["PD",0.58],["true",1.1],["when",1.5],["it",1.9],["got",1.98],["an",2.1],["item.",2.22]],
  r6: [["With",0],["a",0.24],["time",0.36],["limit",0.56],["instead,",0.8],["like",1.66],["2",1.8],["seconds,",2.22],["it",3.06],["can",3.14],["return",3.24],["PD",3.6],["false.",3.88],["Nothing",5.02],["came.",5.18]],
  d1: [["Flash",0],["it,",0.46],["and",1.06],["press",1.28],["the",1.5],["button",1.7],["once.",1.9]],
  d2: [["Press",0],["1",0.3],["goes",0.48],["into",0.68],["the",0.9],["queue,",1.02],["and",1.82],["the",2.02],["LED",2.1],["task",2.4],["wakes",2.88],["up",3.08],["at",3.26],["once",3.38],["and",3.7],["blinks.",4.04]],
  d3: [["Now",0],["press",0.26],["three",0.54],["times",0.96],["quickly.",1.4]],
  d4: [["The",0],["LED",0.26],["task",0.56],["is",1.22],["busy",1.72],["blinking,",2.08],["so",2.86],["presses",3.12],["3",3.46],["and",4],["4",4.34],["wait",4.7],["in",4.96],["the",5.18],["queue.",5.26]],
  d5: [["Each",0],["one",0.28],["comes",0.5],["out",0.72],["when",1.02],["the",1.26],["blinks",1.4],["before",1.74],["it",2.08],["end,",2.22],["one",3.04],["and",3.1],["a",3.2],["half",3.32],["seconds",3.54],["apart",3.82],["in",4.18],["order.",4.6]],
  d6: [["No",0],["press",0.3],["is",0.56],["lost,",0.76],["and",1.76],["a",1.86],["button",1.98],["task",2.22],["never",2.82],["waited.",3.18]],
  f1: [["but",0],["there",0.22],["are",0.3],["only",0.38],["5",0.56],["boxes.",0.86],["Press",1.94],["8",2.06],["times",2.28],["fast.",2.68]],
  f2: [["Press",0],["1",0.32],["is",0.62],["taken",0.92],["straight",1.14],["away.",1.4],["Presses",2.28],["2",2.48],["to",2.78],["6",3.02],["fill",3.32],["the",3.54],["queue.",3.66]],
  f3: [["Presses",0],["seven",0.54],["and",0.98],["eight",1.44],["find",1.74],["it",2.1],["full",2.24],["xq",2.54],["send",3.38],["gives",3.74],["up",4.16],["at",4.34],["once",4.48],["and",4.92],["a",5.4],["warnings",5.48],["print",5.78]],
  f4: [["If",0],["every",0.26],["press",0.66],["matters,",0.98],["make",1.94],["the",2.02],["queue",2.18],["longer",2.4],["or",2.84],["let",3.52],["the",3.64],["button",3.8],["task",4.04],["wait",4.46],["a",4.7],["few",4.82],["ticks.",4.96]],
  t1: [["Now",0],["the",0.3],["mistake",0.44],["everyone",0.86],["makes",1.38],["once.",1.78]],
  t2: [["Create",0],["the",0.34],["queue",0.52],["after",0.82],["the",1.1],["tasks.",1.24]],
  t3: [["Remember,",0],["a",0.96],["new",1.16],["task",1.36],["with",1.68],["a",1.86],["higher",1.98],["priority",2.2],["than",2.7],["app",3.06],["main",3.4],["run",3.74],["straight",4.04],["away.",4.34]],
  t4: [["So",0],["the",0.28],["LED",0.38],["task",0.66],["calls",1.12],["XQReceive",1.5],["before",2.36],["the",2.72],["queue",2.86],["exists.",3.02],["Its",4.1],["handle",4.24],["is",4.62],["still",4.92],["null.",5.2]],
  t5: [["The",0],["program",0.24],["stops",0.52],["with",0.88],["assert",1.18],["failed",1.52],["and",2.02],["x",2.52],["-key",2.8],["receive.",3],["The",3.96],["chip",4.06],["restarts",4.24],["and",4.96],["does",5.42],["it",5.6],["again",5.72],["forever.",6.1]],
  t6: [["To",0],["fix,",0.24],["create",0.98],["the",1.3],["queue",1.46],["first,",1.66],["then",2.66],["the",2.82],["tasks",2.98],["that",3.32],["use",3.52],["it.",3.72]],
  z1: [["A",0],["cue",0.26],["carries",0.42],["copies",0.84],["from",1.18],["one",1.52],["task",1.8],["to",2.14],["another,",2.4],["in",3.14],["order,",3.3],["and",4.24],["the",4.38],["receiver",4.46],["sleeps",4.84],["until",5.32],["they",5.98],["arrive.",6.14],["That's",7],["a",7.22],["cue.",7.3]],
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

export const TAIL: Record<string, number> = { problem: 2.0, answer: 2.4, create: 2.0, send: 2.0, receive: 2.2, demo: 2.4, full: 2.4, trap: 2.4, payoff: 6.0 };
const dur = (id: string, fallback: number) => SCENE_DUR[id] ?? fallback;
export const SCENES = [
  { id: 'problem', dur: dur('problem', 25) },
  { id: 'answer', dur: dur('answer', 20) },
  { id: 'create', dur: dur('create', 40) },
  { id: 'send', dur: dur('send', 35) },
  { id: 'receive', dur: dur('receive', 35) },
  { id: 'demo', dur: dur('demo', 30) },
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

export type VoLine = { id: string; scene: SceneId; at: number; text: string; say?: string; pause?: number };
export const VOICE = 'en-US-AndrewMultilingualNeural';
const L = (id: string, scene: SceneId, text: string, say?: string, pause?: number): VoLine => ({ id, scene, at: at(id), text, say, pause });

const SAY_CREATE = 'X queue create';
const SAY_SEND = 'X queue send';
const SAY_RECV = 'X queue receive';

export const VO: VoLine[] = [
  // 1 · problem
  L('p1', 'problem', 'The button task knows when you press the button.'),
  L('p2', 'problem', 'Now you want the LED task to blink three times for every press.'),
  L('p3', 'problem', 'How does the button task tell it?'),
  L('p4', 'problem', 'A shared variable, like a pressed flag, sort of works.'),
  L('p5', 'problem', 'But the LED task has to keep checking it.'),
  L('p6', 'problem', 'And two quick presses set the same flag. The LED task sees only one.'),
  // 2 · answer
  L('a1', 'answer', 'Picture a row of boxes between the two tasks.'),
  L('a2', 'answer', 'The button task puts a copy of each press in at the back.'),
  L('a3', 'answer', 'The LED task takes them out at the front, oldest first.'),
  L('a4', 'answer', 'When the row is empty, the LED task sleeps until something arrives.'),
  L('a5', 'answer', "That's a queue.", undefined, 1.0),
  // 3 · xQueueCreate
  L('e0', 'create', 'First, make the queue. Do it at the start of app_main.', 'First, make the queue. Do it at the start of app main.'),
  L('e1', 'create', 'xQueueCreate takes two numbers.', `${SAY_CREATE} takes two numbers.`),
  L('e2', 'create', 'The length: how many items it can hold at once. Here, five.'),
  L('e3', 'create', 'The item size, in bytes. Each press is an int, and sizeof int is four.', 'The item size, in bytes. Each press is an int, and size of int is four.'),
  L('e4', 'create', 'Every item has the same size. The queue copies that many bytes, each time.'),
  L('e5', 'create', 'So it takes five times four, twenty bytes, plus a little bookkeeping, from the heap, once.'),
  L('e6', 'create', 'It returns a handle: the name both tasks use for this queue.'),
  L('e7', 'create', 'If the heap is too full, it returns NULL instead.', 'If the heap is too full, it returns null instead.'),
  L('e8', 'create', 'It comes from freertos/queue.h.', 'It comes from Free R-TOS, slash queue dot H.'),
  // 4 · xQueueSend
  L('s0', 'send', 'The button task sends each press.'),
  L('s1', 'send', "xQueueSend. First, the queue's handle.", `${SAY_SEND}. First, the queue's handle.`),
  L('s2', 'send', 'Then a pointer to the item. The queue copies four bytes from there.'),
  L('s3', 'send', "It's a copy, so presses can change straight away. The queue keeps the old value."),
  L('s4', 'send', 'Last, how many ticks to wait if the queue is full. Zero: don\'t wait.'),
  L('s5', 'send', 'It returns pdTRUE when the item went in.', 'It returns P D true when the item went in.'),
  L('s6', 'send', 'If the queue is full, it returns errQUEUE_FULL, and this press is dropped. So log a warning.', 'If the queue is full, it returns err queue full, and this press is dropped. So log a warning.'),
  // 5 · xQueueReceive
  L('r0', 'receive', 'The LED task waits for presses.'),
  L('r1', 'receive', 'xQueueReceive. The handle, then where to put the item: here, the variable press.', `${SAY_RECV}. The handle, then where to put the item: here, the variable press.`),
  L('r2', 'receive', 'It copies the oldest item into press, and takes it out of the queue.', 'It copies the oldest item into press, and takes it out of the queue.'),
  L('r3', 'receive', 'The last argument is how long to wait, if the queue is empty.'),
  L('r4', 'receive', 'portMAX_DELAY means forever. The task sleeps, and costs nothing, until a press arrives.', 'Port-max-delay means forever. The task sleeps, and costs nothing, until a press arrives.'),
  L('r5', 'receive', 'It returns pdTRUE when it got an item.', 'It returns P D true when it got an item.'),
  L('r6', 'receive', 'With a time limit instead, like two seconds, it can return pdFALSE: nothing came.', 'With a time limit instead, like two seconds, it can return P D false: nothing came.'),
  // 6 · demo
  L('d1', 'demo', 'Flash it, and press the button once.'),
  L('d2', 'demo', 'Press one goes into the queue, and the LED task wakes up at once, and blinks.'),
  L('d3', 'demo', 'Now press three times, quickly.', undefined, 1.0),
  L('d4', 'demo', 'The LED task is busy blinking, so presses three and four wait in the queue.'),
  L('d5', 'demo', 'Each one comes out when the blinks before it end: one and a half seconds apart, in order.'),
  L('d6', 'demo', 'No press is lost, and the button task never waited.'),
  // 7 · full
  L('f1', 'full', 'But there are only five boxes. Press eight times, fast.'),
  L('f2', 'full', 'Press one is taken straight away. Presses two to six fill the queue.'),
  L('f3', 'full', 'Presses seven and eight find it full. xQueueSend gives up at once, and the warnings print.', `Presses seven and eight find it full. ${SAY_SEND} gives up at once, and the warnings print.`),
  L('f4', 'full', 'If every press matters, make the queue longer, or let the button task wait a few ticks.'),
  // 8 · trap
  L('t1', 'trap', 'Now the mistake everyone makes once.'),
  L('t2', 'trap', 'Create the queue after the tasks.'),
  L('t3', 'trap', 'Remember: a new task with a higher priority than app_main runs straight away.', 'Remember: a new task with a higher priority than app main runs straight away.'),
  L('t4', 'trap', 'So the LED task calls xQueueReceive before the queue exists. Its handle is still NULL.', `So the LED task calls ${SAY_RECV} before the queue exists. Its handle is still null.`),
  L('t5', 'trap', 'The program stops with assert failed, in xQueueReceive. The chip restarts, and does it again, forever.', `The program stops with assert failed, in ${SAY_RECV}. The chip restarts, and does it again, forever.`),
  L('t6', 'trap', 'The fix: create the queue first, then the tasks that use it.', undefined, 1.0),
  // 9 · payoff
  L('z1', 'payoff', "A queue carries copies from one task to another, in order, and the receiver sleeps until they arrive. That's a queue."),
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
  '        if (last == 1 && level == 0) {             // just pressed',
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
/** lab/logs/v1.log */
export const RUN_DEMO = runFrom(1633, [1000, 8940, 9090, 9240], [2633, 10573, 12073, 13573], []);
/** lab/logs/v2.log */
export const RUN_BURST = runFrom(1643, [1000, 1120, 1240, 1360, 1480, 1600, 1720, 1840], [2643, 4143, 5643, 7143, 8643, 10143], [7, 8]);
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

// ── 1. problem ─────────────────────────────────────────────────────────────

export const PROBLEM = {
  button: at('p1'),
  press: w('p1', 'press'),
  led: at('p2'),
  three: w('p2', 'three'),
  how: at('p3'),
  flag: w('p4', 'flag'),
  checking: w('p5', 'checking'),
  two: w('p6', 'two'),
  same: w('p6', 'same'),
  one: w('p6', 'one'),
  captions: [
    { at: at('p1'), text: 'the button task knows about each press' },
    { at: at('p2'), text: 'the LED task should blink 3 times per press' },
    { at: at('p4'), text: 'a shared flag: the LED task must keep checking it' },
    { at: at('p6'), text: 'two quick presses → the same flag → seen as one' },
  ] as Caption[],
};

// ── 2. answer ──────────────────────────────────────────────────────────────

export const ANSWER = {
  row: at('a1'),
  boxes: w('a1', 'boxes'),
  copy: w('a2', 'copy'),
  back: w('a2', 'back'),
  out: w('a3', 'out'),
  oldest: w('a3', 'oldest'),
  empty: w('a4', 'empty'),
  sleeps: w('a4', 'sleeps'),
  arrives: w('a4', 'arrives'),
  word: w('a5', 'cue'),
  captions: [
    { at: at('a2'), text: 'a copy of each press goes in at the back' },
    { at: at('a3'), text: 'out at the front, oldest first' },
    { at: at('a4'), text: 'empty → the LED task sleeps until something arrives' },
  ] as Caption[],
};
/** the answer's picture: two presses in, one out, then empty, then one more */
export const ANSWER_ITEMS = [
  { label: '1', in: ANSWER.copy, out: ANSWER.out },
  { label: '2', in: ANSWER.back, out: ANSWER.empty - 0.4 },
  { label: '3', in: ANSWER.arrives - 0.2, out: ANSWER.arrives + 0.5 },
];

// ── 3. xQueueCreate ────────────────────────────────────────────────────────

export const CREATE = {
  intro: { show: at('e0'), out: at('e1') },
  run: w('e1', 'XQ'),
  args: [w('e2', 'length'), w('e3', 'size')],
  views: { length: w('e2', 'length'), size: w('e3', 'size'), mem: at('e5'), handle: at('e6'), inc: at('e8') },
  five: w('e2', '5'),
  int: w('e3', 'int'),
  four: w('e3', '4'),
  same: w('e4', 'same'),
  copies: w('e4', 'copies'),
  times: w('e5', 'x'),
  twenty: w('e5', '20'),
  heap: w('e5', 'heap'),
  both: w('e6', 'both'),
  null: w('e7', 'null'),
  captions: [
    { at: at('e0'), text: 'make the queue first, at the top of app_main' },
    { at: at('e2'), text: 'length: how many items it holds — 5' },
    { at: at('e3'), text: 'item size in bytes: sizeof(int) = 4' },
    { at: at('e4'), text: 'every item the same size · copied each time' },
    { at: at('e5'), text: '5 × 4 = 20 bytes + bookkeeping, from the heap, once' },
    { at: at('e6'), text: 'returns a handle: press_queue, used by both tasks' },
    { at: at('e7'), text: 'NULL if the heap is too full' },
    { at: at('e8'), text: '#include "freertos/queue.h"' },
  ] as Caption[],
};

// ── 4. xQueueSend ──────────────────────────────────────────────────────────

export const SEND = {
  intro: { show: at('s0'), out: at('s1') },
  run: w('s1', 'Excuse'),
  args: [w('s1', 'handle'), w('s2', 'pointer'), w('s4', 'ticks')],
  views: { copy: at('s2'), wait: at('s4'), ret: at('s5') },
  four: w('s2', '4'),
  change: w('s3', 'change'),
  keeps: w('s3', 'keeps'),
  full: w('s4', 'full'),
  zero: w('s4', 'Zero'),
  pdtrue: w('s5', 'PD'),
  errfull: w('s6', 'air'),
  dropped: w('s6', 'dropped'),
  warning: w('s6', 'warning'),
  captions: [
    { at: at('s1'), text: 'xQueueSend(queue, pointer to the item, ticks to wait)' },
    { at: at('s2'), text: '&presses → the queue copies 4 bytes from there' },
    { at: at('s3'), text: 'a copy: presses can change, the queue keeps the old value' },
    { at: at('s4'), text: 'ticks to wait if full · 0 = don’t wait' },
    { at: at('s5'), text: 'pdTRUE → it went in' },
    { at: at('s6'), text: 'errQUEUE_FULL → this press is dropped → log a warning' },
  ] as Caption[],
};

// ── 5. xQueueReceive ───────────────────────────────────────────────────────

export const RECV = {
  intro: { show: at('r0'), out: at('r1') },
  run: at('r1'),
  args: [w('r1', 'handle'), w('r1', 'variable'), w('r3', 'wait')],
  views: { into: w('r1', 'Here'), wait: at('r3'), ret: at('r5') },
  oldest: w('r2', 'oldest'),
  takes: w('r2', 'takes'),
  empty: w('r3', 'empty'),
  forever: w('r4', 'forever'),
  sleeps: w('r4', 'sleeps'),
  arrives: w('r4', 'arrives'),
  pdtrue: w('r5', 'PD'),
  limit: w('r6', 'limit'),
  pdfalse: w('r6', 'PD'),
  nothing: w('r6', 'Nothing'),
  captions: [
    { at: at('r1'), text: 'xQueueReceive(queue, where to copy the item, ticks to wait)' },
    { at: at('r2'), text: 'the oldest item → press · and it leaves the queue' },
    { at: at('r3'), text: 'ticks to wait if empty' },
    { at: at('r4'), text: 'portMAX_DELAY = forever: the task sleeps, no CPU, until a press' },
    { at: at('r5'), text: 'pdTRUE → got one' },
    { at: at('r6'), text: 'with a time limit: pdFALSE → nothing came' },
  ] as Caption[],
};

// ── 6. demo ────────────────────────────────────────────────────────────────

/** scene time of the demo run's 1000 ms (press 1): just after "…press the button once" */
const DEMO_T0 = w('d1', 'once', 0, 0.3);
export const DEMO = {
  flash: at('d1'),
  t0: DEMO_T0,
  /** scene time of scheduler ms m */
  t: (m: number) => +(DEMO_T0 + (m - 1000) / 1000).toFixed(3),
  wakes: w('d2', 'wakes'),
  three: at('d3'),
  busy: w('d4', 'busy'),
  wait: w('d4', 'wait'),
  apart: w('d5', 'apart'),
  order: w('d5', 'order'),
  lost: w('d6', 'lost'),
  never: w('d6', 'never'),
  captions: [
    { at: at('d1'), text: 'flash it · one press' },
    { at: at('d2'), text: 'press 1 → the queue → the LED task wakes at once' },
    { at: at('d3'), text: 'three quick presses' },
    { at: at('d4'), text: 'the LED task is busy → presses 3 and 4 wait in the queue' },
    { at: at('d5'), text: 'out 1.5 s apart, in order — as each blink ends' },
    { at: at('d6'), text: 'nothing lost · the button task never waited' },
  ] as Caption[],
};

// ── 7. full ────────────────────────────────────────────────────────────────

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

// ── 8. trap ────────────────────────────────────────────────────────────────

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

// ── 9. payoff ──────────────────────────────────────────────────────────────

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
