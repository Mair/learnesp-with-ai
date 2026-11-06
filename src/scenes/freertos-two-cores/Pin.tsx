/**
 * 4 · xTaskCreatePinnedToCore — opens on app_main; the two worker lines change on screen
 * (xTaskCreate → xTaskCreatePinnedToCore, `, 1` added). Then the Explainer: the same six
 * arguments + the core: 0 / 1 / tskNO_AFFINITY (= xTaskCreate); any other number →
 * assert failed; returns pdPASS.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { CodeLine } from '../../components/CodeLine';
import { ease, Explainer, inOut, mono } from '../../components/Explainer';
import { Panel } from '../../components/Panel';
import { C, FONT, hexA } from '../../theme/palette';
import { after, Chip, GREEN, RED, SerialLog, Verdict } from './parts';
import { FPS, mainFree, mainPinned, PIN as S, PIN_CALL, sceneDur, SIX_ARGS, WORKER_LINES } from './timeline';

const Intro: React.FC<{ t: number }> = ({ t }) => {
  const cin = ease((t - S.intro.show) / 0.6);
  const out = inOut((t - S.intro.out) / 0.6);
  if (out >= 1) return null;
  const changed = t >= S.intro.change + 0.5;
  const code = changed ? mainPinned(1) : mainFree(6);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 11 }}>
      <div style={{ position: 'absolute', left: 260, top: 230, width: 1400, height: 420, opacity: cin * (1 - out), transform: `translateY(${(1 - cin) * 24 - out * 120}px)` }}>
        <Panel label="main/main.c · app_main" accent={C.cyan} right="ESP-IDF">
          <pre style={{ margin: 0, fontFamily: FONT.mono, fontSize: 25, lineHeight: 1.6, color: '#cfd6ff' }}>
            {code.map((l, i) => {
              const worker = WORKER_LINES.includes(i);
              const marks = worker && changed ? [{ token: 'xTaskCreatePinnedToCore', at: S.intro.change + 0.5, label: i === 4 ? 'pinned to core …' : undefined }, { token: '1', at: S.intro.change + 0.9, strong: true }] : [];
              return (
                <div key={i + (changed ? 50 : 0)} style={{ minHeight: '1.6em', opacity: worker ? 1 : 1 - 0.6 * after(t, S.intro.change) }}>
                  <CodeLine text={l} t={t} litAt={worker ? S.intro.change : null} live={worker && t >= S.intro.change} marks={marks} row={marks.some((m) => m.label) ? 1 : 0} />
                </div>
              );
            })}
          </pre>
        </Panel>
      </div>
    </AbsoluteFill>
  );
};

/** the two calls, one above the other: the first six arguments line up */
const SameView: React.FC<{ t: number }> = ({ t }) => {
  const row = (name: string, tail: string, col: string) => (
    <div style={{ ...mono(27, '#cfd6ff'), whiteSpace: 'pre' }}>
      <span style={{ color: col, fontWeight: 700 }}>{name}</span>(<span style={{ background: hexA(GREEN, 0.14 * after(t, S.args[0] + 0.3)), borderRadius: 6 }}>{SIX_ARGS}</span>
      {tail}
    </div>
  );
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', justifyItems: 'start', gap: 22, paddingLeft: 60 }}>
      {row('xTaskCreate            ', ');', C.muted)}
      {row('xTaskCreatePinnedToCore', ', 1);', C.cyan)}
      <div style={{ display: 'flex', gap: 30, marginTop: 20, ...mono(22, C.muted) }}>
        {['the function', 'the name', 'the stack', 'the parameter', 'the priority', 'the handle'].map((x, i) => (
          <span key={x} style={{ opacity: after(t, S.args[0] + 0.5 + 0.15 * i) }}>{x}</span>
        ))}
      </div>
      <div style={{ ...mono(24, GREEN, { fontWeight: 700 }), opacity: after(t, S.args[0] + 1.6) }}>the same six, in the same order · from the tasks video</div>
    </div>
  );
};

/** 0 / 1 / tskNO_AFFINITY: where the task may run */
const CoreView: React.FC<{ t: number }> = ({ t }) => {
  const rows: { v: string; at: number; where: 0 | 1 | null; note: string }[] = [
    { v: '0', at: S.zero, where: 0, note: 'pinned to core 0' },
    { v: '1', at: S.one, where: 1, note: 'pinned to core 1' },
    { v: 'tskNO_AFFINITY', at: S.either, where: null, note: 'either core' },
  ];
  const BX = 640;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {[0, 1].map((c) => (
        <div key={c} style={{ position: 'absolute', left: BX + c * 400, top: 0, width: 360, height: 380, borderRadius: 18, border: `2px dashed ${hexA(GREEN, 0.5)}`, background: hexA(GREEN, 0.04) }}>
          <div style={{ position: 'absolute', top: 8, left: 0, right: 0, textAlign: 'center', ...mono(24, GREEN, { fontWeight: 800 }) }}>core {c}</div>
        </div>
      ))}
      {rows.map((r, i) => {
        const p = after(t, r.at);
        const y = 60 + i * 110;
        const x = r.where === null ? BX + 380 - 130 : BX + r.where * 400 + 50;
        return (
          <div key={r.v} style={{ opacity: p }}>
            <div style={{ position: 'absolute', left: 30, top: y + 14, width: 560, ...mono(r.v.length > 2 ? 34 : 54, C.amber, { fontWeight: 800 }) }}>
              {r.v} <span style={mono(22, C.muted, { fontWeight: 500 })}>→ {r.note}</span>
            </div>
            <div style={{ position: 'absolute', left: x, top: y, transform: `translateY(${(1 - p) * -20}px)` }}>
              <Chip name="work_a" prio={6} w={260} h={74} pin={r.where === null ? 0 : (t - r.at - 0.3) / 0.5} />
            </div>
            {r.where === null && (
              <div style={{ position: 'absolute', left: x - 50, top: y + 20, width: 360, display: 'flex', justifyContent: 'space-between', ...mono(30, C.cyan, { fontWeight: 800 }), opacity: after(t, r.at + 0.4) }}>
                <span>←</span>
                <span>→</span>
              </div>
            )}
          </div>
        );
      })}
      {t >= S.xtc && (
        <div style={{ position: 'absolute', left: 30, top: 410, opacity: after(t, S.xtc) }}>
          <Verdict ok p={after(t, S.xtc)} size={24}>
            tskNO_AFFINITY = what xTaskCreate does
          </Verdict>
        </div>
      )}
    </div>
  );
};

const WrongView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 28, padding: '0 40px' }}>
    <div style={mono(34, '#cfd6ff')}>
      xTaskCreatePinnedToCore(…, NULL, <span style={{ color: RED, fontWeight: 800, fontSize: 48 }}>2</span>);
      <span style={{ ...mono(24, RED, { fontWeight: 700 }), marginLeft: 30, opacity: after(t, S.mistake) }}>there is no core 2</span>
    </div>
    <div style={{ opacity: after(t, S.stops - 0.3) }}>
      <SerialLog
        t={t}
        size={24}
        label="idf.py monitor"
        lines={[
          { at: S.assert, text: 'assert failed: xTaskCreatePinnedToCore …', color: RED },
          { at: S.assert + 0.9, text: '(the program stops)', color: C.muted },
        ]}
      />
    </div>
    <div style={{ ...mono(22, C.muted), opacity: after(t, S.stops) }}>valid: 0 · 1 · tskNO_AFFINITY</div>
  </div>
);

const RetView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', justifyItems: 'center', gap: 26 }}>
    <div style={mono(40, C.ink, { fontWeight: 700 })}>
      returns <span style={{ color: GREEN }}>pdPASS</span> <span style={mono(28, C.muted)}>when the task is made</span>
    </div>
    <div style={{ ...mono(24, C.muted), opacity: after(t, S.made) }}>the same as xTaskCreate</div>
  </div>
);

export const Pin: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const V = S.views;
  return (
    <>
      <Explainer
        t={t}
        frames={Math.round(sceneDur('pin') * FPS)}
        kicker="Pin a task · xTaskCreatePinnedToCore()"
        code={PIN_CALL}
        codeIn={S.intro.out}
        codeSize={34}
        run={S.run}
        cardW={520}
        cardGap={760}
        args={[
          { token: SIX_ARGS, at: S.args[0], title: 'the first six', value: 'as xTaskCreate', sub: 'same arguments · same order', color: GREEN },
          { token: '1', at: S.args[1], title: 'core', value: '1', sub: '0 · 1 · tskNO_AFFINITY', color: C.amber },
        ]}
        captions={S.captions}
        views={[
          { at: V.same, component: SameView, active: [0], label: 'the same six arguments', accent: GREEN },
          { at: V.core, component: CoreView, active: [1], label: 'the core', accent: C.amber },
          { at: V.wrong, component: WrongView, active: [1], label: 'any other number', accent: RED, right: () => 'configASSERT' },
          { at: V.ret, component: RetView, active: [], label: 'the return value', accent: GREEN },
        ]}
      />
      <Intro t={t} />
    </>
  );
};

