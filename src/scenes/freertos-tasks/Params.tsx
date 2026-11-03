/**
 * 5 · xTaskCreate ② — the parameter (arrives as arg; one function, two tasks;
 * must outlive the task → static), the priority (0…24; 5 preempts app_main at
 * once), the handle (or NULL), and the return value (pdPASS = 1 ≠ ESP_OK).
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { Explainer, GREEN, mono, RED, VIEW_H as H, VIEW_W as W } from '../../components/Explainer';
import { C, hexA } from '../../theme/palette';
import { createArgs } from './Create';
import { after, Code, Ladder, Lanes, LedCard, Pill, Verdict } from './parts';
import { CREATE_CODE, FAST, FPS, PARAMS as S, sceneDur, SLOW, wanted } from './timeline';

export const Params: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const V = S.views;
  return (
    <Explainer
      t={t}
      frames={Math.round(sceneDur('params') * FPS)}
      kicker="Making a task · xTaskCreate()"
      code={CREATE_CODE}
      codeSize={46}
      cardW={280}
      cardGap={300}
      run={0.2}
      args={createArgs(S.args)}
      captions={S.captions}
      views={[
        { at: V.arg, component: ArgView, active: [3], label: 'the parameter', accent: C.amber },
        { at: V.two, component: TwoView, active: [0, 3], label: 'one function, two tasks', accent: C.amber, right: () => 'real time' },
        { at: V.life, component: LifeView, active: [3], label: 'it must outlive the task', accent: C.amber, right: () => 'task.h: "must exist for the lifetime of the task"' },
        { at: V.prio, component: PrioView, active: [4], label: 'the priority', accent: C.magenta, right: () => 'FreeRTOSConfig.h · configMAX_PRIORITIES 25' },
        { at: V.preempt, component: PreemptView, active: [4], label: '5 outranks app_main', accent: C.magenta, right: () => 'CPU 0 · not to scale' },
        { at: V.handle, component: HandleView, active: [5], label: 'the handle', accent: C.cyan },
        { at: V.ret, component: RetView, active: [], label: 'the return value', accent: RED, right: () => 'projdefs.h · esp_err.h' },
      ]}
    />
  );
};

const Step: React.FC<{ p: number; children: React.ReactNode; color: string }> = ({ p, children, color }) => (
  <div style={{ opacity: p, transform: `translateY(${(1 - p) * 12}px)`, ...mono(26, '#fff', { fontWeight: 600 }), padding: '14px 20px', borderRadius: 12, border: `1px solid ${hexA(color, 0.7)}`, background: hexA(color, 0.1) }}>{children}</div>
);

const ArgView: React.FC<{ t: number }> = ({ t }) => {
  const s = S.arg;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', gap: 22, justifyContent: 'center' }}>
      <Step p={after(t, s.pointer)} color={C.amber}>
        xTaskCreate(…, <b style={{ color: C.amber }}>&fast</b>, …)
      </Step>
      <span style={{ ...mono(30, C.amber), opacity: after(t, s.arrives) }}>→</span>
      <Step p={after(t, s.arrives)} color={C.amber}>
        blink_task(void *<b style={{ color: C.amber }}>arg</b>)
      </Step>
      <span style={{ ...mono(30, C.amber), opacity: after(t, s.asArg) }}>→</span>
      <Step p={after(t, s.asArg)} color={C.amber}>
        const blink_t *b = <b style={{ color: C.amber }}>arg</b>;
      </Step>
    </div>
  );
};

const TwoView: React.FC<{ t: number }> = ({ t }) => {
  const s = S.two;
  const now = Math.max(0, (t - s.two) * 1000);
  const rows = [
    { name: 'blink_fast', v: '&fast', st: '{ GPIO_NUM_2,  200 }', pin: FAST.pin, ms: FAST.ms },
    { name: 'blink_slow', v: '&slow', st: '{ GPIO_NUM_19, 500 }', pin: SLOW.pin, ms: SLOW.ms },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr 260px', alignItems: 'center' }}>
      <div style={{ display: 'grid', gap: 26 }}>
        {rows.map((r, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: after(t, i ? s.two : s.one) }}>
            <div style={mono(22, C.amber, { fontWeight: 700, width: 380 })}>
              {r.v} = <span style={{ color: C.ink, fontWeight: 400 }}>{r.st}</span>
            </div>
            <span style={mono(24, C.muted)}>→</span>
            <div style={{ ...mono(22, '#fff', { fontWeight: 700 }), padding: '10px 16px', borderRadius: 10, border: `1px solid ${hexA(C.amber, 0.7)}`, background: hexA(C.amber, 0.1) }}>
              task {r.name} · blink_task({r.v})
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ opacity: after(t, s.pin) }}>
            <Pill color={C.pink} size={20}>
              its own pin
            </Pill>
          </div>
          <div style={{ opacity: after(t, s.delay) }}>
            <Pill color={C.magenta} size={20}>
              its own delay
            </Pill>
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gap: 20, justifyItems: 'center', opacity: after(t, s.two) }}>
        {rows.map((r, i) => (
          <LedCard key={i} pin={r.pin} on={wanted(r.ms, now)} size={90} />
        ))}
      </div>
    </div>
  );
};

const LifeView: React.FC<{ t: number }> = ({ t }) => {
  const s = S.life;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 34, alignContent: 'center' }}>
      <div style={{ opacity: after(t, s.statik), display: 'grid', gap: 16, alignContent: 'start' }}>
        <Code size={22} lines={['static blink_t fast = { GPIO_NUM_2, 200 };', 'void app_main(void) { xTaskCreate(…, &fast, …); }']} style={{ borderLeft: `4px solid ${GREEN}`, paddingLeft: 14 }} />
        <Verdict ok p={after(t, s.statik + 0.3)} size={22}>
          static: lives for the whole program
        </Verdict>
      </div>
      <div style={{ opacity: after(t, s.local), display: 'grid', gap: 16, alignContent: 'start' }}>
        <Code size={22} lines={['void app_main(void) {', '    blink_t fast = { GPIO_NUM_2, 200 };', '    xTaskCreate(…, &fast, …);', '}   // app_main returns'].map((l, i) => (i === 3 ? <span key={i} style={{ color: after(t, s.returns) > 0.5 ? RED : undefined }}>{l}</span> : l))} style={{ borderLeft: `4px solid ${RED}`, paddingLeft: 14 }} />
        <Verdict ok={false} p={after(t, s.gone)} size={22}>
          on main's stack — freed when app_main returns
        </Verdict>
        <div style={{ opacity: after(t, s.returns), ...mono(20, RED) }}>→ the task's b points at freed memory</div>
      </div>
    </div>
  );
};

const PrioView: React.FC<{ t: number }> = ({ t }) => {
  const s = S.prio;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center' }}>
      <Ladder
        W={W}
        axis={after(t, 21.7, 1)}
        marks={[
          { p: 0, label: 'IDLE0 · IDLE1', color: C.muted, show: after(t, s.zero), dy: 90, anchor: 'start' },
          { p: 1, label: 'main · app_main', color: C.ink, show: after(t, s.one), dy: -90, anchor: 'start' },
          { p: 5, label: 'blink_fast · blink_slow', color: C.magenta, show: after(t, 22.3), dy: -36, anchor: 'start' },
          { p: 22, label: 'esp_timer', color: C.muted, show: after(t, s.top), dy: 90, anchor: 'end' },
          { p: 24, label: 'ipc0 · ipc1', color: C.muted, show: after(t, s.top), dy: -36, anchor: 'end' },
        ]}
      />
      <div style={{ opacity: after(t, s.top + 0.4), ...mono(20, C.muted), marginTop: 10 }}>25 or more → configASSERT fails → abort</div>
    </div>
  );
};

/** piecewise-linear playhead for the preemption lane */
const preNow = (t: number) => {
  const k: [number, number][] = [
    [S.preempt.outranks - 0.3, 0],
    [S.preempt.straight, 1.6],
    [S.preempt.waits, 2.5],
    [S.preempt.waits + 0.8, 4],
  ];
  if (t <= k[0][0]) return 0;
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) return k[i - 1][1] + ((t - k[i - 1][0]) / (k[i][0] - k[i - 1][0])) * (k[i][1] - k[i - 1][1]);
  return 4;
};

const PreemptView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 20 }}>
    <Lanes
      W={W}
      s0={0}
      s1={4}
      now={preNow(t)}
      lanes={[
        {
          name: 'CPU 0',
          color: C.cyan,
          spans: [
            { a: 0, b: 1.0, color: C.ink, label: 'main (1)' },
            { a: 1.0, b: 1.6, color: C.magenta, label: 'blink_fast (5)' },
            { a: 1.6, b: 2.0, color: C.ink, label: 'main' },
            { a: 2.0, b: 2.6, color: C.magenta, label: 'blink_slow (5)' },
            { a: 2.6, b: 3.0, color: C.ink, label: 'main' },
            { a: 3.0, b: 4.0, color: C.muted, dashed: true, label: 'idle' },
          ],
        },
      ]}
      marks={[
        { s: 1.0, label: 'xTaskCreate', color: C.amber, lane: 0 },
        { s: 1.6, label: 'blocks in vTaskDelay', color: C.magenta, lane: 0 },
        { s: 3.0, label: 'app_main returns', color: C.ink, lane: 0 },
      ]}
    />
    <div style={{ display: 'flex', gap: 18 }}>
      <div style={{ opacity: after(t, S.preempt.straight) }}>
        <Pill color={C.magenta} size={20}>
          5 &gt; 1 → it runs before xTaskCreate even returns
        </Pill>
      </div>
      <div style={{ opacity: after(t, S.preempt.carries) }}>
        <Pill color={C.ink} size={20}>
          app_main carries on when it blocks
        </Pill>
      </div>
    </div>
  </div>
);

const HandleView: React.FC<{ t: number }> = ({ t }) => {
  const s = S.handle;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 34, alignContent: 'center' }}>
      <div style={{ opacity: after(t, s.refer) }}>
        <Code size={22} lines={['TaskHandle_t h;', 'xTaskCreate(blink_task, …, &h);', '…', 'vTaskDelete(h);   // from another task, later']} style={{ borderLeft: `4px solid ${C.cyan}`, paddingLeft: 14 }} />
      </div>
      <div style={{ opacity: after(t, s.nul), display: 'grid', gap: 14 }}>
        <Code size={22} lines={['xTaskCreate(blink_task, …, NULL);']} style={{ borderLeft: `4px solid ${C.muted}`, paddingLeft: 14 }} />
        <div style={mono(20, C.muted)}>NULL → no handle comes back</div>
      </div>
    </div>
  );
};

const RetView: React.FC<{ t: number }> = ({ t }) => {
  const s = S.ret;
  return (
    <svg width={W} height={H} style={{ display: 'block', overflow: 'visible' }}>
      <g opacity={after(t, s.pdpass)}>
        <text x={20} y={60} style={mono(30, '#fff', { fontWeight: 700 })}>
          success → <tspan fill={C.amber}>pdPASS</tspan> = <tspan fill={C.amber}>1</tspan>
        </text>
      </g>
      <g opacity={after(t, s.notErr)}>
        <text x={760} y={60} style={mono(30, C.muted, { fontWeight: 700 })}>
          but <tspan fill={GREEN}>ESP_OK</tspan> = 0
        </text>
      </g>
      <g opacity={after(t, s.check)}>
        <rect x={20} y={110} width={1480} height={70} rx={10} fill={hexA(RED, 0.08)} stroke={hexA(RED, 0.6)} />
        <text x={40} y={156} style={mono(26, '#fff')}>
          ESP_ERROR_CHECK(xTaskCreate(…));<tspan fill={RED}>  // 1 ≠ ESP_OK → abort, on success</tspan>
        </text>
      </g>
      <g opacity={after(t, s.abort)}>
        <rect x={20} y={210} width={1480} height={70} rx={10} fill={hexA(GREEN, 0.06)} stroke={hexA(GREEN, 0.5)} />
        <text x={40} y={256} style={mono(26, '#fff')}>
          if (xTaskCreate(…) != pdPASS) {'{ … }'}<tspan fill={GREEN}>  // compare with pdPASS</tspan>
        </text>
      </g>
      <g opacity={after(t, s.minus)}>
        <text x={20} y={350} style={mono(26, C.ink)}>
          failure → <tspan fill={RED} fontWeight={700}>errCOULD_NOT_ALLOCATE_REQUIRED_MEMORY</tspan> = <tspan fill={RED} fontWeight={700}>-1</tspan>
        </text>
        <text x={20} y={396} style={mono(20, C.muted)}>
          the heap couldn't fit the stack (or the task control block)
        </text>
      </g>
    </svg>
  );
};
