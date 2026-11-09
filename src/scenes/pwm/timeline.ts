/**
 * PWM (v2, pure ESP-IDF) — the timeline. Single source of truth for picture AND sound.
 *
 *   problem → answer → setup (the whole app_main) → timer (ledc_timer_config)
 *     → channel (ledc_channel_config) → write (ledc_set_duty + ledc_update_duty)
 *     → duty (knob 1, on a real LED) → fade (install / set_fade_with_time / fade_start)
 *     → tone (knob 2, ledc_set_freq) → payoff
 *
 * Times are SCENE-RELATIVE. Narration timing is generated: `node scripts/vo-plan.ts pwm`
 * voices every line, gets word timings, and writes VO_AT / VO_WORDS / SCENE_DUR at the
 * bottom of this file. Every cue is `w(line, word)` — the moment that word is spoken —
 * so changing a line's wording and re-running the plan re-times everything.
 * Problem and answer keep their hand-set v1 timings (`fixed`).
 *
 * Import-free on purpose (type-only imports are erased): Node runs it as-is.
 *
 *   node scripts/vo-plan.ts pwm   # re-time from the voice
 *   npm run pwm:audio             # soundtrack
 *   npm run pwm                   # soundtrack + render
 */
import type { Beat, Caption, RateKey } from '../../components/pwm';

export const FPS = 30;

// ── generated: VO plan (node scripts/vo-plan.ts pwm) — do not edit by hand ──
export const VO_AT: Record<string, number> = {"p1":0.6,"p2":5.2,"p3":12.6,"a1":0.4,"c1":0.5,"c2":9.26,"c2b":14.74,"c3":23.48,"c4":26.84,"c5":29.44,"t1":0.5,"t2":9.66,"t3":17.78,"t4":20.96,"t5":32.76,"t6":39.24,"t7":50.3,"t8":59.9,"t9":63.62,"t10":72.58,"t11":82.48,"t12":89.86,"t13":95.56,"h1":0.5,"h2":9.18,"h3":15.32,"h4":23.98,"h6":31.92,"h7":42.86,"h8":49,"w1":0.5,"w2":10,"w3":18.12,"w4":26.5,"w5":28.26,"w6":36.56,"w8":46.98,"w9":51.06,"w10":57.28,"d0":0.5,"d1":5.26,"d2":14.48,"d3":20.26,"d4":25.16,"d5":30.28,"f1":0.5,"f2":10.88,"f3":17.46,"f4":26.26,"f5":32.26,"f6":45.88,"f7":61.18,"f9":68.66,"f10":79.74,"f11":83.02,"f12":91.86,"n1":0.5,"n2":8.74,"n3":17.52,"n4":26.02,"z1":0.7};
export const SCENE_DUR: Record<string, number> = {"setup":31.42,"timer":105.56,"channel":56.8,"write":64.24,"duty":38.96,"fade":104.08,"tone":32.3,"payoff":6.16};
export const VO_WORDS: Record<string, [string, number][]> = {
  p1: [["Let's",0],["say",0.28],["you",0.36],["want",0.44],["to",0.5],["dim",0.6],["a",0.68],["light",0.82],["or",1.12],["change",1.72],["the",2.06],["pitch",2.22],["of",2.38],["sound.",2.54]],
  p2: [["But",0],["a",0.24],["digital",0.36],["output",0.64],["pin",1.06],["has",1.36],["only",1.56],["two",1.94],["levels,",2.28],["3",3.42],[".3",3.56],["volts",4.18],["or",4.42],["zero,",4.98],["with",5.8],["nothing",6],["in",6.24],["between.",6.42]],
  p3: [["So",0],["how",0.3],["do",0.4],["you",0.48],["get",0.54],["something",0.66],["in",0.94],["between?",1.14]],
  a1: [["You",0],["switch",0.2],["it",0.36],["on",0.48],["and",0.58],["off",0.7],["really",0.94],["fast.",1.2],["That's",2.42],["PWM",2.54],["pulse",3.32],["width",4.16],["modulation.",4.54]],
  c1: [["An",0],["ESP",0.26],["-IDF,",0.7],["the",2.46],["LED",2.52],["controller,",2.94],["LEDC,",4.4],["makes",5.42],["the",5.74],["pulses",5.9],["for",6.2],["you.",6.46],["You",7.04],["set",7.16],["it",7.3],["up",7.38],["with",7.48],["two",7.62],["calls.",7.82]],
  c2: [["First,",0],["a",1],["timer,",1.14],["which",1.86],["sets",1.94],["how",2.14],["fast",2.4],["and",2.92],["how",3.64],["fine",3.88],["the",4.18],["pulses",4.28],["are.",4.52]],
  c2b: [["Each",0],["setup",0.3],["call",0.58],["takes",1.12],["a",1.58],["struct,",1.82],["a",2.72],["bundle",2.78],["of",3.04],["settings,",3.22],["each",3.98],["one",4.22],["filled",4.5],["in",4.78],["by",4.98],["name.",5.14],["The",5.84],["ampersand",5.96],["hands",6.52],["the",6.84],["whole",7.06],["bundle",7.3],["to",7.64],["the",7.82],["call.",7.9]],
  c3: [["then",0],["a",0.32],["channel,",0.48],["which",1.22],["connects",1.38],["that",1.7],["timer",1.94],["to",2.26],["a",2.46],["pin.",2.56]],
  c4: [["Then",0],["two",0.3],["more",0.54],["lines",0.76],["set",1.22],["the",1.6],["brightness.",1.72]],
  c5: [["Let's",0],["start",0.34],["with",0.5],["the",0.64],["timer.",0.74]],
  t1: [["LEDC",0],["Timer",0.66],["Config",1.24],["takes",1.32],["a",1.7],["struct",1.92],["and",2.22],["five",2.78],["fields",3.18],["matter.",3.52],["The",4.4],["speed",4.54],["mode,",4.8],["which",5.48],["timer,",5.58],["the",6.24],["frequency,",6.34],["the",7.3],["resolution,",7.32],["and",8.14],["the",8.3],["clock.",8.36]],
  t2: [["For",0],["the",0.22],["speed",0.3],["mode,",0.52],["use",1.2],["low",1.3],["speed.",1.54],["Every",2.46],["ESP32",2.68],["chip",3.8],["has",4.08],["it,",4.36],["and",4.92],["the",5.1],["timer",5.18],["and",5.46],["the",5.86],["channel",5.94],["must",6.22],["say",6.5],["the",6.78],["same",6.94],["thing.",7.22]],
  t3: [["There",0],["are",0.24],["four",0.34],["timers,",0.64],["and",1.56],["this",1.68],["is",1.86],["timer",2.04],["zero.",2.34]],
  t4: [["The",0],["frequency",0.24],["is",0.54],["how",1.06],["many",1.36],["complete",1.86],["on",2.58],["-off",3.02],["cycles",3.26],["happen",3.7],["every",4.18],["second.",4.72],["At",5.66],["1000",5.76],["Hz,",6.26],["each",7.06],["cycle",7.34],["lasts",7.72],["1",8.1],["millisecond.",8.54],["That",9.6],["window",9.76],["is",10.06],["called",10.52],["the",10.76],["period.",10.94]],
  t5: [["Frequency",0],["doesn't",0.6],["change",1.44],["the",1.7],["brightness.",1.92],["It",3],["only",3.08],["has",3.24],["to",3.46],["be",3.56],["fast",3.68],["enough",4.04],["that",4.3],["your",4.52],["eye",4.64],["can't",4.82],["see",5.2],["the",5.44],["flicker.",5.6]],
  t6: [["The",0],["resolution",0.22],["is",0.66],["8",1.26],["bits.",1.64],["Inside,",2.98],["the",3.68],["timer",3.76],["is",3.98],["a",4.18],["counter",4.32],["that",4.52],["splits",4.76],["every",5.14],["period",5.7],["into",6.08],["2",6.36],["to",6.78],["the",7],["8th,",7.14],["or",7.96],["256",8.04],["tiny",9.04],["steps.",10.04]],
  t7: [["Each",0],["step",0.28],["is",0.54],["about",0.82],["3",1.04],[".9",1.46],["microseconds.",2.12],["It",3.54],["counts",3.54],["from",3.76],["0",3.96],["up",4.3],["to",4.62],["255,",4.84],["then",6.34],["starts",6.72],["again",7.18],["1000",7.6],["times",8.3],["a",8.58],["second.",8.78]],
  t8: [["More",0],["bits",0.32],["means",0.5],["finer",0.74],["steps",1.14],["and",1.58],["smoother",2.2],["dimming.",2.7]],
  t9: [["The",0],["counter",0.24],["needs",0.44],["a",0.64],["clock.",0.84],["256",1.88],["steps,",2.2],["a",3.46],["thousand",3.52],["times",3.96],["a",4.3],["second,",4.48],["is",5.14],["256",5.46],[",000",6.24],["counts",7.16],["every",7.46],["second.",8]],
  t10: [["LEDC",0],["Auto",0.68],["Clock",0.9],["lets",1.28],["the",1.66],["driver",1.86],["pick",2.12],["the",2.4],["clock",2.58],["for",2.74],["you.",2.98],["The",3.6],["fastest",3.7],["it",4.1],["has",4.6],["runs",4.84],["at",5.18],["80",5.78],["megahertz",6.18],["and",6.82],["your",7.22],["counts",7.34],["per",7.6],["second",7.8],["have",8.16],["to",8.4],["fit",8.54],["inside",8.72],["it.",9.06]],
  t11: [["16",0],["-bit",0.64],["still",0.84],["fits.",1.12],["17",2.24],["-bits",2.58],["is",2.94],["131",3.24],["million",3.98],["counts",4.58],["a",4.98],["second,",5.16],["and",5.78],["that",6.14],["doesn't.",6.34]],
  t12: [["LEDC",0],["timer",0.74],["config",1.12],["logs",1.52],["that",1.88],["it",2.06],["can't",2.18],["be",2.48],["done",2.58],["and",2.86],["returns",3.46],["ESP",3.9],["fail.",4.52]],
  t13: [["Inside",0],["ESP",0.6],["error",1.28],["check,",1.74],["the",2.48],["program",2.54],["stops",2.78],["right",3.12],["there",3.42],["and",3.8],["tells",4.12],["you",4.32],["which",4.46],["line.",4.6],["Fewer",5.56],["bits",5.74],["or",5.98],["a",6.52],["lower",6.64],["frequency",6.86],["fixes",7.52],["it.",8.12]],
  h1: [["Next,",0],["LEDC",1.04],["channel",1.46],["config.",1.74],["It's",2.64],["struct",2.86],["says",3.1],["which",3.54],["channel,",3.82],["which",4.72],["timer",4.86],["it",5.18],["follows,",5.36],["which",6.22],["pin",6.32],["it",6.52],["drives,",6.66],["and",7.46],["where",7.64],["it",7.74],["starts.",7.86]],
  h2: [["It",0],["uses",0.22],["the",0.44],["same",0.68],["speed",0.96],["mode",1.3],["as",1.62],["the",2.06],["timer.",2.18],["There",3.08],["are",3.16],["eight",3.32],["channels,",3.54],["and",4.58],["this",4.64],["is",4.92],["channel",5.1],["zero.",5.28]],
  h3: [["Timer",0],["Select",0.42],["picks",0.66],["the",1],["counter",1.3],["this",1.6],["channel",1.86],["watches.",2.14],["Several",3.26],["channels",3.44],["can",3.76],["share",4.04],["one",4.3],["timer,",4.66],["but",5.44],["then",5.72],["they",5.92],["share",6.08],["its",6.28],["frequency",6.44],["and",6.92],["resolution.",7.68]],
  h4: [["GPIO",0],["number",0.52],["is",0.72],["the",1],["pin,",1.16],["GPIO2.",2.08],["The",3.26],["driver",3.46],["connects",3.72],["the",4.12],["channel",4.32],["to",4.56],["it",4.8],["for",4.92],["you,",5.06],["so",5.56],["you",5.78],["don't",5.86],["call",6.06],["GPIO",6.26],["set",6.74],["direction.",7.02]],
  h6: [["The",0],["duty",0.24],["is",0.56],["where",1.24],["the",1.36],["pin",1.48],["turns",1.78],["off.",2.12],["Think",3.06],["of",3.14],["it",3.26],["as",3.36],["a",3.48],["line",3.62],["across",3.86],["the",4.14],["counter.",4.32],["While",5.14],["the",5.26],["count",5.38],["is",5.6],["below",5.88],["the",6.18],["line,",6.36],["the",7.04],["pin",7.1],["is",7.28],["on.",7.44],["Once",8.18],["it",8.3],["passes",8.44],["the",8.72],["line,",8.94],["the",9.56],["pin",9.74],["is",9.9],["off.",10.04]],
  h7: [["H",0],["point",0.28],["the",0.56],["high",1.04],["point",1.24],["is",1.6],["where",1.94],["it",2.1],["turns",2.2],["on",2.36],["zero",2.74],["means",3.32],["at",3.76],["the",3.96],["start",4.08],["of",4.38],["every",4.6],["period",5.06]],
  h8: [["Here",0],["the",0.22],["duty",0.36],["starts",0.56],["at",0.88],["zero,",1.1],["so",1.96],["the",2.18],["pan",2.3],["is",2.54],["off,",2.7],["and",3.56],["the",3.64],["channel",3.76],["is",4.04],["running",4.46],["the",4.74],["moment",4.98],["this",5.36],["call",5.7],["returns.",5.92]],
  w1: [["To",0],["change",0.22],["the",0.46],["brightness",0.62],["takes",0.9],["two",1.28],["calls.",1.76],["First,",3.18],["LEDC",3.52],["set",4.14],["duty.",4.46],["It",5.32],["takes",5.42],["the",5.6],["speed",5.78],["mode,",6.02],["the",6.78],["channel,",6.8],["and",7.46],["a",7.58],["number.",7.7],["The",8.54],["duty.",8.66]],
  w2: [["The",0],["duty",0.24],["doesn't",0.52],["set",0.82],["a",1.1],["voltage.",1.22],["It",2.14],["sets",2.26],["how",2.42],["long",2.66],["the",2.94],["pin",3.12],["stays",3.36],["on",3.62],["in",4.02],["every",4.36],["period.",4.74],["It's",5.66],["the",5.78],["line",5.92],["across",6.18],["the",6.5],["counter",6.76],["from",7],["before.",7.22]],
  w3: [["So",0],["128",0.28],["means",0.74],["on",1.14],["for",1.32],["the",1.46],["first",1.56],["128",1.84],["steps,",2.42],["then",3.44],["off",3.5],["for",3.82],["the",3.96],["other",4.04],["128.",4.22],["Half",5.24],["of",5.52],["every",5.76],["period,",6.18],["so",6.92],["half",7.14],["the",7.4],["light.",7.58]],
  w4: [["Zero",0],["means",0.36],["never",0.6],["on.",0.88]],
  w5: [["And",0],["the",0.22],["top",0.34],["isn't",0.56],["255.",1],["It's",2.54],["256.",2.72],["The",4.24],["line",4.4],["sits",4.64],["past",4.9],["the",5.18],["last",5.4],["step,",5.64],["so",6.36],["the",6.58],["pin",6.72],["never",6.9],["turns",7.18],["off.",7.44]],
  w6: [["The",0],["range",0.24],["comes",0.54],["from",0.84],["the",1.04],["resolution.",1.16],["8",2.18],["bits",2.28],["gives",2.46],["you",2.7],["0",2.86],["to",3.24],["256.",3.46],["10",4.94],["bits",5.18],["would",5.4],["give",5.56],["you",5.72],["0",5.86],["to",6.26],["1024.",6.5],["And",7.82],["the",7.94],["same",8.04],["half",8.28],["becomes",8.68],["512.",9.18]],
  w8: [["And",0],["on",0.22],["its",0.38],["own,",0.52],["it",1.12],["changes",1.22],["nothing.",1.56],["It",2.52],["only",2.6],["gets",2.74],["the",2.94],["number",3.08],["ready.",3.24]],
  w9: [["LEDC",0],["update",0.68],["duty",0.98],["says",1.46],["go",1.8],["the",2.12],["new",2.66],["duty",2.84],["takes",3.26],["effect",3.78],["at",4.16],["the",4.38],["start",4.48],["of",4.78],["the",4.94],["next",5.04],["period",5.24]],
  w10: [["Both",0],["calls",0.3],["return",0.52],["straight",0.88],["away.",1.18],["From",2],["then",2.08],["on,",2.24],["the",2.94],["hardware",2.98],["keeps",3.36],["the",3.74],["pin",4.04],["switching",4.4],["on",4.86],["its",5.1],["own.",5.24]],
  d0: [["Now",0],["let's",0.26],["try",0.48],["it",0.64],["on",0.72],["a",0.78],["real",0.94],["LED",1.26],["at",1.92],["1000",2.56],["Hz",3.02],["and",3.34],["8",3.74],["bits.",3.9]],
  d1: [["Duty",0],["of",0.42],["128",0.62],["is",1.18],["half",1.66],["slow",2.3],["down",2.88],["500",3.24],["times",3.76],["you",4.28],["can",4.6],["see",4.68],["it's",4.84],["fully",4.98],["on",5.2],["then",5.64],["fully",6.04],["off",6.4]],
  d2: [["At",0],["full",0.26],["speed,",0.6],["a",1.58],["thousand",1.68],["times",2.04],["a",2.34],["second,",2.52],["your",3.32],["eye",3.38],["just",3.48],["sees",3.62],["the",4.02],["average.",4.24]],
  d3: [["At",0],["64,",0.26],["it's",1.26],["on",1.4],["a",1.48],["quarter",1.64],["of",1.84],["the",2],["time,",2.1],["so",2.76],["you",2.94],["get",3.06],["a",3.16],["quarter",3.3],["of",3.54],["the",3.7],["light.",3.76]],
  d4: [["At",0],["230,",0.24],["it's",1.24],["on",1.38],["nearly",1.52],["all",1.76],["the",2.04],["time,",2.18],["at",2.96],["nearly",3.18],["full",3.5],["brightness.",3.86]],
  d5: [["A",0],["fade",0.22],["slides",0.46],["it",0.8],["down",0.98],["for",1.14],["you.",1.38],["The",1.98],["pin",2.12],["never",2.32],["dims.",2.56],["It",3.52],["just",3.62],["spends",3.74],["less",4],["time",4.22],["on.",4.46]],
  f1: [["A",0],["fade",0.24],["takes",0.4],["three",0.68],["calls.",1.06],["Call",2.14],["this",2.2],["one",2.36],["once",2.6],["when",2.96],["your",3.46],["program",3.58],["starts.",3.88],["LEDC",5.24],["fade",5.74],["function",6.08],["install.",6.56],["It",7.5],["switches",7.62],["fading",7.98],["on.",8.4],["Pass",9.18],["zero.",9.4]],
  f2: [["Forget",0],["it,",0.38],["and",0.98],["the",1.08],["Fade",1.18],["call",1.44],["logs.",1.62],["Fade",2.62],["service",2.9],["not",3.22],["installed",3.54],["and",4],["returns",4.48],["ESP",4.96],["fail.",5.5]],
  f3: [["Then",0],["LEDC",0.36],["set",1.22],["fade",1.54],["with",1.88],["time.",2.06],["It",2.82],["takes",2.92],["the",3.12],["speed",3.32],["mode,",3.62],["the",4.52],["channel,",4.54],["where",5.24],["to",5.34],["end,",5.48],["and",6.26],["how",6.42],["long",6.64],["to",6.94],["take",7.14],["in",7.46],["milliseconds.",7.82]],
  f4: [["There's",0],["no",0.32],["starting",0.48],["value.",0.86],["It",1.64],["fades",1.76],["from",2],["wherever",2.2],["the",2.46],["duty",2.66],["is",2.9],["now.",3.18],["And",4.08],["here,",4.18],["that's",4.88],["230.",5.08]],
  f5: [["The",0],["duty",0.24],["slides",0.5],["from",0.86],["230",1.16],["down",1.62],["to",2.02],["zero",2.32],["in",2.72],["under",3.06],["three",3.24],["seconds.",3.66],["But",4.64],["at",4.86],["every",4.96],["moment,",5.22],["the",5.98],["pin",6.08],["is",6.3],["still",6.48],["only",6.64],["on",6.88],["or",7.18],["off.",7.34],["Near",8.32],["the",8.42],["start,",8.56],["each",9.34],["period",9.56],["is",9.9],["mostly",10.1],["on.",10.46],["Near",11.32],["the",11.42],["end,",11.56],["it's",12.16],["barely",12.34],["out",12.54],["all.",12.78]],
  f6: [["And",0],["the",0.24],["duty",0.38],["is",0.66],["a",1.06],["whole",1.22],["number,",1.46],["so",2.16],["the",2.44],["fade",2.56],["is",2.98],["really",3.4],["a",3.76],["staircase.",3.94],["2",5.08],[".8",5.3],["seconds",5.76],["at",6.08],["1000",6.26],["Hz",6.76],["is",7],["2800",7.54],["periods.",9.12],["That's",10.14],["two",10.34],["30",10.56],["steps,",10.86],["so",11.58],["the",11.78],["duty",11.94],["drops",12.18],["by",12.56],["one",13.06],["every",13.48],["12",14.06],["periods.",14.34]],
  f7: [["12,",0],["not",0.78],["12",1.02],[".17.",1.32],["It",2.48],["rounds",2.7],["down,",2.96],["so",3.66],["this",3.82],["fade",4.02],["really",4.3],["takes",4.82],["2",5.18],[".76",5.64],["seconds.",6.42]],
  f9: [["It",0],["hands",0.22],["those",0.48],["numbers",0.7],["to",1.02],["the",1.44],["LEDC",1.6],["hardware.",2.34],["Count",3.44],["down",3.68],["two",4.04],["30",4.6],["steps,",4.9],["one",5.7],["every",6.02],["12",6.5],["periods.",6.8],["The",7.86],["hardware",7.96],["does",8.38],["the",8.82],["stepping,",9],["not",9.86],["your",10.08],["code.",10.22]],
  f10: [["Then",0],["LEDC",0.3],["fade,",1.18],["start",1.92],["says",2.16],["go.",2.38]],
  f11: [["With",0],["LEDC",0.26],["fade",1.02],["weight",1.24],["done,",1.52],["your",2.32],["task",2.48],["waits",2.78],["until",3.04],["the",3.44],["fade",3.56],["ends,",3.9],["then",4.76],["carries",5],["on.",5.34],["While",6.06],["it",6.22],["waits,",6.34],["the",7.14],["CPU",7.2],["is",7.56],["free.",7.92]],
  f12: [["Pass",0],["LEDC",0.42],["fade,",1.18],["no",2.06],["wait",2.38],["instead,",2.7],["and",3.84],["it",3.9],["returns",3.96],["at",4.28],["once,",4.46],["but",4.96],["on",5.48],["the",5.6],["ESP32,",5.74],["your",7.5],["next",7.58],["duty",7.88],["change",8.1],["waits",8.46],["until",8.86],["the",9.34],["fade",9.46],["is",9.78],["done.",9.96]],
  n1: [["Now",0],["for",0.3],["the",0.5],["second",0.62],["knob.",0.92],["A",1.7],["speaker",1.76],["on",2],["GPIO",2.24],["4",2.74],["gets",3.38],["its",3.58],["own",3.74],["timer,",3.96],["because",4.56],["the",4.86],["frequency",5.06],["belongs",5.4],["to",5.88],["the",6.12],["timer,",6.22],["not",6.98],["the",7.2],["channel.",7.36]],
  n2: [["It",0],["uses",0.24],["10",0.48],["bits",0.84],["and",1.18],["a",1.68],["duty",1.8],["of",2.04],["512.",2.28],["That's",3.58],["half,",3.92],["and",4.72],["it",4.82],["stays",4.9],["half",5.16],["at",5.56],["any",5.86],["frequency",6.12],["because",6.62],["it's",7.3],["counted",7.52],["in",7.74],["steps.",7.9]],
  n3: [["LEDC",0],["set",0.76],["frequency",1],["changes",1.62],["the",2.44],["frequency",2.66],["and",3.1],["nothing",3.72],["else.",3.94]],
  n4: [["So",0],["the",0.26],["pulse",0.38],["width",0.62],["sets",0.96],["the",1.34],["brightness",1.56],["and",1.9],["the",2.68],["frequency",2.78],["sets",3.2],["the",4],["pitch.",4.24]],
  z1: [["That's",0],["PWM.",0.38]],
};
// ── end generated ──

// ── cue helpers (read the generated VO plan) ───────────────────────────────

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9.]/g, '').replace(/\.$/, '');
/** when line `id` starts, scene-relative */
export const at = (id: string) => VO_AT[id] ?? 0;
/** when the n-th occurrence of `word` is spoken in line `id` (+ `plus` seconds) */
export function w(id: string, word: string, n = 0, plus = 0): number {
  const ws = VO_WORDS[id];
  if (!ws) return 0;
  const target = norm(word);
  let k = 0;
  for (const [x, s] of ws) {
    if (norm(x).startsWith(target) && k++ === n) return +(at(id) + s + plus).toFixed(2);
  }
  throw new Error(`cue: no "${word}" #${n} in VO line ${id}: ${ws.map((x) => x[0]).join(' ')}`);
}
/** when line `id` ends */
export function end(id: string): number {
  const ws = VO_WORDS[id];
  return ws?.length ? +(at(id) + ws[ws.length - 1][1] + 0.4).toFixed(2) : at(id);
}

// ── scenes ─────────────────────────────────────────────────────────────────

/** seconds of picture after a scene's last line (default 1.5) */
export const TAIL: Record<string, number> = { duty: 4.0, fade: 2.0, tone: 1.8, payoff: 4.5, setup: 1.0 };

const dur = (id: string, fallback: number) => SCENE_DUR[id] ?? fallback;
export const SCENES = [
  { id: 'problem', dur: 15.0 },
  { id: 'answer', dur: 7.0 },
  { id: 'setup', dur: dur('setup', 40) },
  { id: 'timer', dur: dur('timer', 120) },
  { id: 'channel', dur: dur('channel', 70) },
  { id: 'write', dur: dur('write', 80) },
  { id: 'duty', dur: dur('duty', 40) },
  { id: 'fade', dur: dur('fade', 110) },
  { id: 'tone', dur: dur('tone', 30) },
  { id: 'payoff', dur: dur('payoff', 8) },
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
export const PWM_FRAMES = Math.round(SECONDS * FPS);

// ── shared numbers (FACTS.md) ──────────────────────────────────────────────

export const PWM_HZ = 1000;
export const BITS = 8;
/** steps per period = the duty range's top: 0 … 256 */
export const STEPS = 2 ** BITS;
/** the counter counts 0 … 255 */
export const MAX = STEPS - 1;
/** the fastest LEDC clock (APB) */
export const CLOCK_HZ = 80e6;

// ── 1. the problem (v1, unchanged) ─────────────────────────────────────────

export const PROBLEM = {
  cardsIn: 0.3,
  /** "dim a light" — dimmer slider sweeps down */
  dim: [0.9, 2.6] as const,
  /** "change the pitch of a sound" — audible glide */
  pitch: [2.2, 4.3] as const,
  pitchHz: [440, 659.25] as const,
  /** cross to the pin */
  pinIn: 4.6,
  high: 8.88, // "Three point three volts" 5.2+3.68
  low: 10.62, // "or zero" 5.2+5.42
  tryMid: 11.51, // "Nothing in between" 5.2+6.31
  reject: 12.1,
  question: 12.6,
};

// ── 2. the answer (v1, unchanged) ──────────────────────────────────────────

export const ANSWER = {
  wave: 0.5, // "switch it on and off"
  fast: 1.4, // "really fast"
  fastEnd: 2.3,
  letters: [2.78, 3.05, 3.46] as const, // "P" "W" "M" 0.4+2.38/2.65/3.06
  words: [4.15, 4.56, 4.9] as const, // "pulse" "width" "modulation"
};

// ── 3. setup: the whole app_main ───────────────────────────────────────────

export const CONTEXT_CODE = [
  '#define LED GPIO_NUM_2',
  '',
  'void app_main(void)',
  '{',
  '    ledc_timer_config_t timer = {',
  '        .speed_mode      = LEDC_LOW_SPEED_MODE,',
  '        .timer_num       = LEDC_TIMER_0,',
  '        .freq_hz         = 1000,',
  '        .duty_resolution = LEDC_TIMER_8_BIT,',
  '        .clk_cfg         = LEDC_AUTO_CLK,',
  '    };',
  '    ESP_ERROR_CHECK(ledc_timer_config(&timer));',
  '',
  '    ledc_channel_config_t channel = {',
  '        .speed_mode = LEDC_LOW_SPEED_MODE,',
  '        .channel    = LEDC_CHANNEL_0,',
  '        .timer_sel  = LEDC_TIMER_0,',
  '        .gpio_num   = LED,',
  '        .duty       = 0,',
  '        .hpoint     = 0,',
  '    };',
  '    ESP_ERROR_CHECK(ledc_channel_config(&channel));',
  '',
  '    ledc_set_duty(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0, 128);',
  '    ledc_update_duty(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0);',
  '}',
];
/** line ranges in CONTEXT_CODE */
export const CODE_LINES = {
  timer: [4, 5, 6, 7, 8, 9, 10, 11],
  channel: [13, 14, 15, 16, 17, 18, 19, 20, 21],
  write: [23, 24],
};

export const CONTEXT = {
  views: { overview: at('c1'), timer: at('c2'), struct: at('c2b'), channel: at('c3'), write: at('c4'), start: at('c5') },
  ledc: w('c1', 'LEDC'),
  two: w('c1', 'two'),
  fast: w('c2', 'fast'),
  fine: w('c2', 'fine'),
  struct: w('c2b', 'struct'),
  bundle: w('c2b', 'bundle'),
  name: w('c2b', 'name'),
  amp: w('c2b', 'ampersand'),
  connects: w('c3', 'connects'),
  pin: w('c3', 'pin'),
  lines: w('c4', 'lines'),
  bright: w('c4', 'brightness'),
  captions: [
    { at: at('c1'), text: 'LEDC · the LED PWM controller makes the pulses · set up with two calls' },
    { at: at('c2'), text: 'a timer → how fast (frequency) and how fine (resolution)' },
    { at: at('c2b'), text: 'a struct = a bundle of settings, filled in by name · &timer hands it over' },
    { at: at('c3'), text: 'a channel → connects the timer to a pin' },
    { at: at('c4'), text: 'then two lines set the brightness' },
    { at: at('c5'), text: 'first: the timer' },
  ] as Caption[],
};

// ── 4. timer: ledc_timer_config ────────────────────────────────────────────

export const TIMER = {
  code: 'ESP_ERROR_CHECK(ledc_timer_config(&timer));',
  run: w('t1', 'LEDC'),
  args: [
    { token: '&timer', at: w('t1', 'speed'), title: 'speed_mode', value: 'low speed', sub: 'LEDC_LOW_SPEED_MODE' },
    { token: '&timer', at: w('t1', 'timer', 1), title: 'timer_num', value: 'timer 0', sub: 'LEDC_TIMER_0' },
    { token: '&timer', at: w('t1', 'frequency'), title: 'freq_hz', value: '1000 Hz', sub: 'how fast' },
    { token: '&timer', at: w('t1', 'resolution'), title: 'duty_resolution', value: '8 bits', sub: 'how fine' },
    { token: '&timer', at: w('t1', 'clock'), title: 'clk_cfg', value: 'auto', sub: 'LEDC_AUTO_CLK' },
  ],
  views: {
    speed: at('t2'),
    timers: at('t3'),
    freq: at('t4'),
    flicker: at('t5'),
    counter: at('t6'),
    bits: at('t8'),
    clock: at('t9'),
    log: at('t12'),
    check: at('t13'),
  },
  speed: { low: w('t2', 'low'), every: w('t2', 'Every'), same: w('t2', 'same') },
  timers: { four: w('t3', 'four'), zero: w('t3', 'This') },
  freq: {
    /** scroll speed while slowed (cycles per screen-second) → slowed 2000× */
    scroll: 0.5,
    freeze: [at('t4') + 1.6, at('t4') + 2.4] as const,
    cycle: w('t4', 'cycles'),
    hz: w('t4', '1000'),
    perSec: w('t4', 'Hz', 0, 0.3),
    ms: w('t4', 'millisecond'),
    period: w('t4', 'period'),
  },
  flicker: { slowHz: 5, same: w('t5', 'brightness'), fast: w('t5', 'fast') },
  counter: {
    eight: w('t6', '8'),
    appear: w('t6', 'counter'),
    pow: w('t6', '2'),
    steps: w('t6', '256'),
    tiny: w('t7', 'Each'),
    sweep: [w('t7', '0'), w('t7', '255')] as const,
    wrap: w('t7', 'then'),
    fast: [w('t7', '1000'), w('t7', 'second')] as const,
  },
  bits: { fade: [w('t8', 'finer'), w('t8', 'dimming', 0, 1.4)] as const },
  clock: {
    steps: w('t9', '256'),
    perSec: w('t9', 'thousand'),
    ticks: w('t9', '256', 1),
    auto: w('t10', 'Auto'),
    clock: w('t10', '80'),
    rows: [
      { at: w('t10', 'fit'), hz: 1000, bits: 8 },
      { at: w('t11', '16'), hz: 1000, bits: 16 },
      { at: w('t11', '17'), hz: 1000, bits: 17 },
    ],
    out: w('t11', "doesn't"),
  },
  log: { logs: w('t12', 'logs'), fail: w('t12', 'ESP') },
  check: { check: w('t13', 'ESP'), stops: w('t13', 'stops'), line: w('t13', 'line'), fix: w('t13', 'Fewer') },
  captions: [
    { at: at('t1'), text: 'ledc_timer_config(&timer) · five fields' },
    { at: at('t2'), text: 'speed mode: low speed — every chip has it; timer and channel must match' },
    { at: at('t3'), text: 'four timers · this is timer 0' },
    { at: at('t4'), text: 'frequency = complete on–off cycles per second' },
    { at: w('t4', 'millisecond'), text: '1000 Hz → each cycle (the period) lasts 1 ms' },
    { at: at('t5'), text: "frequency doesn't set brightness — it just has to beat your eye" },
    { at: at('t6'), text: 'resolution = how many steps each period is cut into' },
    { at: w('t6', '256'), text: '8 bits → 2⁸ = 256 steps, counted 0 … 255' },
    { at: at('t8'), text: 'more bits → finer steps → smoother dimming' },
    { at: at('t9'), text: 'steps × frequency = counts per second' },
    { at: at('t10'), text: 'LEDC_AUTO_CLK picks the clock · the fastest is 80 MHz' },
    { at: at('t11'), text: '1000 Hz × 17 bits = 131 M counts/s → doesn’t fit' },
    { at: at('t12'), text: 'ledc_timer_config logs the error and returns ESP_FAIL' },
    { at: w('t13', 'Fewer'), text: 'the fix: fewer bits, or a lower frequency' },
  ] as Caption[],
};

/**
 * The timer's counter, shared by picture and sound: where it is (0..1 of a
 * period, plus whole periods done) at scene time t. Sweeps once on
 * "0 … 255", holds, wraps, then speeds up.
 */
export function timerCounter(t: number): { u: number; n: number; live: boolean } {
  const K = TIMER.counter;
  const [s0, s1] = K.sweep;
  if (t < s0) return { u: 0, n: 0, live: false };
  if (t < s1) return { u: (t - s0) / (s1 - s0), n: 0, live: true };
  if (t < K.wrap) return { u: 0.9999, n: 0, live: false };
  const [f0, f1] = K.fast;
  const Lf = f1 - f0;
  const v = Math.min(1, Math.max(0, (t - f0) / Lf));
  const p = t - K.wrap + 2 * Lf * v ** 3 + 6 * Math.max(0, t - f1);
  return { u: p - Math.floor(p), n: 1 + Math.floor(p), live: true };
}

// ── 5. channel: ledc_channel_config ────────────────────────────────────────

export const CHANNEL = {
  code: 'ESP_ERROR_CHECK(ledc_channel_config(&channel));',
  run: w('h1', 'LEDC'),
  args: [
    { token: '&channel', at: w('h1', 'struct'), title: 'speed_mode', value: 'low speed', sub: 'same as the timer' },
    { token: '&channel', at: w('h1', 'channel', 1), title: 'channel', value: 'channel 0', sub: 'LEDC_CHANNEL_0' },
    { token: '&channel', at: w('h1', 'timer'), title: 'timer_sel', value: 'timer 0', sub: 'LEDC_TIMER_0' },
    { token: '&channel', at: w('h1', 'pin'), title: 'gpio_num', value: 'GPIO 2', sub: 'LED' },
    { token: '&channel', at: w('h1', 'starts'), title: 'duty', value: '0', sub: 'where it turns off' },
    { token: '&channel', at: w('h1', 'starts', 0, 0.3), title: 'hpoint', value: '0', sub: 'where it turns on' },
  ],
  views: { channels: at('h2'), timersel: at('h3'), pin: at('h4'), duty: at('h6'), hpoint: at('h7'), start: at('h8') },
  channels: { same: w('h2', 'same'), eight: w('h2', 'eight'), zero: w('h2', 'this') },
  timersel: { picks: w('h3', 'picks'), several: w('h3', 'Several'), share: w('h3', 'share', 1) },
  pin: { pin: w('h4', 'pin'), driver: w('h4', 'driver'), call: w('h4', 'call') },
  duty: {
    value: 64,
    off: w('h6', 'off'),
    line: w('h6', 'line'),
    trace: w('h6', 'While', 0, -0.4),
    /** screen-seconds per period while tracing */
    period: 2.4,
    on: w('h6', 'below'),
    passes: w('h6', 'passes'),
  },
  hpoint: { on: w('h7', 'turns'), zero: w('h7', 'zero') },
  start: { zero: w('h8', 'zero'), off: w('h8', 'off'), returns: w('h8', 'returns') },
  captions: [
    { at: at('h1'), text: 'ledc_channel_config(&channel): which channel, which timer, which pin, where it starts' },
    { at: at('h2'), text: 'same speed mode as the timer · 8 channels · this is channel 0' },
    { at: at('h3'), text: 'timer_sel: the counter this channel follows — shared timer = shared frequency' },
    { at: at('h4'), text: 'gpio_num = GPIO 2 · the driver connects it — no gpio_set_direction' },
    { at: at('h6'), text: 'the duty is a line across the counter: below it → pin ON, past it → OFF' },
    { at: at('h7'), text: 'hpoint = where it turns on · 0 = the start of every period' },
    { at: at('h8'), text: 'duty 0 → off · the channel runs as soon as the call returns' },
  ] as Caption[],
};

// ── 6. write: ledc_set_duty + ledc_update_duty ─────────────────────────────

export const WRITE = {
  /** the duty shown in the call follows `duty.keys` (see writeKey) */
  code: (v: number) => `ledc_set_duty(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0, ${v});`,
  update: 'ledc_update_duty(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0);',
  run: w('w1', 'LEDC'),
  args: [
    { token: 'LEDC_LOW_SPEED_MODE', at: w('w1', 'speed'), title: 'speed mode', value: 'low speed', sub: 'as before' },
    { token: 'LEDC_CHANNEL_0', at: w('w1', 'channel'), title: 'channel', value: 'channel 0', sub: 'as before' },
    { at: w('w1', 'number'), title: 'duty', value: '', sub: 'a number' },
  ],
  views: { what: at('w2'), duty: w('w2', "It's"), range: at('w6'), load: at('w8'), go: at('w9'), free: at('w10') },
  what: { notVolt: w('w2', 'voltage'), howLong: w('w2', 'long') },
  duty: {
    line: w('w2', 'line'),
    on: w('w2', 'before'),
    /** screen-seconds per period → slowed 2000× */
    period: 2.0,
    stepsOn: w('w3', 'first'),
    stepsOff: w('w3', 'other'),
    half: w('w3', 'Half'),
    light: w('w3', 'light'),
    keys: [
      { at: 0, v: 128 },
      { at: w('w4', 'Zero'), v: 0 },
      { at: w('w5', '255'), v: 255 },
      { at: w('w5', '256'), v: 256 },
      { at: at('w6') - 0.7, v: 128 },
    ],
    top: w('w5', 'line'),
  },
  range: { r8: w('w6', '8'), r10: w('w6', '10'), max10: w('w6', '1024'), half: w('w6', 'same'), h512: w('w6', '512') },
  load: { nothing: w('w8', 'nothing'), ready: w('w8', 'ready') },
  go: { update: at('w9'), go: w('w9', 'go'), next: w('w9', 'next') },
  free: { returns: w('w10', 'return'), hardware: w('w10', 'hardware') },
  captions: [
    { at: at('w1'), text: 'ledc_set_duty(speed mode, channel, duty) + ledc_update_duty(speed mode, channel)' },
    { at: at('w2'), text: "the duty isn't a voltage — it's how long the pin is on" },
    { at: w('w2', "It's"), text: 'the duty is the line across the counter' },
    { at: at('w3'), text: '128 steps on + 128 steps off = half of every period' },
    { at: at('w4'), text: '0 → never on' },
    { at: at('w5'), text: '255 → on 255 of 256 steps · 256 → always on' },
    { at: at('w6'), text: 'the range comes from the resolution: 8 bits → 0 … 256' },
    { at: w('w6', 'same'), text: 'same half: 128 of 256 = 512 of 1024' },
    { at: at('w8'), text: 'ledc_set_duty only gets the number ready — nothing changes yet' },
    { at: at('w9'), text: 'ledc_update_duty: go — from the start of the next period' },
    { at: at('w10'), text: 'both return at once · the hardware keeps switching on its own' },
  ] as Caption[],
};

/** the duty value written at scene time t (what the code shows) */
export function writeKey(t: number): number {
  let v = WRITE.duty.keys[0].v;
  for (const k of WRITE.duty.keys) if (t >= k.at) v = k.v;
  return v;
}

/** fraction of each period the pin is on at scene time t (256 = always on), gliding 0.35 s between writes */
export function writeOn(t: number): number {
  const frac = (v: number) => Math.min(1, v / STEPS);
  const ks = WRITE.duty.keys;
  let i = 0;
  for (let j = 0; j < ks.length; j++) if (t >= ks[j].at) i = j;
  const to = frac(ks[i].v);
  if (i === 0) return to;
  const from = frac(ks[i - 1].v);
  const u = Math.min(1, Math.max(0, (t - ks[i].at) / 0.35));
  return from + (to - from) * u * u * (3 - 2 * u);
}

// ── 7. knob 1: pulse width → brightness, on a real LED ─────────────────────

const pair = (v: number) => `ledc_set_duty(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0, ${v});\nledc_update_duty(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0);`;
export const DUTY = {
  preamble: ['// LEDC_TIMER_0: 1000 Hz · 8 bits', '// LEDC_CHANNEL_0 → GPIO 2 (the LED)'],
  beats: [
    { at: at('d1'), code: pair(128), duty: 128 / STEPS, marks: [{ at: w('d1', '128'), token: '128', strong: true }] },
    { at: at('d3'), code: pair(64), duty: 64 / STEPS, marks: [{ at: w('d3', '64'), token: '64', strong: true }] },
    { at: at('d4'), code: pair(230), duty: 230 / STEPS, marks: [{ at: w('d4', '230'), token: '230', strong: true }] },
    {
      at: w('d5', 'slides'),
      code: 'ledc_set_fade_with_time(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0,\n                        0, 2800);\nledc_fade_start(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0,\n                LEDC_FADE_WAIT_DONE);',
      duty: 0,
      glide: 2.76,
      marks: [
        { at: w('d5', 'slides'), token: '0', strong: true },
        { at: w('d5', 'slides', 0, 0.3), token: '2800', strong: true },
      ],
    },
  ] as Beat[],
  /** we slow the camera, not the chip — the code stays real */
  timescale: [
    { at: 0, rate: 1 / 500 },
    { at: at('d2') - 0.2, rate: 1 / 500 },
    { at: at('d2') + 2.0, rate: 1 },
  ] as RateKey[],
  captions: [
    { at: at('d0'), text: 'LEDC_TIMER_0 · 1000 Hz · 8 bits → duty 0 … 256' },
    { at: at('d1'), text: 'duty 128 = on 128 of 256 steps · slowed 500× — only ever fully on or off' },
    { at: at('d2'), text: '1000 times a second — your eye sees the average' },
    { at: at('d3'), text: 'duty 64 → on ¼ of each cycle → ¼ of the light' },
    { at: at('d4'), text: 'duty 230 → on 90% of each cycle → nearly full' },
    { at: at('d5'), text: 'a fade: the pin never dims — it spends less time on' },
  ] as Caption[],
};

// ── 8. fade: install / set_fade_with_time / fade_start ─────────────────────

/**
 * ESP-IDF's _ledc_set_fade_with_time(): total = ms × Hz / 1000 periods;
 * if total > |Δduty|: scale = 1, cycle = total / |Δduty| (integer division).
 * 2800 ms at 1 kHz, 230 → 0: 230 steps of −1, one every 12 periods = 2.76 s.
 */
export const FADE_FROM = 230;
export const FADE_TO = 0;
export const FADE_MS = 2800;
export const FADE_STEPS = Math.abs(FADE_FROM - FADE_TO);
export const FADE_TOTAL = (FADE_MS * PWM_HZ) / 1000;
export const FADE_CYCLE = Math.floor(FADE_TOTAL / FADE_STEPS);
export const FADE_REAL_S = (FADE_STEPS * FADE_CYCLE) / PWM_HZ;
/** duty, real seconds after the fade starts */
export const fadeDutyAt = (s: number) => Math.max(FADE_TO, FADE_FROM - Math.floor((Math.max(0, s) * PWM_HZ) / FADE_CYCLE));

export const FADE = {
  /** the three calls, each on screen from its `from` */
  calls: [
    {
      from: 0,
      code: 'ESP_ERROR_CHECK(ledc_fade_func_install(0));',
      size: 50,
      run: w('f1', 'LEDC'),
      args: [{ token: '0', at: w('f1', 'zero'), title: 'flags', value: '0', sub: 'the defaults' }],
    },
    {
      from: at('f3'),
      code: `ledc_set_fade_with_time(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0, ${FADE_TO}, ${FADE_MS});`,
      size: 40,
      run: w('f3', 'LEDC'),
      args: [
        { token: 'LEDC_LOW_SPEED_MODE', at: w('f3', 'speed'), title: 'speed mode', value: 'low speed', sub: 'as before' },
        { token: 'LEDC_CHANNEL_0', at: w('f3', 'channel'), title: 'channel', value: 'channel 0', sub: 'as before' },
        { token: String(FADE_TO), at: w('f3', 'end'), title: 'target', value: String(FADE_TO), sub: 'where to end' },
        { token: String(FADE_MS), at: w('f3', 'long'), title: 'time', value: `${FADE_MS} ms`, sub: 'how long' },
      ],
    },
    {
      from: at('f10'),
      code: 'ledc_fade_start(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0, LEDC_FADE_WAIT_DONE);',
      noWait: 'ledc_fade_start(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0, LEDC_FADE_NO_WAIT);',
      size: 38,
      run: w('f10', 'LEDC'),
      args: [
        { token: 'LEDC_LOW_SPEED_MODE', at: w('f10', 'LEDC', 0, 0.3), title: 'speed mode', value: 'low speed', sub: 'as before' },
        { token: 'LEDC_CHANNEL_0', at: w('f10', 'LEDC', 0, 0.5), title: 'channel', value: 'channel 0', sub: 'as before' },
        { token: 'LEDC_FADE_WAIT_DONE', at: w('f11', 'LEDC'), title: 'mode', value: 'wait', sub: 'until the fade ends' },
      ],
    },
  ],
  noWait: w('f12', 'LEDC'),
  views: {
    install: w('f1', 'Once'),
    forget: at('f2'),
    from: at('f3'),
    ramp: at('f5'),
    stairs: at('f6'),
    engine: at('f9'),
    start: at('f10'),
    nowait: at('f12'),
  },
  install: { once: w('f1', 'Once'), on: w('f1', 'switches'), zero: w('f1', 'zero') },
  forget: { logs: w('f2', 'logs'), fail: w('f2', 'ESP') },
  from: { end: w('f3', 'end'), long: w('f3', 'long'), none: w('f4', 'starting'), now: w('f4', 'now'), v230: w('f4', '230') },
  ramp: {
    /** the fade plays once, in real time, on "slides" */
    sweep: w('f5', 'slides'),
    loopEvery: 4.0,
    onOff: w('f5', 'only'),
    start: w('f5', 'Near'),
    end: w('f5', 'Near', 1),
    /** snapshot times, real seconds into the fade */
    snaps: [0.3, 1.4, 2.5],
  },
  stairs: {
    whole: w('f6', 'whole'),
    stairs: w('f6', 'staircase'),
    time: w('f6', '2'),
    periods: w('f6', '2800'),
    steps: w('f6', '30'),
    drop: w('f6', 'drops'),
    every: w('f6', '12'),
    rounds: w('f7', 'rounds'),
    real: w('f7', '2'),
  },
  engine: { hands: w('f9', 'hands'), rows: [w('f9', 'Count'), w('f9', '30'), w('f9', '12'), w('f9', '12', 0, 0.5)], hardware: w('f9', 'hardware', 1) },
  start: {
    go: w('f10', 'go'),
    waits: w('f11', 'waits'),
    /** the fade runs on screen, slowed ~2× */
    run: [w('f10', 'go'), w('f11', 'carries')] as const,
    carries: w('f11', 'carries'),
    free: w('f11', 'free'),
  },
  nowait: { returns: w('f12', 'returns'), next: w('f12', 'next'), waits: w('f12', 'waits') },
  captions: [
    { at: at('f1'), text: 'a fade takes three calls · first, once: ledc_fade_func_install(0)' },
    { at: at('f2'), text: 'forget it → "Fade service not installed" → ESP_FAIL' },
    { at: at('f3'), text: 'ledc_set_fade_with_time(speed mode, channel, target, milliseconds)' },
    { at: at('f4'), text: 'no starting value: it fades from the duty it has now (230)' },
    { at: at('f5'), text: 'the duty slides 230 → 0 · the pin is still only ever on or off' },
    { at: at('f6'), text: 'the duty is a whole number → the fade is a staircase' },
    { at: w('f6', '2800'), text: '2800 periods ÷ 230 steps → −1 every 12 periods' },
    { at: at('f7'), text: '12.17 rounds down to 12 → the fade really takes 2.76 s' },
    { at: at('f9'), text: 'the LEDC hardware does the stepping — not your code' },
    { at: at('f10'), text: 'ledc_fade_start: go' },
    { at: at('f11'), text: 'LEDC_FADE_WAIT_DONE → your task waits, the CPU is free' },
    { at: at('f12'), text: 'LEDC_FADE_NO_WAIT → returns at once · the next duty change waits for the fade' },
  ] as Caption[],
};

// ── 9. knob 2: frequency → pitch ───────────────────────────────────────────

const freq = (hz: number) => `ledc_set_freq(LEDC_LOW_SPEED_MODE, LEDC_TIMER_1, ${hz});`;
const T0 = end('n3');
export const TONE = {
  preamble: ['// LEDC_TIMER_1: 440 Hz · 10 bits', '// LEDC_CHANNEL_1 → GPIO 4 (the speaker)'],
  beats: [
    {
      at: w('n2', '512'),
      code: 'ledc_set_duty(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_1, 512);\nledc_update_duty(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_1);',
      duty: 0.5,
      hz: 440,
      marks: [{ at: w('n2', '512'), token: '512', strong: true }],
    },
    { at: T0 + 0.9, code: freq(523), duty: 0.5, hz: 523, marks: [{ at: T0 + 0.9, token: '523', strong: true }] },
    { at: T0 + 1.5, code: freq(659), duty: 0.5, hz: 659, marks: [{ at: T0 + 1.5, token: '659', strong: true }] },
    { at: T0 + 2.1, code: freq(880), duty: 0.5, hz: 880, marks: [{ at: T0 + 2.1, token: '880', strong: true }] },
    {
      at: T0 + 3.1,
      code: 'ledc_set_duty(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_1, 0);\nledc_update_duty(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_1);',
      duty: 0,
      marks: [{ at: T0 + 3.1, token: '0', strong: true }],
    },
  ] as Beat[],
  /** the notes are heard in full from here (the tone is ducked under VO before) */
  notes: T0 + 0.3,
  captions: [
    { at: at('n1'), text: 'frequency belongs to the timer → the speaker gets its own: LEDC_TIMER_1' },
    { at: at('n2'), text: '10 bits · duty 512 of 1024 = half, at any frequency' },
    { at: at('n3'), text: 'ledc_set_freq: only the frequency changes — 440 → 523 → 659 → 880 Hz' },
    { at: at('n4'), text: 'pulse width → brightness · frequency → pitch' },
  ] as Caption[],
  /** scope shows a fixed 10 ms of real time, so you can count the cycles */
  windowMs: 10,
};

// ── 10. payoff ─────────────────────────────────────────────────────────────

export const PAYOFF = {
  line: w('z1', "That's"),
  recap: [
    { at: w('z1', "That's", 0, 1.0), k: 'ledc_timer_config', v: 'frequency + resolution' },
    { at: w('z1', "That's", 0, 1.4), k: 'ledc_channel_config', v: 'pin + starting duty' },
    { at: w('z1', "That's", 0, 1.8), k: 'ledc_set_duty + ledc_update_duty', v: 'set it, then go' },
    { at: w('z1', "That's", 0, 2.2), k: 'the LEDC hardware', v: 'does the switching, and the fade' },
    { at: w('z1', "That's", 0, 2.6), k: 'next', v: 'let the pin tell you → interrupts' },
  ],
};

// ── voiceover (scratch: edge-tts) ─────────────────────────────────────────

/**
 * `text` is the script as written; `say` is what the TTS reads, if different.
 * `pause` = seconds of silence before the line (default 0.6; first line 0.5).
 * `fixed` = keep the hand-set `at` (problem, answer).
 */
export type VoLine = { id: string; scene: SceneId; at: number; text: string; say?: string; pause?: number; fixed?: boolean };
export const VOICE = 'en-US-AndrewMultilingualNeural';

const L = (id: string, scene: SceneId, text: string, say?: string, pause?: number): VoLine => ({ id, scene, at: at(id), text, say, pause });

export const VO: VoLine[] = [
  { id: 'p1', scene: 'problem', at: 0.6, fixed: true, text: "Let's say you want to dim a light, or change the pitch of a sound." },
  { id: 'p2', scene: 'problem', at: 5.2, fixed: true, text: 'But a digital output pin has only two levels, three point three volts or zero, with nothing in between.' },
  { id: 'p3', scene: 'problem', at: 12.6, fixed: true, text: 'So how do you get something in between?' },
  {
    id: 'a1',
    scene: 'answer',
    at: 0.4,
    fixed: true,
    text: "You switch it on and off, really fast. That's PWM: pulse width modulation.",
    say: "You switch it on and off, really fast. That's P W M: pulse width modulation.",
  },

  // 3 · setup: the whole app_main
  L('c1', 'setup', 'In ESP-IDF, the LED controller, LEDC, makes the pulses for you. You set it up with two calls.', 'In E S P I D F, the LED controller, LED-C, makes the pulses for you. You set it up with two calls.'),
  L('c2', 'setup', 'First, a timer, which sets how fast and how fine the pulses are.'),
  L('c2b', 'setup', 'Each setup call takes a struct: a bundle of settings, each one filled in by name. The ampersand hands the whole bundle to the call.'),
  L('c3', 'setup', 'Then a channel, which connects that timer to a pin.'),
  L('c4', 'setup', 'Then two more lines set the brightness.'),
  L('c5', 'setup', "Let's start with the timer."),

  // 4 · timer: ledc_timer_config
  L('t1', 'timer', 'ledc_timer_config takes a struct, and five fields matter: the speed mode, which timer, the frequency, the resolution, and the clock.', 'LED-C timer config takes a struct, and five fields matter: the speed mode, which timer, the frequency, the resolution, and the clock.'),
  L('t2', 'timer', 'For the speed mode, use low speed. Every ESP32 chip has it, and the timer and the channel must say the same thing.'),
  L('t3', 'timer', 'There are four timers, and this is timer zero.'),
  L('t4', 'timer', 'The frequency is how many complete on-off cycles happen every second. At a thousand hertz, each cycle lasts one millisecond. That window is called the period.'),
  L('t5', 'timer', "Frequency doesn't change the brightness. It only has to be fast enough that your eye can't see the flicker."),
  L('t6', 'timer', 'The resolution is eight bits. Inside, the timer is a counter that splits every period into two to the eighth, or two hundred and fifty-six, tiny steps.'),
  L('t7', 'timer', 'Each step is about three point nine microseconds. It counts from zero up to two fifty-five, then starts again, a thousand times a second.'),
  L('t8', 'timer', 'More bits means finer steps, and smoother dimming.'),
  L('t9', 'timer', 'The counter needs a clock. Two hundred and fifty-six steps, a thousand times a second, is two hundred and fifty-six thousand counts every second.'),
  L('t10', 'timer', 'LEDC_AUTO_CLK lets the driver pick the clock for you. The fastest it has runs at eighty megahertz, and your counts per second have to fit inside it.', 'LED-C auto clock lets the driver pick the clock for you. The fastest it has runs at eighty megahertz, and your counts per second have to fit inside it.'),
  L('t11', 'timer', "Sixteen bits still fits. Seventeen bits is a hundred and thirty-one million counts a second, and that doesn't."),
  L('t12', 'timer', "ledc_timer_config logs that it can't be done, and returns ESP_FAIL.", "LED-C timer config logs that it can't be done, and returns E S P fail."),
  L('t13', 'timer', 'Inside ESP_ERROR_CHECK, the program stops right there and tells you which line. Fewer bits, or a lower frequency, fixes it.', 'Inside E S P error check, the program stops right there and tells you which line. Fewer bits, or a lower frequency, fixes it.'),

  // 5 · channel: ledc_channel_config
  L('h1', 'channel', 'Next, ledc_channel_config. Its struct says which channel, which timer it follows, which pin it drives, and where it starts.', 'Next, LED-C channel config. Its struct says which channel, which timer it follows, which pin it drives, and where it starts.'),
  L('h2', 'channel', 'It uses the same speed mode as the timer. There are eight channels, and this is channel zero.'),
  L('h3', 'channel', 'timer_sel picks the counter this channel watches. Several channels can share one timer, but then they share its frequency and resolution.', 'Timer select picks the counter this channel watches. Several channels can share one timer, but then they share its frequency and resolution.'),
  L('h4', 'channel', "gpio_num is the pin: GPIO two. The driver connects the channel to it for you, so you don't call gpio_set_direction.", "GPIO num is the pin: GPIO two. The driver connects the channel to it for you, so you don't call GPIO set direction."),
  L('h6', 'channel', 'The duty is where the pin turns off. Think of it as a line across the counter. While the count is below the line, the pin is on. Once it passes the line, the pin is off.'),
  L('h7', 'channel', 'hpoint, the high point, is where it turns on. Zero means at the start of every period.', 'H point, the high point, is where it turns on. Zero means at the start of every period.'),
  L('h8', 'channel', 'Here the duty starts at zero, so the pin is off. And the channel is running the moment this call returns.'),

  // 6 · write: ledc_set_duty + ledc_update_duty
  L('w1', 'write', 'To change the brightness takes two calls. First, ledc_set_duty. It takes the speed mode, the channel, and a number: the duty.', 'To change the brightness takes two calls. First, LED-C set duty. It takes the speed mode, the channel, and a number: the duty.'),
  L('w2', 'write', "The duty doesn't set a voltage. It sets how long the pin stays on in every period. It's the line across the counter from before."),
  L('w3', 'write', 'So one twenty-eight means on for the first one twenty-eight steps, then off for the other one twenty-eight. Half of every period, so half the light.'),
  L('w4', 'write', 'Zero means never on.'),
  L('w5', 'write', "And the top isn't two fifty-five. It's two fifty-six. The line sits past the last step, so the pin never turns off."),
  L('w6', 'write', 'The range comes from the resolution. Eight bits gives you zero to two fifty-six. Ten bits would give you zero to ten twenty-four, and the same half becomes five twelve.'),
  L('w8', 'write', 'And on its own, it changes nothing. It only gets the number ready.'),
  L('w9', 'write', 'ledc_update_duty says go. The new duty takes effect at the start of the next period.', 'LED-C update duty says go. The new duty takes effect at the start of the next period.'),
  L('w10', 'write', 'Both calls return straight away. From then on, the hardware keeps the pin switching on its own.'),

  // 7 · duty: knob 1 on a real LED
  L('d0', 'duty', "Now let's try it on a real LED, at a thousand hertz and eight bits."),
  L('d1', 'duty', "A duty of one twenty-eight is half. Slowed down five hundred times, you can see it's fully on, then fully off."),
  L('d2', 'duty', 'At full speed, a thousand times a second, your eye just sees the average.', undefined, 2.4),
  L('d3', 'duty', "At sixty-four, it's on a quarter of the time, so you get a quarter of the light.", undefined, 1.2),
  L('d4', 'duty', "At two thirty, it's on nearly all the time, at nearly full brightness.", undefined, 0.9),
  L('d5', 'duty', 'A fade slides it down for you. The pin never dims. It just spends less time on.', undefined, 0.9),

  // 8 · fade: install / set_fade_with_time / fade_start
  L('f1', 'fade', 'A fade takes three calls. Call this one once, when your program starts: ledc_fade_func_install. It switches fading on. Pass zero.', 'A fade takes three calls. Call this one once, when your program starts: LED-C fade function install. It switches fading on. Pass zero.'),
  L('f2', 'fade', 'Forget it, and the fade call logs, Fade service not installed, and returns ESP_FAIL.', 'Forget it, and the fade call logs, Fade service not installed, and returns E S P fail.'),
  L('f3', 'fade', 'Then ledc_set_fade_with_time. It takes the speed mode, the channel, where to end, and how long to take, in milliseconds.', 'Then LED-C set fade with time. It takes the speed mode, the channel, where to end, and how long to take, in milliseconds.'),
  L('f4', 'fade', "There's no starting value. It fades from wherever the duty is now, and here, that's two thirty."),
  L('f5', 'fade', "The duty slides from two thirty down to zero in under three seconds. But at every moment, the pin is still only on or off. Near the start, each period is mostly on. Near the end, it's barely on at all."),
  L('f6', 'fade', 'And the duty is a whole number, so the fade is really a staircase. Two point eight seconds at a thousand hertz is two thousand eight hundred periods. That\'s two thirty steps, so the duty drops by one every twelve periods.'),
  L('f7', 'fade', 'Twelve, not twelve point one seven. It rounds down, so this fade really takes two point seven six seconds.'),
  L('f9', 'fade', 'It hands those numbers to the LEDC hardware: count down, two thirty steps, one every twelve periods. The hardware does the stepping, not your code.', 'It hands those numbers to the LED-C hardware: count down, two thirty steps, one every twelve periods. The hardware does the stepping, not your code.'),
  L('f10', 'fade', 'Then ledc_fade_start says go.', 'Then LED-C fade start says go.'),
  L('f11', 'fade', 'With LEDC_FADE_WAIT_DONE, your task waits until the fade ends, then carries on. While it waits, the CPU is free.', 'With LED-C fade wait done, your task waits until the fade ends, then carries on. While it waits, the CPU is free.'),
  L('f12', 'fade', 'Pass LEDC_FADE_NO_WAIT instead, and it returns at once. But on the ESP32, your next duty change waits until the fade is done.', 'Pass LED-C fade no wait instead, and it returns at once. But on the ESP32, your next duty change waits until the fade is done.'),

  // 9 · tone: knob 2
  L('n1', 'tone', 'Now for the second knob. A speaker on GPIO four gets its own timer, because the frequency belongs to the timer, not the channel.'),
  L('n2', 'tone', "It uses ten bits, and a duty of five twelve. That's half, and it stays half at any frequency, because it's counted in steps."),
  L('n3', 'tone', 'ledc_set_freq changes the frequency, and nothing else.', 'LED-C set frequency changes the frequency, and nothing else.'),
  L('n4', 'tone', 'So the pulse width sets the brightness, and the frequency sets the pitch.', undefined, 4.2),

  // 10 · payoff
  L('z1', 'payoff', "That's PWM.", "That's P W M.", 0.7),
];
