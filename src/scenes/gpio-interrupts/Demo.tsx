/**
 * 8 · DEMO — one press, end to end (narration-paced, not to scale).
 *   pin falls → GPIO_STATUS bit 18 → CPU takes the GPIO interrupt → gpio_intr_service
 *   → button_isr → 18 into the queue → return → the task wakes → ESP_LOGI
 * Then: polling's wake-ups (100/s, real time) vs one per press.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { CaptionLine } from '../../components/CodeToHardware';
import { GREEN, mono } from '../../components/Explainer';
import { Panel } from '../../components/Panel';
import { Kicker, Scene } from '../../components/Type';
import { C, hexA } from '../../theme/palette';
import { after, SerialLog, TactSwitch } from './parts';
import { DEMO as D, FPS, sceneDur } from './timeline';

const NODES = [
  { at: D.press, k: 'GPIO 18 falls', sub: 'the button goes down', c: C.magenta },
  { at: D.status, k: 'the GPIO hardware notices', sub: 'it remembers the edge', c: C.magenta },
  { at: D.jumps, k: 'CPU 0 takes the GPIO interrupt', sub: 'whatever was running pauses', c: C.cyan },
  { at: D.handler, k: "the driver's handler", sub: 'it finds the function for pin 18', c: C.cyan },
  { at: D.isr, k: 'button_isr((void *) 18)', sub: 'your function', c: C.amber },
  { at: D.drops, k: 'queue ← 18', sub: 'xQueueSendFromISR · then return', c: GREEN },
  { at: D.wakes, k: 'task wakes · xQueueReceive returns', sub: 'pin = 18', c: C.cyan },
  { at: D.logs, k: 'ESP_LOGI(…)', sub: 'I (…) button: presses: 1', c: GREEN },
];

export const Demo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const down = t >= D.press - 0.3 && t < D.release;
  const cur = NODES.reduce((a, n, i) => (t >= n.at ? i : a), -1);
  const polls = Math.max(0, Math.floor((t - D.polling) * 100));
  return (
    <Scene durationInFrames={Math.round(sceneDur('demo') * FPS)}>
      <AbsoluteFill>
        <div style={{ position: 'absolute', top: 40, width: '100%', display: 'grid', placeItems: 'center' }}>
          <Kicker delay={0.1} accent="amber">
            One press, end to end
          </Kicker>
        </div>
        <div style={{ position: 'absolute', left: 160, top: 110, width: 1600, display: 'grid', gridTemplateColumns: '960px 1fr', gridTemplateRows: '600px 190px', gap: 22 }}>
          <Panel label="what happens" accent={C.amber} right="not to scale">
            <div style={{ display: 'grid', gap: 9 }}>
              {NODES.map((n, i) => {
                const p = after(t, n.at, 0.35);
                const live = i === cur;
                return (
                  <div
                    key={i}
                    style={{
                      opacity: 0.18 + 0.82 * p,
                      display: 'grid',
                      gridTemplateColumns: '36px 470px 1fr',
                      alignItems: 'center',
                      padding: '9px 14px',
                      borderRadius: 10,
                      border: `${live ? 2 : 1}px solid ${p > 0.5 ? hexA(n.c, live ? 0.9 : 0.45) : 'rgba(255,255,255,.08)'}`,
                      background: live ? hexA(n.c, 0.14) : 'transparent',
                      boxShadow: live ? `0 0 22px ${hexA(n.c, 0.35)}` : undefined,
                    }}
                  >
                    <span style={mono(18, n.c)}>{i + 1}</span>
                    <span style={mono(21, '#fff', { fontWeight: 700 })}>{n.k}</span>
                    <span style={{ fontSize: 19, color: C.muted }}>{n.sub}</span>
                  </div>
                );
              })}
            </div>
          </Panel>
          <div style={{ display: 'grid', gridTemplateRows: '300px 1fr', gap: 22 }}>
            <Panel label="breadboard · GPIO 18" accent={C.pink}>
              <div style={{ display: 'grid', justifyItems: 'center', gap: 6 }}>
                <svg width={200} height={170}>
                  <TactSwitch x={100} y={85} press={down ? 1 : 0} size={120} />
                </svg>
                <div style={mono(22, down ? C.cyan : C.muted, { fontWeight: 700 })}>{down ? 'pressed → 0' : 'released → 1'}</div>
              </div>
            </Panel>
            <SerialLog t={t} lines={[{ at: D.logs, text: 'I (…) button: presses: 1', color: GREEN }]} size={22} label="illustration · QEMU has no button" />
          </div>
          <div style={{ gridColumn: '1 / -1', opacity: after(t, D.polling - 0.2) }}>
            <Panel label="wake-ups while nobody presses" accent={C.cyan} right="real time">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
                <div style={mono(30, C.ink)}>
                  polling: <b style={{ color: C.cyan, fontVariantNumeric: 'tabular-nums' }}>{String(polls).padStart(4, '\u2007')}</b> <span style={{ color: C.muted, fontSize: 22 }}>· 100 a second</span>
                </div>
                <div style={{ opacity: after(t, D.once), ...mono(30, C.ink) }}>
                  interrupt: <b style={{ color: GREEN }}>1</b> <span style={{ color: C.muted, fontSize: 22 }}>· one per press</span>
                </div>
              </div>
            </Panel>
          </div>
        </div>
        <div style={{ position: 'absolute', top: 944, width: '100%', display: 'grid', placeItems: 'center' }}>
          <CaptionLine captions={D.captions} t={t} size={32} />
        </div>
      </AbsoluteFill>
    </Scene>
  );
};
