/**
 * Palette — lifted verbatim from esp32-intro/index.html so the two pipelines
 * can be compared frame-for-frame.
 */
export const C = {
  magenta: '#ff2bd1',
  pink: '#ff6ec7',
  cyan: '#00e5ff',
  purple: '#9d4edd',
  amber: '#ffb02e',
  violet: '#6a2bff',
  bg0: '#07031a',
  bg1: '#160a3a',
  ink: '#eef2ff',
  muted: '#a89fd0',
} as const;

export const FONT = {
  sans: "Inter, 'SF Pro Display', 'Segoe UI', 'DejaVu Sans', system-ui, sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', 'DejaVu Sans Mono', monospace",
} as const;

export type Accent = keyof typeof C;

/** Shared gradient used for hero type. */
export const GRAD_TEXT: React.CSSProperties = {
  backgroundImage: `linear-gradient(100deg, ${C.cyan}, #fff 38%, ${C.magenta} 72%, ${C.amber})`,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
};

export const glow = (color: string, a = 0.55, b = 0.25) =>
  `0 0 34px ${hexA(color, a)}, 0 0 90px ${hexA(color, b)}`;

export function hexA(hex: string, alpha: number) {
  const n = parseInt(hex.slice(1), 16);
  // eslint-disable-next-line no-bitwise
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}
