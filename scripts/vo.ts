/**
 * VO timing sheet: generate every line's TTS clip (cached, same cache as the
 * audio build) and print each word's offset, so cues can be written as
 * `vo.at + word offset`.
 *
 *   node scripts/vo.ts <video-slug> [scene]
 *     e.g. node scripts/vo.ts pwm fade
 *
 * Reads src/scenes/<slug>/timeline.ts (needs VO, VOICE, sceneStart, sceneDur).
 * Word timings come from faster-whisper (via `uv`), cached next to each clip
 * as .words.json — first run downloads the model, later runs are instant.
 *
 * Output per line:
 *   id scene  at → end (dur)  next-line gap  FITS / OVERRUNS
 *     word@offset word@offset …        (offsets from the clip start = from `at`)
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ensureClip, ROOT, run } from './lib/audio.ts';

const [slug, onlyScene] = process.argv.slice(2);
if (!slug) {
  console.error('usage: node scripts/vo.ts <video-slug> [scene]');
  process.exit(2);
}
type Line = { id: string; scene: string; at: number; text: string; say?: string };
const tl = await import(join(ROOT, 'src/scenes', slug, 'timeline.ts'));
const VO: Line[] = tl.VO;
const VOICE: string = tl.VOICE;

const placed = VO.map((l) => ({ ...l, t0: tl.sceneStart(l.scene) + l.at, end: tl.sceneStart(l.scene) + tl.sceneDur(l.scene) })).sort(
  (a, b) => a.t0 - b.t0,
);

// 1. clips
const clips = placed.map((l) => ensureClip(VOICE, l.id, l.say ?? l.text));

// 2. word timings for any clip that doesn't have them yet
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

// 3. the sheet
placed.forEach((l, i) => {
  if (onlyScene && l.scene !== onlyScene) return;
  const words: [string, number, number][] = JSON.parse(readFileSync(wordsPath(clips[i]), 'utf8'));
  const dur = words.length ? words[words.length - 1][2] : 0;
  const next = placed[i + 1];
  const limit = Math.min(next?.t0 ?? Infinity, l.end) - 0.1;
  const fits = l.t0 + dur <= limit;
  const gap = next ? (next.t0 - (l.t0 + dur)).toFixed(2) : '—';
  console.log(
    `${l.id.padEnd(4)} ${l.scene.padEnd(8)} at ${l.at.toFixed(2).padStart(6)} → ${(l.at + dur).toFixed(2).padStart(6)} ` +
      `(${dur.toFixed(2)}s)  gap→next ${gap}  ${fits ? 'FITS' : 'OVERRUNS'}`,
  );
  console.log(`     ${words.map(([w, s]) => `${w}@${s.toFixed(2)}`).join(' ')}`);
});
