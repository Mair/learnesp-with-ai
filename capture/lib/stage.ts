// Stage: a private X display (Xvfb) running a clean VS Code profile that
// Playwright drives over CDP. Nothing touches the user's desktop or settings.
import { execFileSync, spawn } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { chromium, type Browser, type Page } from 'playwright-core';

// 4K source: zoomed-in shots still map ~1:1 onto a 1080p frame.
export const W = 3840;
export const H = 2160;
const DISPLAY = ':99';
const CDP_PORT = 9333;
const CODE = '/usr/share/code/code';
const EXTENSIONS = ['espressif.esp-idf-extension-2.3.0'];
// Commands kept out of the command palette in recorded takes. VS Code's
// built-in "similar commands" search can't be switched off, and this course
// never shows Arduino on screen.
const HIDE_COMMANDS = ['espIdf.addArduinoAsComponentToCurFolder'];

/**
 * Copy an extension into the take's profile, with a package.json that hides
 * HIDE_COMMANDS. (A copy, not symlinks: Node resolves symlinked code to its
 * real path and VS Code then can't map `require('vscode')` to the extension.)
 */
function copyExtension(src: string, dst: string) {
  cpSync(src, dst, { recursive: true, dereference: true });
  const pkg = JSON.parse(readFileSync(join(src, 'package.json'), 'utf8'));
  const own = new Set((pkg.contributes?.commands ?? []).map((c: { command: string }) => c.command));
  const hide = HIDE_COMMANDS.filter((c) => own.has(c)).map((command) => ({ command, when: 'false' }));
  pkg.contributes.menus ??= {};
  pkg.contributes.menus.commandPalette = [...(pkg.contributes.menus.commandPalette ?? []), ...hide];
  writeFileSync(join(dst, 'package.json'), JSON.stringify(pkg));
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type Stage = {
  page: Page;
  workspace: string;
  browser: Browser;
  display: string;
  stop: () => Promise<void>;
};

export async function startStage(opts: { workspace: string; root: string }): Promise<Stage> {
  const root = resolve(opts.root);
  const run = join(root, '.run');
  rmSync(run, { recursive: true, force: true });
  const userData = join(run, 'user-data');
  const extDir = join(run, 'extensions');
  mkdirSync(join(userData, 'User'), { recursive: true });
  mkdirSync(extDir, { recursive: true });
  const settings = readFileSync(join(root, 'profile/settings.json'), 'utf8').replaceAll('${capture}', root);
  writeFileSync(join(userData, 'User/settings.json'), settings);
  // Work on a copy so a take (or an agent) never edits the template project.
  const workspace = join(run, 'workspace', basename(resolve(opts.workspace)));
  cpSync(resolve(opts.workspace), workspace, { recursive: true });
  for (const e of EXTENSIONS) {
    const src = join(homedir(), '.vscode/extensions', e);
    if (!existsSync(src)) throw new Error(`missing extension ${src}`);
    copyExtension(src, join(extDir, e));
  }

  const xvfb = spawn('Xvfb', [DISPLAY, '-screen', '0', `${W}x${H}x24`, '-nolisten', 'tcp'], {
    stdio: 'ignore',
  });
  await sleep(800);

  const env = { ...process.env, DISPLAY };
  delete env.WAYLAND_DISPLAY;
  delete env.VSCODE_IPC_HOOK_CLI; // don't hand the folder to the user's running VS Code
  delete env.ELECTRON_RUN_AS_NODE;
  const code = spawn(
    CODE,
    [
      '--ozone-platform=x11',
      `--user-data-dir=${userData}`,
      `--extensions-dir=${extDir}`,
      `--remote-debugging-port=${CDP_PORT}`,
      '--disable-gpu',
      '--disable-workspace-trust',
      '--skip-welcome',
      '--skip-release-notes',
      '--no-sandbox',
      '--new-window',
      workspace,
    ],
    { env, stdio: 'ignore', detached: true },
  );

  const kill = () => {
    try {
      process.kill(-code.pid!, 'SIGTERM');
    } catch {}
    xvfb.kill('SIGTERM');
  };

  let browser: Browser | undefined;
  let page: Page | undefined;
  try {
    for (let i = 0; i < 60 && !browser; i++) {
      await sleep(500);
      browser = await chromium.connectOverCDP(`http://127.0.0.1:${CDP_PORT}`).catch(() => undefined);
    }
    if (!browser) throw new Error('could not connect to VS Code over CDP');

    for (let i = 0; i < 60 && !page; i++) {
      page = browser
        .contexts()
        .flatMap((c) => c.pages())
        .find((p) => p.url().includes('workbench'));
      if (!page) await sleep(500);
    }
    if (!page) throw new Error('no workbench window');
    await page.locator('.monaco-workbench').waitFor({ timeout: 30_000 });

    // No window manager on Xvfb: size the window to the screen ourselves.
    // VS Code may restore its own bounds during startup, so keep at it until it sticks.
    const xfill = join(root, 'lib/xfill.py');
    let stuck = 0;
    for (let i = 0; i < 40 && stuck < 3; i++) {
      execFileSync('python3', [xfill, DISPLAY]);
      await sleep(250);
      const [iw, ih, dpr] = await page.evaluate(() => [innerWidth, innerHeight, devicePixelRatio]);
      const full = Math.round(iw * dpr) >= W - 2 && Math.round(ih * dpr) >= H - 2;
      stuck = full ? stuck + 1 : 0;
      if (process.env.CAPTURE_DEBUG) console.error('xfill', i, iw, ih, dpr);
    }
    if (stuck < 3) throw new Error('could not size the VS Code window to the screen');
  } catch (e) {
    kill();
    throw e;
  }

  return {
    page,
    workspace,
    browser,
    display: DISPLAY,
    stop: async () => {
      await browser!.close().catch(() => {});
      kill();
      await sleep(500);
    },
  };
}
