/**
 * 4 · xTaskGetTickCount — where does the beat start? The tick count = ticks since the
 * program started (1 tick = 10 ms). Store it in last, once, before the loop.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { mono } from '../../components/Explainer';
import { C, hexA } from '../../theme/palette';
import { after, clamp01, CodeViews, CV_VIEW_W as VW, GREEN, Pill } from './parts';
import { FPS, LAST0, sceneDur, TICK as S, UNTIL_CODE } from './timeline';

const LAST_LINE = UNTIL_CODE.findIndex((l) => l.includes('xTaskGetTickCount'));
const LOOP_LINE = UNTIL_CODE.findIndex((l) => l.includes('while (1)'));

/** the tick count shown on screen: runs (slowed) up to LAST0 when it is stored */
const ticksAt = (t: number) => Math.round(LAST0 - 23 + 23 * clamp01((t - S.count) / (S.store - S.count)));

const Ruler: React.FC<{ t: number; flag?: number; flagP?: number }> = ({ t, flag, flagP = 0 }) => {
  const n = ticksAt(t);
  const L = 30;
  const R = VW - 30;
  const t0 = LAST0 - 25;
  const t1 = LAST0 + 15;
  const x = (k: number) => L + ((k - t0) / (t1 - t0)) * (R - L);
  return (
    <svg width={VW} height={170} style={{ display: 'block', overflow: 'visible' }}>
      <line x1={L} y1={90} x2={R} y2={90} stroke={hexA(C.cyan, 0.5)} strokeWidth={2} />
      {Array.from({ length: t1 - t0 + 1 }, (_, i) => t0 + i).map((k) => (
        <g key={k}>
          <line x1={x(k)} y1={k % 5 === 0 ? 74 : 82} x2={x(k)} y2={k % 5 === 0 ? 106 : 98} stroke={k <= n ? C.cyan : hexA(C.cyan, 0.3)} strokeWidth={k % 5 === 0 ? 2.5 : 1.5} />
          {k % 10 === 0 && (
            <text x={x(k)} y={130} textAnchor="middle" style={mono(16, C.muted)}>
              {k}
            </text>
          )}
        </g>
      ))}
      <polygon points={`${x(n) - 9},60 ${x(n) + 9},60 ${x(n)},74`} fill={C.cyan} />
      {flag !== undefined && (
        <g opacity={flagP}>
          <line x1={x(flag)} y1={20} x2={x(flag)} y2={106} stroke={GREEN} strokeWidth={3} />
          <polygon points={`${x(flag)},20 ${x(flag) + 34},30 ${x(flag)},40`} fill={GREEN} />
          <text x={x(flag) + 42} y={36} style={mono(20, GREEN, { fontWeight: 700 })}>
            last = {flag} · beat 0
          </text>
        </g>
      )}
    </svg>
  );
};

const StartView: React.FC<{ t: number }> = () => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', justifyItems: 'center', gap: 30 }}>
    <div style={mono(34, C.ink, { fontWeight: 700 })}>beat 0 = ?</div>
    <div style={{ display: 'flex', gap: 40 }}>
      {['?', '+200', '+400', '+600'].map((k) => (
        <div key={k} style={{ ...mono(28, C.cyan, { fontWeight: 700 }), padding: '10px 18px', borderRadius: 10, border: `1.5px dashed ${hexA(C.cyan, 0.6)}` }}>
          {k}
        </div>
      ))}
    </div>
  </div>
);

const CountView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 26 }}>
    <div style={mono(22, C.muted)}>xTaskGetTickCount() · ticks since the program started</div>
    <div style={{ ...mono(110, C.cyan, { fontWeight: 800 }), fontVariantNumeric: 'tabular-nums' }}>{ticksAt(t)}</div>
    <Ruler t={t} />
    <div style={{ opacity: after(t, S.ms10) }}>
      <Pill color={C.cyan} size={24}>
        1 tick = 10 ms
      </Pill>
    </div>
    <div style={mono(16, C.muted)}>slowed down · the number is an example</div>
  </div>
);

const StoreView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 30 }}>
    <div style={mono(30, '#fff', { fontWeight: 700 })}>
      TickType_t <span style={{ color: GREEN }}>last</span> = xTaskGetTickCount();
    </div>
    <Ruler t={t} flag={LAST0} flagP={after(t, S.store)} />
    <div style={{ opacity: after(t, S.once) }}>
      <Pill color={GREEN} size={24}>
        once · before while (1)
      </Pill>
    </div>
  </div>
);

export const Tick: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const V = S.views;
  return (
    <CodeViews
      t={t}
      frames={Math.round(sceneDur('tick') * FPS)}
      kicker="Where the beat starts · xTaskGetTickCount()"
      file="main/main.c · until_task"
      code={UNTIL_CODE}
      codeSize={19}
      marks={[
        { line: LAST_LINE, at: S.count, token: 'xTaskGetTickCount()', label: 'ticks since start' },
        { line: LAST_LINE, at: S.store, token: 'last', strong: true },
        { line: LOOP_LINE, at: S.before, token: 'while (1)', label: 'the loop starts after it' },
      ]}
      views={[
        { at: V.start, component: StartView, label: 'where does the beat start?', accent: C.cyan, lines: [LAST_LINE] },
        { at: V.count, component: CountView, label: 'the tick count', accent: C.cyan, right: () => 'task.h · xTaskGetTickCount', lines: [LAST_LINE] },
        { at: V.store, component: StoreView, label: 'store it: the first beat', accent: GREEN, lines: [LAST_LINE] },
      ]}
      captions={S.captions}
    />
  );
};
