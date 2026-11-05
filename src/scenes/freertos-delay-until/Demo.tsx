/**
 * 7 · DEMO — real time, 10 seconds: LED B on the beat, LED A drifting; first 10 s:
 * B 50 switches, A 44. Same work, same 200 — only the delay call differs.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { CaptionLine } from '../../components/CodeToHardware';
import { mono } from '../../components/Explainer';
import { Panel } from '../../components/Panel';
import { Kicker, Scene } from '../../components/Type';
import { C, hexA } from '../../theme/palette';
import { after, COL_A, COL_B, GREEN, LedCard, RED, Timeline } from './parts';
import { BEAT, DEMO as D, delayEdges, FPS, LED_A, LED_B, levelAt, sceneDur, switchesBefore, untilEdges } from './timeline';

const Counter: React.FC<{ label: string; n: number; color: string; ok: boolean; frozen: boolean; code: string; codeP: number }> = ({ label, n, color, ok, frozen, code, codeP }) => (
  <div style={{ display: 'grid', gap: 6, padding: '18px 24px', borderRadius: 16, border: `1.5px solid ${hexA(frozen ? (ok ? GREEN : RED) : color, 0.6)}`, background: hexA(frozen ? (ok ? GREEN : RED) : color, 0.06) }}>
    <div style={mono(22, color, { fontWeight: 700 })}>{label}</div>
    <div style={{ ...mono(84, frozen ? (ok ? GREEN : RED) : C.ink, { fontWeight: 800 }), fontVariantNumeric: 'tabular-nums' }}>
      {String(n).padStart(2, '\u2007')}
      <span style={mono(26, C.muted)}> switches {frozen ? (ok ? '✓' : '✗') : ''}</span>
    </div>
    <div style={{ ...mono(18, C.ink), opacity: codeP }}>{code}</div>
  </div>
);

export const Demo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const ms = Math.max(0, (t - D.flash) * 1000);
  const A = delayEdges(30000);
  const B = untilEdges(30000);
  const upto = Math.min(ms, 10000);
  const frozen = ms >= 10000;
  const win = Math.max(3000, ms);
  return (
    <Scene durationInFrames={Math.round(sceneDur('demo') * FPS)}>
      <AbsoluteFill>
        <div style={{ position: 'absolute', top: 40, width: '100%', display: 'grid', placeItems: 'center' }}>
          <Kicker delay={0.1} accent="amber">
            Demo · 10 seconds
          </Kicker>
        </div>
        <div style={{ position: 'absolute', left: 160, top: 116, width: 600, height: 400 }}>
          <Panel label="the board" accent={C.amber} right="real time">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', placeItems: 'center', height: 300 }}>
              <LedCard pin={LED_A.pin} on={t >= D.flash ? levelAt(A, ms) : 0} label="LED A" sub="vTaskDelay" />
              <LedCard pin={LED_B.pin} on={t >= D.flash ? levelAt(B, ms) : 0} label="LED B" sub="xTaskDelayUntil" />
            </div>
          </Panel>
        </div>
        <div style={{ position: 'absolute', left: 784, top: 116, width: 976, height: 400 }}>
          <Panel label={frozen ? 'the first 10 seconds' : `switches so far · ${(upto / 1000).toFixed(1)} s`} accent={frozen ? GREEN : C.cyan} right="counting the switch at 0">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 10 }}>
              <Counter label="LED B" n={switchesBefore(B, upto + (frozen ? 0 : 0.5))} color={COL_B} ok frozen={frozen} code="xTaskDelayUntil(&last, …200…)" codeP={after(t, D.call)} />
              <Counter label="LED A" n={switchesBefore(A, upto + (frozen ? 0 : 0.5))} color={COL_A} ok={false} frozen={frozen} code="vTaskDelay(…200…)" codeP={after(t, D.call)} />
            </div>
          </Panel>
        </div>
        <div style={{ position: 'absolute', left: 160, top: 540, width: 1600, height: 370, opacity: after(t, D.flash) }}>
          <Panel label="the last 3 seconds · the beat = dashed lines" accent={C.cyan} right="real time · worked out from the code">
            <Timeline
              W={1544}
              s0={win - 3000}
              s1={win}
              now={ms}
              beat={BEAT}
              unit="s"
              rows={[
                { name: 'LED A', color: COL_A, edges: A },
                { name: 'LED B', color: COL_B, edges: B },
              ]}
            />
          </Panel>
        </div>
        <div style={{ position: 'absolute', top: 944, width: '100%', display: 'grid', placeItems: 'center' }}>
          <CaptionLine captions={D.captions} t={t} size={32} />
        </div>
      </AbsoluteFill>
    </Scene>
  );
};
