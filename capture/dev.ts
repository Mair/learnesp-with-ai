// Dev server: keep a stage running and poke it, to work out a take's steps.
//
//   node --disable-warning=ExperimentalWarning capture/dev.ts <take-config.ts>
//   curl -s localhost:7777/run --data-binary 'return await page.title()'
//   curl -s localhost:7777/shot?name=x      → /tmp/dev-shots/x.png (1920 px wide)
//
// The config module exports `stageOptions` (StageOptions) and optionally
// `browser: true`. Snippets are async function bodies with
// { page, stage, web, A (actions), connectWebKit } in scope.
import { createServer } from 'node:http';
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { startStage, W, H } from './lib/stage.ts';
import { startBrowser } from './lib/browser.ts';
import { connectWebKit } from './lib/webkit.ts';
import * as A from './lib/actions.ts';

const cfg = await import(resolve(process.argv[2]));
const stage = await startStage(cfg.stageOptions);
const web = cfg.browser ? await startBrowser({ display: stage.display, size: [W, H], profile: resolve('capture/.run/browser') }) : undefined;
const page = stage.page;
mkdirSync('/tmp/dev-shots', { recursive: true });
const AsyncFn = Object.getPrototypeOf(async () => {}).constructor;

createServer(async (req, res) => {
  const url = new URL(req.url!, 'http://x');
  try {
    if (url.pathname === '/shot') {
      const out = `/tmp/dev-shots/${url.searchParams.get('name') ?? 'shot'}.png`;
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'x11grab', '-video_size', `${W}x${H}`, '-i', stage.display,
        '-frames:v', '1', '-vf', 'scale=1920:-1', out]);
      res.end(out + '\n');
    } else if (url.pathname === '/run') {
      let body = '';
      for await (const c of req) body += c;
      const fn = new AsyncFn('page', 'stage', 'web', 'A', 'connectWebKit', body);
      const r = await fn(page, stage, web, A, connectWebKit);
      res.end(JSON.stringify(r ?? null, null, 1) + '\n');
    } else if (url.pathname === '/stop') {
      res.end('bye\n');
      await web?.stop();
      await stage.stop();
      process.exit(0);
    } else res.end('?\n');
  } catch (e) {
    res.statusCode = 500;
    res.end(String((e as Error).stack ?? e) + '\n');
  }
}).listen(7777, '127.0.0.1', () => console.log('dev server on :7777'));
