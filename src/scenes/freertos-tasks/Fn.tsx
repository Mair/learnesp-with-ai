/**
 * 3 · THE TASK FUNCTION — void fn(void *arg); set up, loop forever; never
 * return (vPortTaskWrapper logs + aborts); to end on purpose the code itself
 * mutates: while (1) → for (… 10 …), then vTaskDelete(NULL) is added.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { GREEN, mono, RED } from '../../components/Explainer';
import { C, hexA } from '../../theme/palette';
import { after, CodeAndViews, LedCard, Pill, SerialLog, Verdict } from './parts';
import { FAST, FN as S, FPS, LOG_RETURN, sceneDur, TASK_CODE, TASK_CODE_DEL, wanted } from './timeline';

const Box: React.FC<{ children: React.ReactNode; color: string; p?: number; style?: React.CSSProperties }> = ({ children, color, p = 1, style }) => (
  <div
    style={{
      opacity: p,
      ...mono(24, '#fff', { fontWeight: 700 }),
      padding: '16px 22px',
      borderRadius: 14,
      border: `2px solid ${hexA(color, 0.8)}`,
      background: hexA(color, 0.14),
      textAlign: 'center',
      ...style,
    }}
  >
    {children}
  </div>
);

const SigView: React.FC<{ t: number }> = ({ t }) => {
  const s = S.sig;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 34, padding: '0 10px' }}>
      <div style={mono(22, C.muted)}>FreeRTOS's type for a task function · projdefs.h</div>
      <div style={mono(30, '#cfd6ff')}>
        typedef <span style={{ color: after(t, s.nothing) > 0.5 ? C.amber : undefined }}>void</span> (* TaskFunction_t)(
        <span style={{ color: after(t, s.voidp) > 0.5 ? C.amber : undefined }}>void *</span>);
      </div>
      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ opacity: after(t, s.voidp) }}>
          <Pill color={C.amber} size={22}>
            in: one void * — any pointer
          </Pill>
        </div>
        <div style={{ opacity: after(t, s.nothing) }}>
          <Pill color={C.amber} size={22}>
            out: nothing
          </Pill>
        </div>
      </div>
    </div>
  );
};

const BodyView: React.FC<{ t: number }> = ({ t }) => {
  const s = S.body;
  const steps = [
    { at: s.on, k: 'LED on' },
    { at: s.wait1, k: 'wait' },
    { at: s.off, k: 'LED off' },
    { at: s.wait2, k: 'wait' },
  ];
  const now = Math.max(0, (t - s.loops) * 1000);
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', justifyItems: 'center', gap: 30 }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', opacity: after(t, s.setup) }}>
        <Box color={C.pink} style={{ fontSize: 20 }}>
          set up the pin
        </Box>
        <span style={mono(26, C.muted)}>→</span>
        <Box color={C.cyan} p={after(t, s.loops)} style={{ fontSize: 20 }}>
          while (1) — forever
        </Box>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        {steps.map((x, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span style={{ ...mono(22, C.muted), opacity: after(t, x.at) }}>→</span>}
            <Box color={i % 2 ? C.magenta : C.amber} p={after(t, x.at)} style={{ fontSize: 20, padding: '10px 16px' }}>
              {x.k}
            </Box>
          </React.Fragment>
        ))}
        <span style={{ ...mono(26, C.muted), opacity: after(t, s.wait2) }}>↺</span>
      </div>
      <div style={{ opacity: after(t, s.loops) }}>
        <LedCard pin={FAST.pin} on={t >= s.loops ? wanted(FAST.ms, now) : 0} size={110} />
      </div>
      <div style={{ opacity: after(t, s.same) }}>
        <Pill color={C.cyan} size={20}>
          the same calls as the GPIO output video
        </Pill>
      </div>
    </div>
  );
};

const NeverView: React.FC<{ t: number }> = ({ t }) => {
  const s = S.never;
  const back = after(t, s.does);
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 26 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Box color={C.cyan} style={{ fontSize: 20 }}>
          vPortTaskWrapper
          <div style={mono(14, C.muted, { fontWeight: 400 })}>ESP-IDF · port.c</div>
        </Box>
        <span style={mono(22, C.muted)}>calls →</span>
        <Box color={C.amber} style={{ fontSize: 20 }}>
          blink_task(arg)
        </Box>
        <span style={{ ...mono(22, RED, { fontWeight: 700 }), opacity: back }}>← returns?</span>
      </div>
      <div style={{ opacity: after(t, s.logs - 0.2) }}>
        <SerialLog t={t} size={18} label="recorded in QEMU" lines={[{ at: s.logs, text: LOG_RETURN, color: RED }]} />
      </div>
      <div style={{ opacity: after(t, s.aborts) }}>
        <Verdict ok={false} p={after(t, s.aborts)} size={24}>
          abort() → the chip resets
        </Verdict>
      </div>
      <div style={{ opacity: after(t, s.never), ...mono(18, C.muted) }}>"Tasks must be implemented to never return (i.e. continuous loop)." — task.h</div>
    </div>
  );
};

/** the LED blinks ten times from `ten`, then stays off: 10 × (200 on + 200 off) = 4 s */
const tenBlinks = (t: number) => {
  const ms = (t - S.del.ten) * 1000;
  return ms >= 0 && ms < 10 * 2 * FAST.ms ? wanted(FAST.ms, ms) : 0;
};

const Edit: React.FC<{ p: number; from: string; to: string }> = ({ p, from, to }) => (
  <div style={{ opacity: p, transform: `translateY(${(1 - p) * 10}px)`, display: 'grid', gridTemplateColumns: '1fr 44px 1fr', alignItems: 'center', gap: 10 }}>
    <div style={{ ...mono(21, C.muted, { textDecoration: 'line-through' }), padding: '10px 14px', borderRadius: 10, border: `1px solid ${hexA(RED, 0.5)}`, background: hexA(RED, 0.07) }}>{from}</div>
    <span style={{ ...mono(26, GREEN), textAlign: 'center' }}>→</span>
    <div style={{ ...mono(21, '#fff', { fontWeight: 700 }), padding: '10px 14px', borderRadius: 10, border: `1px solid ${hexA(GREEN, 0.8)}`, background: hexA(GREEN, 0.1) }}>{to}</div>
  </div>
);

const DelView: React.FC<{ t: number }> = ({ t }) => {
  const s = S.del;
  const blinks = Math.min(10, Math.max(0, Math.floor(((t - s.ten) * 1000) / (2 * FAST.ms))));
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, opacity: after(t, s.ten) }}>
        <LedCard pin={FAST.pin} on={tenBlinks(t)} size={90} />
        <div style={{ display: 'grid', gap: 8 }}>
          <div style={mono(24, '#fff', { fontWeight: 700 })}>ten blinks, then stop</div>
          <div style={mono(20, C.amber)}>
            blink {blinks} / 10{blinks >= 10 ? ' · done' : ''}
          </div>
        </div>
      </div>
      <Edit p={after(t, s.swap)} from="while (1) {" to="for (int i = 0; i < 10; i++) {" />
      <Edit p={after(t, s.deletes)} from="}  // return → abort" to="vTaskDelete(NULL);" />
      <div style={{ opacity: after(t, s.nul) }}>
        <Pill color={GREEN} size={22}>
          NULL → the task making the call: delete <b>me</b>
        </Pill>
      </div>
      <div style={{ opacity: after(t, s.ends) }}>
        <Verdict ok p={after(t, s.ends)} size={24}>
          the task ends — without returning
        </Verdict>
      </div>
      <div style={{ opacity: after(t, s.frees), ...mono(20, C.muted) }}>its stack and control block are freed later, by the idle task</div>
    </div>
  );
};

export const Fn: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const V = S.views;
  // the code itself is edited on cue: while (1) → for (… 10 …), then vTaskDelete(NULL)
  const code = t < S.del.swap ? TASK_CODE : t < S.del.deletes ? [...TASK_CODE_DEL.slice(0, 12), '}'] : TASK_CODE_DEL;
  return (
    <CodeAndViews
      t={t}
      frames={Math.round(sceneDur('fn') * FPS)}
      kicker="The task function"
      file="main/main.c · blink_task"
      code={code}
      codeSize={21}
      marks={[
        { line: 6, at: S.del.swap, token: 'for (int i = 0; i < 10; i++)', label: 'ten times, then out', strong: true },
        { line: 12, at: S.del.deletes, token: 'vTaskDelete(NULL)', label: 'delete this task', strong: true },
      ]}
      views={[
        { at: V.sig, component: SigView, label: 'one pointer in, nothing out', accent: C.amber, lines: S.lines.sig },
        { at: V.body, component: BodyView, label: 'set up, then loop forever', accent: C.cyan, lines: S.lines.body },
        { at: V.never, component: NeverView, label: 'it must never return', accent: RED, right: () => 'port.c · vPortTaskWrapper', lines: S.lines.never },
        { at: V.del, component: DelView, label: 'ending a task on purpose', accent: GREEN, lines: S.lines.del },
      ]}
      captions={S.captions}
    />
  );
};
