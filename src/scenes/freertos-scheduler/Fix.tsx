/**
 * 5 · THE FIX — the code mutates: workers 6 → 4. Now an LED whose delay ends takes a
 * core at once and is waiting again in microseconds; the workers hardly notice.
 * Priority = how soon, not how important. What makes the worker heavy: a busy loop
 * keeps its core; vTaskDelay gives it away. Stay below ESP-IDF's own tasks.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { mono } from '../../components/Explainer';
import { C, FONT, hexA } from '../../theme/palette';
import { after, clamp01, CodeViews, CV_VIEW_W as VW, GREEN, Ladder, MiniBoard, Pill, RED, SimLanes, TaskChip, Verdict, WORK } from './parts';
import { ledAt, simulate } from './sim';
import { FIX as S, FPS, mainCode, sceneDur, WORK_CODE } from './timeline';

export const sim4 = () => simulate('workers-4', { until: 6000, workPrio: () => 4 });

const SwapView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', justifyItems: 'center', gap: 40 }}>
    <div style={{ display: 'flex', gap: 30, alignItems: 'center' }}>
      <div style={{ display: 'grid', gap: 18 }}>
        <TaskChip name="work_a" prio={t >= S.lower ? 4 : 6} />
        <TaskChip name="work_b" prio={t >= S.lower ? 4 : 6} />
      </div>
      <div style={{ ...mono(80, t >= S.four ? GREEN : RED, { fontWeight: 800 }), opacity: after(t, S.lower) }}>{t >= S.lower ? '<' : '>'}</div>
      <div style={{ display: 'grid', gap: 18 }}>
        <TaskChip name="blink_fast" prio={5} />
        <TaskChip name="blink_slow" prio={5} />
      </div>
    </div>
    <div style={{ opacity: after(t, S.four) }}>
      <Verdict ok p={after(t, S.four)} size={30}>
        <b style={{ color: C.amber }}>4</b> instead of 6 · lower than the LEDs
      </Verdict>
    </div>
  </div>
);

const BoardView: React.FC<{ t: number }> = ({ t }) => {
  const sw = S.switches;
  return (
    <MiniBoard
      t={t}
      chips={[
        { name: 'work_a', prio: 4, path: [[S.views.board, 'core0']] },
        { name: 'work_b', prio: 4, path: [[S.views.board, 'core1'], [S.away, 'ready'], [S.waiting, 'core1']], note: (tt) => (tt >= S.away && tt < S.waiting ? 'paused' : undefined) },
        { name: 'blink_fast', prio: 5, path: [[S.views.board, 'blocked'], [S.ready, 'ready2'], [S.away, 'core1'], [S.waiting, 'blocked']], glow: (tt) => (tt >= S.away && tt < S.waiting ? 1 : 0) },
      ]}
    >
      {t >= sw && <div style={{ position: 'absolute', left: 400, top: 22, ...mono(22, C.amber, { fontWeight: 700 }), opacity: after(t, sw) }}>GPIO 2 switches ✓</div>}
    </MiniBoard>
  );
};

const LanesView: React.FC<{ t: number }> = ({ t }) => {
  const sim = sim4();
  const now = 300 + (t - S.views.lanes) * 1300;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 24 }}>
      <SimLanes sim={sim} W={VW} s0={0} s1={2400} now={now} show={['want', 'fast', 'core0', 'core1']} />
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Pill color={GREEN} size={20}>
          GPIO 2 on its beat ✓
        </Pill>
        <Pill color={C.amber} size={20}>
          each LED turn: a few microseconds
        </Pill>
        <div style={{ opacity: after(t, S.nothing) }}>
          <Pill color={WORK} size={20}>
            workers: almost the whole core
          </Pill>
        </div>
      </div>
      <div style={mono(16, C.muted)}>LED slivers drawn wider than real · they take microseconds</div>
    </div>
  );
};

const HeroView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 50, padding: '0 20px', fontFamily: FONT.sans }}>
    <div style={{ fontSize: 46, fontWeight: 700, color: C.ink }}>priority is about…</div>
    <div style={{ fontSize: 54, fontWeight: 800, color: RED, opacity: after(t, S.important), textDecoration: t >= S.important + 0.6 ? 'line-through' : undefined }}>✗ how important a job is</div>
    <div style={{ fontSize: 54, fontWeight: 800, color: GREEN, opacity: after(t, S.quickly), textShadow: `0 0 30px ${hexA(GREEN, 0.5)}` }}>✓ how soon it must happen</div>
  </div>
);

const LadderView: React.FC<{ t: number }> = ({ t }) => {
  const rows = [
    { name: 'button', prio: 7, run: 'microseconds, 100× a second', w: 6, at: S.quick },
    { name: 'blink_fast', prio: 5, run: 'microseconds, 5× a second', w: 6, at: S.quick + 0.3 },
    { name: 'work_a', prio: 4, run: '300 ms at a time', w: 300, at: S.long },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 34 }}>
      {rows.map((r) => (
        <div key={r.name} style={{ display: 'grid', gridTemplateColumns: '240px 1fr', alignItems: 'center', gap: 20, opacity: after(t, r.at) }}>
          <TaskChip name={r.name} prio={r.prio} />
          <div style={{ display: 'grid', gap: 6 }}>
            <div style={{ width: Math.max(8, r.w * 1.4), height: 26, borderRadius: 6, background: r.w > 100 ? WORK : C.amber, boxShadow: `0 0 14px ${hexA(r.w > 100 ? WORK : C.amber, 0.6)}` }} />
            <div style={mono(18, C.ink)}>runs for {r.run}</div>
          </div>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ opacity: after(t, S.high) }}>
          <Pill color={C.amber} size={20}>
            quick + on time → high
          </Pill>
        </div>
        <div style={{ opacity: after(t, S.low) }}>
          <Pill color={WORK} size={20}>
            long + can wait → low
          </Pill>
        </div>
      </div>
    </div>
  );
};

const BusyView: React.FC<{ t: number }> = ({ t }) => {
  // a clock in microseconds, slowed so the last digits can be read; end = start + 300 000
  const start = 8_120_450;
  const p = clamp01((t - S.checking) / (S.until + 0.6 - S.checking));
  const now = t < S.timer ? start : t < S.checking ? start + Math.floor((t - S.timer) * 3000) : start + Math.floor(p * 300_000);
  const end = start + 300_000;
  const spin = Math.floor(t * 6) % 4;
  const fmt = (n: number) => n.toLocaleString('en-US');
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 30 }}>
      <div style={{ opacity: after(t, S.timer) }}>
        <div style={mono(20, C.muted)}>esp_timer_get_time() · microseconds since the chip started</div>
        <div style={{ ...mono(64, C.cyan, { fontWeight: 800 }), fontVariantNumeric: 'tabular-nums' }}>{fmt(now)}</div>
      </div>
      <div style={{ opacity: after(t, S.checking) }}>
        <div style={mono(20, C.muted)}>end = the time when it started + 300 000 µs</div>
        <div style={{ ...mono(40, C.amber, { fontWeight: 700 }), fontVariantNumeric: 'tabular-nums' }}>{fmt(end)}</div>
      </div>
      <div style={{ opacity: after(t, S.checking), ...mono(26, C.ink) }}>
        now &lt; end ? → yes → check again <b style={{ color: WORK }}>{'↻↺↻↺'[spin]}</b>
      </div>
      <div style={{ opacity: after(t, S.until + 0.6) }}>
        <Pill color={C.amber} size={22}>
          300 ms later: done · then vTaskDelay
        </Pill>
      </div>
      <div style={mono(16, C.muted)}>the clock is slowed down so you can read it</div>
    </div>
  );
};

const HeldView: React.FC<{ t: number }> = ({ t }) => {
  const fill = clamp01((t - S.running) / 3);
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', justifyItems: 'center', gap: 30 }}>
      <div style={{ width: 420, height: 170, borderRadius: 18, border: `2px dashed ${hexA(GREEN, 0.6)}`, background: hexA(GREEN, 0.06), display: 'grid', placeItems: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: -26, left: 0, ...mono(18, GREEN, { fontWeight: 700, letterSpacing: '.12em' }) }}>RUNNING · core 0</div>
        <TaskChip name="work_a" prio={4} glow={1} />
      </div>
      <div style={{ width: 600 }}>
        <div style={{ height: 26, borderRadius: 6, background: hexA(WORK, 0.15), overflow: 'hidden' }}>
          <div style={{ width: `${fill * 100}%`, height: '100%', background: WORK }} />
        </div>
        <div style={{ ...mono(20, C.ink), marginTop: 8 }}>busy loop: running the whole 300 ms</div>
      </div>
      <div style={{ opacity: after(t, S.keeps) }}>
        <Pill color={WORK} size={24}>
          it keeps its core
        </Pill>
      </div>
    </div>
  );
};

const VersusView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignContent: 'center' }}>
    {[
      { title: 'busy loop', code: 'while (now < end) { }', state: 'Running', col: WORK, core: 'core: taken', ok: false, at: S.views.versus },
      { title: 'vTaskDelay', code: 'vTaskDelay(…);', state: 'Blocked', col: C.magenta, core: 'core: free for others', ok: true, at: S.delay },
    ].map((c) => (
      <div key={c.title} style={{ display: 'grid', gap: 18, justifyItems: 'center', opacity: after(t, c.at), padding: '24px 10px', borderRadius: 18, border: `1.5px solid ${hexA(c.ok ? GREEN : RED, 0.6)}`, background: hexA(c.ok ? GREEN : RED, 0.06) }}>
        <div style={mono(26, '#fff', { fontWeight: 700 })}>{c.title}</div>
        <div style={mono(19, C.ink)}>{c.code}</div>
        <div style={{ ...mono(30, c.col, { fontWeight: 800 }), padding: '10px 22px', borderRadius: 12, border: `2px solid ${c.col}`, background: hexA(c.col, 0.12) }}>{c.state}</div>
        <div style={{ ...mono(22, c.ok ? GREEN : RED, { fontWeight: 700 }), opacity: after(t, c.ok ? S.free : S.views.versus + 0.4) }}>
          {c.ok ? '✓ ' : '✗ '}
          {c.core}
        </div>
      </div>
    ))}
  </div>
);

const SystemView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 20 }}>
    <Ladder
      W={VW}
      axis={after(t, S.views.system, 0.8)}
      marks={[
        { p: 0, label: 'idle 0', color: GREEN, show: after(t, S.keepLow), dy: -70, anchor: 'start' },
        { p: 1, label: 'app_main 1', color: C.muted, show: after(t, S.keepLow), dy: 100, anchor: 'start' },
        { p: 5, label: 'yours: 4 · 5 · 7', color: C.amber, show: after(t, S.keepLow + 0.4), dy: -110, anchor: 'start' },
        { p: 22, label: 'esp_timer 22', color: C.cyan, show: after(t, S.espTimer), dy: -70, anchor: 'end' },
        { p: 24, label: 'ipc 24', color: C.cyan, show: after(t, S.top), dy: 100, anchor: 'end' },
      ]}
    />
    <div style={{ opacity: after(t, S.top) }}>
      <Pill color={C.cyan} size={20}>
        the top numbers: ESP-IDF's own tasks
      </Pill>
    </div>
  </div>
);

export const Fix: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const V = S.views;
  const work = t >= V.busy - 0.2;
  const code = work ? WORK_CODE : mainCode(t >= S.lower ? 4 : 6);
  const marks = work
    ? [
        { line: 3, at: S.timer, token: 'esp_timer_get_time()', label: 'microseconds since start' },
        { line: 4, at: S.checking, token: 'esp_timer_get_time() < end', label: 'checks again and again', strong: true },
        { line: 7, at: S.delay, token: 'vTaskDelay(pdMS_TO_TICKS(100))', label: 'gives the core away' },
      ]
    : [
        { line: 4, at: S.lower, token: '4', label: '4 (was 6)', strong: true },
        { line: 5, at: S.lower, token: '4', strong: true },
        { line: 2, at: S.four, token: '5', label: 'LEDs: 5' },
        { line: 3, at: S.four, token: '5' },
      ];
  return (
    <CodeViews
      t={t}
      frames={Math.round(sceneDur('fix') * FPS)}
      kicker="The fix · urgency, not importance"
      accent="amber"
      file={work ? 'main/main.c · work_task' : 'main/main.c · app_main'}
      code={code}
      codeSize={work ? 19 : 18}
      marks={marks}
      views={[
        { at: V.swap, component: SwapView, label: 'a lower number for the workers', accent: GREEN, lines: [4, 5] },
        { at: V.board, component: BoardView, label: "the LED's delay ends", accent: C.amber, right: () => 'not to scale' },
        { at: V.lanes, component: LanesView, label: 'workers at 4 · over time', accent: GREEN, right: () => 'worked out from the rules' },
        { at: V.hero, component: HeroView, label: 'priority', accent: C.amber },
        { at: V.ladder, component: LadderView, label: 'how long each task runs', accent: C.amber },
        { at: V.busy, component: BusyView, label: 'what makes the worker heavy', accent: WORK, lines: [3, 4, 5, 6] },
        { at: V.held, component: HeldView, label: 'a busy loop holds its core', accent: WORK, lines: [4, 5, 6] },
        { at: V.versus, component: VersusView, label: 'busy loop vs vTaskDelay', accent: GREEN, lines: [7] },
        { at: V.system, component: SystemView, label: 'where your numbers sit · 0 … 24', accent: C.cyan, right: () => 'freertos.rst · speed.rst' },
      ]}
      captions={S.captions}
    />
  );
};

export { ledAt };
