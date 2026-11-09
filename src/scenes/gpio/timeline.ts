/**
 * GPIO — the timeline. Single source of truth for picture AND sound.
 * PURE ESP-IDF: app_main, driver/gpio.h, vTaskDelay(pdMS_TO_TICKS(ms)). No Arduino.
 *
 *   problem → answer → circuit → gpio_reset_pin → gpio_set_direction
 *     → gpio_set_level → blink → vTaskDelay → second knob (current)
 *     → under the hood → payoff
 *
 * Every time below is SCENE-RELATIVE (seconds from that scene's start), so a
 * scene can be lengthened without touching any other. The audio generator
 * converts to absolute time with `sceneStart()`.
 *
 * v3 (narration pass): the VO follows SCRIPT.md "Sound like a teacher" and opens on the
 * want; every cue is `w(line, word)` from the generated block below (`node
 * scripts/vo-plan.ts gpio`), so a wording change re-times the picture. The log lines on
 * screen are real QEMU output (./lab).
 *
 * Import-free on purpose (type-only imports are erased): Node runs it as-is.
 *
 *   npm run gpio:audio   # regenerate soundtrack
 *   npm run gpio         # audio + render
 *
 * Every claim on screen or in the VO is sourced in ./FACTS.md.
 */
import type { Caption, Mark } from '../../components/pwm';

export const FPS = 30;

// ── generated: VO plan (node scripts/vo-plan.ts gpio) — do not edit by hand ──
export const VO_AT: Record<string, number> = {"p1":0.6,"p2":3.32,"p3":13.26,"p4":20.8,"p5":32.6,"a1":0.5,"a2":7.08,"c1":0.5,"c2":11.52,"c3":21.32,"c4":38.32,"c5":51.84,"c6":64.26,"r1":0.5,"r2":7.44,"r3":17.46,"r4":23.3,"s1":0.5,"s2":7.82,"s3":17.44,"s4":28.38,"s5":36.52,"s6":43.66,"d1":0.5,"d2":10.64,"d3":19.24,"d4":30.86,"d5":36.08,"b1":0.5,"b2":13.8,"y1":0.5,"y2":8.5,"y3":19.98,"y4":27.96,"y5":39.7,"y6":47.16,"k1":0.5,"k2":9.18,"k3":18.52,"k4":27.68,"x1":0.5};
export const SCENE_DUR: Record<string, number> = {"problem":36.8,"answer":15.08,"circuit":71.52,"reset":34.2,"direction":59.92,"write":48.54,"blink":22.78,"delay":56.22,"current":39.42,"payoff":10.16};
export const VO_WORDS: Record<string, [string, number][]> = {
  p1: [["Let's",0],["say",0.32],["you",0.4],["want",0.52],["your",0.64],["code",0.78],["to",0.96],["switch",1.16],["on",1.44],["an",1.8],["LED.",1.9]],
  p2: [["The",0],["LED",0.24],["is",0.6],["wired",1.04],["to",1.38],["GPIO2",1.6],["and",2.52],["the",3.06],["obvious",3.18],["first",3.56],["try",3.9],["is",4.3],["a",4.56],["single",4.76],["line.",4.94],["GPIO",6.02],["set",6.36],["level",6.72],["with",7],["a",7.36],["pin",7.5],["and",7.8],["a",8.48],["one",8.56],["for",8.8],["on.",8.98]],
  p3: [["Flash",0],["it,",0.46],["and",1.16],["the",1.28],["call",1.34],["returns",1.54],["ESPOK.",2.08],["There's",4.04],["no",4.2],["error",4.36],["at",4.62],["all,",4.74],["but",5.32],["the",5.44],["LED",5.56],["stays",5.98],["dark.",6.42]],
  p4: [["That's",0],["because",0.32],["right",0.52],["after",0.86],["reset,",1.18],["every",2.28],["ESP32",2.5],["pin",3.74],["is",4.12],["listening,",4.52],["not",5.48],["driving.",5.54],["Setting",6.64],["its",6.76],["level",6.98],["changes",7.26],["nothing",7.88],["until",8.5],["the",9],["pin",9.16],["is",9.44],["allowed",9.8],["to",10.12],["drive",10.42],["the",10.7],["wire.",10.88]],
  p5: [["So",0],["how",0.24],["do",0.34],["you",0.4],["make",0.44],["a",0.54],["pin",0.66],["switch",0.86],["something",1.1],["on?",1.38]],
  a1: [["It",0],["takes",0.22],["two",0.38],["steps.",0.68],["First,",1.82],["you",2.4],["make",2.48],["the",2.58],["pan",2.72],["and",2.96],["output.",3.14],["Then",4],["you",4.08],["set",4.16],["its",4.3],["level",4.46],["high",4.72],["or",5.46],["low.",5.74]],
  a2: [["A",0],["pin",0.26],["that",0.38],["can",0.52],["do",0.64],["this",0.84],["is",1.14],["called",1.38],["AGPIO,",1.72],["a",3.94],["general",3.96],["purpose",4.28],["input",4.78],["output",5.26],["pin.",5.68]],
  c1: [["Let's",0],["start",0.32],["with",0.48],["the",0.62],["circuit.",0.78],["It",1.66],["runs",1.68],["from",1.94],["GPIO2",2.24],["on",3.32],["the",3.54],["module",3.66],["through",4.04],["a",4.6],["220",4.72],["ohm",5.12],["resistor",5.42],["into",5.84],["the",6.36],["long",6.54],["leg",6.86],["of",7.18],["the",7.36],["LED",7.48],["and",7.82],["out",8.82],["of",9.1],["the",9.2],["short",9.3],["leg",9.52],["to",9.8],["ground.",10.02]],
  c2: [["When",0],["the",0.24],["pin",0.36],["is",0.5],["high,",0.66],["it",1.48],["sits",1.62],["at",1.8],["about",1.92],["3",2.14],[".3",2.56],["volts.",3.16],["Current",4.22],["flows",4.32],["out",4.78],["of",5.24],["the",5.34],["pin",5.42],["through",5.72],["the",6.2],["LED",6.36],["to",6.78],["ground",7.2],["and",7.58],["the",8.14],["LED",8.24],["lights.",8.58]],
  c3: [["Here's",0],["the",0.34],["same",0.44],["loop,",0.66],["drawn",1.34],["as",1.64],["a",2.04],["schematic.",2.16],["The",3.16],["resistor",3.24],["sets",3.48],["how",4],["much",4.68],["current",4.96],["flows.",5.28],["The",6.42],["LED",6.5],["drops",6.8],["about",7.3],["2",7.6],["volts,",7.96],["which",8.76],["leaves",8.86],["1",9.06],[".3",9.38],["volts",9.96],["across",10.24],["the",10.64],["resistor.",10.88],["1",11.88],[".3",12.12],["volts",12.74],["over",13.12],["220",13.56],["ohms",14.22],["is",14.84],["about",15.14],["6",15.36],["milliamps.",15.68]],
  c4: [["So",0],["why",0.26],["GPIO2,",0.42],["and",1.66],["not",1.82],["just",1.98],["any",2.14],["pin?",2.32],["Pins",3.3],["34",3.34],["to",3.96],["39",4.22],["can",4.8],["only",5.26],["be",5.5],["inputs.",5.66],["Pins",6.84],["6",6.98],["to",7.28],["11",7.52],["are",7.8],["wired",8.18],["to",8.76],["the",9.08],["flash",9.22],["chip.",9.48],["And",10.28],["pins",10.46],["1",10.78],["and",11.04],["3",11.16],["are",11.62],["used",12],["for",12.26],["uploading.",12.48]],
  c5: [["GPO2",0],["is",0.9],["also",1.28],["a",1.68],["strapping",1.88],["pin.",2.28],["The",3.06],["chip",3.14],["reads",3.34],["it",3.64],["at",3.74],["reset",3.88],["to",4.28],["decide",4.54],["how",4.94],["to",5.16],["boot.",5.28],["Wire",6.2],["to",6.2],["ground",6.34],["through",6.64],["the",6.86],["LED,",7],["it",7.96],["stays",8.14],["low,",8.38],["and",9.36],["low",9.44],["is",9.62],["safe",9.78],["for",10.12],["both",10.38],["booting",10.64],["and",11.18],["flashing.",11.44]],
  c6: [["Many",0],["boards",0.28],["already",0.54],["have",0.86],["an",1.12],["LED",1.24],["on",1.58],["GPIO2,",1.9],["but",3.16],["not",3.3],["all",3.46],["of",3.68],["them,",3.8],["so",4.32],["check",4.54],["yours.",4.78]],
  r1: [["Now",0],["for",0.28],["the",0.44],["code.",0.54],["In",1.24],["App",1.36],["main,",1.52],["start",2.18],["with",2.36],["GPIO",2.52],["reset",3.12],["pin.",3.68],["It",4.48],["takes",4.56],["one",4.74],["argument,",5.08],["the",5.96],["pin.",6.1]],
  r2: [["That's",0],["a",0.36],["GPIO",0.44],["number,",0.88],["not",1.7],["a",1.96],["position",2.06],["on",2.32],["the",2.54],["package.",2.64],["On",3.64],["the",3.66],["WROM",3.82],["module,",4.24],["GPIO2",5.28],["comes",6.02],["out",6.36],["on",6.6],["pin",6.8],["24,",7.04],["which",8.1],["is",8.14],["labeled",8.3],["I02.",8.56]],
  r3: [["The",0],["ESP32",0.24],["has",1.2],["34",1.62],["GPIOs",2.22],["and",3.34],["28",3.56],["of",3.96],["them",4.12],["can",4.32],["be",4.6],["outputs.",4.76]],
  r4: [["Resetting",0],["puts",0.6],["the",0.8],["pin",1.02],["in",1.28],["a",1.44],["known",1.6],["state.",1.8],["A",2.84],["plain",2.9],["GPIO",3.18],["with",3.74],["its",4.32],["input",4.46],["off,",4.8],["its",5.42],["output",5.52],["off,",5.92],["and",6.76],["a",6.96],["weak",7.04],["pull",7.18],["up",7.44],["so",7.72],["it",8.32],["isn't",8.42],["left",8.64],["floating.",8.8]],
  s1: [["Next,",0],["GPIO",0.92],["set",1.24],["direction",1.56],["makes",1.98],["the",2.44],["pin",2.64],["an",2.86],["output.",3],["It",3.92],["takes",4.04],["two",4.22],["arguments,",4.5],["the",5.46],["pin",5.54],["and",5.86],["the",6.28],["mode.",6.38]],
  s2: [["GPIO",0],["mode",0.54],["output",0.9],["switches",1.38],["on",1.78],["the",2],["pin's",2.1],["output",2.54],["driver.",2.92],["Until",3.94],["now,",4.16],["the",4.92],["pin",5.06],["was",5.22],["only",5.4],["listening.",5.68],["Now",6.66],["it",6.74],["can",6.84],["drive",6.98],["the",7.32],["wire",7.52],["high",7.8],["or",8.22],["low.",8.68]],
  s3: [["It's",0],["output",0.28],["only",0.52],["though,",0.84],["the",1.66],["input",1.82],["is",2.18],["switched",2.4],["off,",2.7],["so",3.6],["GPIO",3.68],["get",4.14],["level",4.34],["would",4.54],["always",4.72],["read",5],["zero.",5.32],["If",6.24],["you",6.32],["want",6.4],["to",6.48],["read",6.52],["the",6.62],["pin",6.74],["back,",6.9],["use",7.6],["GPIO",7.84],["mode",8.42],["input",8.84],["output",9.24],["instead.",9.62]],
  s4: [["What",0],["if",0.22],["you",0.3],["try",0.4],["this",0.6],["on",0.76],["a",0.88],["pin",0.98],["that",1.16],["can't",1.38],["drive",1.76],["like",2.04],["34?",2.24],["It",3.3],["logs",3.5],["an",3.74],["error",3.98],["and",4.28],["returns",4.72],["ESP",5.16],["error",5.9],["invalid",6.78],["arg.",7.3]],
  s5: [["If",0],["you",0.22],["put",0.34],["the",0.44],["call",0.56],["inside",0.78],["ESP",1.3],["error",1.98],["check,",2.34],["that",3.12],["error",3.24],["stops",3.5],["the",3.82],["program",4.04],["instead",4.42],["of",5.2],["slipping",5.34],["by",5.64],["unnoticed.",5.92]],
  s6: [["One",0],["more",0.38],["detail,",0.56],["the",1.6],["datasheet",1.76],["doesn't",2.24],["promise",2.76],["which",3.08],["level",3.38],["the",3.58],["pin",3.76],["starts",3.92],["at.",4.2],["If",4.94],["that",5.1],["matters,",5.28],["call",6.02],["GPIO",6.36],["set",7.06],["level",7.64],["first.",7.88],["The",8.88],["level",9.04],["waits",9.3],["in",9.66],["its",10.1],["register",10.24],["and",10.68],["the",11.28],["pin",11.38],["starts",11.62],["at",11.96],["that",12.16],["level",12.34],["the",12.58],["moment",12.7],["its",12.94],["output",13.18],["turns",13.64],["on.",13.96]],
  d1: [["Then",0],["GPIO",0.38],["set",0.96],["level",1.64],["sets",2.14],["the",2.68],["level.",2.9],["It",3.6],["takes",3.8],["two",4.02],["arguments,",4.36],["the",5.54],["pin",5.6],["and",5.94],["the",6.62],["level,",6.76],["which",7.48],["is",7.64],["one",7.8],["for",8.06],["high",8.28],["and",8.56],["zero",8.7],["for",8.88],["low.",9.22]],
  d2: [["A",0],["1",0.22],["drives",0.4],["the",0.7],["pin",0.88],["to",1.08],["3",1.28],[".3",1.64],["volts",2.24],["and",2.46],["the",2.9],["LED",3.02],["lights.",3.24],["A",4.24],["0",4.44],["pulls",4.72],["it",5.04],["to",5.18],["0",5.32],["volts",5.66],["and",6.1],["the",6.58],["LED",6.7],["goes",7.06],["dark.",7.56]],
  d3: [["The",0],["datasheet",0.24],["guarantees",0.7],["that",1.22],["high",1.58],["is",1.84],["at",2],["least",2.08],["2",2.26],[".64",2.66],["volts",3.42],["and",3.7],["low",4.54],["is",4.8],["at",5.12],["most",5.24],["0",5.48],[".33",5.88],["volts.",6.74],["Those",7.9],["are",8.02],["the",8.14],["only",8.24],["two",8.52],["levels",8.92],["a",9.26],["digital",9.5],["output",9.76],["gives",10.26],["you.",10.7]],
  d4: [["The",0],["level",0.24],["is",0.48],["a",0.74],["whole",0.86],["number,",1.1],["and",1.84],["any",2.08],["number",2.4],["that",2.64],["isn't",2.9],["zero",3.3],["counts",3.64],["as",3.98],["high.",4.22]],
  d5: [["and",0],["the",0.22],["call",0.3],["doesn't",0.54],["wait.",0.9],["GPIO",2.1],["set",2.1],["level",2.5],["writes",2.92],["one",3.48],["register,",3.84],["returns",4.78],["ESPOK,",5.4],["and",7.4],["the",7.56],["pin",7.66],["holds",7.88],["that",8.18],["level",8.38],["on",8.72],["its",8.9],["own",9.04],["until",9.32],["you",10.02],["write",10.18],["it",10.34],["again.",10.42]],
  b1: [["Put",0],["it",0.24],["all",0.34],["together,",0.46],["and",1.44],["you",1.48],["get",1.58],["a",1.7],["blinking",1.84],["LED.",2.2],["In",3.66],["App",3.76],["Main,",3.9],["reset",4.68],["the",4.92],["pin",5.1],["and",5.36],["make",5.7],["an",5.86],["output.",6],["Then",6.9],["forever,",7.1],["set",8.18],["it",8.48],["high,",8.6],["wait",9.24],["half",9.38],["a",9.7],["second,",9.88],["set",10.5],["it",10.76],["low,",10.86],["and",11.7],["wait",11.82],["half",12.02],["a",12.26],["second.",12.42]],
  b2: [["The",0],["LED",0.24],["turns",0.54],["on",1.06],["and",1.34],["off",1.76],["about",2.06],["once",2.36],["a",2.68],["second,",2.84],["for",3.56],["as",3.76],["long",3.84],["as",4.02],["the",4.16],["board",4.26],["has",4.44],["power.",4.66]],
  y1: [["To",0],["wait,",0.22],["you",0.78],["ask",0.92],["free",1.16],["RTOS.",1.46],["You",2.88],["call",2.96],["V",3.3],["-Task",3.7],["Delay,",4],["with",4.92],["the",5.02],["time",5.14],["converted",5.38],["by",5.72],["PDMS",6],["to",6.8],["ticks.",7.04]],
  y2: [["FreeRTOS",0],["counts",0.96],["time",1.56],["in",1.84],["ticks.",2.04],["By",2.84],["default,",2.98],["it",3.7],["ticks",3.9],["100",4.08],["times",4.44],["every",4.92],["second,",5.38],["so",6.1],["one",6.36],["tick",6.7],["is",7.02],["10",7.48],["milliseconds",7.82],["and",8.28],["500",8.72],["milliseconds",9.42],["is",9.9],["50",10.16],["ticks.",10.46]],
  y3: [["The",0],["conversion",0.22],["rounds",0.6],["down.",0.98],["If",1.78],["you",1.88],["ask",1.98],["for",2.14],["5",2.32],["milliseconds,",2.58],["you",3.44],["get",3.46],["zero",3.64],["ticks,",4.02],["and",4.88],["a",5.16],["delay",5.36],["of",5.62],["zero",5.84],["doesn't",6.22],["wait",6.82],["at",6.98],["all.",7.08]],
  y4: [["While",0],["your",0.24],["task",0.36],["waits,",0.62],["it's",1.4],["blocked.",1.56],["The",2.54],["CPU",2.58],["is",2.9],["free",3.32],["for",3.8],["other",4.24],["work,",4.54],["and",5.3],["the",5.46],["pin",5.58],["keeps",5.86],["its",6.2],["level,",6.44],["because",6.96],["nothing",7.36],["has",7.7],["to",8.02],["hold",8.14],["it",8.32],["high.",8.46],["The",9.28],["level",9.5],["is",9.74],["just",9.94],["a",10.12],["bit",10.3],["in",10.48],["a",10.64],["register.",10.76]],
  y5: [["If",0],["you",0.24],["take",0.34],["the",0.52],["delays",0.64],["out,",0.88],["the",1.66],["task",1.7],["watchdog",2],["complains",2.58],["after",3.08],["five",3.4],["seconds",3.72],["because",4.16],["your",4.84],["loop",5.08],["never",5.3],["lets",5.72],["the",6],["idle",6.16],["task",6.38],["run.",6.72]],
  y6: [["and",0],["the",0.22],["pin",0.3],["flips",0.5],["far",0.82],["too",1.28],["fast",1.78],["to",2.18],["see,",2.36],["so",3.18],["the",3.42],["LED",3.56],["just",3.94],["looks",4.56],["dimmer.",4.8],["We'll",5.72],["come",5.8],["back",5.92],["to",6.12],["that",6.26],["later",6.4],["in",6.58],["the",6.76],["course.",6.82]],
  k1: [["Your",0],["code",0.22],["decides",0.48],["whether",0.9],["the",1.12],["LED",1.28],["is",1.66],["on",2.32],["or",2.58],["off.",2.74],["The",3.58],["resistor",3.68],["decides",3.98],["how",4.58],["much",4.98],["current",5.18],["flows",5.58],["and",6.02],["so",6.7],["how",7.02],["bright",7.3],["it",7.68],["is.",7.82]],
  k2: [["With",0],["220",0.26],["ohms,",0.82],["you",1.64],["get",1.7],["about",1.82],["6",2.02],["milliamps.",2.38],["With",3.64],["1",3.76],["kilo",4.06],["ohm,",4.44],["you",4.8],["get",4.86],["about",4.98],["1",5.18],[".3",5.52],["milliamps",6],["and",6.58],["the",7.08],["LED",7.2],["is",7.54],["dimmer.",8.16]],
  k3: [["But",0],["remember,",0.26],["a",1.26],["pin",1.34],["is",1.6],["a",1.78],["signal,",2],["not",2.8],["a",2.88],["power",3],["supply.",3.16],["By",4.1],["default,",4.22],["it's",5.08],["set",5.32],["to",5.46],["deliver",5.58],["about",5.86],["20",6.18],["milliamps",6.54],["and",7.02],["about",7.58],["40",7.82],["at",8.2],["most.",8.34]],
  k4: [["motor,",0],["a",0.94],["relay,",0.98],["or",1.82],["a",2.04],["strip",2.14],["of",2.36],["LEDs",2.54],["needs",3.02],["far",3.42],["more",3.72],["than",3.9],["that.",4.08],["For",4.8],["those,",4.92],["the",5.68],["pin",5.92],["switches",6.16],["a",6.52],["transistor",6.76],["and",7.2],["the",7.98],["transistor",8.08],["switches",8.6],["the",9.24],["load.",9.52]],
  x1: [["So,",0],["make",0.96],["the",1.14],["pin",1.3],["an",1.44],["output,",1.56],["then",2.4],["set",2.5],["its",2.78],["level.",2.96],["That's",3.82],["GPIO.",4.22]],
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

export const TAIL: Record<string, number> = { problem: 2.6, answer: 2.0, circuit: 2.2, reset: 1.8, direction: 2.0, write: 1.8, blink: 4.0, delay: 2.0, current: 2.0, payoff: 5.0 };
const dur = (id: string, fallback: number) => SCENE_DUR[id] ?? fallback;
export const SCENES = [
  { id: 'problem', dur: dur('problem', 19.1) },
  { id: 'answer', dur: dur('answer', 12.6) },
  { id: 'circuit', dur: dur('circuit', 66.7) },
  { id: 'reset', dur: dur('reset', 30.7) },
  { id: 'direction', dur: dur('direction', 54.0) },
  { id: 'write', dur: dur('write', 44.5) },
  { id: 'blink', dur: dur('blink', 19.0) },
  { id: 'delay', dur: dur('delay', 52.4) },
  { id: 'current', dur: dur('current', 33.7) },
  { id: 'payoff', dur: dur('payoff', 8.7) },
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
export const GPIO_FRAMES = Math.round(SECONDS * FPS);

// ── shared numbers (FACTS.md) ──────────────────────────────────────────────

export const PIN = 2;
export const MODULE_PIN = 24; // ESP32-WROOM-32E: IO2 is module pin 24
export const VDD = 3.3;
export const LED_VF = 2.0; // typical red LED — UNVERIFIED for the kit
export const R1 = 220;
export const R2 = 1000;
/** LED current through resistor r, mA */
export const ledMa = (r: number) => ((VDD - LED_VF) / r) * 1000;
export const VOH_MIN = 2.64; // 0.8 × VDD
export const VOL_MAX = 0.33; // 0.1 × VDD
export const DRIVE_DEFAULT_MA = 20;
export const DRIVE_MAX_MA = 40;
/** FreeRTOS: CONFIG_FREERTOS_HZ default */
export const TICK_HZ = 100;
export const DELAY_MS = 500;
/** pdMS_TO_TICKS — integer division, rounds down (projdefs.h) */
export const msToTicks = (ms: number) => Math.floor((ms * TICK_HZ) / 1000);

/** blink: is the pin high, `s` real seconds after the loop starts? (HIGH first) */
export const blinkHigh = (s: number) => s >= 0 && s % ((2 * DELAY_MS) / 1000) < DELAY_MS / 1000;

// ── 1. the problem ─────────────────────────────────────────────────────────

/** QEMU, lab/logs/v1.log: the first try, with its return value printed */
export const LOG_FIRST_TRY = ['I (3244) main_task: Calling app_main()', 'I (3254) lab: gpio_set_level returned ESP_OK', 'I (3254) main_task: Returned from app_main()'];

export const PROBLEM = {
  ledIn: w('p1', 'LED'),
  codeIn: w('p2', 'line'),
  run: w('p3', 'Flash'),
  espOk: w('p3', 'returns', 0, 0.4),
  dark: w('p3', 'dark'),
  reset: w('p4', 'reset'),
  listening: w('p4', 'listening'),
  question: at('p5'),
};

// ── 2. the answer ──────────────────────────────────────────────────────────

export const ANSWER = {
  diagramIn: 0.3,
  output: w('a1', 'output'),
  high: w('a1', 'high'),
  low: w('a1', 'low'),
  /** G·P·I·O, letter by letter, just after "called" */
  letters: [0, 0.3, 0.58, 0.82].map((d) => w('a2', 'called', 0, 0.45 + d)) as unknown as readonly [number, number, number, number],
  words: [w('a2', 'general'), w('a2', 'purpose'), w('a2', 'input'), w('a2', 'output')] as unknown as readonly [number, number, number, number],
};

// ── 3. the circuit ─────────────────────────────────────────────────────────

export const CIRCUIT = {
  code: 'GPIO 2 → 220 Ω → LED → GND',
  run: w('c1', 'circuit'),
  args: [
    { token: 'GPIO 2', at: w('c1', 'GPIO'), title: 'pin', value: 'GPIO 2', sub: 'module pin 24 · IO2' },
    { token: '220 Ω', at: w('c1', 'resistor', 0, -0.6), title: 'resistor', value: '220 Ω', sub: 'red · red · brown · gold' },
    { token: 'LED', at: w('c1', 'long'), title: 'LED', value: 'long leg → +', sub: 'short leg → ground' },
    { token: 'GND', at: w('c1', 'ground'), title: 'ground', value: 'GND · 0 V', sub: 'module pin 15' },
  ],
  views: {
    wiring: at('c1') + 0.7,
    ohm: at('c3'),
    pins: at('c4'),
    strap: at('c5'),
  },
  wiring: {
    module: w('c1', 'module'),
    high: w('c2', 'high'),
    volts: w('c2', 'volts', 0, -0.6),
    current: w('c2', 'Current'),
    lights: w('c2', 'lights'),
  },
  ohm: {
    same: w('c3', 'same'),
    drops: w('c3', 'drops'),
    leaving: w('c3', 'leaves'),
    over: w('c3', 'over'),
    ma: w('c3', 'milliamps', 0, -0.4),
  },
  pins: {
    inputs: w('c4', 'inputs', 0, -1.2),
    flash: w('c4', 'flash', 0, -1.0),
    uploads: w('c4', 'uploading', 0, -0.8),
  },
  strap: {
    strap: w('c5', 'strapping'),
    reset: w('c5', 'reset'),
    ground: w('c5', 'ground'),
    safe: w('c5', 'safe'),
    boards: at('c6'),
    check: w('c6', 'check'),
  },
  captions: [
    { at: at('c1'), text: 'GPIO 2 (module pin 24) → 220 Ω → LED (long leg +) → GND' },
    { at: at('c2'), text: 'pin HIGH ≈ 3.3 V → current flows → the LED lights' },
    { at: at('c3'), text: '3.3 V − 2.0 V = 1.3 V across the resistor → 1.3 V ÷ 220 Ω ≈ 5.9 mA' },
    { at: at('c4'), text: 'avoid: 34–39 input only · 6–11 flash · 1 & 3 flashing / console' },
    { at: at('c5'), text: 'GPIO 2 is read at reset — an LED to ground keeps it low ✓' },
    { at: at('c6'), text: 'an LED already on GPIO 2? depends on the board — check yours' },
  ] as Caption[],
};

// ── 4. gpio_reset_pin ──────────────────────────────────────────────────────

export const RESET = {
  code: 'gpio_reset_pin(LED);',
  run: w('r1', 'reset'),
  args: [{ token: 'LED', at: w('r1', 'argument', 0, 0.5), title: 'pin', value: 'GPIO_NUM_2', sub: '#define LED GPIO_NUM_2' }],
  views: {
    module: at('r2'),
    count: at('r3'),
    state: at('r4'),
  },
  module: {
    gpio: w('r2', 'GPIO'),
    notPos: w('r2', 'position'),
    wroom: w('r2', 'module'),
    pin24: w('r2', 'pin'),
    io2: w('r2', 'labeled'),
  },
  count: {
    has34: w('r3', 'GPIOs', 0, -0.6),
    out28: w('r3', 'outputs', 0, -1.4),
  },
  state: {
    known: w('r4', 'known'),
    gpio: w('r4', 'plain'),
    input: w('r4', 'input'),
    output: w('r4', 'output'),
    pullup: w('r4', 'pull'),
    floating: w('r4', 'floating'),
  },
  captions: [
    { at: at('r1'), text: 'gpio_reset_pin(pin) — first thing in app_main()' },
    { at: at('r2'), text: 'GPIO number ≠ module pin number · WROOM-32E: IO2 = pin 24' },
    { at: at('r3'), text: '34 GPIOs · 28 can be outputs (34–39 are input only)' },
    { at: at('r4'), text: 'reset → plain GPIO · input off · output off · weak pull-up on' },
  ] as Caption[],
};

// ── 5. gpio_set_direction ──────────────────────────────────────────────────

/** QEMU, lab/logs/v2.log and v3.log */
export const LOG_INPUT_ONLY = 'E (3226) gpio: io_num=34 can only be input';
export const LOG_CHECK = 'ESP_ERROR_CHECK failed: esp_err_t 0x102 (ESP_ERR_INVALID_ARG) at 0x400d5889';

export const DIRECTION = {
  code: 'gpio_set_direction(LED, GPIO_MODE_OUTPUT);',
  run: w('s1', 'direction'),
  args: [
    { token: 'LED', at: w('s1', 'pin', 1), title: 'pin', value: 'GPIO_NUM_2', sub: 'which pin' },
    { token: 'GPIO_MODE_OUTPUT', at: w('s1', 'mode'), title: 'mode', value: 'GPIO_MODE_OUTPUT', sub: 'what the pin does' },
  ],
  views: {
    driver: at('s2'),
    modes: at('s3'),
    fail: at('s4'),
    start: at('s6'),
  },
  driver: {
    on: w('s2', 'switches'),
    listening: w('s2', 'listening'),
    drive: w('s2', 'drive'),
    high: w('s2', 'high'),
    low: w('s2', 'low'),
  },
  modes: {
    outOnly: w('s3', 'output'),
    inputOff: w('s3', 'input'),
    readZero: w('s3', 'zero'),
    inout: w('s3', 'use'),
  },
  fail: {
    code: w('s4', 'drive', 0, 0.4),
    log: w('s4', 'logs'),
    ret: w('s4', 'returns'),
    wrap: at('s5'),
    stops: w('s5', 'stops'),
  },
  start: {
    unknown: w('s6', 'promise'),
    first: w('s6', 'first'),
    waits: w('s6', 'waits'),
    on: w('s6', 'turns'),
  },
  captions: [
    { at: at('s1'), text: 'gpio_set_direction(pin, mode)' },
    { at: at('s2'), text: 'GPIO_MODE_OUTPUT turns on the output driver: listening → driving' },
    { at: at('s3'), text: 'OUTPUT = output only → gpio_get_level() reads 0 · use INPUT_OUTPUT to read back' },
    { at: at('s4'), text: 'GPIO 34 → E gpio: io_num=34 can only be input → ESP_ERR_INVALID_ARG' },
    { at: at('s5'), text: 'ESP_ERROR_CHECK(…) turns that error into a stop (abort)' },
    { at: at('s6'), text: 'gpio_set_level() first → the pin starts at that level when its output turns on' },
  ] as Caption[],
};

// ── 6. gpio_set_level ──────────────────────────────────────────────────────

export const WRITE = {
  code: 'gpio_set_level(LED, 1);',
  run: w('d1', 'level'),
  args: [
    { token: 'LED', at: w('d1', 'pin'), title: 'pin', value: 'GPIO_NUM_2', sub: 'the pin you set up' },
    { token: '1', at: w('d1', 'level', 2), title: 'level', value: '1 or 0', sub: '1 = high · 0 = low' },
  ],
  views: {
    level: at('d2'),
    bands: at('d3'),
    value: at('d4'),
    cpu: at('d5'),
  },
  level: {
    high: at('d2'),
    volts: w('d2', 'volts', 0, -0.6),
    lights: w('d2', 'lights'),
    low: w('d2', 'pulls'),
    dark: w('d2', 'dark'),
  },
  bands: {
    highAt: w('d3', 'high'),
    voh: w('d3', 'volts', 0, -0.9),
    lowAt: w('d3', 'low'),
    vol: w('d3', 'volts', 1, -0.9),
    only: w('d3', 'only'),
  },
  value: {
    whole: w('d4', 'whole'),
    any: w('d4', 'any'),
  },
  cpu: {
    wait: w('d5', 'wait'),
    returns: w('d5', 'returns'),
    holds: w('d5', 'holds'),
  },
  captions: [
    { at: at('d1'), text: 'gpio_set_level(pin, level) — sets the level' },
    { at: at('d2'), text: '1 → 3.3 V, LED on · 0 → 0 V, LED off' },
    { at: at('d3'), text: 'guaranteed: HIGH ≥ 2.64 V · LOW ≤ 0.33 V — just two levels' },
    { at: at('d4'), text: 'uint32_t level · 0 → LOW · anything else → HIGH' },
    { at: at('d5'), text: 'one register write, returns ESP_OK — the pin holds its level by itself' },
  ] as Caption[],
};

// ── 7. blink ───────────────────────────────────────────────────────────────

export const BLINK = {
  preamble: ['#include "driver/gpio.h"', '#include "freertos/FreeRTOS.h"', '#include "freertos/task.h"', '#define LED GPIO_NUM_2', ''],
  lines: [
    'void app_main(void)',
    '{',
    '    gpio_reset_pin(LED);',
    '    gpio_set_direction(LED, GPIO_MODE_OUTPUT);',
    '',
    '    while (1) {',
    '        gpio_set_level(LED, 1);',
    '        vTaskDelay(pdMS_TO_TICKS(500));',
    '        gpio_set_level(LED, 0);',
    '        vTaskDelay(pdMS_TO_TICKS(500));',
    '    }',
    '}',
  ],
  /** indices into `lines` */
  idx: { reset: 2, direction: 3, high: 6, delay1: 7, low: 8, delay2: 9 },
  resetLine: w('b1', 'reset'),
  directionLine: w('b1', 'output'),
  run: w('b1', 'high'), // the loop starts, in real time
  second: w('b2', 'once'),
  captions: [
    { at: at('b1'), text: 'app_main(): set the pin up once, then loop forever' },
    { at: at('b2'), text: 'HIGH 500 ms · LOW 500 ms → one blink a second · real time' },
  ] as Caption[],
};

// ── 8. vTaskDelay(pdMS_TO_TICKS(500)) ─────────────────────────────────────

/** QEMU, lab/logs/v4.log: the loop without delays */
export const LOG_WDT = ['E (8647) task_wdt: Task watchdog got triggered. The following tasks/users did not reset the watchdog in time:', 'E (8647) task_wdt:  - IDLE0 (CPU 0)'];

export const DELAY = {
  code: 'vTaskDelay(pdMS_TO_TICKS(500));',
  run: w('y1', 'wait'),
  args: [
    { token: 'vTaskDelay', at: w('y1', 'call'), title: 'FreeRTOS', value: 'vTaskDelay', sub: 'block this task for n ticks' },
    { token: 'pdMS_TO_TICKS(500)', at: w('y1', 'converted'), title: 'ms → ticks', value: 'pdMS_TO_TICKS(500)', sub: '500 ms → ticks' },
  ],
  views: {
    ticks: at('y2'),
    round: at('y3'),
    sleep: at('y4'),
    wdt: at('y5'),
    dimmer: at('y6'),
  },
  ticks: {
    hz: w('y2', 'times', 0, -0.5),
    tick10: w('y2', 'milliseconds', 0, -0.5),
    fifty: w('y2', 'ticks', 2, -0.6), // 50 ticks sweep in a real half second
  },
  round: {
    down: w('y3', 'down'),
    five: w('y3', 'milliseconds', 0, -0.6),
    zero: w('y3', 'zero'),
    noWait: w('y3', 'wait'),
  },
  sleep: {
    blocked: w('y4', 'blocked'),
    free: w('y4', 'free'),
    keeps: w('y4', 'keeps'),
    bit: w('y4', 'bit'),
  },
  wdt: {
    out: w('y5', 'delays'),
    wdt: w('y5', 'watchdog'),
    five: w('y5', 'seconds', 0, -0.5),
    idle: w('y5', 'idle'),
  },
  dimmer: {
    fast: w('y6', 'fast'),
    dim: w('y6', 'dimmer'),
    hold: w('y6', 'back'),
  },
  captions: [
    { at: at('y1'), text: 'vTaskDelay(ticks) · pdMS_TO_TICKS(ms) converts' },
    { at: at('y2'), text: 'CONFIG_FREERTOS_HZ = 100 → 1 tick = 10 ms → 500 ms = 50 ticks' },
    { at: at('y3'), text: 'rounds down: pdMS_TO_TICKS(5) = 0 → vTaskDelay(0) doesn\'t wait' },
    { at: at('y4'), text: 'your task is blocked — the CPU is free, and the pin holds its level' },
    { at: at('y5'), text: 'no delay → IDLE0 never runs → task watchdog after 5 s' },
    { at: at('y6'), text: 'and the pin flips too fast to see → the LED looks dimmer' },
  ] as Caption[],
};

// ── 9. second knob: current ───────────────────────────────────────────────

export const CURRENT = {
  views: {
    knob: at('k1'),
    budget: at('k3'),
  },
  knob: {
    code: w('k1', 'code'),
    resistor: w('k1', 'resistor'),
    bright: w('k1', 'bright'),
    r220: at('k2'),
    ma6: w('k2', 'milliamps', 0, -0.5),
    r1k: w('k2', 'kilo'),
    ma13: w('k2', 'milliamps', 1, -0.8),
    dimmer: w('k2', 'dimmer'),
  },
  budget: {
    signal: w('k3', 'signal'),
    def20: w('k3', 'milliamps', 0, -0.6),
    max40: w('k3', 'most', 0, -0.8),
    motor: at('k4'),
    far: w('k4', 'far'),
    transistor: w('k4', 'transistor'),
    load: w('k4', 'load'),
  },
  captions: [
    { at: at('k1'), text: 'code → on or off · resistor → how much current' },
    { at: at('k2'), text: '220 Ω ≈ 5.9 mA · 1 kΩ ≈ 1.3 mA → dimmer' },
    { at: at('k3'), text: 'a pin is a signal: ~20 mA by default, ~40 mA at most' },
    { at: at('k4'), text: 'bigger loads → the pin switches a transistor, the transistor switches the load' },
  ] as Caption[],
};

// ── 10. payoff ─────────────────────────────────────────────────────────────

const PAY_LINE = w('x1', 'That');
export const PAYOFF = {
  output: w('x1', 'output'),
  level: w('x1', 'level'),
  line: PAY_LINE,
  recap: [
    { at: PAY_LINE + 0.86, k: 'gpio_reset_pin(pin)', v: 'a known state' },
    { at: PAY_LINE + 1.21, k: 'gpio_set_direction(…, OUTPUT)', v: 'output driver on' },
    { at: PAY_LINE + 1.56, k: 'gpio_set_level(pin, 1)', v: 'the pin holds it · returns ESP_OK' },
    { at: PAY_LINE + 1.91, k: 'vTaskDelay(pdMS_TO_TICKS(ms))', v: 'ticks · the CPU is free' },
    { at: PAY_LINE + 2.26, k: 'HIGH or LOW', v: 'nothing in between · next: input' },
  ],
};

// ── voiceover (scratch: edge-tts) ─────────────────────────────────────────

/** `text` is the script as written; `say` is what the TTS reads, if different; `pause` the silence before it */
export type VoLine = { id: string; scene: SceneId; at: number; text: string; say?: string; pause?: number };
export const VOICE = 'en-US-AndrewMultilingualNeural';
const L = (id: string, scene: SceneId, text: string, o: { say?: string; pause?: number } = {}): VoLine => ({ id, scene, at: at(id), text, ...o });

export const VO: VoLine[] = [
  // 1 · problem: the want, and the first try
  L('p1', 'problem', "Let's say you want your code to switch on an LED.", { pause: 0.6 }),
  L('p2', 'problem', 'The LED is wired to GPIO 2, and the obvious first try is a single line: gpio_set_level, with the pin, and a one for on.', { say: 'The LED is wired to GPIO 2, and the obvious first try is a single line: GPIO set level, with the pin, and a one for on.', pause: 0.5 }),
  L('p3', 'problem', "Flash it, and the call returns ESP_OK. There's no error at all, but the LED stays dark.", { say: "Flash it, and the call returns E S P OK. There's no error at all, but the LED stays dark.", pause: 0.7 }),
  L('p4', 'problem', "That's because right after reset, every ESP32 pin is listening, not driving. Setting its level changes nothing until the pin is allowed to drive the wire.", { pause: 0.8 }),
  L('p5', 'problem', 'So how do you make a pin switch something on?', { pause: 0.7 }),
  // 2 · answer
  L('a1', 'answer', 'It takes two steps. First, you make the pin an output. Then you set its level, high or low.'),
  L('a2', 'answer', "A pin that can do this is called a GPIO: a general-purpose input/output pin.", { say: 'A pin that can do this is called a G P I O: a general purpose input output pin.', pause: 0.6 }),
  // 3 · circuit
  L('c1', 'circuit', "Let's start with the circuit. It runs from GPIO 2 on the module, through a two-twenty ohm resistor, into the long leg of the LED, and out of the short leg to ground."),
  L('c2', 'circuit', 'When the pin is high, it sits at about three point three volts. Current flows out of the pin, through the LED to ground, and the LED lights.', { pause: 0.7 }),
  L('c3', 'circuit', "Here's the same loop, drawn as a schematic. The resistor sets how much current flows. The LED drops about two volts, which leaves one point three volts across the resistor. One point three volts over two hundred and twenty ohms is about six milliamps.", { pause: 0.8 }),
  L('c4', 'circuit', 'So why GPIO 2, and not just any pin? Pins thirty-four to thirty-nine can only be inputs. Pins six to eleven are wired to the flash chip. And pins one and three are used for uploading.', { pause: 0.8 }),
  L('c5', 'circuit', 'GPIO 2 is also a strapping pin: the chip reads it at reset to decide how to boot. Wired to ground through the LED, it stays low, and low is safe for both booting and flashing.', { pause: 0.7 }),
  L('c6', 'circuit', 'Many boards already have an LED on GPIO 2, but not all of them, so check yours.', { pause: 0.6 }),
  // 4 · gpio_reset_pin
  L('r1', 'reset', 'Now for the code. In app_main, start with gpio_reset_pin. It takes one argument: the pin.', { say: 'Now for the code. In app main, start with GPIO reset pin. It takes one argument: the pin.' }),
  L('r2', 'reset', "That's a GPIO number, not a position on the package. On the WROOM module, GPIO 2 comes out on pin twenty-four, which is labeled IO2.", { say: "That's a GPIO number, not a position on the package. On the WROOM module, GPIO 2 comes out on pin twenty-four, which is labeled I O 2.", pause: 0.6 }),
  L('r3', 'reset', 'The ESP32 has thirty-four GPIOs, and twenty-eight of them can be outputs.', { pause: 0.6 }),
  L('r4', 'reset', "Resetting puts the pin in a known state: a plain GPIO, with its input off, its output off, and a weak pull-up, so it isn't left floating.", { pause: 0.7 }),
  // 5 · gpio_set_direction
  L('s1', 'direction', 'Next, gpio_set_direction makes the pin an output. It takes two arguments: the pin, and the mode.', { say: 'Next, GPIO set direction makes the pin an output. It takes two arguments: the pin, and the mode.' }),
  L('s2', 'direction', "GPIO_MODE_OUTPUT switches on the pin's output driver. Until now, the pin was only listening. Now it can drive the wire high or low.", { say: "GPIO mode output switches on the pin's output driver. Until now, the pin was only listening. Now it can drive the wire high or low.", pause: 0.7 }),
  L('s3', 'direction', "It's output only, though. The input is switched off, so gpio_get_level would always read zero. If you want to read the pin back, use GPIO_MODE_INPUT_OUTPUT instead.", { say: "It's output only, though. The input is switched off, so GPIO get level would always read zero. If you want to read the pin back, use GPIO mode input output instead.", pause: 0.7 }),
  L('s4', 'direction', "What if you try this on a pin that can't drive, like thirty-four? It logs an error, and returns ESP_ERR_INVALID_ARG.", { say: "What if you try this on a pin that can't drive, like thirty-four? It logs an error, and returns E S P error invalid arg.", pause: 0.8 }),
  L('s5', 'direction', 'If you put the call inside ESP_ERROR_CHECK, that error stops the program, instead of slipping by unnoticed.', { say: 'If you put the call inside E S P error check, that error stops the program, instead of slipping by unnoticed.', pause: 0.5 }),
  L('s6', 'direction', "One more detail: the datasheet doesn't promise which level the pin starts at. If that matters, call gpio_set_level first. The level waits in its register, and the pin starts at that level the moment its output turns on.", { say: "One more detail: the datasheet doesn't promise which level the pin starts at. If that matters, call GPIO set level first. The level waits in its register, and the pin starts at that level the moment its output turns on.", pause: 0.8 }),
  // 6 · gpio_set_level
  L('d1', 'write', 'Then gpio_set_level sets the level. It takes two arguments: the pin, and the level, which is one for high and zero for low.', { say: 'Then GPIO set level sets the level. It takes two arguments: the pin, and the level, which is one for high and zero for low.' }),
  L('d2', 'write', 'A one drives the pin to three point three volts, and the LED lights. A zero pulls it to zero volts, and the LED goes dark.', { pause: 0.7 }),
  L('d3', 'write', 'The datasheet guarantees that high is at least two point six four volts, and low is at most zero point three three volts. Those are the only two levels a digital output gives you.', { pause: 0.7 }),
  L('d4', 'write', "The level is a whole number, and any number that isn't zero counts as high.", { pause: 0.6 }),
  L('d5', 'write', 'And the call doesn\'t wait. gpio_set_level writes one register, returns ESP_OK, and the pin holds that level on its own, until you write it again.', { say: "And the call doesn't wait. GPIO set level writes one register, returns E S P OK, and the pin holds that level on its own, until you write it again.", pause: 0.7 }),
  // 7 · blink
  L('b1', 'blink', 'Put it all together, and you get a blinking LED. In app_main, reset the pin and make it an output. Then, forever: set it high, wait half a second, set it low, and wait half a second.', { say: 'Put it all together, and you get a blinking LED. In app main, reset the pin and make it an output. Then, forever: set it high, wait half a second, set it low, and wait half a second.' }),
  L('b2', 'blink', 'The LED turns on and off about once a second, for as long as the board has power.', { pause: 0.6 }),
  // 8 · vTaskDelay
  L('y1', 'delay', 'To wait, you ask FreeRTOS. You call vTaskDelay, with the time converted by pdMS_TO_TICKS.', { say: 'To wait, you ask Free R-TOS. You call V-Task Delay, with the time converted by P D M S to ticks.' }),
  L('y2', 'delay', 'FreeRTOS counts time in ticks. By default, it ticks a hundred times every second, so one tick is ten milliseconds, and five hundred milliseconds is fifty ticks.', { say: 'Free R-TOS counts time in ticks. By default, it ticks a hundred times every second, so one tick is ten milliseconds, and five hundred milliseconds is fifty ticks.', pause: 0.7 }),
  L('y3', 'delay', "The conversion rounds down. If you ask for five milliseconds, you get zero ticks, and a delay of zero doesn't wait at all.", { pause: 0.7 }),
  L('y4', 'delay', "While your task waits, it's blocked. The CPU is free for other work, and the pin keeps its level, because nothing has to hold it high: the level is just a bit in a register.", { pause: 0.7 }),
  L('y5', 'delay', 'If you take the delays out, the task watchdog complains after five seconds, because your loop never lets the idle task run.', { pause: 0.7 }),
  L('y6', 'delay', "And the pin flips far too fast to see, so the LED just looks dimmer. We'll come back to that later in the course.", { pause: 0.5 }),
  // 9 · current
  L('k1', 'current', 'Your code decides whether the LED is on or off. The resistor decides how much current flows, and so how bright it is.'),
  L('k2', 'current', 'With two hundred and twenty ohms, you get about six milliamps. With one kilohm, you get about one point three milliamps, and the LED is dimmer.', { pause: 0.6 }),
  L('k3', 'current', "But remember, a pin is a signal, not a power supply. By default, it's set to deliver about twenty milliamps, and about forty at most.", { pause: 0.8 }),
  L('k4', 'current', 'A motor, a relay, or a strip of LEDs needs far more than that. For those, the pin switches a transistor, and the transistor switches the load.', { pause: 0.6 }),
  // 10 · payoff
  L('x1', 'payoff', "So: make the pin an output, then set its level. That's GPIO.", { say: "So, make the pin an output, then set its level. That's G P I O." }),
];
