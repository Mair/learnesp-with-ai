/**
 * 9 · TRAP — a break inside the locked part: work_a leaves the loop still holding the key and
 * ends; work_b waits forever, silently (real, v3: the log just stops). Fix: give the key back
 * before every way out. A time limit on the take turns the hang into a warning (real, v4).
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { mono } from '../../components/Explainer';
import { C } from '../../theme/palette';
import { after, Chip, CodeSplit, GREEN, Key, LogPanel, RED, Verdict } from './parts';
import { BREAK_GIVE, BREAK_IF, FPS, LOG_TIMEOUT, LOG_TRAP, sceneDur, TAKE_LIMIT_LINE, TRAP as S, trapCode, WORKER_COLOR, workCode } from './timeline';

const BugView: React.FC<{ t: number }> = ({ t }) => {
  const gone = after(t, S.breaks, 0.6);
  const ended = after(t, S.ends, 0.5);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', left: 40, top: 70, opacity: 1 - 0.6 * ended }}>
        <Chip name="work_a" color={WORKER_COLOR.work_a} glow={1 - ended} note={ended > 0.5 ? 'ended · still holding the key' : gone > 0.5 ? 'break!' : 'holds the key'} />
      </div>
      <div style={{ position: 'absolute', left: 460, top: 70 }}>
        <Chip name="work_b" color={WORKER_COLOR.work_b} sleep={1} note="waiting for the key" />
      </div>
      <div style={{ position: 'absolute', left: 100 + 0 * gone, top: 200 + 220 * ended, opacity: 1 - 0.5 * ended }}>
        <Key size={100} glow={1} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 480, textAlign: 'center', ...mono(26, RED, { fontWeight: 700 }), opacity: ended }}>the key is gone with it</div>
    </div>
  );
};

const HangView: React.FC<{ t: number }> = ({ t }) => {
  const t0 = S.views.hang + 0.3;
  const waited = Math.max(0, Math.floor((t - t0 - 0.6) * 4) / 4);
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 24 }}>
      <LogPanel t={t} rows={5} size={18} cps={3000} label="recorded in QEMU · 40 s run" lines={[...LOG_TRAP.map((l, i) => ({ at: t0 + i * 0.3, text: l, color: l.includes('done') ? C.amber : '#cfd6ff' })), { at: S.stops, text: '… (nothing more, ever)', color: C.muted }]} />
      <div style={{ ...mono(23, C.ink, { fontWeight: 700 }), textAlign: 'center', opacity: after(t, S.forever) }}>
        work_b waiting: <span style={{ color: RED, fontVariantNumeric: 'tabular-nums' }}>{waited.toFixed(0).padStart(2, '\u2007')} s</span> · no error, no crash
      </div>
    </div>
  );
};

const FixView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 24 }}>
    <Verdict ok p={after(t, S.fix)} size={26}>
      give the key back before every way out
    </Verdict>
    <div style={{ ...mono(22, C.muted), opacity: after(t, S.every) }}>every break, return and continue between take and give</div>
  </div>
);

const LimitView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 22 }}>
    <pre style={{ margin: 0, ...mono(17, '#cfd6ff'), lineHeight: 1.6 }}>
      {TAKE_LIMIT_LINE.trim()}
      {'\n    ESP_LOGW(TAG, "%s: total_lock not free for 1 s", …);'}
    </pre>
    <div style={{ opacity: after(t, S.warning - 0.3) }}>
      <LogPanel t={t} rows={4} size={17} cps={3000} label="recorded in QEMU · the bug, with a 1 s limit" lines={LOG_TIMEOUT.map((l, i) => ({ at: S.warning + i * 0.4, text: l, color: l.startsWith('W') ? C.amber : '#cfd6ff' }))} />
    </div>
  </div>
);

export const Trap: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const bug = t >= S.add;
  const fixed = t >= S.fix;
  const code = bug ? trapCode(fixed) : workCode(true);
  const ifLine = code.indexOf(BREAK_IF);
  const marks = [
    ...(bug ? [{ line: ifLine, at: S.add, token: 'if (total >= 1500000)', strong: true }, { line: ifLine + (fixed ? 2 : 1), at: S.add + 0.3, token: 'break;', label: fixed ? undefined : 'leaves holding the key' }] : []),
    ...(fixed ? [{ line: code.indexOf(BREAK_GIVE), at: S.fix, token: 'xSemaphoreGive(total_lock);', label: '✓ back first', strong: true }] : []),
  ];
  return (
    <CodeSplit
      t={t}
      frames={Math.round(sceneDur('trap') * FPS)}
      kicker="The mistake · a key that never comes back"
      accent="amber"
      file="main/main.c · work_task"
      code={code}
      codeSize={19}
      marks={marks}
      views={[
        { at: S.views.bug, component: BugView, label: 'a break between take and give', accent: C.amber },
        { at: S.views.hang, component: HangView, label: 'flash it', accent: RED },
        { at: S.views.fix, component: FixView, label: 'the fix', accent: GREEN },
        { at: S.views.limit, component: LimitView, label: 'make it show', accent: C.amber },
      ]}
      captions={S.captions}
    />
  );
};
