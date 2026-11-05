/**
 * 2 · THE RULE — many tasks want the CPU; FreeRTOS chooses with one rule: of the ready
 * tasks, the highest priority runs. Priority = the number from xTaskCreate → PRIORITY.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { CaptionLine } from '../../components/CodeToHardware';
import { CodeLine } from '../../components/CodeLine';
import { mono } from '../../components/Explainer';
import { Scene } from '../../components/Type';
import { C, FONT, GRAD_TEXT, hexA } from '../../theme/palette';
import { after, clamp01, GREEN, inOutLocal, TaskChip } from './parts';
import { FPS, RULE as R, sceneDur } from './timeline';

const CHIPS = [
  { name: 'button', prio: 7 },
  { name: 'work_a', prio: 6 },
  { name: 'work_b', prio: 6 },
  { name: 'blink_fast', prio: 5 },
  { name: 'blink_slow', prio: 5 },
];

export const Rule: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const line = inOutLocal((t - R.one) / 0.8); // chips: circle → a row at the top
  const hero = after(t, R.word - 0.3, 0.5);
  const fade = 1 - 0.94 * hero;
  const cpu = after(t, R.many - 0.4) * (1 - line);
  return (
    <Scene durationInFrames={Math.round(sceneDur('rule') * FPS)}>
      <AbsoluteFill>
        <div style={{ position: 'absolute', inset: 0, opacity: fade }}>
          {/* the CPU in the middle */}
          <div style={{ position: 'absolute', left: 960 - 130, top: 430 - 90, width: 260, height: 180, borderRadius: 22, border: `3px solid ${hexA(GREEN, 0.8)}`, background: hexA(GREEN, 0.08), display: 'grid', placeItems: 'center', opacity: cpu, boxShadow: `0 0 40px ${hexA(GREEN, 0.3)}` }}>
            <div style={mono(44, GREEN, { fontWeight: 800 })}>CPU</div>
            <div style={{ ...mono(26, C.amber, { fontWeight: 700 }), opacity: after(t, R.choose) }}>which one?</div>
          </div>
          {CHIPS.map((c, i) => {
            const a = (i / CHIPS.length) * Math.PI * 2 - Math.PI / 2;
            const cx = 960 + Math.cos(a) * 520;
            const cy = 430 + Math.sin(a) * 300;
            const rx = 960 + (i - 2) * 270;
            const ry = 200;
            const x = cx + (rx - cx) * line;
            const y = cy + (ry - cy) * line;
            const p = after(t, R.many - 0.3 + i * 0.12);
            return (
              <div key={c.name} style={{ position: 'absolute', left: x - 115, top: y - 42, opacity: p }}>
                <TaskChip name={c.name} prio={c.prio} />
              </div>
            );
          })}
          {/* the rule card */}
          <div style={{ position: 'absolute', left: 260, top: 330, width: 1400, opacity: after(t, R.ready - 0.4) }}>
            <div style={{ padding: '30px 40px', borderRadius: 22, border: `2px solid ${hexA(C.cyan, 0.6)}`, background: hexA(C.cyan, 0.07), textAlign: 'center', fontFamily: FONT.sans, fontSize: 50, fontWeight: 700, color: C.ink }}>
              of the <Hi t={t} at={R.ready} color={C.cyan}>ready</Hi> tasks, the <Hi t={t} at={R.highest} color={C.amber}>highest priority</Hi> <Hi t={t} at={R.runs} color={GREEN}>runs</Hi>
            </div>
          </div>
          {/* priority = the number in xTaskCreate */}
          <div style={{ position: 'absolute', left: 260, top: 560, width: 1400, display: 'grid', justifyItems: 'center', gap: 34, opacity: after(t, R.number - 0.3) }}>
            <pre style={{ margin: 0, fontFamily: FONT.mono, fontSize: 40, color: '#cfd6ff' }}>
              <CodeLine text={'xTaskCreate(blink_task, "blink_fast", 2048, &fast, 5, NULL);'} t={t} litAt={R.create} live={t >= R.create} marks={[{ token: '5', at: R.number, strong: true, label: 'priority' }]} row={1} />
            </pre>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: after(t, R.bigger) }}>
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <span key={n} style={{ ...mono(26 + n * 3, n === 5 ? C.amber : C.ink, { fontWeight: 700 }), opacity: 0.4 + n * 0.085 }}>
                  {n}
                </span>
              ))}
              <span style={{ ...mono(30, C.amber, { fontWeight: 700 }), marginLeft: 24 }}>→ bigger number</span>
              <span style={{ ...mono(30, GREEN, { fontWeight: 700 }), opacity: after(t, R.first) }}>goes first</span>
            </div>
          </div>
        </div>
        {hero > 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', opacity: hero }}>
            <div style={{ display: 'flex', ...GRAD_TEXT, fontFamily: FONT.sans, fontWeight: 900, fontSize: 200, letterSpacing: '.12em' }}>
              {'PRIORITY'.split('').map((ch, i) => {
                const p = clamp01((t - (R.word - 0.2) - i * 0.07) / 0.3);
                return (
                  <span key={i} style={{ opacity: p, transform: `translateY(${(1 - p) * 30}px)`, display: 'inline-block' }}>
                    {ch}
                  </span>
                );
              })}
            </div>
          </div>
        )}
        {hero <= 0 && (
          <div style={{ position: 'absolute', top: 944, width: '100%', display: 'grid', placeItems: 'center' }}>
            <CaptionLine captions={R.captions} t={t} size={32} />
          </div>
        )}
      </AbsoluteFill>
    </Scene>
  );
};

const Hi: React.FC<{ t: number; at: number; color: string; children: React.ReactNode }> = ({ t, at, color, children }) => {
  const p = after(t, at);
  return <span style={{ color: p > 0.5 ? color : C.ink, textShadow: p > 0.5 ? `0 0 24px ${hexA(color, 0.6)}` : undefined, borderBottom: `4px solid ${hexA(color, p)}` }}>{children}</span>;
};
