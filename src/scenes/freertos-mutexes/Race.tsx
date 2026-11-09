/**
 * 2 · RACE — try 1, run for real (v1, v1-run2, v1-run3): just `total++`. The final total is
 * 1,455,343, not 2,000,000, and different every run. Why: total++ is read, add 1, write back;
 * both cores read 41, both write 42 → two counts, +1. ✓ simple ✗ wrong ✗ different every
 * run ✗ hides in slow code.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { mono } from '../../components/Explainer';
import { C, hexA } from '../../theme/palette';
import { after, LogPanel, RED, rise, ScoreCard, type ScoreRow, Shell, Snippet, TOTAL_TOP, TotalBox, Worker, fmt } from './parts';
import { EXPECTED, FPS, LOG_RACE, RACE as S, RACE_RUNS, sceneDur, WORKER_COLOR } from './timeline';

export const RACE_SCORE: ScoreRow[] = [
  { at: S.simple, ok: true, text: 'short and simple' },
  { at: S.number, ok: false, text: 'wrong total' },
  { at: S.different, ok: false, text: 'different every run' },
  { at: S.hides, ok: false, text: 'the bug hides' },
];
export const SCORE_TITLES: [string, string] = ['try 1 · just total++', 'try 2 · a mutex'];

/** one worker's three steps; `val` per step once the numbers are in */
const Steps: React.FC<{ t: number; who: 'work_a' | 'work_b'; vals: (string | null)[] }> = ({ t, who, vals }) => {
  const col = WORKER_COLOR[who];
  const rows = [
    { at: S.read, k: 'read total' },
    { at: S.add, k: 'add 1' },
    { at: S.write, k: 'write it back' },
  ];
  return (
    <div style={{ display: 'grid', gap: 12, width: 380 }}>
      <div style={mono(18, col, { fontWeight: 700, letterSpacing: '.14em' })}>{who.toUpperCase()}</div>
      {rows.map((r, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 18px', borderRadius: 12, border: `1.5px solid ${hexA(col, 0.6)}`, background: hexA(col, vals[i] ? 0.18 : 0.06), opacity: after(t, r.at), ...mono(26, C.ink, { fontWeight: 600 }) }}>
          <span>{r.k}</span>
          <span style={{ color: C.amber, fontWeight: 800 }}>{vals[i] ?? ''}</span>
        </div>
      ))}
    </div>
  );
};

export const Race: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const final = RACE_RUNS[0];
  const why = after(t, S.why - 0.2);
  const v41 = t >= S.read41 ? '41' : null;
  const v42 = t >= S.write42 ? '42' : null;
  const add42 = t >= S.read41 + 0.6 ? '→ 42' : null;
  const mini = t >= S.write42 + 0.2 ? 42 : t >= S.read41 ? 41 : null;
  return (
    <Shell frames={Math.round(sceneDur('race') * FPS)} kicker="Try 1 · just total++" captions={S.captions} t={t}>
      <Worker name="work_a" core={0} glow={t >= S.log - 0.2 && t < S.log + 0.2 ? 1 : 0} />
      <Worker name="work_b" core={1} glow={t >= S.log - 0.2 && t < S.log + 0.2 ? 1 : 0} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: TOTAL_TOP, display: 'flex', justifyContent: 'center' }}>
        <TotalBox
          value={t >= S.number ? fmt(final) : '?'}
          tone={t >= S.number ? RED : C.amber}
          sub={t >= S.gone ? <span style={{ color: RED, fontWeight: 700 }}>expected {fmt(EXPECTED)} · {fmt(EXPECTED - final)} lost</span> : t >= S.number ? `expected ${fmt(EXPECTED)}` : undefined}
        />
      </div>
      {/* first half: the code and the runs */}
      <div style={{ position: 'absolute', left: 470, top: 370, opacity: after(t, S.code) * (1 - why), transform: `translateY(${(1 - after(t, S.code)) * 24}px)` }}>
        <Snippet t={t} title="work_task · both tasks run it" color={C.cyan} lines={['for (int i = 0; i < 1000000; i++) {', '    total++;', '}']} lit={[{ line: 1, at: S.code + 1.2 }]} size={22} w={480} />
      </div>
      <div style={{ position: 'absolute', left: 1000, top: 370, display: 'grid', gap: 10, opacity: (1 - why) }}>
        {RACE_RUNS.map((n, i) => (
          <div key={i} style={{ ...mono(26, C.ink, { fontWeight: 600 }), opacity: after(t, i === 0 ? S.number : S.different + (i - 1) * 0.4) }}>
            run {i + 1} → <span style={{ color: RED, fontWeight: 800 }}>{fmt(n)}</span>
          </div>
        ))}
        <div style={{ ...mono(18, C.muted), opacity: after(t, S.different + 1) }}>recorded in QEMU · a board prints other numbers</div>
      </div>
      {/* second half: why */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', ...mono(70, C.amber, { fontWeight: 800 }), opacity: why * (1 - after(t, S.read - 0.3)) }}>total++ <span style={{ ...mono(40, C.muted) }}>one step?</span></div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 306, textAlign: 'center', ...mono(20, C.muted, { letterSpacing: '.08em' }), opacity: after(t, S.read - 1.2) }}>behind the scenes, total++ is three steps</div>
      <div style={{ position: 'absolute', left: 460, top: 340, display: 'flex', gap: 20, alignItems: 'center', opacity: after(t, S.read - 0.2) }}>
        <Steps t={t} who="work_a" vals={[v41, add42, v42]} />
        <div style={{ display: 'grid', justifyItems: 'center', gap: 8, width: 200, opacity: after(t, S.both) }}>
          <div style={mono(18, C.muted)}>total</div>
          <div style={{ width: 110, height: 80, borderRadius: 12, border: `2px solid ${hexA(t >= S.upOne ? RED : C.amber, 0.8)}`, display: 'grid', placeItems: 'center', ...mono(40, t >= S.upOne ? RED : C.amber, { fontWeight: 800 }) }}>{mini ?? ''}</div>
          <div style={{ ...mono(18, RED, { fontWeight: 700 }), opacity: after(t, S.upOne), textAlign: 'center', whiteSpace: 'nowrap' }}>2 counts → +1 ✗</div>
        </div>
        <Steps t={t} who="work_b" vals={[v41, add42, v42]} />
      </div>
      {/* the real run, and the score */}
      <div style={{ position: 'absolute', left: 110, width: 900, top: 620, ...rise(after(t, S.log - 0.4)) }}>
        <LogPanel t={t} rows={4} size={22} cps={3000} label="recorded in QEMU (ESP32 emulator) · run 1" lines={LOG_RACE.map((l, i) => ({ at: S.log + i * 0.12, text: l, color: i === 1 ? RED : '#cfd6ff' }))} />
      </div>
      <div style={{ position: 'absolute', left: 1050, top: 600, ...rise(after(t, S.simple - 0.3)) }}>
        <ScoreCard t={t} flag={RACE_SCORE} titles={SCORE_TITLES} />
      </div>
    </Shell>
  );
};
