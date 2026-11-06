/**
 * 4 · DEMO — the real log (QEMU, v0): 1556, then 1124 for good. The first reading came
 * before the first log line; the log line took 432 bytes. It never goes back up.
 * Lines appear on the VO (not real time); the column shows the most-used mark.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { mono } from '../../components/Explainer';
import { C } from '../../theme/palette';
import { after, GREEN, inOutLocal, LogPanel, logColor, Shell, StackColumn, rise } from './parts';
import { DEMO as D, FIRST_FREE, FIRST_USED, FPS, FREE, LOG_DEMO, sceneDur, STACK, USED } from './timeline';

export const Demo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const jump = inOutLocal((t - D.lineAt[1]) / 0.6);
  const high = (FIRST_USED + (USED - FIRST_USED) * jump) / STACK;
  const shownFirst = t >= D.lineAt[0];
  return (
    <Shell frames={Math.round(sceneDur('demo') * FPS)} kicker="Flash it · the high water mark, measured" captions={D.captions} t={t}>
      <div style={{ position: 'absolute', left: 110, top: 150, width: 1080, ...rise(after(t, D.flash, 0.5)) }}>
        <LogPanel
          t={t}
          rows={8}
          size={24}
          label="recorded in QEMU (ESP32 emulator) · ESP-IDF v6.0.2"
          lines={LOG_DEMO.map((l, i) => ({
            at: D.lineAt[i] ?? 99,
            text: l.text,
            color: i === 0 ? C.amber : l.text.includes('blink_slow') ? C.pink : logColor(l),
            tag: i === 0 ? '← before any log' : undefined,
            tagAt: D.before,
          }))}
        />
        <div style={{ marginTop: 26, display: 'grid', gap: 14 }}>
          <div style={{ ...mono(28, C.ink, { fontWeight: 700 }), opacity: after(t, D.log) }}>
            ESP_LOGI → <span style={{ color: C.amber }}>+{FIRST_FREE - FREE} bytes</span> <span style={mono(22, C.muted, { fontWeight: 400 })}>one of the biggest users of stack</span>
          </div>
          <div style={{ ...mono(26, GREEN, { fontWeight: 700 }), opacity: after(t, D.never) }}>never goes back up · the lowest so far</div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 1390, top: 210, ...rise(after(t, D.flash + 0.3, 0.5)) }}>
        <StackColumn
          w={200}
          h={560}
          level={shownFirst ? high : 0.05}
          high={shownFirst ? high : null}
          highP={after(t, D.lineAt[0])}
          ghost={FIRST_USED / STACK}
          ghostP={jump}
          freeP={after(t, D.lineAt[0] + 0.3)}
          title="blink_fast"
          size="2048 bytes"
          notes={[
            { frac: 1 - (1 - high) / 2, text: <>{jump > 0.5 ? FREE : FIRST_FREE}<br />never used</>, color: GREEN, p: after(t, D.lineAt[0] + 0.3), dy: -20 },
            { frac: high, text: `${jump > 0.5 ? USED : FIRST_USED} used`, color: C.amber, p: after(t, D.lineAt[0] + 0.3), side: 'left' },
            { frac: FIRST_USED / STACK, text: 'first reading', color: C.muted, p: jump * after(t, D.before), side: 'left', dy: 10 },
          ]}
        />
      </div>
    </Shell>
  );
};
