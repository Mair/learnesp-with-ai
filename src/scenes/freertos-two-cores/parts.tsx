/**
 * FreeRTOS two-cores parts:
 *
 *   CoreLanes   LED and CPU lanes from this video's model (sim.ts): work_a and work_b in
 *               two shades so their turns on one core can be told apart; `focus` ghosts
 *               every other worker span, `ghost0` ghosts the workers on core 0
 *   Chip        a task chip with an optional priority badge and a pin
 *   CoreBoard   two big core boxes; chips glide between slots on their cues, can be
 *               pinned (a pin drops on) and can be nudged (lean toward the other core)
 *
 * Colours: blink_fast amber, blink_slow pink, workers purple / blue-violet, cores GREEN,
 * the pin magenta, ESP-IDF's own tasks cyan (dashed: "when you use them").
 */
import React from 'react';
import { ease, GREEN, mono, RED } from '../../components/Explainer';
import { C, hexA } from '../../theme/palette';
import { inOutLocal, Lanes, Span } from '../freertos-scheduler/parts';
import { ledAt, Sim, Worker } from './sim';

export { after, clamp01, inOutLocal, Pill, Verdict, SerialLog, LedCard, Lanes, CodeViews, CV_VIEW_W, CV_VIEW_H } from '../freertos-scheduler/parts';
export type { Span } from '../freertos-scheduler/parts';
export { GREEN, RED };

export const WORKER_COLOR: Record<Worker, string> = { work_a: C.purple, work_b: '#5b7cff' };
export const COLOR: Record<string, string> = { blink_fast: C.amber, blink_slow: C.pink, ...WORKER_COLOR, app_main: '#9aa7ff', 'Wi-Fi': C.cyan, Bluetooth: C.cyan };
export const PIN_COL = C.magenta;
/** LED slivers are drawn this wide (ms) so they can be seen; really they take microseconds */
export const SLIVER = 14;

// ── CoreLanes ─────────────────────────────────────────────────────────────

export type LaneKind = 'fast' | 'slow' | 'core0' | 'core1';

export const CoreLanes: React.FC<{
  sim: Sim;
  W: number;
  s0: number;
  s1: number;
  now: number;
  show: LaneKind[];
  lateMarks?: boolean;
  focus?: Worker | null;
  /** ghost the worker spans on core 0 */
  ghost0?: boolean;
  /** span labels (off when the slices are too thin to read) */
  labels?: boolean;
  axisStep?: number;
}> = ({ sim, W, s0, s1, now, show, lateMarks = false, focus = null, ghost0 = false, labels = true, axisStep }) => {
  const lanes: { name: string; color: string; spans?: Span[]; level?: (s: number) => number; h?: number }[] = [];
  const marks: { s: number; label: string; color: string; lane: number }[] = [];
  for (const k of show) {
    if (k === 'fast') {
      lanes.push({ name: 'GPIO 2', color: C.amber, level: (s) => ledAt(sim.edges.fast, s), h: 40 });
      if (lateMarks) for (const e of sim.late) if (e >= s0 && e <= s1) marks.push({ s: e, label: 'late', color: RED, lane: lanes.length - 1 });
    }
    if (k === 'slow') lanes.push({ name: 'GPIO 19', color: C.pink, level: (s) => ledAt(sim.edges.slow, s), h: 40 });
    if (k === 'core0' || k === 'core1') {
      const c = k === 'core0' ? 0 : 1;
      const spans: Span[] = sim.cores[c]
        .filter((x) => x.b >= s0 && x.a <= s1)
        .map((x) => ({ a: x.a, b: x.b, color: WORKER_COLOR[x.task], label: labels ? x.task : undefined, dashed: (focus !== null && x.task !== focus) || (ghost0 && c === 0) }));
      for (const b of sim.blinks) if (b.core === c && b.t >= s0 - SLIVER && b.t <= s1) spans.push({ a: b.t, b: b.t + SLIVER, color: COLOR[b.task] });
      lanes.push({ name: `core ${c}`, color: GREEN, spans });
    }
  }
  const step = axisStep ?? (s1 - s0 > 2500 ? 1000 : s1 - s0 > 600 ? 500 : 50);
  const axis: { s: number; label: string }[] = [];
  for (let s = Math.ceil(s0 / step) * step; s <= s1; s += step) axis.push({ s, label: step >= 500 ? `${(s / 1000).toFixed(s % 1000 ? 1 : 0)} s` : `${s} ms` });
  return <Lanes W={W} s0={s0} s1={s1} now={now} lanes={lanes} marks={marks} axis={axis} />;
};

// ── Chip ──────────────────────────────────────────────────────────────────

export const CHIP_W = 300;
export const CHIP_H = 80;

/** a push-pin, drawn over a chip's top-right corner; `p` 0..1 drops it in */
export const PinMark: React.FC<{ p: number; size?: number }> = ({ p, size = 1 }) =>
  p <= 0 ? null : (
    <svg width={44 * size} height={60 * size} viewBox="0 0 44 60" style={{ position: 'absolute', right: -14 * size, top: -36 * size, opacity: ease(p * 2), transform: `translateY(${(1 - ease(p)) * -70}px)`, overflow: 'visible' }}>
      <line x1={22} y1={26} x2={22} y2={52} stroke="#e8e8ff" strokeWidth={3.5} strokeLinecap="round" />
      <circle cx={22} cy={18} r={15} fill={PIN_COL} stroke="#fff" strokeWidth={2} style={{ filter: `drop-shadow(0 0 10px ${PIN_COL})` }} />
      <circle cx={17} cy={13} r={4} fill="#fff" opacity={0.6} />
    </svg>
  );

export const Chip: React.FC<{ name: string; prio?: number | string; color?: string; pin?: number; dashed?: boolean; dim?: number; glow?: number; note?: React.ReactNode; w?: number; h?: number }> = ({
  name,
  prio,
  color,
  pin = 0,
  dashed = false,
  dim = 0,
  glow = 0,
  note,
  w = CHIP_W,
  h = CHIP_H,
}) => {
  const col = color ?? COLOR[name] ?? '#9aa7ff';
  return (
    <div style={{ position: 'relative', width: w, height: h, opacity: 1 - 0.6 * dim }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 14,
          border: `2px ${dashed ? 'dashed' : 'solid'} ${hexA(col, 0.85)}`,
          background: dashed ? hexA(col, 0.06) : `linear-gradient(${hexA(col, 0.22)}, ${hexA(col, 0.1)}), #150a33`,
          boxShadow: glow > 0 ? `0 0 ${30 * glow}px ${hexA(col, 0.7 * glow)}` : undefined,
          display: 'flex',
          alignItems: 'center',
          justifyContent: prio === undefined ? 'center' : 'space-between',
          padding: prio === undefined ? 0 : '0 10px 0 18px',
          boxSizing: 'border-box',
        }}
      >
        <span style={mono(24, '#fff', { fontWeight: 700 })}>{name}</span>
        {prio !== undefined && (
          <span style={{ ...mono(32, '#140818', { fontWeight: 800 }), minWidth: 52, height: 54, borderRadius: 10, display: 'grid', placeItems: 'center', background: col }}>{prio}</span>
        )}
      </div>
      <PinMark p={pin} />
      {note && <div style={{ position: 'absolute', left: -60, right: -60, top: h + 4, textAlign: 'center', whiteSpace: 'nowrap', ...mono(17, col, { fontWeight: 700 }) }}>{note}</div>}
    </div>
  );
};

// ── CoreBoard ─────────────────────────────────────────────────────────────

export const BOARD_W = 1600;
export const BOARD_H = 700;
const BOX = { w: 700, h: 520, top: 120, x0: 20, x1: BOARD_W - 720 };
/** slot `c0`…`c5` in core 0, `d0`…`d5` in core 1 (2 columns × 3 rows); `gap` between; `top` above */
export type BoardSlot = `c${number}` | `d${number}` | 'gap' | 'gap2' | 'top';
function slotXY(s: BoardSlot): [number, number] {
  if (s === 'gap') return [BOARD_W / 2, BOX.top + 170];
  if (s === 'gap2') return [BOARD_W / 2, BOX.top + 330];
  if (s === 'top') return [BOARD_W / 2, -80];
  const i = Number(s.slice(1));
  const x0 = s[0] === 'c' ? BOX.x0 : BOX.x1;
  return [x0 + 185 + (i % 2) * 330, BOX.top + 110 + Math.floor(i / 2) * 150];
}

export type BoardChip = {
  name: string;
  prio?: number;
  dashed?: boolean;
  /** [time, slot] — glides 0.7 s to `slot` at `time`; hidden before the first time */
  path: [number, BoardSlot][];
  pinAt?: number;
  /** lean toward the other core and bounce back, starting at this time */
  nudgeAt?: number;
  note?: (t: number) => React.ReactNode;
  dim?: (t: number) => number;
  glow?: (t: number) => number;
};

export const CoreBoard: React.FC<{
  t: number;
  chips: BoardChip[];
  show?: number;
  /** per-core caption under the box title */
  notes?: [React.ReactNode, React.ReactNode];
  /** 0..1 per core: green glow on the box */
  lit?: [number, number];
  children?: React.ReactNode;
}> = ({ t, chips, show = 1, notes = [null, null], lit = [0, 0], children }) => (
  <div style={{ position: 'relative', width: BOARD_W, height: BOARD_H }}>
    {[0, 1].map((c) => (
      <div
        key={c}
        style={{
          position: 'absolute',
          left: c === 0 ? BOX.x0 : BOX.x1,
          top: BOX.top,
          width: BOX.w,
          height: BOX.h,
          borderRadius: 24,
          border: `2.5px dashed ${hexA(GREEN, 0.5 + 0.4 * lit[c])}`,
          background: hexA(GREEN, 0.04 + 0.06 * lit[c]),
          boxShadow: lit[c] > 0 ? `0 0 ${40 * lit[c]}px ${hexA(GREEN, 0.3 * lit[c])}` : undefined,
          opacity: show,
        }}
      >
        <div style={{ position: 'absolute', top: -70, left: 0, right: 0, textAlign: 'center', ...mono(40, GREEN, { fontWeight: 800, letterSpacing: '.08em' }) }}>core {c}</div>
        <div style={{ position: 'absolute', bottom: 18, left: 0, right: 0, textAlign: 'center', ...mono(21, C.ink, { fontWeight: 600 }) }}>{notes[c]}</div>
      </div>
    ))}
    {chips.map((ch, i) => {
      if (t < ch.path[0][0] - 0.01) return null;
      let k = 0;
      for (let j = 0; j < ch.path.length; j++) if (t >= ch.path[j][0]) k = j;
      let [x, y] = slotXY(ch.path[k][1]);
      if (k > 0) {
        const u = inOutLocal((t - ch.path[k][0]) / 0.7);
        const [x0, y0] = slotXY(ch.path[k - 1][1]);
        x = x0 + (x - x0) * u;
        y = y0 + (y - y0) * u - Math.sin(Math.PI * u) * 40;
      }
      if (ch.nudgeAt !== undefined && t >= ch.nudgeAt) {
        const u = (t - ch.nudgeAt) / 1.1;
        if (u < 1) {
          // out toward core 0, a hard stop, back
          const lean = u < 0.45 ? ease(u / 0.45) : 1 - inOutLocal((u - 0.45) / 0.55);
          x -= lean * 190;
        }
      }
      return (
        <div key={i} style={{ position: 'absolute', left: x - CHIP_W / 2, top: y - CHIP_H / 2, opacity: ease((t - ch.path[0][0]) / 0.4) }}>
          <Chip name={ch.name} prio={ch.prio} dashed={ch.dashed} pin={ch.pinAt === undefined ? 0 : (t - ch.pinAt) / 0.5} note={ch.note?.(t)} dim={ch.dim?.(t) ?? 0} glow={ch.glow?.(t) ?? 0} />
        </div>
      );
    })}
    {children}
  </div>
);

/** the x of the wall between the two core boxes' facing edges (for a ✗ at the border) */
export const BOARD_WALL_X = (BOX.x0 + BOX.w + BOX.x1) / 2;
export const BOARD_SLOT = slotXY;
