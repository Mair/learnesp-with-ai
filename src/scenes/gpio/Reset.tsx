/**
 * 4 · gpio_reset_pin(LED) — a known starting point.
 *
 *   module   GPIO number ≠ module pin number: the WROOM-32E, all 38 pins; IO2 = pin 24
 *   count    34 GPIOs, 28 can be outputs (34–39 input only)
 *   state    what reset really does (gpio.c): GPIO function, input off, output off, pull-up on
 *
 * FACTS: WROOM-32E datasheet Table 3; soc_caps.h masks; gpio.c gpio_reset_pin.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { Explainer, GREEN, mono, RED, VIEW_H as H, VIEW_W as W } from '../../components/Explainer';
import { C, FONT, hexA } from '../../theme/palette';
import { Wroom, wroomPinXY } from './board';
import { after } from './parts';
import { FPS, MODULE_PIN, RESET as S, sceneDur } from './timeline';

export const Reset: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const V = S.views;
  return (
    <Explainer
      t={t}
      frames={Math.round(sceneDur('reset') * FPS)}
      kicker="A known start · gpio_reset_pin()"
      code={S.code}
      run={S.run}
      args={S.args.map((a) => ({ ...a, sub: t < S.module.pin24 ? a.sub : 'module pin 24 · labelled IO2', color: C.pink }))}
      captions={S.captions}
      views={[
        { at: V.module, component: ModuleView, active: [0], label: 'pin number vs GPIO number', accent: C.pink, right: () => 'ESP32-WROOM-32E · datasheet table 3' },
        { at: V.count, component: CountView, active: [0], label: 'how many GPIOs', accent: C.pink, right: () => 'ESP32' },
        { at: V.state, component: StateView, active: [0], label: 'what reset does · gpio.c', accent: C.cyan, right: () => 'components/esp_driver_gpio/src/gpio.c' },
      ]}
    />
  );
};

// ── views ─────────────────────────────────────────────────────────────────

const MX = 170;
const MY = 14;

const ModuleView: React.FC<{ t: number }> = ({ t }) => {
  const m = S.module;
  const gp = after(t, m.gpio);
  const pos = after(t, m.notPos);
  const hot = after(t, m.pin24);
  const io2 = after(t, m.io2);
  const [px, py] = wroomPinXY(MX, MY, MODULE_PIN);
  const tx = 760;
  return (
    <svg width={W} height={H} style={{ display: 'block', overflow: 'visible' }}>
      <Wroom x={MX} y={MY} hot={hot > 0.5 ? MODULE_PIN : -1} glow={hot} dimOthers={0.6 * hot} />
      {/* leader from pin 24 to the explanation */}
      {hot > 0 && (
        <path
          d={`M ${px + 14} ${py - 4} L ${tx - 30} ${py - 4} L ${tx - 30} 316`}
          fill="none"
          stroke={C.pink}
          strokeWidth={2.5}
          pathLength={1}
          strokeDasharray={`${hot} 1`}
          style={{ filter: `drop-shadow(0 0 6px ${C.pink})` }}
        />
      )}
      <g opacity={gp}>
        <text x={tx} y={70} style={{ fontFamily: FONT.sans, fontSize: 30, fontWeight: 700, fill: C.pink }}>
          GPIO number
        </text>
        <text x={tx} y={104} style={{ fontFamily: FONT.sans, fontSize: 24, fill: C.ink }}>
          what your code uses: <tspan style={mono(24, C.pink)}>GPIO_NUM_2</tspan>
        </text>
      </g>
      <g opacity={pos}>
        <text x={tx} y={170} style={{ fontFamily: FONT.sans, fontSize: 30, fontWeight: 700, fill: C.amber }}>
          pin number
        </text>
        <text x={tx} y={204} style={{ fontFamily: FONT.sans, fontSize: 24, fill: C.ink }}>
          where it sits on the package — a different numbering
        </text>
      </g>
      <g opacity={hot}>
        <text x={tx} y={300} style={mono(40, C.ink, { fontWeight: 700 })}>
          <tspan fill={C.amber}>pin 24</tspan>
          <tspan fill={C.muted}> = </tspan>
          <tspan fill={C.pink} opacity={io2}>IO2</tspan>
          <tspan fill={C.muted} opacity={io2}> = </tspan>
          <tspan fill={C.pink} opacity={io2}>GPIO 2</tspan>
        </text>
        <text x={tx} y={350} opacity={io2} style={{ fontFamily: FONT.sans, fontSize: 22, fill: C.muted }}>
          pins 17–22 are NC: GPIO 6–11 go to the module's flash, not to the edge
        </text>
      </g>
    </svg>
  );
};

const CountView: React.FC<{ t: number }> = ({ t }) => {
  const c = S.count;
  const c34 = after(t, c.has34);
  const c28 = after(t, c.out28);
  const cellW = (W - 140) / 34;
  const gpios = [...Array(20).keys(), 21, 22, 23, 25, 26, 27, 32, 33, 34, 35, 36, 37, 38, 39];
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', padding: '0 70px', opacity: c34 }}>
      <div style={{ ...mono(30, C.ink), marginBottom: 24 }}>
        <b>34</b> GPIOs
        <span style={{ opacity: c28, color: GREEN }}> · 28 can be outputs</span>
        <span style={{ opacity: c28, color: RED }}> · 34–39 input only</span>
      </div>
      <div style={{ display: 'flex' }}>
        {gpios.map((g, i) => {
          const show = after(t, c.has34 + i * 0.025, 0.25);
          const struck = g >= 34 ? c28 : 0;
          return (
            <div
              key={g}
              style={{
                width: cellW - 6,
                marginRight: 6,
                height: 90,
                borderRadius: 8,
                display: 'grid',
                placeItems: 'center',
                opacity: show,
                background: struck > 0 ? hexA(RED, 0.18 * struck) : hexA(GREEN, 0.1 * c28),
                border: `1.5px solid ${struck > 0.5 ? hexA(RED, 0.8) : g === 2 ? C.pink : hexA(C.ink, 0.25)}`,
                ...mono(20, struck > 0.5 ? '#ffc4cf' : C.ink, { fontWeight: 700 }),
                textDecoration: struck > 0.5 ? 'line-through' : undefined,
              }}
            >
              {g}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SRC = [
  'esp_err_t gpio_reset_pin(gpio_num_t gpio_num)',
  '{',
  '    gpio_intr_disable(gpio_num);',
  '    gpio_pullup_en(gpio_num);      // "should not be floating"',
  '    gpio_pulldown_dis(gpio_num);',
  '    gpio_input_disable(gpio_num);',
  '    gpio_output_disable(gpio_num);',
  '    gpio_hal_func_sel(…, PIN_FUNC_GPIO);',
  '    return ESP_OK;',
  '}',
];

const StateView: React.FC<{ t: number }> = ({ t }) => {
  const s = S.state;
  const rows = [
    { at: s.gpio, k: 'function', v: 'plain GPIO', line: 7, c: C.cyan },
    { at: s.input, k: 'input', v: 'off', line: 5, c: C.muted },
    { at: s.output, k: 'output', v: 'off — not driving', line: 6, c: C.muted },
    { at: s.pullup, k: 'pull-up', v: 'on · ~45 kΩ, weak', line: 3, c: C.amber },
    { at: s.pullup + 0.3, k: 'pull-down', v: 'off', line: 4, c: C.muted },
    { at: s.pullup + 0.6, k: 'interrupt', v: 'off', line: 2, c: C.muted },
  ];
  const lit = new Set(rows.filter((r) => t >= r.at).map((r) => r.line));
  const latest = rows.filter((r) => t >= r.at).slice(-1)[0]?.line ?? -1;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '560px 1fr', gap: 40, alignItems: 'center' }}>
      <div style={{ display: 'grid', gap: 10, opacity: after(t, s.known) }}>
        {rows.map((r) => {
          const p = after(t, r.at, 0.35);
          return (
            <div
              key={r.k}
              style={{
                display: 'grid',
                gridTemplateColumns: '170px 1fr',
                padding: '9px 16px',
                borderRadius: 10,
                opacity: 0.3 + 0.7 * p,
                border: `1px solid ${p > 0.5 ? hexA(r.c, 0.7) : 'rgba(255,255,255,.1)'}`,
                background: p > 0.5 ? hexA(r.c, 0.1) : 'transparent',
                ...mono(24, C.ink),
              }}
            >
              <span style={{ color: C.muted }}>{r.k}</span>
              <span style={{ color: r.c === C.muted ? C.ink : r.c, fontWeight: 700 }}>{r.v}</span>
            </div>
          );
        })}
        <div style={{ opacity: after(t, s.floating), fontSize: 22, color: C.muted, marginTop: 4 }}>pulled weakly high, so it isn't left floating</div>
      </div>
      <pre style={{ margin: 0, fontFamily: FONT.mono, fontSize: 21, lineHeight: 1.55, color: hexA('#cfd6ff', 0.75) }}>
        {SRC.map((l, i) => (
          <div
            key={i}
            style={{
              padding: '0 10px',
              borderLeft: `3px solid ${i === latest ? C.cyan : 'transparent'}`,
              background: lit.has(i) ? hexA(C.cyan, i === latest ? 0.16 : 0.06) : 'transparent',
              color: lit.has(i) ? '#fff' : undefined,
            }}
          >
            {l}
          </div>
        ))}
      </pre>
    </div>
  );
};
