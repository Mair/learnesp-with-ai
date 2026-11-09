/**
 * GPIO input — the timeline. Single source of truth for picture AND sound.
 * PURE ESP-IDF: app_main, driver/gpio.h, vTaskDelay(pdMS_TO_TICKS(ms)). No Arduino.
 *
 *   problem → answer (pull-up) → circuit → gpio_reset_pin → gpio_set_direction
 *     → gpio_set_pull_mode → gpio_get_level → demo → counting presses (bounce)
 *     → second knob (pull-up vs pull-down) → under the hood → payoff
 *
 * Every time below is SCENE-RELATIVE. v3 (narration pass): the VO follows SCRIPT.md
 * "Sound like a teacher" and opens on the want; every cue is `w(line, word)` from the
 * generated block (`node scripts/vo-plan.ts gpio-input`). Log lines on screen are real QEMU
 * output (./lab).
 *
 * Import-free on purpose (type-only imports are erased): Node runs it as-is.
 * Every claim on screen or in the VO is sourced in ./FACTS.md.
 */
import type { Caption, Mark } from '../../components/pwm';

export type InSceneId =
  | 'problem'
  | 'answer'
  | 'circuit'
  | 'reset'
  | 'direction'
  | 'pull'
  | 'read'
  | 'demo'
  | 'count'
  | 'pulls'
  | 'payoff';

export const FPS = 30;

// ── generated: VO plan (node scripts/vo-plan.ts gpio-input) — do not edit by hand ──
export const VO_AT: Record<string, number> = {"p1":0.6,"p2":4.18,"p3":14.46,"p4":24.26,"a1":0.5,"a2":9.92,"a3":15.86,"c1":0.5,"c2":12.42,"c3":23.88,"r1":0.5,"r2":6.9,"r3":16.34,"s1":0.5,"s2":7.42,"s3":15.2,"s4":26.64,"u1":0.5,"u2":8.92,"u3":23.28,"u4":33.52,"u5":43.36,"g1":0.5,"g2":7.44,"g3":19.12,"g4":26.52,"d1":0.5,"d2":10.86,"d3":22.06,"e1":0.5,"e2":8.34,"e3":18.12,"e4":26.14,"e5":33.48,"e6":46.82,"k1":0.5,"k2":8.84,"k3":17.58,"x1":0.5};
export const SCENE_DUR: Record<string, number> = {"problem":29.7,"answer":23.64,"circuit":39.22,"reset":24.48,"direction":38.28,"pull":58.16,"read":34.22,"demo":34.5,"count":62.94,"pulls":28.74,"payoff":11.86};
export const VO_WORDS: Record<string, [string, number][]> = {
  p1: [["Let's",0],["say",0.3],["you",0.42],["want",0.52],["a",0.62],["program",0.74],["to",1.08],["know",1.36],["when",1.68],["someone",2.04],["presses",2.34],["a",2.64],["button.",2.84]],
  p2: [["The",0],["obvious",0.26],["first",0.54],["try",0.84],["is",1.22],["to",1.38],["wire",1.56],["the",1.86],["button",2.04],["from",2.28],["pin",2.52],["to",2.74],["ground",2.88],["and",3.2],["read",3.7],["the",3.9],["pin.",4.06],["Press",4.94],["the",5],["button,",5.2],["and",5.82],["the",6.08],["pin",6.18],["is",6.42],["tied",6.58],["to",6.92],["zero",7.18],["volts,",7.52],["so",8.26],["the",8.44],["program",8.56],["reads",8.92],["zero.",9.24]],
  p3: [["But",0],["when",0.24],["you",0.36],["let",0.46],["go,",0.6],["the",1.46],["pin",1.64],["is",1.86],["connected",2.02],["to",2.36],["nothing",2.66],["at",2.98],["all.",3.2],["It",3.92],["floats.",4],["It",4.96],["might",5.12],["read",5.26],["1,",5.52],["it",6.24],["might",6.3],["read",6.48],["0,",6.84],["and",7.8],["it",8.08],["can",8.16],["change",8.3],["on",8.56],["its",8.7],["own.",8.82]],
  p4: [["So",0],["how",0.28],["do",0.38],["you",0.46],["give",0.52],["a",0.62],["pin",0.74],["a",0.86],["level",0.98],["when",1.22],["nothing",1.74],["is",2.02],["driving",2.3],["it?",2.6]],
  a1: [["The",0],["fix",0.24],["is",0.46],["to",0.74],["give",0.9],["the",1.04],["pin",1.18],["a",1.44],["gentle",1.78],["default.",1.98],["A",2.96],["resistor",3],["to",3.32],["3",3.76],[".3",4.2],["volts",4.86],["holds",5.16],["the",5.56],["pin",5.76],["high,",5.96],["as",6.9],["long",7.14],["as",7.36],["nothing",7.54],["else",7.82],["is",8.2],["in",8.4],["charge.",8.54]],
  a2: [["When",0],["you",0.22],["press",0.34],["the",0.54],["button,",0.7],["its",1.46],["short",1.56],["path",1.82],["to",2.18],["ground",2.44],["takes",2.8],["over",3.1],["and",3.64],["the",4.26],["pin",4.36],["drops",4.6],["to",4.9],["zero.",5.16]],
  a3: [["So",0],["released",0.28],["reads",0.62],["one,",1.04],["and",1.82],["pressed",2.02],["reads",2.38],["zero.",2.82],["That",3.84],["resistor",3.98],["is",4.3],["called",4.68],["a",4.86],["pull",4.98],["-up.",5.14]],
  c1: [["On",0],["the",0.22],["breadboard,",0.32],["one",1.04],["leg",1.3],["of",1.46],["the",1.54],["button",1.64],["goes",1.92],["to",2.54],["GPIO",2.9],["18",3.44],["and",4.2],["the",4.96],["other",5.08],["leg",5.26],["goes",5.5],["to",5.7],["ground.",5.86],["You",6.74],["don't",6.82],["need",6.96],["a",7.1],["resistor",7.16],["because",7.54],["the",8.3],["ESP32",8.5],["has",9.6],["the",10.2],["pull",10.36],["-up",10.52],["built",10.66],["in.",10.82]],
  c2: [["So",0],["why",0.28],["GPIO",0.52],["18?",1],["It",1.96],["isn't",2.06],["a",2.2],["strapping",2.3],["pin,",2.76],["it",3.4],["isn't",3.5],["wired",3.82],["to",4.2],["the",4.36],["flash,",4.5],["and",5.5],["it",5.92],["has",6.56],["an",6.76],["internal",6.86],["pull",7.2],["up.",7.42],["GPIO",8.28],["34",8.58],["to",9.08],["39",9.36],["don't",9.86],["have",10.26],["one.",10.4]],
  c3: [["The",0],["datasheet",0.22],["guarantees",0.68],["that",1.12],["the",1.48],["pin",1.62],["reads",1.82],["one",2.18],["above",2.42],["2",2.68],[".475",3.1],["volts",4.12],["and",4.76],["zero",5.52],["below",5.88],["0",6.26],[".825",6.64],["volts.",7.38],["In",8.7],["between,",8.84],["it",9.56],["promises",9.78],["nothing,",10.26],["and",11.32],["that's",11.44],["exactly",11.68],["where",12.08],["a",12.4],["floating",12.56],["pin",12.72],["lives.",13.04]],
  r1: [["In",0],["App",0.26],["main,",0.4],["you",1.08],["start",1.24],["the",1.42],["same",1.56],["way",1.78],["as",2.04],["for",2.28],["an",2.44],["output.",2.54],["GPI",3.6],["reset",3.94],["pin",4.4],["with",4.78],["the",5.12],["buttons",5.26],["pin.",5.5]],
  r2: [["It",0],["puts",0.22],["the",0.34],["pin",0.5],["in",0.66],["a",0.78],["known",0.94],["state,",1.08],["a",2.08],["plain",2.18],["GPIO",2.4],["with",2.92],["its",3.22],["output",3.34],["off,",3.66],["and",4.6],["to",4.7],["save",4.84],["power,",5.1],["a",5.86],["weak",5.98],["pull",6.22],["-up.",6.54],["But",7.22],["the",7.32],["input",7.42],["is",7.72],["switched",7.96],["off",8.26],["too.",8.5]],
  r3: [["So",0],["right",0.3],["now,",0.46],["the",1.06],["pin",1.24],["can't",1.5],["be",1.9],["read",1.96],["at",2.12],["all.",2.22],["GPIO",3.04],["get",3.32],["level",3.62],["return",3.94],["zero,",4.3],["whatever",5.22],["the",5.4],["button",5.62],["does.",5.82]],
  s1: [["Next,",0],["GPIO",0.92],["set",1.24],["direction",1.52],["makes",1.92],["it",2.36],["an",2.52],["input.",2.6],["It",3.48],["takes",3.56],["two",3.76],["arguments,",4.02],["the",5],["pin",5.08],["and",5.4],["the",5.9],["mode.",6]],
  s2: [["GPIO",0],["mode",0.56],["input",1],["switches",1.48],["on",1.92],["the",2.14],["pin's",2.26],["input",2.66],["buffer",3],["and",3.44],["leaves",4.04],["its",4.24],["output",4.42],["driver",4.9],["off,",5.28],["so",5.92],["the",6.1],["pin",6.24],["only",6.48],["listens.",6.76]],
  s3: [["If",0],["you",0.22],["forget",0.32],["this",0.56],["line,",0.78],["GPIO",1.58],["get",2.06],["level",2.56],["always",2.92],["returns",3.5],["zero.",4],["With",4.9],["a",5.06],["button",5.18],["to",5.38],["ground,",5.58],["zero",6.58],["means",6.72],["pressed,",7.08],["so",7.92],["your",8.08],["program",8.2],["thinks",8.6],["the",8.98],["button",9.18],["is",9.4],["held",9.74],["down",9.96],["forever.",10.28]],
  s4: [["Input",0],["mode",0.44],["works",0.68],["on",1.04],["every",1.38],["GPIO,",1.7],["even",2.88],["34",3],["to",3.62],["39.",3.82],["The",4.82],["error",4.96],["you",5.14],["saw",5.36],["on",5.66],["pin",5.86],["34",6.12],["in",6.74],["the",6.96],["GPIO",7.06],["video",7.54],["only",8],["applies",8.54],["to",8.98],["outputs.",9.28]],
  u1: [["Then",0],["GPIO",0.34],["set",0.82],["pull",1.18],["mode",1.48],["chooses",1.94],["the",2.4],["pin's",2.68],["default",3.1],["level.",3.4],["Again,",4.24],["it",4.96],["takes",5.04],["two",5.3],["arguments,",5.62],["the",6.64],["pin",6.68],["and",6.98],["the",7.4],["pull.",7.5]],
  u2: [["There",0],["are",0.24],["four",0.36],["choices,",0.56],["up",1.78],["only,",1.92],["down",2.9],["only,",3],["both",3.96],["at",4.08],["once",4.26],["or",4.6],["none,",4.96],["which",5.68],["leaves",5.86],["the",6.12],["pin",6.28],["floating.",6.52],["GPIO",7.48],["pull",7.86],["-up",8.12],["only",8.26],["connects",8.56],["the",8.96],["internal",9.18],["resistor",9.52],["to",9.9],["3",10.4],[".3",10.76],["volts",11.32],["and",11.58],["disconnects",12.26],["the",12.94],["one",13.02],["to",13.24],["ground.",13.38]],
  u3: [["That",0],["resistor",0.3],["is",0.64],["about",1.16],["45",1.4],["kilo",2.14],["ohms.",2.58],["When",3.3],["you",3.4],["press",3.5],["the",3.7],["button,",3.9],["about",4.7],["73",4.86],["microamps",5.6],["flow",6.5],["through",6.96],["it,",7.38],["which",7.94],["is",8.12],["tiny",8.28],["and",8.66],["harmless.",9.14]],
  u4: [["GPI",0],["reset",0.6],["pin",0.98],["had",1.28],["already",1.48],["turned",1.8],["the",2.04],["pull",2.18],["-up",2.36],["on,",2.5],["but",3.1],["only",3.26],["as",3.52],["a",3.72],["side",3.84],["effect.",4.06],["Say",4.92],["it",5.16],["in",5.28],["your",5.36],["code,",5.46],["so",6.1],["the",6.28],["next",6.4],["person",6.54],["who",6.8],["reads",7.1],["it",7.42],["knows",7.6],["the",7.9],["button",8.16],["needs",8.44],["it.",8.74]],
  u5: [["On",0],["GPIO34,",0.26],["there's",2],["no",2.18],["resistor",2.4],["to",2.76],["connect.",3.12],["The",3.98],["call",4.08],["logs",4.26],["an",4.5],["error,",4.7],["but",5.16],["then",5.38],["returns",5.56],["ESPOK",6.04],["anyway,",7.14],["so",8.3],["ESP",8.62],["error",9.22],["check",9.52],["won't",9.76],["catch",10.02],["it.",10.16],["Pins",11],["like",11.12],["that",11.28],["need",11.56],["a",11.82],["resistor",11.94],["on",12.26],["the",12.5],["board.",12.6]],
  g1: [["Now",0],["you",0.26],["can",0.38],["read",0.5],["it.",0.7],["GPI",1.4],["will",1.74],["get",1.84],["level",1.98],["takes",2.24],["the",2.5],["pin",2.72],["and",3.04],["returns",3.7],["its",4.06],["level.",4.28],["One",5.18],["or",5.54],["zero.",5.94]],
  g2: [["Notice",0],["what",0.34],["returns,",0.56],["a",1.62],["plain",1.78],["int,",2.04],["not",2.84],["an",3.04],["ESP",3.26],["error",3.84],["code.",4.28],["There's",5.06],["no",5.26],["error",5.44],["to",5.66],["check,",5.86],["so",6.56],["don't",6.82],["wrap",7.14],["it",7.42],["in",7.62],["ESP",7.78],["error",8.4],["check,",8.74],["where",9.44],["a",9.74],["1",9.84],["would",10.08],["look",10.26],["like",10.46],["a",10.62],["failure.",10.76]],
  g3: [["The",0],["value",0.22],["is",0.52],["a",0.84],["snapshot,",0.98],["the",2.02],["level",2.18],["at",2.36],["the",2.52],["moment",2.62],["you",2.8],["ask.",3],["It",3.9],["doesn't",4.06],["wait",4.38],["for",4.54],["a",4.8],["press,",4.9],["and",5.78],["it",5.84],["doesn't",5.96],["remember",6.26],["one.",6.5]],
  g4: [["And",0],["with",0.18],["a",0.34],["pull",0.44],["up,",0.62],["pressed",1.26],["read",1.52],["zero.",1.84],["So",2.78],["compare",2.98],["the",3.28],["level",3.46],["with",3.64],["zero,",3.86],["and",4.64],["you",4.8],["get",4.9],["the",5.02],["answer",5.16],["you",5.4],["mean.",5.54]],
  d1: [["Now",0],["put",0.24],["it",0.36],["all",0.44],["together.",0.6],["Set",1.66],["up",1.72],["the",1.86],["LED",2.06],["and",2.48],["the",3.14],["button.",3.24],["Then,",4.04],["forever,",4.68],["read",5.6],["the",5.88],["button,",6.04],["copy",6.68],["its",6.92],["state",7.16],["to",7.4],["the",7.6],["LED,",7.72],["and",8.7],["wait",8.92],["one",9.12],["tick.",9.42]],
  d2: [["10",0],["milliseconds",0.36],["is",0.8],["one",1.48],["tick,",1.9],["which",2.76],["is",2.84],["the",2.96],["shortest",3.14],["wait",3.44],["there",3.76],["is.",4.02],["So",4.78],["the",5.02],["loop",5.14],["reads",5.36],["the",5.7],["button",5.88],["about",6.16],["100",6.58],["times",6.96],["a",7.26],["second,",7.44],["and",8.24],["the",8.42],["CPU",8.54],["is",8.88],["free",9.58],["in",9.96],["between.",10.16]],
  d3: [["press",0],["the",0.36],["button,",0.54],["and",1.42],["the",1.44],["LED",1.56],["follows",1.86],["within",2.48],["10",3.02],["milliseconds.",3.46],["Jack",4.86],["Gantzel",4.92],["found",5.34],["that",5.58],["50",5.76],["milliseconds",6.2],["already",6.78],["feels",7.38],["instant.",7.9]],
  e1: [["Now",0],["let's",0.3],["count",0.54],["presses.",0.68],["Counting",1.9],["zeros",2.2],["doesn't",2.72],["work.",3.32],["If",4.02],["you",4.14],["hold",4.24],["the",4.46],["button",4.6],["for",4.8],["one",5.06],["second,",5.26],["that's",6.12],["100",6.38],["zeros.",6.64]],
  e2: [["A",0],["press",0.26],["is",0.46],["a",0.68],["change,",0.84],["1,",1.66],["then",2.46],["0,",2.6],["so",3.56],["remember",3.78],["the",4.04],["last",4.28],["level,",4.6],["and",5.64],["count",5.72],["a",6.22],["press",6.36],["only",6.66],["when",7.1],["a",7.36],["level",7.5],["drops",7.68],["from",8.04],["1",8.4],["to",8.6],["0.",8.76]],
  e3: [["But",0],["zoom",0.28],["in",0.52],["on",0.62],["that",0.74],["edge",0.88],["and",1.22],["you'll",1.64],["see",1.8],["that",2.02],["a",2.18],["real",2.32],["switch",2.8],["bounces.",3.36],["The",4.5],["metal",4.62],["contacts",4.82],["hit,",5.34],["spring",5.88],["apart,",6.22],["and",6.96],["hit",7.06],["again.",7.18]],
  e4: [["In",0],["Jack",0.26],["Ansel's",0.46],["tests,",0.96],["most",1.92],["switches",2.14],["bounce",2.52],["for",2.86],["about",3.14],["1",3.4],[".5",3.82],["milliseconds",4.28],["and",4.72],["the",5.52],["worst",5.64],["of",5.82],["them",6.02],["for",6.14],["6.",6.32]],
  e5: [["If",0],["you",0.24],["read",0.38],["the",0.54],["pen",0.72],["a",0.96],["million",1.28],["times",1.66],["a",2.08],["second,",2.24],["one",3.24],["press",3.34],["can",3.62],["count",3.88],["as",4.3],["several.",4.56],["If",5.52],["you",5.68],["read",5.82],["it",5.98],["every",6.18],["10",6.56],["milliseconds,",6.9],["at",8],["most",8.12],["one",8.38],["reading",8.78],["lands",9.1],["inside",9.54],["the",10.08],["bounce,",10.32],["so",10.86],["one",11.1],["press",11.38],["gives",11.76],["one",12.08],["count.",12.34]],
  e6: [["That",0],["one",0.3],["tick",0.54],["delay",0.78],["is",1.18],["your",1.74],["debouncer.",1.88],["The",3.04],["ESP32",3.06],["has",4.02],["no",4.54],["hardware",4.9],["filter",5.32],["for",5.66],["this,",5.96],["so",6.64],["it's",6.84],["your",6.98],["code's",7.04],["job.",7.36],["Most",8.14],["switches",8.32],["settle",8.8],["well",9.48],["within",9.8],["10",10.3],["milliseconds,",10.8],["but",11.8],["a",11.94],["bad",12.1],["one",12.38],["can",12.74],["bounce",12.96],["for",13.28],["longer.",13.48]],
  k1: [["You",0],["can",0.2],["also",0.3],["flip",0.5],["the",0.82],["whole",0.98],["thing",1.14],["around.",1.38],["Wire",2.38],["the",2.46],["button",2.64],["to",2.84],["3",3.08],[".3",3.5],["volts",4.06],["instead",4.28],["and",4.84],["choose",5.5],["GPIO",5.76],["pull",6.38],["down",7.04],["only.",7.36]],
  k2: [["Now",0],["released",0.3],["reads",0.7],["zero",1.06],["and",1.56],["pressed",2.22],["reads",2.56],["one.",2.9],["It's",3.7],["the",3.84],["same",3.98],["resistor",4.24],["and",4.7],["the",5.16],["same",5.26],["tiny",5.6],["current,",6.06],["but",6.5],["with",6.88],["the",7.02],["opposite",7.16],["logic.",7.5]],
  k3: [["Just",0],["never",0.24],["turn",0.38],["on",0.6],["both.",0.76],["Two",1.7],["equal",1.82],["resistors",2.24],["split",2.88],["the",3.44],["voltage",3.68],["in",4.06],["half",4.32],["to",4.64],["about",5.18],["1",5.42],[".65",5.76],["volts,",6.4],["right",7.24],["in",7.42],["the",7.54],["zone",7.64],["the",7.78],["datasheet",7.96],["doesn't",8.42],["promise.",8.88]],
  x1: [["So,",0],["make",0.78],["the",1.04],["pin",1.2],["an",1.36],["input,",1.5],["give",2.24],["it",2.34],["a",2.46],["pull,",2.52],["and",3.32],["read",3.48],["its",3.7],["level.",3.88],["That's",4.74],["a",4.96],["GPIO",5.08],["input.",5.5]],
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

// ── scenes ─────────────────────────────────────────────────────────────────

export const TAIL: Record<string, number> = { problem: 2.6, answer: 2.4, circuit: 2.0, reset: 2.0, direction: 2.0, pull: 2.0, read: 2.0, demo: 4.0, count: 2.4, pulls: 2.0, payoff: 5.4 };
const dur = (id: string, fallback: number) => SCENE_DUR[id] ?? fallback;
export const SCENES: { id: InSceneId; dur: number }[] = (
  [
    ['problem', 29.2],
    ['answer', 21.4],
    ['circuit', 34.8],
    ['reset', 23.6],
    ['direction', 34.6],
    ['pull', 51.3],
    ['read', 31.1],
    ['demo', 32.6],
    ['count', 57.3],
    ['pulls', 25.7],
    ['payoff', 9.6],
  ] as [InSceneId, number][]
).map(([id, f]) => ({ id, dur: dur(id, f) }));
export type SceneId = InSceneId;

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
export const INPUT_FRAMES = Math.round(SECONDS * FPS);

// ── shared numbers (FACTS.md) ──────────────────────────────────────────────

export const BTN = 18;
export const BTN_MODULE_PIN = 30; // WROOM-32E: IO18 is module pin 30
export const GND_MODULE_PIN = 38; // the GND pad at the top of the same side
export const LED_PIN = 2;
export const VDD = 3.3;
export const VIH = 0.75 * VDD; // 2.475
export const VIL = 0.25 * VDD; // 0.825
export const R_PULL_K = 45;
export const PULL_UA = (VDD / (R_PULL_K * 1000)) * 1e6; // ≈ 73
export const TICK_MS = 10; // pdMS_TO_TICKS(10) = 1 tick at CONFIG_FREERTOS_HZ = 100

/** a floating input: wanders through the undefined band (illustrative, deterministic) */
export function floatV(s: number): number {
  const v = 1.65 + 1.15 * Math.sin(2.3 * s + 0.4) + 0.55 * Math.sin(5.9 * s + 1.3) + 0.35 * Math.sin(13.7 * s + 2.1);
  return Math.min(VDD, Math.max(0, v));
}
/** what gpio_get_level reads at voltage v: 0, 1, or a coin-flip inside the undefined band */
export function readAt(v: number, salt: number): 0 | 1 {
  if (v >= VIH) return 1;
  if (v <= VIL) return 0;
  const h = Math.sin(salt * 12.9898 + v * 78.233) * 43758.5453;
  return h - Math.floor(h) > 0.5 ? 1 : 0;
}

/** press windows → is the button down at scene time t? */
export const downAt = (presses: [number, number][], t: number) => presses.some(([a, b]) => t >= a && t < b);

// ── 1. the problem ─────────────────────────────────────────────────────────

export const PROBLEM = {
  ledIn: at('p1'),
  button: w('p1', 'button'),
  wire: w('p2', 'ground'),
  press: w('p2', 'Press'),
  zeroV: w('p2', 'volts', 0, -0.6),
  readsZero: w('p2', 'reads'),
  letGo: w('p3', 'go'),
  nothing: w('p3', 'nothing'),
  floats: w('p3', 'floats'),
  one: w('p3', '1'),
  zero: w('p3', '0'),
  own: w('p3', 'own'),
  question: at('p4'),
  /** the program reads every 0.5 s on screen (an illustrative loop) */
  readEvery: 0.5,
};

// ── 2. the answer ──────────────────────────────────────────────────────────

export const ANSWER = {
  diagramIn: 0.3,
  resistor: w('a1', 'resistor'),
  volts: w('a1', 'volts', 0, -0.6),
  high: w('a1', 'high'),
  press: w('a2', 'press'),
  takes: w('a2', 'takes'),
  zero: w('a2', 'zero'),
  release: at('a3') - 0.15,
  released: w('a3', 'released'),
  pressed: w('a3', 'pressed'),
  pressed2: w('a3', 'pressed', 0, 0.74),
  word: w('a3', 'pull'),
};

// ── 3. the circuit ─────────────────────────────────────────────────────────

export const CIRCUIT = {
  views: { wiring: at('c1'), pins: at('c2'), bands: at('c3') },
  wiring: {
    leg: w('c1', 'leg'),
    gpio18: w('c1', 'GPIO'),
    ground: w('c1', 'ground'),
    noR: w('c1', 'need'),
    builtIn: w('c1', 'built'),
  },
  pins: {
    strap: w('c2', 'strapping'),
    flash: w('c2', 'flash'),
    pullup: w('c2', 'pull'),
    noPull: w('c2', 'GPIO', 1),
  },
  bands: {
    one: w('c3', 'one'),
    vih: w('c3', 'volts', 0, -1.2),
    zero: w('c3', 'zero'),
    vil: w('c3', 'volts', 1, -1.2),
    between: w('c3', 'between'),
    floating: w('c3', 'floating'),
  },
  captions: [
    { at: at('c1'), text: 'GPIO 18 (module pin 30) → button → GND · the pull-up is inside the chip' },
    { at: at('c2'), text: 'GPIO 18: not strapping · not flash · has an internal pull-up (34–39 have none)' },
    { at: at('c3'), text: 'guaranteed: 1 above 2.475 V · 0 below 0.825 V · in between: undefined' },
  ] as Caption[],
};

// ── 4. gpio_reset_pin ──────────────────────────────────────────────────────

export const RESET = {
  code: 'gpio_reset_pin(BUTTON);',
  run: w('r1', 'reset'),
  args: [{ token: 'BUTTON', at: w('r1', 'button'), title: 'pin', value: 'GPIO_NUM_18', sub: '#define BUTTON GPIO_NUM_18' }],
  views: { state: at('r2'), read: at('r3') },
  state: {
    known: w('r2', 'known'),
    gpio: w('r2', 'plain'),
    output: w('r2', 'output'),
    pullup: w('r2', 'pull'),
    input: w('r2', 'input'),
  },
  read: {
    cant: w('r3', 'read'),
    zero: w('r3', 'zero'),
    /** the button is pressed on screen while it still reads 0 */
    presses: [
      [w('r3', 'read', 0, 0.36), w('r3', 'read', 0, 1.56)],
      [w('r3', 'zero', 0, 0.76), w('r3', 'zero', 0, 1.96)],
    ] as [number, number][],
  },
  captions: [
    { at: at('r1'), text: 'gpio_reset_pin(BUTTON) — the same first step as the LED' },
    { at: at('r2'), text: 'reset → plain GPIO · output off · weak pull-up on · input OFF' },
    { at: at('r3'), text: 'input off → gpio_get_level() returns 0, pressed or not' },
  ] as Caption[],
};

// ── 5. gpio_set_direction ──────────────────────────────────────────────────

export const DIRECTION = {
  code: 'gpio_set_direction(BUTTON, GPIO_MODE_INPUT);',
  run: w('s1', 'direction'),
  args: [
    { token: 'BUTTON', at: w('s1', 'pin'), title: 'pin', value: 'GPIO_NUM_18', sub: 'which pin' },
    { token: 'GPIO_MODE_INPUT', at: w('s1', 'mode'), title: 'mode', value: 'GPIO_MODE_INPUT', sub: 'what the pin does' },
  ],
  views: { buffer: at('s2'), forget: at('s3'), any: at('s4') },
  buffer: {
    on: w('s2', 'switches'),
    buffer: w('s2', 'buffer'),
    driverOff: w('s2', 'driver'),
    listens: w('s2', 'listens'),
  },
  forget: {
    line: w('s3', 'line'),
    zero: w('s3', 'zero'),
    pressed: w('s3', 'pressed'),
    forever: w('s3', 'forever'),
  },
  any: {
    every: w('s4', 'every'),
    gpio34: w('s4', 'even', 0, 0.3),
    outputs: w('s4', 'outputs'),
  },
  captions: [
    { at: at('s1'), text: 'gpio_set_direction(pin, mode)' },
    { at: at('s2'), text: 'GPIO_MODE_INPUT: input buffer on, output driver off — the pin only listens' },
    { at: at('s3'), text: 'forget it → gpio_get_level() is always 0 → with a button to GND, "pressed" forever' },
    { at: at('s4'), text: 'input mode works on every GPIO — even 34–39 (only output modes are refused)' },
  ] as Caption[],
};

// ── 6. gpio_set_pull_mode ──────────────────────────────────────────────────

/** QEMU, lab/logs/v1.log: the pull on GPIO 34 */
export const LOG_PULL_34 = 'E (1583) gpio: gpio_pullup_en(88): GPIO number error (input-only pad has no internal PU)';

export const PULL = {
  code: 'gpio_set_pull_mode(BUTTON, GPIO_PULLUP_ONLY);',
  run: w('u1', 'pull'),
  args: [
    { token: 'BUTTON', at: w('u1', 'pin', 1), title: 'pin', value: 'GPIO_NUM_18', sub: 'which pin' },
    { token: 'GPIO_PULLUP_ONLY', at: w('u1', 'pull', 1), title: 'pull', value: 'GPIO_PULLUP_ONLY', sub: 'the default level' },
  ],
  views: { modes: at('u2'), current: at('u3'), already: at('u4'), gpio34: at('u5') },
  modes: {
    up: w('u2', 'up'),
    down: w('u2', 'down'),
    both: w('u2', 'both'),
    floating: w('u2', 'floating'),
    connects: w('u2', 'connects'),
    disconnects: w('u2', 'disconnects'),
  },
  current: {
    k45: w('u3', 'about', 0, 0.3),
    press: w('u3', 'press'),
    ua: w('u3', 'flow', 0, -1.0),
    harmless: w('u3', 'harmless'),
    release: w('u3', 'harmless', 0, 0.8),
  },
  already: {
    reset: w('u4', 'reset'),
    side: w('u4', 'side'),
    say: w('u4', 'Say'),
    reader: w('u4', 'reads'),
  },
  gpio34: {
    code: at('u5') + 0.26,
    none: w('u5', 'resistor'),
    log: w('u5', 'logs'),
    ok: w('u5', 'returns'),
    check: w('u5', 'catch', 0, -1.2),
    board: w('u5', 'need'),
  },
  captions: [
    { at: at('u1'), text: 'gpio_set_pull_mode(pin, pull) — the level when nothing else drives the pin' },
    { at: at('u2'), text: 'GPIO_PULLUP_ONLY: pull-up to 3.3 V connected · pull-down disconnected' },
    { at: at('u3'), text: '3.3 V ÷ 45 kΩ ≈ 73 µA when pressed (datasheet: ~75 µA) — tiny' },
    { at: at('u4'), text: 'gpio_reset_pin turned it on as a side effect — say it on purpose' },
    { at: at('u5'), text: 'GPIO 34–39: no pull resistors · logs an error, returns ESP_OK → add a resistor' },
  ] as Caption[],
};

// ── 7. gpio_get_level ──────────────────────────────────────────────────────

export const READ = {
  code: 'int level = gpio_get_level(BUTTON);',
  run: w('g1', 'level'),
  args: [
    { token: 'int', at: w('g1', 'returns'), title: 'returns', value: 'int · 1 or 0', sub: 'the level, right now' },
    { token: 'BUTTON', at: w('g1', 'pin'), title: 'pin', value: 'GPIO_NUM_18', sub: 'which pin' },
  ],
  views: { ret: at('g2'), snap: at('g3'), compare: at('g4') },
  ret: {
    plain: w('g2', 'plain'),
    notErr: w('g2', 'not'),
    wrap: w('g2', 'wrap'),
    fail: w('g2', 'failure'),
  },
  snap: {
    moment: w('g3', 'moment'),
    wait: w('g3', 'wait'),
    remember: w('g3', 'remember'),
    /** a short press that slips between two reads */
    press: [w('g3', 'wait', 0, 0.74), w('g3', 'wait', 0, 1.34)] as [number, number],
    reads: [w('g3', 'wait', 0, -0.46), w('g3', 'remember', 0, 0.12)] as const,
  },
  compare: {
    zero: w('g4', 'zero'),
    compare: w('g4', 'compare'),
    mean: w('g4', 'mean'),
  },
  captions: [
    { at: at('g1'), text: 'gpio_get_level(pin) → 1 or 0' },
    { at: at('g2'), text: 'returns int, not esp_err_t → nothing to check · ESP_ERROR_CHECK(1) would abort' },
    { at: at('g3'), text: 'a snapshot: the level at the moment of the call — no waiting, no memory' },
    { at: at('g4'), text: 'pull-up → pressed reads 0 → pressed = (gpio_get_level(BUTTON) == 0)' },
  ] as Caption[],
};

// ── 8. demo: button → LED ─────────────────────────────────────────────────

/** the demo's presses: a few after the loop starts, then one 4 ms after a tick on "Press" (the
 *  LED follows 6 ms later), then two more */
function demoPresses(): [number, number][] {
  const run = w('d1', 'forever');
  const press = at('d3');
  const k = Math.ceil(((press - run) * 1000) / TICK_MS);
  const p = +(run + (k * TICK_MS) / 1000 + 0.004).toFixed(3);
  return [
    [run + 1.18, run + 2.38],
    [run + 7.28, run + 8.48],
    [run + 10.48, run + 10.98],
    [run + 11.88, run + 12.38],
    [p, p + 1.7],
    [press + 3.6, press + 4.4],
    [press + 8.2, press + 9.6],
  ];
}
export const DEMO = {
  preamble: ['#define LED    GPIO_NUM_2', '#define BUTTON GPIO_NUM_18', ''],
  lines: [
    'void app_main(void)',
    '{',
    '    gpio_reset_pin(LED);',
    '    gpio_set_direction(LED, GPIO_MODE_OUTPUT);',
    '    gpio_reset_pin(BUTTON);',
    '    gpio_set_direction(BUTTON, GPIO_MODE_INPUT);',
    '    gpio_set_pull_mode(BUTTON, GPIO_PULLUP_ONLY);',
    '',
    '    while (1) {',
    '        bool pressed = (gpio_get_level(BUTTON) == 0);',
    '        gpio_set_level(LED, pressed);',
    '        vTaskDelay(pdMS_TO_TICKS(10));',
    '    }',
    '}',
  ],
  idx: { led: [2, 3], btn: [4, 5, 6], read: 9, write: 10, delay: 11 },
  led: w('d1', 'LED'),
  button: w('d1', 'button'),
  run: w('d1', 'forever'), // the loop starts, in real time
  read: w('d1', 'read'),
  copy: w('d1', 'copy'),
  wait: w('d1', 'wait'),
  tick: w('d2', 'tick'),
  hundred: w('d2', 'times', 0, -0.6),
  free: w('d2', 'free'),
  press: at('d3'),
  follows: w('d3', 'follows'),
  ten: w('d3', 'milliseconds', 0, -0.5),
  fifty: w('d3', 'milliseconds', 1, -0.6),
  instant: w('d3', 'instant'),
  /** when the finger is down (scene seconds) — the reads, the LED and the clicks all follow this */
  presses: demoPresses(),
  /** the first press after "Press" — its read is zoomed in the latency inset */
  zoomPress: 4,
  captions: [
    { at: at('d1'), text: 'read the button → copy it to the LED → wait one tick · forever' },
    { at: at('d2'), text: 'pdMS_TO_TICKS(10) = 1 tick → ~100 reads a second · CPU free in between' },
    { at: at('d3'), text: 'the LED follows within ~10 ms — 50 ms already feels instant (Ganssle)' },
  ] as Caption[],
};

/** demo: the loop reads the pin at each tick from `run`; the LED shows the last read */
export function demoRead(t: number): { down: boolean; led: boolean; lastRead: number } {
  const down = downAt(DEMO.presses, t);
  if (t < DEMO.run) return { down, led: false, lastRead: -1 };
  const k = Math.floor(((t - DEMO.run) * 1000) / TICK_MS);
  const lastRead = DEMO.run + (k * TICK_MS) / 1000;
  return { down, led: downAt(DEMO.presses, lastRead), lastRead };
}

// ── 9. counting presses ───────────────────────────────────────────────────

/** QEMU, lab/logs/v2.log: the count loop, one simulated press */
export const LOG_PRESS = 'I (5085) button: presses: 1';

export const COUNT = {
  code: [
    'int last = 1, presses = 0;',
    'while (1) {',
    '    int level = gpio_get_level(BUTTON);',
    '    if (last == 1 && level == 0) {',
    '        presses++;',
    '        ESP_LOGI(TAG, "presses: %d", presses);',
    '    }',
    '    last = level;',
    '    vTaskDelay(pdMS_TO_TICKS(10));',
    '}',
  ],
  views: { hold: at('e1'), edge: at('e2'), bounce: at('e3'), stats: at('e4'), grids: at('e5'), debounce: at('e6') },
  hold: {
    zeros: w('e1', 'Counting'),
    hold: w('e1', 'hold'),
    second: w('e1', 'second'),
    hundred: w('e1', 'zeros', 1, -0.6),
  },
  edge: {
    change: w('e2', 'change'),
    one: w('e2', '1'),
    zero: w('e2', '0'),
    remember: w('e2', 'remember'),
    falls: w('e2', 'drops'),
  },
  bounce: {
    zoom: w('e3', 'zoom'),
    bounces: w('e3', 'bounces'),
    hit: w('e3', 'hit'),
    apart: w('e3', 'apart'),
    again: w('e3', 'hit', 1),
  },
  stats: {
    ganssle: w('e4', 'tests', 0, -0.8),
    avg: w('e4', 'milliseconds', 0, -1.2),
    worst: w('e4', 'worst'),
    six: w('e4', 'worst', 0, 0.68),
  },
  grids: {
    fast: w('e5', 'million'),
    several: w('e5', 'several'),
    slow: w('e5', 'every'),
    inside: w('e5', 'most'),
    one: w('e5', 'gives', 0, -0.6),
  },
  debounce: {
    debouncer: w('e6', 'debouncer'),
    filter: w('e6', 'filter'),
    job: w('e6', 'job'),
    most: w('e6', 'Most'),
    bad: w('e6', 'bad'),
  },
  /** the bounce, in ms from first contact: [start, end] of each LOW stretch before it settles */
  bounceLows: [
    [0, 0.25],
    [0.45, 0.8],
    [1.0, 1.15],
    [1.35, 1.55],
    [1.62, 99],
  ] as [number, number][],
  captions: [
    { at: at('e1'), text: 'counting zeros counts "held down": 1 s × 100 reads = 100' },
    { at: at('e2'), text: 'a press is a change: last == 1 && level == 0 → count it' },
    { at: at('e3'), text: 'zoomed in: the contacts bounce before they settle' },
    { at: at('e4'), text: 'Ganssle, 16 switches: ~1.6 ms bounce on average · 6.2 ms worst' },
    { at: at('e5'), text: 'reads 10 ms apart → at most one lands in the bounce → one press, one count' },
    { at: at('e6'), text: 'ESP32: no hardware glitch filter → the 10 ms poll is your debouncer' },
  ] as Caption[],
};

/** is the bouncing contact LOW (closed), `ms` after first contact? */
export const bounceLow = (ms: number) => COUNT.bounceLows.some(([a, b]) => ms >= a && ms < b);
/** falling edges seen by samples every `dtMs` from `offMs` over [fromMs, toMs] */
export function countFalls(dtMs: number, offMs: number, fromMs: number, toMs: number): number {
  let last = 1;
  let n = 0;
  for (let s = offMs; s <= toMs; s += dtMs) {
    if (s < fromMs) continue;
    const v = bounceLow(s) ? 0 : 1;
    if (last === 1 && v === 0) n++;
    last = v;
  }
  return n;
}

// ── 10. second knob: pull-up vs pull-down ─────────────────────────────────

export const PULLS = {
  views: { split: at('k1'), both: at('k3') },
  split: {
    flip: w('k1', 'flip'),
    vcc: w('k1', 'volts', 0, -0.6),
    down: w('k1', 'choose'),
    released: w('k2', 'released'),
    pressed: w('k2', 'pressed'),
    same: w('k2', 'same'),
    opposite: w('k2', 'opposite'),
    presses: [
      [w('k2', 'pressed', 0, -0.24), w('k2', 'pressed', 0, 1.06)],
      [w('k2', 'pressed', 0, 2.26), w('k2', 'pressed', 0, 3.46)],
    ] as [number, number][],
  },
  both: {
    never: w('k3', 'never'),
    split: w('k3', 'split'),
    v165: w('k3', 'volts', 0, -1.2),
    zone: w('k3', 'zone'),
  },
  captions: [
    { at: at('k1'), text: 'button to 3.3 V + GPIO_PULLDOWN_ONLY → released 0 · pressed 1' },
    { at: at('k3'), text: 'GPIO_PULLUP_PULLDOWN: 45 kΩ + 45 kΩ → ≈ 1.65 V → undefined ✗' },
  ] as Caption[],
};

// ── 11. payoff ─────────────────────────────────────────────────────────────

const PAY_LINE = w('x1', 'That');
export const PAYOFF = {
  input: w('x1', 'input'),
  pull: w('x1', 'pull'),
  level: w('x1', 'level'),
  line: PAY_LINE,
  recap: [
    { at: PAY_LINE + 1.14, k: 'gpio_set_direction(…, INPUT)', v: 'input buffer on' },
    { at: PAY_LINE + 1.49, k: 'gpio_set_pull_mode(…, PULLUP_ONLY)', v: 'a default level · 45 kΩ' },
    { at: PAY_LINE + 1.84, k: 'gpio_get_level(pin)', v: '0 or 1 · right now' },
    { at: PAY_LINE + 2.19, k: 'read every tick', v: 'one press, one count — bounce ignored' },
    { at: PAY_LINE + 2.54, k: 'polling', v: 'next: two jobs at once → FreeRTOS' },
  ],
};

// ── voiceover (scratch: edge-tts) ─────────────────────────────────────────

/** `text` is the script as written; `say` is what the TTS reads, if different; `pause` the silence before it */
export type VoLine = { id: string; scene: InSceneId; at: number; text: string; say?: string; pause?: number };
export const VOICE = 'en-US-AndrewMultilingualNeural';
const L = (id: string, scene: InSceneId, text: string, o: { say?: string; pause?: number } = {}): VoLine => ({ id, scene, at: at(id), text, ...o });

export const VO: VoLine[] = [
  // 1 · problem: the want, and the first try
  L('p1', 'problem', 'Let\'s say you want your program to know when someone presses a button.', { pause: 0.6 }),
  L('p2', 'problem', 'The obvious first try is to wire the button from a pin to ground, and read the pin. Press the button, and the pin is tied to zero volts, so the program reads zero.', { pause: 0.6 }),
  L('p3', 'problem', 'But when you let go, the pin is connected to nothing at all. It floats. It might read one, it might read zero, and it can change on its own.', { pause: 0.7 }),
  L('p4', 'problem', 'So how do you give a pin a level when nothing is driving it?', { pause: 0.8 }),
  // 2 · answer
  L('a1', 'answer', 'The fix is to give the pin a gentle default. A resistor to three point three volts holds the pin high, as long as nothing else is in charge.'),
  L('a2', 'answer', 'When you press the button, its short path to ground takes over, and the pin drops to zero.', { pause: 0.6 }),
  L('a3', 'answer', 'So released reads one, and pressed reads zero. That resistor is called a pull-up.', { say: 'So released reads one, and pressed reads zero. That resistor is called a pull up.', pause: 0.6 }),
  // 3 · circuit
  L('c1', 'circuit', "On the breadboard, one leg of the button goes to GPIO 18, and the other leg goes to ground. You don't need a resistor, because the ESP32 has the pull-up built in.", { say: "On the breadboard, one leg of the button goes to GPIO eighteen, and the other leg goes to ground. You don't need a resistor, because the ESP32 has the pull up built in." }),
  L('c2', 'circuit', "So why GPIO 18? It isn't a strapping pin, it isn't wired to the flash, and it has an internal pull-up. GPIO 34 to 39 don't have one.", { say: "So why GPIO eighteen? It isn't a strapping pin, it isn't wired to the flash, and it has an internal pull up. GPIO thirty-four to thirty-nine don't have one.", pause: 0.8 }),
  L('c3', 'circuit', "The datasheet guarantees that the pin reads one above two point four seven five volts, and zero below zero point eight two five volts. In between, it promises nothing, and that's exactly where a floating pin lives.", { pause: 0.8 }),
  // 4 · reset
  L('r1', 'reset', "In app_main, you start the same way as for an output: gpio_reset_pin, with the button's pin.", { say: "In app main, you start the same way as for an output: GPIO reset pin, with the button's pin." }),
  L('r2', 'reset', 'It puts the pin in a known state: a plain GPIO with its output off, and, to save power, a weak pull-up. But the input is switched off too.', { say: 'It puts the pin in a known state: a plain GPIO with its output off, and, to save power, a weak pull up. But the input is switched off too.', pause: 0.6 }),
  L('r3', 'reset', "So right now, the pin can't be read at all. gpio_get_level returns zero, whatever the button does.", { say: "So right now, the pin can't be read at all. GPIO get level returns zero, whatever the button does.", pause: 0.6 }),
  // 5 · direction
  L('s1', 'direction', 'Next, gpio_set_direction makes it an input. It takes two arguments: the pin, and the mode.', { say: 'Next, GPIO set direction makes it an input. It takes two arguments: the pin, and the mode.' }),
  L('s2', 'direction', "GPIO_MODE_INPUT switches on the pin's input buffer, and leaves its output driver off, so the pin only listens.", { say: "GPIO mode input switches on the pin's input buffer, and leaves its output driver off, so the pin only listens.", pause: 0.7 }),
  L('s3', 'direction', 'If you forget this line, gpio_get_level always returns zero. With a button to ground, zero means pressed, so your program thinks the button is held down forever.', { say: 'If you forget this line, GPIO get level always returns zero. With a button to ground, zero means pressed, so your program thinks the button is held down forever.', pause: 0.7 }),
  L('s4', 'direction', 'Input mode works on every GPIO, even thirty-four to thirty-nine. The error you saw on pin thirty-four in the GPIO video only applies to outputs.', { pause: 0.7 }),
  // 6 · pull
  L('u1', 'pull', "Then gpio_set_pull_mode chooses the pin's default level. Again, it takes two arguments: the pin, and the pull.", { say: "Then GPIO set pull mode chooses the pin's default level. Again, it takes two arguments: the pin, and the pull." }),
  L('u2', 'pull', 'There are four choices: up only, down only, both at once, or none, which leaves the pin floating. GPIO_PULLUP_ONLY connects the internal resistor to three point three volts, and disconnects the one to ground.', { say: 'There are four choices: up only, down only, both at once, or none, which leaves the pin floating. GPIO pull up only connects the internal resistor to three point three volts, and disconnects the one to ground.', pause: 0.7 }),
  L('u3', 'pull', 'That resistor is about forty-five kilohms. When you press the button, about seventy-three microamps flow through it, which is tiny, and harmless.', { pause: 0.7 }),
  L('u4', 'pull', 'gpio_reset_pin had already turned the pull-up on, but only as a side effect. Say it in your code, so the next person who reads it knows the button needs it.', { say: 'GPIO reset pin had already turned the pull up on, but only as a side effect. Say it in your code, so the next person who reads it knows the button needs it.', pause: 0.7 }),
  L('u5', 'pull', "On GPIO 34, there's no resistor to connect. The call logs an error, but then returns ESP_OK anyway, so ESP_ERROR_CHECK won't catch it. Pins like that need a resistor on the board.", { say: "On GPIO thirty-four, there's no resistor to connect. The call logs an error, but then returns E S P OK anyway, so E S P error check won't catch it. Pins like that need a resistor on the board.", pause: 0.8 }),
  // 7 · read
  L('g1', 'read', 'Now you can read it. gpio_get_level takes the pin, and returns its level: one or zero.', { say: 'Now you can read it. GPIO get level takes the pin, and returns its level: one or zero.' }),
  L('g2', 'read', "Notice what it returns: a plain int, not an esp_err_t. There's no error to check, so don't wrap it in ESP_ERROR_CHECK, where a one would look like a failure.", { say: "Notice what it returns: a plain int, not an E S P error code. There's no error to check, so don't wrap it in E S P error check, where a one would look like a failure.", pause: 0.7 }),
  L('g3', 'read', "The value is a snapshot: the level at the moment you ask. It doesn't wait for a press, and it doesn't remember one.", { pause: 0.7 }),
  L('g4', 'read', 'And with a pull-up, pressed reads zero. So compare the level with zero, and you get the answer you mean.', { say: 'And with a pull up, pressed reads zero. So compare the level with zero, and you get the answer you mean.', pause: 0.6 }),
  // 8 · demo
  L('d1', 'demo', 'Now put it all together. Set up the LED and the button. Then, forever: read the button, copy its state to the LED, and wait one tick.'),
  L('d2', 'demo', 'Ten milliseconds is one tick, which is the shortest wait there is. So the loop reads the button about a hundred times a second, and the CPU is free in between.', { pause: 0.7 }),
  L('d3', 'demo', 'Press the button, and the LED follows within ten milliseconds. Jack Ganssle found that fifty milliseconds already feels instant.', { pause: 0.7 }),
  // 9 · count
  L('e1', 'count', "Now let's count presses. Counting zeros doesn't work: if you hold the button for one second, that's a hundred zeros."),
  L('e2', 'count', 'A press is a change: one, then zero. So remember the last level, and count a press only when the level drops from one to zero.', { pause: 0.7 }),
  L('e3', 'count', "But zoom in on that edge, and you'll see that a real switch bounces. The metal contacts hit, spring apart, and hit again.", { pause: 0.7 }),
  L('e4', 'count', "In Jack Ganssle's tests, most switches bounced for about one and a half milliseconds, and the worst of them for six.", { pause: 0.6 }),
  L('e5', 'count', 'If you read the pin a million times a second, one press can count as several. If you read it every ten milliseconds, at most one reading lands inside the bounce, so one press gives one count.', { pause: 0.7 }),
  L('e6', 'count', "That one-tick delay is your debouncer. The ESP32 has no hardware filter for this, so it's your code's job. Most switches settle well within ten milliseconds, but a bad one can bounce for longer.", { pause: 0.7 }),
  // 10 · pulls
  L('k1', 'pulls', 'You can also flip the whole thing around. Wire the button to three point three volts instead, and choose GPIO_PULLDOWN_ONLY.', { say: 'You can also flip the whole thing around. Wire the button to three point three volts instead, and choose GPIO pull down only.' }),
  L('k2', 'pulls', "Now released reads zero, and pressed reads one. It's the same resistor and the same tiny current, but with the opposite logic.", { pause: 0.6 }),
  L('k3', 'pulls', "Just never turn on both. Two equal resistors split the voltage in half, to about one point six five volts, right in the zone the datasheet doesn't promise.", { pause: 0.8 }),
  // 11 · payoff
  L('x1', 'payoff', "So: make the pin an input, give it a pull, and read its level. That's a GPIO input.", { say: "So, make the pin an input, give it a pull, and read its level. That's a GPIO input." }),
];
