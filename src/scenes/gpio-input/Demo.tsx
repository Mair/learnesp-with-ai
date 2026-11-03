/**
 * 8 · DEMO — button → LED, the whole app_main, in real time.
 * The loop reads GPIO 18 once per tick (10 ms) from `run`; the LED shows the
 * last read (`demoRead`), so it lags the finger by up to one tick. On "within
 * ten milliseconds" the scope zooms into one real press from the schedule.
 *
 * FACTS: pdMS_TO_TICKS(10) = 1 tick; vTaskDelay blocks; Ganssle "50 msec … seemed instantaneous".
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { CaptionLine } from '../../components/CodeToHardware';
import { CodeLine } from '../../components/CodeLine';
import { GREEN, mono } from '../../components/Explainer';
import { Led } from '../../components/Gadgets';
import { Panel } from '../../components/Panel';
import { Kicker, Scene } from '../../components/Type';
import { C, FONT, hexA } from '../../theme/palette';
import { after, TactSwitch } from './parts';
import { DEMO as D, demoRead, downAt, FPS, sceneDur, TICK_MS } from './timeline';

function liveLine(t: number): { idx: number; since: number; lit: Map<number, number> } {
  const I = D.idx;
  const lit = new Map<number, number>();
  const mark = (i: number, at: number) => t >= at && lit.set(i, at);
  I.led.forEach((i, k) => mark(i, D.led + 0.25 * k));
  I.btn.forEach((i, k) => mark(i, D.button + 0.25 * k));
  mark(I.read, D.read);
  mark(I.write, D.copy);
  mark(I.delay, D.wait);
  let idx = -1;
  let since = 0;
  for (const [i, at] of lit) if (at >= since) [idx, since] = [i, at];
  if (t >= D.wait) [idx, since] = [I.delay, D.wait];
  return { idx, since, lit };
}

export const Demo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const running = t >= D.run;
  const { down, led } = demoRead(t);
  const live = liveLine(t);
  const zoom = after(t, D.ten - 0.2, 0.5);
  const reads = running ? Math.floor(((t - D.run) * 1000) / TICK_MS) : 0;

  return (
    <Scene durationInFrames={Math.round(sceneDur('demo') * FPS)}>
      <div style={{ position: 'absolute', top: 40, width: '100%', display: 'grid', placeItems: 'center' }}>
        <Kicker delay={0.1} accent="amber">
          Button → LED · real time
        </Kicker>
      </div>
      <div style={{ position: 'absolute', left: 160, top: 100, width: 1600, display: 'grid', gridTemplateColumns: '1fr 470px', gridTemplateRows: '560px 236px', gap: 22 }}>
        <Panel label="main/main.c" accent={C.cyan} right="ESP-IDF">
          <pre style={{ margin: 0, fontFamily: FONT.mono, fontSize: 21, lineHeight: 1.34, color: '#cfd6ff' }}>
            {D.preamble.map((l, i) => (
              <div key={`p${i}`} style={{ padding: '0 10px', color: C.muted, opacity: 0.7, minHeight: '1.34em' }}>
                {l}
              </div>
            ))}
            {D.lines.map((l, i) => (
              <div key={i} style={{ minHeight: '1.34em', position: 'relative' }}>
                <CodeLine text={l} t={t} litAt={live.lit.get(i) ?? null} live={i === live.idx} />
                {i === D.idx.delay && t >= D.free && (
                  <span style={{ position: 'absolute', right: 16, top: 0, opacity: after(t, D.free), ...mono(18, GREEN) }}>← blocked ~10 ms · CPU free</span>
                )}
              </div>
            ))}
          </pre>
        </Panel>
        <Panel label="breadboard" accent={C.amber} right={running ? 'real time' : undefined}>
          <div style={{ display: 'grid', justifyItems: 'center', gap: 10 }}>
            <svg width={200} height={170}>
              <TactSwitch x={100} y={85} press={down ? 1 : 0} size={120} />
            </svg>
            <div style={mono(22, down ? C.cyan : C.muted, { fontWeight: 700 })}>GPIO 18 · {down ? 'pressed → 0' : 'released → 1'}</div>
            <Led brightness={led ? 1 : 0} size={150} />
            <div style={mono(22, led ? C.amber : C.muted, { fontWeight: 700 })}>GPIO 2 · {led ? 'HIGH' : 'LOW'}</div>
            <div style={{ opacity: after(t, D.hundred), ...mono(20, C.cyan, { fontVariantNumeric: 'tabular-nums' }) }}>reads so far: {String(reads).padStart(4, '\u2007')}</div>
          </div>
        </Panel>
        <div style={{ gridColumn: '1 / -1', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 1 - zoom }}>
            <Panel label="scope · last 3 s" accent={C.magenta} right={t >= D.tick ? `a read every ${TICK_MS} ms` : 'real time'}>
              <Lanes t={t} />
            </Panel>
          </div>
          {zoom > 0 && (
            <div style={{ position: 'absolute', inset: 0, opacity: zoom }}>
              <Panel label="zoom · one press, in milliseconds" accent={C.magenta} right="from the same run">
                <Zoom t={t} />
              </Panel>
            </div>
          )}
        </div>
      </div>
      <div style={{ position: 'absolute', top: 944, width: '100%', display: 'grid', placeItems: 'center' }}>
        <CaptionLine captions={D.captions} t={t} size={32} />
      </div>
    </Scene>
  );
};

const LW = 1544;
const WIN = 3;

/** two lanes: the button (GPIO 18) with the read ticks, and the LED (GPIO 2) */
const Lanes: React.FC<{ t: number }> = ({ t }) => {
  const s0 = t - WIN;
  const L = 130;
  const x = (s: number) => L + ((s - s0) / WIN) * (LW - L - 10);
  const lane = (y: number, h: number, hi: (s: number) => boolean, col: string) => {
    let d = '';
    const n = 600;
    for (let i = 0; i <= n; i++) {
      const s = s0 + (WIN * i) / n;
      if (s > t) break;
      const yy = hi(s) ? y : y + h;
      d += `${d ? ' L' : 'M'} ${x(s).toFixed(1)} ${yy}`;
    }
    return <path d={d} fill="none" stroke={col} strokeWidth={3} style={{ filter: `drop-shadow(0 0 5px ${col})` }} />;
  };
  const ticks: React.ReactNode[] = [];
  if (t >= D.tick) {
    const k0 = Math.ceil(((Math.max(s0, D.run) - D.run) * 1000) / TICK_MS);
    const k1 = Math.floor(((t - D.run) * 1000) / TICK_MS);
    for (let k = k0; k <= k1; k++) {
      const s = D.run + (k * TICK_MS) / 1000;
      ticks.push(<line key={k} x1={x(s)} y1={60} x2={x(s)} y2={74} stroke={hexA(C.cyan, 0.45)} strokeWidth={1} />);
    }
  }
  return (
    <svg width={LW} height={170} style={{ display: 'block' }}>
      <text x={0} y={30} style={mono(18, C.pink)}>
        GPIO 18
      </text>
      <text x={0} y={128} style={mono(18, C.amber)}>
        GPIO 2
      </text>
      {lane(14, 40, (s) => !downAt(D.presses, s), C.magenta)}
      {ticks}
      {lane(102, 40, (s) => demoRead(s).led, C.amber)}
      <text x={LW - 10} y={160} textAnchor="end" style={mono(15, C.muted)}>
        ticks = reads, 10 ms apart
      </text>
    </svg>
  );
};

/** one real press from the schedule, ±ms: finger down → next read → LED on */
const Zoom: React.FC<{ t: number }> = ({ t }) => {
  const [p0] = D.presses[D.zoomPress];
  const k = Math.ceil(((p0 - D.run) * 1000) / TICK_MS - 1e-9);
  const readMs = Math.round((D.run + (k * TICK_MS) / 1000 - p0) * 1000);
  const m0 = -12;
  const m1 = 62;
  const L = 130;
  const x = (ms: number) => L + ((ms - m0) / (m1 - m0)) * (LW - L - 20);
  const ten = after(t, D.ten);
  const fifty = after(t, D.fifty);
  const ticks: number[] = [];
  for (let ms = readMs - 20; ms <= m1; ms += TICK_MS) if (ms >= m0) ticks.push(ms);
  return (
    <svg width={LW} height={170} style={{ display: 'block', overflow: 'visible' }}>
      <text x={0} y={30} style={mono(18, C.pink)}>
        GPIO 18
      </text>
      <text x={0} y={128} style={mono(18, C.amber)}>
        GPIO 2
      </text>
      <path d={`M ${x(m0)} 14 L ${x(0)} 14 L ${x(0)} 54 L ${x(m1)} 54`} fill="none" stroke={C.magenta} strokeWidth={3} />
      <path d={`M ${x(m0)} 142 L ${x(readMs)} 142 L ${x(readMs)} 102 L ${x(m1)} 102`} fill="none" stroke={C.amber} strokeWidth={3} />
      {ticks.map((ms) => (
        <g key={ms}>
          <line x1={x(ms)} y1={62} x2={x(ms)} y2={80} stroke={C.cyan} strokeWidth={2} />
          <text x={x(ms)} y={96} textAnchor="middle" style={mono(13, C.muted)}>
            read
          </text>
        </g>
      ))}
      <g opacity={ten}>
        <line x1={x(0)} y1={8} x2={x(readMs)} y2={8} stroke={GREEN} strokeWidth={2.5} />
        <text x={x(readMs) + 10} y={14} style={mono(20, GREEN, { fontWeight: 700 })}>
          {readMs} ms · never more than {TICK_MS}
        </text>
      </g>
      <g opacity={fifty}>
        <line x1={x(0)} y1={160} x2={x(50)} y2={160} stroke={hexA(C.ink, 0.6)} strokeWidth={2} strokeDasharray="6 6" />
        <line x1={x(50)} y1={150} x2={x(50)} y2={168} stroke={C.ink} strokeWidth={2} />
        <text x={x(50) + 10} y={166} style={mono(18, C.ink)}>
          50 ms: feels instant
        </text>
      </g>
    </svg>
  );
};
