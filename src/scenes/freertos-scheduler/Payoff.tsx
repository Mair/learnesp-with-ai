/**
 * 9 · PAYOFF — "The highest-priority ready task runs. That's the scheduler." + the recap.
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
  const hit = after(t, P.sched - 0.2, 0.5);
  return (
    <Scene durationInFrames={Math.round(sceneDur('payoff') * FPS)}>
      <AbsoluteFill style={{ display: 'grid', placeItems: 'center', alignContent: 'center', gap: 30 }}>
        <div style={{ fontSize: 56, fontWeight: 700, color: C.ink, opacity: first, transform: `translateY(${(1 - first) * 14}px)` }}>The highest-priority ready task runs.</div>
        <div style={{ ...GRAD_TEXT, fontSize: 120, fontWeight: 800, letterSpacing: '.02em', opacity: hit, transform: `scale(${0.92 + 0.08 * hit})` }}>That's the scheduler.</div>
        <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
          {P.recap.map((r) => {
            const p = after(t, r.at, 0.5);
            return (
              <div key={r.k} style={{ display: 'grid', gridTemplateColumns: '700px 56px 600px', alignItems: 'center', fontSize: 29, opacity: p, transform: `translateX(${(1 - p) * -24}px)` }}>
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
