/**
 * 4 · gpio_install_isr_service(0) — one CPU interrupt for every GPIO.
 *   shared   all GPIOs → ETS_GPIO_INTR_SOURCE → the driver's gpio_intr_service → per-pin table
 *   flags    0 → a non-shared level 1–3 interrupt, handled in C; not IRAM → postponed during flash writes
 *   once     a second call → "GPIO isr service already installed" → ESP_ERR_INVALID_STATE
 *
 * FACTS: driver/gpio.h l.296–310; gpio.c l.508–557; esp_intr_alloc.h l.45, l.131–136; intr_alloc.rst l.97–114.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { Explainer, GREEN, mono, RED, VIEW_H as H, VIEW_W as W } from '../../components/Explainer';
import { C, hexA } from '../../theme/palette';
import { after, Verdict } from './parts';
import { FPS, sceneDur, SERVICE as S } from './timeline';

export const Service: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const V = S.views;
  return (
    <Explainer
      t={t}
      frames={Math.round(sceneDur('service') * FPS)}
      kicker="One interrupt for all pins · gpio_install_isr_service()"
      code={S.code}
      run={S.run}
      args={S.args.map((a) => ({ ...a, color: C.amber }))}
      captions={S.captions}
      views={[
        { at: V.shared, component: SharedView, active: [], label: 'how GPIO interrupts reach your function', accent: C.cyan, right: () => 'gpio.c · gpio_intr_service' },
        { at: V.flags, component: FlagsView, active: [0], label: 'intr_alloc_flags · esp_intr_alloc.h', accent: C.amber },
        { at: V.once, component: OnceView, active: [], label: 'install it once', accent: RED, right: () => 'idf.py monitor' },
      ]}
    />
  );
};

export const TABLE_PINS = [4, 5, 18, 19, 21];

/** the per-pin handler table; `fill(pin)` gives [fn, arg] or null */
export const HandlerTable: React.FC<{ fill: (pin: number) => [string, string] | null; hot?: number; x: number; y: number }> = ({ fill, hot = -1, x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <text x={0} y={-12} style={mono(16, C.muted, { letterSpacing: '.1em' })}>
      PER-PIN HANDLERS
    </text>
    {TABLE_PINS.map((p, i) => {
      const f = fill(p);
      const on = p === hot;
      return (
        <g key={p} transform={`translate(0 ${i * 50})`}>
          <rect x={0} y={0} width={470} height={42} rx={8} fill={on ? hexA(C.amber, 0.16) : 'rgba(255,255,255,.03)'} stroke={on ? C.amber : 'rgba(255,255,255,.14)'} strokeWidth={on ? 2 : 1} />
          <text x={14} y={28} style={mono(19, C.pink, { fontWeight: 700 })}>
            [{p}]
          </text>
          <text x={80} y={28} style={mono(19, f ? C.amber : C.muted, { fontWeight: f ? 700 : 400 })}>
            {f ? f[0] : '—'}
          </text>
          <text x={290} y={28} style={mono(19, f ? C.ink : C.muted)}>
            {f ? f[1] : ''}
          </text>
        </g>
      );
    })}
  </g>
);

const SharedView: React.FC<{ t: number }> = ({ t }) => {
  const s = S.shared;
  const share = after(t, s.share);
  const inst = after(t, s.installs);
  const each = after(t, s.each);
  const pins = [0, 2, 4, 5, 18, 19, 21, 27, 33, 39];
  return (
    <svg width={W} height={H} style={{ display: 'block', overflow: 'visible' }}>
      {pins.map((p, i) => (
        <g key={p} opacity={share}>
          <rect x={20} y={20 + i * 47} width={110} height={36} rx={8} fill={hexA(C.pink, 0.16)} stroke={C.pink} />
          <text x={75} y={45 + i * 47} textAnchor="middle" style={mono(18, C.pink, { fontWeight: 700 })}>
            GPIO {p}
          </text>
          <path d={`M 130 ${38 + i * 47} C 220 ${38 + i * 47}, 220 250, 300 250`} fill="none" stroke={hexA(C.pink, 0.5)} strokeWidth={2} />
        </g>
      ))}
      <g opacity={share}>
        <rect x={300} y={200} width={250} height={100} rx={14} fill={hexA(C.cyan, 0.12)} stroke={C.cyan} strokeWidth={2} />
        <text x={425} y={240} textAnchor="middle" style={mono(19, C.cyan, { fontWeight: 700 })}>
          one CPU interrupt
        </text>
        <text x={425} y={268} textAnchor="middle" style={mono(15, C.muted)}>
          ETS_GPIO_INTR_SOURCE
        </text>
      </g>
      <g opacity={inst}>
        <line x1={550} y1={250} x2={610} y2={250} stroke={C.cyan} strokeWidth={3} />
        <rect x={610} y={200} width={300} height={100} rx={14} fill={hexA(C.cyan, 0.2)} stroke={C.cyan} strokeWidth={2.5} />
        <text x={760} y={240} textAnchor="middle" style={mono(19, '#fff', { fontWeight: 700 })}>
          gpio_intr_service()
        </text>
        <text x={760} y={268} textAnchor="middle" style={mono(15, C.muted)}>
          the driver's handler
        </text>
      </g>
      <g opacity={each}>
        <path d="M 910 250 C 960 250, 960 150, 1000 150" fill="none" stroke={C.amber} strokeWidth={2.5} />
        <HandlerTable x={1010} y={110} fill={(p) => (p === 18 ? ['button_isr', '(void *) 18'] : null)} hot={18} />
        <text x={1010} y={400} style={mono(18, C.ink)}>
          → calls the function for each pin that fired
        </text>
      </g>
    </svg>
  );
};

const FlagsView: React.FC<{ t: number }> = ({ t }) => {
  const f = S.flags;
  const row = (k: string, v: string, p: number, col: string) => (
    <div style={{ opacity: p, display: 'grid', gridTemplateColumns: '360px 1fr', padding: '12px 18px', borderRadius: 12, border: `1px solid ${hexA(col, 0.5)}`, background: hexA(col, 0.06), ...mono(23, C.ink) }}>
      <span style={{ color: col, fontWeight: 700 }}>{k}</span>
      <span>{v}</span>
    </div>
  );
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 14, padding: '0 30px' }}>
      {row('flags = 0', 'the defaults', after(t, f.zero), C.amber)}
      {row('priority', 'level 1, 2 or 3 — low / medium', after(t, f.prio), C.cyan)}
      {row('handler', '"These can be handled in C"', after(t, f.c), C.cyan)}
      {row('no ESP_INTR_FLAG_IRAM', 'postponed while the flash is written', after(t, f.flash), C.muted)}
      <div style={{ opacity: after(t, f.flash + 0.4), fontSize: 21, color: C.muted, fontStyle: 'italic' }}>
        "In case of flash operations, these interrupt handlers are postponed" — ESP-IDF interrupt allocation docs
      </div>
    </div>
  );
};

const OnceView: React.FC<{ t: number }> = ({ t }) => {
  const o = S.once;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 18, padding: '0 40px' }}>
      <div style={{ ...mono(28, '#cfd6ff'), lineHeight: 1.6 }}>
        <div>
          gpio_install_isr_service(0); <span style={{ color: GREEN }}>→ ESP_OK</span>
        </div>
        <div style={{ opacity: after(t, o.second) }}>
          gpio_install_isr_service(0); <span style={{ color: RED }}>→ ESP_ERR_INVALID_STATE</span>
        </div>
      </div>
      <div style={{ opacity: after(t, o.ret), borderRadius: 14, border: `1px solid ${hexA(RED, 0.5)}`, padding: '14px 18px', background: 'rgba(10,4,32,.6)', ...mono(21, RED) }}>
        E (…) gpio: gpio_install_isr_service(534): GPIO isr service already installed
      </div>
      <Verdict ok p={after(t, o.ret + 0.5)} size={22}>
        once, at start-up — then add handlers for as many pins as you like
      </Verdict>
    </div>
  );
};
