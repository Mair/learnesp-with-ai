/**
 * 3 · SETUP — what `ledcAttach(LED, 1000, 8)` actually asks the hardware for.
 *
 *   intro     the call, each argument pulled out into a card: pin · frequency · resolution
 *   freq      a slowed square wave; one cycle highlighted → 1 period = 1 ms
 *   flicker   same 50% duty at 5 Hz (you see blinks) vs 1000 Hz (you see the average)
 *   counter   one period, zoomed: a counter climbs 2⁸ = 256 steps, 0 … 255, then wraps
 *   duty      your duty is a line across that counter → pin ON below it, OFF above
 *   bits      4 bits (16 steps) vs 8 bits (256 steps): banding vs a smooth fade
 *   clock     256 steps × 1000 Hz = 256,000 ticks/s, which must fit in 80 MHz
 *
 * Every cue lives in SETUP (timeline.ts). The counter position comes from
 * `setupCounter()`, which the soundtrack also uses.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { ease, Explainer, GREEN, inOut, mono, RED, VIEW_H as H, VIEW_W as W } from '../../components/Explainer';
import { Led } from '../../components/Gadgets';
import { pinHigh } from '../../components/pwm';
import { C, FONT, GRAD_TEXT, hexA } from '../../theme/palette';
import { CLOCK_HZ, FPS, PWM_HZ, SETUP as S, sceneDur, setupCounter, STEPS } from './timeline';

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ARG_COLOR = [C.amber, C.magenta, C.cyan];

export const Setup: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const V = S.views;

  // the cards learn more as the VO explains them
  const subs = [
    S.args[0].sub,
    t < S.freq.perSec ? S.args[1].sub : t < S.freq.period ? '1000 cycles every second' : '1 period = 1 ms',
    t < S.counter.steps ? S.args[2].sub : '2⁸ = 256 steps · 0 … 255',
  ];

  return (
    <Explainer
      t={t}
      frames={Math.round(sceneDur('setup') * FPS)}
      kicker="Setting up the pin · ledcAttach()"
      code={S.code}
      run={S.run}
      args={S.args.map((a, i) => ({ ...a, sub: subs[i], color: ARG_COLOR[i] }))}
      captions={S.captions}
      views={[
        {
          at: V.freq,
          component: FreqView,
          active: [1],
          label: 'frequency · cycles per second',
          accent: C.magenta,
          right: (t) => (t < S.freq.freeze[1] ? 'slowed 2000×' : 'paused'),
        },
        { at: V.flicker, component: FlickerView, active: [1], label: 'frequency vs your eye', accent: C.magenta, right: () => 'real time' },
        {
          at: V.counter,
          component: CounterView,
          active: [2],
          label: 'resolution · one period, zoomed in',
          accent: C.cyan,
          right: () => `${STEPS} steps per period`,
        },
        {
          at: V.duty,
          component: DutyView,
          active: [2],
          label: 'duty · the counter vs your number',
          accent: C.cyan,
          right: () => `duty = ${S.duty.value}`,
        },
        { at: V.bits, component: BitsView, active: [2], label: 'resolution · bits vs smoothness', accent: C.cyan },
        {
          at: V.clock,
          component: ClockView,
          active: [1, 2],
          label: 'the budget · counter ticks per second',
          accent: C.cyan,
          right: () => 'ESP32 · LEDC timer',
        },
      ]}
    />
  );
};

// ── views ─────────────────────────────────────────────────────────────────

/** cycles scrolled: constant speed, then decelerating to a stop across `freeze` */
function freqPhase(t: number) {
  const v = S.freq.scroll;
  const t0 = S.views.freq;
  const [z0, z1] = S.freq.freeze;
  const L = z1 - z0;
  const x = Math.min(Math.max(t, z0), z1) - z0;
  return v * (Math.min(t, z0) - t0) + v * (x - (x * x) / (2 * L));
}

const FreqView: React.FC<{ t: number }> = ({ t }) => {
  const F = S.freq;
  const LM = 96;
  const cw = (W - LM - 20) / 3.3;
  const yHi = 150;
  const yLo = 320;
  const yRuler = 360;
  const phase = freqPhase(Math.max(t, S.views.freq));
  const kh = Math.floor(freqPhase(F.freeze[1])) + 2; // the cycle we single out
  const X = (k: number) => LM + (k - phase) * cw;

  let wave = '';
  const ticks: React.ReactNode[] = [];
  const tickLabels: React.ReactNode[] = [];
  for (let k = Math.floor(phase) - 1; k <= Math.floor(phase) + 5; k++) {
    const x0 = X(k);
    const xm = x0 + cw / 2;
    wave += `${wave ? ' L' : 'M'} ${x0} ${yLo} L ${x0} ${yHi} L ${xm} ${yHi} L ${xm} ${yLo} L ${x0 + cw} ${yLo}`;
    if (x0 >= LM - 1 && x0 <= W) {
      ticks.push(<line key={k} x1={x0} y1={yRuler - 10} x2={x0} y2={yRuler + 10} stroke={C.muted} strokeWidth={2} />);
      const fadeEdge = clamp01((x0 - LM) / 40) * clamp01((W - x0) / 40);
      tickLabels.push(
        <text key={k} x={x0} y={yRuler + 38} textAnchor="middle" opacity={fadeEdge} style={mono(20, C.muted)}>
          {k} ms
        </text>,
      );
    }
  }

  const hi = ease((t - F.cycle) / 0.5);
  const xa = X(kh);
  const xb = X(kh + 1);
  const label = t < F.ms ? 'one cycle: on, then off' : t < F.period ? 'one cycle = 1 ms' : '1 period = 1 ms';
  const ms = ease((t - F.ms) / 0.4);
  const per = ease((t - F.period) / 0.4);
  const hz = ease((t - F.hz) / 0.5);
  const count = Math.floor(PWM_HZ * clamp01(t - F.perSec));
  const countIn = ease((t - F.perSec) / 0.3);

  return (
    <svg width={W} height={H} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <clipPath id="freqclip">
          <rect x={LM} y={0} width={W - LM} height={H} />
        </clipPath>
        <linearGradient id="freqfill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.magenta} stopOpacity=".3" />
          <stop offset="1" stopColor={C.magenta} stopOpacity="0" />
        </linearGradient>
      </defs>
      <text x={LM - 14} y={yHi + 7} textAnchor="end" style={mono(20, C.muted)}>
        3.3 V
      </text>
      <text x={LM - 14} y={yLo + 7} textAnchor="end" style={mono(20, C.muted)}>
        0 V
      </text>
      <g clipPath="url(#freqclip)">
        {hi > 0 && (
          <rect x={xa} y={yHi - 30} width={xb - xa} height={yLo - yHi + 30} fill={hexA(C.amber, 0.13 * hi)} stroke={hexA(C.amber, 0.7 * hi)} strokeWidth={2} rx={6} />
        )}
        <path d={`${wave} L ${W} ${yLo} Z`} fill="url(#freqfill)" />
        <path d={wave} fill="none" stroke={C.magenta} strokeWidth={4} style={{ filter: `drop-shadow(0 0 10px ${C.magenta})` }} />
        <line x1={LM} y1={yRuler} x2={W} y2={yRuler} stroke={hexA(C.muted, 0.5)} strokeWidth={2} />
        {ticks}
      </g>
      {tickLabels}

      {/* the one cycle */}
      {hi > 0 && (
        <g opacity={hi}>
          <line x1={xa} y1={yHi - 50} x2={xb} y2={yHi - 50} stroke={C.amber} strokeWidth={3} />
          <line x1={xa} y1={yHi - 62} x2={xa} y2={yHi - 38} stroke={C.amber} strokeWidth={3} />
          <line x1={xb} y1={yHi - 62} x2={xb} y2={yHi - 38} stroke={C.amber} strokeWidth={3} />
          <rect x={(xa + xb) / 2 - 170} y={yHi - 92} width={340} height={36} rx={18} fill="rgba(10,4,32,.9)" />
          <text
            x={(xa + xb) / 2}
            y={yHi - 66}
            textAnchor="middle"
            style={{ fontFamily: FONT.sans, fontSize: 26, fontWeight: per > 0 ? 800 : 600, fill: C.amber }}
          >
            {label}
          </text>
          <text x={(xa + xa + (xb - xa) / 2) / 2} y={yHi + 40} textAnchor="middle" style={mono(22, C.ink)}>
            on
          </text>
          <text x={(xa + (xb - xa) / 2 + xb) / 2} y={yLo - 20} textAnchor="middle" style={mono(22, C.muted)}>
            off
          </text>
        </g>
      )}
      {ms > 0 && (
        <g opacity={ms}>
          <line x1={xa} y1={yRuler} x2={xb} y2={yRuler} stroke={C.amber} strokeWidth={5} style={{ filter: `drop-shadow(0 0 8px ${C.amber})` }} />
        </g>
      )}

      {/* 1000 Hz → 1000 cycles in one real second */}
      {hz > 0 && (
        <text x={W - 10} y={46} textAnchor="end" opacity={hz} style={{ fontFamily: FONT.sans, fontSize: 30, fontWeight: 700, fill: C.magenta }}>
          1000 Hz = 1000 cycles every second
        </text>
      )}
      {countIn > 0 && (
        <text x={W - 10} y={86} textAnchor="end" opacity={countIn} style={mono(24, C.ink)}>
          counting one real second: {String(count).padStart(4, '\u2007')}
        </text>
      )}
      {per > 0 && (
        <text x={W - 10} y={H - 22} textAnchor="end" opacity={per} style={mono(28, C.amber)}>
          period = 1 ÷ frequency = 1 ÷ 1000 Hz = 1 ms
        </text>
      )}
    </svg>
  );
};

const FlickerView: React.FC<{ t: number }> = ({ t }) => {
  const F = S.flicker;
  const rel = t - S.views.flicker;
  const same = ease((t - F.same) / 0.4);
  const verdict = ease((t - F.fast) / 0.4);
  const cols = [
    { hz: F.slowHz, led: pinHigh(rel * F.slowHz, 0.5) ? 1 : 0, sub: `${F.slowHz} cycles per second`, v: '✗ you see it flicker', vc: RED },
    { hz: PWM_HZ, led: 0.5, sub: '1000 cycles per second', v: '✓ steady — half brightness', vc: GREEN },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateRows: '46px 1fr', gap: 10 }}>
      <div style={{ display: 'grid', placeItems: 'center' }}>
        <div
          style={{
            opacity: same,
            padding: '6px 22px',
            borderRadius: 999,
            border: `1px solid ${hexA(C.amber, 0.6)}`,
            color: C.amber,
            fontSize: 24,
            fontWeight: 600,
          }}
        >
          same duty on both: on 50% of every cycle
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
        {cols.map((c, i) => {
          const win = i === 1 && verdict > 0 ? verdict : 0;
          return (
            <div
              key={c.hz}
              style={{
                display: 'grid',
                justifyItems: 'center',
                alignContent: 'start',
                gap: 8,
                borderRadius: 18,
                padding: '8px 0',
                background: hexA(i === 1 ? GREEN : RED, 0.05 * verdict),
                boxShadow: win ? `inset 0 0 0 2px ${hexA(GREEN, 0.5 * win)}` : undefined,
              }}
            >
              <div style={mono(44, C.ink, { fontWeight: 700 })}>{c.hz} Hz</div>
              <Led brightness={c.led} size={170} />
              <OneSecond hz={c.hz} t={rel} />
              <div style={{ fontSize: 22, color: C.muted, height: 28 }}>{c.sub}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: c.vc, opacity: verdict, height: 32 }}>{c.v}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** one real second of signal, with a playhead sweeping it once a second */
const OneSecond: React.FC<{ hz: number; t: number }> = ({ hz, t }) => {
  const w = 620;
  const h = 70;
  const cw = w / hz;
  let d = '';
  for (let k = 0; k < hz; k++) {
    const x0 = k * cw;
    d += `${d ? ' L' : 'M'} ${x0} ${h} L ${x0} 4 L ${x0 + cw / 2} 4 L ${x0 + cw / 2} ${h} L ${x0 + cw} ${h}`;
  }
  const px = (t - Math.floor(t)) * w;
  return (
    <svg width={w} height={h + 26} style={{ overflow: 'visible' }}>
      <path d={d} fill="none" stroke={C.magenta} strokeWidth={hz > 100 ? 1 : 3} opacity={hz > 100 ? 0.55 : 1} style={{ filter: `drop-shadow(0 0 6px ${C.magenta})` }} />
      <line x1={px} y1={-4} x2={px} y2={h + 4} stroke="#fff" strokeWidth={2} opacity={0.7} />
      <text x={0} y={h + 22} style={mono(16, C.muted)}>
        0 s
      </text>
      <text x={w} y={h + 22} textAnchor="end" style={mono(16, C.muted)}>
        1 s
      </text>
    </svg>
  );
};

const CounterView: React.FC<{ t: number }> = ({ t }) => {
  const K = S.counter;
  const X0 = 110;
  const X1 = W - 40;
  const yBase = 400;
  const yTop = 130;
  const sw = (X1 - X0) / STEPS;
  const sx = (i: number) => X0 + i * sw;
  const sy = (v: number) => yBase - (v / (STEPS - 1)) * (yBase - yTop);
  const stairs = (n: number) => {
    let d = `M ${X0} ${sy(0)}`;
    for (let i = 0; i < n; i++) d += ` H ${sx(i + 1)}${i + 1 < n ? ` V ${sy(i + 1)}` : ''}`;
    return d;
  };

  const appear = ease((t - K.appear) / 1.2);
  const pow = ease((t - K.pow) / 0.4);
  const steps = ease((t - K.steps) / 0.4);
  const tiny = ease((t - K.tiny) / 0.5);
  const fast = ease((t - K.fast[0]) / 0.5);
  const c = setupCounter(t);
  const n = Math.min(STEPS, Math.floor(c.u * STEPS) + 1);
  const shown = t >= K.sweep[0];
  const px = sx(c.u * STEPS);

  // magnifier: 8 of the 256 steps
  const M0 = 96;
  const MN = 8;
  const ins = { x: 140, y: 26, w: 400, h: 190 };
  const mw = ins.w / MN;
  const mh = (ins.h - 50) / MN;
  let mag = `M ${ins.x} ${ins.y + ins.h - 10}`;
  for (let i = 0; i < MN; i++) mag += ` H ${ins.x + (i + 1) * mw}${i + 1 < MN ? ` V ${ins.y + ins.h - 10 - (i + 1) * mh}` : ''}`;

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg width={W} height={H} style={{ display: 'block', overflow: 'visible' }}>
        {/* the period frame — carried over from the frequency view */}
        <line x1={X0} y1={100} x2={X0} y2={440} stroke={hexA(C.magenta, 0.5)} strokeWidth={2} strokeDasharray="6 6" />
        <line x1={X1} y1={100} x2={X1} y2={440} stroke={hexA(C.magenta, 0.5)} strokeWidth={2} strokeDasharray="6 6" />
        <line x1={X0} y1={440} x2={X1} y2={440} stroke={C.magenta} strokeWidth={3} />
        <text x={X0} y={472} textAnchor="middle" style={mono(20, C.muted)}>
          0 ms
        </text>
        <text x={X1} y={472} textAnchor="middle" style={mono(20, C.muted)}>
          1 ms
        </text>
        <text x={(X0 + X1) / 2} y={472} textAnchor="middle" style={mono(22, fast > 0 ? C.amber : C.magenta)}>
          {fast > 0 ? '1 period — and it repeats 1000 times a second' : '1 period'}
        </text>

        {/* the counter */}
        <g opacity={appear}>
          <text x={X0 - 14} y={sy(0) + 7} textAnchor="end" style={mono(20, C.cyan)}>
            0
          </text>
          <text x={X0 - 14} y={sy(255) + 7} textAnchor="end" style={mono(20, C.cyan)}>
            255
          </text>
          <clipPath id="ghostclip">
            <rect x={X0} y={0} width={(X1 - X0) * appear} height={H} />
          </clipPath>
          <path d={stairs(STEPS)} fill="none" stroke={hexA(C.cyan, 0.28)} strokeWidth={2} clipPath="url(#ghostclip)" />
        </g>
        {shown && (
          <>
            <path d={stairs(n)} fill="none" stroke={C.cyan} strokeWidth={3.5} style={{ filter: `drop-shadow(0 0 8px ${C.cyan})` }} />
            <line x1={px} y1={yTop - 20} x2={px} y2={440} stroke="#fff" strokeWidth={2} opacity={0.6} />
            <circle cx={px} cy={sy(n - 1)} r={7} fill="#fff" style={{ filter: `drop-shadow(0 0 8px ${C.cyan})` }} />
            <rect x={Math.min(px + 14, X1 - 230)} y={sy(n - 1) - 54} width={210} height={38} rx={8} fill="rgba(10,4,32,.88)" />
            <text x={Math.min(px + 14, X1 - 230) + 12} y={sy(n - 1) - 27} style={mono(24, C.cyan)}>
              counter = {String(n - 1).padStart(3, '\u2007')}
            </text>
          </>
        )}

        {/* the 256 steps along the bottom */}
        <g opacity={0.25 + 0.75 * tiny}>
          {Array.from({ length: STEPS }, (_, i) => (
            <rect key={i} x={sx(i) + 0.4} y={yBase + 12} width={sw - 0.8} height={16} fill={hexA(C.cyan, i % 2 ? 0.25 : 0.55)} />
          ))}
        </g>

        {/* magnifier */}
        {tiny > 0 && (
          <g opacity={tiny}>
            <line x1={ins.x + ins.w} y1={ins.y + ins.h} x2={sx(M0 + MN / 2)} y2={sy(M0 + MN / 2) - 4} stroke={hexA(C.cyan, 0.6)} strokeWidth={1.5} strokeDasharray="5 5" />
            <circle cx={sx(M0 + MN / 2)} cy={sy(M0 + MN / 2)} r={14} fill="none" stroke={C.cyan} strokeWidth={2} />
            <rect x={ins.x - 14} y={ins.y - 8} width={ins.w + 28} height={ins.h + 16} rx={12} fill="rgba(10,4,32,.92)" stroke={hexA(C.cyan, 0.6)} strokeWidth={1.5} />
            <path d={mag} fill="none" stroke={C.cyan} strokeWidth={3} />
            {/* one step, measured */}
            {/* tread 5 sits at the right; the lower-right of the box is empty */}
            <line x1={ins.x + 5 * mw} y1={ins.y + ins.h - 10 - 5 * mh + 7} x2={ins.x + 6 * mw} y2={ins.y + ins.h - 10 - 5 * mh + 7} stroke={C.amber} strokeWidth={4} />
            <line x1={ins.x + 5.5 * mw} y1={ins.y + ins.h - 10 - 5 * mh + 10} x2={ins.x + ins.w - 70} y2={ins.y + ins.h - 62} stroke={hexA(C.amber, 0.6)} strokeWidth={1.5} />
            <text x={ins.x + ins.w - 6} y={ins.y + ins.h - 40} textAnchor="end" style={mono(18, C.muted)}>
              1 ms ÷ 256
            </text>
            <text x={ins.x + ins.w - 6} y={ins.y + ins.h - 14} textAnchor="end" style={mono(20, C.amber)}>
              1 step ≈ 3.9 µs
            </text>
            <text x={ins.x + 6} y={ins.y + 20} style={mono(18, C.muted)}>
              8 of the 256 steps, magnified
            </text>
          </g>
        )}
      </svg>

      {/* 2⁸ = 256 */}
      {pow > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 600,
            top: 6,
            opacity: pow,
            transform: `scale(${0.85 + 0.15 * pow})`,
            transformOrigin: 'left top',
            display: 'flex',
            alignItems: 'baseline',
            gap: 16,
          }}
        >
          <span style={{ ...GRAD_TEXT, fontSize: 84, fontWeight: 800, lineHeight: 1 }}>
            2<sup style={{ fontSize: 46 }}>8</sup>
          </span>
          {steps > 0 && (
            <span style={{ opacity: steps, fontSize: 40, fontWeight: 700, color: C.ink }}>
              = 256 steps
            </span>
          )}
        </div>
      )}
    </div>
  );
};

const DutyView: React.FC<{ t: number }> = ({ t }) => {
  const D = S.duty;
  const X0 = 110;
  const X1 = 1290;
  const PER = (X1 - X0) / 3;
  const yTop = 80;
  const yBase = 285;
  const oHi = 370;
  const oLo = 440;
  const frac = D.value / STEPS;
  const yDuty = yBase - (D.value / (STEPS - 1)) * (yBase - yTop);

  const line = ease((t - D.line) / 0.6);
  const yLine = yTop + (yDuty - yTop) * line;
  const on = ease((t - D.on) / 0.5);
  const off = ease((t - D.off) / 0.5);
  const p = Math.min(3, Math.max(0, (t - D.trace) / D.period)); // periods traced
  const xp = X0 + p * PER;
  const high = t >= D.trace && p < 3 && p - Math.floor(p) < frac;

  let saw = '';
  let out = '';
  const shades: React.ReactNode[] = [];
  for (let k = 0; k < 3; k++) {
    const x0 = X0 + k * PER;
    const xd = x0 + frac * PER;
    saw += `${saw ? ' L' : 'M'} ${x0} ${yBase} L ${x0 + PER} ${yTop}`;
    out += `${out ? ' L' : 'M'} ${x0} ${oLo} L ${x0} ${oHi} L ${xd} ${oHi} L ${xd} ${oLo} L ${x0 + PER} ${oLo}`;
    shades.push(
      <g key={k}>
        <path d={`M ${x0} ${yBase} L ${xd} ${yDuty} L ${xd} ${yBase} Z`} fill={hexA(C.amber, 0.35 * on)} />
        <line x1={xd} y1={yDuty} x2={xd} y2={oHi} stroke={hexA(C.amber, 0.7 * off)} strokeWidth={1.5} strokeDasharray="4 5" />
        <circle cx={xd} cy={yDuty} r={6 * off} fill={C.amber} />
      </g>,
    );
  }

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg width={W} height={H} style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <clipPath id="traceclip">
            <rect x={0} y={0} width={xp} height={H} />
          </clipPath>
        </defs>
        <text x={X0 - 14} y={yBase + 7} textAnchor="end" style={mono(20, C.cyan)}>
          0
        </text>
        <text x={X0 - 14} y={yTop + 7} textAnchor="end" style={mono(20, C.cyan)}>
          255
        </text>
        <text x={X0} y={yTop - 22} style={mono(20, C.cyan)}>
          counter · 0 → 255, every period
        </text>
        <text x={X0 - 14} y={(oHi + oLo) / 2 + 7} textAnchor="end" style={mono(20, C.magenta)}>
          pin
        </text>
        {shades}
        <path d={saw} fill="none" stroke={hexA(C.cyan, 0.3)} strokeWidth={2.5} />
        <path d={saw} fill="none" stroke={C.cyan} strokeWidth={3.5} clipPath="url(#traceclip)" style={{ filter: `drop-shadow(0 0 8px ${C.cyan})` }} />
        <path d={out} fill="none" stroke={C.magenta} strokeWidth={3.5} clipPath="url(#traceclip)" style={{ filter: `drop-shadow(0 0 8px ${C.magenta})` }} />

        {/* your number */}
        {line > 0 && (
          <g opacity={line}>
            <line x1={X0} y1={yLine} x2={X1} y2={yLine} stroke={C.amber} strokeWidth={3} strokeDasharray="12 8" />
            <rect x={X1 - 250} y={yLine - 44} width={250} height={34} rx={8} fill="rgba(10,4,32,.88)" />
            <text x={X1 - 12} y={yLine - 19} textAnchor="end" style={mono(22, C.amber)}>
              your duty = {D.value}
            </text>
          </g>
        )}
        {t >= D.trace && p < 3 && <line x1={xp} y1={yTop - 10} x2={xp} y2={oLo + 14} stroke="#fff" strokeWidth={2} opacity={0.7} />}
      </svg>

      {/* the pin, live */}
      <div style={{ position: 'absolute', left: X1 + 40, top: 30, width: W - X1 - 40, display: 'grid', justifyItems: 'center', gap: 14 }}>
        <Led brightness={high ? 1 : 0} size={130} />
        <div
          style={{
            padding: '6px 18px',
            borderRadius: 999,
            fontFamily: FONT.mono,
            fontSize: 26,
            fontWeight: 700,
            color: high ? '#1a0b00' : C.muted,
            background: high ? C.amber : 'rgba(255,255,255,.06)',
            boxShadow: high ? `0 0 24px ${hexA(C.amber, 0.6)}` : 'none',
          }}
        >
          pin {high ? 'ON' : 'OFF'}
        </div>
        <div style={{ display: 'grid', gap: 8, marginTop: 10, fontFamily: FONT.mono, fontSize: 18 }}>
          <div style={{ opacity: on, color: C.amber }}>counter &lt; {D.value} → ON</div>
          <div style={{ opacity: off, color: C.muted }}>counter ≥ {D.value} → OFF</div>
        </div>
      </div>
    </div>
  );
};

const BitsView: React.FC<{ t: number }> = ({ t }) => {
  const [f0, f1] = S.bits.fade;
  const level = 1 - inOut((t - f0) / (f1 - f0));
  const rows = [
    { bits: 4, y: 40 },
    { bits: 8, y: 250 },
  ];
  const BX = 240;
  const BW = W - BX - 20;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {rows.map(({ bits, y }) => {
        const n = 2 ** bits;
        const q = Math.floor(level * (n - 0.001)) / (n - 1);
        const step = (1000 / n).toFixed(1);
        return (
          <div key={bits} style={{ position: 'absolute', left: 0, top: y, width: W, height: 180 }}>
            <div style={{ position: 'absolute', left: 30, top: 34 }}>
              <Led brightness={q} size={130} />
            </div>
            <div style={{ position: 'absolute', left: BX, top: 0, width: BW, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 30, fontWeight: 700, color: C.ink }}>
                {bits} bits · 2<sup>{bits}</sup> = {n} steps
                <span style={{ fontSize: 22, fontWeight: 400, color: C.muted }}>
                  {'  '}· {step} µs each
                </span>
              </span>
              <span style={mono(24, C.amber)}>
                level {String(Math.round(q * (n - 1))).padStart(3, '\u2007')} / {n - 1}
              </span>
            </div>
            <svg width={BW + 20} height={120} style={{ position: 'absolute', left: BX, top: 48, overflow: 'visible' }}>
              {Array.from({ length: n }, (_, i) => (
                <rect
                  key={i}
                  x={(i * BW) / n}
                  y={0}
                  width={BW / n + 0.6}
                  height={76}
                  fill={`rgba(255,176,46,${0.04 + 0.96 * (i / (n - 1))})`}
                  shapeRendering="crispEdges"
                />
              ))}
              <rect x={0} y={0} width={BW} height={76} fill="none" stroke="rgba(255,255,255,.18)" />
              <g transform={`translate(${q * BW}, 0)`}>
                <line x1={0} y1={-8} x2={0} y2={84} stroke="#fff" strokeWidth={3} />
                <path d="M -9 96 L 0 84 L 9 96 Z" fill="#fff" />
              </g>
            </svg>
          </div>
        );
      })}
    </div>
  );
};

const fmtHz = (hz: number) => (hz >= 1000 ? `${hz / 1000} kHz` : `${hz} Hz`);
const fmtMHz = (x: number) => (x < 1 ? x.toFixed(3) : x < 100 ? x.toFixed(1) : x.toFixed(0)) + ' MHz';

const ClockView: React.FC<{ t: number }> = ({ t }) => {
  const K = S.clock;
  const LX = 0;
  const BX = 350;
  const FULL = 580; // px for 80 MHz
  const ROW0 = 214;
  const ROW_H = 62;
  const eq = [ease((t - K.steps) / 0.4), ease((t - K.perSec) / 0.4), ease((t - K.ticks) / 0.4)];
  const clock = ease((t - K.clock) / 0.5);
  const out = ease((t - K.out) / 0.4);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 26, fontFamily: FONT.mono, fontSize: 46, marginTop: 20, height: 70 }}>
        <span style={{ opacity: eq[0], color: C.cyan }}>256 steps</span>
        <span style={{ opacity: eq[1], color: C.magenta }}>× 1000 / s</span>
        <span style={{ opacity: eq[2], color: C.amber, fontWeight: 700 }}>= 256,000 ticks / s</span>
      </div>

      <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <g opacity={clock}>
          <text x={LX} y={150} style={mono(24, C.ink)}>
            LEDC clock: 80 MHz = 80,000,000 ticks / s — the most it can count
          </text>
          <line x1={BX + FULL} y1={198} x2={BX + FULL} y2={ROW0 + ROW_H * 4 - 10} stroke={RED} strokeWidth={2} strokeDasharray="8 6" />
          <text x={BX + FULL} y={190} textAnchor="middle" style={mono(18, RED)}>
            80 MHz
          </text>
        </g>
        {K.rows.map((r, i) => {
          const need = (r.hz * 2 ** r.bits) / 1e6;
          const frac = need / (CLOCK_HZ / 1e6);
          const grow = ease((t - r.at) / (frac > 1 ? 1.0 : 0.6));
          if (grow <= 0) return null;
          const y = ROW0 + i * ROW_H;
          const w = Math.max(3, FULL * frac * grow);
          const over = frac > 1 && grow * frac > 1;
          const ok = frac <= 1;
          const done = grow >= 0.99;
          const col = over ? RED : C.cyan;
          return (
            <g key={i} opacity={ease((t - r.at) / 0.3)}>
              <text x={LX} y={y + 30} style={mono(26, C.ink)}>
                {fmtHz(r.hz)} · {r.bits} bits
              </text>
              <rect x={BX} y={y + 6} width={FULL} height={34} rx={6} fill="rgba(255,255,255,.05)" />
              <rect x={BX} y={y + 6} width={Math.min(w, FULL)} height={34} rx={6} fill={hexA(col, 0.7)} />
              {w > FULL && <rect x={BX + FULL} y={y + 6} width={w - FULL} height={34} rx={6} fill={hexA(RED, 0.85)} />}
              <text
                x={w > 260 ? BX + w - 12 : BX + w + 12}
                y={y + 31}
                textAnchor={w > 260 ? 'end' : 'start'}
                style={mono(22, w > 260 ? '#0a0420' : C.ink, { fontWeight: 700 })}
              >
                {fmtMHz(need * grow)}
              </text>
              {done && (ok || out > 0) && (
                <text x={W - 10} y={y + 32} textAnchor="end" opacity={ok ? 1 : out} style={{ fontFamily: FONT.sans, fontSize: 28, fontWeight: 800, fill: ok ? GREEN : RED }}>
                  {ok ? '✓' : '✗ out of clock'}
                </text>
              )}
            </g>
          );
        })}
        <text x={0} y={H - 8} opacity={out} style={mono(19, C.muted)}>
          ESP32 · 80 MHz APB clock · up to 20 bits (S2 / S3 / C3: 14) · ledcAttach() returns false if it can't fit
        </text>
      </svg>
    </div>
  );
};
