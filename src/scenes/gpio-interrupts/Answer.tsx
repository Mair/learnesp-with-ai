/**
 * 2 · THE ANSWER
 * "It can. The GPIO hardware watches the pin for an edge. When it sees one, it interrupts the CPU, and runs a function you gave it."
 * "Then the CPU goes back to what it was doing. That's an interrupt."
 *
 * Lanes: the pin (falls on "edge"), the CPU (your code → your function → back).
 * Narration-paced, not to scale. Then INTERRUPT lands.
 */
import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Panel } from '../../components/Panel';
import { Kicker, Scene } from '../../components/Type';
import { C, GRAD_TEXT } from '../../theme/palette';
import { after, clamp01, Lanes, Pill } from './parts';
import { ANSWER as A, FPS, sceneDur } from './timeline';

export const Answer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const s0 = 1.0;
  const s1 = 14.5;
  const shrink = after(t, A.word - 0.5, 0.7);
  const s = spring({ frame: frame - A.word * fps, fps, config: { damping: 11, mass: 0.6, stiffness: 140 } });
  return (
    <Scene durationInFrames={Math.round(sceneDur('answer') * FPS)}>
      <AbsoluteFill>
        <div style={{ position: 'absolute', top: 40, width: '100%', display: 'grid', placeItems: 'center' }}>
          <Kicker delay={0.1} accent="cyan">
            The answer
          </Kicker>
        </div>
        <div style={{ position: 'absolute', left: 160, top: 130, width: 1600, height: 380, opacity: after(t, 0.3, 0.6) * (1 - 0.35 * shrink) }}>
          <Panel label="the pin watches · the CPU gets interrupted" accent={C.cyan} right="not to scale">
            <Lanes
              W={1544}
              s0={s0}
              s1={s1}
              now={t}
              lanes={[
                { name: 'GPIO 18', color: C.magenta, level: (x) => (x < A.edge ? 1 : 0) },
                {
                  name: 'CPU',
                  color: C.cyan,
                  spans: [
                    { a: s0, b: A.interrupts, color: C.cyan, label: 'your code, busy with something else' },
                    { a: A.interrupts, b: A.back, color: C.amber, label: 'your function' },
                    { a: A.back, b: s1, color: C.cyan, label: 'back to what it was doing' },
                  ],
                },
              ]}
              marks={[
                { s: A.edge, label: 'edge!', color: C.magenta, lane: 0 },
                { s: A.interrupts, label: 'interrupt', color: C.amber, lane: 1 },
              ]}
            />
            <div style={{ display: 'flex', gap: 20, marginTop: 8 }}>
              <div style={{ opacity: after(t, A.watches) }}>
                <Pill color={C.magenta} size={22}>
                  the GPIO hardware watches for the edge
                </Pill>
              </div>
              <div style={{ opacity: after(t, A.runs) }}>
                <Pill color={C.amber} size={22}>
                  and runs the function you gave it
                </Pill>
              </div>
            </div>
          </Panel>
        </div>
        <div style={{ position: 'absolute', top: 600, width: '100%', display: 'grid', justifyItems: 'center' }}>
          <div style={{ ...GRAD_TEXT, fontSize: 190, fontWeight: 800, lineHeight: 1, letterSpacing: '.04em', opacity: clamp01(s * 3), transform: `scale(${interpolate(s, [0, 1], [0.6, 1])})` }}>
            INTERRUPT
          </div>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};
