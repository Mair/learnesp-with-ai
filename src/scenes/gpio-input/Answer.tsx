/**
 * 2 · THE ANSWER
 * "Give it a gentle default. A resistor to three point three volts holds the pin high, as long as nothing else is in charge."
 * "Press the button, and its short path to ground takes over. The pin drops to zero."
 * "Released is one. Pressed is zero. That resistor is called a pull-up."
 *
 * Same diagram as the problem, now with the pull-up; then PULL-UP lands.
 */
import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Kicker, Scene } from '../../components/Type';
import { C, GRAD_TEXT } from '../../theme/palette';
import { after, clamp01, InputPin, Pill, pinState } from './parts';
import { ANSWER as A, FPS, readAt, sceneDur } from './timeline';

const PRESSES: [number, number][] = [
  [A.press, A.release],
  [A.pressed, A.pressed + 1.3],
];
const down = (t: number) => PRESSES.some(([a, b]) => t >= a && t < b);

export const Answer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const diagIn = after(t, A.diagramIn, 0.7);
  const wpu = clamp01((t - A.resistor) / 0.35);
  const press = down(t) ? 1 : 0;
  const st = pinState({ wpu: t >= A.resistor ? 1 : 0, wpd: 0, press, s: t });
  const reading = readAt(st.v, Math.round(t * 2));
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

        <div
          style={{
            position: 'absolute',
            top: 130,
            width: '100%',
            display: 'grid',
            justifyItems: 'center',
            gap: 14,
            opacity: diagIn,
            transform: `translateY(${(1 - diagIn) * 24}px) scale(${1 - 0.22 * shrink})`,
            transformOrigin: 'top center',
          }}
        >
          <div style={{ display: 'flex', gap: 24, height: 50 }}>
            <div style={{ opacity: after(t, A.high) }}>
              <Pill color={C.amber} size={26}>
                nothing pressing → pulled HIGH
              </Pill>
            </div>
            <div style={{ opacity: after(t, A.takes) }}>
              <Pill color={C.cyan} size={26}>
                button → its short path to GND wins
              </Pill>
            </div>
          </div>
          <InputPin ie={1} wpu={wpu} wpd={0} showUp={after(t, A.resistor - 0.3, 0.5)} showDown={0} press={press} v={st.v} floating={st.floating} reading={reading} width={1240} />
          <div style={{ display: 'flex', gap: 40, height: 60, fontFamily: 'JetBrains Mono, monospace', fontSize: 40, fontWeight: 700 }}>
            <span style={{ opacity: after(t, A.released), color: C.amber }}>released → 1</span>
            <span style={{ opacity: after(t, A.pressed), color: C.cyan }}>pressed → 0</span>
          </div>
        </div>

        <div style={{ position: 'absolute', top: 690, width: '100%', display: 'grid', justifyItems: 'center' }}>
          <div
            style={{
              ...GRAD_TEXT,
              fontSize: 200,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: '.04em',
              opacity: clamp01(s * 3),
              transform: `scale(${interpolate(s, [0, 1], [0.6, 1])})`,
            }}
          >
            PULL-UP
          </div>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};
