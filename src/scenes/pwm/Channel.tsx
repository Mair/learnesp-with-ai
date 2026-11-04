/**
 * 5 · CHANNEL — what each field of `ledc_channel_config(&channel)` says.
 *
 *   channels  same speed mode · eight channels · this is channel 0
 *   timersel  the counter it follows · channels sharing a timer share its frequency
 *   pin       GPIO 2 · the driver connects it — no gpio_set_direction
 *   duty      the duty is a line across the counter: below → ON, past → OFF
 *   hpoint    where it turns on: 0 = the start of every period
 *   start     duty 0 → off · running as soon as the call returns
 *
 * FACTS: ledc.h l.36–52; ledc.c l.869–935 (gpio_matrix_output enables the output); TRM 28.2.3.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { ease, Explainer, GREEN, mono, RED, VIEW_H as H, VIEW_W as W } from '../../components/Explainer';
import { Led } from '../../components/Gadgets';
import { C, FONT, hexA } from '../../theme/palette';
import { after, Arrow, Block, LedBox, MiniCounter, Ok } from './parts';
import { CHANNEL as S, FPS, sceneDur, STEPS } from './timeline';

const ARG_COLOR = [C.cyan, C.pink, C.cyan, C.pink, C.amber, GREEN];

export const Channel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const V = S.views;
  return (
    <Explainer
      t={t}
      frames={Math.round(sceneDur('channel') * FPS)}
      kicker="Call 2 · the channel · ledc_channel_config()"
      code={S.code}
      run={S.run}
      cardW={250}
      cardGap={272}
      args={S.args.map((a, i) => ({ ...a, color: ARG_COLOR[i] }))}
      captions={S.captions}
      views={[
        { at: V.channels, component: ChannelsView, active: [0, 1], label: 'channel · one of eight', accent: C.pink },
        { at: V.timersel, component: TimerSelView, active: [2], label: 'timer_sel · the counter it follows', accent: C.cyan },
        { at: V.pin, component: PinView, active: [3], label: 'gpio_num · the pin it drives', accent: C.pink },
        { at: V.duty, component: DutyView, active: [4], label: 'duty · the counter vs your number', accent: C.amber, right: () => `duty = ${S.duty.value}` },
        { at: V.hpoint, component: HpointView, active: [5], label: 'hpoint · where it turns on', accent: GREEN },
        { at: V.start, component: StartView, active: [4, 5], label: 'where it starts', accent: C.amber },
      ]}
    />
  );
};

const ChannelsView: React.FC<{ t: number }> = ({ t }) => {
  const P = S.channels;
  const zero = t >= P.zero;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', left: 20, top: 20, ...mono(26, C.ink), opacity: after(t, P.same) }}>
        speed_mode = <b style={{ color: C.cyan }}>LEDC_LOW_SPEED_MODE</b> — same as the timer
      </div>
      {Array.from({ length: 8 }, (_, i) => (
        <Block
          key={i}
          x={20 + i * 186}
          y={130}
          w={166}
          h={150}
          title={`CH ${i}`}
          color={C.pink}
          p={after(t, P.eight + i * 0.08, 0.3)}
          lit={zero && i === 0}
          dim={zero && i > 0}
        />
      ))}
      <div style={{ position: 'absolute', left: 20, top: 300, ...mono(20, C.muted), opacity: after(t, P.eight) }}>LEDC_CHANNEL_0 … LEDC_CHANNEL_7</div>
      <div style={{ position: 'absolute', left: 20, top: 350, fontSize: 28, color: C.ink, opacity: after(t, P.zero) }}>
        this one: <b style={{ color: C.pink }}>LEDC_CHANNEL_0</b>
      </div>
    </div>
  );
};

const TimerSelView: React.FC<{ t: number }> = ({ t }) => {
  const P = S.timersel;
  const picks = after(t, P.picks);
  const sev = after(t, P.several);
  const share = after(t, P.share);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Block x={60} y={110} w={330} h={230} title="TIMER 0" sub="1000 Hz · 8 bits" color={C.cyan} p={1} lit>
        <MiniCounter t={t} w={240} h={56} />
      </Block>
      <div style={{ position: 'absolute', left: 60, top: 40, ...mono(26, C.ink), opacity: picks }}>
        timer_sel = <b style={{ color: C.cyan }}>LEDC_TIMER_0</b>
      </div>
      <Arrow x1={400} y1={190} x2={640} y2={150} p={picks} />
      <Block x={650} y={80} w={260} h={140} title="CH 0" sub="→ GPIO 2" color={C.pink} p={picks} lit />
      <Arrow x1={400} y1={260} x2={640} y2={330} p={sev} color={hexA(C.ink, 0.6)} />
      <Block x={650} y={270} w={260} h={140} title="CH 1" sub="could use it too" color={C.pink} p={sev} dim />
      <div style={{ position: 'absolute', left: 960, top: 150, width: 560, display: 'grid', gap: 14, opacity: share }}>
        <div style={{ fontSize: 30, fontWeight: 700, color: C.ink }}>sharing a timer means sharing</div>
        <div style={mono(28, C.magenta)}>the same 1000 Hz</div>
        <div style={mono(28, C.cyan)}>the same 8 bits</div>
        <div style={{ fontSize: 22, color: C.muted }}>each channel still has its own duty</div>
      </div>
    </div>
  );
};

const PinView: React.FC<{ t: number }> = ({ t }) => {
  const P = S.pin;
  const pin = after(t, P.pin);
  const drv = after(t, P.driver);
  const call = after(t, P.call);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Block x={60} y={100} w={280} h={170} title="CH 0" sub="channel 0" color={C.pink} p={1} lit />
      <Arrow x1={350} y1={185} x2={620} y2={185} p={drv} label="the driver connects it" />
      <Block x={630} y={100} w={280} h={170} title="GPIO 2" sub="#define LED GPIO_NUM_2" color={C.pink} p={pin} lit />
      <LedBox x={980} y={110} brightness={0} p={pin} label="the LED" />
      <div style={{ position: 'absolute', left: 60, top: 340, display: 'grid', gap: 12, opacity: call }}>
        <div style={{ ...mono(30, C.muted), textDecoration: 'line-through', textDecorationColor: RED, textDecorationThickness: 3 }}>
          gpio_set_direction(LED, GPIO_MODE_OUTPUT);
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, color: GREEN }}>✓ not needed — ledc_channel_config sets the pin up</div>
      </div>
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
  const off = ease((t - D.passes) / 0.5);
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


const HpointView: React.FC<{ t: number }> = ({ t }) => {
  const P = S.hpoint;
  const X0 = 110;
  const PER = 400;
  const yTop = 80;
  const yBase = 270;
  const oHi = 350;
  const oLo = 420;
  const f = S.duty.value / STEPS;
  const sy = (c: number) => yBase - (c / (STEPS - 1)) * (yBase - yTop);
  const on = after(t, P.on);
  const zero = after(t, P.zero);
  let saw = '';
  let out = '';
  const marks: React.ReactNode[] = [];
  for (let k = 0; k < 3; k++) {
    const x0 = X0 + k * PER;
    const xd = x0 + f * PER;
    saw += `${saw ? ' L' : 'M'} ${x0} ${yBase} L ${x0 + PER} ${yTop}`;
    out += `${out ? ' L' : 'M'} ${x0} ${oLo} L ${x0} ${oHi} L ${xd} ${oHi} L ${xd} ${oLo} L ${x0 + PER} ${oLo}`;
    marks.push(
      <g key={k}>
        <line x1={x0} y1={yBase + 6} x2={x0} y2={oHi} stroke={GREEN} strokeWidth={2.5} strokeDasharray="5 5" opacity={on} />
        <circle cx={x0} cy={yBase} r={7} fill={GREEN} opacity={on} />
        <line x1={xd} y1={sy(S.duty.value)} x2={xd} y2={oHi} stroke={C.amber} strokeWidth={1.5} strokeDasharray="4 5" opacity={0.7 * on} />
      </g>,
    );
  }
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg width={W} height={H} style={{ display: 'block', overflow: 'visible' }}>
        <text x={X0 - 14} y={yBase + 7} textAnchor="end" style={mono(20, C.cyan)}>
          0
        </text>
        <text x={X0 - 14} y={yTop + 7} textAnchor="end" style={mono(20, C.cyan)}>
          255
        </text>
        <text x={X0 - 14} y={(oHi + oLo) / 2 + 7} textAnchor="end" style={mono(20, C.magenta)}>
          pin
        </text>
        <path d={saw} fill="none" stroke={C.cyan} strokeWidth={3} />
        <path d={out} fill="none" stroke={C.magenta} strokeWidth={3.5} style={{ filter: `drop-shadow(0 0 8px ${C.magenta})` }} />
        {marks}
        <text x={X0} y={yTop - 30} opacity={zero} style={mono(22, GREEN, { fontWeight: 700 })}>
          hpoint = 0 → ON at the start of every period
        </text>
        <text x={X0} y={oLo + 50} opacity={on} style={mono(22, C.ink)}>
          <tspan fill={GREEN}>on at hpoint</tspan>
          <tspan fill={C.muted}> · </tspan>
          <tspan fill={C.amber}>off at hpoint + duty ({S.duty.value})</tspan>
        </text>
      </svg>
    </div>
  );
};

const StartView: React.FC<{ t: number }> = ({ t }) => {
  const P = S.start;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr 360px', alignItems: 'center', gap: 40, padding: '0 40px' }}>
      <div style={{ display: 'grid', gap: 22 }}>
        <div style={{ ...mono(30, C.ink), opacity: after(t, P.zero) }}>
          .duty = <b style={{ color: C.amber }}>0</b> → the line sits at the bottom → the pin stays <b>off</b>
        </div>
        <svg width={900} height={90} style={{ opacity: after(t, P.off) }}>
          <line x1={0} y1={70} x2={900} y2={70} stroke={C.magenta} strokeWidth={4} style={{ filter: `drop-shadow(0 0 8px ${C.magenta})` }} />
          <text x={0} y={40} style={mono(20, C.muted)}>
            pin · 0 V the whole time
          </text>
        </svg>
        <div style={{ display: 'flex', gap: 18, alignItems: 'baseline', opacity: after(t, P.returns) }}>
          <span style={mono(26, C.ink)}>ledc_channel_config(&channel)</span>
          <Ok p={after(t, P.returns)} />
        </div>
        <div style={{ fontSize: 26, color: C.ink, opacity: after(t, P.returns + 0.5) }}>the channel is running from here on</div>
      </div>
      <Led brightness={0} size={180} />
    </div>
  );
};
