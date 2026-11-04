/**
 * 6 · WRITE — ledc_set_duty(…, 128) + ledc_update_duty(…): set it, then go.
 *
 *   what    the duty is NOT a voltage — it's a time
 *   duty    the line across the counter: 128 → 128 steps on, 128 off → half;
 *           0 → never on; 255 → on 255 of 256; 256 → always on
 *   range   8 bits → 0 … 256; 10 bits → 0 … 1024 — the same half is 128 or 512
 *   load    ledc_set_duty alone changes nothing: the number waits
 *   go      ledc_update_duty: takes effect at the start of the next period
 *   free    both return at once; the hardware keeps switching
 *
 * FACTS: ledc.h l.150–169, l.265–283 (range [0, 2**duty_resolution]); TRM 28.2.3.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { ease, Explainer, GREEN, mono, RED, VIEW_H as H, VIEW_W as W } from '../../components/Explainer';
import { Led } from '../../components/Gadgets';
import { C, FONT, hexA } from '../../theme/palette';
import { after, Verdict } from './parts';
import { FPS, MAX, sceneDur, STEPS, WRITE as R, writeKey, writeOn } from './timeline';

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const DUTY = C.amber;

export const Write: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const v = writeKey(t);
  const [mode, ch, duty] = R.args;
  return (
    <Explainer
      t={t}
      frames={Math.round(sceneDur('write') * FPS)}
      kicker="Setting the brightness · ledc_set_duty() + ledc_update_duty()"
      code={R.code(v)}
      run={R.run}
      args={[
        { ...mode, token: 'LEDC_LOW_SPEED_MODE', color: C.cyan },
        { ...ch, token: 'LEDC_CHANNEL_0', color: C.pink },
        {
          ...duty,
          token: String(v),
          value: String(v),
          sub: t < R.what.howLong ? duty.sub : `steps ON per period · 0 … ${STEPS}`,
          color: DUTY,
        },
      ]}
      captions={R.captions}
      views={[
        { at: R.views.what, component: WhatView, active: [2], label: 'duty · what the number is', accent: DUTY },
        { at: R.views.duty, component: DutyView, active: [2], label: 'duty · the counter vs your number', accent: DUTY, right: () => 'slowed 2000×' },
        { at: R.views.range, component: RangeView, active: [2], label: 'duty · the range comes from the resolution', accent: C.cyan },
        { at: R.views.load, component: LoadView, active: [2], label: 'ledc_set_duty · gets the number ready', accent: DUTY },
        { at: R.views.go, component: GoView, active: [2], label: 'ledc_update_duty · go', accent: GREEN },
        { at: R.views.free, component: FreeView, active: [2], label: 'who keeps the pin switching', accent: C.magenta },
      ]}
    />
  );
};

// ── what: not a voltage, a time ───────────────────────────────────────────

const WhatView: React.FC<{ t: number }> = ({ t }) => {
  const no = ease((t - R.what.notVolt) / 0.45);
  const yes = ease((t - R.what.howLong) / 0.45);
  const card = (p: number, col: string): React.CSSProperties => ({
    opacity: p,
    transform: `translateY(${(1 - p) * 20}px)`,
    borderRadius: 18,
    border: `1px solid ${hexA(col, 0.5)}`,
    background: hexA(col, 0.05),
    padding: '22px 30px',
    display: 'grid',
    alignContent: 'start',
    justifyItems: 'center',
    gap: 18,
  });
  const BW = 600;
  const half = STEPS / 2;
  return (
    <div style={{ position: 'absolute', inset: '20px 0 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
      {/* not a voltage */}
      <div style={card(no, RED)}>
        <div style={{ fontSize: 34, fontWeight: 800, color: RED }}>✗ not a voltage</div>
        <svg width={460} height={250} style={{ overflow: 'visible' }}>
          {/* the pin's only two levels */}
          <line x1={150} y1={30} x2={150} y2={220} stroke={hexA(C.muted, 0.5)} strokeWidth={2} />
          {[
            { y: 30, l: '3.3 V', ok: true },
            { y: 125, l: '1.65 V?', ok: false },
            { y: 220, l: '0 V', ok: true },
          ].map((r) => (
            <g key={r.l}>
              <line x1={130} y1={r.y} x2={170} y2={r.y} stroke={r.ok ? C.magenta : RED} strokeWidth={r.ok ? 4 : 2} strokeDasharray={r.ok ? undefined : '6 5'} />
              <text x={115} y={r.y + 8} textAnchor="end" style={mono(24, r.ok ? C.ink : RED)}>
                {r.l}
              </text>
              {!r.ok && (
                <text x={200} y={r.y + 10} style={{ fontFamily: FONT.sans, fontSize: 30, fontWeight: 800, fill: RED }}>
                  ✗
                </text>
              )}
            </g>
          ))}
          <text x={200} y={45} style={mono(20, C.muted)}>
            the pin only does
          </text>
          <text x={200} y={70} style={mono(20, C.muted)}>
            3.3 V or 0 V
          </text>
        </svg>
        <div style={{ fontSize: 24, color: C.muted, textAlign: 'center' }}>128 does not mean "half the volts"</div>
      </div>

      {/* a time */}
      <div style={card(yes, GREEN)}>
        <div style={{ fontSize: 34, fontWeight: 800, color: GREEN }}>✓ a time</div>
        <div style={{ display: 'grid', gap: 10, justifyItems: 'center', marginTop: 20 }}>
          <div style={mono(22, C.muted)}>one period · 256 steps · 1 ms</div>
          <svg width={BW} height={110} style={{ overflow: 'visible' }}>
            {Array.from({ length: STEPS }, (_, i) => (
              <rect
                key={i}
                x={(i * BW) / STEPS}
                y={0}
                width={BW / STEPS + 0.5}
                height={70}
                shapeRendering="crispEdges"
                fill={i < half ? hexA(DUTY, i % 2 ? 0.8 : 0.95) : `rgba(255,255,255,${i % 2 ? 0.04 : 0.08})`}
              />
            ))}
            <rect x={0} y={0} width={BW} height={70} fill="none" stroke="rgba(255,255,255,.25)" />
            <text x={BW / 4} y={45} textAnchor="middle" style={mono(26, '#1a0b00', { fontWeight: 700 })}>
              ON · 128 steps
            </text>
            <text x={(3 * BW) / 4} y={45} textAnchor="middle" style={mono(26, C.muted)}>
              OFF · 128 steps
            </text>
            <text x={0} y={100} style={mono(18, C.muted)}>
              0 ms
            </text>
            <text x={BW} y={100} textAnchor="end" style={mono(18, C.muted)}>
              1 ms
            </text>
          </svg>
          <div style={{ fontSize: 26, color: C.ink, textAlign: 'center', maxWidth: 560 }}>
            how long the pin stays <b style={{ color: DUTY }}>on</b>, in every period
          </div>
        </div>
      </div>
    </div>
  );
};

// ── duty: the line across the counter ─────────────────────────────────────

const DutyView: React.FC<{ t: number }> = ({ t }) => {
  const D = R.duty;
  const X0 = 110;
  const PER = 350;
  const X1 = X0 + 3 * PER;
  const yTop = 70;
  const yBase = 270;
  const oHi = 350;
  const oLo = 420;
  const sy = (c: number) => yBase - (c / STEPS) * (yBase - yTop);

  const f = writeOn(t);
  const v = writeKey(t);
  const onSteps = Math.min(v, STEPS);
  const lineIn = ease((t - D.line) / 0.6);
  const yLine = yTop + (sy(f * STEPS) - yTop) * lineIn;
  const live = ease((t - D.on) / 0.5);
  const p = t >= D.on ? ((t - D.on) / D.period) % 3 : -1;
  const xp = X0 + p * PER;
  const high = p >= 0 && p - Math.floor(p) < f;

  const changed = t >= D.keys[1].at - 0.2;
  const brackets = changed ? 0 : 1;
  const onB = ease((t - D.stepsOn) / 0.4) * brackets;
  const offB = ease((t - D.stepsOff) / 0.4) * brackets;
  const half = ease((t - D.half) / 0.4);
  const light = ease((t - D.light) / 0.4);
  const top = ease((t - D.top) / 0.4) * (v >= STEPS ? 1 : 0);
  const word = t >= D.keys[4].at ? '' : t >= D.keys[3].at ? 'on the whole time' : t >= D.keys[2].at ? 'on 255 of 256 — one step off' : t >= D.keys[1].at ? 'never on' : '';

  let saw = '';
  let out = '';
  const shades: React.ReactNode[] = [];
  for (let k = 0; k < 3; k++) {
    const x0 = X0 + k * PER;
    const xd = x0 + f * PER;
    saw += `${saw ? ' L' : 'M'} ${x0} ${yBase} L ${x0 + PER} ${yTop}`;
    if (f >= 0.999) out += `${out ? ' L' : 'M'} ${x0} ${oHi} L ${x0 + PER} ${oHi}`;
    else if (f <= 0.001) out += `${out ? ' L' : 'M'} ${x0} ${oLo} L ${x0 + PER} ${oLo}`;
    else out += `${out ? ' L' : 'M'} ${x0} ${oLo} L ${x0} ${oHi} L ${xd} ${oHi} L ${xd} ${oLo} L ${x0 + PER} ${oLo}`;
    if (f > 0.001)
      shades.push(
        <g key={k} opacity={live}>
          <path d={`M ${x0} ${yBase} L ${xd} ${sy(f * STEPS)} L ${xd} ${yBase} Z`} fill={hexA(DUTY, 0.35)} />
          {f < 0.999 && <line x1={xd} y1={sy(f * STEPS)} x2={xd} y2={oHi} stroke={hexA(DUTY, 0.6)} strokeWidth={1.5} strokeDasharray="4 5" />}
        </g>,
      );
  }
  const b0 = X0 + PER; // the middle period carries the step brackets
  const bd = b0 + f * PER;
  const bracket = (xa: number, xb: number, y: number) =>
    `M ${xa} ${y - 8} L ${xa} ${y} L ${xb} ${y} L ${xb} ${y - 8}`;

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg width={W} height={H} style={{ display: 'block', overflow: 'visible' }}>
        <text x={X0 - 14} y={sy(0) + 7} textAnchor="end" style={mono(20, C.cyan)}>
          0
        </text>
        <text x={X0 - 14} y={sy(255) + 7} textAnchor="end" style={mono(20, C.cyan)}>
          255
        </text>
        <text x={X0} y={yTop - 26} style={mono(20, C.cyan)}>
          counter · 0 → 255, every period
        </text>
        <text x={X0 - 14} y={(oHi + oLo) / 2 + 7} textAnchor="end" style={mono(20, C.magenta)}>
          pin
        </text>
        {shades}
        <path d={saw} fill="none" stroke={C.cyan} strokeWidth={3} style={{ filter: `drop-shadow(0 0 6px ${C.cyan})` }} />
        <g opacity={live}>
          <path d={out} fill="none" stroke={C.magenta} strokeWidth={3.5} style={{ filter: `drop-shadow(0 0 8px ${C.magenta})` }} />
        </g>

        {/* your number */}
        {lineIn > 0 && (
          <g opacity={lineIn}>
            <line x1={X0} y1={yLine} x2={X1} y2={yLine} stroke={DUTY} strokeWidth={3} strokeDasharray="12 8" />
            {/* as a legend in the header row — inside the plot it would cross a ramp at some duty */}
            <line x1={X1 - 290} y1={yTop - 33} x2={X1 - 240} y2={yTop - 33} stroke={DUTY} strokeWidth={3} strokeDasharray="12 8" />
            <text x={X1} y={yTop - 26} textAnchor="end" style={mono(22, DUTY)}>
              your duty = {v}
            </text>
          </g>
        )}

        {/* 128 steps on / 128 steps off */}
        {onB > 0 && (
          <g opacity={onB}>
            <path d={bracket(b0, bd, oLo + 24)} fill="none" stroke={DUTY} strokeWidth={2.5} />
            <text x={(b0 + bd) / 2} y={oLo + 52} textAnchor="middle" style={mono(20, DUTY, { fontWeight: 700 })}>
              {onSteps} steps ON
            </text>
          </g>
        )}
        {offB > 0 && (
          <g opacity={offB}>
            <path d={bracket(bd, b0 + PER, oLo + 24)} fill="none" stroke={C.muted} strokeWidth={2.5} />
            <text x={(bd + b0 + PER) / 2} y={oLo + 52} textAnchor="middle" style={mono(20, C.muted)}>
              {STEPS - onSteps} steps OFF
            </text>
          </g>
        )}
        {word && (
          <text x={(X0 + X1) / 2} y={(yBase + oHi) / 2 + 12} textAnchor="middle" style={{ fontFamily: FONT.sans, fontSize: 32, fontWeight: 800, fill: DUTY }}>
            {word}
          </text>
        )}
        {p >= 0 && <line x1={xp} y1={yTop - 10} x2={xp} y2={oLo + 10} stroke="#fff" strokeWidth={2} opacity={0.7 * live} />}
      </svg>

      {/* the pin, live — and what it averages to */}
      <div
        style={{
          position: 'absolute',
          left: X1 + 50,
          top: 0,
          width: W - X1 - 50,
          display: 'grid',
          justifyItems: 'center',
          gap: 10,
          opacity: live,
        }}
      >
        <Led brightness={high ? 1 : 0} size={120} />
        <div
          style={{
            padding: '4px 16px',
            borderRadius: 999,
            fontFamily: FONT.mono,
            fontSize: 22,
            fontWeight: 700,
            color: high ? '#1a0b00' : C.muted,
            background: high ? DUTY : 'rgba(255,255,255,.06)',
          }}
        >
          pin {high ? 'ON' : 'OFF'}
        </div>
        <div style={mono(30, DUTY, { fontWeight: 700, marginTop: 6 })}>duty = {v}</div>
        <div style={{ fontSize: 21, color: C.muted }}>
          on {onSteps} of {STEPS} steps
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, color: C.ink, opacity: half }}>= {Math.round(f * 100)}% of every period</div>
        <div style={{ opacity: light, display: 'grid', gap: 6, justifyItems: 'center', marginTop: 4 }}>
          <div style={{ fontSize: 19, color: C.muted }}>average → brightness</div>
          <div style={{ width: 260, height: 18, borderRadius: 9, background: 'rgba(255,255,255,.08)', overflow: 'hidden' }}>
            <div style={{ width: `${f * 100}%`, height: '100%', background: DUTY, boxShadow: `0 0 14px ${DUTY}` }} />
          </div>
        </div>
        <div style={{ opacity: top, fontSize: 18, color: DUTY, textAlign: 'center', marginTop: 4 }}>
          256 = the top: always on
          <br />
          <span style={{ color: C.muted }}>(255 is on {MAX} of {STEPS} steps)</span>
        </div>
      </div>
    </div>
  );
};

// ── range: set by the resolution ──────────────────────────────────────────

const RangeView: React.FC<{ t: number }> = ({ t }) => {
  const G = R.range;
  const RX0 = 120;
  const RW = 1180;
  const rows = [
    { bits: 8, y: 40, at: G.r8, attach: '.duty_resolution = LEDC_TIMER_8_BIT' },
    { bits: 10, y: 230, at: G.r10, attach: '.duty_resolution = LEDC_TIMER_10_BIT' },
  ];
  const half = ease((t - G.half) / 0.5);
  const h512 = ease((t - G.h512) / 0.4);
  const max10 = ease((t - G.max10) / 0.4);
  const mid = RX0 + RW / 2;

  return (
    <svg width={W} height={H} style={{ display: 'block', overflow: 'visible' }}>
      {rows.map((r) => {
        const n = 2 ** r.bits;
        const p = ease((t - r.at) / 0.5);
        if (p <= 0) return null;
        const yR = r.y + 50;
        const showMax = r.bits === 8 || max10 > 0;
        return (
          <g key={r.bits} opacity={p}>
            <text x={RX0} y={r.y + 26} style={{ fontFamily: FONT.sans, fontSize: 30, fontWeight: 700, fill: C.ink }}>
              {r.bits} bits → 0 … {n}
              <tspan style={{ fontSize: 22, fontWeight: 400, fill: C.muted }}>{`   ·   ${n} steps per period`}</tspan>
            </text>
            <text x={RX0 + RW} y={r.y + 24} textAnchor="end" style={mono(18, C.muted)}>
              {r.attach}
            </text>
            {/* one tick per step: 256 is fine-grained, 1024 is a blur */}
            <rect x={RX0} y={yR} width={RW} height={44} fill="rgba(255,255,255,.04)" stroke="rgba(255,255,255,.18)" />
            {Array.from({ length: n + 1 }, (_, i) => (
              <line
                key={i}
                x1={RX0 + (i / n) * RW}
                y1={yR}
                x2={RX0 + (i / n) * RW}
                y2={yR + 44}
                stroke={C.cyan}
                strokeWidth={1}
                opacity={r.bits === 8 ? 0.55 : 0.3}
              />
            ))}
            <rect x={RX0} y={yR} width={(RW / 2) * half} height={44} fill={hexA(DUTY, 0.35)} />
            <text x={RX0} y={yR + 74} textAnchor="middle" style={mono(22, C.cyan)}>
              0
            </text>
            {showMax && (
              <text x={RX0 + RW} y={yR + 74} textAnchor="middle" opacity={r.bits === 8 ? 1 : max10} style={mono(22, C.cyan)}>
                {n}
              </text>
            )}
            {half > 0 && (
              <text
                x={mid}
                y={yR + 74}
                textAnchor="middle"
                opacity={r.bits === 8 ? half : h512}
                style={mono(26, DUTY, { fontWeight: 800 })}
              >
                {n / 2}
              </text>
            )}
          </g>
        );
      })}

      {/* the same half */}
      {half > 0 && (
        <g opacity={half}>
          {rows.map((r) => (
            <line key={r.bits} x1={mid} y1={r.y + 40} x2={mid} y2={r.y + 104} stroke={DUTY} strokeWidth={2.5} strokeDasharray="8 6" />
          ))}
          <text x={mid} y={430} textAnchor="middle" style={mono(28, DUTY, { fontWeight: 700 })}>
            128 ÷ 256 = 512 ÷ 1024 = half of every period
          </text>
          <text x={mid} y={470} textAnchor="middle" style={mono(20, C.muted)}>
            on-time = duty ÷ 2^bits of every period · more bits → finer steps, bigger numbers
          </text>
        </g>
      )}
    </svg>
  );
};

// ── load: nothing changes yet ─────────────────────────────────────────────

const Lines: React.FC<{ t: number; update: number; go: number }> = ({ t, update, go }) => (
  <div style={{ display: 'grid', gap: 8, ...mono(28, C.ink) }}>
    <div>
      ledc_set_duty(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0, <b style={{ color: DUTY }}>128</b>);
    </div>
    <div style={{ opacity: update, color: go > 0 ? '#fff' : C.ink, textShadow: go > 0 ? `0 0 18px ${hexA(GREEN, 0.7 * go)}` : undefined }}>
      ledc_update_duty(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0);
      <span style={{ color: GREEN, fontWeight: 700, opacity: go }}>{'  '}← go</span>
    </div>
  </div>
);

/** three periods of the pin: duty `a` until period `k`, then `b` */
const PinTrace: React.FC<{ a: number; b: number; k: number; label?: string }> = ({ a, b, k, label }) => {
  const X0 = 60;
  const PER = 440;
  const hi = 30;
  const lo = 110;
  let d = '';
  for (let i = 0; i < 3; i++) {
    const f = (i >= k ? b : a) / STEPS;
    const x0 = X0 + i * PER;
    d += `${d ? ' L' : 'M'} ${x0} ${lo} L ${x0} ${hi} L ${x0 + f * PER} ${hi} L ${x0 + f * PER} ${lo} L ${x0 + PER} ${lo}`;
  }
  return (
    <svg width={W} height={170} style={{ overflow: 'visible' }}>
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={X0 + i * PER} y1={hi - 16} x2={X0 + i * PER} y2={lo + 14} stroke={hexA(C.muted, 0.4)} strokeWidth={1.5} strokeDasharray="4 6" />
      ))}
      <path d={d} fill="none" stroke={C.magenta} strokeWidth={4} style={{ filter: `drop-shadow(0 0 8px ${C.magenta})` }} />
      <text x={0} y={(hi + lo) / 2 + 7} style={mono(20, C.magenta)}>
        pin
      </text>
      {label && (
        <text x={X0} y={lo + 46} style={mono(20, C.muted)}>
          {label}
        </text>
      )}
    </svg>
  );
};

const LoadView: React.FC<{ t: number }> = ({ t }) => {
  const L = R.load;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'start', gap: 28, paddingTop: 20 }}>
      <Lines t={t} update={0} go={0} />
      <div style={{ opacity: after(t, L.nothing) }}>
        <PinTrace a={64} b={64} k={9} label="the pin keeps its old duty (64)" />
      </div>
      <div style={{ fontSize: 30, fontWeight: 700, color: DUTY, opacity: after(t, L.ready) }}>128 is ready — but nothing has changed yet</div>
    </div>
  );
};

const GoView: React.FC<{ t: number }> = ({ t }) => {
  const G = R.go;
  const go = after(t, G.go);
  const next = after(t, G.next);
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'start', gap: 28, paddingTop: 20 }}>
      <Lines t={t} update={after(t, G.update)} go={go} />
      <div style={{ opacity: go }}>
        <PinTrace a={64} b={128} k={next > 0 ? 1 : 9} label={next > 0 ? 'the new duty starts with the next period' : ''} />
      </div>
      <div style={{ fontSize: 30, fontWeight: 700, color: GREEN, opacity: next }}>takes effect at the start of the next period</div>
    </div>
  );
};

const FreeView: React.FC<{ t: number }> = ({ t }) => {
  const F = R.free;
  const ret = after(t, F.returns);
  const hw = after(t, F.hardware);
  const X0 = 150;
  const X1 = W - 40;
  const phase = Math.max(0, t - F.hardware) * 1.2;
  let d = '';
  const per = 120;
  const k0 = Math.floor(phase);
  for (let k = k0; k < k0 + 14; k++) {
    const x = X0 + (k - phase) * per;
    d += `${d ? ' L' : 'M'} ${x} 330 L ${x} 270 L ${x + per / 2} 270 L ${x + per / 2} 330 L ${x + per} 330`;
  }
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg width={W} height={H} style={{ overflow: 'visible' }}>
        <defs>
          <clipPath id="freeclip">
            <rect x={X0} y={0} width={X1 - X0} height={H} />
          </clipPath>
        </defs>
        <text x={0} y={150} style={mono(22, C.ink)}>
          your code
        </text>
        <rect x={X0} y={120} width={250} height={44} rx={8} fill={hexA(DUTY, 0.3)} stroke={DUTY} opacity={ret} />
        <text x={X0 + 12} y={150} style={mono(20, DUTY)} opacity={ret}>
          two calls · return
        </text>
        <text x={X0 + 270} y={150} style={mono(20, C.muted)} opacity={ret}>
          … free to do anything else
        </text>
        <text x={0} y={306} style={mono(22, C.magenta)} opacity={hw}>
          the LEDC
        </text>
        <text x={0} y={332} style={mono(22, C.magenta)} opacity={hw}>
          hardware
        </text>
        <g clipPath="url(#freeclip)" opacity={hw}>
          <path d={d} fill="none" stroke={C.magenta} strokeWidth={4} style={{ filter: `drop-shadow(0 0 8px ${C.magenta})` }} />
        </g>
        <text x={X0} y={400} style={mono(22, C.ink)} opacity={hw}>
          keeps the pin switching, period after period, on its own
        </text>
      </svg>
    </div>
  );
};
