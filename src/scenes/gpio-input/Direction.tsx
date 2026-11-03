/**
 * 5 · gpio_set_direction(BUTTON, GPIO_MODE_INPUT) — making it an input.
 *   buffer   the input-enable gate closes; the output driver stays off; mode = 0b001
 *   forget   skip it → gpio_get_level is always 0 → "pressed" forever
 *   any      INPUT works on every GPIO, even 34–39 (only output modes are refused)
 *
 * FACTS: gpio_types.h l.92/99; gpio.c l.315–345; gpio_ll.h l.363–366; driver/gpio.h l.146.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { Explainer, GREEN, mono, RED, VIEW_H as H } from '../../components/Explainer';
import { C, FONT, hexA } from '../../theme/palette';
import { after, clamp01, InputPin, Pill, pinState, Verdict } from './parts';
import { DIRECTION as S, FPS, sceneDur } from './timeline';

const ARG_COLOR = [C.pink, C.amber];

export const Direction: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const V = S.views;
  const subs = [S.args[0].sub, t < S.buffer.on ? S.args[1].sub : 'input on · output off'];
  return (
    <Explainer
      t={t}
      frames={Math.round(sceneDur('direction') * FPS)}
      kicker="Making it an input · gpio_set_direction()"
      code={S.code}
      run={S.run}
      args={S.args.map((a, i) => ({ ...a, sub: subs[i], color: ARG_COLOR[i] }))}
      captions={S.captions}
      views={[
        { at: V.buffer, component: BufferView, active: [1], label: 'mode · inside the pin', accent: C.cyan, right: () => 'GPIO_MODE_INPUT = 0b001' },
        { at: V.forget, component: ForgetView, active: [1], label: 'forget this line', accent: RED, right: () => 'driver/gpio.h' },
        { at: V.any, component: AnyView, active: [0, 1], label: 'which pins can be inputs?', accent: GREEN, right: () => 'gpio.c · gpio_set_direction' },
      ]}
    />
  );
};

const BufferView: React.FC<{ t: number }> = ({ t }) => {
  const b = S.buffer;
  const ie = clamp01((t - b.on) / 0.35);
  const st = pinState({ wpu: 1, wpd: 0, press: 0 });
  const bits = [
    { k: 'OD', v: 0 },
    { k: 'output', v: 0 },
    { k: 'input', v: 1 },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1000px 1fr', alignItems: 'center', gap: 24 }}>
      <div style={{ height: H, display: 'grid', alignItems: 'center' }}>
        <InputPin ie={ie} wpu={1} wpd={0} press={0} v={st.v} reading={t >= b.on + 0.2 ? 1 : 0} showDriver={after(t, b.driverOff)} width={980} focus={t < b.driverOff ? 'ie' : 'driver'} />
      </div>
      <div style={{ display: 'grid', gap: 18 }}>
        <div style={{ display: 'flex', gap: 10, opacity: after(t, b.buffer) }}>
          {bits.map((x) => (
            <div key={x.k} style={{ display: 'grid', justifyItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: 104,
                  height: 70,
                  borderRadius: 10,
                  display: 'grid',
                  placeItems: 'center',
                  border: `2px solid ${x.v ? GREEN : 'rgba(255,255,255,.18)'}`,
                  background: x.v ? hexA(GREEN, 0.14) : 'transparent',
                  ...mono(34, x.v ? GREEN : C.muted, { fontWeight: 800 }),
                }}
              >
                {x.v}
              </div>
              <span style={mono(16, C.muted)}>{x.k}</span>
            </div>
          ))}
        </div>
        <div style={{ opacity: after(t, b.driverOff), ...mono(22, C.muted) }}>output driver: off</div>
        <div style={{ opacity: after(t, b.listens) }}>
          <Pill color={C.cyan} size={26} solid>
            only listening
          </Pill>
        </div>
      </div>
    </div>
  );
};

const ForgetView: React.FC<{ t: number }> = ({ t }) => {
  const f = S.forget;
  const line = after(t, f.line);
  const zero = after(t, f.zero);
  const pressed = after(t, f.pressed);
  const forever = after(t, f.forever);
  const nReads = Math.max(0, Math.floor((t - f.zero) / 0.25));
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 50, alignItems: 'center', padding: '0 30px' }}>
      <div style={{ display: 'grid', gap: 22 }}>
        <pre style={{ margin: 0, fontFamily: FONT.mono, fontSize: 26, lineHeight: 1.7, color: '#cfd6ff' }}>
          <div>gpio_reset_pin(BUTTON);</div>
          <div style={{ position: 'relative', display: 'inline-block', opacity: 1 - 0.55 * line, color: line > 0.5 ? RED : undefined }}>
            gpio_set_direction(BUTTON, GPIO_MODE_INPUT);
            <span style={{ position: 'absolute', left: 0, top: '52%', height: 3, width: `${line * 100}%`, background: RED, boxShadow: `0 0 8px ${RED}` }} />
          </div>
          <div>gpio_set_pull_mode(BUTTON, GPIO_PULLUP_ONLY);</div>
        </pre>
        <div style={{ opacity: zero, fontSize: 22, color: C.muted, fontStyle: 'italic', lineHeight: 1.4 }}>
          "If the pad is not configured for input (or input and output) the returned value is always 0."
          <br />— driver/gpio.h
        </div>
      </div>
      <div style={{ display: 'grid', gap: 20 }}>
        <div style={{ opacity: zero, ...mono(24, C.muted) }}>
          button: <b style={{ color: C.amber }}>released</b>
        </div>
        <div style={{ opacity: zero, ...mono(30, C.ink), minHeight: 46, letterSpacing: '.12em' }}>
          reads: <span style={{ color: RED, fontWeight: 800 }}>{Array.from({ length: Math.min(nReads, 10) }, () => '0').join(' ')}</span>
        </div>
        <div style={{ opacity: pressed, ...mono(30, C.ink) }}>
          0 → <b style={{ color: RED }}>"pressed"</b>
        </div>
        <Verdict ok={false} p={forever} size={26}>
          your program sees the button held down — forever
        </Verdict>
      </div>
    </div>
  );
};

const AnyView: React.FC<{ t: number }> = ({ t }) => {
  const a = S.any;
  const every = after(t, a.every);
  const g34 = after(t, a.gpio34);
  const out = after(t, a.outputs);
  const row = (code: React.ReactNode, res: React.ReactNode, ok: boolean, p: number) => (
    <div
      style={{
        opacity: p,
        transform: `translateY(${(1 - p) * 14}px)`,
        display: 'grid',
        gridTemplateColumns: '860px 1fr',
        alignItems: 'center',
        padding: '16px 22px',
        borderRadius: 14,
        border: `1.5px solid ${hexA(ok ? GREEN : RED, 0.6)}`,
        background: hexA(ok ? GREEN : RED, 0.07),
        ...mono(26, '#fff'),
      }}
    >
      <span>{code}</span>
      <span style={{ color: ok ? GREEN : RED, fontWeight: 800 }}>{res}</span>
    </div>
  );
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 22, padding: '0 40px' }}>
      <div style={{ opacity: every, fontSize: 30, color: C.ink }}>
        <b style={{ color: GREEN }}>GPIO_MODE_INPUT</b> — any of the 34 GPIOs
      </div>
      {row(
        <>
          gpio_set_direction(<span style={{ color: C.pink }}>GPIO_NUM_34</span>, GPIO_MODE_INPUT);
        </>,
        '→ ESP_OK ✓',
        true,
        g34,
      )}
      {row(
        <>
          gpio_set_direction(<span style={{ color: C.pink }}>GPIO_NUM_34</span>, GPIO_MODE_OUTPUT);
        </>,
        '→ ESP_ERR_INVALID_ARG',
        false,
        out,
      )}
      <div style={{ opacity: out, fontSize: 22, color: C.muted }}>
        the check in gpio.c only refuses modes with the output bit: <span style={mono(22, C.cyan)}>mode & GPIO_MODE_DEF_OUTPUT</span>
      </div>
    </div>
  );
};
