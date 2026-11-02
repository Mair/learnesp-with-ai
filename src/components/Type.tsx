/**
 * Typography system. Each component takes a scene-relative `delay` in seconds
 * and animates itself — no --d custom properties, no master-timeline maths.
 */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, FONT, GRAD_TEXT, hexA } from '../theme/palette';
import { useEntrance, useScene, EntranceKind } from './anim';

export const Kicker: React.FC<{
  children: React.ReactNode;
  delay: number;
  accent?: 'cyan' | 'amber' | 'magenta';
}> = ({ children, delay, accent = 'cyan' }) => {
  const col = accent === 'cyan' ? C.cyan : accent === 'amber' ? C.amber : C.magenta;
  return (
    <div
      style={{
        ...useEntrance(delay, 'fade'),
        fontSize: 22,
        letterSpacing: '.42em',
        textTransform: 'uppercase',
        color: col,
        fontWeight: 600,
        textShadow: `0 0 22px ${hexA(col, 0.75)}`,
      }}
    >
      {children}
    </div>
  );
};

export const Hero: React.FC<{
  children: React.ReactNode;
  delay: number;
  size?: number;
  kind?: EntranceKind;
}> = ({ children, delay, size = 150, kind = 'wipe' }) => (
  <h1
    style={{
      ...useEntrance(delay, kind),
      ...GRAD_TEXT,
      fontSize: size,
      fontWeight: 800,
      letterSpacing: '.06em',
      lineHeight: 0.96,
      margin: 0,
    }}
  >
    {children}
  </h1>
);

export const Rule: React.FC<{ delay: number; width?: number }> = ({
  delay,
  width = 260,
}) => (
  <div
    style={{
      ...useEntrance(delay, 'lineGrow'),
      height: 3,
      width,
      borderRadius: 3,
      background: `linear-gradient(90deg, ${C.cyan}, ${C.magenta}, transparent)`,
    }}
  />
);

export const Lede: React.FC<{
  children: React.ReactNode;
  delay: number;
  maxWidth?: number;
  size?: number;
}> = ({ children, delay, maxWidth = 1180, size = 34 }) => (
  <p
    style={{
      ...useEntrance(delay, 'up'),
      fontSize: size,
      fontWeight: 400,
      color: '#cfd6ff',
      lineHeight: 1.45,
      maxWidth,
      textAlign: 'center',
      margin: 0,
    }}
  >
    {children}
  </p>
);

/**
 * Scene wrapper. Handles the in/out transition and the 1920x1080 type context.
 * `durationInFrames` must match the <Sequence> that wraps it.
 */
export const Scene: React.FC<{
  children: React.ReactNode;
  durationInFrames: number;
}> = ({ children, durationInFrames }) => (
  <AbsoluteFill
    style={{
      ...useScene(durationInFrames),
      zIndex: 10,
      display: 'grid',
      placeItems: 'center',
      fontFamily: FONT.sans,
      color: C.ink,
    }}
  >
    {children}
  </AbsoluteFill>
);
