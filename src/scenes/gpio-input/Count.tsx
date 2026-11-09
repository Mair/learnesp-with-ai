/**
 * 9 · COUNTING PRESSES — level vs edge, and bounce.
 *   hold      counting zeros: 1 s held = 100 reads = 100 "presses" ✗
 *   edge      a press is a change: last == 1 && level == 0 → 1 ✓
 *   bounce    zoomed into the edge: the contacts chatter before settling
 *   stats     Ganssle: ~1.6 ms average, 6.2 ms worst (16 switches)
 *   grids     read every µs → several counts; every 10 ms → at most one read in the bounce → 1
 *   debounce  no hardware glitch filter on ESP32 → the tick is your debouncer; a bad switch can outlast it
 *
 * The bounce shape is illustrative (its length matches Ganssle's average).
 * FACTS: Ganssle pdf l.118–134, l.855–859; soc_caps.h (no glitch filter); log format.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { GREEN, mono, RED } from '../../components/Explainer';
import { C, FONT, hexA } from '../../theme/palette';
import { after, BIG_H, BIG_W, Pill, SerialLog, ViewStage } from './parts';
import { bounceLow, COUNT as S, countFalls, FPS, LOG_PRESS, sceneDur, TICK_MS } from './timeline';

export const Count: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const V = S.views;
  return (
    <ViewStage
      t={t}
      frames={Math.round(sceneDur('count') * FPS)}
      kicker="Counting presses"
      accent="amber"
      captions={S.captions}
      views={[
        { at: V.hold, component: HoldView, label: 'count the zeros?', accent: RED, right: () => 'real time' },
        { at: V.edge, component: EdgeView, label: 'count the change', accent: GREEN },
        { at: V.bounce, component: BounceView, label: 'zoom in: one press, in milliseconds', accent: C.magenta, right: () => 'illustration' },
        { at: V.stats, component: StatsView, label: 'how long do switches bounce?', accent: C.magenta, right: () => 'J. Ganssle, A Guide to Debouncing' },
        { at: V.grids, component: GridsView, label: 'the same bounce, read two ways', accent: C.cyan },
        { at: V.debounce, component: DebounceView, label: 'so who debounces?', accent: GREEN, right: () => 'ESP32 · soc_caps.h' },
      ]}
    />
  );
};

// ── hold: 100 zeros ───────────────────────────────────────────────────────

const HoldView: React.FC<{ t: number }> = ({ t }) => {
  const h = S.hold;
  const n = Math.max(0, Math.min(100, Math.floor(((t - h.hold) * 1000) / TICK_MS)));
  const holding = t >= h.hold && t < h.hold + 1;
  const done = after(t, h.hundred);
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', gap: 40, padding: '0 40px' }}>
      <div style={{ display: 'grid', gap: 20, opacity: after(t, h.zeros) }}>
        <pre style={{ margin: 0, fontFamily: FONT.mono, fontSize: 26, lineHeight: 1.6, color: '#cfd6ff' }}>
          <div>if (gpio_get_level(BUTTON) == 0) {'{'}</div>
          <div style={{ color: RED }}>    presses++;     // every read?</div>
          <div>{'}'}</div>
        </pre>
        <div style={{ opacity: after(t, h.hold), fontSize: 26, color: C.ink }}>
          button held for <b style={{ color: C.cyan }}>1 s</b>, read every <b style={{ color: C.cyan }}>10 ms</b>
        </div>
        {/* 100 read cells, filling in real time */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(25, 1fr)', gap: 4, opacity: after(t, h.hold) }}>
          {Array.from({ length: 100 }, (_, i) => (
            <div key={i} style={{ height: 22, borderRadius: 4, background: i < n ? hexA(C.cyan, 0.7) : 'rgba(255,255,255,.06)', ...mono(13, '#07031a', { textAlign: 'center' }) }}>
              {i < n ? '0' : ''}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 20, opacity: after(t, h.hold) }}>
        <div style={mono(28, C.muted)}>presses =</div>
        <div style={mono(180, done > 0.5 ? RED : C.ink, { fontWeight: 800, fontVariantNumeric: 'tabular-nums', lineHeight: 1 })}>{n}</div>
        <div style={{ opacity: holding ? 1 : 0.4 }}>
          <Pill color={C.cyan} size={22}>
            {holding ? 'holding…' : t >= h.hold + 1 ? 'released' : ''}
          </Pill>
        </div>
        <div style={{ opacity: done }}>
          <Pill color={RED} size={24}>
            ✗ one press, counted 100 times
          </Pill>
        </div>
      </div>
    </div>
  );
};

// ── edge ──────────────────────────────────────────────────────────────────

const EdgeView: React.FC<{ t: number }> = ({ t }) => {
  const e = S.edge;
  const change = after(t, e.change);
  const one = after(t, e.one);
  const zero = after(t, e.zero);
  const rem = after(t, e.remember);
  const falls = after(t, e.falls);
  const hot = (i: number) => (i === 3 && t >= e.remember) || ((i === 4 || i === 5) && t >= e.falls);
  const W = 700;
  const yH = 80;
  const yL = 200;
  const xE = 380;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '760px 1fr', gap: 40, alignItems: 'center' }}>
      <pre style={{ margin: 0, fontFamily: FONT.mono, fontSize: 24, lineHeight: 1.55, color: '#cfd6ff', opacity: 0.4 + 0.6 * rem }}>
        {S.code.map((l, i) => (
          <div key={i} style={{ padding: '0 10px', borderLeft: `3px solid ${hot(i) ? GREEN : 'transparent'}`, background: hot(i) ? hexA(GREEN, 0.12) : 'transparent', color: hot(i) ? '#fff' : undefined }}>
            {l}
          </div>
        ))}
      </pre>
      <div style={{ display: 'grid', gap: 18 }}>
        <svg width={W} height={260} style={{ display: 'block', overflow: 'visible', opacity: change }}>
          <path d={`M 20 ${yH} L ${xE} ${yH} L ${xE} ${yL} L ${W - 20} ${yL}`} fill="none" stroke={C.magenta} strokeWidth={4} style={{ filter: `drop-shadow(0 0 6px ${C.magenta})` }} />
          <circle cx={xE} cy={(yH + yL) / 2} r={26 * falls} fill="none" stroke={GREEN} strokeWidth={3} />
          <text x={xE - 120} y={yH - 18} opacity={one} style={mono(30, C.amber, { fontWeight: 800 })}>
            last = 1
          </text>
          <text x={xE + 40} y={yL + 44} opacity={zero} style={mono(30, C.cyan, { fontWeight: 800 })}>
            level = 0
          </text>
          <text x={xE + 40} y={(yH + yL) / 2 + 8} opacity={falls} style={mono(24, GREEN, { fontWeight: 700 })}>
            ← it falls: count once
          </text>
        </svg>
        <div style={{ opacity: falls, display: 'flex', gap: 20, alignItems: 'center' }}>
          <span style={mono(34, GREEN, { fontWeight: 800 })}>presses = 1 ✓</span>
        </div>
        <div style={{ opacity: falls, width: 700 }}>
          <SerialLog t={t} lines={[{ at: e.falls + 0.2, text: LOG_PRESS, color: GREEN }]} size={22} label="recorded in QEMU · the press is simulated" />
        </div>
      </div>
    </div>
  );
};

// ── the bounce trace (ms) ─────────────────────────────────────────────────

const BounceTrace: React.FC<{
  W: number;
  H: number;
  m0: number;
  m1: number;
  upTo?: number;
  ticks?: number[];
  tickLabel?: (ms: number) => string;
  children?: (x: (ms: number) => number, yH: number, yL: number) => React.ReactNode;
}> = ({ W, H, m0, m1, upTo = Infinity, ticks = [], tickLabel = (m) => `${m} ms`, children }) => {
  const L = 40;
  const x = (ms: number) => L + ((ms - m0) / (m1 - m0)) * (W - L - 20);
  const yH = 40;
  const yL = H - 60;
  let d = '';
  const n = 1400;
  let prev = -1;
  for (let i = 0; i <= n; i++) {
    const ms = m0 + ((m1 - m0) * i) / n;
    if (ms > upTo) break;
    const y = ms >= 0 && bounceLow(ms) ? yL : yH;
    if (y !== prev && prev !== -1) d += ` L ${x(ms).toFixed(1)} ${prev}`;
    d += `${d ? ' L' : 'M'} ${x(ms).toFixed(1)} ${y}`;
    prev = y;
  }
  return (
    <svg width={W} height={H} style={{ display: 'block', overflow: 'visible' }}>
      <line x1={L} y1={yL + 20} x2={W - 20} y2={yL + 20} stroke={hexA(C.muted, 0.5)} strokeWidth={2} />
      {ticks.map((ms) => (
        <g key={ms}>
          <line x1={x(ms)} y1={yL + 20} x2={x(ms)} y2={yL + 28} stroke={hexA(C.muted, 0.6)} strokeWidth={1.5} />
          <text x={x(ms)} y={yL + 50} textAnchor="middle" style={mono(17, C.muted)}>
            {tickLabel(ms)}
          </text>
        </g>
      ))}
      <path d={d} fill="none" stroke={C.magenta} strokeWidth={3.5} strokeLinejoin="miter" style={{ filter: `drop-shadow(0 0 6px ${C.magenta})` }} />
      {children?.(x, yH, yL)}
    </svg>
  );
};

const BounceView: React.FC<{ t: number }> = ({ t }) => {
  const b = S.bounce;
  // draw the bounce on "bounces": 2.5 ms of trace over 1.2 s of screen time
  const sweep = -1 + Math.max(0, Math.min(1, (t - b.bounces + 0.3) / 1.2)) * 4;
  const lbl = (at: number, txt: string, ms: number, low: boolean) => (x: (m: number) => number, yH: number, yL: number) => (
    <g opacity={after(t, at)}>
      <text x={x(ms)} y={low ? yL + 38 - 80 : yH - 14} textAnchor="middle" style={mono(20, low ? C.cyan : C.amber, { fontWeight: 700 })}>
        {txt}
      </text>
    </g>
  );
  return (
    <div style={{ position: 'absolute', inset: 40 }}>
      <BounceTrace W={BIG_W - 80} H={460} m0={-1} m1={3} upTo={t < b.bounces - 0.3 ? 0 : sweep} ticks={[-1, 0, 1, 2, 3]}>
        {(x, yH, yL) => (
          <>
            {lbl(b.hit, 'hit', 0.12, true)(x, yH, yL)}
            {lbl(b.apart, 'apart', 0.35, false)(x, yH, yL)}
            {lbl(b.again, 'again', 0.62, true)(x, yH, yL)}
            <text x={x(-0.95)} y={yH - 14} style={mono(18, C.muted)}>
              released: 1
            </text>
            <text x={x(2.2)} y={yL - 14} opacity={sweep > 2 ? 1 : 0} style={mono(18, C.muted)}>
              settled: 0
            </text>
          </>
        )}
      </BounceTrace>
      <div style={{ position: 'absolute', left: 40, top: 540, fontSize: 24, color: C.ink, opacity: after(t, b.bounces) }}>
        to a fast reader, that looks like <b style={{ color: RED }}>several presses</b>
      </div>
    </div>
  );
};

const StatsView: React.FC<{ t: number }> = ({ t }) => {
  const s = S.stats;
  const avg = after(t, s.avg);
  const worst = after(t, s.worst);
  return (
    <div style={{ position: 'absolute', inset: 40 }}>
      <BounceTrace W={BIG_W - 80} H={420} m0={-1} m1={8} ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8]}>
        {(x, yH) => (
          <>
            <g opacity={avg}>
              <line x1={x(0)} y1={yH - 22} x2={x(1.6)} y2={yH - 22} stroke={C.amber} strokeWidth={3} />
              <line x1={x(0)} y1={yH - 30} x2={x(0)} y2={yH - 14} stroke={C.amber} strokeWidth={3} />
              <line x1={x(1.6)} y1={yH - 30} x2={x(1.6)} y2={yH - 14} stroke={C.amber} strokeWidth={3} />
              <text x={x(1.6) + 12} y={yH - 14} style={mono(22, C.amber, { fontWeight: 700 })}>
                average ≈ 1.6 ms (1557 µs)
              </text>
            </g>
            <g opacity={worst}>
              <rect x={x(0)} y={yH + 10} width={x(6.2) - x(0)} height={200} fill={hexA(RED, 0.08)} stroke={hexA(RED, 0.6)} strokeDasharray="8 6" />
              <text x={x(6.2) - 12} y={yH + 44} textAnchor="end" style={mono(22, RED, { fontWeight: 700 })}>
                worst of the 16: 6.2 ms
              </text>
            </g>
          </>
        )}
      </BounceTrace>
      <div style={{ position: 'absolute', left: 40, top: 500, fontSize: 22, color: C.muted, opacity: after(t, s.ganssle) }}>
        18 switches tested · two outliers set aside (11.3 ms and 157 ms) · bounce measured on each press and release
      </div>
    </div>
  );
};

// ── grids: fast vs 10 ms ──────────────────────────────────────────────────

const OFF = 0.9; // where the 10 ms grid happens to land: one read inside the bounce
const GridsView: React.FC<{ t: number }> = ({ t }) => {
  const g = S.grids;
  const fast = after(t, g.fast);
  const several = after(t, g.several);
  const slow = after(t, g.slow);
  const inside = after(t, g.inside);
  const one = after(t, g.one);
  const nFast = countFalls(0.001, -12, -12, 16); // one read per µs
  const nSlow = countFalls(TICK_MS, OFF - 2 * TICK_MS, -12, 16);
  const W = 1140;
  const row = (label: string, p: number, ticks: (x: (ms: number) => number, yH: number, yL: number) => React.ReactNode, count: number, ok: boolean, q: number) => (
    <div style={{ display: 'grid', gridTemplateColumns: `${W}px 1fr`, alignItems: 'center', gap: 20, opacity: p }}>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 44, top: -6, ...mono(18, C.cyan) }}>{label}</div>
        <BounceTrace W={W} H={250} m0={-12} m1={16} ticks={[-10, 0, 10]}>
          {ticks}
        </BounceTrace>
      </div>
      <div style={{ opacity: q, display: 'grid', gap: 8 }}>
        <span style={mono(22, C.muted)}>presses =</span>
        <span style={mono(70, ok ? GREEN : RED, { fontWeight: 800, lineHeight: 1 })}>
          {count} {ok ? '✓' : '✗'}
        </span>
      </div>
    </div>
  );
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', gap: 26, alignContent: 'center' }}>
      {row(
        'read every µs (drawn sparser)',
        fast,
        (x, yH, yL) => (
          <g>
            {Array.from({ length: 140 }, (_, i) => -12 + i * 0.2).map((ms) => (
              <line key={ms} x1={x(ms)} y1={yL + 8} x2={x(ms)} y2={yL + 18} stroke={hexA(C.cyan, 0.5)} strokeWidth={1} />
            ))}
            <text x={x(1)} y={yH - 12} textAnchor="middle" style={mono(17, C.muted)}>
              every bounce is seen
            </text>
          </g>
        ),
        nFast,
        false,
        several,
      )}
      {row(
        `read every ${TICK_MS} ms`,
        slow,
        (x, yH, yL) => (
          <g>
            {[OFF - 10, OFF, OFF + 10].map((ms, i) => {
              const v = ms >= 0 && bounceLow(ms) ? 0 : 1;
              const lbl = i === 0 ? 'old: 1' : i === 1 ? `← inside the bounce: ${v} (could be either)` : 'new: 0';
              return (
                <g key={ms}>
                  <line x1={x(ms)} y1={yH - 10} x2={x(ms)} y2={yL + 18} stroke={C.amber} strokeWidth={2} strokeDasharray={i === 1 ? '5 4' : undefined} />
                  <circle cx={x(ms)} cy={i === 2 || v === 0 ? yL : yH} r={7} fill={C.amber} />
                  <text x={i === 1 ? x(2.6) : x(ms) + 10} y={yH + 34 + (i === 1 ? 50 : 0)} opacity={i === 1 ? inside : 1} style={mono(19, C.amber, { fontWeight: 700 })}>
                    {lbl}
                  </text>
                </g>
              );
            })}
          </g>
        ),
        nSlow,
        true,
        one,
      )}
    </div>
  );
};

// ── debounce ──────────────────────────────────────────────────────────────

const DebounceView: React.FC<{ t: number }> = ({ t }) => {
  const d = S.debounce;
  const card = (p: number, col: string, title: string, body: React.ReactNode) => (
    <div style={{ opacity: p, transform: `translateY(${(1 - p) * 16}px)`, borderRadius: 16, border: `1.5px solid ${hexA(col, 0.6)}`, background: hexA(col, 0.07), padding: '22px 26px', display: 'grid', gap: 10 }}>
      <div style={mono(18, col, { letterSpacing: '.14em', textTransform: 'uppercase' })}>{title}</div>
      <div style={{ fontSize: 26, color: C.ink, lineHeight: 1.4 }}>{body}</div>
    </div>
  );
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 26, padding: '0 40px' }}>
      <div style={{ opacity: after(t, d.debouncer), fontSize: 46, fontWeight: 700, color: C.ink, textAlign: 'center' }}>
        <span style={mono(46, C.cyan)}>vTaskDelay(pdMS_TO_TICKS(10))</span> = your debouncer
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
        {card(after(t, d.filter), C.muted, 'the ESP32 hardware', <>no input glitch filter on the classic ESP32 → debouncing is your code's job</>)}
        {card(after(t, d.most), GREEN, 'most switches', <>settle well under 10 ms (Ganssle) → one press, one count</>)}
        {card(after(t, d.bad), C.amber, 'a bad switch', <>one bounced 157 ms on release → it can still double-count. Ganssle suggests 20–50 ms</>)}
      </div>
    </div>
  );
};
