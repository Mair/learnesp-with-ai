/**
 * 5 · xQueueSend(press_queue, &presses, 0) — the handle; a pointer to the item (the queue
 * copies 4 bytes: presses can change, the queue keeps the old value); ticks to wait if full
 * (0 = don't). pdTRUE = in; errQUEUE_FULL = dropped → ESP_LOGW (real warning, v2).
 * Every view shows both ends: the button task putting in, the LED task taking out.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { Explainer, mono } from '../../components/Explainer';
import { C, hexA } from '../../theme/palette';
import { after, Chip, GREEN, LedCard, ledLevel, LogPanel, QueueRow, RED, rowWidth, Verdict } from './parts';
import { FPS, RUN_BURST, sceneDur, SEND as S, SEND_CALL } from './timeline';

const W = rowWidth(5);
const ROW_X = (1544 - W) / 2;

/** both ends of the queue inside a view: the button task left, the LED task right */
const Ends: React.FC<{ t: number; down?: number; ledOn?: number; ledGlow?: number; ledSleep?: number; ledNote?: React.ReactNode }> = ({ down = 0, ledOn = 0, ledGlow = 0, ledSleep = 0, ledNote }) => (
  <>
    <div style={{ position: 'absolute', left: 30, top: 40 }}>
      <Chip name="button" glow={down} />
    </div>
    <div style={{ position: 'absolute', left: 1294, top: 40 }}>
      <Chip name="led" glow={ledGlow} sleep={ledSleep} note={ledNote} />
    </div>
    <div style={{ position: 'absolute', left: 1360, top: 170 }}>
      <LedCard pin={2} on={ledOn} size={70} />
    </div>
  </>
);

const CopyView: React.FC<{ t: number }> = ({ t }) => {
  const changed = t >= S.change;
  const out1 = S.takes;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Ends t={t} down={t >= S.four - 0.3 && t < S.four ? 1 : 0} ledOn={ledLevel(t, [out1 + 0.45])} ledGlow={t >= out1 + 0.45 && t < out1 + 2 ? 1 : 0} />
      <div style={{ position: 'absolute', left: 75, top: 150, display: 'grid', gap: 8, justifyItems: 'center' }}>
        <div style={mono(22, C.muted)}>int presses</div>
        <div style={{ width: 130, height: 100, borderRadius: 14, border: `2.5px solid ${hexA(C.amber, 0.8)}`, display: 'grid', placeItems: 'center', ...mono(54, C.amber, { fontWeight: 800 }) }}>{changed ? 3 : 2}</div>
        <div style={{ ...mono(19, C.muted), opacity: after(t, S.change) }}>the next press: presses++</div>
      </div>
      <div style={{ position: 'absolute', left: 300, top: 196, ...mono(24, C.amber, { fontWeight: 700 }), opacity: after(t, S.four) }}>copy · 4 bytes ↗</div>
      <div style={{ position: 'absolute', left: ROW_X, top: 60 }}>
        <QueueRow t={t} items={[{ label: '1', in: -10, out: out1 }, { label: '2', in: S.four + 0.2 }]} endsP={1} />
      </div>
      <div style={{ position: 'absolute', left: ROW_X + W - 120, top: 200, ...mono(22, C.amber, { fontWeight: 700 }), opacity: after(t, S.meanwhile) }}>the oldest out ↗</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 400, textAlign: 'center', ...mono(28, GREEN, { fontWeight: 700 }), opacity: after(t, S.keeps) * (1 - after(t, S.meanwhile)) }}>the queue keeps the old value: 2</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 400, textAlign: 'center', ...mono(28, C.ink, { fontWeight: 700 }), opacity: after(t, S.meanwhile + 0.2) }}>
        in at the back <span style={{ color: C.muted }}>·</span> <span style={{ color: C.amber }}>out at the front</span>, at the same time
      </div>
    </div>
  );
};

const WaitView: React.FC<{ t: number }> = ({ t }) => {
  const busy = Math.floor((t - S.views.wait) * 2) % 2 === 0 ? 1 : 0;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Ends t={t} down={t >= S.zero - 0.2 && t < S.zero + 0.1 ? 1 : 0} ledOn={busy} ledGlow={1} ledNote="busy blinking" />
      <div style={{ position: 'absolute', left: ROW_X, top: 60 }}>
        <QueueRow t={t} items={['3', '4', '5', '6', '7'].map((l, i) => ({ label: l, in: S.views.wait + 0.1 * i }))} drops={[{ label: '8', at: S.zero }]} full={after(t, S.full)} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', ...mono(30, C.ink, { fontWeight: 700 }), opacity: after(t, S.zero) }}>
        full + wait <span style={{ color: C.amber }}>0</span> ticks → return at once
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 390, textAlign: 'center', ...mono(22, C.muted), opacity: after(t, S.zero + 0.6) }}>more ticks → the button task would wait for a free box</div>
    </div>
  );
};

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
      <Explainer
        t={t}
        frames={Math.round(sceneDur('send') * FPS)}
        kicker="Put a press in · xQueueSend()"
        code={SEND_CALL}
        codeSize={46}
        run={S.run}
        args={[
          { token: 'press_queue', at: S.args[0], title: 'queue', value: 'press_queue', sub: 'the handle', color: C.cyan },
          { token: '&presses', at: S.args[1], title: 'item', value: '&presses', sub: 'copied: 4 bytes', color: C.amber },
          { token: '0', at: S.args[2], title: 'wait if full', value: '0 ticks', sub: "don't wait", color: C.magenta },
        ]}
        captions={S.captions}
        views={[
          { at: V.copy, component: CopyView, active: [1], label: 'a copy goes in · both ends', accent: C.amber },
          { at: V.wait, component: WaitView, active: [2], label: 'when the queue is full', accent: C.magenta },
          { at: V.ret, component: ReturnView, active: [], label: 'the return value', accent: GREEN, right: () => <span style={{ color: RED }}>not an esp_err_t</span> },
        ]}
      />
  );
};
