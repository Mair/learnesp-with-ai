/**
 * FreeRTOS delay-until — the timeline. Single source of truth for picture AND sound.
 * PURE ESP-IDF: xTaskGetTickCount, xTaskDelayUntil, vTaskDelay, ESP_LOGW; GPIO output only.
 *
 *   problem (two tasks, one drifts) → why (30 + 200 = 230) → answer (UNTIL)
 *     → xTaskGetTickCount → xTaskDelayUntil → demo (50 vs 44) → running late (catch up)
 *     → the trap (last inside the loop) → payoff
 *
 * Times are SCENE-RELATIVE. `node scripts/vo-plan.ts freertos-delay-until` voices every
 * line and writes VO_AT / VO_WORDS / SCENE_DUR below; cues are `w(line, word)`.
 * Import-free (type-only imports are erased): Node runs it as-is.
 * Every claim on screen or in the VO is sourced in ./FACTS.md.
 */
import type { Caption } from '../../components/pwm';

export const FPS = 30;
export const SECTION = '2-freertos';

// ── generated: VO plan (node scripts/vo-plan.ts freertos-delay-until) — do not edit by hand ──
export const VO_AT: Record<string, number> = {"p1":0.5,"p2":6.22,"p3":11.84,"p4":14.98,"p5":18.06,"p6":20.9,"p7":25.68,"w1":0.5,"w2":3.54,"w3":5.88,"w4":8.3,"w5":13.42,"w6":17.9,"a1":0.5,"a2":3.98,"a3":7.1,"a4":12.2,"g1":0.5,"g2":4.14,"g3":8.68,"g4":11.46,"g5":14.28,"e0":0.5,"e1":2.96,"e2":5.86,"e3":12.14,"e4":17.5,"e5":21.44,"e6":24.18,"e7":27.76,"e8":32.64,"e9":41.12,"d1":0.5,"d2":4.94,"d3":10.32,"d4":17.62,"l1":0.5,"l2":6.54,"l3":11.32,"l4":14.28,"l5":17.02,"l6":21.62,"t1":0.5,"t2":2.98,"t3":6.32,"t4":9.96,"t5":14.66,"z1":0.5};
export const SCENE_DUR: Record<string, number> = {"problem":31.32,"why":23.56,"answer":15.56,"tick":17.66,"until":51.54,"demo":25.48,"late":28.52,"trap":19.52,"payoff":10.52};
export const VO_WORDS: Record<string, [string, number][]> = {
  p1: [["Let's",0],["say",0.3],["you",0.4],["want",0.54],["an",0.66],["LED",0.8],["to",1.22],["switch",1.82],["every",2.16],["200",2.76],["milliseconds",3.26],["on",3.7],["a",4.54],["steady",4.66],["beat.",4.84]],
  p2: [["Each",0],["time",0.26],["round,",0.5],["the",1.28],["task",1.4],["also",1.68],["does",2.06],["a",2.24],["little",2.36],["work",2.52],["about",2.94],["30",3.52],["milliseconds",4],["of",4.42],["it.",4.7]],
  p3: [["Here",0],["are",0.24],["two",0.36],["tasks",0.54],["that",0.96],["do",1.2],["exactly",1.38],["the",1.84],["same",2.16],["thing.",2.42]],
  p4: [["The",0],["only",0.22],["difference",0.4],["between",0.74],["them",1.18],["is",1.48],["how",1.82],["they",1.98],["wait.",2.14]],
  p5: [["Let's",0],["start",0.34],["them",0.46],["together",0.62],["and",0.86],["watch.",1.16]],
  p6: [["At",0],["first,",0.22],["they",0.56],["blink",0.58],["together,",0.8],["but",1.66],["LED",1.76],["slowly",2.3],["falls",3.28],["behind.",3.7]],
  p7: [["After",0],["a",0.38],["second",0.54],["and",0.76],["a",0.94],["half,",1.02],["they're",1.78],["blinking",1.96],["opposite",2.24],["each",2.66],["other.",2.92]],
  w1: [["So",0],["let's",0.28],["follow",0.5],["LEDA",0.74],["for",1.7],["one",2.14],["loop.",2.32]],
  w2: [["First,",0],["it",0.78],["switches",0.84],["the",1.18],["LED.",1.44]],
  w3: [["Then",0],["it",0.24],["works",0.36],["for",0.58],["30",0.94],["milliseconds.",1.36]],
  w4: [["Then",0],["V",0.42],["-Task",0.58],["delay",0.98],["waits",1.4],["200",1.8],["milliseconds.",2.68],["Count",3.82],["it",4.04],["from",4.16],["now.",4.26]],
  w5: [["So",0],["one",0.32],["loop",0.58],["takes",0.8],["230",1.1],["milliseconds,",2.06],["not",3.16],["200.",3.42]],
  w6: [["Every",0],["loop",0.36],["adds",0.66],["another",1.18],["30",1.52],["milliseconds,",1.9],["and",2.94],["the",3.1],["beat",3.22],["drifts.",3.42]],
  a1: [["The",0],["fix",0.24],["is,",0.5],["don't",1.36],["wait",1.64],["for",1.8],["200",2.06],["milliseconds.",2.46]],
  a2: [["Instead,",0],["wait",1.1],["until",1.34],["the",1.52],["next",1.62],["beat",1.78],["on",2.04],["the",2.18],["clock.",2.28]],
  a3: [["That",0],["way",0.26],["the",0.38],["work",0.54],["happens",0.78],["inside",1.22],["the",1.8],["200",2.04],["and",2.5],["the",3.26],["beat",3.36],["stays",3.54],["put.",3.92]],
  a4: [["That's",0],["called",0.32],["delay",0.46],["until.",0.8]],
  g1: [["First,",0],["the",0.92],["task",1.04],["needs",1.42],["to",1.68],["know",1.88],["where",2.08],["the",2.36],["beat",2.48],["starts.",2.66]],
  g2: [["xTask",0],["git",0.62],["tick",0.94],["count",1.16],["tells",1.44],["you",1.72],["how",1.9],["many",2.06],["ticks",2.26],["have",2.52],["passed",2.72],["since",3.04],["the",3.26],["program",3.42],["started.",3.64]],
  g3: [["and",0],["one",0.26],["tick",0.52],["is",0.84],["10",1.4],["milliseconds.",1.76]],
  g4: [["We",0],["store",0.22],["it",0.44],["in",0.56],["last,",0.62],["and",1.38],["that's",1.44],["our",1.6],["first",1.7],["beat.",2.02]],
  g5: [["You",0],["do",0.2],["this",0.34],["just",0.5],["once",0.72],["before",1.08],["the",1.52],["loop.",1.68]],
  e0: [["Now",0],["for",0.3],["the",0.46],["delay",0.56],["at",0.84],["the",1.14],["end",1.28],["of",1.5],["the",1.62],["loop.",1.7]],
  e1: [["Ex",0],["-task",0.3],["delay",0.54],["until",0.9],["takes",1.44],["two",1.68],["arguments.",1.94]],
  e2: [["The",0],["first",0.24],["is",0.5],["the",0.98],["address",1.14],["of",1.48],["last.",1.7],["The",2.64],["ampersand",2.7],["lets",3.38],["the",3.74],["call",3.9],["read",4.12],["it",4.4],["and",4.88],["change",5.14],["it.",5.38]],
  e3: [["The",0],["second",0.26],["is",0.52],["the",1.02],["period,",1.18],["200",2.2],["milliseconds,",2.58],["which",3.7],["is",3.78],["20",3.94],["ticks.",4.24]],
  e4: [["The",0],["call",0.2],["works",0.4],["out",0.7],["the",0.9],["next",1.04],["beat,",1.32],["which",1.96],["is",2.04],["last",2.2],["plus",2.48],["20",2.82],["ticks.",3.2]],
  e5: [["It",0],["waits",0.24],["until",0.44],["the",0.68],["tick",0.84],["count",1.02],["reaches",1.36],["that",1.72],["beat.",2.02]],
  e6: [["Then",0],["it",0.22],["moves",0.3],["last",0.48],["onto",0.84],["that",1.16],["beat,",1.4],["ready",2.06],["for",2.2],["the",2.38],["next",2.48],["loop.",2.64]],
  e7: [["So",0],["the",0.24],["beats",0.36],["are",0.58],["always",0.84],["20",1.24],["ticks",1.6],["apart,",1.82],["no",2.58],["matter",2.72],["how",2.9],["long",3.14],["the",3.4],["work",3.54],["took.",3.72]],
  e8: [["The",0],["period",0.24],["is",0.52],["counted",0.76],["in",1.08],["whole",1.32],["ticks,",1.66],["so",2.52],["anything",2.74],["under",3.16],["10",3.56],["milliseconds",3.88],["becomes",4.34],["zero",4.86],["ticks",5.3],["and",5.7],["the",6.24],["program",6.34],["stops",6.58],["with",7.02],["an",7.28],["error.",7.42]],
  e9: [["You",0],["may",0.24],["see",0.36],["V",0.62],["-Task",0.86],["Delay",1.22],["until",1.52],["in",2.12],["older",2.28],["examples.",2.54],["In",3.68],["ESP",3.76],["-ID",4.16],["-F6,",5.08],["use",6.74],["X",6.88],["-Task",7.26],["Delay",7.48],["until",7.92],["instead.",8.52]],
  d1: [["Now",0],["flash",0.3],["it.",0.62],["Both",1.38],["LEDs",1.52],["start",2.12],["together.",2.82]],
  d2: [["LED",0],["-B",0.52],["stays",0.74],["on",0.98],["the",1.18],["beat,",1.28],["while",1.94],["LED",2.04],["-A",2.52],["drifts.",2.76]],
  d3: [["After",0],["10",0.38],["seconds,",0.7],["LED",1.88],["B",2.1],["has",2.48],["switched",2.8],["50",3.14],["times",3.76],["and",4.24],["LED",4.9],["A",5.4],["only",5.98],["44.",6.16]],
  d4: [["It's",0],["the",0.26],["same",0.38],["work",0.58],["and",0.88],["the",1.3],["same",1.42],["200",1.74],["milliseconds,",2.56],["only",3.78],["the",3.96],["delay",4.12],["call",4.34],["is",4.68],["different.",5.02]],
  l1: [["What",0],["if",0.22],["one",0.32],["loop",0.52],["takes",0.86],["too",1.24],["long?",1.5],["Suppose",2.54],["the",2.58],["job",2.84],["takes",3.1],["500",3.48],["milliseconds",4.22],["just",4.7],["once.",5.08]],
  l2: [["then",0],["the",0.22],["next",0.3],["beat",0.48],["is",0.76],["already",1.22],["in",1.6],["the",1.8],["past,",1.88],["so",2.56],["the",2.88],["call",3],["doesn't",3.26],["wait",3.84],["at",4.04],["all.",4.16]],
  l3: [["It",0],["runs",0.26],["again",0.54],["straight",0.86],["away",1.2],["to",1.52],["catch",1.96],["up.",2.16]],
  l4: [["Then",0],["it's",0.22],["back",0.36],["on",0.5],["the",0.68],["beat",0.78],["at",1.04],["600.",1.48]],
  l5: [["You",0],["can",0.22],["tell",0.36],["when",0.58],["this",0.76],["happens,",0.9],["because",1.66],["the",1.98],["call",2.16],["returns",2.38],["false",2.86],["when",3.26],["it",3.56],["didn't",3.68],["wait.",3.92]],
  l6: [["Here,",0],["we",0.72],["print",0.84],["a",0.98],["warning",1.12],["with",1.36],["ESP",1.64],["log",2.34],["W,",2.74],["the",3.58],["warning",3.76],["version",4],["of",4.3],["log",4.44],["I.",4.6]],
  t1: [["Here's",0],["a",0.32],["mistake",0.36],["that's",0.72],["easy",1.2],["to",1.48],["make.",1.72]],
  t2: [["Move",0],["the",0.28],["line",0.46],["that",0.7],["reads",0.9],["the",1.26],["clock",1.5],["inside",1.84],["the",2.34],["loop.",2.56]],
  t3: [["Now,",0],["every",0.44],["loop",0.72],["starts",0.96],["its",1.26],["beat",1.46],["from",1.64],["now,",1.84],["after",2.44],["the",2.68],["work.",2.82]],
  t4: [["That's",0],["the",0.34],["same",0.44],["as",0.74],["VTAS",1.18],["delay,",1.8],["so",2.56],["LED",2.84],["-B",3.22],["drifts",3.44],["too.",3.74]],
  t5: [["The",0],["fix",0.24],["is",0.42],["to",0.64],["read",0.82],["the",1.06],["clock",1.22],["once",1.5],["before",1.98],["the",2.54],["loop.",2.7]],
  z1: [["So",0],["wait",0.28],["until",0.42],["the",0.6],["next",0.7],["beat,",0.88],["not",1.64],["for",1.74],["a",1.92],["while.",2.02],["That's",2.76],["delay",3],["until...",3.2]],
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

export const TAIL: Record<string, number> = { problem: 2.5, why: 1.8, answer: 2.2, demo: 2.5, late: 2.0, trap: 2.0, payoff: 6.0 };
const dur = (id: string, fallback: number) => SCENE_DUR[id] ?? fallback;
export const SCENES = [
  { id: 'problem', dur: dur('problem', 30) },
  { id: 'why', dur: dur('why', 25) },
  { id: 'answer', dur: dur('answer', 15) },
  { id: 'tick', dur: dur('tick', 22) },
  { id: 'until', dur: dur('until', 55) },
  { id: 'demo', dur: dur('demo', 22) },
  { id: 'late', dur: dur('late', 35) },
  { id: 'trap', dur: dur('trap', 22) },
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
export const UNTIL_FRAMES = Math.round(SECONDS * FPS);

// ── voiceover ──────────────────────────────────────────────────────────────

export type VoLine = { id: string; scene: SceneId; at: number; text: string; say?: string; pause?: number };
export const VOICE = 'en-US-AndrewMultilingualNeural';
const L = (id: string, scene: SceneId, text: string, say?: string, pause?: number): VoLine => ({ id, scene, at: at(id), text, say, pause });

const VTD = 'V task delay';
const XTDU = 'X task delay until';

export const VO: VoLine[] = [
  // 1 · problem: the want, and the first try
  L('p1', 'problem', "Let's say you want an LED to switch every 200 milliseconds, on a steady beat.", "Let's say you want an LED to switch every two hundred milliseconds, on a steady beat."),
  L('p2', 'problem', 'Each time round, the task also does a little work, about 30 milliseconds of it.', 'Each time round, the task also does a little work, about thirty milliseconds of it.', 0.6),
  L('p3', 'problem', 'Here are two tasks that do exactly the same thing.', undefined, 0.8),
  L('p4', 'problem', 'The only difference between them is how they wait.', undefined, 0.4),
  L('p5', 'problem', "Let's start them together, and watch.", undefined, 0.7),
  L('p6', 'problem', 'At first they blink together, but LED A slowly falls behind.', undefined, 1.4),
  L('p7', 'problem', "After a second and a half, they're blinking opposite each other.", undefined, 0.6),
  // 2 · why
  L('w1', 'why', "So let's follow LED A for one loop."),
  L('w2', 'why', 'First, it switches the LED.', undefined, 0.5),
  L('w3', 'why', 'Then it works for 30 milliseconds.', 'Then it works for thirty milliseconds.', 0.6),
  L('w4', 'why', 'Then vTaskDelay waits 200 milliseconds, counted from now.', `Then ${VTD} waits two hundred milliseconds, counted from now.`, 0.6),
  L('w5', 'why', 'So one loop takes 230 milliseconds, not 200.', 'So one loop takes two hundred and thirty milliseconds, not two hundred.', 0.6),
  L('w6', 'why', 'Every loop adds another 30 milliseconds, and the beat drifts.', 'Every loop adds another thirty milliseconds, and the beat drifts.', 0.6),
  // 3 · answer
  L('a1', 'answer', "The fix is: don't wait for 200 milliseconds.", "The fix is: don't wait for two hundred milliseconds."),
  L('a2', 'answer', 'Instead, wait until the next beat on the clock.', undefined, 0.6),
  L('a3', 'answer', 'That way the work happens inside the 200, and the beat stays put.', 'That way the work happens inside the two hundred, and the beat stays put.', 0.6),
  L('a4', 'answer', "That's called delay until.", undefined, 0.8),
  // 4 · the tick count
  L('g1', 'tick', 'First, the task needs to know where the beat starts.'),
  L('g2', 'tick', 'xTaskGetTickCount tells you how many ticks have passed since the program started,', 'X task get tick count tells you how many ticks have passed since the program started,', 0.6),
  L('g3', 'tick', 'and one tick is 10 milliseconds.', 'and one tick is ten milliseconds.', 0.4),
  L('g4', 'tick', "We store it in last, and that's our first beat.", undefined, 0.6),
  L('g5', 'tick', 'You do this just once, before the loop.', undefined, 0.5),
  // 5 · xTaskDelayUntil
  L('e0', 'until', 'Now for the delay at the end of the loop.'),
  L('e1', 'until', 'xTaskDelayUntil takes two arguments.', `${XTDU} takes two arguments.`, 0.6),
  L('e2', 'until', 'The first is the address of last. The ampersand lets the call read it, and change it.', undefined, 0.6),
  L('e3', 'until', 'The second is the period: 200 milliseconds, which is 20 ticks.', 'The second is the period: two hundred milliseconds, which is twenty ticks.', 0.6),
  L('e4', 'until', 'The call works out the next beat, which is last plus 20 ticks.', 'The call works out the next beat, which is last plus twenty ticks.', 0.9),
  L('e5', 'until', 'It waits until the tick count reaches that beat.', undefined, 0.5),
  L('e6', 'until', 'Then it moves last on to that beat, ready for the next loop.', undefined, 0.5),
  L('e7', 'until', 'So the beats are always 20 ticks apart, no matter how long the work took.', 'So the beats are always twenty ticks apart, no matter how long the work took.', 0.7),
  L('e8', 'until', 'The period is counted in whole ticks, so anything under 10 milliseconds becomes zero ticks, and the program stops with an error.', 'The period is counted in whole ticks, so anything under ten milliseconds becomes zero ticks, and the program stops with an error.', 0.9),
  L('e9', 'until', 'You may see vTaskDelayUntil in older examples. In ESP-IDF 6, use xTaskDelayUntil instead.', `You may see V task delay until in older examples. In E S P I D F six, use ${XTDU} instead.`, 0.9),
  // 6 · demo
  L('d1', 'demo', 'Now flash it. Both LEDs start together.'),
  L('d2', 'demo', 'LED B stays on the beat, while LED A drifts.', undefined, 1.2),
  L('d3', 'demo', 'After 10 seconds, LED B has switched 50 times, and LED A only 44.', 'After ten seconds, LED B has switched fifty times, and LED A only forty-four.', 2.2),
  L('d4', 'demo', "It's the same work and the same 200 milliseconds. Only the delay call is different.", "It's the same work and the same two hundred milliseconds. Only the delay call is different.", 0.7),
  // 7 · late
  L('l1', 'late', 'What if one loop takes too long? Suppose the job takes 500 milliseconds, just once.', 'What if one loop takes too long? Suppose the job takes five hundred milliseconds, just once.'),
  L('l2', 'late', "Then the next beat is already in the past, so the call doesn't wait at all.", undefined, 0.6),
  L('l3', 'late', 'It runs again straight away, to catch up.', undefined, 0.4),
  L('l4', 'late', "Then it's back on the beat, at 600.", "Then it's back on the beat, at six hundred.", 0.5),
  L('l5', 'late', "You can tell when this happens, because the call returns false when it didn't wait.", undefined, 0.9),
  L('l6', 'late', 'Here, we print a warning with ESP_LOGW, the warning version of log I.', 'Here, we print a warning with E S P log W, the warning version of log I.', 0.5),
  // 8 · trap
  L('t1', 'trap', "Here's a mistake that's easy to make."),
  L('t2', 'trap', 'Move the line that reads the clock inside the loop.', undefined, 0.5),
  L('t3', 'trap', 'Now every loop starts its beat from now, after the work.', undefined, 0.6),
  L('t4', 'trap', "That's the same as vTaskDelay, so LED B drifts too.", `That's the same as ${VTD}, so LED B drifts too.`, 0.6),
  L('t5', 'trap', 'The fix is to read the clock once, before the loop.', undefined, 0.7),
  // 9 · payoff
  L('z1', 'payoff', "So wait until the next beat, not for a while. That's delay until."),
];

// ── shared numbers and code (FACTS.md) ────────────────────────────────────

export const BEAT = 200; // ms
export const WORK = 30; // ms
export const LATE_WORK = 500; // ms, the one slow loop
export const LED_A = { pin: 2, name: 'LED A' };
export const LED_B = { pin: 19, name: 'LED B' };

/** LED A (vTaskDelay): a switch every 230 ms */
export const delayEdges = (until: number) => Array.from({ length: Math.ceil(until / (BEAT + WORK)) + 1 }, (_, k) => k * (BEAT + WORK));
/** LED B (xTaskDelayUntil): a switch every 200 ms */
export const untilEdges = (until: number) => Array.from({ length: Math.ceil(until / BEAT) + 1 }, (_, k) => k * BEAT);
/** LED B when the first loop's work takes 500 ms: 0, 500, 530, then back on the beat at 600, 800 … */
export const lateEdges = (until: number) => [0, 500, 530, ...untilEdges(until).filter((s) => s >= 600)];
/** the LED level at ms s from its switch times (on after the 1st, 3rd … switch) */
export const levelAt = (edges: number[], s: number) => edges.filter((e) => e <= s).length % 2;
export const switchesBefore = (edges: number[], s: number) => edges.filter((e) => e < s).length;

export const WORK_CODE = [
  'static void work_30ms(void)   // stands in for reading a sensor',
  '{',
  '    int64_t end = esp_timer_get_time() + 30 * 1000;',
  '    while (esp_timer_get_time() < end) {',
  '    }',
  '}',
];

const taskCode = (name: string, led: string, wait: string[], lastInside = false, lastLine = true) => [
  `static void ${name}(void *arg)`,
  '{',
  `    // set up ${led} as an output`,
  '    int level = 0;',
  ...(lastLine && !lastInside ? ['    TickType_t last = xTaskGetTickCount();'] : []),
  '    while (1) {',
  '        level = !level;',
  `        gpio_set_level(${led}, level);`,
  '        work_30ms();',
  ...(lastInside ? ['        TickType_t last = xTaskGetTickCount();'] : []),
  ...wait,
  '    }',
  '}',
];
export const DELAY_CODE = taskCode('delay_task', 'LED_A', ['        vTaskDelay(pdMS_TO_TICKS(200));'], false, false);
export const UNTIL_LINE = '        xTaskDelayUntil(&last, pdMS_TO_TICKS(200));';
export const UNTIL_CODE = taskCode('until_task', 'LED_B', [UNTIL_LINE]);
export const UNTIL_CHECK_CODE = ['static const char *TAG = "beat";', '', ...taskCode('until_task', 'LED_B', [
  '        if (xTaskDelayUntil(&last, pdMS_TO_TICKS(200)) == pdFALSE) {',
  '            ESP_LOGW(TAG, "missed a beat");',
  '        }',
])];
export const UNTIL_TRAP_CODE = taskCode('until_task', 'LED_B', [UNTIL_LINE], true);
export const SET_CODE = 'xTaskDelayUntil(&last, pdMS_TO_TICKS(200));';

// ── 1. problem ─────────────────────────────────────────────────────────────

export const PROBLEM = {
  led: w('p1', 'LED'),
  every: w('p1', '200'),
  steady: w('p1', 'steady'),
  work: w('p2', 'work'),
  ms30: w('p2', '30'),
  two: at('p3'),
  same: w('p3', 'same'),
  diff: w('p4', 'difference'),
  wait: w('p4', 'wait'),
  start: w('p5', 'together'),
  behind: w('p6', 'behind'),
  opposite: w('p7', 'opposite'),
  captions: [
    { at: at('p1'), text: 'want: switch the LED every 200 ms — a steady beat' },
    { at: at('p2'), text: 'each loop also does 30 ms of work' },
    { at: at('p3'), text: 'two tasks, the same except for how they wait' },
    { at: at('p6'), text: 'LED A (vTaskDelay) drifts · LED B (xTaskDelayUntil) keeps the beat' },
  ] as Caption[],
};

// ── 2. why ─────────────────────────────────────────────────────────────────

export const WHY = {
  follow: at('w1'),
  switches: w('w2', 'switches'),
  works: w('w3', '30'),
  delay: w('w4', 'delay'),
  now: w('w4', 'now'),
  sum: w('w5', '230'),
  not200: w('w5', 'not'),
  adds: w('w6', 'adds'),
  drifts: w('w6', 'drifts'),
  captions: [
    { at: at('w1'), text: 'one loop of LED A' },
    { at: at('w4'), text: 'vTaskDelay counts from when you call it — after the work' },
    { at: at('w5'), text: '30 + 200 = 230 ms per loop' },
    { at: at('w6'), text: 'every loop 30 ms later → the beat drifts' },
  ] as Caption[],
};

// ── 3. answer ──────────────────────────────────────────────────────────────

export const ANSWER = {
  dont: w('a1', 'wait'),
  until: w('a2', 'until'),
  beat: w('a2', 'beat'),
  inside: w('a3', 'inside'),
  stays: w('a3', 'stays'),
  word: w('a4', 'delay'),
  captions: [
    { at: at('a1'), text: 'don\'t wait FOR 200 ms …' },
    { at: at('a2'), text: '… wait UNTIL the next beat on the clock' },
    { at: at('a3'), text: 'the work fits inside the 200 ms → the beat stays put' },
  ] as Caption[],
};

// ── 4. xTaskGetTickCount ──────────────────────────────────────────────────

export const TICK = {
  views: { start: at('g1'), count: at('g2'), store: at('g4') },
  count: w('g2', 'xTask'),
  passed: w('g2', 'passed'),
  ms10: w('g3', '10'),
  store: w('g4', 'store'),
  first: w('g4', 'first'),
  once: w('g5', 'once'),
  before: w('g5', 'before'),
  captions: [
    { at: at('g1'), text: 'first: where does the beat start?' },
    { at: at('g2'), text: 'xTaskGetTickCount() = ticks since the program started · 1 tick = 10 ms' },
    { at: at('g4'), text: 'store it in last = the first beat · once, before the loop' },
  ] as Caption[],
};

// ── 5. xTaskDelayUntil ────────────────────────────────────────────────────

export const UNTIL = {
  intro: { show: at('e0'), out: at('e1') },
  run: w('e1', 'Ex'),
  args: [w('e2', 'address'), w('e3', 'period')],
  views: { last: at('e2'), period: at('e3'), next: at('e4'), apart: at('e7'), zero: at('e8'), old: at('e9') },
  amp: w('e2', 'ampersand'),
  read: w('e2', 'read'),
  change: w('e2', 'change'),
  ms200: w('e3', '200'),
  ticks20: w('e3', '20'),
  next: w('e4', 'next'),
  plus: w('e4', 'plus'),
  waits: w('e5', 'waits'),
  reaches: w('e5', 'reaches'),
  moves: w('e6', 'moves'),
  ready: w('e6', 'ready'),
  always: w('e7', 'always'),
  matter: w('e7', 'matter'),
  whole: w('e8', 'whole'),
  under: w('e8', 'under'),
  zero: w('e8', 'zero'),
  stops: w('e8', 'stops'),
  older: w('e9', 'older'),
  idf: w('e9', 'ESP'),
  use: w('e9', 'use'),
  captions: [
    { at: at('e1'), text: 'xTaskDelayUntil(&last, period)' },
    { at: at('e2'), text: '&last: the call reads the last beat — and moves it on' },
    { at: at('e3'), text: 'the period: 200 ms = 20 ticks' },
    { at: at('e4'), text: 'next beat = last + 20 → wait until then → last = that beat' },
    { at: at('e7'), text: 'beats always 20 ticks apart, however long the work took' },
    { at: at('e8'), text: 'under 10 ms = 0 ticks → the program stops with an error' },
    { at: at('e9'), text: 'vTaskDelayUntil (old) → xTaskDelayUntil in ESP-IDF 6' },
  ] as Caption[],
};
/** the tick count when until_task read it (an example) */
export const LAST0 = 123;

// ── 6. demo ────────────────────────────────────────────────────────────────

export const DEMO = {
  flash: at('d1'),
  together: w('d1', 'together'),
  stays: w('d2', 'stays'),
  drifts: w('d2', 'drifts'),
  after: w('d3', 'After'),
  b50: w('d3', '50'),
  a44: w('d3', '44'),
  same: at('d4'),
  call: w('d4', 'delay'),
  captions: [
    { at: at('d1'), text: 'real time · both start together' },
    { at: at('d2'), text: 'LED B on the beat · LED A drifts' },
    { at: at('d3'), text: 'first 10 s: LED B 50 switches · LED A 44' },
    { at: at('d4'), text: 'same work, same 200 — only the delay call differs' },
  ] as Caption[],
};

// ── 7. running late ────────────────────────────────────────────────────────

export const LATE = {
  views: { lane: at('l1'), check: at('l5') },
  long: w('l1', 'long'),
  job: w('l1', '500'),
  past: w('l2', 'past'),
  noWait: w('l2', 'wait'),
  again: w('l3', 'again'),
  catchUp: w('l3', 'catch'),
  back: w('l4', 'back'),
  six: w('l4', '600'),
  tell: w('l5', 'tell'),
  falseW: w('l5', 'false'),
  warn: w('l6', 'warning'),
  logw: w('l6', 'ESP'),
  captions: [
    { at: at('l1'), text: 'one loop takes 500 ms — longer than two beats' },
    { at: at('l2'), text: 'the next beat is already past → no wait' },
    { at: at('l3'), text: 'it runs again at once, catching up · back on the beat at 600' },
    { at: at('l5'), text: 'returns pdFALSE when it didn\'t wait → log a warning' },
  ] as Caption[],
};

// ── 8. the trap ────────────────────────────────────────────────────────────

export const TRAP = {
  views: { trap: at('t1'), moved: at('t2'), fix: at('t5') },
  mistake: w('t1', 'mistake'),
  move: w('t2', 'Move'),
  inside: w('t2', 'inside'),
  every: w('t3', 'every'),
  after: w('t3', 'after'),
  same: w('t4', 'same'),
  drifts: w('t4', 'drifts'),
  fix: w('t5', 'fix'),
  once: w('t5', 'once'),
  captions: [
    { at: at('t1'), text: 'the trap' },
    { at: at('t2'), text: 'last read after the work → every beat starts from now' },
    { at: at('t4'), text: '= vTaskDelay again → LED B drifts too' },
    { at: at('t5'), text: 'the fix: read the clock once, before the loop' },
  ] as Caption[],
};

// ── 9. payoff ──────────────────────────────────────────────────────────────

export const PAYOFF = {
  line: w('z1', 'while'),
  word: w('z1', 'delay'),
  recap: [
    { at: w('z1', 'delay', 0, 1.2), k: 'vTaskDelay(period)', v: 'waits FOR a time → drifts' },
    { at: w('z1', 'delay', 0, 1.55), k: 'last = xTaskGetTickCount()', v: 'once, before the loop' },
    { at: w('z1', 'delay', 0, 1.9), k: 'xTaskDelayUntil(&last, period)', v: 'waits UNTIL the next beat' },
    { at: w('z1', 'delay', 0, 2.25), k: 'returns pdFALSE', v: 'you were late · it catches up' },
    { at: w('z1', 'delay', 0, 2.6), k: 'next', v: 'two cores' },
  ],
};
