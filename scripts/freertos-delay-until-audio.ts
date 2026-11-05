/**
 * Build the FreeRTOS delay-until video's soundtrack from the same timeline as the picture.
 *
 *   npm run freertos-delay-until:audio
 *
 * Layers (everything except the VO is synthesised, scripts/lib/audio.ts):
 *
 *   VO      scratch edge-tts, one clip per line, fit-checked
 *   SFX     the Explainer grammar (ticks / thumps / clacks / buzzes / blips); every LED
 *           switch in the real-time panels as a soft tick (LED A low, LED B high), from the
 *           same edge lists as the traces, so the drift can be heard: B on the beat, A sliding
 *   MUSIC   the house pad, ducked under VO, cut before the payoff, resolving to A major
 *
 * No sustained tones: nothing here is about pitch (SOUND.md).
 * Output: public/freertos-delay-until/mix.wav (−16 LUFS, −1.5 dBTP) + stems in out/2-freertos/freertos-delay-until-stems/.
 */
import { join } from 'node:path';
import { biquad, level, master, pad, ROOT, sfx, talkingEnvelope, track, voiceover } from './lib/audio.ts';
import {
  ANSWER,
  DEMO,
  delayEdges,
  LATE,
  lateEdges,
  PAYOFF,
  PROBLEM,
  SCENES,
  type SceneId,
  sceneDur,
  sceneStart,
  SECONDS,
  TICK,
  TRAP,
  UNTIL,
  untilEdges,
  VO,
  VOICE,
  WHY,
} from '../src/scenes/freertos-delay-until/timeline.ts';

const PUBLIC = join(ROOT, 'public/freertos-delay-until');
const STEMS = join(ROOT, 'out/2-freertos/freertos-delay-until-stems');
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

const F_A = 2100; // LED A (vTaskDelay)
const F_B = 3400; // LED B (xTaskDelayUntil)
const LED_AMP = 0.022;

/** LED switches from edges (ms), placed from absolute `a0`, over [t0, t1) */
function edgeToggles(edges: number[], a0: number, t0: number, t1: number, f: number, amp = LED_AMP) {
  for (const e of edges) {
    const t = a0 + e / 1000;
    if (t >= t0 && t < t1) tick(t, f, amp);
  }
}

// problem: the wanted beat, then both LEDs in real time
{
  const P = PROBLEM;
  const at = (x: number) => abs('problem', x);
  const end = at(sceneDur('problem') - 0.3);
  edgeToggles(untilEdges(60000), at(P.led), at(P.led), at(P.start), F_B);
  edgeToggles(delayEdges(60000), at(P.start), at(P.start), end, F_A);
  edgeToggles(untilEdges(60000), at(P.start), at(P.start), end, F_B);
  tick(at(P.led), 2000, 0.09);
  tick(at(P.every), 2600, 0.06);
  clack(at(P.work), 0.12);
  tick(at(P.two), 2000, 0.09);
  tick(at(P.wait), 2800, 0.06);
  thump(at(P.start), 0.18);
  buzz(at(P.behind), 0.07);
  buzz(at(P.opposite), 0.08);
}

// why it drifts: one loop at a time
{
  const S = WHY;
  const at = (x: number) => abs('why', x);
  tick(at(S.follow), 2000, 0.09);
  tick(at(S.switches), F_A, 0.06);
  clack(at(S.works), 0.12);
  tick(at(S.delay), 2600, 0.06);
  tick(at(S.now), 2800, 0.06);
  thump(at(S.sum), 0.2);
  tick(at(S.not200), 2400, 0.06);
  for (let i = 0; i < 4; i++) buzz(at(S.adds + 0.35 * i), 0.04 + 0.01 * i);
  buzz(at(S.drifts), 0.08);
}

// the answer: wait UNTIL
{
  const S = ANSWER;
  const at = (x: number) => abs('answer', x);
  clack(at(S.dont), 0.12);
  tick(at(S.until), 2800, 0.07);
  tick(at(S.beat), 3100, 0.06);
  for (let k = 0; k < 4; k++) tick(at(S.inside + 0.4 * k), F_B, 0.04);
  blip(at(S.stays), 660, 990, 0.05);
  thump(at(S.word), 0.3);
}

// xTaskGetTickCount
{
  const S = TICK;
  const at = (x: number) => abs('tick', x);
  Object.values(S.views).forEach((v) => tick(at(v), 2000, 0.09));
  tick(at(S.count), 2600, 0.07);
  for (let k = 0; k < 8; k++) tick(at(S.passed + 0.2 * k), 3600, 0.025);
  tick(at(S.ms10), 3100, 0.05);
  clack(at(S.store), 0.12);
  thump(at(S.first), 0.16);
  tick(at(S.once), 2600, 0.06);
  blip(at(S.before), 660, 990, 0.05);
}

// xTaskDelayUntil
{
  const S = UNTIL;
  const at = (x: number) => abs('until', x);
  tick(at(S.intro.show), 2000, 0.09);
  thump(at(S.run), 0.22);
  S.args.forEach((a, i) => tick(at(a), 2600 + 250 * i, 0.08));
  Object.values(S.views).forEach((v) => tick(at(v), 2000, 0.09));
  tick(at(S.amp), 2800, 0.06);
  tick(at(S.read), 2600, 0.06);
  clack(at(S.change), 0.1);
  tick(at(S.ms200), 2800, 0.06);
  tick(at(S.ticks20), 3100, 0.06);
  tick(at(S.next), 2600, 0.06);
  tick(at(S.plus), 2800, 0.06);
  clack(at(S.waits), 0.1);
  // the 20 ticks of the wait, counted out
  const a = S.waits + 0.4;
  for (let k = 1; k <= 20; k++) tick(at(a + (k * (S.reaches - a)) / 20), 3600, k === 20 ? 0.06 : 0.025);
  blip(at(S.reaches), 660, 990, 0.05);
  clack(at(S.moves), 0.1);
  tick(at(S.ready), 2600, 0.06);
  for (let k = 0; k < 4; k++) tick(at(S.always + 0.3 * k), 2400 + 200 * k, 0.05);
  tick(at(S.whole), 2600, 0.06);
  tick(at(S.under), 2400, 0.06);
  clack(at(S.zero), 0.12);
  buzz(at(S.stops), 0.09);
  tick(at(S.older), 2400, 0.06);
  buzz(at(S.idf), 0.06);
  blip(at(S.use), 660, 990, 0.06);
}

// demo: both LEDs in real time, from the same edge lists as the traces
{
  const D = DEMO;
  const at = (x: number) => abs('demo', x);
  const end = at(sceneDur('demo') - 0.3);
  edgeToggles(delayEdges(60000), at(D.flash), at(D.flash), end, F_A);
  edgeToggles(untilEdges(60000), at(D.flash), at(D.flash), end, F_B);
  thump(at(D.flash), 0.18);
  buzz(at(D.drifts), 0.07);
  thump(at(D.flash + 10), 0.2);
  tick(at(D.b50), 3100, 0.06);
  tick(at(D.a44), 2100, 0.06);
  blip(at(D.call), 660, 990, 0.05);
}

// running late: the slow loop, in slow motion (matches LaneView's clock)
{
  const S = LATE;
  const at = (x: number) => abs('late', x);
  Object.values(S.views).forEach((v) => tick(at(v), 2000, 0.09));
  const sim = (ms: number) =>
    ms <= 500 ? S.job + 0.001 : ms <= 560 ? S.again + (ms - 500) / 60 : S.back + (ms - 560) / 700;
  for (const e of lateEdges(1400)) if (e > 0) tick(at(sim(e)), F_B, 0.05);
  clack(at(S.job), 0.14);
  buzz(at(S.past), 0.06);
  buzz(at(S.past + 0.3), 0.06);
  tick(at(S.noWait), 2600, 0.06);
  tick(at(S.catchUp), 2800, 0.06);
  blip(at(S.six), 660, 990, 0.06);
  tick(at(S.tell), 2600, 0.06);
  clack(at(S.falseW), 0.12);
  tick(at(S.logw + 0.2), 2200, 0.05);
  tick(at(S.logw + 0.6), 2200, 0.05);
  tick(at(S.warn), 2800, 0.06);
}

// the trap
{
  const S = TRAP;
  const at = (x: number) => abs('trap', x);
  Object.values(S.views).forEach((v) => tick(at(v), 2000, 0.09));
  thump(at(S.mistake), 0.18);
  clack(at(S.inside), 0.14);
  // the moved view's trace runs at 500 ms of trace per second
  for (const e of delayEdges(1600)) if (e > 0) tick(at(S.every + e / 500), F_B, 0.03);
  tick(at(S.after), 2600, 0.06);
  buzz(at(S.drifts), 0.08);
  clack(at(S.fix), 0.12);
  blip(at(S.once), 660, 990, 0.07);
}

// payoff
thump(abs('payoff', PAYOFF.word), 0.45);
PAYOFF.recap.forEach((r, i) => tick(abs('payoff', r.at), 1600 + 200 * i, 0.08));

// ── 3. music ───────────────────────────────────────────────────────────────

console.log('── music ──');
const music = new Float32Array(N);
const MUSIC_CUT = abs('payoff', 0) - 0.15;
{
  pad(music, [130.81, 164.81, 220.0], 0, MUSIC_CUT, 1, 3, 0.08);
  pad(music, [110.0, 164.81, 220.0, 277.18], abs('payoff', PAYOFF.word), SECONDS, 1.15, 0.35, 2.5);
  biquad(music, 'lp', 1400, 0.6);
  level(music, -30, 3, 6);
  for (let i = 0; i < N; i++) music[i] *= 1 - 0.6 * talking[i];
}

// ── 4. mix ─────────────────────────────────────────────────────────────────

const out = join(PUBLIC, 'mix.wav');
master({ vo, sfx: sfxBuf, music }, T, { stems: STEMS, out });
console.log(`\n✓ ${out}  (${SECONDS.toFixed(1)}s, scenes: ${SCENES.map((s) => `${s.id} ${s.dur}`).join(' · ')})`);
console.log(`  stems → ${STEMS}`);
