/**
 * VO plan: time every narration line from the voice itself, and write the
 * result into the video's timeline.
 *
 *   node scripts/vo-plan.ts <video-slug>
 *
 * For each VO line (in timeline order) it makes the TTS clip (cached, same
 * cache as the audio build), gets word timings from faster-whisper, then lays
 * the lines out scene by scene:
 *
 *   first line of a scene  at LEAD (0.5 s), or its `pause`
 *   every later line       at previous end + GAP (0.6 s), or + its `pause`
 *   scene length           last line's end + TAIL[scene] (default 1.5 s)
 *
 * Lines with `fixed: true` keep their hand-set `at` (and their scene keeps its
 * hand-set duration if every line in it is fixed). The result goes between
 * the `// ── generated: VO plan` markers in timeline.ts as three tables:
 * VO_AT (line → start), VO_WORDS (line → [word, offset][]), SCENE_DUR.
 * Cues in the timeline read them through `w(id, word)`, so a wording change
 * is one re-run of this script — no hand re-timing.
 *
 * The sheet is also the elocution check: each line shows the silence before it
 * (`+0.60`) and every pause the voice makes inside it (`‖0.52`, measured from
 * the audio with ffmpeg silencedetect, ≥ 0.15 s at −40 dB) where it falls
 * between the words. Shape them with `pause` and with "..." / "." / "," in
 * `say` (SCRIPT.md "Pauses and emphasis").
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ensureClip, ROOT, run } from './lib/audio.ts';

const [slug] = process.argv.slice(2);
if (!slug) {
  console.error('usage: node scripts/vo-plan.ts <video-slug>');
  process.exit(2);
}
type Line = { id: string; scene: string; at: number; text: string; say?: string; pause?: number; fixed?: boolean };
const file = join(ROOT, 'src/scenes', slug, 'timeline.ts');
const tl = await import(file);
const VO: Line[] = tl.VO;
const VOICE: string = tl.VOICE;
const ORDER: string[] = tl.SCENES.map((s: { id: string }) => s.id);
const TAIL: Record<string, number> = tl.TAIL ?? {};
const LEAD = 0.5;
const GAP = 0.6;

// 1. clips + word timings
const clips = VO.map((l) => ensureClip(VOICE, l.id, l.say ?? l.text));
const wordsPath = (mp3: string) => mp3.replace(/\.mp3$/, '.words.json');
const missing = clips.filter((c) => !existsSync(wordsPath(c)));
if (missing.length) {
  console.error(`transcribing ${missing.length} clip(s) with faster-whisper…`);
  const py = join(ROOT, '.cache/vo/_words.py');
  writeFileSync(
    py,
    [
      'import json, sys',
      'from faster_whisper import WhisperModel',
      'm = WhisperModel("small.en", device="cpu", compute_type="int8")',
      'for p in sys.argv[1:]:',
      '    segs, _ = m.transcribe(p, word_timestamps=True)',
      '    ws = [[w.word.strip(), round(w.start, 2), round(w.end, 2)] for s in segs for w in s.words]',
      '    json.dump(ws, open(p[:-4] + ".words.json", "w"))',
    ].join('\n'),
  );
  run('uv', ['run', '--quiet', '--with', 'faster-whisper', 'python', py, ...missing]);
}
const words = new Map<string, [string, number, number][]>();
VO.forEach((l, i) => words.set(l.id, JSON.parse(readFileSync(wordsPath(clips[i]), 'utf8'))));
const len = (id: string) => {
  const ws = words.get(id)!;
  return ws.length ? ws[ws.length - 1][2] : 0;
};

// 2. lay out each scene
const AT: Record<string, number> = {};
const DUR: Record<string, number> = {};
for (const scene of ORDER) {
  const lines = VO.filter((l) => l.scene === scene);
  if (!lines.length) continue;
  let end = 0;
  lines.forEach((l, i) => {
    const at = l.fixed ? l.at : i === 0 ? (l.pause ?? LEAD) : end + (l.pause ?? GAP);
    AT[l.id] = +at.toFixed(2);
    end = at + len(l.id);
  });
  if (!lines.every((l) => l.fixed)) DUR[scene] = +(end + (TAIL[scene] ?? 1.5)).toFixed(2);
}

// 3. write the generated block
const r2 = (x: number) => Math.round(x * 100) / 100;
const block = [
  '// ── generated: VO plan (node scripts/vo-plan.ts ' + slug + ') — do not edit by hand ──',
  `export const VO_AT: Record<string, number> = ${JSON.stringify(AT)};`,
  `export const SCENE_DUR: Record<string, number> = ${JSON.stringify(DUR)};`,
  'export const VO_WORDS: Record<string, [string, number][]> = {',
  ...VO.map((l) => `  ${l.id}: ${JSON.stringify(words.get(l.id)!.map(([w, s]) => [w, r2(s)]))},`),
  '};',
  '// ── end generated ──',
].join('\n');
const src = readFileSync(file, 'utf8');
const re = /\/\/ ── generated: VO plan[\s\S]*?\/\/ ── end generated ──/;
if (!re.test(src)) throw new Error(`no generated block markers in ${file}`);
writeFileSync(file, src.replace(re, block));

// 4. the sheet (with the pauses inside each clip)
/** silences inside a clip (not its lead-in / tail): [start, end] seconds */
const innerPauses = (mp3: string): [number, number][] => {
  const err = run('ffmpeg', ['-hide_banner', '-i', mp3, '-af', 'silencedetect=noise=-40dB:d=0.15', '-f', 'null', '-']).stderr.toString();
  const st = [...err.matchAll(/silence_start: ([\d.]+)/g)].map((m) => +m[1]);
  const en = [...err.matchAll(/silence_end: ([\d.]+)/g)].map((m) => +m[1]);
  return st.map((s, i) => [s, en[i] ?? Infinity] as [number, number]).filter(([s, e]) => s > 0.05 && e !== Infinity);
};
for (const scene of ORDER) {
  const lines = VO.filter((l) => l.scene === scene);
  if (!lines.length) continue;
  console.log(`── ${scene}  ${DUR[scene] !== undefined ? DUR[scene].toFixed(2) + ' s' : '(fixed)'}`);
  let prevEnd = 0;
  for (const [i, l] of lines.entries()) {
    const ws = words.get(l.id)!;
    const pauses = innerPauses(clips[VO.indexOf(l)]);
    const parts: string[] = [];
    let ps = -1;
    for (const [w, s] of ws) {
      const p = pauses.find(([, b]) => b > ps && b <= s + 0.08);
      ps = s;
      if (p && parts.length) {
        parts.push(`‖${(p[1] - p[0]).toFixed(2)}`);
        pauses.splice(pauses.indexOf(p), 1);
      }
      parts.push(`${w}@${s.toFixed(2)}`);
    }
    const gap = i === 0 ? AT[l.id] : AT[l.id] - prevEnd;
    prevEnd = AT[l.id] + len(l.id);
    console.log(`${l.id.padEnd(5)} ${AT[l.id].toFixed(2).padStart(6)} → ${prevEnd.toFixed(2).padStart(6)}  +${gap.toFixed(2)}  ${parts.join(' ')}`);
  }
}
