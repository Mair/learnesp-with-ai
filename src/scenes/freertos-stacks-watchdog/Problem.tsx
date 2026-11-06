/**
 * 1 · PROBLEM — every task so far got 2048 bytes. Too small → overflow → restart (the
 * tasks video); too big → the unused part is still set aside. How much does blink_task
 * need? Measure it.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { mono } from '../../components/Explainer';
import { C } from '../../theme/palette';
import { after, inOutLocal, LogPanel, Pill, RED, Shell, StackColumn, rise } from './parts';
import { FPS, PROBLEM as P, sceneDur } from './timeline';

const H = 400;

export const Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  // left column: shrinks on "too small" and floods past its top on "overflow"
  const shrink = inOutLocal((t - P.small) / 0.8) * (1 - inOutLocal((t - P.q) / 0.8));
  const hL = H * (1 - 0.45 * shrink);
  const flood = inOutLocal((t - (P.overflow - 0.6)) / 0.9) * (1 - inOutLocal((t - P.big) / 0.6));
  const levelL = 0.42 * (H / hL) * (1 + 0.85 * flood);
  // right column: grows on "too big", the unused part hatched
  const grow = inOutLocal((t - P.big) / 0.8) * (1 - inOutLocal((t - P.q) / 0.8));
  const hR = H * (1 + 0.3 * grow);
  const levelR = 0.42 * (H / hR);
  const hatch = after(t, P.aside) * (1 - after(t, P.q));
  const cols = after(t, P.cols, 0.6);
  const sizeP = after(t, P.bytes);
  return (
    <Shell frames={Math.round(sceneDur('problem') * FPS)} kicker="How big should a stack be?" captions={P.captions} t={t}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 160, height: 540, display: 'flex', justifyContent: 'center', gap: 380, alignItems: 'flex-end' }}>
        <div style={rise(cols)}>
          <StackColumn
            h={hL}
            level={levelL}
            title="blink_fast"
            size={<span style={{ opacity: sizeP }}>{shrink > 0.5 ? 'too small' : '2048 bytes'}</span>}
            color={C.cyan}
            notes={[{ frac: 1.12, text: 'stack overflow', color: RED, p: after(t, P.overflow) * (1 - after(t, P.big)), side: 'left' }]}
          />
        </div>
        <div style={rise(cols)}>
          <StackColumn
            h={hR}
            level={levelR}
            title="blink_slow"
            size={<span style={{ opacity: sizeP }}>{grow > 0.5 ? 'too big' : '2048 bytes'}</span>}
            hatchP={hatch}
            notes={[{ frac: 0.78, text: <>set aside<br />never used</>, color: C.muted, p: hatch, dy: -10 }]}
          />
        </div>
      </div>
      {/* the overflow, as the tasks video showed it */}
      <div style={{ position: 'absolute', left: 260, width: 1400, top: 772, ...rise(after(t, P.overflow) * (1 - after(t, P.big, 0.4))) }}>
        <LogPanel
          t={t}
          rows={2}
          size={22}
          label="from the tasks video"
          lines={[
            { at: P.overflow, text: '***ERROR*** A stack overflow in task blink_fast has been detected.', color: RED },
            { at: P.restarts, text: 'Rebooting...', color: C.muted },
          ]}
        />
      </div>
      {/* how much? */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 330, display: 'grid', justifyItems: 'center', gap: 30 }}>
        <div style={{ ...mono(150, C.amber, { fontWeight: 800 }), ...rise(after(t, P.q, 0.5)), textShadow: `0 0 40px ${C.amber}` }}>?</div>
        <div style={rise(after(t, P.measure))}>
          <Pill color={C.amber} size={34}>
            measure it
          </Pill>
        </div>
      </div>
    </Shell>
  );
};
