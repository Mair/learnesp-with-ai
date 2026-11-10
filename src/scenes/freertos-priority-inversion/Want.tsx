/**
 * 1 · WANT — "Let's say you want a task that reacts quickly…": high (3) and low (1) share a
 * buffer behind a lock; medium (2) does a second of work and never touches it; all three on
 * core 0. The question: how long does high wait? (An illustration: no log.)
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { mono } from '../../components/Explainer';
import { C, hexA } from '../../theme/palette';
import { after, BufferBox, rise, Shell, TaskTag } from './parts';
import { FPS, LANE_COLOR, sceneDur, WANT as S } from './timeline';

const X = 330;
const Y: Record<string, number> = { high: 200, medium: 420, low: 640 };

const Link: React.FC<{ y: number; color: string; p: number; label: string; dashed?: boolean; cross?: boolean }> = ({ y, color, p, label, cross }) => (
  <div style={{ position: 'absolute', left: X + 280, top: y + 22, width: 560 * p, height: 0, borderTop: `3px dashed ${hexA(color, cross ? 0.35 : 0.8)}`, opacity: p }}>
    <div style={{ position: 'absolute', left: 0, width: 560, top: -36, textAlign: 'center', ...mono(21, cross ? C.muted : color, { fontWeight: 700 }) }}>{label}</div>
  </div>
);

export const Want: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <Shell frames={Math.round(sceneDur('want') * FPS)} kicker="Let's say you want…" captions={S.captions} t={t}>
      <div style={{ position: 'absolute', left: X, top: Y.high, ...rise(after(t, S.high - 0.3)) }}>
        <TaskTag lane="high" w={260} glow={t >= S.three && t < S.three + 1 ? 1 : 0} />
        <div style={{ ...mono(20, LANE_COLOR.high), marginTop: 10, textAlign: 'center' }}>must react quickly</div>
      </div>
      <div style={{ position: 'absolute', left: X, top: Y.medium, ...rise(after(t, S.medium - 0.3)) }}>
        <TaskTag lane="medium" w={260} />
        <div style={{ ...mono(20, '#c9a2f2'), marginTop: 10, textAlign: 'center', opacity: after(t, S.second) }}>1 s of work</div>
      </div>
      <div style={{ position: 'absolute', left: X, top: Y.low, ...rise(after(t, S.low - 0.3)) }}>
        <TaskTag lane="low" w={260} />
        <div style={{ ...mono(20, '#8fb6ff'), marginTop: 10, textAlign: 'center' }}>slow, not urgent</div>
      </div>
      <div style={{ position: 'absolute', left: 1180, top: 370, ...rise(after(t, S.low - 0.1)) }}>
        <BufferBox />
      </div>
      <Link y={Y.high} color={LANE_COLOR.high} p={after(t, S.lock, 0.6)} label="uses it, takes the lock first" />
      <Link y={Y.low} color={LANE_COLOR.low} p={after(t, S.lock, 0.6)} label="uses it, takes the lock first" />
      <Link y={Y.medium} color={LANE_COLOR.medium} p={after(t, S.never, 0.6)} label="never touches it ✗" cross />
      <div style={{ position: 'absolute', left: X - 40, top: 140, width: 340, height: 640, borderRadius: 22, border: `2px solid ${hexA(C.cyan, 0.5)}`, opacity: after(t, S.core - 0.2) }}>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: -44, textAlign: 'center', ...mono(22, C.cyan, { fontWeight: 700, letterSpacing: '.12em' }) }}>ALL ON CORE 0</div>
      </div>
      <div style={{ position: 'absolute', left: 1020, width: 620, top: 640, textAlign: 'center', ...mono(36, C.ink, { fontWeight: 700 }), ...rise(after(t, S.question - 0.2)) }}>
        how long does <span style={{ color: LANE_COLOR.high }}>high</span> wait?
      </div>
    </Shell>
  );
};
