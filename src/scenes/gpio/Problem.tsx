/**
 * 1 · THE PROBLEM
 * "You've written a line of code, and on the breadboard there's an LED."
 * "But right after reset, every ESP32 pin is listening, not driving. So this
 *  call returns ESP_OK, and the LED stays dark."
 * "So how do you make a pin switch something on?"
 *
 * FACTS: pins are output-disabled at reset (datasheet); gpio_set_level only
 * writes out_w1ts/out_w1tc — it never enables the output — and returns ESP_OK.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { CaptionLine } from '../../components/CodeToHardware';
import { CodeLine } from '../../components/CodeLine';
import { GREEN, RED } from '../../components/Explainer';
import { Led } from '../../components/Gadgets';
import { Panel } from '../../components/Panel';
import { Kicker, Scene } from '../../components/Type';
import { C, FONT, hexA } from '../../theme/palette';
import { after, Pill } from './parts';
import { FPS, PROBLEM as P, sceneDur } from './timeline';

const CODE = ['#define LED GPIO_NUM_2', '', 'void app_main(void)', '{', '    gpio_set_level(LED, 1);', '}'];
const LIVE = 4;

export const Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const codeIn = after(t, P.codeIn, 0.6);
  const ledIn = after(t, P.ledIn, 0.6);
  const reset = after(t, P.reset, 0.4);
  const listen = after(t, P.listening, 0.4);
  const ok = after(t, P.espOk, 0.35);
  const dark = after(t, P.dark, 0.4);
  const boot = after(t, P.run - 0.25, 0.3);

  return (
    <Scene durationInFrames={Math.round(sceneDur('problem') * FPS)}>
      <AbsoluteFill>
        <div style={{ position: 'absolute', top: 70, width: '100%', display: 'grid', placeItems: 'center' }}>
          <Kicker delay={0.1} accent="amber">
            The problem
          </Kicker>
        </div>

        <div style={{ position: 'absolute', left: 160, top: 170, width: 1600, display: 'grid', gridTemplateColumns: '900px 1fr', gap: 40 }}>
          <div style={{ display: 'grid', gap: 26, alignContent: 'start', opacity: codeIn, transform: `translateY(${(1 - codeIn) * 24}px)` }}>
            <div style={{ height: 360 }}>
              <Panel label="main/main.c" accent={C.cyan} right="ESP-IDF">
                <pre style={{ margin: 0, fontFamily: FONT.mono, fontSize: 34, lineHeight: 1.5, color: '#cfd6ff' }}>
                  {CODE.map((l, i) => (
                    <div key={i} style={{ minHeight: '1.5em', position: 'relative' }}>
                      <CodeLine text={l} t={t} litAt={i === LIVE && t >= P.run ? P.run : null} live={i === LIVE && t >= P.run} />
                      {i === LIVE && ok > 0 && (
                        <span style={{ position: 'absolute', right: 20, top: 6, opacity: ok }}>
                          <Pill color={GREEN} size={22} solid>
                            → ESP_OK
                          </Pill>
                        </span>
                      )}
                    </div>
                  ))}
                </pre>
              </Panel>
            </div>
            <div style={{ height: 160 }}>
              <Panel label="idf.py monitor" accent={C.muted}>
                <div style={{ fontFamily: FONT.mono, fontSize: 22, display: 'grid', gap: 10, paddingTop: 4 }}>
                  <span style={{ opacity: boot, color: GREEN }}>I (…) main_task: Calling app_main()</span>
                  <span style={{ opacity: ok, color: hexA(C.ink, 0.7), fontStyle: 'italic' }}>…no error. Nothing to say.</span>
                </div>
              </Panel>
            </div>
          </div>

          <div style={{ height: 546, opacity: ledIn, transform: `translateY(${(1 - ledIn) * 24}px)` }}>
            <Panel label="breadboard · GPIO 2 → 220 Ω → LED" accent={C.amber}>
              <div style={{ display: 'grid', justifyItems: 'center', gap: 26, paddingTop: 24 }}>
                <div style={{ height: 44 }}>
                  {reset > 0 && (
                    <div style={{ opacity: reset }}>
                      <Pill color={C.muted}>after reset · every pin is an input</Pill>
                    </div>
                  )}
                </div>
                <Led brightness={0} size={200} />
                <div style={{ height: 50 }}>
                  {listen > 0 && (
                    <div style={{ opacity: listen }}>
                      <Pill color={C.cyan} size={26}>
                        GPIO 2 · listening, not driving
                      </Pill>
                    </div>
                  )}
                </div>
                <div style={{ opacity: dark, fontSize: 30, fontWeight: 600, color: RED, height: 40 }}>✗ the LED stays dark</div>
              </div>
            </Panel>
          </div>
        </div>

        <div style={{ position: 'absolute', top: 800, width: '100%', display: 'grid', placeItems: 'center' }}>
          <CaptionLine captions={[{ at: P.question, text: 'So how do you make a pin switch something on?' }]} t={t} size={46} />
        </div>
      </AbsoluteFill>
    </Scene>
  );
};
