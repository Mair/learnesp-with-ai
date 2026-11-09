/**
 * 1 · WANT — "Let's say you want two tasks to share one number: a running total." work_a on
 * core 0 (left), work_b on core 1 (right), both at the same moment; each adds 1, a million
 * times → total should be 2,000,000. (An illustration: no log.)
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { mono } from '../../components/Explainer';
import { C, GRAD_TEXT } from '../../theme/palette';
import { after, CHIP_W, LEFT_X, rise, RIGHT_X, Shell, TOTAL_TOP, TotalBox, Wire, Worker } from './parts';
import { FPS, sceneDur, WANT as S, WORKER_COLOR } from './timeline';

export const Want: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const together = t >= S.same && t < S.same + 2.2 ? 0.5 + 0.5 * Math.abs(Math.sin((t - S.same) * 5)) : 0;
  const addP = after(t, S.adds, 0.6);
  return (
    <Shell frames={Math.round(sceneDur('want') * FPS)} kicker="Let's say you want…" captions={S.captions} t={t}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: TOTAL_TOP, display: 'flex', justifyContent: 'center', ...rise(after(t, S.total - 0.3)) }}>
        <TotalBox value={0} />
      </div>
      <Worker name="work_a" core={0} show={after(t, S.a - 0.2)} glow={together} />
      <Worker name="work_b" core={1} show={after(t, S.b - 0.2)} glow={together} />
      <Wire x1={LEFT_X + CHIP_W + 10} x2={960 - 170} y={182} p={addP} color={WORKER_COLOR.work_a} label="+1" />
      <Wire x1={RIGHT_X - 10} x2={960 + 170} y={182} p={addP} color={WORKER_COLOR.work_b} label="+1" />
      {(['work_a', 'work_b'] as const).map((n, i) => (
        <div key={n} style={{ position: 'absolute', left: (i ? RIGHT_X : LEFT_X) - 60, width: CHIP_W + 120, top: 280, textAlign: 'center', ...mono(26, WORKER_COLOR[n], { fontWeight: 700 }), opacity: after(t, S.million) }}>
          +1 × 1,000,000
        </div>
      ))}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 440, textAlign: 'center', ...rise(after(t, S.expect - 0.1, 0.6)) }}>
        <div style={mono(28, C.muted)}>so at the end, total should be</div>
        <div style={{ ...GRAD_TEXT, fontSize: 150, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '.02em' }}>2,000,000</div>
        <div style={mono(24, C.muted)}>1,000,000 + 1,000,000</div>
      </div>
    </Shell>
  );
};
