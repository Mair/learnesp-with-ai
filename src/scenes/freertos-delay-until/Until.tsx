/**
 * 5 · xTaskDelayUntil — opens on the loop (last line lit), then the Explainer:
 * &last (read and moved on) and the period (200 ms = 20 ticks). Next beat = last + 20,
 * wait until the tick count reaches it, last moves on; beats always 20 apart; under
 * 10 ms = 0 ticks → assert; vTaskDelayUntil (old) → xTaskDelayUntil.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { CodeLine } from '../../components/CodeLine';
import { ease, Explainer, inOut, mono, VIEW_W as W } from '../../components/Explainer';
import { Panel } from '../../components/Panel';
import { C, FONT, hexA } from '../../theme/palette';
import { after, clamp01, GREEN, Pill, RED, SerialLog, Verdict, WORK } from './parts';
import { FPS, LAST0, sceneDur, SET_CODE, UNTIL as S, UNTIL_CODE } from './timeline';

const WAIT_LINE = UNTIL_CODE.findIndex((l) => l.includes('xTaskDelayUntil'));

const Intro: React.FC<{ t: number }> = ({ t }) => {
  const cin = ease((t - S.intro.show) / 0.6);
  const out = inOut((t - S.intro.out) / 0.6);
  if (out >= 1) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 11 }}>
      <div style={{ position: 'absolute', left: 460, top: 200, width: 1000, height: 600, opacity: cin * (1 - out), transform: `translateY(${(1 - cin) * 24 - out * 120}px)` }}>
        <Panel label="main/main.c · until_task" accent={C.cyan} right="ESP-IDF">
          <pre style={{ margin: 0, fontFamily: FONT.mono, fontSize: 24, lineHeight: 1.55, color: '#cfd6ff' }}>
            {UNTIL_CODE.map((l, i) => (
              <div key={i} style={{ minHeight: '1.55em', opacity: i === WAIT_LINE ? 1 : 1 - 0.7 * after(t, S.intro.show + 0.6) }}>
                <CodeLine text={l} t={t} litAt={i === WAIT_LINE ? S.intro.show + 0.4 : null} live={i === WAIT_LINE && t >= S.intro.show + 0.4} />
              </div>
            ))}
          </pre>
        </Panel>
      </div>
    </AbsoluteFill>
  );
};

/** a tick ruler 115…195 with flags; `needle` = the tick count */
const Ruler: React.FC<{ flags: { k: number; label: string; color: string; p: number; dashed?: boolean }[]; needle?: number; work?: { a: number; b: number }[]; brackets?: { a: number; b: number; label: string; p: number }[] }> = ({ flags, needle, work = [], brackets = [] }) => {
  const L = 60;
  const R = W - 60;
  const t0 = 115;
  const t1 = 195;
  const x = (k: number) => L + ((k - t0) / (t1 - t0)) * (R - L);
  return (
    <svg width={W} height={260} style={{ display: 'block', overflow: 'visible' }}>
      <line x1={L} y1={170} x2={R} y2={170} stroke={hexA(C.cyan, 0.5)} strokeWidth={2} />
      {Array.from({ length: t1 - t0 + 1 }, (_, i) => t0 + i).map((k) => (
        <g key={k}>
          <line x1={x(k)} y1={k % 5 === 0 ? 156 : 164} x2={x(k)} y2={k % 5 === 0 ? 184 : 176} stroke={hexA(C.cyan, needle !== undefined && k <= needle ? 0.95 : 0.35)} strokeWidth={k % 5 === 0 ? 2.5 : 1.5} />
          {k % 10 === 0 && (
            <text x={x(k)} y={210} textAnchor="middle" style={mono(16, C.muted)}>
              {k}
            </text>
          )}
        </g>
      ))}
      {work.map((b, i) => (
        <rect key={i} x={x(b.a)} y={118} width={x(b.b) - x(b.a)} height={30} rx={5} fill={hexA(WORK, 0.35)} stroke={WORK} />
      ))}
      {brackets.map((b, i) => (
        <g key={i} opacity={b.p}>
          <path d={`M ${x(b.a)} 232 L ${x(b.a)} 240 L ${x(b.b)} 240 L ${x(b.b)} 232`} fill="none" stroke={C.magenta} strokeWidth={2} />
          <text x={(x(b.a) + x(b.b)) / 2} y={258} textAnchor="middle" style={mono(15, C.magenta, { fontWeight: 700 })}>
            {b.label}
          </text>
        </g>
      ))}
      {needle !== undefined && <polygon points={`${x(needle) - 10},138 ${x(needle) + 10},138 ${x(needle)},154`} fill={C.cyan} />}
      {flags.map((f, i) => (
        <g key={i} opacity={f.p}>
          <line x1={x(f.k)} y1={40} x2={x(f.k)} y2={184} stroke={f.color} strokeWidth={3} strokeDasharray={f.dashed ? '6 5' : undefined} />
          <polygon points={`${x(f.k)},40 ${x(f.k) + 30},50 ${x(f.k)},60`} fill={f.color} />
          <text x={x(f.k) + 36} y={56} style={mono(19, f.color, { fontWeight: 700 })}>
            {f.label}
          </text>
        </g>
      ))}
    </svg>
  );
};

const LastView: React.FC<{ t: number }> = ({ t }) => {
  const changed = t >= S.change + 0.3;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 70 }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 10 }}>
        <div style={mono(22, C.muted)}>the variable last</div>
        <div style={{ ...mono(80, GREEN, { fontWeight: 800 }), padding: '10px 40px', borderRadius: 16, border: `2px solid ${hexA(GREEN, 0.7)}`, background: hexA(GREEN, 0.08), fontVariantNumeric: 'tabular-nums' }}>{changed ? LAST0 + 20 : LAST0}</div>
      </div>
      <div style={{ display: 'grid', gap: 26 }}>
        <div style={{ opacity: after(t, S.amp) }}>
          <Pill color={C.cyan} size={26}>
            &amp;last = where last lives
          </Pill>
        </div>
        <div style={{ opacity: after(t, S.read), ...mono(28, C.ink) }}>← the call reads it</div>
        <div style={{ opacity: after(t, S.change), ...mono(28, C.ink) }}>→ and changes it</div>
      </div>
    </div>
  );
};

const PeriodView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', justifyItems: 'center', gap: 30 }}>
    <div style={mono(44, C.ink, { fontWeight: 700 })}>
      pdMS_TO_TICKS(<span style={{ color: C.magenta }}>200</span>) = 200 × 100 / 1000 = <b style={{ color: C.magenta, opacity: after(t, S.ticks20) }}>20 ticks</b>
    </div>
    <div style={{ opacity: after(t, S.ticks20), ...mono(24, C.muted) }}>1 tick = 10 ms · 20 × 10 ms = 200 ms</div>
  </div>
);

const NextView: React.FC<{ t: number }> = ({ t }) => {
  const next = LAST0 + 20;
  // the tick count: just after the work (+3) until "waits", then runs to the next beat
  const needle = t < S.waits ? LAST0 + 3 : Math.round(LAST0 + 3 + 17 * clamp01((t - S.waits) / (S.reaches + 0.4 - S.waits)));
  const moved = t >= S.moves;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 12 }}>
      <div style={{ display: 'flex', gap: 30, alignItems: 'baseline', minHeight: 50 }}>
        <div style={{ ...mono(34, C.ink, { fontWeight: 700 }), opacity: after(t, S.plus) }}>
          next beat = <span style={{ color: GREEN }}>{LAST0}</span> + <span style={{ color: C.magenta }}>20</span> = <b style={{ color: C.cyan }}>{next}</b>
        </div>
        <div style={{ opacity: after(t, S.waits) }}>
          <Pill color={C.magenta} size={22}>
            {needle >= next ? 'reached → Ready → runs' : 'Blocked · waiting'}
          </Pill>
        </div>
      </div>
      <Ruler
        needle={needle}
        work={[{ a: LAST0, b: LAST0 + 3 }]}
        flags={[
          { k: moved ? next : LAST0, label: moved ? `last = ${next}` : `last = ${LAST0}`, color: GREEN, p: 1 },
          { k: next, label: 'next beat', color: C.cyan, p: moved ? 0 : after(t, S.plus), dashed: true },
        ]}
      />
      <div style={{ opacity: after(t, S.ready), ...mono(22, C.muted) }}>ready for the next loop: its next beat will be {next + 20}</div>
    </div>
  );
};

const ApartView: React.FC<{ t: number }> = ({ t }) => {
  const beats = [LAST0, LAST0 + 20, LAST0 + 40, LAST0 + 60];
  const workLen = [3, 8, 5, 3];
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 10 }}>
      <Ruler
        work={beats.map((b, i) => ({ a: b, b: b + workLen[i] }))}
        flags={beats.map((b, i) => ({ k: b, label: `${b}`, color: GREEN, p: after(t, S.always + 0.3 * i) }))}
        brackets={beats.slice(0, 3).map((b, i) => ({ a: b, b: b + 20, label: '20 ticks', p: after(t, S.always + 0.3 * i + 0.2) }))}
      />
      <div style={{ opacity: after(t, S.matter), ...mono(24, C.ink) }}>
        work: <span style={{ color: WORK }}>30 ms · 80 ms · 50 ms</span> → the beats don't move
      </div>
    </div>
  );
};

const ZeroView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 24 }}>
    <div style={{ ...mono(28, C.ink), opacity: after(t, S.whole) }}>
      whole ticks: pdMS_TO_TICKS(255) = 25 ticks = <b style={{ color: C.magenta }}>250 ms</b>
    </div>
    <div style={{ ...mono(34, C.ink, { fontWeight: 700 }), opacity: after(t, S.under) }}>
      pdMS_TO_TICKS(<span style={{ color: RED }}>5</span>) = 5 × 100 / 1000 = <b style={{ color: RED, opacity: after(t, S.zero) }}>0 ticks</b>
    </div>
    <div style={{ opacity: after(t, S.stops - 0.2) }}>
      <SerialLog t={t} size={22} label="recorded in QEMU" lines={[{ at: S.stops, text: 'assert failed: xTaskDelayUntil tasks.c:1499 (( xTimeIncrement > 0U ))', color: RED }]} />
    </div>
  </div>
);

const OldView: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30, alignContent: 'center' }}>
    <div style={{ opacity: after(t, S.older) }}>
      <Verdict ok={false} p={after(t, S.older)} size={30}>
        <span style={{ fontFamily: FONT.mono, textDecoration: 'line-through' }}>vTaskDelayUntil</span> · older examples
      </Verdict>
    </div>
    <div style={{ opacity: after(t, S.use) }}>
      <Verdict ok p={after(t, S.use)} size={30}>
        <span style={{ fontFamily: FONT.mono }}>xTaskDelayUntil</span> · ESP-IDF 6
      </Verdict>
    </div>
    <div style={{ gridColumn: '1 / -1', ...mono(20, C.muted), opacity: after(t, S.idf) }}>ESP-IDF v6.0 removed the vTaskDelayUntil compatibility function · migration guide</div>
  </div>
);

export const Until: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const V = S.views;
  return (
    <>
      <Explainer
        t={t}
        frames={Math.round(sceneDur('until') * FPS)}
        kicker="Wait for the next beat · xTaskDelayUntil()"
        code={SET_CODE}
        codeIn={S.intro.out}
        run={S.run}
        args={[
          { token: '&last', at: S.args[0], title: 'last beat', value: '&last', sub: 'read · then moved on', color: GREEN },
          { token: 'pdMS_TO_TICKS(200)', at: S.args[1], title: 'period', value: '20 ticks', sub: '200 ms', color: C.magenta },
        ]}
        captions={S.captions}
        views={[
          { at: V.last, component: LastView, active: [0], label: 'the address of last', accent: GREEN },
          { at: V.period, component: PeriodView, active: [1], label: 'the period', accent: C.magenta },
          { at: V.next, component: NextView, active: [0, 1], label: 'what the call does', accent: C.cyan, right: () => 'tick numbers are examples' },
          { at: V.apart, component: ApartView, active: [0, 1], label: 'always 20 ticks apart', accent: GREEN },
          { at: V.zero, component: ZeroView, active: [1], label: 'periods are whole ticks', accent: RED, right: () => 'tasks.c · configASSERT' },
          { at: V.old, component: OldView, active: [], label: 'the old name', accent: C.amber },
        ]}
      />
      <Intro t={t} />
    </>
  );
};
