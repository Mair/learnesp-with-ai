/**
 * One line of code that can explain itself.
 *
 *   ledcAttach(LED, 1000, 8);
 *              ‾‾‾  ‾‾‾‾  ‾
 *              pin 2  1000 Hz  8 bits → 0…255
 *
 * Marks underline a token and hang a label beneath it, each on its own beat,
 * so the VO can walk through a line argument by argument. Labels are
 * left-aligned to their token: in a monospace line, tokens never share a
 * start column, so labels don't collide.
 */
import React from 'react';
import { C, FONT, hexA } from '../theme/palette';
import type { Mark } from './pwm';

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ease = (u: number) => 1 - (1 - clamp01(u)) ** 3;

/** whole-word match when the token edges are word characters */
function find(text: string, token: string): [number, number] | null {
  const esc = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pre = /^\w/.test(token) ? '(?<![\\w])' : '';
  const post = /\w$/.test(token) ? '(?![\\w])' : '';
  const m = new RegExp(pre + esc + post).exec(text);
  return m ? [m.index, m.index + token.length] : null;
}

const isComment = (s: string) => /^\s*(\/\/|\/\*|\*)/.test(s);

export const NOTE_ROW = 34;

export const CodeLine: React.FC<{
  text: string;
  /** seconds, scene-relative */
  t: number;
  /** highlight bar: when it lit (null = never), and whether it's still the live line */
  litAt?: number | null;
  live?: boolean;
  /** dim lines that haven't run yet */
  pending?: boolean;
  marks?: Mark[];
  /** 0..1 — how open the label row under this line is */
  row?: number;
  accent?: string;
}> = ({ text, t, litAt = null, live = false, pending = false, marks = [], row = 0, accent = C.cyan }) => {
  const sweep = litAt !== null ? clamp01((t - litAt) / 0.3) * 100 : 0;
  const strongLive = live && marks.some((m) => m.strong && t >= m.at);
  const bar = strongLive ? C.amber : accent;

  // split the line into plain + marked segments
  const ranges = marks
    .filter((m) => m.token)
    .map((m) => ({ m, r: find(text, m.token!) }))
    .filter((x): x is { m: Mark; r: [number, number] } => !!x.r)
    .sort((a, b) => a.r[0] - b.r[0]);
  const parts: React.ReactNode[] = [];
  let cur = 0;
  ranges.forEach(({ m, r }, i) => {
    if (r[0] < cur) return; // overlapping — skip
    if (r[0] > cur) parts.push(text.slice(cur, r[0]));
    parts.push(<Token key={i} text={text.slice(r[0], r[1])} mark={m} t={t} />);
    cur = r[1];
  });
  parts.push(text.slice(cur));

  return (
    <div style={{ position: 'relative', padding: '0 10px', paddingBottom: row * NOTE_ROW, whiteSpace: 'pre' }}>
      {live && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: row * NOTE_ROW,
            width: `${sweep}%`,
            background: `linear-gradient(90deg, ${hexA(bar, 0.22)}, transparent)`,
            borderLeft: `3px solid ${bar}`,
          }}
        />
      )}
      <span
        style={{
          position: 'relative',
          opacity: pending ? 0.28 : 1,
          color: isComment(text) ? C.muted : live ? '#fff' : undefined,
          fontStyle: isComment(text) ? 'italic' : undefined,
          textShadow: live ? `0 0 18px ${hexA(bar, 0.7)}` : undefined,
        }}
      >
        {parts}
      </span>
    </div>
  );
};

const Token: React.FC<{ text: string; mark: Mark; t: number }> = ({ text, mark, t }) => {
  const p = ease((t - mark.at) / 0.35);
  if (p <= 0) return <>{text}</>;
  const col = mark.strong ? C.amber : C.cyan;
  const pulse = mark.strong ? Math.exp(-Math.max(0, t - mark.at) * 1.4) : 0;
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <span
        style={{
          position: 'absolute',
          left: -3,
          right: -3,
          top: 2,
          bottom: 2,
          borderRadius: 5,
          background: hexA(col, 0.18 * p + 0.25 * pulse),
          boxShadow: `0 0 ${18 * pulse}px ${hexA(col, pulse)}`,
        }}
      />
      <span style={{ position: 'relative', color: '#fff' }}>{text}</span>
      <span
        style={{
          position: 'absolute',
          left: 0,
          bottom: 1,
          height: 3,
          width: `${p * 100}%`,
          background: col,
          boxShadow: `0 0 10px ${col}`,
          borderRadius: 2,
        }}
      />
      {mark.label && (
        <span
          style={{
            position: 'absolute',
            left: 0,
            top: '100%',
            marginTop: 4,
            opacity: p,
            transform: `translateY(${(1 - p) * -6}px)`,
            fontFamily: FONT.sans,
            fontStyle: 'normal',
            fontSize: 22,
            fontWeight: mark.strong ? 700 : 500,
            lineHeight: 1.2,
            letterSpacing: '.01em',
            color: mark.strong ? '#1a0b00' : col,
            background: mark.strong ? col : 'transparent',
            padding: mark.strong ? '2px 10px' : 0,
            borderRadius: 999,
            textShadow: mark.strong ? 'none' : `0 0 12px ${hexA(col, 0.6)}`,
            whiteSpace: 'nowrap',
          }}
        >
          {mark.label}
        </span>
      )}
    </span>
  );
};
