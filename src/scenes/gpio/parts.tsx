/**
 * GPIO-video parts, reused across scenes:
 *
 *   PinDriver   inside the pin: a 3.3 V / GND switch, the output-enable gate,
 *               the input buffer that's always listening, the pad
 *   Schematic   GPIO 2 → resistor → LED → GND, drawn part by part, with
 *               current dots and voltage-drop labels
 *   SerialLog   a serial-monitor panel whose lines type out
 *   Pill        a status pill (listening / driving / ✓ / ✗)
 *   ViewStage   Kicker + one big panel of crossfading views + caption,
 *               for scenes that aren't about one call
 *
 * Colour meanings (STYLE.md): pin = pink, the wire's voltage = magenta,
 * structure/registers = cyan, your value + the light = amber.
 */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { CaptionLine } from '../../components/CodeToHardware';
import { ease, GREEN, mono, RED } from '../../components/Explainer';
import { Panel } from '../../components/Panel';
import type { Caption } from '../../components/pwm';
import { Kicker, Scene } from '../../components/Type';
import { C, FONT, hexA } from '../../theme/palette';

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
/** eased 0..1 starting at `cue`, over `dur` seconds */
export const after = (t: number, cue: number, dur = 0.45) => ease((t - cue) / dur);
export const mix = (a: number, b: number, u: number) => a + (b - a) * u;
/** smoothstep 0..1 — for glides between two states */
export const inOutLocal = (u: number) => {
  const x = clamp01(u);
  return x * x * (3 - 2 * x);
};

// ── Pill ───────────────────────────────────────────────────────────────────

export const Pill: React.FC<{ children: React.ReactNode; color: string; solid?: boolean; size?: number; style?: React.CSSProperties }> = ({
  children,
  color,
  solid = false,
  size = 24,
  style,
}) => (
  <span
    style={{
      display: 'inline-block',
      padding: `${size * 0.22}px ${size * 0.75}px`,
      borderRadius: 999,
      fontFamily: FONT.mono,
      fontSize: size,
      fontWeight: 700,
      letterSpacing: '.06em',
      color: solid ? '#140818' : color,
      background: solid ? color : hexA(color, 0.12),
      border: `1.5px solid ${hexA(color, 0.75)}`,
      boxShadow: `0 0 22px ${hexA(color, solid ? 0.5 : 0.25)}`,
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {children}
  </span>
);

// ── PinDriver ──────────────────────────────────────────────────────────────

/**
 * Inside one GPIO, drawn in a W × H box (SVG units):
 *
 *   3.3 V ──o
 *            \  ← level switch (amber when HIGH)
 *   GND ────o  o──[ output enable ]──■ pad ── wire →
 *                                    │
 *                              input ◁┘  (always listening)
 *
 * `enable` 0..1 closes the output-enable gate; `level` 0..1 swings the
 * switch from GND to 3.3 V. `wire` draws an LED to ground beyond the pad.
 */
export const PinDriver: React.FC<{
  enable: number;
  level: number;
  pin?: number;
  W?: number;
  H?: number;
  showInput?: number;
  showLed?: boolean;
  dimInternals?: number;
}> = ({ enable, level, pin = 2, W = 1100, H = 420, showInput = 1, showLed = true, dimInternals = 0 }) => {
  const yTop = 70;
  const yBot = H - 70;
  const yMid = (yTop + yBot) / 2;
  const xC = 250; // contacts
  const xP = 380; // switch pivot
  const xG0 = 470; // gate
  const xG1 = 560;
  const xPad = 680;
  const driving = enable > 0.5;
  const hi = driving && level > 0.5;
  const wireCol = hi ? C.amber : driving ? C.cyan : hexA(C.muted, 0.6);
  // switch arm: from pivot to the chosen contact
  const yC = mix(yBot - 60, yTop + 60, level);
  const armAng = Math.atan2(yC - yMid, xC - xP);
  const armLen = Math.hypot(xC - xP, yC - yMid);
  const ax = xP + Math.cos(armAng) * armLen;
  const ay = yMid + Math.sin(armAng) * armLen;
  // gate arm lifts open when disabled
  const gAng = (-32 * (1 - enable) * Math.PI) / 180;
  const gx = xG0 + Math.cos(gAng) * (xG1 - xG0);
  const gy = yMid + Math.sin(gAng) * (xG1 - xG0);
  const internals = 1 - 0.6 * dimInternals;
  const glow = (c: string) => ({ filter: `drop-shadow(0 0 8px ${c})` });
  const ledOn = hi ? 1 : 0;

  return (
    <svg width={W} height={H} style={{ display: 'block', overflow: 'visible' }}>
      {/* the chip boundary */}
      <rect x={20} y={10} width={xPad - 40} height={H - 20} rx={18} fill={hexA(C.purple, 0.06)} stroke={hexA(C.muted, 0.35)} strokeDasharray="8 8" />
      <text x={xPad - 40} y={38} textAnchor="end" style={mono(16, C.muted, { letterSpacing: '.18em' })}>
        INSIDE THE ESP32
      </text>

      <g opacity={internals}>
        {/* rails */}
        <line x1={60} y1={yTop} x2={xC} y2={yTop} stroke={C.amber} strokeWidth={4} style={glow(C.amber)} />
        <text x={60} y={yTop - 16} style={mono(22, C.amber, { fontWeight: 700 })}>
          3.3 V
        </text>
        <line x1={xC} y1={yTop} x2={xC} y2={yTop + 60} stroke={C.amber} strokeWidth={4} />
        <line x1={60} y1={yBot} x2={xC} y2={yBot} stroke={C.muted} strokeWidth={4} />
        <text x={60} y={yBot + 34} style={mono(22, C.muted, { fontWeight: 700 })}>
          GND
        </text>
        <line x1={xC} y1={yBot} x2={xC} y2={yBot - 60} stroke={C.muted} strokeWidth={4} />
        <circle cx={xC} cy={yTop + 60} r={7} fill={C.amber} />
        <circle cx={xC} cy={yBot - 60} r={7} fill={C.muted} />

        {/* level switch */}
        <line x1={xP} y1={yMid} x2={ax} y2={ay} stroke={hi ? C.amber : C.ink} strokeWidth={6} strokeLinecap="round" style={hi ? glow(C.amber) : undefined} />
        <circle cx={xP} cy={yMid} r={8} fill={C.ink} />
        <text x={xP - 6} y={yMid + 48} textAnchor="middle" style={mono(17, C.muted)}>
          level
        </text>

        {/* output enable gate */}
        <line x1={xP} y1={yMid} x2={xG0} y2={yMid} stroke={wireCol} strokeWidth={4} />
        <line x1={xG0} y1={yMid} x2={gx} y2={gy} stroke={driving ? C.cyan : C.ink} strokeWidth={6} strokeLinecap="round" style={driving ? glow(C.cyan) : undefined} />
        <circle cx={xG0} cy={yMid} r={7} fill={C.ink} />
        <circle cx={xG1} cy={yMid} r={7} fill={driving ? C.cyan : C.muted} />
        <text x={(xG0 + xG1) / 2} y={yMid - 52} textAnchor="middle" style={mono(17, driving ? C.cyan : C.muted)}>
          output enable
        </text>
      </g>

      {/* gate → pad */}
      <line x1={xG1} y1={yMid} x2={xPad} y2={yMid} stroke={driving ? wireCol : hexA(C.muted, 0.6)} strokeWidth={4} />

      {/* input buffer: always on (OUTPUT = 0x03 keeps it) */}
      {showInput > 0 && (
        <g opacity={showInput * internals}>
          <line x1={xPad - 40} y1={yMid} x2={xPad - 40} y2={yMid + 90} stroke={C.cyan} strokeWidth={3} />
          <path d={`M ${xPad - 40} ${yMid + 90} L ${xPad - 130} ${yMid + 90}`} stroke={C.cyan} strokeWidth={3} />
          <path d={`M ${xPad - 130} ${yMid + 70} L ${xPad - 170} ${yMid + 90} L ${xPad - 130} ${yMid + 110} Z`} fill={hexA(C.cyan, 0.2)} stroke={C.cyan} strokeWidth={3} />
          <text x={xPad - 180} y={yMid + 97} textAnchor="end" style={mono(17, C.cyan)}>
            input
          </text>
        </g>
      )}

      {/* the pad */}
      <rect x={xPad - 14} y={yMid - 30} width={60} height={60} rx={8} fill={hexA(C.pink, 0.25)} stroke={C.pink} strokeWidth={3} style={glow(C.pink)} />
      <text x={xPad + 16} y={yMid - 46} textAnchor="middle" style={mono(22, C.pink, { fontWeight: 700 })}>
        GPIO {pin}
      </text>

      {/* outside: wire → LED → ground */}
      {showLed && (
        <g>
          <line x1={xPad + 46} y1={yMid} x2={W - 200} y2={yMid} stroke={hi ? C.amber : hexA(C.muted, 0.6)} strokeWidth={4} style={hi ? glow(C.amber) : undefined} />
          <circle cx={W - 160} cy={yMid} r={70} fill={`url(#ledglow)`} opacity={ledOn} />
          <defs>
            <radialGradient id="ledglow">
              <stop offset="0" stopColor={C.amber} stopOpacity={0.9} />
              <stop offset="0.5" stopColor={C.amber} stopOpacity={0.25} />
              <stop offset="1" stopColor={C.amber} stopOpacity={0} />
            </radialGradient>
          </defs>
          <circle cx={W - 160} cy={yMid} r={30} fill={`rgba(255,214,140,${0.1 + 0.9 * ledOn})`} stroke={C.amber} strokeWidth={2.5} />
          <line x1={W - 130} y1={yMid} x2={W - 80} y2={yMid} stroke={hexA(C.muted, 0.6)} strokeWidth={4} />
          <line x1={W - 80} y1={yMid} x2={W - 80} y2={yBot} stroke={hexA(C.muted, 0.6)} strokeWidth={4} />
          <Ground x={W - 80} y={yBot} />
          <text x={W - 160} y={yMid + 66} textAnchor="middle" style={mono(18, C.amber)}>
            LED
          </text>
        </g>
      )}
    </svg>
  );
};

export const Ground: React.FC<{ x: number; y: number; color?: string }> = ({ x, y, color = C.muted }) => (
  <g stroke={color} strokeWidth={4} strokeLinecap="round">
    <line x1={x - 26} y1={y} x2={x + 26} y2={y} />
    <line x1={x - 16} y1={y + 10} x2={x + 16} y2={y + 10} />
    <line x1={x - 7} y1={y + 20} x2={x + 7} y2={y + 20} />
  </g>
);

// ── Schematic ──────────────────────────────────────────────────────────────

/** the circuit path, in VIEW coordinates: pad → resistor → LED → corner → ground */
const SCH = { y: 210, pad: 200, r0: 470, r1: 650, a: 900, k: 980, corner: 1260, gnd: 400 };
const SCH_PATH: [number, number][] = [
  [SCH.pad + 40, SCH.y],
  [SCH.corner, SCH.y],
  [SCH.corner, SCH.gnd],
];
const pathLen = SCH_PATH.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - SCH_PATH[i][0], p[1] - SCH_PATH[i][1]), 0);
function along(d: number): [number, number] {
  let rest = ((d % pathLen) + pathLen) % pathLen;
  for (let i = 1; i < SCH_PATH.length; i++) {
    const [x0, y0] = SCH_PATH[i - 1];
    const [x1, y1] = SCH_PATH[i];
    const L = Math.hypot(x1 - x0, y1 - y0);
    if (rest <= L) return [x0 + ((x1 - x0) * rest) / L, y0 + ((y1 - y0) * rest) / L];
    rest -= L;
  }
  return SCH_PATH[SCH_PATH.length - 1];
}

export const Schematic: React.FC<{
  t: number;
  /** draw-on progress 0..1 per part: pin, resistor, LED, ground */
  parts: [number, number, number, number];
  high: number;
  /** current dots: travelled distance (px) — drive with ∫ speed dt */
  flow?: number;
  flowOn?: number;
  led?: number;
  rLabel?: string;
  /** voltage-drop labels 0..1: across the LED, across the resistor */
  dropLed?: number;
  dropR?: number;
  W?: number;
}> = ({ parts, high, flow = 0, flowOn = 0, led = 0, rLabel = '220 Ω', dropLed = 0, dropR = 0, W = 1544 }) => {
  const [pP, pR, pL, pG] = parts;
  const y = SCH.y;
  const live = high > 0.5;
  const wire = (on: boolean) => (on ? C.amber : hexA(C.muted, 0.7));
  const zig = (() => {
    let d = `M ${SCH.r0} ${y}`;
    const n = 6;
    const w = (SCH.r1 - SCH.r0) / n;
    for (let i = 0; i < n; i++) d += ` L ${SCH.r0 + w * (i + 0.5)} ${y + (i % 2 ? 22 : -22)}`;
    return `${d} L ${SCH.r1} ${y}`;
  })();
  const dots: React.ReactNode[] = [];
  if (flowOn > 0.01) {
    for (let d = 0; d < pathLen; d += 64) {
      const [x, yy] = along(d + flow);
      // skip dots inside the parts' bodies
      if ((x > SCH.r0 + 4 && x < SCH.r1 - 4 && yy === y) || (x > SCH.a - 6 && x < SCH.k + 6 && yy === y)) continue;
      dots.push(<circle key={d} cx={x} cy={yy} r={6} fill="#fff" opacity={flowOn * 0.9} style={{ filter: `drop-shadow(0 0 6px ${C.amber})` }} />);
    }
  }
  return (
    <svg width={W} height={500} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <radialGradient id="schglow">
          <stop offset="0" stopColor={C.amber} stopOpacity={0.95} />
          <stop offset="0.45" stopColor={C.amber} stopOpacity={0.3} />
          <stop offset="1" stopColor={C.amber} stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* pin */}
      <g opacity={pP} transform={`translate(0 ${(1 - pP) * 14})`}>
        <rect x={SCH.pad - 60} y={y - 46} width={100} height={92} rx={12} fill={hexA(C.pink, live ? 0.32 : 0.16)} stroke={C.pink} strokeWidth={3} style={{ filter: `drop-shadow(0 0 ${live ? 16 : 6}px ${C.pink})` }} />
        <text x={SCH.pad - 10} y={y + 9} textAnchor="middle" style={mono(26, C.ink, { fontWeight: 700 })}>
          IO2
        </text>
        <text x={SCH.pad - 10} y={y - 64} textAnchor="middle" style={mono(20, C.pink)}>
          GPIO 2
        </text>
        {live && (
          <text x={SCH.pad - 10} y={y + 82} textAnchor="middle" style={mono(24, C.amber, { fontWeight: 700 })}>
            HIGH · 3.3 V
          </text>
        )}
      </g>
      {/* pin → resistor */}
      <line x1={SCH.pad + 40} y1={y} x2={SCH.pad + 40 + (SCH.r0 - SCH.pad - 40) * pR} y2={y} stroke={wire(live)} strokeWidth={4} />
      {/* resistor */}
      <g opacity={pR}>
        <path d={zig} fill="none" stroke={C.cyan} strokeWidth={4} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 6px ${C.cyan})` }} />
        <text x={(SCH.r0 + SCH.r1) / 2} y={y + 66} textAnchor="middle" style={mono(26, C.cyan, { fontWeight: 700 })}>
          {rLabel}
        </text>
      </g>
      {/* resistor → LED */}
      <line x1={SCH.r1} y1={y} x2={SCH.r1 + (SCH.a - SCH.r1) * pL} y2={y} stroke={wire(live)} strokeWidth={4} opacity={pR > 0.5 ? 1 : 0} />
      {/* LED: diode symbol, anode left */}
      <g opacity={pL}>
        <circle cx={(SCH.a + SCH.k) / 2} cy={y} r={120} fill="url(#schglow)" opacity={led} />
        <path d={`M ${SCH.a} ${y - 34} L ${SCH.k - 8} ${y} L ${SCH.a} ${y + 34} Z`} fill={hexA(C.amber, 0.15 + 0.6 * led)} stroke={C.amber} strokeWidth={3.5} />
        <line x1={SCH.k - 6} y1={y - 36} x2={SCH.k - 6} y2={y + 36} stroke={C.amber} strokeWidth={4} />
        <text x={SCH.a - 14} y={y - 50} textAnchor="end" style={mono(20, C.ink)}>
          + long leg
        </text>
        <text x={SCH.k + 10} y={y - 50} style={mono(20, C.muted)}>
          − short leg
        </text>
        <text x={(SCH.a + SCH.k) / 2} y={y + 72} textAnchor="middle" style={mono(22, C.amber)}>
          LED
        </text>
      </g>
      {/* LED → ground */}
      <path
        d={`M ${SCH.k} ${y} L ${SCH.corner} ${y} L ${SCH.corner} ${SCH.gnd}`}
        fill="none"
        stroke={wire(false)}
        strokeWidth={4}
        pathLength={1}
        strokeDasharray={`${pG} 1`}
      />
      <g opacity={pG}>
        <Ground x={SCH.corner} y={SCH.gnd} />
        <text x={SCH.corner + 44} y={SCH.gnd + 14} style={mono(22, C.muted)}>
          GND · 0 V
        </text>
      </g>
      {dots}
      {/* voltage drops */}
      {dropR > 0 && (
        <g opacity={dropR}>
          <Bracket x0={SCH.r0} x1={SCH.r1} y={y - 70} label="1.3 V" color={C.cyan} />
        </g>
      )}
      {dropLed > 0 && (
        <g opacity={dropLed}>
          <Bracket x0={SCH.a - 10} x1={SCH.k + 10} y={y - 110} label="≈ 2.0 V" color={C.amber} />
        </g>
      )}
    </svg>
  );
};

export const Bracket: React.FC<{ x0: number; x1: number; y: number; label: string; color: string; size?: number }> = ({ x0, x1, y, label, color, size = 24 }) => (
  <g>
    <line x1={x0} y1={y} x2={x1} y2={y} stroke={color} strokeWidth={2.5} />
    <line x1={x0} y1={y - 9} x2={x0} y2={y + 9} stroke={color} strokeWidth={2.5} />
    <line x1={x1} y1={y - 9} x2={x1} y2={y + 9} stroke={color} strokeWidth={2.5} />
    <rect x={(x0 + x1) / 2 - label.length * size * 0.33 - 10} y={y - size - 12} width={label.length * size * 0.66 + 20} height={size + 8} rx={8} fill="rgba(10,4,32,.9)" />
    <text x={(x0 + x1) / 2} y={y - 12} textAnchor="middle" style={mono(size, color, { fontWeight: 700 })}>
      {label}
    </text>
  </g>
);

// ── SerialLog ──────────────────────────────────────────────────────────────

export type LogLine = { at: number; text: string; color?: string };

/** a serial monitor; each line types out from its `at` (≈ 70 chars/s) */
export const SerialLog: React.FC<{ t: number; lines: LogLine[]; size?: number; width?: number | string; label?: string }> = ({
  t,
  lines,
  size = 22,
  width = '100%',
  label = 'serial monitor · 115200 baud',
}) => (
  <div style={{ width }}>
    <Panel label={label} accent={C.muted}>
      <div style={{ fontFamily: FONT.mono, fontSize: size, lineHeight: 1.5, minHeight: size * 1.5 * Math.max(1, lines.length), whiteSpace: 'pre-wrap' }}>
        {lines.map((l, i) => {
          const n = Math.floor(clamp01((t - l.at) * 70 / Math.max(1, l.text.length)) * l.text.length);
          if (t < l.at) return <div key={i}>&nbsp;</div>;
          const caret = n < l.text.length || Math.floor(t * 2) % 2 === 0;
          return (
            <div key={i} style={{ color: l.color ?? C.ink }}>
              {l.text.slice(0, n)}
              {i === lines.filter((x) => t >= x.at).length - 1 && caret ? <span style={{ opacity: 0.8 }}>▌</span> : null}
            </div>
          );
        })}
      </div>
    </Panel>
  </div>
);

// ── ViewStage ──────────────────────────────────────────────────────────────

export type StageView = { at: number; component: React.FC<{ t: number }>; label: string; accent: string; right?: (t: number) => React.ReactNode };
/** drawable area of a ViewStage view */
export const BIG_W = 1544;
export const BIG_H = 700;

export const ViewStage: React.FC<{
  t: number;
  frames: number;
  kicker: string;
  accent?: 'cyan' | 'amber' | 'magenta';
  views: StageView[];
  captions: Caption[];
}> = ({ t, frames, kicker, accent = 'amber', views, captions }) => {
  const order = [...views].sort((a, b) => a.at - b.at);
  let cur = -1;
  order.forEach((v, i) => {
    if (t >= v.at) cur = i;
  });
  const view = cur >= 0 ? order[cur] : null;
  const stageIn = ease((t - (order[0].at - 0.1)) / 0.6);
  return (
    <Scene durationInFrames={frames}>
      <AbsoluteFill>
        <div style={{ position: 'absolute', top: 40, width: '100%', display: 'grid', placeItems: 'center' }}>
          <Kicker delay={0.1} accent={accent}>
            {kicker}
          </Kicker>
        </div>
        {view && (
          <div style={{ position: 'absolute', left: 160, top: 120, width: 1600, height: 790, opacity: stageIn, transform: `translateY(${(1 - stageIn) * 30}px)` }}>
            <Panel label={view.label} accent={view.accent} right={view.right?.(t)}>
              <div style={{ position: 'relative', width: BIG_W, height: BIG_H }}>
                {order.map((v, i) => {
                  const next = order[i + 1]?.at ?? Infinity;
                  const a = ease((t - v.at) / 0.45) * (1 - clamp01((t - (next - 0.35)) / 0.35));
                  if (a <= 0.001) return null;
                  const V = v.component;
                  return (
                    <div key={i} style={{ position: 'absolute', inset: 0, opacity: a }}>
                      <V t={t} />
                    </div>
                  );
                })}
              </div>
            </Panel>
          </div>
        )}
        <div style={{ position: 'absolute', top: 944, width: '100%', display: 'grid', placeItems: 'center' }}>
          <CaptionLine captions={captions} t={t} size={32} />
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

/** ✓ / ✗ verdict card */
export const Verdict: React.FC<{ ok: boolean; children: React.ReactNode; p: number; size?: number; style?: React.CSSProperties }> = ({ ok, children, p, size = 30, style }) => {
  const col = ok ? GREEN : RED;
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${(1 - p) * 16}px)`,
        padding: '18px 26px',
        borderRadius: 16,
        border: `1.5px solid ${hexA(col, 0.7)}`,
        background: hexA(col, 0.08),
        boxShadow: `0 0 30px ${hexA(col, 0.18)}`,
        fontSize: size,
        color: C.ink,
        display: 'flex',
        gap: 16,
        alignItems: 'center',
        ...style,
      }}
    >
      <span style={{ color: col, fontWeight: 800, fontSize: size * 1.2 }}>{ok ? '✓' : '✗'}</span>
      <span>{children}</span>
    </div>
  );
};
