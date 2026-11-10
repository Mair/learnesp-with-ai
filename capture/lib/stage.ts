// Stage: a private X display (Xvfb) running a clean VS Code profile that
// Playwright drives over CDP. Nothing touches the user's desktop or settings.
import { execFileSync, spawn } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { chromium, type Browser, type Page } from 'playwright-core';

// 4K source: zoomed-in shots still map ~1:1 onto a 1080p frame.
export const W = 3840;
export const H = 2160;
export const DISPLAY = ':99';
const CDP_PORT = 9333;
const CODE = '/usr/share/code/code';
const EXTENSIONS = ['espressif.esp-idf-extension-2.3.0'];
/** Where a take's private home appears inside the sandbox (`opts.home`). */
export const LEARNER_HOME = '/home/learner';
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

/**
 * A bin dir of symlinks to /usr/bin minus `hide`, used in place of /usr/bin,
 * /bin, /usr/sbin and /sbin on PATH, so a tool installed on this machine
 * (e.g. `eim`) looks absent, the way it is on a learner's machine.
 */
function pathWithout(dir: string, hide: string[], path: string) {
  mkdirSync(dir, { recursive: true });
  for (const f of readdirSync('/usr/bin')) if (!hide.includes(f)) symlinkSync(join('/usr/bin', f), join(dir, f));
  const sys = new Set(['/usr/bin', '/bin', '/usr/sbin', '/sbin']);
  const parts = path.split(':').filter((p) => p && !sys.has(p));
  return [...parts, dir].join(':');
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type Stage = {
  page: Page;
  workspace: string;
  browser: Browser;
  display: string;
  /** Run lib/xwin.py on the stage's display (list / fill / raise / center / geom / move). */
  xwin: (cmd: string, title?: string, ...args: (string | number)[]) => string;
  stop: () => Promise<void>;
};

export type StageOptions = {
  /** Folder VS Code opens (copied into .run/ first, so a take never edits the original). */
  workspace: string;
  /** capture/ (profile/, lib/, .run/). */
  root: string;
  /** Extensions copied in before start. Default: the ESP-IDF extension. `[]` = a fresh VS Code. */
  extensions?: string[];
  /**
   * A private home folder. VS Code and everything it starts (terminals, EIM)
   * run in a bubblewrap sandbox that shows it at /home/learner, so paths on
   * screen look like a learner's machine and the real ~/.espressif is untouched.
   */
  home?: string;
  /** Keep the home folder from the last run (e.g. an installed ESP-IDF) instead of starting empty. */
  keepHome?: boolean;
  /** /usr/bin programs to hide from PATH (e.g. ['eim']). */
  hideBins?: string[];
  /** Extra environment for VS Code and its children. */
  env?: Record<string, string>;
  /** Settings template (default profile/settings.json); `${capture}` is replaced by `root`. */
  settings?: string;
  /** Extra VS Code command-line arguments. */
  args?: string[];
  /**
   * With `home`: put the workspace copy in the home folder (a fresh copy each
   * run), so VS Code shows it as /home/learner/<name> in paths and dialogs.
   */
  workspaceInHome?: boolean;
  /**
   * Extension global state to start with (key = extension id), e.g. to mark
   * the ESP-IDF extension's changelog as seen so its "just got updated" toast
   * doesn't pop up mid-take.
   */
  globalState?: Record<string, Record<string, unknown>>;
};

export async function startStage(opts: StageOptions): Promise<Stage> {
  const root = resolve(opts.root);
  const run = join(root, '.run');
  const keep = opts.home && opts.keepHome ? resolve(opts.home) : undefined;
  for (const f of existsSync(run) ? readdirSync(run) : []) {
    const p = join(run, f);
    if (keep && (keep === p || keep.startsWith(p + '/'))) continue;
    rmSync(p, { recursive: true, force: true });
  }
  const userData = join(run, 'user-data');
  const extDir = join(run, 'extensions');
  mkdirSync(join(userData, 'User'), { recursive: true });
  mkdirSync(extDir, { recursive: true });
  if (opts.globalState) {
    // VS Code keeps extension global state in a SQLite file.
    const db = join(userData, 'User/globalStorage/state.vscdb');
    mkdirSync(join(userData, 'User/globalStorage'), { recursive: true });
    const rows = Object.entries(opts.globalState).map(([k, v]) => [k, JSON.stringify(v)]);
    execFileSync('python3', ['-c', `import sqlite3,sys,json
c=sqlite3.connect(sys.argv[1])
c.execute('CREATE TABLE IF NOT EXISTS ItemTable (key TEXT UNIQUE ON CONFLICT REPLACE, value BLOB)')
c.executemany('INSERT INTO ItemTable VALUES (?,?)', json.loads(sys.argv[2]))
c.commit()`, db, JSON.stringify(rows)]);
  }
  const settingsFile = opts.settings ? resolve(opts.settings) : join(root, 'profile/settings.json');
  const settings = readFileSync(settingsFile, 'utf8').replaceAll('${capture}', root);
  writeFileSync(join(userData, 'User/settings.json'), settings);
  // Work on a copy so a take (or an agent) never edits the template project.
  // A workspace path that doesn't exist opens as a new, empty folder.
  const wsName = basename(resolve(opts.workspace));
  const inHome = !!(opts.home && opts.workspaceInHome);
  const workspace = inHome ? join(resolve(opts.home!), wsName) : join(run, 'workspace', wsName);
  if (inHome) rmSync(workspace, { recursive: true, force: true });
  if (existsSync(resolve(opts.workspace))) cpSync(resolve(opts.workspace), workspace, { recursive: true });
  else mkdirSync(workspace, { recursive: true });
  for (const e of opts.extensions ?? EXTENSIONS) {
    const src = join(homedir(), '.vscode/extensions', e);
    if (!existsSync(src)) throw new Error(`missing extension ${src}`);
    copyExtension(src, join(extDir, e));
  }

  const xvfb = spawn('Xvfb', [DISPLAY, '-screen', '0', `${W}x${H}x24`, '-nolisten', 'tcp'], {
    stdio: 'ignore',
  });
  await sleep(800);

  const env: NodeJS.ProcessEnv = { ...process.env, DISPLAY, ...opts.env };
  delete env.WAYLAND_DISPLAY;
  delete env.VSCODE_IPC_HOOK_CLI; // don't hand the folder to the user's running VS Code
  delete env.ELECTRON_RUN_AS_NODE;
  if (opts.hideBins?.length) env.PATH = pathWithout(join(run, 'bin'), opts.hideBins, env.PATH ?? '');

  const codeArgs = [
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
    ...(opts.args ?? []),
    inHome ? join(LEARNER_HOME, wsName) : workspace,
  ];
  let cmd = CODE;
  let args = codeArgs;
  if (opts.home) {
    const home = resolve(opts.home);
    mkdirSync(home, { recursive: true });
    // Terminals VS Code opens itself (e.g. the extension's "ESP-IDF EIM") read
    // ~/.bashrc: give them the same short prompt as the profile's terminals.
    if (!existsSync(join(home, '.bashrc'))) cpSync(join(root, 'profile/bashrc'), join(home, '.bashrc'));
    env.HOME = LEARNER_HOME;
    // /tmp is a small tmpfs shared with everything else on this machine;
    // installers unpack gigabytes into their temp dir. Use disk instead.
    env.TMPDIR = join(run, 'tmp');
    mkdirSync(env.TMPDIR, { recursive: true });
    // / as is, but /home replaced by an empty tmpfs holding only the learner's
    // home and the repo (which the profile, extensions and workspace live in).
    const repo = resolve(root, '..');
    // The extension prints PATH into its Output channel: keep personal folders
    // out of it. The hideBins dir is shown as /usr/local/bin.
    const mine = homedir() + '/';
    const bin = join(run, 'bin');
    const binds: string[] = [];
    if (opts.hideBins?.length) binds.push('--ro-bind', bin, '/usr/local/bin');
    env.PATH = (env.PATH ?? '')
      .split(':')
      .filter((p) => p && p !== '/usr/local/bin' && (!p.startsWith(mine) || p === bin))
      .map((p) => (p === bin ? '/usr/local/bin' : p))
      .join(':');
    // Resolved on the host's PATH: the child's PATH below points inside the sandbox.
    cmd = execFileSync('which', ['bwrap'], { encoding: 'utf8' }).trim();
    args = ['--dev-bind', '/', '/', '--tmpfs', '/home', '--bind', home, LEARNER_HOME, '--bind', repo, repo, ...binds,
      '--chdir', LEARNER_HOME, '--', CODE, ...codeArgs];
  }
  const code = spawn(cmd, args, { env, stdio: 'ignore', detached: true });

  const kill = () => {
    try {
      process.kill(-code.pid!, 'SIGTERM');
    } catch {}
    xvfb.kill('SIGTERM');
  };
  const xwinPy = join(root, 'lib/xwin.py');
  const xwin = (c: string, title?: string, ...rest: (string | number)[]) =>
    execFileSync('python3', [xwinPy, DISPLAY, c, ...(title ? [title] : []), ...rest.map(String)], { encoding: 'utf8' });

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
    let stuck = 0;
    for (let i = 0; i < 40 && stuck < 3; i++) {
      try {
        xwin('fill', 'Visual Studio Code');
      } catch {} // the title can still be blank while the window loads
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
    xwin,
    stop: async () => {
      await browser!.close().catch(() => {});
      kill();
      await sleep(500);
    },
  };
}
