/**
 * 5 · xSemaphoreCreateMutex() — no arguments; one key, and it starts free (the first task to
 * ask gets it); returns the handle both tasks use (NULL if the heap is too full); from
 * freertos/semphr.h (a mutex is one kind of semaphore); like a queue, make it before the
 * tasks that use it.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { Explainer, mono } from '../../components/Explainer';
import { C, hexA } from '../../theme/palette';
import { after, Chip, GREEN, Key, RED, Verdict } from './parts';
import { CREATE as S, CREATE_CALL, FPS, mainCode, sceneDur, WORKER_COLOR } from './timeline';

const KeyView: React.FC<{ t: number }> = ({ t }) => {
  const u = after(t, S.first + 0.2, 0.6);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', left: 40, top: 60 }}>
        <Chip name="work_a" color={WORKER_COLOR.work_a} glow={u} note={u > 0.5 ? 'asked first: it has the key' : undefined} />
      </div>
      <div style={{ position: 'absolute', right: 40, top: 60 }}>
        <Chip name="work_b" color={WORKER_COLOR.work_b} />
      </div>
      <div style={{ position: 'absolute', left: 772 - 60 + (300 - 772 + 60) * u, top: 90 + (190 - 90) * u }}>
        <Key size={120} glow={1} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 260, textAlign: 'center', ...mono(34, C.cyan, { fontWeight: 700 }), opacity: after(t, S.free) }}>one key · it starts <span style={{ color: GREEN }}>free</span></div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', ...mono(24, C.muted), opacity: after(t, S.first) }}>the first task to ask gets it</div>
    </div>
  );
};

const HandleView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0 }}>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 30, textAlign: 'center', ...mono(34, C.ink, { fontWeight: 700 }) }}>
      returns a <span style={{ color: C.cyan }}>SemaphoreHandle_t</span> → <span style={{ color: C.amber }}>total_lock</span>
    </div>
    <div style={{ position: 'absolute', left: 120, top: 140, opacity: after(t, S.both) }}>
      <Chip name="work_a" color={WORKER_COLOR.work_a} note="xSemaphoreTake(total_lock, …)" />
    </div>
    <div style={{ position: 'absolute', right: 120, top: 140, opacity: after(t, S.both) }}>
      <Chip name="work_b" color={WORKER_COLOR.work_b} note="xSemaphoreTake(total_lock, …)" />
    </div>
    <div style={{ position: 'absolute', left: 772 - 50, top: 150, opacity: after(t, S.both) }}>
      <Key size={100} />
    </div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', ...mono(28, RED, { fontWeight: 700 }), opacity: after(t, S.null) }}>
      heap too full → <span style={{ background: hexA(RED, 0.12), padding: '0 8px', borderRadius: 6 }}>NULL</span>
    </div>
  </div>
);

const HeaderView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', justifyItems: 'center', alignContent: 'center', gap: 22 }}>
    <div style={mono(42, C.cyan, { fontWeight: 700 })}>#include "freertos/semphr.h"</div>
    <div style={{ ...mono(26, C.muted), opacity: after(t, S.views.header + 0.8) }}>semphr = semaphore</div>
    <div style={{ ...mono(28, C.ink, { fontWeight: 600 }), opacity: after(t, S.kind) }}>a mutex is one kind of semaphore</div>
    <div style={{ ...mono(24, C.muted), opacity: after(t, S.later) }}>semaphores: their own video, later in this section</div>
  </div>
);

const OrderView: React.FC<{ t: number }> = ({ t }) => {
  const code = mainCode(true);
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 20, paddingLeft: 140 }}>
      <pre style={{ margin: 0, ...mono(26, '#cfd6ff'), lineHeight: 1.6 }}>
        {code.map((l, i) => (
          <div key={i} style={{ color: i === 2 ? '#fff' : undefined, textShadow: i === 2 ? `0 0 16px ${hexA(C.cyan, 0.7)}` : undefined }}>
            {l}
            {i === 2 && <span style={{ ...mono(22, GREEN, { fontWeight: 700 }) }}>   ← first</span>}
          </div>
        ))}
      </pre>
      <div style={{ opacity: after(t, S.views.order + 0.6), width: 1100 }}>
        <Verdict ok p={1} size={24}>
          like the queue: make it before the tasks that use it
        </Verdict>
      </div>
    </div>
  );
};

export const Create: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const V = S.views;
  return (
    <Explainer
      t={t}
      frames={Math.round(sceneDur('create') * FPS)}
      kicker="Make the key · xSemaphoreCreateMutex()"
      code={CREATE_CALL}
      run={S.run}
      args={[]}
      captions={S.captions}
      views={[
        { at: V.key, component: KeyView, active: [], label: 'what it makes', accent: C.cyan },
        { at: V.handle, component: HandleView, active: [], label: 'what it returns', accent: C.amber },
        { at: V.header, component: HeaderView, active: [], label: 'the header', accent: C.cyan },
        { at: V.order, component: OrderView, active: [], label: 'where it goes', accent: GREEN },
      ]}
    />
  );
};
