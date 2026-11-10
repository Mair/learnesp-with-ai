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
export type Callout = { from: number; to: number; box: Box; text: string; side?: 'above' | 'below' | 'right' | 'left' };
/** A command or note to read/copy, centered over the dimmed screen. */
export type Card = { from: number; to: number; title: string; lines: string[]; mono?: boolean; note?: string };
/** The step indicator shown top-left while `from ≤ t < to`. */
export type Chapter = { from: number; to: number; text: string };

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

const fade = (t: number, from: number, to: number, d = 0.35) => {
  if (to - from <= 0.02) return 0;
  const k = Math.min(d, (to - from) / 2 - 0.005); // short windows: shorter ramps
  return interpolate(t, [from, from + k, to - k, to], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
};

export const ScreenCapture: React.FC<{
  src: string;
  size: [number, number];
  shots: Shot[];
  spots?: Spot[];
  callouts?: Callout[];
  cards?: Card[];
  chapters?: Chapter[];
  /** Output seconds → take seconds (holds, speed-ups, cuts). Default: 1:1. */
  remap?: (t: number) => number;
}> = ({ src, size, shots, spots = [], callouts = [], cards = [], chapters = [], remap }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cam = cameraAt(t, shots, size);
  const takeFrame = Math.round((remap ? remap(t) : t) * fps);
  // Playback speed over the last ~half second → the "×N" badge on sped-up stretches.
  const rate = remap ? (remap(t) - remap(Math.max(0, t - 0.5))) / Math.min(0.5, Math.max(t, 1e-3)) : 1;
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
          {/* Pick the take frame with trimBefore and freeze at 0: <Freeze frame> is
              clamped to this composition's length, so a take longer than the
              video would stick at that frame. */}
          <Freeze frame={0}>
            <OffthreadVideo src={staticFile(src)} trimBefore={takeFrame} muted style={{ width: size[0], height: size[1] }} />
          </Freeze>
        </div>
        {spots.map((sp, i) => {
          const o = fade(t, sp.from, sp.to);
          if (o <= 0) return null;
          const [x, y, w, h] = sp.box;
          // Dim everything except the box, evenly: an SVG with the box cut out.
          // (A huge box-shadow on a rounded box gets rounded corners just as
          // huge, and the dim turns into a dark oval in the middle of the frame.)
          const [SW, SH] = size;
          const r = 8;
          const hole = `M${x + r},${y} h${w - 2 * r} a${r},${r} 0 0 1 ${r},${r} v${h - 2 * r} a${r},${r} 0 0 1 ${-r},${r} h${-(w - 2 * r)} a${r},${r} 0 0 1 ${-r},${-r} v${-(h - 2 * r)} a${r},${r} 0 0 1 ${r},${-r} Z`;
          return (
            <React.Fragment key={i}>
              <svg
                width={SW * 3}
                height={SH * 3}
                viewBox={`${-SW} ${-SH} ${SW * 3} ${SH * 3}`}
                style={{ position: 'absolute', left: -SW, top: -SH, opacity: o, pointerEvents: 'none' }}
              >
                <path d={`M${-SW},${-SH} h${SW * 3} v${SH * 3} h${-SW * 3} Z ${hole}`} fill="rgba(4,2,16,0.5)" fillRule="evenodd" />
              </svg>
              <div
                style={{
                  position: 'absolute',
                  left: x,
                  top: y,
                  width: w,
                  height: h,
                  borderRadius: r,
                  opacity: o,
                  outline: `3px solid ${C.cyan}`,
                  boxShadow: `0 0 28px ${hexA(C.cyan, 0.7)}`,
                }}
              />
            </React.Fragment>
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
            : side === 'left'
            ? { right: OUT_W - b.x + 36 - lift, top: b.y + b.h / 2 - CH / 2 }
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
      {rate > 1.6 && (
        <div
          style={{
            position: 'absolute',
            right: 48,
            top: 40,
            padding: '10px 22px',
            borderRadius: 14,
            background: hexA(C.bg1, 0.9),
            border: `2px solid ${hexA(C.amber, 0.9)}`,
            color: C.amber,
            fontFamily: FONT.mono,
            fontSize: 34,
            fontWeight: 700,
          }}
        >
          ⏩ ×{Math.round(rate)}
        </div>
      )}
      {chapters.map((c, i) => {
        const o = fade(t, c.from, c.to, 0.4);
        if (o <= 0) return null;
        return (
          <div
            key={`ch${i}`}
            style={{
              position: 'absolute',
              left: 40,
              top: 36,
              opacity: o,
              padding: '12px 26px',
              borderRadius: 999,
              background: hexA(C.bg1, 0.92),
              border: `2px solid ${hexA(C.magenta, 0.8)}`,
              boxShadow: `0 10px 40px rgba(0,0,0,0.55)`,
              color: C.ink,
              fontFamily: FONT.sans,
              fontSize: 30,
              fontWeight: 600,
            }}
          >
            {c.text}
          </div>
        );
      })}
      {cards.map((c, i) => {
        const o = fade(t, c.from, c.to, 0.35);
        if (o <= 0) return null;
        const rise = interpolate(o, [0, 1], [24, 0]);
        return (
          <AbsoluteFill key={`card${i}`} style={{ opacity: o, background: 'rgba(4,2,16,0.55)', alignItems: 'center', justifyContent: 'center' }}>
            <div
              style={{
                transform: `translateY(${rise}px)`,
                maxWidth: 1640,
                padding: '40px 56px',
                borderRadius: 24,
                background: hexA(C.bg1, 0.96),
                border: `2px solid ${hexA(C.cyan, 0.8)}`,
                boxShadow: `0 24px 90px rgba(0,0,0,0.7), 0 0 40px ${hexA(C.cyan, 0.2)}`,
              }}
            >
              <div style={{ color: C.cyan, fontFamily: FONT.sans, fontSize: 34, fontWeight: 700, marginBottom: 22 }}>{c.title}</div>
              {c.lines.map((l, k) => (
                <div
                  key={k}
                  style={{
                    color: C.ink,
                    fontFamily: c.mono === false ? FONT.sans : FONT.mono,
                    fontSize: c.mono === false ? 38 : 34,
                    lineHeight: 1.45,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {l}
                </div>
              ))}
              {c.note && <div style={{ color: C.muted, fontFamily: FONT.sans, fontSize: 28, marginTop: 22 }}>{c.note}</div>}
            </div>
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};
