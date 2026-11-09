/**
 * 8 · vTaskDelay(pdMS_TO_TICKS(500)) — waiting, the FreeRTOS way.
 *
 *   ticks    CONFIG_FREERTOS_HZ = 100 → 1 tick = 10 ms → 500 × 100 ÷ 1000 = 50 ticks
 *   round    integer division rounds down: pdMS_TO_TICKS(5) = 0 → vTaskDelay(0) doesn't wait
 *   sleep    your task is blocked; the CPU is free; the pin holds its level (a register bit)
 *   wdt      no delay → IDLE0 never runs → "Task watchdog got triggered" after 5 s
 *   dimmer   …and the pin flips too fast to see → the LED just looks dimmer
 *
 * FACTS: projdefs.h pdMS_TO_TICKS; freertos/Kconfig FREERTOS_HZ; tasks.c vTaskDelay;
 * esp_system/Kconfig task WDT defaults; task_wdt.c; esp_task.h (main task prio 1, CPU 0).
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { Scope } from '../../components/CodeToHardware';
import { Explainer, GREEN, mono, RED, VIEW_H as H, VIEW_W as W } from '../../components/Explainer';
import { Led } from '../../components/Gadgets';
import { fusion, integrate, pinHigh } from '../../components/pwm';
import { C, FONT, hexA } from '../../theme/palette';
import { after, clamp01, inOutLocal, Pill } from './parts';
import { DELAY as S, DELAY_MS, FPS, LOG_WDT, msToTicks, sceneDur, TICK_HZ } from './timeline';

const ARG_COLOR = [C.cyan, C.amber];
const TICKS = msToTicks(DELAY_MS);

export const Delay: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const V = S.views;
  const subs = [S.args[0].sub, t < S.ticks.fifty ? S.args[1].sub : `= ${TICKS} ticks of 10 ms`];
  return (
    <Explainer
      t={t}
      frames={Math.round(sceneDur('delay') * FPS)}
      kicker="Waiting · vTaskDelay()"
      code={S.code}
      run={S.run}
      args={S.args.map((a, i) => ({ ...a, sub: subs[i], color: ARG_COLOR[i] }))}
      captions={S.captions}
      views={[
        { at: V.ticks, component: TicksView, active: [1], label: 'milliseconds → FreeRTOS ticks', accent: C.cyan, right: (t) => (t >= S.ticks.fifty && t < S.ticks.fifty + 0.7 ? 'real time' : `CONFIG_FREERTOS_HZ = ${TICK_HZ}`) },
        { at: V.round, component: RoundView, active: [1], label: 'pdMS_TO_TICKS rounds down · projdefs.h', accent: C.amber },
        { at: V.sleep, component: SleepView, active: [0], label: 'while your task is blocked', accent: GREEN, right: () => 'not to scale' },
        { at: V.wdt, component: WdtView, active: [0], label: 'take the delays out · the task watchdog', accent: RED, right: () => 'recorded in QEMU' },
        { at: V.dimmer, component: DimmerView, active: [0], label: 'take the delays out · the LED', accent: RED },
      ]}
    />
  );
};

// ── views ─────────────────────────────────────────────────────────────────

const TicksView: React.FC<{ t: number }> = ({ t }) => {
  const k = S.ticks;
  const hz = after(t, k.hz);
  const ten = after(t, k.tick10);
  const sweep = clamp01((t - k.fifty) / (DELAY_MS / 1000)); // 50 ticks in a real half second
  const x0 = 60;
  const x1 = W - 60;
  const yR = 330;
  const n = Math.round(TICKS * sweep);
  const marks: React.ReactNode[] = [];
  for (let i = 0; i <= TICKS; i++) {
    const x = x0 + ((x1 - x0) * i) / TICKS;
    const major = i % 10 === 0;
    marks.push(<line key={i} x1={x} y1={yR - (major ? 24 : 12)} x2={x} y2={yR + (major ? 24 : 12)} stroke={i <= n && sweep > 0 ? C.cyan : hexA(C.muted, 0.5)} strokeWidth={major ? 3 : 1.5} />);
    if (major)
      marks.push(
        <text key={`l${i}`} x={x} y={yR + 56} textAnchor="middle" style={mono(20, C.muted)}>
          {i * 10} ms
        </text>,
      );
  }
  const xn = x0 + ((x1 - x0) * n) / TICKS;
  return (
    <svg width={W} height={H} style={{ display: 'block' }}>
      <g opacity={hz}>
        <text x={x0} y={60} style={mono(34, C.ink, { fontWeight: 700 })}>
          {TICK_HZ} ticks every second <tspan fill={C.muted}>· CONFIG_FREERTOS_HZ default</tspan>
        </text>
      </g>
      <g opacity={ten}>
        <text x={x0} y={124} style={mono(34, C.ink, { fontWeight: 700 })}>
          1 tick = 1000 ÷ {TICK_HZ} = <tspan fill={C.cyan}>10 ms</tspan>
        </text>
      </g>
      <g opacity={after(t, k.fifty - 0.3)}>
        <text x={x0} y={188} style={mono(30, '#cfd6ff')}>
          pdMS_TO_TICKS(500) = 500 × {TICK_HZ} ÷ 1000 = <tspan fill={C.amber} fontWeight={700}>{TICKS} ticks</tspan>
        </text>
        <line x1={x0} y1={yR} x2={x1} y2={yR} stroke={hexA(C.muted, 0.5)} strokeWidth={2} />
        {marks}
        {sweep > 0 && <line x1={xn} y1={yR - 44} x2={xn} y2={yR + 34} stroke={C.amber} strokeWidth={3} style={{ filter: `drop-shadow(0 0 6px ${C.amber})` }} />}
        <text x={x1} y={yR - 54} textAnchor="end" style={mono(28, C.cyan, { fontWeight: 700, fontVariantNumeric: 'tabular-nums' })}>
          tick {String(n).padStart(2, '\u2007')} / {TICKS}
        </text>
      </g>
    </svg>
  );
};

const RoundView: React.FC<{ t: number }> = ({ t }) => {
  const r = S.round;
  const down = after(t, r.down);
  const five = after(t, r.five);
  const zero = after(t, r.zero);
  const nw = after(t, r.noWait);
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 50, alignItems: 'center', padding: '0 40px' }}>
      <div style={{ display: 'grid', gap: 22 }}>
        <div style={{ opacity: down, ...mono(22, '#cfd6ff'), lineHeight: 1.6, borderRadius: 14, border: '1px solid rgba(255,255,255,.14)', padding: '14px 18px', background: 'rgba(10,4,32,.6)' }}>
          #define pdMS_TO_TICKS( xTimeInMs ) {'\\'}
          <br />
          &nbsp;&nbsp;( ( xTimeInMs ) * configTICK_RATE_HZ <b style={{ color: C.amber }}>/ 1000U</b> )
          <div style={mono(15, C.muted)}>FreeRTOS projdefs.h (casts trimmed) · integer division</div>
        </div>
        <div style={{ opacity: five, ...mono(30, C.ink), lineHeight: 1.5 }}>
          pdMS_TO_TICKS(5) = 5 × 100 ÷ 1000
          <br />
          <span style={{ paddingLeft: 285 }}>= 0.5</span> <span style={{ color: RED, opacity: zero }}>→ 0</span>
        </div>
      </div>
      <div style={{ display: 'grid', gap: 18, opacity: nw, transform: `translateY(${(1 - nw) * 16}px)` }}>
        <div style={mono(34, '#fff')}>
          vTaskDelay(<b style={{ color: RED }}>0</b>);
        </div>
        <div style={{ fontSize: 24, color: C.muted, fontStyle: 'italic' }}>"A delay time of zero just forces a reschedule." — FreeRTOS tasks.c</div>
        <div>
          <Pill color={RED} size={24}>
            no wait at all
          </Pill>
        </div>
      </div>
    </div>
  );
};

const SleepView: React.FC<{ t: number }> = ({ t }) => {
  const s = S.sleep;
  const blocked = after(t, s.blocked);
  const free = after(t, s.free);
  const keeps = after(t, s.keeps);
  const bit = after(t, s.bit);
  const x0 = 270;
  const x1 = W - 40;
  const span = x1 - x0;
  const yL = 70;
  const yC = 170;
  const yP = 300;
  const seg = [
    { a: 0, b: 0.04, label: '', c: C.amber },
    { a: 0.04, b: 0.5, label: 'blocked · 50 ticks', c: C.muted },
    { a: 0.5, b: 0.54, label: '', c: C.amber },
    { a: 0.54, b: 1, label: 'blocked · 50 ticks', c: C.muted },
  ];
  return (
    <svg width={W} height={H} style={{ display: 'block' }}>
      <text x={20} y={yL + 8} style={mono(22, C.cyan)}>
        your task
      </text>
      <text x={20} y={yC + 8} style={mono(22, GREEN)}>
        CPU 0
      </text>
      <text x={20} y={yP + 8} style={mono(22, C.pink)}>
        GPIO 2
      </text>
      <g opacity={blocked}>
        {seg.map((g, i) => (
          <g key={i}>
            <rect x={x0 + span * g.a} y={yL - 28} width={span * (g.b - g.a)} height={56} rx={8} fill={hexA(g.c, g.c === C.amber ? 0.5 : 0.1)} stroke={g.c} strokeWidth={g.c === C.amber ? 2 : 1.5} strokeDasharray={g.c === C.amber ? undefined : '6 6'} />
            {g.label && (
              <text x={x0 + (span * (g.a + g.b)) / 2} y={yL + 8} textAnchor="middle" style={mono(22, C.muted)}>
                {g.label}
              </text>
            )}
          </g>
        ))}
      </g>
      <g opacity={free}>
        {[seg[1], seg[3]].map((g, i) => (
          <g key={i}>
            <rect x={x0 + span * g.a} y={yC - 28} width={span * (g.b - g.a)} height={56} rx={8} fill={hexA(GREEN, 0.14)} stroke={GREEN} strokeWidth={1.5} />
            <text x={x0 + (span * (g.a + g.b)) / 2} y={yC + 8} textAnchor="middle" style={mono(22, GREEN, { fontWeight: 700 })}>
              free: other tasks, or idle ✓
            </text>
          </g>
        ))}
      </g>
      <g opacity={keeps}>
        <path
          d={`M ${x0} ${yP + 30} L ${x0 + span * 0.02} ${yP + 30} L ${x0 + span * 0.02} ${yP - 30} L ${x0 + span * 0.52} ${yP - 30} L ${x0 + span * 0.52} ${yP + 30} L ${x1} ${yP + 30}`}
          fill="none"
          stroke={C.magenta}
          strokeWidth={4}
          style={{ filter: `drop-shadow(0 0 8px ${C.magenta})` }}
        />
        <text x={x0 + span * 0.27} y={yP - 46} textAnchor="middle" style={mono(22, C.ink)}>
          stays HIGH the whole time
        </text>
      </g>
      <g opacity={bit} transform={`translate(${x0 + span * 0.12} ${H - 110})`}>
        <rect x={0} y={0} width={620} height={72} rx={14} fill="rgba(10,4,32,.9)" stroke={C.cyan} strokeWidth={2} />
        <text x={24} y={46} style={mono(28, C.ink)}>
          GPIO_OUT_REG · bit 2 = <tspan fill={C.amber} fontWeight={700}>1</tspan>
        </text>
        <text x={640} y={46} style={mono(24, C.muted)}>
          ← that's what holds it
        </text>
      </g>
    </svg>
  );
};

const LOOP = ['while (1) {', '    gpio_set_level(LED, 1);', '    vTaskDelay(pdMS_TO_TICKS(500));', '    gpio_set_level(LED, 0);', '    vTaskDelay(pdMS_TO_TICKS(500));', '}'];

const StruckLoop: React.FC<{ out: number; size?: number }> = ({ out, size = 26 }) => (
  <pre style={{ margin: 0, fontFamily: FONT.mono, fontSize: size, lineHeight: 1.55, color: '#cfd6ff' }}>
    {LOOP.map((l, i) => {
      const isDelay = l.includes('vTaskDelay');
      return (
        <div key={i} style={{ position: 'relative', opacity: isDelay ? 1 - 0.6 * out : 1, color: isDelay && out > 0.5 ? RED : undefined }}>
          {l}
          {isDelay && <span style={{ position: 'absolute', left: size * 2.4, top: '52%', height: 3, width: `${out * size * 0.6 * 31}px`, background: RED, boxShadow: `0 0 8px ${RED}` }} />}
        </div>
      );
    })}
  </pre>
);

const WdtView: React.FC<{ t: number }> = ({ t }) => {
  const w = S.wdt;
  const out = after(t, w.out, 0.4);
  const clock = clamp01((t - w.wdt) / (w.five - w.wdt)); // the 5 s countdown, compressed to the VO
  const fire = after(t, w.five);
  const idle = after(t, w.idle);
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '640px 1fr', gap: 40, alignItems: 'center', padding: '0 20px' }}>
      <StruckLoop out={out} />
      <div style={{ display: 'grid', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: after(t, w.wdt) }}>
          <div style={{ width: 360, height: 18, borderRadius: 9, background: 'rgba(255,255,255,.08)', overflow: 'hidden' }}>
            <div style={{ width: `${clock * 100}%`, height: '100%', background: `linear-gradient(90deg, ${hexA(RED, 0.4)}, ${RED})` }} />
          </div>
          <span style={mono(24, C.ink)}>task watchdog · {Math.round(clock * 5)} / 5 s</span>
        </div>
        <div style={{ opacity: fire, borderRadius: 14, border: `1px solid ${hexA(RED, 0.5)}`, padding: '14px 18px', background: 'rgba(10,4,32,.6)', ...mono(19, RED), lineHeight: 1.5 }}>
          {LOG_WDT[0]}
          <br />
          {LOG_WDT[1]}
          <br />
          <span style={{ color: C.muted }}>recorded in QEMU · 5 s after app_main started (3647 → 8647 ms)</span>
        </div>
        <div style={{ opacity: idle, fontSize: 23, color: C.ink, lineHeight: 1.45 }}>
          your task (priority 1, CPU 0) never blocks → the <b style={{ color: C.cyan }}>idle task</b> (priority 0) never runs
          <span style={{ color: C.muted }}> · by default it only warns, and keeps warning</span>
        </div>
      </div>
    </div>
  );
};

const DimmerView: React.FC<{ t: number }> = ({ t }) => {
  const d = S.dimmer;
  const t0 = S.views.dimmer;
  const f = (x: number) => 300 ** inOutLocal((x - d.fast) / 2.2);
  const phase = integrate(f, Math.max(t, t0)) - integrate(f, t0);
  const fz = fusion(f(t));
  const dim = 0.45;
  const led = (pinHigh(phase, 0.5) ? 1 : 0) * (1 - fz) + dim * fz;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '700px 1fr', gridTemplateRows: '1fr 140px', gap: 16 }}>
      <div style={{ paddingLeft: 20 }}>
        <StruckLoop out={1} />
      </div>
      <div style={{ display: 'grid', justifyItems: 'center', alignContent: 'center', gap: 14 }}>
        <Led brightness={led} size={210} />
        <div style={{ opacity: after(t, d.dim), ...mono(28, C.amber) }}>looks dimmer — not blinking</div>
        <div style={{ opacity: after(t, d.hold) }}>
          <Pill color={C.amber} size={24}>
            hold that thought…
          </Pill>
        </div>
      </div>
      <div style={{ gridColumn: '1 / -1' }}>
        <Scope duty={0.5} phase={phase} cycles={4 + 40 * inOutLocal((t - d.fast) / 2.2)} W={1490} H={100} nowDot={1 - fz} />
      </div>
    </div>
  );
};
