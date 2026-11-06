/**
 * 3 · xQueueCreate(5, sizeof(int)) — length 5, item size 4 bytes (sizeof(int)); every item
 * the same size, copied; 5 × 4 = 20 bytes + bookkeeping from the heap, once; returns the
 * handle both tasks use (NULL if the heap is too full); from freertos/queue.h.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { Explainer, mono } from '../../components/Explainer';
import { C, hexA } from '../../theme/palette';
import { after, Chip, GREEN, QueueRow, RED, rowWidth } from './parts';
import { Intro } from './Intro';
import { CREATE as S, CREATE_CALL, CREATE_LINE, FPS, GLOBAL_LINE, headCode, mainCode, sceneDur } from './timeline';

const W = rowWidth(5);

const LengthView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', justifyItems: 'center', alignContent: 'center', gap: 30 }}>
    <QueueRow t={t} items={[]} />
    <div style={{ ...mono(34, C.amber, { fontWeight: 800 }), opacity: after(t, S.five) }}>5 items, at most</div>
  </div>
);

const SizeView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', justifyItems: 'center', alignContent: 'center', gap: 34 }}>
    <QueueRow t={t} items={[]} bytesP={after(t, S.four)} />
    <div style={{ ...mono(34, C.ink, { fontWeight: 700 }), opacity: after(t, S.int) }}>
      sizeof(int) = <span style={{ color: C.amber }}>4</span> bytes
    </div>
    <div style={{ ...mono(24, C.muted), opacity: after(t, S.same) }}>every item the same size · the queue copies 4 bytes each time</div>
  </div>
);

const MemView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', justifyItems: 'center', alignContent: 'center', gap: 30 }}>
    <div style={mono(60, C.ink, { fontWeight: 800 })}>
      <span style={{ opacity: after(t, S.times - 0.4) }}>5 × 4</span> <span style={{ opacity: after(t, S.twenty) }}>= <span style={{ color: C.amber }}>20 bytes</span></span>
    </div>
    <div style={{ ...mono(28, C.muted), opacity: after(t, S.twenty + 0.5) }}>+ a little bookkeeping</div>
    <div style={{ ...mono(28, C.cyan, { fontWeight: 700 }), opacity: after(t, S.heap) }}>from the heap · once, when you create it</div>
  </div>
);

const HandleView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0 }}>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 30, textAlign: 'center', ...mono(34, C.ink, { fontWeight: 700 }) }}>
      returns a <span style={{ color: C.cyan }}>QueueHandle_t</span> → <span style={{ color: C.amber }}>press_queue</span>
    </div>
    <div style={{ position: 'absolute', left: 120, top: 140, opacity: after(t, S.both) }}>
      <Chip name="button" note="xQueueSend(press_queue, …)" />
    </div>
    <div style={{ position: 'absolute', right: 120, top: 140, opacity: after(t, S.both) }}>
      <Chip name="led" note="xQueueReceive(press_queue, …)" />
    </div>
    <div style={{ position: 'absolute', left: (1544 - W * 0.6) / 2, top: 130, transform: 'scale(.6)', transformOrigin: 'top left', opacity: after(t, S.both) }}>
      <QueueRow t={t} items={[]} />
    </div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', ...mono(28, RED, { fontWeight: 700 }), opacity: after(t, S.null) }}>
      heap too full → <span style={{ background: hexA(RED, 0.12), padding: '0 8px', borderRadius: 6 }}>NULL</span>
    </div>
  </div>
);

const IncludeView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', justifyItems: 'center', alignContent: 'center', gap: 20 }}>
    <div style={mono(40, C.cyan, { fontWeight: 700 })}>#include "freertos/queue.h"</div>
    <div style={{ ...mono(24, GREEN), opacity: after(t, S.views.inc + 0.6) }}>xQueueCreate · xQueueSend · xQueueReceive</div>
  </div>
);

export const Create: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const code = [...headCode, ...mainCode()];
  const V = S.views;
  return (
    <>
      <Explainer
        t={t}
        frames={Math.round(sceneDur('create') * FPS)}
        kicker="Make the queue · xQueueCreate()"
        code={CREATE_CALL}
        codeIn={S.intro.out}
        run={S.run}
        args={[
          { token: '5', at: S.args[0], title: 'length', value: '5', sub: 'items it can hold', color: C.amber },
          { token: 'sizeof(int)', at: S.args[1], title: 'item size', value: '4 bytes', sub: 'sizeof(int)', color: C.cyan },
        ]}
        captions={S.captions}
        views={[
          { at: V.length, component: LengthView, active: [0], label: 'the length', accent: C.amber },
          { at: V.size, component: SizeView, active: [1], label: 'the item size', accent: C.cyan },
          { at: V.mem, component: MemView, active: [0, 1], label: 'the memory', accent: C.cyan },
          { at: V.handle, component: HandleView, active: [], label: 'what it returns', accent: C.amber },
          { at: V.inc, component: IncludeView, active: [], label: 'the header', accent: C.cyan },
        ]}
      />
      <Intro t={t} show={S.intro.show} out={S.intro.out} label="main/main.c" code={code} lit={[code.indexOf(GLOBAL_LINE), code.indexOf(CREATE_LINE)]} size={26} top={200} />
    </>
  );
};
