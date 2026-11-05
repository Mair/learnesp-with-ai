/**
 * 8 · THE TRAP — read the clock inside the loop and every beat starts from now, after the
 * work: the same as vTaskDelay, so LED B drifts too. Fix: once, before the loop.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { C, FONT, hexA } from '../../theme/palette';
import { after, CodeViews, CV_VIEW_W as VW, COL_B, GREEN, Pill, RED, Timeline, Verdict } from './parts';
import { BEAT, delayEdges, FPS, sceneDur, TRAP as S, untilEdges, UNTIL_CODE, UNTIL_TRAP_CODE } from './timeline';

const TrapView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', justifyItems: 'center', gap: 24, fontFamily: FONT.sans }}>
    <div style={{ fontSize: 90, fontWeight: 900, color: RED, textShadow: `0 0 40px ${hexA(RED, 0.5)}` }}>the trap</div>
    <div style={{ fontSize: 36, fontWeight: 600, color: C.ink, opacity: after(t, S.mistake) }}>an easy mistake</div>
  </div>
);

const MovedView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 24 }}>
    <Timeline W={VW} s0={0} s1={1600} now={t < S.every ? 0 : (t - S.every) * 500} beat={BEAT} labelW={110} rows={[{ name: 'LED B', color: COL_B, edges: delayEdges(3000) }]} />
    <div style={{ opacity: after(t, S.after) }}>
      <Pill color={RED} size={22}>
        each beat counted from after the work: 230 ms
      </Pill>
    </div>
    <div style={{ opacity: after(t, S.drifts) }}>
      <Verdict ok={false} p={after(t, S.drifts)} size={26}>
        the same as vTaskDelay · LED B drifts too
      </Verdict>
    </div>
  </div>
);

const FixView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 24 }}>
    <Timeline W={VW} s0={0} s1={1600} now={(t - S.views.fix) * 600} beat={BEAT} labelW={110} rows={[{ name: 'LED B', color: COL_B, edges: untilEdges(3000) }]} />
    <div style={{ opacity: after(t, S.once) }}>
      <Verdict ok p={after(t, S.once)} size={26}>
        once, before the loop · back on the beat
      </Verdict>
    </div>
  </div>
);

export const Trap: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const V = S.views;
  const inside = t >= S.inside && t < S.fix;
  const code = inside ? UNTIL_TRAP_CODE : UNTIL_CODE;
  const line = code.findIndex((l) => l.includes('xTaskGetTickCount'));
  return (
    <CodeViews
      t={t}
      frames={Math.round(sceneDur('trap') * FPS)}
      kicker="The trap · the clock read inside the loop"
      accent="magenta"
      file="main/main.c · until_task"
      code={code}
      codeSize={19}
      marks={
        t >= S.fix
          ? [{ line, at: S.fix, token: 'TickType_t last = xTaskGetTickCount();', label: 'back before the loop ✓', strong: true }]
          : inside
            ? [{ line, at: S.inside, token: 'TickType_t last = xTaskGetTickCount();', label: 'inside the loop, after the work ✗' }]
            : []
      }
      views={[
        { at: V.trap, component: TrapView, label: 'the trap', accent: RED },
        { at: V.moved, component: MovedView, label: 'LED B, with last inside the loop', accent: RED, right: () => 'ms', lines: [line] },
        { at: V.fix, component: FixView, label: 'the fix', accent: GREEN, right: () => 'ms', lines: [line] },
      ]}
      captions={S.captions}
    />
  );
};
