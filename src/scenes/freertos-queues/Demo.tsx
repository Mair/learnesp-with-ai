/**
 * 6 · DEMO — real time, on lab run v1's clock: press 1 → straight through → three blinks;
 * three quick presses → 3 and 4 wait in the queue → out 1.5 s apart, in order.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { mono } from '../../components/Explainer';
import { after, GREEN, Shell } from './parts';
import { Live } from './Live';
import { DEMO as D, FPS, RUN_DEMO, sceneDur } from './timeline';

export const Demo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <Shell frames={Math.round(sceneDur('demo') * FPS)} kicker="Flash it · presses through a queue" captions={D.captions} t={t}>
      <Live
        t={t}
        run={RUN_DEMO}
        tOf={D.t}
        start={D.flash}
        label="recorded in QEMU · the presses are simulated"
        extra={<div style={{ position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', ...mono(28, GREEN, { fontWeight: 700 }), opacity: after(t, D.lost) }}>no press lost · the button task never waited ✓</div>}
      />
    </Shell>
  );
};
