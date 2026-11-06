/**
 * 8 · esp_task_wdt_add / esp_task_wdt_reset — the button task joins the watch list
 * (esp_task_wdt_add(NULL), wrapped in ESP_ERROR_CHECK: it returns ESP_OK, unlike
 * xTaskCreate's pdPASS); from then on it must check in at least every 5 s; the check-in
 * (esp_task_wdt_reset) goes at the top of the loop; both from esp_task_wdt.h.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { mono } from '../../components/Explainer';
import { C } from '../../theme/palette';
import { after, CodeSplit, GREEN, idleRemain, RED, Verdict, WatchList } from './parts';
import { buttonCode, FPS, sceneDur, WATCH as S, WDT_ADD, WDT_INCLUDE, WDT_RESET } from './timeline';

const ListView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center' }}>
    <WatchList
      w={640}
      rows={[
        { name: 'IDLE0', remain: idleRemain(t) },
        { name: 'IDLE1', remain: idleRemain(t, 0.4) },
        { name: 'button', remain: 1, p: after(t, S.add + 0.6, 0.6), note: 'NULL = this task' },
      ]}
    />
  </div>
);

const CheckView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 34 }}>
    <div style={{ ...mono(26, C.ink), opacity: after(t, S.ret) }}>
      esp_task_wdt_add(…) → <span style={{ color: GREEN, fontWeight: 800 }}>ESP_OK</span> <span style={{ color: C.muted }}>(0)</span>
    </div>
    <Verdict ok p={after(t, S.check)} size={24}>
      ESP_ERROR_CHECK(esp_task_wdt_add(NULL));
    </Verdict>
    <div style={{ ...mono(26, C.ink), opacity: after(t, S.opposite) }}>
      xTaskCreate(…) → <span style={{ color: C.amber, fontWeight: 800 }}>pdPASS</span> <span style={{ color: C.muted }}>(1)</span>
    </div>
    <Verdict ok={false} p={after(t, S.opposite + 0.3)} size={24}>
      <span style={{ textDecoration: 'line-through', textDecorationColor: RED }}>ESP_ERROR_CHECK(xTaskCreate(…))</span> <span style={mono(20, C.muted)}>the tasks video</span>
    </Verdict>
  </div>
);

const ClockView: React.FC<{ t: number }> = ({ t }) => {
  // after the check-in line goes in, each loop's check-in flashes (drawn ~3× a second; really every ~10 ms)
  const live = t >= S.top;
  const flash = live ? 1 - ((t - S.top) * 3) % 1 : 0;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 40 }}>
      <WatchList
        w={640}
        rows={[{ name: 'button', remain: live ? 1 : Math.max(0, 1 - (t - S.every5) / 5), checkIn: live ? flash : 0, note: live ? 'refilled every time round the loop' : 'must check in within 5 s' }]}
        title="task watchdog · 5 s"
      />
      <div style={{ ...mono(26, C.ink, { fontWeight: 700 }), opacity: after(t, S.reset) }}>
        esp_task_wdt_reset() <span style={{ color: C.muted, fontWeight: 400 }}>= the check-in</span>
      </div>
      <div style={{ ...mono(26, GREEN, { fontWeight: 700 }), opacity: after(t, S.still) }}>“still running”</div>
    </div>
  );
};

const IncludeView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', justifyItems: 'start', gap: 24 }}>
    <div style={{ ...mono(32, C.cyan, { fontWeight: 700 }), opacity: after(t, S.include) }}>{WDT_INCLUDE}</div>
    <div style={{ ...mono(24, C.muted), opacity: after(t, S.include + 0.4) }}>esp_task_wdt_add · esp_task_wdt_reset</div>
  </div>
);

export const Watch: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const add = t >= S.add;
  const reset = t >= S.reset;
  const inc = t >= S.include;
  const code = buttonCode({ add, reset, include: inc });
  const addAt = code.indexOf(WDT_ADD);
  const resetAt = code.indexOf(WDT_RESET);
  const incAt = code.indexOf(WDT_INCLUDE);
  const marks = [
    ...(add ? [{ line: addAt, at: S.add + 0.2, token: 'esp_task_wdt_add(NULL)', strong: true, label: 'watch this task' }] : []),
    ...(add && t >= S.check ? [{ line: addAt, at: S.check, token: 'ESP_ERROR_CHECK' }] : []),
    ...(reset ? [{ line: resetAt, at: S.reset + 0.2, token: 'esp_task_wdt_reset()', strong: true, label: 'check in' }] : []),
    ...(inc ? [{ line: incAt, at: S.include + 0.2, token: WDT_INCLUDE }] : []),
  ];
  const V = S.views;
  return (
    <CodeSplit
      t={t}
      frames={Math.round(sceneDur('watch') * FPS)}
      kicker="Watch a task · esp_task_wdt_add() · esp_task_wdt_reset()"
      file="main/main.c · button_task"
      code={code}
      codeSize={16}
      marks={marks}
      lineStyle={(i) => (i === addAt || i === resetAt || i === incAt ? { background: 'rgba(125,255,176,.06)' } : undefined)}
      views={[
        { at: V.list, component: ListView, label: 'the watch list', accent: C.cyan },
        { at: V.check, component: CheckView, label: 'the return value', accent: GREEN },
        { at: V.clock, component: ClockView, label: 'check in, or else', accent: C.cyan },
        { at: V.inc, component: IncludeView, label: 'the header', accent: C.cyan },
      ]}
      captions={S.captions}
    />
  );
};
