/**
 * FreeRTOS delay-until parts:
 *
 *   Timeline   a time axis with the beat drawn as dashed lines every 200 ms; rows can carry
 *              an LED trace (from switch times), blocks (work), brackets (a wait) and dots
 *              (a switch). `now` hides everything to its right (real-time playback).
 *
 * Re-exports the scheduler video's CodeViews / chips and the shared pills, logs and LEDs.
 * Colours: LED A (GPIO 2) amber, LED B (GPIO 19) pink, as in the earlier FreeRTOS videos;
 * work = purple; a wait = magenta (timing); the beat = cyan (structure); late = RED.
 */
import React from 'react';
import { mono } from '../../components/Explainer';
import { C, hexA } from '../../theme/palette';
import { levelAt } from './timeline';

export { after, clamp01, inOutLocal, Pill, Verdict, SerialLog, LedCard, Code, CodeViews, CV_VIEW_W, CV_VIEW_H, TaskChip, GREEN, RED, WORK } from '../freertos-scheduler/parts';

export const COL_A = C.amber;
export const COL_B = C.pink;

export type TLBlock = { a: number; b: number; color: string; label?: string; dashed?: boolean; p?: number };
export type TLBracket = { a: number; b: number; color: string; label: string; p?: number; strike?: number };
export type TLDot = { s: number; color: string; label?: string; p?: number };
export type TLRow = { name: string; color: string; edges?: number[]; blocks?: TLBlock[]; brackets?: TLBracket[]; dots?: TLDot[]; h?: number; show?: number };

export const Timeline: React.FC<{
  W: number;
  s0: number;
  s1: number;
  now?: number;
  beat?: number;
  beatP?: number;
  rows: TLRow[];
  labelW?: number;
  rowH?: number;
  unit?: 'ms' | 's';
}> = ({ W, s0, s1, now = Infinity, beat = 200, beatP = 1, rows, labelW = 170, rowH = 110, unit = 'ms' }) => {
  const L = labelW;
  const R = W - 20;
  const x = (s: number) => L + ((s - s0) / (s1 - s0)) * (R - L);
  const top = 40;
  const H = top + rows.length * rowH + 10;
  const clipX = x(Math.min(Math.max(now, s0), s1));
  const id = `tl-${W}-${rows.length}-${Math.round(s0)}`;
  const beats: number[] = [];
  for (let s = Math.ceil(s0 / beat) * beat; s <= s1; s += beat) beats.push(s);
  const fmt = (s: number) => (unit === 's' ? `${(s / 1000).toFixed(s % 1000 ? 1 : 0)} s` : `${s}`);
  return (
    <svg width={W} height={H} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <clipPath id={id}>
          <rect x={0} y={-40} width={clipX} height={H + 80} />
        </clipPath>
      </defs>
      {/* the beat */}
      <g opacity={beatP}>
        {beats.map((s) => (
          <g key={s}>
            <line x1={x(s)} y1={top - 6} x2={x(s)} y2={H - 6} stroke={hexA(C.cyan, 0.35)} strokeWidth={1.5} strokeDasharray="5 6" />
            {(beats.length < 14 || s % 1000 === 0) && (
              <text x={x(s)} y={top - 14} textAnchor="middle" style={mono(16, hexA(C.cyan, 0.9))}>
                {fmt(s)}
              </text>
            )}
          </g>
        ))}
      </g>
      {rows.map((r, i) => (
        <text key={r.name} x={0} y={top + i * rowH + rowH / 2 + 7} opacity={r.show ?? 1} style={mono(20, r.color, { fontWeight: 700 })}>
          {r.name}
        </text>
      ))}
      <g clipPath={`url(#${id})`}>
        {rows.map((r, i) => {
          const y0 = top + i * rowH;
          const h = r.h ?? 44;
          const yT = y0 + (rowH - h) / 2;
          let d = '';
          if (r.edges) {
            const n = 900;
            for (let k = 0; k <= n; k++) {
              const s = s0 + ((s1 - s0) * k) / n;
              const yy = yT + (1 - levelAt(r.edges, s)) * h;
              d += `${d ? ' L' : 'M'} ${x(s).toFixed(1)} ${yy.toFixed(1)}`;
            }
          }
          return (
            <g key={i} opacity={r.show ?? 1}>
              {(r.blocks ?? []).map((b, k) => {
                const xa = x(Math.max(b.a, s0));
                const xb = x(Math.min(b.b, s1));
                if (xb <= xa) return null;
                return (
                  <g key={k} opacity={b.p ?? 1}>
                    <rect x={xa} y={yT} width={xb - xa} height={h} rx={6} fill={hexA(b.color, b.dashed ? 0.06 : 0.3)} stroke={b.color} strokeWidth={1.5} strokeDasharray={b.dashed ? '6 6' : undefined} />
                    {b.label && xb - xa > b.label.length * 9 && (
                      <text x={(xa + xb) / 2} y={yT + h / 2 + 6} textAnchor="middle" style={mono(16, '#fff', { fontWeight: 700 })}>
                        {b.label}
                      </text>
                    )}
                  </g>
                );
              })}
              {d && <path d={d} fill="none" stroke={r.color} strokeWidth={3.5} style={{ filter: `drop-shadow(0 0 5px ${r.color})` }} />}
              {(r.brackets ?? []).map((b, k) => {
                const xa = x(b.a);
                const xb = x(b.b);
                const yy = yT - 8;
                return (
                  <g key={k} opacity={b.p ?? 1}>
                    <path d={`M ${xa} ${yy + 8} L ${xa} ${yy} L ${xb} ${yy} L ${xb} ${yy + 8}`} fill="none" stroke={b.color} strokeWidth={2.5} />
                    <text x={(xa + xb) / 2} y={yy - 8} textAnchor="middle" style={mono(17, b.color, { fontWeight: 700 })}>
                      {b.label}
                    </text>
                    {(b.strike ?? 0) > 0 && <line x1={xa} y1={yy - 14} x2={xa + (xb - xa) * (b.strike ?? 0)} y2={yy - 14} stroke="#ff5470" strokeWidth={3} />}
                  </g>
                );
              })}
              {(r.dots ?? []).map((dt, k) => (
                <g key={k} opacity={dt.p ?? 1}>
                  <circle cx={x(dt.s)} cy={yT + h + 14} r={7} fill={dt.color} style={{ filter: `drop-shadow(0 0 6px ${dt.color})` }} />
                  {dt.label && (
                    <text x={x(dt.s)} y={yT + h + 40} textAnchor="middle" style={mono(16, dt.color, { fontWeight: 700 })}>
                      {dt.label}
                    </text>
                  )}
                </g>
              ))}
            </g>
          );
        })}
      </g>
      {now > s0 && now < s1 && <line x1={clipX} y1={top - 6} x2={clipX} y2={H - 6} stroke={hexA(C.ink, 0.5)} strokeWidth={1.5} />}
    </svg>
  );
};
