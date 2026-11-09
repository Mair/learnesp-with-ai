/**
 * 5 · gpio_set_direction(LED, GPIO_MODE_OUTPUT) — making it an output.
 *
 *   driver   the pin diagram: the output-enable gate closes (listening → driving)
 *   modes    mode bits: OUTPUT = output only → gpio_get_level reads 0; INPUT_OUTPUT to read back
 *   fail     GPIO 34: "io_num=34 can only be input" → ESP_ERR_INVALID_ARG; ESP_ERROR_CHECK → abort
 *   start    GPIO_OUT_REG resets to x → gpio_set_level first, then the output turns on at that level
 *
 * FACTS: gpio.c gpio_set_direction; gpio_types.h; driver/gpio.h @warning; esp_err.h / esp_err.c; TRM 6.1.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { Explainer, GREEN, mono, RED } from '../../components/Explainer';
import { C, FONT, hexA } from '../../theme/palette';
import { after, inOutLocal, PinDriver, Pill, Verdict } from './parts';
import { DIRECTION as S, FPS, LOG_CHECK, LOG_INPUT_ONLY, sceneDur } from './timeline';

const ARG_COLOR = [C.pink, C.amber];

export const Direction: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const V = S.views;
  const subs = [S.args[0].sub, t < S.driver.on ? S.args[1].sub : t < S.modes.outOnly ? 'output driver on' : 'output only · input off'];
  return (
    <Explainer
      t={t}
      frames={Math.round(sceneDur('direction') * FPS)}
      kicker="Making it an output · gpio_set_direction()"
      code={S.code}
      run={S.run}
      args={S.args.map((a, i) => ({ ...a, sub: subs[i], color: ARG_COLOR[i] }))}
      captions={S.captions}
      views={[
        { at: V.driver, component: DriverView, active: [1], label: 'mode · inside the pin', accent: C.amber },
        { at: V.modes, component: ModesView, active: [1], label: 'the mode, in bits · gpio_types.h', accent: C.cyan, right: () => 'gpio_mode_t' },
        { at: V.fail, component: FailView, active: [0, 1], label: 'a pin that can only listen', accent: RED, right: () => 'recorded in QEMU' },
        { at: V.start, component: StartView, active: [0], label: 'the starting level', accent: C.cyan, right: () => 'TRM · GPIO_OUT_REG reset value: x' },
      ]}
    />
  );
};

// ── views ─────────────────────────────────────────────────────────────────

const DriverView: React.FC<{ t: number }> = ({ t }) => {
  const d = S.driver;
  const enable = inOutLocal((t - d.on) / 0.35);
  const level = inOutLocal((t - d.high) / 0.3) * (1 - inOutLocal((t - d.low) / 0.3));
  const before = t < d.drive;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1100px 1fr', alignItems: 'center' }}>
      <PinDriver enable={enable} level={level} H={420} showInput={0} />
      <div style={{ display: 'grid', gap: 22, justifyItems: 'start' }}>
        <div style={{ opacity: after(t, d.listening) * (before ? 1 : 0.35) }}>
          <Pill color={C.muted} size={26}>
            before: listening
          </Pill>
        </div>
        <div style={{ opacity: after(t, d.drive) }}>
          <Pill color={C.cyan} size={26} solid>
            now: driving
          </Pill>
        </div>
        <div style={{ opacity: after(t, d.high), ...mono(24, C.amber) }}>high → 3.3 V</div>
        <div style={{ opacity: after(t, d.low), ...mono(24, C.muted) }}>low → 0 V</div>
      </div>
    </div>
  );
};

const ModesView: React.FC<{ t: number }> = ({ t }) => {
  const m = S.modes;
  const only = after(t, m.outOnly);
  const off = after(t, m.inputOff);
  const zero = after(t, m.readZero);
  const io = after(t, m.inout);
  const Row: React.FC<{ name: string; bits: [number, number, number]; p: number; strong?: boolean }> = ({ name, bits, p, strong }) => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '380px repeat(3, 96px)',
        alignItems: 'center',
        padding: '12px 18px',
        borderRadius: 12,
        opacity: 0.25 + 0.75 * p,
        border: `1.5px solid ${strong && p > 0.5 ? hexA(C.amber, 0.8) : 'rgba(255,255,255,.12)'}`,
        background: strong && p > 0.5 ? hexA(C.amber, 0.08) : 'transparent',
        ...mono(26, C.ink),
      }}
    >
      <span style={{ color: strong ? C.amber : C.cyan }}>{name}</span>
      {bits.map((b, i) => (
        <span key={i} style={{ textAlign: 'center', color: b ? GREEN : i === 2 && name === 'GPIO_MODE_OUTPUT' && off > 0.5 ? RED : C.muted, fontWeight: 700 }}>
          {b ? '✓' : '✗'}
        </span>
      ))}
    </div>
  );
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '720px 1fr', gap: 40, alignItems: 'center', padding: '0 10px' }}>
      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '380px repeat(3, 96px)', padding: '0 18px', ...mono(18, C.muted, { letterSpacing: '.1em' }) }}>
          <span>MODE</span>
          <span style={{ textAlign: 'center' }}>OD</span>
          <span style={{ textAlign: 'center' }}>output</span>
          <span style={{ textAlign: 'center' }}>input</span>
        </div>
        <Row name="GPIO_MODE_OUTPUT" bits={[0, 1, 0]} p={only} strong />
        <Row name="GPIO_MODE_INPUT_OUTPUT" bits={[0, 1, 1]} p={io} />
      </div>
      <div style={{ display: 'grid', gap: 16, opacity: zero, transform: `translateY(${(1 - zero) * 16}px)` }}>
        <div style={mono(30, C.ink)}>
          gpio_get_level(LED) <span style={{ color: C.muted }}>→</span> <b style={{ color: RED }}>0</b>
        </div>
        <div style={{ fontSize: 21, color: C.muted, fontStyle: 'italic', lineHeight: 1.4, maxWidth: 720 }}>
          "If the pad is not configured for input (or input and output) the returned value is always 0."
          <br />— driver/gpio.h
        </div>
        <div style={{ opacity: io }}>
          <Pill color={GREEN} size={20}>
            read it back? → GPIO_MODE_INPUT_OUTPUT
          </Pill>
        </div>
      </div>
    </div>
  );
};

const FailView: React.FC<{ t: number }> = ({ t }) => {
  const f = S.fail;
  const code = after(t, f.code);
  const log = after(t, f.log);
  const ret = after(t, f.ret);
  const wrap = after(t, f.wrap);
  const stops = after(t, f.stops);
  const box = (border: string): React.CSSProperties => ({ borderRadius: 14, border: `1px solid ${border}`, padding: '14px 18px', background: 'rgba(10,4,32,.6)' });
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 34, padding: '6px 20px' }}>
      <div style={{ display: 'grid', gap: 18, alignContent: 'start' }}>
        <div style={{ opacity: code, ...mono(30, '#fff'), padding: '10px 16px', borderLeft: `4px solid ${RED}`, background: `linear-gradient(90deg, ${hexA(RED, 0.14)}, transparent)` }}>
          gpio_set_direction(<span style={{ color: RED }}>GPIO_NUM_34</span>, GPIO_MODE_OUTPUT);
        </div>
        <div style={{ ...box('rgba(255,255,255,.14)'), opacity: log }}>
          <div style={mono(15, C.muted, { letterSpacing: '.14em', marginBottom: 8 })}>RECORDED IN QEMU (ESP32 EMULATOR)</div>
          <div style={mono(22, RED)}>{LOG_INPUT_ONLY}</div>
        </div>
        <div style={{ opacity: ret, ...mono(26, C.ink) }}>
          returns <b style={{ color: RED }}>ESP_ERR_INVALID_ARG</b> <span style={{ color: C.muted }}>(0x102)</span>
        </div>
        <div style={{ opacity: ret, fontSize: 22, color: C.muted }}>…and the pin stays as it was — still listening</div>
      </div>
      <div style={{ display: 'grid', gap: 18, alignContent: 'start', opacity: wrap, transform: `translateY(${(1 - wrap) * 16}px)` }}>
        <div style={{ ...mono(26, '#fff'), padding: '10px 16px', borderLeft: `4px solid ${C.cyan}`, background: `linear-gradient(90deg, ${hexA(C.cyan, 0.14)}, transparent)` }}>
          <span style={{ color: C.cyan }}>ESP_ERROR_CHECK</span>(gpio_set_direction(…));
        </div>
        <div style={{ ...box(hexA(RED, 0.5)), opacity: stops }}>
          <div style={{ ...mono(19, RED), lineHeight: 1.5 }}>
            {LOG_CHECK}
            <br />
            <span style={{ color: C.muted }}>recorded in QEMU · then abort() and a restart</span>
          </div>
        </div>
        <Verdict ok p={stops} size={24}>
          abort() — the mistake stops you, instead of slipping by
        </Verdict>
      </div>
    </div>
  );
};

const StartView: React.FC<{ t: number }> = ({ t }) => {
  const s = S.start;
  const q = after(t, s.unknown);
  const first = after(t, s.first);
  const waits = after(t, s.waits);
  const on = after(t, s.on);
  const bits = Array.from({ length: 8 }, (_, i) => 7 - i);
  const known = t >= s.waits;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 50, alignItems: 'center', padding: '0 40px' }}>
      <div style={{ display: 'grid', gap: 16, opacity: q }}>
        <div style={mono(22, C.muted, { letterSpacing: '.12em' })}>GPIO_OUT_REG · bits 7 … 0</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {bits.map((b) => {
            const ours = b === 2;
            const val = ours ? (known ? '0' : '?') : 'x';
            return (
              <div
                key={b}
                style={{
                  width: 72,
                  height: 84,
                  borderRadius: 10,
                  display: 'grid',
                  placeItems: 'center',
                  border: `${ours ? 3 : 1.5}px solid ${ours ? (known ? GREEN : C.amber) : 'rgba(255,255,255,.15)'}`,
                  background: ours ? hexA(known ? GREEN : C.amber, 0.12) : 'transparent',
                  boxShadow: ours && waits > 0 ? `0 0 ${20 * waits}px ${hexA(GREEN, 0.5)}` : undefined,
                  ...mono(ours ? 40 : 30, ours ? C.ink : C.muted, { fontWeight: 700 }),
                }}
              >
                {val}
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {bits.map((b) => (
            <div key={b} style={{ width: 72, textAlign: 'center', ...mono(18, b === 2 ? C.pink : C.muted) }}>
              {b === 2 ? 'GPIO 2' : b}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 24, color: C.ink }}>
          {known ? (
            <span style={{ color: GREEN }}>the level waits here — even with the output off</span>
          ) : (
            <>
              reset value in the TRM: <b style={{ color: C.amber }}>x — undefined</b>
            </>
          )}
        </div>
      </div>
      <div style={{ display: 'grid', gap: 14, opacity: first, transform: `translateY(${(1 - first) * 16}px)` }}>
        <div style={{ fontFamily: FONT.mono, fontSize: 24, lineHeight: 1.7, color: '#cfd6ff', whiteSpace: 'nowrap' }}>
          <div style={{ color: C.muted }}>gpio_reset_pin(LED);</div>
          <div style={{ color: '#fff', borderLeft: `4px solid ${C.cyan}`, paddingLeft: 14, background: `linear-gradient(90deg, ${hexA(C.cyan, 0.16)}, transparent)` }}>
            gpio_set_level(LED, 0);
          </div>
          <div style={{ color: on > 0.5 ? '#fff' : C.muted, borderLeft: `4px solid ${on > 0.5 ? C.amber : 'transparent'}`, paddingLeft: 14 }}>gpio_set_direction(LED, GPIO_MODE_OUTPUT);</div>
        </div>
        <Verdict ok p={on} size={24}>
          output turns on — already LOW, no glitch
        </Verdict>
      </div>
    </div>
  );
};
