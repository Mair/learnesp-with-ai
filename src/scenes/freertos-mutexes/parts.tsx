/**
 * FreeRTOS mutexes parts:
 *
 *   Worker     a worker task chip (work_a purple / work_b blue) with its core badge
 *   TotalBox   `int total`: the shared number (amber = your value)
 *   Key        the mutex's one key (cyan = structure the system keeps); `glow` when held
 *   keyAt      where the key is at time t, from a list of hand-offs (home ↔ a ↔ b)
 *
 * Two sides, as in the queues video: work_a on the left (core 0), work_b on the right
 * (core 1), total in the middle, the key's home under it.
 * Shared from the queues / stacks videos: Shell, LogPanel, Snippet, ScoreCard, CodeSplit …
 */
import React from 'react';
import { ease, mono } from '../../components/Explainer';
import { C, hexA } from '../../theme/palette';
import { Chip, clamp01, GREEN } from '../freertos-queues/parts';
import { WORKER_COLOR } from './timeline';

export { after, Chip, clamp01, CodeSplit, GREEN, LogPanel, RED, rise, ScoreCard, Shell, Snippet, SPLIT_VIEW_W, Verdict, Wire } from '../freertos-queues/parts';
export type { ScoreRow } from '../freertos-queues/parts';

export const SIDE_TOP = 140;
export const LEFT_X = 150;
export const RIGHT_X = 1550;
export const CHIP_W = 220;
export const CHIP_MID = SIDE_TOP + 42;
export const TOTAL_W = 300;
export const TOTAL_TOP = 118;
/** the key's home (free), under the total */
export const KEY_HOME = { x: 960, y: 322 };
/** next to each worker's chip */
export const KEY_AT: Record<string, { x: number; y: number }> = { home: KEY_HOME, a: { x: LEFT_X + CHIP_W / 2, y: SIDE_TOP + 180 }, b: { x: RIGHT_X + CHIP_W / 2, y: SIDE_TOP + 180 } };

export const Worker: React.FC<{ name: 'work_a' | 'work_b'; core: number; glow?: number; sleep?: number; note?: React.ReactNode; x?: number; y?: number; show?: number }> = ({ name, core, glow = 0, sleep = 0, note, x, y = SIDE_TOP, show = 1 }) => {
  const col = WORKER_COLOR[name];
  const left = x ?? (name === 'work_a' ? LEFT_X : RIGHT_X);
  return (
    <div style={{ position: 'absolute', left, top: y, opacity: show, transform: `translateY(${(1 - show) * 24}px)` }}>
      <Chip name={name} color={col} glow={glow} sleep={sleep} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 96, textAlign: 'center' }}>
        <span style={{ ...mono(17, col, { fontWeight: 700, letterSpacing: '.12em' }), padding: '3px 12px', borderRadius: 999, border: `1px solid ${hexA(col, 0.6)}`, background: hexA(col, 0.12) }}>CORE {core}</span>
      </div>
      {note && <div style={{ position: 'absolute', left: -80, right: -80, top: 132, textAlign: 'center', ...mono(20, col, { fontWeight: 600 }) }}>{note}</div>}
    </div>
  );
};

/** `int total`: big value; `tone` colours it (amber = live, GREEN = right, RED = wrong) */
export const TotalBox: React.FC<{ value: React.ReactNode; tone?: string; pulse?: number; sub?: React.ReactNode; show?: number; w?: number }> = ({ value, tone = C.amber, pulse = 0, sub, show = 1, w = TOTAL_W }) => (
  <div style={{ display: 'grid', justifyItems: 'center', gap: 8, opacity: show }}>
    <div style={mono(22, C.muted)}>
      int <span style={{ color: C.ink, fontWeight: 700 }}>total</span>
    </div>
    <div
      style={{
        width: w,
        height: 110,
        boxSizing: 'border-box',
        borderRadius: 16,
        border: `2.5px solid ${hexA(tone, 0.75)}`,
        background: 'rgba(10,4,32,.7)',
        boxShadow: `0 0 ${18 + 24 * pulse}px ${hexA(tone, 0.25 + 0.4 * pulse)}`,
        display: 'grid',
        placeItems: 'center',
        ...mono(value && String(value).length > 7 ? 50 : 62, tone, { fontWeight: 800, fontVariantNumeric: 'tabular-nums' }),
        transform: `scale(${1 + 0.06 * pulse})`,
      }}
    >
      {value}
    </div>
    {sub && <div style={mono(20, C.muted)}>{sub}</div>}
  </div>
);

/** the key: a ring and a bit, cyan */
export const Key: React.FC<{ size?: number; glow?: number; color?: string }> = ({ size = 64, glow = 0, color = C.cyan }) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 100 60" style={{ overflow: 'visible', filter: glow > 0 ? `drop-shadow(0 0 ${10 * glow}px ${color})` : undefined }}>
    <circle cx={22} cy={30} r={17} fill="none" stroke={color} strokeWidth={7} />
    <path d="M 39 30 H 94 M 78 30 V 46 M 90 30 V 42" stroke={color} strokeWidth={7} strokeLinecap="round" fill="none" />
  </svg>
);

/** hand-offs: [time, where] in order; the key glides 0.45 s between places */
export type KeyStep = [number, 'home' | 'a' | 'b'];
export const keyPos = (t: number, steps: KeyStep[]) => {
  let from = KEY_AT[steps[0][1]];
  let to = from;
  let u = 1;
  for (let i = 1; i < steps.length; i++) {
    const [ti, where] = steps[i];
    if (t < ti) break;
    from = KEY_AT[steps[i - 1][1]];
    to = KEY_AT[where];
    u = ease((t - ti) / 0.45);
  }
  return { x: from.x + (to.x - from.x) * u, y: from.y + (to.y - from.y) * u };
};
export const keyHolder = (t: number, steps: KeyStep[]) => {
  let h: KeyStep[1] = steps[0][1];
  for (const [ti, where] of steps) if (t >= ti) h = where;
  return h;
};

/** the key, placed: centred on `pos` */
export const KeyAt: React.FC<{ pos: { x: number; y: number }; show?: number; glow?: number; label?: React.ReactNode }> = ({ pos, show = 1, glow = 0, label }) => (
  <div style={{ position: 'absolute', left: pos.x - 32, top: pos.y - 19, opacity: show }}>
    <Key glow={glow} />
    {label && <div style={{ position: 'absolute', left: -120, width: 304, top: 46, textAlign: 'center', ...mono(18, C.cyan, { fontWeight: 600 }) }}>{label}</div>}
  </div>
);

/** a big number with thousands separators */
export const fmt = (n: number) => n.toLocaleString('en-US');

export const pulseAt = (t: number, at: number, d = 0.5) => (t >= at && t < at + d ? 1 - clamp01((t - at) / d) : 0);

export { GREEN as OK };
