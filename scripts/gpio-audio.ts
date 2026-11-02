/**
 * Build the GPIO video's soundtrack from the same timeline as the picture.
 *
 *   npm run gpio:audio
 *
 * Scene times in the timeline are scene-relative; `abs()` converts.
 * Synthesis, VO, SFX and mastering live in ./lib/audio.ts (shared by every video).
 *
 * Layers (everything except the VO is synthesised):
 *
 *   VO      scratch edge-tts, one clip per line, fit-checked against the next
 *   PIN     the pin's own edges as clicks, phase-locked to what's drawn:
 *           blink (1 Hz, real time, from `blinkHigh`), and "the pin flips far
 *           too fast", where the clicks speed up and fade as the blinks fuse — no
 *           sustained tone (SOUND.md: pitch only where sound is the subject)
 *   SFX     ticks as lines run / cards land / views change, clacks when a
 *           switch or register bit latches, buzzes on the rejected ideas,
 *           blips when it works, thumps on the big moments
 *   MUSIC   the house pad (C3·E3·A3 over A2), ducked under VO, a gated pulse
 *           under the IDF descent, cut before the payoff, resolving to A major
 *
 * Output: public/gpio/mix.wav (−16 LUFS, −1.5 dBTP) + stems in out/gpio-stems/.
 */
import { join } from 'node:path';
import { biquad, db, level, master, pad, pulse, ROOT, S, sfx, smooth, SR, talkingEnvelope, track, voiceover } from './lib/audio.ts';
import { fusion } from '../src/components/pwm.ts';
import {
  ANSWER,
  BLINK,
  CIRCUIT,
  CURRENT,
  DELAY,
  DELAY_MS,
  DIRECTION,
  IDF,
  msToTicks,
  PAYOFF,
  PROBLEM,
  RESET,
  SCENES,
  type SceneId,
  sceneDur,
  sceneStart,
  SECONDS,
  VO,
  VOICE,
  WRITE,
} from '../src/scenes/gpio/timeline.ts';

const PUBLIC = join(ROOT, 'public/gpio');
const STEMS = join(ROOT, 'out/gpio-stems');
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

// ── 2. the pin, heard ─────────────────────────────────────────────────────

console.log('── pin ──');
const pin = new Float32Array(N);
{
  const bA = abs('blink', BLINK.run);
  const bE = abs('blink', sceneDur('blink') - 0.4);
  const hz = 1000 / (2 * DELAY_MS);
  const nd = DELAY.dimmer;
  const nA = abs('delay', DELAY.views.dimmer);
  const nE = abs('delay', sceneDur('delay') - 0.3);
  // same speed-up as the picture: 1 Hz → ~300 Hz from "flips far too fast"
  const ndHz = (u: number) => 300 ** smooth((u - nd.fast) / 2.2);
  pulse(pin, (t) => {
    // blink: real time, starts high on `run` — phase-locked to the LED and scope
    if (t >= bA && t < bE) return { f: hz, duty: 0.5, g: 1 };
    // no delays: the clicks race and fade as the LED stops visibly blinking
    if (t >= nA && t < nE) {
      const f = ndHz(t - sceneStart('delay'));
      const g = (1 - fusion(f)) * smooth((t - (nA + 0.2)) / 0.3);
      if (g < 1e-4) return null;
      return { f, duty: 0.5, g };
    }
    return null;
  });
  biquad(pin, 'hp', 300);
  biquad(pin, 'lp', 3000, 0.6);
  // sparse clicks: level by peak, not RMS (RMS over a 1 Hz click track is mostly silence)
  let pk = 0;
  for (let i = 0; i < N; i++) pk = Math.max(pk, Math.abs(pin[i]));
  const gPk = db(-14) / Math.max(pk, 1e-9);
  for (let i = 0; i < N; i++) pin[i] *= gPk;
  for (let i = 0; i < N; i++) pin[i] *= 1 - 0.3 * talking[i];
}

// ── 3. SFX ─────────────────────────────────────────────────────────────────

console.log('── sfx ──');
const { buf: sfxBuf, tick, thump, clack, buzz, blip } = sfx(T);

// problem: the line runs — and nothing happens
{
  const at = (x: number) => abs('problem', x);
  tick(at(PROBLEM.codeIn), 2000, 0.09);
  tick(at(PROBLEM.ledIn), 2000, 0.09);
  tick(at(PROBLEM.reset), 3100, 0.05);
  tick(at(PROBLEM.listening), 3100, 0.06);
  tick(at(PROBLEM.run));
  blip(at(PROBLEM.espOk), 660, 990, 0.04);
  buzz(at(PROBLEM.dark), 0.07);
}

// answer: the gate closes, the level switch throws, G·P·I·O lands
{
  const at = (x: number) => abs('answer', x);
  clack(at(ANSWER.output), 0.18);
  clack(at(ANSWER.high), 0.2);
  clack(at(ANSWER.low), 0.16);
  ANSWER.letters.forEach((l, i) => tick(at(l), 1800 + 250 * i, 0.15));
  thump(at(ANSWER.letters[3]), 0.3);
}

/** the Explainer grammar shared by every call scene */
function explainer(scene: SceneId, x: { run: number; args: { at: number }[]; views: Record<string, number> }) {
  const at = (u: number) => abs(scene, u);
  tick(at(x.run));
  thump(at(x.run), 0.22);
  x.args.forEach((a, i) => tick(at(a.at), 2600 + 220 * i, 0.08));
  Object.values(x.views).forEach((v) => tick(at(v), 2000, 0.09));
}

// circuit
{
  const at = (x: number) => abs('circuit', x);
  explainer('circuit', CIRCUIT);
  tick(at(CIRCUIT.wiring.module), 3100, 0.05);
  clack(at(CIRCUIT.wiring.high), 0.16);
  blip(at(CIRCUIT.wiring.current), 660, 990, 0.06);
  for (const x of [CIRCUIT.ohm.same, CIRCUIT.ohm.drops, CIRCUIT.ohm.leaving, CIRCUIT.ohm.over]) tick(at(x), 2400, 0.07);
  thump(at(CIRCUIT.ohm.ma), 0.2);
  for (const x of [CIRCUIT.pins.inputs, CIRCUIT.pins.flash]) buzz(at(x), 0.05);
  tick(at(CIRCUIT.pins.uploads), 3100, 0.05);
  for (const x of [CIRCUIT.strap.strap, CIRCUIT.strap.reset, CIRCUIT.strap.ground]) tick(at(x), 3100, 0.05);
  blip(at(CIRCUIT.strap.safe), 660, 990, 0.07);
  tick(at(CIRCUIT.strap.boards), 2800, 0.06);
  tick(at(CIRCUIT.strap.check), 3100, 0.05);
}

// gpio_reset_pin
{
  const R = RESET;
  const at = (x: number) => abs('reset', x);
  explainer('reset', R);
  for (const x of [R.module.gpio, R.module.notPos, R.module.wroom]) tick(at(x), 3100, 0.05);
  clack(at(R.module.pin24), 0.16);
  tick(at(R.module.io2), 2800, 0.06);
  for (const x of [R.count.has34, R.count.out28]) tick(at(x), 2400, 0.07);
  for (const x of [R.state.gpio, R.state.input, R.state.output, R.state.pullup]) tick(at(x), 2800, 0.06);
  blip(at(R.state.floating), 660, 990, 0.05);
}

// gpio_set_direction
{
  const D = DIRECTION;
  const at = (x: number) => abs('direction', x);
  explainer('direction', D);
  clack(at(D.driver.on), 0.2); // the output-enable gate closes
  clack(at(D.driver.high), 0.14);
  clack(at(D.driver.low), 0.12);
  tick(at(D.modes.outOnly), 2800, 0.06);
  buzz(at(D.modes.readZero), 0.05);
  blip(at(D.modes.inout), 660, 990, 0.05);
  tick(at(D.fail.code));
  buzz(at(D.fail.log), 0.07);
  tick(at(D.fail.ret), 3100, 0.05);
  tick(at(D.fail.wrap), 2350, 0.1);
  thump(at(D.fail.stops), 0.18);
  tick(at(D.start.unknown), 3100, 0.05);
  clack(at(D.start.first), 0.14);
  blip(at(D.start.on), 660, 990, 0.06);
}

// gpio_set_level
{
  const W = WRITE;
  const at = (x: number) => abs('write', x);
  explainer('write', W);
  clack(at(W.level.high), 0.16);
  clack(at(W.level.low), 0.16);
  for (const x of [W.bands.voh, W.bands.vol]) tick(at(x), 2400, 0.07);
  thump(at(W.bands.only), 0.18);
  tick(at(W.value.whole), 2800, 0.06);
  blip(at(W.value.any), 660, 990, 0.06);
  tick(at(W.cpu.wait), 2350, 0.1);
  blip(at(W.cpu.returns), 660, 990, 0.06);
  tick(at(W.cpu.holds), 3100, 0.05);
}

// blink: the setup lines run; the loop starts (its edges are the PIN layer)
tick(abs('blink', BLINK.resetLine));
tick(abs('blink', BLINK.directionLine));
thump(abs('blink', BLINK.run), 0.25);
tick(abs('blink', BLINK.second), 3100, 0.05);

// vTaskDelay
{
  const D = DELAY;
  const at = (x: number) => abs('delay', x);
  explainer('delay', D);
  for (const x of [D.ticks.hz, D.ticks.tick10]) tick(at(x), 2400, 0.07);
  // the ticks themselves: a soft roll across a real half second, one per 5 ticks
  const n = msToTicks(DELAY_MS);
  for (let k = 0; k <= n; k += 5) tick(at(D.ticks.fifty + (k / n) * (DELAY_MS / 1000)), 4200, 0.03);
  tick(at(D.round.down), 3100, 0.05);
  tick(at(D.round.five), 2400, 0.07);
  buzz(at(D.round.zero), 0.06);
  blip(at(D.sleep.free), 660, 990, 0.06);
  clack(at(D.sleep.bit), 0.16);
  buzz(at(D.wdt.out), 0.05);
  buzz(at(D.wdt.five), 0.08);
  tick(at(D.dimmer.dim), 3100, 0.05);
}

// current
{
  const K = CURRENT;
  const at = (x: number) => abs('current', x);
  Object.values(K.views).forEach((v) => tick(at(v), 2000, 0.09));
  for (const x of [K.knob.code, K.knob.resistor]) tick(at(x), 2800, 0.06);
  clack(at(K.knob.r1k), 0.14);
  for (const x of [K.knob.ma6, K.knob.ma13]) tick(at(x), 2400, 0.07);
  for (const x of [K.budget.def20, K.budget.max40]) tick(at(x), 2400, 0.07);
  buzz(at(K.budget.far), 0.07);
  blip(at(K.budget.load), 660, 990, 0.07);
}

// under the hood: each layer lands a little lower — we're descending
IDF.layers.forEach((l, i) => tick(abs('idf', l.at), 2300 - 260 * i, 0.15));
for (const l of IDF.layers)
  for (const m of l.marks) {
    tick(abs('idf', m.at), 3100, 0.05);
    if (m.strong) thump(abs('idf', m.at), 0.2);
  }
tick(abs('idf', IDF.register), 1200, 0.15);
clack(abs('idf', IDF.write), 0.22); // the bit latches
blip(abs('idf', IDF.others), 660, 990, 0.06);
tick(abs('idf', IDF.direction), 1200, 0.12);
clack(abs('idf', IDF.route), 0.14);
clack(abs('idf', IDF.enable), 0.16);

// payoff
tick(abs('payoff', PAYOFF.output), 1800, 0.08);
tick(abs('payoff', PAYOFF.level), 2100, 0.08);
thump(abs('payoff', PAYOFF.line), 0.45);
PAYOFF.recap.forEach((r, i) => tick(abs('payoff', r.at), 1600 + 200 * i, 0.08));

// ── 4. music ───────────────────────────────────────────────────────────────

console.log('── music ──');
const music = new Float32Array(N);
const MUSIC_CUT = abs('payoff', 0) - 0.15;
{
  pad(music, [130.81, 164.81, 220.0], 0, MUSIC_CUT, 1, 3, 0.08);
  const iS = sceneStart('idf');
  for (let i = S(iS); i < S(MUSIC_CUT); i++) {
    const t = i / SR;
    const gate = ((t - iS) * (100 / 60) * 2) % 1;
    const env = Math.exp(-gate * 7) * smooth((t - iS) / 2) * Math.min(1, (MUSIC_CUT - t) / 0.08);
    music[i] += 1.4 * env * Math.sin(2 * Math.PI * 55 * t);
  }
  pad(music, [110.0, 164.81, 220.0, 277.18], abs('payoff', PAYOFF.line), SECONDS, 1.15, 0.35, 2.5);
  biquad(music, 'lp', 1400, 0.6);
  level(music, -30, 3, 6);
  for (let i = 0; i < N; i++) music[i] *= 1 - 0.6 * talking[i];
}

// ── 5. mix ─────────────────────────────────────────────────────────────────

const out = join(PUBLIC, 'mix.wav');
master({ vo, pin, sfx: sfxBuf, music }, T, { stems: STEMS, out });
console.log(`\n✓ ${out}  (${SECONDS}s, scenes: ${SCENES.map((s) => `${s.id} ${s.dur}`).join(' · ')})`);
console.log(`  stems → ${STEMS}`);
