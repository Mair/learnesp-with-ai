/**
 * 3 · gpio_config(&io) — one struct for the whole pin, interrupt type included.
 *   struct   one struct → every pin whose bit is set in pin_bit_mask
 *   mask     1ULL << 18 → bit 18 of a 64-bit mask; 1 << 39 on a 32-bit int ✗
 *   fields   mode / pulls: same as the input video
 *   intr     the six gpio_int_type_t values; NEGEDGE = 1 → 0 = the press
 *   errors   mask 0 / a GPIO that doesn't exist → ESP_ERR_INVALID_ARG
 *
 * FACTS: driver/gpio.h l.44–71; gpio.c l.347–440; gpio_types.h l.80–88.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { GREEN, mono, RED } from '../../components/Explainer';
import { C, FONT, hexA } from '../../theme/palette';
import { after, Bits, CodeAndViews, InputPin, Pill, pinState, Verdict, VIEW2_W as W } from './parts';
import { BTN, CONFIG as S, CONFIG_CODE, FPS, LOG_MASK, sceneDur } from './timeline';

export const Config: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const V = S.views;
  return (
    <CodeAndViews
      t={t}
      frames={Math.round(sceneDur('config') * FPS)}
      kicker="One struct · gpio_config()"
      file="main/main.c"
      code={CONFIG_CODE}
      codeSize={23}
      captions={S.captions}
      views={[
        { at: V.struct, component: StructView, label: 'gpio_config_t · driver/gpio.h', accent: C.cyan, lines: [0, 6, 7] },
        { at: V.mask, component: MaskView, label: 'pin_bit_mask · uint64_t', accent: C.pink, lines: [1], right: () => 'bits 39 … 0' },
        { at: V.fields, component: FieldsView, label: 'mode · pulls', accent: C.amber, lines: [2, 3, 4] },
        { at: V.intr, component: IntrView, label: 'intr_type · gpio_int_type_t', accent: C.magenta, lines: [5], right: () => 'hal/gpio_types.h' },
        { at: V.errors, component: ErrorsView, label: 'what it checks · gpio.c', accent: RED, lines: [7], right: () => 'recorded in QEMU' },
      ]}
    />
  );
};

const FIELDS = [
  ['pin_bit_mask', 'uint64_t', 'which pins'],
  ['mode', 'gpio_mode_t', 'input / output / …'],
  ['pull_up_en', 'gpio_pullup_t', 'on / off'],
  ['pull_down_en', 'gpio_pulldown_t', 'on / off'],
  ['intr_type', 'gpio_int_type_t', 'when to interrupt'],
];

const StructView: React.FC<{ t: number }> = ({ t }) => {
  const s = S.struct;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 14, padding: '0 20px' }}>
      {FIELDS.map(([k, ty, what], i) => {
        const p = after(t, s.one + i * 0.18, 0.35);
        return (
          <div key={k} style={{ opacity: p, display: 'grid', gridTemplateColumns: '240px 240px 1fr', padding: '10px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,.12)', ...mono(23, C.ink) }}>
            <span style={{ color: k === 'intr_type' ? C.magenta : C.cyan, fontWeight: 700 }}>{k}</span>
            <span style={{ color: C.muted }}>{ty}</span>
            <span>{what}</span>
          </div>
        );
      })}
      <div style={{ opacity: after(t, s.every), fontSize: 26, color: C.ink, marginTop: 10 }}>
        one call configures <b style={{ color: C.pink }}>every pin whose bit is set</b> in the mask
      </div>
    </div>
  );
};

const MaskView: React.FC<{ t: number }> = ({ t }) => {
  const m = S.mask;
  const hot = after(t, m.b18);
  const shown = t >= m.shift ? (b: number) => (b === BTN ? 1 : 0) : () => 0 as const;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 22, padding: '0 10px' }}>
      <div style={{ opacity: after(t, m.bit) }}>
        <Bits n={20} from={39} bit={shown} w={38} h={46} />
        <div style={{ height: 10 }} />
        <Bits n={20} from={19} bit={shown} hot={BTN} hotP={hot} w={38} h={46} color={C.pink} />
      </div>
      <div style={{ opacity: after(t, m.shift), ...mono(30, C.ink) }}>
        1ULL &lt;&lt; 18 = <b style={{ color: C.pink }}>0x40000</b> <span style={{ color: C.muted, fontSize: 22 }}>→ bit 18 = GPIO 18</span>
      </div>
      <div style={{ opacity: after(t, m.sixty4), fontSize: 24, color: C.ink }}>
        <span style={mono(24, C.cyan)}>uint64_t</span>: GPIOs go up to <b>39</b>, past a 32-bit int
      </div>
      <div style={{ display: 'grid', gap: 10, opacity: after(t, m.to39) }}>
        <div style={{ ...mono(24, C.ink), padding: '8px 14px', borderRadius: 10, border: `1px solid ${hexA(RED, 0.6)}`, background: hexA(RED, 0.07) }}>
          1 &lt;&lt; 39 <span style={{ color: RED }}>✗ int is 32 bits — undefined in C</span>
        </div>
        <div style={{ ...mono(24, C.ink), padding: '8px 14px', borderRadius: 10, border: `1px solid ${hexA(GREEN, 0.6)}`, background: hexA(GREEN, after(t, m.ull) * 0.1) }}>
          1ULL &lt;&lt; 39 <span style={{ color: GREEN }}>✓ unsigned long long: 64 bits</span>
        </div>
      </div>
    </div>
  );
};

const FieldsView: React.FC<{ t: number }> = ({ t }) => {
  const f = S.fields;
  const st = pinState({ wpu: 1, wpd: 0, press: 0 });
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', justifyItems: 'center', gap: 20 }}>
      <InputPin ie={1} wpu={t >= f.up ? 1 : 0} wpd={0} press={0} v={st.v} reading={1} width={W - 20} focus={t >= f.down ? 'wpd' : t >= f.up ? 'wpu' : t >= f.input ? 'ie' : null} />
      <div style={{ display: 'flex', gap: 16 }}>
        <span style={{ opacity: after(t, f.input) }}>
          <Pill color={C.cyan} size={20}>
            GPIO_MODE_INPUT
          </Pill>
        </span>
        <span style={{ opacity: after(t, f.up) }}>
          <Pill color={C.amber} size={20}>
            pull-up on
          </Pill>
        </span>
        <span style={{ opacity: after(t, f.down) }}>
          <Pill color={C.muted} size={20}>
            pull-down off
          </Pill>
        </span>
      </div>
    </div>
  );
};

const TYPES = [
  ['GPIO_INTR_DISABLE', 0, 'no interrupt'],
  ['GPIO_INTR_POSEDGE', 1, 'rising: 0 → 1'],
  ['GPIO_INTR_NEGEDGE', 2, 'falling: 1 → 0'],
  ['GPIO_INTR_ANYEDGE', 3, 'either edge'],
  ['GPIO_INTR_LOW_LEVEL', 4, 'while low'],
  ['GPIO_INTR_HIGH_LEVEL', 5, 'while high'],
] as const;

const IntrView: React.FC<{ t: number }> = ({ t }) => {
  const s = S.intr;
  const neg = t >= s.neg;
  const fall = after(t, s.falling);
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'center' }}>
      <div style={{ display: 'grid', gap: 8, opacity: after(t, s.type) }}>
        {TYPES.map(([k, v, what]) => {
          const on = neg && v === 2;
          return (
            <div key={k} style={{ display: 'grid', gridTemplateColumns: '330px 40px 1fr', padding: '9px 14px', borderRadius: 10, border: `${on ? 2.5 : 1}px solid ${on ? C.magenta : 'rgba(255,255,255,.12)'}`, background: on ? hexA(C.magenta, 0.12) : 'transparent', ...mono(20, on ? '#fff' : C.ink) }}>
              <span>{k}</span>
              <span style={{ color: C.muted }}>{v}</span>
              <span style={{ color: on ? C.magenta : C.muted }}>{what}</span>
            </div>
          );
        })}
      </div>
      <svg width={300} height={300} style={{ opacity: fall, overflow: 'visible' }}>
        <path d="M 10 60 L 150 60 L 150 220 L 290 220" fill="none" stroke={C.magenta} strokeWidth={4} style={{ filter: `drop-shadow(0 0 6px ${C.magenta})` }} />
        <text x={20} y={46} style={mono(24, C.amber, { fontWeight: 800 })}>
          1
        </text>
        <text x={270} y={206} style={mono(24, C.cyan, { fontWeight: 800 })}>
          0
        </text>
        <circle cx={150} cy={140} r={20} fill="none" stroke={C.amber} strokeWidth={3} opacity={after(t, s.oneToZero)} />
        <text x={150} y={270} textAnchor="middle" opacity={after(t, s.down)} style={mono(22, C.ink, { fontWeight: 700 })}>
          = the button going down
        </text>
      </svg>
    </div>
  );
};

const ErrorsView: React.FC<{ t: number }> = ({ t }) => {
  const e = S.errors;
  const row = (code: string, p: number) => (
    <div style={{ opacity: p, display: 'grid', gap: 6, padding: '12px 16px', borderRadius: 12, border: `1px solid ${hexA(RED, 0.5)}`, background: 'rgba(10,4,32,.6)' }}>
      <span style={mono(22, '#fff')}>{code}</span>
      <span style={mono(19, RED)}>{LOG_MASK}</span>
      <span style={mono(20, C.ink)}>
        → <b style={{ color: RED }}>ESP_ERR_INVALID_ARG</b>
      </span>
    </div>
  );
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 18, padding: '0 20px' }}>
      <div style={{ opacity: after(t, e.wrap), ...mono(24, '#fff'), padding: '10px 16px', borderLeft: `4px solid ${C.cyan}`, background: `linear-gradient(90deg, ${hexA(C.cyan, 0.14)}, transparent)` }}>
        ESP_ERROR_CHECK(gpio_config(&io));
      </div>
      {row('.pin_bit_mask = 0', after(t, e.empty))}
      {row('.pin_bit_mask = 1ULL << 24   // no GPIO 24', after(t, e.exist))}
      <Verdict ok p={after(t, e.ret)} size={22}>
        ESP_ERROR_CHECK turns either into a stop, not a silent bug
      </Verdict>
      <div style={{ opacity: after(t, e.ret), fontSize: 19, color: C.muted, fontFamily: FONT.sans }}>
        GPIOs that exist on the ESP32: 0–39, except 24 and 28–31
      </div>
    </div>
  );
};
