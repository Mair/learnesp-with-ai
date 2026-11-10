/**
 * Build the FreeRTOS priority inversion video's soundtrack from the same timeline as the picture.
 *
 *   npm run freertos-priority-inversion:audio
 *
 * Layers (everything except the VO is synthesised, scripts/lib/audio.ts):
 *   VO      edge-tts, one clip per line, fit-checked
 *   SFX     the timeline's SOUND list (ticks for things appearing, clacks for the lock
 *           changing hands, a buzz for a wrong result, blips for a right one, thumps for names)
 *   MUSIC   the house pad, ducked under VO, cut before the payoff, resolving to A major
 *
 * No sustained tones: nothing here is about pitch (SOUND.md).
 * Output: public/freertos-priority-inversion/mix.wav (−16 LUFS, −1.5 dBTP) + stems in
 * out/2-freertos/freertos-priority-inversion-stems/.
 */
import { join } from 'node:path';
import { biquad, level, master, pad, ROOT, sfx, talkingEnvelope, track, voiceover } from './lib/audio.ts';
import * as tl from '../src/scenes/freertos-priority-inversion/timeline.ts';

const slug = 'freertos-priority-inversion';
const PUBLIC = join(ROOT, 'public', slug);
const STEMS = join(ROOT, 'out', tl.SECTION, `${slug}-stems`);
const T = track(tl.SECONDS);
const N = T.N;
const abs = (scene: tl.SceneId, t: number) => tl.sceneStart(scene) + t;

const { vo, speech } = voiceover(
  tl.VO.map((l) => ({ ...l, t0: abs(l.scene, l.at), sceneEnd: abs(l.scene, tl.sceneDur(l.scene)) })),
  tl.VOICE,
  T,
);
const talking = talkingEnvelope(speech, T);

console.log('── sfx ──');
const S = sfx(T);
for (const e of tl.SOUND) {
  if (e.kind === 'tick') S.tick(e.t, e.f ?? 2350, e.amp ?? 0.08);
  else if (e.kind === 'thump') S.thump(e.t, e.amp ?? 0.2);
  else if (e.kind === 'clack') S.clack(e.t, e.amp ?? 0.1);
  else if (e.kind === 'buzz') S.buzz(e.t, e.amp ?? 0.08);
  else if (e.kind === 'blip') S.blip(e.t, 660, 990, e.amp ?? 0.06);
}
tl.PAYOFF.recap.forEach((r, i) => S.tick(abs('payoff', r.at), 1600 + 200 * i, 0.08));

console.log('── music ──');
const music = new Float32Array(N);
const MUSIC_CUT = abs('payoff', 0) - 0.15;
{
  pad(music, [130.81, 164.81, 220.0], 0, MUSIC_CUT, 1, 3, 0.08);
  pad(music, [110.0, 164.81, 220.0, 277.18], abs('payoff', tl.PAYOFF.word - 0.3), tl.SECONDS, 1.15, 0.35, 2.5);
  biquad(music, 'lp', 1400, 0.6);
  level(music, -30, 3, 6);
  for (let i = 0; i < N; i++) music[i] *= 1 - 0.6 * talking[i];
}

const out = join(PUBLIC, 'mix.wav');
master({ vo, sfx: S.buf, music }, T, { stems: STEMS, out });
console.log(`\n✓ ${out}  (${tl.SECONDS.toFixed(1)}s, scenes: ${tl.SCENES.map((s) => `${s.id} ${s.dur}`).join(' · ')})`);
