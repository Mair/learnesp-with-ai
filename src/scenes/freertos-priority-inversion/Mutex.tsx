/**
 * 3 · MUTEX — try 2, run for real (lab v0): the flag swapped for the mutex (the code
 * changes on screen). Same timing; when high waits, low runs at priority 3, medium can't
 * interrupt it, low gives, drops back to 1, high gets it → 28 ms → PRIORITY INHERITANCE.
 * ✓ 28 ms ✓ medium can't get in between ✗ high still waits for the locked part.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { C } from '../../theme/palette';
import { FLAG_SCORE, SCORE_TITLES } from './Flag';
import { after, GREEN, Hero, Lanes, LOG_LINE_COLOR, LogPanel, rise, ScoreCard, type ScoreRow, Shell, Snippet } from './parts';
import { FPS, MUTEX as S, MUTEX_PLAY, playMs, RUN_MUTEX, sceneDur } from './timeline';

const MUTEX_SCORE: ScoreRow[] = [
  { at: S.waited, ok: true, text: `high waited ${RUN_MUTEX.waited} ms` },
  { at: S.inherits, ok: true, text: "medium can't get in between" },
  { at: S.catch + 1.2, ok: false, text: 'high still waits for the locked part' },
];

export const Mutex: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const play = playMs(t, MUTEX_PLAY);
  const logIn = after(t, S.log - 0.3);
  const swapped = t >= S.take - 0.2;
  const lines = swapped
    ? ['lock = xSemaphoreCreateMutex();   // in app_main', '', '', 'xSemaphoreTake(lock, portMAX_DELAY);', '', '', 'work(50);         // use the buffer', 'xSemaphoreGive(lock);']
    : ['static volatile bool busy = false;', '', 'while (busy) {', '    vTaskDelay(pdMS_TO_TICKS(10));', '}', 'busy = true;', 'work(50);         // use the buffer', 'busy = false;'];
  return (
    <Shell frames={Math.round(sceneDur('mutex') * FPS)} kicker="Try 2 · the mutex" captions={S.captions} t={t}>
      <div style={{ position: 'absolute', left: 960 - 330, top: 110, ...rise(after(t, 0.2)), opacity: after(t, 0.2) * (1 - logIn) }}>
        <Snippet
          t={t}
          title="low_task and high_task · the lock"
          color={C.cyan}
          size={21}
          w={660}
          lines={lines.filter((l, i) => !swapped || (i !== 1 && i !== 2 && i !== 4 && i !== 5))}
          lit={swapped ? [{ line: 1, at: S.take }, { line: 3, at: S.give }] : []}
        />
      </div>
      <div style={{ position: 'absolute', left: 165, top: 455, ...rise(after(t, S.chart - 0.3)) }}>
        <Lanes run={RUN_MUTEX} play={play} verdict={GREEN} boostLabel="at 3" />
      </div>
      <div style={{ position: 'absolute', left: 110, width: 860, top: 105, ...rise(logIn) }}>
        <LogPanel t={t} rows={6} size={19} cps={3000} label="recorded in QEMU (ESP32 emulator) · the inv lines" lines={RUN_MUTEX.log.map((l, i) => ({ at: S.log + i * 0.15, text: l, color: i === 4 || i === 3 ? GREEN : LOG_LINE_COLOR(l) }))} />
      </div>
      <div style={{ position: 'absolute', left: 1030, top: 105, ...rise(after(t, S.waited - 0.3)) }}>
        <ScoreCard t={t} flag={FLAG_SCORE.map((r) => ({ ...r, at: -10 }))} queue={MUTEX_SCORE} dimFlag={1} queueShow={1} titles={SCORE_TITLES} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 790, opacity: after(t, S.name - 0.1, 0.6) }}>
        <Hero p={after(t, S.name - 0.1, 0.6)}>PRIORITY INHERITANCE</Hero>
      </div>
    </Shell>
  );
};
