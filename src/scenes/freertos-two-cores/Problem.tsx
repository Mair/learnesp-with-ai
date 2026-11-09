/**
 * 1 · PROBLEM — the scheduler video's stumble: workers at 6 above the LEDs at 5, made with
 * xTaskCreate, so they can take both cores and the fast LED finds no free core. FreeRTOS
 * picks the core (work_b shows up on both). What if the workers could only use core 1?
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { CaptionLine } from '../../components/CodeToHardware';
import { CodeLine } from '../../components/CodeLine';
import { mono } from '../../components/Explainer';
import { Panel } from '../../components/Panel';
import { Kicker, Scene } from '../../components/Type';
import { C, FONT, hexA } from '../../theme/palette';
import { after, CoreLanes, LedCard, Pill, RED } from './parts';
import { ledAt, simulate } from './sim';
import { FAST, FPS, mainFree, PROBLEM as P, RUN_MS, sceneDur, SLOW, WORKER_LINES } from './timeline';

export const simFree6 = () => simulate('free-6', { until: RUN_MS, workPrio: 6, workCore: null });

export const Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const sim = simFree6();
  const ms = Math.max(0, (t - 0.4) * 1000);
  const code = mainFree(6);
  return (
    <Scene durationInFrames={Math.round(sceneDur('problem') * FPS)}>
      <AbsoluteFill>
        <div style={{ position: 'absolute', top: 40, width: '100%', display: 'grid', placeItems: 'center' }}>
          <Kicker delay={0.1} accent="amber">
            Let's say you want… · from the scheduler video
          </Kicker>
        </div>
        {/* the LEDs */}
        <div style={{ position: 'absolute', left: 160, top: 116, width: 520, height: 400, opacity: after(t, 0.2) }}>
          <Panel label="the LEDs" accent={t >= P.late ? RED : C.amber} right="real time">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', placeItems: 'center', height: 230 }}>
              <LedCard pin={FAST.pin} on={ledAt(sim.edges.fast, ms)} label="blink_fast" sub={`every ${FAST.ms} ms · prio 5`} />
              <LedCard pin={SLOW.pin} on={ledAt(sim.edges.slow, ms)} label="blink_slow" sub={`every ${SLOW.ms} ms · prio 5`} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', minHeight: 60 }}>
              {t >= P.first && t < P.late && (
                <div style={{ opacity: after(t, P.first) }}>
                  <Pill color={C.amber} size={22}>
                    6 &gt; 5 · the workers go first
                  </Pill>
                </div>
              )}
              {t >= P.late && t < P.what && (
                <div style={{ opacity: after(t, P.late) }}>
                  <Pill color={RED} size={22}>
                    GPIO 2 is late
                  </Pill>
                </div>
              )}
              {t >= P.what && (
                <div style={{ ...mono(26, C.amber, { fontWeight: 800 }), opacity: after(t, P.only), textShadow: `0 0 20px ${hexA(C.amber, 0.6)}` }}>core 0 without the workers?</div>
              )}
            </div>
          </Panel>
        </div>
        {/* the code */}
        <div style={{ position: 'absolute', left: 704, top: 116, width: 1056, height: 400, opacity: after(t, P.workers - 0.4) }}>
          <Panel label="main/main.c · app_main" accent={C.cyan} right="ESP-IDF">
            <pre style={{ margin: 0, fontFamily: FONT.mono, fontSize: 21, lineHeight: 1.6, color: '#cfd6ff' }}>
              {code.map((l, i) => {
                const worker = WORKER_LINES.includes(i);
                const marks = worker
                  ? [
                      { token: '6', at: P.six, strong: true, label: i === 4 && t < P.either ? 'priority 6' : undefined },
                      { token: 'xTaskCreate', at: P.either, label: i === 4 ? 'either core' : undefined },
                    ]
                  : i === 2 || i === 3
                    ? [{ token: '5', at: P.five, label: i === 2 ? 'priority 5' : undefined }]
                    : [];
                const lit = worker ? P.workers : null;
                return (
                  <div key={i} style={{ minHeight: '1.6em' }}>
                    <CodeLine text={l} t={t} litAt={lit} live={lit !== null && t >= lit} marks={marks} row={marks.some((m) => m.label) ? 1 : 0} />
                  </div>
                );
              })}
            </pre>
            <div style={{ position: 'absolute', right: 30, bottom: 22, display: 'flex', gap: 14 }}>
              {t >= P.picks && (
                <div style={{ opacity: after(t, P.picks) }}>
                  <Pill color={C.cyan} size={22}>
                    FreeRTOS picks the core
                  </Pill>
                </div>
              )}
            </div>
          </Panel>
        </div>
        {/* the lanes */}
        <div style={{ position: 'absolute', left: 160, top: 540, width: 1600, height: 380, opacity: after(t, P.both - 0.4) }}>
          <Panel label={t >= P.picks ? 'the first 4 seconds' : 'the last 4 seconds'} accent={t >= P.only ? C.amber : RED} right="real time · worked out from the rules · LED slivers drawn wider">
            {t < P.picks ? (
              <CoreLanes sim={sim} W={1544} s0={ms - 4000} s1={ms} now={ms} show={['core0', 'core1', 'fast']} lateMarks={t >= P.late} />
            ) : (
              // from the start: work_a's first job is on core 0, the next ones on core 1
              <CoreLanes sim={sim} W={1544} s0={0} s1={4000} now={4000} show={['core0', 'core1', 'fast']} lateMarks focus={t < P.what ? 'work_a' : null} ghost0={t >= P.only} />
            )}
          </Panel>
        </div>
        <div style={{ position: 'absolute', top: 944, width: '100%', display: 'grid', placeItems: 'center' }}>
          <CaptionLine captions={P.captions} t={t} size={32} />
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

