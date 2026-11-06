/**
 * 5 · xQueueReceive(press_queue, &press, portMAX_DELAY) — the handle; where to copy the item
 * (press); ticks to wait if empty: portMAX_DELAY = forever, asleep, no CPU. pdTRUE = got one;
 * with a time limit, pdFALSE = nothing came (real, v4).
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { Explainer, mono } from '../../components/Explainer';
import { C, hexA } from '../../theme/palette';
import { after, Chip, GREEN, LogPanel, QueueRow, rowWidth, Verdict } from './parts';
import { Intro } from './Intro';
import { FPS, ledCode, LOG_TIMEOUT, RECV as S, RECV_CALL, RECV_LINE, sceneDur } from './timeline';

const W = rowWidth(5);

const IntoView: React.FC<{ t: number }> = ({ t }) => {
  const out = S.oldest + 0.3;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', left: 60, top: 130 }}>
        <QueueRow t={t} items={[{ label: '3', in: S.views.into - 1 }, { label: '4', in: S.views.into - 0.9 }].map((i, k) => ({ ...i, out: k === 0 ? out : undefined }))} endsP={1} />
      </div>
      <div style={{ position: 'absolute', left: 60 + W + 110, top: 120, display: 'grid', gap: 10, justifyItems: 'center' }}>
        <div style={mono(24, C.muted)}>int press</div>
        <div style={{ width: 130, height: 110, borderRadius: 14, border: `2.5px solid ${hexA(C.amber, 0.8)}`, display: 'grid', placeItems: 'center', ...mono(56, C.amber, { fontWeight: 800 }) }}>{t >= out + 0.4 ? 3 : ''}</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', ...mono(28, C.ink, { fontWeight: 700 }), opacity: after(t, S.takes) }}>
        the oldest → press · <span style={{ color: GREEN }}>and it leaves the queue</span>
      </div>
    </div>
  );
};

const WaitView: React.FC<{ t: number }> = ({ t }) => {
  const arrive = S.arrives;
  const asleep = t >= S.sleeps && t < arrive + 0.1 ? 1 : 0;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', left: 60, top: 110 }}>
        <QueueRow t={t} items={[{ label: '5', in: arrive - 0.45, out: arrive + 0.1 }]} />
      </div>
      <div style={{ position: 'absolute', left: 60 + W + 120, top: 120 }}>
        <Chip name="led" sleep={asleep * after(t, S.sleeps)} glow={t >= arrive + 0.1 && t < arrive + 1 ? 1 : 0} note={t >= arrive + 0.1 ? 'awake: got press 5' : t >= S.sleeps ? 'no CPU while it waits' : undefined} />
      </div>
      <div style={{ position: 'absolute', left: 60, top: 330, ...mono(30, C.ink, { fontWeight: 700 }), opacity: after(t, S.forever) }}>
        <span style={{ color: C.magenta }}>portMAX_DELAY</span> = wait forever
      </div>
      <div style={{ position: 'absolute', left: 60, top: 390, ...mono(22, C.muted), opacity: after(t, S.forever + 0.5) }}>blocked, like vTaskDelay · woken by the next item</div>
    </div>
  );
};

const ReturnView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 18, padding: '0 40px' }}>
    <Verdict ok p={after(t, S.pdtrue)} size={24}>
      <span style={{ fontFamily: 'monospace' }}>pdTRUE</span> → press holds an item
    </Verdict>
    <div style={{ ...mono(21, '#cfd6ff'), opacity: after(t, S.limit), whiteSpace: 'pre' }}>
      if (xQueueReceive(press_queue, &press, <span style={{ color: C.magenta, fontWeight: 700 }}>pdMS_TO_TICKS(2000)</span>) != pdTRUE) {'{'} …
    </div>
    <div style={{ opacity: after(t, S.pdfalse) }}>
      <LogPanel t={t} rows={4} size={19} label="recorded in QEMU · a 2 s limit" lines={LOG_TIMEOUT.map((l, i) => ({ at: S.pdfalse + i * 0.3, text: l, color: l.includes('no press') ? C.magenta : '#cfd6ff' }))} />
    </div>
  </div>
);

export const Receive: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const V = S.views;
  return (
    <>
      <Explainer
        t={t}
        frames={Math.round(sceneDur('receive') * FPS)}
        kicker="Take a press out · xQueueReceive()"
        code={RECV_CALL}
        codeIn={S.intro.out}
        codeSize={44}
        run={S.run}
        args={[
          { token: 'press_queue', at: S.args[0], title: 'queue', value: 'press_queue', sub: 'the handle', color: C.cyan },
          { token: '&press', at: S.args[1], title: 'into', value: '&press', sub: 'where the copy goes', color: C.amber },
          { token: 'portMAX_DELAY', at: S.args[2], title: 'wait if empty', value: 'forever', sub: 'portMAX_DELAY', color: C.magenta },
        ]}
        captions={S.captions}
        views={[
          { at: V.into, component: IntoView, active: [1], label: 'the oldest item, copied into press', accent: C.amber },
          { at: V.wait, component: WaitView, active: [2], label: 'when the queue is empty', accent: C.magenta },
          { at: V.ret, component: ReturnView, active: [], label: 'the return value', accent: GREEN },
        ]}
      />
      <Intro t={t} show={S.intro.show} out={S.intro.out} label="main/main.c · led_task" code={ledCode} lit={[ledCode.indexOf(RECV_LINE)]} size={24} top={170} />
    </>
  );
};
