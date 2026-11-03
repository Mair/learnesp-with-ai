/**
 * 9 · BOUNCE — every falling edge is an interrupt.
 *   storm  the input video's bounce: 5 falling edges → 5 interrupts → "presses: 5";
 *          a release bounce dips once → another falling edge
 *   fix    in the task: first event → vTaskDelay(pdMS_TO_TICKS(30)) → xQueueReset → read once
 *
 * The bounce shape is the illustrative one from the input video (Ganssle's ~1.6 ms average).
 * FACTS: gpio_isr_loop (edge cleared on entry → each edge re-fires); queue.h xQueueReset; Ganssle.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { GREEN, mono, RED } from '../../components/Explainer';
import { C } from '../../theme/palette';
import { after, CodeAndViews, Lanes, SerialLog, Verdict, VIEW2_W as W } from './parts';
import { BOUNCE as S, bounceLow, FPS, LOOP_CODE, PRESS_FALLS, RELEASE_HIGHS, sceneDur, SETTLE_MS } from './timeline';

const NAIVE = ['int presses = 0;', 'uint32_t pin;', 'while (1) {', '    xQueueReceive(button_events, &pin, portMAX_DELAY);', '    presses++;', '    ESP_LOGI(TAG, "presses: %d", presses);', '}'];

export const Bounce: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const V = S.views;
  const f = S.fix;
  const fixed = t >= V.fix;
  const lit = (): number[] => {
    if (!fixed) return t >= S.storm.five ? [3, 4, 5] : [3];
    if (t >= f.one) return [6, 7, 8];
    if (t >= f.read) return [6];
    if (t >= f.reset) return [5];
    if (t >= f.wait) return [4];
    return [3];
  };
  return (
    <CodeAndViews
      t={t}
      frames={Math.round(sceneDur('bounce') * FPS)}
      kicker="Bounce, again"
      accent="amber"
      file="main/main.c · the task"
      code={fixed ? LOOP_CODE : NAIVE}
      codeSize={18}
      captions={S.captions}
      views={[
        { at: V.storm, component: StormView, label: 'one press, five interrupts', accent: RED, lines: lit(), right: () => 'illustration · ms' },
        { at: V.fix, component: FixView, label: 'the fix lives in the task', accent: GREEN, lines: lit(), right: () => 'ms' },
      ]}
    />
  );
};

/** a level trace in ms; low(ms) → 0/1 */
const Trace: React.FC<{ low: (ms: number) => boolean; m0: number; m1: number; W: number; marks?: number[]; markP?: (i: number) => number; label: string }> = ({ low, m0, m1, W: w, marks = [], markP = () => 1, label }) => {
  const L = 20;
  const x = (ms: number) => L + ((ms - m0) / (m1 - m0)) * (w - L - 20);
  const yH = 46;
  const yL = 150;
  let d = '';
  let prev = -1;
  for (let i = 0; i <= 1200; i++) {
    const ms = m0 + ((m1 - m0) * i) / 1200;
    const y = low(ms) ? yL : yH;
    if (prev !== -1 && y !== prev) d += ` L ${x(ms).toFixed(1)} ${prev}`;
    d += `${d ? ' L' : 'M'} ${x(ms).toFixed(1)} ${y}`;
    prev = y;
  }
  return (
    <svg width={w} height={190} style={{ display: 'block', overflow: 'visible' }}>
      <text x={L} y={22} style={mono(17, C.muted)}>
        {label}
      </text>
      <path d={d} fill="none" stroke={C.magenta} strokeWidth={3.5} style={{ filter: `drop-shadow(0 0 5px ${C.magenta})` }} />
      {marks.map((ms, i) => (
        <g key={i} opacity={markP(i)}>
          <text x={x(ms)} y={yL + 36} textAnchor="middle" style={mono(24, C.amber, { fontWeight: 800 })}>
            ⚡
          </text>
        </g>
      ))}
    </svg>
  );
};

const StormView: React.FC<{ t: number }> = ({ t }) => {
  const s = S.storm;
  const fired = (i: number) => after(t, s.every + i * 0.25, 0.25);
  const nLogs = t >= s.five ? 5 : 0;
  const releaseLow = (ms: number) => !RELEASE_HIGHS.some(([a, b]) => ms >= a && ms < b) && ms >= 0 ? true : ms < 0;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', gap: 10 }}>
      <div style={{ opacity: after(t, s.bounce) }}>
        <Trace W={W} m0={-0.5} m1={2.5} low={(ms) => ms >= 0 && bounceLow(ms)} label="press · GPIO 18" marks={PRESS_FALLS} markP={(i) => (t >= s.several ? fired(i) : 0)} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, opacity: after(t, s.five - 0.3) }}>
        <SerialLog
          t={t}
          size={18}
          label="idf.py monitor"
          lines={Array.from({ length: nLogs }, (_, i) => ({ at: s.five + i * 0.12, text: `I (…) button: presses: ${i + 1}`, color: i === 0 ? GREEN : RED }))}
        />
        <Verdict ok={false} p={after(t, s.five + 0.6)} size={22}>
          one press, counted five times
        </Verdict>
      </div>
      <div style={{ opacity: after(t, s.letting) }}>
        <Trace W={W} m0={-0.5} m1={1.5} low={releaseLow} label="release · rising, with one dip back" marks={[0.4]} markP={() => after(t, s.falling)} />
      </div>
    </div>
  );
};

const FixView: React.FC<{ t: number }> = ({ t }) => {
  const f = S.fix;
  const s0 = -3;
  const s1 = 40;
  // the lanes in ms; the narration walks through them
  const now = t < f.first ? s0 : t < f.wait ? 2 : t < f.reset ? 2 + (SETTLE_MS - 2) * Math.min(1, (t - f.wait) / 3.4) : t < f.read ? SETTLE_MS + 1 : s1;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 18 }}>
      <Lanes
        W={W}
        s0={s0}
        s1={s1}
        now={now}
        lanes={[
          { name: 'GPIO 18', color: C.magenta, level: (ms) => (ms >= 0 && bounceLow(ms) ? 0 : 1) },
          { name: 'ISR', color: C.amber, spans: PRESS_FALLS.map((ms) => ({ a: ms, b: ms + 0.35, color: C.amber })) },
          {
            name: 'task',
            color: C.cyan,
            spans: [
              { a: s0, b: 0.2, color: C.muted, label: 'waiting', dashed: true },
              { a: 0.2, b: 1.2, color: C.cyan },
              { a: 1.2, b: SETTLE_MS, color: C.cyan, label: `vTaskDelay(pdMS_TO_TICKS(${SETTLE_MS}))`, dashed: true },
              { a: SETTLE_MS, b: SETTLE_MS + 3, color: GREEN, label: 'reset · read' },
            ],
          },
        ]}
        marks={[
          { s: 0.2, label: 'first event', color: C.cyan, lane: 2 },
          { s: SETTLE_MS, label: 'xQueueReset', color: GREEN, lane: 2 },
        ]}
        axis={[
          { s: 0, label: '0 ms' },
          { s: 10, label: '10' },
          { s: 20, label: '20' },
          { s: 30, label: '30 ms' },
        ]}
      />
      <div style={{ display: 'flex', gap: 30, alignItems: 'center' }}>
        <span style={{ opacity: after(t, f.reset), ...mono(22, C.ink) }}>
          queue: <s style={{ color: RED }}>18 18 18 18</s> <span style={{ color: GREEN }}>→ empty</span>
        </span>
        <span style={{ opacity: after(t, f.zero), ...mono(22, C.ink) }}>
          gpio_get_level → <b style={{ color: C.cyan }}>0</b> · still pressed
        </span>
      </div>
      <Verdict ok p={after(t, f.one)} size={24}>
        one press, one count — and the CPU sleeps in between
      </Verdict>
      <div style={{ opacity: after(t, f.wait), fontSize: 19, color: C.muted }}>3 ticks ≈ 20–30 ms · Ganssle suggests a 20–50 ms debounce period</div>
    </div>
  );
};

