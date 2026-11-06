/**
 * 2 · THE HIGH WATER MARK — the stack fills as calls run and empties as they return; the
 * highest level leaves a mark (a flood line). Above it: never used — that's the number
 * you can ask for. The level is an illustration; its two peaks are the measured ones
 * (492 and 924 of 2048 bytes) but no numbers are shown here.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { mono } from '../../components/Explainer';
import { C, GRAD_TEXT } from '../../theme/palette';
import { after, GREEN, Shell, StackColumn, rise } from './parts';
import { FPS, MARK as M, markLevel, sceneDur } from './timeline';

const H = 620;

export const Mark: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { level, high } = markLevel(t);
  const col = after(t, M.col, 0.6);
  const markP = after(t, M.mark);
  const hero = after(t, M.hero, 0.6);
  const free = after(t, M.never);
  // the call that's running now
  const live = M.calls.find((c) => t >= c.t && t < c.t + c.d);
  const names = ['gpio_set_level', 'vTaskDelay', 'ESP_LOGI'];
  return (
    <Shell frames={Math.round(sceneDur('mark') * FPS)} kicker="The high water mark" captions={M.captions} t={t}>
      <div style={{ position: 'absolute', left: 840, top: 200, ...rise(col) }}>
        <StackColumn
          w={240}
          h={H}
          level={level}
          high={t >= M.mark ? high : null}
          highP={markP}
          freeP={free}
          title="blink_task's stack"
          notes={[
            { frac: 1, text: 'end of the stack', color: C.muted, p: col, side: 'left' },{ frac: 1 - (1 - high) / 2, text: <>never used<br /><span style={{ color: C.ink, fontWeight: 500 }}>→ the number you get</span></>, color: GREEN, p: after(t, M.ask, 0.5) * free, dy: -20 }]}
        />
      </div>
      {/* the calls, lit while they run */}
      <div style={{ position: 'absolute', left: 300, top: 420, display: 'grid', gap: 26, opacity: after(t, M.calls[0].t - 0.4) }}>
        {names.map((n) => {
          const on = live?.name === n;
          return (
            <div key={n} style={{ ...mono(32, on ? C.cyan : C.muted, { fontWeight: on ? 800 : 500 }), textShadow: on ? `0 0 20px ${C.cyan}` : undefined, textAlign: 'right', width: 420 }}>
              {n}()
            </div>
          );
        })}
        <div style={{ ...mono(20, C.muted), textAlign: 'right', width: 420, opacity: after(t, M.back) }}>takes some · gives it back</div>
      </div>
      {/* the flood line and its name */}
      <div style={{ position: 'absolute', left: 1150, top: 200 + H * (1 - high) - 30, opacity: markP * (1 - free * 0.0) }}>
        <div style={{ ...mono(26, C.amber, { fontWeight: 700 }), opacity: 1 - hero }}>← the highest it ever got</div>
      </div>
      <div style={{ position: 'absolute', left: 1150, top: 200 + H * (1 - high) - 60, ...rise(hero) }}>
        <div style={{ ...GRAD_TEXT, fontSize: 84, fontWeight: 800, lineHeight: 1, whiteSpace: 'nowrap' }}>high water mark</div>
      </div>
    </Shell>
  );
};
