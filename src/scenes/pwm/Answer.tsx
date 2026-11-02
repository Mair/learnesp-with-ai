/**
 * 2 · THE ANSWER
 * "You switch it on and off, really fast. That's PWM: pulse width modulation."
 * The wave draws slowly on "on and off", compresses on "really fast", and
 * each letter of P·W·M lands on its spoken letter.
 */
import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { EASE_OUT } from '../../components/anim';
import { Scope } from '../../components/CodeToHardware';
import { Kicker, Scene } from '../../components/Type';
import { C, GRAD_TEXT } from '../../theme/palette';
import { ANSWER as A, FPS, sceneDur } from './timeline';

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

const WORDS = [
  { letter: 'P', rest: 'ulse' },
  { letter: 'W', rest: 'idth' },
  { letter: 'M', rest: 'odulation' },
];

export const Answer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // wave: draws on, then compresses into a blur of cycles
  const reveal = EASE_OUT(clamp01((t - A.wave) / 0.9));
  const speed = clamp01((t - A.fast) / (A.fastEnd - A.fast));
  const cycles = 2.2 * (46 / 2.2) ** (speed * speed);
  const phase = t * (1.5 + 30 * speed * speed);
  const waveDim = 1 - 0.55 * clamp01((t - A.letters[0]) / 0.6);

  return (
    <Scene durationInFrames={Math.round(sceneDur('answer') * FPS)}>
      <AbsoluteFill style={{ display: 'grid', placeItems: 'center', alignContent: 'center', gap: 46 }}>
        <Kicker delay={0.1} accent="cyan">
          The answer
        </Kicker>

        <div style={{ clipPath: `inset(0 ${(1 - reveal) * 100}% 0 0)`, opacity: waveDim }}>
          <Scope duty={0.5} phase={phase} cycles={cycles} W={1400} H={110} color={C.magenta} />
        </div>

        <div style={{ display: 'flex', gap: 90, alignItems: 'flex-start' }}>
          {WORDS.map((w, i) => {
            const s = spring({
              frame: frame - A.letters[i] * fps,
              fps,
              config: { damping: 11, mass: 0.6, stiffness: 140 },
            });
            const wordIn = EASE_OUT(clamp01((t - A.words[i]) / 0.45));
            return (
              <div key={w.letter} style={{ display: 'grid', justifyItems: 'center', gap: 6 }}>
                <div
                  style={{
                    ...GRAD_TEXT,
                    fontSize: 230,
                    fontWeight: 800,
                    lineHeight: 1,
                    opacity: clamp01(s * 3),
                    transform: `scale(${interpolate(s, [0, 1], [0.6, 1])})`,
                  }}
                >
                  {w.letter}
                </div>
                <div
                  style={{
                    fontSize: 46,
                    fontWeight: 600,
                    letterSpacing: '.04em',
                    color: C.ink,
                    opacity: wordIn,
                    transform: `translateY(${(1 - wordIn) * 16}px)`,
                  }}
                >
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
