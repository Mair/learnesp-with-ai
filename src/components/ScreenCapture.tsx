/**
 * ScreenCapture — plays a recorded screen take (capture/) with a virtual
 * camera that glides between UI boxes from the take's event log, plus
 * spotlights and callouts pinned to those boxes.
 *
 * All boxes are in source pixels of the recording (e.g. 2560×1440). The
 * camera maps a source rect onto the 1920×1080 frame; spotlights live in
 * source space (so they track the UI exactly), callouts in frame space (so
 * their type stays a constant size whatever the zoom).
 */
import React from 'react';
import { AbsoluteFill, Easing, Freeze, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, FONT, hexA } from '../theme/palette';

export type Box = [x: number, y: number, w: number, h: number];
export type Rect = { x: number; y: number; w: number }; // h = w * 9/16

/** Camera keyframe: from `at` the camera moves to frame `box` (null = whole screen). */
export type Shot = { at: number; box: Box | null; pad?: number; maxZoom?: number; move?: number };
export type Spot = { from: number; to: number; box: Box };
export type Callout = { from: number; to: number; box: Box; text: string; side?: 'above' | 'below' | 'right' };

const OUT_W = 1920;
const OUT_H = 1080;
const ASPECT = OUT_H / OUT_W;
const MOVE = 0.9; // seconds per camera move
const ease = Easing.bezier(0.45, 0, 0.2, 1);

/** The source rect a shot frames: padded box, 16:9, capped zoom, kept on screen. */
export function frameRect(shot: Shot, src: [number, number]): Rect {
  const [SW, SH] = src;
  if (!shot.box) {
    const m = 0.04; // whole screen with a margin of backdrop around it
    return { x: -SW * m, y: -SH * m, w: SW * (1 + 2 * m) };
  }
  const [bx, by, bw, bh] = shot.box;
  const pad = shot.pad ?? 1.25;
  let w = Math.max(bw * pad, (bh * pad) / ASPECT, SW / (shot.maxZoom ?? 2.4));
  w = Math.min(w, SW);
  const h = w * ASPECT;
  const cx = bx + bw / 2;
  const cy = by + bh / 2;
  const x = Math.min(Math.max(cx - w / 2, 0), SW - w);
  const y = Math.min(Math.max(cy - h / 2, 0), SH - h);
  return { x, y, w };
}

export function cameraAt(t: number, shots: Shot[], src: [number, number]): Rect {
  let cur = frameRect({ at: 0, box: null }, src);
  for (const s of shots) {
    const dur = s.move ?? MOVE;
    if (t <= s.at) break;
    const next = frameRect(s, src);
    const k = ease(Math.min(1, (t - s.at) / dur));
    // Zoom in log space so the move feels even; centre follows linearly.
    const w = Math.exp(Math.log(cur.w) + (Math.log(next.w) - Math.log(cur.w)) * k);
    const cx = cur.x + cur.w / 2 + (next.x + next.w / 2 - (cur.x + cur.w / 2)) * k;
    const cy = cur.y + (cur.w * ASPECT) / 2 + (next.y + (next.w * ASPECT) / 2 - (cur.y + (cur.w * ASPECT) / 2)) * k;
    cur = { x: cx - w / 2, y: cy - (w * ASPECT) / 2, w };
  }
  return cur;
}

const fade = (t: number, from: number, to: number, d = 0.35) =>
  interpolate(t, [from, from + d, to - d, to], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

export const ScreenCapture: React.FC<{
  src: string;
  size: [number, number];
  shots: Shot[];
  spots?: Spot[];
  callouts?: Callout[];
  /** Output seconds → take seconds (holds, speed-ups, cuts). Default: 1:1. */
  remap?: (t: number) => number;
}> = ({ src, size, shots, spots = [], callouts = [], remap }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cam = cameraAt(t, shots, size);
  const takeFrame = Math.round((remap ? remap(t) : t) * fps);
  const s = OUT_W / cam.w;
  const toScreen = ([x, y, w, h]: Box) => ({ x: (x - cam.x) * s, y: (y - cam.y) * s, w: w * s, h: h * s });

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          width: size[0],
          height: size[1],
          transformOrigin: '0 0',
          transform: `scale(${s}) translate(${-cam.x}px, ${-cam.y}px)`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 18,
            overflow: 'hidden',
            boxShadow: `0 30px 120px rgba(0,0,0,0.65), 0 0 0 2px ${hexA(C.violet, 0.5)}`,
          }}
        >
          <Freeze frame={takeFrame}>
            <OffthreadVideo src={staticFile(src)} muted style={{ width: size[0], height: size[1] }} />
          </Freeze>
        </div>
        {spots.map((sp, i) => {
          const o = fade(t, sp.from, sp.to);
          if (o <= 0) return null;
          const [x, y, w, h] = sp.box;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: w,
                height: h,
                borderRadius: 8,
                opacity: o,
                outline: `3px solid ${C.cyan}`,
                boxShadow: `0 0 0 4000px rgba(4,2,16,0.55), 0 0 28px ${hexA(C.cyan, 0.7)}`,
              }}
            />
          );
        })}
      </div>
      {callouts.map((c, i) => {
        const o = fade(t, c.from, c.to, 0.3);
        if (o <= 0) return null;
        const b = toScreen(c.box);
        const side = c.side ?? 'above';
        const lift = interpolate(o, [0, 1], [14, 0]);
        const CH = 74; // callout height at fontSize 34
        const pos =
          side === 'right'
            ? { left: b.x + b.w + 36 - lift, top: b.y + b.h / 2 - CH / 2 }
            : {
                left: Math.min(Math.max(b.x, 40), OUT_W - 900),
                top: side === 'above' ? b.y - 22 - CH + lift : b.y + b.h + 22 - lift,
              };
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              ...pos,
              opacity: o,
              padding: '16px 28px',
              borderRadius: 16,
              background: hexA(C.bg1, 0.92),
              border: `2px solid ${hexA(C.cyan, 0.8)}`,
              boxShadow: `0 12px 50px rgba(0,0,0,0.6), 0 0 30px ${hexA(C.cyan, 0.25)}`,
              color: C.ink,
              fontFamily: FONT.sans,
              fontSize: 34,
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            {c.text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
