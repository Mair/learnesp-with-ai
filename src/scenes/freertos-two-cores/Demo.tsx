/**
 * 6 · DEMO — real time, the workers pinned to core 1 at priority 6: core 0 only ever runs
 * the LED slivers, both LEDs on their beat; the log says core 1 every time.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { CaptionLine } from '../../components/CodeToHardware';
import { Panel } from '../../components/Panel';
import { Kicker, Scene } from '../../components/Type';
import { C } from '../../theme/palette';
import { after, Chip, CoreLanes, GREEN, LedCard, Pill, SerialLog } from './parts';
import { ledAt } from './sim';
import { DEMO as D, FAST, FPS, sceneDur, SLOW } from './timeline';
import { simPinned } from './Which';

export const Demo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const sim = simPinned();
  const ms = Math.max(0, (t - D.flash) * 1000);
  const on = t >= D.flash;
  const logs = sim.starts.filter((s) => s.t < 30000).map((s) => ({ at: D.flash + s.t / 1000 + 0.02, text: `I (${s.t + 331}) cores: ${s.task} on core ${s.core}`, color: s.task === 'work_a' ? '#e0c8ff' : '#b9c6ff' }));
  const shown = logs.filter((l) => l.at <= t).slice(-7);
  return (
    <Scene durationInFrames={Math.round(sceneDur('demo') * FPS)}>
      <AbsoluteFill>
        <div style={{ position: 'absolute', top: 40, width: '100%', display: 'grid', placeItems: 'center' }}>
          <Kicker delay={0.1} accent="amber">
            Demo · workers pinned to core 1
          </Kicker>
        </div>
        <div style={{ position: 'absolute', left: 160, top: 116, width: 760, height: 370 }}>
          <Panel label="the board" accent={t >= D.beat ? GREEN : C.amber} right="real time">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', placeItems: 'center', height: 170 }}>
              <LedCard pin={FAST.pin} on={on ? ledAt(sim.edges.fast, ms) : 0} sub="blink_fast · 5" />
              <LedCard pin={SLOW.pin} on={on ? ledAt(sim.edges.slow, ms) : 0} sub="blink_slow · 5" />
            </div>
            <div style={{ display: 'flex', gap: 34, alignItems: 'center', justifyContent: 'center', marginTop: 64, opacity: after(t, D.core1 - 0.3) }}>
              <Chip name="work_a" prio={6} w={220} h={64} pin={1} />
              <Chip name="work_b" prio={6} w={220} h={64} pin={1} />
              {t >= D.beat && (
                <div style={{ opacity: after(t, D.beat) }}>
                  <Pill color={GREEN} size={20}>
                    on the beat ✓
                  </Pill>
                </div>
              )}
            </div>
          </Panel>
        </div>
        <div style={{ position: 'absolute', left: 944, top: 116, width: 816, height: 370 }}>
          <SerialLog t={t} size={21} label="idf.py monitor" lines={shown} />
        </div>
        <div style={{ position: 'absolute', left: 160, top: 504, width: 1600, height: 424, opacity: after(t, D.flash) }}>
          <Panel label="the last 4 seconds" accent={t >= D.free ? GREEN : C.amber} right="real time · worked out from the rules · LED slivers drawn wider">
            <CoreLanes sim={sim} W={1544} s0={ms - 4000} s1={ms} now={ms} show={['core0', 'core1', 'fast', 'slow']} labels={false} />
          </Panel>
        </div>
        <div style={{ position: 'absolute', top: 944, width: '100%', display: 'grid', placeItems: 'center' }}>
          <CaptionLine captions={D.captions} t={t} size={32} />
        </div>
      </AbsoluteFill>
    </Scene>
  );
};
