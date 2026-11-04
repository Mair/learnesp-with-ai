/**
 * The section-intro kit (SCRIPT.md "Section intro"): the shared shots every
 * `<section>-intro` video is built from.
 *
 *   IntroFrame   scene wrapper: kicker on top, caption at the bottom
 *   Bench        the WROOM module with parts wired to its pins (LED, button,
 *                speaker, potentiometer, meter), pins that light up
 *   MapCards     the section's videos, one card each, lit as the VO names them
 *   PartsList    "what you need": parts appearing one by one
 *   Checklist    ticks
 *   Terminal     a few typed commands
 *   GoCard       "First up": the first video's card grows to fill the frame
 *
 * Every animation is a pure function of the scene time `t` and cues from the
 * video's timeline.
 */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { CaptionLine } from '../../components/CodeToHardware';
import { ease, GREEN, mono } from '../../components/Explainer';
import type { Caption } from '../../components/pwm';
import { Kicker, Scene } from '../../components/Type';
import { C, FONT, GRAD_TEXT, hexA } from '../../theme/palette';
import { wroomPinXY, Wroom, WROOM_IO_PINS } from '../gpio/board';
import { TactSwitch } from '../gpio-input/parts';
import { after, clamp01 } from '../gpio/parts';

export { after, clamp01, ease, mono, GREEN };

export const RED_LED = '#ff4b3a';

// ── frame ──────────────────────────────────────────────────────────────────

export const IntroFrame: React.FC<{
  frames: number;
  t: number;
  kicker?: string;
  accent?: 'cyan' | 'amber' | 'magenta';
  captions?: Caption[];
  children: React.ReactNode;
}> = ({ frames, t, kicker, accent = 'cyan', captions = [], children }) => (
  <Scene durationInFrames={frames}>
    <AbsoluteFill>
      {kicker && (
        <div style={{ position: 'absolute', top: 44, width: '100%', display: 'grid', placeItems: 'center' }}>
          <Kicker delay={0.2} accent={accent}>
            {kicker}
          </Kicker>
        </div>
      )}
      {children}
      <div style={{ position: 'absolute', top: 960, width: '100%', display: 'grid', placeItems: 'center' }}>
        <CaptionLine captions={captions} t={t} />
      </div>
    </AbsoluteFill>
  </Scene>
);

/** fade/slide a block in at `p` (0..1) */
export const fadeUp = (p: number, dy = 16): React.CSSProperties => ({ opacity: p, transform: `translateY(${(1 - p) * dy}px)` });

/** crossfade weight of view `i` given the times each view starts */
export function viewWeight(t: number, starts: number[], i: number, fade = 0.45): number {
  const a = clamp01((t - starts[i]) / fade);
  const next = starts[i + 1];
  const b = next === undefined ? 0 : clamp01((t - next) / fade);
  return ease(a) * (1 - ease(b));
}

export const Chip: React.FC<{ children: React.ReactNode; color: string; size?: number; p?: number; solid?: boolean; style?: React.CSSProperties }> = ({
  children,
  color,
  size = 20,
  p = 1,
  solid,
  style,
}) => (
  <span
    style={{
      ...mono(size, solid ? '#0a0420' : color, { fontWeight: 700 }),
      display: 'inline-block',
      padding: `${size * 0.22}px ${size * 0.6}px`,
      borderRadius: 999,
      border: `1px solid ${hexA(color, 0.6)}`,
      background: solid ? color : hexA(color, 0.12),
      opacity: p,
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {children}
  </span>
);

// ── bench: the module and its parts ────────────────────────────────────────

export type BenchKind = 'led' | 'button' | 'speaker' | 'pot' | 'meter';
export type BenchItem = {
  kind: BenchKind;
  /** module pin number (WROOM-32E) */
  pin: number;
  gpio: number;
  /** where the part sits, in module-local units (module = 320 × 470 at 0,0) */
  gx: number;
  gy: number;
  /** 0..1 draw-in */
  show: number;
  /** led: brightness · button: pressed · speaker: loudness · pot: 0..1 turn · meter: 0..1 */
  state: number;
  label?: string;
  /** a 220 Ω resistor on the wire (LEDs) */
  resistor?: boolean;
  /** meter readout */
  readout?: string;
};

function pinSide(n: number): 'left' | 'right' | 'bottom' {
  const [x, y] = wroomPinXY(0, 0, n);
  if (y > 470) return 'bottom';
  return x < 100 ? 'left' : 'right';
}

const Resistor: React.FC<{ x: number; y: number; vertical: boolean }> = ({ x, y, vertical }) => (
  <g transform={`translate(${x} ${y}) rotate(${vertical ? 90 : 0})`}>
    <rect x={-30} y={-11} width={60} height={22} rx={10} fill="#e6cc96" stroke="#8a7346" />
    {[
      [-16, '#d42a2a'],
      [-7, '#d42a2a'],
      [2, '#7a4a1e'],
      [18, '#d6b24a'],
    ].map(([bx, c], i) => (
      <rect key={i} x={(bx as number) - 3} y={-11} width={6} height={22} fill={c as string} />
    ))}
  </g>
);

const LedGlyph: React.FC<{ x: number; y: number; on: number; color?: string }> = ({ x, y, on, color = RED_LED }) => (
  <g>
    <circle cx={x} cy={y - 18} r={70 * Math.max(on, 0.001)} fill={color} opacity={0.25 * on} style={{ filter: 'blur(14px)' }} />
    <line x1={x - 10} y1={y + 14} x2={x - 10} y2={y + 40} stroke="#c9ced6" strokeWidth={4} />
    <line x1={x + 10} y1={y + 14} x2={x + 10} y2={y + 48} stroke="#c9ced6" strokeWidth={4} />
    <rect x={x - 26} y={y + 4} width={52} height={12} rx={3} fill={hexA(color, 0.55 + 0.45 * on)} />
    <path
      d={`M ${x - 20} ${y + 4} L ${x - 20} ${y - 26} A 20 20 0 0 1 ${x + 20} ${y - 26} L ${x + 20} ${y + 4} Z`}
      fill={on > 0.05 ? `rgba(255,${120 + 100 * on},${100 + 80 * on},${0.55 + 0.4 * on})` : hexA(color, 0.4)}
      stroke={color}
      strokeWidth={2}
      style={on > 0.05 ? { filter: `drop-shadow(0 0 ${18 * on}px ${color})` } : undefined}
    />
  </g>
);

const SpeakerGlyph: React.FC<{ x: number; y: number; level: number; t: number }> = ({ x, y, level, t }) => (
  <g>
    <rect x={x - 34} y={y - 18} width={20} height={36} rx={3} fill={hexA(C.cyan, 0.5)} stroke={C.cyan} strokeWidth={2} />
    <path d={`M ${x - 14} ${y - 18} L ${x + 12} ${y - 40} L ${x + 12} ${y + 40} L ${x - 14} ${y + 18} Z`} fill={hexA(C.cyan, 0.3)} stroke={C.cyan} strokeWidth={2} />
    {[0, 1, 2].map((k) => {
      const ph = (t * 1.6 + k / 3) % 1;
      return (
        <path
          key={k}
          d={`M ${x + 24 + ph * 40} ${y - 26 - ph * 16} Q ${x + 40 + ph * 48} ${y} ${x + 24 + ph * 40} ${y + 26 + ph * 16}`}
          fill="none"
          stroke={C.cyan}
          strokeWidth={3}
          opacity={level * (1 - ph)}
        />
      );
    })}
  </g>
);

const PotGlyph: React.FC<{ x: number; y: number; turn: number }> = ({ x, y, turn }) => {
  const a = ((-135 + 270 * turn) * Math.PI) / 180;
  return (
    <g>
      {[-18, 0, 18].map((dx) => (
        <line key={dx} x1={x + dx} y1={y + 30} x2={x + dx} y2={y + 56} stroke="#c9ced6" strokeWidth={4} />
      ))}
      <rect x={x - 36} y={y - 30} width={72} height={62} rx={8} fill="#2a5aa8" stroke="#4b7bd0" strokeWidth={2} />
      <circle cx={x} cy={y} r={24} fill="#d9dde3" stroke="#8a919c" strokeWidth={2} />
      <line x1={x} y1={y} x2={x + 20 * Math.sin(a)} y2={y - 20 * Math.cos(a)} stroke="#1a1c20" strokeWidth={5} strokeLinecap="round" />
    </g>
  );
};

const MeterGlyph: React.FC<{ x: number; y: number; value: number; readout?: string }> = ({ x, y, value, readout }) => {
  const a = ((-60 + 120 * clamp01(value)) * Math.PI) / 180;
  return (
    <g>
      <rect x={x - 62} y={y - 44} width={124} height={88} rx={10} fill="#141026" stroke={hexA(C.amber, 0.7)} strokeWidth={2} />
      <path d={`M ${x - 40} ${y + 14} A 46 46 0 0 1 ${x + 40} ${y + 14}`} fill="none" stroke={hexA(C.muted, 0.6)} strokeWidth={3} />
      <line x1={x} y1={y + 24} x2={x + 44 * Math.sin(a)} y2={y + 24 - 44 * Math.cos(a)} stroke={C.amber} strokeWidth={3} strokeLinecap="round" />
      {readout && (
        <text x={x} y={y + 40} textAnchor="middle" style={mono(15, C.amber, { fontWeight: 700 })}>
          {readout}
        </text>
      )}
    </g>
  );
};

export const Bench: React.FC<{
  x: number;
  y: number;
  scale?: number;
  t: number;
  items: BenchItem[];
  /** 0..1: the module's IO pins light up one after another */
  sweep?: number;
  /** 0..1: everything dims except the lit pins */
  dim?: number;
  /** extra pins to light (module numbers) */
  hot?: number[];
  moduleIn?: number;
}> = ({ x, y, scale = 1, t, items, sweep = 0, dim = 0, hot = [], moduleIn = 1 }) => {
  const rest = 1 - 0.78 * dim;
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      <g transform={`translate(${x} ${y}) scale(${scale})`}>
        <g opacity={moduleIn * rest}>
          <Wroom x={0} y={0} showNumbers={0} />
        </g>
        {/* wires first, parts on top */}
        {items.map((it, i) => {
          const [px, py] = wroomPinXY(0, 0, it.pin);
          const side = pinSide(it.pin);
          const live = (it.kind === 'led' || it.kind === 'speaker') && it.state > 0.3;
          // LEDs are wired at their legs, from the side, so the wire never crosses the dome
          const ay = it.kind === 'led' ? it.gy + 44 : it.kind === 'button' ? it.gy - 44 : it.gy;
          const dir = it.gx >= px ? 1 : -1;
          const d =
            side === 'bottom'
              ? `M ${px} ${py} V ${ay} H ${it.gx}`
              : it.kind === 'led'
                ? `M ${px} ${py} H ${it.gx - dir * 70} V ${ay} H ${it.gx}`
                : `M ${px} ${py} H ${it.gx} V ${ay}`;
          const rx = side === 'bottom' ? px : (px + it.gx) / 2;
          const ry = side === 'bottom' ? (py + it.gy) / 2 : py;
          return (
            <g key={`w${i}`} opacity={it.show * rest}>
              <path d={d} fill="none" stroke={live ? C.amber : hexA(C.muted, 0.8)} strokeWidth={4} strokeLinejoin="round" pathLength={1} strokeDasharray={`${it.show} 1`} />
              {it.resistor && it.show > 0.6 && <Resistor x={rx} y={ry} vertical={side === 'bottom'} />}
            </g>
          );
        })}
        {items.map((it, i) => (
          <g key={`g${i}`} opacity={it.show * rest}>
            {it.kind === 'led' && <LedGlyph x={it.gx} y={it.gy} on={it.state} />}
            {it.kind === 'button' && <TactSwitch x={it.gx} y={it.gy} press={it.state} size={76} />}
            {it.kind === 'speaker' && <SpeakerGlyph x={it.gx} y={it.gy} level={it.state} t={t} />}
            {it.kind === 'pot' && <PotGlyph x={it.gx} y={it.gy} turn={it.state} />}
            {it.kind === 'meter' && <MeterGlyph x={it.gx} y={it.gy} value={it.state} readout={it.readout} />}
            <text x={it.gx} y={it.gy + (it.kind === 'meter' ? 76 : 84)} textAnchor="middle" style={mono(19, C.pink, { fontWeight: 700 })}>
              GPIO {it.gpio}
            </text>
            {it.label && (
              <text x={it.gx} y={it.gy + (it.kind === 'meter' ? 100 : 108)} textAnchor="middle" style={mono(16, C.muted)}>
                {it.label}
              </text>
            )}
          </g>
        ))}
        {/* lit pins */}
        {WROOM_IO_PINS.map(([n], i) => {
          const on = Math.max(clamp01(sweep * WROOM_IO_PINS.length - i), hot.includes(n) ? 1 : 0);
          if (on <= 0) return null;
          const [px, py] = wroomPinXY(0, 0, n);
          const side = pinSide(n);
          return (
            <rect
              key={n}
              x={side === 'bottom' ? px - 4 : px}
              y={side === 'bottom' ? py - 16 : py - 4}
              width={side === 'bottom' ? 8 : 16}
              height={side === 'bottom' ? 16 : 8}
              rx={2}
              fill={C.pink}
              opacity={on}
              style={{ filter: `drop-shadow(0 0 8px ${C.pink})` }}
            />
          );
        })}
      </g>
    </svg>
  );
};

// ── the map ────────────────────────────────────────────────────────────────

export type MapCardData = { title: string; slug: string; promise: string; calls?: string[]; at: number };
export type Demo = React.FC<{ t: number; on: number }>;

export const MapCard: React.FC<{
  n: number;
  card: MapCardData;
  t: number;
  lit: number;
  current: number;
  w: number;
  h: number;
  demo?: Demo;
  compact?: boolean;
  /** the demo's clock starts here (default: when the card lights) */
  demoT0?: number;
}> = ({ n, card, t, lit, current, w, h, demo: D, compact, demoT0 }) => {
  const accent = C.cyan;
  return (
    <div
      style={{
        width: w,
        height: h,
        boxSizing: 'border-box',
        borderRadius: compact ? 14 : 20,
        padding: compact ? '14px 16px' : '22px 24px',
        background: `linear-gradient(165deg, ${hexA(C.purple, 0.1 + 0.12 * lit)}, ${hexA('#0a0420', 0.85)})`,
        border: `${current > 0.5 ? 2 : 1}px solid ${current > 0.5 ? hexA(accent, 0.9) : `rgba(255,255,255,${0.08 + 0.1 * lit})`}`,
        boxShadow: current > 0.01 ? `0 0 ${40 * current}px ${hexA(accent, 0.35 * current)}, 0 20px 60px rgba(0,0,0,.5)` : '0 20px 60px rgba(0,0,0,.5)',
        opacity: 0.32 + 0.68 * lit,
        display: 'flex',
        flexDirection: 'column',
        gap: compact ? 6 : 10,
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <span style={mono(compact ? 15 : 18, hexA(C.amber, 0.9), { fontWeight: 700 })}>{String(n).padStart(2, '0')}</span>
        <span style={{ fontFamily: FONT.sans, fontSize: compact ? 23 : 32, fontWeight: 700, color: C.ink }}>{card.title}</span>
      </div>
      <div style={{ fontFamily: FONT.sans, fontSize: compact ? 17 : 23, color: '#cfd6ff', lineHeight: 1.3 }}>{card.promise}</div>
      {card.calls && card.calls.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {card.calls.map((c) => (
            <span key={c} style={mono(compact ? 13 : 17, C.cyan, { padding: '2px 10px', borderRadius: 8, background: hexA(C.cyan, 0.1), border: `1px solid ${hexA(C.cyan, 0.3)}` })}>
              {c}
            </span>
          ))}
        </div>
      )}
      {D && (
        <div style={{ flex: 1, position: 'relative', display: 'grid', placeItems: 'center', minHeight: 0 }}>
          <D t={t - (demoT0 ?? card.at)} on={lit} />
        </div>
      )}
      {card.slug && <div style={{ ...mono(compact ? 12 : 15, C.muted), marginTop: 'auto' }}>{card.slug}</div>}
    </div>
  );
};

/**
 * The section's videos in a grid. Cards are dimmed from `inAt`, light at their
 * own `at`, and the most recently lit card glows.
 */
export const MapCards: React.FC<{
  t: number;
  cards: MapCardData[];
  inAt: number;
  cols: number;
  w: number;
  h: number;
  gap?: number;
  top: number;
  demos?: (Demo | undefined)[];
  compact?: boolean;
  arrows?: boolean;
  /** cards per row, if not all rows hold `cols` */
  rowSizes?: number[];
}> = ({ t, cards, inAt, cols, w, h, gap = 28, top, demos = [], compact, arrows = true, rowSizes }) => {
  const sizes = rowSizes ?? Array.from({ length: Math.ceil(cards.length / cols) }, (_, r) => Math.min(cols, cards.length - r * cols));
  const starts = sizes.map((_, r) => sizes.slice(0, r).reduce((a, b) => a + b, 0));
  let currentIdx = -1;
  cards.forEach((c, i) => {
    if (t >= c.at) currentIdx = i;
  });
  const currentAt = currentIdx >= 0 ? cards[currentIdx].at : 0;
  return (
    <div style={{ position: 'absolute', top, width: '100%', display: 'grid', justifyContent: 'center', gap }}>
      {sizes.map((size, r) => {
        const row = cards.slice(starts[r], starts[r] + size);
        return (
          <div key={r} style={{ display: 'flex', gap, justifyContent: 'center', alignItems: 'center' }}>
            {row.map((c, j) => {
              const i = starts[r] + j;
              const appear = after(t, inAt + 0.08 * i, 0.4);
              const lit = after(t, c.at, 0.4);
              const cur = cards[i].at === currentAt && currentIdx >= 0 ? lit : 0;
              return (
                <React.Fragment key={i}>
                  {arrows && j > 0 && <span style={{ ...mono(28, hexA(C.muted, 0.7)), opacity: appear, marginLeft: -gap / 2 - 8, marginRight: -gap / 2 - 8 }}>›</span>}
                  <div style={fadeUp(appear, 20)}>
                    <MapCard n={i + 1} card={c} t={t} lit={lit} current={cur} w={w} h={h} demo={demos[i]} compact={compact} />
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

// ── what you need ──────────────────────────────────────────────────────────

export type PartKind = 'board' | 'usb' | 'breadboard' | 'wires' | 'led' | 'resistor' | 'button' | 'speaker' | 'pot' | 'laptop';
export type PartItem = { at: number; kind: PartKind; label: string; sub?: string };

export const PartIcon: React.FC<{ kind: PartKind; t?: number }> = ({ kind, t = 0 }) => (
  <svg width={150} height={110} viewBox="-75 -55 150 110" style={{ overflow: 'visible' }}>
    {kind === 'board' && (
      <g>
        <rect x={-62} y={-30} width={124} height={60} rx={6} fill="#1b1b1f" stroke="#444" />
        <rect x={-30} y={-24} width={70} height={48} rx={4} fill="#123029" stroke={hexA(C.ink, 0.3)} />
        <rect x={-14} y={-14} width={40} height={30} rx={3} fill="#9aa3ad" opacity={0.4} />
        <rect x={-62} y={-10} width={16} height={20} rx={2} fill="#bfc4cc" />
        {Array.from({ length: 12 }, (_, i) => (
          <React.Fragment key={i}>
            <rect x={-54 + i * 10} y={-34} width={5} height={6} fill="#d8c38a" />
            <rect x={-54 + i * 10} y={28} width={5} height={6} fill="#d8c38a" />
          </React.Fragment>
        ))}
      </g>
    )}
    {kind === 'usb' && (
      <g fill="none" stroke="#bfc4cc" strokeWidth={6} strokeLinecap="round">
        <path d="M -60 20 C -20 20, -30 -24, 20 -20 L 40 -20" />
        <rect x={40} y={-30} width={26} height={20} rx={3} fill="#bfc4cc" stroke="none" />
        <rect x={-70} y={12} width={14} height={16} rx={2} fill="#bfc4cc" stroke="none" />
      </g>
    )}
    {kind === 'breadboard' && (
      <g>
        <rect x={-66} y={-36} width={132} height={72} rx={6} fill="#ece9e2" />
        <line x1={-66} y1={0} x2={66} y2={0} stroke="#cfcac0" strokeWidth={6} />
        {Array.from({ length: 12 }, (_, i) =>
          [-26, -16, 12, 22].map((yy) => <rect key={`${i}${yy}`} x={-58 + i * 10.5} y={yy} width={4} height={4} fill="#6b665e" />),
        )}
        <line x1={-62} y1={-31} x2={62} y2={-31} stroke="#d33" strokeWidth={2} />
        <line x1={-62} y1={31} x2={62} y2={31} stroke="#36c" strokeWidth={2} />
      </g>
    )}
    {kind === 'wires' && (
      <g fill="none" strokeWidth={5} strokeLinecap="round">
        <path d="M -60 20 Q -10 -50 60 10" stroke="#e33" />
        <path d="M -60 30 Q 0 -20 60 25" stroke="#2a8" />
        <path d="M -60 -10 Q 10 50 60 -20" stroke="#36c" />
      </g>
    )}
    {kind === 'led' && (
      <g transform="translate(0 -6)">
        <LedGlyph x={0} y={0} on={0.85} />
      </g>
    )}
    {kind === 'resistor' && (
      <g>
        <line x1={-66} y1={0} x2={66} y2={0} stroke="#bfc4cc" strokeWidth={4} />
        <g transform="scale(1.4)">
          <Resistor x={0} y={0} vertical={false} />
        </g>
      </g>
    )}
    {kind === 'button' && <TactSwitch x={0} y={0} press={0} size={70} />}
    {kind === 'speaker' && <SpeakerGlyph x={-6} y={0} level={0.8} t={t} />}
    {kind === 'pot' && <PotGlyph x={0} y={-10} turn={0.6} />}
    {kind === 'laptop' && (
      <g>
        <rect x={-50} y={-42} width={100} height={64} rx={5} fill="#141026" stroke={hexA(C.cyan, 0.7)} strokeWidth={2} />
        <text x={-40} y={-20} style={mono(11, GREEN)}>
          $ idf.py
        </text>
        <path d="M -66 26 L 66 26 L 56 36 L -56 36 Z" fill="#3a3550" />
      </g>
    )}
  </svg>
);

export const PartsList: React.FC<{ t: number; items: PartItem[]; top: number; cols?: number; w?: number }> = ({ t, items, top, cols = 6, w = 250 }) => (
  <div style={{ position: 'absolute', top, width: '100%', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 26, padding: '0 120px', boxSizing: 'border-box' }}>
    {items.map((it, i) => {
      const p = after(t, it.at, 0.45);
      return (
        <div
          key={i}
          style={{
            ...fadeUp(p, 24),
            width: w,
            flex: `0 0 ${w}px`,
            maxWidth: `calc(${100 / cols}% - 26px)`,
            display: 'grid',
            justifyItems: 'center',
            gap: 8,
            padding: '18px 10px 16px',
            borderRadius: 16,
            background: hexA(C.purple, 0.12),
            border: '1px solid rgba(255,255,255,.09)',
          }}
        >
          <PartIcon kind={it.kind} t={t} />
          <div style={{ fontSize: 24, fontWeight: 600, color: C.ink, textAlign: 'center' }}>{it.label}</div>
          {it.sub && <div style={{ ...mono(16, C.muted), textAlign: 'center' }}>{it.sub}</div>}
        </div>
      );
    })}
  </div>
);

export const Checklist: React.FC<{ t: number; items: { at: number; label: string; sub?: string }[]; style?: React.CSSProperties; size?: number }> = ({ t, items, style, size = 30 }) => (
  <div style={{ display: 'grid', gap: 14, ...style }}>
    {items.map((it, i) => {
      const p = after(t, it.at, 0.35);
      return (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 18, ...fadeUp(p, 10) }}>
          <span
            style={{
              width: size * 1.1,
              height: size * 1.1,
              borderRadius: 8,
              border: `2px solid ${GREEN}`,
              display: 'grid',
              placeItems: 'center',
              color: GREEN,
              fontSize: size * 0.8,
              fontWeight: 800,
              background: hexA(GREEN, 0.12 * p),
            }}
          >
            ✓
          </span>
          <span style={{ fontSize: size, color: C.ink, fontWeight: 600 }}>{it.label}</span>
          {it.sub && <span style={mono(size * 0.6, C.muted)}>{it.sub}</span>}
        </div>
      );
    })}
  </div>
);

export const Terminal: React.FC<{ t: number; lines: { at: number; text: string; out?: boolean }[]; w?: number; style?: React.CSSProperties }> = ({ t, lines, w = 820, style }) => (
  <div
    style={{
      width: w,
      boxSizing: 'border-box',
      borderRadius: 14,
      background: '#0b0818',
      border: `1px solid ${hexA(C.cyan, 0.35)}`,
      boxShadow: '0 24px 70px rgba(0,0,0,.55)',
      padding: '16px 24px 22px',
      ...style,
    }}
  >
    <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
      {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
        <span key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c, opacity: 0.8 }} />
      ))}
    </div>
    {lines.map((l, i) => {
      if (t < l.at) return null;
      const n = l.out ? l.text.length : Math.floor(clamp01((t - l.at) / 0.9) * l.text.length);
      return (
        <div key={i} style={mono(24, l.out ? C.muted : C.ink, { lineHeight: 1.6, whiteSpace: 'pre' })}>
          {!l.out && <span style={{ color: GREEN }}>$ </span>}
          {l.text.slice(0, n)}
        </div>
      );
    })}
  </div>
);

// ── go ─────────────────────────────────────────────────────────────────────

export const GoCard: React.FC<{ t: number; at: number; n: number; card: MapCardData; demo?: Demo; nextLabel: string }> = ({ t, at, n, card, demo, nextLabel }) => {
  const p = after(t, at, 0.7);
  const s = 0.55 + 0.45 * p;
  const nx = after(t, at + 0.9, 0.5);
  return (
    <AbsoluteFill style={{ display: 'grid', placeItems: 'center', alignContent: 'center', gap: 36 }}>
      <div style={{ ...GRAD_TEXT, fontSize: 96, fontWeight: 800, letterSpacing: '.03em', ...fadeUp(after(t, at - 0.3, 0.5)) }}>First up</div>
      <div style={{ transform: `scale(${s})`, opacity: 0.4 + 0.6 * p }}>
        <MapCard n={n} card={card} t={t} lit={1} current={p} w={980} h={demo ? 430 : 300} demo={demo} demoT0={at - 0.4} />
      </div>
      <div style={{ ...mono(26, C.muted), opacity: nx }}>
        next: <span style={{ color: C.ink }}>{nextLabel}</span> → <span style={{ color: C.cyan }}>{card.slug}</span>
      </div>
    </AbsoluteFill>
  );
};
