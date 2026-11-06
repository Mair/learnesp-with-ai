/**
 * FreeRTOS stacks & watchdog parts:
 *
 *   Shell        a scene: kicker, captions, children laid out on the 1920×1080 frame
 *   StackColumn  a task's stack as a column that fills UP (end of stack at the top); the
 *                most-used mark (amber, dashed), the never-used part above it (GREEN),
 *                overflow past the top (RED), hatching for "set aside, never used"
 *   WatchList    the task watchdog's list: one row per watched task, a 5 s countdown bar
 *                each (cyan; RED when it runs out)
 *   LogPanel     a serial monitor that scrolls: the last `rows` lines that have appeared
 *   CodeSplit    code on the left, crossfading views on the right (like the scheduler
 *                video's CodeViews), plus an optional full-frame `overlay` shown before
 *                the code comes in (`codeIn`)
 *   Menuconfig   the ESP System Settings page, rows lit on their cues
 *
 * Colours: the stack (structure) cyan; the most-used mark amber (your number); never used
 * GREEN; overflow / alarms RED; the watchdog's countdown cyan; blink_fast amber,
 * blink_slow pink, button cyan, idle GREEN (as in the scheduler video).
 */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { CaptionLine } from '../../components/CodeToHardware';
import { CodeLine } from '../../components/CodeLine';
import { ease, GREEN, mono, RED } from '../../components/Explainer';
import { Panel } from '../../components/Panel';
import type { Caption, Mark } from '../../components/pwm';
import { Kicker, Scene } from '../../components/Type';
import { C, FONT, hexA } from '../../theme/palette';
import { clamp01 } from '../freertos-tasks/parts';
import type { LogLine } from './timeline';

export { after, clamp01, inOutLocal, mix, Pill, Verdict, LedCard } from '../freertos-tasks/parts';
export { GREEN, RED };

export const TASK_COLOR: Record<string, string> = { blink_fast: C.amber, blink_slow: C.pink, button: C.cyan, IDLE0: GREEN, IDLE1: GREEN };

// ── Shell ─────────────────────────────────────────────────────────────────

export const Shell: React.FC<{ frames: number; kicker: string; accent?: 'cyan' | 'amber' | 'magenta'; captions: Caption[]; t: number; children: React.ReactNode }> = ({
  frames,
  kicker,
  accent = 'cyan',
  captions,
  t,
  children,
}) => (
  <Scene durationInFrames={frames}>
    <AbsoluteFill>
      <div style={{ position: 'absolute', top: 40, width: '100%', display: 'grid', placeItems: 'center' }}>
        <Kicker delay={0.1} accent={accent}>
          {kicker}
        </Kicker>
      </div>
      {children}
      <div style={{ position: 'absolute', top: 944, width: '100%', display: 'grid', placeItems: 'center' }}>
        <CaptionLine captions={captions} t={t} size={32} />
      </div>
    </AbsoluteFill>
  </Scene>
);

/** fade + rise in at `p` (0..1) */
export const rise = (p: number, dy = 24): React.CSSProperties => ({ opacity: p, transform: `translateY(${(1 - p) * dy}px)` });

// ── StackColumn ───────────────────────────────────────────────────────────

export type ColumnNote = { frac: number; text: React.ReactNode; color: string; p: number; side?: 'left' | 'right'; dy?: number };

export const StackColumn: React.FC<{
  w?: number;
  h: number;
  /** title above (the task) and the size label under it */
  title?: React.ReactNode;
  size?: React.ReactNode;
  /** fill level, a fraction of the stack; > 1 spills over the top in RED */
  level: number;
  /** the most-used mark (fraction) and its opacity */
  high?: number | null;
  highP?: number;
  /** a second, ghosted mark (an earlier reading) */
  ghost?: number | null;
  ghostP?: number;
  /** GREEN tint + bracket over the never-used part (above `high`) */
  freeP?: number;
  /** hatching over the part above the level: set aside, never used */
  hatchP?: number;
  notes?: ColumnNote[];
  color?: string;
}> = ({ w = 220, h, title, size, level, high = null, highP = 1, ghost = null, ghostP = 1, freeP = 0, hatchP = 0, notes = [], color = C.cyan }) => {
  const over = Math.max(0, level - 1);
  const lv = Math.min(1, Math.max(0, level));
  const y = (f: number) => h * (1 - f);
  const spill = Math.min(over, 0.3) * h;
  const outline = over > 0 ? RED : color;
  const id = `hatch-${w}-${h}`;
  return (
    <div style={{ position: 'relative', width: w, height: h }}>
      {title && <div style={{ position: 'absolute', bottom: h + 18 + spill, left: -80, right: -80, textAlign: 'center', ...mono(24, '#fff', { fontWeight: 700 }) }}>{title}</div>}
      <svg width={w} height={h} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <defs>
          <pattern id={id} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="14" stroke={hexA(C.muted, 0.5)} strokeWidth="3" />
          </pattern>
          <linearGradient id={`${id}-fill`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor={hexA(color, 0.55)} />
            <stop offset="1" stopColor={hexA(color, 0.3)} />
          </linearGradient>
        </defs>
        <rect x={0} y={0} width={w} height={h} rx={10} fill="rgba(10,4,32,.65)" />
        {freeP > 0 && high !== null && <rect x={2} y={2} width={w - 4} height={Math.max(0, y(high) - 2)} rx={8} fill={hexA(GREEN, 0.12 * freeP)} />}
        {hatchP > 0 && <rect x={2} y={2} width={w - 4} height={Math.max(0, y(lv) - 2)} rx={8} fill={`url(#${id})`} opacity={hatchP} />}
        <rect x={2} y={y(lv)} width={w - 4} height={h * lv - 2} rx={8} fill={`url(#${id}-fill)`} />
        {over > 0 && <rect x={2} y={-spill} width={w - 4} height={spill + 4} rx={6} fill={hexA(RED, 0.75)} style={{ filter: `drop-shadow(0 0 16px ${RED})` }} />}
        <rect x={0} y={0} width={w} height={h} rx={10} fill="none" stroke={hexA(outline, 0.8)} strokeWidth={2.5} />
        {/* the end of the stack */}
        <line x1={-14} y1={0} x2={w + 14} y2={0} stroke={hexA(over > 0 ? RED : '#ffffff', 0.7)} strokeWidth={2} />
        {ghost !== null && ghostP > 0 && <line x1={-10} y1={y(ghost)} x2={w + 10} y2={y(ghost)} stroke={hexA(C.amber, 0.45 * ghostP)} strokeWidth={2.5} strokeDasharray="6 8" />}
        {high !== null && highP > 0 && (
          <line x1={-18} y1={y(high)} x2={w + 18} y2={y(high)} stroke={C.amber} strokeWidth={4} strokeDasharray="14 9" opacity={highP} style={{ filter: `drop-shadow(0 0 8px ${C.amber})` }} />
        )}
        {freeP > 0 && high !== null && (
          <g opacity={freeP}>
            <path d={`M ${w + 26} 4 h 12 V ${y(high) - 4} h -12`} fill="none" stroke={GREEN} strokeWidth={3} />
          </g>
        )}
      </svg>
      {notes.map((n, i) => {
        const left = (n.side ?? 'right') === 'left';
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: y(n.frac) - 16 + (n.dy ?? 0),
              ...(left ? { right: w + 34 } : { left: w + 54 }),
              whiteSpace: 'nowrap',
              textAlign: left ? 'right' : 'left',
              ...mono(24, n.color, { fontWeight: 700 }),
              opacity: n.p,
            }}
          >
            {n.text}
          </div>
        );
      })}
      {size && <div style={{ position: 'absolute', top: h + 14, left: -80, right: -80, textAlign: 'center', ...mono(22, C.muted) }}>{size}</div>}
    </div>
  );
};

// ── WatchList ─────────────────────────────────────────────────────────────

export type WatchRow = { name: string; remain: number; p?: number; alarm?: number; note?: React.ReactNode; checkIn?: number };

export const WatchList: React.FC<{ rows: WatchRow[]; w?: number; title?: React.ReactNode; rowH?: number }> = ({ rows, w = 760, title = 'task watchdog · watch list', rowH = 96 }) => (
  <div style={{ width: w }}>
    <div style={{ ...mono(18, C.cyan, { letterSpacing: '.2em', textTransform: 'uppercase' }), marginBottom: 14 }}>{title}</div>
    <div style={{ display: 'grid', gap: 14 }}>
      {rows.map((r) => {
        const col = TASK_COLOR[r.name] ?? '#9aa7ff';
        const alarm = r.alarm ?? 0;
        const bar = alarm > 0.01 ? RED : C.cyan;
        return (
          <div key={r.name} style={{ display: 'grid', gridTemplateColumns: '210px 1fr', alignItems: 'center', gap: 22, height: rowH - 14, ...rise(r.p ?? 1, -18) }}>
            <div
              style={{
                height: rowH - 30,
                borderRadius: 12,
                border: `2px ${r.name.startsWith('IDLE') ? 'dashed' : 'solid'} ${hexA(col, 0.85)}`,
                background: `linear-gradient(${hexA(col, 0.2)}, ${hexA(col, 0.08)}), #150a33`,
                display: 'grid',
                placeItems: 'center',
                ...mono(24, '#fff', { fontWeight: 700 }),
                boxShadow: alarm > 0 ? `0 0 ${30 * alarm}px ${hexA(RED, 0.8 * alarm)}` : undefined,
              }}
            >
              {r.name}
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'relative', height: 30, borderRadius: 8, background: 'rgba(10,4,32,.7)', border: `1.5px solid ${hexA(bar, 0.6)}`, overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${clamp01(r.remain) * 100}%`, background: `linear-gradient(90deg, ${hexA(bar, 0.85)}, ${hexA(bar, 0.45)})` }} />
                {alarm > 0 && <div style={{ position: 'absolute', inset: 0, background: hexA(RED, 0.35 * alarm) }} />}
              </div>
              {r.checkIn !== undefined && r.checkIn > 0 && (
                <div style={{ position: 'absolute', right: -6, top: -30, ...mono(18, GREEN, { fontWeight: 700 }), opacity: r.checkIn }}>✓ check-in</div>
              )}
              {r.note && <div style={{ position: 'absolute', left: 0, top: 36, whiteSpace: 'nowrap', ...mono(19, C.muted) }}>{r.note}</div>}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

/** an idle task's bar: refilled by its idle hook all the time — drawn as a quick sawtooth */
export const idleRemain = (t: number, phase = 0) => 1 - 0.18 * (((t + phase) * 1.7) % 1);

// ── LogPanel ──────────────────────────────────────────────────────────────

export type ShownLine = { at: number; text: string; color?: string; tag?: React.ReactNode; tagColor?: string; tagAt?: number };

export const logColor = (l: LogLine) => (l.kind === 'err' ? RED : l.kind === 'boot' ? C.muted : l.text.includes('press') ? C.cyan : '#cfd6ff');

export const LogPanel: React.FC<{ t: number; lines: ShownLine[]; rows?: number; size?: number; label?: string; right?: React.ReactNode; cps?: number }> = ({
  t,
  lines,
  rows = 10,
  size = 21,
  label = 'idf.py monitor',
  right,
  cps = 90,
}) => {
  const shown = lines.filter((l) => t >= l.at);
  const last = shown.slice(-rows);
  const lh = size * 1.55;
  return (
    <Panel label={label} accent={C.muted} right={right}>
      <div style={{ fontFamily: FONT.mono, fontSize: size, lineHeight: `${lh}px`, height: lh * rows, overflow: 'hidden', whiteSpace: 'pre' }}>
        {last.map((l, i) => {
          const n = Math.floor(clamp01(((t - l.at) * cps) / Math.max(1, l.text.length)) * l.text.length);
          return (
            <div key={`${l.at}-${i}-${l.text}`} style={{ color: l.color ?? C.ink, display: 'flex', gap: 18 }}>
              <span>{l.text.slice(0, n)}</span>
              {l.tag && <span style={{ ...mono(size * 0.95, l.tagColor ?? C.amber, { fontWeight: 700 }), opacity: ease((t - (l.tagAt ?? l.at)) / 0.4) }}>{l.tag}</span>}
            </div>
          );
        })}
      </div>
    </Panel>
  );
};

// ── CodeSplit ─────────────────────────────────────────────────────────────

export type SplitView = { at: number; component: React.FC<{ t: number }>; label: string; accent: string; right?: (t: number) => React.ReactNode; lines?: number[] };
export const SPLIT_CODE_W = 900;
export const SPLIT_VIEW_W = 1700 - SPLIT_CODE_W - 24 - 56;
export const SPLIT_VIEW_H = 690;

export const CodeSplit: React.FC<{
  t: number;
  frames: number;
  kicker: string;
  accent?: 'cyan' | 'amber' | 'magenta';
  file: string;
  code: string[];
  codeSize?: number;
  marks?: (Mark & { line: number })[];
  lineStyle?: (i: number) => React.CSSProperties | undefined;
  views: SplitView[];
  captions: Caption[];
  /** the code and views come in here (default: at the start) */
  codeIn?: number;
  /** full-frame picture shown before `codeIn` (fades out as the code comes in) */
  overlay?: React.ReactNode;
}> = ({ t, frames, kicker, accent = 'cyan', file, code, codeSize = 19, marks = [], lineStyle, views, captions, codeIn = 0.2, overlay }) => {
  const order = [...views].sort((a, b) => a.at - b.at);
  let cur = -1;
  order.forEach((v, i) => {
    if (t >= v.at) cur = i;
  });
  const view = cur >= 0 ? order[cur] : null;
  const lines = new Set(view?.lines ?? []);
  const cin = ease((t - codeIn) / 0.6);
  const vin = ease((t - Math.max(codeIn, order[0].at - 0.1)) / 0.6);
  const oOut = overlay ? 1 - ease((t - (codeIn - 0.5)) / 0.5) : 0;
  return (
    <Shell frames={frames} kicker={kicker} accent={accent} captions={captions} t={t}>
      {overlay && oOut > 0.001 && <div style={{ position: 'absolute', inset: 0, opacity: oOut }}>{overlay}</div>}
      {cin > 0.001 && (
        <div style={{ position: 'absolute', left: 110, top: 120, width: 1700, height: 790, display: 'grid', gridTemplateColumns: `${SPLIT_CODE_W}px 1fr`, gap: 24 }}>
          <div style={rise(cin, 20)}>
            <Panel label={file} accent={C.cyan} right="ESP-IDF">
              <pre style={{ margin: 0, fontFamily: FONT.mono, fontSize: codeSize, lineHeight: 1.6, color: '#cfd6ff' }}>
                {code.map((l, i) => {
                  const ms = marks.filter((m) => m.line === i);
                  const on = lines.has(i);
                  return (
                    <div key={i} style={{ minHeight: '1.6em', ...lineStyle?.(i) }}>
                      <CodeLine text={l} t={t} litAt={on ? (view?.at ?? 0) : null} live={on} marks={ms} row={ms.some((m) => m.label) ? 1 : 0} />
                    </div>
                  );
                })}
              </pre>
            </Panel>
          </div>
          {view && (
            <div style={rise(vin * cin, 24)}>
              <Panel label={view.label} accent={view.accent} right={view.right?.(t)}>
                <div style={{ position: 'relative', width: SPLIT_VIEW_W, height: SPLIT_VIEW_H }}>
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
      )}
    </Shell>
  );
};

// ── Menuconfig ────────────────────────────────────────────────────────────

export type MenuRow = { box: string; text: string; lit?: number; boxColor?: string };

export const Menuconfig: React.FC<{ rows: MenuRow[]; path: string; w?: number }> = ({ rows, path, w = 1180 }) => (
  <div style={{ width: w }}>
    <Panel label="idf.py menuconfig" accent={C.cyan} right="sdkconfig">
      <div style={{ ...mono(20, C.muted), marginBottom: 18 }}>{path}</div>
      <div style={{ display: 'grid', gap: 6 }}>
        {rows.map((r, i) => {
          const lit = r.lit ?? 0;
          return (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '90px 1fr',
                padding: '8px 14px',
                borderRadius: 8,
                background: hexA(C.amber, 0.14 * lit),
                border: `1.5px solid ${hexA(C.amber, 0.7 * lit)}`,
                ...mono(26, lit > 0.5 ? '#fff' : '#cfd6ff'),
              }}
            >
              <span style={{ color: r.boxColor ?? C.cyan, fontWeight: 700 }}>{r.box}</span>
              <span>{r.text}</span>
            </div>
          );
        })}
      </div>
    </Panel>
  </div>
);

/** a push button seen from the side: up, or pressed (jammed) */
export const Button: React.FC<{ down: number; jammed?: number; label?: string }> = ({ down, jammed = 0, label = 'GPIO 18' }) => (
  <div style={{ position: 'relative', width: 220, height: 200 }}>
    <svg width={220} height={170} viewBox="0 0 220 170" style={{ overflow: 'visible' }}>
      <rect x={20} y={120} width={180} height={34} rx={8} fill="#1c1240" stroke={hexA(C.cyan, 0.6)} strokeWidth={2} />
      <rect x={70} y={40 + 46 * down} width={80} height={80 - 46 * down} rx={10} fill={hexA(C.cyan, 0.35)} stroke={C.cyan} strokeWidth={2.5} />
      <rect x={58} y={30 + 46 * down} width={104} height={18} rx={6} fill={C.cyan} />
      {jammed > 0 && (
        <g opacity={jammed}>
          <line x1={40} y1={14 + 46 * down} x2={180} y2={64 + 46 * down} stroke={RED} strokeWidth={5} strokeLinecap="round" />
          <line x1={180} y1={14 + 46 * down} x2={40} y2={64 + 46 * down} stroke={RED} strokeWidth={5} strokeLinecap="round" />
        </g>
      )}
    </svg>
    <div style={{ textAlign: 'center', ...mono(20, C.muted) }}>{label}</div>
  </div>
);
