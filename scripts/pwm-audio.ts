/**
 * Build the PWM video's soundtrack from the same timeline as the picture.
 *
 *   npm run pwm:audio
 *
 * Scene times in the timeline are scene-relative; `abs()` converts.
 * Synthesis, VO, SFX and mastering live in ./lib/audio.ts (shared by every video).
 *
 * Layers (everything except the VO is synthesised — nothing to license):
 *
 *   VO      scratch edge-tts, one clip per line, fit-checked against the next
 *   WISH    problem scene: the smooth pitch glide we *want*
 *   PIN     problem scene: hard on/off clicks, and a buzz when 1.65 V is refused
 *   PWM     the scope signal, sonified with the same duty + phase as the LED.
 *           Edges are clicks when slow. In the answer and under the LEDC
 *           hardware diagram they fuse into a tone (capped at A2, 110 Hz);
 *           wherever an LED is being explained (setup, knob 1) they just fade
 *           out as the blinks fuse — no drone competing with the VO, and the
 *           speaker scene stays the only place PWM is heard as pitch.
 *   TONE    knob 2: the literal square wave ledcWriteTone() would put on the
 *           pin — A4 C5 E5 A5. What you hear is what the pin does.
 *   SFX     ticks as code lines run / cards land, sub thumps on the big
 *           moments
 *   MUSIC   C3·E3·A3 pad over A2 → A minor; ducked under VO and under the
 *           literal tones; cut dead before the
 *           payoff, resolves to A major under "That's PWM."
 *
 *   TIMER   (ledc_timer_config) 5 Hz clicks under the blinking LED; one literal
 *           second of 1 kHz on "1000 Hz"; the counter as a rising glide; a buzz
 *           when 17 bits doesn't fit, and on ESP_FAIL.
 *   CHANNEL (ledc_channel_config) the duty trace's edges as clicks.
 *   WRITE   (ledc_set_duty) the "nope" buzz on "not a voltage"; the duty trace's
 *           edges as clicks, following the written value; a clack on "go".
 *   TONE    the speaker's square wave from the moment duty 512 is written —
 *           ducked under the narration, full once the notes play.
 *
 * Output: public/pwm/mix.wav (−16 LUFS, −1.5 dBTP) + stems in out/3-advanced-gpio/pwm-stems/.
 */
import { join } from 'node:path';
import {
  biquad,
  clamp01,
  level,
  master,
  pad,
  pulse,
  pwmGain,
  ROOT,
  S,
  sfx,
  smooth,
  SR,
  talkingEnvelope,
  TONE_HZ,
  track,
  voiceover,
} from './lib/audio.ts';
import { apparentHz, dutyAt, fusion, hzAt, type Beat } from '../src/components/pwm.ts';
import {
  ANSWER,
  CHANNEL,
  CONTEXT,
  DUTY,
  PAYOFF,
  PROBLEM,
  PWM_HZ,
  SCENES,
  FADE,
  FADE_STEPS,
  TIMER,
  timerCounter,
  WRITE,
  writeOn,
  type SceneId,
  sceneDur,
  sceneStart,
  SECONDS,
  TONE,
  VO,
  VOICE,
} from '../src/scenes/pwm/timeline.ts';

const PUBLIC = join(ROOT, 'public/pwm');
const STEMS = join(ROOT, 'out/3-advanced-gpio/pwm-stems');
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

// ── 2. problem: the wish, and the pin ─────────────────────────────────────

console.log('── problem ──');
const wish = new Float32Array(N);
{
  const P = PROBLEM;
  const t0 = abs('problem', P.pitch[0] - 0.2);
  const t1 = abs('problem', P.pitch[1] + 0.5);
  let ph = 0;
  for (let i = S(t0); i < S(t1); i++) {
    const t = i / SR - sceneStart('problem');
    const glide = smooth((t - P.pitch[0]) / (P.pitch[1] - P.pitch[0]));
    const f = P.pitchHz[0] * (P.pitchHz[1] / P.pitchHz[0]) ** glide;
    // same envelope as the speaker rings on screen
    const env = clamp01((t - (P.pitch[0] - 0.2)) / 0.2) * (1 - clamp01((t - (P.pitch[1] + 0.2)) / 0.3));
    ph += (2 * Math.PI * f) / SR;
    wish[i] = env * (Math.sin(ph) + 0.25 * Math.sin(2 * ph) + 0.08 * Math.sin(3 * ph));
  }
  level(wish, -27, abs('problem', P.pitch[0] + 0.3), abs('problem', P.pitch[1]));
}

// ── 3. PWM sonification (answer, knob 1) ───────────────────────────────────

console.log('── pwm sonification ──');
const pwm = new Float32Array(N);
{
  const aS = sceneStart('answer');
  const dS = sceneStart('duty');
  const dE = dS + sceneDur('duty');
  const sS = sceneStart('timer');
  const flickA = sS + TIMER.views.flicker;
  const flickFast = sS + TIMER.flicker.fast;
  const cS = sceneStart('channel');
  const traceA = cS + CHANNEL.duty.trace;
  const traceB = traceA + 3 * CHANNEL.duty.period;
  const traceDuty = CHANNEL.duty.value / 256;
  const wS = sceneStart('write');
  const wOn = wS + WRITE.duty.on;
  const wEnd = wS + WRITE.views.range - 0.35;

  pulse(pwm, (t) => {
    // timer · flicker: 5 Hz clicks, phase-locked to the blinking LED, until "fast enough"
    if (t >= flickA && t < flickFast) {
      return { f: TIMER.flicker.slowHz, duty: 0.5, g: pwmGain(0.5) * 0.8 * smooth((flickFast - t) / 0.3) };
    }
    // write · duty: the looping trace, edge for edge, following the written value
    if (t >= wOn && t < wEnd) {
      const duty = writeOn(t - wS);
      return { f: 1 / WRITE.duty.period, duty, g: pwmGain(duty) * 0.8 * smooth((wEnd - t) / 0.3) };
    }
    // channel · duty: the traced output, edge for edge
    if (t >= traceA && t < traceB) {
      return { f: 1 / CHANNEL.duty.period, duty: traceDuty, g: pwmGain(traceDuty) * 0.8 };
    }
    // answer: "on and off … really fast" — clicks accelerate into a tone
    if (t >= aS + ANSWER.wave && t < aS + ANSWER.letters[0] + 0.8) {
      const u = t - aS;
      const speed = clamp01((u - ANSWER.fast) / (ANSWER.fastEnd - ANSWER.fast));
      const f = 2.5 * (TONE_HZ / 2.5) ** (speed * speed);
      const fade = 1 - clamp01((u - ANSWER.letters[0]) / 0.8);
      return { f, duty: 0.5, g: pwmGain(0.5) * fade };
    }
    // knob 1: phase-locked to the slow-mo LED — clicks only, gone once they fuse
    if (t >= dS && t < dE) {
      const u = t - dS;
      const duty = dutyAt(DUTY.beats, u);
      const fd = apparentHz(PWM_HZ, DUTY.timescale, u);
      const g = pwmGain(duty) * (1 - fusion(fd));
      if (g < 1e-4) return null;
      return { f: Math.min(fd, TONE_HZ), duty, g };
    }
    return null;
  });
  biquad(pwm, 'hp', 30);
  biquad(pwm, 'lp', 2200, 0.6);
  // reference: knob 1, steady glow at 50%
  const ref = dS + DUTY.beats[0].at + 1.1; // duty 128, steady 50% in slow-mo
  level(pwm, -26, ref, ref + 1.8);
  for (let i = 0; i < N; i++) pwm[i] *= 1 - 0.3 * talking[i];
}

// ── 4. knob 2: the literal tone ───────────────────────────────────────────

console.log('── tone ──');
const tone = new Float32Array(N);
{
  const tS = sceneStart('tone');
  const tE = tS + sceneDur('tone');
  const beats: Beat[] = TONE.beats;
  pulse(tone, (t) => {
    if (t < tS || t >= tE) return null;
    const u = t - tS;
    const duty = dutyAt(beats, u);
    if (duty <= 0) return null;
    // ducked under the narration until the notes play; gentle edges so it doesn't pop
    const duck = u < TONE.notes ? 0.16 : 0.16 + 0.84 * smooth((u - TONE.notes) / 0.3);
    return { f: hzAt(beats, u, 440), duty: 0.5, g: clamp01(duty / 0.5) * duck };
  });
  biquad(tone, 'hp', 60);
  biquad(tone, 'lp', 3800, 0.6);
  level(tone, -27, tS + TONE.notes + 0.35, tS + beats[beats.length - 1].at - 0.05);
}

// ── 5. SFX ─────────────────────────────────────────────────────────────────

console.log('── sfx ──');
const { buf: sfxBuf, tick, thump, clack, buzz, blip } = sfx(T);

// problem
tick(abs('problem', PROBLEM.cardsIn), 2000, 0.1);
clack(abs('problem', PROBLEM.pinIn + 0.1), 0.12);
clack(abs('problem', PROBLEM.high), 0.22);
clack(abs('problem', PROBLEM.low), 0.22);
tick(abs('problem', PROBLEM.tryMid), 1700, 0.1);
buzz(abs('problem', PROBLEM.reject), 0.09);
// answer
ANSWER.letters.forEach((l, i) => tick(abs('answer', l), 1800 + 300 * i, 0.15));
thump(abs('answer', ANSWER.letters[2]), 0.3);
// setup: the whole program
{
  const X = CONTEXT;
  const at = (x: number) => abs('setup', x);
  Object.values(X.views).forEach((v) => tick(at(v), 2000, 0.09));
  thump(at(X.ledc), 0.2);
  for (const x of [X.two, X.fast, X.fine, X.connects, X.pin, X.lines]) tick(at(x), 3100, 0.05);
  clack(at(X.amp), 0.14);
  tick(at(X.bright), 2350, 0.1);
}

// timer: the call, its fields, each view and the beats inside it
{
  const U = TIMER;
  const at = (x: number) => abs('timer', x);
  tick(at(U.run));
  thump(at(U.run), 0.25);
  U.args.forEach((a, i) => tick(at(a.at), 2600 + 200 * i, 0.08));
  Object.values(U.views).forEach((v) => tick(at(v), 2000, 0.09));
  tick(at(U.speed.low), 3100, 0.05);
  blip(at(U.speed.same), 660, 990, 0.05);
  clack(at(U.timers.zero), 0.12);
  for (const x of [U.freq.cycle, U.freq.ms]) tick(at(x), 3100, 0.05);
  thump(at(U.freq.period), 0.18);
  tick(at(U.flicker.same), 3100, 0.05);
  blip(at(U.flicker.fast), 660, 990, 0.06);
  for (const x of [U.counter.eight, U.counter.appear, U.counter.tiny]) tick(at(x), 3100, 0.05);
  tick(at(U.counter.pow), 1800, 0.1);
  thump(at(U.counter.steps), 0.22);
  for (const x of [U.clock.steps, U.clock.perSec, U.clock.auto]) tick(at(x), 2400, 0.07);
  thump(at(U.clock.ticks), 0.2);
  tick(at(U.clock.clock), 1400, 0.1);
  U.clock.rows.forEach((r) => tick(at(r.at), 2800, 0.06));
  buzz(at(U.clock.out), 0.08);
  tick(at(U.log.logs), 1700, 0.08);
  buzz(at(U.log.fail), 0.08);
  thump(at(U.check.stops), 0.22);
  blip(at(U.check.fix), 660, 990, 0.07);

  // the timer's counter, heard: a soft glide up each period, A3 → A5
  const c0 = at(U.counter.sweep[0]);
  const c1 = at(U.views.bits) - 0.35;
  let ph = 0;
  for (let i = S(c0); i < S(c1); i++) {
    const c = timerCounter(i / SR - sceneStart('timer'));
    if (!c.live) continue;
    const env = Math.min(1, (c1 - i / SR) / 0.3);
    ph += (2 * Math.PI * 220 * 4 ** c.u) / SR;
    sfxBuf[i] += 0.05 * env * (Math.sin(ph) + 0.3 * Math.sin(2 * ph));
  }
}

// channel
{
  const H = CHANNEL;
  const at = (x: number) => abs('channel', x);
  tick(at(H.run));
  thump(at(H.run), 0.25);
  H.args.forEach((a, i) => tick(at(a.at), 2600 + 150 * i, 0.08));
  Object.values(H.views).forEach((v) => tick(at(v), 2000, 0.09));
  clack(at(H.channels.zero), 0.12);
  tick(at(H.timersel.picks), 3100, 0.05);
  tick(at(H.timersel.several), 3100, 0.05);
  clack(at(H.pin.driver), 0.14);
  buzz(at(H.pin.call), 0.05);
  clack(at(H.duty.line), 0.14);
  for (const x of [H.duty.on, H.duty.passes]) tick(at(x), 3100, 0.05);
  tick(at(H.hpoint.zero), 3100, 0.05);
  blip(at(H.start.returns), 660, 990, 0.06);
}

// write
{
  const W = WRITE;
  const at = (x: number) => abs('write', x);
  tick(at(W.run));
  thump(at(W.run), 0.25);
  W.args.forEach((a, i) => tick(at(a.at), 2600 + 250 * i, 0.08));
  Object.values(W.views).forEach((v) => tick(at(v), 2000, 0.09));
  buzz(at(W.what.notVolt), 0.07);
  blip(at(W.what.howLong), 660, 990, 0.06);
  clack(at(W.duty.line), 0.14);
  for (const x of [W.duty.stepsOn, W.duty.stepsOff]) tick(at(x), 3100, 0.05);
  thump(at(W.duty.half), 0.2);
  W.duty.keys.slice(1).forEach((k) => tick(at(k.at), 2350, 0.12));
  for (const x of [W.range.r8, W.range.r10]) tick(at(x), 2800, 0.06);
  thump(at(W.range.half), 0.2);
  tick(at(W.load.nothing), 1700, 0.08);
  clack(at(W.go.go), 0.2);
  blip(at(W.free.hardware), 660, 990, 0.06);
}

// fade: three calls, their arguments, and the beats of each view
{
  const at = (x: number) => abs('fade', x);
  FADE.calls.forEach((c) => {
    tick(at(c.run));
    thump(at(c.run), 0.22);
    c.args.forEach((a, i) => tick(at(a.at), 2600 + 200 * i, 0.08));
  });
  tick(at(FADE.noWait), 2350, 0.1);
  Object.values(FADE.views).forEach((v) => tick(at(v), 2000, 0.09));
  buzz(at(FADE.forget.fail), 0.08);
  tick(at(FADE.from.none), 1700, 0.08);
  tick(at(FADE.ramp.sweep), 2350, 0.1);
  for (const x of [FADE.ramp.onOff, FADE.ramp.start, FADE.ramp.end]) tick(at(x), 3100, 0.05);
  tick(at(FADE.stairs.whole), 3100, 0.05);
  thump(at(FADE.stairs.stairs), 0.2);
  for (const x of [FADE.stairs.time, FADE.stairs.periods, FADE.stairs.steps, FADE.stairs.drop]) tick(at(x), 2400, 0.07);
  thump(at(FADE.stairs.every), 0.18);
  FADE.engine.rows.forEach((x) => tick(at(x), 2800, 0.06));
  clack(at(FADE.start.go), 0.18);
  // the hardware stepping: a faint tick every 10 duty steps while your task waits
  const [r0, r1] = FADE.start.run;
  for (let k = 10; k <= FADE_STEPS; k += 10) tick(at(r0 + ((r1 - r0) * k) / FADE_STEPS), 4200, 0.025);
  blip(at(r1), 660, 990, 0.08);
  tick(at(FADE.nowait.returns), 3100, 0.05);
}

// knob 1 / knob 2: a tick each time a line executes
DUTY.beats.forEach((b) => tick(abs('duty', b.at)));
thump(abs('duty', DUTY.beats[0].at), 0.3);
TONE.beats.forEach((b) => tick(abs('tone', b.at), 2350, 0.09));
// marks: a soft tick as each token gets pointed at; a thump on the big ones
for (const b of [...DUTY.beats]) for (const m of b.marks ?? []) tick(abs('duty', m.at), 3100, 0.05);
for (const b of [...TONE.beats]) for (const m of b.marks ?? []) if (b.duty === 0) tick(abs('tone', m.at), 3100, 0.05);
// payoff
thump(abs('payoff', PAYOFF.line), 0.45);
PAYOFF.recap.forEach((r, i) => tick(abs('payoff', r.at), 1600 + 200 * i, 0.08));

// ── 6. music ───────────────────────────────────────────────────────────────

console.log('── music ──');
const music = new Float32Array(N);
const MUSIC_CUT = abs('payoff', 0) - 0.15;
{
  pad(music, [130.81, 164.81, 220.0], 0, MUSIC_CUT, 1, 3, 0.08);
  // payoff: resolve to A major
  pad(music, [110.0, 164.81, 220.0, 277.18], abs('payoff', PAYOFF.line), SECONDS, 1.15, 0.35, 2.5);
  biquad(music, 'lp', 1400, 0.6);
  level(music, -30, 3, 6);

  // duck: under VO (≈ −8 dB) and almost out under the literal tones
  const tS = sceneStart('tone');
  const tonesOn = [tS + TONE.notes - 0.3, tS + TONE.beats[TONE.beats.length - 1].at + 0.3];
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const toneDuck = smooth((t - tonesOn[0]) / 0.3) * (1 - smooth((t - tonesOn[1]) / 0.6));
    music[i] *= (1 - 0.6 * talking[i]) * (1 - 0.85 * toneDuck);
  }
}

// ── 7. mix ─────────────────────────────────────────────────────────────────

const out = join(PUBLIC, 'mix.wav');
master({ vo, wish, pwm, tone, sfx: sfxBuf, music }, T, { stems: STEMS, out });
console.log(`\n✓ ${out}  (${SECONDS}s, scenes: ${SCENES.map((s) => `${s.id} ${s.dur}`).join(' · ')})`);
console.log(`  stems → ${STEMS}`);
