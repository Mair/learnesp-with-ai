/**
 * 7 · FULL — real time, on lab run v2's clock: eight presses 120 ms apart; 1 straight
 * through, 2–6 fill the five boxes, 7 and 8 dropped (real warnings); a longer queue or a
 * wait in xQueueSend if every press matters.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { mono } from '../../components/Explainer';
import { C } from '../../theme/palette';
import { after, GREEN, Shell } from './parts';
import { Live } from './Live';
import { FPS, FULL as F, RUN_BURST, sceneDur } from './timeline';

export const Full: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <Shell frames={Math.round(sceneDur('full') * FPS)} kicker="Only five boxes" accent="amber" captions={F.captions} t={t}>
      <Live
        t={t}
        run={RUN_BURST}
        tOf={F.t}
        start={0.3}
        label="recorded in QEMU · eight presses, 120 ms apart (simulated)"
        extra={
          <div style={{ position: 'absolute', left: 0, right: 0, top: 500, textAlign: 'center', display: 'flex', justifyContent: 'center', gap: 40 }}>
            <span style={{ ...mono(26, GREEN, { fontWeight: 700 }), opacity: after(t, F.longer) }}>✓ xQueueCreate(<span style={{ color: C.amber }}>10</span>, sizeof(int))</span>
            <span style={{ ...mono(26, GREEN, { fontWeight: 700 }), opacity: after(t, F.waitT) }}>✓ xQueueSend(…, <span style={{ color: C.amber }}>pdMS_TO_TICKS(50)</span>)</span>
          </div>
        }
      />
    </Shell>
  );
};
