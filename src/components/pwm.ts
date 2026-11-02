/**
 * The PWM signal model — pure maths, no React, no Remotion imports.
 *
 * Shared by the picture (CodeToHardware) AND the sound generator
 * (scripts/pwm-audio.ts), so what you see and what you hear are
 * computed from the same function of time. Keep this file import-free:
 * Node runs it directly with type-stripping.
 */

export type Beat = {
  /** seconds, scene-relative, when this line executes */
  at: number;
  /** source line as displayed */
  code: string;
  /** PWM duty 0..1 that this line results in */
  duty: number;
  /**
   * seconds to glide from the previous duty. Omit for a write — the LED
   * responds within one PWM cycle (1 ms), so it should look instant.
   * Use for ledcFade().
   */
  glide?: number;
  /** PWM frequency this line results in (ledcWriteTone). Omit = unchanged. */
  hz?: number;
  /** token-level explanation, shown under the line while it's live */
  marks?: Mark[];
};

/**
 * Point at part of a line of code and say what it is. `token` is matched as a
 * whole word where it starts/ends with a word character (so `0` won't match
 * inside `230`). `at` is scene-relative seconds.
 */
export type Mark = {
  at: number;
  token?: string;
  label?: string;
  /** amber + glow: the thing this whole shot is about */
  strong?: boolean;
};

/** Playback speed keyframe. 1 = real time, 1/500 = slowed 500×. */
export type RateKey = { at: number; rate: number };

export type Caption = { at: number; text: string; em?: boolean };

/** A real ledcWrite is ~instant. 2 frames keeps it from strobing. */
export const SNAP = 0.06;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => x * x * (3 - 2 * x);

export function beatIndex(beats: Beat[], t: number): number {
  let idx = -1;
  for (let i = 0; i < beats.length; i++) if (t >= beats[i].at) idx = i;
  return idx;
}

/** Duty 0..1 at time t. */
export function dutyAt(beats: Beat[], t: number): number {
  const i = beatIndex(beats, t);
  if (i < 0) return 0;
  const b = beats[i];
  const from = i > 0 ? beats[i - 1].duty : 0;
  const g = b.glide ?? SNAP;
  return from + (b.duty - from) * clamp01((t - b.at) / g);
}

/** Frequency at time t: the latest beat that set one, else `fallback`. */
export function hzAt(beats: Beat[], t: number, fallback: number): number {
  let hz = fallback;
  for (const b of beats) if (t >= b.at && b.hz !== undefined) hz = b.hz;
  return hz;
}

const NOTE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
/** 440 → "A4" */
export function noteName(hz: number): string {
  const m = Math.round(69 + 12 * Math.log2(hz / 440));
  return `${NOTE[((m % 12) + 12) % 12]}${Math.floor(m / 12) - 1}`;
}

/** Playback rate at t — eased, interpolated in log space (speed feels even). */
export function rateAt(keys: RateKey[], t: number): number {
  if (keys.length === 0) return 1;
  if (t <= keys[0].at) return keys[0].rate;
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1];
    const b = keys[i];
    if (t <= b.at) {
      const u = smooth(clamp01((t - a.at) / (b.at - a.at)));
      return Math.exp(Math.log(a.rate) + (Math.log(b.rate) - Math.log(a.rate)) * u);
    }
  }
  return keys[keys.length - 1].rate;
}

/** Apparent frequency on screen: the real PWM frequency × playback rate. */
export const apparentHz = (hz: number, keys: RateKey[], t: number) => hz * rateAt(keys, t);

/**
 * Integral of f(t) from 0..t — i.e. how many cycles have elapsed.
 * Midpoint rule at 1 ms; exact while the rate is constant (the slow-mo hold),
 * which is where the LED and the clicks have to line up.
 */
export function integrate(f: (t: number) => number, t: number, step = 1 / 1000): number {
  let acc = 0;
  let x = 0;
  while (x + step <= t) {
    acc += f(x + step / 2) * step;
    x += step;
  }
  return acc + f((x + t) / 2) * (t - x);
}

/**
 * Persistence of vision, crudely: below ~8 Hz you see every blink, above
 * ~50 Hz you see only the average. 0 = see blinks, 1 = see average.
 */
export function fusion(hz: number): number {
  const lo = Math.log(8);
  const hi = Math.log(50);
  return smooth(clamp01((Math.log(Math.max(hz, 1e-6)) - lo) / (hi - lo)));
}

/** Is the pin high at this phase? */
export const pinHigh = (cycles: number, duty: number) =>
  duty > 0 && cycles - Math.floor(cycles) < duty;
