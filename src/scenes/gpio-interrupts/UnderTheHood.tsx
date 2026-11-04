/**
 * 11 · UNDER THE HOOD — from the edge to your function.
 *
 *   GPIO_PIN18_REG  INT_TYPE (9:7) = 2 falling edge · INT_ENA (17:13) = 0b00100 PRO CPU
 *   GPIO_STATUS     the edge sets bit 18 → the CPU takes the GPIO interrupt
 *   gpio.c          gpio_intr_service → status (pcpu_int) → gpio_isr_loop: __builtin_ffs,
 *                   clear first (edge), fn(args)
 *
 * FACTS: gpio_ll.h l.31–33, l.259–262, l.272–275, l.297–300, l.322–329; gpio_reg.h; TRM; gpio.c l.486–533.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { EASE_OUT } from '../../components/anim';
import { CodeLine, NOTE_ROW } from '../../components/CodeLine';
import { GREEN, mono } from '../../components/Explainer';
import { Panel } from '../../components/Panel';
import { Kicker, Scene } from '../../components/Type';
import { C, FONT } from '../../theme/palette';
import { Bits } from './parts';
import { BTN, FPS, IDF, IDF_VERSION, PIN18_ADDR, sceneDur, STATUS_ADDR } from './timeline';

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const inOut = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2);
const ease = (t: number, at: number, d = 0.5) => EASE_OUT(clamp01((t - at) / d));

const VIEW_W = 1600;
const VIEW_H = 860;
const GAP = 70;
const A_H = 300;
const B_H = 300;
const LINE = 23 * 1.65;
const labelled = new Set(IDF.marks.filter((m) => m.label).map((m) => m.line)).size;
const C_H = Math.round(66 + IDF.code.length * LINE + 10 + labelled * NOTE_ROW + 60);

export const UnderTheHood: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const tops = [0, A_H + GAP, A_H + GAP + B_H + GAP];
  const heights = [A_H, B_H, C_H];
  const keys = [
    { at: 0, focus: A_H / 2 },
    { at: IDF.status - 0.1, focus: (tops[0] + tops[1] + B_H) / 2 },
    { at: IDF.driver - 0.1, focus: tops[2] + Math.min(C_H, VIEW_H - 60) / 2 },
  ];
  let camY = VIEW_H / 2 - keys[0].focus;
  for (let i = 1; i < keys.length; i++) {
    const u = inOut(clamp01((t - keys[i].at) / 1.0));
    const from = VIEW_H / 2 - keys[i - 1].focus;
    const to = VIEW_H / 2 - keys[i].focus;
    if (t >= keys[i].at) camY = from + (to - from) * u;
  }
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
            maskImage: 'linear-gradient(180deg, transparent 0, #000 60px, #000 calc(100% - 60px), transparent 100%)',
            WebkitMaskImage: 'linear-gradient(180deg, transparent 0, #000 60px, #000 calc(100% - 60px), transparent 100%)',
          }}
        >
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, transform: `translateY(${camY}px)` }}>
            <Card top={tops[0]} h={heights[0]} p={ease(t, 0.3)} dim={t >= IDF.status}>
              <PinReg t={t} />
            </Card>
            <Arrow top={tops[1] - GAP} label="an edge arrives on GPIO 18" p={ease(t, IDF.status - 0.2)} />
            <Card top={tops[1]} h={heights[1]} p={ease(t, IDF.status)} dim={t >= IDF.driver}>
              <StatusReg t={t} />
            </Card>
            <Arrow top={tops[2] - GAP} label="the GPIO interrupt → the driver's handler, on CPU 0" p={ease(t, IDF.driver - 0.2)} />
            <Card top={tops[2]} h={heights[2]} p={ease(t, IDF.driver)} dim={false}>
              <DriverCode t={t} />
            </Card>
          </div>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

const Card: React.FC<{ top: number; h: number; p: number; dim: boolean; children: React.ReactNode }> = ({ top, h, p, dim, children }) =>
  p <= 0 ? null : (
    <div style={{ position: 'absolute', top, left: 0, right: 0, height: h, opacity: p * (dim ? 0.55 : 1), transform: `translateY(${(1 - p) * 30}px)` }}>{children}</div>
  );

const Arrow: React.FC<{ top: number; label: string; p: number }> = ({ top, label, p }) =>
  p <= 0 ? null : (
    <div style={{ position: 'absolute', top: top + 8, left: 70, height: GAP - 16, opacity: p }}>
      <svg width={30} height={GAP - 16} style={{ position: 'absolute', left: 0, top: 0 }}>
        <line x1={15} y1={0} x2={15} y2={(GAP - 26) * p} stroke={C.cyan} strokeWidth={3} />
        <path d={`M 5 ${GAP - 30} L 15 ${GAP - 16} L 25 ${GAP - 30}`} fill="none" stroke={C.cyan} strokeWidth={3} />
      </svg>
      <div style={{ position: 'absolute', left: 48, top: (GAP - 16) / 2 - 15, fontFamily: FONT.mono, fontSize: 22, color: C.cyan, whiteSpace: 'nowrap' }}>{label}</div>
    </div>
  );

const PinReg: React.FC<{ t: number }> = ({ t }) => {
  const type = ease(t, IDF.type);
  const two = t >= IDF.two;
  const ena = ease(t, IDF.ena);
  const cpu0 = t >= IDF.cpu0;
  // bits 17..7: INT_ENA 17:13 = 0b00100 (bit 15), INT_TYPE 9:7 = 0b010 (bit 8)
  const bit = (b: number): 0 | 1 | '·' => {
    if (b >= 13) return cpu0 && b === 15 ? 1 : 0;
    if (b <= 9) return two && b === 8 ? 1 : 0;
    return '·';
  };
  const hot = cpu0 ? 15 : two ? 8 : -1;
  return (
    <Panel label={`GPIO_PIN18_REG · ${PIN18_ADDR}`} accent={C.magenta} right="ESP32 TRM · GPIO_PINn_REG">
      <div style={{ display: 'grid', gridTemplateColumns: '640px 1fr', gap: 30, alignItems: 'center' }}>
        <Bits n={11} from={17} bit={bit} hot={hot} hotP={1} w={50} h={60} />
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ opacity: type, ...mono(22, C.ink) }}>
            INT_TYPE (9:7) = <b style={{ color: C.amber }}>{two ? '2 · falling edge' : '…'}</b>
          </div>
          <div style={{ opacity: ena, ...mono(22, C.ink) }}>
            INT_ENA (17:13) = <b style={{ color: C.amber }}>{cpu0 ? '0b00100 · PRO CPU (CPU 0)' : '…'}</b>
          </div>
          <div style={{ opacity: ena, fontSize: 18, color: C.muted }}>set by gpio_config / gpio_isr_handler_add · bits 12–10: other fields</div>
        </div>
      </div>
    </Panel>
  );
};

const StatusReg: React.FC<{ t: number }> = ({ t }) => {
  const set = t >= IDF.bit18;
  const takes = ease(t, IDF.takes);
  return (
    <Panel label={`GPIO_STATUS_REG · ${STATUS_ADDR}`} accent={C.magenta} right="GPIO0-31 interrupt status">
      <div style={{ display: 'grid', gap: 14 }}>
        <Bits n={32} from={31} bit={(b) => (set && b === BTN ? 1 : 0)} hot={set ? BTN : -1} hotP={1} w={40} h={50} />
        <div style={{ display: 'flex', gap: 40 }}>
          <span style={{ opacity: set ? 1 : 0, ...mono(22, C.amber, { fontWeight: 700 }) }}>bit 18 = 1: GPIO 18 fired</span>
          <span style={{ opacity: takes, ...mono(22, C.cyan, { fontWeight: 700 }) }}>→ CPU 0 takes the GPIO interrupt</span>
        </div>
      </div>
    </Panel>
  );
};

const DriverCode: React.FC<{ t: number }> = ({ t }) => {
  const fired = IDF.marks.filter((m) => t >= m.at).sort((a, b) => b.at - a.at);
  const liveLine = fired[0]?.line ?? -1;
  return (
    <Panel label="ESP-IDF · GPIO driver" accent={C.cyan} right="components/esp_driver_gpio/src/gpio.c">
      <pre style={{ margin: 0, fontFamily: FONT.mono, fontSize: 23, lineHeight: 1.65, color: '#cfd6ff' }}>
        {IDF.code.map((line, li) => {
          const ms = IDF.marks.filter((m) => m.line === li);
          const f = ms.filter((m) => t >= m.at);
          const litAt = f.length ? Math.min(...f.map((m) => m.at)) : null;
          return <CodeLine key={li} text={line} t={t} litAt={litAt} live={li === liveLine} marks={ms} row={ms.some((m) => m.label) ? 1 : 0} />;
        })}
      </pre>
      <div style={{ marginTop: 8, display: 'flex', gap: 30, opacity: ease(t, IDF.again) }}>
        <span style={mono(20, C.ink)}>a new edge while button_isr runs → bit 18 set again</span>
        <span style={{ opacity: ease(t, IDF.fires), ...mono(20, GREEN, { fontWeight: 700 }) }}>→ fires again, not lost ✓</span>
      </div>
    </Panel>
  );
};

