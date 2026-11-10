/**
 * 7 · PAYOFF — "…that's priority inversion. A mutex fixes it by lending … that's priority
 * inheritance." + the recap; next: semaphores.
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
  const first = after(t, P.word - 0.3, 0.5);
  const hit = after(t, P.word2 - 0.3, 0.5);
  return (
    <Scene durationInFrames={Math.round(sceneDur('payoff') * FPS)}>
      <AbsoluteFill style={{ display: 'grid', placeItems: 'center', alignContent: 'center', gap: 22 }}>
        <div style={{ ...GRAD_TEXT, fontSize: 84, fontWeight: 800, opacity: first, transform: `scale(${0.92 + 0.08 * first})` }}>priority inversion</div>
        <div style={{ fontSize: 34, color: C.muted, opacity: hit }}>fixed by a mutex's</div>
        <div style={{ ...GRAD_TEXT, fontSize: 84, fontWeight: 800, opacity: hit, transform: `scale(${0.92 + 0.08 * hit})` }}>priority inheritance</div>
        <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
          {P.recap.map((r) => {
            const p = after(t, r.at, 0.5);
            return (
              <div key={r.k} style={{ display: 'grid', gridTemplateColumns: '640px 56px 700px', alignItems: 'center', fontSize: 28, opacity: p, transform: `translateX(${(1 - p) * -24}px)` }}>
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
