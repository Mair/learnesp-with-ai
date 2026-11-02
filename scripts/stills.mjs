/**
 * Render stills of a composition at given absolute times, to check layout.
 *
 *   node scripts/stills.mjs <CompositionId> <seconds…>
 *     e.g. node scripts/stills.mjs PWM 26 41.5 63
 *
 * Bundles once, renders every frame, writes /tmp/stills/<Id>-<t>.png.
 * Absolute time = sceneStart(scene) + scene-relative time.
 */
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const [id, ...ts] = process.argv.slice(2);
if (!id || !ts.length) {
  console.error('usage: node scripts/stills.mjs <CompositionId> <seconds…>');
  process.exit(2);
}
mkdirSync('/tmp/stills', { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const comp = await selectComposition({ serveUrl, id });
for (const t of ts.map(Number)) {
  const output = `/tmp/stills/${id}-${t.toFixed(1)}.png`;
  await renderStill({ composition: comp, serveUrl, frame: Math.round(t * comp.fps), output });
  console.log(output);
}
