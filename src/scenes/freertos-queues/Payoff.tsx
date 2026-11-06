/**
 * 9 · PAYOFF — "A queue carries copies from one task to another, in order, and the receiver
 * sleeps until they arrive. That's a queue." + the recap.
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
  const first = after(t, 0.3, 0.5);
  const hit = after(t, P.word - 0.3, 0.5);
  return (
    <Scene durationInFrames={Math.round(sceneDur('payoff') * FPS)}>
      <AbsoluteFill style={{ display: 'grid', placeItems: 'center', alignContent: 'center', gap: 26 }}>
        <div style={{ fontSize: 46, fontWeight: 700, color: C.ink, opacity: first, transform: `translateY(${(1 - first) * 14}px)` }}>A queue carries copies from one task to another, in order.</div>
        <div style={{ ...GRAD_TEXT, fontSize: 104, fontWeight: 800, letterSpacing: '.01em', opacity: hit, transform: `scale(${0.92 + 0.08 * hit})` }}>That's a queue.</div>
        <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
          {P.recap.map((r) => {
            const p = after(t, r.at, 0.5);
            return (
              <div key={r.k} style={{ display: 'grid', gridTemplateColumns: '700px 56px 700px', alignItems: 'center', fontSize: 29, opacity: p, transform: `translateX(${(1 - p) * -24}px)` }}>
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
