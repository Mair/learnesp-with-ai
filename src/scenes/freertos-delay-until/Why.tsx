/**
 * 2 · WHY IT DRIFTS — one loop of LED A on a time line: switch, 30 ms of work, then
 * vTaskDelay's 200 ms counted from there → 230 ms; every loop 30 ms later.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { CaptionLine } from '../../components/CodeToHardware';
import { mono } from '../../components/Explainer';
import { Panel } from '../../components/Panel';
import { Kicker, Scene } from '../../components/Type';
import { C } from '../../theme/palette';
import { after, COL_A, RED, TLBlock, TLBracket, TLDot, Timeline, WORK } from './parts';
import { BEAT, FPS, sceneDur, WHY as S, WORK as W_MS } from './timeline';

export const Why: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const many = t >= S.adds;
  const loops = many ? 4 : 1;
  const blocks: TLBlock[] = [];
  const brackets: TLBracket[] = [];
  const dots: TLDot[] = [{ s: 0, color: COL_A, label: 'switch', p: after(t, S.switches) }];
  for (let k = 0; k < loops; k++) {
    const s = k * (BEAT + W_MS);
    const p = k === 0 ? 1 : after(t, S.adds + 0.5 * k);
    blocks.push({ a: s, b: s + W_MS, color: WORK, p: k === 0 ? after(t, S.works) : p });
    brackets.push({ a: s + W_MS, b: s + W_MS + BEAT, color: C.magenta, label: k === 0 ? 'vTaskDelay: 200 ms, from here' : '200', p: k === 0 ? after(t, S.delay) : p });
    const next = (k + 1) * (BEAT + W_MS);
    dots.push({ s: next, color: RED, label: `+${30 * (k + 1)} ms late`, p: k === 0 ? after(t, S.sum) : p });
  }
  return (
    <Scene durationInFrames={Math.round(sceneDur('why') * FPS)}>
      <AbsoluteFill>
        <div style={{ position: 'absolute', top: 40, width: '100%', display: 'grid', placeItems: 'center' }}>
          <Kicker delay={0.1} accent="magenta">
            Why it drifts
          </Kicker>
        </div>
        <div style={{ position: 'absolute', left: 160, top: 150, width: 1600, height: 400, opacity: after(t, S.follow - 0.3) }}>
          <Panel label="LED A · one loop at a time" accent={C.magenta} right="ms · the beat = dashed lines">
            <div style={{ marginTop: 50 }}>
              <Timeline W={1544} s0={-20} s1={1000} beat={BEAT} rowH={200} rows={[{ name: 'LED A', color: COL_A, blocks, brackets, dots, h: 60 }]} />
            </div>
          </Panel>
        </div>
        <div style={{ position: 'absolute', left: 160, top: 640, width: 1600, display: 'grid', justifyItems: 'center', gap: 20 }}>
          <div style={{ ...mono(80, C.ink, { fontWeight: 800 }), opacity: after(t, S.sum) }}>
            <span style={{ color: WORK }}>30</span> + <span style={{ color: C.magenta }}>200</span> = <span style={{ color: RED }}>230 ms</span>
          </div>
          <div style={{ ...mono(30, C.muted), opacity: after(t, S.not200) }}>per loop — not 200</div>
        </div>
        <div style={{ position: 'absolute', top: 944, width: '100%', display: 'grid', placeItems: 'center' }}>
          <CaptionLine captions={S.captions} t={t} size={32} />
        </div>
      </AbsoluteFill>
    </Scene>
  );
};
