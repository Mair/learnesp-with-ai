/**
 * 11 · THE MISTAKE — the loop's last wait becomes 10 s. Nothing is stuck, but the task
 * checks in only every 10 s, so the 5 s watchdog fires every loop (real, v2: 6.6, 16.6,
 * 26.6 s). Fix: every delay in a watched task shorter than the timeout (or raise it); and
 * the check-in belongs in the main loop, not inside the release wait.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { mono } from '../../components/Explainer';
import { C, hexA } from '../../theme/palette';
import { after, clamp01, CodeSplit, GREEN, RED, SPLIT_VIEW_W, Verdict } from './parts';
import { buttonCode, FPS, MISTAKE as S, RELEASE_LOOP, sceneDur, TIMEOUT_S, TRAP_CHECKINS_S, TRAP_ERRORS_S, WDT_RESET } from './timeline';

const SPAN = 30; // seconds of v2.log on the lane

const LaneView: React.FC<{ t: number }> = ({ t }) => {
  const W = SPLIT_VIEW_W - 40;
  const x = (s: number) => 20 + (s / SPAN) * W;
  const [a, b] = S.sweep;
  const now = clamp01((t - a) / (b - a)) * SPAN;
  // the countdown: full at each check-in, drains over 5 s, sits at 0 until the next
  const remainAt = (s: number) => {
    const last = [...TRAP_CHECKINS_S].reverse().find((c) => c <= s);
    if (last === undefined) return 1;
    return Math.max(0, 1 - (s - last) / TIMEOUT_S);
  };
  const H = 140;
  const pts: string[] = [];
  for (let s = 0; s <= now; s += 0.05) pts.push(`${x(s).toFixed(1)},${(40 + H * (1 - remainAt(s))).toFixed(1)}`);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ ...mono(20, C.muted), marginBottom: 10, whiteSpace: 'nowrap' }}>button's countdown · 30 s of log, shown in ~6 s</div>
      <svg width={SPLIT_VIEW_W} height={300} style={{ overflow: 'visible' }}>
        <line x1={x(0)} y1={40 + H} x2={x(SPAN)} y2={40 + H} stroke={hexA(C.muted, 0.5)} />
        <text x={x(0) - 6} y={46} textAnchor="end" style={mono(16, C.muted)}>5 s</text>
        <text x={x(0) - 6} y={40 + H + 6} textAnchor="end" style={mono(16, C.muted)}>0</text>
        {[0, 10, 20, 30].map((s) => (
          <text key={s} x={x(s)} y={40 + H + 34} textAnchor="middle" style={mono(16, C.muted)}>
            {s} s
          </text>
        ))}
        <polyline points={pts.join(' ')} fill="none" stroke={C.cyan} strokeWidth={3.5} />
        {TRAP_CHECKINS_S.filter((c) => c <= now).map((c) => (
          <g key={c}>
            <line x1={x(c)} y1={28} x2={x(c)} y2={40 + H} stroke={GREEN} strokeWidth={2} strokeDasharray="4 4" />
            <text x={x(c)} y={20} textAnchor="middle" style={mono(16, GREEN, { fontWeight: 700 })}>check-in</text>
          </g>
        ))}
        {TRAP_ERRORS_S.filter((e) => e <= now).map((e) => (
          <g key={e}>
            <circle cx={x(e)} cy={40 + H} r={9} fill={RED} style={{ filter: `drop-shadow(0 0 8px ${RED})` }} />
            <text x={x(e)} y={40 + H + 62} textAnchor="middle" style={mono(17, RED, { fontWeight: 700 })}>E ({Math.round(e * 1000)}) - button</text>
          </g>
        ))}
        {now > 0 && now < SPAN && <line x1={x(now)} y1={20} x2={x(now)} y2={40 + H + 10} stroke="#fff" strokeOpacity={0.6} />}
      </svg>
      <div style={{ display: 'grid', gap: 16, marginTop: 14 }}>
        <Verdict ok p={after(t, S.nothing)} size={22}>
          nothing is stuck: the task runs its loop every 10 s
        </Verdict>
        <Verdict ok={false} p={after(t, S.fires)} size={22}>
          a check-in every 10 s &gt; the 5 s timeout → an error every loop
        </Verdict>
      </div>
    </div>
  );
};

const FixView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 30 }}>
    <Verdict ok p={after(t, S.shorter - 0.3)} size={26}>
      every delay in a watched task &lt; the timeout
    </Verdict>
    <div style={{ ...mono(24, C.muted), opacity: after(t, S.shorter + 0.6), paddingLeft: 20 }}>or raise the timeout in menuconfig (up to 60 s)</div>
    <Verdict ok p={after(t, S.main)} size={26}>
      check in from the main loop
    </Verdict>
    <Verdict ok={false} p={after(t, S.release)} size={26}>
      not inside the release wait — a jam would never be caught
    </Verdict>
  </div>
);

export const Mistake: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const long = t >= S.ten;
  const back = t >= S.fix;
  const code = buttonCode({ add: true, reset: true, delayMs: long && !back ? 10000 : 10 });
  const last = code.length - 3;
  const resetAt = code.indexOf(WDT_RESET);
  const rel = code.indexOf(RELEASE_LOOP);
  const marks = [
    ...(long && !back ? [{ line: last, at: S.ten, token: '10000', strong: true, label: '10 s' }] : []),
    ...(t >= S.main ? [{ line: resetAt, at: S.main, token: 'esp_task_wdt_reset()', label: '✓ check in here' }] : []),
    ...(t >= S.release ? [{ line: rel, at: S.release, token: 'while (gpio_get_level(BUTTON) == 0)', label: '✗ not in here' }] : []),
  ];
  const V = S.views;
  return (
    <CodeSplit
      t={t}
      frames={Math.round(sceneDur('mistake') * FPS)}
      kicker="The mistake · stuck or just slow?"
      accent="amber"
      file="main/main.c · button_task"
      code={code}
      codeSize={16}
      marks={marks}
      views={[
        { at: V.lane, component: LaneView, label: 'a 10 s wait, a 5 s watchdog', accent: RED, right: () => 'recorded in QEMU' },
        { at: V.fix, component: FixView, label: 'the fix', accent: GREEN },
      ]}
      captions={S.captions}
    />
  );
};
