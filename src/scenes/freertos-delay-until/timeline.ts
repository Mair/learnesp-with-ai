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
export const VO_AT: Record<string, number> = {"p1":0.5,"p2":5.96,"p3":11.54,"p4":15.04,"p5":17.34,"p6":20.3,"p7":25.58,"w1":0.5,"w2":3.58,"w3":5.36,"w4":7.4,"w5":12.56,"w6":17.04,"a1":0.5,"a2":2.9,"a3":5.48,"a4":9.72,"g1":0.5,"g2":4.14,"g3":8.9,"g4":11.42,"g5":14.36,"e0":0.5,"e1":2.86,"e2":5.82,"e3":11.76,"e4":17.3,"e5":21.22,"e6":23.68,"e7":27.16,"e8":32.14,"e9":39.7,"d1":0.5,"d2":4.74,"d3":10.28,"d4":17.32,"l1":0.5,"l2":6.54,"l3":11.08,"l4":14.14,"l5":16.98,"l6":21.3,"t1":0.5,"t2":3.08,"t3":6.42,"t4":10.06,"t5":14.58,"z1":0.5};
export const SCENE_DUR: Record<string, number> = {"problem":30.16,"why":22.72,"answer":13.08,"tick":17.42,"until":49.62,"demo":23.7,"late":28.04,"trap":19.26,"payoff":10.64};
export const VO_WORDS: Record<string, [string, number][]> = {
  p1: [["You",0],["want",0.22],["an",0.34],["LED",0.46],["to",0.8],["switch",1.46],["every",1.8],["200",2.42],["milliseconds.",3.06],["A",4.2],["steady",4.34],["beat.",4.54]],
  p2: [["Each",0],["time,",0.28],["the",1],["task",1.16],["also",1.46],["does",1.82],["a",2.06],["little",2.16],["work,",2.26],["say,",3.14],["30",3.74],["milliseconds",4.1],["of",4.54],["it.",4.84]],
  p3: [["Here",0],["are",0.26],["two",0.5],["tasks.",0.76],["They",1.88],["do",1.98],["the",2.08],["same",2.22],["thing.",2.5]],
  p4: [["The",0],["only",0.22],["difference",0.42],["is",0.84],["how",1.12],["they",1.3],["wait.",1.46]],
  p5: [["Start",0],["them",0.34],["together",0.5],["and",0.78],["watch.",1.06]],
  p6: [["At",0],["first,",0.24],["they",0.68],["blink",0.7],["together,",1.06],["but",2.08],["LED",2.14],["A",2.48],["slowly",3.1],["falls",3.8],["behind.",4.22]],
  p7: [["After",0],["a",0.36],["second",0.54],["and",0.74],["a",0.94],["half,",1],["they're",1.66],["opposite.",1.82]],
  w1: [["Let's",0],["follow",0.34],["LEDA",0.58],["for",1.6],["one",2.02],["loop.",2.26]],
  w2: [["It",0],["switches",0.22],["the",0.58],["LED.",0.84]],
  w3: [["It",0],["works",0.24],["for",0.36],["30",0.6],["milliseconds.",1.02]],
  w4: [["Then",0],["VTAS",0.44],["delay",1.08],["waits",1.42],["200",1.84],["milliseconds.",2.7],["Count",3.88],["it",4.08],["from",4.2],["now.",4.3]],
  w5: [["So",0],["one",0.32],["loop",0.58],["takes",0.8],["230",1.1],["milliseconds,",2.06],["not",3.16],["200.",3.42]],
  w6: [["Every",0],["loop",0.36],["adds",0.66],["30",1.44],["milliseconds.",1.98],["The",3.18],["beat",3.28],["drifts.",3.46]],
  a1: [["So",0],["don't",0.26],["wait",0.52],["for",0.66],["200",0.96],["milliseconds.",1.36]],
  a2: [["Wait",0],["until",0.36],["the",0.6],["next",0.76],["beat",1],["on",1.3],["the",1.62],["clock.",1.74]],
  a3: [["The",0],["work",0.22],["happens",0.42],["inside",0.86],["the",1.3],["200,",1.48],["so",2.38],["the",2.64],["beat",2.78],["stays",2.98],["put.",3.32]],
  a4: [["That's",0],["called",0.32],["delay",0.46],["until.",0.8]],
  g1: [["First,",0],["the",0.92],["task",1.04],["needs",1.42],["to",1.68],["know",1.88],["where",2.08],["the",2.36],["beat",2.48],["starts.",2.66]],
  g2: [["xTask",0],["Get",0.58],["Tick",0.94],["Count",1.14],["tells",1.42],["you",1.7],["how",1.86],["many",2.06],["ticks",2.34],["have",2.58],["passed",2.78],["since",3.14],["the",3.38],["program",3.52],["started.",3.7]],
  g3: [["One",0],["tick",0.46],["is",0.76],["10",1.14],["milliseconds.",1.48]],
  g4: [["We",0],["store",0.22],["in",0.5],["last.",0.62],["That's",1.54],["our",1.7],["first",1.8],["beat.",2.04]],
  g5: [["Do",0],["this",0.26],["once",0.44],["before",0.78],["the",1.18],["loop.",1.36]],
  e0: [["Now",0],["the",0.3],["delay",0.46],["at",0.72],["the",1.06],["end",1.2],["of",1.42],["the",1.54],["loop.",1.6]],
  e1: [["Ex",0],["-task",0.28],["delay",0.54],["until",0.94],["takes",1.52],["two",1.76],["things.",2.02]],
  e2: [["First",0],["the",0.46],["address",0.76],["of",1.1],["last",1.3],["the",1.62],["ampersand",2.34],["lets",2.98],["the",3.3],["call",3.48],["read",3.7],["it",3.98],["and",4.48],["change",4.74],["it",5.04]],
  e3: [["Second",0],["the",0.52],["period",1.12],["200",1.62],["milliseconds,",2.56],["which",3.08],["is",3.72],["20",3.88],["ticks",4.24]],
  e4: [["The",0],["call",0.22],["works",0.38],["out",0.62],["the",0.78],["next",0.9],["beat.",1.14],["Last",2.24],["plus",2.36],["20",2.7],["ticks.",3.08]],
  e5: [["It",0],["waits",0.24],["until",0.44],["the",0.7],["tick",0.84],["count",0.98],["reaches",1.28],["it.",1.6]],
  e6: [["Then",0],["it",0.22],["moves",0.3],["last",0.48],["onto",0.84],["that",1.16],["beat,",1.4],["ready",2.06],["for",2.2],["the",2.38],["next",2.48],["loop.",2.64]],
  e7: [["So",0],["the",0.24],["beats",0.36],["are",0.58],["always",0.84],["20",1.24],["ticks",1.6],["apart,",1.82],["no",2.58],["matter",2.72],["how",2.9],["long",3.14],["the",3.4],["work",3.54],["took.",3.72]],
  e8: [["Periods",0],["are",0.48],["whole",0.52],["ticks.",0.76],["Anything",1.7],["under",1.92],["10",2.26],["milliseconds",2.5],["is",2.94],["zero",3.54],["ticks,",3.98],["and",5.02],["the",5.12],["program",5.22],["stops",5.56],["with",5.98],["an",6.24],["error.",6.36]],
  e9: [["You",0],["may",0.22],["see",0.32],["V",0.58],["-TAS",0.78],["delay",1.12],["until",1.46],["in",2.02],["older",2.18],["examples.",2.44],["In",3.64],["ESP",3.68],["-ID",4.04],["-F6,",4.98],["use",6.46],["X",6.58],["-TAS",6.94],["delay",7.28],["until...",7.56]],
  d1: [["Flash",0],["it.",0.44],["Both",1.16],["LEDs",1.3],["start",1.8],["together.",2.46]],
  d2: [["LED",0],["-B",0.5],["stays",0.74],["on",0.98],["a",1.22],["beat.",1.3],["LED",2.18],["-A",2.4],["drifts.",2.72]],
  d3: [["After",0],["10",0.36],["seconds,",0.64],["LED",1.74],["B",1.96],["has",2.38],["switched",2.66],["50",3.08],["times.",3.68],["LED",4.92],["A",4.96],["only",5.56],["44.",5.92]],
  d4: [["Same",0],["work,",0.38],["same",1.14],["200.",1.3],["Only",2.3],["the",2.48],["delay",2.62],["call",2.84],["is",3.2],["different.",3.54]],
  l1: [["What",0],["if",0.22],["one",0.32],["loop",0.52],["takes",0.86],["too",1.24],["long?",1.5],["Suppose",2.54],["the",2.58],["job",2.84],["takes",3.1],["500",3.48],["milliseconds",4.22],["just",4.7],["once.",5.08]],
  l2: [["The",0],["next",0.22],["beat",0.38],["is",0.62],["already",1.08],["in",1.46],["the",1.68],["past,",1.78],["so",2.48],["the",2.78],["call",2.88],["doesn't",3.08],["wait",3.48],["at",3.64],["all.",3.74]],
  l3: [["It",0],["runs",0.26],["again",0.54],["straight",0.86],["away",1.2],["to",1.52],["catch",1.96],["up.",2.16]],
  l4: [["Then",0],["it's",0.22],["back",0.36],["on",0.5],["the",0.68],["beat",0.78],["at",1.04],["600.",1.48]],
  l5: [["You",0],["can",0.22],["tell",0.34],["when",0.56],["this",0.78],["happens.",0.9],["The",1.86],["call",2],["returns",2.16],["false",2.58],["when",2.94],["it",3.22],["didn't",3.32],["wait.",3.58]],
  l6: [["Here",0],["we",0.22],["print",0.34],["a",0.48],["warning",0.62],["with",0.94],["ESP",1.34],["log",2.06],["W,",2.56],["the",3.44],["warning",3.56],["version",3.8],["of",4.1],["log",4.28],["I.",4.46]],
  t1: [["Here's",0],["a",0.32],["mistake",0.36],["that's",0.72],["easy",1.2],["to",1.48],["make.",1.72]],
  t2: [["Move",0],["the",0.28],["line",0.46],["that",0.7],["reads",0.9],["the",1.26],["clock",1.5],["inside",1.84],["the",2.34],["loop.",2.56]],
  t3: [["Now,",0],["every",0.44],["loop",0.72],["starts",0.96],["its",1.26],["beat",1.46],["from",1.64],["now,",1.84],["after",2.44],["the",2.68],["work.",2.82]],
  t4: [["That's",0],["the",0.34],["same",0.44],["as",0.76],["V",1.28],["-task",1.6],["delay.",1.92],["LED",2.86],["-B",3.1],["drifts",3.32],["too.",3.64]],
  t5: [["To",0],["fix,",0.22],["read",0.92],["the",1.18],["clock",1.34],["once",1.58],["before",1.94],["the",2.34],["loop.",2.52]],
  z1: [["Wait",0],["until",0.26],["the",0.44],["next",0.56],["beat.",0.72],["Not",1.64],["for",1.7],["a",1.88],["while.",2],["That's",2.8],["delay",3.02],["until...",3.26]],
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
  // 1 · problem
  L('p1', 'problem', 'You want an LED to switch every 200 milliseconds. A steady beat.', 'You want an LED to switch every two hundred milliseconds. A steady beat.'),
  L('p2', 'problem', 'Each time, the task also does a little work. Say, 30 milliseconds of it.', 'Each time, the task also does a little work. Say, thirty milliseconds of it.'),
  L('p3', 'problem', 'Here are two tasks. They do the same thing.'),
  L('p4', 'problem', 'The only difference is how they wait.'),
  L('p5', 'problem', 'Start them together, and watch.'),
  L('p6', 'problem', 'At first they blink together. But LED A slowly falls behind.', 'At first they blink together. But LED A, slowly, falls behind.', 1.6),
  L('p7', 'problem', "After a second and a half, they're opposite."),

  // 2 · why
  L('w1', 'why', "Let's follow LED A for one loop."),
  L('w2', 'why', 'It switches the LED.'),
  L('w3', 'why', 'It works for 30 milliseconds.', 'It works for thirty milliseconds.'),
  L('w4', 'why', 'Then vTaskDelay waits 200 milliseconds. Counted from now.', `Then ${VTD} waits two hundred milliseconds. Counted from now.`),
  L('w5', 'why', 'So one loop takes 230 milliseconds, not 200.', 'So one loop takes two hundred and thirty milliseconds, not two hundred.'),
  L('w6', 'why', 'Every loop adds 30 milliseconds. The beat drifts.', 'Every loop adds thirty milliseconds. The beat drifts.'),

  // 3 · answer
  L('a1', 'answer', "So don't wait for 200 milliseconds.", "So don't wait for two hundred milliseconds."),
  L('a2', 'answer', 'Wait until the next beat on the clock.'),
  L('a3', 'answer', 'The work happens inside the 200, so the beat stays put.', 'The work happens inside the two hundred, so the beat stays put.'),
  L('a4', 'answer', "That's called delay until."),

  // 4 · xTaskGetTickCount
  L('g1', 'tick', 'First, the task needs to know where the beat starts.'),
  L('g2', 'tick', 'xTaskGetTickCount tells you how many ticks have passed since the program started.', 'X task get tick count tells you how many ticks have passed since the program started.'),
  L('g3', 'tick', 'One tick is 10 milliseconds.', 'One tick is ten milliseconds.'),
  L('g4', 'tick', "We store it in last. That's our first beat."),
  L('g5', 'tick', 'Do this once, before the loop.'),

  // 5 · xTaskDelayUntil
  L('e0', 'until', 'Now the delay at the end of the loop.'),
  L('e1', 'until', 'xTaskDelayUntil takes two things.', `${XTDU} takes two things.`),
  L('e2', 'until', 'First, the address of last. The ampersand lets the call read it, and change it.'),
  L('e3', 'until', 'Second, the period: 200 milliseconds, which is 20 ticks.', 'Second, the period: two hundred milliseconds, which is twenty ticks.'),
  L('e4', 'until', 'The call works out the next beat: last, plus 20 ticks.', 'The call works out the next beat: last, plus twenty ticks.', 1.0),
  L('e5', 'until', 'It waits until the tick count reaches it.'),
  L('e6', 'until', 'Then it moves last on to that beat, ready for the next loop.'),
  L('e7', 'until', 'So the beats are always 20 ticks apart, no matter how long the work took.', 'So the beats are always twenty ticks apart, no matter how long the work took.'),
  L('e8', 'until', 'Periods are whole ticks. Anything under 10 milliseconds is zero ticks, and the program stops with an error.', 'Periods are whole ticks. Anything under ten milliseconds is zero ticks, and the program stops with an error.', 1.0),
  L('e9', 'until', 'You may see vTaskDelayUntil in older examples. In ESP-IDF 6, use xTaskDelayUntil.', `You may see V task delay until in older examples. In E S P I D F six, use ${XTDU}.`, 1.0),

  // 6 · demo
  L('d1', 'demo', 'Flash it. Both LEDs start together.'),
  L('d2', 'demo', 'LED B stays on the beat. LED A drifts.', undefined, 1.4),
  L('d3', 'demo', 'After 10 seconds, LED B has switched 50 times. LED A, only 44.', 'After ten seconds, LED B has switched fifty times. LED A, only forty-four.', 2.4),
  L('d4', 'demo', 'Same work, same 200. Only the delay call is different.', 'Same work, same two hundred. Only the delay call is different.'),

  // 7 · running late
  L('l1', 'late', 'What if one loop takes too long? Suppose the job takes 500 milliseconds, just once.', 'What if one loop takes too long? Suppose the job takes five hundred milliseconds, just once.'),
  L('l2', 'late', "The next beat is already in the past. So the call doesn't wait at all."),
  L('l3', 'late', 'It runs again straight away, to catch up.'),
  L('l4', 'late', "Then it's back on the beat, at 600.", "Then it's back on the beat, at six hundred."),
  L('l5', 'late', "You can tell when this happens. The call returns false when it didn't wait.", undefined, 1.0),
  L('l6', 'late', 'Here we print a warning with ESP_LOGW, the warning version of log I.', 'Here we print a warning with E S P log W, the warning version of log I.'),

  // 8 · the trap
  L('t1', 'trap', "Here's a mistake that's easy to make."),
  L('t2', 'trap', 'Move the line that reads the clock inside the loop.'),
  L('t3', 'trap', 'Now every loop starts its beat from now, after the work.'),
  L('t4', 'trap', "That's the same as vTaskDelay. LED B drifts too.", `That's the same as ${VTD}. LED B drifts too.`),
  L('t5', 'trap', 'The fix: read the clock once, before the loop.'),

  // 9 · payoff
  L('z1', 'payoff', "Wait until the next beat, not for a while. That's delay until."),
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
