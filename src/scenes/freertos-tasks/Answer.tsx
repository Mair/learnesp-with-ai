/**
 * 2 · ANSWER — one loop per LED; a scheduler shares the CPU; FreeRTOS was
 * already running app_main in a task called "main" → TASK.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { mono } from '../../components/Explainer';
import { Panel } from '../../components/Panel';
import { Scene } from '../../components/Type';
import { C, FONT, GRAD_TEXT, hexA } from '../../theme/palette';
import { after, Code, Lanes, LedCard, Span } from './parts';
import { ANSWER as A, FAST, FPS, MAIN_STACK, sceneDur, SLOW, wanted } from './timeline';

const TaskCard: React.FC<{ t: number; name: string; pin: number; ms: number }> = ({ t, name, pin, ms }) => {
  const now = Math.max(0, (t - A.own) * 1000);
  return (
    <Panel label={t >= A.becomes ? `task · ${name}` : 'its own loop'} accent={t >= A.becomes ? C.amber : C.cyan} right={`every ${ms} ms`}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 170px', alignItems: 'center', gap: 10, height: 250 }}>
        <Code
          size={22}
          lines={[
            'while (1) {',
            `    gpio_set_level(${pin}, 1);`,
            `    vTaskDelay(pdMS_TO_TICKS(${ms}));`,
            `    gpio_set_level(${pin}, 0);`,
            `    vTaskDelay(pdMS_TO_TICKS(${ms}));`,
            '}',
          ]}
        />
        <LedCard pin={pin} on={t >= A.own ? wanted(ms, now) : 0} size={110} />
      </div>
    </Panel>
  );
};

export const Answer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const hero = after(t, A.word - 0.2, 0.5);
  const fade = 1 - 0.92 * hero;
  // CPU lane, 0…1000 ms, not to scale: each wake-up drawn 30 ms wide
  const W = 55;
  const spans: Span[] = [];
  for (let s = 0; s < 1000; s += FAST.ms) spans.push({ a: s, b: s + W, color: C.amber, label: 'fast' });
  for (let s = 0; s < 1000; s += SLOW.ms) spans.push({ a: s + W, b: s + 2 * W, color: C.pink, label: 'slow' });
  const idle: Span[] = [];
  const busy = spans.map((x) => [x.a, x.b]).sort((a, b) => a[0] - b[0]);
  let c = 0;
  for (const [a, b] of busy) {
    if (a > c) idle.push({ a: c, b: a, color: C.muted, dashed: true, label: 'idle' });
    c = Math.max(c, b);
  }
  idle.push({ a: c, b: 1000, color: C.muted, dashed: true, label: 'idle' });
  const cpuNow = t >= A.sched ? Math.min(1000, (t - A.sched) * 400) : 0;
  const chain = [
    { at: A.rtos - 0.2, k: 'ESP-IDF startup', c: C.muted },
    { at: A.rtos + 0.3, k: 'FreeRTOS scheduler', c: C.cyan },
    { at: A.main - 0.2, k: `task "main" · priority 1 · CPU 0 · ${MAIN_STACK} B`, c: C.amber },
    { at: A.called, k: 'app_main()', c: C.amber },
  ];
  return (
    <Scene durationInFrames={Math.round(sceneDur('answer') * FPS)}>
      <AbsoluteFill>
        <div style={{ position: 'absolute', left: 160, top: 70, width: 1600, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, opacity: after(t, A.own - 0.4) * fade }}>
          <TaskCard t={t} name={FAST.name} pin={FAST.pin} ms={FAST.ms} />
          <TaskCard t={t} name={SLOW.name} pin={SLOW.pin} ms={SLOW.ms} />
        </div>
        <div style={{ position: 'absolute', left: 160, top: 420, width: 1600, opacity: after(t, A.sched - 0.3) * fade }}>
          <Panel label="the scheduler shares the CPU" accent={C.cyan} right="not to scale">
            <Lanes W={1544} s0={0} s1={1000} now={cpuNow} lanes={[{ name: 'CPU', color: C.cyan, spans: [...spans, ...idle] }]} axis={[0, 200, 400, 500, 600, 800, 1000].map((s) => ({ s, label: `${s} ms` }))} />
            <div style={{ display: 'flex', gap: 30, ...mono(20, C.muted), marginTop: 4 }}>
              <span style={{ opacity: after(t, A.waits) }}>while one task waits …</span>
              <span style={{ opacity: after(t, A.runs), color: C.ink }}>… another one runs</span>
            </div>
          </Panel>
        </div>
        <div style={{ position: 'absolute', left: 160, top: 690, width: 1600, opacity: after(t, A.rtos - 0.3) * fade }}>
          <Panel label="FreeRTOS · started before app_main" accent={C.amber} right="components/freertos/app_startup.c">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, height: 90 }}>
              {chain.map((s, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span style={{ ...mono(26, C.muted), opacity: after(t, s.at) }}>→</span>}
                  <div
                    style={{
                      opacity: after(t, s.at),
                      ...mono(i === 2 ? 22 : 24, s.c, { fontWeight: 700 }),
                      padding: '12px 18px',
                      borderRadius: 12,
                      border: `1px solid ${hexA(s.c, 0.6)}`,
                      background: hexA(s.c, 0.1),
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {s.k}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </Panel>
        </div>
        {hero > 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', alignContent: 'center', gap: 30, opacity: hero }}>
            <div style={{ display: 'flex', gap: 22 }}>
              {[
                { at: A.word - 3.6, k: 'a function' },
                { at: A.stack, k: '+ its own stack' },
                { at: A.scheduler, k: '+ run by the scheduler' },
              ].map((x, i) => (
                <div key={i} style={{ ...mono(30, C.ink, { fontWeight: 600 }) }}>
                  {x.k}
                </div>
              ))}
            </div>
            <div style={{ ...GRAD_TEXT, fontFamily: FONT.sans, fontWeight: 900, fontSize: 240, letterSpacing: '.18em', transform: `scale(${0.9 + 0.1 * hero})` }}>TASK</div>
          </div>
        )}
        {t >= A.stack - 1.4 && hero <= 0 && (
          <div style={{ position: 'absolute', top: 944, width: '100%', display: 'flex', justifyContent: 'center', gap: 22 }}>
            {[
              { at: A.stack - 1.2, k: 'a function' },
              { at: A.stack, k: '+ its own stack' },
              { at: A.scheduler, k: '+ run by the scheduler' },
            ].map((x, i) => (
              <div key={i} style={{ ...mono(30, C.ink, { fontWeight: 600 }), opacity: after(t, x.at) }}>
                {x.k}
              </div>
            ))}
          </div>
        )}
      </AbsoluteFill>
    </Scene>
  );
};
