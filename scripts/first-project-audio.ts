/**
 * first-project soundtrack, built from src/scenes/first-project/timeline.ts.
 *
 *   node scripts/first-project-audio.ts
 *
 * Layers: VO · SFX (timeline SOUND, cued like the visuals) · MUSIC (the house
 * pad, ducked under VO, resolving to A major under the outro line).
 * Output: public/first-project/mix.wav (−16 LUFS, −1.5 dBTP) + stems in
 * out/0-setup/first-project-stems/.
 */
import { join } from 'node:path';
import { biquad, level, master, pad, ROOT, sfx, talkingEnvelope, track, voiceover } from './lib/audio.ts';
import * as tl from '../src/scenes/first-project/timeline.ts';

const slug = 'first-project';
const PUBLIC = join(ROOT, 'public', slug);
const STEMS = join(ROOT, 'out', tl.SECTION, `${slug}-stems`);
const T = track(tl.SECONDS);
const N = T.N;
const abs = (scene: tl.SceneId, t: number) => tl.sceneStart(scene) + t;

// ── 1. VO ──────────────────────────────────────────────────────────────────

const { vo, speech } = voiceover(
  tl.VO.map((l) => ({ ...l, t0: abs(l.scene, l.at), sceneEnd: abs(l.scene, tl.sceneDur(l.scene)) })),
  tl.VOICE,
  T,
);
const talking = talkingEnvelope(speech, T);

// ── 2. SFX ─────────────────────────────────────────────────────────────────

console.log('── sfx ──');
const S = sfx(T);
for (const e of tl.SOUND) {
  if (e.kind === 'tick') S.tick(e.t, e.f ?? 2350, e.amp ?? 0.12);
  else if (e.kind === 'thump') S.thump(e.t, e.amp ?? 0.22);
  else if (e.kind === 'blip') S.blip(e.t, 660, 990, e.amp ?? 0.06);
}

// ── 3. music ───────────────────────────────────────────────────────────────

console.log('── music ──');
const music = new Float32Array(N);
{
  const resolve = abs('outro', tl.at('z1'));
  pad(music, [130.81, 164.81, 220.0], 0, resolve - 0.15, 1, 3, 0.08);
  pad(music, [110.0, 164.81, 220.0, 277.18], resolve, tl.SECONDS, 1.15, 0.35, 2.5);
  biquad(music, 'lp', 1400, 0.6);
  level(music, -30, 3, 6);
  for (let i = 0; i < N; i++) music[i] *= 1 - 0.6 * talking[i];
}

// ── 4. mix ─────────────────────────────────────────────────────────────────

const out = join(PUBLIC, 'mix.wav');
master({ vo, sfx: S.buf, music }, T, { stems: STEMS, out });
console.log(`\n✓ ${out}  (${tl.SECONDS.toFixed(2)}s, beats: ${tl.SCENES.map((s) => `${s.id} ${s.dur}`).join(' · ')})`);
