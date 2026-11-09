/**
 * Small pieces shared by the PWM v2 scenes: blocks for the timer → channel → pin
 * diagram, an arrow, a mini counter, a log box. All drawn in plain words — no
 * register names ("teach driving, not the engine").
 */
import React from 'react';
import { GREEN, mono, RED } from '../../components/Explainer';
import { Led } from '../../components/Gadgets';
import { C, FONT, hexA } from '../../theme/palette';

export { after, Pill, Verdict } from '../gpio/parts';

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** a labelled box: TIMER 0, CH 0, GPIO 2 … */
export const Block: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub?: string;
  color: string;
  p: number;
  lit?: boolean;
  dim?: boolean;
  children?: React.ReactNode;
}> = ({ x, y, w, h, title, sub, color, p, lit = false, dim = false, children }) => {
  if (p <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        boxSizing: 'border-box',
        borderRadius: 16,
        border: `${lit ? 2 : 1}px solid ${hexA(color, lit ? 0.9 : dim ? 0.25 : 0.5)}`,
        background: `linear-gradient(165deg, ${hexA(color, lit ? 0.18 : 0.06)}, rgba(10,4,32,.8))`,
        boxShadow: lit ? `0 0 30px ${hexA(color, 0.35)}` : 'none',
        opacity: p * (dim ? 0.45 : 1),
        transform: `translateY(${(1 - p) * 14}px)`,
        display: 'grid',
        alignContent: 'center',
        justifyItems: 'center',
        gap: 6,
        padding: 10,
      }}
    >
      <div style={mono(24, color, { fontWeight: 700, letterSpacing: '.08em' })}>{title}</div>
      {sub && <div style={{ fontSize: 19, color: C.muted, textAlign: 'center' }}>{sub}</div>}
      {children}
    </div>
  );
};

/** a left-to-right arrow between two points, drawn in as `p` goes 0 → 1 */
export const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; p: number; color?: string; label?: string }> = ({
  x1,
  y1,
  x2,
  y2,
  p,
  color = C.ink,
  label,
}) => {
  if (p <= 0) return null;
  const xe = x1 + (x2 - x1) * p;
  const ye = y1 + (y2 - y1) * p;
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const hx = (a: number) => xe - 14 * Math.cos(ang + a);
  const hy = (a: number) => ye - 14 * Math.sin(ang + a);
  return (
    <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none' }} width={1} height={1}>
      <line x1={x1} y1={y1} x2={xe} y2={ye} stroke={color} strokeWidth={3} opacity={0.85} />
      {p > 0.9 && <path d={`M ${hx(0.45)} ${hy(0.45)} L ${xe} ${ye} L ${hx(-0.45)} ${hy(-0.45)}`} fill="none" stroke={color} strokeWidth={3} />}
      {label && p > 0.6 && (
        <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 12} textAnchor="middle" style={mono(18, color)} opacity={(p - 0.6) / 0.4}>
          {label}
        </text>
      )}
    </svg>
  );
};

/** a tiny sawtooth: the timer's counter, counting */
export const MiniCounter: React.FC<{ t: number; w?: number; h?: number; color?: string }> = ({ t, w = 200, h = 54, color = C.cyan }) => {
  const per = w / 3;
  const ph = (t * 0.8) % 1;
  let d = '';
  for (let k = 0; k < 3; k++) d += `${d ? ' L' : 'M'} ${k * per} ${h} L ${(k + 1) * per} 0`;
  return (
    <svg width={w} height={h + 4} style={{ overflow: 'visible' }}>
      <path d={d} fill="none" stroke={hexA(color, 0.35)} strokeWidth={2} />
      <path d={d} fill="none" stroke={color} strokeWidth={3} strokeDasharray={`${ph * 600} 2000`} style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
    </svg>
  );
};

/** an LED with a caption */
export const LedBox: React.FC<{ x: number; y: number; brightness: number; p: number; label?: string }> = ({ x, y, brightness, p, label }) =>
  p <= 0 ? null : (
    <div style={{ position: 'absolute', left: x, top: y, opacity: p, display: 'grid', justifyItems: 'center', gap: 6 }}>
      <Led brightness={brightness} size={110} />
      {label && <div style={mono(20, C.amber)}>{label}</div>}
    </div>
  );

/** what `idf.py monitor` prints — typed out from `at` */
export const LogBox: React.FC<{ t: number; at: number; lines: { text: string; color?: string }[]; size?: number; width?: number }> = ({
  t,
  at,
  lines,
  size = 21,
  width,
}) => {
  if (t < at) return null;
  const total = lines.reduce((n, l) => n + l.text.length, 0);
  let budget = Math.floor(clamp01((t - at) / 1.2) * total);
  return (
    <div
      style={{
        width,
        boxSizing: 'border-box',
        borderRadius: 12,
        border: `1px solid ${hexA(RED, 0.45)}`,
        background: 'rgba(10,4,32,.8)',
        padding: '12px 16px',
        display: 'grid',
        gap: 4,
      }}
    >
      <div style={mono(14, C.muted, { letterSpacing: '.2em' })}>RECORDED IN QEMU</div>
      {lines.map((l, i) => {
        const n = Math.max(0, Math.min(l.text.length, budget));
        budget -= l.text.length;
        return (
          <div key={i} style={mono(size, l.color ?? RED, { whiteSpace: 'pre-wrap', lineHeight: 1.35 })}>
            {l.text.slice(0, n)}
            {n === 0 ? '\u00a0' : ''}
          </div>
        );
      })}
    </div>
  );
};

export const Ok: React.FC<{ p: number; text?: string }> = ({ p, text = 'ESP_OK' }) => (
  <span style={{ ...mono(26, GREEN, { fontWeight: 700 }), opacity: p }}>→ {text}</span>
);

export const Big: React.FC<{ children: React.ReactNode; color?: string; size?: number; p?: number }> = ({ children, color = C.ink, size = 30, p = 1 }) => (
  <div style={{ fontFamily: FONT.sans, fontSize: size, fontWeight: 700, color, opacity: p, transform: `translateY(${(1 - p) * 12}px)` }}>{children}</div>
);
