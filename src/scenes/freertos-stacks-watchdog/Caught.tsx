/**
 * 9 · CAUGHT — the real log (QEMU, v1) in real time around the press: press 1 at 3573 ms,
 * the watchdog at 8573 and 13573 ms naming `button (CPU 0/1)`. The button's countdown
 * drains from the press and runs out on the error; the LEDs keep blinking.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { mono } from '../../components/Explainer';
import { C } from '../../theme/palette';
import { after, Button, GREEN, idleRemain, LedCard, LogPanel, RED, rise, Shell, WatchList } from './parts';
import { CAUGHT as S, FPS, ledOn, LOG_CAUGHT, PRESS_MS, sceneDur, TIMEOUT_S } from './timeline';

export const Caught: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  // the log runs in real time; scene time of a log ms
  const tOf = (ms: number) => S.press + (ms - PRESS_MS) / 1000;
  const lines = LOG_CAUGHT.filter((l) => tOf(l.ms) >= S.flash).map((l) => ({
    at: tOf(l.ms),
    text: l.text,
    color: l.kind === 'err' ? RED : l.text.includes('press') ? C.cyan : l.text.includes('blink_slow') ? 'rgba(255,110,199,.55)' : 'rgba(207,214,255,.5)',
    tag: l.text.includes(' - button') ? '← the stuck task' : undefined,
    tagColor: RED,
    tagAt: S.names,
  }));
  // the button's countdown: drains from the press; on the error it shows red, then the next round starts
  const since = t - S.press;
  const round = since < 0 ? -1 : Math.floor(since / TIMEOUT_S);
  const remain = since < 0 ? 1 : 1 - (since - round * TIMEOUT_S) / TIMEOUT_S;
  const lastErr = round >= 1 ? S.press + round * TIMEOUT_S : -99;
  const alarm = Math.max(0, 1 - (t - lastErr) / 1.6);
  const ledT0 = tOf(1576); // the blink tasks start with app_main (v1: 1573 ms)
  return (
    <Shell frames={Math.round(sceneDur('caught') * FPS)} kicker="Caught · the watchdog names the task" captions={S.captions} t={t}>
      <div style={{ position: 'absolute', left: 90, top: 140, width: 1120, ...rise(after(t, S.flash, 0.5)) }}>
        <LogPanel t={t} rows={25} size={17} cps={3000} label="recorded in QEMU · the jam is simulated" right="real time" lines={lines} />
      </div>
      <div style={{ position: 'absolute', left: 1260, top: 150, display: 'grid', gap: 40, ...rise(after(t, S.flash + 0.2, 0.5)) }}>
        <WatchList
          w={580}
          rowH={84}
          rows={[
            { name: 'IDLE0', remain: idleRemain(t) },
            { name: 'IDLE1', remain: idleRemain(t, 0.4) },
            { name: 'button', remain: alarm > 0.1 ? 0 : Math.max(0, remain), alarm, note: since >= 0 ? <span style={{ color: alarm > 0.1 ? RED : C.muted }}>{alarm > 0.1 ? 'no check-in for 5 s!' : 'no check-ins'}</span> : 'checking in' },
          ]}
        />
        <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
          <Button down={after(t, S.press - 0.3, 0.25)} jammed={after(t, S.press + 0.4)} />
          <LedCard pin={2} on={ledOn(t, ledT0, 200) ? 1 : 0} size={80} />
          <LedCard pin={19} on={ledOn(t, ledT0, 500) ? 1 : 0} size={80} />
        </div>
        <div style={{ ...mono(26, GREEN, { fontWeight: 700 }), opacity: after(t, S.leds) }}>LEDs: never stopped ✓</div>
      </div>
    </Shell>
  );
};
