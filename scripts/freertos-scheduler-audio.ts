/**
 * Build the FreeRTOS-scheduler video's soundtrack from the same timeline as the picture.
 *
 *   npm run freertos-scheduler:audio
 *
 * Layers (everything except the VO is synthesised, scripts/lib/audio.ts):
 *
 *   VO      scratch edge-tts, one clip per line, fit-checked
 *   SFX     the Explainer grammar (ticks / thumps / clacks / buzzes / blips); every LED
 *           toggle in the real-time panels as a soft tick (GPIO 2 high, GPIO 19 low),
 *           taken from the same scheduler model as the lanes (sim.ts), so the stumble
 *           at priority 6 can be heard
 *   MUSIC   the house pad, ducked under VO, cut before the payoff, resolving to A major
 *
 * No sustained tones: nothing here is about pitch (SOUND.md).
 * Output: public/freertos-scheduler/mix.wav (−16 LUFS, −1.5 dBTP) + stems in out/2-freertos/freertos-scheduler-stems/.
 */
import { join } from 'node:path';
import { biquad, level, master, pad, ROOT, sfx, talkingEnvelope, track, voiceover } from './lib/audio.ts';
import { simulate, SLOW_MS, FAST_MS } from '../src/scenes/freertos-scheduler/sim.ts';
import {
  CASES,
  DEMO,
  demoPrio,
  FIX,
  PAYOFF,
  PRIO,
  PROBLEM,
  RULE,
  SCENES,
  type SceneId,
  sceneDur,
  sceneStart,
  SECONDS,
  STATES,
  TRAP,
  VO,
  VOICE,
} from '../src/scenes/freertos-scheduler/timeline.ts';

const PUBLIC = join(ROOT, 'public/freertos-scheduler');
const STEMS = join(ROOT, 'out/2-freertos/freertos-scheduler-stems');
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
const ticks = (scene: SceneId, xs: number[], f = 2600, a = 0.06) => xs.forEach((x) => tick(abs(scene, x), f, a));

/** LED toggles of an LED switching every `ms` from `a0`, over [t0, t1) (absolute seconds) */
function wantedToggles(a0: number, t0: number, t1: number, ms: number, f: number) {
  for (let k = 0; ; k++) {
    const t = a0 + (k * ms) / 1000;
    if (t >= t1) break;
    if (t >= t0) tick(t, f, LED_AMP);
  }
}
/** LED toggles from model edges (ms), placed from absolute `a0`, over [t0, t1) */
function edgeToggles(edges: number[], a0: number, t0: number, t1: number, f: number) {
  for (const e of edges) {
    const t = a0 + e / 1000;
    if (t >= t0 && t < t1) tick(t, f, LED_AMP);
  }
}

// problem: the wanted rhythms, then the stumble at priority 6
{
  const P = PROBLEM;
  const at = (x: number) => abs('problem', x);
  const end = at(sceneDur('problem') - 0.3);
  wantedToggles(at(P.leds), at(P.leds), at(P.watch), FAST_MS, F_FAST);
  wantedToggles(at(P.leds), at(P.leds), at(P.watch), SLOW_MS, F_SLOW);
  const s6 = simulate('workers-6', { until: 6000, workPrio: () => 6 });
  edgeToggles(s6.edges.fast, at(P.watch), at(P.watch), end, F_FAST);
  edgeToggles(s6.edges.slow, at(P.watch), at(P.watch), end, F_SLOW);
  tick(at(P.add), 2000, 0.09);
  clack(at(P.busy), 0.12);
  tick(at(P.rest), 2400, 0.06);
  tick(at(P.six - 0.7), 2000, 0.09);
  thump(at(P.six), 0.18);
  tick(at(P.five), 2600, 0.06);
  tick(at(P.bigger), 3100, 0.05);
  buzz(at(P.stumbles), 0.08);
  blip(at(P.unchanged), 660, 990, 0.05);
  tick(at(P.what), 2400, 0.07);
}

// rule
{
  const R = RULE;
  const at = (x: number) => abs('rule', x);
  for (let i = 0; i < 5; i++) tick(at(R.many - 0.3 + i * 0.12), 2400 + 150 * i, 0.04);
  tick(at(R.choose), 3100, 0.05);
  clack(at(R.one), 0.12);
  tick(at(R.ready), 2600, 0.07);
  tick(at(R.highest), 2800, 0.07);
  thump(at(R.runs), 0.2);
  tick(at(R.create), 2000, 0.09);
  clack(at(R.number), 0.12);
  tick(at(R.bigger), 2600, 0.06);
  blip(at(R.first), 660, 990, 0.05);
  thump(at(R.word), 0.3);
}

// three states
{
  const S = STATES;
  const at = (x: number) => abs('states', x);
  ticks('states', [S.three - 0.2, S.three, S.three + 0.2], 2600, 0.06);
  clack(at(S.delay + 0.3), 0.12);
  // the 20 ticks of the delay, counted out
  const a = S.delay + 0.6;
  for (let k = 1; k <= 20; k++) tick(at(a + (k * (S.over - a)) / 20), 3600, k === 20 ? 0.06 : 0.03);
  blip(at(S.over), 660, 990, 0.05);
  clack(at(S.now), 0.12);
  thump(at(S.two), 0.16);
  tick(at(S.same), 3100, 0.05);
}

// the rule in action
{
  const K = CASES;
  const at = (x: number) => abs('cases', x);
  for (const v of [K.c1.at, K.c2.at, K.c3.at, K.c4.at, K.led.at]) tick(at(v), 2000, 0.09);
  clack(at(K.c1.takes), 0.12);
  clack(at(K.c1.takes + 0.6), 0.1);
  tick(at(K.c2.ready), 2600, 0.06);
  thump(at(K.c2.takes), 0.18);
  tick(at(K.c2.back), 2400, 0.06);
  clack(at(K.c2.later + 0.4), 0.1);
  clack(at(K.c3.at + 0.3), 0.1);
  tick(at(K.c3.ready), 2600, 0.06);
  buzz(at(K.c3.must), 0.07);
  for (let k = 0; k < 7; k++) clack(at(K.c4.tick + 0.85 * k), 0.07);
  tick(at(K.c4.ms), 3100, 0.05);
  clack(at(K.led.at + 0.4), 0.1);
  tick(at(K.led.over), 2600, 0.06);
  buzz(at(K.led.waits), 0.07);
  clack(at(K.led.rests + 0.35), 0.12);
  tick(at(K.led.rests + 0.5), F_FAST, 0.05);
  buzz(at(K.led.late), 0.08);
}

// the fix
{
  const S = FIX;
  const at = (x: number) => abs('fix', x);
  Object.values(S.views).forEach((v) => tick(at(v), 2000, 0.09));
  clack(at(S.lower), 0.14);
  blip(at(S.four), 660, 990, 0.06);
  tick(at(S.ready), 2600, 0.06);
  thump(at(S.away), 0.18);
  tick(at(S.switches), F_FAST, 0.05);
  clack(at(S.waiting), 0.1);
  blip(at(S.nothing), 660, 990, 0.05);
  buzz(at(S.important), 0.07);
  thump(at(S.quickly), 0.24);
  tick(at(S.quick), 2600, 0.06);
  tick(at(S.long), 2400, 0.06);
  tick(at(S.timer), 3100, 0.05);
  for (let k = 0; k < 8; k++) tick(at(S.checking + 0.25 * k), 3000, 0.025);
  clack(at(S.until + 0.6), 0.1);
  tick(at(S.keeps), 2400, 0.06);
  clack(at(S.blocked), 0.1);
  blip(at(S.free), 660, 990, 0.05);
  tick(at(S.top), 2800, 0.06);
  tick(at(S.espTimer), 3100, 0.05);
}

// changing priority
{
  const S = PRIO;
  const at = (x: number) => abs('prio', x);
  tick(at(S.intro.show), 2000, 0.09);
  tick(at(S.intro.button), 2600, 0.06);
  tick(at(S.intro.gpio), 3100, 0.05);
  tick(at(S.intro.main), 2000, 0.09);
  clack(at(S.intro.keeps), 0.12);
  tick(at(S.run));
  thump(at(S.run), 0.22);
  S.args.forEach((a, i) => tick(at(a), 2600 + 250 * i, 0.08));
  Object.values(S.views).forEach((v) => tick(at(v), 2000, 0.09));
  tick(at(S.which), 2800, 0.06);
  tick(at(S.calling), 2800, 0.06);
  tick(at(S.zero), 2600, 0.06);
  tick(at(S.top), 2800, 0.06);
  buzz(at(S.over), 0.09);
  clack(at(S.lower), 0.12);
  thump(at(S.chooses), 0.16);
  tick(at(S.back), 3100, 0.06);
  tick(at(S.ifFour), 2600, 0.06);
  tick(at(S.otherwise), 2800, 0.06);
  clack(at(S.prints + 0.3), 0.1);
  tick(at(S.seven), 2600, 0.06);
  blip(at(S.quick), 660, 990, 0.05);
}

// demo: the LEDs in real time, from the same model as the lanes
{
  const D = DEMO;
  const at = (x: number) => abs('demo', x);
  const end = at(sceneDur('demo') - 0.3);
  const sd = simulate('demo', { until: 30000, workPrio: demoPrio });
  edgeToggles(sd.edges.fast, at(D.flash), at(D.flash), end, F_FAST);
  edgeToggles(sd.edges.slow, at(D.flash), at(D.flash), end, F_SLOW);
  tick(at(D.flash), 2000, 0.09);
  clack(at(D.press1), 0.16);
  tick(at(D.press1 + 0.05), 3100, 0.05);
  buzz(at(D.stumbles), 0.07);
  clack(at(D.press2), 0.16);
  tick(at(D.press2 + 0.05), 3100, 0.05);
  blip(at(D.back), 660, 990, 0.06);
}

// the trap
{
  const S = TRAP;
  const at = (x: number) => abs('trap', x);
  Object.values(S.views).forEach((v) => tick(at(v), 2000, 0.09));
  thump(at(S.mistake), 0.18);
  buzz(at(S.cut), 0.08);
  const nr = simulate('no-rest', { until: 6000, workPrio: () => 4, rest: false });
  edgeToggles(nr.edges.fast, at(S.views.leds), at(S.views.leds), at(S.views.cores - 0.3), F_FAST);
  edgeToggles(nr.edges.slow, at(S.views.leds), at(S.views.leds), at(S.views.cores - 0.3), F_SLOW);
  tick(at(S.higher), 2600, 0.06);
  tick(at(S.fill), 2400, 0.06);
  tick(at(S.zero), 2600, 0.06);
  buzz(at(S.neverRuns), 0.07);
  thump(at(S.prints), 0.24);
  for (let i = 0; i < 7; i++) tick(at(S.prints + i * 0.12), 2200, 0.03);
  thump(at(S.again), 0.16);
  tick(at(S.meet), 3100, 0.05);
  clack(at(S.put), 0.14);
  blip(at(S.gone), 660, 990, 0.07);
}

// payoff
thump(abs('payoff', PAYOFF.sched), 0.45);
PAYOFF.recap.forEach((r, i) => tick(abs('payoff', r.at), 1600 + 200 * i, 0.08));

// ── 3. music ───────────────────────────────────────────────────────────────

console.log('── music ──');
const music = new Float32Array(N);
const MUSIC_CUT = abs('payoff', 0) - 0.15;
{
  pad(music, [130.81, 164.81, 220.0], 0, MUSIC_CUT, 1, 3, 0.08);
  pad(music, [110.0, 164.81, 220.0, 277.18], abs('payoff', PAYOFF.sched), SECONDS, 1.15, 0.35, 2.5);
  biquad(music, 'lp', 1400, 0.6);
  level(music, -30, 3, 6);
  for (let i = 0; i < N; i++) music[i] *= 1 - 0.6 * talking[i];
}

// ── 4. mix ─────────────────────────────────────────────────────────────────

const out = join(PUBLIC, 'mix.wav');
master({ vo, sfx: sfxBuf, music }, T, { stems: STEMS, out });
console.log(`\n✓ ${out}  (${SECONDS.toFixed(1)}s, scenes: ${SCENES.map((s) => `${s.id} ${s.dur}`).join(' · ')})`);
console.log(`  stems → ${STEMS}`);
