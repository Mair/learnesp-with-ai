/**
 * `Explainer` — the shot type for "what does each argument of this call mean?"
 *
 *   ledcAttach(LED, 1000, 8);          ← the call, big; runs on `run`
 *      ╰──────┬─────┬────╮
 *   [ PIN ] [ FREQUENCY ] [ RESOLUTION ]   ← one card per argument, lit on `at`
 *   ┌───────────── stage ─────────────┐
 *   │  one view per idea, crossfaded  │   ← views keyed by start time
 *   └─────────────────────────────────┘
 *   caption
 *
 * The call + cards start centred and lift when the first view arrives.
 * Each view says which cards it's about (`active`); the rest dim.
 * Used by the setup (ledcAttach) and write (ledcWrite) scenes.
 */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, FONT, hexA } from '../theme/palette';
import { EASE_OUT } from './anim';
import { CaptionLine } from './CodeToHardware';
import { Panel } from './Panel';
import type { Caption } from './pwm';
import { Kicker, Scene } from './Type';

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const ease = (u: number) => EASE_OUT(clamp01(u));
export const inOut = (u: number) => {
  const x = clamp01(u);
  return x * x * (3 - 2 * x);
};

export const GREEN = '#7dffb0';
export const RED = '#ff5470';

// ── layout ────────────────────────────────────────────────────────────────

const CODE_SIZE = 50;
const CODE_TOP = 92;
const CARD_TOP = 214;
const CARD_W = 420;
const CARD_H = 104;
const CARD_GAP = 480;
const STAGE = { left: 160, top: 344, width: 1600, height: 576 };
/** drawable area of a view, inside the Panel's padding */
export const VIEW_W = STAGE.width - 56;
export const VIEW_H = STAGE.height - 66;

/** one style helper for HTML and SVG text */
export const mono = (size: number, color: string, extra: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily: FONT.mono,
  fontSize: size,
  color,
  fill: color,
  ...extra,
});

export type ExplainerArg = {
  /** the argument as it appears in the call */
  token: string;
  /** scene seconds: underline + card appear */
  at: number;
  title: string;
  value: string;
  sub: string;
  color: string;
};

export type ExplainerView = {
  at: number;
  component: React.FC<{ t: number }>;
  /** indices of the cards this view is about */
  active: number[];
  label: string;
  accent: string;
  right?: (t: number) => React.ReactNode;
};

export const Explainer: React.FC<{
  t: number;
  frames: number;
  kicker: string;
  /** the call as displayed (may change over time — tokens must still match) */
  code: string;
  /** scene seconds: the line runs */
  run: number;
  args: ExplainerArg[];
  views: ExplainerView[];
  captions: Caption[];
  /** card width / spacing — narrower for calls with more than four arguments */
  cardW?: number;
  cardGap?: number;
  /** override the call line's font size (long calls) */
  codeSize?: number;
  /** scene seconds: the call line fades in (default: there from the start) */
  codeIn?: number;
}> = ({ t, frames, kicker, code, run, args, views, captions, cardW = CARD_W, cardGap = CARD_GAP, codeSize = CODE_SIZE, codeIn }) => {
  const order = [...views].sort((a, b) => a.at - b.at);
  let cur = -1;
  order.forEach((v, i) => {
    if (t >= v.at) cur = i;
  });
  const view = cur >= 0 ? order[cur] : null;
  const active = view ? view.active : null;
  const first = order[0].at;
  const lift = 300 * (1 - inOut((t - (first - 0.5)) / 0.8));
  const stageIn = ease((t - (first - 0.1)) / 0.6);
  const codeOpacity = codeIn === undefined ? 1 : ease((t - codeIn) / 0.5);

  return (
    <Scene durationInFrames={frames}>
      <AbsoluteFill>
        <div style={{ position: 'absolute', top: 40, width: '100%', display: 'grid', placeItems: 'center' }}>
          <Kicker delay={0.1} accent="cyan">
            {kicker}
          </Kicker>
        </div>

        <div style={{ position: 'absolute', inset: 0, transform: `translateY(${lift}px)`, opacity: codeOpacity }}>
          <CallLine t={t} code={code} run={run} args={args} active={active} gap={cardGap} size={codeSize} />
          {args.map((a, i) => (
            <ArgCard key={i} arg={a} x={cardX(i, args.length, cardGap)} t={t} on={active ? active.includes(i) : true} lit={!!active} w={cardW} />
          ))}
        </div>

        {stageIn > 0 && view && (
          <div style={{ position: 'absolute', ...STAGE, opacity: stageIn, transform: `translateY(${(1 - stageIn) * 30}px)` }}>
            <Panel label={view.label} accent={view.accent} right={view.right?.(t)}>
              <div style={{ position: 'relative', width: VIEW_W, height: VIEW_H }}>
                {order.map((v, i) => {
                  const next = order[i + 1]?.at ?? Infinity;
                  // out over 0.35 s before the next view, in over 0.45 s
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

        <div style={{ position: 'absolute', top: 944, width: '100%', display: 'grid', placeItems: 'center' }}>
          <CaptionLine captions={captions} t={t} size={32} />
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

const cardX = (i: number, n: number, gap = CARD_GAP) => 960 + (i - (n - 1) / 2) * gap;

function tokenCol(code: string, token: string) {
  const esc = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = new RegExp(`(?<![\\w])${esc}(?![\\w])`).exec(code);
  return m ? m.index : 0;
}

const CallLine: React.FC<{ t: number; code: string; run: number; args: ExplainerArg[]; active: number[] | null; gap?: number; size?: number }> = ({
  t,
  code,
  run: runAt,
  args,
  active,
  gap = CARD_GAP,
  size = CODE_SIZE,
}) => {
  const run = ease((t - runAt) / 0.3);
  const CH = size * 0.6;
  const codeX = (1920 - code.length * CH) / 2;
  const located = args
    .map((a, i) => ({ a, i, c: tokenCol(code, a.token) }))
    .sort((x, y) => x.c - y.c);
  const parts: React.ReactNode[] = [];
  let cur = 0;
  for (const { a, i, c } of located) {
    // several cards may point at one token (a struct's fields → `&timer`): draw it once
    if (c < cur) continue;
    parts.push(code.slice(cur, c));
    const p = ease((t - a.at) / 0.35);
    const on = active ? active.includes(i) : p > 0;
    parts.push(
      <span key={i} style={{ position: 'relative', display: 'inline-block' }}>
        <span
          style={{
            position: 'absolute',
            left: -4,
            right: -4,
            top: 4,
            bottom: 4,
            borderRadius: 6,
            background: hexA(a.color, p * (on ? 0.28 : 0.1)),
            boxShadow: on && p > 0 ? `0 0 22px ${hexA(a.color, 0.45)}` : 'none',
          }}
        />
        <span style={{ position: 'relative', color: p > 0 ? '#fff' : undefined }}>{a.token}</span>
        <span
          style={{
            position: 'absolute',
            left: 0,
            bottom: 2,
            height: 4,
            width: `${p * 100}%`,
            borderRadius: 2,
            background: a.color,
            opacity: on ? 1 : 0.4,
            boxShadow: `0 0 10px ${a.color}`,
          }}
        />
      </span>,
    );
    cur = c + a.token.length;
  }
  parts.push(code.slice(cur));

  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: CODE_TOP,
          left: codeX - 24,
          padding: '0 24px',
          fontFamily: FONT.mono,
          fontSize: size,
          lineHeight: 1.3,
          whiteSpace: 'pre',
          color: '#cfd6ff',
          borderLeft: `4px solid ${hexA(C.cyan, run)}`,
          background: `linear-gradient(90deg, ${hexA(C.cyan, 0.16 * run)}, transparent ${20 + 80 * run}%)`,
          textShadow: run > 0 ? `0 0 18px ${hexA(C.cyan, 0.5 * run)}` : undefined,
        }}
      >
        {parts}
      </div>
      {/* leader lines: token → card */}
      <svg width={1920} height={CARD_TOP + 4} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        {args.map((a, i) => {
          const p = ease((t - a.at) / 0.5);
          if (p <= 0) return null;
          const x1 = codeX + (tokenCol(code, a.token) + a.token.length / 2) * CH;
          const y1 = CODE_TOP + size * 1.3 + 2;
          const x2 = cardX(i, args.length, gap);
          const y2 = CARD_TOP;
          const on = active ? active.includes(i) : true;
          return (
            <path
              key={i}
              d={`M ${x1} ${y1} C ${x1} ${y1 + 34}, ${x2} ${y2 - 34}, ${x2} ${y2}`}
              fill="none"
              stroke={a.color}
              strokeWidth={2.5}
              pathLength={1}
              strokeDasharray={`${p} 1`}
              opacity={on ? 0.9 : 0.3}
              style={{ filter: `drop-shadow(0 0 6px ${a.color})` }}
            />
          );
        })}
      </svg>
    </>
  );
};

const ArgCard: React.FC<{ arg: ExplainerArg; x: number; t: number; on: boolean; lit: boolean; w?: number }> = ({ arg: a, x, t, on, lit, w = CARD_W }) => {
  const p = ease((t - a.at) / 0.45);
  if (p <= 0) return null;
  const col = a.color;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - w / 2,
        top: CARD_TOP,
        width: w,
        height: CARD_H,
        boxSizing: 'border-box',
        borderRadius: 16,
        border: `1px solid ${hexA(col, on ? 0.85 : 0.3)}`,
        background: `linear-gradient(165deg, ${hexA(col, on ? 0.14 : 0.05)}, rgba(10,4,32,.82))`,
        boxShadow: on && lit ? `0 0 34px ${hexA(col, 0.35)}` : '0 14px 40px rgba(0,0,0,.45)',
        opacity: p * (on ? 1 : 0.45),
        transform: `translateY(${(1 - p) * 18}px)`,
        display: 'grid',
        placeItems: 'center',
        alignContent: 'center',
        gap: 2,
      }}
    >
      <div style={{ fontFamily: FONT.mono, fontSize: 15, letterSpacing: '.28em', textTransform: 'uppercase', color: col }}>
        {a.title}
      </div>
      <div style={{ fontSize: w < 360 ? 30 : 36, fontWeight: 700, color: C.ink, letterSpacing: '.02em' }}>{a.value}</div>
      <div style={{ fontSize: 20, color: C.muted }}>{a.sub}</div>
    </div>
  );
};
