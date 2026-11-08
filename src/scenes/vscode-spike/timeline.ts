/**
 * vscode-spike: the timeline. Single source of truth for picture AND sound.
 *
 * A recorded VS Code take (capture/takes/spike.ts → take.json + take.mp4) cut
 * into beats. Each beat plays one stretch of the take (event → event) under
 * its narration:
 *
 *   beat length = max(narration, take stretch ÷ maxRate)
 *   video       = 1× (or faster, up to maxRate, where the beat is shorter),
 *                 then holds its last frame until the narration is done
 *
 * Camera, spotlights and callouts are cued from spoken words (`w(line, word)`)
 * and point at boxes the take measured (`box(event)`), so re-recording the
 * take or re-wording a line re-times everything.
 *
 *   node scripts/vo-plan.ts vscode-spike     # re-time from the voice
 *   npm run vscode-spike                     # soundtrack + render
 *
 * Only imports take.json (Node and the bundler both read it).
 */
import take from './take.json' with { type: 'json' };

export const FPS = 30;
export const SECTION = 'spikes';
export const VOICE = 'en-US-AndrewMultilingualNeural';

// ── generated: VO plan (node scripts/vo-plan.ts vscode-spike) — do not edit by hand ──
export const VO_AT: Record<string, number> = {"a1":0.6,"a2":6.5,"b1":0.3,"b2":0.5,"c1":0.3,"d1":0.3,"d2":0.3,"e1":0.3,"f1":0.4,"f2":5.6,"g1":0.3,"h1":0.5};
export const SCENE_DUR: Record<string, number> = {"intro":13.72,"palette":3.48,"typing":6,"terminal":4.4,"command":6.26,"version":6.62,"open":6.48,"code":10.14,"line":4.78,"outro":8.76};
export const VO_WORDS: Record<string, [string, number][]> = {
  a1: [["This",0],["is",0.38],["VS",0.62],["Code.",1.06],["With",1.88],["the",1.94],["ESP",2.06],["-IDF",2.28],["extension,",2.8],["open",3.72],["on",4.02],["a",4.24],["small",4.36],["blink",4.64],["project.",4.86]],
  a2: [["Down",0],["in",0.34],["the",0.46],["status",0.56],["bar,",0.76],["it",1.54],["shows",1.7],["the",1.9],["ESP",2.08],["-IDF",2.34],["version",3.02],["it",3.24],["found,",3.4],["version",4.74],["6",4.74],[".0",5.28],[".2.",5.64]],
  b1: [["Press",0],["Ctrl",0.32],["Shift",0.64],["P",0.96],["to",1.32],["open",1.78],["the",2.08],["Command",2.2],["Palette.",2.46]],
  b2: [["Start",0],["typing",0.4],["and",0.78],["run.",1.3],["ESP",2.38],["-IDF.",2.44],["Open",3.56],["ESP",3.72],["-IDF",4.14],["terminal.",4.74]],
  c1: [["You",0],["get",0.2],["a",0.3],["terminal",0.44],["with",0.7],["ESP",0.9],["-IDF's",1.4],["tools",2.18],["already",2.48],["set",3.02],["up.",3.28]],
  d1: [["To",0],["check",0.22],["which",0.38],["version",0.54],["you",0.76],["have,",0.92],["type",1.64],["idf",1.86],[".py",3.14],["-dash",3.96],["-version",4.96]],
  d2: [["ESP",0],["-ADF",0.36],["version",0.84],["6",1.06],[".0",1.68],[".2.",2.44],["This",3.44],["course",3.68],["uses",3.94],["version",4.36],["6.",4.72]],
  e1: [["Now",0],["open",0.28],["main",0.64],[".c,",0.86],["press",2.24],["Ctrl",2.38],["P,",2.7],["type",3.48],["the",3.68],["file",3.82],["name,",4.04],["and",4.68],["press",4.9],["Enter.",5.16]],
  f1: [["This",0],["is",0.26],["the",0.36],["program",0.5],["you'll",0.78],["flash.",1.04],["It",2.08],["blinks",2.18],["an",2.44],["LED",2.58],["on",3.02],["GPIO2.",3.58]],
  f2: [["On",0],["for",0.26],["half",0.44],["a",0.74],["second,",0.94],["off",1.94],["for",2],["half",2.26],["a",2.56],["second,",2.72],["forever.",3.42]],
  g1: [["and",0],["GPIO",0.28],["set",0.74],["direction",1.04],["makes",1.44],["that",1.9],["pin",2.16],["an",2.4],["output.",2.54]],
  h1: [["Next,",0],["you'll",0.84],["ask",0.94],["an",1.14],["AI",1.28],["agent",1.7],["to",2.06],["write",2.28],["a",2.42],["program",2.52],["like",2.74],["this",3.06],["and",3.42],["learn",4.06],["what",4.2],["to",4.36],["check",4.5],["before",4.76],["you",5.1],["flash",5.24],["it.",5.52]],
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
export const TAKE_SRC = 'vscode-spike/take.mp4';
function ev(id: string): Ev {
  const e = EVENTS.find((x) => x.id === id);
  if (!e) throw new Error(`take.json has no event "${id}" (re-record: capture/takes/spike.ts)`);
  return e;
}
/** Take time of an event; 'BEGIN' / 'END' are the ends of the recording. */
export const tk = (id: string) => (id === 'BEGIN' ? 0 : id === 'END' ? take.duration - 0.05 : ev(id).t);
export const box = (id: string) => ev(id).box as Box;

// ── beats ──────────────────────────────────────────────────────────────────

/**
 * `lead`: scene-relative time the stretch starts playing (hold its first frame
 * until then), so an action starts on the word that names it.
 */
type Clip = { from: string; to: string; maxRate?: number; lead?: number };
const BEATS: { id: string; clip: Clip }[] = [
  { id: 'intro', clip: { from: 'BEGIN', to: 'palette-open' } },
  { id: 'palette', clip: { from: 'palette-open', to: 'palette-typing', lead: w('b1', 'ctrl', 0, -0.1) } },
  { id: 'typing', clip: { from: 'palette-typing', to: 'run-terminal', lead: w('b2', 'start') } },
  { id: 'terminal', clip: { from: 'run-terminal', to: 'terminal-open', maxRate: 3 } }, // shell start-up wait
  { id: 'command', clip: { from: 'cmd-start', to: 'version', lead: w('d1', 'type', 0, -0.1) } },
  { id: 'version', clip: { from: 'version', to: 'quick-open' } },
  { id: 'open', clip: { from: 'quick-open', to: 'editor-open', lead: w('e1', 'press', 0, -0.1) } },
  { id: 'code', clip: { from: 'editor-open', to: 'show-line' } },
  { id: 'line', clip: { from: 'show-line', to: 'end' } },
  { id: 'outro', clip: { from: 'end', to: 'END' } },
];
export const TAIL: Record<string, number> = { intro: 1.0, palette: 0.3, typing: 0.6, terminal: 0.6, command: 0.6, version: 1.2, open: 0.8, code: 0.8, line: 1.6, outro: 2.5 };

const span = (c: Clip) => tk(c.to) - tk(c.from);
export const SCENES = BEATS.map((b) => ({
  id: b.id,
  clip: b.clip,
  dur: +Math.max(SCENE_DUR[b.id] ?? 3, (b.clip.lead ?? 0) + span(b.clip) / (b.clip.maxRate ?? 1)).toFixed(2),
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
export const SPIKE_FRAMES = Math.round(SECONDS * FPS);

/** Output time → take time: each beat plays its stretch, then holds. */
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

/** Output time at which the video reaches take event `id` (inverse of takeTime). */
export function whenTake(id: string): number {
  const t = tk(id);
  let t0 = 0;
  for (const s of SCENES) {
    const a = tk(s.clip.from);
    const len = span(s.clip);
    if (t >= a && t <= a + len) {
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
const L = (id: string, scene: SceneId, text: string, say?: string, pause?: number): VoLine => ({ id, scene, at: at(id), text, say, pause });

export const VO: VoLine[] = [
  L('a1', 'intro', 'This is VS Code, with the ESP-IDF extension, open on a small blink project.', undefined, 0.6),
  L('a2', 'intro', 'Down in the status bar, it shows the ESP-IDF version it found: v6.0.2.',
    'Down in the status bar, it shows the ESP-IDF version it found: version six point oh point two.'),
  L('b1', 'palette', 'Press Ctrl+Shift+P to open the command palette.', 'Press Control Shift P to open the command palette.', 0.3),
  L('b2', 'typing', 'Start typing, and run ESP-IDF: Open ESP-IDF Terminal.', 'Start typing, and run: ESP-IDF, open ESP-IDF terminal.'),
  L('c1', 'terminal', "You get a terminal with ESP-IDF's tools already set up.", undefined, 0.3),
  L('d1', 'command', 'To check which version you have, type idf.py --version.', 'To check which version you have, type: I D F dot P Y, dash dash version.', 0.3),
  L('d2', 'version', 'ESP-IDF v6.0.2. This course uses version 6.', 'ESP-IDF version six point oh point two. This course uses version six.', 0.3),
  L('e1', 'open', 'Now open main.c. Press Ctrl+P, type the file name, and press Enter.', 'Now open main dot C. Press Control P, type the file name, and press Enter.', 0.3),
  L('f1', 'code', "This is the program you'll flash. It blinks an LED on GPIO 2:", "This is the program you'll flash. It blinks an LED on GPIO two:", 0.4),
  L('f2', 'code', 'on for half a second, off for half a second, forever.'),
  L('g1', 'line', 'And gpio_set_direction makes that pin an output.', 'And GPIO set direction makes that pin an output.', 0.3),
  L('h1', 'outro', "Next, you'll ask an AI agent to write a program like this, and learn what to check before you flash it.", undefined, 0.5),
];

// ── cues (absolute seconds) ────────────────────────────────────────────────

const A = (scene: SceneId, t: number) => +(sceneStart(scene) + t).toFixed(2);

export const CUE = {
  status: A('intro', w('a2', 'status')),
  palette: A('palette', w('b1', 'ctrl', 0, -0.4)),
  typing: A('typing', 0),
  terminal: A('terminal', 0.2),
  command: A('command', w('d1', 'type', 0, -0.6)),
  open: A('open', w('e1', 'press', 0, -0.5)),
  version: A('version', 0.1),
  versionOut: A('version', sceneDur('version') - 0.3),
  editor: whenTake('editor-open'),
  gpio2: A('code', w('f1', 'GPIO')),
  loop: A('code', w('f2', 'on')),
  line: A('line', 0),
  lineSpot: A('line', w('g1', 'gpio', 0, -0.1)),
  output: A('line', w('g1', 'output')),
  outro: A('outro', 0.2),
};

/** SFX, cued from the same values as the visuals they belong to. */
export const SOUND: { t: number; kind: 'tick' | 'thump' | 'blip'; f?: number; amp?: number }[] = [
  { t: CUE.status, kind: 'tick', f: 3100, amp: 0.05 },
  { t: CUE.version, kind: 'tick', f: 3100, amp: 0.05 },
  { t: CUE.gpio2, kind: 'tick', f: 3100, amp: 0.05 },
  { t: CUE.loop, kind: 'tick', f: 3100, amp: 0.05 },
  { t: CUE.lineSpot, kind: 'thump', amp: 0.2 },
];
