/**
 * 7 · THE QUEUE — joining the ISR and the task.
 *   create     xQueueCreate(10, sizeof(uint32_t)) → 10 slots × 4 bytes
 *   receive    xQueueReceive(…, portMAX_DELAY) → no timeout
 *   suspended  portMAX_DELAY + INCLUDE_vTaskSuspend → the suspended list: no timer wakes it
 *
 * FACTS: queue.h l.149, l.745–770; tasks.c l.6379–6386; FreeRTOSConfig.h l.213.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { GREEN, mono } from '../../components/Explainer';
import { C, FONT, hexA } from '../../theme/palette';
import { after, BIG_W, inOutLocal, Pill, ViewStage } from './parts';
import { FPS, QUEUE as S, QUEUE_LEN, sceneDur } from './timeline';

export const Queue: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const V = S.views;
  return (
    <ViewStage
      t={t}
      frames={Math.round(sceneDur('queue') * FPS)}
      kicker="The queue · ISR → task"
      accent="cyan"
      captions={S.captions}
      views={[
        { at: V.create, component: CreateView, label: 'xQueueCreate(10, sizeof(uint32_t))', accent: C.cyan, right: () => 'freertos/queue.h' },
        { at: V.receive, component: ReceiveView, label: 'the task waits', accent: C.cyan },
        { at: V.suspended, component: SuspendedView, label: "FreeRTOS's task lists", accent: GREEN, right: () => 'tasks.c · INCLUDE_vTaskSuspend = 1' },
      ]}
    />
  );
};

const CreateView: React.FC<{ t: number }> = ({ t }) => {
  const c = S.create;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', justifyItems: 'center', gap: 30 }}>
      <div style={{ opacity: after(t, c.worlds), display: 'flex', alignItems: 'center', gap: 30, fontSize: 28 }}>
        <Pill color={C.amber} size={26}>
          button_isr · interrupt world
        </Pill>
        <span style={{ color: C.muted }}>→ queue →</span>
        <Pill color={C.cyan} size={26}>
          app_main · task world
        </Pill>
      </div>
      <div style={{ display: 'flex', gap: 10, opacity: after(t, c.create) }}>
        {Array.from({ length: QUEUE_LEN }, (_, i) => {
          const p = after(t, c.ten + i * 0.06, 0.3);
          return (
            <div key={i} style={{ opacity: p, width: 100, height: 110, borderRadius: 12, border: `2px solid ${hexA(C.cyan, 0.7)}`, background: hexA(C.cyan, 0.06), display: 'grid', placeItems: 'center', ...mono(18, C.muted) }}>
              <div style={{ textAlign: 'center' }}>
                slot {i}
                <div style={{ opacity: after(t, c.four), color: C.cyan, fontSize: 22, fontWeight: 700 }}>4 B</div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ opacity: after(t, c.four), ...mono(28, C.ink) }}>
        10 × sizeof(uint32_t) = 10 × 4 = <b style={{ color: C.cyan }}>40 bytes</b>
      </div>
    </div>
  );
};

const ReceiveView: React.FC<{ t: number }> = ({ t }) => {
  const r = S.receive;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 26, padding: '0 60px' }}>
      <div style={{ opacity: after(t, r.receive), fontFamily: FONT.mono, fontSize: 34, color: '#fff', padding: '12px 18px', borderLeft: `4px solid ${C.cyan}`, background: `linear-gradient(90deg, ${hexA(C.cyan, 0.16)}, transparent)` }}>
        xQueueReceive(button_events, &pin, <b style={{ color: C.amber }}>portMAX_DELAY</b>);
      </div>
      <div style={{ opacity: after(t, r.max), ...mono(28, C.ink) }}>
        portMAX_DELAY = <b style={{ color: C.amber }}>0xFFFFFFFF</b> <span style={{ color: C.muted }}>→ "no timeout"</span>
      </div>
      <div style={{ opacity: after(t, r.long), fontSize: 28, color: C.ink }}>blocks until an item arrives — for as long as it takes</div>
    </div>
  );
};

const SuspendedView: React.FC<{ t: number }> = ({ t }) => {
  const s = S.suspended;
  const move = inOutLocal((t - s.list) / 0.7);
  const lists = ['Ready', 'Delayed (by tick)', 'Suspended'];
  const colX = (i: number) => 120 + i * 470;
  const cardX = colX(0) + (colX(2) - colX(0)) * move;
  const tickPhase = (t * 1.5) % 1;
  const back = after(t, s.arrives + 0.4);
  const x = back > 0 ? cardX + (colX(0) - cardX) * back : cardX;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg width={BIG_W} height={560} style={{ display: 'block', overflow: 'visible' }}>
        {lists.map((l, i) => (
          <g key={l} opacity={after(t, s.parks - 0.5)}>
            <rect x={colX(i) - 20} y={80} width={380} height={330} rx={16} fill="rgba(255,255,255,.03)" stroke={i === 2 ? hexA(GREEN, 0.6) : 'rgba(255,255,255,.18)'} />
            <text x={colX(i) + 170} y={60} textAnchor="middle" style={mono(24, i === 2 ? GREEN : C.ink, { fontWeight: 700 })}>
              {l}
            </text>
          </g>
        ))}
        {/* ticks sweep the delayed list, not the suspended one */}
        <g opacity={after(t, s.timer)}>
          {[0, 1, 2].map((k) => {
            const y = 100 + ((tickPhase + k / 3) % 1) * 290;
            return <line key={k} x1={colX(1) - 10} y1={y} x2={colX(1) + 350} y2={y} stroke={hexA(C.cyan, 0.5)} strokeWidth={2} strokeDasharray="8 6" />;
          })}
          <text x={colX(1) + 170} y={440} textAnchor="middle" style={mono(18, C.cyan)}>
            the tick checks these
          </text>
          <text x={colX(2) + 170} y={440} textAnchor="middle" style={mono(18, GREEN)}>
            no timer looks here
          </text>
        </g>
        <g opacity={after(t, s.parks - 0.3)} transform={`translate(${x} 200)`}>
          <rect x={0} y={0} width={340} height={90} rx={14} fill={hexA(C.cyan, 0.18)} stroke={C.cyan} strokeWidth={2.5} />
          <text x={170} y={38} textAnchor="middle" style={mono(22, '#fff', { fontWeight: 700 })}>
            main task
          </text>
          <text x={170} y={68} textAnchor="middle" style={mono(17, C.muted)}>
            {back > 0.5 ? 'an item arrived → ready' : 'xQueueReceive(…, portMAX_DELAY)'}
          </text>
        </g>
      </svg>
      <div style={{ position: 'absolute', left: 100, top: 590, opacity: after(t, s.nothing) }}>
        <Pill color={GREEN} size={26}>
          waiting costs nothing: 0 wake-ups until a press
        </Pill>
      </div>
    </div>
  );
};
