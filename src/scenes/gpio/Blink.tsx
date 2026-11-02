/**
 * 7 · BLINK — the whole app_main, running in real time.
 * "Put it together and you get a blinking LED. In app_main, reset the pin and
 *  make it an output. Then, forever: high, wait half a second, low, wait half a second."
 * "On, off, about once a second, for as long as it has power."
 *
 * The live line follows the program: gpio_reset_pin / gpio_set_direction on
 * their words, then from `run` the while loop executes for real — the LED,
 * the scope and the highlighted line all come from `blinkHigh()` in the
 * timeline (the soundtrack's clicks use the same function).
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { CaptionLine, Scope } from '../../components/CodeToHardware';
import { CodeLine } from '../../components/CodeLine';
import { Led } from '../../components/Gadgets';
import { Panel } from '../../components/Panel';
import { Kicker, Scene } from '../../components/Type';
import { C, FONT, hexA } from '../../theme/palette';
import { BLINK as B, blinkHigh, DELAY_MS, FPS, sceneDur } from './timeline';

/** each gpio_set_level line shows as live this long before the delay takes over */
const WRITE_FLASH = 0.12;

function liveLine(t: number): { idx: number; since: number } {
  const I = B.idx;
  if (t < B.resetLine) return { idx: -1, since: 0 };
  if (t < B.directionLine) return { idx: I.reset, since: B.resetLine };
  if (t < B.run) return { idx: I.direction, since: B.directionLine };
  const per = (2 * DELAY_MS) / 1000;
  const s = t - B.run;
  const k = Math.floor(s / per);
  const ph = s - k * per;
  const half = DELAY_MS / 1000;
  const base = B.run + k * per;
  if (ph < WRITE_FLASH) return { idx: I.high, since: base };
  if (ph < half) return { idx: I.delay1, since: base + WRITE_FLASH };
  if (ph < half + WRITE_FLASH) return { idx: I.low, since: base + half };
  return { idx: I.delay2, since: base + half + WRITE_FLASH };
}

export const Blink: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const running = t >= B.run;
  const high = blinkHigh(t - B.run);
  const live = liveLine(t);
  const hz = 1000 / (2 * DELAY_MS);

  return (
    <Scene durationInFrames={Math.round(sceneDur('blink') * FPS)}>
      <div style={{ position: 'absolute', top: 40, width: '100%', display: 'grid', placeItems: 'center' }}>
        <Kicker delay={0.1} accent="amber">
          Blink · real time
        </Kicker>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 160,
          top: 100,
          width: 1600,
          display: 'grid',
          gridTemplateColumns: '1fr 520px',
          gridTemplateRows: '610px 170px',
          gap: 26,
        }}
      >
        <Panel label="main/main.c" accent={C.cyan} right="ESP-IDF">
          <pre style={{ margin: 0, fontFamily: FONT.mono, fontSize: 22, lineHeight: 1.36, color: '#cfd6ff' }}>
            {B.preamble.map((l, i) => (
              <div key={`p${i}`} style={{ padding: '0 10px', color: C.muted, opacity: 0.7, minHeight: '1.5em' }}>
                {l}
              </div>
            ))}
            {B.lines.map((l, i) => (
              <div key={i} style={{ minHeight: '1.5em' }}>
                <CodeLine text={l} t={t} litAt={i === live.idx ? live.since : null} live={i === live.idx} />
              </div>
            ))}
          </pre>
        </Panel>
        <Panel label="GPIO 2" accent={C.amber} right={running ? 'real time' : undefined}>
          <div style={{ display: 'grid', placeItems: 'center', gap: 18, paddingTop: 30 }}>
            <Led brightness={high ? 1 : 0} size={240} />
            <div style={{ fontFamily: FONT.mono, fontSize: 44, fontWeight: 700, color: high ? C.amber : C.muted, textShadow: high ? `0 0 18px ${hexA(C.amber, 0.6)}` : 'none' }}>
              {running ? (high ? 'HIGH · 3.3 V' : 'LOW · 0 V') : '—'}
            </div>
            <div style={{ fontSize: 24, color: C.muted }}>{running ? (high ? 'on for 500 ms' : 'off for 500 ms') : 'setting up…'}</div>
          </div>
        </Panel>
        <div style={{ gridColumn: '1 / -1' }}>
          <Panel
            label="scope · GPIO 2"
            accent={C.magenta}
            right={t >= B.second ? `HIGH 500 ms + LOW 500 ms = 1 s · ${hz} blink per second` : 'real time'}
          >
            <Scope duty={running ? 0.5 : 0} phase={running ? (t - B.run) * hz : 0} cycles={4.5} nowDot={running ? 1 : 0} />
          </Panel>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 944, width: '100%', display: 'grid', placeItems: 'center' }}>
        <CaptionLine captions={B.captions} t={t} size={32} />
      </div>
    </Scene>
  );
};
