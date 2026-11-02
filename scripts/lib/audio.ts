/**
 * Soundtrack toolkit shared by every explainer video's audio script.
 *
 *   const T = track(SECONDS);                  // buffers are T.N samples long
 *   const { vo, speech } = voiceover(lines, VOICE, T);
 *   const talking = talkingEnvelope(speech, T);
 *   const fx = sfx(T); fx.tick(…); fx.thump(…);
 *   pulse(buf, t => ({ f, duty, g }) | null, T);
 *   master({ vo, sfx: fx.buf, music, … }, T, { stems, out });
 *
 * Everything except the VO is synthesised (nothing to license). Pure
 * functions of time, seeded noise → the same timeline always renders the
 * same bytes. Node runs this with type-stripping: keep it import-light.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
export const VO_CACHE = join(ROOT, '.cache/vo');
export const SR = 48000;
/** sonification pitch ceiling (A2) — where fast clicks fuse into a tone */
export const TONE_HZ = 110;

export const db = (x: number) => 10 ** (x / 20);
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smooth = (u: number) => {
  const x = clamp01(u);
  return x * x * (3 - 2 * x);
};
/** seconds → sample index */
export const S = (t: number) => Math.round(t * SR);

export type Track = { seconds: number; N: number };
export const track = (seconds: number): Track => ({ seconds, N: Math.round(seconds * SR) });

// ── process + file helpers ────────────────────────────────────────────────

export function run(cmd: string, args: string[], input?: Buffer) {
  const r = spawnSync(cmd, args, { input, maxBuffer: 1 << 30 });
  if (r.status !== 0) throw new Error(`${cmd} failed:\n${r.stderr?.toString()}`);
  return r;
}

export function decode(path: string, af?: string): Float32Array {
  const args = ['-v', 'error', '-i', path];
  if (af) args.push('-af', af);
  args.push('-f', 'f32le', '-ac', '1', '-ar', String(SR), '-');
  const buf = run('ffmpeg', args).stdout as Buffer;
  return new Float32Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}

export function writeWav(path: string, x: Float32Array) {
  const raw = Buffer.from(x.buffer, x.byteOffset, x.byteLength);
  run(
    'ffmpeg',
    ['-v', 'error', '-y', '-f', 'f32le', '-ar', String(SR), '-ac', '1', '-i', '-', '-c:a', 'pcm_s24le', path],
    raw,
  );
}

// ── level + filters ───────────────────────────────────────────────────────

export const rms = (x: Float32Array, a = 0, b = x.length) => {
  let s = 0;
  for (let i = a; i < b; i++) s += x[i] * x[i];
  return Math.sqrt(s / Math.max(1, b - a));
};

/** scale x so the RMS over [a, b) seconds is `target` dBFS */
export function level(x: Float32Array, target: number, a: number, b: number) {
  const g = db(target) / Math.max(rms(x, S(a), S(b)), 1e-9);
  for (let i = 0; i < x.length; i++) x[i] *= g;
}

/** RBJ biquad, in place */
export function biquad(x: Float32Array, type: 'lp' | 'hp', f: number, q = 0.707) {
  const w = (2 * Math.PI * f) / SR;
  const cs = Math.cos(w);
  const al = Math.sin(w) / (2 * q);
  const a0 = 1 + al;
  const [b0, b1, b2] =
    type === 'lp' ? [(1 - cs) / 2, 1 - cs, (1 - cs) / 2] : [(1 + cs) / 2, -(1 + cs), (1 + cs) / 2];
  const a1 = -2 * cs;
  const a2 = 1 - al;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) {
    const y = (b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1; x1 = x[i]; y2 = y1; y1 = y; x[i] = y;
  }
  return x;
}

let seed = 0x2545f491;
/** seeded xorshift — deterministic renders */
export const noise = () => {
  seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
  return ((seed >>> 0) / 0xffffffff) * 2 - 1;
};

// ── pulse waves (PWM sonification, literal pin tones) ─────────────────────

/** PolyBLEP residual for a unit upward step */
const blep = (p: number, dt: number) => {
  if (p < dt) { const u = p / dt; return 0.5 * (u + u - u * u - 1); }
  if (p > 1 - dt) { const u = (p - 1) / dt; return 0.5 * (u * u + u + u + 1); }
  return 0;
};

export type Voice = { f: number; duty: number; g: number } | null;

/**
 * Render a band-limited pulse wave into `out`. `voice(t)` returns frequency,
 * duty and gain at absolute time t, or null for silence. Phase is continuous,
 * and restarts at 0 (= high) whenever the voice comes back from null — so a
 * voice that starts when a drawn trace starts is phase-locked to it.
 */
export function pulse(out: Float32Array, voice: (t: number) => Voice) {
  let phase = 0;
  for (let i = 0; i < out.length; i++) {
    const v = voice(i / SR);
    if (!v) { phase = 0; continue; }
    const dt = v.f / SR;
    let y = phase < v.duty ? 1 : 0;
    if (v.duty > 0 && v.duty < 1) {
      y += blep(phase, dt);
      y -= blep((phase - v.duty + 1) % 1, dt);
    }
    out[i] += (y - v.duty) * v.g;
    phase += dt;
    phase -= Math.floor(phase);
  }
}

/** sonification gain: roughly constant loudness across duty, a bit louder when brighter */
export const pwmGain = (duty: number) => (0.4 + 0.6 * duty) / Math.max(Math.sqrt(duty * (1 - duty)), 0.22);

// ── voiceover ─────────────────────────────────────────────────────────────

export const VO_PITCH = '-2Hz';
const VO_CHAIN =
  'highpass=f=85,equalizer=f=250:t=q:w=1.2:g=-2,equalizer=f=4500:t=q:w=2:g=2,' +
  'acompressor=threshold=-18dB:ratio=3:attack=8:release=180';

/** where a line's TTS clip is cached — keyed on voice + pitch + what is said */
export function voClip(voice: string, id: string, say: string) {
  const key = createHash('sha1').update(`${voice}|${VO_PITCH}|${say}`).digest('hex').slice(0, 12);
  return join(VO_CACHE, `${id}-${key}.mp3`);
}

/** generate the clip if it isn't cached; returns its path */
export function ensureClip(voice: string, id: string, say: string) {
  mkdirSync(VO_CACHE, { recursive: true });
  const mp3 = voClip(voice, id, say);
  if (!existsSync(mp3)) run('edge-tts', ['-v', voice, `--pitch=${VO_PITCH}`, '-t', say, '--write-media', mp3]);
  return mp3;
}

export type PlacedLine = { id: string; scene: string; text: string; say?: string; t0: number; sceneEnd: number };

/**
 * Lay every VO line at its absolute time, fit-check each against the next
 * line and its scene end (prints a table; sets exit code 1 on any overrun),
 * and level speech to −20 dBFS RMS.
 */
export function voiceover(lines: PlacedLine[], voice: string, T: Track) {
  console.log(`── voiceover (${voice}) ──`);
  const vo = new Float32Array(T.N);
  const speech: [number, number][] = [];
  const sorted = [...lines].sort((a, b) => a.t0 - b.t0);
  sorted.forEach((ln, i) => {
    const clip = decode(ensureClip(voice, ln.id, ln.say ?? ln.text), VO_CHAIN);
    const thr = db(-40);
    let s0 = 0;
    while (s0 < clip.length && Math.abs(clip[s0]) < thr) s0++;
    let s1 = clip.length - 1;
    while (s1 > 0 && Math.abs(clip[s1]) < thr) s1--;
    const start = ln.t0 + s0 / SR;
    const end = ln.t0 + s1 / SR;
    speech.push([start, end]);
    const off = S(ln.t0);
    for (let k = 0; k < clip.length && off + k < T.N; k++) vo[off + k] += clip[k];

    const limit = Math.min(sorted[i + 1]?.t0 ?? T.seconds, ln.sceneEnd) - 0.1;
    const ok = end <= limit;
    console.log(
      `  ${ln.id.padEnd(3)} ${ln.scene.padEnd(7)} ${start.toFixed(2).padStart(6)}–${end.toFixed(2).padStart(6)}s ` +
        `(${(end - start).toFixed(2)}s, limit ${limit.toFixed(2)})  ${ok ? 'ok' : 'OVERRUNS'}  ${ln.text}`,
    );
    if (!ok) process.exitCode = 1;
  });
  let s = 0, n = 0;
  for (const [a, b] of speech) {
    const r = rms(vo, S(a), S(b));
    s += r * r * (b - a); n += b - a;
  }
  const g = db(-20) / Math.sqrt(s / n);
  for (let i = 0; i < T.N; i++) vo[i] *= g;
  return { vo, speech };
}

/** 0..1 while someone is talking — attack 120 ms, release 500 ms. Duck with it. */
export function talkingEnvelope(speech: [number, number][], T: Track) {
  const talking = new Float32Array(T.N);
  let env = 0;
  const att = 1 - Math.exp(-1 / (0.12 * SR));
  const rel = 1 - Math.exp(-1 / (0.5 * SR));
  for (let i = 0; i < T.N; i++) {
    const t = i / SR;
    const on = speech.some(([a, b]) => t >= a - 0.08 && t <= b) ? 1 : 0;
    env += (on - env) * (on > env ? att : rel);
    talking[i] = env;
  }
  return talking;
}

// ── SFX palette ───────────────────────────────────────────────────────────

/**
 * The house SFX, each a few ms of synthesis at absolute time t:
 *   tick   — a line runs / a card or mark lands (f: pitch, amp: 0.05 mark … 0.16 line)
 *   thump  — sub hit on the big moment of a beat
 *   clack  — a latch: a register bit set, a value committed
 *   buzz   — "nope": the wrong idea being rejected
 *   blip   — rising chime: it worked / done / resolved
 */
export function sfx(T: Track) {
  const buf = new Float32Array(T.N);
  const N = T.N;
  return {
    buf,
    tick(t: number, f = 2350, amp = 0.16) {
      const o = S(t);
      for (let k = 0; k < 0.09 * SR && o + k < N; k++) {
        const u = k / SR;
        buf[o + k] += amp * Math.sin(2 * Math.PI * f * u) * Math.exp(-u / 0.016) + 0.6 * amp * noise() * Math.exp(-u / 0.0035);
      }
    },
    thump(t: number, amp: number) {
      const o = S(t);
      let ph = 0;
      for (let k = 0; k < 0.7 * SR && o + k < N; k++) {
        const u = k / SR;
        const f = 45 + 40 * Math.exp(-u / 0.06);
        ph += (2 * Math.PI * f) / SR;
        buf[o + k] += amp * Math.sin(ph) * Math.exp(-u / 0.2) * Math.min(1, u / 0.003);
      }
    },
    clack(t: number, amp: number) {
      const o = S(t);
      for (let k = 0; k < 0.06 * SR && o + k < N; k++) {
        const u = k / SR;
        buf[o + k] +=
          amp * (noise() * Math.exp(-u / 0.0018) + 0.7 * Math.sin(2 * Math.PI * 1400 * u) * Math.exp(-u / 0.008) +
            0.5 * Math.sin(2 * Math.PI * 180 * u) * Math.exp(-u / 0.02));
      }
    },
    buzz(t: number, amp: number) {
      for (const [st, f] of [[0, 150], [0.15, 120]] as const) {
        const o = S(t + st);
        for (let k = 0; k < 0.11 * SR && o + k < N; k++) {
          const u = k / SR;
          const sq = Math.sin(2 * Math.PI * f * u) > 0 ? 1 : -1;
          buf[o + k] += amp * sq * Math.min(1, u / 0.004) * Math.min(1, (0.11 - u) / 0.01) * 0.6;
        }
      }
    },
    blip(t: number, f0: number, f1: number, amp: number) {
      const o = S(t);
      let ph = 0;
      for (let k = 0; k < 0.18 * SR && o + k < N; k++) {
        const u = k / SR;
        ph += (2 * Math.PI * (f0 + (f1 - f0) * (u / 0.18))) / SR;
        buf[o + k] += amp * Math.sin(ph) * Math.sin((Math.PI * u) / 0.18);
      }
    },
  };
}

// ── music ─────────────────────────────────────────────────────────────────

/** detuned sine-pair pad with a slow tremolo — the house bed */
export function pad(out: Float32Array, freqs: number[], t0: number, t1: number, amp: number, atk: number, rel: number) {
  for (let i = S(t0); i < Math.min(out.length, S(t1)); i++) {
    const t = i / SR;
    const env = Math.min(1, (t - t0) / atk) * Math.min(1, (t1 - t) / rel);
    const trem = 1 - 0.22 * (0.5 + 0.5 * Math.sin(2 * Math.PI * 0.22 * t));
    let s = 0;
    for (const f of freqs) {
      s += Math.sin(2 * Math.PI * f * 0.998 * t) + Math.sin(2 * Math.PI * f * 1.002 * t + 1.3);
      s += 0.18 * Math.sin(2 * Math.PI * f * 2 * t + 0.7);
    }
    out[i] += amp * env * trem * s;
  }
}

// ── master ────────────────────────────────────────────────────────────────

/**
 * Sum the layers, fade the last 0.6 s, write stems, then two-pass loudnorm
 * to −16 LUFS / −1.5 dBTP, stereo 16-bit at `out`.
 */
export function master(layers: Record<string, Float32Array>, T: Track, paths: { stems: string; out: string }) {
  console.log('── mix ──');
  mkdirSync(paths.stems, { recursive: true });
  mkdirSync(dirname(paths.out), { recursive: true });
  const mix = new Float32Array(T.N);
  for (const x of Object.values(layers)) for (let i = 0; i < T.N; i++) mix[i] += x[i];
  for (let i = S(T.seconds - 0.6); i < T.N; i++) mix[i] *= (T.N - i) / (0.6 * SR);

  for (const [name, x] of Object.entries(layers)) writeWav(join(paths.stems, `${name}.wav`), x);
  const pre = join(paths.stems, 'mix-pre.wav');
  writeWav(pre, mix);

  const LN = 'loudnorm=I=-16:TP=-1.5:LRA=11';
  const m = run('ffmpeg', ['-hide_banner', '-i', pre, '-af', `${LN}:print_format=json`, '-f', 'null', '-'])
    .stderr.toString()
    .match(/\{[\s\S]*\}/);
  if (!m) throw new Error('loudnorm measure failed');
  const j = JSON.parse(m[0]);
  run('ffmpeg', [
    '-v', 'error', '-y', '-i', pre, '-af',
    `${LN}:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:` +
      `measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true,aresample=${SR}`,
    '-ac', '2', '-c:a', 'pcm_s16le', paths.out,
  ]);
}
