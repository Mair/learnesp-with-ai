/**
 * 4 · gpio_reset_pin(BUTTON) — the same first step, and its catch for inputs.
 *   state   what reset does (gpio.c): GPIO function · output off · pull-up on · INPUT OFF
 *   read    so gpio_get_level returns 0 whatever the button does
 *
 * FACTS: gpio.c gpio_reset_pin l.462–481; driver/gpio.h l.146 (@warning).
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { Explainer, mono, RED, VIEW_H as H } from '../../components/Explainer';
import { C, FONT, hexA } from '../../theme/palette';
import { after, InputPin, pinState } from './parts';
import { downAt, FPS, RESET as S, sceneDur } from './timeline';

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
      args={S.args.map((a) => ({ ...a, color: C.pink }))}
      captions={S.captions}
      views={[
        { at: V.state, component: StateView, active: [0], label: 'what reset does · gpio.c', accent: C.cyan, right: () => 'components/esp_driver_gpio/src/gpio.c' },
        { at: V.read, component: ReadView, active: [0], label: 'after reset alone', accent: RED, right: () => 'input off → always 0' },
      ]}
    />
  );
};

const SRC = [
  'esp_err_t gpio_reset_pin(gpio_num_t gpio_num)',
  '{',
  '    gpio_intr_disable(gpio_num);',
  '    // for powersave reasons, the GPIO should not be floating',
  '    gpio_pullup_en(gpio_num);',
  '    gpio_pulldown_dis(gpio_num);',
  '    gpio_input_disable(gpio_num);',
  '    gpio_output_disable(gpio_num);',
  '    …',
  '    gpio_hal_func_sel(…, PIN_FUNC_GPIO);',
  '    …',
  '}',
];

const StateView: React.FC<{ t: number }> = ({ t }) => {
  const s = S.state;
  const rows = [
    { at: s.gpio, k: 'function', v: 'plain GPIO', line: 9, c: C.cyan },
    { at: s.output, k: 'output', v: 'off', line: 7, c: C.muted },
    { at: s.pullup, k: 'pull-up', v: 'on · weak, ~45 kΩ', line: 4, c: C.amber },
    { at: s.pullup + 0.3, k: 'pull-down', v: 'off', line: 5, c: C.muted },
    { at: s.input, k: 'input', v: 'OFF', line: 6, c: RED },
  ];
  const lit = new Set(rows.filter((r) => t >= r.at).map((r) => r.line));
  const latest = rows.filter((r) => t >= r.at).slice(-1)[0]?.line ?? -1;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '560px 1fr', gap: 40, alignItems: 'center' }}>
      <div style={{ display: 'grid', gap: 12, opacity: after(t, s.known) }}>
        {rows.map((r) => {
          const p = after(t, r.at, 0.35);
          const strong = r.c === RED && p > 0.5;
          return (
            <div
              key={r.k}
              style={{
                display: 'grid',
                gridTemplateColumns: '170px 1fr',
                padding: '10px 16px',
                borderRadius: 10,
                opacity: 0.3 + 0.7 * p,
                border: `${strong ? 2.5 : 1}px solid ${p > 0.5 ? hexA(r.c, 0.75) : 'rgba(255,255,255,.1)'}`,
                background: p > 0.5 ? hexA(r.c, strong ? 0.16 : 0.1) : 'transparent',
                boxShadow: strong ? `0 0 26px ${hexA(RED, 0.35)}` : undefined,
                ...mono(26, C.ink),
              }}
            >
              <span style={{ color: C.muted }}>{r.k}</span>
              <span style={{ color: r.c === C.muted ? C.ink : r.c, fontWeight: 700 }}>{r.v}</span>
            </div>
          );
        })}
      </div>
      <pre style={{ margin: 0, fontFamily: FONT.mono, fontSize: 20, lineHeight: 1.5, color: hexA('#cfd6ff', 0.75) }}>
        {SRC.map((l, i) => (
          <div
            key={i}
            style={{
              padding: '0 10px',
              borderLeft: `3px solid ${i === latest ? (i === 6 ? RED : C.cyan) : 'transparent'}`,
              background: lit.has(i) ? hexA(i === 6 ? RED : C.cyan, i === latest ? 0.16 : 0.06) : 'transparent',
              color: lit.has(i) ? '#fff' : l.trim().startsWith('//') ? C.muted : undefined,
            }}
          >
            {l}
          </div>
        ))}
      </pre>
    </div>
  );
};

const ReadView: React.FC<{ t: number }> = ({ t }) => {
  const r = S.read;
  const down = downAt(r.presses, t);
  const st = pinState({ wpu: 1, wpd: 0, press: down ? 1 : 0 });
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1000px 1fr', alignItems: 'center', gap: 20 }}>
      <div style={{ height: H, display: 'grid', alignItems: 'center' }}>
        <InputPin ie={0} wpu={1} wpd={0} press={down ? 1 : 0} v={st.v} reading={0} width={980} focus={t >= r.cant ? 'ie' : null} />
      </div>
      <div style={{ display: 'grid', gap: 20, opacity: after(t, r.cant) }}>
        <div style={mono(24, C.muted)}>button: {down ? <b style={{ color: C.cyan }}>pressed</b> : <b style={{ color: C.amber }}>released</b>}</div>
        <div style={{ opacity: after(t, r.zero), ...mono(30, C.ink) }}>
          gpio_get_level(BUTTON)
          <br />→ <b style={{ color: RED, fontSize: 40 }}>0</b>
        </div>
        <div style={{ opacity: after(t, r.zero + 0.4), fontSize: 22, color: C.muted, lineHeight: 1.4 }}>the input gate is open — nothing reaches the register</div>
      </div>
    </div>
  );
};
