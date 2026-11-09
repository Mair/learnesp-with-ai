/**
 * 3 · MUTEX — try 2 on the same picture: a key. Only the holder may change total; work_a
 * takes it, adds, gives it back; work_b wanting it meanwhile waits, asleep; taking is one
 * step. Run for real (v0, v0-run2): exactly 2,000,000 → MUTEX. The catch: it costs time
 * (~23.5 s in QEMU against ~0 without).
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { mono } from '../../components/Explainer';
import { C, GRAD_TEXT, hexA } from '../../theme/palette';
import { RACE_SCORE, SCORE_TITLES } from './Race';
import { after, GREEN, KeyAt, keyHolder, keyPos, type KeyStep, LogPanel, pulseAt, RED, rise, ScoreCard, type ScoreRow, Shell, TOTAL_TOP, TotalBox, Worker, fmt } from './parts';
import { FPS, LOG_LOCKED, LOG_LOCKED_2, MUTEX as S, RACE_RUNS, sceneDur } from './timeline';

const MUTEX_SCORE: ScoreRow[] = [
  { at: S.bWaits, ok: true, text: 'waiting task sleeps' },
  { at: S.exactly, ok: true, text: 'exactly 2,000,000' },
  { at: S.seconds, ok: false, text: 'it costs time' },
];

export const Mutex: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const steps: KeyStep[] = [
    [0, 'home'],
    [S.aTakes, 'a'],
    [S.aGives, 'home'],
    [S.bWants - 0.5, 'a'],
    [S.bBack, 'b'],
    [S.bBack + 1.4, 'home'],
  ];
  const holder = keyHolder(t, steps);
  const bWaiting = t >= S.bWants && t < S.bBack ? 1 : 0;
  const plusA = pulseAt(t, S.aAdds);
  const plusB = pulseAt(t, S.bBack + 0.6);
  const illus = t < S.flash ? (t >= S.aAdds ? (t >= S.bBack + 0.6 ? 2 : 1) : 0) : null;
  const done = t >= S.log + 0.3;
  const hero = after(t, S.word - 0.2, 0.6) * (1 - after(t, S.catch - 0.3));
  const flow = (on: boolean, txt: string) => (
    <span style={{ padding: '6px 16px', borderRadius: 10, border: `1.5px solid ${hexA(on ? C.cyan : C.muted, on ? 0.9 : 0.35)}`, background: on ? hexA(C.cyan, 0.16) : 'transparent', color: on ? '#fff' : C.muted, fontWeight: on ? 700 : 500 }}>{txt}</span>
  );
  const phase = t >= S.aTakes && t < S.aAdds ? 0 : t >= S.aAdds && t < S.aGives ? 1 : t >= S.aGives && t < S.aGives + 0.8 ? 2 : -1;
  return (
    <Shell frames={Math.round(sceneDur('mutex') * FPS)} kicker="Try 2 · a lock with one key" captions={S.captions} t={t}>
      <Worker name="work_a" core={0} glow={holder === 'a' ? 1 : 0} />
      <Worker name="work_b" core={1} glow={holder === 'b' ? 1 : 0} sleep={bWaiting} note={bWaiting ? 'waiting for the key · asleep' : undefined} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: TOTAL_TOP, display: 'flex', justifyContent: 'center' }}>
        <TotalBox
          value={done ? fmt(2000000) : illus !== null ? `${41 + illus}` : '?'}
          tone={t >= S.exactly ? GREEN : C.amber}
          pulse={Math.max(plusA, plusB)}
          sub={illus !== null && t >= S.aAdds ? 'illustration' : done ? 'expected 2,000,000 ✓' : undefined}
        />
      </div>
      <KeyAt pos={keyPos(t, steps)} show={after(t, S.key - 0.2)} glow={holder !== 'home' ? 1 : 0} label={holder === 'home' && t < S.flash ? 'the key · free' : undefined} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 410, display: 'flex', justifyContent: 'center', gap: 16, alignItems: 'center', ...mono(26, C.ink), opacity: after(t, S.aTakes - 0.3) * (1 - after(t, S.flash - 0.3)) }}>
        {flow(phase === 0, 'take the key')} <span style={{ color: C.muted }}>→</span> {flow(phase === 1, 'total + 1')} <span style={{ color: C.muted }}>→</span> {flow(phase === 2, 'hand it back')}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 490, textAlign: 'center', ...mono(30, C.cyan, { fontWeight: 700 }), opacity: after(t, S.step) * (1 - after(t, S.flash - 0.3)) }}>taking the key is one step → never both at once</div>
      {/* the name */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center', ...rise(hero) }}>
        <span style={{ ...GRAD_TEXT, fontSize: 150, fontWeight: 800, letterSpacing: '.04em' }}>MUTEX</span>
        <div style={{ ...mono(28, C.muted), opacity: after(t, S.mutual) }}>mutual exclusion</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 420, textAlign: 'center', ...mono(30, C.ink, { fontWeight: 700 }), opacity: after(t, S.seconds - 0.4) }}>
        with the key: <span style={{ color: RED }}>~23.5 s</span> <span style={{ color: C.muted }}>·</span> without: <span style={{ color: GREEN }}>~0 s</span>
        <div style={mono(20, C.muted)}>recorded in QEMU · a board's times differ</div>
      </div>
      {/* the real runs, and the score */}
      <div style={{ position: 'absolute', left: 110, width: 900, top: 620, ...rise(after(t, S.log - 0.4)) }}>
        <LogPanel
          t={t}
          rows={4}
          size={22}
          cps={3000}
          label="recorded in QEMU (ESP32 emulator) · runs 1 and 2"
          lines={[...LOG_LOCKED, LOG_LOCKED_2].map((l, i) => ({ at: S.log + i * 0.5, text: l, color: l.endsWith('2000000') ? GREEN : '#cfd6ff' }))}
        />
      </div>
      <div style={{ position: 'absolute', left: 1050, top: 600 }}>
        <ScoreCard t={t} flag={RACE_SCORE.map((r) => ({ ...r, at: -1 }))} queue={MUTEX_SCORE} titles={SCORE_TITLES} dimFlag={1} queueShow={1} />
      </div>
      <div style={{ position: 'absolute', left: 1050, top: 570, ...mono(18, C.muted) }}>try 1 gave {fmt(RACE_RUNS[0])}</div>
    </Shell>
  );
};
