/**
 * 8 · SHORT — every take and give costs a little; a million cost a lot. Do the work outside
 * the lock: count in `mine`, take the key once, `total += mine`, give it back → 2,000,000
 * (real, v5), one take and one give per task. Hold the key for as few lines as you can.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { mono } from '../../components/Explainer';
import { C } from '../../theme/palette';
import { after, CodeSplit, GREEN, LogPanel, RED, Verdict } from './parts';
import { FPS, LOG_SHORT, sceneDur, SHORT as S, shortCode, workCode } from './timeline';

const CostView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', justifyItems: 'center', gap: 26 }}>
    <div style={mono(30, C.ink, { fontWeight: 700 })}>per task, per run:</div>
    <div style={mono(44, RED, { fontWeight: 800 })}>1,000,000 takes</div>
    <div style={mono(44, RED, { fontWeight: 800 })}>1,000,000 gives</div>
    <div style={{ ...mono(24, C.muted), opacity: after(t, S.lot) }}>~23.5 s in QEMU, as you saw</div>
  </div>
);

const ShortView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 30, padding: '0 20px' }}>
    <div style={{ display: 'grid', justifyItems: 'center', gap: 10 }}>
      <div style={mono(26, C.muted)}>takes per task</div>
      <div style={mono(48, C.ink, { fontWeight: 800 })}>
        <span style={{ color: RED, textDecoration: 'line-through' }}>1,000,000</span> → <span style={{ color: GREEN, opacity: after(t, S.once) }}>1</span>
      </div>
    </div>
    <div style={{ opacity: after(t, S.again - 0.2) }}>
      <LogPanel t={t} rows={2} size={20} cps={3000} label="recorded in QEMU (ESP32 emulator)" lines={LOG_SHORT.map((l, i) => ({ at: S.again + i * 0.2, text: l, color: l.endsWith('2000000') ? GREEN : '#cfd6ff' }))} />
    </div>
  </div>
);

const RuleView: React.FC<{ t: number }> = () => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', padding: '0 20px' }}>
    <Verdict ok p={1} size={28}>
      hold the key for as few lines as you can
    </Verdict>
  </div>
);

export const Short: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const changed = t >= S.outside;
  const code = changed ? shortCode : workCode(true);
  const marks = changed
    ? [
        { line: 2, at: S.mine, token: 'int mine = 0;', label: 'your own count', strong: true },
        { line: 4, at: S.mine + 0.3, token: 'mine++;' },
        { line: 6, at: S.once, token: 'xSemaphoreTake', label: 'once', strong: true },
        { line: 7, at: S.add, token: 'total += mine;' },
      ]
    : [
        { line: 3, at: S.cost, token: 'xSemaphoreTake', label: '× 1,000,000' },
        { line: 5, at: S.cost + 0.4, token: 'xSemaphoreGive', label: '× 1,000,000' },
      ];
  return (
    <CodeSplit
      t={t}
      frames={Math.round(sceneDur('short') * FPS)}
      kicker="Keep the locked part short"
      file="main/main.c · work_task"
      code={code}
      codeSize={20}
      marks={marks}
      views={[
        { at: S.cost, component: CostView, label: 'the cost', accent: RED },
        { at: S.once, component: ShortView, label: 'lock once', accent: GREEN },
        { at: S.few, component: RuleView, label: 'the rule', accent: GREEN },
      ]}
      captions={S.captions}
    />
  );
};
