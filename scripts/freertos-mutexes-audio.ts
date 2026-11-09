/**
 * Build the FreeRTOS mutexes video's soundtrack from the same timeline as the picture.
 *
 *   npm run freertos-mutexes:audio
 *
 * Layers (everything except the VO is synthesised, scripts/lib/audio.ts):
 *
 *   VO      edge-tts, one clip per line, fit-checked
 *   SFX     the Explainer grammar (ticks / thumps / clacks / buzzes / blips); the key is a
 *           clack each time it changes hands; lost counts and the assert are buzzes
 *   MUSIC   the house pad, ducked under VO, cut before the payoff, resolving to A major
 *
 * No sustained tones: nothing here is about pitch (SOUND.md).
 * Output: public/freertos-mutexes/mix.wav (−16 LUFS, −1.5 dBTP) + stems in
 * out/2-freertos/freertos-mutexes-stems/.
 */
import { join } from 'node:path';
import { biquad, level, master, pad, ROOT, sfx, talkingEnvelope, track, voiceover } from './lib/audio.ts';
import {
  CODE,
  CREATE,
  GIVE,
  MUTEX,
  PAYOFF,
  RACE,
  SCENES,
  type SceneId,
  sceneDur,
  sceneStart,
  SECONDS,
  SHORT,
  TAKE,
  TRAP,
  VO,
  VOICE,
  WANT,
} from '../src/scenes/freertos-mutexes/timeline.ts';

const PUBLIC = join(ROOT, 'public/freertos-mutexes');
const STEMS = join(ROOT, 'out/2-freertos/freertos-mutexes-stems');
const T = track(SECONDS);
const N = T.N;
const abs = (scene: SceneId, t: number) => sceneStart(scene) + t;

// ── 1. VO ──────────────────────────────────────────────────────────────────

const { vo, speech } = voiceover(
  VO.map((l) => ({ ...l, t0: abs(l.scene, l.at), sceneEnd: abs(l.scene, sceneDur(l.scene)) })),
  VOICE,
  T,
);
const talking = talkingEnvelope(speech, T);

// ── 2. SFX ─────────────────────────────────────────────────────────────────

console.log('── sfx ──');
const { buf: sfxBuf, tick, thump, clack, buzz, blip } = sfx(T);

// 1 · want
{
  const S = WANT;
  const at = (x: number) => abs('want', x);
  tick(at(S.total - 0.3), 2000, 0.08);
  tick(at(S.a - 0.2), 2400, 0.07);
  tick(at(S.b - 0.2), 2600, 0.07);
  tick(at(S.adds), 2800, 0.06);
  thump(at(S.expect), 0.2);
}

// 2 · race
{
  const S = RACE;
  const at = (x: number) => abs('race', x);
  tick(at(S.code), 2000, 0.08);
  blip(at(S.simple), 660, 990, 0.04);
  thump(at(S.flash), 0.14);
  tick(at(S.log), 2600, 0.05);
  tick(at(S.log + 0.12), 2600, 0.05);
  buzz(at(S.number), 0.08);
  tick(at(S.different), 2400, 0.05);
  tick(at(S.different + 0.4), 2400, 0.05);
  tick(at(S.why), 2000, 0.08);
  tick(at(S.read), 2600, 0.06);
  tick(at(S.add), 2800, 0.06);
  tick(at(S.write), 3000, 0.06);
  clack(at(S.read41), 0.1);
  clack(at(S.write42), 0.1);
  buzz(at(S.upOne), 0.07);
  buzz(at(S.hides), 0.05);
}

// 3 · mutex: the key changes hands
{
  const S = MUTEX;
  const at = (x: number) => abs('mutex', x);
  tick(at(S.key - 0.2), 2000, 0.08);
  clack(at(S.aTakes), 0.12);
  tick(at(S.aAdds), 2800, 0.06);
  clack(at(S.aGives), 0.1);
  clack(at(S.bWants - 0.5), 0.1);
  tick(at(S.bWaits), 3100, 0.04);
  clack(at(S.bBack), 0.12);
  tick(at(S.bBack + 0.6), 2800, 0.06);
  clack(at(S.bBack + 1.4), 0.08);
  tick(at(S.step), 3100, 0.05);
  thump(at(S.flash), 0.14);
  for (let i = 0; i < 4; i++) tick(at(S.log + i * 0.5), 2600, 0.05);
  blip(at(S.exactly), 660, 990, 0.07);
  thump(at(S.word), 0.22);
  buzz(at(S.seconds), 0.05);
}

// 4 · code: the take and give lines, the key changing hands
{
  const S = CODE;
  const at = (x: number) => abs('code', x);
  tick(at(0.3), 2000, 0.08);
  tick(at(S.take), 2600, 0.07);
  clack(at(S.take + 0.7), 0.08);
  tick(at(S.give), 2800, 0.07);
  for (let x = S.give; x < S.create - 0.05; x += 1.4) clack(at(x), 0.06);
  tick(at(S.between), 3100, 0.05);
  tick(at(S.create), 2400, 0.08);
}

// 5–7 · the three Explainers
{
  const S = CREATE;
  const at = (x: number) => abs('create', x);
  thump(at(S.run), 0.2);
  Object.values(S.views).forEach((v) => tick(at(v), 2000, 0.07));
  clack(at(S.first + 0.2), 0.1);
  buzz(at(S.null), 0.06);
  blip(at(S.views.order + 0.6), 660, 990, 0.05);
}
{
  const S = TAKE;
  const at = (x: number) => abs('take', x);
  thump(at(S.run), 0.2);
  S.args.forEach((a, i) => tick(at(a), 2600 + 250 * i, 0.08));
  Object.values(S.views).forEach((v) => tick(at(v), 2000, 0.07));
  clack(at(S.once - 0.2), 0.1);
  blip(at(S.pdtrue), 660, 990, 0.05);
  tick(at(S.asleep), 3100, 0.05);
  clack(at(S.forever + 1.6), 0.1);
  buzz(at(S.pdfalse), 0.06);
}
{
  const S = GIVE;
  const at = (x: number) => abs('give', x);
  thump(at(S.run), 0.2);
  S.args.forEach((a, i) => tick(at(a), 2600 + 250 * i, 0.08));
  Object.values(S.views).forEach((v) => tick(at(v), 2000, 0.07));
  clack(at(S.views.back + 0.6), 0.1);
  clack(at(S.wakes), 0.1);
  for (let i = 0; i < 2; i++) tick(at(S.stops + i * 0.35), 2600, 0.05);
  buzz(at(S.stops + 0.7), 0.09);
}

// 8 · short
{
  const S = SHORT;
  const at = (x: number) => abs('short', x);
  tick(at(S.cost), 2000, 0.08);
  clack(at(S.outside), 0.12);
  tick(at(S.mine), 3100, 0.05);
  tick(at(S.once), 2000, 0.07);
  tick(at(S.again), 2600, 0.05);
  blip(at(S.again + 0.2), 660, 990, 0.06);
  tick(at(S.few), 2000, 0.07);
}

// 9 · trap
{
  const S = TRAP;
  const at = (x: number) => abs('trap', x);
  tick(at(S.now), 2000, 0.09);
  clack(at(S.add), 0.14);
  buzz(at(S.breaks), 0.07);
  thump(at(S.views.hang), 0.14);
  tick(at(S.views.hang + 0.3), 2600, 0.05);
  tick(at(S.views.hang + 0.6), 2600, 0.05);
  buzz(at(S.forever), 0.06);
  blip(at(S.fix), 660, 990, 0.06);
  clack(at(S.fix + 0.1), 0.1);
  for (let i = 0; i < 3; i++) tick(at(S.warning + (i + 1) * 0.4), 3000, 0.05);
}

// 10 · payoff
thump(abs('payoff', PAYOFF.word - 0.3), 0.45);
PAYOFF.recap.forEach((r, i) => tick(abs('payoff', r.at), 1600 + 200 * i, 0.08));

// ── 3. music ───────────────────────────────────────────────────────────────

console.log('── music ──');
const music = new Float32Array(N);
const MUSIC_CUT = abs('payoff', 0) - 0.15;
{
  pad(music, [130.81, 164.81, 220.0], 0, MUSIC_CUT, 1, 3, 0.08);
  pad(music, [110.0, 164.81, 220.0, 277.18], abs('payoff', PAYOFF.word - 0.3), SECONDS, 1.15, 0.35, 2.5);
  biquad(music, 'lp', 1400, 0.6);
  level(music, -30, 3, 6);
  for (let i = 0; i < N; i++) music[i] *= 1 - 0.6 * talking[i];
}

// ── 4. mix ─────────────────────────────────────────────────────────────────

const out = join(PUBLIC, 'mix.wav');
master({ vo, sfx: sfxBuf, music }, T, { stems: STEMS, out });
console.log(`\n✓ ${out}  (${SECONDS.toFixed(1)}s, scenes: ${SCENES.map((s) => `${s.id} ${s.dur}`).join(' · ')})`);
console.log(`  stems → ${STEMS}`);
