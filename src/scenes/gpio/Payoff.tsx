/**
 * 10 · PAYOFF — "Make it an output. Set its level. That's GPIO." + the recap,
 * ending on the limitation that the PWM video picks up.
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
  const o = after(t, P.output, 0.4);
  const l = after(t, P.level, 0.4);
  const hit = after(t, P.line, 0.5);

  return (
    <Scene durationInFrames={Math.round(sceneDur('payoff') * FPS)}>
      <AbsoluteFill style={{ display: 'grid', placeItems: 'center', alignContent: 'center', gap: 40 }}>
        <div style={{ display: 'flex', gap: 40, fontSize: 48, fontWeight: 600, color: C.ink }}>
          <span style={{ opacity: o, transform: `translateY(${(1 - o) * 14}px)` }}>Make it an output.</span>
          <span style={{ opacity: l, transform: `translateY(${(1 - l) * 14}px)` }}>Set its level.</span>
        </div>
        <div style={{ ...GRAD_TEXT, fontSize: 150, fontWeight: 800, letterSpacing: '.03em', opacity: hit, transform: `scale(${0.92 + 0.08 * hit})` }}>
          That's GPIO.
        </div>
        <div style={{ display: 'grid', gap: 12 }}>
          {P.recap.map((r) => {
            const p = after(t, r.at, 0.5);
            return (
              <div
                key={r.k}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '640px 56px 560px',
                  alignItems: 'center',
                  fontSize: 30,
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
