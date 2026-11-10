/**
 * 5 · INHERIT — the two rules of priority inheritance, then uxTaskPriorityGet(NULL) showing
 * it (the real log lines: flag → 1, mutex → 3), then: only a mutex does it.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { mono } from '../../components/Explainer';
import { C, hexA } from '../../theme/palette';
import { after, GREEN, RED, rise, Shell, TaskTag } from './parts';
import { FPS, INHERIT as S, LANE_COLOR, RUN_FLAG, RUN_MUTEX, sceneDur } from './timeline';

const Rule: React.FC<{ n: number; p: number; children: React.ReactNode }> = ({ n, p, children }) => (
  <div style={{ display: 'flex', gap: 22, alignItems: 'center', width: 1500, boxSizing: 'border-box', padding: '18px 26px', borderRadius: 18, border: `1.5px solid ${hexA(C.cyan, 0.45)}`, background: 'rgba(10,4,32,.72)', ...rise(p) }}>
    <div style={{ ...mono(46, C.cyan, { fontWeight: 800 }), width: 56 }}>{n}</div>
    <div style={{ fontSize: 33, color: C.ink, lineHeight: 1.35 }}>{children}</div>
  </div>
);

export const Inherit: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const part2 = after(t, S.get - 0.6);
  const boosted = t >= S.raised && t < S.drops;
  return (
    <Shell frames={Math.round(sceneDur('inherit') * FPS)} kicker="Priority inheritance" captions={S.captions} t={t}>
      <div style={{ position: 'absolute', left: 210, top: 130, display: 'grid', gap: 20, opacity: 1 - part2 }}>
        <Rule n={1} p={after(t, S.rule1 - 0.2)}>
          A <span style={{ color: LANE_COLOR.high, fontWeight: 700 }}>higher</span> task waits for your mutex → <b>you run at its priority</b> until you give it back.
        </Rule>
        <Rule n={2} p={after(t, S.rule2 - 0.2)}>
          You give the mutex back → you drop <b>straight back</b> to your own priority.
        </Rule>
        <div style={{ display: 'flex', gap: 40, alignItems: 'center', justifyContent: 'center', marginTop: 30, opacity: after(t, S.rule1 + 1) }}>
          <TaskTag lane="high" w={240} />
          <div style={mono(26, C.muted)}>waits for the mutex held by</div>
          <TaskTag lane="low" prio={boosted ? 3 : 1} w={240} glow={boosted ? 1 : 0} />
          <div style={{ ...mono(26, boosted ? LANE_COLOR.high : C.muted, { fontWeight: 700 }), width: 220 }}>{boosted ? '→ runs at 3' : t >= S.drops ? '→ back to 1' : ''}</div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 260, top: 130, width: 1400, ...rise(part2), opacity: part2 * (1 - after(t, S.only - 0.4)) }}>
        <div style={{ ...mono(44, C.cyan, { fontWeight: 800 }), textAlign: 'center' }}>uxTaskPriorityGet(NULL)</div>
        <div style={{ fontSize: 30, color: C.ink, textAlign: 'center', marginTop: 10, opacity: after(t, S.null) }}>NULL = me · returns my priority <b>right now</b> (borrowed or not)</div>
        <div style={{ display: 'grid', gap: 18, marginTop: 50 }}>
          {[
            { at: S.flag1 - 0.8, k: 'try 1 · the flag', line: RUN_FLAG.log[4], col: RED },
            { at: S.mutex3 - 0.8, k: 'try 2 · the mutex', line: RUN_MUTEX.log[3], col: GREEN },
          ].map((r) => (
            <div key={r.k} style={{ display: 'grid', gridTemplateColumns: '300px 1fr', alignItems: 'center', ...rise(after(t, r.at)) }}>
              <div style={mono(24, C.muted)}>{r.k}</div>
              <div style={{ ...mono(28, r.col, { fontWeight: 700 }), padding: '10px 18px', borderRadius: 12, background: 'rgba(10,4,32,.8)', border: `1.5px solid ${hexA(r.col, 0.6)}` }}>{r.line}</div>
            </div>
          ))}
          <div style={{ ...mono(18, C.muted), textAlign: 'right', opacity: after(t, S.flag1) }}>recorded in QEMU (ESP32 emulator)</div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 360, top: 170, width: 1200, ...rise(after(t, S.only - 0.2)) }}>
        <div style={{ ...mono(34, C.ink, { fontWeight: 700 }), textAlign: 'center', marginBottom: 30 }}>who lends priorities?</div>
        {[
          { at: S.only + 1.6, k: 'a flag (bool busy)', ok: false },
          { at: S.semaphores, k: 'a semaphore (next video)', ok: false },
          { at: S.only + 0.4, k: 'a mutex', ok: true },
        ]
          .sort((a, b) => a.at - b.at)
          .map((r) => (
            <div key={r.k} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 30px', marginBottom: 14, borderRadius: 14, border: `1.5px solid ${hexA(r.ok ? GREEN : RED, 0.55)}`, background: 'rgba(10,4,32,.72)', ...mono(32, C.ink, { fontWeight: 600 }), ...rise(after(t, r.at)) }}>
              <span>{r.k}</span>
              <span style={{ color: r.ok ? GREEN : RED, fontWeight: 800 }}>{r.ok ? '✓ priority inheritance' : '✗ none'}</span>
            </div>
          ))}
        <div style={{ ...mono(28, C.cyan, { fontWeight: 700 }), textAlign: 'center', marginTop: 26, ...rise(after(t, S.use - 0.2)) }}>different priorities, one shared thing → use a mutex</div>
      </div>
    </Shell>
  );
};
