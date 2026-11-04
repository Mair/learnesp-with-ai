/**
 * 3 · SETUP — the whole app_main first, then one piece at a time.
 *
 *   overview  LEDC makes the pulses · two set-up calls
 *   timer     a timer: how fast, how fine
 *   struct    each call takes a struct — a bundle of settings by name; & hands it over
 *   channel   a channel connects that timer to a pin
 *   write     two more lines set the brightness
 *   start     start with the timer
 *
 * FACTS: ledc_basic example (the same calls); ledc.h struct fields.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { mono } from '../../components/Explainer';
import { C, FONT, GRAD_TEXT, hexA } from '../../theme/palette';
import { CodeAndViews } from '../gpio-interrupts/parts';
import { after, Arrow, Block, LedBox, MiniCounter } from './parts';
import { CODE_LINES, CONTEXT as S, CONTEXT_CODE, FPS, sceneDur } from './timeline';

export const Context: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const V = S.views;
  const all = [...CODE_LINES.timer, ...CODE_LINES.channel];
  return (
    <CodeAndViews
      t={t}
      frames={Math.round(sceneDur('setup') * FPS)}
      kicker="The whole program · app_main"
      file="main/main.c"
      code={CONTEXT_CODE}
      codeSize={17}
      codeIn={0.2}
      captions={S.captions}
      marks={[
        { line: 11, at: S.amp, token: '&timer', strong: true },
        { line: 23, at: S.bright, token: '128', strong: true },
      ]}
      views={[
        { at: V.overview, component: Overview, label: 'LEDC · the LED PWM controller', accent: C.magenta, lines: all },
        { at: V.timer, component: Pipeline, label: 'call 1 · the timer', accent: C.cyan, lines: CODE_LINES.timer },
        { at: V.struct, component: StructView, label: 'a struct · a bundle of settings', accent: C.amber, lines: CODE_LINES.timer },
        { at: V.channel, component: Pipeline, label: 'call 2 · the channel', accent: C.pink, lines: CODE_LINES.channel },
        { at: V.write, component: Pipeline, label: 'then · the brightness', accent: C.amber, lines: CODE_LINES.write },
        { at: V.start, component: Pipeline, label: 'first · the timer', accent: C.cyan, lines: CODE_LINES.timer },
      ]}
    />
  );
};

const Overview: React.FC<{ t: number }> = ({ t }) => {
  const two = after(t, S.two);
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', justifyItems: 'center', gap: 26 }}>
      <div style={{ ...GRAD_TEXT, fontSize: 120, fontWeight: 800, lineHeight: 1, opacity: after(t, S.ledc) }}>LEDC</div>
      <div style={{ fontSize: 34, color: C.ink, opacity: after(t, S.ledc) }}>the LED PWM controller</div>
      <div style={{ fontSize: 26, color: C.muted, opacity: after(t, S.ledc + 0.6) }}>it makes the pulses for you</div>
      <div style={{ display: 'grid', gap: 14, marginTop: 30, opacity: two, transform: `translateY(${(1 - two) * 14}px)` }}>
        {['ledc_timer_config', 'ledc_channel_config'].map((c, i) => (
          <div key={c} style={{ display: 'flex', gap: 18, alignItems: 'baseline', justifyContent: 'center' }}>
            <span style={mono(22, C.muted)}>call {i + 1}</span>
            <span style={mono(32, i ? C.pink : C.cyan, { fontWeight: 700 })}>{c}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/** timer → channel → pin → LED, built up across the scene */
const Pipeline: React.FC<{ t: number }> = ({ t }) => {
  const V = S.views;
  const timer = after(t, V.timer);
  const fast = after(t, S.fast);
  const fine = after(t, S.fine);
  const ch = after(t, S.connects);
  const pin = after(t, S.pin);
  const write = after(t, S.bright);
  const start = t >= V.start;
  const half = t >= S.bright;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Block x={20} y={170} w={260} h={210} title="TIMER 0" color={C.cyan} p={timer} lit={start || t < V.channel}>
        <MiniCounter t={t} w={200} h={50} />
      </Block>
      <div style={{ position: 'absolute', left: 20, top: 400, width: 260, display: 'grid', gap: 6, ...mono(20, C.ink) }}>
        <div style={{ opacity: fast }}>
          how fast · <b style={{ color: C.magenta }}>1000 Hz</b>
        </div>
        <div style={{ opacity: fine }}>
          how fine · <b style={{ color: C.cyan }}>8 bits</b>
        </div>
      </div>
      <Arrow x1={290} y1={275} x2={365} y2={275} p={ch} />
      <Block x={375} y={190} w={220} h={170} title="CH 0" sub="channel 0" color={C.pink} p={ch} lit={!start && t >= V.channel} dim={start} />
      <Arrow x1={605} y1={275} x2={670} y2={275} p={pin} label="GPIO 2" />
      <LedBox x={690} y={205} brightness={half ? 0.5 : 0} p={pin} label={half ? 'duty 128 → half' : 'off'} />
      {write > 0 && !start && (
        <div style={{ position: 'absolute', left: 20, top: 520, width: 860, opacity: write, ...mono(22, C.ink), lineHeight: 1.6 }}>
          <div>
            ledc_set_duty(…, <b style={{ color: C.amber }}>128</b>);
          </div>
          <div>ledc_update_duty(…);</div>
        </div>
      )}
      {start && (
        <div style={{ position: 'absolute', left: 20, top: 520, fontSize: 30, fontWeight: 700, color: C.cyan, opacity: after(t, V.start) }}>
          first: ledc_timer_config
        </div>
      )}
    </div>
  );
};

const FIELDS: [string, string][] = [
  ['.speed_mode', 'LEDC_LOW_SPEED_MODE'],
  ['.timer_num', 'LEDC_TIMER_0'],
  ['.freq_hz', '1000'],
  ['.duty_resolution', 'LEDC_TIMER_8_BIT'],
  ['.clk_cfg', 'LEDC_AUTO_CLK'],
];

const StructView: React.FC<{ t: number }> = ({ t }) => {
  const box = after(t, S.struct);
  const name = after(t, S.name);
  const amp = after(t, S.amp);
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 24, padding: '0 20px' }}>
      <div
        style={{
          opacity: box,
          borderRadius: 18,
          border: `2px solid ${hexA(C.amber, 0.7)}`,
          background: hexA(C.amber, 0.05),
          padding: '18px 22px',
          display: 'grid',
          gap: 8,
        }}
      >
        <div style={mono(22, C.muted)}>ledc_timer_config_t timer = {'{'}</div>
        {FIELDS.map(([k, v], i) => {
          const p = after(t, S.bundle + i * 0.2, 0.3);
          return (
            <div key={k} style={{ ...mono(24, C.ink), opacity: p, paddingLeft: 30 }}>
              <span
                style={{
                  color: name > 0 ? C.amber : C.cyan,
                  background: hexA(C.amber, 0.18 * name),
                  borderRadius: 6,
                  padding: '0 4px',
                }}
              >
                {k}
              </span>{' '}
              = {v},
            </div>
          );
        })}
        <div style={mono(22, C.muted)}>{'};'}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 18, alignItems: 'center', opacity: box }}>
        <span style={{ fontSize: 26, color: C.ink }}>a bundle of settings,</span>
        <span style={{ fontSize: 26, color: name > 0 ? C.amber : C.muted }}>each one filled in by name</span>
      </div>
      <div style={{ opacity: amp, transform: `translateY(${(1 - amp) * 12}px)`, ...mono(28, C.ink) }}>
        ledc_timer_config(<b style={{ color: C.amber, background: hexA(C.amber, 0.2), borderRadius: 6, padding: '0 6px' }}>&timer</b>);
        <div style={{ fontFamily: FONT.sans, fontSize: 24, color: C.muted, marginTop: 8 }}>& hands the whole bundle to the call</div>
      </div>
    </div>
  );
};
