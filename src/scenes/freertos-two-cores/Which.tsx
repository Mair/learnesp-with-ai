/**
 * 5 · WHICH CORE AM I ON? — a log line goes into the worker: esp_cpu_get_core_id() (the
 * core running this line: 0 or 1, from esp_cpu.h) and pcTaskGetName(NULL) (this task's
 * name). Pinned → always core 1; not pinned → core 0 or core 1.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { mono } from '../../components/Explainer';
import { C, hexA } from '../../theme/palette';
import { after, Chip, CodeViews, GREEN, SerialLog } from './parts';
import { simulate } from './sim';
import { simFree6 } from './Problem';
import { FPS, LOG_LINE, RUN_MS, sceneDur, WHICH as S, workCode } from './timeline';

export const simPinned = () => simulate('pin-1', { until: RUN_MS, workPrio: 6, workCore: 1 });

const AskView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0 }}>
    {[0, 1].map((c) => (
      <div key={c} style={{ position: 'absolute', left: 30 + c * 340, top: 60, width: 310, height: 300, borderRadius: 18, border: `2px dashed ${hexA(GREEN, 0.5 + 0.4 * (c === 1 ? after(t, S.running) : 0))}`, background: hexA(GREEN, c === 1 ? 0.04 + 0.06 * after(t, S.running) : 0.04) }}>
        <div style={{ position: 'absolute', top: 10, left: 0, right: 0, textAlign: 'center', ...mono(26, GREEN, { fontWeight: 800 }) }}>core {c}</div>
      </div>
    ))}
    <div style={{ position: 'absolute', left: 30 + 340 + 25, top: 170 }}>
      <Chip name="work_a" prio={6} w={260} h={74} glow={after(t, S.running)} note={t >= S.running ? 'runs the line' : null} />
    </div>
    <div style={{ position: 'absolute', left: 30, top: 420, ...mono(30, C.ink, { fontWeight: 700 }), opacity: after(t, S.running) }}>
      esp_cpu_get_core_id() → <span style={{ color: C.amber, fontSize: 44 }}>1</span>
    </div>
    <div style={{ position: 'absolute', left: 30, top: 500, ...mono(26, C.muted), opacity: after(t, S.zero) }}>
      on the ESP32: <span style={{ color: C.amber, fontWeight: 800, fontSize: 36 }}>0</span> or <span style={{ color: C.amber, fontWeight: 800, fontSize: 36 }}>1</span>
    </div>
    <div style={{ position: 'absolute', left: 30, top: 580, ...mono(24, C.cyan), opacity: after(t, S.include) }}>#include "esp_cpu.h"</div>
  </div>
);

const NameView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 30, padding: '0 30px' }}>
    <div style={mono(34, C.ink, { fontWeight: 700 })}>
      pcTaskGetName(<span style={{ color: C.amber }}>NULL</span>)
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 24, opacity: after(t, S.calls) }}>
      <span style={mono(30, C.muted)}>→</span>
      <span style={{ ...mono(34, '#fff', { fontWeight: 700 }), padding: '6px 18px', borderRadius: 10, background: hexA(C.purple, 0.3), border: `2px solid ${C.purple}` }}>"work_a"</span>
    </div>
    <div style={{ ...mono(24, C.muted), opacity: after(t, S.calls) }}>NULL = the task that calls it · its own name</div>
  </div>
);

const ms2 = (ms: number) => ms + 331;

/** QEMU, lab/logs/v0.log: the workers pinned to core 1 */
const PINNED_LOG = ["I (1967) cores: work_a on core 1", "I (1977) cores: work_b on core 1", "I (2377) cores: work_a on core 1", "I (2387) cores: work_b on core 1", "I (2777) cores: work_a on core 1", "I (2797) cores: work_b on core 1"];

const PinnedLog: React.FC<{ t: number }> = ({ t }) => {
  const t0 = S.always - 0.6;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'start', gap: 16, paddingTop: 20 }}>
      <SerialLog t={t} size={21} label="pinned to core 1 · recorded in QEMU" lines={PINNED_LOG.map((l, i) => ({ at: t0 + i * 0.32, text: l, color: i % 2 ? '#b9c6ff' : '#e0c8ff' }))} />
      <div style={{ ...mono(24, GREEN, { fontWeight: 700 }), opacity: after(t, S.always) }}>always core 1 ✓</div>
    </div>
  );
};

const FreeLog: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'start', gap: 16, paddingTop: 20 }}>
    <SerialLog t={t} size={21} label="not pinned · worked out from the rules" lines={simFree6().starts.slice(0, 6).map((s, i) => ({ at: S.free + 0.3 + i * 0.32, text: `I (${ms2(s.t)}) cores: ${s.task} on core ${s.core}`, color: s.core === 1 ? C.amber : '#cfd6ff' }))} />
    <div style={{ ...mono(24, C.amber, { fontWeight: 700 }), opacity: after(t, S.either) }}>core 0 or core 1 · wherever FreeRTOS put it</div>
  </div>
);

export const Which: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const V = S.views;
  const log = t >= S.insert;
  const inc = t >= S.include;
  const code = workCode(log, inc);
  const logAt = code.indexOf(LOG_LINE);
  const incAt = code.indexOf('#include "esp_cpu.h"');
  const marks = [
    ...(log ? [{ line: logAt, at: S.insert + 0.2, token: 'esp_cpu_get_core_id()', label: 'which core: 0 or 1', strong: true }] : []),
    ...(t >= S.name ? [{ line: logAt, at: S.name, token: 'pcTaskGetName(NULL)' }] : []),
    ...(inc ? [{ line: incAt, at: S.include, token: '#include "esp_cpu.h"', label: 'from esp_cpu.h' }] : []),
  ];
  return (
    <CodeViews
      t={t}
      frames={Math.round(sceneDur('which') * FPS)}
      kicker="Which core am I on? · esp_cpu_get_core_id()"
      accent="cyan"
      file="main/main.c · work_task"
      code={code}
      codeSize={log ? 16 : 19}
      marks={marks}
      views={[
        { at: V.ask, component: AskView, label: 'ask the task', accent: C.amber, lines: [logAt] },
        { at: V.name, component: NameView, label: 'its own name', accent: C.purple, lines: [logAt] },
        { at: V.pinned, component: PinnedLog, label: 'every time round the loop', accent: GREEN },
        { at: V.free, component: FreeLog, label: 'without pinning', accent: C.amber },
      ]}
      captions={S.captions}
    />
  );
};


