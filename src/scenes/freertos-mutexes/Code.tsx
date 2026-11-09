/**
 * 4 · CODE — the program, both tasks at once: one function, two cursors. work_a (purple,
 * left gutter) and work_b (blue, right gutter) both reach xSemaphoreTake; the holder of the
 * key walks take → total++ → give, the other waits on the take line, asleep; then they swap.
 * Last, app_main's xSemaphoreCreateMutex, before the tasks.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { CodeLine } from '../../components/CodeLine';
import { ease, mono } from '../../components/Explainer';
import { Panel } from '../../components/Panel';
import { C, FONT, hexA } from '../../theme/palette';
import { after, Key, rise, Shell } from './parts';
import { CODE as S, CREATE_LINE, FPS, GIVE_LINE, GLOBAL_LINES, INC_LINE, mainCode, sceneDur, TAKE_LINE, WORKER_COLOR, workCode } from './timeline';

const CODE = ['#include "freertos/semphr.h"', '', ...GLOBAL_LINES, '', ...workCode(true), '', ...mainCode(true)];
const SIZE = 21;
const LH = SIZE * 1.5;
const TOP = 112;
const PANEL_X = 440;
const PANEL_W = 1040;
const lineY = (i: number) => TOP + 42 + i * LH + LH / 2;

/** who holds the key over time: windows [start, end, holder] */
const holdWindows = (): [number, number, 'a' | 'b'][] => {
  const w: [number, number, 'a' | 'b'][] = [];
  let t0 = S.take + 0.7;
  w.push([t0, S.give, 'a']);
  t0 = S.give;
  let who: 'a' | 'b' = 'b';
  while (t0 < S.create) {
    const t1 = Math.min(S.create, t0 + 1.4);
    w.push([t0, t1, who]);
    who = who === 'a' ? 'b' : 'a';
    t0 = t1;
  }
  return w;
};

export const Code: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const TAKE = CODE.indexOf(TAKE_LINE);
  const INC = CODE.indexOf(INC_LINE);
  const GIVE = CODE.indexOf(GIVE_LINE);
  const FOR = TAKE - 1;
  const CREATE = CODE.indexOf(CREATE_LINE);
  const wins = holdWindows();
  const win = wins.find(([a, b]) => t >= a && t < b);
  const holder = win?.[2];
  const cursorsP = after(t, S.take - 0.4) * (1 - after(t, S.create + 0.4));
  /** a cursor's line: the holder walks take → ++ → give; the other waits on take */
  const lineOf = (who: 'a' | 'b') => {
    if (t < S.take) return FOR;
    if (holder === who && win) {
      const u = (t - win[0]) / (win[1] - win[0]);
      return u < 0.3 ? TAKE : u < 0.72 ? INC : GIVE;
    }
    return TAKE;
  };
  const between = after(t, S.between) * (1 - after(t, S.create));
  const cursor = (who: 'a' | 'b') => {
    const col = WORKER_COLOR[who === 'a' ? 'work_a' : 'work_b'];
    const y = lineY(lineOf(who));
    const holds = holder === who;
    const left = who === 'a';
    return (
      <div style={{ position: 'absolute', top: y - 22, left: left ? PANEL_X - 250 : PANEL_X + PANEL_W + 20, width: 230, height: 44, display: 'flex', alignItems: 'center', justifyContent: left ? 'flex-end' : 'flex-start', gap: 10, opacity: cursorsP, transition: 'none' }}>
        {!left && <span style={{ ...mono(26, col, { fontWeight: 800 }) }}>◀</span>}
        {!left && holds && <Key size={44} glow={1} />}
        <span style={{ ...mono(18, col, { fontWeight: 700 }), padding: '4px 10px', borderRadius: 999, border: `1px solid ${hexA(col, 0.7)}`, background: hexA(col, holds ? 0.3 : 0.08), opacity: holds || t < S.take + 0.7 ? 1 : 0.6 }}>
          {who === 'a' ? 'work_a' : 'work_b'}
          {!holds && t >= S.take + 0.7 ? ' · zz' : ''}
        </span>
        {left && holds && <Key size={44} glow={1} />}
        {left && <span style={{ ...mono(26, col, { fontWeight: 800 }) }}>▶</span>}
      </div>
    );
  };
  return (
    <Shell frames={Math.round(sceneDur('code') * FPS)} kicker="The code · both tasks, one function" captions={S.captions} t={t}>
      <div style={{ position: 'absolute', left: PANEL_X, top: TOP, width: PANEL_W, ...rise(after(t, 0.2)) }}>
        <Panel label="main/main.c" accent={C.cyan} right="ESP-IDF">
          <pre style={{ margin: 0, fontFamily: FONT.mono, fontSize: SIZE, lineHeight: 1.5, color: '#cfd6ff' }}>
            {CODE.map((l, i) => {
              const lit = i === TAKE ? S.take : i === GIVE ? S.give : i === CREATE ? S.create : i === INC ? S.between : null;
              const live = lit !== null && t >= lit && (i !== INC || between > 0.05) && (i === CREATE || t < S.create);
              return (
                <div key={i} style={{ minHeight: '1.5em', position: 'relative' }}>
                  {i === INC && between > 0 && <div style={{ position: 'absolute', inset: '-2px 0', borderRadius: 6, border: `2px solid ${hexA(C.amber, 0.8 * between)}`, boxShadow: `0 0 20px ${hexA(C.amber, 0.4 * between)}` }} />}
                  <CodeLine text={l} t={t} litAt={live ? lit : null} live={live} accent={i === CREATE ? C.amber : C.cyan} />
                </div>
              );
            })}
          </pre>
        </Panel>
      </div>
      {cursor('a')}
      {cursor('b')}
      <div style={{ position: 'absolute', left: PANEL_X + 560, top: lineY(INC) - 16, ...mono(22, C.amber, { fontWeight: 700 }), opacity: between }}>← one task at a time</div>
      <div style={{ position: 'absolute', left: PANEL_X + 640, top: lineY(CREATE) - 16, ...mono(22, C.amber, { fontWeight: 700 }), opacity: ease((t - S.before) / 0.4) }}>← first, before the tasks</div>
    </Shell>
  );
};
