/**
 * 4 · TIMER — what each field of `ledc_timer_config(&timer)` asks for.
 *
 *   speed    low speed: every chip has it; the timer and the channel must match
 *   timers   four timers · this is timer 0
 *   freq     a slowed square wave; one cycle highlighted → 1 period = 1 ms
 *   flicker  same 50% duty at 5 Hz (you see blinks) vs 1000 Hz (you see the average)
 *   counter  one period, zoomed: a counter climbs 2⁸ = 256 steps, 0 … 255, then wraps
 *   bits     4 bits (16 steps) vs 8 bits (256 steps): banding vs a smooth fade
 *   clock    256 × 1000 = 256,000 counts/s must fit the 80 MHz clock · 17 bits ✗
 *   log      ledc_timer_config logs it and returns ESP_FAIL
 *   check    ESP_ERROR_CHECK stops the program on that line · the fix
 *
 * The struct's fields all hang off `&timer` — the bundle the call receives.
 * FACTS: ledc.h l.57–74, l.141–147; ledc.c l.468–497, l.571–604, l.746; TRM 28.2.2.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { ease, Explainer, GREEN, inOut, mono, RED, VIEW_H as H, VIEW_W as W } from '../../components/Explainer';
import { Led } from '../../components/Gadgets';
import { pinHigh } from '../../components/pwm';
import { C, FONT, GRAD_TEXT, hexA } from '../../theme/palette';
import { after, Block, LogBox, MiniCounter, Verdict } from './parts';
import { CLOCK_HZ, FPS, PWM_HZ, sceneDur, STEPS, TIMER as S, timerCounter } from './timeline';

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ARG_COLOR = [C.cyan, C.cyan, C.magenta, C.cyan, C.cyan];

export const Timer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const V = S.views;
  // the cards learn more as the VO explains them
  const sub = (i: number) => {
    if (i === 2) return t < S.freq.ms ? S.args[2].sub : '1 period = 1 ms';
    if (i === 3) return t < S.counter.steps ? S.args[3].sub : '2⁸ = 256 steps';
    return S.args[i].sub;
  };
  return (
    <Explainer
      t={t}
      frames={Math.round(sceneDur('timer') * FPS)}
      kicker="Call 1 · the timer · ledc_timer_config()"
      code={S.code}
      run={S.run}
      cardW={300}
      cardGap={330}
      args={S.args.map((a, i) => ({ ...a, sub: sub(i), color: ARG_COLOR[i] }))}
      captions={S.captions}
      views={[
        { at: V.speed, component: SpeedView, active: [0], label: 'speed_mode · a group of timers and channels', accent: C.cyan },
        { at: V.timers, component: TimersView, active: [1], label: 'timer_num · which timer', accent: C.cyan },
        {
          at: V.freq,
          component: FreqView,
          active: [2],
          label: 'freq_hz · cycles per second',
          accent: C.magenta,
          right: (t) => (t < S.freq.freeze[1] ? 'slowed 2000×' : 'paused'),
        },
        { at: V.flicker, component: FlickerView, active: [2], label: 'frequency vs your eye', accent: C.magenta, right: () => 'real time' },
        {
          at: V.counter,
          component: CounterView,
          active: [3],
          label: 'duty_resolution · one period, zoomed in',
          accent: C.cyan,
          right: () => `${STEPS} steps per period`,
        },
        { at: V.bits, component: BitsView, active: [3], label: 'resolution · bits vs smoothness', accent: C.cyan },
        { at: V.clock, component: ClockView, active: [2, 3, 4], label: 'clk_cfg · counts per second must fit the clock', accent: C.cyan },
        { at: V.log, component: LogView, active: [3], label: 'what you see · 17 bits', accent: RED, right: () => 'recorded in QEMU' },
        { at: V.check, component: CheckView, active: [3], label: 'ESP_ERROR_CHECK · stop right there', accent: RED, right: () => 'recorded in QEMU' },
      ]}
    />
  );
};

// ── speed mode ────────────────────────────────────────────────────────────

const SpeedView: React.FC<{ t: number }> = ({ t }) => {
  const P = S.speed;
  const low = after(t, P.low);
  const every = after(t, P.every);
  const same = after(t, P.same);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Block x={60} y={30} w={620} h={190} title="LOW SPEED" sub="every ESP32 chip has it" color={C.cyan} p={low} lit>
        <div style={mono(20, C.ink)}>LEDC_LOW_SPEED_MODE ✓ use this</div>
      </Block>
      <Block x={760} y={30} w={620} h={190} title="HIGH SPEED" sub="original ESP32 only" color={C.muted} p={every} dim />
      <div style={{ position: 'absolute', left: 60, top: 270, width: 1320, opacity: same, display: 'grid', gap: 14, ...mono(28, C.ink) }}>
        <div>
          timer.speed_mode&nbsp;&nbsp;&nbsp;= <b style={{ color: C.cyan }}>LEDC_LOW_SPEED_MODE</b>,
        </div>
        <div>
          channel.speed_mode = <b style={{ color: C.cyan }}>LEDC_LOW_SPEED_MODE</b>,
        </div>
        <div style={{ fontFamily: FONT.sans, fontSize: 28, fontWeight: 700, color: GREEN, marginTop: 6 }}>✓ the timer and the channel must say the same thing</div>
      </div>
    </div>
  );
};

// ── four timers ───────────────────────────────────────────────────────────

const TimersView: React.FC<{ t: number }> = ({ t }) => {
  const P = S.timers;
  const zero = t >= P.zero;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {[0, 1, 2, 3].map((i) => (
        <Block
          key={i}
          x={40 + i * 370}
          y={90}
          w={330}
          h={230}
          title={`TIMER ${i}`}
          sub={i === 0 && zero ? 'LEDC_TIMER_0 · ours' : `LEDC_TIMER_${i}`}
          color={C.cyan}
          p={after(t, P.four + i * 0.15, 0.35)}
          lit={zero && i === 0}
          dim={zero && i > 0}
        >
          <MiniCounter t={t + i * 0.3} w={240} h={56} />
        </Block>
      ))}
      <div style={{ position: 'absolute', left: 40, top: 370, fontSize: 28, color: C.ink, opacity: after(t, P.zero) }}>
        each timer is a counter with its own frequency and resolution
      </div>
    </div>
  );
};

// ── reused v1 views ───────────────────────────────────────────────────────

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
  const c = timerCounter(t);
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

const fmtMHz = (x: number) => (x < 1 ? x.toFixed(2) : x < 100 ? x.toFixed(1) : x.toFixed(0)) + ' M';

const ClockView: React.FC<{ t: number }> = ({ t }) => {
  const K = S.clock;
  const LX = 0;
  const BX = 330;
  const FULL = 640; // px for 80 MHz
  const ROW0 = 236;
  const ROW_H = 70;
  const eq = [after(t, K.steps, 0.4), after(t, K.perSec, 0.4), after(t, K.ticks, 0.4)];
  const auto = after(t, K.auto);
  const clock = after(t, K.clock);
  const out = after(t, K.out, 0.4);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 26, fontFamily: FONT.mono, fontSize: 44, marginTop: 14, height: 66 }}>
        <span style={{ opacity: eq[0], color: C.cyan }}>256 steps</span>
        <span style={{ opacity: eq[1], color: C.magenta }}>× 1000 / s</span>
        <span style={{ opacity: eq[2], color: C.amber, fontWeight: 700 }}>= 256,000 counts / s</span>
      </div>
      <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <g opacity={auto}>
          <text x={LX} y={130} style={mono(24, C.ink)}>
            LEDC_AUTO_CLK → the driver picks a clock for you
          </text>
        </g>
        <g opacity={clock}>
          <text x={LX} y={172} style={mono(24, C.ink)}>
            the fastest: 80 MHz = 80 million counts / s
          </text>
          <line x1={BX + FULL} y1={200} x2={BX + FULL} y2={ROW0 + ROW_H * 3 - 8} stroke={RED} strokeWidth={2} strokeDasharray="8 6" />
          <text x={BX + FULL} y={196} textAnchor="middle" style={mono(18, RED)}>
            80 MHz
          </text>
        </g>
        {K.rows.map((r, i) => {
          const need = (r.hz * 2 ** r.bits) / 1e6;
          const frac = need / (CLOCK_HZ / 1e6);
          const grow = after(t, r.at, frac > 1 ? 1.0 : 0.6);
          if (grow <= 0) return null;
          const y = ROW0 + i * ROW_H;
          const w = Math.max(3, FULL * frac * grow);
          const ok = frac <= 1;
          const done = grow >= 0.99;
          const over = frac > 1 && grow * frac > 1;
          const col = over ? RED : C.cyan;
          return (
            <g key={i} opacity={after(t, r.at, 0.3)}>
              <text x={LX} y={y + 32} style={mono(26, C.ink)}>
                1000 Hz × {r.bits} bits
              </text>
              <rect x={BX} y={y + 8} width={FULL} height={36} rx={6} fill="rgba(255,255,255,.05)" />
              <rect x={BX} y={y + 8} width={Math.min(w, FULL)} height={36} rx={6} fill={hexA(col, 0.7)} />
              {w > FULL && <rect x={BX + FULL} y={y + 8} width={w - FULL} height={36} rx={6} fill={hexA(RED, 0.85)} />}
              <text x={w > 200 ? BX + Math.min(w, FULL + 240) - 12 : BX + w + 12} y={y + 34} textAnchor={w > 200 ? 'end' : 'start'} style={mono(22, w > 200 ? '#0a0420' : C.ink, { fontWeight: 700 })}>
                {fmtMHz(need * grow)}
              </text>
              {done && (ok || out > 0) && (
                <text x={W - 10} y={y + 34} textAnchor="end" opacity={ok ? 1 : out} style={{ fontFamily: FONT.sans, fontSize: 28, fontWeight: 800, fill: ok ? GREEN : RED }}>
                  {ok ? '✓ fits' : '✗ doesn’t fit'}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ── the trap: 17 bits ─────────────────────────────────────────────────────

const LogView: React.FC<{ t: number }> = ({ t }) => {
  const L = S.log;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'start', gap: 22, paddingTop: 10 }}>
      <div style={mono(28, C.ink)}>
        .duty_resolution = <b style={{ color: RED }}>LEDC_TIMER_17_BIT</b>,
      </div>
      <LogBox
        t={t}
        at={L.logs}
        width={1480}
        lines={[
          { text: 'E (1519) ledc: requested frequency 1000 and duty resolution 17 can not be achieved,' },
          { text: 'try reducing freq_hz or duty_resolution. div_param=0' },
        ]}
      />
      <div style={{ ...mono(34, RED, { fontWeight: 700 }), opacity: after(t, L.fail) }}>ledc_timer_config(&timer) → ESP_FAIL</div>
    </div>
  );
};

const CheckView: React.FC<{ t: number }> = ({ t }) => {
  const K = S.check;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'start', gap: 16, paddingTop: 4 }}>
      <div style={mono(26, C.ink)}>
        <b style={{ color: C.amber }}>ESP_ERROR_CHECK</b>(ledc_timer_config(&timer));
      </div>
      <LogBox
        t={t}
        at={K.stops}
        width={1480}
        size={20}
        lines={[
          { text: 'ESP_ERROR_CHECK failed: esp_err_t 0xffffffff (ESP_FAIL) at 0x400d5d96' },
          { text: 'file: "./main/main.c" line 39', color: C.amber },
          { text: 'func: app_main' },
          { text: 'expression: ledc_timer_config(&timer)', color: C.amber },
        ]}
      />
      <div style={{ fontSize: 26, color: C.ink, opacity: after(t, K.line) }}>the program stops (abort) and tells you which line</div>
      <Verdict ok p={after(t, K.fix)} size={26}>
        the fix: fewer bits (<b>LEDC_TIMER_8_BIT</b>) or a lower frequency
      </Verdict>
    </div>
  );
};
