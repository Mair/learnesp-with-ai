/**
 * 6 · gpio_set_pull_mode(BUTTON, GPIO_PULLUP_ONLY) — the default level.
 *   modes     the four gpio_pull_mode_t values; PULLUP_ONLY = pull-up in, pull-down out
 *   current   45 kΩ → 3.3 V ÷ 45 kΩ ≈ 73 µA when pressed (datasheet ~75 µA)
 *   already   gpio_reset_pin turned it on "for powersave reasons" — say it on purpose
 *   gpio34    no pulls on 34–39: logs an error, still returns ESP_OK → external resistor
 *
 * FACTS: gpio_types.h l.116–121; gpio.c l.85, l.279–313, l.466–468; datasheet RPU/RPD, ~75 µA;
 * esp_check.h log format.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { Explainer, GREEN, mono, RED, VIEW_H as H } from '../../components/Explainer';
import { C, FONT, hexA } from '../../theme/palette';
import { after, clamp01, InputPin, Pill, pinState, Verdict } from './parts';
import { FPS, LOG_PULL_34, PULL as S, PULL_UA, sceneDur } from './timeline';

const ARG_COLOR = [C.pink, C.amber];

export const Pull: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const V = S.views;
  const subs = [S.args[0].sub, t < S.modes.connects ? S.args[1].sub : 'pull-up in · pull-down out'];
  return (
    <Explainer
      t={t}
      frames={Math.round(sceneDur('pull') * FPS)}
      kicker="A default level · gpio_set_pull_mode()"
      code={S.code}
      run={S.run}
      args={S.args.map((a, i) => ({ ...a, sub: subs[i], color: ARG_COLOR[i] }))}
      captions={S.captions}
      views={[
        { at: V.modes, component: ModesView, active: [1], label: 'gpio_pull_mode_t · inside the pin', accent: C.amber, right: () => 'hal/gpio_types.h' },
        { at: V.current, component: CurrentView, active: [1], label: 'how strong is a pull-up?', accent: C.amber, right: () => 'datasheet · RPU ≈ 45 kΩ' },
        { at: V.already, component: AlreadyView, active: [0, 1], label: 'reset already did this — so why?', accent: C.cyan, right: () => 'gpio.c · gpio_reset_pin' },
        { at: V.gpio34, component: Gpio34View, active: [0], label: 'GPIO 34–39 have no pull resistors', accent: RED, right: () => 'recorded in QEMU' },
      ]}
    />
  );
};

const MODES = [
  { k: 'GPIO_PULLUP_ONLY', v: 'up only', key: 'up' as const },
  { k: 'GPIO_PULLDOWN_ONLY', v: 'down only', key: 'down' as const },
  { k: 'GPIO_PULLUP_PULLDOWN', v: 'both', key: 'both' as const },
  { k: 'GPIO_FLOATING', v: 'neither', key: 'floating' as const },
];

const ModesView: React.FC<{ t: number }> = ({ t }) => {
  const m = S.modes;
  const wpu = clamp01((t - m.connects) / 0.35);
  const st = pinState({ wpu: t >= m.connects ? 1 : 0, wpd: 0, press: 0, s: t });
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '560px 1fr', alignItems: 'center', gap: 20 }}>
      <div style={{ display: 'grid', gap: 12 }}>
        {MODES.map((x, i) => {
          const p = after(t, m[x.key], 0.35);
          const chosen = i === 0 && t >= m.connects;
          return (
            <div
              key={x.k}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 130px',
                padding: '12px 18px',
                borderRadius: 12,
                opacity: 0.25 + 0.75 * p,
                border: `${chosen ? 2.5 : 1}px solid ${chosen ? C.amber : 'rgba(255,255,255,.14)'}`,
                background: chosen ? hexA(C.amber, 0.12) : 'transparent',
                boxShadow: chosen ? `0 0 24px ${hexA(C.amber, 0.35)}` : undefined,
                ...mono(23, chosen ? '#fff' : C.ink),
              }}
            >
              <span>{x.k}</span>
              <span style={{ color: C.muted, textAlign: 'right' }}>{x.v}</span>
            </div>
          );
        })}
      </div>
      <div style={{ height: H, display: 'grid', alignItems: 'center' }}>
        <InputPin ie={1} wpu={wpu} wpd={0} press={0} v={st.v} floating={st.floating} reading={t >= m.connects ? 1 : null} showButton={0.5} width={940} focus={t >= m.disconnects ? 'wpd' : t >= m.connects ? 'wpu' : null} />
      </div>
    </div>
  );
};

const CurrentView: React.FC<{ t: number }> = ({ t }) => {
  const c = S.current;
  const pressed = t >= c.press && t < c.release;
  const st = pinState({ wpu: 1, wpd: 0, press: pressed ? 1 : 0 });
  const flowOn = pressed ? clamp01((t - c.press) / 0.3) : 0;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1000px 1fr', alignItems: 'center', gap: 24 }}>
      <div style={{ height: H, display: 'grid', alignItems: 'center' }}>
        <InputPin ie={1} wpu={1} wpd={0} press={pressed ? 1 : 0} v={st.v} reading={pressed ? 0 : 1} flow={(t - c.press) * 60} flowOn={flowOn} width={980} focus={t < c.press ? 'wpu' : null} />
      </div>
      <div style={{ display: 'grid', gap: 16 }}>
        <div style={{ opacity: after(t, c.k45), ...mono(32, C.amber, { fontWeight: 700 }) }}>R ≈ 45 kΩ</div>
        <div style={{ opacity: after(t, c.ua), ...mono(28, C.ink) }}>
          3.3 V ÷ 45 kΩ
          <br />≈ <b style={{ color: C.amber, fontSize: 40 }}>{Math.round(PULL_UA)} µA</b>
        </div>
        <div style={{ opacity: after(t, c.ua + 0.4), fontSize: 20, color: C.muted }}>datasheet: "~75 µA"</div>
        <div style={{ opacity: after(t, c.harmless) }}>
          <Pill color={GREEN} size={22}>
            tiny — the LED took ~5.9 mA, 80× more
          </Pill>
        </div>
      </div>
    </div>
  );
};

const AlreadyView: React.FC<{ t: number }> = ({ t }) => {
  const a = S.already;
  const reset = after(t, a.reset);
  const side = after(t, a.side);
  const say = after(t, a.say);
  const reader = after(t, a.reader);
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 50, alignItems: 'center', padding: '0 30px' }}>
      <div style={{ display: 'grid', gap: 18, opacity: reset }}>
        <div style={{ ...mono(22, C.muted), lineHeight: 1.6, borderRadius: 14, border: '1px solid rgba(255,255,255,.14)', padding: '14px 18px', background: 'rgba(10,4,32,.6)' }}>
          <span style={{ color: '#cfd6ff' }}>gpio_reset_pin(…)</span>
          <br />
          <span style={{ color: side > 0.5 ? C.amber : C.muted }}>// for powersave reasons, the GPIO</span>
          <br />
          <span style={{ color: side > 0.5 ? C.amber : C.muted }}>// should not be floating</span>
          <br />
          <span style={{ color: '#fff' }}>gpio_pullup_en(gpio_num);</span>
        </div>
        <div style={{ opacity: side }}>
          <Pill color={C.amber} size={22}>
            a side effect — not a promise
          </Pill>
        </div>
      </div>
      <div style={{ display: 'grid', gap: 18, opacity: say, transform: `translateY(${(1 - say) * 14}px)` }}>
        <pre style={{ margin: 0, fontFamily: FONT.mono, fontSize: 24, lineHeight: 1.7, color: C.muted }}>
          <div>gpio_reset_pin(BUTTON);</div>
          <div>gpio_set_direction(BUTTON, GPIO_MODE_INPUT);</div>
          <div style={{ color: '#fff', borderLeft: `4px solid ${C.amber}`, paddingLeft: 12, background: `linear-gradient(90deg, ${hexA(C.amber, 0.16)}, transparent)` }}>
            gpio_set_pull_mode(BUTTON, GPIO_PULLUP_ONLY);
          </div>
        </pre>
        <Verdict ok p={reader} size={24}>
          the next reader sees: this button needs a pull-up
        </Verdict>
      </div>
    </div>
  );
};

const Gpio34View: React.FC<{ t: number }> = ({ t }) => {
  const g = S.gpio34;
  const code = after(t, g.code);
  const none = after(t, g.none);
  const log = after(t, g.log);
  const ok = after(t, g.ok);
  const check = after(t, g.check);
  const board = after(t, g.board);
  const box = (border: string): React.CSSProperties => ({ borderRadius: 14, border: `1px solid ${border}`, padding: '14px 18px', background: 'rgba(10,4,32,.6)' });
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr 560px', gap: 34, padding: '0 20px', alignItems: 'center' }}>
      <div style={{ display: 'grid', gap: 16 }}>
        <div style={{ opacity: code, ...mono(28, '#fff'), padding: '10px 16px', borderLeft: `4px solid ${RED}`, background: `linear-gradient(90deg, ${hexA(RED, 0.14)}, transparent)` }}>
          gpio_set_pull_mode(<span style={{ color: RED }}>GPIO_NUM_34</span>, GPIO_PULLUP_ONLY);
        </div>
        <div style={{ opacity: none, fontSize: 22, color: C.muted }}>GPIO 34–39: input only — no pull resistors in the pad</div>
        <div style={{ ...box('rgba(255,255,255,.14)'), opacity: log }}>
          <div style={mono(15, C.muted, { letterSpacing: '.14em', marginBottom: 8 })}>RECORDED IN QEMU</div>
          <div style={mono(18, RED)}>{LOG_PULL_34}</div>
        </div>
        <div style={{ opacity: ok, ...mono(28, C.ink) }}>
          …then returns <b style={{ color: C.amber }}>ESP_OK</b> <span style={{ color: C.muted, fontSize: 22 }}>(gpio_set_pull_mode ignores it)</span>
        </div>
        <Verdict ok={false} p={check} size={23}>
          ESP_ERROR_CHECK(…) sees ESP_OK — it won't stop you
        </Verdict>
      </div>
      <div style={{ opacity: board, transform: `translateY(${(1 - board) * 16}px)` }}>
        <svg width={540} height={380} style={{ display: 'block', overflow: 'visible' }}>
          <line x1={150} y1={40} x2={390} y2={40} stroke={C.amber} strokeWidth={4} />
          <text x={270} y={26} textAnchor="middle" style={mono(20, C.amber, { fontWeight: 700 })}>
            3.3 V
          </text>
          <path d="M 270 40 L 270 80 L 254 90 L 286 106 L 254 122 L 286 138 L 254 154 L 286 170 L 270 180 L 270 220" fill="none" stroke={GREEN} strokeWidth={4} strokeLinejoin="round" />
          <text x={306} y={136} style={mono(22, GREEN, { fontWeight: 700 })}>
            10 kΩ
          </text>
          <text x={306} y={162} style={mono(16, C.muted)}>
            on the board
          </text>
          <line x1={120} y1={220} x2={420} y2={220} stroke={C.muted} strokeWidth={4} />
          <rect x={60} y={196} width={70} height={48} rx={8} fill={hexA(C.pink, 0.25)} stroke={C.pink} strokeWidth={3} />
          <text x={95} y={272} textAnchor="middle" style={mono(18, C.pink, { fontWeight: 700 })}>
            GPIO 34
          </text>
          <text x={420} y={260} textAnchor="middle" style={mono(18, C.muted)}>
            → button → GND
          </text>
          <text x={270} y={330} textAnchor="middle" style={{ fontFamily: FONT.sans, fontSize: 24, fill: C.ink }}>
            an external pull-up does the job
          </text>
        </svg>
      </div>
    </div>
  );
};
