/**
 * The physical side: an ESP32-WROOM-32E module and a hand-wired LED.
 *
 *   Wroom    the whole module, top view, all 38 pins: pin NUMBER outside
 *            (where it is on the package), pin NAME inside (IO2 = GPIO 2).
 *            Pin table from the WROOM-32E datasheet v2.1, Figure 3 / Table 3.
 *   Wiring   the module's bottom edge (pins 15–24) wired for real: pin 24
 *            (IO2) → 220 Ω through-hole resistor (red·red·brown·gold) →
 *            5 mm red LED (long leg = anode) → back to pin 15 (GND).
 */
import React from 'react';
import { mono } from '../../components/Explainer';
import { C, FONT, hexA } from '../../theme/palette';

// ── the module's pins (WROOM-32E datasheet v2.1, Table 3) ─────────────────

/** left side, top → bottom */
const LEFT: [number, string][] = [
  [1, 'GND'], [2, '3V3'], [3, 'EN'], [4, 'SENSOR_VP'], [5, 'SENSOR_VN'], [6, 'IO34'], [7, 'IO35'],
  [8, 'IO32'], [9, 'IO33'], [10, 'IO25'], [11, 'IO26'], [12, 'IO27'], [13, 'IO14'], [14, 'IO12'],
];
/** bottom edge, left → right */
const BOTTOM: [number, string][] = [
  [15, 'GND'], [16, 'IO13'], [17, 'NC'], [18, 'NC'], [19, 'NC'], [20, 'NC'], [21, 'NC'], [22, 'NC'], [23, 'IO15'], [24, 'IO2'],
];
/** right side, top → bottom (38 at the top, 25 at the bottom) */
const RIGHT: [number, string][] = [
  [38, 'GND'], [37, 'IO23'], [36, 'IO22'], [35, 'TXD0'], [34, 'RXD0'], [33, 'IO21'], [32, 'NC'],
  [31, 'IO19'], [30, 'IO18'], [29, 'IO5'], [28, 'IO17'], [27, 'IO16'], [26, 'IO4'], [25, 'IO0'],
];

const nameColor = (name: string) => (name === 'GND' || name === '3V3' || name === 'EN' ? C.muted : name === 'NC' ? hexA(C.muted, 0.45) : C.ink);

/**
 * Module, top view, in a box `x, y` (top-left) of width 320 × height 470.
 * `hot` lights one pin (by module pin number); `glow` 0..1.
 */
export const Wroom: React.FC<{ x: number; y: number; hot?: number; glow?: number; showNumbers?: number; dimOthers?: number }> = ({
  x,
  y,
  hot = -1,
  glow = 0,
  showNumbers = 1,
  dimOthers = 0,
}) => {
  const W = 320;
  const H = 470;
  const pitchY = 21;
  const y0 = y + 108;
  const pitchX = 26.5;
  const x0 = x + 41;
  const pad = (px: number, py: number, w: number, h: number, n: number) => {
    const on = n === hot;
    return (
      <rect
        key={`p${n}`}
        x={px}
        y={py}
        width={w}
        height={h}
        rx={2}
        fill={on ? C.pink : '#d8c38a'}
        opacity={on ? 1 : 0.85 - 0.5 * dimOthers}
        style={on ? { filter: `drop-shadow(0 0 ${6 + 10 * glow}px ${C.pink})` } : undefined}
      />
    );
  };
  const label = (n: number, name: string, tx: number, ty: number, anchor: 'start' | 'end', rot = 0) => {
    const on = n === hot;
    return (
      <text
        key={`n${n}`}
        x={tx}
        y={ty}
        textAnchor={anchor}
        transform={rot ? `rotate(${rot} ${tx} ${ty})` : undefined}
        style={mono(12.5, on ? C.pink : nameColor(name), { fontWeight: on ? 800 : 500 })}
        opacity={on ? 1 : 1 - 0.55 * dimOthers}
      >
        {name}
      </text>
    );
  };
  const num = (n: number, tx: number, ty: number, anchor: 'start' | 'end' | 'middle') => {
    const on = n === hot;
    return (
      <text
        key={`k${n}`}
        x={tx}
        y={ty}
        textAnchor={anchor}
        opacity={showNumbers * (on ? 1 : 1 - 0.55 * dimOthers)}
        style={mono(on ? 15 : 12, on ? C.amber : C.muted, { fontWeight: on ? 800 : 400 })}
      >
        {n}
      </text>
    );
  };
  return (
    <g>
      {/* PCB */}
      <rect x={x} y={y} width={W} height={H} rx={8} fill="#123029" stroke={hexA(C.ink, 0.25)} />
      {/* antenna keep-out */}
      <rect x={x + 8} y={y + 8} width={W - 16} height={84} rx={4} fill="none" stroke={hexA(C.muted, 0.35)} strokeDasharray="5 5" />
      <path
        d={`M ${x + 30} ${y + 70} L ${x + 30} ${y + 30} L ${x + 80} ${y + 30} L ${x + 80} ${y + 60} L ${x + 130} ${y + 60} L ${x + 130} ${y + 30} L ${x + 180} ${y + 30} L ${x + 180} ${y + 60} L ${x + 230} ${y + 60} L ${x + 230} ${y + 30} L ${x + 290} ${y + 30}`}
        fill="none"
        stroke="#c9a65a"
        strokeWidth={4}
        opacity={0.7}
      />
      <text x={x + W / 2} y={y + 86} textAnchor="middle" style={mono(11, C.muted, { letterSpacing: '.14em' })}>
        ANTENNA
      </text>
      {/* shield can */}
      <rect x={x + 100} y={y + 110} width={W - 200} height={250} rx={6} fill="#9aa3ad" opacity={0.28} stroke={hexA(C.ink, 0.35)} />
      <text x={x + W / 2} y={y + 226} textAnchor="middle" style={mono(13, C.ink, { fontWeight: 700 })}>
        ESP32
      </text>
      <text x={x + W / 2} y={y + 244} textAnchor="middle" style={mono(11, C.ink)}>
        WROOM-32E
      </text>

      {LEFT.map(([n, name], i) => {
        const py = y0 + i * pitchY;
        return (
          <React.Fragment key={n}>
            {pad(x - 6, py - 4, 16, 8, n)}
            {label(n, name, x + 16, py + 4.5, 'start')}
            {num(n, x - 12, py + 4.5, 'end')}
          </React.Fragment>
        );
      })}
      {RIGHT.map(([n, name], i) => {
        const py = y0 + i * pitchY;
        return (
          <React.Fragment key={n}>
            {pad(x + W - 10, py - 4, 16, 8, n)}
            {label(n, name, x + W - 16, py + 4.5, 'end')}
            {num(n, x + W + 12, py + 4.5, 'start')}
          </React.Fragment>
        );
      })}
      {BOTTOM.map(([n, name], j) => {
        const px = x0 + j * pitchX;
        return (
          <React.Fragment key={n}>
            {pad(px - 4, y + H - 10, 8, 16, n)}
            {label(n, name, px + 4, y + H - 16, 'start', -90)}
            {num(n, px, y + H + 22, 'middle')}
          </React.Fragment>
        );
      })}
    </g>
  );
};

/** centre of a module pin's pad (for leader lines), same geometry as `Wroom` */
export function wroomPinXY(x: number, y: number, n: number): [number, number] {
  const li = LEFT.findIndex(([k]) => k === n);
  if (li >= 0) return [x - 6, y + 108 + li * 21];
  const ri = RIGHT.findIndex(([k]) => k === n);
  if (ri >= 0) return [x + 326, y + 108 + ri * 21];
  const bi = BOTTOM.findIndex(([k]) => k === n);
  return [x + 41 + bi * 26.5, y + 476];
}

// ── Wiring ─────────────────────────────────────────────────────────────────

const RED_LED = '#ff4b3a';
const BAND = { red: '#d42a2a', brown: '#7a4a1e', gold: '#d6b24a' };

/** the wire path from pin 24 → resistor → LED → pin 15, in view coordinates */
const WX = { p15: 330, p24: 1170, rIn: 1170, rBody0: 1060, rBody1: 900, ledA: 760, ledK: 700, y: 330, top: 118 };
const WIRE: [number, number][] = [
  [WX.p24, WX.top],
  [WX.p24, WX.y],
  [WX.p15, WX.y],
  [WX.p15, WX.top],
];
const wireLen = WIRE.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - WIRE[i][0], p[1] - WIRE[i][1]), 0);
function onWire(d: number): [number, number] {
  let r = ((d % wireLen) + wireLen) % wireLen;
  for (let i = 1; i < WIRE.length; i++) {
    const [x0, y0] = WIRE[i - 1];
    const [x1, y1] = WIRE[i];
    const L = Math.hypot(x1 - x0, y1 - y0);
    if (r <= L) return [x0 + ((x1 - x0) * r) / L, y0 + ((y1 - y0) * r) / L];
    r -= L;
  }
  return WIRE[WIRE.length - 1];
}

export const Wiring: React.FC<{
  /** draw-on 0..1: module edge, resistor, LED, ground return */
  parts: [number, number, number, number];
  /** 0..1 highlight of pin 24 */
  pinHot: number;
  high: number;
  flow: number;
  flowOn: number;
  led: number;
  W?: number;
}> = ({ parts, pinHot, high, flow, flowOn, led, W = 1544 }) => {
  const [pM, pR, pL, pG] = parts;
  const live = high > 0.5;
  const wire = live ? C.amber : hexA(C.muted, 0.75);
  const pitch = (WX.p24 - WX.p15) / 9;
  const ry = WX.y;
  const dots: React.ReactNode[] = [];
  if (flowOn > 0.01) {
    for (let d = 0; d < wireLen; d += 70) {
      const [x, y] = onWire(d + flow);
      if (y === ry && ((x < WX.rBody0 + 4 && x > WX.rBody1 - 4) || (x < WX.ledA + 30 && x > WX.ledK - 30))) continue;
      dots.push(<circle key={d} cx={x} cy={y} r={6} fill="#fff" opacity={0.9 * flowOn} style={{ filter: `drop-shadow(0 0 6px ${C.amber})` }} />);
    }
  }
  return (
    <svg width={W} height={500} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <radialGradient id="ledg">
          <stop offset="0" stopColor={RED_LED} stopOpacity={0.95} />
          <stop offset="0.45" stopColor={RED_LED} stopOpacity={0.3} />
          <stop offset="1" stopColor={RED_LED} stopOpacity={0} />
        </radialGradient>
        <linearGradient id="rbody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f1d9a6" />
          <stop offset="1" stopColor="#c8a86c" />
        </linearGradient>
      </defs>

      {/* the module's bottom edge, pins 15–24 */}
      <g opacity={pM}>
        <rect x={WX.p15 - 80} y={-30} width={WX.p24 - WX.p15 + 160} height={130} rx={8} fill="#123029" stroke={hexA(C.ink, 0.25)} />
        <rect x={WX.p15 + 120} y={-30} width={WX.p24 - WX.p15 - 240} height={58} rx={6} fill="#9aa3ad" opacity={0.25} />
        <text x={(WX.p15 + WX.p24) / 2} y={18} textAnchor="middle" style={mono(18, C.ink, { fontWeight: 700, letterSpacing: '.08em' })}>
          ESP32-WROOM-32E · bottom edge
        </text>
        {BOTTOM.map(([n, name], j) => {
          const px = WX.p15 + j * pitch;
          const on = n === 24;
          const gnd = n === 15;
          const hot = on ? pinHot : gnd ? pG : 0;
          const col = on ? C.pink : gnd ? C.ink : C.muted;
          return (
            <g key={n}>
              <rect x={px - 9} y={88} width={18} height={30} rx={3} fill={hot > 0.5 ? (on ? C.pink : '#eee') : '#d8c38a'} style={hot > 0.5 && on ? { filter: `drop-shadow(0 0 12px ${C.pink})` } : undefined} />
              <text x={px} y={74} textAnchor="middle" style={mono(16, hot > 0.5 ? col : name === 'NC' ? hexA(C.muted, 0.5) : C.ink, { fontWeight: hot > 0.5 ? 800 : 500 })}>
                {name}
              </text>
              <text x={px} y={52} textAnchor="middle" style={mono(13, hot > 0.5 ? C.amber : C.muted, { fontWeight: hot > 0.5 ? 800 : 400 })}>
                pin {n}
              </text>
            </g>
          );
        })}
      </g>

      {/* wire: pin 24 down to the resistor */}
      <path d={`M ${WX.p24} ${WX.top} L ${WX.p24} ${ry} L ${WX.rBody0} ${ry}`} fill="none" stroke={wire} strokeWidth={5} strokeLinejoin="round" pathLength={1} strokeDasharray={`${pR} 1`} />
      {/* resistor: axial, beige body, 4 bands */}
      <g opacity={pR}>
        <line x1={WX.rBody0} y1={ry} x2={WX.rBody1} y2={ry} stroke="#bfc4cc" strokeWidth={3} />
        <rect x={WX.rBody1 + 22} y={ry - 20} width={WX.rBody0 - WX.rBody1 - 44} height={40} rx={18} fill="url(#rbody)" stroke="#8a7346" />
        {[
          [WX.rBody0 - 44, BAND.red],
          [WX.rBody0 - 62, BAND.red],
          [WX.rBody0 - 80, BAND.brown],
          [WX.rBody1 + 40, BAND.gold],
        ].map(([bx, c], i) => (
          <rect key={i} x={(bx as number) - 5} y={ry - 20} width={10} height={40} fill={c as string} />
        ))}
        <text x={(WX.rBody0 + WX.rBody1) / 2} y={ry + 52} textAnchor="middle" style={mono(20, C.cyan, { fontWeight: 700 })}>
          220 Ω
        </text>
        <text x={(WX.rBody0 + WX.rBody1) / 2} y={ry + 76} textAnchor="middle" style={mono(15, C.muted)}>
          red · red · brown · gold
        </text>
      </g>
      {/* resistor → LED anode */}
      <line x1={WX.rBody1} y1={ry} x2={WX.ledA + 18} y2={ry} stroke={wire} strokeWidth={5} opacity={pL > 0.3 ? 1 : 0} />
      {/* LED: 5 mm red, standing up; long leg (anode) on the right */}
      <g opacity={pL}>
        <circle cx={(WX.ledA + WX.ledK) / 2} cy={ry - 110} r={130 * Math.max(led, 0.001)} fill="url(#ledg)" opacity={led} />
        {/* legs */}
        <path d={`M ${WX.ledA + 18} ${ry} L ${WX.ledA + 18} ${ry - 40} L ${WX.ledA - 8} ${ry - 72}`} fill="none" stroke="#c9ced6" strokeWidth={4} />
        <path d={`M ${WX.ledK - 18} ${ry} L ${WX.ledK - 18} ${ry - 28} L ${WX.ledK + 8} ${ry - 72}`} fill="none" stroke="#c9ced6" strokeWidth={4} />
        {/* body: rim + dome */}
        <rect x={WX.ledK - 22} y={ry - 84} width={WX.ledA - WX.ledK + 44} height={14} rx={3} fill={hexA(RED_LED, 0.55 + 0.45 * led)} />
        <line x1={WX.ledK - 22} y1={ry - 84} x2={WX.ledK - 22} y2={ry - 70} stroke="#fff" strokeWidth={3} opacity={0.6} />
        <path
          d={`M ${WX.ledK - 14} ${ry - 84} L ${WX.ledK - 14} ${ry - 130} A ${(WX.ledA - WX.ledK + 28) / 2} ${(WX.ledA - WX.ledK + 28) / 2} 0 0 1 ${WX.ledA + 14} ${ry - 130} L ${WX.ledA + 14} ${ry - 84} Z`}
          fill={led > 0.05 ? `rgba(255,${120 + 100 * led},${100 + 80 * led},${0.55 + 0.4 * led})` : hexA(RED_LED, 0.45)}
          stroke={RED_LED}
          strokeWidth={2}
          style={led > 0.05 ? { filter: `drop-shadow(0 0 ${20 * led}px ${RED_LED})` } : undefined}
        />
        <text x={WX.ledA + 34} y={ry - 30} style={mono(16, C.ink)}>
          + long leg
        </text>
        <text x={WX.ledK - 34} y={ry - 30} textAnchor="end" style={mono(16, C.muted)}>
          − short leg · flat side
        </text>
      </g>
      {/* LED cathode → back to pin 15 GND */}
      <path
        d={`M ${WX.ledK - 18} ${ry} L ${WX.p15} ${ry} L ${WX.p15} ${WX.top}`}
        fill="none"
        stroke={hexA(C.muted, 0.75)}
        strokeWidth={5}
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={`${pG} 1`}
      />
      {dots}
      {pinHot > 0.5 && (
        <text x={WX.p24 + 30} y={ry - 80} opacity={pinHot} style={{ fontFamily: FONT.sans, fontSize: 24, fontWeight: 700, fill: C.pink }}>
          GPIO 2
        </text>
      )}
      {live && (
        <text x={WX.p24 + 30} y={ry - 50} style={mono(20, C.amber, { fontWeight: 700 })}>
          HIGH · 3.3 V
        </text>
      )}
      {pG > 0.5 && (
        <text x={WX.p15 - 30} y={ry - 50} textAnchor="end" opacity={pG} style={mono(20, C.muted)}>
          GND · 0 V
        </text>
      )}
    </svg>
  );
};
