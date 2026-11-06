/**
 * 2 · ANSWER — the workers go to core 1, core 0 is left to the LEDs; a pin drops on each
 * worker; one leans toward core 0 and bounces back (✗); hero PIN.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { CaptionLine } from '../../components/CodeToHardware';
import { ease, mono } from '../../components/Explainer';
import { Kicker, Scene } from '../../components/Type';
import { C, FONT, GRAD_TEXT, hexA } from '../../theme/palette';
import { after, BOARD_WALL_X, CoreBoard, GREEN, RED } from './parts';
import { ANSWER as A, FPS, sceneDur } from './timeline';

export const Answer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const hero = ease((t - (A.word - 0.1)) / 0.5);
  const bounce = t >= A.never - 0.2 && t < A.never + 1.4;
  return (
    <Scene durationInFrames={Math.round(sceneDur('answer') * FPS)}>
      <AbsoluteFill>
        <div style={{ position: 'absolute', top: 40, width: '100%', display: 'grid', placeItems: 'center' }}>
          <Kicker delay={0.1} accent="magenta">
            The answer
          </Kicker>
        </div>
        <div style={{ position: 'absolute', left: 160, top: 150, opacity: 1 - 0.92 * hero, transform: `scale(${1 - 0.04 * hero})` }}>
          <CoreBoard
            t={t}
            lit={[after(t, A.free), 0]}
            notes={[t >= A.free ? <span style={{ color: GREEN, opacity: after(t, A.free) }}>free for the LEDs ✓</span> : null, null]}
            chips={[
              { name: 'blink_fast', prio: 5, path: [[0.2, 'c0']] },
              { name: 'blink_slow', prio: 5, path: [[0.3, 'c1']] },
              { name: 'work_a', prio: 6, path: [[0.4, 'gap'], [A.free - 0.4, 'd0']], pinAt: A.pin, nudgeAt: A.never - 0.2 },
              { name: 'work_b', prio: 6, path: [[0.5, 'gap2'], [A.free - 0.2, 'd2']], pinAt: A.pin + 0.25 },
            ]}
          >
            {bounce && (
              <div style={{ position: 'absolute', left: BOARD_WALL_X - 30, top: 190, ...mono(64, RED, { fontWeight: 800 }), opacity: after(t, A.never + 0.25, 0.2) * (1 - after(t, A.never + 1.1, 0.3)), textShadow: `0 0 20px ${hexA(RED, 0.7)}` }}>✗</div>
            )}
            {t >= A.only && (
              <div style={{ position: 'absolute', left: 900, top: 650, width: 680, textAlign: 'center', ...mono(24, C.magenta, { fontWeight: 700 }), opacity: after(t, A.only) }}>
                pinned: only core 1 · never moves
              </div>
            )}
          </CoreBoard>
        </div>
        {hero > 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', alignContent: 'center', gap: 10 }}>
            <div style={{ ...GRAD_TEXT, fontFamily: FONT.sans, fontSize: 300, fontWeight: 900, letterSpacing: '.12em', opacity: hero, transform: `scale(${0.85 + 0.15 * hero})` }}>PIN</div>
            <div style={{ ...mono(34, C.ink), opacity: after(t, A.word + 0.4) }}>a task to a core</div>
          </div>
        )}
        <div style={{ position: 'absolute', top: 944, width: '100%', display: 'grid', placeItems: 'center' }}>
          <CaptionLine captions={A.captions} t={t} size={32} />
        </div>
      </AbsoluteFill>
    </Scene>
  );
};
