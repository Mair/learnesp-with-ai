/**
 * 2 · ANSWER — a row of boxes between the tasks: a copy of each press goes in at the back,
 * the oldest leaves at the front; when it's empty the LED task sleeps → QUEUE.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { C, GRAD_TEXT } from '../../theme/palette';
import { after, Chip, QueueRow, rise, rowWidth, Shell } from './parts';
import { ANSWER as A, ANSWER_ITEMS, FPS, sceneDur } from './timeline';

export const Answer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const asleep = t >= A.sleeps - 0.3 && t < A.arrives - 0.2 ? after(t, A.sleeps - 0.3) : 0;
  const hero = after(t, A.word - 0.2, 0.6);
  const W = rowWidth(5);
  return (
    <Shell frames={Math.round(sceneDur('answer') * FPS)} kicker="The answer" captions={A.captions} t={t}>
      <div style={{ position: 'absolute', left: 170, top: 300, ...rise(after(t, A.row)) }}>
        <Chip name="button" />
      </div>
      <div style={{ position: 'absolute', left: 1530, top: 300, ...rise(after(t, A.row)) }}>
        <Chip name="led" sleep={asleep} glow={ANSWER_ITEMS.some((i) => t >= i.out && t < i.out + 0.6) ? 1 : 0} />
      </div>
      <div style={{ position: 'absolute', left: (1920 - W) / 2, top: 290, ...rise(after(t, A.boxes)) }}>
        <QueueRow t={t} items={ANSWER_ITEMS.map((i) => ({ label: i.label, in: i.in, out: i.out }))} endsP={after(t, A.copy)} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', ...rise(hero) }}>
        <span style={{ ...GRAD_TEXT, fontSize: 170, fontWeight: 800, letterSpacing: '.04em' }}>QUEUE</span>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 480, textAlign: 'center', fontSize: 30, color: C.muted, opacity: after(t, A.oldest) * (1 - hero) }}>oldest first</div>
    </Shell>
  );
};
