/**
 * Build the GPIO-interrupts video's soundtrack from the same timeline as the picture.
 *
 *   npm run gpio-interrupts:audio
 *
 * Layers (everything except the VO is synthesised, scripts/lib/audio.ts):
 *
 *   VO      scratch edge-tts, one clip per line, fit-checked
 *   SFX     the Explainer grammar (ticks / thumps / clacks / buzzes / blips);
 *           polling's reads as soft ticks (real time, 100 a second) against
 *           the interrupt's single event; the button as a clack; every
 *           interrupt in the bounce storm as a rattle phase-locked to the
 *           bolts the picture draws
 *   MUSIC   the house pad, ducked under VO, a gated pulse under the IDF
 *           descent, cut before the payoff, resolving to A major
 *
 * No sustained tones: nothing here is about pitch (SOUND.md).
 * Output: public/gpio-interrupts/mix.wav (−16 LUFS, −1.5 dBTP) + stems in out/gpio-interrupts-stems/.
 */
import { join } from 'node:path';
import { biquad, level, master, pad, ROOT, S, sfx, smooth, SR, talkingEnvelope, track, voiceover } from './lib/audio.ts';
import {
  ANSWER,
  BOUNCE,
  CONFIG,
  DEMO,
  HANDLER,
  IDF,
  ISR,
  PAYOFF,
  PRESS_FALLS,
  PROBLEM,
  QUEUE,
  SCENES,
  type SceneId,
  sceneDur,
  sceneStart,
  SECONDS,
  SERVICE,
  TYPES,
  VO,
  VOICE,
} from '../src/scenes/gpio-interrupts/timeline.ts';

const PUBLIC = join(ROOT, 'public/gpio-interrupts');
const STEMS = join(ROOT, 'out/gpio-interrupts-stems');
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

/** the Explainer grammar shared by every call scene */
function explainer(scene: SceneId, x: { run: number; args: { at: number }[]; views: Record<string, number> }) {
  const at = (u: number) => abs(scene, u);
  tick(at(x.run));
  thump(at(x.run), 0.22);
  x.args.forEach((a, i) => tick(at(a.at), 2600 + 220 * i, 0.08));
  Object.values(x.views).forEach((v) => tick(at(v), 2000, 0.09));
}
const views = (scene: SceneId, v: Record<string, number>) => Object.values(v).forEach((x) => tick(abs(scene, x), 2000, 0.09));

// problem: polling's reads tick away (100 a second, as the counter), then the pulse slips through
{
  const P = PROBLEM;
  const at = (x: number) => abs('problem', x);
  tick(at(P.codeIn), 2000, 0.09);
  for (let s = P.hundred; s < P.pulse - 0.2; s += 0.01) tick(at(s), 4200, 0.012);
  tick(at(P.same), 3100, 0.05);
  buzz(at(P.notPressed), 0.05);
  thump(at(P.hour), 0.16);
  tick(at(P.pulse), 2000, 0.09);
  clack(at(P.slip), 0.12);
  buzz(at(P.never), 0.08);
  blip(at(P.question), 660, 990, 0.05);
}

// answer: the edge, the interrupt, back again, the word
{
  const A = ANSWER;
  const at = (x: number) => abs('answer', x);
  tick(at(A.watches), 2400, 0.07);
  clack(at(A.edge), 0.16);
  thump(at(A.interrupts), 0.2);
  blip(at(A.runs), 660, 990, 0.05);
  tick(at(A.back), 2400, 0.07);
  thump(at(A.word), 0.3);
}

// gpio_config
{
  const K = CONFIG;
  const at = (x: number) => abs('config', x);
  views('config', K.views);
  tick(at(K.struct.one), 2600, 0.07);
  tick(at(K.struct.every), 3100, 0.05);
  tick(at(K.mask.bit), 3100, 0.05);
  tick(at(K.mask.shift), 2600, 0.06);
  clack(at(K.mask.b18), 0.16);
  tick(at(K.mask.sixty4), 2400, 0.06);
  tick(at(K.mask.to39), 3100, 0.05);
  blip(at(K.mask.ull), 660, 990, 0.05);
  for (const x of [K.fields.input, K.fields.up, K.fields.down]) tick(at(x), 2800, 0.06);
  tick(at(K.intr.type), 2600, 0.07);
  thump(at(K.intr.neg), 0.18);
  clack(at(K.intr.falling), 0.14);
  tick(at(K.intr.oneToZero), 3100, 0.05);
  blip(at(K.intr.down), 660, 990, 0.05);
  tick(at(K.errors.wrap), 2400, 0.06);
  buzz(at(K.errors.empty), 0.06);
  buzz(at(K.errors.ret), 0.08);
}

// gpio_install_isr_service
{
  const V = SERVICE;
  const at = (x: number) => abs('service', x);
  explainer('service', V);
  thump(at(V.shared.share), 0.16);
  tick(at(V.shared.installs), 2600, 0.07);
  blip(at(V.shared.each), 660, 990, 0.05);
  tick(at(V.flags.zero), 2800, 0.06);
  tick(at(V.flags.prio), 3100, 0.05);
  tick(at(V.flags.c), 3100, 0.05);
  buzz(at(V.flags.flash), 0.05);
  tick(at(V.once.second), 2600, 0.06);
  buzz(at(V.once.ret), 0.08);
}

// gpio_isr_handler_add
{
  const H = HANDLER;
  const at = (x: number) => abs('handler', x);
  explainer('handler', H);
  clack(at(H.arg.back), 0.12);
  tick(at(H.arg.every), 3100, 0.05);
  tick(at(H.arg.pin), 2800, 0.06);
  for (let k = 0; k < 2; k++) tick(at(H.arg.several + 0.15 * k), 2600 + 200 * k, 0.06);
  blip(at(H.arg.several + 0.4), 660, 990, 0.05);
  blip(at(H.order.on), 660, 990, 0.06);
  tick(at(H.order.before), 2600, 0.06);
  buzz(at(H.order.ret), 0.08);
}

// the ISR
{
  const I = ISR;
  const at = (x: number) => abs('isr', x);
  views('isr', I.views);
  thump(at(I.context.inside), 0.2);
  tick(at(I.context.notTask), 3100, 0.05);
  tick(at(I.context.rules), 2600, 0.07);
  buzz(at(I.rules.wait), 0.05);
  for (const x of [I.rules.delay, I.rules.receive, I.rules.log]) buzz(at(x), 0.06);
  tick(at(I.stack.own), 2600, 0.06);
  thump(at(I.stack.bytes), 0.16);
  blip(at(I.stack.minimum), 660, 990, 0.05);
  tick(at(I.fromisr.ends), 2600, 0.06);
  tick(at(I.fromisr.send), 2800, 0.07);
  clack(at(I.fromisr.copies), 0.14);
  tick(at(I.yield.wakes), 3100, 0.05);
  tick(at(I.yield.woken), 2600, 0.06);
  thump(at(I.yield.port), 0.18);
  blip(at(I.yield.ends), 660, 990, 0.05);
  buzz(at(I.yield.leave), 0.05);
  tick(at(I.yield.tick), 2000, 0.08);
  tick(at(I.iram.attr), 2600, 0.06);
  blip(at(I.iram.need), 660, 990, 0.06);
}

// the queue
{
  const Q = QUEUE;
  const at = (x: number) => abs('queue', x);
  views('queue', Q.views);
  tick(at(Q.create.worlds), 2400, 0.06);
  thump(at(Q.create.create), 0.18);
  for (let k = 0; k < 10; k++) tick(at(Q.create.ten + k * 0.06), 3000 + 60 * k, 0.03);
  tick(at(Q.create.four), 2600, 0.06);
  tick(at(Q.receive.receive), 2800, 0.07);
  thump(at(Q.receive.max), 0.16);
  clack(at(Q.suspended.parks), 0.14);
  tick(at(Q.suspended.list), 2600, 0.06);
  buzz(at(Q.suspended.timer), 0.04);
  blip(at(Q.suspended.nothing), 660, 990, 0.06);
}

// demo: one press, end to end; then polling's reads against one event
{
  const D = DEMO;
  const at = (x: number) => abs('demo', x);
  clack(at(D.press - 0.3), 0.16);
  tick(at(D.status), 3100, 0.06);
  thump(at(D.jumps), 0.2);
  tick(at(D.handler), 2600, 0.06);
  tick(at(D.isr), 2800, 0.07);
  clack(at(D.drops), 0.1);
  tick(at(D.returns), 2400, 0.06);
  tick(at(D.wakes), 2600, 0.06);
  blip(at(D.logs), 660, 990, 0.06);
  clack(at(D.release), 0.09);
  for (let s = D.polling; s < sceneDur('demo') - 0.4; s += 0.01) tick(at(s), 4200, 0.01);
  blip(at(D.once), 660, 990, 0.06);
}

// bounce: an interrupt on every falling edge, as the bolts light
{
  const B = BOUNCE;
  const at = (x: number) => abs('bounce', x);
  views('bounce', B.views);
  tick(at(B.storm.bounce), 2000, 0.08);
  PRESS_FALLS.forEach((_, i) => clack(at(B.storm.every + i * 0.25), 0.09 + 0.01 * i));
  for (let i = 0; i < 5; i++) tick(at(B.storm.five + i * 0.12), 3400, 0.04);
  buzz(at(B.storm.five + 0.6), 0.08);
  clack(at(B.storm.falling), 0.09);
  tick(at(B.fix.task), 2600, 0.06);
  clack(at(B.fix.first), 0.12);
  tick(at(B.fix.wait), 2400, 0.06);
  tick(at(B.fix.reset), 2800, 0.07);
  tick(at(B.fix.read), 3100, 0.05);
  tick(at(B.fix.zero), 2600, 0.06);
  blip(at(B.fix.press), 660, 990, 0.05);
  thump(at(B.fix.one), 0.2);
}

// second knob: trigger types
{
  const K = TYPES;
  const at = (x: number) => abs('types', x);
  views('types', K.views);
  tick(at(K.edges.knob), 2400, 0.06);
  clack(at(K.edges.neg), 0.12);
  clack(at(K.edges.pos), 0.1);
  clack(at(K.edges.any), 0.12);
  clack(at(K.edges.any + 0.25), 0.1);
  tick(at(K.edges.read), 3100, 0.05);
  // LOW_LEVEL: firing, and firing
  for (let k = 0; k < 30; k++) tick(at(K.level.firing + k * 0.11), 3600, 0.025);
  buzz(at(K.level.held), 0.06);
  buzz(at(K.level.again), 0.07);
  tick(at(K.wake.sleep), 2400, 0.06);
  blip(at(K.wake.enable), 660, 990, 0.05);
  buzz(at(K.wake.enable + 1.0), 0.05);
  tick(at(K.wake.two), 2600, 0.06);
}

// under the hood: register, status bit, the driver's handler
{
  const at = (x: number) => abs('idf', x);
  tick(at(IDF.pin18), 1800, 0.12);
  tick(at(IDF.type), 2600, 0.06);
  clack(at(IDF.two), 0.12);
  tick(at(IDF.ena), 2600, 0.06);
  clack(at(IDF.cpu0), 0.12);
  tick(at(IDF.status), 1500, 0.12);
  clack(at(IDF.bit18), 0.18);
  thump(at(IDF.takes), 0.2);
  tick(at(IDF.driver), 1200, 0.15);
  for (const m of IDF.marks) {
    tick(at(m.at), 3100, 0.05);
    if (m.strong) thump(at(m.at), 0.2);
  }
  clack(at(IDF.again), 0.12);
  blip(at(IDF.fires), 660, 990, 0.06);
}

// payoff
tick(abs('payoff', PAYOFF.ask), 1800, 0.08);
tick(abs('payoff', PAYOFF.tell), 2100, 0.08);
thump(abs('payoff', PAYOFF.line), 0.45);
PAYOFF.recap.forEach((r, i) => tick(abs('payoff', r.at), 1600 + 200 * i, 0.08));

// ── 3. music ───────────────────────────────────────────────────────────────

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

// ── 4. mix ─────────────────────────────────────────────────────────────────

const out = join(PUBLIC, 'mix.wav');
master({ vo, sfx: sfxBuf, music }, T, { stems: STEMS, out });
console.log(`\n✓ ${out}  (${SECONDS.toFixed(1)}s, scenes: ${SCENES.map((s) => `${s.id} ${s.dur}`).join(' · ')})`);
console.log(`  stems → ${STEMS}`);
