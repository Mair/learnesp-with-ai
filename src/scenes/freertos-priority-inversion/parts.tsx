/**
 * FreeRTOS priority inversion parts:
 *
 *   TaskTag     a task's name + priority badge, in its lane colour
 *   BufferBox   the shared buffer (amber = your data) with its lock (cyan = structure)
 *   Lanes       one lane per task over time (ms): who runs, who waits for the lock, who
 *               runs with a borrowed priority (boost), who sleeps; low's lock-hold line; a
 *               playhead; a broken axis (0–100 ms | the long middle | 1000–1100 ms) so the
 *               first 100 ms are readable and the whole second still fits
 *
 * Shared from earlier FreeRTOS videos: Shell, LogPanel, Snippet, ScoreCard, rise, after …
 * Colours: high magenta, medium purple, low blue (lane colours); waiting = hatched in the
 * waiter's colour; a borrowed priority = the lender's colour; the lock cyan; RED / GREEN for
 * the wait each run measured.
 */
import React from 'react';
import { ease, mono } from '../../components/Explainer';
import { C, hexA } from '../../theme/palette';
import { CHART_W, LANE_COLOR, LANES, PRIO, type Lane, type Run, xOf } from './timeline';

export { after, clamp01, GREEN, LogPanel, RED, rise, ScoreCard, Shell, Snippet } from '../freertos-queues/parts';
export type { ScoreRow } from '../freertos-queues/parts';
import { clamp01, GREEN, RED } from '../freertos-queues/parts';

export const TaskTag: React.FC<{ lane: Lane; prio?: number; w?: number; glow?: number; size?: number }> = ({ lane, prio = PRIO[lane], w = 230, glow = 0, size = 28 }) => {
  const col = LANE_COLOR[lane];
  return (
    <div
      style={{
        width: w,
        boxSizing: 'border-box',
        height: 64,
        borderRadius: 14,
        border: `2px solid ${hexA(col, 0.85)}`,
        background: `linear-gradient(${hexA(col, 0.24)}, ${hexA(col, 0.1)}), #150a33`,
        boxShadow: glow > 0 ? `0 0 ${28 * glow}px ${hexA(col, 0.7 * glow)}` : undefined,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 14px 0 18px',
        ...mono(size, '#fff', { fontWeight: 700 }),
      }}
    >
      <span>{lane}</span>
      <span style={{ ...mono(size * 0.8, col, { fontWeight: 800 }), padding: '2px 10px', borderRadius: 999, border: `1.5px solid ${hexA(col, 0.7)}`, background: 'rgba(10,4,32,.6)' }}>{prio}</span>
    </div>
  );
};

/** a padlock, cyan */
export const Lock: React.FC<{ size?: number; open?: number; color?: string }> = ({ size = 34, open = 0, color = C.cyan }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{ overflow: 'visible' }}>
    <path d={`M 12 18 V 12 A 8 8 0 0 1 28 12 V ${18 - 6 * open}`} fill="none" stroke={color} strokeWidth={4} transform={open ? `translate(0 ${-4 * open})` : undefined} />
    <rect x={7} y={18} width={26} height={18} rx={4} fill={hexA(color, 0.25)} stroke={color} strokeWidth={3} />
  </svg>
);

export const BufferBox: React.FC<{ show?: number; pulse?: number; label?: string }> = ({ show = 1, pulse = 0, label = 'shared buffer' }) => (
  <div style={{ display: 'grid', justifyItems: 'center', gap: 10, opacity: show }}>
    <Lock size={46} />
    <div
      style={{
        width: 300,
        height: 110,
        borderRadius: 16,
        border: `2.5px solid ${hexA(C.amber, 0.8)}`,
        background: 'rgba(10,4,32,.7)',
        boxShadow: `0 0 ${18 + 24 * pulse}px ${hexA(C.amber, 0.25 + 0.4 * pulse)}`,
        display: 'grid',
        placeItems: 'center',
        ...mono(30, C.amber, { fontWeight: 800 }),
      }}
    >
      {label}
    </div>
  </div>
);

// ── Lanes ─────────────────────────────────────────────────────────────────

export const LANE_H = 70;
export const LANE_GAP = 16;
const LABEL_W = 250;
const hatch = (col: string) => `repeating-linear-gradient(135deg, ${hexA(col, 0.38)} 0 10px, ${hexA(col, 0.08)} 10px 20px)`;

export const Lanes: React.FC<{
  run: Run;
  play: number;
  /** waiting annotation colour (RED for a long wait, GREEN for a short one) */
  verdict?: string;
  show?: number;
  /** borrowed priority label in low's lane */
  boostLabel?: string;
}> = ({ run, play, verdict = RED, show = 1, boostLabel = 'at 3' }) => {
  const laneY = (l: Lane) => LANES.indexOf(l) * (LANE_H + LANE_GAP);
  const totalH = LANES.length * (LANE_H + LANE_GAP) - LANE_GAP;
  const px = (ms: number) => LABEL_W + xOf(ms);
  const holdEnd = Math.min(run.give, play);
  const waitSeg = run.segs.find((s) => s.lane === 'high' && s.kind === 'wait');
  return (
    <div style={{ position: 'relative', width: LABEL_W + CHART_W + 40, height: totalH + 90, opacity: show }}>
      {LANES.map((l) => (
        <div key={l} style={{ position: 'absolute', left: 0, top: laneY(l) + (LANE_H - 64) / 2 }}>
          <TaskTag lane={l} w={210} size={26} />
        </div>
      ))}
      {/* lane tracks */}
      {LANES.map((l) => (
        <div key={l} style={{ position: 'absolute', left: LABEL_W, top: laneY(l), width: CHART_W, height: LANE_H, borderRadius: 8, background: 'rgba(255,255,255,.035)', borderTop: '1px solid rgba(255,255,255,.06)' }} />
      ))}
      {/* the squeezed middle */}
      <div style={{ position: 'absolute', left: px(100), top: -8, width: px(1000) - px(100), height: totalH + 16, background: 'repeating-linear-gradient(90deg, rgba(255,255,255,.05) 0 2px, transparent 2px 14px)', borderLeft: '2px dashed rgba(255,255,255,.18)', borderRight: '2px dashed rgba(255,255,255,.18)' }} />
      {/* segments */}
      {run.segs.map((s, i) => {
        if (play <= s.from) return null;
        const x0 = px(s.from);
        const x1 = px(Math.min(s.to, play));
        const col = s.kind === 'boost' ? LANE_COLOR.high : LANE_COLOR[s.lane];
        const solid = s.kind === 'run' || s.kind === 'boost';
        const bg = solid ? `linear-gradient(${hexA(col, 0.95)}, ${hexA(col, 0.7)})` : s.kind === 'wait' ? hatch(col) : hatch(C.muted);
        const label = s.kind === 'wait' ? 'waiting for the lock' : s.kind === 'sleep' ? 'asleep, holding the lock' : s.kind === 'boost' ? boostLabel : '';
        return (
          <div key={i} style={{ position: 'absolute', left: x0, top: laneY(s.lane) + 6, width: Math.max(2, x1 - x0), height: LANE_H - 12, borderRadius: 6, background: bg, border: solid ? `1px solid ${hexA(col, 0.9)}` : `2px dashed ${hexA(col, 0.8)}`, boxSizing: 'border-box', overflow: 'hidden', display: 'flex', alignItems: 'center', paddingLeft: 10, whiteSpace: 'nowrap', ...mono(20, solid ? '#fff' : col, { fontWeight: 700 }) }}>
            {x1 - x0 > (s.kind === 'boost' ? 70 : 120) ? label : s.kind === 'boost' && x1 - x0 > 24 ? '3' : ''}
          </div>
        );
      })}
      {/* low holds the lock */}
      {play > 0 && (
        <>
          <div style={{ position: 'absolute', left: px(0), top: laneY('low') + LANE_H + 4, width: Math.max(2, px(holdEnd) - px(0)), height: 6, borderRadius: 3, background: C.cyan, boxShadow: `0 0 12px ${hexA(C.cyan, 0.6)}` }} />
          <div style={{ position: 'absolute', left: px(holdEnd) - 17, top: laneY('low') + LANE_H - 30, opacity: play < run.give ? 1 : 0 }}>
            <Lock size={30} />
          </div>
        </>
      )}
      {/* high has it */}
      {play >= run.got && (
        <div style={{ position: 'absolute', left: px(run.got) - 15, top: laneY('high') - 36 }}>
          <Lock size={30} open={1} />
        </div>
      )}
      {/* the wait, measured */}
      {waitSeg && play >= run.got && (
        <div style={{ position: 'absolute', left: px(waitSeg.from), width: px(run.got) - px(waitSeg.from), top: laneY('high') - 40, textAlign: 'center', opacity: ease((play - run.got) / 20) }}>
          <div style={{ ...mono(24, verdict, { fontWeight: 800 }), whiteSpace: 'nowrap', display: 'inline-block', padding: '2px 12px', borderRadius: 10, background: 'rgba(10,4,32,.85)', border: `1.5px solid ${hexA(verdict, 0.7)}` }}>high waited {run.waited} ms</div>
        </div>
      )}
      {/* playhead */}
      <div style={{ position: 'absolute', left: px(play) - 1, top: -10, width: 2, height: totalH + 20, background: hexA('#ffffff', play > 0 && play < 1099 ? 0.65 : 0) }} />
      {/* axis */}
      {[0, 50, 100, 1000, 1050, 1100].map((m) => (
        <div key={m} style={{ position: 'absolute', left: px(m) - 40, width: 80, top: totalH + 14, textAlign: 'center', ...mono(18, C.muted) }}>
          {m} ms
        </div>
      ))}
      <div style={{ position: 'absolute', left: px(100), width: px(1000) - px(100), top: totalH + 40, textAlign: 'center', ...mono(17, C.muted, { fontStyle: 'italic' }) }}>⟵ 900 ms squeezed ⟶</div>
    </div>
  );
};

/** a big two-word name landing (gradient), e.g. PRIORITY INVERSION */
export const Hero: React.FC<{ p: number; children: React.ReactNode; size?: number }> = ({ p, children, size = 92 }) => (
  <div
    style={{
      backgroundImage: `linear-gradient(100deg, ${C.cyan}, #fff 38%, ${C.magenta} 72%, ${C.amber})`,
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
      fontSize: size,
      fontWeight: 800,
      letterSpacing: '.04em',
      textAlign: 'center',
      opacity: clamp01(p),
      transform: `scale(${0.92 + 0.08 * clamp01(p)})`,
    }}
  >
    {children}
  </div>
);

export const LOG_LINE_COLOR = (l: string) => (l.includes('high:') ? LANE_COLOR.high : l.includes('medium:') ? '#c9a2f2' : l.includes('low:') ? '#8fb6ff' : '#cfd6ff');
export { GREEN as OK };
