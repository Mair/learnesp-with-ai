/**
 * FreeRTOS queues parts:
 *
 *   QueueRow   the queue as a row of boxes: items come in at the back (left), move to the
 *              front (right) and leave there, oldest first; dropped presses bounce off
 *   Chip       a task chip (button cyan, led amber); `sleep` dims it and shows "asleep"
 *   ledLevel   the LED from a list of receive times (three 250 ms blinks per press)
 *
 * Shared with the stacks & watchdog video: Shell, CodeSplit, LogPanel, Button, rise …
 * Colours: the queue's boxes (structure) cyan; the items (your data) amber; dropped RED;
 * the button task cyan, the LED task amber (its LED).
 */
import React from 'react';
import { CodeLine } from '../../components/CodeLine';
import { ease, mono } from '../../components/Explainer';
import { C, FONT, hexA } from '../../theme/palette';
import { Button, clamp01, GREEN, LedCard, RED } from '../freertos-stacks-watchdog/parts';
import { BLINK_MS, type Run } from './timeline';

export { after, Button, clamp01, CodeSplit, GREEN, inOutLocal, LedCard, LogPanel, RED, rise, Shell, SPLIT_VIEW_W, Verdict } from '../freertos-stacks-watchdog/parts';

// ── QueueRow ──────────────────────────────────────────────────────────────

export type QItem = { label: string; in: number; out?: number };
export type QDrop = { label: string; at: number };

export const BOX = 108;
export const BOX_GAP = 16;
export const rowWidth = (n: number) => n * BOX + (n - 1) * BOX_GAP;

export const QueueRow: React.FC<{
  t: number;
  items: QItem[];
  drops?: QDrop[];
  n?: number;
  show?: number;
  /** "4 bytes" under each box */
  bytesP?: number;
  /** "back" / "front" labels */
  endsP?: number;
  /** highlight the whole row (e.g. full) */
  full?: number;
}> = ({ t, items, drops = [], n = 5, show = 1, bytesP = 0, endsP = 0, full = 0 }) => {
  const W = rowWidth(n);
  const boxX = (i: number) => i * (BOX + BOX_GAP);
  const sorted = [...items].sort((a, b) => a.in - b.in);
  const weight = (it: QItem) => (it.out === undefined || t < it.out ? 1 : 1 - clamp01((t - it.out) / 0.45));
  return (
    <div style={{ position: 'relative', width: W, height: BOX + 70, opacity: show }}>
      {Array.from({ length: n }, (_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: boxX(i),
            top: 0,
            width: BOX,
            height: BOX,
            borderRadius: 14,
            border: `2.5px solid ${hexA(full > 0 ? RED : C.cyan, 0.55 + 0.35 * full)}`,
            background: 'rgba(10,4,32,.6)',
            boxShadow: full > 0 ? `0 0 ${24 * full}px ${hexA(RED, 0.4 * full)}` : undefined,
          }}
        >
          {bytesP > 0 && <div style={{ position: 'absolute', top: BOX + 8, left: -10, right: -10, textAlign: 'center', ...mono(18, C.muted), opacity: bytesP }}>4 bytes</div>}
        </div>
      ))}
      {endsP > 0 && (
        <>
          <div style={{ position: 'absolute', left: 0, top: -40, ...mono(20, C.muted, { letterSpacing: '.15em' }), opacity: endsP }}>BACK ← in</div>
          <div style={{ position: 'absolute', right: 0, top: -40, ...mono(20, C.muted, { letterSpacing: '.15em' }), opacity: endsP }}>out → FRONT</div>
        </>
      )}
      {sorted.map((it, idx) => {
        if (t < it.in) return null;
        let k = 0;
        for (let j = 0; j < idx; j++) if (t >= sorted[j].in) k += weight(sorted[j]);
        const target = boxX(n - 1 - k);
        const enter = ease((t - it.in) / 0.45);
        let x = -BOX - 40 + (target + BOX + 40) * enter;
        let op = enter;
        if (it.out !== undefined && t >= it.out) {
          const u = ease((t - it.out) / 0.45);
          x = boxX(n - 1) + u * 170;
          op = 1 - u;
        }
        if (op <= 0.01) return null;
        return (
          <div
            key={it.label + it.in}
            style={{
              position: 'absolute',
              left: x + 8,
              top: 8,
              width: BOX - 16,
              height: BOX - 16,
              borderRadius: 10,
              background: `linear-gradient(${hexA(C.amber, 0.9)}, ${hexA(C.amber, 0.65)})`,
              boxShadow: `0 0 18px ${hexA(C.amber, 0.5)}`,
              display: 'grid',
              placeItems: 'center',
              opacity: op,
              ...mono(44, '#1a0d00', { fontWeight: 800 }),
            }}
          >
            {it.label}
          </div>
        );
      })}
      {drops.map((d, i) => {
        if (t < d.at) return null;
        const u = (t - d.at) / 0.7;
        const bump = u < 1 ? Math.sin(Math.PI * Math.min(1, u)) * 40 : 0;
        return (
          <div key={d.label} style={{ position: 'absolute', left: -BOX - 40 - i * 0 + bump, top: BOX + 40 + i * 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 10,
                marginLeft: i * 76,
                background: hexA(RED, 0.25),
                border: `2px solid ${RED}`,
                display: 'grid',
                placeItems: 'center',
                ...mono(32, RED, { fontWeight: 800 }),
                opacity: ease(u * 2),
              }}
            >
              {d.label}
            </div>
          </div>
        );
      })}
      {drops.length > 0 && t >= drops[0].at && (
        <div style={{ position: 'absolute', left: -BOX - 40, top: BOX + 112, whiteSpace: 'nowrap', ...mono(20, RED, { fontWeight: 700 }), opacity: ease((t - drops[0].at) / 0.5) }}>
          dropped ✗
        </div>
      )}
    </div>
  );
};

// ── Chip ──────────────────────────────────────────────────────────────────

export const TASK_COL: Record<string, string> = { button: C.cyan, led: C.amber };

export const Chip: React.FC<{ name: string; sleep?: number; glow?: number; note?: React.ReactNode; w?: number }> = ({ name, sleep = 0, glow = 0, note, w = 220 }) => {
  const col = TASK_COL[name] ?? '#9aa7ff';
  return (
    <div style={{ position: 'relative', width: w, height: 84, opacity: 1 - 0.45 * sleep }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 14,
          border: `2px solid ${hexA(col, 0.85)}`,
          background: `linear-gradient(${hexA(col, 0.22)}, ${hexA(col, 0.1)}), #150a33`,
          boxShadow: glow > 0 ? `0 0 ${30 * glow}px ${hexA(col, 0.7 * glow)}` : undefined,
          display: 'grid',
          placeItems: 'center',
          ...mono(28, '#fff', { fontWeight: 700 }),
        }}
      >
        {name}
      </div>
      {sleep > 0.05 && <div style={{ position: 'absolute', right: -6, top: -30, ...mono(20, C.muted, { fontWeight: 700 }), opacity: sleep }}>asleep · z z</div>}
      {note && <div style={{ position: 'absolute', left: -60, right: -60, top: 94, textAlign: 'center', ...mono(19, col, { fontWeight: 600 }) }}>{note}</div>}
    </div>
  );
};

/** the LED (0/1) at scene time t, from the scene times its press was received */
export const ledLevel = (t: number, recv: number[]) => {
  const p = (2 * BLINK_MS) / 1000;
  for (const r of recv) {
    const u = t - r;
    if (u >= 0 && u < 3 * p) return u % p < p / 2 ? 1 : 0;
  }
  return 0;
};

export { GREEN as OK };

// ── two sides: the button task on the left, the LED task on the right ─────

/** chip row: both chips' centre line, and the gap between them for the channel */
export const SIDE_TOP = 140;
export const LEFT_X = 150;
export const RIGHT_X = 1550;
export const CHIP_MID = SIDE_TOP + 42;
/** where a 5-box row sits so it lines up with the chips */
export const ROW_LEFT = (1920 - rowWidth(5)) / 2;
export const ROW_TOP = CHIP_MID - BOX / 2;

/** the button task (chip) over its button */
export const LeftSide: React.FC<{ show: number; down: number; glow?: number; chip?: number; chipX?: number; label?: string; under?: React.ReactNode }> = ({ show, down, glow = 0, chip = 1, chipX = LEFT_X, label = 'GPIO 18', under }) => (
  <>
    <div style={{ position: 'absolute', left: chipX, top: SIDE_TOP, opacity: chip * show }}>
      <Chip name="button" glow={glow} />
    </div>
    <div style={{ position: 'absolute', left: LEFT_X, top: SIDE_TOP + 104, display: 'grid', justifyItems: 'center', ...riseP(show) }}>
      <Button down={down} label={label} />
      {under}
    </div>
  </>
);

/** the LED task (chip) over its LED */
export const RightSide: React.FC<{ show: number; on: number; sleep?: number; glow?: number; chip?: number; chipX?: number; under?: React.ReactNode }> = ({ show, on, sleep = 0, glow = 0, chip = 1, chipX = RIGHT_X, under }) => (
  <>
    <div style={{ position: 'absolute', left: chipX, top: SIDE_TOP, opacity: chip * show }}>
      <Chip name="led" sleep={sleep} glow={glow} />
    </div>
    <div style={{ position: 'absolute', left: RIGHT_X, width: 220, top: SIDE_TOP + 124, display: 'grid', justifyItems: 'center', gap: 14, ...riseP(show) }}>
      <LedCard pin={2} on={on} size={100} />
      {under}
    </div>
  </>
);
const riseP = (p: number): React.CSSProperties => ({ opacity: p, transform: `translateY(${(1 - p) * 24}px)` });

/** a dashed arrow along the chip line, from x1 to x2 */
export const Wire: React.FC<{ x1: number; x2: number; p: number; color?: string; y?: number; label?: React.ReactNode }> = ({ x1, x2, p, color = C.cyan, y = CHIP_MID, label }) => {
  const xe = x1 + (x2 - x1) * clamp01(p);
  const dir = x2 >= x1 ? 1 : -1;
  return (
    <>
      <svg width={1920} height={60} style={{ position: 'absolute', left: 0, top: y - 30, overflow: 'visible', opacity: clamp01(p * 3) }}>
        <line x1={x1} y1={30} x2={xe} y2={30} stroke={hexA(color, 0.75)} strokeWidth={3} strokeDasharray="10 8" />
        {p > 0.95 && <path d={`M ${x2 - dir * 14} 20 L ${x2} 30 L ${x2 - dir * 14} 40`} fill="none" stroke={color} strokeWidth={3} />}
      </svg>
      {label && <div style={{ position: 'absolute', left: Math.min(x1, x2), width: Math.abs(x2 - x1), top: y - 44, textAlign: 'center', ...mono(19, color, { fontWeight: 700 }), opacity: ease(p) }}>{label}</div>}
    </>
  );
};

/** the shared flag: `bool pressed`, 0 or 1; `again` lights it red (set while already set) */
export const FlagBox: React.FC<{ value: number; again?: number; name?: number }> = ({ value, again = 0, name = 0 }) => (
  <div style={{ display: 'grid', justifyItems: 'center', gap: 10 }}>
    <div style={{ width: 150, height: BOX + 12, borderRadius: 16, border: `2.5px solid ${again > 0 ? hexA(RED, 0.5 + 0.5 * again) : hexA(C.cyan, 0.7)}`, display: 'grid', placeItems: 'center', background: 'rgba(10,4,32,.6)', boxShadow: again > 0 ? `0 0 ${26 * again}px ${hexA(RED, 0.45 * again)}` : value ? `0 0 26px ${hexA(C.amber, 0.45)}` : undefined, ...mono(68, value ? C.amber : C.muted, { fontWeight: 800 }) }}>{value}</div>
    <div style={mono(24, C.muted)}>
      bool <span style={{ color: name > 0 ? C.ink : C.muted, fontWeight: 700, textShadow: name > 0 ? `0 0 14px ${hexA(C.cyan, 0.7 * name)}` : undefined }}>pressed</span>
    </div>
  </div>
);

/** a short code card (no file chrome): the lines that matter, `lit` lines glowing */
export const Snippet: React.FC<{ t: number; title: string; color: string; lines: string[]; lit?: { line: number; at: number }[]; size?: number; w?: number }> = ({ t, title, color, lines, lit = [], size = 22, w = 440 }) => (
  <div style={{ width: w, boxSizing: 'border-box', borderRadius: 14, border: `1px solid ${hexA(color, 0.45)}`, background: 'rgba(10,4,32,.72)', padding: '12px 16px 14px' }}>
    <div style={{ ...mono(15, color, { letterSpacing: '.2em', textTransform: 'uppercase' }), marginBottom: 6 }}>{title}</div>
    <pre style={{ margin: 0, fontFamily: FONT.mono, fontSize: size, lineHeight: 1.5, color: '#cfd6ff' }}>
      {lines.map((l, i) => {
        const on = lit.find((x) => x.line === i && t >= x.at);
        return (
          <div key={i} style={{ minHeight: '1.5em' }}>
            <CodeLine text={l} t={t} litAt={on ? on.at : null} live={!!on} accent={color} />
          </div>
        );
      })}
    </pre>
  </div>
);

/** ✓ / ✗ score for each try: the flag (left column), the queue (right) */
export type ScoreRow = { at: number; ok: boolean; text: string };
export const ScoreCard: React.FC<{ t: number; flag: ScoreRow[]; queue?: ScoreRow[]; dimFlag?: number; queueShow?: number }> = ({ t, flag, queue = [], dimFlag = 0, queueShow = 0 }) => {
  const col = (title: string, rows: ScoreRow[], op: number) => (
    <div style={{ display: 'grid', alignContent: 'start', gap: 12, opacity: op }}>
      <div style={mono(17, C.muted, { letterSpacing: '.2em', textTransform: 'uppercase' })}>{title}</div>
      {rows.map((r) => (
        <div key={r.text} style={{ ...mono(23, r.ok ? GREEN : RED, { fontWeight: 600 }), opacity: ease((t - r.at) / 0.4), transform: `translateX(${(1 - ease((t - r.at) / 0.4)) * -14}px)` }}>
          {r.ok ? '✓' : '✗'} <span style={{ color: C.ink }}>{r.text}</span>
        </div>
      ))}
    </div>
  );
  return (
    <div style={{ boxSizing: 'border-box', width: 760, borderRadius: 18, border: '1px solid rgba(255,255,255,.1)', background: `linear-gradient(165deg, ${hexA(C.purple, 0.15)}, rgba(10,4,32,.8))`, padding: '22px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 26, minHeight: 230 }}>
      {col('try 1 · shared flag', flag, 1 - 0.45 * dimFlag)}
      {col('try 2 · queue', queue, queueShow)}
    </div>
  );
};

/** a lab run's items and drops for a QueueRow, on a clock */
export const runItems = (run: Run, tOf: (m: number) => number) => {
  const items = run.presses
    .map((m, i) => ({ n: i + 1, m }))
    .filter(({ n }) => !run.dropped.includes(n))
    .map(({ n, m }) => {
      const tin = tOf(m);
      return { label: String(n), in: tin, out: Math.max(tOf(run.recv[n]), tin + 0.3) };
    });
  const drops = run.dropped.map((n) => ({ label: String(n), at: tOf(run.presses[n - 1]) }));
  return { items, drops, recv: items.map((i) => i.out) };
};

/** the button is down for 180 ms after each press */
export const isDown = (t: number, pressT: number[]) => (pressT.some((x) => t >= x && t < x + 0.18) ? 1 : 0);
