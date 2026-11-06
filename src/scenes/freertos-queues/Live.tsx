/**
 * The live run (demo and full scenes): button · queue · LED task + LED on top, the real log
 * underneath, all on the lab run's clock (real time).
 */
import React from 'react';
import { mono } from '../../components/Explainer';
import { C } from '../../theme/palette';
import { after, Button, Chip, LedCard, ledLevel, LogPanel, QueueRow, rise, rowWidth } from './parts';
import type { Run } from './timeline';

export const Live: React.FC<{ t: number; run: Run; tOf: (m: number) => number; start: number; label: string; extra?: React.ReactNode }> = ({ t, run, tOf, start, label, extra }) => {
  const W = rowWidth(5);
  const pressT = run.presses.map(tOf);
  const down = pressT.some((x) => t >= x && t < x + 0.06 + 0.12) ? 1 : 0;
  const recvT = Object.values(run.recv).map(tOf);
  const items = run.presses
    .map((m, i) => ({ n: i + 1, m }))
    .filter(({ n }) => !run.dropped.includes(n))
    .map(({ n, m }) => {
      const tin = tOf(m);
      const tout = tOf(run.recv[n]);
      return { label: String(n), in: tin, out: Math.max(tout, tin + 0.3) };
    });
  const drops = run.dropped.map((n) => ({ label: String(n), at: tOf(run.presses[n - 1]) }));
  const present = items.filter((i) => t >= i.in && t < i.out).length;
  const blinking = recvT.some((r) => t >= r && t < r + 1.5);
  const awake = Math.max(0, ...recvT.map((r) => (t >= r && t < r + 1.5 ? 1 : 0)));
  return (
    <>
      <div style={{ position: 'absolute', left: 110, top: 150, display: 'grid', justifyItems: 'center', gap: 20, ...rise(after(t, start)) }}>
        <Chip name="button" glow={down} />
        <Button down={down} label="GPIO 18 · simulated" />
      </div>
      <div style={{ position: 'absolute', left: (1920 - W) / 2, top: 220, ...rise(after(t, start)) }}>
        <QueueRow t={t} items={items} drops={drops} full={present >= 5 ? 1 : 0} endsP={0.7} />
      </div>
      <div style={{ position: 'absolute', left: 1580, top: 150, display: 'grid', justifyItems: 'center', gap: 30, ...rise(after(t, start)) }}>
        <Chip name="led" sleep={blinking ? 0 : 1} glow={awake} />
        <LedCard pin={2} on={ledLevel(t, recvT)} size={100} />
      </div>
      <div style={{ position: 'absolute', left: 260, width: 1400, top: 560, ...rise(after(t, start + 0.2)) }}>
        <LogPanel
          t={t}
          rows={7}
          size={22}
          cps={3000}
          label={label}
          right="real time"
          lines={run.log.map((l) => ({ at: tOf(l.ms - run.boot), text: l.text, color: l.warn ? C.amber : '#cfd6ff' }))}
        />
      </div>
      <div style={{ position: 'absolute', left: (1920 - W) / 2, width: W, top: 175, textAlign: 'center', ...mono(20, C.muted) }}>{`${present} of 5 boxes in use`}</div>
      {extra}
    </>
  );
};
