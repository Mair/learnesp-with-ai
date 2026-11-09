/**
 * 1 · PROBLEM — one LED every 200 ms plus 30 ms of work per loop; two tasks, the same
 * except for the wait; started together, LED A (vTaskDelay) drifts, LED B keeps the beat.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { CaptionLine } from '../../components/CodeToHardware';
import { CodeLine } from '../../components/CodeLine';
import { Panel } from '../../components/Panel';
import { Kicker, Scene } from '../../components/Type';
import { C, FONT } from '../../theme/palette';
import { after, COL_A, COL_B, LedCard, Pill, RED, Timeline, WORK } from './parts';
import { BEAT, delayEdges, DELAY_CODE, FPS, LED_A, LED_B, levelAt, PROBLEM as P, sceneDur, untilEdges, UNTIL_CODE, WORK_CODE } from './timeline';

const CodeBlock: React.FC<{ lines: string[]; t: number; lit?: (i: number) => number | null; size?: number }> = ({ lines, t, lit = () => null, size = 17 }) => (
  <pre style={{ margin: 0, fontFamily: FONT.mono, fontSize: size, lineHeight: 1.5, color: '#cfd6ff' }}>
    {lines.map((l, i) => {
      const at = lit(i);
      return (
        <div key={i} style={{ minHeight: '1.5em' }}>
          <CodeLine text={l} t={t} litAt={at} live={at !== null && t >= at} />
        </div>
      );
    })}
  </pre>
);

export const Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const two = t >= P.two - 0.3;
  const ms = Math.max(0, (t - P.start) * 1000);
  const running = t >= P.start;
  const wantMs = Math.max(0, (t - P.led) * 1000);
  const A = delayEdges(20000);
  const B = untilEdges(20000);
  const lastLine = (lines: string[]) => lines.findIndex((l) => l.includes('Delay'));
  return (
    <Scene durationInFrames={Math.round(sceneDur('problem') * FPS)}>
      <AbsoluteFill>
        <div style={{ position: 'absolute', top: 40, width: '100%', display: 'grid', placeItems: 'center' }}>
          <Kicker delay={0.1} accent="amber">
            Let's say you want…
          </Kicker>
        </div>
        {/* the LEDs */}
        <div style={{ position: 'absolute', left: 160, top: 116, width: 520, height: 420, opacity: after(t, P.led - 0.6) }}>
          <Panel label="the board" accent={C.amber} right="real time">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', placeItems: 'center', height: 260 }}>
              <LedCard pin={LED_A.pin} on={running ? levelAt(A, ms) : t >= P.led ? levelAt(B, wantMs) : 0} label={two ? 'LED A · vTaskDelay' : 'the LED'} />
              <div style={{ opacity: after(t, P.start - 0.4) }}>
                <LedCard pin={LED_B.pin} on={running ? levelAt(B, ms) : 0} label="LED B · DelayUntil" />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', minHeight: 60 }}>
              {t >= P.opposite && (
                <div style={{ opacity: after(t, P.opposite) }}>
                  <Pill color={RED} size={22}>
                    1.5 s in: opposite
                  </Pill>
                </div>
              )}
            </div>
          </Panel>
        </div>
        {/* the code */}
        <div style={{ position: 'absolute', left: 704, top: 116, width: 1056, height: 420, opacity: after(t, P.work - 0.4) }}>
          <Panel label={two ? 'main/main.c · two tasks' : 'main/main.c · the work'} accent={C.cyan} right="ESP-IDF">
            {!two ? (
              <CodeBlock lines={WORK_CODE} t={t} size={20} lit={(i) => (i >= 2 && i <= 4 ? P.ms30 : null)} />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                <CodeBlock lines={DELAY_CODE} t={t} lit={(i) => (i === lastLine(DELAY_CODE) ? P.wait : null)} />
                <CodeBlock lines={UNTIL_CODE} t={t} lit={(i) => (i === lastLine(UNTIL_CODE) ? P.wait : null)} />
              </div>
            )}
          </Panel>
        </div>
        {/* over time */}
        <div style={{ position: 'absolute', left: 160, top: 560, width: 1600, height: 350, opacity: after(t, P.every - 0.3) }}>
          <Panel label={running ? 'the first 3 seconds · the beat = dashed lines' : 'the beat you want'} accent={C.cyan} right={running ? 'ms · real time · worked out from the code' : 'ms · every 200'}>
            {!running ? (
              <Timeline
                W={1544}
                s0={0}
                s1={2000}
                now={t >= P.every ? 400 + (t - P.every) * 900 : 0}
                beat={BEAT}
                rows={[
                  { name: 'want', color: C.ink, edges: B },
                  { name: 'work', color: WORK, blocks: B.filter((s) => s < 2000).map((s) => ({ a: s, b: s + 30, color: WORK })), show: after(t, P.ms30) },
                ]}
              />
            ) : (
              <Timeline
                W={1544}
                s0={0}
                s1={3000}
                now={ms}
                beat={BEAT}
                rows={[
                  { name: 'LED A', color: COL_A, edges: A, dots: [{ s: 1450, color: RED, label: 'opposite from here', p: after(t, P.opposite) }] },
                  { name: 'LED B', color: COL_B, edges: B },
                ]}
              />
            )}
          </Panel>
        </div>
        <div style={{ position: 'absolute', top: 944, width: '100%', display: 'grid', placeItems: 'center' }}>
          <CaptionLine captions={P.captions} t={t} size={32} />
        </div>
      </AbsoluteFill>
    </Scene>
  );
};
