/**
 * 1 · WANT — "Let's say you want an LED to blink three times every time you press a
 * button." A press → three blinks (1.5 s). One loop doing both misses a press mid-blink, so
 * each job gets its own task: the button task on the left, the LED task on the right. How
 * does one tell the other? (An illustration: no log.)
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { ease, mono } from '../../components/Explainer';
import { C, hexA } from '../../theme/palette';
import { after, Chip, CHIP_MID, LEFT_X, LeftSide, ledLevel, RED, RightSide, RIGHT_X, rise, Shell, SIDE_TOP } from './parts';
import { BLINK_MS, FPS, sceneDur, WANT as S } from './timeline';

/** the blink as a strip: on / off, 250 ms each, three times */
const BlinkStrip: React.FC<{ t: number; p: number }> = ({ t, p }) => {
  const seg = 120;
  const live = ((t - S.half + 1.2) % 2.2) / 1.5; // a playhead sweeping the strip
  return (
    <div style={{ display: 'grid', justifyItems: 'center', gap: 16, opacity: p }}>
      <div style={{ display: 'flex', position: 'relative' }}>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} style={{ width: seg, height: 56, boxSizing: 'border-box', borderRadius: 8, margin: '0 3px', background: i % 2 === 0 ? hexA(C.amber, 0.8) : 'rgba(10,4,32,.7)', border: `1.5px solid ${hexA(C.amber, 0.6)}`, display: 'grid', placeItems: 'center', ...mono(18, i % 2 === 0 ? '#1a0d00' : C.muted, { fontWeight: 700 }) }}>
            {i % 2 === 0 ? 'on' : 'off'}
          </div>
        ))}
        {t > S.half && live <= 1 && <div style={{ position: 'absolute', left: live * 6 * (seg + 6), top: -10, bottom: -10, width: 3, background: C.ink, boxShadow: `0 0 10px ${C.ink}` }} />}
      </div>
      <div style={mono(30, C.ink, { fontWeight: 700 })}>
        3 × ({BLINK_MS} ms on + {BLINK_MS} ms off) = <span style={{ color: C.amber, opacity: after(t, S.half) }}>1.5 s</span>
      </div>
    </div>
  );
};

export const Want: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  // the want: one press, three blinks; then the press a single loop misses
  const blinkMiss = S.miss - 0.7;
  const presses = [S.press, S.miss];
  const down = presses.some((x) => t >= x && t < x + 0.18) ? 1 : 0;
  const on = ledLevel(t, [S.press + 0.1, blinkMiss]);
  // the single loop splits into two tasks on "own"
  const loopP = after(t, S.loop) * (1 - after(t, S.split, 0.2));
  const sp = ease((t - S.split) / 0.8);
  const midX = 960 - 110;
  const leftX = midX + (LEFT_X - midX) * sp;
  const rightX = midX + (RIGHT_X - midX) * sp;
  const missP = t >= S.miss ? 1 - after(t, S.split - 0.2) : 0;
  return (
    <Shell frames={Math.round(sceneDur('want') * FPS)} kicker="Let's say you want…" captions={S.captions} t={t}>
      <LeftSide show={after(t, S.button - 0.2)} down={down} chip={0} />
      <RightSide show={after(t, S.led - 0.2)} on={on} chip={0} />
      {/* one loop doing both */}
      <div style={{ position: 'absolute', left: midX, top: SIDE_TOP, ...rise(loopP) }}>
        <Chip name="one loop" note={t >= blinkMiss ? 'blinking… not looking at the button' : 'button + LED'} w={220} />
      </div>
      <svg width={1920} height={400} style={{ position: 'absolute', left: 0, top: 0, opacity: loopP * 0.8 }}>
        <line x1={LEFT_X + 220} y1={CHIP_MID + 160} x2={midX} y2={CHIP_MID} stroke={hexA(C.cyan, 0.6)} strokeWidth={3} strokeDasharray="10 8" />
        <line x1={midX + 220} y1={CHIP_MID} x2={RIGHT_X} y2={CHIP_MID + 180} stroke={hexA(C.amber, 0.6)} strokeWidth={3} strokeDasharray="10 8" />
      </svg>
      <div style={{ position: 'absolute', left: LEFT_X - 40, width: 300, top: SIDE_TOP + 330, textAlign: 'center', ...mono(30, RED, { fontWeight: 800 }), opacity: missP }}>✗ press missed</div>
      {/* two tasks */}
      {sp > 0 && (
        <>
          <div style={{ position: 'absolute', left: leftX, top: SIDE_TOP, opacity: ease((t - S.split) / 0.3) }}>
            <Chip name="button" glow={down * after(t, S.btask)} />
          </div>
          <div style={{ position: 'absolute', left: rightX, top: SIDE_TOP, opacity: ease((t - S.split) / 0.3) }}>
            <Chip name="led" />
          </div>
          <div style={{ position: 'absolute', left: LEFT_X - 90, width: 400, top: SIDE_TOP - 34, textAlign: 'center', whiteSpace: 'nowrap', ...mono(20, C.cyan, { fontWeight: 600 }), opacity: after(t, S.btask) }}>task 1 · watches the button</div>
          <div style={{ position: 'absolute', left: RIGHT_X - 90, width: 400, top: SIDE_TOP - 34, textAlign: 'center', whiteSpace: 'nowrap', ...mono(20, C.amber, { fontWeight: 600 }), opacity: after(t, S.ltask) }}>task 2 · blinks the LED</div>
        </>
      )}
      {/* how? */}
      <div style={{ position: 'absolute', left: LEFT_X + 260, width: RIGHT_X - LEFT_X - 300, top: CHIP_MID - 50, textAlign: 'center', ...mono(80, C.amber, { fontWeight: 800 }), opacity: after(t, S.how) }}>→ ? →</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 560 }}>
        <BlinkStrip t={t} p={after(t, S.math) * (1 - after(t, S.loop))} />
      </div>
    </Shell>
  );
};
