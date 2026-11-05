/**
 * 6 · CHANGING PRIORITY — opens on the button task (the GPIO input press check +
 * three priority lines), then app_main keeping the workers' handles; then the
 * Explainer: vTaskPrioritySet(handle, new priority) and its partner uxTaskPriorityGet.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { CodeLine } from '../../components/CodeLine';
import { ease, Explainer, inOut, mono, VIEW_H as H, VIEW_W as W } from '../../components/Explainer';
import { Panel } from '../../components/Panel';
import type { Mark } from '../../components/pwm';
import { C, FONT, hexA } from '../../theme/palette';
import { after, GREEN, Ladder, MiniBoard, Pill, RED, SerialLog, TaskChip, Verdict } from './parts';
import { BUTTON_CODE, FPS, mainCode, PRIO as S, sceneDur, SET_CODE } from './timeline';

const MAIN_H = ['static TaskHandle_t work_a, work_b;', '', ...mainCode(4, true)];

/** the opening: button_task, then app_main with the handles; lifts away on "First call" */
const Intro: React.FC<{ t: number }> = ({ t }) => {
  const m = S.intro;
  const cin = ease((t - m.show) / 0.6);
  const swap = ease((t - m.main) / 0.5);
  const out = inOut((t - m.out) / 0.6);
  if (out >= 1) return null;
  const btnLit = (i: number) => (t >= m.check ? (i === 5 || i === 6 ? m.check : null) : t >= m.button ? (i >= 11 && i <= 13 ? m.button : null) : null);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 11 }}>
      <div style={{ position: 'absolute', left: 330, top: 120, width: 1260, height: 800, opacity: cin * (1 - swap) * (1 - out), transform: `translateY(${(1 - cin) * 24}px)` }}>
        <Panel label="main/main.c · button_task" accent={C.cyan} right="ESP-IDF">
          <pre style={{ margin: 0, fontFamily: FONT.mono, fontSize: 22, lineHeight: 1.5, color: '#cfd6ff' }}>
            {BUTTON_CODE.map((l, i) => {
              const lit = btnLit(i);
              const marks = i === 6 ? [{ token: 'last == 1 && level == 0', at: m.gpio, label: 'same as the GPIO input video' }] : [];
              return (
                <div key={i} style={{ minHeight: '1.5em' }}>
                  <CodeLine text={l} t={t} litAt={lit} live={lit !== null} marks={marks} row={marks.length ? 1 : 0} />
                </div>
              );
            })}
          </pre>
        </Panel>
      </div>
      <div style={{ position: 'absolute', left: 230, top: 200, width: 1460, height: 600, opacity: swap * (1 - out), transform: `translateY(${(1 - swap) * 24 - out * 120}px)` }}>
        <Panel label="main/main.c · app_main keeps the handles" accent={C.cyan} right="ESP-IDF">
          <pre style={{ margin: 0, fontFamily: FONT.mono, fontSize: 25, lineHeight: 1.6, color: '#cfd6ff' }}>
            {MAIN_H.map((l, i) => {
              const marks: Mark[] =
                i === 0
                  ? [{ token: 'TaskHandle_t', at: m.handle, label: 'two handles' }]
                  : i === 6
                    ? [{ token: '&work_a', at: m.keeps, strong: true, label: 'was NULL' }]
                    : i === 7
                      ? [{ token: '&work_b', at: m.keeps + 0.2, strong: true }]
                      : [];
              const lit = i === 0 ? m.handle : i === 6 || i === 7 ? m.keeps : null;
              return (
                <div key={i} style={{ minHeight: '1.6em' }}>
                  <CodeLine text={l} t={t} litAt={lit} live={lit !== null && t >= lit} marks={marks} row={marks.some((x) => x.label) ? 1 : 0} />
                </div>
              );
            })}
          </pre>
        </Panel>
      </div>
    </AbsoluteFill>
  );
};

const Arrow: React.FC<{ p: number }> = ({ p }) => <span style={{ ...mono(40, C.muted), opacity: p }}>→</span>;

const HandleView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40 }}>
    <div style={mono(40, '#fff', { fontWeight: 700 })}>
      vTaskPrioritySet(<span style={{ color: C.cyan }}>work_a</span>, …)
    </div>
    <Arrow p={after(t, S.which - 0.4)} />
    <div style={{ display: 'grid', justifyItems: 'center', gap: 14, opacity: after(t, S.which - 0.4) }}>
      <TaskChip name="work_a" prio={6} glow={1} />
      <div style={mono(22, C.cyan, { fontWeight: 700 })}>this task changes</div>
    </div>
  </div>
);

const NullView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40 }}>
    <div style={mono(40, '#fff', { fontWeight: 700 })}>
      vTaskPrioritySet(<span style={{ color: C.amber }}>NULL</span>, p)
    </div>
    <Arrow p={after(t, S.calling - 0.3)} />
    <div style={{ opacity: after(t, S.calling - 0.3) }}>
      <Pill color={C.amber} size={30}>
        the task that calls it
      </Pill>
    </div>
  </div>
);

const RangeView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 6 }}>
    <Ladder
      W={W}
      axis={after(t, S.zero - 0.3, 1.0)}
      marks={[
        { p: 4, label: 'p = 4', color: C.magenta, show: after(t, S.zero + 0.4), dy: -70 },
        { p: 6, label: 'p = 6', color: C.magenta, show: after(t, S.zero + 0.7), dy: 100 },
        { p: 24, label: '24 · the top', color: C.cyan, show: after(t, S.top), dy: -70, anchor: 'end' },
      ]}
    />
    <div style={{ display: 'flex', justifyContent: 'center', opacity: after(t, S.over) }}>
      <Verdict ok={false} p={after(t, S.over)} size={28}>
        <b style={{ color: RED }}>25</b> or more → the program stops with an error
      </Verdict>
    </div>
  </div>
);

const OnceView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '560px 1fr', alignItems: 'center', gap: 30 }}>
    <div style={{ position: 'relative', width: 720, height: 690, transform: 'scale(0.72)', transformOrigin: 'top left', marginTop: -10 }}>
      <MiniBoard
        t={t}
        chips={[
          { name: 'work_a', prio: (tt) => (tt >= S.lower ? 4 : 6), path: [[S.views.once, 'core0'], [S.chooses, 'ready']], glow: (tt) => (tt >= S.lower && tt < S.lower + 0.8 ? 1 : 0) },
          { name: 'work_b', prio: 6, path: [[S.views.once, 'core1']] },
          { name: 'blink_fast', prio: 5, path: [[S.views.once, 'ready2'], [S.chooses, 'core0']] },
        ]}
      />
    </div>
    <div style={{ display: 'grid', gap: 22 }}>
      <div style={{ ...mono(30, '#fff', { fontWeight: 700 }), opacity: after(t, S.lower) }}>
        vTaskPrioritySet(work_a, <b style={{ color: C.magenta }}>4</b>);
      </div>
      <div style={{ opacity: after(t, S.chooses) }}>
        <Pill color={GREEN} size={24}>
          core 0 chooses again → blink_fast (5) runs
        </Pill>
      </div>
      <div style={{ opacity: after(t, S.once), ...mono(22, C.ink) }}>no waiting: the core picks again right away</div>
    </div>
  </div>
);

const GetView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', justifyItems: 'center', gap: 40 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
      <div style={mono(44, '#fff', { fontWeight: 700 })}>
        uxTaskPriorityGet(<span style={{ color: C.cyan, opacity: after(t, S.give) > 0.5 ? 1 : 0.5 }}>work_a</span>)
      </div>
      <Arrow p={after(t, S.back)} />
      <div style={{ ...mono(90, C.magenta, { fontWeight: 800 }), opacity: after(t, S.back), textShadow: `0 0 30px ${hexA(C.magenta, 0.6)}` }}>4</div>
    </div>
    <div style={{ opacity: after(t, S.back + 0.5), ...mono(24, C.muted) }}>a handle in → that task's priority out · NULL → your own</div>
  </div>
);

const IF_CODE = ['UBaseType_t p = 4;', 'if (uxTaskPriorityGet(work_a) == 4) {', '    p = 6;', '}', 'vTaskPrioritySet(work_a, p);', 'vTaskPrioritySet(work_b, p);'];

const FlipView: React.FC<{ t: number }> = ({ t }) => {
  const lit = (i: number) => (i === 1 ? S.ifFour : i === 2 ? S.six : i === 0 ? S.otherwise : i >= 4 ? S.otherwise + 0.8 : null);
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', gap: 30 }}>
      <pre style={{ margin: 0, fontFamily: FONT.mono, fontSize: 28, lineHeight: 1.6, color: '#cfd6ff' }}>
        {IF_CODE.map((l, i) => {
          const at = lit(i);
          return (
            <div key={i}>
              <CodeLine text={l} t={t} litAt={at} live={at !== null && t >= at} />
            </div>
          );
        })}
      </pre>
      <div style={{ display: 'grid', gap: 22 }}>
        <div style={{ opacity: after(t, S.ifFour) }}>
          <Pill color={C.magenta} size={26}>
            workers at 4 → set 6
          </Pill>
        </div>
        <div style={{ opacity: after(t, S.otherwise) }}>
          <Pill color={C.magenta} size={26}>
            otherwise → set 4
          </Pill>
        </div>
        <div style={{ opacity: after(t, S.otherwise + 0.8), ...mono(22, C.ink) }}>both workers get the same number</div>
      </div>
    </div>
  );
};

const LogView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 24 }}>
    <div style={mono(30, '#cfd6ff')}>
      ESP_LOGI(TAG, <span style={{ color: C.amber }}>"work tasks now at %u"</span>, p);
    </div>
    <SerialLog t={t} size={26} label="idf.py monitor" lines={[{ at: S.prints + 0.3, text: 'I (8120) prio: work tasks now at 6', color: GREEN }]} />
  </div>
);

const SevenView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 18 }}>
    {[
      { name: 'button', prio: 7, note: 'checks the pin every 10 ms · done in microseconds', at: S.seven - 0.3 },
      { name: 'blink_fast', prio: 5, note: 'the LEDs', at: S.seven + 0.3 },
      { name: 'work_a', prio: '4/6', note: 'the workers: 4 or 6', at: S.seven + 0.6 },
    ].map((r) => (
      <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 28, opacity: after(t, r.at) }}>
        <TaskChip name={r.name} prio={r.prio} glow={r.prio === 7 ? 1 : 0} />
        <div style={mono(24, C.ink)}>{r.note}</div>
      </div>
    ))}
    <div style={{ opacity: after(t, S.quick) }}>
      <Pill color={GREEN} size={24}>
        the highest number, but so quick it never gets in the way
      </Pill>
    </div>
  </div>
);

export const Prio: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const V = S.views;
  return (
    <>
      <Explainer
        t={t}
        frames={Math.round(sceneDur('prio') * FPS)}
        kicker="Changing priority · vTaskPrioritySet()"
        code={SET_CODE}
        codeIn={S.intro.out}
        run={S.run}
        args={[
          { token: 'work_a', at: S.args[0], title: 'handle', value: 'work_a', sub: 'which task · NULL = me', color: C.cyan },
          { token: 'p', at: S.args[1], title: 'new priority', value: 'p', sub: '0 … 24', color: C.magenta },
        ]}
        captions={S.captions}
        views={[
          { at: V.handle, component: HandleView, active: [0], label: 'the handle', accent: C.cyan },
          { at: V.nul, component: NullView, active: [0], label: 'NULL', accent: C.amber },
          { at: V.range, component: RangeView, active: [1], label: 'the new priority · 0 … 24', accent: C.magenta, right: () => 'tasks.c · configASSERT' },
          { at: V.once, component: OnceView, active: [0, 1], label: 'it takes effect at once', accent: GREEN },
          { at: V.get, component: GetView, active: [], label: 'its partner · uxTaskPriorityGet()', accent: C.magenta },
          { at: V.flip, component: FlipView, active: [], label: 'the button flips 4 ↔ 6', accent: C.magenta },
          { at: V.log, component: LogView, active: [], label: 'and logs it', accent: GREEN },
          { at: V.seven, component: SevenView, active: [], label: 'the button task · priority 7', accent: C.cyan },
        ]}
      />
      <Intro t={t} />
    </>
  );
};

export { H };
