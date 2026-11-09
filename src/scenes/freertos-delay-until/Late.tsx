/**
 * 7 · RUNNING LATE — one loop's work takes 500 ms: the next beat is already past, so the
 * call doesn't wait; it runs again at once to catch up (switches at 500, 530) and is back
 * on the beat at 600. It returns pdFALSE when it didn't wait → ESP_LOGW.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { mono } from '../../components/Explainer';
import { C } from '../../theme/palette';
import { after, CodeViews, CV_VIEW_W as VW, COL_B, GREEN, Pill, RED, SerialLog, TLDot, Timeline, WORK } from './parts';
import { BEAT, FPS, LATE as S, lateEdges, sceneDur, UNTIL_CHECK_CODE, UNTIL_CODE } from './timeline';

const IF_LINE = UNTIL_CHECK_CODE.findIndex((l) => l.includes('pdFALSE'));
const LOG_LINE = UNTIL_CHECK_CODE.findIndex((l) => l.includes('ESP_LOGW'));

const LaneView: React.FC<{ t: number }> = ({ t }) => {
  const now = t < S.job ? 0 : t < S.again ? 500 : t < S.back ? 500 + Math.min(60, (t - S.again) * 60) : 560 + Math.min(840, (t - S.back) * 700);
  const dots: TLDot[] = [
    { s: 200, color: RED, label: 'past', p: after(t, S.past) },
    { s: 400, color: RED, label: 'past', p: after(t, S.past + 0.3) },
    { s: 600, color: GREEN, label: '✓', p: after(t, S.six) },
    { s: 800, color: GREEN, label: '✓', p: after(t, S.six + 0.3) },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 20 }}>
      <Timeline
        W={VW}
        s0={-20}
        s1={1100}
        now={now}
        beat={BEAT}
        labelW={110}
        rowH={120}
        rows={[
          { name: 'LED B', color: COL_B, edges: lateEdges(2000) },
          {
            name: 'work',
            color: WORK,
            blocks: [
              { a: 0, b: 500, color: WORK, label: 'work 500 ms' },
              { a: 500, b: 530, color: WORK },
              { a: 530, b: 560, color: WORK },
              { a: 600, b: 630, color: WORK },
              { a: 800, b: 830, color: WORK },
              { a: 1000, b: 1030, color: WORK },
            ],
            dots,
          },
        ]}
      />
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', minHeight: 50 }}>
        <div style={{ opacity: after(t, S.noWait) }}>
          <Pill color={RED} size={20}>
            no wait
          </Pill>
        </div>
        <div style={{ opacity: after(t, S.catchUp) }}>
          <Pill color={C.amber} size={20}>
            catches up: 500, 530
          </Pill>
        </div>
        <div style={{ opacity: after(t, S.six) }}>
          <Pill color={GREEN} size={20}>
            back on the beat at 600
          </Pill>
        </div>
      </div>
    </div>
  );
};

const CheckView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 26 }}>
    <div style={{ display: 'flex', gap: 20 }}>
      <Pill color={GREEN} size={22}>
        pdTRUE = it waited
      </Pill>
      <Pill color={RED} size={22}>
        pdFALSE = it was late
      </Pill>
    </div>
    <div style={{ opacity: after(t, S.logw - 0.3) }}>
      <SerialLog
        t={t}
        size={22}
        label="recorded in QEMU"
        lines={[
          { at: S.logw + 0.2, text: 'W (3876) beat: missed a beat', color: C.amber },
          { at: S.logw + 0.6, text: 'W (3906) beat: missed a beat', color: C.amber },
        ]}
      />
    </div>
    <div style={{ opacity: after(t, S.warn), ...mono(20, C.muted) }}>ESP_LOGW = the warning version of ESP_LOGI · W and yellow</div>
  </div>
);

export const Late: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const V = S.views;
  const check = t >= S.falseW;
  return (
    <CodeViews
      t={t}
      frames={Math.round(sceneDur('late') * FPS)}
      kicker="Running late"
      accent="magenta"
      file="main/main.c · until_task"
      code={check ? UNTIL_CHECK_CODE : UNTIL_CODE}
      codeSize={18}
      marks={
        check
          ? [
              { line: IF_LINE, at: S.falseW, token: '== pdFALSE', label: "false = it didn't wait", strong: true },
              { line: LOG_LINE, at: S.logw, token: 'ESP_LOGW', label: 'a warning' },
            ]
          : []
      }
      views={[
        { at: V.lane, component: LaneView, label: 'one slow loop', accent: RED, right: () => 'ms · worked out from the code' },
        { at: V.check, component: CheckView, label: 'the return value', accent: C.amber, lines: [IF_LINE, LOG_LINE] },
      ]}
      captions={S.captions}
    />
  );
};
