/**
 * 6 · TRAP — run for real (lab v2): low sleeps (vTaskDelay 500 ms) while it holds the mutex.
 * It's lifted to 3, but asleep, so high waits 470 ms. The fix (lab v3): keep the locked part
 * short — 5 ms of work, done before high even wakes → high waits 0 ms.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { C } from '../../theme/palette';
import { after, GREEN, Lanes, LOG_LINE_COLOR, LogPanel, RED, rise, Shell, Snippet } from './parts';
import { FPS, LOG_SHORT, playMs, RUN_SLEEP, sceneDur, SLEEP_PLAY, TRAP as S } from './timeline';

export const Trap: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const fixed = t >= S.five - 0.6;
  const fixP = after(t, S.five - 0.6);
  const lines = [
    'xSemaphoreTake(lock, portMAX_DELAY);',
    'ESP_LOGI(TAG, "low: took the lock");',
    fixed ? 'work(5);                   // short' : 'vTaskDelay(pdMS_TO_TICKS(500));   // ✗ asleep',
    'ESP_LOGI(TAG, "low: priority %u, …", …);',
    'xSemaphoreGive(lock);',
  ];
  return (
    <Shell frames={Math.round(sceneDur('trap') * FPS)} kicker="The trap · waiting while you hold it" captions={S.captions} t={t}>
      <div style={{ position: 'absolute', left: 110, top: 110, ...rise(after(t, S.bug - 0.3)) }}>
        <Snippet t={t} title="low_task" color={fixed ? GREEN : RED} size={20} w={720} lines={lines} lit={[{ line: 2, at: fixed ? S.five - 0.6 : S.delay }]} />
      </div>
      <div style={{ position: 'absolute', left: 870, width: 940, top: 110, ...rise(after(t, S.waited - 0.6)), opacity: after(t, S.waited - 0.6) * (1 - fixP) }}>
        <LogPanel t={t} rows={6} size={19} cps={3000} label="recorded in QEMU (ESP32 emulator)" lines={RUN_SLEEP.log.map((l, i) => ({ at: S.waited - 0.6 + i * 0.12, text: l, color: i === 4 ? RED : LOG_LINE_COLOR(l) }))} />
      </div>
      <div style={{ position: 'absolute', left: 870, width: 940, top: 110, ...rise(fixP) }}>
        <LogPanel t={t} rows={6} size={19} cps={3000} label="recorded in QEMU · the 5 ms version" lines={LOG_SHORT.map((l, i) => ({ at: S.five + i * 0.12, text: l, color: l.includes('got it') ? GREEN : LOG_LINE_COLOR(l) }))} />
      </div>
      <div style={{ position: 'absolute', left: 165, top: 455, ...rise(after(t, S.delay - 0.3)), opacity: after(t, S.delay - 0.3) * (1 - after(t, S.fix + 0.5)) }}>
        <Lanes run={RUN_SLEEP} play={playMs(t, SLEEP_PLAY)} verdict={RED} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', ...rise(after(t, S.short - 0.2)) }}>
        <div style={{ fontSize: 46, fontWeight: 800, color: C.ink }}>Keep the locked part <span style={{ color: GREEN }}>short</span></div>
        <div style={{ fontSize: 30, color: C.muted, marginTop: 14, opacity: after(t, S.before - 0.2) }}>wait, sleep and do slow work <b style={{ color: C.ink }}>before</b> the take or <b style={{ color: C.ink }}>after</b> the give</div>
      </div>
    </Shell>
  );
};
