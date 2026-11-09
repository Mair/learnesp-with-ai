/**
 * 2 · FLAG — try 1, run for real (lab variant 5, v5.log): a shared `bool pressed`. The
 * button task sets it; the LED task checks it every 10 ms, clears it and blinks. One press
 * works and it's simple (✓✓); but it checks 100 times a second (✗), and of three quick
 * presses the last two set a flag that's already set → two seen, one lost (✗).
 * Clock: lab ms → scene time in two real-time pieces (FLAG.t).
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { mono } from '../../components/Explainer';
import { C } from '../../theme/palette';
import { after, FlagBox, isDown, LEFT_X, LeftSide, ledLevel, LogPanel, RED, RightSide, RIGHT_X, rise, ROW_TOP, ScoreCard, type ScoreRow, Shell, Snippet, Wire } from './parts';
import { FLAG as S, FLAG_BOOT, flagAt, FPS, PRESS_BLINK_S, RUN_FLAG, sceneDur } from './timeline';

export const FLAG_SCORE: ScoreRow[] = [
  { at: S.works, ok: true, text: 'one press works' },
  { at: S.simple, ok: true, text: 'simple' },
  { at: S.hundred, ok: false, text: 'checks 100× a second' },
  { at: S.lost, ok: false, text: 'loses presses' },
];

const BTN_LINES = ['if (last == 1 && level == 0) {', '    presses++;', '    ESP_LOGI(TAG, "press %d", presses);', '    pressed = true;', '}'];
const LED_LINES = ['if (pressed) {', '    pressed = false;', '    ESP_LOGI(TAG, "flag set: blink");', '    // blink 3 times', '}', 'vTaskDelay(pdMS_TO_TICKS(10));'];

export const Flag: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const pressT = RUN_FLAG.presses.map(S.t);
  const blinkT = RUN_FLAG.blinks.map(S.t);
  const m = S.ms(t);
  const flag = t >= pressT[0] - 0.05 ? flagAt(m) : 0;
  const again = m >= 9090 && m < 10460 ? 1 : 0;
  const blinking = blinkT.some((b) => t >= b && t < b + PRESS_BLINK_S);
  // checks: 100 a second while not blinking, from "checks"
  let busy = 0;
  for (const b of blinkT) busy += Math.max(0, Math.min(t, b + PRESS_BLINK_S) - Math.max(b, S.checks));
  const checks = t >= S.checks ? Math.floor(Math.max(0, t - S.checks - busy) * 100) : 0;
  const triple = t >= S.tB - 0.2;
  const pressesN = pressT.filter((x, i) => i > 0 && t >= x).length;
  const seenN = blinkT.filter((x, i) => i > 0 && t >= x).length;
  const pollPulse = 0.55 + 0.45 * Math.abs(Math.sin(t * 9));
  return (
    <Shell frames={Math.round(sceneDur('flag') * FPS)} kicker="Try 1 · a shared variable" captions={S.captions} t={t}>
      <LeftSide
        show={1}
        down={isDown(t, pressT)}
        glow={isDown(t, pressT)}
        label="GPIO 18"
        under={<div style={{ ...mono(24, C.cyan, { fontWeight: 700 }), opacity: triple ? 1 : 0 }}>presses: {pressesN}</div>}
      />
      <RightSide
        show={1}
        on={ledLevel(t, blinkT)}
        glow={blinking ? 1 : 0}
        under={
          <div style={{ display: 'grid', justifyItems: 'center', gap: 4 }}>
            <div style={{ ...mono(20, C.muted), opacity: after(t, S.checks) }}>
              checks: <span style={{ color: t >= S.hundred ? RED : C.ink, fontWeight: 700 }}>{checks.toLocaleString('en-US')}</span>
            </div>
            <div style={{ ...mono(24, C.amber, { fontWeight: 700 }), opacity: triple ? 1 : 0 }}>seen: {seenN}</div>
          </div>
        }
      />
      {/* the flag, and who touches it */}
      <div style={{ position: 'absolute', left: 960 - 75, top: ROW_TOP - 6, ...rise(after(t, S.box)) }}>
        <FlagBox value={flag} again={again} name={after(t, S.name)} />
      </div>
      <Wire x1={LEFT_X + 230} x2={960 - 90} p={after(t, S.set, 0.6)} label="pressed = true" />
      <Wire x1={RIGHT_X - 10} x2={960 + 90} p={after(t, S.checks, 0.6)} color={C.amber} label={<span style={{ opacity: t >= S.checks + 0.6 && !blinking ? pollPulse : 1 }}>is it set? every 10 ms</span>} />
      <div style={{ position: 'absolute', left: 560, width: 800, top: ROW_TOP + 176, textAlign: 'center', whiteSpace: 'nowrap', ...mono(22, RED, { fontWeight: 700 }), opacity: again * after(t, S.t(9090)) }}>set again while set: still just 1</div>
      {/* the code that does it */}
      <div style={{ position: 'absolute', left: 480, top: 345, ...rise(after(t, S.set)) }}>
        <Snippet t={t} title="button_task" color={C.cyan} lines={BTN_LINES} lit={[{ line: 3, at: S.set }]} size={18} w={470} />
      </div>
      <div style={{ position: 'absolute', left: 970, top: 345, ...rise(after(t, S.checks)) }}>
        <Snippet t={t} title="led_task · in its loop" color={C.amber} lines={LED_LINES} lit={[{ line: 0, at: S.checks }, { line: 1, at: S.clears }]} size={18} w={470} />
      </div>
      {/* the real run, and the score */}
      <div style={{ position: 'absolute', left: 110, width: 900, top: 590, ...rise(after(t, pressT[0] - 0.6)) }}>
        <LogPanel t={t} rows={6} size={21} cps={3000} label="recorded in QEMU · the presses are simulated" lines={RUN_FLAG.log.map((l) => ({ at: S.t(l.ms - FLAG_BOOT), text: l.text, color: l.text.includes('blink') ? C.amber : C.cyan }))} />
      </div>
      <div style={{ position: 'absolute', left: 1050, top: 590, ...rise(after(t, S.works - 0.3)) }}>
        <ScoreCard t={t} flag={FLAG_SCORE} />
      </div>
    </Shell>
  );
};
