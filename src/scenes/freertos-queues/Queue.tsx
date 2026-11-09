/**
 * 3 · QUEUE — try 2: swap the flag for a row of boxes. A copy in at the back, the oldest out
 * at the front; empty → the LED task sleeps (✓). The same presses as try 1, run for real
 * (v1.log): press 1 straight through; of three quick presses, 3 and 4 wait their turn and
 * come out in order (✓ nothing lost) → QUEUE. The catch: a fixed number of boxes, all full
 * → a new press is dropped (✗; an illustration here, for real in the full scene).
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { ease, mono } from '../../components/Explainer';
import { C, GRAD_TEXT, hexA } from '../../theme/palette';
import { FLAG_SCORE } from './Flag';
import { after, BOX, BOX_GAP, FlagBox, type QItem, isDown, LEFT_X, LeftSide, ledLevel, LogPanel, QueueRow, RightSide, RIGHT_X, rise, ROW_LEFT, ROW_TOP, rowWidth, runItems, ScoreCard, type ScoreRow, Shell, Wire } from './parts';
import { FPS, PRESS_BLINK_S, QUEUE as S, RUN_DEMO, sceneDur } from './timeline';

const QUEUE_SCORE: ScoreRow[] = [
  { at: S.sleeps, ok: true, text: 'sleeps until a press' },
  { at: S.every, ok: true, text: 'every press, in order' },
  { at: S.full, ok: false, text: 'only so many boxes' },
];

/** a dashed, empty item sliding along the row: the diagram before the run */
const Ghost: React.FC<{ t: number; at: number; from: number; to: number }> = ({ t, at, from, to }) => {
  const u = ease((t - at) / 0.9);
  if (t < at || t > at + 1.6) return null;
  return <div style={{ position: 'absolute', left: from + (to - from) * u + 8, top: ROW_TOP + 8, width: BOX - 16, height: BOX - 16, borderRadius: 10, border: `2.5px dashed ${C.amber}`, background: hexA(C.amber, 0.15), opacity: Math.min(1, (at + 1.6 - t) / 0.4) }} />;
};

export const Queue: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const W = rowWidth(5);
  const { items, recv } = runItems(RUN_DEMO, S.t);
  const pressT = RUN_DEMO.presses.map(S.t);
  // the catch, illustrated: five boxes fill, a sixth press bounces
  const fill = Array.from({ length: 5 }, (_, i) => ({ label: '•', in: S.full - 1.0 + i * 0.14 }));
  const all: QItem[] = [...items, ...fill];
  const present = all.filter((i) => t >= i.in && (i.out === undefined || t < i.out)).length;
  const blinking = recv.some((r) => t >= r && t < r + PRESS_BLINK_S);
  const asleep = t >= S.sleeps - 0.2 && !blinking && t < S.catch ? 1 : 0;
  const hero = after(t, S.word - 0.2, 0.6) * (1 - after(t, S.catch - 0.3));
  return (
    <Shell frames={Math.round(sceneDur('queue') * FPS)} kicker="Try 2 · a queue" captions={S.captions} t={t}>
      <LeftSide show={1} down={isDown(t, pressT)} glow={isDown(t, pressT)} label="GPIO 18" />
      <RightSide
        show={1}
        on={ledLevel(t, recv)}
        sleep={asleep}
        glow={blinking ? 1 : 0}
        under={
          <div style={{ ...mono(20, C.muted), opacity: after(t, S.checking) }}>
            checks: <span style={{ color: C.ink, fontWeight: 700 }}>0</span>
          </div>
        }
      />
      {/* the flag goes, the row comes */}
      <div style={{ position: 'absolute', left: 960 - 75, top: ROW_TOP - 6, opacity: 1 - after(t, 0.2, 0.5) }}>
        <FlagBox value={0} />
      </div>
      <div style={{ position: 'absolute', left: ROW_LEFT, top: ROW_TOP, ...rise(after(t, S.boxes - 0.3)) }}>
        <QueueRow t={t} items={all} drops={[{ label: '•', at: S.dropped }]} full={present >= 5 ? 1 : 0} endsP={after(t, S.back)} />
      </div>
      <Ghost t={t} at={S.back - 0.3} from={ROW_LEFT - BOX - 40} to={ROW_LEFT} />
      <Ghost t={t} at={S.front - 0.3} from={ROW_LEFT + 4 * (BOX + BOX_GAP)} to={ROW_LEFT + 4 * (BOX + BOX_GAP) + 170} />
      <Wire x1={LEFT_X + 230} x2={ROW_LEFT - 20} p={after(t, S.back - 0.4, 0.6)} label="copy in" />
      <Wire x1={ROW_LEFT + W + 20} x2={RIGHT_X - 10} p={after(t, S.front - 0.4, 0.6)} color={C.amber} label="oldest out" />
      <div style={{ position: 'absolute', left: ROW_LEFT, width: W, top: ROW_TOP + BOX + 34, textAlign: 'center', ...mono(20, C.muted), opacity: after(t, S.boxes) * (1 - hero) }}>{`${present} of 5 boxes in use${t >= S.full - 1 ? ' · illustration' : ''}`}</div>
      {/* the name */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', ...rise(hero) }}>
        <span style={{ ...GRAD_TEXT, fontSize: 150, fontWeight: 800, letterSpacing: '.04em' }}>QUEUE</span>
      </div>
      {/* the real run, and the score */}
      <div style={{ position: 'absolute', left: 110, width: 900, top: 590, ...rise(after(t, pressT[0] - 0.6)) }}>
        <LogPanel t={t} rows={6} size={21} cps={3000} label="recorded in QEMU · the presses are simulated" lines={RUN_DEMO.log.map((l) => ({ at: S.t(l.ms - RUN_DEMO.boot), text: l.text, color: C.amber }))} />
      </div>
      <div style={{ position: 'absolute', left: 1050, top: 590 }}>
        <ScoreCard t={t} flag={FLAG_SCORE.map((r) => ({ ...r, at: -1 }))} queue={QUEUE_SCORE} dimFlag={after(t, S.row)} queueShow={after(t, S.row)} />
      </div>
    </Shell>
  );
};
