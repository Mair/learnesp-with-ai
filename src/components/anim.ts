/**
 * Entrance primitives.
 *
 * THE KEY DIFFERENCE vs esp32-intro/index.html:
 *
 *   old:  <h1 class="wipe" style="--d:1.35s">     // 1.35s on the 55s MASTER timeline
 *   new:  useEntrance(1.35, 'wipe')               // 1.35s from THIS SCENE's start
 *
 * Delays are scene-relative because <Sequence> rebases the frame counter.
 * Move a scene and nothing inside it needs touching — which is the single
 * biggest maintenance win of the port.
 */
import { interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from 'remotion';

export type EntranceKind = 'up' | 'fade' | 'pop' | 'wipe' | 'lineGrow';

/** cubic-bezier(.2,.8,.25,1) — the house easing from the original stylesheet. */
export const EASE_OUT = Easing.bezier(0.2, 0.8, 0.25, 1);

const DEFAULT_DUR: Record<EntranceKind, number> = {
  up: 0.8,
  fade: 0.9,
  pop: 0.7,
  wipe: 0.9,
  lineGrow: 0.9,
};

/**
 * @param delay  seconds from the start of the enclosing <Sequence>
 * @param kind   which entrance
 * @param dur    seconds; defaults match the original CSS durations
 */
export function useEntrance(
  delay: number,
  kind: EntranceKind,
  dur?: number,
): React.CSSProperties {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d = dur ?? DEFAULT_DUR[kind];
  const local = frame - delay * fps;

  // progress 0..1 with the house easing
  const p = interpolate(local, [0, d * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE_OUT,
  });

  switch (kind) {
    case 'fade':
      return { opacity: p };

    case 'up':
      return {
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [34, 0])}px)`,
      };

    case 'wipe':
      return {
        opacity: p > 0 ? 1 : 0,
        clipPath: `inset(0 ${interpolate(p, [0, 1], [100, 0])}% 0 0)`,
      };

    case 'lineGrow':
      return { transform: `scaleX(${p})`, transformOrigin: 'left center' };

    case 'pop': {
      // the original used cubic-bezier(.18,1.3,.4,1) — an overshoot.
      // A real spring is a better model of the same intent.
      const s = spring({
        frame: local,
        fps,
        config: { damping: 13, mass: 0.7, stiffness: 120 },
        durationInFrames: Math.round(d * fps),
      });
      return {
        opacity: interpolate(local, [0, 0.25 * d * fps], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }),
        transform: `scale(${interpolate(s, [0, 1], [0.86, 1])})`,
      };
    }

    default:
      return {};
  }
}

/**
 * Scene in/out. Mirrors the .scene sIn/sOut rules.
 *
 * Note the original README's trap #1 — sOut had to be `forwards`, never `both`,
 * or a backwards fill blanked the scene. That entire class of bug does not
 * exist here: there is no fill mode, only a pure function of the frame.
 */
export function useScene(durationInFrames: number): React.CSSProperties {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const IN = 0.75 * fps;
  const OUT = 0.5 * fps;
  const outStart = durationInFrames - OUT;

  const inP = interpolate(frame, [0, IN], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE_OUT,
  });
  const outP = interpolate(frame, [outStart, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.ease),
  });

  const y = interpolate(inP, [0, 1], [26, 0]) + interpolate(outP, [0, 1], [0, -22]);
  const scale = interpolate(inP, [0, 1], [0.985, 1]) + interpolate(outP, [0, 1], [0, 0.01]);
  const blur = interpolate(inP, [0, 1], [8, 0]) + interpolate(outP, [0, 1], [0, 6]);

  return {
    opacity: inP * (1 - outP),
    transform: `translateY(${y}px) scale(${scale})`,
    filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
  };
}

/** A continuously looping 0..1 ramp, for ambient/idle motion. */
export function useLoop(periodSeconds: number, offset = 0): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const period = periodSeconds * fps;
  return (((frame + offset * fps) % period) + period) % period / period;
}
