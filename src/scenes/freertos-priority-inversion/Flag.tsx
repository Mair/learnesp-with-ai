/**
 * 2 · FLAG — try 1, run for real (lab v1): a home-made lock (a flag). Low takes it, medium
 * takes the CPU from low, high waits for the flag; low can't run to clear it, so medium runs
 * its whole second first → high waited 1019 ms → PRIORITY INVERSION. ✓ apart ✗ 1019 ms ✗ the
 * wait depends on medium.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { after, Hero, Lanes, LOG_LINE_COLOR, LogPanel, RED, rise, ScoreCard, type ScoreRow, Shell, Snippet } from './parts';
import { FLAG as S, FLAG_PLAY, FPS, playMs, RUN_FLAG, sceneDur } from './timeline';
import { C } from '../../theme/palette';

export const FLAG_SCORE: ScoreRow[] = [
  { at: S.apart, ok: true, text: 'high and low never overlap' },
  { at: S.depends - 1.2, ok: false, text: `high waited ${RUN_FLAG.waited} ms` },
  { at: S.depends, ok: false, text: 'the wait depends on medium' },
];
export const SCORE_TITLES: [string, string] = ['try 1 · a flag', 'try 2 · the mutex'];
export const FLAG_LINES = ['static volatile bool busy = false;', '', 'while (busy) {', '    vTaskDelay(pdMS_TO_TICKS(10));', '}', 'busy = true;', 'work(50);         // use the buffer', 'busy = false;'];

export const Flag: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const play = playMs(t, FLAG_PLAY);
  const logIn = after(t, S.log - 0.3);
  return (
    <Shell frames={Math.round(sceneDur('flag') * FPS)} kicker="Try 1 · a flag" captions={S.captions} t={t}>
      <div style={{ position: 'absolute', left: 960 - 330, top: 110, ...rise(after(t, S.code - 0.2)), opacity: after(t, S.code - 0.2) * (1 - logIn) }}>
        <Snippet
          t={t}
          title="low_task and high_task · the lock"
          color={C.cyan}
          size={21}
          w={660}
          lines={FLAG_LINES}
          lit={[
            { line: 2, at: S.waits }, { line: 3, at: S.waits }, { line: 4, at: S.waits },
            { line: 5, at: S.sets },
            { line: 6, at: S.sets + 1.0 },
            { line: 7, at: S.clears },
          ]}
        />
      </div>
      <div style={{ position: 'absolute', left: 165, top: 455, ...rise(after(t, S.chart - 0.3)) }}>
        <Lanes run={RUN_FLAG} play={play} verdict={RED} />
      </div>
      <div style={{ position: 'absolute', left: 110, width: 860, top: 105, ...rise(logIn) }}>
        <LogPanel t={t} rows={6} size={19} cps={3000} label="recorded in QEMU (ESP32 emulator) · the inv lines" lines={RUN_FLAG.log.map((l, i) => ({ at: S.log + i * 0.15, text: l, color: i === 5 ? RED : LOG_LINE_COLOR(l) }))} />
      </div>
      <div style={{ position: 'absolute', left: 1030, top: 105, ...rise(after(t, S.apart - 0.3)) }}>
        <ScoreCard t={t} flag={FLAG_SCORE} titles={SCORE_TITLES} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 790, ...rise(after(t, S.name - 0.1, 0.6)), }}>
        <Hero p={after(t, S.name - 0.1, 0.6)}>PRIORITY INVERSION</Hero>
      </div>
    </Shell>
  );
};
