/**
 * 1 · PROBLEM — the two LEDs from the tasks video; add two workers (busy 300 ms, rest
 * 100 ms) at priority 6 "because the job matters" → the fast LED misses its beat.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { CaptionLine } from '../../components/CodeToHardware';
import { CodeLine } from '../../components/CodeLine';
import { mono } from '../../components/Explainer';
import { Panel } from '../../components/Panel';
import { Kicker, Scene } from '../../components/Type';
import { C, FONT, hexA } from '../../theme/palette';
import { after, GREEN, LedCard, Lanes, Pill, RED, SimLanes, Span, WORK } from './parts';
import { ledAt, simulate, wanted } from './sim';
import { FAST, FPS, mainCode, PROBLEM as P, sceneDur, SLOW, WORK_CODE } from './timeline';

export const sim6 = () => simulate('workers-6', { until: 6000, workPrio: () => 6 });

/** one worker's pattern: busy 300, rest 100, from 0 */
const workerSpans = (): Span[] => {
  const out: Span[] = [];
  for (let s = 0; s < 2000; s += 400) {
    out.push({ a: s, b: s + 300, color: WORK, label: 'busy 300 ms' });
    out.push({ a: s + 300, b: s + 400, color: C.muted, dashed: true, label: 'rest' });
  }
  return out;
};

export const Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const sim = sim6();
  const real = t >= P.watch;
  const simMs = (t - P.watch) * 1000;
  const wantMs = (t - P.leds) * 1000;
  const fastOn = real ? ledAt(sim.edges.fast, simMs) : t >= P.leds ? wanted(FAST.ms, wantMs) : 0;
  const slowOn = real ? ledAt(sim.edges.slow, simMs) : t >= P.leds ? wanted(SLOW.ms, wantMs) : 0;
  const showMain = t >= P.six - 0.7;
  const code = showMain ? mainCode(6) : WORK_CODE;
  // the worker lane reveals: busy on "300", rest on "rests", then the pattern runs on
  const wNow = t < P.busy ? 0 : t < P.rest ? Math.min(300, (t - P.busy) * 400) : t < P.rest + 0.6 ? 300 + Math.min(100, (t - P.rest) * 300) : Math.min(2000, 400 + (t - P.rest - 0.6) * 900);
  return (
    <Scene durationInFrames={Math.round(sceneDur('problem') * FPS)}>
      <AbsoluteFill>
        <div style={{ position: 'absolute', top: 40, width: '100%', display: 'grid', placeItems: 'center' }}>
          <Kicker delay={0.1} accent="amber">
            Let's say you have…
          </Kicker>
        </div>
        {/* the LEDs */}
        <div style={{ position: 'absolute', left: 160, top: 116, width: 560, height: 430, opacity: after(t, P.leds - 0.6) }}>
          <Panel label="the LEDs" accent={real ? RED : C.amber} right="real time">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', placeItems: 'center', height: 230 }}>
              <LedCard pin={FAST.pin} on={fastOn} label="blink_fast" sub={`every ${FAST.ms} ms · prio 5`} />
              <LedCard pin={SLOW.pin} on={slowOn} label="blink_slow" sub={`every ${SLOW.ms} ms · prio 5`} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, minHeight: 70 }}>
              {t >= P.stumbles && t < P.unchanged && (
                <div style={{ opacity: after(t, P.stumbles) }}>
                  <Pill color={RED} size={22}>
                    GPIO 2 misses its beat
                  </Pill>
                </div>
              )}
              {t >= P.unchanged && (
                <div style={{ opacity: after(t, P.unchanged) }}>
                  <Pill color={GREEN} size={20}>
                    blink_task: unchanged ✓
                  </Pill>
                </div>
              )}
              {t >= P.what && <div style={{ ...mono(64, C.amber, { fontWeight: 800 }), opacity: after(t, P.what), textShadow: `0 0 30px ${hexA(C.amber, 0.7)}` }}>?</div>}
            </div>
          </Panel>
        </div>
        {/* the code */}
        <div style={{ position: 'absolute', left: 744, top: 116, width: 1016, height: 430, opacity: after(t, P.add - 0.2) }}>
          <Panel label={showMain ? 'main/main.c · app_main' : 'main/main.c · two new tasks'} accent={C.cyan} right="ESP-IDF">
            <pre style={{ margin: 0, fontFamily: FONT.mono, fontSize: showMain ? 21 : 18, lineHeight: 1.5, color: '#cfd6ff' }}>
              {code.map((l, i) => {
                const marks = showMain
                  ? i === 4 || i === 5
                    ? [{ token: '6', at: P.six, strong: true, label: i === 4 ? 'priority 6' : undefined }]
                    : i === 2 || i === 3
                      ? [{ token: '5', at: P.five, label: i === 2 ? 'priority 5' : undefined }]
                      : []
                  : i === 3
                    ? [{ token: '300 * 1000', at: P.busy, label: '300 ms from now', strong: true }]
                    : i === 7
                      ? [{ token: 'vTaskDelay(pdMS_TO_TICKS(100))', at: P.rest, label: 'rest 100 ms' }]
                      : [];
                const lit = showMain ? (i === 4 || i === 5 ? P.six : null) : i >= 3 && i <= 6 ? P.job : null;
                return (
                  <div key={i + (showMain ? 100 : 0)} style={{ minHeight: '1.5em' }}>
                    <CodeLine text={l} t={t} litAt={lit} live={lit !== null && t >= lit} marks={marks} row={marks.some((m) => m.label) ? 1 : 0} />
                  </div>
                );
              })}
            </pre>
            {showMain && (
              <div style={{ position: 'absolute', right: 30, bottom: 22, opacity: after(t, P.bigger) }}>
                <Pill color={C.amber} size={26}>
                  6 &gt; 5 · the workers have the bigger number
                </Pill>
              </div>
            )}
          </Panel>
        </div>
        {/* the lanes */}
        <div style={{ position: 'absolute', left: 160, top: 570, width: 1600, height: 330, opacity: after(t, P.busy - 0.4) }}>
          <Panel label={real ? 'GPIO 2 over time · what you want vs what you get' : 'one worker over time'} accent={real ? RED : WORK} right={real ? 'real time · worked out from the rules' : 'ms'}>
            {!real ? (
              <Lanes W={1544} s0={0} s1={2000} now={wNow} lanes={[{ name: 'work_a', color: WORK, spans: workerSpans() }]} axis={[0, 400, 800, 1200, 1600, 2000].map((s) => ({ s, label: `${s} ms` }))} />
            ) : (
              <SimLanes sim={sim} W={1544} s0={0} s1={4000} now={simMs} show={['want', 'fast']} />
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
