/**
 * 10 · MENUCONFIG — Component config → ESP System Settings: the timeout (5 s, 1–60) and
 * "Invoke panic handler on Task Watchdog timeout" (off: it only prints; on: it restarts —
 * real, vp).
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { mono } from '../../components/Explainer';
import { C } from '../../theme/palette';
import { after, GREEN, LogPanel, logColor, Menuconfig, rise, Shell } from './parts';
import { CONFIG as S, FPS, LOG_PANIC, sceneDur } from './timeline';

export const Config: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const tLit = after(t, S.timeout) * (1 - after(t, S.prints));
  const pLit = after(t, S.prints);
  const on = t >= S.panic + 0.5;
  return (
    <Shell frames={Math.round(sceneDur('config') * FPS)} kicker="Two settings · menuconfig" captions={S.captions} t={t}>
      <div style={{ position: 'absolute', left: 120, top: 150, ...rise(after(t, S.menu, 0.5)) }}>
        <Menuconfig
          w={1180}
          path="Component config  →  ESP System Settings"
          rows={[
            { box: '[*]', text: 'Enable Task Watchdog Timer' },
            { box: '[*]', text: 'Initialize Task Watchdog Timer on startup' },
            { box: on ? '[*]' : '[ ]', text: 'Invoke panic handler on Task Watchdog timeout', lit: pLit, boxColor: on ? GREEN : C.cyan },
            { box: '(5)', text: 'Task Watchdog timeout period (seconds)', lit: tLit, boxColor: C.amber },
            { box: '[*]', text: 'Watch CPU0 Idle Task' },
            { box: '[*]', text: 'Watch CPU1 Idle Task' },
          ]}
        />
      </div>
      <div style={{ position: 'absolute', left: 1360, top: 330, width: 440, display: 'grid', gap: 10, opacity: tLit }}>
        <div style={mono(80, C.amber, { fontWeight: 800 })}>5 s</div>
        <div style={{ ...mono(28, C.ink), opacity: after(t, S.range) }}>anything from 1 to 60</div>
      </div>
      <div style={{ position: 'absolute', left: 1360, top: 280, width: 440, display: 'grid', gap: 14, opacity: pLit }}>
        <div style={mono(26, C.muted)}>off (default) → it prints</div>
        <div style={{ ...mono(28, GREEN, { fontWeight: 700 }), opacity: after(t, S.panic + 0.5) }}>on → it restarts the chip</div>
      </div>
      <div style={{ position: 'absolute', left: 120, width: 1680, top: 700, ...rise(after(t, S.restarts - 0.6)) }}>
        <LogPanel
          t={t}
          rows={4}
          size={18}
          label="recorded in QEMU · panic handler on"
          lines={LOG_PANIC.map((l, i) => ({ at: S.restarts - 0.6 + i * 0.35, text: l.text, color: logColor(l) }))}
        />
      </div>
    </Shell>
  );
};
