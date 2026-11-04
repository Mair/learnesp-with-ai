/**
 * 1 · THE PROBLEM — polling's cost.
 * "Back in the GPIO input video, the loop read the button a hundred times a second. Almost every read said the same thing: not pressed."
 * "That's three hundred and sixty thousand reads an hour, just in case. And a pulse shorter than one tick can slip between two reads, and never be seen."
 * "What if the pin could tell you when something happens?"
 *
 * The read counter runs in real time (100/s). The pulse zoom is illustrative
 * (a 4 ms low between two 10 ms reads).
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { CaptionLine } from '../../components/CodeToHardware';
import { GREEN, mono, RED } from '../../components/Explainer';
import { Panel } from '../../components/Panel';
import { Kicker, Scene } from '../../components/Type';
import { C, FONT, hexA } from '../../theme/palette';
import { after, Pill } from './parts';
import { FPS, PROBLEM as P, READS_PER_HOUR, sceneDur, TICK_MS } from './timeline';

const LOOP = ['while (1) {', '    bool pressed = (gpio_get_level(BUTTON) == 0);', '    gpio_set_level(LED, pressed);', '    vTaskDelay(pdMS_TO_TICKS(10));', '}'];

export const Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const codeIn = after(t, P.codeIn, 0.6);
  const reads = Math.max(0, Math.floor((t - P.hundred) * 100));
  const pulse = after(t, P.pulse, 0.5);
  return (
    <Scene durationInFrames={Math.round(sceneDur('problem') * FPS)}>
      <AbsoluteFill>
        <div style={{ position: 'absolute', top: 40, width: '100%', display: 'grid', placeItems: 'center' }}>
          <Kicker delay={0.1} accent="amber">
            The problem
          </Kicker>
        </div>
        <div style={{ position: 'absolute', left: 160, top: 120, width: 1600, display: 'grid', gridTemplateColumns: '860px 1fr', gridTemplateRows: '330px 360px', gap: 24 }}>
          <div style={{ opacity: codeIn }}>
            <Panel label="GPIO input video · polling" accent={C.cyan} right="main/main.c">
              <pre style={{ margin: 0, fontFamily: FONT.mono, fontSize: 25, lineHeight: 1.6, color: '#cfd6ff' }}>
                {LOOP.map((l, i) => (
                  <div key={i} style={{ padding: '0 10px', borderLeft: `3px solid ${i === 1 && t >= P.hundred ? C.cyan : 'transparent'}`, background: i === 1 && t >= P.hundred ? hexA(C.cyan, 0.1) : 'transparent' }}>
                    {l}
                  </div>
                ))}
              </pre>
            </Panel>
          </div>
          <div style={{ opacity: after(t, P.hundred - 0.3) }}>
            <Panel label="reads" accent={C.cyan} right="real time">
              <div style={{ display: 'grid', gap: 14 }}>
                <div style={mono(64, C.cyan, { fontWeight: 800, fontVariantNumeric: 'tabular-nums' })}>{String(reads).padStart(5, '\u2007')}</div>
                <div style={{ opacity: after(t, P.same), ...mono(26, C.ink), letterSpacing: '.18em' }}>
                  1 1 1 1 1 1 1 1 1 1 <span style={{ color: C.muted, letterSpacing: 0 }}>…</span>
                </div>
                <div style={{ opacity: after(t, P.notPressed) }}>
                  <Pill color={C.muted} size={22}>
                    every one: not pressed
                  </Pill>
                </div>
                <div style={{ opacity: after(t, P.hour), ...mono(26, C.amber, { fontWeight: 700 }) }}>
                  100 / s × 3600 s = {READS_PER_HOUR.toLocaleString('en-US').replace(',', ' ')} an hour
                </div>
                <div style={{ opacity: after(t, P.justInCase), fontSize: 24, color: C.muted }}>just in case</div>
              </div>
            </Panel>
          </div>
          <div style={{ gridColumn: '1 / -1', opacity: pulse }}>
            <Panel label="zoom · a short pulse between two reads" accent={C.magenta} right="illustration · ms">
              <PulseZoom t={t} />
            </Panel>
          </div>
        </div>
        <div style={{ position: 'absolute', top: 944, width: '100%', display: 'grid', placeItems: 'center' }}>
          <CaptionLine captions={[{ at: P.question, text: 'What if the pin could tell you when something happens?' }]} t={t} size={40} />
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

const PulseZoom: React.FC<{ t: number }> = ({ t }) => {
  const W = 1544;
  const L = 60;
  const R = W - 40;
  const m0 = -2;
  const m1 = 42;
  const x = (ms: number) => L + ((ms - m0) / (m1 - m0)) * (R - L);
  const yH = 50;
  const yL = 170;
  const p0 = 13;
  const p1 = 17;
  const reads = [0, 10, 20, 30, 40];
  const slip = after(t, P.slip);
  const never = after(t, P.never);
  return (
    <svg width={W} height={270} style={{ display: 'block', overflow: 'visible' }}>
      <path d={`M ${x(m0)} ${yH} L ${x(p0)} ${yH} L ${x(p0)} ${yL} L ${x(p1)} ${yL} L ${x(p1)} ${yH} L ${x(m1)} ${yH}`} fill="none" stroke={C.magenta} strokeWidth={4} style={{ filter: `drop-shadow(0 0 6px ${C.magenta})` }} />
      <rect x={x(p0)} y={yH - 10} width={x(p1) - x(p0)} height={yL - yH + 20} fill={hexA(RED, 0.1 * never)} stroke={hexA(RED, 0.7 * never)} strokeDasharray="6 5" />
      <text x={(x(p0) + x(p1)) / 2} y={yL + 46} textAnchor="middle" opacity={never} style={mono(22, RED, { fontWeight: 700 })}>
        never seen ✗
      </text>
      {reads.map((ms) => (
        <g key={ms} opacity={slip}>
          <line x1={x(ms)} y1={yH - 30} x2={x(ms)} y2={yL + 10} stroke={C.amber} strokeWidth={2} />
          <circle cx={x(ms)} cy={yH} r={7} fill={C.amber} />
          <text x={x(ms)} y={yH - 38} textAnchor="middle" style={mono(22, C.amber, { fontWeight: 800 })}>
            1
          </text>
          <text x={x(ms)} y={yL + 36} textAnchor="middle" style={mono(16, C.muted)}>
            {ms} ms
          </text>
        </g>
      ))}
      <text x={x(30) + 20} y={yL - 10} opacity={slip} style={mono(20, GREEN)}>
        reads {TICK_MS} ms apart: all 1
      </text>
    </svg>
  );
};
