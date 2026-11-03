/**
 * 3 · THE TASK FUNCTION — void fn(void *arg); set up, loop forever; never
 * return (vPortTaskWrapper logs + aborts); vTaskDelete(NULL) to end on purpose.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { GREEN, mono, RED } from '../../components/Explainer';
import { C, hexA } from '../../theme/palette';
import { after, Code, CodeAndViews, LedCard, Pill, SerialLog, Verdict } from './parts';
import { FAST, FN as S, FPS, sceneDur, TASK_CODE, wanted } from './timeline';

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
        <SerialLog t={t} size={18} label="idf.py monitor" lines={[{ at: s.logs, text: 'E (…) FreeRTOS: FreeRTOS Task "blink_fast" should not return, Aborting now!', color: RED }]} />
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

const DelView: React.FC<{ t: number }> = ({ t }) => {
  const s = S.del;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 28 }}>
      <div style={{ opacity: after(t, s.purpose), ...mono(22, C.muted) }}>a task that has finished its job:</div>
      <div style={{ opacity: after(t, s.deletes), borderLeft: `4px solid ${GREEN}`, background: hexA(GREEN, 0.08), padding: '14px 18px' }}>
        <Code
          size={24}
          lines={[
            '    // … the work is done',
            <span key="d">
              {'    '}
              <b style={{ color: after(t, s.vtd) > 0.5 ? GREEN : '#cfd6ff' }}>vTaskDelete(NULL);</b>
              <span style={{ color: C.muted }}> // NULL = me</span>
            </span>,
            '}',
          ]}
        />
      </div>
      <div style={{ opacity: after(t, s.vtd + 0.6) }}>
        <Verdict ok p={after(t, s.vtd + 0.6)} size={24}>
          the task ends · the idle task frees its stack later
        </Verdict>
      </div>
    </div>
  );
};

export const Fn: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const V = S.views;
  return (
    <CodeAndViews
      t={t}
      frames={Math.round(sceneDur('fn') * FPS)}
      kicker="The task function"
      file="main/main.c · blink_task"
      code={TASK_CODE}
      codeSize={21}
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
