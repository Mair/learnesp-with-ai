/**
 * 7 · xSemaphoreGive(total_lock) — just the handle. The key goes back at once (it never
 * waits); a waiting task wakes and gets it (both ends). Only the task that took it may give
 * it back: work_b giving work_a's key → assert failed (real, v6).
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { Explainer, mono } from '../../components/Explainer';
import { C } from '../../theme/palette';
import { after, Chip, GREEN, Key, LogPanel, RED } from './parts';
import { FPS, GIVE as S, GIVE_CALL, LOG_ASSERT, sceneDur, WORKER_COLOR } from './timeline';

const A_X = 60;
const B_X = 1264;

const BackView: React.FC<{ t: number }> = ({ t }) => {
  const gave = S.views.back + 0.6;
  const u = after(t, S.wakes, 0.5);
  const back = after(t, gave, 0.4);
  const keyX = t < S.wakes ? A_X + 110 + (772 - A_X - 110) * back : 772 + (B_X + 110 - 772) * u;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', left: A_X, top: 60 }}>
        <Chip name="work_a" color={WORKER_COLOR.work_a} glow={1 - back} note={back > 0.5 ? 'gave it back · carries on' : 'xSemaphoreGive(total_lock)'} />
      </div>
      <div style={{ position: 'absolute', left: B_X, top: 60 }}>
        <Chip name="work_b" color={WORKER_COLOR.work_b} sleep={1 - u} glow={u} note={u > 0.5 ? 'woke up · has the key' : 'waiting for the key'} />
      </div>
      <div style={{ position: 'absolute', left: keyX - 50, top: 190 }}>
        <Key size={100} glow={1} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 340, textAlign: 'center', ...mono(30, C.ink, { fontWeight: 700 }), opacity: after(t, S.never) }}>
        back at once · <span style={{ color: GREEN }}>it never waits</span>
      </div>
    </div>
  );
};

const OwnerView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0 }}>
    <div style={{ position: 'absolute', left: A_X, top: 40 }}>
      <Chip name="work_a" color={WORKER_COLOR.work_a} glow={1} note="took the key" />
    </div>
    <div style={{ position: 'absolute', left: A_X + 250, top: 60 }}>
      <Key size={90} glow={1} />
    </div>
    <div style={{ position: 'absolute', left: B_X, top: 40, opacity: after(t, S.holds - 0.8) }}>
      <Chip name="work_b" color={WORKER_COLOR.work_b} note={<span style={{ color: RED }}>xSemaphoreGive(total_lock) ✗</span>} />
    </div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 165, textAlign: 'center', ...mono(28, C.ink, { fontWeight: 700 }) }}>only the task that took it may give it back</div>
    <div style={{ position: 'absolute', left: 40, right: 40, top: 230, opacity: after(t, S.stops - 0.3) }}>
      <LogPanel t={t} rows={4} size={19} cps={600} label="recorded in QEMU (ESP32 emulator)" lines={LOG_ASSERT.map((l, i) => ({ at: S.stops + i * 0.35, text: l, color: l.startsWith('assert') ? RED : l.startsWith('Reb') ? C.muted : '#cfd6ff' }))} />
    </div>
  </div>
);

export const Give: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const V = S.views;
  return (
    <Explainer
      t={t}
      frames={Math.round(sceneDur('give') * FPS)}
      kicker="Hand the key back · xSemaphoreGive()"
      code={GIVE_CALL}
      run={S.run}
      args={[{ token: 'total_lock', at: S.args[0], title: 'which mutex', value: 'total_lock', sub: 'the handle', color: C.cyan }]}
      captions={S.captions}
      views={[
        { at: V.back, component: BackView, active: [0], label: 'the key goes back · both ends', accent: GREEN },
        { at: V.owner, component: OwnerView, active: [], label: 'who may give it', accent: RED },
      ]}
    />
  );
};
