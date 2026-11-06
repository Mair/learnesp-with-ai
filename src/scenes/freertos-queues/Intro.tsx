/**
 * The context panel shown before an Explainer: the code the learner has, the call's lines
 * lit, the rest dimmed; it lifts away as the Explainer's call line comes in.
 */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { CodeLine } from '../../components/CodeLine';
import { ease, inOut } from '../../components/Explainer';
import { Panel } from '../../components/Panel';
import { C, FONT } from '../../theme/palette';

export const Intro: React.FC<{ t: number; show: number; out: number; label: string; code: string[]; lit: number[]; size?: number; top?: number }> = ({ t, show, out, label, code, lit, size = 24, top = 150 }) => {
  const cin = ease((t - show) / 0.6);
  const o = inOut((t - out) / 0.6);
  if (o >= 1) return null;
  const dim = ease((t - show - 0.6) / 0.5);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 11 }}>
      <div style={{ position: 'absolute', left: 280, top, width: 1360, opacity: cin * (1 - o), transform: `translateY(${(1 - cin) * 24 - o * 120}px)` }}>
        <Panel label={label} accent={C.cyan} right="ESP-IDF">
          <pre style={{ margin: 0, fontFamily: FONT.mono, fontSize: size, lineHeight: 1.6, color: '#cfd6ff' }}>
            {code.map((l, i) => {
              const on = lit.includes(i);
              return (
                <div key={i} style={{ minHeight: '1.6em', opacity: on ? 1 : 1 - 0.55 * dim }}>
                  <CodeLine text={l} t={t} litAt={on ? show + 0.6 : null} live={on} />
                </div>
              );
            })}
          </pre>
        </Panel>
      </div>
    </AbsoluteFill>
  );
};
