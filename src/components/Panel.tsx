import React from 'react';
import { C, FONT, hexA } from '../theme/palette';

/** Glass card with an accent bar and a mono label. */
export const Panel: React.FC<{
  children: React.ReactNode;
  label: React.ReactNode;
  accent: string;
  style?: React.CSSProperties;
  right?: React.ReactNode;
}> = ({ children, label, accent, style, right }) => (
  <div
    style={{
      position: 'relative',
      height: '100%',
      boxSizing: 'border-box',
      borderRadius: 20,
      padding: '42px 28px 24px',
      background: `linear-gradient(165deg, ${hexA(C.purple, 0.17)}, ${hexA('#0a0420', 0.8)})`,
      border: '1px solid rgba(255,255,255,.10)',
      boxShadow: `0 24px 70px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.10)`,
      overflow: 'hidden',
      ...style,
    }}
  >
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: 3,
        background: `linear-gradient(90deg, ${accent}, transparent)`,
        boxShadow: `0 0 26px ${accent}`,
      }}
    />
    <div
      style={{
        position: 'absolute',
        top: 14,
        left: 28,
        right: 28,
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: FONT.mono,
        fontSize: 15,
        letterSpacing: '.2em',
        textTransform: 'uppercase',
        color: hexA(accent, 0.85),
      }}
    >
      <span>{label}</span>
      {right && <span style={{ color: C.muted, letterSpacing: '.08em', textTransform: 'none' }}>{right}</span>}
    </div>
    {children}
  </div>
);
