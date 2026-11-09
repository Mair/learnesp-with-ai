/**
 * 6 · DEMO — app_main creates two tasks and returns ("Returned from
 * app_main()", the main task is deleted); both LEDs keep going at 200 / 500 ms
 * in real time; same function, two stacks → two b's (b = the pointer
 * blink_task takes from arg: one → &fast, the other → &slow).
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { CaptionLine } from '../../components/CodeToHardware';
import { mono, RED } from '../../components/Explainer';
import { Panel } from '../../components/Panel';
import { Kicker, Scene } from '../../components/Type';
import { C, hexA } from '../../theme/palette';
import { after, Code, GREEN, LedCard, SerialLog, StackBox } from './parts';
import { DEMO as D, FAST, FPS, LOG_BOOT, sceneDur, SLOW, wanted } from './timeline';

export const Demo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const fastNow = (t - D.blink) * 1000;
  const slowNow = (t - D.blink - 0.05) * 1000;
  const stacks = after(t, D.same - 0.3);
  const tasks = [
    { k: 'main', s: t >= D.deleted ? 'deleted' : 'running app_main', c: t >= D.deleted ? RED : C.ink, at: D.flash },
    { k: 'blink_fast', s: 'mostly blocked in vTaskDelay', c: C.amber, at: D.creates },
    { k: 'blink_slow', s: 'mostly blocked in vTaskDelay', c: C.amber, at: D.creates + 0.4 },
    { k: 'IDLE0 · IDLE1', s: 'whenever nothing else is ready', c: C.muted, at: D.flash },
  ];
  return (
    <Scene durationInFrames={Math.round(sceneDur('demo') * FPS)}>
      <AbsoluteFill>
        <div style={{ position: 'absolute', top: 40, width: '100%', display: 'grid', placeItems: 'center' }}>
          <Kicker delay={0.1} accent="amber">
            Two tasks, running
          </Kicker>
        </div>
        <div style={{ position: 'absolute', left: 160, top: 116, width: 1600, display: 'grid', gridTemplateColumns: '1000px 1fr', gridTemplateRows: '330px 440px', gap: 22 }}>
          <div>
            <SerialLog
              t={t}
              size={22}
              label="recorded in QEMU (ESP32 emulator)"
              lines={[
                { at: D.flash + 0.2, text: LOG_BOOT[0] },
                { at: D.flash + 0.6, text: LOG_BOOT[1] },
                { at: D.returns, text: LOG_BOOT[2], color: GREEN },
              ]}
            />
          </div>
          <div style={{ opacity: after(t, D.creates - 0.3) }}>
            <Panel label="breadboard" accent={C.pink} right="real time">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', placeItems: 'center', height: 250 }}>
                <LedCard pin={FAST.pin} on={t >= D.blink ? wanted(FAST.ms, fastNow) : 0} size={110} sub="200 ms" />
                <LedCard pin={SLOW.pin} on={t >= D.blink ? wanted(SLOW.ms, slowNow) : 0} size={110} sub="500 ms" />
              </div>
            </Panel>
          </div>
          <div style={{ gridColumn: '1 / -1', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 1 - stacks }}>
              <Panel label="the tasks" accent={C.cyan}>
                <div style={{ display: 'grid', gap: 14 }}>
                  {tasks.map((x, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '320px 1fr', alignItems: 'center', opacity: after(t, x.at) }}>
                      <div style={mono(26, x.c, { fontWeight: 700, textDecoration: x.s === 'deleted' ? 'line-through' : undefined })}>{x.k}</div>
                      <div style={mono(22, x.s === 'deleted' ? RED : C.muted)}>{x.s}</div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
            <div style={{ position: 'absolute', inset: 0, opacity: stacks }}>
              <Panel label="same function · two stacks" accent={C.amber}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px 1fr', alignItems: 'center', justifyItems: 'center' }}>
                  <StackBox
                    title="blink_fast's stack"
                    size="2048 B"
                    w={420}
                    h={220}
                    fill={0.6}
                    rows={[
                      { text: after(t, D.fastB) > 0.5 ? 'b → &fast' : 'b', sub: after(t, D.fastB) > 0.5 ? '{ GPIO_NUM_2, 200 }' : 'its own copy', color: C.amber, p: after(t, D.b) },
                      { text: 'saved registers', color: C.magenta, p: after(t, D.stack) },
                    ]}
                  />
                  <div style={{ display: 'grid', justifyItems: 'center', gap: 10, opacity: after(t, D.same) }}>
                    <div style={mono(20, C.muted)}>one copy of the code</div>
                    <div style={{ ...mono(24, '#fff', { fontWeight: 700 }), padding: '12px 18px', borderRadius: 12, border: `1px solid ${hexA(C.cyan, 0.7)}`, background: hexA(C.cyan, 0.1) }}>blink_task()</div>
                    {/* what b is: the first line of the function */}
                    <div style={{ opacity: after(t, D.pointer), borderLeft: `3px solid ${C.amber}`, paddingLeft: 10 }}>
                      <Code size={19} lines={[<span key="b">const blink_t *<b style={{ color: C.amber }}>b</b> = <span style={{ color: after(t, D.arg) > 0.5 ? C.amber : undefined }}>arg</span>;</span>]} />
                    </div>
                    <div style={{ ...mono(18, C.muted), opacity: after(t, D.pointer) }}>a local → one per stack</div>
                  </div>
                  <StackBox
                    title="blink_slow's stack"
                    size="2048 B"
                    w={420}
                    h={220}
                    fill={0.6}
                    rows={[
                      { text: after(t, D.slowB) > 0.5 ? 'b → &slow' : 'b', sub: after(t, D.slowB) > 0.5 ? '{ GPIO_NUM_19, 500 }' : 'its own copy', color: C.amber, p: after(t, D.b + 0.3) },
                      { text: 'saved registers', color: C.magenta, p: after(t, D.stack + 0.2) },
                    ]}
                  />
                </div>
              </Panel>
            </div>
          </div>
        </div>
        <div style={{ position: 'absolute', top: 944, width: '100%', display: 'grid', placeItems: 'center' }}>
          <CaptionLine captions={D.captions} t={t} size={32} />
        </div>
      </AbsoluteFill>
    </Scene>
  );
};
