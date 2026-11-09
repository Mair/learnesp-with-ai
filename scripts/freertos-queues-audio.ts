/**
 * Build the FreeRTOS queues video's soundtrack from the same timeline as the picture.
 *
 *   npm run freertos-queues:audio
 *
 * Layers (everything except the VO is synthesised, scripts/lib/audio.ts):
 *
 *   VO      scratch edge-tts, one clip per line, fit-checked
 *   SFX     the Explainer grammar (ticks / thumps / clacks / buzzes / blips); in the two
 *           real-time scenes every button press is a clack, every item into / out of the
 *           queue a soft tick, every LED switch a softer tick and every dropped press a
 *           buzz, all on the lab run's clock
 *   MUSIC   the house pad, ducked under VO, cut before the payoff, resolving to A major
 *
 * No sustained tones: nothing here is about pitch (SOUND.md).
 * Output: public/freertos-queues/mix.wav (−16 LUFS, −1.5 dBTP) + stems in
 * out/2-freertos/freertos-queues-stems/.
 */
import { join } from 'node:path';
import { biquad, level, master, pad, ROOT, sfx, talkingEnvelope, track, voiceover } from './lib/audio.ts';
import {
  BLINK_MS,
  CREATE,
  FLAG,
  FULL,
  PAYOFF,
  QUEUE,
  RECV,
  RUN_BURST,
  RUN_DEMO,
  RUN_FLAG,
  type Run,
  SCENES,
  type SceneId,
  sceneDur,
  sceneStart,
  SECONDS,
  SEND,
  TASKS,
  TRAP,
  VO,
  VOICE,
  WANT,
} from '../src/scenes/freertos-queues/timeline.ts';

const PUBLIC = join(ROOT, 'public/freertos-queues');
const STEMS = join(ROOT, 'out/2-freertos/freertos-queues-stems');
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
const LED_AMP = 0.02;

/** a lab run, on the scene's clock: presses, items, LED switches, drops */
const live = (scene: SceneId, run: Run, tOf: (m: number) => number) => {
  const at = (x: number) => abs(scene, x);
  const end = sceneDur(scene) - 0.2;
  run.presses.forEach((m, i) => {
    const x = tOf(m);
    if (x > end) return;
    if (run.dropped.includes(i + 1)) buzz(at(x), 0.08);
    else {
      clack(at(x), 0.09);
      tick(at(x + 0.05), 2600, 0.04);
    }
  });
  for (const ms of Object.values(run.recv)) {
    const r = tOf(ms);
    for (let k = 0; k < 6; k++) {
      const x = r + (k * BLINK_MS) / 1000;
      if (x < end) tick(at(x), k % 2 ? 2100 : 3000, LED_AMP);
    }
  }
};

/** three blinks from scene time r: a soft tick on every LED switch */
const blinkTicks = (scene: SceneId, r: number, end = sceneDur(scene) - 0.2) => {
  for (let k = 0; k < 6; k++) {
    const x = r + (k * BLINK_MS) / 1000;
    if (x < end) tick(abs(scene, x), k % 2 ? 2100 : 3000, LED_AMP);
  }
};

// 1 · want: the press and its blinks, the missed press, the split, the question
{
  const S = WANT;
  const at = (x: number) => abs('want', x);
  tick(at(S.button - 0.2), 2000, 0.07);
  clack(at(S.press), 0.11);
  blinkTicks('want', S.press + 0.1);
  tick(at(S.math), 2400, 0.06);
  tick(at(S.loop), 2000, 0.07);
  blinkTicks('want', S.miss - 0.7);
  clack(at(S.miss), 0.1);
  buzz(at(S.miss + 0.15), 0.06);
  thump(at(S.split), 0.14);
  tick(at(S.btask), 2600, 0.06);
  tick(at(S.ltask), 2800, 0.06);
  tick(at(S.how), 3100, 0.06);
}

// 2 · flag: the code beats, then the real run (v5) on the scene's clock
{
  const S = FLAG;
  const at = (x: number) => abs('flag', x);
  tick(at(S.box), 2000, 0.08);
  tick(at(S.set), 2600, 0.07);
  tick(at(S.checks), 2800, 0.07);
  RUN_FLAG.presses.forEach((m) => clack(at(S.t(m)), 0.09));
  RUN_FLAG.blinks.forEach((m) => blinkTicks('flag', S.t(m)));
  blip(at(S.works), 660, 990, 0.05);
  tick(at(S.hundred), 3200, 0.05);
  buzz(at(S.t(9090) + 0.05), 0.05);
  buzz(at(S.t(9240) + 0.05), 0.05);
  buzz(at(S.lost), 0.08);
}

// 3 · queue: the diagram, the real run (v1) on the scene's clock, the name, the catch
{
  const S = QUEUE;
  const at = (x: number) => abs('queue', x);
  tick(at(S.row), 2000, 0.08);
  clack(at(S.boxes), 0.09);
  tick(at(S.back), 2600, 0.06);
  tick(at(S.front), 2200, 0.06);
  tick(at(S.sleeps), 3100, 0.05);
  live('queue', RUN_DEMO, S.t);
  blip(at(S.every), 660, 990, 0.05);
  thump(at(S.word), 0.22);
  for (let i = 0; i < 5; i++) tick(at(S.full - 1.0 + i * 0.14), 2600, 0.04);
  buzz(at(S.dropped), 0.07);
}

// 4 · tasks: the two presses straight through, the lines lighting
{
  const S = TASKS;
  const at = (x: number) => abs('tasks', x);
  tick(at(S.left - 0.3), 2000, 0.08);
  tick(at(S.right - 0.3), 2200, 0.08);
  tick(at(S.send), 2600, 0.07);
  for (const [tin, tout] of [[S.goesIn - 0.2, S.goesIn + 0.5], [S.comesOut - 0.7, S.comesOut]]) {
    clack(at(tin - 0.1), 0.08);
    tick(at(tin), 2600, 0.04);
    blinkTicks('tasks', tout);
  }
  tick(at(S.recv), 2800, 0.07);
  tick(at(S.same), 3100, 0.06);
}

// 7 · xQueueCreate
{
  const S = CREATE;
  const at = (x: number) => abs('create', x);
  tick(at(S.intro.show), 2000, 0.09);
  thump(at(S.run), 0.2);
  S.args.forEach((a, i) => tick(at(a), 2600 + 250 * i, 0.08));
  Object.values(S.views).forEach((v) => tick(at(v), 2000, 0.07));
  clack(at(S.twenty), 0.12);
  tick(at(S.heap), 2800, 0.06);
  buzz(at(S.null), 0.06);
}

// 5 · xQueueSend
{
  const S = SEND;
  const at = (x: number) => abs('send', x);
  thump(at(S.run), 0.2);
  S.args.forEach((a, i) => tick(at(a), 2600 + 250 * i, 0.08));
  Object.values(S.views).forEach((v) => tick(at(v), 2000, 0.07));
  clack(at(S.four), 0.1);
  tick(at(S.keeps), 3100, 0.05);
  tick(at(S.takes + 0.45), 2200, 0.06);
  blinkTicks('send', S.takes + 0.45);
  tick(at(S.zero), 2700, 0.06);
  buzz(at(S.zero), 0.05);
  blip(at(S.pdtrue), 660, 990, 0.05);
  buzz(at(S.dropped), 0.07);
}

// 6 · xQueueReceive
{
  const S = RECV;
  const at = (x: number) => abs('receive', x);
  tick(at(S.intro.show), 2000, 0.09);
  thump(at(S.run), 0.2);
  S.args.forEach((a, i) => tick(at(a), 2600 + 250 * i, 0.08));
  Object.values(S.views).forEach((v) => tick(at(v), 2000, 0.07));
  clack(at(S.takes), 0.1);
  tick(at(S.adding), 2600, 0.05);
  tick(at(S.sleeps), 3100, 0.05);
  tick(at(S.arrives + 0.1), 2600, 0.05);
  blip(at(S.pdtrue), 660, 990, 0.05);
  tick(at(S.nothing), 2400, 0.06);
}

// 8 · full
{
  const F = FULL;
  live('full', RUN_BURST, F.t);
  tick(abs('full', F.longer), 3100, 0.05);
  tick(abs('full', F.waitT), 3100, 0.05);
}

// 9 · the trap
{
  const S = TRAP;
  const at = (x: number) => abs('trap', x);
  tick(at(S.now), 2000, 0.09);
  clack(at(S.move), 0.14);
  tick(at(S.higher), 2600, 0.06);
  tick(at(S.calls), 2700, 0.06);
  buzz(at(S.null), 0.08);
  thump(at(S.views.crash), 0.14);
  for (let i = 0; i < 3; i++) buzz(at(S.views.crash + 0.3 + (1 + 3 * i) * 0.5), 0.07);
  tick(at(S.again), 2000, 0.06);
  blip(at(S.fix), 660, 990, 0.06);
  clack(at(S.fix + 0.1), 0.1);
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
