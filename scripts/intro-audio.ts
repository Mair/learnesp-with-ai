/**
 * Build a section intro's soundtrack from its timeline (shared by every
 * `<section>-intro` video).
 *
 *   node scripts/intro-audio.ts <slug>      # e.g. basic-gpio-intro
 *
 * The timeline exports, besides the usual SCENES / VO / VOICE:
 *   SECTION   output folder under out/ ('1-basic-gpio', …)
 *   SOUND     SFX events [{ scene, at, kind, f?, amp? }], cued from the same
 *             values as the visuals
 *   GO        { line } — the "First up" moment: the music resolves there
 *
 * Layers: VO · SFX · MUSIC (the house pad, ducked under VO, cut ~0.15 s before
 * the go scene, resolving to A major on GO.line). No sonification: an intro
 * shows results, it doesn't explain a signal.
 *
 * Output: public/<slug>/mix.wav (−16 LUFS, −1.5 dBTP) + stems in out/<section>/<slug>-stems/.
 */
import { join } from 'node:path';
import { biquad, level, master, pad, ROOT, sfx, talkingEnvelope, track, voiceover } from './lib/audio.ts';

const [slug] = process.argv.slice(2);
if (!slug) {
  console.error('usage: node scripts/intro-audio.ts <slug>');
  process.exit(2);
}
type Scene = { id: string; dur: number };
type Line = { id: string; scene: string; at: number; text: string; say?: string };
type Sound = { scene: string; at: number; kind: 'tick' | 'thump' | 'clack' | 'buzz' | 'blip'; f?: number; amp?: number };
const tl = await import(join(ROOT, 'src/scenes', slug, 'timeline.ts'));
const SCENES: Scene[] = tl.SCENES;
const VO: Line[] = tl.VO;
const SOUND: Sound[] = tl.SOUND;
const SECONDS: number = tl.SECONDS;
const sceneStart: (id: string) => number = tl.sceneStart;
const sceneDur: (id: string) => number = tl.sceneDur;

const PUBLIC = join(ROOT, 'public', slug);
const STEMS = join(ROOT, 'out', tl.SECTION, `${slug}-stems`);
const T = track(SECONDS);
const N = T.N;
const abs = (scene: string, t: number) => sceneStart(scene) + t;

// ── 1. VO ──────────────────────────────────────────────────────────────────

const { vo, speech } = voiceover(
  VO.map((l) => ({ ...l, t0: abs(l.scene, l.at), sceneEnd: abs(l.scene, sceneDur(l.scene)) })),
  tl.VOICE,
  T,
);
const talking = talkingEnvelope(speech, T);

// ── 2. SFX ─────────────────────────────────────────────────────────────────

console.log('── sfx ──');
const S = sfx(T);
for (const e of SOUND) {
  const t = abs(e.scene, e.at);
  if (e.kind === 'tick') S.tick(t, e.f ?? 2350, e.amp ?? 0.12);
  else if (e.kind === 'thump') S.thump(t, e.amp ?? 0.22);
  else if (e.kind === 'clack') S.clack(t, e.amp ?? 0.16);
  else if (e.kind === 'buzz') S.buzz(t, e.amp ?? 0.07);
  else if (e.kind === 'blip') S.blip(t, 660, 990, e.amp ?? 0.06);
}

// ── 3. music ───────────────────────────────────────────────────────────────

console.log('── music ──');
const music = new Float32Array(N);
{
  const cut = abs('go', 0) - 0.15;
  pad(music, [130.81, 164.81, 220.0], 0, cut, 1, 3, 0.08);
  pad(music, [110.0, 164.81, 220.0, 277.18], abs('go', tl.GO.line), SECONDS, 1.15, 0.35, 2.5);
  biquad(music, 'lp', 1400, 0.6);
  level(music, -30, 3, 6);
  for (let i = 0; i < N; i++) music[i] *= 1 - 0.6 * talking[i];
}

// ── 4. mix ─────────────────────────────────────────────────────────────────

const out = join(PUBLIC, 'mix.wav');
master({ vo, sfx: S.buf, music }, T, { stems: STEMS, out });
console.log(`\n✓ ${out}  (${SECONDS.toFixed(2)}s, scenes: ${SCENES.map((s) => `${s.id} ${s.dur}`).join(' · ')})`);
console.log(`  stems → ${STEMS}`);
