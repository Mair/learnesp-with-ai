/**
 * `CodeToHardware` — Tier-1 shot type from course-design/02-ANIMATION.md.
 *
 * Code on the left. The physical result on the right. The signal underneath.
 * All three are driven by ONE timeline, through the pure signal model in
 * `pwm.ts` — the same model the soundtrack is generated from. Picture and
 * sound cannot drift: causality made visible, and audible.
 *
 * Two outputs:
 *   led      duty → brightness. Optional slow motion (`timescale`) slows the
 *            *camera*, not the chip, so individual edges can be seen.
 *   speaker  frequency → pitch. Scope shows a fixed real-time window so you
 *            can count the cycles.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { C, FONT, GRAD_TEXT, hexA } from '../theme/palette';
import { CodeLine, NOTE_ROW } from './CodeLine';
import { Led, Speaker } from './Gadgets';
import { Panel } from './Panel';
import {
  apparentHz,
  Beat,
  beatIndex,
  Caption,
  dutyAt,
  fusion,
  hzAt,
  integrate,
  noteName,
  pinHigh,
  RateKey,
  rateAt,
} from './pwm';

export type { Beat, Caption, RateKey } from './pwm';

const CODE_FONT = { fontFamily: FONT.mono, fontSize: 30, lineHeight: 1.75 };
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export const CodeToHardware: React.FC<{
  beats: Beat[];
  /** PWM frequency, Hz (beats with `hz` override it) */
  hz: number;
  /** duty resolution in bits (8 → 0..255) */
  bits?: number;
  output?: 'led' | 'speaker';
  /** context lines shown above the beats, never highlighted */
  preamble?: string[];
  /** on-screen explanation, readable with the sound off */
  captions?: Caption[];
  /** playback speed keys (led only); omit for real time throughout */
  timescale?: RateKey[];
  /** speaker: real-time scope window, ms */
  windowMs?: number;
  pin?: number;
  title?: string;
}> = ({
  beats,
  hz,
  bits = 8,
  output = 'led',
  preamble = [],
  captions = [],
  timescale = [],
  windowMs = 10,
  pin = 2,
  title = 'ledc',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const max = 2 ** bits - 1;

  const idx = beatIndex(beats, t);
  const duty = dutyAt(beats, t);
  const curHz = hzAt(beats, t, hz);

  // ── led: slow-mo aware ──
  const rate = rateAt(timescale, t);
  const fd = apparentHz(curHz, timescale, t);
  const cycles = integrate((x) => apparentHz(curHz, timescale, x), t);
  const fuse = fusion(fd);
  const led = (pinHigh(cycles, duty) ? 1 : 0) * (1 - fuse) + duty * fuse;
  const slow = 1 / rate;

  // ── scope ──
  const scope =
    output === 'led'
      ? {
          phase: integrate((x) => scopeRate(apparentHz(curHz, timescale, x)), t),
          cycles: interpLog(fd, 2, 200, 2.5, 9),
          nowDot: 1 - fuse,
          label: `scope · ${fmtHz(curHz)} · 1 cycle = ${fmtPeriod(1 / curHz)}`,
          right: slow > 1.02 ? `slowed ${Math.round(slow)}×` : 'real time',
        }
      : {
          phase: t * 0.5,
          cycles: (curHz * windowMs) / 1000,
          nowDot: 0,
          label: `scope · ${windowMs} ms window`,
          right: duty > 0 ? `${curHz} cycles / s` : '',
        };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: 'auto 210px 96px',
        gap: 30,
        width: 1600,
        fontFamily: FONT.sans,
      }}
    >
      {/* ── LEFT: code ───────────────────────────────── */}
      <Panel label={`${title}.ino`} accent={C.cyan}>
        <pre
          style={{
            ...CODE_FONT,
            margin: 0,
            color: '#cfd6ff',
            // reserve room for one open label row so nothing below ever jumps
            minHeight: (preamble.length + beats.length) * CODE_FONT.fontSize * CODE_FONT.lineHeight + NOTE_ROW,
          }}
        >
          {preamble.map((line, i) => (
            <div key={`p${i}`} style={{ padding: '0 10px', color: C.muted, opacity: 0.7 }}>
              {line}
            </div>
          ))}
          {beats.map((b, i) => {
            const labelled = (b.marks ?? []).some((m) => m.label);
            const end = beats[i + 1]?.at ?? Infinity;
            const row = labelled
              ? clamp01((t - b.at) / 0.3) * (1 - clamp01((t - end) / 0.3))
              : 0;
            return (
              <CodeLine
                key={i}
                text={b.code}
                t={t}
                litAt={i === idx ? b.at : null}
                live={i === idx}
                pending={i > idx}
                marks={row > 0.02 ? b.marks : undefined}
                row={row * row * (3 - 2 * row)}
              />
            );
          })}
        </pre>
      </Panel>

      {/* ── RIGHT: the hardware ──────────────────────── */}
      <Panel
        label={`GPIO ${pin}`}
        accent={C.amber}
        right={output === 'led' && slow > 1.02 ? <SlowMoBadge factor={slow} /> : undefined}
      >
        <div style={{ display: 'grid', placeItems: 'center', gap: 14, padding: '4px 0' }}>
          {output === 'led' ? (
            <Led brightness={led} />
          ) : (
            <Speaker hz={curHz} level={duty > 0 ? 1 : 0} t={t} />
          )}
          <div
            style={{
              fontFamily: FONT.mono,
              fontSize: 40,
              color: output === 'led' ? C.amber : C.cyan,
              textShadow: `0 0 18px ${hexA(output === 'led' ? C.amber : C.cyan, 0.6)}`,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {output === 'led'
              ? `${String(Math.round(duty * max)).padStart(3, '\u2007')} / ${max}`
              : duty > 0
                ? `${curHz} Hz · ${noteName(curHz)}`
                : 'silent'}
          </div>
          <div style={{ fontSize: 24, color: C.muted, letterSpacing: '.04em' }}>
            on <span style={{ color: C.ink }}>{Math.round(duty * 100)}%</span> of every cycle
          </div>
        </div>
      </Panel>

      {/* ── BOTTOM: the signal ─────────────────────── */}
      <div style={{ gridColumn: '1 / -1' }}>
        <Panel label={scope.label} accent={C.magenta} right={scope.right}>
          <Scope duty={duty} phase={scope.phase} cycles={scope.cycles} nowDot={scope.nowDot} />
        </Panel>
      </div>

      {/* ── CAPTION: what you'd say if the sound were off ── */}
      <div style={{ gridColumn: '1 / -1', display: 'grid', placeItems: 'center' }}>
        <CaptionLine captions={captions} t={t} />
      </div>
    </div>
  );
};

/** scope scroll speed (cycles/s): real while slow, settles to a calm drift */
function scopeRate(f: number) {
  if (f <= 2) return f;
  return 2 + (1.1 - 2) * clamp01(Math.log(f / 2) / Math.log(25));
}

function interpLog(x: number, x0: number, x1: number, y0: number, y1: number) {
  const u = clamp01(Math.log(x / x0) / Math.log(x1 / x0));
  return y0 + (y1 - y0) * u;
}

const fmtHz = (hz: number) => (hz >= 1000 ? `${hz / 1000} kHz` : `${hz} Hz`);
function fmtPeriod(s: number) {
  return s >= 1 ? `${s} s` : s >= 1e-3 ? `${+(s * 1e3).toFixed(2)} ms` : `${+(s * 1e6).toFixed(1)} µs`;
}

const SlowMoBadge: React.FC<{ factor: number }> = ({ factor }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '3px 12px',
      borderRadius: 999,
      border: `1px solid ${hexA(C.magenta, 0.6)}`,
      background: hexA(C.magenta, 0.12),
      color: C.pink,
      fontVariantNumeric: 'tabular-nums',
      letterSpacing: '.14em',
      opacity: clamp01(Math.log(factor) / Math.log(4)),
    }}
  >
    <span
      style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: C.magenta,
        boxShadow: `0 0 10px ${C.magenta}`,
      }}
    />
    SLOW-MO ×{Math.round(factor)}
  </span>
);

export const CaptionLine: React.FC<{ captions: Caption[]; t: number; size?: number }> = ({
  captions,
  t,
  size = 36,
}) => {
  let c: Caption | null = null;
  for (const x of captions) if (t >= x.at) c = x;
  if (!c) return null;
  const p = clamp01((t - c.at) / 0.3);
  const ease = 1 - (1 - p) ** 3;
  return (
    <div
      key={c.at}
      style={{
        opacity: ease,
        transform: `translateY(${(1 - ease) * 14}px)`,
        textAlign: 'center',
        ...(c.em
          ? { ...GRAD_TEXT, fontSize: size * 2, fontWeight: 800, letterSpacing: '.04em' }
          : {
              fontSize: size,
              fontWeight: 500,
              color: C.ink,
              textShadow: '0 2px 18px rgba(0,0,0,.7)',
            }),
      }}
    >
      {c.text}
    </div>
  );
};

/**
 * Rolling square wave. The right edge is "now": while slowed down, the LED is
 * lit exactly when the trace at the right edge is high.
 */
export const Scope: React.FC<{
  duty: number;
  phase: number;
  cycles: number;
  nowDot?: number;
  W?: number;
  H?: number;
  color?: string;
}> = ({ duty, phase, cycles, nowDot = 0, W = 1480, H = 110, color = C.magenta }) => {
  const TOP = 8;
  const cw = W / Math.max(cycles, 0.01);
  const on = duty > 0.001;

  let d = '';
  const k0 = Math.floor(phase - cycles) - 1;
  const k1 = Math.ceil(phase) + 1;
  for (let k = k0; k <= k1; k++) {
    const x0 = W - (phase - k) * cw;
    const xh = x0 + cw * duty;
    const x1 = x0 + cw;
    d += `${d ? ' L' : 'M'} ${x0} ${H} L ${x0} ${on ? TOP : H} L ${xh} ${on ? TOP : H} L ${xh} ${H} L ${x1} ${H}`;
  }
  const high = pinHigh(phase, duty);
  const id = `scope${Math.round(W)}`;

  return (
    <svg width={W} height={H + 20} style={{ display: 'block', overflow: 'hidden' }}>
      <defs>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity=".35" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1={0} y1={H * g} x2={W} y2={H * g} stroke="rgba(255,255,255,.07)" strokeWidth={1} />
      ))}
      <path d={`${d} L ${W} ${H} Z`} fill={`url(#${id}f)`} />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeLinejoin="miter"
        style={{ filter: `drop-shadow(0 0 10px ${color})` }}
      />
      {nowDot > 0.01 && (
        <circle
          cx={W - 6}
          cy={high ? TOP : H}
          r={7}
          fill="#fff"
          opacity={nowDot}
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />
      )}
    </svg>
  );
};
