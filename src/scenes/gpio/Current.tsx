/**
 * 8 · SECOND KNOB — current.
 *
 *   knob     code decides on/off; the resistor decides how much: 220 Ω ≈ 5.9 mA → 1 kΩ ≈ 1.3 mA, dimmer
 *   budget   a pin is a signal: ~20 mA default drive, ~40 mA max; a motor needs far more → transistor
 *
 * FACTS: datasheet drive strength (~5/10/20/40 mA, default 2) + Table 5-3; Ohm's law
 * with a typical 2.0 V red LED (UNVERIFIED for the kit).
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { GREEN, mono, RED } from '../../components/Explainer';
import { C, FONT, hexA } from '../../theme/palette';
import { after, BIG_W as W, inOutLocal, mix, Pill, Schematic, ViewStage } from './parts';
import { CURRENT as S, DRIVE_DEFAULT_MA, DRIVE_MAX_MA, FPS, ledMa, R1, R2, sceneDur } from './timeline';

export const Current: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <ViewStage
      t={t}
      frames={Math.round(sceneDur('current') * FPS)}
      kicker="Second knob · how much current"
      accent="amber"
      captions={S.captions}
      views={[
        { at: S.views.knob, component: KnobView, label: 'code → on/off · resistor → how much', accent: C.amber, right: (t) => (t < S.knob.r1k ? `R = ${R1} Ω` : 'R = 1 kΩ') },
        { at: S.views.budget, component: BudgetView, label: 'what a pin can deliver', accent: RED, right: () => 'ESP32 datasheet · drive strength' },
      ]}
    />
  );
};

/** distance travelled by the current dots: speed ∝ current */
function flowDist(t: number) {
  const k = S.knob;
  const sw = k.r1k;
  const v1 = 120;
  const v2 = (120 * ledMa(R2)) / ledMa(R1);
  return t < sw ? t * v1 : sw * v1 + (t - sw) * v2;
}

const KnobView: React.FC<{ t: number }> = ({ t }) => {
  const k = S.knob;
  const sw = inOutLocal((t - k.r1k) / 0.4);
  const ma = mix(ledMa(R1), ledMa(R2), sw);
  const bright = ma / ledMa(R1);
  const codeIn = after(t, k.code);
  const resIn = after(t, k.resistor);
  const maIn = after(t, k.ma6);
  const dim = after(t, k.dimmer);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ display: 'flex', gap: 24, justifyContent: 'center', height: 60, paddingTop: 6 }}>
        <div style={{ opacity: codeIn }}>
          <Pill color={C.cyan} size={26}>
            your code → on or off
          </Pill>
        </div>
        <div style={{ opacity: resIn }}>
          <Pill color={C.amber} size={26}>
            the resistor → how much current → how bright
          </Pill>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 30, left: 0 }}>
        <Schematic t={t} parts={[1, 1, 1, 1]} high={1} flow={flowDist(t)} flowOn={1} led={bright} rLabel={sw < 0.5 ? `${R1} Ω` : '1 kΩ'} />
      </div>
      <div style={{ position: 'absolute', left: 60, top: 500, display: 'grid', gap: 10, opacity: maIn }}>
        <div style={mono(26, C.muted)}>current through the LED</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ width: 600, height: 26, borderRadius: 13, background: 'rgba(255,255,255,.08)', overflow: 'hidden' }}>
            <div style={{ width: `${(ma / 8) * 100}%`, height: '100%', background: `linear-gradient(90deg, ${hexA(C.amber, 0.4)}, ${C.amber})`, boxShadow: `0 0 16px ${C.amber}` }} />
          </div>
          <div style={mono(44, C.amber, { fontWeight: 700, fontVariantNumeric: 'tabular-nums' })}>≈ {ma.toFixed(1)} mA</div>
        </div>
        <div style={{ ...mono(24, C.ink), opacity: after(t, k.r1k) }}>
          1.3 V ÷ 1000 Ω = 1.3 mA <span style={{ color: C.muted, opacity: dim }}>→ the LED is dimmer</span>
        </div>
      </div>
    </div>
  );
};

const BudgetView: React.FC<{ t: number }> = ({ t }) => {
  const b = S.budget;
  const x0 = 380;
  const x1 = W - 80;
  const MAXMA = 60;
  const X = (ma: number) => x0 + ((x1 - x0) * ma) / MAXMA;
  const sig = after(t, b.signal);
  const d20 = after(t, b.def20);
  const d40 = after(t, b.max40);
  const motor = after(t, b.motor);
  const far = inOutLocal((t - b.far) / 0.8);
  const tr = after(t, b.transistor);
  const load = after(t, b.load);
  const led = ledMa(R1);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ textAlign: 'center', fontFamily: FONT.sans, fontSize: 36, fontWeight: 700, color: C.ink, opacity: sig, height: 60 }}>
        a pin is a <span style={{ color: C.magenta }}>signal</span>, not a power supply
      </div>
      <svg width={W} height={330} style={{ display: 'block' }}>
        {/* axis */}
        <line x1={x0} y1={290} x2={x1} y2={290} stroke={hexA(C.muted, 0.5)} strokeWidth={2} />
        {[0, 10, 20, 30, 40, 50].map((m) => (
          <g key={m}>
            <line x1={X(m)} y1={284} x2={X(m)} y2={296} stroke={C.muted} />
            <text x={X(m)} y={320} textAnchor="middle" style={mono(18, C.muted)}>
              {m} mA
            </text>
          </g>
        ))}
        {/* rows */}
        <text x={x0 - 20} y={80} textAnchor="end" style={mono(24, C.ink)}>
          LED + 220 Ω
        </text>
        <rect x={x0} y={56} width={(X(led) - x0) * sig} height={36} rx={6} fill={hexA(GREEN, 0.5)} stroke={GREEN} />
        <text x={X(led) + 14} y={81} opacity={sig} style={mono(24, GREEN, { fontWeight: 700 })}>
          ≈ {led.toFixed(1)} mA ✓
        </text>
        <g opacity={motor}>
          <text x={x0 - 20} y={190} textAnchor="end" style={mono(24, C.ink)}>
            motor · relay · strip
          </text>
          <rect x={x0} y={166} width={(x1 + 80 - x0) * Math.max(0.15, far)} height={36} rx={6} fill={hexA(RED, 0.45)} stroke={RED} />
          <text x={x1 - 10} y={150} textAnchor="end" opacity={far} style={mono(24, RED, { fontWeight: 700 })}>
            far more →
          </text>
        </g>
        {/* limit lines */}
        <g opacity={d20}>
          <line x1={X(DRIVE_DEFAULT_MA)} y1={20} x2={X(DRIVE_DEFAULT_MA)} y2={290} stroke={C.cyan} strokeWidth={3} strokeDasharray="8 6" />
          <text x={X(DRIVE_DEFAULT_MA)} y={14} textAnchor="middle" style={mono(20, C.cyan, { fontWeight: 700 })}>
            default ~{DRIVE_DEFAULT_MA} mA
          </text>
        </g>
        <g opacity={d40}>
          <line x1={X(DRIVE_MAX_MA)} y1={20} x2={X(DRIVE_MAX_MA)} y2={290} stroke={RED} strokeWidth={3} strokeDasharray="8 6" />
          <text x={X(DRIVE_MAX_MA)} y={14} textAnchor="middle" style={mono(20, RED, { fontWeight: 700 })}>
            max ~{DRIVE_MAX_MA} mA
          </text>
        </g>
      </svg>
      {/* the fix */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22, marginTop: 90, opacity: tr, transform: `translateY(${(1 - tr) * 16}px)` }}>
        <Pill color={C.pink} size={28}>
          GPIO 2
        </Pill>
        <span style={mono(30, C.muted)}>→ switches →</span>
        <Pill color={C.cyan} size={28} solid>
          transistor
        </Pill>
        <span style={{ ...mono(30, load > 0.5 ? C.amber : C.muted) }}>→ switches →</span>
        <Pill color={load > 0.5 ? C.amber : C.muted} size={28}>
          the load · motor
        </Pill>
        <span style={{ opacity: load, ...mono(34, GREEN, { fontWeight: 800 }) }}>✓</span>
      </div>
    </div>
  );
};
