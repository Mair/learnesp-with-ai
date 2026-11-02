/**
 * 2 · THE ANSWER
 * "Two steps. First, make the pin an output. Then set its level: high, or low.
 *  That's a GPIO: a general-purpose input/output pin."
 *
 * The pin diagram (reused in the direction scene) closes its output-enable gate on
 * "output", swings to 3.3 V on "high" and back to GND on "low"; then
 * G·P·I·O lands letter by letter.
 */
import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Kicker, Scene } from '../../components/Type';
import { C, GRAD_TEXT } from '../../theme/palette';
import { after, clamp01, inOutLocal, PinDriver, Pill } from './parts';
import { ANSWER as A, FPS, sceneDur } from './timeline';

const WORDS = [
  { letter: 'G', rest: 'eneral' },
  { letter: 'P', rest: 'urpose' },
  { letter: 'I', rest: 'nput /' },
  { letter: 'O', rest: 'utput' },
];

export const Answer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const diagIn = after(t, A.diagramIn, 0.7);
  const enable = inOutLocal((t - A.output) / 0.35);
  const level = inOutLocal((t - A.high) / 0.3) * (1 - inOutLocal((t - A.low) / 0.3));
  const shrink = after(t, A.letters[0] - 0.4, 0.7);
  const s1 = after(t, A.output, 0.4);
  const s2 = after(t, A.high - 0.2, 0.4);

  return (
    <Scene durationInFrames={Math.round(sceneDur('answer') * FPS)}>
      <AbsoluteFill>
        <div style={{ position: 'absolute', top: 70, width: '100%', display: 'grid', placeItems: 'center' }}>
          <Kicker delay={0.1} accent="cyan">
            The answer
          </Kicker>
        </div>

        <div
          style={{
            position: 'absolute',
            top: 150,
            width: '100%',
            display: 'grid',
            justifyItems: 'center',
            gap: 16,
            opacity: diagIn * (1 - 0.5 * shrink),
            transform: `translateY(${(1 - diagIn) * 24 - 40 * shrink}px) scale(${1 - 0.25 * shrink})`,
            transformOrigin: 'top center',
          }}
        >
          <div style={{ display: 'flex', gap: 24, height: 50 }}>
            <div style={{ opacity: s1 }}>
              <Pill color={C.cyan} size={26}>
                ① make it an output
              </Pill>
            </div>
            <div style={{ opacity: s2 }}>
              <Pill color={C.amber} size={26}>
                ② set its level: HIGH or LOW
              </Pill>
            </div>
          </div>
          <PinDriver enable={enable} level={level} showInput={0.6} />
        </div>

        <div style={{ position: 'absolute', top: 610, width: '100%', display: 'flex', justifyContent: 'center', gap: 80 }}>
          {WORDS.map((w, i) => {
            const s = spring({ frame: frame - A.letters[i] * fps, fps, config: { damping: 11, mass: 0.6, stiffness: 140 } });
            const wordIn = after(t, A.words[i], 0.45);
            return (
              <div key={w.letter} style={{ display: 'grid', justifyItems: 'center', gap: 4 }}>
                <div
                  style={{
                    ...GRAD_TEXT,
                    fontSize: 220,
                    fontWeight: 800,
                    lineHeight: 1,
                    opacity: clamp01(s * 3),
                    transform: `scale(${interpolate(s, [0, 1], [0.6, 1])})`,
                  }}
                >
                  {w.letter}
                </div>
                <div style={{ fontSize: 44, fontWeight: 600, color: C.ink, opacity: wordIn, transform: `translateY(${(1 - wordIn) * 16}px)` }}>
                  <span style={{ color: C.cyan }}>{w.letter}</span>
                  {w.rest}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Scene>
  );
};
