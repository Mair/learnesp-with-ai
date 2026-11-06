/**
 * 4 · xQueueSend(press_queue, &presses, 0) — the handle; a pointer to the item (the queue
 * copies 4 bytes: presses can change, the queue keeps the old value); ticks to wait if full
 * (0 = don't). pdTRUE = in; errQUEUE_FULL = dropped → ESP_LOGW (real warning, v2).
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { Explainer, mono } from '../../components/Explainer';
import { C, hexA } from '../../theme/palette';
import { after, GREEN, LogPanel, QueueRow, RED, rowWidth, Verdict } from './parts';
import { Intro } from './Intro';
import { buttonCode, FPS, RUN_BURST, sceneDur, SEND as S, SEND_CALL, SEND_IF, SEND_WARN } from './timeline';

const W = rowWidth(5);

const CopyView: React.FC<{ t: number }> = ({ t }) => {
  const changed = t >= S.change;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', left: 60, top: 130, display: 'grid', gap: 10, justifyItems: 'center' }}>
        <div style={mono(24, C.muted)}>int presses</div>
        <div style={{ width: 130, height: 110, borderRadius: 14, border: `2.5px solid ${hexA(C.amber, 0.8)}`, display: 'grid', placeItems: 'center', ...mono(56, C.amber, { fontWeight: 800 }) }}>{changed ? 2 : 1}</div>
        <div style={{ ...mono(20, C.muted), opacity: after(t, S.change) }}>presses++ · the next press</div>
      </div>
      <div style={{ position: 'absolute', left: 330, top: 200, ...mono(26, C.amber, { fontWeight: 700 }), opacity: after(t, S.four) }}>copy · 4 bytes →</div>
      <div style={{ position: 'absolute', left: 1544 - W - 40, top: 130 }}>
        <QueueRow t={t} items={[{ label: '1', in: S.four + 0.2 }]} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', ...mono(28, GREEN, { fontWeight: 700 }), opacity: after(t, S.keeps) }}>the queue keeps the old value: 1</div>
    </div>
  );
};

const WaitView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', justifyItems: 'center', alignContent: 'center', gap: 30 }}>
    <QueueRow t={t} items={['2', '3', '4', '5', '6'].map((l, i) => ({ label: l, in: S.views.wait + 0.1 * i }))} full={after(t, S.full)} />
    <div style={{ ...mono(30, C.ink, { fontWeight: 700 }), opacity: after(t, S.zero) }}>
      full + wait <span style={{ color: C.amber }}>0</span> ticks → return at once
    </div>
    <div style={{ ...mono(22, C.muted), opacity: after(t, S.zero + 0.6) }}>more ticks → the button task would wait for a free box</div>
  </div>
);

const ReturnView: React.FC<{ t: number }> = ({ t }) => {
  const w = RUN_BURST.log.filter((l) => l.warn);
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 22, padding: '0 40px' }}>
      <Verdict ok p={after(t, S.pdtrue)} size={26}>
        <span style={{ fontFamily: 'monospace' }}>pdTRUE</span> → the press went in
      </Verdict>
      <Verdict ok={false} p={after(t, S.errfull)} size={26}>
        <span style={{ fontFamily: 'monospace' }}>errQUEUE_FULL</span> → this press is dropped
      </Verdict>
      <div style={{ opacity: after(t, S.warning - 0.3) }}>
        <LogPanel t={t} rows={1} size={20} label="recorded in QEMU · a burst of presses (later in this video)" lines={[{ at: S.warning, text: w[0].text, color: C.amber }]} />
      </div>
    </div>
  );
};

export const Send: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const V = S.views;
  return (
    <>
      <Explainer
        t={t}
        frames={Math.round(sceneDur('send') * FPS)}
        kicker="Put a press in · xQueueSend()"
        code={SEND_CALL}
        codeIn={S.intro.out}
        codeSize={46}
        run={S.run}
        args={[
          { token: 'press_queue', at: S.args[0], title: 'queue', value: 'press_queue', sub: 'the handle', color: C.cyan },
          { token: '&presses', at: S.args[1], title: 'item', value: '&presses', sub: 'copied: 4 bytes', color: C.amber },
          { token: '0', at: S.args[2], title: 'wait if full', value: '0 ticks', sub: "don't wait", color: C.magenta },
        ]}
        captions={S.captions}
        views={[
          { at: V.copy, component: CopyView, active: [1], label: 'a copy goes in', accent: C.amber },
          { at: V.wait, component: WaitView, active: [2], label: 'when the queue is full', accent: C.magenta },
          { at: V.ret, component: ReturnView, active: [], label: 'the return value', accent: GREEN, right: () => <span style={{ color: RED }}>not an esp_err_t</span> },
        ]}
      />
      <Intro t={t} show={S.intro.show} out={S.intro.out} label="main/main.c · button_task" code={buttonCode} lit={[buttonCode.indexOf(SEND_IF), buttonCode.indexOf(SEND_WARN)]} size={22} top={140} />
    </>
  );
};
