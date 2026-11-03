/**
 * 3 · THE CIRCUIT
 *   wiring   WROOM-32E: pin 30 (IO18) → tactile button → pin 38 (GND); the pull-up is inside
 *   pins     why GPIO 18: not strapping, not flash, has a pull-up (34–39 have none)
 *   bands    the datasheet's input thresholds; a floating pin lives in between
 *
 * FACTS: WROOM-32E Table 3; esp32.inc notes; datasheet Table 5-3 VIH/VIL.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { GREEN, mono, RED } from '../../components/Explainer';
import { C, FONT, hexA } from '../../theme/palette';
import { Wroom, wroomPinXY } from '../gpio/board';
import { after, BIG_H, BIG_W, TactSwitch, ViewStage, VTrace } from './parts';
import { BTN_MODULE_PIN, CIRCUIT as S, FPS, floatV, GND_MODULE_PIN, sceneDur } from './timeline';

export const Circuit: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const V = S.views;
  return (
    <ViewStage
      t={t}
      frames={Math.round(sceneDur('circuit') * FPS)}
      kicker="The circuit"
      accent="amber"
      captions={S.captions}
      views={[
        { at: V.wiring, component: WiringView, label: 'breadboard · GPIO 18 → button → GND', accent: C.pink, right: () => 'ESP32-WROOM-32E' },
        { at: V.pins, component: PinsView, label: 'which pin?', accent: C.pink, right: () => 'ESP-IDF GPIO docs · ESP32' },
        { at: V.bands, component: BandsView, label: 'what counts as 1 and 0', accent: C.magenta, right: () => 'ESP32 datasheet · table 5-3 (VDD = 3.3 V)' },
      ]}
    />
  );
};

// ── views ─────────────────────────────────────────────────────────────────

const MX = 200;
const MY = 90;
const K = 1.2; // module scale

const WiringView: React.FC<{ t: number }> = ({ t }) => {
  const w = S.wiring;
  const leg = after(t, w.leg);
  const io = after(t, w.gpio18);
  const gnd = after(t, w.ground);
  const noR = after(t, w.noR);
  const inside = after(t, w.builtIn);
  // module pin pads, in view coordinates (the module is scaled by K about (MX, MY))
  const sc = ([x, y]: [number, number]): [number, number] => [MX + (x - MX) * K, MY + (y - MY) * K];
  const [px, py] = sc(wroomPinXY(MX, MY, BTN_MODULE_PIN));
  const [gx, gy] = sc(wroomPinXY(MX, MY, GND_MODULE_PIN));
  const bx = 1060;
  const by = 420;
  const press = Math.floor(t / 1.6) % 2 === 1 && t > w.builtIn + 0.8 ? 1 : 0;
  return (
    <svg width={BIG_W} height={BIG_H} style={{ display: 'block', overflow: 'visible' }}>
      <g transform={`translate(${MX} ${MY}) scale(${K}) translate(${-MX} ${-MY})`}>
        <Wroom x={MX} y={MY} hot={io > 0.5 ? BTN_MODULE_PIN : -1} glow={io} dimOthers={0.5 * io} />
      </g>
      {/* pin 30 → button (left legs) */}
      <path
        d={`M ${px + 36} ${py} L ${bx - 95} ${py} L ${bx - 95} ${by - 34} L ${bx - 70} ${by - 34}`}
        fill="none"
        stroke={C.pink}
        strokeWidth={5}
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={`${io} 1`}
        style={{ filter: `drop-shadow(0 0 6px ${C.pink})` }}
      />
      {/* button (right legs) → pin 38 GND */}
      <path
        d={`M ${bx + 70} ${by - 34} L ${bx + 140} ${by - 34} L ${bx + 140} ${gy} L ${gx + 36} ${gy}`}
        fill="none"
        stroke={C.ink}
        strokeWidth={5}
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={`${gnd} 1`}
        opacity={0.8}
      />
      <g opacity={leg}>
        <TactSwitch x={bx} y={by} press={press} size={130} />
        <text x={bx} y={by + 110} textAnchor="middle" style={mono(20, C.ink)}>
          push-button
        </text>
        <text x={bx} y={by + 138} textAnchor="middle" style={mono(16, C.muted)}>
          legs on each side are joined · press joins the sides
        </text>
      </g>
      <g opacity={io}>
        <text x={px + 60} y={py - 14} style={mono(22, C.pink, { fontWeight: 700 })}>
          pin 30 · GPIO 18
        </text>
      </g>
      <g opacity={gnd}>
        <text x={gx + 60} y={gy - 14} style={mono(22, C.ink, { fontWeight: 700 })}>
          pin 38 · GND
        </text>
      </g>
      <g opacity={noR} transform={`translate(${bx - 300} ${by + 190})`}>
        <text x={0} y={0} style={{ fontFamily: FONT.sans, fontSize: 28, fontWeight: 700, fill: GREEN }}>
          ✓ no resistor on the board
        </text>
        <text x={0} y={40} opacity={inside} style={{ fontFamily: FONT.sans, fontSize: 24, fill: C.ink }}>
          the pull-up is built into the chip: <tspan style={mono(24, C.amber)}>~45 kΩ to 3.3 V</tspan>
        </text>
      </g>
      {/* the internal pull-up, called out on the pin-30 wire */}
      <g opacity={inside}>
        <rect x={px + 60} y={py + 18} width={230} height={56} rx={10} fill="rgba(10,4,32,.9)" stroke={C.amber} strokeWidth={2} />
        <text x={px + 175} y={py + 52} textAnchor="middle" style={mono(18, C.amber, { fontWeight: 700 })}>
          + 45 kΩ pull-up, inside
        </text>
      </g>
    </svg>
  );
};

const GPIOS = [...Array(20).keys(), 21, 22, 23, 25, 26, 27, 32, 33, 34, 35, 36, 37, 38, 39];
const STRAP = [0, 2, 5, 12, 15];

const PinsView: React.FC<{ t: number }> = ({ t }) => {
  const p = S.pins;
  const strap = after(t, p.strap);
  const flash = after(t, p.flash);
  const ok = after(t, p.pullup);
  const none = after(t, p.noPull);
  const cellW = (BIG_W - 120) / 34;
  const legend = (c: string, txt: string, q: number) => (
    <div style={{ opacity: q, display: 'flex', gap: 12, alignItems: 'center', fontSize: 26, color: C.ink }}>
      <span style={{ width: 22, height: 22, borderRadius: 6, background: hexA(c, 0.35), border: `2px solid ${c}` }} />
      {txt}
    </div>
  );
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 40, padding: '0 60px' }}>
      <div style={{ display: 'flex' }}>
        {GPIOS.map((g) => {
          const isStrap = STRAP.includes(g) ? strap : 0;
          const isFlash = g >= 6 && g <= 11 ? flash : 0;
          const isNone = g >= 34 ? none : 0;
          const isOk = g === 18 ? ok : 0;
          const col = isOk > 0.5 ? GREEN : isNone > 0.5 ? RED : isFlash > 0.5 ? RED : isStrap > 0.5 ? C.amber : null;
          return (
            <div
              key={g}
              style={{
                width: cellW - 6,
                marginRight: 6,
                height: 96,
                borderRadius: 8,
                display: 'grid',
                placeItems: 'center',
                background: col ? hexA(col, isOk > 0.5 ? 0.3 : 0.15) : 'rgba(255,255,255,.03)',
                border: `${isOk > 0.5 ? 3 : 1.5}px solid ${col ?? 'rgba(255,255,255,.2)'}`,
                boxShadow: isOk > 0.5 ? `0 0 30px ${hexA(GREEN, 0.6)}` : undefined,
                transform: `scale(${1 + 0.18 * isOk})`,
                ...mono(20, col ?? C.ink, { fontWeight: 700 }),
                textDecoration: isFlash > 0.5 ? 'line-through' : undefined,
              }}
            >
              {g}
            </div>
          );
        })}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 40px' }}>
        {legend(C.amber, 'strapping pins (0 2 5 12 15): read at reset', strap)}
        {legend(RED, '6–11: wired to the flash', flash)}
        {legend(GREEN, '18: plain GPIO with an internal pull-up ✓', ok)}
        {legend(RED, '34–39: input only, no pull resistors', none)}
      </div>
    </div>
  );
};

const BandsView: React.FC<{ t: number }> = ({ t }) => {
  const b = S.bands;
  const vih = after(t, b.vih);
  const vil = after(t, b.vil);
  const mid = after(t, b.between);
  const fl = after(t, b.floating);
  const vAt = (s: number) => (s < b.between ? NaN : floatV(s));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <VTrace W={BIG_W} H={560} s0={t - 6} s1={t} vAt={vAt} upTo={t} bands={after(t, b.one)} />
      <div style={{ position: 'absolute', left: 150, top: 600, display: 'flex', gap: 50, ...mono(28, C.ink) }}>
        <span style={{ opacity: vih, color: GREEN }}>≥ 2.475 V → 1</span>
        <span style={{ opacity: vil, color: GREEN }}>≤ 0.825 V → 0</span>
        <span style={{ opacity: mid, color: C.muted }}>between → no promise</span>
        <span style={{ opacity: fl, color: C.magenta }}>← a floating pin lives here</span>
      </div>
    </div>
  );
};
