/**
 * 11 · UNDER THE HOOD — what gpio_get_level really does.
 *
 *   main.c          int level = gpio_get_level(BUTTON)
 *   ESP-IDF driver  no checks → gpio_hal_get_level
 *   HAL             return (hw->in >> gpio_num) & 0x1
 *   silicon         GPIO_IN_REG @ 0x3FF4403C: all 32 low pins at once; bit 18 = the button
 *   setup           IO_MUX_GPIO18_REG @ 0x3FF49070: FUN_IE (bit 9), FUN_WPU (bit 8), FUN_WPD (bit 7)
 *
 * Same layer-descent pattern as the output video. Source: ESP-IDF release/v5.5.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { EASE_OUT } from '../../components/anim';
import { CodeLine, NOTE_ROW } from '../../components/CodeLine';
import { GREEN } from '../../components/Explainer';
import { Panel } from '../../components/Panel';
import { Kicker, Scene } from '../../components/Type';
import { C, FONT, hexA } from '../../theme/palette';
import { BTN, downAt, FPS, IDF, IDF_VERSION, IN_ADDR, IOMUX18_ADDR, Layer, sceneDur } from './timeline';

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const inOut = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2);

const VIEW_W = 1600;
const VIEW_H = 860;
const GAP = 92;
const LINE = 26 * 1.65;
const labelled = (l: Layer) => new Set(l.marks.filter((m) => m.label).map((m) => m.line)).size;
const cardH = (l: Layer) => Math.round(66 + l.code.length * LINE + 10 + labelled(l) * NOTE_ROW);
const REG_H = 300;
const PM_H = 330;

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
    { at: IDF.setup - 0.1, focus: (regTop + pmTop + PM_H) / 2 },
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
            <Arrow top={regTop - GAP} label="one load ← the GPIO peripheral" t={t - IDF.register} />
            <Register top={regTop} t={t} dim={current > IDF.layers.length} />
            <Arrow top={pmTop - GAP} label="and the setup calls? one bit each, in the pin's IO MUX register" t={t - IDF.setup} />
            <IomuxCard top={pmTop} t={t} />
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
const Bits: React.FC<{ value: number; hot?: number; hotP?: number; keepP?: number; color: string; dimOthers?: number }> = ({ value, hot = -1, hotP = 0, keepP = 0, color, dimOthers = 0 }) => (
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
            opacity: isHot ? 1 : 1 - 0.55 * dimOthers,
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
  const all = EASE_OUT(clamp01((t - IDF.all32) / 0.4));
  const hot = EASE_OUT(clamp01((t - IDF.bit18) / 0.4));
  const pressed = downAt(IDF.presses, t);
  const live = t >= IDF.bit18;
  const val = (IDF.inOthers & ~(1 << BTN)) | ((live ? !pressed : true) ? 1 << BTN : 0);
  const bitX = (b: number) => 140 + (31 - b) * 43 + 20;
  return (
    <div style={{ position: 'absolute', top, left: 0, right: 0, height: REG_H, opacity: p * (dim ? 0.6 : 1), transform: `translateY(${(1 - p) * 30}px)` }}>
      <Panel label="GPIO peripheral · in silicon" accent={C.magenta} right="ESP32 TRM · register 6.14 GPIO_IN_REG">
        <div style={{ display: 'grid', gap: 10, position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center' }}>
            <div style={{ fontFamily: FONT.mono, fontSize: 18, color: C.magenta, lineHeight: 1.3 }}>
              GPIO_IN
              <br />
              <span style={{ color: C.muted }}>{IN_ADDR}</span>
            </div>
            <div style={{ opacity: 0.35 + 0.65 * all }}>
              <Bits value={val} hot={BTN} hotP={hot} color={C.magenta} dimOthers={hot} />
            </div>
          </div>
          <div style={{ position: 'relative', height: 40 }}>
            <div style={{ position: 'absolute', left: 150, opacity: all * (1 - hot), fontFamily: FONT.mono, fontSize: 22, color: C.ink }}>
              bits 31 … 0 = GPIO 31 … 0, all read in one go
            </div>
            <div style={{ position: 'absolute', left: bitX(BTN) - 20, opacity: hot, fontFamily: FONT.mono, fontSize: 22, color: C.amber, fontWeight: 700, whiteSpace: 'nowrap' }}>
              ↑ bit 18 = GPIO 18 = {pressed && live ? '0 · pressed' : '1 · released'}
            </div>
          </div>
          <div style={{ fontSize: 22, color: C.muted, fontStyle: 'italic', opacity: all }}>
            "Each bit represents a pin input value, 1 for high level and 0 for low level." — ESP32 TRM
          </div>
        </div>
      </Panel>
    </div>
  );
};

/** IO_MUX_GPIO18_REG, bits 14 … 7 */
const IOMUX_BITS = [
  { b: 14, f: 'MCU_SEL', v: 0 },
  { b: 13, f: 'MCU_SEL', v: 1 },
  { b: 12, f: 'MCU_SEL', v: 0 },
  { b: 11, f: 'FUN_DRV', v: 1 },
  { b: 10, f: 'FUN_DRV', v: 0 },
  { b: 9, f: 'FUN_IE', v: 1 },
  { b: 8, f: 'FUN_WPU', v: 1 },
  { b: 7, f: 'FUN_WPD', v: 0 },
];

const IomuxCard: React.FC<{ top: number; t: number }> = ({ top, t }) => {
  const p = EASE_OUT(clamp01((t - IDF.setup) / 0.6));
  if (p <= 0) return null;
  const reg = EASE_OUT(clamp01((t - IDF.iomux) / 0.45));
  const ie = EASE_OUT(clamp01((t - IDF.ie) / 0.4));
  const wpu = EASE_OUT(clamp01((t - IDF.wpu) / 0.4));
  const lit = (b: number) => (b === 9 ? ie : b === 8 || b === 7 ? wpu : 0);
  const from: Record<number, string> = { 9: 'gpio_set_direction(…, INPUT)', 8: 'gpio_set_pull_mode(…, PULLUP_ONLY)', 7: '…and clears the pull-down' };
  return (
    <div style={{ position: 'absolute', top, left: 0, right: 0, height: PM_H, opacity: p, transform: `translateY(${(1 - p) * 30}px)` }}>
      <Panel label={`IO_MUX_GPIO18_REG · ${IOMUX18_ADDR}`} accent={C.cyan} right="io_mux_reg.h · gpio_ll.h · TRM">
        <div style={{ display: 'grid', gridTemplateColumns: '640px 1fr', gap: 30, alignItems: 'center', opacity: 0.3 + 0.7 * reg }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {IOMUX_BITS.map((x) => {
              const l = lit(x.b);
              const ours = x.b <= 9;
              return (
                <div key={x.b} style={{ display: 'grid', justifyItems: 'center', gap: 6 }}>
                  <div style={{ fontFamily: FONT.mono, fontSize: 15, color: C.muted }}>{x.b}</div>
                  <div
                    style={{
                      width: 70,
                      height: 64,
                      borderRadius: 9,
                      display: 'grid',
                      placeItems: 'center',
                      fontFamily: FONT.mono,
                      fontSize: 30,
                      fontWeight: 800,
                      color: ours ? '#fff' : hexA(C.ink, 0.45),
                      background: l > 0 ? hexA(x.b === 9 ? C.cyan : C.amber, 0.3 * l) : 'rgba(255,255,255,.03)',
                      border: `${l > 0.5 ? 2.5 : 1}px solid ${l > 0.5 ? (x.b === 9 ? C.cyan : C.amber) : 'rgba(255,255,255,.14)'}`,
                      boxShadow: l > 0 ? `0 0 ${18 * l}px ${x.b === 9 ? C.cyan : C.amber}` : undefined,
                    }}
                  >
                    {x.v}
                  </div>
                  <div style={{ fontFamily: FONT.mono, fontSize: 13, color: ours ? C.ink : C.muted, whiteSpace: 'nowrap' }}>{x.f}</div>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            {[9, 8, 7].map((b) => (
              <div key={b} style={{ opacity: 0.25 + 0.75 * lit(b), fontSize: 22, color: C.ink, display: 'grid', gridTemplateColumns: '170px 1fr' }}>
                <span style={{ fontFamily: FONT.mono, color: b === 9 ? C.cyan : C.amber }}>bit {b} {b === 9 ? 'IE' : b === 8 ? 'WPU' : 'WPD'}</span>
                <span style={{ fontFamily: FONT.mono, fontSize: 19 }}>← {from[b]}</span>
              </div>
            ))}
            <div style={{ fontSize: 18, color: C.muted }}>bits 14–12 = 2: GPIO function · 11–10 = 2: drive strength (set by reset)</div>
          </div>
        </div>
      </Panel>
    </div>
  );
};
