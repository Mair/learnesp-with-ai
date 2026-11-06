/**
 * 7 · A STUCK TASK — the watchdog watches the idle tasks (the scheduler video): it
 * catches a task that never lets go of its core. But the button task, jammed in its
 * release wait, still lets go (vTaskDelay): the idle tasks run, no error (real, v3), the
 * LEDs keep blinking.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { mono } from '../../components/Explainer';
import { C } from '../../theme/palette';
import { after, Button, CodeSplit, GREEN, idleRemain, LedCard, LogPanel, logColor, rise, Verdict, WatchList } from './parts';
import { buttonCode, FPS, ledOn, LOG_SILENT, RELEASE_LOOP, sceneDur, STUCK as S } from './timeline';

const Overlay: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, top: 200, display: 'grid', justifyItems: 'center', gap: 50 }}>
    <div style={rise(after(t, S.scheduler, 0.6))}>
      <WatchList w={900} rows={[{ name: 'IDLE0', remain: idleRemain(t) }, { name: 'IDLE1', remain: idleRemain(t, 0.4) }]} title="task watchdog · watches the idle tasks" />
    </div>
    <div style={{ display: 'grid', gap: 20, width: 1100 }}>
      <Verdict ok p={after(t, S.caught)} size={28}>
        a task that never lets go of its core → the idle task can't run → caught
      </Verdict>
      <Verdict ok={false} p={after(t, S.still)} size={28}>
        a task that's stuck but still lets go of the core → ?
      </Verdict>
    </div>
  </div>
);

const JamView: React.FC<{ t: number }> = ({ t }) => {
  const down = after(t, S.jam, 0.3);
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', justifyItems: 'center', alignContent: 'center', gap: 30 }}>
      <Button down={down} jammed={after(t, S.jam + 0.4)} />
      <div style={{ ...mono(28, C.ink, { fontWeight: 700 }), opacity: after(t, S.jam) }}>jammed down → reads 0, forever</div>
      <div style={{ ...mono(24, C.muted), opacity: after(t, S.never) }}>the release never comes</div>
    </div>
  );
};

const SilentView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'start', gap: 22 }}>
    <WatchList w={600} rowH={74} rows={[{ name: 'IDLE0', remain: idleRemain(t) }, { name: 'IDLE1', remain: idleRemain(t, 0.4) }]} title="idle tasks still run" />
    <LogPanel
      t={t}
      rows={6}
      size={17}
      label="recorded in QEMU · not watched"
      lines={LOG_SILENT.map((l, i) => ({ at: S.delay - 0.4 + i * 0.45, text: l.text, color: l.text.includes('blink_slow') ? C.pink : logColor(l) }))}
    />
    <div style={{ display: 'flex', gap: 30, alignItems: 'center', opacity: after(t, S.leds) }}>
      <LedCard pin={2} on={ledOn(t, S.delay, 200) ? 1 : 0} size={70} />
      <LedCard pin={19} on={ledOn(t, S.delay, 500) ? 1 : 0} size={70} />
      <span style={{ ...mono(26, GREEN, { fontWeight: 700 }), opacity: after(t, S.nothing) }}>no error</span>
    </div>
  </div>
);

export const Stuck: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const code = buttonCode();
  const rel = code.indexOf(RELEASE_LOOP);
  const marks = [
    ...(t >= S.waits ? [{ line: rel, at: S.waits, token: 'while (gpio_get_level(BUTTON) == 0)', label: 'waits for the release' }] : []),
    ...(t >= S.delay ? [{ line: rel + 1, at: S.delay, token: 'vTaskDelay(pdMS_TO_TICKS(10))', strong: true, label: 'lets go of the core' }] : []),
  ];
  return (
    <CodeSplit
      t={t}
      frames={Math.round(sceneDur('stuck') * FPS)}
      kicker="A task that gets stuck"
      accent="magenta"
      file="main/main.c · button_task"
      code={code}
      codeSize={17}
      marks={marks}
      codeIn={S.code - 0.3}
      overlay={<Overlay t={t} />}
      views={[
        { at: S.code, component: JamView, label: 'the button jams', accent: C.cyan, lines: [rel, rel + 1] },
        { at: S.delay - 0.6, component: SilentView, label: 'what you see', accent: GREEN },
      ]}
      captions={S.captions}
    />
  );
};
