/**
 * 6 · xSemaphoreTake(total_lock, portMAX_DELAY) — which mutex; how long to wait. Free → at
 * once, pdTRUE; held by the other task → wait, asleep, no CPU (both ends shown); portMAX_DELAY
 * = forever; with a limit it can return pdFALSE → you don't have the key: don't touch total.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { Explainer, mono } from '../../components/Explainer';
import { C, hexA } from '../../theme/palette';
import { after, Chip, GREEN, Key, RED, Verdict } from './parts';
import { FPS, sceneDur, TAKE as S, TAKE_CALL, WORKER_COLOR } from './timeline';

const A_X = 60;
const B_X = 1264;
const HOME = 772;
/** the key between the two chips: x of its centre */
const KeyOn: React.FC<{ x: number; y?: number; glow?: number }> = ({ x, y = 70, glow = 1 }) => (
  <div style={{ position: 'absolute', left: x - 50, top: y }}>
    <Key size={100} glow={glow} />
  </div>
);
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;

const FreeView: React.FC<{ t: number }> = ({ t }) => {
  const u = after(t, S.once - 0.2, 0.5);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', left: A_X, top: 60 }}>
        <Chip name="work_a" color={WORKER_COLOR.work_a} glow={u} note={u > 0.5 ? 'has the key · goes on at once' : 'xSemaphoreTake(…)'} />
      </div>
      <div style={{ position: 'absolute', left: B_X, top: 60 }}>
        <Chip name="work_b" color={WORKER_COLOR.work_b} note="busy elsewhere" />
      </div>
      <KeyOn x={lerp(HOME, A_X + 110, u)} y={lerp(80, 190, u)} />
      <div style={{ position: 'absolute', left: HOME - 120, width: 240, top: 150, textAlign: 'center', ...mono(22, C.cyan), opacity: 1 - u }}>free</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 360, display: 'grid', justifyItems: 'center', opacity: after(t, S.pdtrue) }}>
        <Verdict ok p={1} size={26}>
          returns <span style={{ fontFamily: 'monospace' }}>pdTRUE</span>: you have the key
        </Verdict>
      </div>
    </div>
  );
};

const HeldView: React.FC<{ t: number }> = ({ t }) => {
  const give = S.forever + 1.6;
  const u = after(t, give, 0.5);
  const asleep = t >= S.asleep - 0.6 && t < give ? 1 : 0;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', left: A_X, top: 60 }}>
        <Chip name="work_a" color={WORKER_COLOR.work_a} glow={1 - u} note={u > 0.5 ? 'gave it back' : 'holds the key'} />
      </div>
      <div style={{ position: 'absolute', left: B_X, top: 60 }}>
        <Chip name="work_b" color={WORKER_COLOR.work_b} sleep={asleep} glow={u} note={u > 0.5 ? 'woke up · has the key' : asleep ? 'waiting · no CPU' : 'xSemaphoreTake(…)'} />
      </div>
      <KeyOn x={lerp(A_X + 110, B_X + 110, u)} y={190} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', ...mono(30, C.ink, { fontWeight: 700 }), opacity: after(t, S.forever) }}>
        <span style={{ color: C.magenta }}>portMAX_DELAY</span> = wait as long as it takes
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 385, textAlign: 'center', ...mono(22, C.muted), opacity: after(t, S.forever + 0.5) }}>asleep, like vTaskDelay · woken when the key comes back</div>
    </div>
  );
};

const LimitView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 22, padding: '0 60px' }}>
    <pre style={{ margin: 0, ...mono(25, '#cfd6ff'), lineHeight: 1.6 }}>
      {'if (xSemaphoreTake(total_lock, '}
      <span style={{ color: C.magenta, fontWeight: 700 }}>pdMS_TO_TICKS(1000)</span>
      {') == pdTRUE) {\n    total++;\n    xSemaphoreGive(total_lock);\n} else {\n'}
      <span style={{ color: RED, opacity: after(t, S.dont), fontWeight: 700 }}>{'    // no key: don’t touch total'}</span>
      {'\n}'}
    </pre>
    <div style={{ ...mono(22, C.muted) }}>pdMS_TO_TICKS(1000) = 100 ticks</div>
    <div style={{ opacity: after(t, S.pdfalse) }}>
      <Verdict ok={false} p={1} size={24}>
        <span style={{ fontFamily: 'monospace' }}>pdFALSE</span>: the time ran out, you don’t have the key
      </Verdict>
    </div>
  </div>
);

export const Take: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const V = S.views;
  return (
    <Explainer
      t={t}
      frames={Math.round(sceneDur('take') * FPS)}
      kicker="Get the key · xSemaphoreTake()"
      code={TAKE_CALL}
      codeSize={46}
      run={S.run}
      args={[
        { token: 'total_lock', at: S.args[0], title: 'which mutex', value: 'total_lock', sub: 'the handle', color: C.cyan },
        { token: 'portMAX_DELAY', at: S.args[1], title: 'wait if taken', value: 'forever', sub: 'portMAX_DELAY', color: C.magenta },
      ]}
      captions={S.captions}
      views={[
        { at: V.free, component: FreeView, active: [0], label: 'the key is free', accent: GREEN },
        { at: V.held, component: HeldView, active: [1], label: 'the other task has it · both ends', accent: C.magenta },
        { at: V.limit, component: LimitView, active: [1], label: 'with a time limit', accent: RED, right: () => <span style={{ color: hexA(C.ink, 0.7) }}>check the return value</span> },
      ]}
    />
  );
};
