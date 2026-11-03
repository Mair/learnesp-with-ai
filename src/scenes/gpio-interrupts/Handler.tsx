/**
 * 5 · gpio_isr_handler_add(BUTTON, button_isr, (void *) BUTTON)
 *   table   the pin's row in the driver's handler table fills: fn, then args
 *   arg     args comes back as arg on every call → one function, several buttons
 *   order   it enables the pin's interrupt; before the service → ESP_ERR_INVALID_STATE
 *
 * FACTS: driver/gpio.h l.36–41, l.318–341; gpio.c l.497–498, l.559–572.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { Explainer, GREEN, mono, RED, VIEW_H as H, VIEW_W as W } from '../../components/Explainer';
import { C, FONT, hexA } from '../../theme/palette';
import { after, Verdict } from './parts';
import { HandlerTable } from './Service';
import { FPS, HANDLER as S, sceneDur } from './timeline';

const ARG_COLOR = [C.pink, C.amber, C.cyan];

export const Handler: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const V = S.views;
  return (
    <Explainer
      t={t}
      frames={Math.round(sceneDur('handler') * FPS)}
      kicker="One pin, one function · gpio_isr_handler_add()"
      code={S.code}
      run={S.run}
      args={S.args.map((a, i) => ({ ...a, color: ARG_COLOR[i] }))}
      captions={S.captions}
      views={[
        { at: V.table, component: TableView, active: [0, 1, 2], label: "the driver's handler table", accent: C.amber, right: () => 'gpio_context.gpio_isr_func[ ]' },
        { at: V.arg, component: ArgView, active: [2], label: 'the argument comes back', accent: C.cyan },
        { at: V.order, component: OrderView, active: [0], label: 'it switches the interrupt on · order matters', accent: RED, right: () => 'idf.py monitor' },
      ]}
    />
  );
};

const TableView: React.FC<{ t: number }> = ({ t }) => {
  const fn = t >= S.args[1].at;
  const arg = t >= S.args[2].at;
  return (
    <svg width={W} height={H} style={{ display: 'block' }}>
      <HandlerTable x={500} y={110} hot={18} fill={(p) => (p === 18 && fn ? ['button_isr', arg ? '(void *) 18' : ''] : null)} />
    </svg>
  );
};

const ArgView: React.FC<{ t: number }> = ({ t }) => {
  const a = S.arg;
  const back = after(t, a.back);
  const every = after(t, a.every);
  const pin = after(t, a.pin);
  const several = after(t, a.several);
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center', padding: '0 20px' }}>
      <div style={{ display: 'grid', gap: 16, fontFamily: FONT.mono, fontSize: 23, color: '#cfd6ff' }}>
        <div style={{ opacity: back }}>
          <span style={{ color: C.muted }}>registered:</span> (void *) <b style={{ color: C.cyan }}>BUTTON</b>
        </div>
        <div style={{ opacity: every }}>
          <span style={{ color: C.muted }}>driver calls:</span> fn(<b style={{ color: C.cyan }}>args</b>)
        </div>
        <div style={{ opacity: every, padding: '10px 14px', borderLeft: `4px solid ${C.amber}`, background: hexA(C.amber, 0.08) }}>
          static void button_isr(void *<b style={{ color: C.cyan }}>arg</b>)
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;uint32_t pin = (uint32_t) arg; <span style={{ color: GREEN, opacity: pin }}>// 18</span>
        </div>
      </div>
      <div style={{ opacity: several }}>
        <svg width={600} height={300}>
          <HandlerTable x={40} y={36} fill={(p) => (p === 18 || p === 19 || p === 21 ? ['button_isr', `(void *) ${p}`] : null)} />
        </svg>
        <div style={{ fontSize: 22, color: C.ink, marginTop: 4, paddingLeft: 40 }}>one function · the argument says which button</div>
      </div>
    </div>
  );
};

const OrderView: React.FC<{ t: number }> = ({ t }) => {
  const o = S.order;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center', padding: '0 20px' }}>
      <div style={{ display: 'grid', gap: 12, opacity: after(t, o.on) }}>
        <div style={mono(20, C.muted, { letterSpacing: '.1em' })}>GPIO_PIN18_REG · INT_ENA</div>
        <div style={{ ...mono(30, C.ink) }}>
          int_ena = <b style={{ color: GREEN }}>PRO CPU</b> <span style={{ color: C.muted, fontSize: 22 }}>(CPU 0, where app_main runs)</span>
        </div>
        <Verdict ok p={after(t, o.on + 0.3)} size={22}>
          the pin's interrupt is now live
        </Verdict>
      </div>
      <div style={{ display: 'grid', gap: 14, opacity: after(t, o.before) }}>
        <div style={{ ...mono(20, '#cfd6ff'), lineHeight: 1.6 }}>
          <div style={{ color: RED }}>gpio_isr_handler_add(BUTTON, …);</div>
          <div style={{ color: C.muted }}>gpio_install_isr_service(0);</div>
        </div>
        <div style={{ opacity: after(t, o.ret), borderRadius: 12, border: `1px solid ${hexA(RED, 0.5)}`, padding: '12px 16px', background: 'rgba(10,4,32,.6)', ...mono(18, RED), lineHeight: 1.4 }}>
          E (…) gpio: gpio_isr_handler_add(561): GPIO isr service is not installed, call gpio_install_isr_service() first
        </div>
        <div style={{ opacity: after(t, o.ret), ...mono(24, C.ink) }}>
          → <b style={{ color: RED }}>ESP_ERR_INVALID_STATE</b>
        </div>
      </div>
    </div>
  );
};
