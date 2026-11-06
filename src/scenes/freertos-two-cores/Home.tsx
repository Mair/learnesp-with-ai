/**
 * 3 · WHO LIVES ON CORE 0 — app_main (1), and ESP-IDF's own tasks such as Wi-Fi and
 * Bluetooth when you use them (dashed) → core 1 for your own heavy work.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { CaptionLine } from '../../components/CodeToHardware';
import { mono } from '../../components/Explainer';
import { Kicker, Scene } from '../../components/Type';
import { C } from '../../theme/palette';
import { after, CoreBoard, GREEN } from './parts';
import { FPS, HOME as H, sceneDur } from './timeline';

export const Home: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const dashedNote = (t: number) => (t >= H.use ? <span style={{ opacity: after(t, H.use) }}>when you use them</span> : null);
  return (
    <Scene durationInFrames={Math.round(sceneDur('home') * FPS)}>
      <AbsoluteFill>
        <div style={{ position: 'absolute', top: 40, width: '100%', display: 'grid', placeItems: 'center' }}>
          <Kicker delay={0.1} accent="cyan">
            Who lives on core 0
          </Kicker>
        </div>
        <div style={{ position: 'absolute', left: 160, top: 150 }}>
          <CoreBoard
            t={t}
            lit={[0, after(t, H.heavy)]}
            notes={[
              t >= H.idf ? <span style={{ color: C.cyan, opacity: after(t, H.idf) }}>app_main + ESP-IDF's own tasks</span> : null,
              t >= H.heavy ? <span style={{ color: GREEN, opacity: after(t, H.heavy) }}>your own heavy work ✓</span> : null,
            ]}
            chips={[
              { name: 'app_main', prio: 1, path: [[H.main - 0.3, 'top'], [H.main, 'c0']] },
              { name: 'Wi-Fi', dashed: true, path: [[H.wifi - 0.3, 'top'], [H.wifi, 'c2']], note: dashedNote },
              { name: 'Bluetooth', dashed: true, path: [[H.bt - 0.3, 'top'], [H.bt, 'c3']], note: dashedNote },
              { name: 'work_a', prio: 6, path: [[H.heavy - 0.3, 'top'], [H.heavy, 'd0']], pinAt: H.heavy + 0.6 },
              { name: 'work_b', prio: 6, path: [[H.heavy - 0.1, 'top'], [H.heavy + 0.2, 'd2']], pinAt: H.heavy + 0.8 },
            ]}
          >
            {t >= H.ask && t < H.main + 0.5 && (
              <div style={{ position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', ...mono(90, C.amber, { fontWeight: 800 }), opacity: after(t, H.ask) * (1 - after(t, H.main)) }}>?</div>
            )}
          </CoreBoard>
        </div>
        <div style={{ position: 'absolute', top: 944, width: '100%', display: 'grid', placeItems: 'center' }}>
          <CaptionLine captions={H.captions} t={t} size={32} />
        </div>
      </AbsoluteFill>
    </Scene>
  );
};
