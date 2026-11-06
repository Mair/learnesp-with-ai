/**
 * Build the FreeRTOS two-cores video's soundtrack from the same timeline as the picture.
 *
 *   npm run freertos-two-cores:audio
 *
 * Layers (everything except the VO is synthesised, scripts/lib/audio.ts):
 *
 *   VO      scratch edge-tts, one clip per line, fit-checked
 *   SFX     the Explainer grammar (ticks / thumps / clacks / buzzes / blips); every LED
 *           switch in the real-time panels as a soft tick (GPIO 2 high, GPIO 19 low),
 *           taken from the same scheduler model as the lanes (sim.ts), so the stumble in
 *           the problem and the steady beat in the demo can be heard
 *   MUSIC   the house pad, ducked under VO, cut before the payoff, resolving to A major
 *
 * No sustained tones: nothing here is about pitch (SOUND.md).
 * Output: public/freertos-two-cores/mix.wav (−16 LUFS, −1.5 dBTP) + stems in out/2-freertos/freertos-two-cores-stems/.
 */
import { join } from 'node:path';
import { biquad, level, master, pad, ROOT, sfx, talkingEnvelope, track, voiceover } from './lib/audio.ts';
import { simulate } from '../src/scenes/freertos-two-cores/sim.ts';
import { ANSWER, DEMO, HOME, PAYOFF, PIN, PRICE, PROBLEM, RUN_MS, SCENES, type SceneId, sceneDur, sceneStart, SECONDS, VO, VOICE, WHICH } from '../src/scenes/freertos-two-cores/timeline.ts';

const PUBLIC = join(ROOT, 'public/freertos-two-cores');
const STEMS = join(ROOT, 'out/2-freertos/freertos-two-cores-stems');
const T = track(SECONDS);
const N = T.N;
const abs = (scene: SceneId, t: number) => sceneStart(scene) + t;

// the same three runs as the picture (Problem.tsx, Which.tsx, Price.tsx)
const free6 = simulate('free-6', { until: RUN_MS, workPrio: 6, workCore: null });
const pinned = simulate('pin-1', { until: RUN_MS, workPrio: 6, workCore: 1 });
const free4 = simulate('free-4', { until: RUN_MS, workPrio: 4, workCore: null });

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

const F_FAST = 3400;
const F_SLOW = 2100;
const LED_AMP = 0.022;

/** LED switches from model edges (ms): model ms `m` plays at absolute `a0 + (m - m0) / 1000`, over [t0, t1) */
function edgeToggles(edges: number[], a0: number, t0: number, t1: number, f: number, m0 = 0) {
  for (const e of edges) {
    const t = a0 + (e - m0) / 1000;
    if (t >= t0 && t < t1) tick(t, f, LED_AMP);
  }
}

// problem: the LEDs from the start of the scene (the model runs from 0.4 s)
{
  const P = PROBLEM;
  const at = (x: number) => abs('problem', x);
  const end = at(sceneDur('problem') - 0.3);
  edgeToggles(free6.edges.fast, at(0.4), at(0.4), end, F_FAST);
  edgeToggles(free6.edges.slow, at(0.4), at(0.4), end, F_SLOW);
  tick(at(P.workers), 2000, 0.09);
  thump(at(P.six), 0.16);
  tick(at(P.five), 2600, 0.06);
  clack(at(P.first), 0.1);
  tick(at(P.both), 2800, 0.07);
  buzz(at(P.late), 0.08);
  tick(at(P.either), 3100, 0.06);
  clack(at(P.picks), 0.1);
  tick(at(P.different), 2600, 0.06);
  tick(at(P.what), 2400, 0.07);
}

// answer
{
  const A = ANSWER;
  const at = (x: number) => abs('answer', x);
  for (let i = 0; i < 4; i++) tick(at(0.2 + 0.1 * i), 2400 + 150 * i, 0.04);
  clack(at(A.free - 0.4), 0.1);
  clack(at(A.free - 0.2), 0.1);
  blip(at(A.free), 660, 990, 0.05);
  thump(at(A.pin + 0.45), 0.16);
  thump(at(A.pin + 0.7), 0.16);
  buzz(at(A.never + 0.3), 0.07);
  thump(at(A.word), 0.3);
}

// who lives on core 0
{
  const H = HOME;
  const at = (x: number) => abs('home', x);
  tick(at(H.ask), 2400, 0.07);
  clack(at(H.main), 0.12);
  tick(at(H.wifi), 2800, 0.06);
  tick(at(H.bt), 3000, 0.06);
  clack(at(H.heavy), 0.1);
  clack(at(H.heavy + 0.2), 0.1);
  thump(at(H.heavy + 0.9), 0.14);
  blip(at(H.heavy + 1.1), 660, 990, 0.05);
}

// xTaskCreatePinnedToCore
{
  const S = PIN;
  const at = (x: number) => abs('pin', x);
  tick(at(S.intro.show), 2000, 0.09);
  clack(at(S.intro.change + 0.5), 0.12);
  tick(at(S.intro.change + 0.9), 3100, 0.06);
  thump(at(S.run), 0.22);
  S.args.forEach((a, i) => tick(at(a), 2600 + 250 * i, 0.08));
  Object.values(S.views).forEach((v) => tick(at(v), 2000, 0.09));
  for (const [x, f] of [[S.zero, 2400], [S.one, 2700], [S.either, 3000]] as const) {
    tick(at(x), f, 0.06);
    if (x !== S.either) thump(at(x + 0.6), 0.1);
  }
  blip(at(S.xtc), 660, 990, 0.05);
  buzz(at(S.mistake), 0.07);
  buzz(at(S.assert), 0.09);
  tick(at(S.pdpass), 2600, 0.06);
  blip(at(S.made), 660, 990, 0.05);
}

// which core am I on?
{
  const S = WHICH;
  const at = (x: number) => abs('which', x);
  Object.values(S.views).forEach((v) => tick(at(v), 2000, 0.09));
  tick(at(S.ask), 2400, 0.07);
  clack(at(S.insert), 0.12);
  tick(at(S.running), 2800, 0.06);
  tick(at(S.zero), 2600, 0.05);
  tick(at(S.one), 3000, 0.05);
  clack(at(S.include), 0.1);
  tick(at(S.calls), 2800, 0.06);
  for (let i = 0; i < 6; i++) tick(at(S.always - 0.6 + i * 0.32), 2200, 0.03);
  blip(at(S.always), 660, 990, 0.05);
  for (let i = 0; i < 6; i++) tick(at(S.free + 0.3 + i * 0.32), 2200, 0.03);
}

// demo: the LEDs in real time, from the same model as the lanes
{
  const D = DEMO;
  const at = (x: number) => abs('demo', x);
  const end = at(sceneDur('demo') - 0.3);
  edgeToggles(pinned.edges.fast, at(D.flash), at(D.flash), end, F_FAST);
  edgeToggles(pinned.edges.slow, at(D.flash), at(D.flash), end, F_SLOW);
  thump(at(D.flash), 0.18);
  tick(at(D.core1), 2800, 0.06);
  blip(at(D.beat), 660, 990, 0.06);
  thump(at(D.fixed), 0.16);
}

// the price
{
  const S = PRICE;
  const at = (x: number) => abs('price', x);
  Object.values(S.views).forEach((v) => tick(at(v), 2000, 0.09));
  // the turns on core 1, close up: 20 slices of 10 ms drawn over 1.2 s
  for (let k = 1; k < 20; k++) clack(at(S.views.zoom + 0.3 + (k * 1.2) / 20), 0.035);
  tick(at(S.turns), 2600, 0.06);
  tick(at(S.tick), 3100, 0.05);
  buzz(at(S.half), 0.07);
  tick(at(S.empty), 2400, 0.06);
  buzz(at(S.free), 0.07);
  clack(at(S.reason), 0.1);
  clack(at(S.better), 0.12);
  tick(at(S.four), 2600, 0.06);
  // the fix view's LED, in real time (model ms 1000 at "better")
  edgeToggles(free4.edges.fast, at(S.better), at(S.better), at(sceneDur('price') - 0.3), F_FAST, 1000);
  blip(at(S.beat), 660, 990, 0.06);
}

// payoff
thump(abs('payoff', PAYOFF.word - 0.9), 0.45);
PAYOFF.recap.forEach((r, i) => tick(abs('payoff', r.at), 1600 + 200 * i, 0.08));

// ── 3. music ───────────────────────────────────────────────────────────────

console.log('── music ──');
const music = new Float32Array(N);
const MUSIC_CUT = abs('payoff', 0) - 0.15;
{
  pad(music, [130.81, 164.81, 220.0], 0, MUSIC_CUT, 1, 3, 0.08);
  pad(music, [110.0, 164.81, 220.0, 277.18], abs('payoff', PAYOFF.word - 0.9), SECONDS, 1.15, 0.35, 2.5);
  biquad(music, 'lp', 1400, 0.6);
  level(music, -30, 3, 6);
  for (let i = 0; i < N; i++) music[i] *= 1 - 0.6 * talking[i];
}

// ── 4. mix ─────────────────────────────────────────────────────────────────

const out = join(PUBLIC, 'mix.wav');
master({ vo, sfx: sfxBuf, music }, T, { stems: STEMS, out });
console.log(`\n✓ ${out}  (${SECONDS.toFixed(1)}s, scenes: ${SCENES.map((s) => `${s.id} ${s.dur}`).join(' · ')})`);
console.log(`  stems → ${STEMS}`);
