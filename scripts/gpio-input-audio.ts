/**
 * Build the GPIO-input video's soundtrack from the same timeline as the picture.
 *
 *   npm run gpio-input:audio
 *
 * Layers (everything except the VO is synthesised, scripts/lib/audio.ts):
 *
 *   VO      scratch edge-tts, one clip per line, fit-checked
 *   SFX     the Explainer grammar (ticks / thumps / clacks / buzzes / blips);
 *           the button itself as a clack on every press and a softer one on
 *           release, from the same press windows the picture uses; the reads
 *           in the problem scene and the 100 reads of the 1-second hold as
 *           soft ticks; the bounce as a rattle phase-locked to its sweep
 *   MUSIC   the house pad, ducked under VO, cut before the payoff, resolving to A major
 *
 * No sustained tones: nothing here is about pitch (SOUND.md).
 * Output: public/gpio-input/mix.wav (−16 LUFS, −1.5 dBTP) + stems in out/gpio-input-stems/.
 */
import { join } from 'node:path';
import { biquad, level, master, pad, ROOT, S, sfx, smooth, SR, talkingEnvelope, track, voiceover } from './lib/audio.ts';
import {
  ANSWER,
  CIRCUIT,
  COUNT,
  DEMO,
  DIRECTION,
  PAYOFF,
  PROBLEM,
  PULL,
  PULLS,
  READ,
  RESET,
  SCENES,
  type SceneId,
  sceneDur,
  sceneStart,
  SECONDS,
  TICK_MS,
  VO,
  VOICE,
} from '../src/scenes/gpio-input/timeline.ts';

const PUBLIC = join(ROOT, 'public/gpio-input');
const STEMS = join(ROOT, 'out/gpio-input-stems');
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

/** the button: a firm clack going down, a lighter one coming up */
function presses(scene: SceneId, windows: [number, number][], g = 0.14) {
  for (const [a, b] of windows) {
    clack(abs(scene, a), g);
    clack(abs(scene, b), g * 0.6);
  }
}

/** the Explainer grammar shared by every call scene */
function explainer(scene: SceneId, x: { run: number; args: { at: number }[]; views: Record<string, number> }) {
  const at = (u: number) => abs(scene, u);
  tick(at(x.run));
  thump(at(x.run), 0.22);
  x.args.forEach((a, i) => tick(at(a.at), 2600 + 220 * i, 0.08));
  Object.values(x.views).forEach((v) => tick(at(v), 2000, 0.09));
}

// problem: the press reads 0, then the floating reads flip
{
  const P = PROBLEM;
  const at = (x: number) => abs('problem', x);
  tick(at(P.ledIn), 2000, 0.09);
  tick(at(P.button), 2000, 0.09);
  presses('problem', [[P.press, P.letGo]]);
  for (let s = P.press; s < sceneDur('problem') - 0.3; s += P.readEvery) tick(at(s), 3400, 0.03);
  blip(at(P.readsZero), 660, 990, 0.05);
  buzz(at(P.floats), 0.07);
}

// answer: the pull-up drops in, the button wins, PULL-UP lands
{
  const A = ANSWER;
  const at = (x: number) => abs('answer', x);
  clack(at(A.resistor), 0.18);
  tick(at(A.high), 3100, 0.05);
  presses('answer', [
    [A.press, A.release],
    [A.pressed, A.pressed + 1.3],
  ]);
  blip(at(A.zero), 660, 990, 0.05);
  tick(at(A.released), 2400, 0.07);
  tick(at(A.pressed), 2600, 0.07);
  thump(at(A.word), 0.3);
}

// circuit
{
  const C = CIRCUIT;
  const at = (x: number) => abs('circuit', x);
  Object.values(C.views).forEach((v) => tick(at(v), 2000, 0.09));
  tick(at(C.wiring.leg), 3100, 0.05);
  clack(at(C.wiring.gpio18), 0.14);
  tick(at(C.wiring.ground), 3100, 0.05);
  blip(at(C.wiring.noR), 660, 990, 0.05);
  tick(at(C.wiring.builtIn), 2800, 0.06);
  tick(at(C.pins.strap), 2400, 0.06);
  buzz(at(C.pins.flash), 0.05);
  blip(at(C.pins.pullup), 660, 990, 0.06);
  buzz(at(C.pins.noPull), 0.05);
  for (const x of [C.bands.vih, C.bands.vil]) tick(at(x), 2400, 0.07);
  tick(at(C.bands.between), 3100, 0.05);
  thump(at(C.bands.floating), 0.16);
}

// gpio_reset_pin
{
  const R = RESET;
  const at = (x: number) => abs('reset', x);
  explainer('reset', R);
  for (const x of [R.state.gpio, R.state.output, R.state.pullup]) tick(at(x), 2800, 0.06);
  buzz(at(R.state.input), 0.07);
  presses('reset', R.read.presses, 0.12);
  buzz(at(R.read.zero), 0.05);
}

// gpio_set_direction
{
  const D = DIRECTION;
  const at = (x: number) => abs('direction', x);
  explainer('direction', D);
  clack(at(D.buffer.on), 0.2); // the input gate closes
  tick(at(D.buffer.driverOff), 3100, 0.05);
  blip(at(D.buffer.listens), 660, 990, 0.05);
  buzz(at(D.forget.line), 0.06);
  for (let k = 0; k < 10; k++) tick(at(D.forget.zero + k * 0.25), 3400, 0.025);
  buzz(at(D.forget.forever), 0.08);
  blip(at(D.any.gpio34), 660, 990, 0.06);
  buzz(at(D.any.outputs), 0.05);
}

// gpio_set_pull_mode
{
  const U = PULL;
  const at = (x: number) => abs('pull', x);
  explainer('pull', U);
  for (const x of [U.modes.up, U.modes.down, U.modes.both, U.modes.floating]) tick(at(x), 2600, 0.06);
  clack(at(U.modes.connects), 0.2);
  tick(at(U.modes.disconnects), 3100, 0.05);
  tick(at(U.current.k45), 2400, 0.07);
  presses('pull', [[U.current.press, U.current.release]]);
  thump(at(U.current.ua), 0.18);
  blip(at(U.current.harmless), 660, 990, 0.05);
  tick(at(U.already.side), 3100, 0.05);
  clack(at(U.already.say), 0.14);
  blip(at(U.already.reader), 660, 990, 0.05);
  tick(at(U.gpio34.code));
  buzz(at(U.gpio34.log), 0.07);
  tick(at(U.gpio34.ok), 3100, 0.05);
  buzz(at(U.gpio34.check), 0.08);
  blip(at(U.gpio34.board), 660, 990, 0.06);
}

// gpio_get_level
{
  const G = READ;
  const at = (x: number) => abs('read', x);
  explainer('read', G);
  tick(at(G.ret.plain), 2800, 0.06);
  buzz(at(G.ret.wrap), 0.05);
  buzz(at(G.ret.fail), 0.08);
  for (const r of G.snap.reads) tick(at(r), 3400, 0.05);
  presses('read', [G.snap.press], 0.1);
  buzz(at(G.snap.remember), 0.05);
  tick(at(G.compare.compare), 2350, 0.1);
  blip(at(G.compare.mean), 660, 990, 0.05);
}

// demo: the setup lines run; the loop starts; the button is the sound
{
  const D = DEMO;
  const at = (x: number) => abs('demo', x);
  tick(at(D.led));
  tick(at(D.button));
  thump(at(D.run), 0.25);
  presses('demo', D.presses);
  tick(at(D.tick), 3100, 0.05);
  blip(at(D.free), 660, 990, 0.05);
  tick(at(D.ten), 2000, 0.09); // the zoom
  blip(at(D.instant), 660, 990, 0.06);
}

// counting presses
{
  const K = COUNT;
  const at = (x: number) => abs('count', x);
  Object.values(K.views).forEach((v) => tick(at(v), 2000, 0.09));
  // the hold: one soft tick per read, 100 in a real second
  presses('count', [[K.hold.hold, K.hold.hold + 1]], 0.12);
  for (let k = 0; k < 100; k++) tick(at(K.hold.hold + (k * TICK_MS) / 1000), 4200, 0.015);
  buzz(at(K.hold.hundred), 0.08);
  tick(at(K.edge.change), 3100, 0.05);
  clack(at(K.edge.falls), 0.16);
  blip(at(K.edge.falls + 0.2), 660, 990, 0.06);
  // the bounce: a rattle on each edge as the sweep draws it (2.5 ms over 1.2 s)
  {
    const sweep0 = K.bounce.bounces - 0.3;
    const msToT = (ms: number) => sweep0 + ((ms + 1) / 4) * 1.2;
    K.bounceLows.forEach(([a, b], i) => {
      clack(at(msToT(a)), 0.09);
      if (b < 50) clack(at(msToT(b)), 0.05 + 0.005 * i);
    });
  }
  tick(at(K.stats.avg), 2400, 0.07);
  buzz(at(K.stats.six), 0.05);
  buzz(at(K.grids.several), 0.08);
  tick(at(K.grids.inside), 3100, 0.05);
  blip(at(K.grids.one), 660, 990, 0.07);
  thump(at(K.debounce.debouncer), 0.2);
  tick(at(K.debounce.filter), 2400, 0.06);
  blip(at(K.debounce.most), 660, 990, 0.05);
  tick(at(K.debounce.bad), 2400, 0.06);
}

// second knob
{
  const K = PULLS;
  const at = (x: number) => abs('pulls', x);
  Object.values(K.views).forEach((v) => tick(at(v), 2000, 0.09));
  clack(at(K.split.down), 0.16);
  presses('pulls', K.split.presses, 0.12);
  tick(at(K.split.released), 2400, 0.07);
  tick(at(K.split.pressed), 2600, 0.07);
  blip(at(K.split.same), 660, 990, 0.05);
  clack(at(K.both.never), 0.14);
  buzz(at(K.both.v165), 0.07);
}

// payoff
tick(abs('payoff', PAYOFF.input), 1800, 0.08);
tick(abs('payoff', PAYOFF.pull), 2000, 0.08);
tick(abs('payoff', PAYOFF.level), 2200, 0.08);
thump(abs('payoff', PAYOFF.line), 0.45);
PAYOFF.recap.forEach((r, i) => tick(abs('payoff', r.at), 1600 + 200 * i, 0.08));

// ── 3. music ───────────────────────────────────────────────────────────────

console.log('── music ──');
const music = new Float32Array(N);
const MUSIC_CUT = abs('payoff', 0) - 0.15;
{
  pad(music, [130.81, 164.81, 220.0], 0, MUSIC_CUT, 1, 3, 0.08);
  pad(music, [110.0, 164.81, 220.0, 277.18], abs('payoff', PAYOFF.line), SECONDS, 1.15, 0.35, 2.5);
  biquad(music, 'lp', 1400, 0.6);
  level(music, -30, 3, 6);
  for (let i = 0; i < N; i++) music[i] *= 1 - 0.6 * talking[i];
}

// ── 4. mix ─────────────────────────────────────────────────────────────────

const out = join(PUBLIC, 'mix.wav');
master({ vo, sfx: sfxBuf, music }, T, { stems: STEMS, out });
console.log(`\n✓ ${out}  (${SECONDS.toFixed(1)}s, scenes: ${SCENES.map((s) => `${s.id} ${s.dur}`).join(' · ')})`);
console.log(`  stems → ${STEMS}`);
