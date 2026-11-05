/**
 * 3 · THREE STATES — Blocked (waiting, in vTaskDelay; doesn't want the CPU) → Ready
 * (wants it, waits for a turn) → Running (has it). Two cores → two running at once.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { CaptionLine } from '../../components/CodeToHardware';
import { mono } from '../../components/Explainer';
import { Panel } from '../../components/Panel';
import { Kicker, Scene } from '../../components/Type';
import { C, hexA } from '../../theme/palette';
import { after, Board, clamp01, inOutLocal } from './parts';
import { FPS, sceneDur, STATES as S } from './timeline';

export const States: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const split = inOutLocal((t - S.two) / 0.8);
  // the delay: 20 ticks, counted from "blocked" to "over"
  const ticks = t < S.delay + 0.6 ? 0 : Math.min(20, Math.floor(20 * clamp01((t - S.delay - 0.6) / (S.over - S.delay - 0.6))));
  return (
    <Scene durationInFrames={Math.round(sceneDur('states') * FPS)}>
      <AbsoluteFill>
        <div style={{ position: 'absolute', top: 40, width: '100%', display: 'grid', placeItems: 'center' }}>
          <Kicker delay={0.1} accent="magenta">
            Three states
          </Kicker>
        </div>
        <div style={{ position: 'absolute', left: 160, top: 120, width: 1600, height: 790 }}>
          <Panel label="every task is in one of three states" accent={C.magenta} right="freertos_idf.rst · Execution">
            <div style={{ marginTop: 40 }}>
              <Board
                t={t}
                split={split}
                zones={{ run: after(t, S.three - 0.2), ready: after(t, S.three), blocked: after(t, S.three + 0.2) }}
                zoneNotes={{
                  blocked: t >= S.noCpu ? "waiting · doesn't want the CPU" : t >= S.blocked ? 'waiting' : undefined,
                  ready: t >= S.turn ? 'wants the CPU · waits for a turn' : t >= S.readyMeans ? 'wants the CPU' : undefined,
                  run: t >= S.now ? 'using the CPU now' : undefined,
                }}
                chips={[
                  {
                    name: 'blink_fast',
                    prio: 5,
                    path: [
                      [S.three + 0.5, 'run'],
                      [S.delay + 0.3, 'blocked1'],
                      [S.over, 'ready1'],
                      [S.now, 'run'],
                      [S.two, 'core0'],
                    ],
                    note: (tt) => (tt >= S.delay + 0.3 && tt < S.over + 0.6 ? `vTaskDelay · tick ${String(ticks).padStart(2, '\u2007')} / 20` : undefined),
                  },
                  { name: 'blink_slow', prio: 5, path: [[S.same - 0.6, 'core1']] },
                ]}
              >
                {t >= S.delay && t < S.over + 1 && (
                  <div style={{ position: 'absolute', left: 1000, top: 470, ...mono(22, C.magenta, { fontWeight: 700 }), opacity: after(t, S.delay) }}>
                    1 tick = 10 ms · 200 ms = 20 ticks
                  </div>
                )}
                {t >= S.two && (
                  <div style={{ position: 'absolute', left: 1300, top: 62, width: 240, ...mono(22, '#7dffb0', { fontWeight: 700 }), opacity: after(t, S.same), textShadow: `0 0 18px ${hexA('#7dffb0', 0.5)}` }}>
                    two at the same time
                  </div>
                )}
              </Board>
            </div>
          </Panel>
        </div>
        <div style={{ position: 'absolute', top: 944, width: '100%', display: 'grid', placeItems: 'center' }}>
          <CaptionLine captions={S.captions} t={t} size={32} />
        </div>
      </AbsoluteFill>
    </Scene>
  );
};
