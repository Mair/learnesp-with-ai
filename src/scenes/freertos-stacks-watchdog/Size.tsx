/**
 * 5 · SIZE IT — 2048 − 1124 = 924 used. Espressif: give back most of the unused part,
 * keep a safety margin. 1536, for example: 612 never used (measured, v5). 512 bytes back.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { mono } from '../../components/Explainer';
import { Panel } from '../../components/Panel';
import { C } from '../../theme/palette';
import { after, GREEN, LogPanel, Shell, StackColumn, rise } from './parts';
import { FPS, FREE, LOG_1536, sceneDur, SIZE as S, SMALLER, SMALLER_FREE, STACK, USED } from './timeline';

const PX = 0.26; // px per byte

export const Size: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const num = (v: React.ReactNode, at: number, color: string = C.ink) => <span style={{ color, opacity: after(t, at), fontWeight: 800 }}>{v}</span>;
  return (
    <Shell frames={Math.round(sceneDur('size') * FPS)} kicker="Pick the size" captions={S.captions} t={t}>
      <div style={{ position: 'absolute', left: 130, top: 170, width: 1000, display: 'grid', gap: 40 }}>
        <div style={{ ...mono(58, C.ink), whiteSpace: 'nowrap' }}>
          {num(STACK, S.chain + 0.6)} {num('−', S.minus, C.muted)} {num(FREE, S.minus + 0.3, GREEN)} {num('=', S.used - 0.2, C.muted)} {num(USED, S.used, C.amber)}
          <span style={{ ...mono(28, C.amber, { fontWeight: 700 }), marginLeft: 18, opacity: after(t, S.used + 0.3) }}>bytes used, at most</span>
        </div>
        <div style={rise(after(t, S.advice))}>
          <Panel label="Espressif · ESP-IDF RAM usage guide" accent={GREEN}>
            <div style={{ fontSize: 30, lineHeight: 1.45, color: C.ink, padding: '4px 4px 6px' }}>
              “Often, it is possible to subtract almost the entire value returned here from the total stack size of a task, but allow some{' '}
              <span style={{ color: GREEN, fontWeight: 700, opacity: 0.4 + 0.6 * after(t, S.margin) }}>safety margin</span>.”
            </div>
          </Panel>
        </div>
        <div style={rise(after(t, S.n1536))}>
          <div style={{ ...mono(25, '#cfd6ff'), marginBottom: 14, whiteSpace: 'nowrap' }}>
            xTaskCreate(blink_task, "blink_fast", <span style={{ color: C.amber, fontWeight: 800 }}>{SMALLER}</span>, &fast, 5, NULL);
          </div>
          <div style={{ height: 150 }}><LogPanel t={t} rows={2} size={22} label="recorded in QEMU · stack 1536" lines={LOG_1536.slice(0, 2).map((l, i) => ({ at: S.n1536 + 0.4 + i * 0.5, text: l.text, color: i === 1 ? GREEN : '#cfd6ff' }))} /></div>
        </div>
      </div>
      {/* the two columns, to scale, on one floor */}
      <div style={{ position: 'absolute', left: 1240, top: 820 - STACK * PX, ...rise(after(t, S.chain, 0.5)) }}>
        <StackColumn w={170} h={STACK * PX} level={USED / STACK} high={USED / STACK} freeP={after(t, S.minus + 0.3)} size="2048" notes={[]} />
      </div>
      <div style={{ position: 'absolute', left: 1240 + 300, top: 820 - SMALLER * PX, ...rise(after(t, S.n1536, 0.5)) }}>
        <StackColumn
          w={170}
          h={SMALLER * PX}
          level={USED / SMALLER}
          high={USED / SMALLER}
          freeP={after(t, S.spare)}
          size="1536"
          notes={[{ frac: 1 - (1 - USED / SMALLER) / 2, text: <>{SMALLER_FREE}<br />spare</>, color: GREEN, p: after(t, S.spare), dy: -20 }]}
        />
      </div>
      <div style={{ position: 'absolute', left: 1205, top: 820 - STACK * PX - 70, ...mono(26, C.amber, { fontWeight: 700 }), opacity: after(t, S.used) }}>924 used in both</div>
      <div style={{ position: 'absolute', left: 1500, top: 820 - STACK * PX + 10, width: 260, textAlign: 'center', ...mono(28, GREEN, { fontWeight: 800 }), ...rise(after(t, S.back)) }}>
        512 bytes back
        <div style={mono(20, C.muted, { fontWeight: 400 })}>for everything else</div>
      </div>
    </Shell>
  );
};
