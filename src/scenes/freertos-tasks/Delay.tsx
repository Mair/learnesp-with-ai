/**
 * 7 · WHAT vTaskDelay DOES — Running → Blocked for N ticks; 1 tick = 10 ms →
 * 200 ms = 20 ticks; each tick checks whose time is up → Ready → Running;
 * idle runs the rest; two cores (teaser).
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { CaptionLine } from '../../components/CodeToHardware';
import { mono } from '../../components/Explainer';
import { Panel } from '../../components/Panel';
import { Kicker, Scene } from '../../components/Type';
import { C, hexA } from '../../theme/palette';
import { after, clamp01, GREEN, Lanes, Pill, Span, StateChip, STATE_COLOR } from './parts';
import { DELAY as S, FAST, FPS, sceneDur, SLOW, TICK_MS } from './timeline';

const VW = 1544;

/** the state blink_fast is in at scene time t */
function stateAt(t: number): 'Running' | 'Blocked' | 'Ready' {
  if (t < S.states.blocks) return 'Running';
  if (t < S.ticks.ready) return 'Blocked';
  if (t < S.ticks.runs) return 'Ready';
  return 'Running';
}

const States: React.FC<{ t: number }> = ({ t }) => {
  const st = stateAt(t);
  const order: ('Running' | 'Blocked' | 'Ready')[] = ['Running', 'Blocked', 'Ready'];
  return (
    <div style={{ display: 'flex', gap: 80, justifyContent: 'center', alignItems: 'center' }}>
      {order.map((k, i) => (
        <React.Fragment key={k}>
          {i > 0 && <span style={mono(30, C.muted)}>→</span>}
          <div style={{ display: 'grid', justifyItems: 'center', gap: 10 }}>
            <StateChip state={k} on={st === k ? 1 : 0} />
            <div style={{ ...mono(18, STATE_COLOR[k]), opacity: st === k ? 1 : 0, height: 22 }}>blink_fast</div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

/** ticks counted since the delay started (slowed: 20 ticks over the narration) */
function ticksAt(t: number) {
  const a = S.ticks.every;
  const b = S.ticks.after + 0.3;
  return Math.floor(20 * clamp01((t - a) / (b - a)));
}

const TickRuler: React.FC<{ t: number }> = ({ t }) => {
  const n = ticksAt(t);
  const L = 40;
  const R = VW - 40;
  const x = (k: number) => L + (k / 25) * (R - L);
  return (
    <svg width={VW} height={110} style={{ display: 'block', overflow: 'visible' }}>
      <line x1={L} y1={50} x2={R} y2={50} stroke={hexA(C.cyan, 0.5)} strokeWidth={2} />
      {Array.from({ length: 26 }, (_, k) => (
        <g key={k}>
          <line x1={x(k)} y1={36} x2={x(k)} y2={64} stroke={k <= n && t >= S.ticks.every ? C.cyan : hexA(C.cyan, 0.35)} strokeWidth={k % 5 === 0 ? 3 : 1.5} />
          {k % 5 === 0 && (
            <text x={x(k)} y={92} textAnchor="middle" style={mono(16, C.muted)}>
              {k * TICK_MS} ms
            </text>
          )}
        </g>
      ))}
      <rect x={x(0)} y={30} width={x(20) - x(0)} height={40} rx={6} fill={hexA(C.magenta, 0.12 * after(t, S.ticks.twenty))} stroke={hexA(C.magenta, 0.7 * after(t, S.ticks.twenty))} />
      <text x={x(20)} y={22} textAnchor="middle" opacity={after(t, S.ticks.twenty)} style={mono(18, C.magenta, { fontWeight: 700 })}>
        wake at tick 20
      </text>
    </svg>
  );
};

export const Delay: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const V = S.views;
  const n = ticksAt(t);
  const view = t >= V.cores ? 'cores' : t >= V.idle ? 'idle' : 'states';
  // the idle lanes: 0…1000 ms, wake-ups drawn 25 ms wide (not to scale)
  const Wd = 25;
  const fastSpans: Span[] = [];
  for (let s = 0; s < 1000; s += FAST.ms) fastSpans.push({ a: s, b: s + Wd, color: C.amber });
  const slowSpans: Span[] = [];
  for (let s = 0; s < 1000; s += SLOW.ms) slowSpans.push({ a: s + Wd, b: s + 2 * Wd, color: C.pink });
  const busy = [...fastSpans, ...slowSpans].map((x) => [x.a, x.b]).sort((a, b) => a[0] - b[0]);
  const idleSpans: Span[] = [];
  let c = 0;
  for (const [a, b] of busy) {
    if (a > c) idleSpans.push({ a: c, b: a, color: GREEN, dashed: true, label: 'IDLE' });
    c = Math.max(c, b);
  }
  idleSpans.push({ a: c, b: 1000, color: GREEN, dashed: true, label: 'IDLE' });
  const idleNow = Math.min(1000, Math.max(0, (t - V.idle) * 600));
  // two cores: the same wake-ups, landing on either core
  const core0: Span[] = [];
  const core1: Span[] = [];
  [...fastSpans.map((x) => ({ ...x, label: '' })), ...slowSpans.map((x) => ({ ...x, label: '' }))]
    .sort((a, b) => a.a - b.a)
    .forEach((x, i) => (i % 2 === 1 ? core1 : core0).push(x));
  const coresNow = Math.min(1000, Math.max(0, (t - V.cores) * 600));
  return (
    <Scene durationInFrames={Math.round(sceneDur('delay') * FPS)}>
      <AbsoluteFill>
        <div style={{ position: 'absolute', top: 40, width: '100%', display: 'grid', placeItems: 'center' }}>
          <Kicker delay={0.1} accent="magenta">
            What vTaskDelay does
          </Kicker>
        </div>
        <div style={{ position: 'absolute', left: 160, top: view === 'states' ? 120 : view === 'idle' ? 260 : 300, width: 1600 }}>
          {view === 'states' && (
            <div style={{ display: 'grid', gap: 22 }}>
              <Panel label="blink_fast · its state" accent={C.magenta} right="task.h · eTaskState">
                <div style={{ height: 150, display: 'grid', alignContent: 'center' }}>
                  <States t={t} />
                </div>
                <div style={{ display: 'flex', gap: 18, justifyContent: 'center', marginTop: 8 }}>
                  <div style={{ opacity: after(t, S.states.off) }}>
                    <Pill color={C.magenta} size={20}>
                      off the CPU
                    </Pill>
                  </div>
                  <div style={{ opacity: after(t, S.states.ticks) }}>
                    <Pill color={C.cyan} size={20}>
                      for a number of ticks
                    </Pill>
                  </div>
                </div>
              </Panel>
              <div style={{ opacity: after(t, V.ticks - 0.3) }}>
                <Panel label="the tick · CONFIG_FREERTOS_HZ = 100" accent={C.cyan} right={t >= S.ticks.every ? 'slowed ~18× so you can count' : '1 tick = 10 ms'}>
                  <div style={{ display: 'grid', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 40, alignItems: 'baseline' }}>
                      <div style={{ ...mono(26, C.ink), opacity: after(t, S.ticks.ten) }}>
                        1 tick = <b style={{ color: C.cyan }}>10 ms</b>
                      </div>
                      <div style={{ ...mono(26, C.ink), opacity: after(t, S.ticks.ms200) }}>
                        pdMS_TO_TICKS(200) = 200 × 100 / 1000 = <b style={{ color: C.magenta, opacity: after(t, S.ticks.twenty) }}>20 ticks</b>
                      </div>
                    </div>
                    <TickRuler t={t} />
                    <div style={{ display: 'flex', gap: 40, ...mono(24, C.ink), minHeight: 34 }}>
                      <span style={{ opacity: after(t, S.ticks.every) }}>
                        tick <b style={{ color: C.cyan, fontVariantNumeric: 'tabular-nums' }}>{String(n).padStart(2, '\u2007')}</b> · whose time is up?{' '}
                        <span style={{ color: n >= 20 ? GREEN : C.muted }}>{n >= 20 ? 'blink_fast →  Ready' : 'not yet'}</span>
                      </span>
                    </div>
                  </div>
                </Panel>
              </div>
            </div>
          )}
          {view === 'idle' && (
            <div style={{ opacity: after(t, V.idle) }}>
              <Panel label="one second of CPU time" accent={GREEN} right="not to scale · wake-ups drawn wide">
                <Lanes
                  W={VW}
                  s0={0}
                  s1={1000}
                  now={idleNow}
                  lanes={[
                    { name: 'blink_fast', color: C.amber, spans: fastSpans },
                    { name: 'blink_slow', color: C.pink, spans: slowSpans },
                    { name: 'IDLE', color: GREEN, spans: idleSpans },
                  ]}
                  axis={[0, 200, 400, 500, 600, 800, 1000].map((s) => ({ s, label: `${s} ms` }))}
                />
                <div style={{ display: 'flex', gap: 18, marginTop: 14 }}>
                  <div style={{ opacity: after(t, S.idle.blocked) }}>
                    <Pill color={C.magenta} size={20}>
                      both blocked
                    </Pill>
                  </div>
                  <div style={{ opacity: after(t, S.idle.idle) }}>
                    <Pill color={GREEN} size={20}>
                      → the idle task runs
                    </Pill>
                  </div>
                  <div style={{ opacity: after(t, S.idle.most) }}>
                    <Pill color={GREEN} size={20}>
                      most of the time
                    </Pill>
                  </div>
                </div>
              </Panel>
            </div>
          )}
          {view === 'cores' && (
            <div style={{ opacity: after(t, V.cores) }}>
              <Panel label="the ESP32 has two cores" accent={C.cyan} right={<span><b style={{ color: C.amber }}>■ blink_fast</b>{'   '}<b style={{ color: C.pink }}>■ blink_slow</b>{'   '}· not to scale</span>}>
                <Lanes
                  W={VW}
                  s0={0}
                  s1={1000}
                  now={coresNow}
                  lanes={[
                    { name: 'CPU 0', color: C.cyan, spans: core0 },
                    { name: 'CPU 1', color: C.cyan, spans: core1 },

                  ]}
                  axis={[0, 500, 1000].map((s) => ({ s, label: `${s} ms` }))}
                />
                <div style={{ display: 'flex', gap: 18, marginTop: 14 }}>
                  <div style={{ opacity: after(t, S.cores.either) }}>
                    <Pill color={C.cyan} size={20}>
                      xTaskCreate → tskNO_AFFINITY: either core
                    </Pill>
                  </div>
                  <div style={{ opacity: after(t, S.cores.own) }}>
                    <Pill color={C.muted} size={20}>
                      which one, and why: the two-cores video
                    </Pill>
                  </div>
                </div>
              </Panel>
            </div>
          )}
        </div>
        <div style={{ position: 'absolute', top: 944, width: '100%', display: 'grid', placeItems: 'center' }}>
          <CaptionLine captions={S.captions} t={t} size={32} />
        </div>
      </AbsoluteFill>
    </Scene>
  );
};
