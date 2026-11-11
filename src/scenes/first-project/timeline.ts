/**
 * first-project: the timeline. Single source of truth for picture AND sound.
 *
 * One recorded take (capture/takes/first-project.ts → take.json + take.mp4):
 * VS Code on the empty esp32 folder → ESP-IDF: Create New Empty Project →
 * hello_world opens in a new window → one printf → target esp32 → build.
 * Then port → flash → monitor ("Hello world!") on the board (an ESP32-S3 here, BOARD=/dev/ttyACM2
 * TARGET=esp32s3; the course's later videos use the original ESP32, and the VO says so).
 *
 *   beat length = max(narration + tail, lead + take stretch ÷ maxRate)
 *   video       = holds its first frame until `lead`, plays (faster up to
 *                 maxRate where needed), then holds its last frame
 *
 *   node scripts/vo-plan.ts first-project   # re-time from the voice
 *   npm run first-project                   # soundtrack + render
 */
import take from './take.json' with { type: 'json' };

export const FPS = 30;
export const SECTION = '0-setup';
export const VOICE = 'en-US-AndrewMultilingualNeural';

// ── generated: VO plan (node scripts/vo-plan.ts first-project) — do not edit by hand ──
export const VO_AT: Record<string, number> = {"i1":0.8,"i2":8.18,"i3":13.88,"n1a":0.8,"n1b":3.18,"n1c":0.3,"n2a":0.3,"n2b":0.3,"n3a":0.3,"n3b":0.3,"n4":0.3,"n5a":0.3,"n5b":4.64,"n6":0.3,"t1":0.5,"t2":0.4,"t3":0.4,"t4":6.62,"k1a":0.8,"k1b":3.04,"k2":0.4,"k3":0.4,"g1a":0.8,"g1b":5.08,"g2":0.3,"g3a":0.3,"g3b":6.62,"g4":0.3,"b1a":0.8,"b1b":3.06,"b2":0.3,"b3":0.3,"r1a":0.8,"r1b":6.22,"r2":0.3,"r3":0.3,"r4a":0.3,"r4b":2.72,"r5":0.3,"r6":0.3,"r7":0.3,"r8":0.5,"r9":0.3,"z1":0.6};
export const SCENE_DUR: Record<string, number> = {"intro":20.3,"new1":6.36,"new2":5.36,"act1":6.22,"act2":2.04,"act3":2.74,"name":3.44,"folder":7.64,"created":6.08,"win2":3.6,"tour1":8.62,"tour2":4.62,"tour3":14.38,"code1":5.74,"code2":7.98,"code3":3.08,"chip1":7.52,"chip2":16.08,"chip3":13.72,"chip5":7.6,"build1":6.2,"build2":10.24,"build3":7.6,"port1":10.74,"port2":11.7,"flash1":3.5,"flash2":7.6,"flash4":5.5,"mon1":4.52,"mon2":7,"mon3":8.02,"mon4":4.82,"outro":15.92};
export const VO_WORDS: Record<string, [string, number][]> = {
  i1: [["In",0],["the",0.2],["last",0.3],["video,",0.52],["you",1.34],["installed",1.48],["ESB",2.02],["-IDF.",2.62],["Now",3.72],["it's",3.82],["time",3.96],["for",4.1],["your",4.26],["first",4.36],["program.",4.62],["One",5.52],["that",5.74],["prints",5.9],["hello",6.22],["world.",6.48]],
  i2: [["You'll",0],["create",0.28],["the",0.46],["project,",0.6],["write",1.36],["one",1.44],["line",1.64],["of",1.84],["code,",1.96],["pick",2.6],["your",2.78],["chip,",2.94],["build",3.52],["it,",3.72],["and",4.24],["then",4.34],["run",4.44],["it",4.6],["on",4.7],["the",4.8],["board.",4.9]],
  i3: [["We'll",0],["start",0.3],["in",0.56],["VS",0.86],["Code",1.26],["in",1.64],["the",2.14],["empty",2.3],["ESP32",2.62],["folder",4.2],["from",4.6],["last",4.88],["time.",5.12]],
  n1a: [["Step",0],["1",0.36],["is",0.72],["to",1.06],["create",1.2],["the",1.42],["project.",1.6]],
  n1b: [["Press",0],["Ctrl",0.32],["Shift",0.64],["P",0.96],["to",1.32],["open",1.78],["the",2.08],["Command",2.2],["Palette.",2.46]],
  n1c: [["then",0],["run",0.32],["the",0.56],["command.",0.7],["Yes",1.9],["BIDF.",1.96],["Create",3.32],["new",3.52],["empty",3.92],["project.",4.2]],
  n2a: [["The",0],["folder",0.24],["is",0.62],["still",0.96],["empty,",1.32],["so",2.32],["VSCode",2.56],["asks",3.28],["again",3.7],["whether",4.02],["it",4.3],["should",4.5],["turn",4.68],["the",4.9],["extension",5.02],["on.",5.3]],
  n2b: [["Click",0],["Activate",0.32],["anyway.",0.84]],
  n3a: [["Next,",0],["it",0.76],["asks",0.84],["for",1],["a",1.18],["name",1.3],["for",1.44],["your",1.66],["project.",1.78]],
  n3b: [["Type",0],["hello",0.32],["underscore",0.62],["world",1],["and",1.46],["press",2.04],["enter.",2.32]],
  n4: [["Then",0],["it",0.22],["asks",0.3],["where",0.52],["to",0.7],["put",0.8],["the",0.9],["project.",1.04],["It",1.98],["starts",2.04],["in",2.28],["your",2.48],["ESP32",2.62],["folder,",4.06],["which",4.8],["is",5],["what",5.1],["you",5.2],["want,",5.28],["so",6],["click",6.3],["OK.",6.62]],
  n5a: [["The",0],["extension",0.24],["creates",0.56],["the",1.04],["project",1.22],["and",1.66],["asks",2.34],["whether",2.8],["you",3.08],["want",3.22],["to",3.32],["open",3.4],["it.",3.56]],
  n5b: [["Click",0],["Open",0.26],["Hello",0.46],["World.",0.72]],
  n6: [["The",0],["project",0.24],["opens",0.56],["in",0.9],["a",1.18],["new",1.34],["VS",1.58],["Code",2.08],["window.",2.38]],
  t1: [["Every",0],["ESP",0.36],["-IDF",0.62],["project",1.06],["has",1.44],["the",1.96],["same",2.12],["shape.",2.38],["The",3.34],["CMake",3.36],["list",3.68],["file",3.9],["at",4.2],["the",4.38],["top",4.5],["tells",4.66],["ESP",5],["-IDF",5.42],["that",6.12],["this",6.26],["folder",6.44],["is",6.82],["a",7.24],["project.",7.36]],
  t2: [["Your",0],["code",0.22],["goes",0.44],["in",0.7],["the",0.84],["main",0.92],["folder,",1.04],["so",1.82],["open",2.08],["it",2.38],["and",2.6],["click",2.88],["main",3.02],[".c.",3.18]],
  t3: [["For",0],["now,",0.28],["the",0.98],["whole",1.18],["program",1.34],["is",1.76],["one",2.08],["include",2.42],["line",2.82],["and",3.26],["an",3.88],["empty",4],["function",4.26],["called",4.66],["AppMain.",4.98]],
  t4: [["App",0],["Main",0.34],["is",0.6],["where",1.02],["your",1.16],["program",1.28],["starts.",1.54],["When",2.66],["the",2.74],["chip",2.86],["boots,",3.04],["ESBIDF",4.1],["sets",4.62],["everything",4.82],["up",5.14],["and",5.52],["then",6.02],["it",6.1],["calls",6.22],["App",6.46],["Main.",6.72]],
  k1a: [["Step",0],["2",0.36],["is",0.68],["your",1.02],["one",1.18],["line",1.38],["of",1.58],["code.",1.72]],
  k1b: [["Inside",0],["App",0.48],["Main,",0.7],["type",1.4],["this",1.64],["printf.",1.84]],
  k2: [["Print",0],["F",0.38],["sends",0.7],["text",1.14],["down",1.46],["the",1.84],["USB",2.02],["cable",2.4],["to",2.76],["your",2.94],["computer",3.06],["and",3.44],["the",4.1],["backslash",4.24],["N",4.92],["at",5.24],["the",5.44],["end",5.58],["finishes",5.96],["the",6.48],["line.",6.72]],
  k3: [["Press",0],["Ctrl",0.34],["S",0.72],["to",1.12],["save",1.42],["the",1.68],["file.",1.84]],
  g1a: [["Step",0],["3",0.36],["is",0.76],["to",1.12],["tell",1.3],["ESP",1.5],["-IDF",1.82],["which",2.52],["chip",2.8],["is",3.14],["on",3.56],["your",3.7],["board.",3.8]],
  g1b: [["Click",0],["the",0.28],["chip",0.42],["icon",0.6],["in",1.02],["the",1.32],["status",1.42],["bar.",1.66]],
  g2: [["Choose",0],["the",0.34],["chip",0.5],["on",0.66],["your",0.82],["board.",0.92],["The",1.68],["one",1.7],["I",1.82],["have",2],["here",2.22],["is",2.54],["an",2.8],["ESP32S3,",2.98],["so",5.22],["I",5.52],["choose",5.84],["ESP32S3.",6.16],["The",8.72],["rest",8.84],["of",9],["this",9.2],["course",9.36],["uses",9.64],["the",10.06],["original",10.28],["ESP32,",10.68],["which",12.88],["is",12.98],["the",13.12],["one",13.26],["called",13.48],["ESP32.",13.78]],
  g3a: [["Next,",0],["it",0.96],["asks",1.1],["how",1.3],["you",1.46],["would",1.54],["debug",1.64],["the",1.96],["board.",2.14],["This",2.88],["course",3.06],["doesn't",3.36],["use",3.74],["a",3.9],["debugger,",4.04],["so",4.72],["it",5],["doesn't",5.1],["matter",5.34],["much.",5.48]],
  g3b: [["Choose",0],["the",0.32],["first",0.5],["entry,",0.82],["ESP32",1.92],["-S3",2.94],["chip",3.94],["via",4.36],["built",4.96],["-in",5.28],["USB",5.5],["JTAG.",5.96]],
  g4: [["A",0],["few",0.22],["seconds",0.36],["later,",0.64],["it",1.54],["says",1.56],["target",1.92],["ESP32S3",2.78],["set",5],["successfully.",5.64]],
  b1a: [["Step",0],["four",0.34],["is",0.7],["to",1.08],["build",1.24],["the",1.44],["program.",1.6]],
  b1b: [["Click",0],["the",0.28],["wrench",0.46],["icon,",0.74],["which",1.76],["is",1.92],["build",2.08],["project.",2.26]],
  b2: [["The",0],["first",0.24],["build",0.46],["takes",0.74],["a",1],["while,",1.18],["about",1.9],["a",1.98],["minute",2.1],["on",2.36],["this",2.58],["computer,",2.72],["because",3.48],["it",3.72],["compiles",3.86],["ESP",4.38],["-IDF",4.66],["along",5.4],["with",5.76],["your",6],["one",6.08],["line.",6.26],["After",7.02],["that,",7.22],["it",7.94],["only",8.08],["rebuilds",8.32],["what",9],["you",9.08],["change.",9.18]],
  b3: [["When",0],["it",0.22],["finishes,",0.3],["it",1.32],["says",1.34],["Build",1.66],["Successful,",2.24],["and",3.56],["the",3.76],["output",3.88],["shows",4.16],["how",4.54],["big",4.96],["the",5.44],["program",5.64],["is.",5.88]],
  r1a: [["Step",0],["five",0.36],["is",0.72],["to",1.18],["run",1.34],["it",1.52],["on",1.6],["your",1.68],["board.",1.8],["Plug",2.66],["the",2.68],["board",2.84],["into",3.04],["your",3.22],["computer",3.36],["with",3.76],["a",4.26],["USB",4.38],["cable.",4.68]],
  r1b: [["Then",0],["click",0.24],["the",0.4],["plug",0.56],["icon",0.72],["in",1.1],["the",1.3],["status",1.38],["bar,",1.62],["which",2.44],["picks",2.56],["the",2.8],["serial",3.02],["port",3.36],["to",3.62],["use.",3.82]],
  r2: [["Choose",0],["your",0.34],["board's",0.5],["port.",0.8],["On",1.56],["Linux,",1.64],["it's",2.14],["called",2.24],["slash",2.42],["dev",2.84],["slash",3.3],["ttysomething.",3.94],["On",5.58],["Windows,",5.74],["it's",6.6],["a",6.82],["com",6.88],["port,",7.1],["and",7.78],["on",7.84],["a",8.02],["Mac,",8.12],["it",8.78],["starts",8.9],["with",9.16],["slash",9.36],["dev",9.78],["slash",10.1],["cu.",10.52]],
  r3: [["Now",0],["click",0.28],["the",0.48],["lightning",0.66],["icon,",0.92],["which",1.92],["is",2],["flash",2.14],["device.",2.4]],
  r4a: [["The",0],["first",0.22],["time,",0.4],["it",1.1],["asks",1.28],["how",1.46],["you",1.62],["want",1.7],["to",1.8],["flash.",1.88]],
  r4b: [["Choose",0],["UART,",0.34],["which",1.8],["flashes",2.06],["over",2.66],["the",3.02],["same",3.2],["USB",3.54],["cable.",4.04]],
  r5: [["A",0],["few",0.22],["seconds",0.34],["later,",0.64],["it",1.46],["says",1.54],["flash",1.82],["done.",2.24],["Your",3.1],["program",3.2],["is",3.58],["now",3.92],["on",4.18],["the",4.34],["board.",4.38]],
  r6: [["To",0],["see",0.2],["what",0.36],["the",0.48],["board",0.58],["prints,",0.86],["click",1.66],["the",1.8],["monitor",1.96],["icon,",2.26],["the",3.28],["little",3.36],["screen.",3.5]],
  r7: [["The",0],["board",0.24],["restarts,",0.46],["ESPDF",1.58],["starts",2.14],["up,",2.4],["and",3.02],["an",3.08],["app",3.2],["main",3.48],["runs",3.78],["and",4.12],["prints.",4.76],["Hello",5.78],["world.",6.06]],
  r8: [["Right",0],["after",0.28],["that,",0.54],["app",1.46],["main",1.48],["returns,",1.68],["and",2.66],["the",2.74],["log",2.84],["says",3.08],["so.",3.38],["That's",4.24],["fine.",4.46],["Your",5.24],["program",5.34],["has",5.64],["done",5.84],["its",6],["one",6.14],["job.",6.38]],
  r9: [["to",0],["stop",0.22],["the",0.44],["monitor,",0.6],["press",1.44],["control",1.56],["at",2],["the",2.6],["right",2.72],["square",2.9],["bracket.",3.2]],
  z1: [["That's",0],["your",0.34],["first",0.44],["ESP",0.78],["-IDF",1.18],["program.",1.76],["One",2.66],["line",2.82],["of",2.98],["code,",3.12],["built,",3.66],["flashed,",4.24],["and",5.12],["running",5.16],["on",5.38],["a",5.5],["Rayall",5.6],["board.",5.9],["Next",6.72],["up",6.82],["is",7.06],["Basic",7.34],["GPIO,",7.8],["where",8.9],["the",9.08],["board",9.24],["starts",9.54],["switching",9.9],["in",10.38],["LED",10.72],["and",11.08],["reading",11.8],["a",12.02],["button.",12.18]],
};
// ── end generated ──

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9.]/g, '').replace(/\.$/, '');
export const at = (id: string) => VO_AT[id] ?? 0;
/** Scene-relative time of the n-th word starting with `word` in line `id`. */
export function w(id: string, word: string, n = 0, plus = 0): number {
  const ws = VO_WORDS[id];
  if (!ws) return at(id) + plus;
  const target = norm(word);
  let k = 0;
  for (const [x, s] of ws) if (norm(x).startsWith(target) && k++ === n) return +(at(id) + s + plus).toFixed(2);
  throw new Error(`cue: no "${word}" #${n} in VO line ${id}: ${ws.map((x) => x[0]).join(' ')}`);
}
export function end(id: string): number {
  const ws = VO_WORDS[id];
  return ws?.length ? +(at(id) + ws[ws.length - 1][1] + 0.4).toFixed(2) : at(id) + 3;
}

// ── the take ───────────────────────────────────────────────────────────────

export type Box = [x: number, y: number, w: number, h: number];
type Ev = { t: number; id: string; box?: number[]; text?: string };
const EVENTS = take.events as Ev[];
export const TAKE_SIZE = take.size as [number, number];
export const TAKE_SRC = 'first-project/take.mp4';
/** The take ran on a real board (port → flash → monitor are in it). */
export const BOARD = !!(take as { board?: string | null }).board;
export function ev(id: string): Ev {
  const e = EVENTS.find((x) => x.id === id);
  if (!e) throw new Error(`take.json has no event "${id}" (re-record: npm run first-project:take)`);
  return e;
}
export const tk = (id: string) => (id === 'BEGIN' ? 0 : id === 'END' ? take.duration - 0.05 : ev(id).t);
export const box = (id: string) => ev(id).box as Box;

// ── beats ──────────────────────────────────────────────────────────────────

/** `lead`: scene-relative time the stretch starts playing (holds its first frame until then). */
type Clip = { from: string; to: string; maxRate?: number; lead?: number };
/** Lead that lands take event `click` (played at 1×) on scene time `word`. */
const land = (word: number, from: string, click: string) => +(word - (tk(click) - tk(from))).toFixed(2);
const BEATS: { id: string; clip: Clip }[] = [
  { id: 'intro', clip: { from: 'BEGIN', to: 'palette' } },
  // The palette opens and the title goes in at once (the full command list shows for ~0.5 s only).
  { id: 'new1', clip: { from: 'palette', to: 'palette-row', lead: w('n1b', 'ctrl', 0, -0.1) } },
  { id: 'new2', clip: { from: 'palette-row', to: 'palette-enter' } },
  { id: 'act1', clip: { from: 'palette-enter', to: 'activate', maxRate: 2 } },
  { id: 'act2', clip: { from: 'activate', to: 'activate-click', lead: land(w('n2b', 'activate'), 'activate', 'activate-click') } },
  { id: 'act3', clip: { from: 'activate-click', to: 'name', maxRate: 3 } },
  { id: 'name', clip: { from: 'name', to: 'name-enter', lead: land(w('n3b', 'type'), 'name', 'name-typing') } },
  { id: 'folder', clip: { from: 'name-enter', to: 'folder-click', lead: land(w('n4', 'ok'), 'name-enter', 'folder-click') } },
  { id: 'created', clip: { from: 'folder-click', to: 'open-click', lead: land(w('n5b', 'open'), 'folder-click', 'open-click') } },
  { id: 'win2', clip: { from: 'win2', to: 'cmake' } },
  { id: 'tour1', clip: { from: 'cmake', to: 'main-click' } },
  { id: 'tour2', clip: { from: 'main-click', to: 'editor', lead: land(w('t2', 'open'), 'main-click', 'main-click') } },
  { id: 'tour3', clip: { from: 'editor', to: 'type-start' } },
  { id: 'code1', clip: { from: 'type-start', to: 'typed', lead: w('k1b', 'type', 0, -0.1) } },
  { id: 'code2', clip: { from: 'typed', to: 'save' } },
  { id: 'code3', clip: { from: 'save', to: 'target-item', lead: w('k3', 'ctrl', 0, -0.1) } },
  { id: 'chip1', clip: { from: 'target-item', to: 'target-pick', lead: land(w('g1b', 'click'), 'target-item', 'target-click') } },
  { id: 'chip2', clip: { from: 'target-pick', to: 'ocd', lead: land(end('g2') - 0.2, 'target-pick', 'target-row-click') } },
  { id: 'chip3', clip: { from: 'ocd', to: 'ocd-click', lead: land(w('g3b', 'choose'), 'ocd', 'ocd-click') } },
  { id: 'chip4', clip: { from: 'ocd-click', to: 'target-done', maxRate: 6 } },
  { id: 'chip5', clip: { from: 'target-done', to: 'build-item', maxRate: 8 } }, // static after the toast
  { id: 'build1', clip: { from: 'build-item', to: 'build-click', lead: land(w('b1b', 'click'), 'build-item', 'build-click') } },
  { id: 'build2', clip: { from: 'build-click', to: 'build-done', maxRate: 8 } },
  { id: 'build3', clip: { from: 'build-done', to: 'port-item', maxRate: 6 } }, // static after the toast
  { id: 'port1', clip: { from: 'port-item', to: 'port-pick', lead: land(w('r1b', 'click'), 'port-item', 'port-click') } },
  { id: 'port2', clip: { from: 'port-pick', to: 'port-done', lead: land(end('r2') - 0.2, 'port-pick', 'port-row-click') } },
  { id: 'flash1', clip: { from: 'port-done', to: 'method', lead: land(w('r3', 'click'), 'port-done', 'flash-click') } },
  { id: 'flash2', clip: { from: 'method', to: 'flashing', lead: land(w('r4b', 'choose'), 'method', 'method-click') } },
  { id: 'flash3', clip: { from: 'flashing', to: 'flash-done', maxRate: 2 } },
  { id: 'flash4', clip: { from: 'flash-done', to: 'monitor-item', maxRate: 12, lead: w('r5', 'your') } }, // holds on the toast, then static
  { id: 'mon1', clip: { from: 'monitor-item', to: 'monitor-click', lead: land(w('r6', 'click'), 'monitor-item', 'monitor-click') } },
  { id: 'mon2', clip: { from: 'monitor-click', to: 'hello', lead: w('r7', 'restarts', 0, -0.2) } },
  { id: 'mon3', clip: { from: 'hello', to: 'monitor-exit' } },
  { id: 'mon4', clip: { from: 'monitor-exit', to: 'end', lead: w('r9', 'control', 0, -0.1) } },
  { id: 'outro', clip: { from: 'END', to: 'END' } },
];
export const TAIL: Record<string, number> = {
  intro: 1.0, new1: 0.3, new2: 0.4, act1: 0.3, act2: 0.4, act3: 0.3, name: 0.5, folder: 0.5, created: 0.4,
  win2: 0.6, tour1: 0.4, tour2: 0.6, tour3: 0.8, code1: 0.5, code2: 0.6, code3: 0.5,
  chip1: 0.4, chip2: 0.5, chip3: 0.4, chip4: 0.3, chip5: 0.8, build1: 0.4, build2: 0.4, build3: 1.0,
  port1: 0.4, port2: 0.6, flash1: 0.4, flash2: 0.4, flash3: 0.3, flash4: 0.6, mon1: 0.4, mon2: 0.4, mon3: 0.8, mon4: 1.0, outro: 3.0,
};

const span = (c: Clip) => tk(c.to) - tk(c.from);
export const SCENES = BEATS.map((b) => ({
  id: b.id,
  clip: b.clip,
  // Beats without narration (e.g. a sped-up wait) last as long as their video.
  dur: +Math.max(SCENE_DUR[b.id] ?? 0, (b.clip.lead ?? 0) + span(b.clip) / (b.clip.maxRate ?? 1)).toFixed(2),
}));
export type SceneId = (typeof BEATS)[number]['id'];
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
export const FIRST_FRAMES = Math.round(SECONDS * FPS);

/** Output time → take time: each beat holds, plays its stretch, then holds. */
export function takeTime(t: number): number {
  let t0 = 0;
  for (const s of SCENES) {
    if (t < t0 + s.dur || s === SCENES[SCENES.length - 1]) {
      const a = tk(s.clip.from);
      const len = span(s.clip);
      const lead = s.clip.lead ?? 0;
      const rate = Math.max(1, len / (s.dur - lead));
      return Math.min(a + len, a + Math.max(0, t - t0 - lead) * rate);
    }
    t0 += s.dur;
  }
  return 0;
}
/** Output time at which the video reaches take event `id`. */
export function whenTake(id: string): number {
  const t = tk(id);
  let t0 = 0;
  for (const s of SCENES) {
    const a = tk(s.clip.from);
    const len = span(s.clip);
    if (t >= a && t <= a + len && len > 0) {
      const lead = s.clip.lead ?? 0;
      const rate = Math.max(1, len / (s.dur - lead));
      return +(t0 + lead + (t - a) / rate).toFixed(2);
    }
    t0 += s.dur;
  }
  throw new Error(`take event ${id} is in no beat`);
}

// ── narration ──────────────────────────────────────────────────────────────

export type VoLine = { id: string; scene: SceneId; at: number; text: string; say?: string; pause?: number };
/** The voice reads "VS Code" as "versus Code"; spell it out everywhere. */
const voiced = (s: string) => s.replace(/VS Code/g, 'V S Code');
const L = (id: string, scene: SceneId, text: string, say?: string, pause?: number): VoLine => {
  const v = voiced(say ?? text);
  return { id, scene, at: at(id), text, say: v === text ? undefined : v, pause };
};

export const VO: VoLine[] = [
  L('i1', 'intro', "In the last video, you installed ESP-IDF. Now it's time for your first program: one that prints Hello world.", undefined, 0.8),
  L('i2', 'intro', "You'll create the project, write one line of code, pick your chip, build it, and then run it on the board."),
  L('i3', 'intro', "We'll start in VS Code, in the empty esp32 folder from last time.", "We'll start in V S Code, in the empty E S P 32 folder from last time."),

  L('n1a', 'new1', 'Step one is to create the project.', undefined, 0.8),
  L('n1b', 'new1', 'Press Ctrl+Shift+P to open the command palette.', 'Press Control Shift P to open the command palette.', 0.4),
  L('n1c', 'new2', 'Then run the command ESP-IDF: Create New Empty Project.', 'Then run the command: ESP-IDF, create new empty project.', 0.3),
  L('n2a', 'act1', 'The folder is still empty, so VS Code asks again whether it should turn the extension on.', undefined, 0.3),
  L('n2b', 'act2', 'Click Activate Anyway.', undefined, 0.3),
  L('n3a', 'act3', 'Next, it asks for a name for your project.', undefined, 0.3),
  L('n3b', 'name', 'Type hello_world, and press Enter.', 'Type hello underscore world, and press Enter.', 0.3),
  L('n4', 'folder', "Then it asks where to put the project. It starts in your esp32 folder, which is what you want, so click OK.", "Then it asks where to put the project. It starts in your E S P 32 folder, which is what you want, so click OK.", 0.3),
  L('n5a', 'created', 'The extension creates the project, and asks whether you want to open it.', undefined, 0.3),
  L('n5b', 'created', 'Click Open hello_world.', 'Click Open hello world.'),
  L('n6', 'win2', 'The project opens in a new VS Code window.', undefined, 0.3),

  L('t1', 'tour1', 'Every ESP-IDF project has the same shape. The CMakeLists file at the top tells ESP-IDF that this folder is a project.', 'Every ESP-IDF project has the same shape. The C make lists file at the top tells ESP-IDF that this folder is a project.', 0.5),
  L('t2', 'tour2', 'Your code goes in the main folder, so open it, and click main.c.', 'Your code goes in the main folder, so open it, and click main dot C.', 0.4),
  L('t3', 'tour3', 'For now, the whole program is one include line and an empty function called app_main.', 'For now, the whole program is one include line, and an empty function called app main.', 0.4),
  L('t4', 'tour3', 'app_main is where your program starts. When the chip boots, ESP-IDF sets everything up, and then it calls app_main.', 'App main is where your program starts. When the chip boots, ESP-IDF sets everything up, and then it calls app main.'),

  L('k1a', 'code1', 'Step two is your one line of code.', undefined, 0.8),
  L('k1b', 'code1', 'Inside app_main, type this printf.', 'Inside app main, type this print F.', 0.3),
  L('k2', 'code2', 'printf sends text down the USB cable to your computer, and the backslash n at the end finishes the line.', 'Print F sends text down the USB cable to your computer, and the backslash N at the end finishes the line.', 0.4),
  L('k3', 'code3', 'Press Ctrl+S to save the file.', 'Press Control S to save the file.', 0.4),

  L('g1a', 'chip1', 'Step three is to tell ESP-IDF which chip is on your board.', undefined, 0.8),
  L('g1b', 'chip1', 'Click the chip icon in the status bar.', undefined, 0.3),
  L('g2', 'chip2', 'Choose the chip on your board. The one I have here is an ESP32-S3, so I choose esp32s3. The rest of this course uses the original ESP32, which is the one called esp32.', 'Choose the chip on your board. The one I have here is an ESP32 S3, so I choose E S P 32 S3. The rest of this course uses the original ESP32, which is the one called E S P 32.', 0.3),
  L('g3a', 'chip3', "Next, it asks how you would debug the board. This course doesn't use a debugger, so it doesn't matter much.", undefined, 0.3),
  L('g3b', 'chip3', 'Choose the first entry: ESP32-S3 chip, via built-in USB-JTAG.', 'Choose the first entry: ESP32 S3 chip, via built-in U S B J TAG.'),
  L('g4', 'chip5', 'A few seconds later, it says Target ESP32S3 Set Successfully.', 'A few seconds later, it says: target ESP32 S3 set successfully.', 0.3),

  L('b1a', 'build1', 'Step four is to build the program.', undefined, 0.8),
  L('b1b', 'build1', 'Click the wrench icon, which is Build Project.', undefined, 0.3),
  L('b2', 'build2', 'The first build takes a while, about a minute on this computer, because it compiles ESP-IDF along with your one line. After that, it only rebuilds what you change.', undefined, 0.3),
  L('b3', 'build3', 'When it finishes, it says Build Successful, and the output shows how big the program is.', undefined, 0.3),

  L('r1a', 'port1', 'Step five is to run it on your board. Plug the board into your computer with a USB cable.', undefined, 0.8),
  L('r1b', 'port1', 'Then click the plug icon in the status bar, which picks the serial port to use.', undefined, 0.3),
  L('r2', 'port2', "Choose your board's port. On Linux, it's called slash dev slash tty something. On Windows, it's a COM port, and on a Mac, it starts with slash dev slash cu.", "Choose your board's port. On Linux, it's called slash dev slash T T Y something. On Windows, it's a com port, and on a Mac, it starts with slash dev slash C U.", 0.3),
  L('r3', 'flash1', 'Now click the lightning icon, which is Flash Device.', undefined, 0.3),
  L('r4a', 'flash2', 'The first time, it asks how you want to flash.', undefined, 0.3),
  L('r4b', 'flash2', 'Choose UART, which flashes over the same USB cable.', 'Choose U A R T, which flashes over the same USB cable.', 0.3),
  L('r5', 'flash4', 'A few seconds later, it says Flash Done. Your program is now on the board.', undefined, 0.3),
  L('r6', 'mon1', 'To see what the board prints, click the monitor icon, the little screen.', undefined, 0.3),
  L('r7', 'mon2', 'The board restarts, ESP-IDF starts up, and then app_main runs and prints Hello world.', 'The board restarts, ESP-IDF starts up, and then app main runs, and prints: Hello world.', 0.3),
  L('r8', 'mon3', "Right after that, app_main returns, and the log says so. That's fine: your program has done its one job.", "Right after that, app main returns, and the log says so. That's fine. Your program has done its one job."),
  L('r9', 'mon4', 'To stop the monitor, press Ctrl and the right square bracket.', 'To stop the monitor, press Control, and the right square bracket.', 0.3),
  L('z1', 'outro', "That's your first ESP-IDF program: one line of code, built, flashed, and running on a real board. Next up is Basic GPIO, where the board starts switching an LED and reading a button.", undefined, 0.6),
];

// ── cues (absolute seconds) ────────────────────────────────────────────────

const A = (scene: SceneId, t: number) => +(sceneStart(scene) + t).toFixed(2);

export const CUE = {
  steps: A('intro', w('i2', 'create')),
  stepsOut: A('intro', end('i2') + 0.6),
  folder: A('intro', w('i3', 'empty')),
  palette: A('new1', w('n1b', 'ctrl')),
  paletteRow: A('new2', w('n1c', 'create')),
  activate: whenTake('activate'),
  activateBtn: A('act2', w('n2b', 'activate')),
  name: whenTake('name'),
  nameTyped: A('name', w('n3b', 'enter')),
  folderBox: whenTake('folder'),
  folderOk: A('folder', w('n4', 'ok')),
  created: whenTake('created'),
  openBtn: A('created', w('n5b', 'open')),
  win2: A('win2', 0),
  cmake: A('tour1', w('t1', 'cmake')),
  main: A('tour2', w('t2', 'main')),
  mainc: A('tour2', w('t2', 'click')),
  editor: whenTake('editor'),
  include: A('tour3', w('t3', 'include')),
  appMain: A('tour3', w('t3', 'app')),
  boots: A('tour3', w('t4', 'boots')),
  type: A('code1', w('k1b', 'type')),
  typed: whenTake('typed'),
  usb: A('code2', w('k2', 'usb')),
  newline: A('code2', w('k2', 'backslash')),
  save: A('code3', w('k3', 'ctrl')),
  saved: whenTake('saved'),
  chipIcon: A('chip1', w('g1b', 'chip')),
  targetPick: whenTake('target-pick'),
  targetRow: A('chip2', w('g2', 'choose', 1)),
  targetClick: A('chip2', end('g2') - 0.2),
  ocd: whenTake('ocd'),
  ocdRow: A('chip3', w('g3b', 'choose')),
  targetDone: A('chip5', w('g4', 'target')),
  buildIcon: A('build1', w('b1b', 'wrench')),
  building: whenTake('building'),
  buildDone: whenTake('build-done'),
  size: A('build3', w('b3', 'output')),
  plug: A('port1', w('r1b', 'plug')),
  portPick: whenTake('port-pick'),
  portRow: A('port2', w('r2', 'choose')),
  portClick: A('port2', end('r2') - 0.2),
  portDone: whenTake('port-done'),
  flashIcon: A('flash1', w('r3', 'lightning')),
  method: whenTake('method'),
  uart: A('flash2', w('r4b', 'choose')),
  flashDone: whenTake('flash-done'),
  monIcon: A('mon1', w('r6', 'monitor')),
  monitor: whenTake('monitor-click'),
  hello: A('mon2', w('r7', 'hello')),
  returned: A('mon3', w('r8', 'returns')),
  exit: A('mon4', w('r9', 'control')),
  outro: A('outro', 0.2),
};

/** Step pills: [first beat, label]. Each lasts until the next one starts. */
const STEP_BEATS: [SceneId, string][] = [
  ['new1', 'Step 1 · Create the project'],
  ['code1', 'Step 2 · Write the code'],
  ['chip1', 'Step 3 · Pick the chip'],
  ['build1', 'Step 4 · Build'],
  ['port1', 'Step 5 · Run it on the board'],
];
export const CHAPTERS = STEP_BEATS.map(([b, text], i) => ({
  from: sceneStart(b),
  to: i + 1 < STEP_BEATS.length ? sceneStart(STEP_BEATS[i + 1][0]) : sceneStart('outro'),
  text,
}));

/** SFX, cued from the same values as the visuals they belong to. */
export const SOUND: { t: number; kind: 'tick' | 'thump' | 'blip'; f?: number; amp?: number }[] = [
  ...[CUE.paletteRow, CUE.activateBtn, CUE.folderOk, CUE.openBtn, CUE.cmake, CUE.mainc, CUE.appMain, CUE.chipIcon,
    CUE.targetRow, CUE.ocdRow, CUE.buildIcon, CUE.plug, CUE.portRow, CUE.flashIcon, CUE.uart, CUE.monIcon]
    .map((t) => ({ t, kind: 'tick' as const, f: 3100, amp: 0.05 })),
  { t: CUE.steps, kind: 'tick', f: 2000, amp: 0.09 },
  { t: CUE.typed, kind: 'thump', amp: 0.16 },
  { t: CUE.targetDone, kind: 'blip', amp: 0.06 },
  { t: CUE.buildDone, kind: 'blip', amp: 0.07 },
  { t: CUE.flashDone, kind: 'blip', amp: 0.07 },
  { t: CUE.hello, kind: 'thump', amp: 0.2 },
];
