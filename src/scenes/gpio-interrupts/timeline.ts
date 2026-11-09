/**
 * GPIO interrupts — the timeline. Single source of truth for picture AND sound.
 * PURE ESP-IDF: gpio_config, gpio_install_isr_service, gpio_isr_handler_add,
 * FreeRTOS queue + FromISR. No Arduino.
 *
 *   problem (polling's cost) → answer (INTERRUPT) → gpio_config → gpio_install_isr_service
 *     → gpio_isr_handler_add → the ISR → the queue → demo → bounce → second knob
 *     (trigger types) → under the hood → payoff
 *
 * Every time is SCENE-RELATIVE. Cue = vo.at + word offset (Whisper word
 * timestamps, `npm run vo -- gpio-interrupts`), noted inline as `// "word"`.
 * Import-free on purpose (type-only imports are erased): Node runs it as-is.
 * Every claim on screen or in the VO is sourced in ./FACTS.md.
 */
import type { Caption, Mark } from '../../components/pwm';

export type IrqSceneId = 'problem' | 'answer' | 'config' | 'service' | 'handler' | 'isr' | 'queue' | 'demo' | 'bounce' | 'types' | 'payoff';
export type SceneId = IrqSceneId;

export const FPS = 30;

// ── generated: VO plan (node scripts/vo-plan.ts gpio-interrupts) — do not edit by hand ──
export const VO_AT: Record<string, number> = {"p1":0.6,"p2":6.68,"p3":17.36,"p4":27.24,"a1":0.5,"a2":10.58,"f1":0.5,"f2":8.86,"f3":21.38,"f4":29.06,"f5":41,"v1":0.5,"v2":12.98,"v3":23.92,"h1":0.5,"h2":10.08,"h3":18.28,"n1":0.5,"n2":7.04,"n3":17.52,"n4":26.02,"n5":35.42,"n6":46.52,"w1":0.5,"w2":7.44,"w3":14.22,"d1":0.5,"d2":11.06,"d3":18.54,"b1":0.5,"b2":7.48,"b3":13.46,"b4":22.44,"k1":0.5,"k2":12.38,"k3":21.22,"x1":0.5};
export const SCENE_DUR: Record<string, number> = {"problem":32.86,"answer":16.46,"config":50.58,"service":31.84,"handler":28.34,"isr":57.74,"queue":25.58,"demo":25.5,"bounce":33.14,"types":34.74,"payoff":9.8};
export const VO_WORDS: Record<string, [string, number][]> = {
  p1: [["Let's",0],["say",0.3],["you",0.38],["want",0.46],["your",0.56],["program",0.68],["to",1.12],["react",1.6],["the",1.96],["instant",2.2],["someone",2.5],["presses",2.88],["a",3.2],["button",3.42],["without",3.7],["watching",4.5],["it",4.92],["all",5.02],["the",5.12],["time.",5.24]],
  p2: [["The",0],["first",0.24],["try",0.48],["from",0.88],["the",1.34],["GPIO",1.48],["input",1.94],["video",2.34],["is",2.82],["a",3.42],["loop",3.56],["that",3.68],["reads",3.92],["the",4.28],["button",4.5],["100",4.8],["times",5.44],["a",5.74],["second.",5.94],["Almost",6.8],["every",6.94],["read",7.42],["says",7.82],["the",8.1],["same",8.3],["thing,",8.52],["not",9.26],["pressed.",9.54]],
  p3: [["That's",0],["360",0.42],[",000",1.18],["reads",1.86],["an",2.04],["hour,",2.22],["just",2.68],["in",2.96],["case,",3.12],["and",3.92],["a",4.14],["pulse",4.26],["shorter",4.52],["than",4.94],["one",5.18],["tick",5.5],["can",5.86],["slip",6.3],["between",6.64],["two",7],["reads",7.32],["and",7.82],["never",8.38],["be",8.6],["seen.",8.78]],
  p4: [["So",0],["what",0.26],["if",0.4],["the",0.5],["pin",0.6],["itself",0.82],["could",1.18],["tell",1.62],["you",1.88],["when",2.1],["something",2.42],["happens?",2.7]],
  a1: [["Well,",0],["it",0.44],["can.",0.44],["The",1.18],["GPIO",1.3],["hardware",1.76],["watches",2.36],["the",2.92],["pin",3.14],["for",3.38],["an",3.66],["edge,",3.84],["and",4.64],["when",4.9],["it",5.02],["sees",5.14],["one,",5.36],["it",6.18],["interrupts",6.32],["the",6.64],["CPU",6.9],["and",7.26],["runs",8.2],["a",8.4],["function",8.6],["you",8.8],["gave",9.02],["it.",9.18]],
  a2: [["and",0],["the",0.24],["CPU",0.34],["goes",0.64],["back",1.04],["to",1.38],["what",1.58],["it",1.68],["was",1.76],["doing.",1.86],["That's",2.64],["called",2.82],["an",2.98],["interrupt.",3.14]],
  f1: [["This",0],["time,",0.28],["you",0.94],["set",1.26],["the",1.4],["pin",1.52],["up",1.64],["with",1.82],["GPIO",1.98],["config.",2.58],["It",3.64],["takes",3.72],["one",3.9],["struct",4.18],["and",4.56],["configures",5.04],["every",5.72],["pin",6.2],["in",6.62],["its",6.78],["mask",6.9],["at",7.22],["once.",7.4]],
  f2: [["The",0],["mask",0.24],["is",0.5],["1",0.68],["bit",0.9],["per",1.08],["GPIO,",1.3],["1,",2.4],["shifted",2.96],["left",3.2],["by",3.48],["18,",3.66],["sets",4.46],["bit",4.72],["18.",4.94],["It's",6.02],["a",6.18],["64",6.28],["-bit",6.78],["value",7],["because",7.4],["the",7.86],["pins",8.06],["go",8.36],["up",8.56],["to",8.72],["39,",8.86],["so",9.74],["you",10],["write",10.1],["the",10.3],["1",10.42],["as",10.58],["1,",10.72],["ULL.",11.4]],
  f3: [["The",0],["mode",0.22],["and",0.42],["the",0.56],["pulls",0.66],["are",0.86],["the",1.06],["same",1.18],["as",1.52],["in",1.94],["the",2.04],["GPIO",2.18],["input",2.66],["video.",3.04],["An",3.96],["input",4.14],["with",4.54],["the",4.98],["pull",5.1],["up",5.24],["on",5.4],["and",5.72],["the",6.1],["pull",6.2],["down",6.4],["off.",6.64]],
  f4: [["The",0],["new",0.24],["field",0.42],["is",0.88],["the",1.38],["interrupt",1.52],["type.",1.82],["GPIO",2.84],["interrupt",3.2],["neg",3.88],["edge",4.64],["fires",5.2],["on",5.9],["a",6.14],["falling",6.24],["edge",6.6],["from",7.08],["one",7.5],["to",7.74],["zero.",7.94],["With",8.74],["a",8.92],["pull",9.02],["up,",9.16],["that's",9.68],["the",9.92],["moment",10.06],["the",10.22],["button",10.44],["goes",10.62],["down.",10.88]],
  f5: [["Wrap",0],["it",0.32],["in",0.46],["ESP",0.68],["error",1.16],["check",1.58],["because",1.94],["an",2.38],["empty",2.54],["mask",2.86],["or",3.3],["a",3.64],["pin",3.76],["that",3.98],["doesn't",4.2],["exist",4.54],["returns",4.96],["ESP",5.74],["error",6.46],["invalid",6.94],["art.",7.28]],
  v1: [["Next",0],["comes",0.32],["GPIO",0.56],["install",1.14],["is",1.54],["our",1.98],["service.",2.28],["All",3.38],["the",3.46],["GPIO",3.6],["pins",4.04],["share",4.6],["one",5.16],["interrupt",5.72],["on",6.2],["the",6.44],["CPU",6.58],["and",6.98],["this",7.7],["call",7.82],["installs",8.04],["the",8.52],["driver's",8.76],["handler",9.24],["for",9.46],["it",9.72],["which",9.92],["then",10.24],["calls",10.44],["a",10.66],["function",10.8],["for",11.04],["each",11.34],["pin.",11.48]],
  v2: [["The",0],["argument",0.22],["is",0.52],["a",0.92],["set",1.06],["of",1.2],["flags.",1.34],["Zero",2.64],["picks",2.7],["the",2.96],["defaults.",3.14],["A",4.18],["low",4.28],["or",4.52],["medium",4.7],["priority",5.04],["interrupt.",5.54],["Written",6.68],["in",6.84],["C.",7.06],["That",8],["waits",8.28],["while",8.54],["the",8.76],["flash",8.9],["is",9.3],["being",9.76],["written.",9.94]],
  v3: [["Install",0],["it",0.5],["only",0.68],["once",0.92],["because",1.52],["a",2.08],["second",2.22],["call",2.48],["returns",2.76],["ESP",3.28],["error",4.2],["in",4.98],["valid",5.32],["state",5.56]],
  h1: [["Then",0],["GPIOIS,",0.38],["our",1.74],["handler",1.88],["ad",2.26],["hooks",2.56],["your",2.78],["function",2.98],["to",3.28],["one",3.64],["pin.",3.88],["It",4.6],["takes",4.7],["three",4.94],["arguments,",5.38],["the",6.54],["pin,",6.64],["the",7.38],["function,",7.46],["and",8.32],["an",8.56],["argument.",8.62]],
  h2: [["The",0],["argument",0.24],["is",0.52],["handed",0.88],["back",1.24],["to",1.66],["your",1.82],["function",1.94],["every",2.34],["time",2.88],["it",3.14],["runs.",3.26],["Here",4.16],["it's",4.22],["the",4.36],["pin",4.46],["number,",4.64],["so",5.22],["one",5.56],["function",5.9],["can",6.32],["serve",6.58],["several",6.92],["buttons.",7.24]],
  h3: [["It",0],["also",0.22],["switches",0.48],["the",0.86],["pins",1.14],["interrupt",1.54],["on.",1.96],["If",2.8],["you",2.9],["call",2.98],["it",3.18],["before",3.3],["installing",3.54],["the",3.98],["service,",4.14],["it",4.96],["returns",5.1],["ESP",5.5],["error",6.48],["invalid",7.1],["state.",7.6]],
  n1: [["Now",0],["for",0.28],["the",0.44],["function",0.62],["itself.",0.88],["It",1.94],["runs",2.08],["inside",2.34],["the",2.9],["interrupt,",3.08],["not",3.96],["in",4.16],["a",4.3],["task,",4.4],["so",5],["the",5.2],["rules",5.34],["change.",5.58]],
  n2: [["It",0],["can't",0.22],["wait,",0.5],["so",1.04],["nothing",1.3],["that",1.56],["blocks",1.82],["is",2.16],["allowed.",2.38],["No",3.38],["vTaskDelay",3.52],["and",4.92],["no",5.22],["xQReceive.",5.44],["And",6.74],["no",6.86],["logging",7.04],["calls",7.36],["either,",7.7],["because",8.38],["logging",8.7],["is",9.06],["for",9.26],["tasks.",9.4]],
  n3: [["It",0],["runs",0.24],["on",0.46],["a",0.62],["small",0.72],["stack",1.06],["of",1.42],["its",1.58],["own,",1.7],["1536",2.46],["bytes",3.32],["by",3.88],["default.",4.12],["So",5],["keep",5.16],["it",5.36],["short,",5.52],["do",6.26],["the",6.54],["minimum,",6.7],["and",7.3],["get",7.48],["out.",7.58]],
  n4: [["To",0],["pass",0.2],["the",0.42],["news",0.58],["on,",0.76],["use",1.4],["a",1.62],["function",1.8],["whose",2.02],["name",2.34],["ends",2.6],["in",3],["from",3.46],["ISR.",3.72],["Here,",5.14],["XQSan",5.68],["from",6.12],["ISR",6.3],["copies",7.02],["the",7.32],["pin",7.6],["number",7.82],["into",8.06],["a",8.36],["queue.",8.52]],
  n5: [["If",0],["that",0.24],["wakes",0.42],["a",0.62],["task,",0.82],["Woken",1.74],["comes",1.9],["back",2.26],["true,",2.6],["and",3.52],["Port",3.66],["Yield",3.88],["from",4.14],["I",4.26],[".S.",4.44],["are",4.78],["switches",4.9],["to",5.28],["it",5.64],["as",5.84],["the",6.22],["interrupt",6.34],["ends.",6.66],["If",7.7],["you",7.82],["leave",7.94],["it",8.1],["out,",8.2],["the",8.78],["task",8.86],["can",9.12],["wait",9.3],["until",9.6],["the",9.9],["next",10.02],["tick.",10.2]],
  n6: [["Espressif's",0],["example",0.78],["marks",1.16],["its",1.62],["function",1.9],["with",2.42],["the",2.88],["iram",3],["attribute",3.58],["to",4.08],["keep",4.6],["it",4.78],["an",4.88],["internal",4.96],["RAM,",5.3],["but",5.8],["with",6.18],["flags",6.3],["of",6.62],["zero,",6.78],["the",7.54],["driver",7.78],["says",8.06],["you",8.34],["don't",8.52],["need",8.78],["to.",8.96]],
  w1: [["The",0],["queue",0.24],["joins",0.48],["the",1],["two",1.22],["worlds.",1.44],["XQCreate",2.56],["makes",3.08],["room",3.36],["for",3.66],["10",3.96],["pin",4.3],["numbers",4.6],["for",4.98],["bytes",5.58],["each.",5.86]],
  w2: [["In",0],["App",0.26],["main,",0.44],["the",1.16],["loop",1.3],["calls",1.46],["xqreceive",1.86],["with",2.8],["port",3.06],["max",3.36],["delay,",3.62],["which",4.5],["means",4.64],["wait",4.84],["for",5.12],["as",5.32],["long",5.42],["as",5.6],["it",5.74],["takes.",5.82]],
  w3: [["With",0],["that",0.28],["delay,",0.46],["free",1.32],["RTOS",1.52],["parks",2.04],["the",2.38],["task",2.58],["on",3],["its",3.38],["suspended",3.52],["list",3.86],["where",4.32],["nothing",4.82],["wakes",5.12],["it",5.4],["on",5.54],["a",5.64],["timer.",5.74],["So",6.48],["the",6.64],["task",6.74],["costs",7.02],["nothing",7.52],["until",8],["a",8.58],["press",8.7],["arrives.",8.86]],
  d1: [["Now",0],["press",0.28],["the",0.52],["button.",0.72],["The",1.48],["GPIO",1.52],["hardware",1.98],["notices",2.58],["the",3.1],["falling",3.38],["edge",3.74],["and",4.24],["interrupts",4.66],["the",5.14],["CPU,",5.42],["which",6.32],["jumps",6.56],["to",6.82],["the",7.02],["driver's",7.12],["handler",7.52],["and",7.84],["the",8.36],["handler",8.46],["calls",8.68],["button",9],["ISR.",9.26]],
  d2: [["Button",0],["IS",0.34],["or",0.68],["drops",0.96],["18",1.28],["into",1.88],["the",2.16],["queue",2.26],["and",2.58],["returns.",3.06],["Then",4.2],["the",4.28],["waiting",4.38],["task",4.58],["wakes",5],["up",5.22],["and",5.56],["logs",5.96],["the",6.3],["press.",6.5]],
  d3: [["Polling",0],["woke",0.48],["up",0.64],["a",0.84],["hundred",0.94],["times",1.08],["a",1.4],["second,",1.58],["but",2.22],["this",2.48],["wakes",2.68],["up",2.9],["just",3.18],["once",3.44],["per",3.78],["press.",4.02]],
  b1: [["But",0],["remember",0.22],["the",0.42],["bounce.",0.56],["One",1.5],["press",1.78],["can",2.14],["make",2.58],["several",2.76],["falling",3.26],["edges,",3.68],["and",4.48],["every",4.78],["one",5.1],["of",5.3],["them",5.4],["is",5.6],["an",5.92],["interrupt.",6.02]],
  b2: [["So,",0],["one",0.36],["press",0.52],["logs,",0.76],["five",1.32],["presses.",1.64],["Even",2.74],["letting",2.84],["go",2.98],["can",3.24],["bounce",3.42],["through",3.92],["a",4.36],["falling",4.52],["edge.",4.82]],
  b3: [["The",0],["fix",0.22],["lives",0.4],["in",0.76],["the",0.96],["task.",1.04],["After",2],["the",2.1],["first",2.24],["event,",2.46],["it",3.24],["waits",3.34],["30",3.56],["milliseconds",4.06],["and",4.5],["then",5.26],["throws",5.44],["the",5.94],["extra",6.2],["events",6.58],["away",6.86],["with",7.18],["XQ",7.5],["Reset.",8.06]],
  b4: [["it",0],["reads",0.22],["the",0.54],["pin",0.74],["once.",0.94],["If",1.94],["it's",2.02],["still",2.22],["zero,",2.4],["that",3.3],["was",3.4],["a",3.5],["press.",3.64],["So",4.62],["one",4.82],["press",5.12],["gives",5.44],["one",5.72],["count,",6.06],["and",6.9],["the",6.98],["CPU",7.1],["sleeps",7.46],["in",7.96],["between.",8.2]],
  k1: [["The",0],["interrupt",0.26],["type",0.54],["is",0.94],["the",1.42],["second",1.54],["knob.",1.88],["Negative",2.94],["edge",2.96],["catches",3.3],["the",3.78],["press,",4],["positive",4.9],["edge",5.16],["catches",5.58],["the",6.08],["release,",6.26],["and",7.28],["any",7.52],["edge",7.92],["catches",8.26],["both.",8.68],["So",9.7],["you",9.72],["read",9.86],["the",10.08],["level",10.24],["to",10.44],["tell",10.6],["them",10.76],["apart.",10.88]],
  k2: [["The",0],["level",0.24],["types",0.42],["are",0.68],["different.",0.84],["Low",1.84],["level",1.88],["keeps",2.12],["firing",2.42],["for",2.9],["as",3.2],["long",3.34],["as",3.6],["the",3.8],["pin",3.9],["stays",4.1],["low.",4.36],["So",5.26],["a",5.54],["held",5.84],["button",6.04],["interrupts",6.44],["again",6.8],["and",7.24],["again.",7.86]],
  k3: [["Levels",0],["are",0.34],["meant",0.5],["for",0.74],["waking",0.96],["the",1.2],["chip",1.44],["from",1.7],["light",2.14],["sleep,",2.36],["and",3.32],["GPIO",3.38],["wake",3.84],["up",4.1],["enable",4.32],["only",4.7],["accepts",5.22],["the",5.64],["two",5.9],["level",6.1],["types.",6.28],["Give",7.14],["an",7.36],["edge",7.52],["and",7.9],["it",8.42],["returns",8.48],["ESP",8.88],["error",9.86],["invalid",10.5],["arg.",11.14]],
  x1: [["So",0],["don't",0.26],["keep",0.46],["asking",0.58],["the",0.88],["pin.",1.04],["Let",1.7],["the",1.82],["pin",1.94],["tell",2.14],["you.",2.38],["That's",3.06],["an",3.26],["interrupt.",3.34]],
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

export const TAIL: Record<string, number> = { problem: 2.6, answer: 2.4, config: 2.0, service: 2.0, handler: 2.0, isr: 2.0, queue: 2.0, demo: 2.6, bounce: 2.2, types: 2.0, payoff: 5.6 };
const dur = (id: string, fallback: number) => SCENE_DUR[id] ?? fallback;
export const SCENES: { id: IrqSceneId; dur: number }[] = (
  [
    ['problem', 24.62],
    ['answer', 16.0],
    ['config', 50.68],
    ['service', 30.1],
    ['handler', 27.1],
    ['isr', 55.1],
    ['queue', 25.6],
    ['demo', 23.4],
    ['bounce', 31.2],
    ['types', 28.8],
    ['payoff', 9.6],
  ] as [IrqSceneId, number][]
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
export const IRQ_FRAMES = Math.round(SECONDS * FPS);

// ── shared numbers (FACTS.md) ──────────────────────────────────────────────

export const BTN = 18;
export const TICK_MS = 10;
export const READS_PER_HOUR = 100 * 3600; // 360 000
export const ISR_STACK = 1536; // CONFIG_FREERTOS_ISR_STACKSIZE default
export const QUEUE_LEN = 10;
export const SETTLE_MS = 30; // pdMS_TO_TICKS(30) = 3 ticks

/** the program, as shown in the code panels */
export const ISR_CODE = [
  'static void button_isr(void *arg)',
  '{',
  '    uint32_t pin = (uint32_t) arg;',
  '    BaseType_t woken = pdFALSE;',
  '    xQueueSendFromISR(button_events, &pin, &woken);',
  '    portYIELD_FROM_ISR(woken);',
  '}',
];
export const CONFIG_CODE = [
  'gpio_config_t io = {',
  '    .pin_bit_mask = 1ULL << BUTTON,',
  '    .mode         = GPIO_MODE_INPUT,',
  '    .pull_up_en   = GPIO_PULLUP_ENABLE,',
  '    .pull_down_en = GPIO_PULLDOWN_DISABLE,',
  '    .intr_type    = GPIO_INTR_NEGEDGE,',
  '};',
  'ESP_ERROR_CHECK(gpio_config(&io));',
];
export const LOOP_CODE = [
  'int presses = 0;',
  'uint32_t pin;',
  'while (1) {',
  '    xQueueReceive(button_events, &pin, portMAX_DELAY);',
  '    vTaskDelay(pdMS_TO_TICKS(30));   // let the bounce settle',
  '    xQueueReset(button_events);       // drop the extra edges',
  '    if (gpio_get_level(BUTTON) == 0) {',
  '        presses++;',
  '        ESP_LOGI(TAG, "presses: %d", presses);',
  '    }',
  '}',
];

/** the bounce from the input video (ms from first contact): LOW stretches */
export const BOUNCE_LOWS: [number, number][] = [
  [0, 0.25],
  [0.45, 0.8],
  [1.0, 1.15],
  [1.35, 1.55],
  [1.62, 99],
];
export const bounceLow = (ms: number) => BOUNCE_LOWS.some(([a, b]) => ms >= a && ms < b);
/** falling edges in the press bounce (one interrupt each) */
export const PRESS_FALLS = BOUNCE_LOWS.map(([a]) => a);
/** the release bounce: HIGH stretches after letting go; it falls back once in between */
export const RELEASE_HIGHS: [number, number][] = [
  [0, 0.4],
  [0.7, 99],
];

// ── 1. problem ─────────────────────────────────────────────────────────────

export const PROBLEM = {
  codeIn: w('p2', 'input'),
  hundred: w('p2', 'times', 0, -0.6),
  same: w('p2', 'same'),
  notPressed: w('p2', 'not'),
  hour: w('p3', 'That', 0, 0.5),
  justInCase: w('p3', 'just'),
  pulse: w('p3', 'pulse'),
  slip: w('p3', 'slip'),
  never: w('p3', 'never'),
  question: at('p4'),
};

// ── 2. answer ──────────────────────────────────────────────────────────────

export const ANSWER = {
  watches: w('a1', 'watches'),
  edge: w('a1', 'edge'),
  interrupts: w('a1', 'interrupts'),
  runs: w('a1', 'runs'),
  back: w('a2', 'back'),
  word: w('a2', 'interrupt'),
};

// ── 3. gpio_config ─────────────────────────────────────────────────────────

/** QEMU, lab/logs/v1–v4.log */
export const LOG_MASK = 'E (2069) gpio: GPIO_PIN mask error';
export const LOG_TWICE = 'E (2491) gpio: gpio_install_isr_service(537): GPIO isr service already installed';
export const LOG_ORDER = 'E (2194) gpio: gpio_isr_handler_add(564): GPIO isr service is not installed, call gpio_install_isr_service() first';
export const LOG_WAKE = 'E (2130) gpio: GPIO wakeup only supports level mode, but edge mode set. gpio_num:18';

export const CONFIG = {
  views: { struct: at('f1'), mask: at('f2'), fields: at('f3'), intr: at('f4'), errors: at('f5') },
  struct: {
    one: w('f1', 'one'),
    every: w('f1', 'every'),
  },
  mask: {
    bit: w('f2', 'bit'),
    shift: w('f2', 'shifted'),
    b18: w('f2', 'sets'),
    sixty4: w('f2', 'value', 0, -1.0),
    to39: w('f2', 'up'),
    ull: w('f2', 'write'),
  },
  fields: {
    input: w('f3', 'input', 1),
    up: w('f3', 'pull'),
    down: w('f3', 'pull', 1),
  },
  intr: {
    type: w('f4', 'type'),
    neg: w('f4', 'type', 0, 0.8),
    falling: w('f4', 'falling'),
    oneToZero: w('f4', 'from'),
    down: w('f4', 'down'),
  },
  errors: {
    wrap: w('f5', 'Wrap', 0, 0.8),
    empty: w('f5', 'empty'),
    exist: w('f5', 'exist'),
    ret: w('f5', 'returns'),
  },
  captions: [
    { at: at('f1'), text: 'gpio_config(&io): one struct configures every pin in pin_bit_mask' },
    { at: at('f2'), text: '1ULL << 18 → bit 18 of a 64-bit mask (GPIOs go up to 39)' },
    { at: at('f3'), text: 'mode INPUT · pull-up ENABLE · pull-down DISABLE — as in the input video' },
    { at: at('f4'), text: 'intr_type = GPIO_INTR_NEGEDGE → fires on 1 → 0: the press' },
    { at: at('f5'), text: 'mask 0 or a GPIO that doesn\'t exist → ESP_ERR_INVALID_ARG' },
  ] as Caption[],
};

// ── 4. gpio_install_isr_service ───────────────────────────────────────────

export const SERVICE = {
  code: 'gpio_install_isr_service(0);',
  run: w('v1', 'comes', 0, 0.8),
  args: [{ token: '0', at: w('v2', 'argument'), title: 'flags', value: '0', sub: 'ESP_INTR_FLAG_* · 0 = defaults' }],
  views: { shared: w('v1', 'All'), flags: at('v2'), once: at('v3') },
  shared: {
    share: w('v1', 'share'),
    installs: w('v1', 'installs'),
    each: w('v1', 'each'),
  },
  flags: {
    zero: w('v2', 'Zero'),
    prio: w('v2', 'priority'),
    c: w('v2', 'written'),
    flash: w('v2', 'flash'),
  },
  once: {
    second: w('v3', 'second'),
    ret: w('v3', 'returns'),
  },
  captions: [
    { at: at('v1'), text: 'gpio_install_isr_service(flags) — one CPU interrupt for every GPIO' },
    { at: w('v1', 'All'), text: 'all GPIOs → one interrupt → the driver\'s handler → your function, per pin' },
    { at: at('v2'), text: 'flags 0 → level 1–3 interrupt, in C · not IRAM: postponed during flash writes' },
    { at: at('v3'), text: 'install once — a second call → ESP_ERR_INVALID_STATE' },
  ] as Caption[],
};

// ── 5. gpio_isr_handler_add ───────────────────────────────────────────────

export const HANDLER = {
  code: 'gpio_isr_handler_add(BUTTON, button_isr, (void *) BUTTON);',
  run: w('h1', 'Then', 0, 0.4),
  args: [
    { token: 'BUTTON', at: w('h1', 'pin', 1), title: 'pin', value: 'GPIO_NUM_18', sub: 'which pin' },
    { token: 'button_isr', at: w('h1', 'function', 1), title: 'function', value: 'button_isr', sub: 'void fn(void *arg)' },
    { token: '(void *) BUTTON', at: w('h1', 'argument', 1), title: 'argument', value: '(void *) 18', sub: 'handed back as arg' },
  ],
  views: { table: w('h1', 'takes'), arg: at('h2'), order: at('h3') },
  arg: {
    back: w('h2', 'handed'),
    every: w('h2', 'every'),
    pin: w('h2', 'pin'),
    several: w('h2', 'several'),
  },
  order: {
    on: w('h3', 'switches'),
    before: w('h3', 'before'),
    ret: w('h3', 'returns'),
  },
  captions: [
    { at: at('h1'), text: 'gpio_isr_handler_add(pin, function, argument)' },
    { at: at('h2'), text: 'the argument comes back as arg on every call → one function, many buttons' },
    { at: at('h3'), text: 'it enables the pin\'s interrupt · before the service → ESP_ERR_INVALID_STATE' },
  ] as Caption[],
};

// ── 6. the ISR ─────────────────────────────────────────────────────────────

export const ISR = {
  views: { context: at('n1'), rules: at('n2'), stack: at('n3'), fromisr: at('n4'), yield: at('n5'), iram: at('n6') },
  context: {
    inside: w('n1', 'inside'),
    notTask: w('n1', 'not'),
    rules: w('n1', 'rules'),
  },
  rules: {
    wait: w('n2', 'wait'),
    delay: w('n2', 'no', 0, 0.3),
    receive: w('n2', 'no', 1, 0.3),
    log: w('n2', 'logging'),
  },
  stack: {
    own: w('n3', 'own'),
    bytes: w('n3', 'own', 0, 0.76),
    short: w('n3', 'short'),
    minimum: w('n3', 'minimum'),
  },
  fromisr: {
    ends: w('n4', 'ends'),
    send: w('n4', 'Here', 0, 0.5),
    copies: w('n4', 'copies'),
  },
  yield: {
    wakes: w('n5', 'wakes'),
    woken: w('n5', 'woken'),
    port: w('n5', 'true', 0, 0.5),
    ends: w('n5', 'ends'),
    leave: w('n5', 'leave'),
    tick: w('n5', 'tick'),
  },
  iram: {
    marks: w('n6', 'marks'),
    attr: w('n6', 'with', 0, 0.4),
    zero: w('n6', 'zero'),
    need: w('n6', 'need'),
  },
  /** which ISR_CODE lines each view lights */
  lines: { context: [0], rules: [], stack: [], fromisr: [2, 4], yield: [3, 4, 5], iram: [0] } as Record<string, number[]>,
  captions: [
    { at: at('n1'), text: 'button_isr runs inside the interrupt — not in a task' },
    { at: at('n2'), text: 'no blocking (vTaskDelay, xQueueReceive) · no ESP_LOGx in an ISR' },
    { at: at('n3'), text: 'its own small stack: CONFIG_FREERTOS_ISR_STACKSIZE = 1536 bytes → do the minimum' },
    { at: at('n4'), text: 'only …FromISR calls: xQueueSendFromISR copies the pin number into the queue' },
    { at: at('n5'), text: 'woken + portYIELD_FROM_ISR → the task runs as the ISR ends, not at the next tick' },
    { at: at('n6'), text: 'flags 0 → IRAM_ATTR not required (driver/gpio.h)' },
  ] as Caption[],
};

// ── 7. the queue ───────────────────────────────────────────────────────────

export const QUEUE = {
  views: { create: at('w1'), receive: at('w2'), suspended: at('w3') },
  create: {
    worlds: w('w1', 'worlds'),
    create: w('w1', 'worlds', 0, 1.1),
    ten: w('w1', 'room', 0, 0.4),
    four: w('w1', 'bytes', 0, -0.5),
  },
  receive: {
    receive: w('w2', 'calls', 0, 0.4),
    max: w('w2', 'with', 0, 0.3),
    long: w('w2', 'long'),
  },
  suspended: {
    parks: w('w3', 'parks'),
    list: w('w3', 'list'),
    timer: w('w3', 'timer'),
    nothing: w('w3', 'nothing', 1),
    arrives: w('w3', 'arrives'),
  },
  captions: [
    { at: at('w1'), text: 'xQueueCreate(10, sizeof(uint32_t)) → 10 slots × 4 bytes' },
    { at: at('w2'), text: 'xQueueReceive(…, portMAX_DELAY) → wait with no timeout' },
    { at: at('w3'), text: 'portMAX_DELAY → the suspended list: no timer wakes it — zero cost while waiting' },
  ] as Caption[],
};

// ── 8. demo ────────────────────────────────────────────────────────────────

export const DEMO = {
  press: w('d1', 'falling'),
  status: w('d1', 'notices'),
  jumps: w('d1', 'jumps'),
  handler: w('d1', 'handler'),
  isr: w('d1', 'calls', 0, 0.4),
  drops: w('d2', 'drops'),
  returns: w('d2', 'returns'),
  wakes: w('d2', 'wakes'),
  logs: w('d2', 'logs'),
  release: w('d2', 'logs', 0, 0.5),
  polling: w('d3', 'woke'),
  once: w('d3', 'once'),
  captions: [
    { at: at('d1'), text: 'edge → the GPIO hardware notices → interrupt → driver handler → button_isr' },
    { at: at('d2'), text: 'button_isr: 18 into the queue, return → the task wakes and logs' },
    { at: at('d3'), text: 'polling: 100 wake-ups a second · interrupts: one per press' },
  ] as Caption[],
};

// ── 9. bounce ──────────────────────────────────────────────────────────────

export const BOUNCE = {
  views: { storm: at('b1'), fix: at('b3') },
  storm: {
    bounce: w('b1', 'bounce'),
    several: w('b1', 'several'),
    every: w('b1', 'every'),
    five: w('b2', 'logs', 0, 0.4),
    letting: w('b2', 'letting'),
    falling: w('b2', 'falling'),
  },
  fix: {
    task: w('b3', 'task'),
    first: w('b3', 'first'),
    wait: w('b3', 'waits'),
    reset: w('b3', 'with', 0, 0.4),
    read: w('b4', 'reads'),
    zero: w('b4', 'zero'),
    press: w('b4', 'press'),
    one: w('b4', 'So', 0, 0.2),
    sleeps: w('b4', 'sleeps'),
  },
  captions: [
    { at: at('b1'), text: 'one press → five falling edges → five interrupts · release bounces too' },
    { at: at('b3'), text: 'in the task: first event → wait 30 ms → xQueueReset → read once → still 0? count it' },
  ] as Caption[],
};

// ── 10. second knob: trigger types ────────────────────────────────────────

export const TYPES = {
  views: { edges: at('k1'), level: at('k2'), wake: at('k3') },
  edges: {
    knob: w('k1', 'knob'),
    neg: w('k1', 'knob', 0, 0.9),
    pos: w('k1', 'press', 0, 0.6),
    any: w('k1', 'release', 0, 0.6),
    read: w('k1', 'read'),
  },
  level: {
    low: w('k2', 'different', 0, 0.6),
    firing: w('k2', 'firing'),
    held: w('k2', 'held'),
    again: w('k2', 'again'),
  },
  wake: {
    sleep: w('k3', 'sleep'),
    enable: w('k3', 'accepts', 0, -1.4),
    two: w('k3', 'two'),
  },
  captions: [
    { at: at('k1'), text: 'NEGEDGE → press · POSEDGE → release · ANYEDGE → both (read the level)' },
    { at: at('k2'), text: 'LOW_LEVEL fires as long as the pin is low → a held button, again and again' },
    { at: at('k3'), text: 'levels are for wake-up: gpio_wakeup_enable() takes LOW_LEVEL or HIGH_LEVEL only' },
  ] as Caption[],
};

// ── 11. payoff ─────────────────────────────────────────────────────────────

const PAY_LINE = w('x1', 'That');
export const PAYOFF = {
  ask: w('x1', 'asking'),
  tell: w('x1', 'tell'),
  line: PAY_LINE,
  recap: [
    { at: PAY_LINE + 1.24, k: 'gpio_config(.intr_type = NEGEDGE)', v: 'the pin watches for the edge' },
    { at: PAY_LINE + 1.59, k: 'gpio_install_isr_service(0)', v: 'once, at start-up' },
    { at: PAY_LINE + 1.94, k: 'gpio_isr_handler_add(pin, fn, arg)', v: 'your function, for that pin' },
    { at: PAY_LINE + 2.29, k: 'xQueueSendFromISR → xQueueReceive', v: 'the task sleeps until it happens' },
    { at: PAY_LINE + 2.64, k: 'wait · xQueueReset · read once', v: 'bounce handled · next: ADC' },
  ],
};

// ── voiceover (scratch: edge-tts) ─────────────────────────────────────────

/** `text` is the script as written; `say` is what the TTS reads, if different; `pause` the silence before it */
export type VoLine = { id: string; scene: IrqSceneId; at: number; text: string; say?: string; pause?: number };
export const VOICE = 'en-US-AndrewMultilingualNeural';
const L = (id: string, scene: IrqSceneId, text: string, o: { say?: string; pause?: number } = {}): VoLine => ({ id, scene, at: at(id), text, ...o });

export const VO: VoLine[] = [
  // 1 · problem: the want, and the first try
  L('p1', 'problem', "Let's say you want your program to react the instant someone presses a button, without watching it all the time.", { pause: 0.6 }),
  L('p2', 'problem', 'The first try, from the GPIO input video, is a loop that reads the button a hundred times a second. Almost every read says the same thing: not pressed.', { pause: 0.6 }),
  L('p3', 'problem', "That's three hundred and sixty thousand reads an hour, just in case. And a pulse shorter than one tick can slip between two reads, and never be seen.", { pause: 0.8 }),
  L('p4', 'problem', 'So what if the pin itself could tell you when something happens?', { pause: 0.8 }),
  // 2 · answer
  L('a1', 'answer', 'Well, it can. The GPIO hardware watches the pin for an edge, and when it sees one, it interrupts the CPU, and runs a function you gave it.'),
  L('a2', 'answer', "Then the CPU goes back to what it was doing. That's called an interrupt.", { pause: 0.7 }),
  // 3 · gpio_config
  L('f1', 'config', 'This time, you set the pin up with gpio_config. It takes one struct, and configures every pin in its mask at once.', { say: 'This time, you set the pin up with GPIO config. It takes one struct, and configures every pin in its mask at once.' }),
  L('f2', 'config', "The mask has one bit per GPIO. One, shifted left by eighteen, sets bit eighteen. It's a sixty-four-bit value, because the pins go up to thirty-nine, so you write the one as 1ULL.", { say: "The mask has one bit per GPIO. One, shifted left by eighteen, sets bit eighteen. It's a sixty-four-bit value, because the pins go up to thirty-nine, so you write the one as one, U, L, L.", pause: 0.7 }),
  L('f3', 'config', 'The mode and the pulls are the same as in the GPIO input video: an input, with the pull-up on, and the pull-down off.', { say: 'The mode and the pulls are the same as in the GPIO input video: an input, with the pull up on, and the pull down off.', pause: 0.7 }),
  L('f4', 'config', "The new field is the interrupt type. GPIO_INTR_NEGEDGE fires on a falling edge, from one to zero. With a pull-up, that's the moment the button goes down.", { say: "The new field is the interrupt type. GPIO interrupt, neg edge, fires on a falling edge, from one to zero. With a pull up, that's the moment the button goes down.", pause: 0.7 }),
  L('f5', 'config', "Wrap it in ESP_ERROR_CHECK, because an empty mask, or a pin that doesn't exist, returns ESP_ERR_INVALID_ARG.", { say: "Wrap it in E S P error check, because an empty mask, or a pin that doesn't exist, returns E S P error invalid arg.", pause: 0.7 }),
  // 4 · service
  L('v1', 'service', "Next comes gpio_install_isr_service. All the GPIO pins share one interrupt on the CPU, and this call installs the driver's handler for it, which then calls a function for each pin.", { say: "Next comes GPIO install I S R service. All the GPIO pins share one interrupt on the CPU, and this call installs the driver's handler for it, which then calls a function for each pin." }),
  L('v2', 'service', 'The argument is a set of flags. Zero picks the defaults: a low or medium priority interrupt, written in C, that waits while the flash is being written.', { pause: 0.7 }),
  L('v3', 'service', 'Install it only once, because a second call returns ESP_ERR_INVALID_STATE.', { say: 'Install it only once, because a second call returns E S P error invalid state.', pause: 0.7 }),
  // 5 · handler
  L('h1', 'handler', 'Then gpio_isr_handler_add hooks your function to one pin. It takes three arguments: the pin, the function, and an argument.', { say: 'Then GPIO I S R handler add hooks your function to one pin. It takes three arguments: the pin, the function, and an argument.' }),
  L('h2', 'handler', "The argument is handed back to your function every time it runs. Here it's the pin number, so one function can serve several buttons.", { pause: 0.7 }),
  L('h3', 'handler', "It also switches the pin's interrupt on. If you call it before installing the service, it returns ESP_ERR_INVALID_STATE.", { say: "It also switches the pin's interrupt on. If you call it before installing the service, it returns E S P error invalid state.", pause: 0.7 }),
  // 6 · the ISR
  L('n1', 'isr', 'Now for the function itself. It runs inside the interrupt, not in a task, so the rules change.'),
  L('n2', 'isr', "It can't wait, so nothing that blocks is allowed: no vTaskDelay, and no xQueueReceive. And no ESP_LOGI calls either, because logging is for tasks.", { say: "It can't wait, so nothing that blocks is allowed: no V task delay, and no X queue receive. And no logging calls either, because logging is for tasks.", pause: 0.6 }),
  L('n3', 'isr', 'It runs on a small stack of its own, fifteen hundred and thirty-six bytes by default. So keep it short: do the minimum, and get out.', { pause: 0.7 }),
  L('n4', 'isr', 'To pass the news on, use a function whose name ends in FromISR. Here, xQueueSendFromISR copies the pin number into a queue.', { say: 'To pass the news on, use a function whose name ends in, from I S R. Here, X queue send from I S R copies the pin number into a queue.', pause: 0.7 }),
  L('n5', 'isr', 'If that wakes a task, woken comes back true, and portYIELD_FROM_ISR switches to it as the interrupt ends. If you leave it out, the task can wait until the next tick.', { say: 'If that wakes a task, woken comes back true, and port yield from I S R switches to it as the interrupt ends. If you leave it out, the task can wait until the next tick.', pause: 0.7 }),
  L('n6', 'isr', "Espressif's example marks its function with IRAM_ATTR, to keep it in internal RAM. But with flags of zero, the driver says you don't need to.", { say: "Espressif's example marks its function with the I-RAM attribute, to keep it in internal RAM. But with flags of zero, the driver says you don't need to.", pause: 0.7 }),
  // 7 · the queue
  L('w1', 'queue', 'The queue joins the two worlds. xQueueCreate makes room for ten pin numbers, four bytes each.', { say: 'The queue joins the two worlds. X queue create makes room for ten pin numbers, four bytes each.' }),
  L('w2', 'queue', 'In app_main, the loop calls xQueueReceive with portMAX_DELAY, which means wait for as long as it takes.', { say: 'In app main, the loop calls X queue receive with port max delay, which means wait for as long as it takes.', pause: 0.7 }),
  L('w3', 'queue', 'With that delay, FreeRTOS parks the task on its suspended list, where nothing wakes it on a timer. So the task costs nothing until a press arrives.', { say: 'With that delay, Free R-TOS parks the task on its suspended list, where nothing wakes it on a timer. So the task costs nothing until a press arrives.', pause: 0.7 }),
  // 8 · demo
  L('d1', 'demo', "Now press the button. The GPIO hardware notices the falling edge and interrupts the CPU, which jumps to the driver's handler, and the handler calls button_isr.", { say: "Now press the button. The GPIO hardware notices the falling edge and interrupts the CPU, which jumps to the driver's handler, and the handler calls button I S R." }),
  L('d2', 'demo', 'button_isr drops eighteen into the queue, and returns. Then the waiting task wakes up, and logs the press.', { say: 'Button I S R drops eighteen into the queue, and returns. Then the waiting task wakes up, and logs the press.', pause: 0.7 }),
  L('d3', 'demo', 'Polling woke up a hundred times a second, but this wakes up just once per press.', { pause: 0.7 }),
  // 9 · bounce
  L('b1', 'bounce', 'But remember the bounce. One press can make several falling edges, and every one of them is an interrupt.'),
  L('b2', 'bounce', 'So one press logs five presses. Even letting go can bounce through a falling edge.', { pause: 0.6 }),
  L('b3', 'bounce', 'The fix lives in the task. After the first event, it waits thirty milliseconds, and then throws the extra events away with xQueueReset.', { say: 'The fix lives in the task. After the first event, it waits thirty milliseconds, and then throws the extra events away with X queue reset.', pause: 0.8 }),
  L('b4', 'bounce', "Then it reads the pin once. If it's still zero, that was a press. So one press gives one count, and the CPU sleeps in between.", { pause: 0.6 }),
  // 10 · types
  L('k1', 'types', 'The interrupt type is the second knob. NEGEDGE catches the press, POSEDGE catches the release, and ANYEDGE catches both, so you read the level to tell them apart.', { say: 'The interrupt type is the second knob. Negative edge catches the press, positive edge catches the release, and any edge catches both, so you read the level to tell them apart.' }),
  L('k2', 'types', 'The level types are different. LOW_LEVEL keeps firing for as long as the pin stays low, so a held button interrupts again, and again.', { say: 'The level types are different. Low level keeps firing for as long as the pin stays low, so a held button interrupts again, and again.', pause: 0.7 }),
  L('k3', 'types', 'Levels are meant for waking the chip from light sleep, and gpio_wakeup_enable only accepts the two level types. Give it an edge, and it returns ESP_ERR_INVALID_ARG.', { say: 'Levels are meant for waking the chip from light sleep, and GPIO wake-up enable only accepts the two level types. Give it an edge, and it returns E S P error invalid arg.', pause: 0.7 }),
  // 11 · payoff
  L('x1', 'payoff', "So don't keep asking the pin. Let the pin tell you. That's an interrupt."),
];
