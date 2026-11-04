/**
 * 8 · FADE — three calls: ledc_fade_func_install, ledc_set_fade_with_time, ledc_fade_start.
 *
 *   install  once, at start-up · 0 = the defaults
 *   forget   "Fade service not installed" → ESP_FAIL
 *   from     target 0 over 2800 ms · no starting value: it fades from the duty it has (230)
 *   ramp     the duty over 2.8 s, and three snapshots of the pin: still only on or off
 *   stairs   a whole number → a staircase: 2800 ÷ 230 → −1 every 12 periods → 2.76 s
 *   engine   the LEDC hardware does the stepping, not your code
 *   start    LEDC_FADE_WAIT_DONE: your task waits, the CPU is free
 *   nowait   LEDC_FADE_NO_WAIT: returns at once · the next duty change waits for the fade
 *
 * FACTS: ledc.c l.1352–1357, l.1426–1458, l.1462–1483; ledc.h l.448–457; ledc_types.h l.136–140.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { ease, Explainer, GREEN, mono, RED, VIEW_H as H, VIEW_W as W } from '../../components/Explainer';
import { Led } from '../../components/Gadgets';
import { C, FONT, hexA } from '../../theme/palette';
import { after, LogBox, Verdict } from './parts';
import {
  FADE as F,
  FADE_CYCLE,
  FADE_FROM,
  FADE_MS,
  FADE_REAL_S,
  FADE_STEPS,
  FADE_TOTAL,
  fadeDutyAt,
  FPS,
  PWM_HZ,
  sceneDur,
  STEPS,
} from './timeline';

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const DUTY = C.amber;
const COLORS: Record<string, string> = { flags: C.cyan, 'speed mode': C.cyan, channel: C.pink, target: DUTY, time: DUTY, mode: GREEN };

export const Fade: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const V = F.views;
  let call = F.calls[0];
  for (const c of F.calls) if (t >= c.from) call = c;
  const noWait = t >= F.noWait && 'noWait' in call && call.noWait;
  const code = noWait ? (call as { noWait: string }).noWait : call.code;
  const args = call.args.map((a) => ({
    ...a,
    token: noWait && a.token === 'LEDC_FADE_WAIT_DONE' ? 'LEDC_FADE_NO_WAIT' : a.token,
    value: noWait && a.title === 'mode' ? 'no wait' : a.value,
    sub: noWait && a.title === 'mode' ? 'returns at once' : a.sub,
    color: COLORS[a.title] ?? C.cyan,
  }));
  return (
    <Explainer
      t={t}
      frames={Math.round(sceneDur('fade') * FPS)}
      kicker="Fading · three calls"
      code={code}
      run={call.run}
      codeSize={call.size}
      args={args}
      captions={F.captions}
      views={[
        { at: V.install, component: InstallView, active: [0], label: 'ledc_fade_func_install · once, at start-up', accent: C.cyan },
        { at: V.forget, component: ForgetView, active: [0], label: 'forget it', accent: RED, right: () => 'idf.py monitor' },
        { at: V.from, component: FromView, active: [2, 3], label: 'where to end, and how long', accent: DUTY },
        { at: V.ramp, component: RampView, active: [2, 3], label: 'the duty over time', accent: DUTY, right: () => 'real time' },
        {
          at: V.stairs,
          component: StairsView,
          active: [2, 3],
          label: 'zoomed in · the first 6 steps',
          accent: C.cyan,
          right: () => `${FADE_STEPS} steps · ${FADE_CYCLE} periods each`,
        },
        { at: V.engine, component: EngineView, active: [2, 3], label: 'who does the stepping', accent: C.magenta },
        { at: V.start, component: StartView, active: [2], label: 'ledc_fade_start · go', accent: GREEN, right: (t) => (t >= F.start.run[0] ? 'fade slowed ~2×' : undefined) },
        { at: V.nowait, component: NoWaitView, active: [2], label: 'LEDC_FADE_NO_WAIT', accent: C.amber },
      ]}
    />
  );
};

// ── install / forget ──────────────────────────────────────────────────────

const InstallView: React.FC<{ t: number }> = ({ t }) => {
  const I = F.install;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 26, padding: '0 30px' }}>
      <div style={{ display: 'grid', gap: 6, ...mono(28, C.muted) }}>
        <div>ESP_ERROR_CHECK(ledc_channel_config(&channel));</div>
        <div style={{ color: '#fff', opacity: after(t, I.once) }}>
          ESP_ERROR_CHECK(ledc_fade_func_install(<b style={{ color: C.cyan }}>0</b>));
          <span style={{ fontFamily: FONT.sans, color: C.cyan, fontWeight: 700 }}>{'   '}← once, at start-up</span>
        </div>
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color: C.ink, opacity: after(t, I.on) }}>it switches fading on, for every channel</div>
      <div style={{ fontSize: 28, color: C.ink, opacity: after(t, I.zero) }}>
        <b style={{ color: C.cyan }}>0</b> = the default settings
      </div>
    </div>
  );
};

const ForgetView: React.FC<{ t: number }> = ({ t }) => {
  const G = F.forget;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'start', gap: 22, paddingTop: 16 }}>
      <div style={{ ...mono(28, C.muted), textDecoration: 'line-through', textDecorationColor: RED, textDecorationThickness: 3 }}>
        ESP_ERROR_CHECK(ledc_fade_func_install(0));
      </div>
      <LogBox
        t={t}
        at={G.logs}
        width={1480}
        lines={[
          { text: 'E (318) ledc: Fade service not installed, call ledc_fade_func_install' },
          { text: 'E (318) ledc: ledc_set_fade_with_time(1491): LEDC fade channel init error, not enough memory or service not installed' },
        ]}
      />
      <div style={{ ...mono(32, RED, { fontWeight: 700 }), opacity: after(t, G.fail) }}>the fade call → ESP_FAIL</div>
    </div>
  );
};

// ── from: where to end, how long, and where it starts ─────────────────────

const FromView: React.FC<{ t: number }> = ({ t }) => {
  const P = F.from;
  const none = after(t, P.none);
  const now = after(t, P.v230);
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center', padding: '0 30px' }}>
      <div style={{ display: 'grid', gap: 22 }}>
        <div style={{ ...mono(30, C.ink), opacity: after(t, P.end) }}>
          target = <b style={{ color: DUTY }}>0</b> · where to end
        </div>
        <div style={{ ...mono(30, C.ink), opacity: after(t, P.long) }}>
          time = <b style={{ color: DUTY }}>2800</b> ms · how long
        </div>
        <div style={{ fontSize: 30, fontWeight: 700, color: C.pink, opacity: none }}>✗ no starting value</div>
        <div style={{ fontSize: 26, color: C.ink, opacity: after(t, P.now) }}>it fades from wherever the duty is now</div>
      </div>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 18, opacity: now }}>
        <div style={mono(24, C.muted)}>the duty right now</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={mono(80, DUTY, { fontWeight: 800 })}>230</div>
          <div style={{ fontSize: 60, color: C.muted }}>→</div>
          <div style={mono(80, DUTY, { fontWeight: 800 })}>0</div>
        </div>
        <div style={mono(24, C.muted)}>over 2800 ms</div>
      </div>
    </div>
  );
};

// ── ramp: the duty over 2.8 s, and the pin along the way ──────────────────

/** real seconds into the fade being shown: plays once on "slides", then loops */
function rampTime(t: number) {
  const R = F.ramp;
  if (t < R.sweep) return 0;
  // 2.8 s of fade, then hold at the end until the loop restarts
  return Math.min((t - R.sweep) % R.loopEvery, FADE_MS / 1000);
}

const RampView: React.FC<{ t: number }> = ({ t }) => {
  const R = F.ramp;
  const GX0 = 90;
  const GW = 900;
  const GY0 = 40;
  const GY1 = 240;
  const span = FADE_MS / 1000; // x axis: 0 … 2.8 s
  const gx = (s: number) => GX0 + (s / span) * GW;
  const gy = (d: number) => GY1 - (d / (STEPS - 1)) * (GY1 - GY0);

  const s = rampTime(t);
  const playing = t >= R.sweep;
  const d = playing ? fadeDutyAt(s) : FADE_FROM;

  // the drawn fade: a staircase so fine it reads as a line
  let path = `M ${gx(0)} ${gy(FADE_FROM)}`;
  for (let k = 1; k <= FADE_STEPS; k++) {
    const x = gx((k * FADE_CYCLE) / PWM_HZ);
    path += ` H ${x} V ${gy(FADE_FROM - k)}`;
  }
  path += ` H ${gx(span)}`;

  const onOff = ease((t - R.onOff) / 0.5);
  const hi = [R.start, (R.start + R.end) / 2, R.end];

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg width={W} height={H} style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <clipPath id="rampclip">
            <rect x={0} y={0} width={playing ? gx(s) : gx(0)} height={H} />
          </clipPath>
        </defs>
        {/* axes */}
        <line x1={GX0} y1={GY1} x2={GX0 + GW} y2={GY1} stroke={hexA(C.muted, 0.5)} strokeWidth={2} />
        <line x1={GX0} y1={GY0 - 10} x2={GX0} y2={GY1} stroke={hexA(C.muted, 0.5)} strokeWidth={2} />
        {[0, 1, 2, span].map((x) => (
          <text key={x} x={gx(x)} y={GY1 + 28} textAnchor="middle" style={mono(18, C.muted)}>
            {x} s
          </text>
        ))}
        <text x={GX0 - 12} y={gy(FADE_FROM) + 6} textAnchor="end" style={mono(18, DUTY)}>
          {FADE_FROM}
        </text>
        <text x={GX0 - 12} y={GY1 + 6} textAnchor="end" style={mono(18, DUTY)}>
          0
        </text>
        <text x={GX0 + 12} y={GY0 - 14} style={mono(18, DUTY)}>
          duty
        </text>
        <path d={path} fill="none" stroke={hexA(DUTY, 0.25)} strokeWidth={2} />
        <path d={path} fill="none" stroke={DUTY} strokeWidth={4} clipPath="url(#rampclip)" style={{ filter: `drop-shadow(0 0 8px ${DUTY})` }} />
        {playing && <circle cx={gx(s)} cy={gy(d)} r={8} fill="#fff" style={{ filter: `drop-shadow(0 0 8px ${DUTY})` }} />}

        {/* snapshots of the pin */}
        {R.snaps.map((ss, i) => {
          const sd = fadeDutyAt(ss);
          const f = sd / STEPS;
          const bx = 40 + i * 340;
          const by = 320;
          const bw = 300;
          const lit = i === 0 ? ease((t - hi[0]) / 0.4) : i === 2 ? ease((t - hi[2]) / 0.4) : ease((t - hi[1]) / 0.4);
          const per = bw / 3;
          let w = '';
          for (let k = 0; k < 3; k++) {
            const x0 = bx + k * per;
            w += `${w ? ' L' : 'M'} ${x0} ${by + 110} L ${x0} ${by + 50} L ${x0 + f * per} ${by + 50} L ${x0 + f * per} ${by + 110} L ${x0 + per} ${by + 110}`;
          }
          return (
            <g key={i} opacity={onOff}>
              <line x1={gx(ss)} y1={gy(sd)} x2={bx + bw / 2} y2={by} stroke={hexA(C.magenta, 0.5)} strokeWidth={1.5} strokeDasharray="5 5" />
              <circle cx={gx(ss)} cy={gy(sd)} r={6} fill={C.magenta} />
              <rect x={bx - 12} y={by} width={bw + 24} height={170} rx={12} fill="rgba(10,4,32,.7)" stroke={hexA(C.magenta, 0.3 + 0.6 * lit)} strokeWidth={1.5 + lit} />
              <text x={bx} y={by + 30} style={mono(18, C.muted)}>
                at {ss} s · duty {sd}
              </text>
              <path d={w} fill="none" stroke={C.magenta} strokeWidth={3} style={{ filter: `drop-shadow(0 0 6px ${C.magenta})` }} />
              <text x={bx} y={by + 150} style={mono(20, lit > 0 ? DUTY : C.ink, { fontWeight: lit > 0 ? 700 : 400 })}>
                on {Math.round(f * 100)}% of each period
              </text>
            </g>
          );
        })}
      </svg>

      {/* the LED, fading */}
      <div style={{ position: 'absolute', left: 1080, top: 10, width: W - 1080, display: 'grid', justifyItems: 'center', gap: 12 }}>
        <Led brightness={d / STEPS} size={160} />
        <div style={mono(34, DUTY, { fontWeight: 700 })}>duty = {String(d).padStart(3, '\u2007')}</div>
        <div style={{ fontSize: 22, color: C.muted }}>
          on <span style={{ color: C.ink }}>{Math.round((d / STEPS) * 100)}%</span> of every period
        </div>
        <div style={mono(18, C.muted)}>t = {s.toFixed(2)} s</div>
      </div>
    </div>
  );
};

// ── stairs: the duty is a whole number ────────────────────────────────────

const StairsView: React.FC<{ t: number }> = ({ t }) => {
  const S = F.stairs;
  const N = 6; // steps shown
  const P = N * FADE_CYCLE; // periods shown
  const X0 = 110;
  const XW = 780;
  const Y0 = 50;
  const Y1 = 330;
  const px = (p: number) => X0 + (p / P) * XW;
  const dy = (d: number) => Y0 + ((FADE_FROM - d) / N) * (Y1 - Y0 - 30);

  const smoothOut = 1 - ease((t - S.stairs) / 0.6);
  const stairs = ease((t - S.stairs) / 0.6);
  const every = ease((t - S.every) / 0.4);
  const eq = [S.time, S.periods, S.steps, S.drop, S.every].map((a) => ease((t - a) / 0.4));
  const note = ease((t - S.rounds) / 0.4);

  let st = `M ${px(0)} ${dy(FADE_FROM)}`;
  for (let k = 0; k < N; k++) st += ` H ${px((k + 1) * FADE_CYCLE)}${k + 1 < N ? ` V ${dy(FADE_FROM - k - 1)}` : ''}`;

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg width={W} height={H} style={{ display: 'block', overflow: 'visible' }}>
        {/* duty labels */}
        {Array.from({ length: N }, (_, k) => (
          <text key={k} x={X0 - 14} y={dy(FADE_FROM - k) + 7} textAnchor="end" style={mono(20, DUTY)} opacity={0.4 + 0.6 * stairs}>
            {FADE_FROM - k}
          </text>
        ))}
        {/* what you might imagine */}
        <line x1={px(0)} y1={dy(FADE_FROM)} x2={px(P)} y2={dy(FADE_FROM - N)} stroke={DUTY} strokeWidth={3} strokeDasharray="10 8" opacity={0.8 * smoothOut} />
        {/* what it is */}
        <path d={st} fill="none" stroke={DUTY} strokeWidth={4} opacity={stairs} style={{ filter: `drop-shadow(0 0 8px ${DUTY})` }} />

        {/* every period, ticked */}
        {Array.from({ length: P + 1 }, (_, p) => (
          <line key={p} x1={px(p)} y1={Y1 + 6} x2={px(p)} y2={Y1 + (p % FADE_CYCLE === 0 ? 30 : 18)} stroke={C.cyan} strokeWidth={p % FADE_CYCLE === 0 ? 2 : 1} opacity={0.7} />
        ))}
        <text x={X0} y={Y1 + 56} style={mono(18, C.cyan)}>
          periods (1 ms each)
        </text>
        {every > 0 && (
          <g opacity={every}>
            <path
              d={`M ${px(FADE_CYCLE)} ${dy(FADE_FROM - 1) - 18} L ${px(FADE_CYCLE)} ${dy(FADE_FROM - 1) - 28} L ${px(2 * FADE_CYCLE)} ${dy(FADE_FROM - 1) - 28} L ${px(2 * FADE_CYCLE)} ${dy(FADE_FROM - 1) - 18}`}
              fill="none"
              stroke={C.ink}
              strokeWidth={2.5}
            />
            <text x={px(1.5 * FADE_CYCLE)} y={dy(FADE_FROM - 1) - 38} textAnchor="middle" style={mono(20, C.ink, { fontWeight: 700 })}>
              {FADE_CYCLE} periods
            </text>
            <rect x={px(FADE_CYCLE)} y={Y1 + 6} width={px(2 * FADE_CYCLE) - px(FADE_CYCLE)} height={24} fill={hexA(C.cyan, 0.25)} />
          </g>
        )}
        {eq[3] > 0 && (
          <text x={px(2 * FADE_CYCLE) + 12} y={(dy(FADE_FROM - 1) + dy(FADE_FROM - 2)) / 2 + 7} opacity={eq[3]} style={mono(20, DUTY, { fontWeight: 700 })}>
            −1
          </text>
        )}
      </svg>

      {/* the arithmetic */}
      <div style={{ position: 'absolute', left: 960, top: 30, width: W - 960, display: 'grid', gap: 16, fontFamily: FONT.mono, fontSize: 28 }}>
        <div style={{ opacity: eq[0], color: C.magenta }}>{FADE_MS / 1000} s × {PWM_HZ} Hz</div>
        <div style={{ opacity: eq[1], color: C.ink }}>= {FADE_TOTAL} periods</div>
        <div style={{ opacity: eq[2], color: DUTY }}>
          {FADE_FROM} → 0 = {FADE_STEPS} steps
        </div>
        <div style={{ opacity: eq[3], color: C.ink }}>
          {FADE_TOTAL} ÷ {FADE_STEPS} = {(FADE_TOTAL / FADE_STEPS).toFixed(2)}
        </div>
        <div style={{ opacity: eq[4], color: C.cyan, fontWeight: 700 }}>→ −1 every {FADE_CYCLE} periods</div>
        <div style={{ opacity: note, fontFamily: FONT.sans, fontSize: 20, color: C.muted, marginTop: 10, lineHeight: 1.4 }}>
          rounded down, so it really takes
          <br />
          <span style={{ color: C.ink }}>
            {FADE_STEPS} × {FADE_CYCLE} = {FADE_STEPS * FADE_CYCLE} periods = {FADE_REAL_S} s
          </span>
        </div>
      </div>
    </div>
  );
};

// ── engine: the hardware does the stepping ────────────────────────────────

const EngineView: React.FC<{ t: number }> = ({ t }) => {
  const E = F.engine;
  const rows = ['count down', `${FADE_STEPS} steps`, `one every ${FADE_CYCLE} periods`, 'by 1 each time'];
  const hw = after(t, E.hardware);
  const s = Math.max(0, t - E.rows[0]) % 3.6;
  const d = fadeDutyAt(Math.min(s, FADE_REAL_S));
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr 360px', alignItems: 'center', gap: 40, padding: '0 30px' }}>
      <div style={{ display: 'grid', gap: 18 }}>
        <div style={{ ...mono(22, C.muted), opacity: after(t, E.hands) }}>ledc_set_fade_with_time hands the LEDC hardware:</div>
        {rows.map((r, i) => {
          const p = after(t, E.rows[i], 0.35);
          return (
            <div key={r} style={{ ...mono(32, DUTY, { fontWeight: 700 }), opacity: 0.2 + 0.8 * p, transform: `translateX(${(1 - p) * -16}px)` }}>
              {r}
            </div>
          );
        })}
        <div style={{ fontSize: 30, fontWeight: 700, color: C.magenta, opacity: hw, marginTop: 8 }}>the hardware does the stepping — not your code</div>
      </div>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 12, opacity: after(t, E.rows[0]) }}>
        <Led brightness={d / STEPS} size={170} />
        <div style={mono(32, DUTY, { fontWeight: 700 })}>duty = {String(d).padStart(3, '\u2007')}</div>
      </div>
    </div>
  );
};

// ── start: your task waits ────────────────────────────────────────────────

const Lane: React.FC<{ x0: number; x1: number; y: number; spans: { a: number; b: number; label: string; color: string; dashed?: boolean }[]; label: string }> = ({
  x0,
  x1,
  y,
  spans,
  label,
}) => (
  <g>
    <text x={0} y={y + 7} style={mono(20, C.ink)}>
      {label}
    </text>
    <line x1={x0} y1={y + 26} x2={x1} y2={y + 26} stroke={hexA(C.muted, 0.35)} strokeWidth={1.5} />
    {spans.map((s, i) =>
      s.b > s.a ? (
        <g key={i}>
          <rect x={s.a} y={y - 20} width={s.b - s.a} height={40} rx={6} fill={hexA(s.color, s.dashed ? 0.08 : 0.25)} stroke={s.color} strokeDasharray={s.dashed ? '6 5' : undefined} />
          {s.b - s.a > 90 && (
            <text x={s.a + 10} y={y + 7} style={mono(18, s.color)}>
              {s.label}
            </text>
          )}
        </g>
      ) : null,
    )}
  </g>
);

const StartView: React.FC<{ t: number }> = ({ t }) => {
  const S = F.start;
  const [r0, r1] = S.run;
  const u = clamp01((t - r0) / (r1 - r0));
  const X0 = 210;
  const X1 = W - 20;
  const span = X1 - X0;
  const x = (uu: number) => X0 + uu * span * 0.7;
  const started = t >= r0;
  const done = t >= r1;
  const d = started ? fadeDutyAt(u * FADE_REAL_S) : FADE_FROM;
  const task = [
    { a: X0 - 60, b: X0, label: '', color: C.cyan },
    { a: X0, b: started ? x(u) : X0, label: 'waiting…', color: C.muted, dashed: true },
    { a: x(1), b: done ? x(1) + Math.min(1, (t - r1) / 1.2) * (X1 - x(1)) : x(1), label: 'carries on', color: C.cyan },
  ];
  const hw = [{ a: X0, b: started ? x(u) : X0, label: `fading ${FADE_FROM} → 0`, color: C.magenta }];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg width={W} height={H} style={{ overflow: 'visible' }}>
        <g opacity={after(t, S.go)}>
          <Lane x0={X0 - 60} x1={X1} y={90} spans={task} label="your task" />
          <Lane x0={X0 - 60} x1={X1} y={200} spans={hw} label="LEDC hardware" />
          {started && !done && <line x1={x(u)} y1={50} x2={x(u)} y2={240} stroke="#fff" strokeWidth={2} opacity={0.6} />}
        </g>
        <text x={0} y={320} style={mono(24, GREEN)} opacity={after(t, S.waits)}>
          LEDC_FADE_WAIT_DONE → your task waits until the fade ends
        </text>
        <text x={0} y={364} style={mono(24, C.ink)} opacity={after(t, S.free)}>
          while it waits, the CPU is free for other tasks
        </text>
      </svg>
      <div style={{ position: 'absolute', right: 20, top: 300, display: 'grid', justifyItems: 'center', gap: 8, opacity: after(t, S.go) }}>
        <Led brightness={d / STEPS} size={120} />
        <div style={mono(24, DUTY, { fontWeight: 700 })}>duty {String(d).padStart(3, '\u2007')}</div>
      </div>
    </div>
  );
};

const NoWaitView: React.FC<{ t: number }> = ({ t }) => {
  const N = F.nowait;
  const ret = after(t, N.returns);
  const next = after(t, N.next);
  const X0 = 210;
  const X1 = W - 20;
  const fadeEnd = X0 + 0.62 * (X1 - X0);
  const xNext = X0 + 0.25 * (X1 - X0);
  const task = [
    { a: X0 - 60, b: X0, label: '', color: C.cyan },
    { a: X0, b: X0 + ret * (xNext - X0), label: 'keeps running', color: C.cyan },
    { a: xNext, b: xNext + next * (fadeEnd - xNext), label: 'ledc_set_duty(…) waits…', color: C.amber, dashed: true },
    { a: fadeEnd, b: fadeEnd + after(t, N.waits) * (X1 - fadeEnd), label: 'then runs', color: C.cyan },
  ];
  const hw = [{ a: X0, b: fadeEnd, label: `fading ${FADE_FROM} → 0`, color: C.magenta }];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg width={W} height={H} style={{ overflow: 'visible' }}>
        <Lane x0={X0 - 60} x1={X1} y={90} spans={task} label="your task" />
        <Lane x0={X0 - 60} x1={X1} y={200} spans={hw} label="LEDC hardware" />
        <text x={0} y={320} style={mono(24, C.amber)} opacity={ret}>
          LEDC_FADE_NO_WAIT → ledc_fade_start returns at once
        </text>
        <text x={0} y={364} style={mono(24, C.ink)} opacity={next}>
          on the ESP32, your next duty change waits until the fade is done
        </text>
      </svg>
    </div>
  );
};
