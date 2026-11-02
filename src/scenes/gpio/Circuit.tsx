/**
 * 3 · THE CIRCUIT — what you wire before you write any code.
 *
 *   wiring    the real parts: WROOM-32E pin 24 (IO2) → 220 Ω through-hole resistor → red LED
 *             → pin 15 (GND), drawn part by part; HIGH → current flows → it lights
 *   ohm       the same loop as a schematic: 3.3 V − 2.0 V = 1.3 V → 1.3 V ÷ 220 Ω ≈ 5.9 mA
 *   pins      which pins: 34–39 input only · 6–11 flash · 1 & 3 TX/RX
 *   strap     GPIO 2 is sampled at reset; an LED to ground keeps it low → boot ✓ flash ✓; check your board
 *
 * FACTS: IDF gpio/esp32.inc (pin table + notes), WROOM-32E datasheet (pins 15/24), datasheet §3 (strapping), DevKitC guide.
 * LED Vf ≈ 2.0 V is a typical red LED — UNVERIFIED for the kit.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { Explainer, GREEN, mono, RED, VIEW_W as W } from '../../components/Explainer';
import { C, FONT, hexA } from '../../theme/palette';
import { Wiring } from './board';
import { after, Pill, Schematic, Verdict } from './parts';
import { CIRCUIT as S, FPS, ledMa, LED_VF, R1, sceneDur, VDD } from './timeline';

const ARG_COLOR = [C.pink, C.cyan, C.amber, C.muted];
const A = S.args;

export const Circuit: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const V = S.views;
  const subs = [A[0].sub, t < S.ohm.ma ? A[1].sub : '1.3 V ÷ 220 Ω ≈ 5.9 mA', A[2].sub, A[3].sub];
  return (
    <Explainer
      t={t}
      frames={Math.round(sceneDur('circuit') * FPS)}
      kicker="The circuit · before any code"
      code={S.code}
      run={S.run}
      args={A.map((a, i) => ({ ...a, sub: subs[i], color: ARG_COLOR[i] }))}
      captions={S.captions}
      views={[
        { at: V.wiring, component: WiringView, active: [0, 1, 2, 3], label: 'the circuit · real parts', accent: C.amber, right: (t) => (t >= S.wiring.high ? 'pin HIGH' : 'pin LOW') },
        { at: V.ohm, component: OhmView, active: [1, 2], label: 'the same loop as a schematic · Ohm\'s law', accent: C.cyan, right: () => 'I = V ÷ R' },
        { at: V.pins, component: PinMapView, active: [0], label: 'which pin · ESP32 GPIO map', accent: C.pink, right: () => '34 GPIOs' },
        { at: V.strap, component: StrapView, active: [0], label: 'GPIO 2 · a strapping pin', accent: C.pink },
      ]}
    />
  );
};

// ── views ─────────────────────────────────────────────────────────────────

const flowAt = (t: number, from: number) => Math.max(0, t - from) * 110;

const WiringView: React.FC<{ t: number }> = ({ t }) => {
  const c = S.wiring;
  return (
    <div style={{ position: 'absolute', inset: 0, top: 20 }}>
      <Wiring
        parts={[after(t, S.views.wiring, 0.6), after(t, A[1].at, 0.8), after(t, A[2].at), after(t, A[3].at, 0.8)]}
        pinHot={after(t, A[0].at)}
        high={t >= c.high ? 1 : 0}
        flow={flowAt(t, c.current)}
        flowOn={after(t, c.current, 0.5)}
        led={after(t, c.current, 0.8)}
      />
    </div>
  );
};

const OhmView: React.FC<{ t: number }> = ({ t }) => {
  const o = S.ohm;
  const draw = after(t, S.views.ohm, 0.9);
  const e1 = after(t, o.leaving);
  const e2 = after(t, o.over);
  const e3 = after(t, o.ma);
  const row: React.CSSProperties = { display: 'flex', gap: 18, alignItems: 'baseline' };
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', inset: 0, top: 30 }}>
        <Schematic t={t} parts={[draw, draw, draw, draw]} high={1} flow={flowAt(t, S.wiring.current)} flowOn={after(t, o.same)} led={after(t, o.same)} dropLed={after(t, o.drops)} dropR={e1} />
      </div>
      <div style={{ position: 'absolute', left: 20, top: 372, display: 'grid', gap: 10, ...mono(30, C.ink) }}>
        <div style={{ ...row, opacity: e1 }}>
          <span style={{ color: C.muted, width: 230 }}>across R:</span>
          <span>
            {VDD} V − {LED_VF.toFixed(1)} V = <b style={{ color: C.cyan }}>1.3 V</b>
          </span>
        </div>
        <div style={{ ...row, opacity: e2 }}>
          <span style={{ color: C.muted, width: 230 }}>current:</span>
          <span>
            1.3 V ÷ {R1} Ω {e3 > 0 && <b style={{ color: C.amber, opacity: e3, fontSize: 40 }}>≈ {ledMa(R1).toFixed(1)} mA</b>}
          </span>
        </div>
      </div>
    </div>
  );
};

/** ESP32 GPIO numbers 0–39; the ones that don't exist are drawn as gaps */
const MISSING = new Set([20, 24, 28, 29, 30, 31]);
const INPUT_ONLY = [34, 35, 36, 37, 38, 39];
const FLASH = [6, 7, 8, 9, 10, 11];
const UART = [1, 3];

const PinMapView: React.FC<{ t: number }> = ({ t }) => {
  const p = S.pins;
  const io = after(t, p.inputs);
  const fl = after(t, p.flash);
  const ua = after(t, p.uploads);
  const rest = after(t, p.uploads + 1.2, 0.6);
  const CW = 128;
  const CH = 70;
  const GX = 22;
  const GY = 26;
  const x0 = (W - (10 * CW + 9 * GX)) / 2;
  const y0 = 120;
  const legend = [
    { p: io, c: RED, text: '34–39 · input only' },
    { p: fl, c: RED, text: '6–11 · wired to flash' },
    { p: ua, c: C.muted, text: '1 & 3 · TX / RX (uploads)' },
    { p: rest, c: GREEN, text: 'the rest · fine for an LED' },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ display: 'flex', gap: 18, justifyContent: 'center', height: 50, paddingTop: 10 }}>
        {legend.map((l) => (
          <div key={l.text} style={{ opacity: l.p }}>
            <Pill color={l.c} size={21}>
              {l.text}
            </Pill>
          </div>
        ))}
      </div>
      {Array.from({ length: 40 }, (_, n) => {
        const r = Math.floor(n / 10);
        const c = n % 10;
        const x = x0 + c * (CW + GX);
        const y = y0 + r * (CH + GY);
        if (MISSING.has(n)) {
          return <div key={n} style={{ position: 'absolute', left: x, top: y, width: CW, height: CH, borderRadius: 12, border: `1px dashed ${hexA(C.muted, 0.18)}` }} />;
        }
        let col: string = C.ink;
        let a = 0.08;
        let k = 0;
        if (INPUT_ONLY.includes(n)) [col, k] = [RED, io];
        else if (FLASH.includes(n)) [col, k] = [RED, fl];
        else if (UART.includes(n)) [col, k] = [C.muted, ua];
        else [col, k] = [GREEN, rest * 0.6];
        a = 0.06 + 0.22 * k;
        const ours = n === 2;
        return (
          <div
            key={n}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: CW,
              height: CH,
              boxSizing: 'border-box',
              borderRadius: 12,
              display: 'grid',
              placeItems: 'center',
              background: k > 0 ? hexA(col, a) : 'rgba(255,255,255,.04)',
              border: `${ours ? 3 : 1.5}px solid ${ours ? C.pink : k > 0 ? hexA(col, 0.4 + 0.5 * k) : 'rgba(255,255,255,.14)'}`,
              boxShadow: ours ? `0 0 22px ${hexA(C.pink, 0.5)}` : undefined,
              ...mono(28, k > 0.5 && col === RED ? '#ffd0d8' : C.ink, { fontWeight: 700 }),
              textDecoration: k > 0.5 && col === RED ? 'line-through' : undefined,
            }}
          >
            {n}
          </div>
        );
      })}
    </div>
  );
};

const STRAP = [0, 2, 5, 12, 15];

const StrapView: React.FC<{ t: number }> = ({ t }) => {
  const s = S.strap;
  const pins = after(t, s.strap);
  const steps = [
    { p: after(t, s.reset), text: 'reset', c: C.muted },
    { p: after(t, s.reset + 0.6), text: 'chip reads GPIO 2', c: C.pink },
    { p: after(t, s.ground), text: 'reads 0 — LED to ground keeps it low', c: C.amber },
  ];
  const safe = after(t, s.safe);
  const boards = after(t, s.boards);
  const check = after(t, s.check);
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateRows: '70px 150px 1fr', gap: 18 }}>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'center', opacity: pins }}>
        <span style={mono(20, C.muted, { letterSpacing: '.1em' })}>STRAPPING PINS · read once, at reset →</span>
        {STRAP.map((n) => (
          <div
            key={n}
            style={{
              width: 76,
              height: 54,
              borderRadius: 10,
              display: 'grid',
              placeItems: 'center',
              border: `${n === 2 ? 3 : 1.5}px solid ${n === 2 ? C.pink : hexA(C.amber, 0.7)}`,
              background: hexA(n === 2 ? C.pink : C.amber, 0.12),
              ...mono(26, C.ink, { fontWeight: 700 }),
            }}
          >
            {n}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, opacity: 1 - 0.55 * boards }}>
        {steps.map((st, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span style={{ ...mono(34, C.muted), opacity: st.p }}>→</span>}
            <div style={{ opacity: st.p, transform: `translateY(${(1 - st.p) * 14}px)` }}>
              <Pill color={st.c} size={22}>
                {st.text}
              </Pill>
            </div>
          </React.Fragment>
        ))}
        <span style={{ ...mono(34, C.muted), opacity: safe }}>→</span>
        <div style={{ opacity: safe, display: 'grid', gap: 8 }}>
          <Pill color={GREEN} size={20}>
            ✓ boots normally
          </Pill>
          <Pill color={GREEN} size={20}>
            ✓ flashing works
          </Pill>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30, alignContent: 'start', padding: '0 20px' }}>
        <Verdict ok p={boards} size={26}>
          many dev boards: an LED already on GPIO 2
        </Verdict>
        <div style={{ opacity: boards, transform: `translateY(${(1 - boards) * 16}px)`, padding: '18px 26px', borderRadius: 16, border: `1.5px solid ${hexA(C.muted, 0.6)}`, fontSize: 26, color: C.ink }}>
          <span style={{ color: C.muted, fontWeight: 800 }}>–</span>&nbsp; Espressif's ESP32-DevKitC: power LED only
        </div>
        <div style={{ gridColumn: '1 / -1', textAlign: 'center', opacity: check, fontFamily: FONT.sans, fontSize: 32, fontWeight: 700, color: C.amber }}>
          → check your board's pinout
        </div>
      </div>
    </div>
  );
};

