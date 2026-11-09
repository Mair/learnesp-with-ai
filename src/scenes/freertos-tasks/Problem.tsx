/**
 * 1 · PROBLEM — two LEDs at two rates; one loop makes each wait for the other:
 * 200 + 200 + 500 + 500 = 1400 ms for both.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { CaptionLine } from '../../components/CodeToHardware';
import { mono, RED } from '../../components/Explainer';
import { Panel } from '../../components/Panel';
import { Kicker, Scene } from '../../components/Type';
import { C, FONT, hexA } from '../../theme/palette';
import { after, GREEN, LedCard, Pill, Verdict } from './parts';
import { FAST, FPS, LOOP_PERIOD, ONE_LOOP_CODE, oneLoop, PROBLEM as P, sceneDur, SLOW, wanted } from './timeline';

/** the one-loop playhead (ms into the loop), walked by the narration */
function loopMs(t: number): number {
  const k: [number, number][] = [
    [P.pass, 0],
    [P.sum[0] + 0.5, 200],
    [P.sum[1] + 0.5, 400],
    [P.sum[2] + 0.5, 900],
    [P.sum[3] + 0.5, 1400],
    [P.both + 1.4, 2800],
  ];
  if (t <= k[0][0]) return 0;
  for (let i = 1; i < k.length; i++) {
    if (t <= k[i][0]) {
      const [t0, m0] = k[i - 1];
      const [t1, m1] = k[i];
      return m0 + ((t - t0) / (t1 - t0)) * (m1 - m0);
    }
  }
  return 2800;
}

/** which code line runs at `ms` of the one loop */
function lineAt(ms: number): number {
  const u = ms % LOOP_PERIOD;
  if (u < 200) return 2;
  if (u < 400) return 4;
  if (u < 900) return 6;
  return 8;
}

export const Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const realMs = Math.max(0, (t - P.leds) * 1000);
  const oneLoopOn = t >= P.loop;
  const ms = loopMs(t);
  const ledMs = oneLoopOn ? ((t - P.loop) * 1000) : realMs;
  const fastOn = oneLoopOn ? oneLoop('fast', ledMs) : wanted(FAST.ms, ledMs);
  const slowOn = oneLoopOn ? oneLoop('slow', ledMs) : wanted(SLOW.ms, ledMs);
  const wantNow = Math.max(0, (t - P.fast) * 1000);
  const live = t >= P.pass ? lineAt(ms) : -1;
  return (
    <Scene durationInFrames={Math.round(sceneDur('problem') * FPS)}>
      <AbsoluteFill>
        <div style={{ position: 'absolute', top: 40, width: '100%', display: 'grid', placeItems: 'center' }}>
          <Kicker delay={0.1} accent="amber">
            Let's say you want…
          </Kicker>
        </div>
        <div style={{ position: 'absolute', left: 160, top: 116, width: 1600, display: 'grid', gridTemplateColumns: '760px 1fr', gridTemplateRows: '410px 360px', gap: 22 }}>
          <div style={{ opacity: after(t, P.loop - 0.3) }}>
            <Panel label="one loop · app_main" accent={C.cyan} right="main/main.c">
              <pre style={{ margin: 0, fontFamily: FONT.mono, fontSize: 21, lineHeight: 1.55, color: '#cfd6ff' }}>
                {ONE_LOOP_CODE.map((l, i) => {
                  const on = i === live || i === live - 1;
                  const hold = i === live && t >= P.holds;
                  return (
                    <div key={i} style={{ padding: '0 10px', borderLeft: `3px solid ${on ? (hold ? C.magenta : C.cyan) : 'transparent'}`, background: on ? hexA(hold ? C.magenta : C.cyan, 0.1) : 'transparent' }}>
                      {l}
                    </div>
                  );
                })}
              </pre>
            </Panel>
          </div>
          <div style={{ opacity: after(t, P.leds - 0.3) }}>
            <Panel label={oneLoopOn ? 'what you get · one loop' : 'what you want'} accent={oneLoopOn ? RED : C.amber} right="real time">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', placeItems: 'center', height: 250 }}>
                <LedCard pin={FAST.pin} on={fastOn} sub={oneLoopOn ? 'on 200 · off 1200' : 'every 200 ms'} />
                <div style={{ opacity: after(t, P.slow - 0.4) }}>
                  <LedCard pin={SLOW.pin} on={slowOn} sub={oneLoopOn ? 'on 500 · off 900' : 'every 500 ms'} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', alignItems: 'center', marginTop: 10, minHeight: 60 }}>
                {t >= P.sum[0] && t < P.hand && (
                  <div style={mono(28, C.ink, { fontWeight: 700 })}>
                    {[200, 200, 500, 500].map((v, i) => (
                      <span key={i} style={{ opacity: after(t, P.sum[i]) }}>
                        {i > 0 ? ' + ' : ''}
                        <span style={{ color: i < 2 ? C.amber : C.pink }}>{v}</span>
                      </span>
                    ))}
                    <span style={{ opacity: after(t, P.total) }}>
                      {' '}= <b style={{ color: RED }}>1400 ms</b>
                    </span>
                    <span style={{ opacity: after(t, P.both), color: RED, fontSize: 22 }}> ✗ for both</span>
                  </div>
                )}
                {t >= P.hand && t < P.already && (
                  <div style={{ opacity: after(t, P.hand) }}>
                    <Pill color={C.muted} size={22}>
                      count ticks, juggle by hand = a scheduler, by hand
                    </Pill>
                  </div>
                )}
                {t >= P.already && (
                  <Verdict ok p={after(t, P.already)} size={24}>
                    <span style={{ color: GREEN }}>your ESP32 already runs one</span>
                  </Verdict>
                )}
              </div>
            </Panel>
          </div>
          <div style={{ gridColumn: '1 / -1', opacity: after(t, P.fast - 0.3) }}>
            <Panel label="the LEDs over time" accent={C.magenta} right="ms">
              <Waves
                W={1544}
                s1={2800}
                rows={[
                  { name: 'GPIO 2 · want', color: C.amber, level: (s) => wanted(FAST.ms, s), now: wantNow, show: 1 },
                  { name: 'GPIO 19 · want', color: C.amber, level: (s) => wanted(SLOW.ms, s), now: wantNow, show: after(t, P.slow) },
                  { name: 'GPIO 2 · loop', color: RED, level: (s) => oneLoop('fast', s), now: ms, show: after(t, P.pass - 0.3) },
                  { name: 'GPIO 19 · loop', color: RED, level: (s) => oneLoop('slow', s), now: ms, show: after(t, P.pass - 0.3) },
                ]}
              />
            </Panel>
          </div>
        </div>
        <div style={{ position: 'absolute', top: 944, width: '100%', display: 'grid', placeItems: 'center' }}>
          <CaptionLine captions={P.captions} t={t} size={32} />
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

/** compact square-wave rows over 0…s1 ms, each with its own playhead */
const Waves: React.FC<{ W: number; s1: number; rows: { name: string; color: string; level: (s: number) => number; now: number; show: number }[] }> = ({ W, s1, rows }) => {
  const L = 190;
  const R = W - 20;
  const x = (s: number) => L + (s / s1) * (R - L);
  const rowH = 62;
  const h = 34;
  const H = rows.length * rowH + 30;
  return (
    <svg width={W} height={H} style={{ display: 'block', overflow: 'visible' }}>
      {rows.map((r, i) => {
        const y0 = i * rowH + 10;
        const n = 700;
        const end = Math.min(Math.max(r.now, 0), s1);
        let d = '';
        for (let k = 0; k <= n; k++) {
          const s = (end * k) / n;
          const yy = y0 + (1 - r.level(s)) * h;
          d += `${d ? ' L' : 'M'} ${x(s).toFixed(1)} ${yy.toFixed(1)}`;
        }
        return (
          <g key={i} opacity={r.show}>
            <text x={0} y={y0 + 26} style={mono(19, r.color, { fontWeight: 700 })}>
              {r.name}
            </text>
            <line x1={L} y1={y0 + h} x2={R} y2={y0 + h} stroke={hexA(C.ink, 0.08)} />
            {end > 0 && <path d={d} fill="none" stroke={r.color} strokeWidth={3.5} style={{ filter: `drop-shadow(0 0 5px ${r.color})` }} />}
            {i === 1 && <line x1={0} y1={y0 + rowH - 6} x2={R} y2={y0 + rowH - 6} stroke={hexA(C.ink, 0.15)} strokeDasharray="4 6" />}
          </g>
        );
      })}
      {[0, 400, 800, 1400, 2000, 2800].map((s) => (
        <text key={s} x={x(s)} y={H - 2} textAnchor="middle" style={mono(15, C.muted)}>
          {s}
        </text>
      ))}
    </svg>
  );
};
