/**
 * 3 · THE ANSWER — don't wait FOR 200 ms; wait UNTIL the next beat. The work fits inside
 * the 200 ms, so the beat stays put → UNTIL.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { CaptionLine } from '../../components/CodeToHardware';
import { Panel } from '../../components/Panel';
import { Scene } from '../../components/Type';
import { C, FONT, GRAD_TEXT } from '../../theme/palette';
import { after, clamp01, COL_A, COL_B, GREEN, TLBlock, TLBracket, TLDot, Timeline, WORK } from './parts';
import { ANSWER as S, BEAT, FPS, sceneDur, WORK as W_MS } from './timeline';

export const Answer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const hero = after(t, S.word - 0.2, 0.5);
  const fade = 1 - 0.94 * hero;
  const showB = t >= S.until - 0.2;
  const blocks: TLBlock[] = [];
  const brackets: TLBracket[] = [];
  const dots: TLDot[] = [];
  for (let k = 0; k < 5; k++) {
    const s = k * BEAT;
    const p = k === 0 ? after(t, S.until) : after(t, S.inside + 0.35 * k);
    blocks.push({ a: s, b: s + W_MS, color: WORK, p });
    if (k < 4) brackets.push({ a: s + W_MS, b: s + BEAT, color: C.magenta, label: `until ${s + BEAT}`, p: k === 0 ? after(t, S.beat) : p });
    dots.push({ s, color: GREEN, label: k === 0 ? 'switch' : '✓', p: k === 0 ? after(t, S.until) : p });
  }
  return (
    <Scene durationInFrames={Math.round(sceneDur('answer') * FPS)}>
      <AbsoluteFill>
        <div style={{ position: 'absolute', left: 160, top: 230, width: 1600, height: 420, opacity: fade }}>
          <Panel label={showB ? 'wait until the next beat' : "don't wait for 200 ms"} accent={showB ? GREEN : C.magenta} right="ms · the beat = dashed lines">
            <div style={{ marginTop: 50 }}>
              {!showB ? (
                <Timeline
                  W={1544}
                  s0={-20}
                  s1={1000}
                  beat={BEAT}
                  rowH={200}
                  rows={[
                    {
                      name: 'LED A',
                      color: COL_A,
                      h: 60,
                      blocks: [{ a: 0, b: W_MS, color: WORK }],
                      brackets: [{ a: W_MS, b: W_MS + BEAT, color: C.magenta, label: 'wait for 200 ms', strike: clamp01((t - S.dont) / 0.5) }],
                    },
                  ]}
                />
              ) : (
                <Timeline W={1544} s0={-20} s1={1000} beat={BEAT} beatP={0.5 + 0.5 * after(t, S.beat)} rowH={200} rows={[{ name: 'LED B', color: COL_B, h: 60, blocks, brackets, dots }]} />
              )}
            </div>
          </Panel>
        </div>
        {hero > 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', opacity: hero }}>
            <div style={{ display: 'flex', ...GRAD_TEXT, fontFamily: FONT.sans, fontWeight: 900, fontSize: 240, letterSpacing: '.16em' }}>
              {'UNTIL'.split('').map((ch, i) => {
                const p = clamp01((t - (S.word - 0.1) - i * 0.08) / 0.3);
                return (
                  <span key={i} style={{ opacity: p, transform: `translateY(${(1 - p) * 30}px)`, display: 'inline-block' }}>
                    {ch}
                  </span>
                );
              })}
            </div>
          </div>
        )}
        {hero <= 0 && (
          <div style={{ position: 'absolute', top: 944, width: '100%', display: 'grid', placeItems: 'center' }}>
            <CaptionLine captions={S.captions} t={t} size={32} />
          </div>
        )}
      </AbsoluteFill>
    </Scene>
  );
};
