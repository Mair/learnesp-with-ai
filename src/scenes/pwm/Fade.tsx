/**
 * 6 · FADE — what `ledcFade(LED, 230, 0, 2800)` actually does.
 *
 *   intro    the call; four cards: pin · from · to · time
 *   ramp     the duty over 2.8 s (played in real time), and three snapshots of
 *            the pin along the way: still only ever on or off
 *   stairs   the duty is a whole number, so the fade is a staircase:
 *            2800 periods ÷ 230 steps → −1 every 12 periods (really 2.76 s)
 *   engine   ledcFade loads the LEDC fade engine (conf1.duty_inc / duty_num /
 *            duty_cycle / duty_scale), sets duty_start and returns; loop() keeps
 *            running; ledcFadeWithInterrupt's callback fires at the end
 *
 * The step maths is ESP-IDF's _ledc_set_fade_with_time() — see FADE_* in
 * timeline.ts. Register fields from components/hal/esp32/include/hal/ledc_ll.h.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { ease, Explainer, GREEN, mono, VIEW_H as H, VIEW_W as W } from '../../components/Explainer';
import { Led } from '../../components/Gadgets';
import { C, FONT, hexA } from '../../theme/palette';
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
const COLORS = [C.pink, C.amber, C.amber, C.magenta];
const DUTY = C.amber;

export const Fade: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const engineRight = (t: number) => (t >= F.engine.run[0] ? 'slowed ~3× so you can watch it' : undefined);
  return (
    <Explainer
      t={t}
      frames={Math.round(sceneDur('fade') * FPS)}
      kicker="Fading · ledcFade()"
      code={F.code}
      run={F.run}
      args={F.args.map((a, i) => ({ ...a, color: COLORS[i] }))}
      captions={F.captions}
      views={[
        { at: F.views.ramp, component: RampView, active: [1, 2, 3], label: 'the duty over time', accent: DUTY, right: () => 'real time' },
        {
          at: F.views.stairs,
          component: StairsView,
          active: [1, 2, 3],
          label: 'zoomed in · the first 6 steps',
          accent: C.cyan,
          right: () => `${FADE_STEPS} steps · ${FADE_CYCLE} periods each`,
        },
        { at: F.views.engine, component: EngineView, active: [1, 2, 3], label: 'who does the stepping', accent: C.magenta, right: engineRight },
      ]}
    />
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
  const note = ease((t - (S.every + 0.6)) / 0.4);

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
  const [r0, r1] = E.run;
  const u = clamp01((t - r0) / (r1 - r0));
  const running = t >= r0;
  const periods = u * FADE_STEPS * FADE_CYCLE;
  const stepsDone = Math.min(FADE_STEPS, Math.floor(periods / FADE_CYCLE));
  const duty = FADE_FROM - stepsDone;
  const done = t >= r1;

  const card = ease((t - E.card) / 0.5);
  const rows = [
    { f: 'duty_inc', v: '0', m: 'count down' },
    { f: 'duty_num', v: String(FADE_STEPS), m: 'steps' },
    { f: 'duty_cycle', v: String(FADE_CYCLE), m: 'periods per step' },
    { f: 'duty_scale', v: '1', m: 'change per step' },
  ];
  const go = ease((t - E.returns) / 0.4);
  const hands = ease((t - E.hands) / 0.4);

  // the CPU lane
  const LX0 = 150;
  const LX1 = W - 30;
  const LY = 400;
  const laneX = (uu: number) => LX0 + 150 + uu * (LX1 - LX0 - 150);
  const loopIn = ease((t - E.loop) / 0.4);
  const cb = ease((t - E.callback) / 0.4);
  const loops: React.ReactNode[] = [];
  if (loopIn > 0) {
    const n = 9;
    for (let i = 0; i < n; i++) {
      const a = i / n;
      const b = (i + 0.8) / n;
      if (a > u) break;
      loops.push(
        <g key={i}>
          <rect x={laneX(a)} y={LY - 20} width={laneX(Math.min(b, u)) - laneX(a)} height={40} rx={6} fill={hexA(C.cyan, 0.25)} stroke={hexA(C.cyan, 0.6)} />
          {laneX(Math.min(b, u)) - laneX(a) > 70 && (
            <text x={laneX(a) + 10} y={LY + 7} style={mono(18, C.cyan)}>
              loop()
            </text>
          )}
        </g>,
      );
    }
  }

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* the fade engine's registers */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 760,
          opacity: card,
          transform: `translateY(${(1 - card) * 20}px)`,
          borderRadius: 16,
          border: `1px solid ${hexA(C.magenta, 0.5)}`,
          background: 'rgba(10,4,32,.6)',
          padding: '16px 24px',
        }}
      >
        <div style={mono(16, C.magenta, { letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 10 })}>
          LEDC fade engine · channel conf1 register
        </div>
        {rows.map((r, i) => {
          const p = ease((t - E.rows[i]) / 0.35);
          return (
            <div key={r.f} style={{ display: 'grid', gridTemplateColumns: '200px 90px 1fr', alignItems: 'baseline', opacity: 0.25 + 0.75 * p, fontFamily: FONT.mono, fontSize: 26, lineHeight: 1.7 }}>
              <span style={{ color: C.muted }}>{r.f}</span>
              <span style={{ color: p > 0 ? DUTY : C.muted, fontWeight: 700 }}>= {p > 0 ? r.v : '·'}</span>
              <span style={{ fontFamily: FONT.sans, fontSize: 22, color: C.ink, opacity: p }}>{r.m}</span>
            </div>
          );
        })}
        <div style={{ display: 'grid', gridTemplateColumns: '200px 90px 1fr', alignItems: 'baseline', opacity: 0.25 + 0.75 * go, fontFamily: FONT.mono, fontSize: 26, lineHeight: 1.7 }}>
          <span style={{ color: C.muted }}>duty_start</span>
          <span style={{ color: go > 0 ? DUTY : C.muted, fontWeight: 700 }}>= {go > 0 ? '1' : '·'}</span>
          <span style={{ fontFamily: FONT.sans, fontSize: 22, color: DUTY, fontWeight: 700, opacity: go }}>go — the same bit ledcWrite sets</span>
        </div>
      </div>

      {/* from your code → to the engine */}
      <div style={{ position: 'absolute', left: 800, top: 6, width: W - 800, opacity: hands, display: 'grid', gap: 8 }}>
        <div style={mono(18, C.muted)}>your sketch</div>
        <div style={mono(22, '#cfd6ff', { padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,.05)', whiteSpace: 'nowrap' })}>
          {cb > 0 ? (
            <>
              ledcFadeWithInterrupt(LED, 230, 0, 2800, <span style={{ color: GREEN }}>done</span>);
            </>
          ) : (
            F.code
          )}
        </div>
        <div style={{ fontSize: 20, color: C.muted }}>↳ hands over 4 numbers, sets duty_start, returns</div>
      </div>

      {/* the engine running */}
      <div style={{ position: 'absolute', left: 800, top: 150, width: W - 800, display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center', gap: 20, opacity: running ? 1 : 0.25 }}>
        <Led brightness={duty / STEPS} size={140} />
        <div style={{ display: 'grid', gap: 6 }}>
          <div style={mono(34, DUTY, { fontWeight: 700 })}>duty = {String(running ? duty : FADE_FROM).padStart(3, '\u2007')}</div>
          <div style={mono(20, C.muted)}>
            steps left: {FADE_STEPS - (running ? stepsDone : 0)} · period {Math.floor(running ? periods : 0)}
          </div>
          <div style={{ width: 380, height: 14, borderRadius: 7, background: 'rgba(255,255,255,.08)', overflow: 'hidden' }}>
            <div style={{ width: `${(running ? u : 0) * 100}%`, height: '100%', background: C.magenta, boxShadow: `0 0 12px ${C.magenta}` }} />
          </div>
        </div>
      </div>

      {/* what the CPU is doing meanwhile */}
      <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none' }}>
        <g opacity={go}>
          <text x={0} y={LY + 7} style={mono(20, C.ink)}>
            CPU
          </text>
          <line x1={LX0} y1={LY + 30} x2={LX1} y2={LY + 30} stroke={hexA(C.muted, 0.4)} strokeWidth={1.5} />
          <rect x={LX0} y={LY - 20} width={140} height={40} rx={6} fill={hexA(DUTY, 0.3)} stroke={DUTY} />
          <text x={LX0 + 10} y={LY + 7} style={mono(18, DUTY)}>
            ledcFade()
          </text>
          {loops}
          {running && !done && <line x1={laneX(u)} y1={LY - 34} x2={laneX(u)} y2={LY + 34} stroke="#fff" strokeWidth={2} opacity={0.6} />}
          {running && (
            <text x={LX0 + 150} y={LY + 56} style={mono(16, C.muted)}>
              meanwhile, the LEDC hardware steps the duty {FADE_STEPS} times — no CPU involved
            </text>
          )}
        </g>
        {done && cb > 0 && (
          <g opacity={ease((t - r1) / 0.3)}>
            <rect x={LX1 - 150} y={LY - 74} width={150} height={40} rx={6} fill={hexA(GREEN, 0.25)} stroke={GREEN} />
            <text x={LX1 - 140} y={LY - 47} style={mono(20, GREEN, { fontWeight: 700 })}>
              done()
            </text>
            <text x={LX1 - 160} y={LY - 47} textAnchor="end" style={mono(18, GREEN)}>
              fade-end interrupt →
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
