/**
 * 10 · UNDER THE HOOD — what gpio_set_level really does.
 *
 * The camera descends the real call path, one layer per VO line:
 *
 *   main.c          gpio_set_level(LED, 1)
 *   ESP-IDF driver  GPIO_IS_VALID_OUTPUT_GPIO → gpio_hal_set_level
 *   HAL             hw->out_w1ts = 1 << gpio_num   (low: out_w1tc)
 *   silicon         GPIO_OUT_W1TS_REG @ 0x3FF44008 → only bit 2 of GPIO_OUT_REG changes
 *   direction       the same kind of writes: out_sel = 256, enable_w1ts = 1 << 2
 *
 * Source quoted from ESP-IDF release/v5.5; "…" marks trimmed lines.
 * Same layer-descent pattern as the PWM video.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { EASE_OUT } from '../../components/anim';
import { CodeLine, NOTE_ROW } from '../../components/CodeLine';
import { GREEN } from '../../components/Explainer';
import { Panel } from '../../components/Panel';
import { Kicker, Scene } from '../../components/Type';
import { C, FONT, hexA } from '../../theme/palette';
import { FPS, IDF, IDF_VERSION, Layer, PIN, sceneDur, W1TS_ADDR } from './timeline';

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const inOut = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2);

const VIEW_W = 1600;
const VIEW_H = 860;
const GAP = 92;
const LINE = 26 * 1.65;
const labelled = (l: Layer) => new Set(l.marks.filter((m) => m.label).map((m) => m.line)).size;
const cardH = (l: Layer) => Math.round(66 + l.code.length * LINE + 10 + labelled(l) * NOTE_ROW);
const REG_H = 340;
const PM_H = 250;

export const UnderTheHood: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const tops: number[] = [];
  let y = 0;
  for (const l of IDF.layers) {
    tops.push(y);
    y += cardH(l) + GAP;
  }
  const regTop = y;
  const pmTop = regTop + REG_H + GAP;

  const last = IDF.layers.length - 1;
  const keys = [
    ...IDF.layers.map((l, i) => ({
      at: i === 0 ? 0 : l.at - 0.1,
      focus: i === 0 ? cardH(l) / 2 : (tops[i - 1] + tops[i] + cardH(l)) / 2,
    })),
    { at: IDF.register - 0.1, focus: (tops[last] + regTop + REG_H) / 2 },
    { at: IDF.direction - 0.1, focus: (regTop + pmTop + PM_H) / 2 },
  ];
  let camY = VIEW_H / 2 - keys[0].focus;
  for (let i = 1; i < keys.length; i++) {
    const u = inOut(clamp01((t - keys[i].at) / 1.0));
    const from = VIEW_H / 2 - keys[i - 1].focus;
    const to = VIEW_H / 2 - keys[i].focus;
    if (t >= keys[i].at) camY = from + (to - from) * u;
  }
  const current = keys.reduce((acc, k, i) => (t >= k.at ? i : acc), 0);

  return (
    <Scene durationInFrames={Math.round(sceneDur('idf') * FPS)}>
      <AbsoluteFill>
        <div style={{ position: 'absolute', top: 52, width: '100%', display: 'grid', placeItems: 'center', gap: 10 }}>
          <Kicker delay={0.1} accent="magenta">
            Under the hood
          </Kicker>
          <div style={{ fontFamily: FONT.mono, fontSize: 18, color: C.muted, letterSpacing: '.1em' }}>{IDF_VERSION}</div>
        </div>

        <div
          style={{
            position: 'absolute',
            top: 170,
            left: (1920 - VIEW_W) / 2,
            width: VIEW_W,
            height: VIEW_H,
            overflow: 'hidden',
            maskImage: 'linear-gradient(180deg, transparent 0, #000 70px, #000 calc(100% - 70px), transparent 100%)',
            WebkitMaskImage: 'linear-gradient(180deg, transparent 0, #000 70px, #000 calc(100% - 70px), transparent 100%)',
          }}
        >
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, transform: `translateY(${camY}px)` }}>
            {IDF.layers.map((l, i) => (
              <React.Fragment key={i}>
                {l.via && <Arrow top={tops[i] - GAP} label={l.via} t={t - l.at} />}
                <LayerCard layer={l} top={tops[i]} t={t} dim={current > i} />
              </React.Fragment>
            ))}
            <Arrow top={regTop - GAP} label="one store → the GPIO peripheral" t={t - IDF.register} />
            <Register top={regTop} t={t} dim={current > IDF.layers.length} />
            <Arrow top={pmTop - GAP} label="and gpio_set_direction(LED, GPIO_MODE_OUTPUT)? the same kind of writes" t={t - IDF.direction} />
            <DirectionCard top={pmTop} t={t} />
          </div>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

const LayerCard: React.FC<{ layer: Layer; top: number; t: number; dim: boolean }> = ({ layer, top, t, dim }) => {
  const p = EASE_OUT(clamp01((t - layer.at) / 0.6));
  if (p <= 0) return null;
  const fired = layer.marks.filter((m) => t >= m.at).sort((a, b) => b.at - a.at);
  const liveLine = dim ? -1 : (fired[0]?.line ?? -1);
  return (
    <div style={{ position: 'absolute', top, left: 0, right: 0, height: cardH(layer), opacity: p * (dim ? 0.5 : 1), transform: `translateY(${(1 - p) * 30}px)` }}>
      <Panel label={layer.name} accent={C.cyan} right={layer.path}>
        <pre style={{ margin: 0, fontFamily: FONT.mono, fontSize: 26, lineHeight: 1.65, color: '#cfd6ff' }}>
          {layer.code.map((line, li) => {
            const marks = layer.marks.filter((m) => m.line === li);
            const f = marks.filter((m) => t >= m.at);
            const litAt = f.length ? Math.min(...f.map((m) => m.at)) : null;
            return <CodeLine key={li} text={line} t={t} litAt={litAt} live={li === liveLine} marks={marks} row={marks.some((m) => m.label) ? 1 : 0} />;
          })}
        </pre>
      </Panel>
    </div>
  );
};

const Arrow: React.FC<{ top: number; label: string; t: number }> = ({ top, label, t }) => {
  const p = EASE_OUT(clamp01(t / 0.5));
  if (p <= 0) return null;
  const h = GAP - 16;
  return (
    <div style={{ position: 'absolute', top: top + 8, left: 70, height: h, opacity: p }}>
      <svg width={30} height={h} style={{ position: 'absolute', left: 0, top: 0 }}>
        <line x1={15} y1={0} x2={15} y2={(h - 10) * p} stroke={C.cyan} strokeWidth={3} />
        <path d={`M 5 ${h - 14} L 15 ${h} L 25 ${h - 14}`} fill="none" stroke={C.cyan} strokeWidth={3} opacity={p} />
      </svg>
      <div style={{ position: 'absolute', left: 48, top: h / 2 - 15, fontFamily: FONT.mono, fontSize: 22, color: C.cyan, whiteSpace: 'nowrap', textShadow: `0 0 12px ${hexA(C.cyan, 0.6)}` }}>
        {label}
      </div>
    </div>
  );
};

/** 32 bit cells, bit 31 on the left */
const Bits: React.FC<{ value: number; hot?: number; hotP?: number; keepP?: number; color: string }> = ({ value, hot = -1, hotP = 0, keepP = 0, color }) => (
  <div style={{ display: 'flex', gap: 3 }}>
    {Array.from({ length: 32 }, (_, i) => {
      const bit = 31 - i;
      const v = (value >>> bit) & 1;
      const isHot = bit === hot;
      const glow = isHot ? hotP : 0;
      const keep = !isHot ? keepP : 0;
      return (
        <div
          key={bit}
          style={{
            width: 40,
            height: 52,
            borderRadius: 7,
            display: 'grid',
            placeItems: 'center',
            boxSizing: 'border-box',
            fontFamily: FONT.mono,
            fontSize: 24,
            fontWeight: 700,
            color: v ? '#fff' : hexA(C.ink, 0.35),
            background: isHot && glow > 0 ? hexA(C.amber, 0.35 * glow) : v ? hexA(color, 0.22) : 'rgba(255,255,255,.03)',
            border: `${isHot && glow > 0 ? 2.5 : 1}px solid ${isHot && glow > 0 ? C.amber : keep > 0 ? hexA(GREEN, 0.25 + 0.4 * keep) : 'rgba(255,255,255,.12)'}`,
            boxShadow: isHot && glow > 0 ? `0 0 ${20 * glow}px ${C.amber}` : undefined,
          }}
        >
          {v}
        </div>
      );
    })}
  </div>
);

const Register: React.FC<{ top: number; t: number; dim: boolean }> = ({ top, t, dim }) => {
  const p = EASE_OUT(clamp01((t - IDF.register) / 0.6));
  if (p <= 0) return null;
  const wrote = t >= IDF.write;
  const flipped = t >= IDF.write + 0.35;
  const hotP = EASE_OUT(clamp01((t - IDF.write) / 0.3));
  const only = EASE_OUT(clamp01((t - IDF.only) / 0.4));
  const keepP = EASE_OUT(clamp01((t - IDF.others) / 0.5));
  const w1ts = wrote ? 1 << PIN : 0;
  const out = flipped ? IDF.outBefore | (1 << PIN) : IDF.outBefore;
  const bitX = (b: number) => 140 + (31 - b) * 43 + 20; // centre of bit b, in panel coords
  return (
    <div style={{ position: 'absolute', top, left: 0, right: 0, height: REG_H, opacity: p * (dim ? 0.6 : 1), transform: `translateY(${(1 - p) * 30}px)` }}>
      <Panel label="GPIO peripheral · in silicon" accent={C.magenta} right="ESP32 TRM · register 6.1 / 6.2">
        <div style={{ display: 'grid', gap: 10, position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center' }}>
            <div style={{ fontFamily: FONT.mono, fontSize: 18, color: C.cyan, lineHeight: 1.3 }}>
              W1TS
              <br />
              <span style={{ color: C.muted }}>{W1TS_ADDR}</span>
            </div>
            <Bits value={w1ts} hot={PIN} hotP={hotP} color={C.cyan} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center' }}>
            <div style={{ fontFamily: FONT.mono, fontSize: 18, color: C.magenta, lineHeight: 1.3 }}>
              GPIO_OUT
              <br />
              <span style={{ color: C.muted }}>the pins</span>
            </div>
            <Bits value={out} hot={flipped ? PIN : -1} hotP={hotP} keepP={keepP} color={C.magenta} />
          </div>
          <div style={{ position: 'relative', height: 40 }}>
            <div style={{ position: 'absolute', left: bitX(PIN) - 400, width: 412, textAlign: 'right', opacity: only, fontFamily: FONT.mono, fontSize: 22, color: C.amber, fontWeight: 700 }}>
              bit 2 = GPIO 2 → high ↑
            </div>
            <div style={{ position: 'absolute', left: 150, opacity: keepP, fontFamily: FONT.mono, fontSize: 22, color: GREEN }}>
              every other bit: untouched ✓
            </div>
          </div>
          <div style={{ fontSize: 22, color: C.muted, fontStyle: 'italic', opacity: only }}>
            "For every bit that is 1 in the value written here, the corresponding bit in GPIO_OUT_REG will be set." — ESP32 TRM
          </div>
        </div>
      </Panel>
    </div>
  );
};

const DirectionCard: React.FC<{ top: number; t: number }> = ({ top, t }) => {
  const p = EASE_OUT(clamp01((t - IDF.direction) / 0.6));
  if (p <= 0) return null;
  const rows = [
    { at: IDF.route, reg: 'GPIO_FUNC2_OUT_SEL_CFG_REG ← 256', what: 'route "simple GPIO output" to pin 2' },
    { at: IDF.enable, reg: 'GPIO_ENABLE_W1TS_REG ← 1 << 2', what: 'output enable: listening → driving' },
  ];
  return (
    <div style={{ position: 'absolute', top, left: 0, right: 0, height: PM_H, opacity: p, transform: `translateY(${(1 - p) * 30}px)` }}>
      <Panel label="gpio_set_direction() → gpio_output_enable()" accent={C.cyan} right="esp_driver_gpio/src/gpio.c · hal/gpio_ll.h">
        <div style={{ display: 'grid', gap: 14, paddingTop: 6 }}>
          {rows.map((r, i) => {
            const q = EASE_OUT(clamp01((t - r.at) / 0.45));
            return (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 640px 1fr',
                  alignItems: 'center',
                  opacity: 0.25 + 0.75 * q,
                  padding: '10px 16px',
                  borderRadius: 12,
                  border: `1px solid ${q > 0.5 ? hexA(C.cyan, 0.6) : 'rgba(255,255,255,.1)'}`,
                  background: q > 0.5 ? hexA(C.cyan, 0.08) : 'transparent',
                }}
              >
                <span style={{ fontFamily: FONT.mono, fontSize: 24, color: C.cyan }}>{i === 0 ? '①' : '②'}</span>
                <span style={{ fontFamily: FONT.mono, fontSize: 24, color: '#fff' }}>{r.reg}</span>
                <span style={{ fontSize: 24, color: C.ink }}>{r.what}</span>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
};
