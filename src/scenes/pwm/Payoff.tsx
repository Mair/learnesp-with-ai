/**
 * 6 · PAYOFF — silence, then "That's PWM." and the three things to remember.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { EASE_OUT } from '../../components/anim';
import { Scene } from '../../components/Type';
import { C, FONT, GRAD_TEXT, hexA } from '../../theme/palette';
import { FPS, PAYOFF as P, sceneDur } from './timeline';

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export const Payoff: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const hit = EASE_OUT(clamp01((t - P.line) / 0.5));

  return (
    <Scene durationInFrames={Math.round(sceneDur('payoff') * FPS)}>
      <AbsoluteFill style={{ display: 'grid', placeItems: 'center', alignContent: 'center', gap: 60 }}>
        <div
          style={{
            ...GRAD_TEXT,
            fontSize: 150,
            fontWeight: 800,
            letterSpacing: '.03em',
            opacity: hit,
            transform: `scale(${0.92 + 0.08 * hit})`,
          }}
        >
          That's PWM.
        </div>
        <div style={{ display: 'grid', gap: 18 }}>
          {P.recap.map((r) => {
            const p = EASE_OUT(clamp01((t - r.at) / 0.5));
            return (
              <div
                key={r.k}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '480px 60px 520px',
                  alignItems: 'center',
                  fontSize: 38,
                  opacity: p,
                  transform: `translateX(${(1 - p) * -24}px)`,
                }}
              >
                <span style={{ fontFamily: FONT.mono, color: C.cyan, textAlign: 'right' }}>{r.k}</span>
                <span style={{ color: C.muted, textAlign: 'center' }}>→</span>
                <span style={{ color: C.ink, textShadow: `0 0 18px ${hexA(C.amber, 0.35)}` }}>{r.v}</span>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Scene>
  );
};
