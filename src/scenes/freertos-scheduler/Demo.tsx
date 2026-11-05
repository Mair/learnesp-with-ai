/**
 * 7 · DEMO — real time: workers start at 4, both LEDs on their beat; press → the log
 * says 6 and the fast LED stumbles; press again → 4, back on the beat.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { CaptionLine } from '../../components/CodeToHardware';
import { mono } from '../../components/Explainer';
import { Panel } from '../../components/Panel';
import { Kicker, Scene } from '../../components/Type';
import { C, hexA } from '../../theme/palette';
import { TactSwitch } from '../gpio-input/parts';
import { after, GREEN, LedCard, Pill, RED, SerialLog, SimLanes, TaskChip } from './parts';
import { ledAt, simulate } from './sim';
import { BUTTON_PIN, DEMO as D, demoLogMs, demoPrio, FAST, FPS, sceneDur, SLOW } from './timeline';

export const simDemo = () => simulate('demo', { until: 30000, workPrio: demoPrio });

export const Demo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const sim = simDemo();
  const ms = Math.max(0, (t - D.flash) * 1000);
  const on = t >= D.flash;
  const prio = demoPrio(ms);
  const pressed = (t >= D.press1 && t < D.press1 + 0.25) || (t >= D.press2 && t < D.press2 + 0.25);
  return (
    <Scene durationInFrames={Math.round(sceneDur('demo') * FPS)}>
      <AbsoluteFill>
        <div style={{ position: 'absolute', top: 40, width: '100%', display: 'grid', placeItems: 'center' }}>
          <Kicker delay={0.1} accent="amber">
            Demo · the button flips the workers
          </Kicker>
        </div>
        <div style={{ position: 'absolute', left: 160, top: 116, width: 760, height: 370 }}>
          <Panel label="the board" accent={prio === 6 ? RED : C.amber} right="real time">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', placeItems: 'center', height: 220 }}>
              <LedCard pin={FAST.pin} on={on ? ledAt(sim.edges.fast, ms) : 0} sub="blink_fast · 5" />
              <LedCard pin={SLOW.pin} on={on ? ledAt(sim.edges.slow, ms) : 0} sub="blink_slow · 5" />
              <div style={{ display: 'grid', justifyItems: 'center', gap: 6 }}>
                <svg width={140} height={140}>
                  <TactSwitch x={70} y={70} press={pressed ? 1 : 0} size={100} />
                </svg>
                <div style={{ ...mono(20, C.pink, { fontWeight: 700 }), padding: '4px 14px', borderRadius: 999, border: `1px solid ${hexA(C.pink, 0.6)}`, background: hexA(C.pink, 0.1) }}>GPIO {BUTTON_PIN}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center', justifyContent: 'center', marginTop: 6, opacity: after(t, D.four - 0.3) }}>
              <TaskChip name="work_a" prio={prio} w={200} h={64} />
              <TaskChip name="work_b" prio={prio} w={200} h={64} />
              {prio === 6 && t >= D.stumbles && (
                <Pill color={RED} size={20}>
                  stumbles
                </Pill>
              )}
              {prio === 4 && t >= D.beat && (
                <Pill color={GREEN} size={20}>
                  on the beat ✓
                </Pill>
              )}
            </div>
          </Panel>
        </div>
        <div style={{ position: 'absolute', left: 944, top: 116, width: 816, height: 370 }}>
          <SerialLog
            t={t}
            size={21}
            label="idf.py monitor"
            lines={[
              { at: D.flash + 0.1, text: `I (${demoLogMs(D.flash)}) main_task: Calling app_main()` },
              { at: D.flash + 0.3, text: `I (${demoLogMs(D.flash) + 2}) main_task: Returned from app_main()`, color: C.muted },
              { at: D.press1 + 0.05, text: `I (${demoLogMs(D.press1)}) prio: work tasks now at 6`, color: GREEN },
              { at: D.press2 + 0.05, text: `I (${demoLogMs(D.press2)}) prio: work tasks now at 4`, color: GREEN },
            ]}
          />
        </div>
        <div style={{ position: 'absolute', left: 160, top: 504, width: 1600, height: 424, opacity: after(t, D.flash) }}>
          <Panel label="the last 4 seconds" accent={prio === 6 ? RED : GREEN} right="real time · worked out from the rules · LED slivers drawn wider">
            <SimLanes sim={sim} W={1544} s0={ms - 4000} s1={ms} now={ms} show={['fast', 'core0', 'core1']} />
          </Panel>
        </div>
        <div style={{ position: 'absolute', top: 944, width: '100%', display: 'grid', placeItems: 'center' }}>
          <CaptionLine captions={D.captions} t={t} size={32} />
        </div>
      </AbsoluteFill>
    </Scene>
  );
};
