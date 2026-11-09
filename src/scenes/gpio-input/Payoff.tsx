/**
 * 12 · PAYOFF — "So: make the pin an input, give it a pull, and read its level. That's a GPIO input."
 * + the recap, ending on polling's limit, which the interrupts video picks up.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { Scene } from '../../components/Type';
import { C, FONT, GRAD_TEXT, hexA } from '../../theme/palette';
import { after } from './parts';
import { FPS, PAYOFF as P, sceneDur } from './timeline';

export const Payoff: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const hit = after(t, P.line, 0.5);
  const words = [
    { at: P.input, s: 'Make the pin an input,' },
    { at: P.pull, s: 'give it a pull,' },
    { at: P.level, s: 'and read its level.' },
  ];
  return (
    <Scene durationInFrames={Math.round(sceneDur('payoff') * FPS)}>
      <AbsoluteFill style={{ display: 'grid', placeItems: 'center', alignContent: 'center', gap: 36 }}>
        <div style={{ display: 'flex', gap: 36, fontSize: 46, fontWeight: 600, color: C.ink }}>
          {words.map((w) => {
            const p = after(t, w.at, 0.4);
            return (
              <span key={w.s} style={{ opacity: p, transform: `translateY(${(1 - p) * 14}px)` }}>
                {w.s}
              </span>
            );
          })}
        </div>
        <div style={{ ...GRAD_TEXT, fontSize: 130, fontWeight: 800, letterSpacing: '.02em', opacity: hit, transform: `scale(${0.92 + 0.08 * hit})` }}>
          That's a GPIO input.
        </div>
        <div style={{ display: 'grid', gap: 12 }}>
          {P.recap.map((r) => {
            const p = after(t, r.at, 0.5);
            return (
              <div key={r.k} style={{ display: 'grid', gridTemplateColumns: '640px 56px 620px', alignItems: 'center', fontSize: 29, opacity: p, transform: `translateX(${(1 - p) * -24}px)` }}>
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
