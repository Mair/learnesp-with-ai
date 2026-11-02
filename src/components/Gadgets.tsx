/**
 * Small physical-world props: an LED, a speaker, a slider.
 * Placeholders for macro footage — same prop surface either way.
 */
import React from 'react';
import { C, FONT, hexA } from '../theme/palette';

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export const Led: React.FC<{ brightness: number; size?: number; color?: string }> = ({
  brightness,
  size = 170,
  color = C.amber,
}) => {
  const b = clamp01(brightness);
  const core = size * 0.41;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${hexA(color, 0.9 * b)} 0%, ${hexA(color, 0.25 * b)} 40%, transparent 70%)`,
          filter: `blur(${12 + 20 * b}px)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: (size - core) / 2,
          top: (size - core) / 2,
          width: core,
          height: core,
          borderRadius: '50%',
          background: `rgba(255,214,140,${0.1 + 0.9 * b})`,
          border: `2px solid ${hexA(color, 0.5 + 0.5 * b)}`,
          boxShadow: `0 0 ${10 + 60 * b}px ${hexA(color, b)}`,
        }}
      />
    </div>
  );
};

/**
 * Speaker with sound rings. Ring spacing is a wavelength: higher pitch →
 * tighter rings. `t` drives the outward travel.
 */
export const Speaker: React.FC<{
  hz: number;
  level: number;
  t: number;
  size?: number;
  color?: string;
}> = ({ hz, level, t, size = 170, color = C.cyan }) => {
  const L = clamp01(level);
  const spacing = Math.max(8, Math.min(60, (30 * 440) / Math.max(hz, 1)));
  const cx = size * 0.38;
  const cy = size / 2;
  const span = size * 0.62;
  const travel = (t * 70) % spacing;
  const rings: number[] = [];
  for (let r = size * 0.16 + travel; r < size * 0.16 + span; r += spacing) rings.push(r);

  return (
    <svg width={size} height={size} style={{ overflow: 'visible' }}>
      {rings.map((r, i) => {
        const fade = 1 - (r - size * 0.16) / span;
        return (
          <path
            key={i}
            d={`M ${cx + r * Math.cos(-0.75)} ${cy + r * Math.sin(-0.75)} A ${r} ${r} 0 0 1 ${cx + r * Math.cos(0.75)} ${cy + r * Math.sin(0.75)}`}
            fill="none"
            stroke={color}
            strokeWidth={3}
            strokeLinecap="round"
            opacity={L * fade}
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        );
      })}
      {/* body */}
      <rect
        x={cx - size * 0.3}
        y={cy - size * 0.12}
        width={size * 0.14}
        height={size * 0.24}
        rx={3}
        fill={hexA(color, 0.15 + 0.35 * L)}
        stroke={color}
        strokeWidth={2.5}
      />
      <path
        d={`M ${cx - size * 0.16} ${cy - size * 0.12} L ${cx + size * 0.02} ${cy - size * 0.28} L ${cx + size * 0.02} ${cy + size * 0.28} L ${cx - size * 0.16} ${cy + size * 0.12} Z`}
        fill={hexA(color, 0.1 + 0.3 * L)}
        stroke={color}
        strokeWidth={2.5}
        strokeLinejoin="round"
        style={{ filter: L > 0.05 ? `drop-shadow(0 0 ${10 * L}px ${color})` : undefined }}
      />
    </svg>
  );
};

/** A horizontal slider. `ghost` draws a second, rejected knob position. */
export const Slider: React.FC<{
  value: number;
  width?: number;
  accent?: string;
  left?: string;
  right?: string;
  ghost?: { value: number; opacity: number; color: string };
}> = ({ value, width = 420, accent = C.amber, left, right, ghost }) => {
  const v = clamp01(value);
  return (
    <div style={{ display: 'grid', gap: 10, width }}>
      <div style={{ position: 'relative', height: 26 }}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 10,
            height: 6,
            borderRadius: 3,
            background: 'rgba(255,255,255,.12)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            width: `${v * 100}%`,
            top: 10,
            height: 6,
            borderRadius: 3,
            background: `linear-gradient(90deg, ${hexA(accent, 0.3)}, ${accent})`,
            boxShadow: `0 0 14px ${hexA(accent, 0.6)}`,
          }}
        />
        {ghost && ghost.opacity > 0.01 && (
          <div
            style={{
              position: 'absolute',
              left: `calc(${clamp01(ghost.value) * 100}% - 13px)`,
              top: 0,
              width: 26,
              height: 26,
              borderRadius: '50%',
              border: `2px dashed ${ghost.color}`,
              opacity: ghost.opacity,
            }}
          />
        )}
        <div
          style={{
            position: 'absolute',
            left: `calc(${v * 100}% - 13px)`,
            top: 0,
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: '#fff',
            boxShadow: `0 0 18px ${accent}`,
          }}
        />
      </div>
      {(left || right) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: FONT.mono,
            fontSize: 18,
            color: C.muted,
            letterSpacing: '.08em',
          }}
        >
          <span>{left}</span>
          <span>{right}</span>
        </div>
      )}
    </div>
  );
};
