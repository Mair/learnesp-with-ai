// A web browser on the take's display: Playwright's Chromium from the
// distrobox container (Playwright and its browsers live only there), started
// with a debugging port and driven from the host over CDP, like VS Code. It
// shares the Xvfb screen with VS Code, so ffmpeg records both in one take.
import { execFileSync, spawn } from 'node:child_process';
import { readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { chromium, type Browser, type Locator, type Page } from 'playwright-core';
import type { Box } from './recorder.ts';

const CONTAINER = process.env.PW_DISTROBOX_CONTAINER ?? 'ubuntu';
const PW_CACHE = '/home/mairs/distrobox/ubuntu/.cache/ms-playwright';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Newest Playwright Chromium in the container's browser cache. */
function chromiumPath() {
  const dirs = readdirSync(PW_CACHE).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => +a.split('-')[1] - +b.split('-')[1]);
  if (!dirs.length) throw new Error(`no Playwright Chromium in ${PW_CACHE} (distrobox enter ${CONTAINER} -- npx playwright install chromium)`);
  return join(PW_CACHE, dirs[dirs.length - 1], 'chrome-linux64/chrome');
}

export type Web = {
  page: Page;
  /** Screen box (px) of a page element. */
  box: (loc: Locator, pad?: number) => Promise<Box>;
  /** Screen box of the address bar's text. */
  urlBox: () => Promise<Box>;
  stop: () => Promise<void>;
};

export async function startBrowser(opts: {
  display: string;
  /** Screen size in px; the window fills it at 2× scale. */
  size: [number, number];
  profile: string;
  port?: number;
}): Promise<Web> {
  const port = opts.port ?? 9335;
  const scale = 2;
  rmSync(opts.profile, { recursive: true, force: true });
  const args = [
    '--ozone-platform=x11',
    '--disable-infobars', // no "Chrome for Testing" banner
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${opts.profile}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-search-engine-choice-screen',
    '--disable-features=Translate',
    '--password-store=basic',
    `--force-device-scale-factor=${scale}`,
    '--window-position=0,0',
    `--window-size=${opts.size[0] / scale},${opts.size[1] / scale}`,
    'about:blank',
  ];
  // WAYLAND_DISPLAY is set inside the container: unset it, or the window
  // opens on the real desktop instead of the take's Xvfb.
  spawn('distrobox', ['enter', CONTAINER, '--', 'env', '-u', 'WAYLAND_DISPLAY', `DISPLAY=${opts.display}`, chromiumPath(), ...args], {
    stdio: 'ignore',
    detached: true,
  }).unref();
  // Kill by the debugging port: the browser runs under distrobox, not as our child.
  const kill = () => {
    try {
      execFileSync('pkill', ['-f', `remote-debugging-port=${port}`]);
    } catch {}
  };

  let browser: Browser | undefined;
  for (let i = 0; i < 60 && !browser; i++) {
    await sleep(500);
    browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`).catch(() => undefined);
  }
  if (!browser) {
    kill();
    throw new Error('could not connect to the distrobox Chromium over CDP');
  }
  // The startup tab can take a moment to register; don't open a second window.
  let page: Page | undefined;
  for (let i = 0; i < 20 && !page; i++) {
    page = browser.contexts()[0]?.pages()[0];
    if (!page) await sleep(250);
  }
  page ??= await browser.contexts()[0].newPage();

  // Viewport origin on screen: the window sits at 0,0; the toolbar is above the page.
  const chromeTop = async () => page.evaluate(() => outerHeight - innerHeight);
  const box = async (loc: Locator, pad = 0): Promise<Box> => {
    const b = await loc.boundingBox();
    if (!b) throw new Error(`no box for ${loc}`);
    const top = await chromeTop();
    return [
      Math.round((b.x - pad) * scale),
      Math.round((b.y + top - pad) * scale),
      Math.round((b.width + 2 * pad) * scale),
      Math.round((b.height + 2 * pad) * scale),
    ];
  };
  // The omnibox text starts ~158 DIP from the left and sits 45–80 DIP down
  // (Chromium's default toolbar); its width follows the URL's length.
  const urlBox = async (): Promise<Box> => {
    const text = new URL(page.url()).host + new URL(page.url()).pathname.replace(/\/$/, '');
    const w = await page.evaluate((t) => {
      const c = document.createElement('canvas').getContext('2d')!;
      c.font = '15px system-ui, sans-serif';
      return c.measureText(t).width;
    }, text);
    return [150 * scale, 44 * scale, Math.round((w + 24) * scale), 38 * scale];
  };

  return {
    page,
    box,
    urlBox,
    stop: async () => {
      await browser!.close().catch(() => {});
      kill();
    },
  };
}
