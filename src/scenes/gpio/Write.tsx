/**
 * 6 · gpio_set_level(LED, 1) — setting the level.
 *
 *   level    1 → 3.3 V, LED on · 0 → 0 V, LED off
 *   bands    the datasheet's guarantee: HIGH ≥ 2.64 V, LOW ≤ 0.33 V — two levels, nothing between
 *   value    uint32_t level; gpio_ll_set_level: if (level) → any non-zero is HIGH
 *   cpu      one store, returns ESP_OK; the pin holds its level with no CPU
 *
 * FACTS: gpio.c gpio_set_level, gpio_ll.h gpio_ll_set_level, datasheet Table 5-3.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { Explainer, GREEN, mono, VIEW_H as H, VIEW_W as W } from '../../components/Explainer';
import { Led } from '../../components/Gadgets';
import { C, FONT, hexA } from '../../theme/palette';
import { after, inOutLocal, Verdict } from './parts';
import { FPS, sceneDur, VDD, VOH_MIN, VOL_MAX, WRITE as S } from './timeline';

const ARG_COLOR = [C.pink, C.amber];

export const Write: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const V = S.views;
  const subs = [S.args[0].sub, t < S.value.any ? S.args[1].sub : '0 → low · anything else → high'];
  return (
    <Explainer
      t={t}
      frames={Math.round(sceneDur('write') * FPS)}
      kicker="Setting the level · gpio_set_level()"
      code={S.code}
      run={S.run}
      args={S.args.map((a, i) => ({ ...a, sub: subs[i], color: ARG_COLOR[i] }))}
      captions={S.captions}
      views={[
        { at: V.level, component: LevelView, active: [1], label: 'value · the voltage on the pin', accent: C.magenta, right: (t) => (t < S.level.low ? 'level 1 · HIGH' : 'level 0 · LOW') },
        { at: V.bands, component: BandsView, active: [1], label: 'what the datasheet guarantees', accent: C.magenta, right: () => 'ESP32 datasheet · VDD = 3.3 V' },
        { at: V.value, component: ValueView, active: [1], label: 'the level is just a number', accent: C.cyan },
        { at: V.cpu, component: CpuView, active: [0, 1], label: 'who holds the pin high?', accent: GREEN, right: () => 'not to scale' },
      ]}
    />
  );
};

// ── views ─────────────────────────────────────────────────────────────────

const LevelView: React.FC<{ t: number }> = ({ t }) => {
  const l = S.level;
  const v = VDD * (1 - inOutLocal((t - l.low) / 0.25));
  const hi = t < l.low;
  const meterH = 380;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr 300px 420px', alignItems: 'center', padding: '0 40px' }}>
      <div style={{ display: 'grid', gap: 26 }}>
        <div
          style={{
            ...mono(44, '#fff'),
            padding: '8px 18px',
            borderLeft: `4px solid ${C.cyan}`,
            background: `linear-gradient(90deg, ${hexA(C.cyan, 0.16)}, transparent)`,
          }}
        >
          gpio_set_level(LED, <b style={{ color: hi ? C.amber : C.muted }}>{hi ? '1' : '0'}</b>);
        </div>
        <div style={{ opacity: after(t, l.volts), ...mono(30, C.amber) }}>1 → pin at 3.3 V → current flows</div>
        <div style={{ opacity: after(t, l.low), ...mono(30, C.muted) }}>0 → pin at 0 V → no current</div>
      </div>
      {/* voltmeter */}
      <div style={{ display: 'grid', justifyItems: 'center', gap: 10 }}>
        <div style={{ position: 'relative', width: 70, height: meterH, borderRadius: 14, border: '1.5px solid rgba(255,255,255,.2)', background: 'rgba(255,255,255,.03)' }}>
          <div
            style={{
              position: 'absolute',
              left: 6,
              right: 6,
              bottom: 6,
              height: (meterH - 12) * (v / VDD),
              borderRadius: 9,
              background: `linear-gradient(0deg, ${hexA(C.magenta, 0.4)}, ${C.magenta})`,
              boxShadow: `0 0 24px ${hexA(C.magenta, 0.6)}`,
            }}
          />
        </div>
        <div style={mono(34, C.magenta, { fontWeight: 700, fontVariantNumeric: 'tabular-nums' })}>{v.toFixed(1)} V</div>
      </div>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 16 }}>
        <Led brightness={hi ? 1 : 0} size={240} />
        <div style={{ ...mono(26, hi ? C.amber : C.muted), opacity: after(t, hi ? l.lights : l.dark) }}>{hi ? 'LED on' : 'LED off'}</div>
      </div>
    </div>
  );
};

const BandsView: React.FC<{ t: number }> = ({ t }) => {
  const b = S.bands;
  const x0 = 120;
  const x1 = W - 120;
  const X = (v: number) => x0 + ((x1 - x0) * v) / VDD;
  const y = 250;
  const hiOut = after(t, b.highAt);
  const hiN = after(t, b.voh);
  const loOut = after(t, b.lowAt);
  const loN = after(t, b.vol);
  const only = after(t, b.only);
  return (
    <svg width={W} height={H} style={{ display: 'block' }}>
      {/* axis */}
      <line x1={x0} y1={y} x2={x1} y2={y} stroke={hexA(C.muted, 0.6)} strokeWidth={3} />
      {[0, 0.5, 1, 1.5, 2, 2.5, 3, 3.3].map((v) => (
        <g key={v}>
          <line x1={X(v)} y1={y - 8} x2={X(v)} y2={y + 8} stroke={C.muted} strokeWidth={2} />
          <text x={X(v)} y={y + 40} textAnchor="middle" style={mono(20, C.muted)}>
            {v} V
          </text>
        </g>
      ))}
      {/* LOW band */}
      <g opacity={loOut}>
        <rect x={X(0)} y={y - 110} width={X(VOL_MAX) - X(0)} height={110} fill={hexA(GREEN, 0.18)} stroke={GREEN} strokeWidth={2} rx={6} />
        <text x={X(0) + 10} y={y - 130} style={mono(28, GREEN, { fontWeight: 700 })}>
          LOW ≤ <tspan opacity={loN}>{VOL_MAX} V</tspan>
        </text>
      </g>
      {/* HIGH band */}
      <g opacity={hiOut}>
        <rect x={X(VOH_MIN)} y={y - 110} width={X(VDD) - X(VOH_MIN)} height={110} fill={hexA(GREEN, 0.18)} stroke={GREEN} strokeWidth={2} rx={6} />
        <text x={X(VDD)} y={y - 130} textAnchor="end" style={mono(28, GREEN, { fontWeight: 700 })}>
          HIGH ≥ <tspan opacity={hiN}>{VOH_MIN} V</tspan>
        </text>
      </g>
      {/* between */}
      <g opacity={only}>
        <rect x={X(VOL_MAX) + 6} y={y - 110} width={X(VOH_MIN) - X(VOL_MAX) - 12} height={110} fill="url(#hatch)" stroke={hexA(C.muted, 0.4)} strokeDasharray="6 6" rx={6} />
        <text x={(X(VOL_MAX) + X(VOH_MIN)) / 2} y={y - 48} textAnchor="middle" style={mono(28, C.ink)}>
          no third level
        </text>
      </g>
      <defs>
        <pattern id="hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="14" stroke={hexA(C.muted, 0.25)} strokeWidth="4" />
        </pattern>
      </defs>
      <text x={W / 2} y={H - 60} textAnchor="middle" opacity={only} style={{ fontFamily: FONT.sans, fontSize: 30, fontWeight: 600, fill: C.ink }}>
        a digital output gives you two levels — nothing in between
      </text>
    </svg>
  );
};

const ValueView: React.FC<{ t: number }> = ({ t }) => {
  const v = S.value;
  const whole = after(t, v.whole);
  const any = after(t, v.any);
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 50, alignItems: 'center', padding: '0 40px' }}>
      <div style={{ display: 'grid', gap: 14, opacity: whole }}>
        <div style={{ ...mono(22, '#cfd6ff'), whiteSpace: 'pre', lineHeight: 1.6 }}>
          {'esp_err_t gpio_set_level(gpio_num_t gpio_num,\n                         '}
          <b style={{ color: C.amber, background: hexA(C.amber, 0.15), padding: '0 4px', borderRadius: 4 }}>uint32_t level</b>);
        </div>
        <div style={{ ...mono(18, C.muted) }}>driver/gpio.h — a whole number, not just 0 or 1</div>
      </div>
      <div style={{ display: 'grid', gap: 18, opacity: any, transform: `translateY(${(1 - any) * 16}px)` }}>
        <div style={mono(38, '#fff')}>
          gpio_set_level(LED, <b style={{ color: C.amber }}>7</b>);
        </div>
        <div style={{ borderRadius: 14, border: '1px solid rgba(255,255,255,.14)', padding: '14px 18px', background: 'rgba(10,4,32,.6)', ...mono(24, '#cfd6ff'), lineHeight: 1.6 }}>
          <div>
            <span style={{ color: C.cyan, background: hexA(C.cyan, 0.15), padding: '0 4px', borderRadius: 4 }}>if (level)</span> → out_w1ts <span style={{ color: C.muted }}>// set</span>
          </div>
          <div>else → out_w1tc <span style={{ color: C.muted }}>// clear</span></div>
          <div style={mono(16, C.muted)}>esp_hal_gpio/esp32/include/hal/gpio_ll.h</div>
        </div>
        <Verdict ok p={any} size={26}>
          7 isn't 0 → high
        </Verdict>
      </div>
    </div>
  );
};

const CpuView: React.FC<{ t: number }> = ({ t }) => {
  const c = S.cpu;
  const x0 = 260;
  const x1 = W - 40;
  const span = x1 - x0;
  // the lanes draw in from "doesn't wait"; the write happens 15% in
  const grow = inOutLocal((t - c.wait) / 3.2);
  const xNow = x0 + span * grow;
  const xW = x0 + span * 0.15;
  const ret = after(t, c.returns);
  const hold = after(t, c.holds);
  const yCpu = 90;
  const yPin = 300;
  const boxes = [
    { a: 0.15, b: 0.2, label: '', c: C.amber },
    { a: 0.24, b: 0.44, label: 'next line', c: C.cyan },
    { a: 0.48, b: 0.7, label: 'next line', c: C.cyan },
    { a: 0.74, b: 0.98, label: '…', c: C.cyan },
  ];
  return (
    <svg width={W} height={H} style={{ display: 'block' }}>
      <text x={20} y={yCpu + 8} style={mono(22, C.cyan)}>
        CPU · your code
      </text>
      <text x={20} y={yPin - 20} style={mono(22, C.pink)}>
        pin · GPIO 2
      </text>
      <clipPath id="cpuclip">
        <rect x={x0} y={0} width={Math.max(0, xNow - x0)} height={H} />
      </clipPath>
      <g clipPath="url(#cpuclip)">
        {boxes.map((b, i) => (
          <g key={i}>
            <rect x={x0 + span * b.a} y={yCpu - 32} width={span * (b.b - b.a)} height={64} rx={10} fill={hexA(b.c, 0.18)} stroke={b.c} strokeWidth={2} />
            <text x={x0 + span * (b.a + b.b) / 2} y={yCpu + 8} textAnchor="middle" style={mono(i === 0 ? 17 : 22, b.c)}>
              {b.label}
            </text>
          </g>
        ))}
        <path
          d={`M ${x0} ${yPin + 40} L ${xW} ${yPin + 40} L ${xW} ${yPin - 40} L ${x1} ${yPin - 40}`}
          fill="none"
          stroke={C.magenta}
          strokeWidth={4}
          style={{ filter: `drop-shadow(0 0 8px ${C.magenta})` }}
        />
        <line x1={xW} y1={yCpu + 34} x2={xW} y2={yPin - 46} stroke={hexA(C.amber, 0.6)} strokeWidth={2} strokeDasharray="5 6" />
      </g>
      <text x={x0 - 14} y={yPin - 34} textAnchor="end" style={mono(18, C.muted)}>
        HIGH
      </text>
      <text x={x0 - 14} y={yPin + 46} textAnchor="end" style={mono(18, C.muted)}>
        LOW
      </text>
      <text x={xW + span * 0.025} y={yCpu - 46} textAnchor="middle" opacity={grow > 0.16 ? 1 : 0} style={mono(20, C.amber, { fontWeight: 700 })}>
        gpio_set_level
      </text>
      <g opacity={ret}>
        <rect x={x0 + span * 0.2 - 4} y={yCpu + 44} width={290} height={38} rx={19} fill="rgba(10,4,32,.9)" stroke={GREEN} />
        <text x={x0 + span * 0.2 + 141} y={yCpu + 70} textAnchor="middle" style={mono(20, GREEN, { fontWeight: 700 })}>
          ✓ returns ESP_OK at once
        </text>
      </g>
      <g opacity={hold}>
        <text x={(xW + x1) / 2} y={yPin - 62} textAnchor="middle" style={mono(24, C.ink)}>
          held HIGH by the hardware — no CPU needed
        </text>
      </g>
      <text x={x1} y={H - 30} textAnchor="end" style={mono(18, C.muted)}>
        time →
      </text>
    </svg>
  );
};

