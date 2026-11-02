/**
 * Ambient background — sun, perspective floor, horizon, noise, scrim,
 * vignette, scanlines. Ported from the .sun/.floor/.horizon/... rules.
 *
 * In the original these were five sibling divs repeated per page; here it's
 * one component that every composition drops in.
 */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, hexA } from '../theme/palette';
import { useLoop } from './anim';

export const Backdrop: React.FC<{ floor?: boolean }> = ({ floor = true }) => {
  // .sun — breathe 7s ease-in-out infinite
  const b = useLoop(7);
  const breathe = 0.5 - 0.5 * Math.cos(b * Math.PI * 2); // 0..1..0
  const sunScale = 1 + 0.07 * breathe;
  const sunOpacity = 0.85 + 0.15 * breathe;

  // .floor — scroll 2.4s linear infinite (86px tile)
  const scroll = useLoop(2.4) * 86;

  // .noise — drift 6s steps(6)
  const step = Math.floor(useLoop(6) * 6);

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 90% at 50% 35%, ${C.bg1} 0%, #0d0527 55%, ${C.bg0} 100%)`,
      }}
    >
      {/* sun */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 150,
          width: 720,
          height: 720,
          marginLeft: -360,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${hexA(C.magenta, 0.22)}, ${hexA(C.purple, 0.1)} 45%, transparent 70%)`,
          filter: 'blur(22px)',
          zIndex: 0,
          transform: `scale(${sunScale})`,
          opacity: sunOpacity,
        }}
      />

      {floor && (
        <>
          {/* perspective grid floor */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: 290,
              overflow: 'hidden',
              zIndex: 1,
              perspective: 340,
              perspectiveOrigin: '50% 0%',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: '-40% -60% -140% -60%',
                transform: 'rotateX(74deg)',
                backgroundImage: `linear-gradient(to right, ${hexA(C.cyan, 0.38)} 1.5px, transparent 1.5px), linear-gradient(to bottom, ${hexA(C.magenta, 0.42)} 1.5px, transparent 1.5px)`,
                backgroundSize: '86px 86px',
                backgroundPosition: `0 ${scroll}px, 0 ${scroll}px`,
              }}
            />
          </div>

          {/* horizon */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 290,
              height: 2,
              zIndex: 2,
              opacity: 0.85,
              background: `linear-gradient(90deg, transparent, ${C.amber}, ${C.magenta}, ${C.amber}, transparent)`,
              filter: 'blur(1px)',
              boxShadow: `0 0 40px 10px ${hexA(C.magenta, 0.32)}, 0 0 90px 28px ${hexA(C.amber, 0.12)}`,
            }}
          />
        </>
      )}

      {/* noise */}
      <div
        style={{
          position: 'absolute',
          inset: '-50%',
          zIndex: 59,
          opacity: 0.05,
          backgroundImage: 'radial-gradient(rgba(255,255,255,.9) .5px, transparent .6px)',
          backgroundSize: '4px 4px',
          transform: `translate(${(step % 3) * 1.4}px, ${(step % 2) * 2}px)`,
        }}
      />

      {/* scrim — keeps the background from competing with the copy */}
      <AbsoluteFill
        style={{
          zIndex: 5,
          background: `radial-gradient(62% 58% at 50% 46%, ${hexA(C.bg0, 0.8)} 0%, ${hexA(C.bg0, 0.55)} 45%, transparent 78%)`,
        }}
      />
    </AbsoluteFill>
  );
};

/** Overlays that sit ABOVE scene content. Render last. */
export const Grade: React.FC = () => {
  const step = Math.floor(useLoop(6) * 6);
  return (
    <>
      <AbsoluteFill
        style={{
          zIndex: 60,
          pointerEvents: 'none',
          background:
            'radial-gradient(70% 60% at 50% 45%, transparent 40%, rgba(0,0,0,.65) 100%)',
        }}
        hidden
      />
      <AbsoluteFill
        style={{
          zIndex: 61,
          pointerEvents: 'none',
          opacity: 0.16,
          background:
            'repeating-linear-gradient(to bottom, rgba(255,255,255,.14) 0 1px, transparent 1px 3px)',
          transform: `translateY(${step * 0.0}px)`,
        }}
      />
    </>
  );
};
