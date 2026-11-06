/**
 * 8 · TRAP — the queue created after the tasks: led_task (5 > app_main's 1) runs at once
 * and calls xQueueReceive with press_queue still NULL → assert failed (real, v3), restart,
 * forever. Fix: create the queue first.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { mono } from '../../components/Explainer';
import { C } from '../../theme/palette';
import { after, CodeSplit, GREEN, LogPanel, RED, Verdict } from './parts';
import { CREATE_LINE, FPS, GLOBAL_LINE, LOG_TRAP, mainCode, RECV_LINE, sceneDur, TRAP as S } from './timeline';

const OrderView: React.FC<{ t: number }> = ({ t }) => {
  const rows: { at: number; text: React.ReactNode; color?: string }[] = [
    { at: S.move, text: '1  xTaskCreate(button_task, …)' },
    { at: S.higher, text: <>2  xTaskCreate(led_task, …) → <span style={{ color: C.amber }}>5 &gt; 1</span>: led runs now</> },
    { at: S.calls, text: <>3  xQueueReceive(press_queue, …)</> },
    { at: S.null, text: <>   press_queue is still <span style={{ color: RED, fontWeight: 800 }}>NULL</span> ✗</> },
    { at: S.null + 0.6, text: <>4  press_queue = xQueueCreate(…) <span style={{ color: C.muted }}>— too late</span></>, color: C.muted },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 26, paddingLeft: 20 }}>
      <div style={mono(20, C.muted)}>what runs, in order</div>
      {rows.map((r, i) => (
        <div key={i} style={{ ...mono(25, r.color ?? C.ink, { fontWeight: 600 }), opacity: after(t, r.at), whiteSpace: 'pre' }}>
          {r.text}
        </div>
      ))}
    </div>
  );
};

const CrashView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center' }}>
    <LogPanel t={t} rows={9} size={18} cps={600} label="recorded in QEMU" lines={LOG_TRAP.map((l, i) => ({ at: S.views.crash + 0.3 + i * 0.5, text: l, color: l.startsWith('assert') ? RED : l.startsWith('Reb') ? C.muted : '#cfd6ff' }))} />
    <div style={{ ...mono(24, RED, { fontWeight: 700 }), marginTop: 20, opacity: after(t, S.again) }}>restart → the same assert → forever</div>
  </div>
);

const FixView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 24 }}>
    <Verdict ok p={after(t, S.fix)} size={26}>
      create the queue first, then the tasks that use it
    </Verdict>
    <div style={{ ...mono(22, C.muted), opacity: after(t, S.fix + 0.8) }}>Espressif's GPIO example does it in this order</div>
  </div>
);

export const Trap: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const late = t >= S.move && t < S.fix;
  const recvShort = RECV_LINE.split('   //')[0];
  const code = [GLOBAL_LINE, '', 'static void led_task(void *arg)', '{', '    …', '    while (1) {', recvShort, '        …', '}', '', ...mainCode(late)];
  const create = code.indexOf(CREATE_LINE);
  const recv = code.indexOf(recvShort);
  const marks = [
    ...(late ? [{ line: create, at: S.move, token: 'xQueueCreate(5, sizeof(int))', strong: true, label: 'after the tasks' }] : []),
    ...(t >= S.calls && late ? [{ line: recv, at: S.calls, token: 'press_queue', label: 'still NULL' }] : []),
    ...(t >= S.fix ? [{ line: create, at: S.fix, token: 'xQueueCreate(5, sizeof(int))', label: '✓ first' }] : []),
  ];
  const V = S.views;
  return (
    <CodeSplit
      t={t}
      frames={Math.round(sceneDur('trap') * FPS)}
      kicker="The mistake · a queue that isn't there yet"
      accent="amber"
      file="main/main.c"
      code={code}
      codeSize={17}
      marks={marks}
      views={[
        { at: V.order, component: OrderView, label: 'the queue made after the tasks', accent: C.amber, lines: [create] },
        { at: V.crash, component: CrashView, label: 'flash it', accent: RED },
        { at: V.fix, component: FixView, label: 'the fix', accent: GREEN },
      ]}
      captions={S.captions}
    />
  );
};
