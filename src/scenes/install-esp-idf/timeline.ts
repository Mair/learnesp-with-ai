/**
 * install-esp-idf: the timeline. Single source of truth for picture AND sound.
 *
 * One recorded take (capture/takes/install-esp-idf.ts → take.json + take.mp4):
 * the VS Code download page, a fresh VS Code installing the ESP-IDF
 * extension, the EIM prerequisites page, EIM installing ESP-IDF (sped up),
 * selecting the version and checking it in an ESP-IDF terminal.
 *
 *   beat length = max(narration + tail, lead + take stretch ÷ maxRate)
 *   video       = holds its first frame until `lead`, plays (faster up to
 *                 maxRate where needed), then holds its last frame
 *
 * Cues come from spoken words (`w(line, word)`) or from when the video
 * reaches a take event (`whenTake(event)`); boxes come from the take.
 *
 *   node scripts/vo-plan.ts install-esp-idf   # re-time from the voice
 *   npm run install-esp-idf                   # soundtrack + render
 */
import take from './take.json' with { type: 'json' };

export const FPS = 30;
export const SECTION = '0-setup';
export const VOICE = 'en-US-AndrewMultilingualNeural';

// ── generated: VO plan (node scripts/vo-plan.ts install-esp-idf) — do not edit by hand ──
export const VO_AT: Record<string, number> = {"i1":0.8,"i2":11.12,"i3":18.14,"v1":0.4,"v2":8.18,"v3":11.56,"v4":16.92,"v5":24.44,"v6":0.5,"e1":0.3,"e2":0.3,"e3":0.3,"e4":0.3,"e5a":0.3,"e5b":6.88,"e6":0.3,"p1":0.4,"p2":0.3,"p3":0.3,"p4":0.3,"p5":8.54,"p6":12.54,"s1a":0.4,"s1b":0.3,"s1c":0.3,"s2a":0.3,"s2b":0.3,"s3a":0.3,"s3b":0.3,"s4a":0.3,"s4b":0.3,"s5a":0.3,"s5b":0.3,"s6":0.3,"s6b":0.3,"s7":0.3,"s8":7.92,"s9":15.16,"s10a":0.3,"s10b":5.9,"s11":0.4,"c1a":0.4,"c1b":5.6,"c2":0.3,"c3":0.3,"k1a":0.4,"k1b":3.26,"k2":0.3,"k3":0.3,"l1":0.5,"l2":4.5,"l3":14.54,"z1":0.5};
export const SCENE_DUR: Record<string, number> = {"intro":21.98,"vsc":30.76,"open":8.7,"ext1":8.1,"ext2":2.52,"ext3":3.78,"ext4":1.58,"ext5":9.34,"ext6":5.64,"pre1":5.68,"pre2":5.62,"pre3":11.74,"pre4":15.74,"eim1":5.2,"eim2":3.48,"eim3":6.24,"eim4":6.04,"eim5":2.14,"eim6":4.36,"eim6b":3.12,"eim7":3.6,"eim7b":5.42,"eim8":4.46,"eim9":2.84,"eim10":2.6,"eim10b":4.8,"eim11":17.38,"eim12":10.52,"eim13":4.14,"sel1":12.24,"sel2":3.28,"sel3":7.36,"chk1":8.1,"chk2":5.32,"chk3":7.5,"serial":26.94,"outro":15.32};
export const VO_WORDS: Record<string, [string, number][]> = {
  i1: [["Before",0],["you",0.36],["can",0.5],["program",0.64],["an",1.02],["ESP32,",1.36],["you",3.18],["need",3.3],["three",3.46],["things",3.84],["on",4.16],["your",4.32],["computer.",4.44],["VS",5.4],["Code,",5.72],["the",6.56],["ESP",6.6],["-IDF",6.84],["Extension,",7.3],["and",8.46],["ESP",8.5],["-IDF",8.88],["itself.",9.4]],
  i2: [["I'm",0],["using",0.26],["Linux",0.5],["in",0.8],["this",0.96],["video,",1.1],["and",2],["whenever",2.42],["Windows",2.92],["or",3.44],["a",3.88],["Mac",4],["does",4.26],["something",4.5],["differently,",4.8],["I'll",5.76],["tell",6.02],["you.",6.2]],
  i3: [["There",0],["are",0.26],["seven",0.34],["steps,",0.68],["and",1.52],["we'll",1.6],["go",1.74],["through",1.9],["them",2.1],["one",2.28],["at",2.58],["a",2.7],["time.",2.86]],
  v1: [["Step",0],["one",0.36],["is",0.66],["VS",0.96],["Code",1.34],["itself.",1.6],["You",2.64],["can",2.68],["download",2.8],["it",3.14],["from",3.28],["code",3.44],[".visualstudio",3.78],[".com",5.32],["slash",6.38],["download.",6.64]],
  v2: [["If",0],["you're",0.24],["on",0.34],["Windows,",0.48],["run",1.42],["the",1.52],["installer",1.82],["that",2],["you",2.26],["downloaded.",2.36]],
  v3: [["On",0],["a",0.22],["Mac,",0.32],["open",1.04],["the",1.28],["download",1.44],["and",1.86],["drag",2.5],["VS",2.84],["Code",3.2],["into",3.56],["your",3.78],["Applications",3.94],["folder.",4.42]],
  v4: [["On",0],["Linux,",0.28],["choose",1.02],["the",1.22],[".deb",1.46],["package",2.16],["for",2.74],["Ubuntu",2.98],["or",3.32],["Debian",3.98],["or",4.44],["the",5.08],[".rpm",5.2],["package",6.04],["for",6.44],["Fedora.",6.66]],
  v5: [["Don't",0],["use",0.38],["the",0.5],["snap",0.68],["version,",0.96],["though,",1.78],["because",2.48],["it",2.66],["can't",2.8],["open",3.12],["the",3.3],["installer",3.46],["window",3.88],["that",4.32],["you'll",4.68],["need",4.84],["later",4.98],["on.",5.2]],
  v6: [["Once",0],["it's",0.3],["installed,",0.48],["open",1.46],["VS",1.62],["Code",2.04],["and",2.4],["then",3.06],["open",3.16],["an",3.44],["empty",3.6],["folder",3.88],["for",4.18],["your",4.38],["projects.",4.52],["Mine",5.7],["is",5.74],["called",5.92],["ESP32.",6.12]],
  e1: [["Step",0],["2",0.36],["is",0.7],["the",1.08],["Yes",1.22],["-BIDF",1.48],["extension.",2.3],["To",3.2],["find",3.38],["it,",3.64],["press",4.22],["Ctrl",4.34],["-Shift",4.74],["-X,",5.12],["which",5.86],["opens",6.14],["the",6.48],["extensions",6.66],["view.",7.06]],
  e2: [["Then",0],["search",0.26],["for",0.56],["ESB",0.84],["-IDF.",1.42]],
  e3: [["Pick",0],["the",0.28],["extension",0.46],["that's",0.92],["published",1.48],["by",1.78],["Espressive",2.08],["Systems.",2.64]],
  e4: [["Then",0],["click",0.28],["install.",0.48]],
  e5a: [["Because",0],["this",0.4],["is",0.6],["your",0.74],["first",0.88],["extension",1.18],["from",1.78],["Espressif,",2.28],["VSCode",3.56],["asks",4.3],["whether",4.8],["you",5.1],["trust",5.3],["the",5.52],["publisher.",5.7]],
  e5b: [["Click",0],["Trust",0.32],["Publisher",0.68],["and",1.18],["install.",1.56]],
  e6: [["When",0],["the",0.22],["install",0.36],["finishes,",0.7],["the",1.94],["expressive",1.98],["icon",2.34],["appears",2.94],["in",3.46],["the",3.76],["bar",3.86],["on",4.08],["the",4.24],["left.",4.36]],
  p1: [["Step",0],["3",0.36],["is",0.68],["a",0.94],["set",1.04],["of",1.16],["tools",1.36],["that",1.62],["ESB",1.98],["-IDF",2.48],["needs,",2.94],["and",3.8],["they're",3.82],["listed",3.96],["on",4.14],["this",4.38],["page.",4.54]],
  p2: [["If",0],["you're",0.22],["on",0.32],["Windows,",0.46],["you",1.38],["can",1.4],["skip",1.52],["this",1.76],["step",1.98],["because",2.26],["the",2.6],["installer",2.76],["adds",3.2],["anything",3.74],["that's",4.2],["missing.",4.62]],
  p3: [["On",0],["a",0.24],["Mac,",0.32],["first",1.06],["install",1.3],["Homebrew",1.72],["from",2.16],["brew",2.44],[".sh",2.76],["and",3.54],["then",4.32],["run",4.46],["this",4.76],["one",4.96],["command.",5.14]],
  p4: [["on",0],["Ubuntu",0.24],["or",0.64],["Debian.",1.34],["This",2.28],["command",2.44],["installs",2.74],["everything",3.2],["you",3.74],["need.",4.04]],
  p5: [["On",0],["other",0.24],["Linux",0.48],["systems,",0.68],["install",1.7],["the",1.96],["packages",2.16],["that",2.52],["are",2.74],["listed",2.86],["here.",3.02]],
  p6: [["This",0],["machine",0.26],["already",0.48],["has",0.7],["them,",1],["so",1.58],["let's",1.78],["move",2],["on.",2.1]],
  s1a: [["Step",0],["4",0.36],["is",0.78],["the",1.16],["big",1.3],["one.",1.48],["Installing",2.3],["ESB",2.84],["-IDF",3.5],["itself.",3.96]],
  s1b: [["Press",0],["Ctrl",0.32],["Shift",0.64],["P",0.96],["to",1.32],["open",1.78],["the",2.08],["Command",2.2],["Palette.",2.46]],
  s1c: [["Then",0],["run",0.38],["the",0.64],["command",0.8],["ESP",1.32],["-IDF.",2.08],["Open",3.2],["ESP",3.42],["-IDF",3.92],["Installation",4.76],["Manager.",5.08]],
  s2a: [["Because",0],["the",0.32],["folder",0.5],["is",0.78],["still",1.02],["empty,",1.2],["VS",2.32],["Code",2.5],["asks",2.86],["whether",3.32],["it",3.56],["should",3.72],["turn",3.9],["the",4.12],["extension",4.24],["on",4.62],["anyway.",4.96]],
  s2b: [["Click",0],["Activate",0.32],["anyway.",0.84]],
  s3a: [["The",0],["extension",0.24],["takes",0.56],["a",0.96],["moment",1.18],["to",1.36],["start.",1.58],["It",2.48],["opens",2.6],["its",2.96],["own",3.16],["guide.",3.38]],
  s3b: [["Now",0],["that",0.26],["it's",0.38],["running,",0.52],["run",1.38],["the",1.42],["same",1.62],["command",1.88],["again.",2.22]],
  s4a: [["This",0],["time,",0.28],["it",1],["asks",1.22],["where",1.4],["to",1.54],["download",1.7],["the",2.1],["installer",2.32],["from.",2.66]],
  s4b: [["Pick",0],["GitHub,",0.36],["unless",1.38],["you're",1.64],["in",1.84],["China,",1.98],["where",2.86],["the",2.96],["expressive",3.1],["mirror",3.54],["is",3.96],["faster.",4.18]],
  s5a: [["A",0],["moment",0.24],["later,",0.38],["the",1.2],["ESBIDF",1.22],["installation",2.22],["manager",2.74],["opens.",3.42]],
  s5b: [["In",0],["Installer,",0.26],["click",1.16],["Start",1.34],["Installation.",1.7]],
  s6: [["Then",0],["click",0.3],["Start",0.54],["Easy",0.9],["Installation.",1.42]],
  s6b: [["Before",0],["it",0.4],["begins,",0.54],["the",1.54],["installer",1.66],["checks",2.02],["that",2.38],["your",2.58],["system",2.7],["has",3.08],["everything",3.34],["it",3.74],["needs.",3.94]],
  s7: [["Leave",0],["the",0.32],["version",0.5],["set",0.86],["to",1.42],["the",1.66],["newest",1.8],["one,",2.12],["which",3.02],["is",3.12],["version",3.34],["6",3.66],[".1.",4.04],["This",4.94],["course",5.06],["needs",5.3],["version",5.54],["6",5.94],["or",6.36],["later.",6.82]],
  s8: [["ESP",0],["-IDF",0.38],["goes",1],["into",1.28],["a",1.72],["folder",1.92],["inside",2.34],["your",2.96],["home",3.24],["folder,",3.42],["and",4.12],["the",4.36],["install",4.48],["takes",4.8],["10",5.16],["to",5.6],["45",5.76],["minutes.",6.36]],
  s9: [["When",0],["you're",0.26],["ready,",0.4],["click",0.9],["Start",1.1],["Installation.",1.42]],
  s10a: [["The",0],["installer",0.24],["downloads",0.66],["about",1.32],["2",1.58],[".35",1.9],["GB",2.96],["and",3.32],["then",3.92],["unpacks",4.06],["it.",4.8]],
  s10b: [["On",0],["Windows,",0.26],["if",1.06],["it",1.14],["asks",1.22],["to",1.46],["install",1.64],["Git",2.04],["or",2.32],["Python,",2.56],["say",3.54],["yes.",3.76]],
  s11: [["When",0],["you",0.22],["see",0.34],["installation",0.52],["complete,",0.94],["you",2],["can",2.06],["close",2.18],["the",2.42],["installer.",2.62]],
  c1a: [["Step",0],["5",0.36],["is",0.76],["to",1.14],["tell",1.3],["VS",1.5],["Code",1.98],["which",2.42],["ESBI",3.06],["DF",3.7],["to",4.06],["use.",4.3]],
  c1b: [["Open",0],["the",0.32],["Command",0.42],["Palette",0.74],["again,",1.12],["and",1.7],["run",2],["the",2.18],["command,",2.32],["YesBIDF.",3.72],["Select",4.74],["current",4.92],["YesBIDF",5.26],["version.",6.18]],
  c2: [["Pick",0],["version",0.3],["6",0.62],[".1",1.18],["from",1.82],["the",2.14],["list.",2.24]],
  c3: [["The",0],["status",0.22],["bar",0.48],["now",0.74],["shows",1],["ESP",1.46],["-IDF",1.78],["version",2.38],["6",2.56],[".1,",3],["so",3.8],["VS",4.06],["Code",4.34],["knows",4.7],["which",5.26],["version",5.58],["to",5.84],["use.",6.02]],
  k1a: [["Step",0],["6",0.34],["is",0.66],["to",0.96],["check",1.08],["that",1.32],["everything",1.56],["works.",1.84]],
  k1b: [["Click",0],["the",0.28],["terminal",0.44],["icon",0.74],["in",1.26],["the",1.5],["status",1.62],["bar,",1.84],["which",2.52],["opens",2.68],["the",3.02],["ESBI",3.2],["DF",3.72],["terminal.",4.1]],
  k2: [["In",0],["the",0.22],["terminal,",0.32],["type",0.94],["idf",1.3],[".py",2.52],["–version",3.28]],
  k3: [["It",0],["prints",0.24],["ESP",0.5],["-IDF",0.84],["version",1.46],["6",1.76],[".1,",2.44],["which",3.32],["means",3.5],["ESP",3.74],["-IDF",4.12],["is",4.76],["installed",4.88],["and",5.36],["working.",5.88]],
  l1: [["Step",0],["seven",0.36],["is",0.72],["one",1.02],["last",1.4],["thing",1.68],["to",1.94],["do",2.1],["before",2.4],["you",2.76],["plug",2.92],["in",3.12],["a",3.26],["board.",3.32]],
  l2: [["On",0],["Linux,",0.26],["give",0.92],["yourself",1.12],["access",1.38],["to",1.9],["the",2.16],["USB",2.3],["serial",2.7],["port",3.08],["with",3.42],["this",3.6],["command,",3.78],["and",4.56],["then",4.76],["log",4.88],["out",5.12],["and",5.42],["back",5.6],["in.",5.82]],
  l3: [["On",0],["Windows",0.26],["and",0.62],["on",1.06],["a",1.16],["Mac,",1.26],["the",2.08],["USB",2.12],["driver",2.52],["usually",3],["installs",3.34],["itself,",3.84],["but",4.52],["if",4.6],["your",4.7],["board",4.8],["doesn't",5.04],["show",5.4],["up,",5.6],["get",6.16],["the",6.28],["CP210X",6.44],["driver",7.98],["or",8.36],["the",9.02],["FTDi",9.16],["driver",10.14],["from",10.44],["these",10.74],["pages.",10.9]],
  z1: [["That's",0],["it.",0.36],["You",0.88],["now",0.98],["have",1.22],["VS",1.54],["Code,",2.04],["the",3],["ESP",3.04],["-IDF",3.3],["extension,",3.84],["and",4.84],["ESP",4.96],["-IDF",5.38],["version",5.9],["6",6.02],[".1",6.46],["ready",7.02],["to",7.54],["go.",7.7],["Next,",8.5],["you'll",9.1],["create",9.3],["an",9.5],["empty",9.72],["project",10.1],["that",10.58],["prints",10.86],["Hello",11.18],["World.",11.5]],
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
export const TAKE_SRC = 'install-esp-idf/take.mp4';
export function ev(id: string): Ev {
  const e = EVENTS.find((x) => x.id === id);
  if (!e) throw new Error(`take.json has no event "${id}" (re-record: npm run install-esp-idf:take)`);
  return e;
}
export const tk = (id: string) => (id === 'BEGIN' ? 0 : id === 'END' ? take.duration - 0.05 : ev(id).t);
export const box = (id: string) => ev(id).box as Box;

// The narration names the version the take installed; fail loudly if a new take differs.
export const IDF = 'v6.1';
if (!ev('version').text?.includes(`ESP-IDF ${IDF}`)) throw new Error(`take installed ${ev('version').text}, VO says ${IDF}`);

// ── beats ──────────────────────────────────────────────────────────────────

/** `lead`: scene-relative time the stretch starts playing (holds its first frame until then). */
type Clip = { from: string; to: string; maxRate?: number; lead?: number };
/** Lead that lands take event `click` (played at 1×) on scene time `word`. */
const land = (word: number, from: string, click: string) => +(word - (tk(click) - tk(from))).toFixed(2);
const BEATS: { id: string; clip: Clip }[] = [
  { id: 'intro', clip: { from: 'BEGIN', to: 'vsc-page' } },
  { id: 'vsc', clip: { from: 'vsc-page', to: 'card-linux' } },
  { id: 'open', clip: { from: 'vscode-window', to: 'ext-open' } },
  { id: 'ext1', clip: { from: 'ext-open', to: 'ext-typing', lead: w('e1', 'press', 0, -0.1) } },
  { id: 'ext2', clip: { from: 'ext-typing', to: 'ext-row', lead: w('e2', 'search', 0, -0.1) } },
  { id: 'ext3', clip: { from: 'ext-row', to: 'ext-install', lead: land(w('e3', 'pick'), 'ext-row', 'row-click') } },
  { id: 'ext4', clip: { from: 'ext-install', to: 'trust', lead: land(w('e4', 'install'), 'ext-install', 'install-click') } },
  { id: 'ext5', clip: { from: 'trust', to: 'trust-click', lead: land(w('e5b', 'install'), 'trust', 'trust-click') } },
  { id: 'ext5b', clip: { from: 'trust-click', to: 'ext-done', maxRate: 4 } },
  { id: 'ext6', clip: { from: 'ext-done', to: 'to-browser' } },
  { id: 'pre1', clip: { from: 'to-browser', to: 'pre-scroll-win' } },
  { id: 'pre2', clip: { from: 'pre-scroll-win', to: 'pre-scroll-mac', lead: w('p2', 'windows', 0, -0.3) } },
  { id: 'pre3', clip: { from: 'pre-scroll-mac', to: 'pre-scroll-linux', lead: w('p3', 'mac', 0, -0.3) } },
  { id: 'pre4', clip: { from: 'pre-scroll-linux', to: 'to-vscode-2', lead: w('p4', 'ubuntu', 0, -0.3) } },
  { id: 'eim1', clip: { from: 'vscode-ready-2', to: 'palette' } },
  { id: 'eim2', clip: { from: 'palette', to: 'palette-typing', lead: w('s1b', 'ctrl', 0, -0.1) } },
  { id: 'eim3', clip: { from: 'palette-typing', to: 'palette-row', lead: w('s1c', 'run', 0, -0.1) } },
  { id: 'eim4', clip: { from: 'palette-row', to: 'activate' } },
  { id: 'eim5', clip: { from: 'activate', to: 'activate-click', lead: land(w('s2b', 'activate'), 'activate', 'activate-click') } },
  { id: 'eim6', clip: { from: 'activate-click', to: 'palette2', maxRate: 12 } },
  { id: 'eim6b', clip: { from: 'palette2', to: 'palette2-row', lead: w('s3b', 'run', 1, -0.1) } },
  { id: 'eim7', clip: { from: 'palette2-row', to: 'mirror' } },
  { id: 'eim7b', clip: { from: 'mirror', to: 'mirror-click', lead: land(w('s4b', 'github'), 'mirror', 'mirror-click') } },
  { id: 'eim8', clip: { from: 'mirror-click', to: 'eim-open', maxRate: 8 } },
  { id: 'eim9', clip: { from: 'eim-open', to: 'eim-easy', lead: land(w('s5b', 'start'), 'eim-open', 'eim-start-click') } },
  { id: 'eim10', clip: { from: 'eim-easy', to: 'eim-easy-click', lead: land(w('s6', 'easy'), 'eim-easy', 'eim-easy-click') } },
  { id: 'eim10b', clip: { from: 'eim-easy-click', to: 'eim-ready', maxRate: 2 } },
  { id: 'eim11', clip: { from: 'eim-ready', to: 'eim-installing', lead: land(w('s9', 'start'), 'eim-ready', 'eim-go-click') } },
  { id: 'eim12', clip: { from: 'eim-installing', to: 'eim-done', maxRate: 120 } },
  { id: 'eim13', clip: { from: 'eim-done', to: 'eim-close' } },
  { id: 'sel1', clip: { from: 'to-vscode-3', to: 'sel-palette-row', lead: land(w('c1b', 'open'), 'to-vscode-3', 'sel-palette') } },
  { id: 'sel2', clip: { from: 'sel-palette-row', to: 'sel-click', lead: land(w('c2', 'pick'), 'sel-palette-row', 'sel-click') } },
  { id: 'sel2b', clip: { from: 'sel-click', to: 'sel-done', maxRate: 2 } },
  { id: 'sel3', clip: { from: 'sel-done', to: 'term-icon' } },
  { id: 'chk1', clip: { from: 'term-icon', to: 'term-click', lead: land(w('k1b', 'icon'), 'term-icon', 'term-click') } },
  { id: 'chk1b', clip: { from: 'term-click', to: 'term-open', maxRate: 3 } },
  { id: 'chk2', clip: { from: 'cmd-start', to: 'cmd-enter', lead: w('k2', 'type', 0, -0.1) } },
  { id: 'chk2b', clip: { from: 'cmd-enter', to: 'version', maxRate: 4 } },
  { id: 'chk3', clip: { from: 'version', to: 'end' } },
  { id: 'serial', clip: { from: 'end', to: 'END' } },
  { id: 'outro', clip: { from: 'END', to: 'END' } },
];
export const TAIL: Record<string, number> = {
  intro: 0.8, vsc: 0.8, open: 0.6, ext1: 0.4, ext2: 0.3, ext3: 0.5, ext4: 0.4, ext5: 0.5, ext6: 0.8,
  pre1: 0.5, pre2: 0.5, pre3: 6.0, pre4: 0.8, eim1: 0.5, eim2: 0.3, eim3: 0.3, eim4: 0.5, eim5: 0.5,
  eim6: 0.4, eim6b: 0.3, eim7: 0.3, eim7b: 0.5, eim8: 0.4, eim9: 0.4, eim10: 0.4, eim10b: 0.3, eim11: 0.4,
  eim12: 0.6, eim13: 0.8, sel1: 0.3, sel2: 0.5, sel3: 0.8, chk1: 0.4, chk2: 0.3, chk3: 1.0, serial: 1.2, outro: 3.0,
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
export const INSTALL_FRAMES = Math.round(SECONDS * FPS);

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
  L('i1', 'intro', 'Before you can program an ESP32, you need three things on your computer: VS Code, the ESP-IDF extension, and ESP-IDF itself.', undefined, 0.8),
  L('i2', 'intro', "I'm using Linux in this video, and whenever Windows or a Mac does something differently, I'll tell you."),
  L('i3', 'intro', "There are seven steps, and we'll go through them one at a time."),

  L('v1', 'vsc', 'Step one is VS Code itself. You can download it from code.visualstudio.com/download.', 'Step one is VS Code itself. You can download it from code dot visual studio dot com, slash download.', 0.4),
  L('v2', 'vsc', "If you're on Windows, run the installer that you downloaded.", undefined, 0.6),
  L('v3', 'vsc', 'On a Mac, open the download, and drag VS Code into your Applications folder.'),
  L('v4', 'vsc', 'On Linux, choose the .deb package for Ubuntu or Debian, or the .rpm package for Fedora.', 'On Linux, choose the dot D E B package for Ubuntu or Debian, or the dot R P M package for Fedora.'),
  L('v5', 'vsc', "Don't use the Snap version, though, because it can't open the installer window that you'll need later on."),
  L('v6', 'open', "Once it's installed, open VS Code, and then open an empty folder for your projects. Mine is called esp32.", "Once it's installed, open VS Code, and then open an empty folder for your projects. Mine is called E S P 32.", 0.5),

  L('e1', 'ext1', 'Step two is the ESP-IDF extension. To find it, press Ctrl+Shift+X, which opens the Extensions view.', 'Step two is the ESP-IDF extension. To find it, press Control Shift X, which opens the Extensions view.', 0.3),
  L('e2', 'ext2', 'Then search for ESP-IDF.', undefined, 0.3),
  L('e3', 'ext3', "Pick the extension that's published by Espressif Systems.", undefined, 0.3),
  L('e4', 'ext4', 'Then click Install.', undefined, 0.3),
  L('e5a', 'ext5', 'Because this is your first extension from Espressif, VS Code asks whether you trust the publisher.', undefined, 0.3),
  L('e5b', 'ext5', 'Click Trust Publisher and Install.'),
  L('e6', 'ext6', 'When the install finishes, the Espressif icon appears in the bar on the left.', undefined, 0.3),

  L('p1', 'pre1', "Step three is a set of tools that ESP-IDF needs, and they're listed on this page.", undefined, 0.4),
  L('p2', 'pre2', "If you're on Windows, you can skip this step, because the installer adds anything that's missing.", undefined, 0.3),
  L('p3', 'pre3', 'On a Mac, first install Homebrew from brew.sh, and then run this one command.', 'On a Mac, first install Homebrew from brew dot S H, and then run this one command.', 0.3),
  L('p4', 'pre4', 'On Ubuntu or Debian, this command installs everything you need.', undefined, 0.3),
  L('p5', 'pre4', 'On other Linux systems, install the packages that are listed here.', undefined, 4.0), // the apt card stays up ≥ 6 s (time to pause)
  L('p6', 'pre4', "This machine already has them, so let's move on."),

  L('s1a', 'eim1', 'Step four is the big one: installing ESP-IDF itself.', undefined, 0.4),
  L('s1b', 'eim2', 'Press Ctrl+Shift+P to open the command palette.', 'Press Control Shift P to open the command palette.', 0.3),
  L('s1c', 'eim3', 'Then run the command ESP-IDF: Open ESP-IDF Installation Manager.', 'Then run the command: ESP-IDF, open ESP-IDF Installation Manager.', 0.3),
  L('s2a', 'eim4', 'Because the folder is still empty, VS Code asks whether it should turn the extension on anyway.', undefined, 0.3),
  L('s2b', 'eim5', 'Click Activate Anyway.', undefined, 0.3),
  L('s3a', 'eim6', 'The extension takes a moment to start, and it opens its own guide.', undefined, 0.3),
  L('s3b', 'eim6b', "Now that it's running, run the same command again.", undefined, 0.3),
  L('s4a', 'eim7', 'This time, it asks where to download the installer from.', undefined, 0.3),
  L('s4b', 'eim7b', "Pick GitHub, unless you're in China, where the Espressif mirror is faster.", undefined, 0.3),
  L('s5a', 'eim8', 'A moment later, the ESP-IDF Installation Manager opens.', undefined, 0.3),
  L('s5b', 'eim9', 'In the installer, click Start Installation.', undefined, 0.3),
  L('s6', 'eim10', 'Then click Start Easy Installation.', undefined, 0.3),
  L('s6b', 'eim10b', 'Before it begins, the installer checks that your system has everything it needs.', undefined, 0.3),
  L('s7', 'eim11', 'Leave the version set to the newest one, which is v6.1. This course needs version 6 or later.', 'Leave the version set to the newest one, which is version six point one. This course needs version six or later.', 0.3),
  L('s8', 'eim11', 'ESP-IDF goes into a folder inside your home folder, and the install takes 10 to 45 minutes.', 'ESP-IDF goes into a folder inside your home folder, and the install takes ten to forty-five minutes.'),
  L('s9', 'eim11', "When you're ready, click Start Installation."),
  L('s10a', 'eim12', 'The installer downloads about 2.35 gigabytes, and then unpacks it.', 'The installer downloads about two point three five gigabytes, and then unpacks it.', 0.3),
  L('s10b', 'eim12', 'On Windows, if it asks to install Git or Python, say yes.'),
  L('s11', 'eim13', 'When you see Installation Complete, you can close the installer.', undefined, 0.4),

  L('c1a', 'sel1', 'Step five is to tell VS Code which ESP-IDF to use.', undefined, 0.4),
  L('c1b', 'sel1', 'Open the command palette again, and run the command ESP-IDF: Select Current ESP-IDF Version.', 'Open the command palette again, and run the command: ESP-IDF, select current ESP-IDF version.'),
  L('c2', 'sel2', 'Pick version 6.1 from the list.', 'Pick version six point one from the list.', 0.3),
  L('c3', 'sel3', 'The status bar now shows ESP-IDF v6.1, so VS Code knows which version to use.', 'The status bar now shows ESP-IDF version six point one, so VS Code knows which version to use.', 0.3),

  L('k1a', 'chk1', 'Step six is to check that everything works.', undefined, 0.4),
  L('k1b', 'chk1', 'Click the terminal icon in the status bar, which opens the ESP-IDF terminal.'),
  L('k2', 'chk2', 'In the terminal, type idf.py --version.', 'In the terminal, type: I D F dot P Y, dash dash version.', 0.3),
  L('k3', 'chk3', 'It prints ESP-IDF v6.1, which means ESP-IDF is installed and working.', 'It prints ESP-IDF version six point one, which means ESP-IDF is installed and working.', 0.3),

  L('l1', 'serial', 'Step seven is one last thing to do before you plug in a board.', undefined, 0.5),
  L('l2', 'serial', 'On Linux, give yourself access to the USB serial port with this command, and then log out and back in.', undefined, 0.5),
  L('l3', 'serial', "On Windows and on a Mac, the USB driver usually installs itself, but if your board doesn't show up, get the CP210x or FTDI driver from these pages.", "On Windows and on a Mac, the USB driver usually installs itself, but if your board doesn't show up, get the C P 2 1 0 x driver, or the F T D I driver, from these pages.", 4.0), // the usermod card stays up ≥ 6 s

  L('z1', 'outro', "That's it. You now have VS Code, the ESP-IDF extension, and ESP-IDF v6.1, ready to go. Next, you'll create an empty project that prints Hello World.", "That's it. You now have VS Code, the ESP-IDF extension, and ESP-IDF version six point one, ready to go. Next, you'll create an empty project that prints Hello World.", 0.5),
];

// ── cues (absolute seconds) ────────────────────────────────────────────────

const A = (scene: SceneId, t: number) => +(sceneStart(scene) + t).toFixed(2);

export const CUE = {
  three: A('intro', w('i1', 'three')),
  threeOut: A('intro', end('i1') + 0.8),
  url: A('vsc', w('v1', 'download')),
  win: A('vsc', w('v2', 'windows')),
  mac: A('vsc', w('v3', 'mac')),
  linux: A('vsc', w('v4', 'linux')),
  snap: A('vsc', w('v5', 'snap')),
  folder: A('open', w('v6', 'mine')),
  extView: A('ext1', w('e1', 'press')),
  extSearch: A('ext2', w('e2', 'search')),
  extRow: A('ext3', w('e3', 'systems')),
  extInstall: A('ext4', w('e4', 'install')),
  trust: A('ext5', w('e5a', 'trust')),
  trustBtn: A('ext5', w('e5b', 'trust')),
  icon: A('ext6', w('e6', 'icon')),
  extDone: whenTake('ext-done'),
  preUrl: A('pre1', w('p1', 'listed')),
  preWin: whenTake('pre-win'),
  preMac: whenTake('pre-mac'),
  brew: A('pre3', w('p3', 'command', 0, -0.4)),
  brewOut: A('pre3', sceneDur('pre3') - 0.2), // pre3's tail keeps it up ≥ 6 s
  preLinux: whenTake('pre-linux'),
  apt: A('pre4', w('p4', 'command', 0, -0.6)),
  aptOut: A('pre4', at('p5') - 0.3),
  linuxList: A('pre4', w('p5', 'packages')),
  vscode2: whenTake('palette'),
  palette: A('eim2', w('s1b', 'ctrl')),
  paletteRow: A('eim3', w('s1c', 'open')),
  activate: whenTake('activate'),
  activateBtn: A('eim5', w('s2b', 'activate')),
  starting: A('eim6', 0.3),
  palette2: A('eim6b', w('s3b', 'run', 1)),
  mirror: whenTake('mirror'),
  mirrorRow: A('eim7b', w('s4b', 'github')),
  eimOpen: whenTake('eim-open'),
  eimStart: A('eim9', w('s5b', 'start')),
  eimEasy: whenTake('eim-easy'),
  eimEasyBtn: A('eim10', w('s6', 'easy')),
  eimReady: whenTake('eim-ready'),
  eimVersion: A('eim11', w('s7', 'newest')),
  eimLocation: A('eim11', w('s8', 'home')),
  eimTime: A('eim11', w('s8', 'takes')),
  eimGo: A('eim11', w('s9', 'start')),
  installing: whenTake('eim-installing'),
  eimDone: whenTake('eim-done'),
  vscode3: whenTake('to-vscode-3'),
  selPalette: A('sel1', w('c1b', 'run')),
  selPick: whenTake('sel-pick'),
  selRow: A('sel2', w('c2', 'pick')),
  selDone: whenTake('sel-done'),
  status: A('sel3', w('c3', 'status')),
  termIcon: A('chk1', w('k1b', 'terminal')),
  termOpen: whenTake('term-open'),
  typed: A('chk2', w('k2', 'type')),
  version: whenTake('version'),
  serial: A('serial', w('l2', 'command', 0, -0.4)),
  serialOut: A('serial', at('l3') - 0.3),
  drivers: A('serial', w('l3', 'board')),
  outro: A('outro', 0.2),
};

/** Step pills: [first beat, label]. Each lasts until the next one starts. */
const STEP_BEATS: [SceneId, string][] = [
  ['vsc', 'Step 1 of 7 · VS Code'],
  ['ext1', 'Step 2 of 7 · The ESP-IDF extension'],
  ['pre1', 'Step 3 of 7 · Prerequisites (Linux, Mac)'],
  ['eim1', 'Step 4 of 7 · Install ESP-IDF'],
  ['sel1', 'Step 5 of 7 · Select the version'],
  ['chk1', 'Step 6 of 7 · Check it works'],
  ['serial', 'Step 7 of 7 · Before you plug in a board'],
];
export const CHAPTERS = STEP_BEATS.map(([b, text], i) => ({
  from: sceneStart(b),
  to: i + 1 < STEP_BEATS.length ? sceneStart(STEP_BEATS[i + 1][0]) : sceneStart('outro'),
  text,
}));

/** SFX, cued from the same values as the visuals they belong to. */
export const SOUND: { t: number; kind: 'tick' | 'thump' | 'blip'; f?: number; amp?: number }[] = [
  ...[CUE.url, CUE.win, CUE.mac, CUE.linux, CUE.extRow, CUE.icon, CUE.preWin, CUE.preMac, CUE.linuxList,
    CUE.activateBtn, CUE.mirrorRow, CUE.eimStart, CUE.eimEasyBtn, CUE.eimVersion, CUE.eimGo, CUE.selRow]
    .map((t) => ({ t, kind: 'tick' as const, f: 3100, amp: 0.05 })),
  ...[CUE.three, CUE.brew, CUE.apt, CUE.serial].map((t) => ({ t, kind: 'tick' as const, f: 2000, amp: 0.09 })),
  { t: CUE.eimDone, kind: 'blip', amp: 0.07 },
  { t: CUE.status, kind: 'thump', amp: 0.2 },
  { t: CUE.version, kind: 'blip', amp: 0.07 },
];
