/**
 * 7 · THE PRICE — core 1 close up: the two workers take turns, 10 ms each; each gets about
 * half as much CPU time; core 0 sits almost empty; a pinned task never moves, not even to
 * a free core. Pin only with a reason: here the better fix was priority 4, not pinned.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { mono } from '../../components/Explainer';
import { C, hexA } from '../../theme/palette';
import { after, Chip, CodeViews, CoreLanes, CV_VIEW_W as VW, GREEN, Pill, RED, Verdict, WORKER_COLOR } from './parts';
import { simulate, Worker } from './sim';
import { simFree6 } from './Problem';
import { FPS, mainFree, mainPinned, PRICE as S, RUN_MS, sceneDur, WORKER_LINES } from './timeline';
import { simPinned } from './Which';

export const simFree4 = () => simulate('free-4', { until: RUN_MS, workPrio: 4, workCore: null });

/** seconds of CPU per 10 s of clock */
const per10 = (ms: number) => (ms * 10) / RUN_MS;

const Legend: React.FC = () => (
  <div style={{ display: 'flex', gap: 26, ...mono(20, C.ink) }}>
    {(['work_a', 'work_b'] as Worker[]).map((k) => (
      <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 22, height: 16, borderRadius: 4, background: hexA(WORKER_COLOR[k], 0.5), border: `1.5px solid ${WORKER_COLOR[k]}` }} />
        {k}
      </span>
    ))}
  </div>
);

const ZoomView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 26 }}>
    <CoreLanes sim={simPinned()} W={VW} s0={1200} s1={1400} now={1200 + 200 * after(t, S.views.zoom + 0.3, 1.2)} show={['core1']} labels={false} />
    <Legend />
    <div style={{ display: 'flex', gap: 16, opacity: after(t, S.turns) }}>
      <Pill color={C.amber} size={22}>
        same priority → turns
      </Pill>
      <div style={{ opacity: after(t, S.tick) }}>
        <Pill color={C.cyan} size={22}>
          1 tick = 10 ms each
        </Pill>
      </div>
    </div>
  </div>
);

const HalfView: React.FC<{ t: number }> = ({ t }) => {
  const before = simFree6().cpu;
  const now = simPinned().cpu;
  const MAXW = 440;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 34 }}>
      <div style={mono(22, C.muted)}>CPU time each worker gets, per 10 s</div>
      {(['work_a', 'work_b'] as Worker[]).map((k) => {
        const a = per10(before[k]);
        const b = per10(now[k]);
        return (
          <div key={k} style={{ display: 'grid', gap: 8 }}>
            <div style={mono(24, WORKER_COLOR[k], { fontWeight: 700 })}>{k}</div>
            {[
              { v: a, label: 'not pinned', col: C.muted, p: 1 },
              { v: b, label: 'pinned to core 1', col: WORKER_COLOR[k], p: after(t, S.half - 0.3, 0.8) },
            ].map((r) => (
              <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: (MAXW * r.v * r.p) / 10, height: 26, borderRadius: 6, background: hexA(r.col, 0.45), border: `1.5px solid ${r.col}` }} />
                <span style={mono(20, C.ink)}>
                  {r.v.toFixed(1)} s <span style={{ color: C.muted }}>· {r.label}</span>
                </span>
              </div>
            ))}
          </div>
        );
      })}
      <div style={{ ...mono(30, C.amber, { fontWeight: 800 }), opacity: after(t, S.half) }}>about ½</div>
    </div>
  );
};

const EmptyView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 22 }}>
    <CoreLanes sim={simPinned()} W={VW} s0={2000} s1={4000} now={2000 + 2000 * after(t, S.views.empty, 1.2)} show={['core0', 'core1']} labels={false} />
    <Legend />
    <div style={{ opacity: after(t, S.empty) }}>
      <Pill color={RED} size={22}>
        core 0: only the LED blips
      </Pill>
    </div>
  </div>
);

const NeverView: React.FC<{ t: number }> = ({ t }) => {
  // work_b, waiting for its turn, leans toward the empty core 0 and is held back
  const u = ((t - S.moves) % 1.6) / 1.6;
  const lean = t < S.moves ? 0 : u < 0.4 ? after(u, 0, 0.4) : 1 - after(u, 0.4, 0.5);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {[0, 1].map((c) => (
        <div key={c} style={{ position: 'absolute', left: 20 + c * 350, top: 60, width: 320, height: 360, borderRadius: 18, border: `2px dashed ${hexA(GREEN, 0.5)}`, background: hexA(GREEN, 0.04) }}>
          <div style={{ position: 'absolute', top: 10, left: 0, right: 0, textAlign: 'center', ...mono(26, GREEN, { fontWeight: 800 }) }}>core {c}</div>
          {c === 0 && <div style={{ position: 'absolute', top: 160, left: 0, right: 0, textAlign: 'center', ...mono(24, C.muted) }}>free</div>}
        </div>
      ))}
      <div style={{ position: 'absolute', left: 400, top: 130 }}>
        <Chip name="work_a" prio={6} w={260} h={74} pin={1} note="running" />
      </div>
      <div style={{ position: 'absolute', left: 400 - lean * 36, top: 290 }}>
        <Chip name="work_b" prio={6} w={260} h={74} pin={1} note="waiting for its turn" />
      </div>
      <div style={{ position: 'absolute', left: 296, top: 292, ...mono(56, RED, { fontWeight: 800 }), opacity: lean > 0.8 ? 1 : 0 }}>✗</div>
      <div style={{ position: 'absolute', left: 20, top: 470, opacity: after(t, S.free) }}>
        <Verdict ok={false} p={after(t, S.free)} size={24}>
          pinned → never moves, not even to a free core
        </Verdict>
      </div>
      <div style={{ position: 'absolute', left: 20, top: 570, opacity: after(t, S.reason) }}>
        <Pill color={C.amber} size={24}>
          pin only when you have a reason
        </Pill>
      </div>
    </div>
  );
};

const FixView: React.FC<{ t: number }> = ({ t }) => {
  const ms = 1000 + Math.max(0, t - S.better) * 1000;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 22 }}>
      <CoreLanes sim={simFree4()} W={VW} s0={ms - 2500} s1={ms} now={ms} show={['core0', 'core1', 'fast']} labels={false} />
      <Legend />
      <div style={{ opacity: after(t, S.beat) }}>
        <Verdict ok p={after(t, S.beat)} size={24}>
          LEDs on the beat · workers on both cores
        </Verdict>
      </div>
    </div>
  );
};

export const Price: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const V = S.views;
  const fixed = t >= S.better;
  const code = fixed ? mainFree(4) : mainPinned(1);
  const marks = fixed
    ? WORKER_LINES.flatMap((line, i) => [
        { line, at: S.four, token: '4', strong: true, label: i === 0 ? 'priority 4' : undefined },
        { line, at: S.noPin, token: 'xTaskCreate', label: i === 1 ? 'not pinned' : undefined },
      ])
    : WORKER_LINES.flatMap((line, i) => [{ line, at: 0.4, token: '1' }, { line, at: 0.4, token: 'xTaskCreatePinnedToCore', label: i === 0 ? 'both pinned to core 1' : undefined }]);
  return (
    <CodeViews
      t={t}
      frames={Math.round(sceneDur('price') * FPS)}
      kicker="The price"
      accent="magenta"
      file="main/main.c · app_main"
      code={code}
      codeSize={17}
      marks={marks}
      views={[
        { at: V.zoom, component: ZoomView, label: 'core 1, close up', accent: C.amber, right: () => 'ms · worked out from the rules' },
        { at: V.half, component: HalfView, label: 'what each worker gets', accent: C.amber, right: () => 'worked out from the rules' },
        { at: V.empty, component: EmptyView, label: 'both cores, 2 seconds', accent: RED },
        { at: V.never, component: NeverView, label: 'a pinned task never moves', accent: RED },
        { at: V.fix, component: FixView, label: 'priority 4, not pinned', accent: GREEN, right: () => 'real time · worked out from the rules' },
      ]}
      captions={S.captions}
    />
  );
};
