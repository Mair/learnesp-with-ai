/**
 * FreeRTOS-tasks parts:
 *
 *   LedCard     an LED with its pin pill (pink) — the light is amber
 *   StackBox    a task's stack as a column of rows (top = high address)
 *   StateChip   a task state: Running / Ready / Blocked
 *   Ladder      a horizontal 0…24 priority scale with labelled marks
 *
 * Re-exports the interrupt video's CodeAndViews / Lanes and the GPIO parts.
 * Colour meanings (STYLE.md): pin = pink, timing = magenta, structure = cyan,
 * your function / value / the light = amber, works = GREEN, wrong = RED.
 */
import React from 'react';
import { mono } from '../../components/Explainer';
import { Led } from '../../components/Gadgets';
import { C, FONT, hexA } from '../../theme/palette';

export { after, clamp01, inOutLocal, mix, Pill, Verdict, SerialLog } from '../gpio/parts';
export { CodeAndViews, Lanes, VIEW2_W, VIEW2_H, GREEN } from '../gpio-interrupts/parts';
export type { Span, CodeView } from '../gpio-interrupts/parts';

export const LedCard: React.FC<{ pin: number; on: number; label?: string; size?: number; sub?: string }> = ({ pin, on, label, size = 130, sub }) => (
  <div style={{ display: 'grid', justifyItems: 'center', gap: 6 }}>
    <Led brightness={on} size={size} />
    <div
      style={{
        ...mono(20, C.pink, { fontWeight: 700 }),
        padding: '4px 14px',
        borderRadius: 999,
        border: `1px solid ${hexA(C.pink, 0.6)}`,
        background: hexA(C.pink, 0.1),
      }}
    >
      GPIO {pin}
    </div>
    {label && <div style={mono(18, C.amber, { fontWeight: 700 })}>{label}</div>}
    {sub && <div style={mono(16, C.muted)}>{sub}</div>}
  </div>
);

export type StackRow = { text: string; color: string; p?: number; sub?: string };

/** a stack drawn top = high address; rows fill from the top (it grows down) */
export const StackBox: React.FC<{ title: string; size: string; rows: StackRow[]; w?: number; h?: number; color?: string; fill?: number; bottom?: React.ReactNode }> = ({
  title,
  size,
  rows,
  w = 340,
  h = 380,
  color = C.cyan,
  fill = 0,
  bottom,
}) => (
  <div style={{ display: 'grid', gap: 8, justifyItems: 'center' }}>
    <div style={mono(20, color, { fontWeight: 700 })}>{title}</div>
    <div
      style={{
        position: 'relative',
        width: w,
        height: h,
        borderRadius: 12,
        border: `2px solid ${hexA(color, 0.7)}`,
        background: 'rgba(10,4,32,.6)',
        overflow: 'hidden',
      }}
    >
      {/* unused stack: the 0xa5 fill */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.25 * fill,
          ...mono(14, C.muted),
          lineHeight: 1.5,
          padding: 8,
          wordBreak: 'break-all',
        }}
      >
        {'a5 '.repeat(200)}
      </div>
      <div style={{ position: 'absolute', left: 10, right: 10, top: 10, display: 'grid', gap: 8 }}>
        {rows.map((r, i) => (
          <div
            key={i}
            style={{
              opacity: r.p ?? 1,
              transform: `translateY(${(1 - (r.p ?? 1)) * -12}px)`,
              padding: '8px 12px',
              borderRadius: 8,
              border: `1px solid ${hexA(r.color, 0.7)}`,
              background: `linear-gradient(${hexA(r.color, 0.18)}, ${hexA(r.color, 0.18)}), #150a33`,
              ...mono(18, '#fff', { fontWeight: 600 }),
            }}
          >
            {r.text}
            {r.sub && <div style={mono(14, C.muted, { fontWeight: 400 })}>{r.sub}</div>}
          </div>
        ))}
      </div>
      {bottom}
    </div>
    <div style={mono(16, C.muted)}>{size}</div>
  </div>
);

export const STATE_COLOR: Record<string, string> = { Running: '#7dffb0', Ready: C.cyan, Blocked: C.magenta, Deleted: '#ff5470' };

export const StateChip: React.FC<{ state: string; on: number; size?: number }> = ({ state, on, size = 26 }) => {
  const col = STATE_COLOR[state] ?? C.muted;
  return (
    <div
      style={{
        ...mono(size, on > 0.5 ? '#fff' : hexA(C.ink, 0.45), { fontWeight: 700 }),
        padding: '14px 26px',
        borderRadius: 14,
        border: `2px solid ${hexA(col, 0.25 + 0.75 * on)}`,
        background: hexA(col, 0.05 + 0.22 * on),
        boxShadow: on > 0.5 ? `0 0 30px ${hexA(col, 0.45 * on)}` : undefined,
        textAlign: 'center',
        minWidth: 200,
      }}
    >
      {state}
    </div>
  );
};

/** 0…24 priority ladder */
export const Ladder: React.FC<{ W: number; marks: { p: number; label: string; color: string; show: number; dy: number; anchor?: 'start' | 'middle' | 'end' }[]; axis: number }> = ({ W, marks, axis }) => {
  const L = 40;
  const R = W - 40;
  const x = (p: number) => L + (p / 24) * (R - L);
  const y = 140;
  return (
    <svg width={W} height={300} style={{ display: 'block', overflow: 'visible' }}>
      <line x1={L} y1={y} x2={L + (R - L) * axis} y2={y} stroke={hexA(C.cyan, 0.7)} strokeWidth={3} />
      {Array.from({ length: 25 }, (_, p) => (
        <g key={p} opacity={axis > p / 24 ? 1 : 0}>
          <line x1={x(p)} y1={y - 10} x2={x(p)} y2={y + 10} stroke={hexA(C.cyan, 0.6)} strokeWidth={2} />
          {(p % 4 === 0 || p === 1 || p === 5 || p === 22 || p === 24) && (
            <text x={x(p)} y={y + 40} textAnchor="middle" style={mono(18, C.muted)}>
              {p}
            </text>
          )}
        </g>
      ))}
      <text x={L} y={y + 125} style={mono(18, C.muted)} opacity={axis}>
        low
      </text>
      <text x={R} y={y + 125} textAnchor="end" style={mono(18, C.muted)} opacity={axis}>
        high · configMAX_PRIORITIES = 25
      </text>
      {marks.map((m, i) => {
        const yy = y + m.dy;
        const below = m.dy > 0;
        return (
          <g key={i} opacity={m.show} transform={`translate(0 ${(1 - m.show) * -10})`}>
            <circle cx={x(m.p)} cy={y} r={11} fill={m.color} style={{ filter: `drop-shadow(0 0 8px ${m.color})` }} />
            <line x1={x(m.p)} y1={below ? y + 46 : y - 12} x2={x(m.p)} y2={below ? yy - 20 : yy + 6} stroke={m.color} strokeWidth={2} />
            <text x={x(m.p) + (m.anchor === 'start' ? -8 : m.anchor === 'end' ? 8 : 0)} y={yy} textAnchor={m.anchor ?? 'middle'} style={mono(22, m.color, { fontWeight: 700 })}>
              {m.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

/** a small code block (no panel) */
export const Code: React.FC<{ lines: React.ReactNode[]; size?: number; color?: string; style?: React.CSSProperties }> = ({ lines, size = 24, color = '#cfd6ff', style }) => (
  <pre style={{ margin: 0, fontFamily: FONT.mono, fontSize: size, lineHeight: 1.55, color, ...style }}>
    {lines.map((l, i) => (
      <div key={i}>{l === '' ? '\u00a0' : l}</div>
    ))}
  </pre>
);
