/**
 * Build the FreeRTOS stacks & watchdog video's soundtrack from the same timeline as the picture.
 *
 *   npm run freertos-stacks-watchdog:audio
 *
 * Layers (everything except the VO is synthesised, scripts/lib/audio.ts):
 *
 *   VO      scratch edge-tts, one clip per line, fit-checked
 *   SFX     the Explainer grammar (ticks / thumps / clacks / buzzes / blips); log lines as
 *           soft ticks; in the real-time "caught" scene every LED switch as a soft tick
 *           (GPIO 2 high, GPIO 19 low) and each watchdog error as a buzz, on the log's clock
 *   MUSIC   the house pad, ducked under VO, cut before the payoff, resolving to A major
 *
 * No sustained tones: nothing here is about pitch (SOUND.md).
 * Output: public/freertos-stacks-watchdog/mix.wav (−16 LUFS, −1.5 dBTP) + stems in
 * out/2-freertos/freertos-stacks-watchdog-stems/.
 */
import { join } from 'node:path';
import { biquad, level, master, pad, ROOT, sfx, talkingEnvelope, track, voiceover } from './lib/audio.ts';
import {
  CAUGHT,
  CONFIG,
  DEMO,
  MARK,
  MEASURE,
  MISTAKE,
  PAYOFF,
  PRESS_MS,
  PROBLEM,
  SCENES,
  type SceneId,
  sceneDur,
  sceneStart,
  SECONDS,
  SIZE,
  STUCK,
  TIMEOUT_S,
  TRAP,
  TRAP_ERRORS_S,
  VO,
  VOICE,
  WATCH,
} from '../src/scenes/freertos-stacks-watchdog/timeline.ts';

const PUBLIC = join(ROOT, 'public/freertos-stacks-watchdog');
const STEMS = join(ROOT, 'out/2-freertos/freertos-stacks-watchdog-stems');
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
const F_FAST = 3400;
const F_SLOW = 2100;
const LED_AMP = 0.022;

// 1 · problem
{
  const P = PROBLEM;
  const at = (x: number) => abs('problem', x);
  clack(at(P.cols), 0.1);
  clack(at(P.cols + 0.15), 0.1);
  tick(at(P.bytes), 2600, 0.07);
  tick(at(P.small), 2400, 0.06);
  buzz(at(P.overflow), 0.09);
  tick(at(P.restarts), 2000, 0.07);
  tick(at(P.big), 2400, 0.06);
  tick(at(P.aside), 3100, 0.05);
  thump(at(P.q), 0.18);
  blip(at(P.measure), 660, 990, 0.06);
}

// 2 · the high water mark: a soft tick as each call takes stack
{
  const M = MARK;
  const at = (x: number) => abs('mark', x);
  tick(at(M.col), 2000, 0.09);
  for (const c of M.calls) if (c.t < sceneDur('mark') - 0.5) tick(at(c.t), c.name === 'ESP_LOGI' ? 2800 : 2300, 0.035);
  clack(at(M.mark), 0.14);
  thump(at(M.hero), 0.3);
  tick(at(M.never), 3100, 0.06);
  blip(at(M.ask), 660, 990, 0.05);
}

// 3 · uxTaskGetStackHighWaterMark
{
  const S = MEASURE;
  const at = (x: number) => abs('measure', x);
  tick(at(S.intro.show), 2000, 0.09);
  clack(at(S.intro.insert + 0.4), 0.12);
  tick(at(S.intro.insert + 0.6), 3100, 0.06);
  thump(at(S.run), 0.22);
  S.args.forEach((a, i) => tick(at(a), 2600 + 250 * i, 0.08));
  Object.values(S.views).forEach((v) => tick(at(v), 2000, 0.09));
  tick(at(S.pc), 2700, 0.06);
  clack(at(S.smallest), 0.1);
  tick(at(S.n2048), 2600, 0.06);
  tick(at(S.bytes), 2900, 0.06);
  tick(at(S.zero), 2400, 0.06);
  tick(at(S.room), 2800, 0.06);
}

// 4 · demo: each log line a soft tick
{
  const D = DEMO;
  const at = (x: number) => abs('demo', x);
  thump(at(D.flash), 0.18);
  D.lineAt.forEach((x, i) => tick(at(x), i === 0 ? 2600 : 2200, i === 0 ? 0.07 : 0.035));
  clack(at(D.lineAt[1] + 0.3), 0.12);
  tick(at(D.before), 3100, 0.06);
  thump(at(D.log), 0.16);
  blip(at(D.never), 660, 990, 0.05);
}

// 5 · size it
{
  const S = SIZE;
  const at = (x: number) => abs('size', x);
  tick(at(S.chain + 0.6), 2400, 0.07);
  tick(at(S.minus + 0.3), 2600, 0.07);
  clack(at(S.used), 0.12);
  tick(at(S.advice), 2000, 0.09);
  tick(at(S.margin), 3100, 0.05);
  clack(at(S.n1536), 0.12);
  tick(at(S.n1536 + 0.4), 2200, 0.035);
  tick(at(S.n1536 + 0.9), 2200, 0.035);
  blip(at(S.spare), 660, 990, 0.05);
  thump(at(S.back), 0.14);
}

// 6 · the stack trap
{
  const S = TRAP;
  const at = (x: number) => abs('trap', x);
  tick(at(S.now), 2000, 0.09);
  tick(at(S.minus), 2400, 0.06);
  tick(at(S.plus), 2700, 0.06);
  clack(at(S.n768), 0.14);
  thump(at(S.flash), 0.16);
  tick(at(S.line272), 2600, 0.06);
  tick(at(S.fine), 3100, 0.05);
  buzz(at(S.overflow - 0.2), 0.1);
  tick(at(S.restarts - 0.3), 2000, 0.06);
  buzz(at(S.counts), 0.07);
  blip(at(S.fix), 660, 990, 0.06);
}

// 7 · a stuck task
{
  const S = STUCK;
  const at = (x: number) => abs('stuck', x);
  tick(at(S.scheduler), 2000, 0.09);
  blip(at(S.caught), 660, 990, 0.05);
  buzz(at(S.still), 0.06);
  clack(at(S.code), 0.12);
  tick(at(S.waits), 3100, 0.05);
  clack(at(S.jam), 0.16);
  tick(at(S.delay), 2800, 0.06);
  tick(at(S.nothing), 2400, 0.06);
}

// 8 · esp_task_wdt_add / esp_task_wdt_reset
{
  const S = WATCH;
  const at = (x: number) => abs('watch', x);
  Object.values(S.views).forEach((v) => tick(at(v), 2000, 0.09));
  clack(at(S.add), 0.14);
  thump(at(S.add + 0.6), 0.14);
  tick(at(S.check), 2700, 0.06);
  blip(at(S.check + 0.2), 660, 990, 0.05);
  buzz(at(S.opposite + 0.3), 0.06);
  tick(at(S.every5), 2600, 0.06);
  clack(at(S.reset), 0.14);
  // the check-ins, drawn ~3× a second
  for (let x = S.top; x < S.include - 0.4; x += 1 / 3) tick(at(x), 3200, 0.025);
  clack(at(S.include), 0.1);
}

// 9 · caught: real time, on the log's clock
{
  const S = CAUGHT;
  const at = (x: number) => abs('caught', x);
  const tOf = (ms: number) => S.press + (ms - PRESS_MS) / 1000;
  const end = sceneDur('caught') - 0.3;
  thump(at(S.flash), 0.16);
  // LED switches: the blink tasks start with app_main (1573 ms in the log)
  const t0 = tOf(1576);
  for (let k = 0; ; k++) {
    const x = t0 + k * 0.2;
    if (x > end) break;
    if (x >= S.flash) tick(at(x), F_FAST, LED_AMP);
  }
  for (let k = 0; ; k++) {
    const x = t0 + k * 0.5;
    if (x > end) break;
    if (x >= S.flash) tick(at(x), F_SLOW, LED_AMP);
  }
  clack(at(S.press - 0.3), 0.16);
  for (let k = 1; S.press + k * TIMEOUT_S < end; k++) {
    buzz(at(S.press + k * TIMEOUT_S), 0.09);
    tick(at(S.press + k * TIMEOUT_S + 0.05), 3100, 0.05);
  }
  tick(at(S.names), 3100, 0.05);
  blip(at(S.leds), 660, 990, 0.05);
}

// 10 · menuconfig
{
  const S = CONFIG;
  const at = (x: number) => abs('config', x);
  tick(at(S.menu), 2000, 0.09);
  tick(at(S.timeout), 2600, 0.07);
  tick(at(S.range), 2800, 0.06);
  tick(at(S.prints), 2400, 0.06);
  clack(at(S.panic + 0.5), 0.14);
  buzz(at(S.restarts - 0.6), 0.07);
  tick(at(S.restarts + 0.1), 2000, 0.06);
}

// 11 · the mistake: the lane's errors as buzzes as the playhead passes them
{
  const S = MISTAKE;
  const at = (x: number) => abs('mistake', x);
  tick(at(S.now), 2000, 0.09);
  clack(at(S.ten), 0.14);
  const [a, b] = S.sweep;
  for (const e of TRAP_ERRORS_S) buzz(at(a + (e / 30) * (b - a)), 0.07);
  blip(at(S.fix), 660, 990, 0.06);
  clack(at(S.fix + 0.1), 0.1);
  tick(at(S.main), 3100, 0.05);
  buzz(at(S.release), 0.06);
}

// 12 · payoff
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
