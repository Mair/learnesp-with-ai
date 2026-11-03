/**
 * 8 · UNDER THE HOOD — what xTaskCreate really does.
 *
 *   task.h          xTaskCreate → xTaskCreatePinnedToCore(…, tskNO_AFFINITY)
 *   additions       stack, then TCB, from the heap
 *   tasks.c         fill 0xa5, copy the name (cut at 15), store the priority
 *   port.c          first frame: pc = vPortTaskWrapper, args = your function + parameter
 *   tasks.c         ready list; outranks the running task → yield
 *
 * Same layer-descent pattern as the GPIO videos. Source: ESP-IDF release/v5.5.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { EASE_OUT } from '../../components/anim';
import { CodeLine, NOTE_ROW } from '../../components/CodeLine';
import { Panel } from '../../components/Panel';
import { Kicker, Scene } from '../../components/Type';
import { C, FONT, hexA } from '../../theme/palette';
import { FPS, IDF, IDF_VERSION, sceneDur } from './timeline';

type Layer = (typeof IDF.layers)[number];
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const inOut = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2);

const VIEW_W = 1600;
const VIEW_H = 800;
const GAP = 84;
const LINE = 24 * 1.65;
const labelled = (l: Layer) => new Set(l.marks.filter((m) => m.label).map((m) => m.line)).size;
const cardH = (l: Layer) => Math.round(66 + l.code.length * LINE + 10 + labelled(l) * NOTE_ROW);
const VIA = ['', 'calls', 'then', 'then', 'then'];

export const UnderTheHood: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const tops: number[] = [];
  let y = 0;
  for (const l of IDF.layers) {
    tops.push(y);
    y += cardH(l) + GAP;
  }
  const keys = IDF.layers.map((l, i) => ({
    at: i === 0 ? 0 : l.at - 0.1,
    focus: i === 0 ? cardH(l) / 2 : (tops[i - 1] + tops[i] + cardH(l)) / 2,
  }));
  let camY = VIEW_H / 2 - keys[0].focus;
  for (let i = 1; i < keys.length; i++) {
    const u = inOut(clamp01((t - keys[i].at) / 1.0));
    const from = VIEW_H / 2 - keys[i - 1].focus;
    const to = VIEW_H / 2 - keys[i].focus;
    if (t >= keys[i].at) camY = from + (to - from) * u;
  }
  const current = keys.reduce((acc, k, i) => (t >= k.at ? i : acc), 0);
  const intro = EASE_OUT(clamp01((t - 0.4) / 0.6));

  return (
    <Scene durationInFrames={Math.round(sceneDur('idf') * FPS)}>
      <AbsoluteFill>
        <div style={{ position: 'absolute', top: 52, width: '100%', display: 'grid', placeItems: 'center', gap: 10 }}>
          <Kicker delay={0.1} accent="magenta">
            Under the hood
          </Kicker>
          <div style={{ fontFamily: FONT.mono, fontSize: 18, color: C.muted, letterSpacing: '.1em' }}>{IDF_VERSION}</div>
        </div>
        <div style={{ position: 'absolute', top: 186, width: '100%', textAlign: 'center', opacity: intro * (1 - clamp01((t - IDF.layers[0].at) / 0.4)), fontFamily: FONT.mono, fontSize: 40, color: '#cfd6ff' }}>
          xTaskCreate(blink_task, "blink_fast", 2048, &fast, 5, NULL);
        </div>
        <div
          style={{
            position: 'absolute',
            top: 170,
            left: (1920 - VIEW_W) / 2,
            width: VIEW_W,
            height: VIEW_H,
            overflow: 'hidden',
            opacity: clamp01((t - IDF.layers[0].at + 0.3) / 0.4),
            maskImage: 'linear-gradient(180deg, transparent 0, #000 60px, #000 calc(100% - 60px), transparent 100%)',
            WebkitMaskImage: 'linear-gradient(180deg, transparent 0, #000 60px, #000 calc(100% - 60px), transparent 100%)',
          }}
        >
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, transform: `translateY(${camY}px)` }}>
            {IDF.layers.map((l, i) => (
              <React.Fragment key={i}>
                {i > 0 && <Arrow top={tops[i] - GAP} label={`${VIA[i]} · ${l.title}`} t={t - l.at} />}
                <LayerCard layer={l} top={tops[i]} t={t} dim={current > i} />
              </React.Fragment>
            ))}
          </div>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

const LayerCard: React.FC<{ layer: Layer; top: number; t: number; dim: boolean }> = ({ layer, top, t, dim }) => {
  const p = EASE_OUT(clamp01((t - layer.at) / 0.6));
  if (p <= 0) return null;
  const fired = layer.marks.filter((m) => t >= m.at).sort((a, b) => b.at - a.at);
  const liveLine = dim ? -1 : (fired[0]?.line ?? -1);
  return (
    <div style={{ position: 'absolute', top, left: 0, right: 0, height: cardH(layer), opacity: p * (dim ? 0.5 : 1), transform: `translateY(${(1 - p) * 30}px)` }}>
      <Panel label={layer.title} accent={C.cyan} right={layer.file}>
        <pre style={{ margin: 0, fontFamily: FONT.mono, fontSize: 24, lineHeight: 1.65, color: '#cfd6ff' }}>
          {layer.code.map((line, li) => {
            const marks = layer.marks.filter((m) => m.line === li);
            const f = marks.filter((m) => t >= m.at);
            const litAt = f.length ? Math.min(...f.map((m) => m.at)) : null;
            return <CodeLine key={li} text={line} t={t} litAt={litAt} live={li === liveLine} marks={marks} row={marks.some((m) => m.label) ? 1 : 0} />;
          })}
        </pre>
      </Panel>
    </div>
  );
};

const Arrow: React.FC<{ top: number; label: string; t: number }> = ({ top, label, t }) => {
  const p = EASE_OUT(clamp01(t / 0.5));
  if (p <= 0) return null;
  const h = GAP - 16;
  return (
    <div style={{ position: 'absolute', top: top + 8, left: 70, height: h, opacity: p }}>
      <svg width={30} height={h} style={{ position: 'absolute', left: 0, top: 0 }}>
        <line x1={15} y1={0} x2={15} y2={(h - 10) * p} stroke={C.cyan} strokeWidth={3} />
        <path d={`M 5 ${h - 14} L 15 ${h} L 25 ${h - 14}`} fill="none" stroke={C.cyan} strokeWidth={3} opacity={p} />
      </svg>
      <div style={{ position: 'absolute', left: 48, top: h / 2 - 15, fontFamily: FONT.mono, fontSize: 22, color: C.cyan, whiteSpace: 'nowrap', textShadow: `0 0 12px ${hexA(C.cyan, 0.6)}` }}>{label}</div>
    </div>
  );
};
