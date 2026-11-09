/**
 * 8 · THE TRAP — take the rest out of the worker: it never waits. At 4 the LEDs still
 * blink, but the workers fill both cores and the idle tasks (0) never run → after 5 s
 * the task watchdog prints IDLE0 / IDLE1, again every 5 s. Fix: wait somewhere.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { mono } from '../../components/Explainer';
import { C, FONT, hexA } from '../../theme/palette';
import { after, clamp01, CodeViews, CV_VIEW_W as VW, GREEN, Pill, RED, SerialLog, SimLanes, TaskChip, Verdict, WORK } from './parts';
import { simulate } from './sim';
import { FPS, sceneDur, TRAP as S, WDT_LOG, WORK_CODE, WORK_REST_LINE } from './timeline';

export const simNoRest = () => simulate('no-rest', { until: 6000, workPrio: () => 4, rest: false });

const TrapView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', justifyItems: 'center', gap: 30, fontFamily: FONT.sans }}>
    <div style={{ fontSize: 90, fontWeight: 900, color: RED, textShadow: `0 0 40px ${hexA(RED, 0.5)}` }}>the trap</div>
    <div style={{ fontSize: 40, fontWeight: 600, color: C.ink, opacity: after(t, S.mistake) }}>the mistake everyone makes</div>
  </div>
);

const CutView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 30 }}>
    <div style={{ ...mono(24, C.muted, { textDecoration: 'line-through' }), padding: '14px 18px', borderRadius: 12, border: `1px solid ${hexA(RED, 0.5)}`, background: hexA(RED, 0.07), opacity: after(t, S.cut) }}>
      vTaskDelay(pdMS_TO_TICKS(100));
    </div>
    <div style={{ ...mono(26, '#fff', { fontWeight: 700 }), opacity: after(t, S.cut + 0.4) }}>busy 300 ms → busy 300 ms → busy 300 ms → …</div>
    <div style={{ opacity: after(t, S.never) }}>
      <Verdict ok={false} p={after(t, S.never)} size={28}>
        it never waits
      </Verdict>
    </div>
  </div>
);

const LedsView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 26 }}>
    <SimLanes sim={simNoRest()} W={VW} s0={0} s1={2400} now={(t - S.views.leds) * 1000} show={['fast', 'slow']} />
    <div style={{ display: 'flex', gap: 14, opacity: after(t, S.higher) }}>
      <TaskChip name="blink_fast" prio={5} w={200} h={64} />
      <span style={mono(40, GREEN, { fontWeight: 800 })}>&gt;</span>
      <TaskChip name="work_a" prio={4} w={200} h={64} />
    </div>
    <div style={{ opacity: after(t, S.still) }}>
      <Pill color={GREEN} size={22}>
        the LEDs still blink ✓
      </Pill>
    </div>
  </div>
);

const CoresView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 26 }}>
    <SimLanes sim={simNoRest()} W={VW} s0={400} s1={2800} now={700 + (t - S.views.cores) * 1400} show={['core0', 'core1']} />
    <div style={{ opacity: after(t, S.fill) }}>
      <Pill color={WORK} size={22}>
        both cores full · no gaps left
      </Pill>
    </div>
    <div style={mono(16, C.muted)}>LED slivers drawn wider than real</div>
  </div>
);

/** seconds since the idle tasks last ran — sped up so 5 s fits the line */
const idleClock = (t: number) => {
  if (t < S.neverRuns) return 0;
  return 5 * clamp01((t - S.neverRuns) / (S.views.log - 0.4 - S.neverRuns));
};

const IdleView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', justifyItems: 'center', gap: 34 }}>
    <div style={{ position: 'relative', width: 600, padding: '40px 20px 24px', borderRadius: 18, border: `2px solid ${hexA(C.cyan, 0.5)}`, background: hexA(C.cyan, 0.05), display: 'flex', gap: 30, justifyContent: 'center' }}>
      <div style={{ position: 'absolute', top: 10, left: 18, ...mono(17, C.cyan, { fontWeight: 700, letterSpacing: '.12em' }) }}>READY · waiting for a core</div>
      <TaskChip name="IDLE0" prio={0} dim={after(t, S.only) * 0.8} />
      <TaskChip name="IDLE1" prio={0} dim={after(t, S.only) * 0.8} />
    </div>
    <div style={{ ...mono(24, C.ink), opacity: after(t, S.zero) }}>priority 0 · runs only when no one else wants the core</div>
    <div style={{ opacity: after(t, S.neverRuns) }}>
      <div style={{ ...mono(22, C.muted) }}>idle hasn't run for</div>
      <div style={{ ...mono(64, RED, { fontWeight: 800 }), fontVariantNumeric: 'tabular-nums', textAlign: 'center' }}>{idleClock(t).toFixed(1)} s</div>
    </div>
  </div>
);

const LogView: React.FC<{ t: number }> = ({ t }) => {
  const again = WDT_LOG.slice(0, 3).map((l) => l.replace('5310', '10310'));
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'start', gap: 16, paddingTop: 10 }}>
      <SerialLog
        t={t}
        size={16}
        label="illustration · what a board prints"
        lines={[
          ...WDT_LOG.map((l, i) => ({ at: S.prints + i * 0.12, text: l, color: i === 1 || i === 2 ? '#ff8aa0' : RED })),
          { at: S.prints + 1.2, text: 'Backtrace: …', color: C.muted },
          ...again.map((l, i) => ({ at: S.again + i * 0.12, text: l, color: RED })),
          { at: S.again + 0.5, text: '…', color: C.muted },
        ]}
      />
      {t >= S.meet && (
        <div style={{ opacity: after(t, S.meet) }}>
          <Pill color={C.amber} size={22}>
            IDLE0 / IDLE1 here = some task never waits
          </Pill>
        </div>
      )}
      <div style={{ ...mono(18, C.muted), opacity: after(t, S.prints) }}>every 5 s · the program keeps running · nothing resets</div>
    </div>
  );
};

const FixView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 30 }}>
    <div style={{ ...mono(26, '#fff', { fontWeight: 700 }), padding: '14px 18px', borderRadius: 12, border: `1px solid ${hexA(GREEN, 0.8)}`, background: hexA(GREEN, 0.1), opacity: after(t, S.put) }}>
      vTaskDelay(pdMS_TO_TICKS(100));
    </div>
    <div style={{ opacity: after(t, S.fix) }}>
      <Pill color={GREEN} size={24}>
        every task loop waits somewhere
      </Pill>
    </div>
    <div style={{ opacity: after(t, S.gone) }}>
      <Verdict ok p={after(t, S.gone)} size={28}>
        idle runs again → no more task_wdt errors
      </Verdict>
    </div>
    <div style={{ ...mono(22, C.muted), opacity: after(t, S.more) }}>more: the stacks & watchdog video</div>
  </div>
);

export const Trap: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const V = S.views;
  const removed = t >= S.cut && t < S.put;
  const marks =
    t >= S.put
      ? [{ line: WORK_REST_LINE, at: S.put, token: 'vTaskDelay(pdMS_TO_TICKS(100))', label: 'back ✓', strong: true }]
      : t >= S.cut
        ? [{ line: WORK_REST_LINE, at: S.cut, token: 'vTaskDelay(pdMS_TO_TICKS(100))', label: 'removed' }]
        : [];
  return (
    <CodeViews
      t={t}
      frames={Math.round(sceneDur('trap') * FPS)}
      kicker="The trap · a task that never waits"
      accent="magenta"
      file="main/main.c · work_task"
      code={WORK_CODE}
      codeSize={20}
      marks={marks}
      lineStyle={(i) => (i === WORK_REST_LINE && removed ? { textDecoration: 'line-through', textDecorationColor: RED, opacity: 0.5 } : undefined)}
      views={[
        { at: V.trap, component: TrapView, label: 'the trap', accent: RED },
        { at: V.cut, component: CutView, label: 'take the rest out', accent: RED, lines: [WORK_REST_LINE] },
        { at: V.leds, component: LedsView, label: 'workers at 4 · the LEDs', accent: GREEN, right: () => 'real time' },
        { at: V.cores, component: CoresView, label: 'the two cores', accent: WORK, right: () => 'worked out from the rules' },
        { at: V.idle, component: IdleView, label: 'the idle tasks · priority 0', accent: RED },
        { at: V.log, component: LogView, label: 'the task watchdog', accent: RED, right: () => 'task_wdt.c · timeout 5 s' },
        { at: V.fix, component: FixView, label: 'the fix', accent: GREEN, lines: [WORK_REST_LINE] },
      ]}
      captions={S.captions}
    />
  );
};
