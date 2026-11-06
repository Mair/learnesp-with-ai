/**
 * 6 · THE STACK TRAP — size it from the first reading: 2048 − 1556 ≈ 500 used, + a margin
 * → 768. The first line says 272 bytes never used… and that log line overflows the stack
 * (real, v4). The number only counts code that has run so far: read it after the task
 * has done everything it ever does.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { mono } from '../../components/Explainer';
import { C } from '../../theme/palette';
import { after, CodeSplit, GREEN, inOutLocal, LogPanel, logColor, RED, StackColumn, Verdict } from './parts';
import { BLINK_STACK_LINES, blinkCode, FIRST_FREE, FPS, LOG_768, LOG_B, mainCode, sceneDur, STACK, TOO_SMALL, TOO_SMALL_FREE, TRAP as S, USED } from './timeline';

const SumView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 34, paddingLeft: 30 }}>
    <div style={{ ...mono(28, C.muted), opacity: after(t, S.first) }}>
      the first reading: <span style={{ color: C.amber, fontWeight: 800 }}>{FIRST_FREE}</span> never used
    </div>
    <div style={{ ...mono(44, C.ink, { fontWeight: 700 }), opacity: after(t, S.minus) }}>
      {STACK} − {FIRST_FREE} <span style={{ opacity: after(t, S.about) }}>≈ 500 used</span>
    </div>
    <div style={{ ...mono(44, C.ink, { fontWeight: 700 }), opacity: after(t, S.plus) }}>
      + a margin → <span style={{ color: C.amber, fontWeight: 800, opacity: after(t, S.n768) }}>{TOO_SMALL}</span>
    </div>
  </div>
);

const RunView: React.FC<{ t: number }> = ({ t }) => {
  const flood = inOutLocal((t - (S.past - 0.2)) / 0.9);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0 }}>
        <LogPanel
          t={t}
          rows={4}
          size={16}
          label={`recorded in QEMU · stack ${TOO_SMALL}`}
          lines={[
            { at: S.line272, text: LOG_768[0].text, color: C.amber, tag: '✓ ?', tagColor: GREEN, tagAt: S.fine },
            { at: S.overflow - 0.2, text: LOG_768[1].text, color: logColor(LOG_768[1]) },
            { at: S.restarts - 0.3, text: LOG_768[2].text, color: C.muted },
            { at: S.restarts, text: LOG_768[3].text, color: C.muted },
          ]}
        />
      </div>
      <div style={{ position: 'absolute', left: 420, top: 330 }}>
        <StackColumn
          w={130}
          h={260}
          level={(USED / TOO_SMALL) * (0.62 + 0.38 * flood) * (t < S.line272 ? 0.4 : 1) * (t >= S.past - 0.2 ? 1 : 0.9)}
          size={`${TOO_SMALL} bytes`}
          notes={[
            { frac: 0.35, text: `${TOO_SMALL_FREE} never used`, color: GREEN, p: after(t, S.line272) * (1 - flood) },
            { frac: 1.12, text: 'past the end!', color: RED, p: flood, side: 'left' },
          ]}
        />
      </div>
    </div>
  );
};

const FixView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 30, padding: '0 20px' }}>
    <Verdict ok={false} p={after(t, S.counts)} size={26}>
      the first reading came before the first log line — it couldn't count it
    </Verdict>
    <Verdict ok p={after(t, S.fix)} size={26}>
      read it after the task has done <b>everything</b> it ever does
    </Verdict>
    <div style={{ ...mono(24, C.muted), opacity: after(t, S.size) }}>then pick the size: most used + a margin</div>
  </div>
);

export const Trap: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const small = t >= S.n768;
  const blink = blinkCode(true);
  const off = blink.length + 1;
  const code = [...blink, '', ...mainCode(small ? TOO_SMALL : STACK)];
  const stackLines = BLINK_STACK_LINES.map((l) => l + off);
  const logAt = blink.indexOf(LOG_B);
  const V = S.views;
  const marks = [
    ...(small ? stackLines.map((line, i) => ({ line, at: S.n768, token: String(TOO_SMALL), strong: true, label: i === 0 ? 'from the first reading' : undefined })) : []),
    ...(t >= S.past ? [{ line: logAt, at: S.past, token: 'uxTaskGetStackHighWaterMark(NULL)', label: 'this log line runs past the end' }] : []),
  ];
  return (
    <CodeSplit
      t={t}
      frames={Math.round(sceneDur('trap') * FPS)}
      kicker="The trap · sizing from the first reading"
      accent="amber"
      file="main/main.c"
      code={code}
      codeSize={17}
      marks={marks}
      views={[
        { at: V.sum, component: SumView, label: 'size it from the first number', accent: C.amber, lines: stackLines },
        { at: V.run, component: RunView, label: 'flash it', accent: RED, lines: [logAt - 1, logAt] },
        { at: V.fix, component: FixView, label: 'the fix', accent: GREEN },
      ]}
      captions={S.captions}
    />
  );
};
