/**
 * 1 · THE PROBLEM
 * "Last time, the ESP32 drove an LED. Now let's go the other way, and let it listen to a button."
 * "Wire the button from a pin to ground. Press it, and the pin is tied to zero volts. The program reads zero."
 * "But let go, and the pin is connected to nothing at all. It floats. …"
 * "So how do you give a pin a level when nothing is driving it?"
 *
 * The pin diagram has no pulls yet. While pressed the pad is 0 V; released,
 * it wanders through the undefined band (floatV) and the reads flip.
 * FACTS: VIH/VIL, IIH/IIL ≤ 50 nA (datasheet Table 5-3); "floating" = physics.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { CaptionLine } from '../../components/CodeToHardware';
import { GREEN, RED } from '../../components/Explainer';
import { Led } from '../../components/Gadgets';
import { Panel } from '../../components/Panel';
import { Kicker, Scene } from '../../components/Type';
import { C } from '../../theme/palette';
import { after, InputPin, pinState, Read, VTrace } from './parts';
import { FPS, PROBLEM as P, readAt, sceneDur } from './timeline';

const WIN = 7;

export function problemV(s: number) {
  return pinState({ wpu: 0, wpd: 0, press: s >= P.press && s < P.letGo ? 1 : 0, s }).v;
}

export const Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const ledIn = after(t, P.ledIn, 0.6) * (1 - after(t, P.button - 0.6, 0.5));
  const diagIn = after(t, P.button - 0.2, 0.6);
  const traceIn = after(t, P.press - 0.2, 0.5);
  const press = t >= P.press && t < P.letGo ? 1 : 0;
  const st = pinState({ wpu: 0, wpd: 0, press, s: t });
  const reads: Read[] = [];
  for (let s = P.press; s <= t; s += P.readEvery) reads.push({ s, val: readAt(problemV(s), Math.round(s * 10)) });
  const last = reads[reads.length - 1];
  const s0 = Math.max(P.press, t - WIN);

  return (
    <Scene durationInFrames={Math.round(sceneDur('problem') * FPS)}>
      <AbsoluteFill>
        <div style={{ position: 'absolute', top: 40, width: '100%', display: 'grid', placeItems: 'center' }}>
          <Kicker delay={0.1} accent="amber">
            The problem
          </Kicker>
        </div>

        {/* last time: the LED */}
        {ledIn > 0.01 && (
          <div style={{ position: 'absolute', top: 260, width: '100%', display: 'grid', justifyItems: 'center', gap: 20, opacity: ledIn }}>
            <Led brightness={1} size={220} />
            <div style={{ fontSize: 34, color: C.muted }}>
              last time: the ESP32 <b style={{ color: C.amber }}>drives</b> a pin
            </div>
          </div>
        )}

        <div style={{ position: 'absolute', left: 160, top: 112, width: 1600, display: 'grid', gap: 18, opacity: diagIn }}>
          <div style={{ height: 470 }}>
            <Panel label="now: the ESP32 listens · GPIO 18 → button → GND" accent={C.pink} right="no pull resistor yet">
              <div style={{ display: 'grid', placeItems: 'center' }}>
                <InputPin ie={1} wpu={0} wpd={0} showUp={0} showDown={0} press={press} v={st.v} floating={st.floating} reading={last ? last.val : null} width={1040} />
              </div>
            </Panel>
          </div>
          <div style={{ height: 300, opacity: traceIn }}>
            <Panel
              label="the pin's voltage · and what the program reads"
              accent={C.magenta}
              right={
                t >= P.floats ? (
                  <span style={{ color: RED }}>released → floating ✗</span>
                ) : t >= P.readsZero ? (
                  <span style={{ color: GREEN }}>pressed → 0 ✓</span>
                ) : undefined
              }
            >
              <VTrace W={1544} H={230} s0={s0} s1={s0 + WIN} vAt={problemV} upTo={t} bands={after(t, P.floats, 0.6)} reads={reads} />
            </Panel>
          </div>
        </div>

        <div style={{ position: 'absolute', top: 944, width: '100%', display: 'grid', placeItems: 'center' }}>
          <CaptionLine captions={[{ at: P.question, text: 'So how do you give a pin a level when nothing is driving it?' }]} t={t} size={40} />
        </div>
      </AbsoluteFill>
    </Scene>
  );
};
