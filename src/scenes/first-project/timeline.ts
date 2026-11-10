/**
 * first-project: the timeline. Single source of truth for picture AND sound.
 *
 * One recorded take (capture/takes/first-project.ts → take.json + take.mp4):
 * VS Code on the empty esp32 folder → ESP-IDF: Create New Empty Project →
 * hello_world opens in a new window → one printf → target esp32 → build.
 * With a board on the take (BOARD=…): port → flash → monitor ("Hello world!").
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
export const VO_AT: Record<string, number> = {"i1":0.8,"i2":8.18,"i3":13.88,"n1a":0.8,"n1b":3.18,"n1c":0.3,"n2a":0.3,"n2b":0.3,"n3a":0.3,"n3b":0.3,"n4":0.3,"n5a":0.3,"n5b":4.64,"n6":0.3,"t1":0.5,"t2":0.4,"t3":0.4,"t4":6.62,"k1a":0.8,"k1b":3.04,"k2":0.4,"k3":0.4,"g1a":0.8,"g1b":5.08,"g2":0.3,"g3a":0.3,"g3b":7.02,"g4":0.3,"b1a":0.8,"b1b":3.06,"b2":0.3,"b3":0.3,"z1":0.6};
export const SCENE_DUR: Record<string, number> = {"intro":20.3,"new1":6.36,"new2":5.36,"act1":6.22,"act2":2.04,"act3":2.74,"name":3.44,"folder":7.64,"created":6.08,"win2":3.6,"tour1":8.62,"tour2":4.62,"tour3":14.38,"code1":5.74,"code2":7.98,"code3":3.08,"chip1":7.52,"chip2":12.52,"chip3":11.9,"chip5":6.98,"build1":6.2,"build2":10.24,"build3":7.6,"outro":8.48};
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
  g2: [["This",0],["course",0.28],["uses",0.52],["the",0.88],["original",1.06],["ESP32,",1.52],["so",3.42],["choose",3.66],["ESP32.",4.16],["If",6.7],["your",6.8],["board",6.94],["has",7.16],["a",7.36],["different",7.48],["chip,",7.7],["like",8.46],["an",8.52],["ESP32",8.68],["S3,",9.9],["pick",10.86],["that",11.02],["one",11.24],["instead.",11.36]],
  g3a: [["Next,",0],["it",0.94],["asks",1.02],["which",1.24],["debug",1.46],["adapter",1.84],["you",2.16],["use.",2.44],["This",3.3],["course",3.42],["doesn't",3.68],["use",4.18],["one,",4.4],["so",5.1],["it",5.36],["doesn't",5.46],["matter",5.7],["much.",5.86]],
  g3b: [["Choose",0],["ESP32",0.42],["chip",1.82],["via",2.32],["ESPProg.",2.9]],
  g4: [["A",0],["few",0.22],["seconds",0.36],["later,",0.66],["it",1.54],["says,",1.6],["target",2.46],["ESP32",2.82],["set",4.5],["successfully.",5.16]],
  b1a: [["Step",0],["four",0.34],["is",0.7],["to",1.08],["build",1.24],["the",1.44],["program.",1.6]],
  b1b: [["Click",0],["the",0.28],["wrench",0.46],["icon,",0.74],["which",1.76],["is",1.92],["build",2.08],["project.",2.26]],
  b2: [["The",0],["first",0.24],["build",0.46],["takes",0.74],["a",1],["while,",1.18],["about",1.9],["a",1.98],["minute",2.1],["on",2.36],["this",2.58],["computer,",2.72],["because",3.48],["it",3.72],["compiles",3.86],["ESP",4.38],["-IDF",4.66],["along",5.4],["with",5.76],["your",6],["one",6.08],["line.",6.26],["After",7.02],["that,",7.22],["it",7.94],["only",8.08],["rebuilds",8.32],["what",9],["you",9.08],["change.",9.18]],
  b3: [["When",0],["it",0.22],["finishes,",0.3],["it",1.32],["says",1.34],["Build",1.66],["Successful,",2.24],["and",3.56],["the",3.76],["output",3.88],["shows",4.16],["how",4.54],["big",4.96],["the",5.44],["program",5.64],["is.",5.88]],
  z1: [["Next,",0],["you",0.62],["plug",0.68],["in",0.86],["your",0.96],["board,",1.06],["flash",1.86],["the",2],["program",2.2],["onto",2.5],["it,",2.8],["and",3.44],["watch",3.62],["it",3.84],["print",4.04],["Hello",4.3],["World.",4.56]],
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
  { id: 'chip2', clip: { from: 'target-pick', to: 'ocd', lead: land(w('g2', 'instead'), 'target-pick', 'target-row-click') } },
  { id: 'chip3', clip: { from: 'ocd', to: 'ocd-click', lead: land(w('g3b', 'choose'), 'ocd', 'ocd-click') } },
  { id: 'chip4', clip: { from: 'ocd-click', to: 'target-done', maxRate: 6 } },
  { id: 'chip5', clip: { from: 'target-done', to: 'build-item', maxRate: 8 } }, // static after the toast
  { id: 'build1', clip: { from: 'build-item', to: 'build-click', lead: land(w('b1b', 'click'), 'build-item', 'build-click') } },
  { id: 'build2', clip: { from: 'build-click', to: 'build-done', maxRate: 8 } },
  { id: 'build3', clip: { from: 'build-done', to: 'end' } },
  { id: 'outro', clip: { from: 'END', to: 'END' } },
];
export const TAIL: Record<string, number> = {
  intro: 1.0, new1: 0.3, new2: 0.4, act1: 0.3, act2: 0.4, act3: 0.3, name: 0.5, folder: 0.5, created: 0.4,
  win2: 0.6, tour1: 0.4, tour2: 0.6, tour3: 0.8, code1: 0.5, code2: 0.6, code3: 0.5,
  chip1: 0.4, chip2: 0.5, chip3: 0.4, chip4: 0.3, chip5: 0.8, build1: 0.4, build2: 0.4, build3: 1.0, outro: 3.0,
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
  L('g2', 'chip2', 'This course uses the original ESP32, so choose esp32. If your board has a different chip, like an ESP32-S3, pick that one instead.', 'This course uses the original ESP32, so choose E S P 32. If your board has a different chip, like an ESP32 S3, pick that one instead.', 0.3),
  L('g3a', 'chip3', "Next, it asks which debug adapter you use. This course doesn't use one, so it doesn't matter much.", undefined, 0.3),
  L('g3b', 'chip3', 'Choose ESP32 chip, via ESP-PROG.', 'Choose E S P 32 chip, via E S P prog.'),
  L('g4', 'chip5', 'A few seconds later, it says Target ESP32 Set Successfully.', 'A few seconds later, it says: target E S P 32 set successfully.', 0.3),

  L('b1a', 'build1', 'Step four is to build the program.', undefined, 0.8),
  L('b1b', 'build1', 'Click the wrench icon, which is Build Project.', undefined, 0.3),
  L('b2', 'build2', 'The first build takes a while, about a minute on this computer, because it compiles ESP-IDF along with your one line. After that, it only rebuilds what you change.', undefined, 0.3),
  L('b3', 'build3', 'When it finishes, it says Build Successful, and the output shows how big the program is.', undefined, 0.3),

  L('z1', 'outro', 'Next, you plug in your board, flash the program onto it, and watch it print Hello world.', undefined, 0.6),
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
  targetRow: A('chip2', w('g2', 'choose')),
  targetClick: A('chip2', w('g2', 'instead')),
  ocd: whenTake('ocd'),
  ocdRow: A('chip3', w('g3b', 'choose')),
  targetDone: A('chip5', w('g4', 'target')),
  buildIcon: A('build1', w('b1b', 'wrench')),
  building: whenTake('building'),
  buildDone: whenTake('build-done'),
  size: A('build3', w('b3', 'output')),
  outro: A('outro', 0.2),
};

/** Step pills: [first beat, label]. Each lasts until the next one starts. */
const STEP_BEATS: [SceneId, string][] = [
  ['new1', 'Step 1 · Create the project'],
  ['code1', 'Step 2 · Write the code'],
  ['chip1', 'Step 3 · Pick the chip'],
  ['build1', 'Step 4 · Build'],
];
export const CHAPTERS = STEP_BEATS.map(([b, text], i) => ({
  from: sceneStart(b),
  to: i + 1 < STEP_BEATS.length ? sceneStart(STEP_BEATS[i + 1][0]) : sceneStart('outro'),
  text,
}));

/** SFX, cued from the same values as the visuals they belong to. */
export const SOUND: { t: number; kind: 'tick' | 'thump' | 'blip'; f?: number; amp?: number }[] = [
  ...[CUE.paletteRow, CUE.activateBtn, CUE.folderOk, CUE.openBtn, CUE.cmake, CUE.mainc, CUE.appMain, CUE.chipIcon,
    CUE.targetRow, CUE.ocdRow, CUE.buildIcon]
    .map((t) => ({ t, kind: 'tick' as const, f: 3100, amp: 0.05 })),
  { t: CUE.steps, kind: 'tick', f: 2000, amp: 0.09 },
  { t: CUE.typed, kind: 'thump', amp: 0.16 },
  { t: CUE.targetDone, kind: 'blip', amp: 0.06 },
  { t: CUE.buildDone, kind: 'blip', amp: 0.07 },
];
