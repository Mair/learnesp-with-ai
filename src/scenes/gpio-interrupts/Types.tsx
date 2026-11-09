/**
 * 10 · SECOND KNOB — the trigger type.
 *   edges  NEGEDGE → press · POSEDGE → release · ANYEDGE → both (read the level)
 *   level  LOW_LEVEL fires for as long as the pin is low → a held button, again and again
 *   wake   gpio_wakeup_enable() takes LOW_LEVEL / HIGH_LEVEL only → light sleep
 *
 * FACTS: gpio_types.h l.80–88; TRM GPIO_PINn_INT_TYPE / WAKEUP_ENABLE; driver/gpio.h l.201–212;
 * gpio.c gpio_isr_loop (level: cleared after the handler) — "again and again" is derived.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { GREEN, mono, RED } from '../../components/Explainer';
import { C, hexA } from '../../theme/palette';
import { after, BIG_W, Pill, Verdict, ViewStage } from './parts';
import { FPS, LOG_WAKE, sceneDur, TYPES as S } from './timeline';

export const Types: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const V = S.views;
  return (
    <ViewStage
      t={t}
      frames={Math.round(sceneDur('types') * FPS)}
      kicker="Second knob · when to interrupt"
      accent="magenta"
      captions={S.captions}
      views={[
        { at: V.edges, component: EdgesView, label: 'edge types · one press, one release', accent: C.magenta, right: () => 'gpio_int_type_t' },
        { at: V.level, component: LevelView, label: 'level types · a held button', accent: RED },
        { at: V.wake, component: WakeView, label: 'what levels are for', accent: GREEN, right: () => 'driver/gpio.h' },
      ]}
    />
  );
};

const L = 330;
const R = BIG_W - 40;
const x = (u: number) => L + u * (R - L); // u in 0..1 across the plot

/** press at 0.25, release at 0.7 */
const PressTrace: React.FC<{ y: number; holdTo?: number }> = ({ y, holdTo = 0.7 }) => (
  <path d={`M ${x(0)} ${y} L ${x(0.25)} ${y} L ${x(0.25)} ${y + 90} L ${x(holdTo)} ${y + 90} L ${x(holdTo)} ${y} L ${x(1)} ${y}`} fill="none" stroke={C.magenta} strokeWidth={4} style={{ filter: `drop-shadow(0 0 6px ${C.magenta})` }} />
);

const Bolt: React.FC<{ u: number; y: number; p: number; color?: string }> = ({ u, y, p, color = C.amber }) => (
  <text x={x(u)} y={y} textAnchor="middle" opacity={p} style={mono(30, color, { fontWeight: 800 })}>
    ⚡
  </text>
);

const EdgesView: React.FC<{ t: number }> = ({ t }) => {
  const e = S.edges;
  const rows: { k: string; at: number; us: number[] }[] = [
    { k: 'GPIO_INTR_NEGEDGE', at: e.neg, us: [0.25] },
    { k: 'GPIO_INTR_POSEDGE', at: e.pos, us: [0.7] },
    { k: 'GPIO_INTR_ANYEDGE', at: e.any, us: [0.25, 0.7] },
  ];
  return (
    <svg width={BIG_W} height={700} style={{ display: 'block', overflow: 'visible' }}>
      <text x={20} y={80} style={mono(20, C.pink, { fontWeight: 700 })}>
        GPIO 18
      </text>
      <g opacity={after(t, e.knob)}>
        <PressTrace y={40} />
        <text x={x(0.25)} y={30} textAnchor="middle" style={mono(18, C.muted)}>
          press
        </text>
        <text x={x(0.7)} y={30} textAnchor="middle" style={mono(18, C.muted)}>
          release
        </text>
      </g>
      {rows.map((r, i) => {
        const y = 240 + i * 120;
        const p = after(t, r.at);
        return (
          <g key={r.k} opacity={0.15 + 0.85 * p}>
            <text x={20} y={y + 10} style={mono(21, '#fff', { fontWeight: 700 })}>
              {r.k.replace('GPIO_INTR_', '')}
            </text>
            <line x1={L} y1={y} x2={R} y2={y} stroke="rgba(255,255,255,.12)" />
            {r.us.map((u) => (
              <Bolt key={u} u={u} y={y + 12} p={p} />
            ))}
          </g>
        );
      })}
      <g opacity={after(t, e.read)}>
        <text x={x(0.25)} y={640} textAnchor="middle" style={mono(20, C.cyan, { fontWeight: 700 })}>
          level 0 → pressed
        </text>
        <text x={x(0.7)} y={640} textAnchor="middle" style={mono(20, C.amber, { fontWeight: 700 })}>
          level 1 → released
        </text>
      </g>
    </svg>
  );
};

const LevelView: React.FC<{ t: number }> = ({ t }) => {
  const l = S.level;
  const firing = after(t, l.firing);
  const n = Math.max(0, Math.floor((t - l.firing) * 9));
  const bolts: number[] = [];
  for (let k = 0; k < Math.min(n, 30); k++) bolts.push(0.25 + (k / 30) * 0.7);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg width={BIG_W} height={430} style={{ display: 'block', overflow: 'visible' }}>
        <text x={20} y={80} style={mono(20, C.pink, { fontWeight: 700 })}>
          GPIO 18
        </text>
        <PressTrace y={40} holdTo={0.97} />
        <text x={x(0.6)} y={170} textAnchor="middle" opacity={after(t, l.held)} style={mono(18, C.muted)}>
          held down
        </text>
        <text x={20} y={290} opacity={after(t, l.low)} style={mono(21, '#fff', { fontWeight: 700 })}>
          LOW_LEVEL
        </text>
        <line x1={L} y1={280} x2={R} y2={280} stroke="rgba(255,255,255,.12)" />
        {bolts.map((u, i) => (
          <Bolt key={i} u={u} y={292} p={firing} color={RED} />
        ))}
      </svg>
      <div style={{ position: 'absolute', left: 20, top: 450, display: 'grid', gap: 14 }}>
        <div style={{ opacity: after(t, l.again), ...mono(26, RED, { fontWeight: 700 }) }}>again, and again — for as long as it's held</div>
        <div style={{ opacity: after(t, l.again + 0.4), fontSize: 21, color: C.muted }}>
          the driver clears a level interrupt only after your function returns — the level is still there, so it fires again
        </div>
      </div>
    </div>
  );
};

const WakeView: React.FC<{ t: number }> = ({ t }) => {
  const w = S.wake;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 22, padding: '0 60px' }}>
      <div style={{ opacity: after(t, w.sleep) }}>
        <Pill color={GREEN} size={26}>
          light sleep → a level on the pin wakes the chip
        </Pill>
      </div>
      <div style={{ opacity: after(t, w.enable), display: 'grid', gap: 12 }}>
        <div style={{ ...mono(26, '#fff'), padding: '10px 16px', borderRadius: 10, border: `1px solid ${hexA(GREEN, 0.6)}`, background: hexA(GREEN, 0.06) }}>
          gpio_wakeup_enable(BUTTON, GPIO_INTR_LOW_LEVEL); <span style={{ color: GREEN }}>✓</span>
        </div>
        <div style={{ ...mono(26, '#fff'), padding: '10px 16px', borderRadius: 10, border: `1px solid ${hexA(RED, 0.6)}`, background: hexA(RED, 0.06) }}>
          gpio_wakeup_enable(BUTTON, GPIO_INTR_NEGEDGE); <span style={{ color: RED }}>✗</span>
          <div style={mono(17, RED)}>{LOG_WAKE} → ESP_ERR_INVALID_ARG · recorded in QEMU</div>
        </div>
      </div>
      <Verdict ok p={after(t, w.two)} size={22}>
        "Only GPIO_INTR_LOW_LEVEL or GPIO_INTR_HIGH_LEVEL can be used." — driver/gpio.h
      </Verdict>
    </div>
  );
};
