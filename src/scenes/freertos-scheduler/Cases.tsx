/**
 * 4 · THE RULE IN ACTION — four short cases on the board, then back to the LED:
 *   ① each core takes the highest ready task   ② a higher one becomes ready → takes a core
 *   ③ a lower one waits while higher ones hold both cores   ④ equal ones take turns each tick
 *   → workers 6 hold both cores; blink_fast 5 is ready but waits until a worker rests.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { CaptionLine } from '../../components/CodeToHardware';
import { ease, mono } from '../../components/Explainer';
import { Panel } from '../../components/Panel';
import { Kicker, Scene } from '../../components/Type';
import { C, hexA } from '../../theme/palette';
import { after, Board, ChipPath, clamp01, GREEN, LedCard, Pill, RED, Slot } from './parts';
import { CASES as K, FPS, sceneDur } from './timeline';

const c1 = (): ChipPath[] => [
  { name: 'button', prio: 7, path: [[K.c1.at + 0.2, 'ready0'], [K.c1.takes, 'core0']], glow: (t) => (t >= K.c1.highest && t < K.c1.highest + 1.2 ? 1 : 0) },
  { name: 'blink_fast', prio: 5, path: [[K.c1.at + 0.35, 'ready1'], [K.c1.takes + 0.6, 'core1']] },
  { name: 'work_a', prio: 4, path: [[K.c1.at + 0.5, 'ready2']], note: (t) => (t >= K.c1.takes + 1.2 ? 'waits: lower' : undefined), dim: (t) => (t >= K.c1.takes + 1.2 ? 0.5 : 0) },
];

const c2 = (): ChipPath[] => [
  { name: 'work_a', prio: 4, path: [[K.c2.at, 'core0']] },
  {
    name: 'work_b',
    prio: 4,
    path: [
      [K.c2.at, 'core1'],
      [K.c2.takes, 'ready2'],
      [K.c2.later + 0.4, 'core1'],
    ],
    note: (t) => (t >= K.c2.back && t < K.c2.later + 0.4 ? 'paused here' : t >= K.c2.stopped ? 'carries on' : undefined),
  },
  {
    name: 'blink_fast',
    prio: 5,
    path: [
      [K.c2.at, 'blocked1'],
      [K.c2.ready, 'ready1'],
      [K.c2.takes, 'core1'],
      [K.c2.later, 'blocked1'],
    ],
    glow: (t) => (t >= K.c2.takes && t < K.c2.later ? 1 : 0),
    note: (t) => (t >= K.c2.wait && t < K.c2.later ? "doesn't wait" : undefined),
  },
];

const c3 = (): ChipPath[] => [
  { name: 'work_a', prio: 6, path: [[K.c3.at + 0.2, 'core0']] },
  { name: 'work_b', prio: 6, path: [[K.c3.at + 0.4, 'core1']] },
  { name: 'blink_fast', prio: 5, path: [[K.c3.ready, 'ready1']], dim: (t) => (t >= K.c3.must ? 0.45 : 0), note: (t) => (t >= K.c3.must ? 'ready · but must wait' : undefined) },
];

/** ④: three equal tasks, two cores; at each (slowed) tick one swaps out */
const TICKS = 7;
const TICK_S = 0.85;
const c4 = (): ChipPath[] => {
  const names = ['task_a', 'task_b', 'task_c'];
  // who sits where after k ticks: cores alternate, the waiting one comes in
  const where: Slot[][] = [];
  let seat: Slot[] = ['core0', 'core1', 'ready1'];
  where.push(seat);
  for (let k = 1; k <= TICKS; k++) {
    const core: Slot = k % 2 ? 'core0' : 'core1';
    const inIdx = seat.indexOf('ready1');
    const outIdx = seat.indexOf(core);
    seat = seat.map((s, i) => (i === inIdx ? core : i === outIdx ? 'ready1' : s));
    where.push(seat);
  }
  return names.map((n, i) => ({
    name: n,
    prio: 4,
    color: ['#9aa7ff', '#c79bff', '#7fd4ff'][i],
    path: [[K.c4.at + 0.2 + 0.12 * i, where[0][i]] as [number, Slot], ...where.slice(1).map((w, k) => [K.c4.tick + TICK_S * k, w[i]] as [number, Slot])],
  }));
};

const led = (): ChipPath[] => [
  { name: 'work_a', prio: 6, path: [[K.led.at + 0.3, 'core0']], note: (t) => (t >= K.led.busy ? 'busy' : undefined) },
  {
    name: 'work_b',
    prio: 6,
    path: [
      [K.led.at + 0.45, 'core1'],
      [K.led.rests, 'blocked3'],
    ],
    note: (t) => (t >= K.led.rests ? 'rests 100 ms' : t >= K.led.busy ? 'busy' : undefined),
  },
  {
    name: 'blink_fast',
    prio: 5,
    path: [
      [K.led.at + 0.6, 'blocked1'],
      [K.led.over, 'ready1'],
      [K.led.rests + 0.35, 'core1'],
      [K.led.late + 0.9, 'blocked1'],
    ],
    dim: (t) => (t >= K.led.waits && t < K.led.rests + 0.35 ? 0.45 : 0),
    glow: (t) => (t >= K.led.rests + 0.35 && t < K.led.late + 0.9 ? 1 : 0),
  },
];

const CASE_VIEWS = [
  { at: K.c1.at, chips: c1, label: 'case 1 · each core takes the highest ready task' },
  { at: K.c2.at, chips: c2, label: 'case 2 · a higher number becomes ready' },
  { at: K.c3.at, chips: c3, label: 'case 3 · higher numbers on both cores' },
  { at: K.c4.at, chips: c4, label: 'case 4 · the same number' },
  { at: K.led.at, chips: led, label: 'back to our LED' },
];

export const Cases: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  let cur = 0;
  CASE_VIEWS.forEach((v, i) => {
    if (t >= v.at) cur = i;
  });
  const view = CASE_VIEWS[cur];
  // waiting time for blink_fast in the LED case (drawn, not to scale)
  const waitP = clamp01((t - K.led.over) / (K.led.rests + 0.35 - K.led.over));
  return (
    <Scene durationInFrames={Math.round(sceneDur('cases') * FPS)}>
      <AbsoluteFill>
        <div style={{ position: 'absolute', top: 40, width: '100%', display: 'grid', placeItems: 'center' }}>
          <Kicker delay={0.1} accent="cyan">
            The rule in action
          </Kicker>
        </div>
        <div style={{ position: 'absolute', left: 160, top: 120, width: 1600, height: 790 }}>
          <Panel label={view.label} accent={cur === 4 ? RED : C.cyan} right={cur === 3 && t >= K.c4.tick ? 'slowed down · really 1 tick = 10 ms' : 'not to scale'}>
            {CASE_VIEWS.map((v, i) => {
              const next = CASE_VIEWS[i + 1]?.at ?? Infinity;
              const a = ease((t - v.at) / 0.45) * (1 - clamp01((t - (next - 0.35)) / 0.35));
              if (a <= 0.001) return null;
              return (
                <div key={i} style={{ position: 'absolute', left: 28, top: 70, opacity: a }}>
                  <Board t={t} chips={v.chips()}>
                    {i === 3 && (
                      <div style={{ position: 'absolute', left: 1020, top: 280, opacity: after(t, K.c4.ms) }}>
                        <Pill color={C.cyan} size={24}>
                          1 tick = 10 ms each
                        </Pill>
                      </div>
                    )}
                    {i === 4 && t >= K.led.over && t < K.led.rests + 0.6 && (
                      <div style={{ position: 'absolute', left: 820, top: 286, width: 340, opacity: after(t, K.led.over) }}>
                        <div style={mono(18, C.amber, { fontWeight: 700 })}>{t >= K.led.waits ? '5 < 6 · waiting…' : 'ready to switch the LED'}</div>
                        <div style={{ marginTop: 8, height: 12, borderRadius: 6, background: hexA(C.amber, 0.15), overflow: 'hidden' }}>
                          <div style={{ width: `${waitP * 100}%`, height: '100%', background: RED }} />
                        </div>
                      </div>
                    )}
                    {i === 4 && t >= K.led.late && (
                      <div style={{ position: 'absolute', left: 1010, top: 395, opacity: after(t, K.led.late) }}>
                        <Pill color={RED} size={24}>
                          the LED switches late
                        </Pill>
                      </div>
                    )}
                    {i === 4 && (
                      <div style={{ position: 'absolute', left: 1330, top: 400, opacity: after(t, K.led.at + 0.6) }}>
                        <LedCard pin={2} on={t >= K.led.rests + 0.5 ? 1 : 0} size={80} sub={t >= K.led.late ? 'switched late' : 'waiting to switch'} />
                      </div>
                    )}
                    {i === 2 && t >= K.c3.even && (
                      <div style={{ position: 'absolute', left: 1040, top: 290, opacity: after(t, K.c3.even) }}>
                        <Pill color={RED} size={22}>
                          even though it's ready
                        </Pill>
                      </div>
                    )}
                    {i === 1 && t >= K.c2.lower && t < K.c2.later && (
                      <div style={{ position: 'absolute', left: 1300, top: 82, opacity: after(t, K.c2.lower) }}>
                        <Pill color={GREEN} size={22}>
                          5 &gt; 4
                        </Pill>
                      </div>
                    )}
                  </Board>
                </div>
              );
            })}
          </Panel>
        </div>
        <div style={{ position: 'absolute', top: 944, width: '100%', display: 'grid', placeItems: 'center' }}>
          <CaptionLine captions={K.captions} t={t} size={32} />
        </div>
      </AbsoluteFill>
    </Scene>
  );
};
