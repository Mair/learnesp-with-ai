/**
 * 3 · uxTaskGetStackHighWaterMark — opens on blink_task; one log line is added at the end
 * of the loop. Then the Explainer: NULL = this task (like pcTaskGetName); it returns the
 * smallest free stack the task has ever had, in bytes (the unit of the 2048); big = room,
 * near 0 = it nearly ran out.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { CodeLine } from '../../components/CodeLine';
import { ease, Explainer, inOut, mono } from '../../components/Explainer';
import { Panel } from '../../components/Panel';
import { C, FONT, hexA } from '../../theme/palette';
import { after, GREEN, RED, StackColumn } from './parts';
import { blinkCode, FPS, HWM_CALL, LOG_A, LOG_B, MEASURE as S, sceneDur, USED, STACK } from './timeline';

const Intro: React.FC<{ t: number }> = ({ t }) => {
  const cin = ease((t - S.intro.show) / 0.6);
  const out = inOut((t - S.intro.out) / 0.6);
  if (out >= 1) return null;
  const added = t >= S.intro.insert + 0.4;
  const code = blinkCode(added);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 11 }}>
      <div style={{ position: 'absolute', left: 300, top: 150, width: 1320, opacity: cin * (1 - out), transform: `translateY(${(1 - cin) * 24 - out * 120}px)` }}>
        <Panel label="main/main.c · blink_task" accent={C.cyan} right="ESP-IDF">
          <pre style={{ margin: 0, fontFamily: FONT.mono, fontSize: 23, lineHeight: 1.6, color: '#cfd6ff' }}>
            {code.map((l, i) => {
              const isNew = l === LOG_A || l === LOG_B;
              const marks: { token: string; at: number; strong?: boolean; label?: string }[] = l === LOG_B ? [{ token: HWM_CALL, at: S.intro.insert + 0.6, strong: true, label: 'new' }] : l === LOG_A ? [{ token: 'pcTaskGetName(NULL)', at: S.intro.insert + 0.6 }] : [];
              return (
                <div key={i + (added ? 40 : 0)} style={{ minHeight: '1.6em', opacity: isNew ? ease((t - S.intro.insert - 0.4) / 0.4) : 1 - 0.5 * after(t, S.intro.insert + 0.4) }}>
                  <CodeLine text={l} t={t} litAt={isNew ? S.intro.insert + 0.4 : null} live={isNew} marks={marks} row={marks.some((m) => m.label) ? 1 : 0} />
                </div>
              );
            })}
          </pre>
        </Panel>
      </div>
    </AbsoluteFill>
  );
};

const TaskView: React.FC<{ t: number }> = ({ t }) => {
  const row = (call: string, what: string, p: number, from?: string) => (
    <div style={{ display: 'grid', gridTemplateColumns: '760px 60px 1fr', alignItems: 'center', opacity: p, transform: `translateY(${(1 - p) * 16}px)` }}>
      <span style={mono(36, C.ink, { fontWeight: 700 })}>
        {call}(<span style={{ color: C.amber }}>NULL</span>)
      </span>
      <span style={mono(30, C.muted)}>→</span>
      <span style={mono(30, '#fff', { fontWeight: 600 })}>
        {what} {from && <span style={mono(22, C.muted, { fontWeight: 400 })}>{from}</span>}
      </span>
    </div>
  );
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 46, paddingLeft: 60 }}>
      {row('uxTaskGetStackHighWaterMark', "this task's stack", after(t, S.passing))}
      {row('pcTaskGetName', "this task's name", after(t, S.pc), '(the two cores video)')}
      <div style={{ ...mono(24, C.muted), opacity: after(t, S.pc + 0.6) }}>NULL = the task that makes the call</div>
    </div>
  );
};

const RetView: React.FC<{ t: number }> = ({ t }) => {
  const high = USED / STACK;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', left: 440, top: 50 }}>
        <StackColumn
          w={180}
          h={400}
          level={high}
          high={high}
          highP={after(t, S.smallest - 0.4)}
          freeP={after(t, S.smallest)}
          notes={[
            { frac: 1 - (1 - high) / 2, text: <>smallest free, ever<br /><span style={{ color: C.ink, fontWeight: 500 }}>→ what it returns</span></>, color: GREEN, p: after(t, S.smallest), dy: -20 },
            { frac: high, text: 'the most it has ever used', color: C.amber, p: after(t, S.ever), side: 'left' },
          ]}
        />
      </div>
    </div>
  );
};

const UnitView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 40, paddingLeft: 60 }}>
    <div style={{ ...mono(32, '#cfd6ff'), opacity: after(t, S.n2048 - 0.4) }}>
      xTaskCreate(blink_task, "blink_fast", <span style={{ color: C.amber, fontWeight: 800, background: hexA(C.amber, 0.14), borderRadius: 6, padding: '0 6px' }}>2048</span>, &fast, 5, NULL);
      <span style={{ ...mono(26, C.amber, { fontWeight: 700 }), marginLeft: 26 }}>bytes</span>
    </div>
    <div style={{ ...mono(32, '#cfd6ff'), opacity: after(t, S.bytes - 0.2) }}>
      uxTaskGetStackHighWaterMark(NULL) <span style={mono(30, C.muted)}>→</span> <span style={{ ...mono(32, GREEN, { fontWeight: 800 }) }}>bytes</span>
    </div>
    <div style={{ ...mono(24, C.muted), opacity: after(t, S.n2048 + 0.6) }}>the same unit · in ESP-IDF, stack sizes are in bytes (the tasks video)</div>
  </div>
);

const RangeView: React.FC<{ t: number }> = ({ t }) => {
  const W = 1300;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', justifyItems: 'center', gap: 20 }}>
      <div style={{ position: 'relative', width: W, height: 70 }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: 12, background: `linear-gradient(90deg, ${RED}, ${hexA(C.amber, 0.8)} 30%, ${hexA(GREEN, 0.8)} 70%, ${GREEN})`, opacity: 0.85 }} />
        <div style={{ position: 'absolute', left: 0, top: 84, ...mono(30, RED, { fontWeight: 800 }), opacity: after(t, S.zero) }}>0</div>
        <div style={{ position: 'absolute', right: 0, top: 84, ...mono(30, GREEN, { fontWeight: 800 }), opacity: after(t, S.room - 0.5) }}>2048</div>
      </div>
      <div style={{ width: W, display: 'flex', justifyContent: 'space-between', marginTop: 60 }}>
        <span style={{ ...mono(30, RED, { fontWeight: 700 }), opacity: after(t, S.ran) }}>nearly ran out</span>
        <span style={{ ...mono(30, GREEN, { fontWeight: 700 }), opacity: after(t, S.room) }}>lots of room</span>
      </div>
    </div>
  );
};

export const Measure: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const V = S.views;
  return (
    <>
      <Explainer
        t={t}
        frames={Math.round(sceneDur('measure') * FPS)}
        kicker="How much was never used?"
        code={HWM_CALL}
        codeIn={S.intro.out}
        run={S.run}
        args={[{ token: 'NULL', at: S.args[0], title: 'task', value: 'NULL', sub: 'this task', color: C.amber }]}
        captions={S.captions}
        views={[
          { at: V.task, component: TaskView, active: [0], label: 'which task', accent: C.amber },
          { at: V.ret, component: RetView, active: [], label: 'what it returns', accent: GREEN },
          { at: V.unit, component: UnitView, active: [], label: 'the unit', accent: C.cyan },
          { at: V.range, component: RangeView, active: [], label: 'reading the number', accent: GREEN },
        ]}
      />
      <Intro t={t} />
    </>
  );
};
