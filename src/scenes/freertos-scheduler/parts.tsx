/**
 * FreeRTOS-scheduler parts:
 *
 *   TaskChip    a task as a chip: its name and its priority (big)
 *   Board       the scheduler picture: Running (core 0 / core 1) · Ready · Blocked,
 *               chips gliding between slots on their cues
 *   CodeViews   code on the left (wider than CodeAndViews, for full xTaskCreate lines),
 *               crossfading views on the right
 *   SimLanes    LED and CPU lanes drawn from the scheduler model (sim.ts)
 *
 * Colours: blink_fast amber, blink_slow pink (as in freertos-tasks), workers purple,
 * button cyan, idle GREEN (dashed). States: Running green, Ready cyan, Blocked magenta.
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
import { clamp01, inOutLocal, Lanes, Span } from '../freertos-tasks/parts';
import { ledAt, Sim, wanted } from './sim';

export { after, clamp01, inOutLocal, mix, Pill, Verdict, SerialLog, LedCard, Ladder, Lanes, STATE_COLOR, Code } from '../freertos-tasks/parts';
export type { Span } from '../freertos-tasks/parts';
export { GREEN, RED };

export const WORK = C.purple;
export const TASK_COLOR: Record<string, string> = {
  blink_fast: C.amber,
  blink_slow: C.pink,
  work_a: WORK,
  work_b: WORK,
  button: C.cyan,
  IDLE0: GREEN,
  IDLE1: GREEN,
};
export const colorOf = (name: string) => TASK_COLOR[name] ?? '#9aa7ff';

// ── TaskChip ──────────────────────────────────────────────────────────────

export const CHIP_W = 230;
export const CHIP_H = 84;

export const TaskChip: React.FC<{ name: string; prio: number | string; color?: string; dim?: number; w?: number; h?: number; note?: React.ReactNode; glow?: number }> = ({
  name,
  prio,
  color,
  dim = 0,
  w = CHIP_W,
  h = CHIP_H,
  note,
  glow = 0,
}) => {
  const col = color ?? colorOf(name);
  return (
    <div style={{ position: 'relative', width: w, height: h, opacity: 1 - 0.55 * dim }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 14,
          border: `2px solid ${hexA(col, 0.85)}`,
          background: `linear-gradient(${hexA(col, 0.2)}, ${hexA(col, 0.1)}), #150a33`,
          boxShadow: glow > 0 ? `0 0 ${30 * glow}px ${hexA(col, 0.7 * glow)}` : undefined,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 10px 0 18px',
          boxSizing: 'border-box',
        }}
      >
        <span style={mono(22, '#fff', { fontWeight: 700 })}>{name}</span>
        <span
          style={{
            ...mono(String(prio).length > 2 ? 24 : 34, '#140818', { fontWeight: 800 }),
            minWidth: 52,
            padding: '0 6px',
            boxSizing: 'border-box',
            height: 56,
            borderRadius: 10,
            display: 'grid',
            placeItems: 'center',
            background: col,
          }}
        >
          {prio}
        </span>
      </div>
      {note && <div style={{ position: 'absolute', left: -80, right: -80, top: h + 6, textAlign: 'center', whiteSpace: 'nowrap', ...mono(18, col, { fontWeight: 700 }) }}>{note}</div>}
    </div>
  );
};

// ── Board ─────────────────────────────────────────────────────────────────

export type Slot = 'core0' | 'core1' | 'run' | `ready${number}` | `blocked${number}` | 'off';
export type ChipPath = {
  name: string;
  prio: number | ((t: number) => number | string);
  color?: string;
  /** [time, slot] — the chip glides to `slot` at `time` */
  path: [number, Slot][];
  dim?: (t: number) => number;
  note?: (t: number) => React.ReactNode;
  glow?: (t: number) => number;
};

export const BOARD_W = 1544;
export const BOARD_H = 610;
const ROW = { run: 105, ready: 315, blocked: 515 };
const ZONE_X = 260;

function slotXY(s: Slot, split: number): [number, number] {
  if (s === 'core0') return [ZONE_X + 230 + (1 - split) * 300, ROW.run];
  if (s === 'core1') return [ZONE_X + 830 - (1 - split) * 300, ROW.run];
  if (s === 'run') return [ZONE_X + 530, ROW.run];
  if (s === 'off') return [BOARD_W + 300, ROW.ready];
  const m = /^(ready|blocked)(\d+)$/.exec(s)!;
  const i = Number(m[2]);
  return [ZONE_X + 150 + i * 260, m[1] === 'ready' ? ROW.ready : ROW.blocked];
}

/** where a chip is at t: glides 0.6 s from its previous slot to the next */
function chipXY(path: [number, Slot][], t: number, split: number): { x: number; y: number; show: number } {
  let i = 0;
  for (let k = 0; k < path.length; k++) if (t >= path[k][0]) i = k;
  const cur = path[i];
  const prev = i > 0 ? path[i - 1] : null;
  const [x1, y1] = slotXY(cur[1], split);
  const show = ease((t - path[0][0]) / 0.4);
  if (!prev) return { x: x1, y: y1, show };
  const u = inOutLocal((t - cur[0]) / 0.6);
  const [x0, y0] = slotXY(prev[1], split);
  // arc a little so a chip passing another doesn't slide through it
  const lift = Math.sin(Math.PI * u) * (y0 === y1 ? -60 : 0);
  return { x: x0 + (x1 - x0) * u, y: y0 + (y1 - y0) * u + lift, show };
}

export const Board: React.FC<{
  t: number;
  chips: ChipPath[];
  /** 0 = one "Running" box, 1 = two cores */
  split?: number;
  /** 0..1 per zone: how lit each zone label is */
  zones?: { run?: number; ready?: number; blocked?: number };
  zoneNotes?: { run?: React.ReactNode; ready?: React.ReactNode; blocked?: React.ReactNode };
  children?: React.ReactNode;
}> = ({ t, chips, split = 1, zones = { run: 1, ready: 1, blocked: 1 }, zoneNotes = {}, children }) => {
  const Z: { k: 'run' | 'ready' | 'blocked'; label: string; col: string; y: number }[] = [
    { k: 'run', label: 'Running', col: GREEN, y: ROW.run },
    { k: 'ready', label: 'Ready', col: C.cyan, y: ROW.ready },
    { k: 'blocked', label: 'Blocked', col: C.magenta, y: ROW.blocked },
  ];
  const coreBox = (x: number, label: string, p: number) => (
    <div
      key={label}
      style={{
        position: 'absolute',
        left: x - 180,
        top: ROW.run - 72,
        width: 360,
        height: 144,
        borderRadius: 18,
        border: `2px dashed ${hexA(GREEN, 0.55)}`,
        background: hexA(GREEN, 0.05),
        opacity: p,
      }}
    >
      <div style={{ position: 'absolute', top: -26, left: 0, right: 0, textAlign: 'center', ...mono(18, GREEN, { fontWeight: 700, letterSpacing: '.12em' }) }}>{label}</div>
    </div>
  );
  return (
    <div style={{ position: 'relative', width: BOARD_W, height: BOARD_H }}>
      {Z.map((z) => {
        const p = zones[z.k] ?? 0;
        return (
          <div key={z.k} style={{ position: 'absolute', left: 0, top: z.y - 70, width: BOARD_W, height: 140, opacity: p }}>
            <div style={{ position: 'absolute', left: 0, top: 0, width: 210, height: 140, borderRadius: 16, border: `2px solid ${hexA(z.col, 0.7)}`, background: hexA(z.col, 0.1), display: 'grid', placeItems: 'center', alignContent: 'center', gap: 4 }}>
              <div style={mono(28, z.col, { fontWeight: 800 })}>{z.label}</div>
              {zoneNotes[z.k] && <div style={{ ...mono(17, C.ink), textAlign: 'center', padding: '0 10px' }}>{zoneNotes[z.k]}</div>}
            </div>
            {z.k !== 'run' && <div style={{ position: 'absolute', left: 230, right: 0, top: 68, height: 2, background: `linear-gradient(90deg, ${hexA(z.col, 0.35)}, transparent)` }} />}
          </div>
        );
      })}
      {(zones.run ?? 0) > 0 && (
        <>
          {split < 1 && (
            <div style={{ position: 'absolute', left: ZONE_X + 530 - 200, top: ROW.run - 72, width: 400, height: 144, borderRadius: 18, border: `2px dashed ${hexA(GREEN, 0.55)}`, opacity: (zones.run ?? 0) * (1 - split) }}>
              <div style={{ position: 'absolute', top: -26, left: 0, right: 0, textAlign: 'center', ...mono(18, GREEN, { fontWeight: 700, letterSpacing: '.12em' }) }}>the CPU</div>
            </div>
          )}
          {split > 0 && coreBox(slotXY('core0', split)[0], 'core 0', (zones.run ?? 0) * split)}
          {split > 0 && coreBox(slotXY('core1', split)[0], 'core 1', (zones.run ?? 0) * split)}
        </>
      )}
      {chips.map((c, i) => {
        if (t < c.path[0][0] - 0.01) return null;
        const { x, y, show } = chipXY(c.path, t, split);
        const prio = typeof c.prio === 'function' ? c.prio(t) : c.prio;
        return (
          <div key={i} style={{ position: 'absolute', left: x - CHIP_W / 2, top: y - CHIP_H / 2, opacity: show }}>
            <TaskChip name={c.name} prio={prio} color={c.color} dim={c.dim?.(t) ?? 0} note={c.note?.(t)} glow={c.glow?.(t) ?? 0} />
          </div>
        );
      })}
      {children}
    </div>
  );
};

// ── CodeViews ─────────────────────────────────────────────────────────────

export type CodeView = { at: number; component: React.FC<{ t: number }>; label: string; accent: string; right?: (t: number) => React.ReactNode; lines?: number[] };
export const CV_CODE_W = 900;
export const CV_VIEW_W = 1700 - CV_CODE_W - 24 - 56;
export const CV_VIEW_H = 690;

export const CodeViews: React.FC<{
  t: number;
  frames: number;
  kicker: string;
  accent?: 'cyan' | 'amber' | 'magenta';
  file: string | ((t: number) => string);
  code: string[];
  codeSize?: number;
  marks?: (Mark & { line: number })[];
  /** per-line style override (struck-out lines, inserted lines) */
  lineStyle?: (i: number) => React.CSSProperties | undefined;
  views: CodeView[];
  captions: Caption[];
}> = ({ t, frames, kicker, accent = 'cyan', file, code, codeSize = 19, marks = [], lineStyle, views, captions }) => {
  const order = [...views].sort((a, b) => a.at - b.at);
  let cur = -1;
  order.forEach((v, i) => {
    if (t >= v.at) cur = i;
  });
  const view = cur >= 0 ? order[cur] : null;
  const lines = new Set(view?.lines ?? []);
  const cin = ease((t - 0.2) / 0.6);
  const vin = ease((t - (order[0].at - 0.1)) / 0.6);
  return (
    <Scene durationInFrames={frames}>
      <AbsoluteFill>
        <div style={{ position: 'absolute', top: 40, width: '100%', display: 'grid', placeItems: 'center' }}>
          <Kicker delay={0.1} accent={accent}>
            {kicker}
          </Kicker>
        </div>
        <div style={{ position: 'absolute', left: 110, top: 120, width: 1700, height: 790, display: 'grid', gridTemplateColumns: `${CV_CODE_W}px 1fr`, gap: 24 }}>
          <div style={{ opacity: cin, transform: `translateY(${(1 - cin) * 20}px)` }}>
            <Panel label={typeof file === 'function' ? file(t) : file} accent={C.cyan} right="ESP-IDF">
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
            <div style={{ opacity: vin, transform: `translateY(${(1 - vin) * 24}px)` }}>
              <Panel label={view.label} accent={view.accent} right={view.right?.(t)}>
                <div style={{ position: 'relative', width: CV_VIEW_W, height: CV_VIEW_H }}>
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

// ── SimLanes ──────────────────────────────────────────────────────────────

/** blink slivers are drawn this wide (ms) so they can be seen; really they take microseconds */
export const SLIVER = 14;

export type LaneKind = 'want' | 'fast' | 'slow' | 'core0' | 'core1';

export const SimLanes: React.FC<{
  sim: Sim;
  W: number;
  s0: number;
  s1: number;
  now: number;
  show: LaneKind[];
  lateMarks?: boolean;
}> = ({ sim, W, s0, s1, now, show, lateMarks = true }) => {
  const lanes: { name: string; color: string; spans?: Span[]; level?: (s: number) => number; h?: number }[] = [];
  const marks: { s: number; label: string; color: string; lane: number }[] = [];
  for (const k of show) {
    if (k === 'want') lanes.push({ name: 'GPIO 2 · want', color: hexA(C.amber, 0.6), level: (s) => wanted(200, s), h: 40 });
    if (k === 'fast') {
      lanes.push({ name: 'GPIO 2 · real', color: C.amber, level: (s) => ledAt(sim.edges.fast, s), h: 40 });
      if (lateMarks) for (const e of sim.late) if (e >= s0 && e <= s1) marks.push({ s: e, label: 'late', color: RED, lane: lanes.length - 1 });
    }
    if (k === 'slow') lanes.push({ name: 'GPIO 19', color: C.pink, level: (s) => ledAt(sim.edges.slow, s), h: 40 });
    if (k === 'core0' || k === 'core1') {
      const c = k === 'core0' ? 0 : 1;
      const spans: Span[] = sim.cores[c].map((x) => ({ a: x.a, b: x.b, color: WORK, label: `${x.task} · ${x.prio}` }));
      for (const b of sim.blinks) if (b.core === c) spans.push({ a: b.t, b: b.t + SLIVER, color: colorOf(b.task) });
      lanes.push({ name: `core ${c}`, color: GREEN, spans });
    }
  }
  return <Lanes W={W} s0={s0} s1={s1} now={now} lanes={lanes} marks={marks} axis={axisFor(s0, s1)} />;
};

const axisFor = (s0: number, s1: number) => {
  const step = s1 - s0 > 2500 ? 1000 : 500;
  const out: { s: number; label: string }[] = [];
  for (let s = Math.ceil(s0 / step) * step; s <= s1; s += step) out.push({ s, label: `${(s / 1000).toFixed(s % 1000 ? 1 : 0)} s` });
  return out;
};

// ── MiniBoard (for a CodeViews view: 720 × 690) ───────────────────────────

export type MiniSlot = 'core0' | 'core1' | 'ready' | 'ready2' | 'blocked' | 'blocked2';
const MINI: Record<MiniSlot, [number, number]> = {
  core0: [200, 110],
  core1: [200, 300],
  ready: [530, 205],
  ready2: [530, 315],
  blocked: [200, 560],
  blocked2: [500, 560],
};
export type MiniChip = { name: string; prio: number | ((t: number) => number); path: [number, MiniSlot][]; glow?: (t: number) => number; dim?: (t: number) => number; note?: (t: number) => React.ReactNode };

export const MiniBoard: React.FC<{ t: number; chips: MiniChip[]; children?: React.ReactNode }> = ({ t, chips, children }) => (
  <div style={{ position: 'absolute', inset: 0 }}>
    {(['core0', 'core1'] as const).map((k, i) => (
      <div key={k} style={{ position: 'absolute', left: MINI[k][0] - 165, top: MINI[k][1] - 62, width: 330, height: 124, borderRadius: 16, border: `2px dashed ${hexA(GREEN, 0.55)}`, background: hexA(GREEN, 0.05) }}>
        <div style={{ position: 'absolute', top: -24, left: 0, ...mono(17, GREEN, { fontWeight: 700, letterSpacing: '.12em' }) }}>RUNNING · core {i}</div>
      </div>
    ))}
    <div style={{ position: 'absolute', left: 395, top: 120, width: 270, height: 270, borderRadius: 16, border: `2px solid ${hexA(C.cyan, 0.45)}`, background: hexA(C.cyan, 0.05) }}>
      <div style={{ position: 'absolute', top: -24, left: 0, ...mono(17, C.cyan, { fontWeight: 700, letterSpacing: '.12em' }) }}>READY</div>
    </div>
    <div style={{ position: 'absolute', left: 35, top: 480, width: 630, height: 160, borderRadius: 16, border: `2px solid ${hexA(C.magenta, 0.45)}`, background: hexA(C.magenta, 0.05) }}>
      <div style={{ position: 'absolute', top: -24, left: 0, ...mono(17, C.magenta, { fontWeight: 700, letterSpacing: '.12em' }) }}>BLOCKED</div>
    </div>
    {chips.map((c, i) => {
      if (t < c.path[0][0] - 0.01) return null;
      let k = 0;
      for (let j = 0; j < c.path.length; j++) if (t >= c.path[j][0]) k = j;
      const [x1, y1] = MINI[c.path[k][1]];
      let x = x1;
      let y = y1;
      if (k > 0) {
        const u = inOutLocal((t - c.path[k][0]) / 0.6);
        const [x0, y0] = MINI[c.path[k - 1][1]];
        x = x0 + (x1 - x0) * u;
        y = y0 + (y1 - y0) * u;
      }
      const prio = typeof c.prio === 'function' ? c.prio(t) : c.prio;
      return (
        <div key={i} style={{ position: 'absolute', left: x - 115, top: y - 42, opacity: ease((t - c.path[0][0]) / 0.4) }}>
          <TaskChip name={c.name} prio={prio} glow={c.glow?.(t) ?? 0} dim={c.dim?.(t) ?? 0} note={c.note?.(t)} />
        </div>
      );
    })}
    {children}
  </div>
);
