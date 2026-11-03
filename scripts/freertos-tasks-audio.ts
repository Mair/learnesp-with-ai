/**
 * Build the FreeRTOS-tasks video's soundtrack from the same timeline as the picture.
 *
 *   npm run freertos-tasks:audio
 *
 * Layers (everything except the VO is synthesised, scripts/lib/audio.ts):
 *
 *   VO      scratch edge-tts, one clip per line, fit-checked
 *   SFX     the Explainer grammar (ticks / thumps / clacks / buzzes / blips);
 *           every LED toggle in the real-time panels as a soft tick (GPIO 2
 *           high, GPIO 19 low), so the two rhythms can be heard: tangled in
 *           one loop, independent as two tasks; the 20 scheduler ticks of a
 *           200 ms delay counted out
 *   MUSIC   the house pad, ducked under VO, a gated pulse under the IDF
 *           descent, cut before the payoff, resolving to A major
 *
 * No sustained tones: nothing here is about pitch (SOUND.md).
 * Output: public/freertos-tasks/mix.wav (−16 LUFS, −1.5 dBTP) + stems in out/freertos-tasks-stems/.
 */
import { join } from 'node:path';
import { biquad, level, master, pad, ROOT, S, sfx, smooth, SR, talkingEnvelope, track, voiceover } from './lib/audio.ts';
import {
  ANSWER,
  CREATE,
  DELAY,
  DEMO,
  FAST,
  FN,
  IDF,
  LOOP_PERIOD,
  PARAMS,
  PAYOFF,
  PROBLEM,
  SCENES,
  type SceneId,
  sceneDur,
  sceneStart,
  SECONDS,
  SLOW,
  VO,
  VOICE,
} from '../src/scenes/freertos-tasks/timeline.ts';

const PUBLIC = join(ROOT, 'public/freertos-tasks');
const STEMS = join(ROOT, 'out/freertos-tasks-stems');
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

const F_FAST = 3400; // GPIO 2's toggles
const F_SLOW = 2100; // GPIO 19's toggles
const LED_AMP = 0.022;

/** a soft tick on every toggle of an LED switching every `ms`, from a0 (its phase origin) over [t0, t1) — absolute seconds */
function toggles(a0: number, t0: number, t1: number, ms: number, f: number) {
  for (let k = 0; ; k++) {
    const t = a0 + (k * ms) / 1000;
    if (t >= t1) break;
    if (t >= t0) tick(t, f, LED_AMP);
  }
}
const views = (scene: SceneId, v: Record<string, number>) => Object.values(v).forEach((x) => tick(abs(scene, x), 2000, 0.09));

// problem: the wanted rhythms, then the one loop's lopsided ones
{
  const P = PROBLEM;
  const at = (x: number) => abs('problem', x);
  toggles(at(P.leds), at(P.leds), at(P.loop), FAST.ms, F_FAST);
  toggles(at(P.leds), at(P.leds), at(P.loop), SLOW.ms, F_SLOW);
  // one loop: GPIO 2 on at 0, off at 200; GPIO 19 on at 400, off at 900; every 1400 ms
  for (let c = at(P.loop); c < at(sceneDur('problem') - 0.3); c += LOOP_PERIOD / 1000) {
    for (const [u, f] of [
      [0, F_FAST],
      [FAST.ms, F_FAST],
      [2 * FAST.ms, F_SLOW],
      [2 * FAST.ms + SLOW.ms, F_SLOW],
    ] as const)
      if (c + u / 1000 < at(sceneDur('problem') - 0.3)) tick(c + u / 1000, f, LED_AMP);
  }
  tick(at(P.loop), 2000, 0.09);
  buzz(at(P.holds), 0.06);
  P.sum.forEach((s, i) => tick(at(s), 2600 + 200 * i, 0.06));
  thump(at(P.total), 0.18);
  buzz(at(P.both), 0.08);
  tick(at(P.hand), 2400, 0.06);
  blip(at(P.already), 660, 990, 0.05);
}

// answer: own loops, the scheduler, app_main is already a task, the word
{
  const A = ANSWER;
  const at = (x: number) => abs('answer', x);
  tick(at(A.own), 2600, 0.07);
  tick(at(A.becomes), 2800, 0.07);
  thump(at(A.sched), 0.18);
  tick(at(A.waits), 2400, 0.06);
  tick(at(A.runs), 3100, 0.06);
  thump(at(A.rtos), 0.16);
  tick(at(A.before), 2600, 0.06);
  clack(at(A.main), 0.14);
  tick(at(A.called), 3100, 0.05);
  tick(at(A.stack), 2600, 0.06);
  tick(at(A.scheduler), 2800, 0.06);
  thump(at(A.word), 0.3);
}

// the task function
{
  const F = FN;
  const at = (x: number) => abs('fn', x);
  views('fn', F.views);
  tick(at(F.sig.fn), 2600, 0.07);
  tick(at(F.sig.voidp), 2800, 0.06);
  tick(at(F.sig.nothing), 3100, 0.05);
  tick(at(F.body.setup), 2600, 0.06);
  thump(at(F.body.loops), 0.14);
  for (const x of [F.body.on, F.body.off]) clack(at(x), 0.08);
  for (const x of [F.body.wait1, F.body.wait2]) tick(at(x), 2200, 0.05);
  blip(at(F.body.same), 660, 990, 0.05);
  thump(at(F.never.never), 0.18);
  tick(at(F.never.does), 2600, 0.06);
  buzz(at(F.never.logs), 0.06);
  buzz(at(F.never.aborts), 0.09);
  tick(at(F.del.purpose), 2400, 0.06);
  clack(at(F.del.deletes), 0.12);
  tick(at(F.del.vtd), 2800, 0.06);
}

// xTaskCreate ①: function, name, stack
{
  const X = CREATE;
  const at = (x: number) => abs('create', x);
  tick(at(X.run));
  thump(at(X.run), 0.22);
  for (let k = 0; k < 6; k++) tick(at(X.six + 0.08 * k), 2600 + 120 * k, 0.04);
  X.args.forEach((a, i) => tick(at(a), 2600 + 220 * i, 0.08));
  views('create', X.views);
  tick(at(X.fn.brackets), 3100, 0.05);
  clack(at(X.fn.handing), 0.12);
  buzz(at(X.fn.calling), 0.05);
  tick(at(X.name.debug), 2600, 0.06);
  tick(at(X.name.fifteen), 2800, 0.06);
  clack(at(X.name.cut), 0.12);
  tick(at(X.name.example), 2600, 0.05);
  buzz(at(X.name.loses), 0.05);
  thump(at(X.bytes.n), 0.14);
  blip(at(X.bytes.bytes), 660, 990, 0.05);
  tick(at(X.bytes.vanilla), 2400, 0.06);
  tick(at(X.bytes.words), 2800, 0.06);
  thump(at(X.bytes.four), 0.14);
  for (const x of [X.holds.locals, X.holds.calls, X.holds.regs]) tick(at(x), 2800, 0.06);
  clack(at(X.holds.heap), 0.12);
  tick(at(X.scale.main), 2600, 0.06);
  thump(at(X.scale.k4), 0.14);
  tick(at(X.scale.idle), 2400, 0.06);
  // too small: the stack grows call by call, then the canary goes
  for (let k = 0; k < 5; k++) tick(at(X.overflow.small + 0.48 * (k + 1)), 2400 + 180 * k, 0.05);
  tick(at(X.overflow.check), 2600, 0.06);
  buzz(at(X.overflow.catches), 0.1);
  tick(at(X.overflow.prints), 3100, 0.06);
  thump(at(X.overflow.restarts), 0.2);
}

// xTaskCreate ②: parameter, priority, handle, return value
{
  const X = PARAMS;
  const at = (x: number) => abs('params', x);
  X.args.slice(3).forEach((a, i) => tick(at(a), 3260 + 220 * i, 0.08));
  views('params', X.views);
  tick(at(X.arg.pointer), 2600, 0.06);
  clack(at(X.arg.arrives), 0.12);
  tick(at(X.arg.asArg), 3100, 0.05);
  // one function, two tasks: their LEDs (the panel shows them from the view's start)
  toggles(at(X.views.two), at(X.two.two), at(X.views.life - 0.3), FAST.ms, F_FAST);
  toggles(at(X.views.two), at(X.two.two), at(X.views.life - 0.3), SLOW.ms, F_SLOW);
  tick(at(X.two.pin), 2800, 0.06);
  tick(at(X.two.delay), 2600, 0.06);
  tick(at(X.life.valid), 2400, 0.06);
  blip(at(X.life.statik), 660, 990, 0.05);
  tick(at(X.life.local), 2600, 0.06);
  buzz(at(X.life.gone), 0.07);
  for (const x of [X.prio.zero, X.prio.one]) tick(at(x), 2600, 0.06);
  clack(at(22.3), 0.12); // our 5 lands
  tick(at(X.prio.top), 3100, 0.06);
  thump(at(X.preempt.outranks), 0.16);
  clack(at(X.preempt.straight), 0.12);
  tick(at(X.preempt.carries), 2400, 0.06);
  tick(at(X.handle.refer), 2600, 0.06);
  tick(at(X.handle.nul), 2800, 0.05);
  clack(at(X.ret.pdpass), 0.12);
  tick(at(X.ret.one), 2800, 0.06);
  tick(at(X.ret.notErr), 2600, 0.06);
  buzz(at(X.ret.abort), 0.1);
  tick(at(X.ret.heap), 2400, 0.06);
  buzz(at(X.ret.minus), 0.06);
}

// demo: app_main creates both and returns; the two rhythms, independent
{
  const D = DEMO;
  const at = (x: number) => abs('demo', x);
  tick(at(D.flash), 2000, 0.09);
  tick(at(D.flash + 0.2), 3100, 0.05);
  tick(at(D.flash + 0.6), 3100, 0.05);
  clack(at(D.creates), 0.12);
  blip(at(D.returns), 660, 990, 0.05);
  thump(at(D.deleted), 0.14);
  toggles(at(D.blink), at(D.blink), at(sceneDur('demo') - 0.3), FAST.ms, F_FAST);
  toggles(at(D.blink + 0.05), at(D.blink), at(sceneDur('demo') - 0.3), SLOW.ms, F_SLOW);
  tick(at(D.same), 2400, 0.06);
  tick(at(D.stack), 2600, 0.06);
  clack(at(D.b), 0.1);
  blip(at(D.settings), 660, 990, 0.05);
}

// what vTaskDelay does: blocked, the 20 ticks counted, ready, running; idle; two cores
{
  const S_ = DELAY;
  const at = (x: number) => abs('delay', x);
  views('delay', S_.views);
  tick(at(S_.states.off), 2600, 0.06);
  clack(at(S_.states.blocks), 0.14);
  tick(at(S_.states.ticks), 2800, 0.06);
  tick(at(S_.ticks.ten), 2600, 0.06);
  tick(at(S_.ticks.ms200), 2800, 0.06);
  thump(at(S_.ticks.twenty), 0.14);
  const a = S_.ticks.every;
  const b = S_.ticks.after + 0.3;
  for (let k = 1; k <= 20; k++) tick(at(a + (k * (b - a)) / 20), 3600, k === 20 ? 0.07 : 0.035);
  blip(at(S_.ticks.ready), 660, 990, 0.06);
  clack(at(S_.ticks.runs), 0.12);
  tick(at(S_.idle.blocked), 2400, 0.06);
  thump(at(S_.idle.idle), 0.14);
  tick(at(S_.idle.most), 2800, 0.05);
  tick(at(S_.cores.two), 2600, 0.06);
  clack(at(S_.cores.either), 0.12);
  tick(at(S_.cores.own), 2400, 0.05);
}

// under the hood: one layer after another
{
  const at = (x: number) => abs('idf', x);
  IDF.layers.forEach((l, i) => {
    tick(at(l.at), 1800 - 150 * i, 0.12);
    for (const m of l.marks) {
      tick(at(m.at), 3100, 0.05);
      if (m.strong) thump(at(m.at), 0.18);
    }
  });
}

// payoff
tick(abs('payoff', PAYOFF.job), 1800, 0.08);
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
