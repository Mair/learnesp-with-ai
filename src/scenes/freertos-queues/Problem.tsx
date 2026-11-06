/**
 * 1 · PROBLEM — the button task knows about presses; the LED task should blink three times
 * per press. A shared flag: the LED task must keep checking it, and two quick presses set
 * the same flag → one seen. (An illustration: no log.)
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { mono } from '../../components/Explainer';
import { C, hexA } from '../../theme/palette';
import { after, Button, Chip, LedCard, ledLevel, RED, rise, Shell } from './parts';
import { FPS, PROBLEM as P, sceneDur } from './timeline';

export const Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const presses = [P.press, P.two, P.two + 0.45];
  const down = presses.some((x) => t >= x && t < x + 0.2) ? 1 : 0;
  // the flag: set by a press, cleared when the LED task reads it (on its next check)
  const checks: number[] = [];
  for (let x = P.checking - 0.6; x < sceneDur('problem'); x += 1.2) checks.push(x);
  const read = checks.find((c) => c > P.two + 0.45) ?? 99; // first check after both presses
  const flag = t >= P.two && t < read ? 1 : 0;
  const blinks = [P.three, ...(t >= read ? [read] : [])];
  const poll = checks.filter((c) => c <= t).pop();
  const pollP = poll === undefined ? 0 : Math.max(0, 1 - (t - poll) / 0.35);
  const flagP = after(t, P.flag);
  return (
    <Shell frames={Math.round(sceneDur('problem') * FPS)} kicker="One task, telling another" captions={P.captions} t={t}>
      <div style={{ position: 'absolute', left: 250, top: 220, display: 'grid', justifyItems: 'center', gap: 30, ...rise(after(t, P.button)) }}>
        <Chip name="button" glow={down} note={t >= P.two ? `presses: ${presses.filter((x) => x >= P.two && t >= x).length}` : undefined} />
        <Button down={down} />
      </div>
      <div style={{ position: 'absolute', left: 1450, top: 220, display: 'grid', justifyItems: 'center', gap: 40, ...rise(after(t, P.led)) }}>
        <Chip name="led" note={t >= read ? 'seen: 1' : t >= P.two ? 'seen: 0' : undefined} />
        <LedCard pin={2} on={ledLevel(t, blinks)} size={110} />
      </div>
      {/* how? */}
      <div style={{ position: 'absolute', left: 560, width: 800, top: 240, textAlign: 'center', ...mono(70, C.amber, { fontWeight: 800 }), opacity: after(t, P.how) * (1 - flagP) }}>→ ? →</div>
      {/* the flag */}
      <div style={{ position: 'absolute', left: 760, top: 210, width: 400, display: 'grid', justifyItems: 'center', gap: 14, ...rise(flagP) }}>
        <div style={mono(24, C.muted)}>bool pressed</div>
        <div style={{ width: 150, height: 120, borderRadius: 16, border: `2.5px solid ${hexA(C.cyan, 0.7)}`, display: 'grid', placeItems: 'center', background: 'rgba(10,4,32,.6)', ...mono(64, flag ? C.amber : C.muted, { fontWeight: 800 }) }}>{flag}</div>
        <div style={{ ...mono(22, C.cyan, { fontWeight: 700 }), opacity: pollP * after(t, P.checking - 0.6) }}>← is it set?</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 640, display: 'grid', justifyItems: 'center', gap: 14 }}>
        <div style={{ ...mono(30, C.ink), opacity: after(t, P.checking) }}>the LED task checks, and checks, and checks…</div>
        <div style={{ ...mono(32, RED, { fontWeight: 700 }), opacity: after(t, P.one) }}>✗ two presses → seen as one</div>
        <div style={{ ...mono(20, C.muted), opacity: after(t, P.flag) }}>illustration</div>
      </div>
    </Shell>
  );
};
