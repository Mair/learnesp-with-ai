/**
 * 6 · THE ISR — button_isr runs inside the interrupt.
 *   context  not a task: the CPU leaves whatever was running, runs this, goes back
 *   rules    no blocking (vTaskDelay, xQueueReceive), no ESP_LOGx
 *   stack    its own ISR stack: CONFIG_FREERTOS_ISR_STACKSIZE = 1536 bytes
 *   fromisr  xQueueSendFromISR copies the pin number into the queue
 *   yield    woken + portYIELD_FROM_ISR → switch as the ISR ends; NULL → next tick
 *   iram     IRAM_ATTR not needed with flags 0
 *
 * FACTS: queue.h l.752–753, l.1070–1133; log.rst l.149; freertos/Kconfig l.441–446;
 * portmacro.h l.473–492; tasks.c l.3935–3943; driver/gpio.h l.323–331.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { GREEN, mono, RED } from '../../components/Explainer';
import { C, hexA } from '../../theme/palette';
import { after, CodeAndViews, Lanes, Pill, Verdict, VIEW2_W as W } from './parts';
import { FPS, ISR as S, ISR_CODE, ISR_STACK, sceneDur, TICK_MS } from './timeline';

export const Isr: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const V = S.views;
  return (
    <CodeAndViews
      t={t}
      frames={Math.round(sceneDur('isr') * FPS)}
      kicker="The function itself · an ISR"
      accent="amber"
      file="main/main.c"
      code={ISR_CODE}
      codeSize={22}
      captions={S.captions}
      views={[
        { at: V.context, component: ContextView, label: 'interrupt context', accent: C.amber, lines: S.lines.context, right: () => 'not to scale' },
        { at: V.rules, component: RulesView, label: 'what an ISR must not do', accent: RED },
        { at: V.stack, component: StackView, label: 'its own stack', accent: C.cyan, right: () => 'menuconfig · ISR stack size' },
        { at: V.fromisr, component: FromIsrView, label: 'pass the news on · …FromISR', accent: GREEN, lines: S.lines.fromisr, right: () => 'freertos/queue.h' },
        { at: V.yield, component: YieldView, label: 'woken · portYIELD_FROM_ISR', accent: C.amber, lines: S.lines.yield, right: () => 'not to scale' },
        { at: V.iram, component: IramView, label: 'IRAM_ATTR?', accent: C.muted, lines: S.lines.iram, right: () => 'driver/gpio.h' },
      ]}
    />
  );
};

const ContextView: React.FC<{ t: number }> = ({ t }) => {
  const c = S.context;
  const isrA = c.inside;
  const isrB = c.notTask + 0.8;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 20 }}>
      <Lanes
        W={W}
        s0={0.6}
        s1={7.2}
        now={t}
        lanes={[
          { name: 'CPU 0', color: C.cyan, spans: [{ a: 0.6, b: isrA, color: C.cyan, label: 'a task' }, { a: isrA, b: isrB, color: C.amber, label: 'button_isr' }, { a: isrB, b: 7.2, color: C.cyan, label: 'the same task, resumed' }] },
        ]}
        marks={[{ s: isrA, label: 'interrupt', color: C.amber, lane: 0 }]}
      />
      <div style={{ opacity: after(t, c.notTask), fontSize: 26, color: C.ink }}>
        not a task: it can't block — it borrows the CPU from whatever was running
      </div>
      <div style={{ opacity: after(t, c.rules) }}>
        <Pill color={C.amber} size={22}>
          so the rules change
        </Pill>
      </div>
    </div>
  );
};

const RulesView: React.FC<{ t: number }> = ({ t }) => {
  const r = S.rules;
  const no = (code: string, why: string, p: number) => (
    <div style={{ opacity: p, display: 'grid', gridTemplateColumns: '44px 380px 1fr', alignItems: 'center', padding: '12px 16px', borderRadius: 12, border: `1px solid ${hexA(RED, 0.55)}`, background: hexA(RED, 0.06) }}>
      <span style={{ color: RED, fontWeight: 800, fontSize: 30 }}>✗</span>
      <span style={mono(24, '#fff')}>{code}</span>
      <span style={{ fontSize: 21, color: C.muted }}>{why}</span>
    </div>
  );
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 16, padding: '0 10px' }}>
      <div style={{ opacity: after(t, r.wait), fontSize: 30, fontWeight: 700, color: C.ink }}>it can't wait — nothing that blocks</div>
      {no('vTaskDelay(…)', 'blocks the caller', after(t, r.delay))}
      {no('xQueueReceive(…)', '"must not be used in an interrupt service routine"', after(t, r.receive))}
      {no('ESP_LOGI(…)', 'ESP_LOGx: "avoiding use in ISRs"', after(t, r.log))}
    </div>
  );
};

const StackView: React.FC<{ t: number }> = ({ t }) => {
  const s = S.stack;
  const fill = after(t, s.bytes, 1.0);
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 22, padding: '0 20px' }}>
      <div style={{ opacity: after(t, s.own), fontSize: 26, color: C.ink }}>ISRs run on a separate, small stack</div>
      <div style={{ opacity: after(t, s.bytes) }}>
        <div style={{ height: 60, borderRadius: 12, border: `2px solid ${C.cyan}`, overflow: 'hidden', background: 'rgba(255,255,255,.03)' }}>
          <div style={{ height: '100%', width: `${fill * 100}%`, background: `linear-gradient(90deg, ${hexA(C.cyan, 0.5)}, ${hexA(C.cyan, 0.2)})` }} />
        </div>
        <div style={{ ...mono(34, C.cyan, { fontWeight: 800 }), marginTop: 12 }}>{ISR_STACK} bytes</div>
        <div style={mono(20, C.muted)}>CONFIG_FREERTOS_ISR_STACKSIZE · default</div>
      </div>
      <div style={{ opacity: after(t, s.short) }}>
        <Verdict ok p={after(t, s.minimum)} size={24}>
          do the minimum: note it, hand it on, return
        </Verdict>
      </div>
    </div>
  );
};

const FromIsrView: React.FC<{ t: number }> = ({ t }) => {
  const f = S.fromisr;
  const fly = after(t, f.copies, 0.8);
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 26, padding: '0 20px' }}>
      <div style={{ opacity: after(t, f.ends), display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {['xQueueSendFromISR', 'xSemaphoreGiveFromISR', 'xTaskNotifyFromISR'].map((k, i) => (
          <span key={k} style={{ opacity: i === 0 ? 1 : 0.55 }}>
            <Pill color={GREEN} size={20}>
              {k}
            </Pill>
          </span>
        ))}
      </div>
      <svg width={W} height={200} style={{ opacity: after(t, f.send), overflow: 'visible' }}>
        <rect x={20} y={60} width={200} height={80} rx={12} fill={hexA(C.amber, 0.15)} stroke={C.amber} strokeWidth={2} />
        <text x={120} y={108} textAnchor="middle" style={mono(22, C.amber, { fontWeight: 700 })}>
          button_isr
        </text>
        {Array.from({ length: 10 }, (_, i) => (
          <rect key={i} x={420 + i * 46} y={74} width={40} height={52} rx={6} fill={i === 0 && fly > 0.95 ? hexA(GREEN, 0.3) : 'rgba(255,255,255,.04)'} stroke={i === 0 && fly > 0.95 ? GREEN : 'rgba(255,255,255,.2)'} />
        ))}
        <text x={420} y={160} style={mono(17, C.muted)}>
          button_events · 10 slots
        </text>
        <g transform={`translate(${220 + fly * 222} ${100})`} opacity={fly > 0 ? 1 : 0}>
          <text x={0} y={8} textAnchor="middle" style={mono(26, GREEN, { fontWeight: 800 })}>
            18
          </text>
        </g>
      </svg>
      <div style={{ opacity: after(t, f.copies + 0.6), fontSize: 22, color: C.muted }}>items are copied in — the queue keeps its own 4-byte copy of pin</div>
    </div>
  );
};

const YieldView: React.FC<{ t: number }> = ({ t }) => {
  const y = S.yield;
  // two rows, same ISR at x = 1.0..1.6; ticks at 0, 4, 8 (illustrative)
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 10 }}>
      <div style={{ opacity: after(t, y.woken), ...mono(22, C.ink) }}>
        woken = <b style={{ color: GREEN }}>pdTRUE</b> <span style={{ color: C.muted }}>— a higher-priority task was waiting for this</span>
      </div>
      <div style={{ opacity: after(t, y.port) }}>
        <div style={mono(18, GREEN, { fontWeight: 700 })}>with portYIELD_FROM_ISR(woken)</div>
        <Lanes
          W={W}
          s0={0}
          s1={11}
          now={11}
          lanes={[
            {
              name: 'CPU 0',
              color: C.cyan,
              spans: [
                { a: 0, b: 2, color: C.muted, label: 'idle', dashed: true },
                { a: 2, b: 3, color: C.amber, label: 'ISR' },
                { a: 3, b: 5, color: GREEN, label: 'your task' },
                { a: 5, b: 11, color: C.muted, label: 'idle', dashed: true },
              ],
            },
          ]}
          axis={[
            { s: 0, label: 'tick' },
            { s: 10, label: `tick (+${TICK_MS} ms)` },
          ]}
        />
      </div>
      <div style={{ opacity: after(t, y.leave) }}>
        <div style={mono(18, RED, { fontWeight: 700 })}>without it (NULL)</div>
        <Lanes
          W={W}
          s0={0}
          s1={11}
          now={11}
          lanes={[
            {
              name: 'CPU 0',
              color: C.cyan,
              spans: [
                { a: 0, b: 2, color: C.muted, label: 'idle', dashed: true },
                { a: 2, b: 3, color: C.amber, label: 'ISR' },
                { a: 3, b: 10, color: C.muted, label: 'idle — a yield is pending', dashed: true },
                { a: 10, b: 11, color: GREEN, label: 'task' },
              ],
            },
          ]}
          axis={[
            { s: 0, label: 'tick' },
            { s: 10, label: `next tick (+${TICK_MS} ms)` },
          ]}
        />
      </div>
    </div>
  );
};

const IramView: React.FC<{ t: number }> = ({ t }) => {
  const r = S.iram;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 20, padding: '0 20px' }}>
      <div style={{ opacity: after(t, r.marks), ...mono(23, '#cfd6ff'), padding: '10px 14px', borderLeft: `4px solid ${C.muted}` }}>
        static void <b style={{ color: C.amber }}>IRAM_ATTR</b> gpio_isr_handler(void* arg)
        <div style={mono(16, C.muted)}>examples/peripherals/gpio/generic_gpio</div>
      </div>
      <div style={{ opacity: after(t, r.attr), fontSize: 23, color: C.ink }}>IRAM_ATTR = put this function in internal RAM, not flash</div>
      <div style={{ opacity: after(t, r.zero), fontSize: 22, color: C.muted, fontStyle: 'italic', lineHeight: 1.45 }}>
        "The pin ISR handlers no longer need to be declared with IRAM_ATTR, unless you pass the ESP_INTR_FLAG_IRAM flag when allocating the ISR in gpio_install_isr_service()."
        <br />— driver/gpio.h
      </div>
      <Verdict ok p={after(t, r.need)} size={22}>
        flags 0 → a plain function is fine
      </Verdict>
    </div>
  );
};
