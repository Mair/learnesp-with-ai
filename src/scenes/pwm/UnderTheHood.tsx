/**
 * 5 · UNDER THE HOOD — who actually flips the pin?
 *
 * The camera descends the real call path, one layer per VO line:
 *
 *   sketch          ledcWrite(LED, 64)
 *   Arduino core    ① ledc_set_duty() loads   ② ledc_update_duty() says go
 *   ESP-IDF API     driver/ledc.h's own doc comment for ledc_update_duty()
 *   HAL             the two register writes: duty.duty = …, conf1.duty_start = 1
 *   silicon         LEDC timer counter vs duty → GPIO
 *
 * Each layer explains itself with token-level marks (CodeLine), timed to the
 * VO's word boundaries. Source quoted from arduino-esp32 3.3 / ESP-IDF
 * release/v5.5; "…" marks trimmed lines.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { EASE_OUT } from '../../components/anim';
import { CodeLine, NOTE_ROW } from '../../components/CodeLine';
import { Panel } from '../../components/Panel';
import { Kicker, Scene } from '../../components/Type';
import { C, FONT, hexA } from '../../theme/palette';
import { FPS, IDF, IDF_VERSION, Layer, MAX, sceneDur } from './timeline';

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const inOut = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2);

const VIEW_W = 1600;
const VIEW_H = 860;
const GAP = 92;
const LINE = 26 * 1.65;
const labelled = (l: Layer) => new Set(l.marks.filter((m) => m.label).map((m) => m.line)).size;
const cardH = (l: Layer) => Math.round(66 + l.code.length * LINE + 10 + labelled(l) * NOTE_ROW);
const HW_H = 410;

export const UnderTheHood: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // layout: fixed heights → deterministic tops
  const tops: number[] = [];
  let y = 0;
  for (const l of IDF.layers) {
    tops.push(y);
    y += cardH(l) + GAP;
  }
  const hwTop = y;

  // camera: frame each new layer together with the one that called it
  const last = IDF.layers.length - 1;
  const keys = [
    ...IDF.layers.map((l, i) => ({
      at: i === 0 ? 0 : l.at - 0.1,
      focus: i === 0 ? cardH(l) / 2 : (tops[i - 1] + tops[i] + cardH(l)) / 2,
    })),
    { at: IDF.hardware - 0.1, focus: (tops[last] + hwTop + HW_H) / 2 },
  ];
  let camY = VIEW_H / 2 - keys[0].focus;
  for (let i = 1; i < keys.length; i++) {
    const u = inOut(clamp01((t - keys[i].at) / 1.0));
    const from = VIEW_H / 2 - keys[i - 1].focus;
    const to = VIEW_H / 2 - keys[i].focus;
    if (t >= keys[i].at) camY = from + (to - from) * u;
  }

  const current = keys.reduce((acc, k, i) => (t >= k.at ? i : acc), 0);

  return (
    <Scene durationInFrames={Math.round(sceneDur('idf') * FPS)}>
      <AbsoluteFill>
        <div
          style={{
            position: 'absolute',
            top: 52,
            width: '100%',
            display: 'grid',
            placeItems: 'center',
            gap: 10,
          }}
        >
          <Kicker delay={0.1} accent="magenta">
            Under the hood
          </Kicker>
          <div style={{ fontFamily: FONT.mono, fontSize: 18, color: C.muted, letterSpacing: '.1em' }}>
            {IDF_VERSION}
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            top: 170,
            left: (1920 - VIEW_W) / 2,
            width: VIEW_W,
            height: VIEW_H,
            overflow: 'hidden',
            maskImage: 'linear-gradient(180deg, transparent 0, #000 70px, #000 calc(100% - 70px), transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(180deg, transparent 0, #000 70px, #000 calc(100% - 70px), transparent 100%)',
          }}
        >
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, transform: `translateY(${camY}px)` }}>
            {IDF.layers.map((l, i) => (
              <React.Fragment key={i}>
                {l.via && <Arrow top={tops[i] - GAP} label={l.via} t={t - l.at} />}
                <LayerCard layer={l} top={tops[i]} t={t} dim={current > i} />
              </React.Fragment>
            ))}
            <Arrow top={hwTop - GAP} label="LEDC peripheral — no CPU from here on" t={t - IDF.hardware} />
            <Hardware top={hwTop} t={t} />
          </div>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

const LayerCard: React.FC<{ layer: Layer; top: number; t: number; dim: boolean }> = ({
  layer,
  top,
  t,
  dim,
}) => {
  const p = EASE_OUT(clamp01((t - layer.at) / 0.6));
  if (p <= 0) return null;
  // the live line is whichever was pointed at most recently
  const fired = layer.marks.filter((m) => t >= m.at).sort((a, b) => b.at - a.at);
  const liveLine = dim ? -1 : (fired[0]?.line ?? -1);
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 0,
        right: 0,
        height: cardH(layer),
        opacity: p * (dim ? 0.5 : 1),
        transform: `translateY(${(1 - p) * 30}px)`,
      }}
    >
      <Panel label={layer.name} accent={C.cyan} right={layer.path}>
        <pre style={{ margin: 0, fontFamily: FONT.mono, fontSize: 26, lineHeight: 1.65, color: '#cfd6ff' }}>
          {layer.code.map((line, li) => {
            const marks = layer.marks.filter((m) => m.line === li);
            const fired = marks.filter((m) => t >= m.at);
            const litAt = fired.length ? Math.min(...fired.map((m) => m.at)) : null;
            return (
              <CodeLine
                key={li}
                text={line}
                t={t}
                litAt={litAt}
                live={li === liveLine}
                marks={marks}
                row={marks.some((m) => m.label) ? 1 : 0}
              />
            );
          })}
        </pre>
      </Panel>
    </div>
  );
};

const Arrow: React.FC<{ top: number; label: string; t: number }> = ({ top, label, t }) => {
  const p = EASE_OUT(clamp01(t / 0.5));
  if (p <= 0) return null;
  const h = GAP - 16;
  return (
    <div style={{ position: 'absolute', top: top + 8, left: 70, height: h, opacity: p }}>
      <svg width={30} height={h} style={{ position: 'absolute', left: 0, top: 0 }}>
        <line x1={15} y1={0} x2={15} y2={(h - 10) * p} stroke={C.cyan} strokeWidth={3} />
        <path d={`M 5 ${h - 14} L 15 ${h} L 25 ${h - 14}`} fill="none" stroke={C.cyan} strokeWidth={3} opacity={p} />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: 48,
          top: h / 2 - 15,
          fontFamily: FONT.mono,
          fontSize: 22,
          color: C.cyan,
          whiteSpace: 'nowrap',
          textShadow: `0 0 12px ${hexA(C.cyan, 0.6)}`,
        }}
      >
        {label}
      </div>
    </div>
  );
};

/**
 * The LEDC peripheral, as the TRM describes it: a timer counter ramps
 * 0 → 2^bits − 1 every cycle; the channel drives the pin high at hpoint (0)
 * and low when the counter reaches hpoint + duty.
 */
const Hardware: React.FC<{ top: number; t: number }> = ({ top, t }) => {
  const p = EASE_OUT(clamp01((t - IDF.hardware) / 0.6));
  if (p <= 0) return null;

  const W = 1540;
  const PER = W / 4.5;
  const cTop = 30;
  const cBot = 170;
  const oTop = 228;
  const oBot = 300;
  const duty = IDF.duty / MAX;
  const yDuty = cBot - duty * (cBot - cTop);

  const counterHot = Math.exp(-Math.max(0, t - IDF.counter) * 1.2) * (t >= IDF.counter ? 1 : 0);
  const cmp = EASE_OUT(clamp01((t - IDF.compare) / 0.7));
  const free = EASE_OUT(clamp01((t - IDF.free) / 0.5));

  const phase = (t - IDF.hardware) * 0.45; // periods scrolled
  const k0 = Math.floor(phase) - 1;
  const ramps: React.ReactNode[] = [];
  let saw = '';
  let out = '';
  for (let k = k0; k < k0 + 7; k++) {
    const x0 = (k - phase) * PER;
    const xd = x0 + duty * PER;
    const x1 = x0 + PER;
    saw += `${saw ? ' L' : 'M'} ${x0} ${cBot} L ${x1} ${cTop}`;
    out += `${out ? ' L' : 'M'} ${x0} ${oBot} L ${x0} ${oTop} L ${xd} ${oTop} L ${xd} ${oBot} L ${x1} ${oBot}`;
    ramps.push(
      <g key={k} opacity={cmp}>
        <path d={`M ${x0} ${cBot} L ${xd} ${yDuty} L ${xd} ${cBot} Z`} fill={hexA(C.amber, 0.35)} />
        <line x1={xd} y1={yDuty} x2={xd} y2={oTop} stroke={hexA(C.amber, 0.5)} strokeWidth={1.5} strokeDasharray="4 5" />
      </g>,
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 0,
        right: 0,
        height: HW_H,
        opacity: p,
        transform: `translateY(${(1 - p) * 30}px)`,
      }}
    >
      <Panel
        label="LEDC peripheral · in silicon"
        accent={C.magenta}
        right={
          free > 0 ? (
            <span
              style={{
                opacity: free,
                color: '#1b0a12',
                background: '#7dffb0',
                padding: '3px 14px',
                borderRadius: 999,
                fontWeight: 700,
                letterSpacing: '.1em',
                boxShadow: `0 0 20px ${hexA('#7dffb0', 0.6)}`,
              }}
            >
              CPU: FREE ✓
            </span>
          ) : undefined
        }
      >
        <svg width={W} height={330} style={{ display: 'block', overflow: 'hidden' }}>
          {/* counter */}
          {ramps}
          <path
            d={saw}
            fill="none"
            stroke={C.cyan}
            strokeWidth={3 + 2 * counterHot}
            style={{ filter: `drop-shadow(0 0 ${6 + 14 * counterHot}px ${C.cyan})` }}
          />
          <text x={8} y={cTop - 10} fill={C.cyan} fontFamily={FONT.mono} fontSize={19}>
            timer counter · 0 → {MAX}, a thousand times a second
          </text>

          {/* duty threshold */}
          <g opacity={cmp}>
            <line x1={0} y1={yDuty} x2={W} y2={yDuty} stroke={C.amber} strokeWidth={2.5} strokeDasharray="10 7" />
            <rect x={W - 580} y={yDuty - 34} width={572} height={28} rx={6} fill="rgba(10,4,32,.85)" />
            <text x={W - 568} y={yDuty - 13} fill={C.amber} fontFamily={FONT.mono} fontSize={19}>
              your duty = {IDF.duty} · pin HIGH while counter &lt; duty
            </text>
          </g>

          {/* output */}
          <g opacity={cmp}>
            <path d={out} fill="none" stroke={C.magenta} strokeWidth={3} style={{ filter: `drop-shadow(0 0 8px ${C.magenta})` }} />
            <text x={8} y={oBot + 26} fill={C.magenta} fontFamily={FONT.mono} fontSize={19}>
              GPIO 2
            </text>
          </g>
        </svg>
      </Panel>
    </div>
  );
};
