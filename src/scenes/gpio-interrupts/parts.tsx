/**
 * GPIO-interrupt parts:
 *
 *   CodeAndViews  Kicker + a code panel on the left (lines light on their cue)
 *                 + crossfading views on the right + caption — for scenes about
 *                 a block of code rather than one call (gpio_config, the ISR)
 *   Bits          a row of register bit cells (bit n on the left), one hot bit
 *   Lanes         time lanes: the pin's level, the CPU (task / ISR / idle), the task
 *
 * Colour meanings (STYLE.md): pin = pink, the wire = magenta, structure = cyan,
 * your function / your value = amber, works = GREEN, wrong = RED.
 */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { CaptionLine } from '../../components/CodeToHardware';
import { CodeLine } from '../../components/CodeLine';
import { ease, GREEN, mono } from '../../components/Explainer';
import { Panel } from '../../components/Panel';
import type { Caption, Mark } from '../../components/pwm';
import { Kicker, Scene } from '../../components/Type';
import { C, FONT, hexA } from '../../theme/palette';
import { clamp01 } from '../gpio/parts';

export { after, clamp01, inOutLocal, mix, Pill, Verdict, ViewStage, BIG_W, BIG_H, SerialLog } from '../gpio/parts';
export { InputPin, pinState, VTrace, TactSwitch } from '../gpio-input/parts';

// ── CodeAndViews ──────────────────────────────────────────────────────────

export type CodeView = { at: number; component: React.FC<{ t: number }>; label: string; accent: string; right?: (t: number) => React.ReactNode; lines?: number[] };

export const VIEW2_W = 900;
export const VIEW2_H = 690;

export const CodeAndViews: React.FC<{
  t: number;
  frames: number;
  kicker: string;
  accent?: 'cyan' | 'amber' | 'magenta';
  file: string;
  code: string[];
  codeSize?: number;
  /** extra marks per line */
  marks?: (Mark & { line: number })[];
  views: CodeView[];
  captions: Caption[];
  codeIn?: number;
}> = ({ t, frames, kicker, accent = 'cyan', file, code, codeSize = 22, marks = [], views, captions, codeIn = 0.2 }) => {
  const order = [...views].sort((a, b) => a.at - b.at);
  let cur = -1;
  order.forEach((v, i) => {
    if (t >= v.at) cur = i;
  });
  const view = cur >= 0 ? order[cur] : null;
  const lines = new Set(view?.lines ?? []);
  const cin = ease((t - codeIn) / 0.6);
  const vin = ease((t - (order[0].at - 0.1)) / 0.6);
  return (
    <Scene durationInFrames={frames}>
      <AbsoluteFill>
        <div style={{ position: 'absolute', top: 40, width: '100%', display: 'grid', placeItems: 'center' }}>
          <Kicker delay={0.1} accent={accent}>
            {kicker}
          </Kicker>
        </div>
        <div style={{ position: 'absolute', left: 110, top: 120, width: 1700, height: 790, display: 'grid', gridTemplateColumns: '730px 1fr', gap: 24 }}>
          <div style={{ opacity: cin, transform: `translateY(${(1 - cin) * 20}px)` }}>
            <Panel label={file} accent={C.cyan} right="ESP-IDF">
              <pre style={{ margin: 0, fontFamily: FONT.mono, fontSize: codeSize, lineHeight: 1.6, color: '#cfd6ff' }}>
                {code.map((l, i) => {
                  const ms = marks.filter((m) => m.line === i);
                  const on = lines.has(i);
                  return (
                    <div key={i} style={{ minHeight: '1.6em' }}>
                      <CodeLine text={l} t={t} litAt={on ? (view?.at ?? 0) : null} live={on} marks={ms} row={ms.some((m) => m.label) ? 1 : 0} />
                    </div>
                  );
                })}
              </pre>
            </Panel>
          </div>
          {view && (
            <div style={{ opacity: vin, transform: `translateY(${(1 - vin) * 24}px)` }}>
              <Panel label={view.label} accent={view.accent} right={view.right?.(t)}>
                <div style={{ position: 'relative', width: VIEW2_W, height: VIEW2_H }}>
                  {order.map((v, i) => {
                    const next = order[i + 1]?.at ?? Infinity;
                    const a = ease((t - v.at) / 0.45) * (1 - clamp01((t - (next - 0.35)) / 0.35));
                    if (a <= 0.001) return null;
                    const V = v.component;
                    return (
                      <div key={i} style={{ position: 'absolute', inset: 0, opacity: a }}>
                        <V t={t} />
                      </div>
                    );
                  })}
                </div>
              </Panel>
            </div>
          )}
        </div>
        <div style={{ position: 'absolute', top: 944, width: '100%', display: 'grid', placeItems: 'center' }}>
          <CaptionLine captions={captions} t={t} size={32} />
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ── Bits ──────────────────────────────────────────────────────────────────

export const Bits: React.FC<{
  n: number;
  /** value of bit b */
  bit: (b: number) => 0 | 1 | '·';
  hot?: number;
  hotP?: number;
  color?: string;
  w?: number;
  h?: number;
  labels?: boolean;
  dimOthers?: number;
  from?: number;
}> = ({ n, bit, hot = -1, hotP = 0, color = C.magenta, w = 40, h = 50, labels = true, dimOthers = 0, from }) => {
  const top = from ?? n - 1;
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {Array.from({ length: n }, (_, i) => {
        const b = top - i;
        const v = bit(b);
        const isHot = b === hot;
        const g = isHot ? hotP : 0;
        return (
          <div key={b} style={{ display: 'grid', justifyItems: 'center', gap: 4 }}>
            <div
              style={{
                width: w,
                height: h,
                borderRadius: 7,
                display: 'grid',
                placeItems: 'center',
                boxSizing: 'border-box',
                ...mono(h * 0.46, v === 1 ? '#fff' : hexA(C.ink, 0.35), { fontWeight: 700 }),
                background: g > 0 ? hexA(C.amber, 0.35 * g) : v === 1 ? hexA(color, 0.22) : 'rgba(255,255,255,.03)',
                border: `${g > 0.5 ? 2.5 : 1}px solid ${g > 0.5 ? C.amber : 'rgba(255,255,255,.12)'}`,
                boxShadow: g > 0 ? `0 0 ${18 * g}px ${C.amber}` : undefined,
                opacity: isHot ? 1 : 1 - 0.55 * dimOthers,
              }}
            >
              {v}
            </div>
            {labels && <div style={mono(12, isHot ? C.amber : C.muted)}>{b}</div>}
          </div>
        );
      })}
    </div>
  );
};

// ── Lanes ─────────────────────────────────────────────────────────────────

export type Span = { a: number; b: number; label?: string; color: string; dashed?: boolean };

/**
 * Horizontal lanes over [s0, s1]: each lane is a row of spans (boxes) or a
 * level trace. `now` draws the playhead; everything right of it is hidden.
 */
export const Lanes: React.FC<{
  W: number;
  s0: number;
  s1: number;
  now: number;
  lanes: { name: string; color: string; spans?: Span[]; level?: (s: number) => number; h?: number }[];
  marks?: { s: number; label: string; color: string; lane: number }[];
  axis?: { s: number; label: string }[];
}> = ({ W, s0, s1, now, lanes, marks = [], axis = [] }) => {
  const L = 170;
  const R = W - 20;
  const x = (s: number) => L + ((s - s0) / (s1 - s0)) * (R - L);
  const laneH = 78;
  const H = lanes.length * laneH + 40;
  const clipX = x(Math.min(Math.max(now, s0), s1));
  return (
    <svg width={W} height={H} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <clipPath id={`lanes-${W}-${lanes.length}`}>
          <rect x={0} y={-40} width={clipX} height={H + 80} />
        </clipPath>
      </defs>
      {lanes.map((ln, i) => (
        <text key={ln.name} x={0} y={i * laneH + 44} style={mono(19, ln.color, { fontWeight: 700 })}>
          {ln.name}
        </text>
      ))}
      <g clipPath={`url(#lanes-${W}-${lanes.length})`}>
        {lanes.map((ln, i) => {
          const y0 = i * laneH + 14;
          const h = ln.h ?? 46;
          if (ln.level) {
            let d = '';
            const n = 600;
            for (let k = 0; k <= n; k++) {
              const s = s0 + ((s1 - s0) * k) / n;
              const yy = y0 + (1 - ln.level(s)) * h;
              d += `${d ? ' L' : 'M'} ${x(s).toFixed(1)} ${yy.toFixed(1)}`;
            }
            return <path key={i} d={d} fill="none" stroke={ln.color} strokeWidth={3.5} style={{ filter: `drop-shadow(0 0 5px ${ln.color})` }} />;
          }
          return (
            <g key={i}>
              {(ln.spans ?? []).map((sp, k) => {
                const xa = x(Math.max(sp.a, s0));
                const xb = x(Math.min(sp.b, s1));
                if (xb <= xa) return null;
                return (
                  <g key={k}>
                    <rect x={xa} y={y0} width={xb - xa} height={h} rx={8} fill={hexA(sp.color, sp.dashed ? 0.06 : 0.28)} stroke={sp.color} strokeWidth={1.5} strokeDasharray={sp.dashed ? '6 6' : undefined} />
                    {sp.label && xb - xa > sp.label.length * 10 && (
                      <text x={(xa + xb) / 2} y={y0 + h / 2 + 7} textAnchor="middle" style={mono(18, sp.dashed ? C.muted : '#fff', { fontWeight: 700 })}>
                        {sp.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
        {marks.map((m, i) => (
          <g key={i}>
            <line x1={x(m.s)} y1={m.lane * laneH + 6} x2={x(m.s)} y2={m.lane * laneH + 68} stroke={m.color} strokeWidth={2} strokeDasharray="4 4" />
            <text x={x(m.s) + 6} y={m.lane * laneH + 4} style={mono(15, m.color, { fontWeight: 700 })}>
              {m.label}
            </text>
          </g>
        ))}
      </g>
      {axis.map((a) => (
        <text key={a.label} x={x(a.s)} y={H - 6} textAnchor="middle" style={mono(15, C.muted)}>
          {a.label}
        </text>
      ))}
      {now > s0 && now < s1 && <line x1={clipX} y1={0} x2={clipX} y2={H - 30} stroke={hexA(C.ink, 0.5)} strokeWidth={1.5} />}
    </svg>
  );
};

export { GREEN };
