/**
 * GPIO-input parts, reused across scenes:
 *
 *   InputPin   inside the pin, the listening side: the pull-up and pull-down
 *              (switch + 45 kΩ each), the input-enable gate (FUN_IE), the
 *              input buffer, the GPIO_IN bit it lands in, the (off) output
 *              driver — and outside, a push-button to GND or to 3.3 V
 *   pinState   the pad voltage for a given pull + button state
 *   VTrace     the pad voltage over time against the datasheet's bands
 *              (1 above 2.475 V, 0 below 0.825 V, undefined between)
 *   TactSwitch a 6 mm tactile push-button, top view, for the breadboard
 *
 * Colour meanings (STYLE.md): pin = pink, the wire's voltage = magenta,
 * structure/registers = cyan, the value your code reads = amber.
 */
import React from 'react';
import { GREEN, mono, RED } from '../../components/Explainer';
import { C, hexA } from '../../theme/palette';
import { Ground } from '../gpio/parts';
import { floatV, VDD, VIH, VIL } from './timeline';

export { after, clamp01, inOutLocal, mix, Pill, Verdict, ViewStage, BIG_W, BIG_H, SerialLog } from '../gpio/parts';

// ── the pad voltage ───────────────────────────────────────────────────────

export type PinCfg = { wpu: number; wpd: number; press: number; to?: 'gnd' | 'vcc'; s?: number };

/** pad voltage; `floating` = nothing holds it (then it wanders, `floatV`) */
export function pinState({ wpu, wpd, press, to = 'gnd', s = 0 }: PinCfg): { v: number; floating: boolean } {
  if (press > 0.5) return { v: to === 'gnd' ? 0 : VDD, floating: false };
  const up = wpu > 0.5;
  const dn = wpd > 0.5;
  if (up && dn) return { v: VDD / 2, floating: false };
  if (up) return { v: VDD, floating: false };
  if (dn) return { v: 0, floating: false };
  return { v: floatV(s), floating: true };
}

export const fmtV = (v: number) => `${v.toFixed(v === 0 || v === VDD ? 1 : 2)} V`;

// ── InputPin ──────────────────────────────────────────────────────────────

const Y = 220; // the signal line
const RAIL = 40;
const GNDY = 400;
const XN = 600; // pull node
const XPAD = 700;
const XG0 = 480; // input-enable gate (right pivot → left contact)
const XG1 = 400;
const XB = 330; // buffer tip
const XA = 870; // button contacts
const XB2 = 970;
const XR = 1060; // button → rail / ground

const zigV = (x: number, y0: number, y1: number) => {
  const n = 6;
  const h = (y1 - y0) / n;
  let d = `M ${x} ${y0}`;
  for (let i = 0; i < n; i++) d += ` L ${x + (i % 2 ? 16 : -16)} ${y0 + h * (i + 0.5)}`;
  return `${d} L ${x} ${y1}`;
};

/** a switch drawn between (x, y0) [pivot] and (x, y1) [contact]; open swings it out by `ang` */
const VSwitch: React.FC<{ x: number; y0: number; y1: number; closed: number; color: string; label: string; labelSide?: 'left' | 'right' }> = ({
  x,
  y0,
  y1,
  closed,
  color,
  label,
  labelSide = 'left',
}) => {
  const ang = ((1 - closed) * 34 * Math.PI) / 180;
  const L = Math.abs(y1 - y0);
  const dir = Math.sign(y1 - y0);
  const ex = x + Math.sin(ang) * L;
  const ey = y0 + dir * Math.cos(ang) * L;
  const on = closed > 0.5;
  return (
    <g>
      <line x1={x} y1={y0} x2={ex} y2={ey} stroke={on ? color : C.ink} strokeWidth={5} strokeLinecap="round" style={on ? { filter: `drop-shadow(0 0 6px ${color})` } : undefined} />
      <circle cx={x} cy={y0} r={6} fill={C.ink} />
      <circle cx={x} cy={y1} r={6} fill={on ? color : C.muted} />
      <text
        x={labelSide === 'left' ? x - 26 : x + 26}
        y={(y0 + y1) / 2 + 6}
        textAnchor={labelSide === 'left' ? 'end' : 'start'}
        style={mono(17, on ? color : C.muted, { fontWeight: 700 })}
      >
        {label}
      </text>
    </g>
  );
};

export const InputPin: React.FC<{
  /** input enable (FUN_IE) 0..1 */
  ie: number;
  wpu: number;
  wpd: number;
  /** finger on the button 0..1 */
  press: number;
  to?: 'gnd' | 'vcc';
  /** pad voltage + what the input register reads (null hides the reading) */
  v: number;
  floating?: boolean;
  reading?: 0 | 1 | null;
  /** 0..1 — show the pull-up / pull-down branches, the button, the (off) output driver */
  showUp?: number;
  showDown?: number;
  showButton?: number;
  showDriver?: number;
  /** current dots through the pull-up when pressed */
  flow?: number;
  flowOn?: number;
  pin?: number;
  width?: number;
  /** highlight one part: 'ie' | 'wpu' | 'wpd' | 'driver' */
  focus?: string | null;
}> = ({ ie, wpu, wpd, press, to = 'gnd', v, floating = false, reading = null, showUp = 1, showDown = 1, showButton = 1, showDriver = 0, flow = 0, flowOn = 0, pin = 18, width = 1100, focus = null }) => {
  const H = 440;
  const sigCol = floating ? hexA(C.muted, 0.9) : v >= VIH ? C.amber : v <= VIL ? C.cyan : RED;
  const glow = (c: string) => ({ filter: `drop-shadow(0 0 8px ${c})` });
  const ring = (on: boolean) => (on ? { filter: `drop-shadow(0 0 14px ${C.amber})` } : undefined);
  const ieOn = ie > 0.5;
  // button lever: pivot at XA, swings down onto XB2 when pressed
  const bAng = ((1 - press) * -28 * Math.PI) / 180;
  const bx = XA + Math.cos(bAng) * (XB2 - XA);
  const by = Y + Math.sin(bAng) * (XB2 - XA);
  const pressed = press > 0.5;
  const bCol = pressed ? (to === 'gnd' ? C.cyan : C.amber) : C.ink;

  // current path for dots: rail → pull-up → node → pad → button → ground
  const path: [number, number][] = [
    [XN, RAIL],
    [XN, Y],
    [XR, Y],
    [XR, GNDY],
  ];
  const segL = path.slice(1).map((p, i) => Math.hypot(p[0] - path[i][0], p[1] - path[i][1]));
  const total = segL.reduce((a, b) => a + b, 0);
  const at = (d: number): [number, number] => {
    let r = ((d % total) + total) % total;
    for (let i = 0; i < segL.length; i++) {
      if (r <= segL[i]) return [path[i][0] + ((path[i + 1][0] - path[i][0]) * r) / segL[i], path[i][1] + ((path[i + 1][1] - path[i][1]) * r) / segL[i]];
      r -= segL[i];
    }
    return path[path.length - 1];
  };
  const dots: React.ReactNode[] = [];
  if (flowOn > 0.01) {
    for (let d = 0; d < total; d += 56) {
      const [x, y] = at(d + flow);
      if (x === XN && y > 60 && y < 160) continue; // inside the resistor body
      if (y === Y && x > XA - 4 && x < XB2 + 4) continue;
      dots.push(<circle key={d} cx={x} cy={y} r={5} fill="#fff" opacity={0.9 * flowOn} style={glow(C.amber)} />);
    }
  }

  return (
    <svg viewBox={`0 0 1140 ${H}`} width={width} height={(width * H) / 1140} style={{ display: 'block', overflow: 'visible' }}>
      {/* the chip */}
      <rect x={20} y={8} width={XPAD - 40} height={H - 16} rx={18} fill={hexA(C.purple, 0.06)} stroke={hexA(C.muted, 0.35)} strokeDasharray="8 8" />
      <text x={36} y={36} style={mono(15, C.muted, { letterSpacing: '.18em' })}>
        INSIDE THE ESP32
      </text>

      {/* pull-up: rail · resistor · switch */}
      <g opacity={showUp}>
        <line x1={XN - 90} y1={RAIL} x2={XN + 40} y2={RAIL} stroke={C.amber} strokeWidth={4} />
        <text x={XN - 96} y={RAIL + 7} textAnchor="end" style={mono(19, C.amber, { fontWeight: 700 })}>
          3.3 V
        </text>
        <path d={zigV(XN, RAIL, 150)} fill="none" stroke={wpu > 0.5 ? C.amber : hexA(C.muted, 0.8)} strokeWidth={3.5} strokeLinejoin="round" style={wpu > 0.5 ? ring(focus === 'wpu') : undefined} />
        <text x={XN + 26} y={100} style={mono(17, wpu > 0.5 ? C.amber : C.muted)}>
          45 kΩ
        </text>
        <VSwitch x={XN} y0={Y - 26} y1={156} closed={wpu} color={C.amber} label="pull-up" />
        <line x1={XN} y1={150} x2={XN} y2={156} stroke={C.muted} strokeWidth={3} />
        <line x1={XN} y1={Y} x2={XN} y2={Y - 26} stroke={sigCol} strokeWidth={4} />
      </g>
      {/* pull-down: switch · resistor · ground */}
      <g opacity={showDown}>
        <VSwitch x={XN} y0={Y + 26} y1={284} closed={wpd} color={C.cyan} label="pull-down" />
        <path d={zigV(XN, 290, 372)} fill="none" stroke={wpd > 0.5 ? C.cyan : hexA(C.muted, 0.8)} strokeWidth={3.5} strokeLinejoin="round" />
        <line x1={XN} y1={284} x2={XN} y2={290} stroke={C.muted} strokeWidth={3} />
        <text x={XN + 26} y={336} style={mono(17, wpd > 0.5 ? C.cyan : C.muted)}>
          45 kΩ
        </text>
        <line x1={XN} y1={372} x2={XN} y2={GNDY} stroke={C.muted} strokeWidth={4} />
        <Ground x={XN} y={GNDY} />
        <line x1={XN} y1={Y} x2={XN} y2={Y + 26} stroke={sigCol} strokeWidth={4} />
      </g>

      {/* the signal line: gate → node → pad */}
      <line x1={XG0} y1={Y} x2={XPAD} y2={Y} stroke={sigCol} strokeWidth={4} />
      <circle cx={XN} cy={Y} r={6} fill={sigCol} />

      {/* input-enable gate (FUN_IE) */}
      {(() => {
        const ang = ((1 - ie) * 30 * Math.PI) / 180;
        const gx = XG0 - Math.cos(ang) * (XG0 - XG1);
        const gy = Y - Math.sin(ang) * (XG0 - XG1);
        return (
          <g style={ring(focus === 'ie')}>
            <line x1={XG0} y1={Y} x2={gx} y2={gy} stroke={ieOn ? C.cyan : C.ink} strokeWidth={6} strokeLinecap="round" style={ieOn ? glow(C.cyan) : undefined} />
            <circle cx={XG0} cy={Y} r={7} fill={C.ink} />
            <circle cx={XG1} cy={Y} r={7} fill={ieOn ? C.cyan : C.muted} />
            <text x={XG1 + 10} y={Y - 64} textAnchor="middle" style={mono(17, ieOn ? C.cyan : C.muted, { fontWeight: 700 })}>
              input enable
            </text>
          </g>
        );
      })()}
      {/* buffer → the input register bit */}
      <line x1={XG1} y1={Y} x2={XB + 50} y2={Y} stroke={ieOn ? sigCol : hexA(C.muted, 0.5)} strokeWidth={4} />
      <path d={`M ${XB + 50} ${Y - 26} L ${XB} ${Y} L ${XB + 50} ${Y + 26} Z`} fill={hexA(C.cyan, ieOn ? 0.25 : 0.06)} stroke={ieOn ? C.cyan : C.muted} strokeWidth={3} />
      <line x1={XB} y1={Y} x2={250} y2={Y} stroke={ieOn ? C.cyan : hexA(C.muted, 0.5)} strokeWidth={4} />
      <g>
        <rect x={60} y={Y - 56} width={190} height={112} rx={14} fill="rgba(10,4,32,.85)" stroke={reading === null ? hexA(C.muted, 0.4) : C.amber} strokeWidth={2} />
        <text x={155} y={Y - 30} textAnchor="middle" style={mono(15, C.muted, { letterSpacing: '.08em' })}>
          GPIO_IN · bit {pin}
        </text>
        <text x={155} y={Y + 34} textAnchor="middle" style={mono(56, reading === null ? hexA(C.muted, 0.5) : C.amber, { fontWeight: 800 })}>
          {reading === null ? '·' : reading}
        </text>
      </g>

      {/* output driver: off */}
      {showDriver > 0 && (
        <g opacity={showDriver} style={ring(focus === 'driver')}>
          <rect x={150} y={318} width={210} height={62} rx={12} fill="rgba(10,4,32,.6)" stroke={hexA(C.muted, 0.6)} strokeDasharray="6 6" />
          <text x={255} y={345} textAnchor="middle" style={mono(17, C.muted)}>
            output driver
          </text>
          <text x={255} y={368} textAnchor="middle" style={mono(17, RED, { fontWeight: 700 })}>
            off
          </text>
          <path d={`M 360 349 L 520 349 L 520 ${Y + 60}`} fill="none" stroke={hexA(C.muted, 0.45)} strokeWidth={3} strokeDasharray="6 6" />
          <text x={520} y={Y + 80} textAnchor="middle" style={mono(22, RED, { fontWeight: 800 })}>
            ✕
          </text>
        </g>
      )}

      {/* the pad */}
      <rect x={XPAD - 30} y={Y - 30} width={60} height={60} rx={8} fill={hexA(C.pink, 0.25)} stroke={C.pink} strokeWidth={3} style={glow(C.pink)} />
      <text x={XPAD} y={Y - 44} textAnchor="middle" style={mono(21, C.pink, { fontWeight: 700 })}>
        GPIO {pin}
      </text>
      <text x={XPAD} y={Y + 66} textAnchor="middle" style={mono(24, sigCol, { fontWeight: 800 })}>
        {floating ? '? floating' : fmtV(v)}
      </text>

      {/* outside: pad → button → GND or 3.3 V */}
      <g opacity={showButton}>
        <line x1={XPAD + 30} y1={Y} x2={XA} y2={Y} stroke={sigCol} strokeWidth={4} />
        <line x1={XA} y1={Y} x2={bx} y2={by} stroke={bCol} strokeWidth={6} strokeLinecap="round" />
        <circle cx={XA} cy={Y} r={7} fill={C.ink} />
        <circle cx={XB2} cy={Y} r={7} fill={pressed ? bCol : C.muted} />
        {/* the finger's cap */}
        <line x1={(XA + XB2) / 2} y1={Y - 82 + 30 * press} x2={(XA + XB2) / 2} y2={(Y + by) / 2 - 6} stroke={hexA(C.ink, 0.6)} strokeWidth={3} />
        <rect x={(XA + XB2) / 2 - 34} y={Y - 98 + 30 * press} width={68} height={16} rx={5} fill={hexA(C.ink, 0.85)} />
        <text x={(XA + XB2) / 2} y={Y + 46} textAnchor="middle" style={mono(17, C.muted)}>
          button
        </text>
        {to === 'gnd' ? (
          <>
            <path d={`M ${XB2} ${Y} L ${XR} ${Y} L ${XR} ${GNDY}`} fill="none" stroke={hexA(C.muted, 0.8)} strokeWidth={4} />
            <Ground x={XR} y={GNDY} />
            <text x={XR + 36} y={GNDY + 8} style={mono(18, C.muted)}>
              GND
            </text>
          </>
        ) : (
          <>
            <path d={`M ${XB2} ${Y} L ${XR} ${Y} L ${XR} ${RAIL}`} fill="none" stroke={C.amber} strokeWidth={4} />
            <line x1={XR - 40} y1={RAIL} x2={XR + 40} y2={RAIL} stroke={C.amber} strokeWidth={4} />
            <text x={XR} y={RAIL - 12} textAnchor="middle" style={mono(18, C.amber, { fontWeight: 700 })}>
              3.3 V
            </text>
          </>
        )}
      </g>
      {dots}
    </svg>
  );
};

// ── VTrace ────────────────────────────────────────────────────────────────

export type Read = { s: number; val: 0 | 1 };

/**
 * The pad voltage over [s0, s1] (s = any time unit) against the datasheet's
 * bands. `vAt` gives the voltage; `upTo` stops the trace at "now".
 */
export const VTrace: React.FC<{
  W: number;
  H: number;
  s0: number;
  s1: number;
  vAt: (s: number) => number;
  upTo?: number;
  bands?: number;
  reads?: Read[];
  readsLabel?: string;
  xLabel?: (s: number) => string;
  xTicks?: number[];
  color?: string;
}> = ({ W, H, s0, s1, vAt, upTo = Infinity, bands = 1, reads = [], xLabel, xTicks = [], color = C.magenta }) => {
  const L = 150;
  const R = W - 150;
  const T = 44;
  const B = H - 40;
  const x = (s: number) => L + ((s - s0) / (s1 - s0)) * (R - L);
  const y = (v: number) => B - (v / VDD) * (B - T);
  const end = Math.min(s1, upTo);
  // NaN = no signal there (gap in the trace)
  let d = '';
  let pen = false;
  const n = 480;
  for (let i = 0; i <= n; i++) {
    const s = s0 + ((s1 - s0) * i) / n;
    if (s > end) break;
    const v = vAt(s);
    if (Number.isNaN(v)) {
      pen = false;
      continue;
    }
    d += `${pen ? ' L' : ' M'} ${x(s).toFixed(1)} ${y(v).toFixed(1)}`;
    pen = true;
  }
  return (
    <svg width={W} height={H} style={{ display: 'block', overflow: 'visible' }}>
      <g opacity={bands}>
        <rect x={L} y={y(VDD)} width={R - L} height={y(VIH) - y(VDD)} fill={hexA(GREEN, 0.08)} />
        <rect x={L} y={y(VIL)} width={R - L} height={y(0) - y(VIL)} fill={hexA(GREEN, 0.08)} />
        <rect x={L} y={y(VIH)} width={R - L} height={y(VIL) - y(VIH)} fill="rgba(255,255,255,.035)" />
        {[VIH, VIL].map((v) => (
          <line key={v} x1={L} y1={y(v)} x2={R} y2={y(v)} stroke={hexA(GREEN, 0.5)} strokeWidth={1.5} strokeDasharray="6 6" />
        ))}
        <text x={L - 14} y={y(VIH) + 6} textAnchor="end" style={mono(17, GREEN)}>
          2.475 V
        </text>
        <text x={L - 14} y={y(VIL) + 6} textAnchor="end" style={mono(17, GREEN)}>
          0.825 V
        </text>
        <text x={R + 14} y={(y(VIH) + y(VIL)) / 2 + 7} style={mono(17, C.muted, { letterSpacing: '.08em' })}>
          undefined
        </text>
        <text x={R + 14} y={(y(VDD) + y(VIH)) / 2 + 6} style={mono(18, GREEN, { fontWeight: 700 })}>
          → 1
        </text>
        <text x={R + 14} y={(y(0) + y(VIL)) / 2 + 6} style={mono(18, GREEN, { fontWeight: 700 })}>
          → 0
        </text>
      </g>
      <line x1={L} y1={T - 10} x2={L} y2={B} stroke={hexA(C.muted, 0.5)} strokeWidth={2} />
      <line x1={L} y1={B} x2={R} y2={B} stroke={hexA(C.muted, 0.5)} strokeWidth={2} />
      <text x={L - 14} y={y(VDD) + 6} textAnchor="end" style={mono(17, C.muted)}>
        3.3 V
      </text>
      <text x={L - 14} y={B + 6} textAnchor="end" style={mono(17, C.muted)}>
        0 V
      </text>
      {xTicks.map((s) => (
        <g key={s}>
          <line x1={x(s)} y1={B} x2={x(s)} y2={B + 8} stroke={hexA(C.muted, 0.6)} strokeWidth={1.5} />
          <text x={x(s)} y={B + 30} textAnchor="middle" style={mono(16, C.muted)}>
            {xLabel ? xLabel(s) : s}
          </text>
        </g>
      ))}
      <path d={d} fill="none" stroke={color} strokeWidth={3.5} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
      {reads
        .filter((r) => r.s >= s0 && r.s <= Math.min(s1, upTo))
        .map((r, i) => (
          <g key={i}>
            <line x1={x(r.s)} y1={T - 4} x2={x(r.s)} y2={B} stroke={hexA(C.amber, 0.35)} strokeWidth={1.5} />
            <circle cx={x(r.s)} cy={y(vAt(r.s))} r={6} fill={C.amber} />
            <text x={x(r.s)} y={T - 12} textAnchor="middle" style={mono(22, C.amber, { fontWeight: 800 })}>
              {r.val}
            </text>
          </g>
        ))}
    </svg>
  );
};

// ── TactSwitch ────────────────────────────────────────────────────────────

/** 6 mm tactile switch, top view, centred on (x, y); legs left/right pairs are joined inside */
export const TactSwitch: React.FC<{ x: number; y: number; press: number; size?: number }> = ({ x, y, press, size = 110 }) => {
  const s = size;
  return (
    <g>
      {[-1, 1].map((sx) =>
        [-1, 1].map((sy) => <rect key={`${sx}${sy}`} x={x + sx * (s / 2 + 6) - 8} y={y + sy * (s / 2 - 22) - 4} width={16} height={8} rx={2} fill="#c9ced6" />),
      )}
      <rect x={x - s / 2} y={y - s / 2} width={s} height={s} rx={8} fill="#2a2d33" stroke="#4a4f58" strokeWidth={2} />
      <circle cx={x} cy={y} r={s * 0.3} fill={press > 0.5 ? '#3a3f48' : '#555b66'} stroke="#1a1c20" strokeWidth={3} style={press > 0.5 ? undefined : { filter: 'drop-shadow(0 3px 2px rgba(0,0,0,.6))' }} />
      {[-1, 1].map((sx) => [-1, 1].map((sy) => <circle key={`d${sx}${sy}`} cx={x + sx * s * 0.36} cy={y + sy * s * 0.36} r={4} fill="#1a1c20" />))}
    </g>
  );
};

