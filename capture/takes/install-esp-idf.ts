// Take: install VS Code's ESP-IDF extension and ESP-IDF (via EIM) on a fresh
// machine, with the web pages a learner needs. One continuous recording of
// the take's Xvfb screen: the distrobox Chromium, a fresh VS Code (home =
// /home/learner, no extensions, no ESP-IDF, no eim on PATH) and EIM's window.
// The real ESP-IDF download + install (~14 min) is recorded in full; the
// timeline speeds it up.
//
//   npm run install-esp-idf:take        (≈ 20 min, needs internet)
//   STOP_AT=eim-ready npm run install-esp-idf:take   (dev: stop before installing)
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { startStage, W, H } from '../lib/stage.ts';
import { startBrowser } from '../lib/browser.ts';
import { connectWebKit, type WebKitApp } from '../lib/webkit.ts';
import { startRecording } from '../lib/recorder.ts';
import { pause, runCommand, screenBox, terminal, terminalRow, textBox, typeHuman, waitTerminal } from '../lib/actions.ts';
import { EIM_INSPECTOR, stageOptions } from './install-esp-idf/config.ts';

const SLUG = 'install-esp-idf';
const FPS = 30;
const raw = 'capture/.run/take.mkv';
const STOP_AT = process.env.STOP_AT;

const stage = await startStage(stageOptions);
const { page } = stage;
const web = await startBrowser({ display: stage.display, size: [W, H], profile: resolve('capture/.run/browser') });
let rec: Awaited<ReturnType<typeof startRecording>> | undefined;
let eim: WebKitApp | undefined;
let failure: Error | undefined;

class Stop extends Error {}
const mark = (id: string, extra: Parameters<NonNullable<typeof rec>['mark']>[1] = {}) => {
  rec!.mark(id, extra);
  if (STOP_AT === id) throw new Stop(id);
};
// No window manager: Chromium raises itself at odd moments (e.g. when EIM maps
// its window). Park it off-screen whenever it isn't the window on show.
const showBrowser = () => {
  stage.xwin('move', 'Chrome', 0, 0);
  stage.xwin('raise', 'Chrome');
};
const showVSCode = () => {
  try {
    stage.xwin('move', 'Chrome', W + 200, 0);
  } catch {} // the browser may be closed already
  stage.xwin('raise', 'Visual Studio Code');
  // Electron doesn't repaint what another window uncovered: force a full repaint.
  stage.xwin('nudge', 'Visual Studio Code');
};
/**
 * Center EIM and keep it there: GTK re-places its window (at 0,0) after the
 * 2× scale applies, so one move isn't enough. Pinned until unpinEIM().
 */
let eimPin: ReturnType<typeof setInterval> | undefined;
const eimCentered = () => {
  try {
    const g = JSON.parse(stage.xwin('geom', 'Installation Manager'));
    if (g.w < 2000) return false;
    if (g.x !== Math.floor((W - g.w) / 2)) stage.xwin('center', 'Installation Manager');
    return g.x === Math.floor((W - g.w) / 2);
  } catch {
    return false;
  }
};
const placeEIM = async () => {
  let ok = 0;
  for (let i = 0; i < 80 && ok < 6; i++) {
    ok = eimCentered() ? ok + 1 : 0;
    await pause(page, 0.25);
  }
  if (ok < 6) throw new Error('EIM window never settled at the center');
  eimPin = setInterval(eimCentered, 300);
};
const unpinEIM = () => clearInterval(eimPin);
/** Click blank page space so the address bar loses focus (its text is shown selected otherwise). */
const unfocusOmnibox = () => web.page.mouse.click(1880, 600);
/** Smallest element with an OS card's heading text that also holds its download links. */
const osCard = (os: string) =>
  web.page.evaluateHandle((os) => {
    const vis = (e: Element) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const h = [...document.querySelectorAll('h1,h2,h3,h4,span,div,p')].find((e) => vis(e) && e.childElementCount <= 2 && (e as HTMLElement).innerText.trim() === os);
    let c = h as HTMLElement | null;
    while (c && !(c.querySelectorAll('a,button').length >= 1 && c.getBoundingClientRect().height > 150)) c = c.parentElement;
    return c;
  }, os);
const elBox = async (h: Awaited<ReturnType<typeof osCard>>, pad = 8) => web.box(h.asElement()!, pad);
/** A docs section: from its heading to just before the next heading of the same level. */
const sectionBox = async (id: string, untilId: string) => {
  const r = await web.page.evaluate(([a, b]) => {
    const h = document.getElementById(a)!;
    const n = document.getElementById(b)!;
    const top = h.getBoundingClientRect().top;
    const bottom = n.getBoundingClientRect().top - 12;
    const x = h.getBoundingClientRect().left;
    return { x: x - 12, y: top - 8, w: 820, h: bottom - top + 8 };
  }, [id, untilId]);
  const top = await web.page.evaluate(() => outerHeight - innerHeight);
  return [r.x * 2, (r.y + top) * 2, r.w * 2, r.h * 2].map(Math.round) as [number, number, number, number];
};
const scrollTo = async (id: string, offset = 120) => {
  await web.page.evaluate(([id, off]) => window.scrollTo({ top: document.getElementById(id as string)!.getBoundingClientRect().top + scrollY - (off as number), behavior: 'smooth' }), [id, offset]);
  await pause(page, 1.2);
};

try {
  // ── pre-roll (not recorded): browser on the VS Code download page ─────────
  showBrowser();
  await web.page.goto('https://code.visualstudio.com/download', { waitUntil: 'networkidle' });
  await unfocusOmnibox();
  await pause(page, 1.5);

  console.log('recording');
  rec = await startRecording({ display: stage.display, size: [W, H], out: raw, fps: FPS });
  await pause(page, 1);
  mark('begin');
  await pause(page, 1);

  // ── step 1: VS Code download page ─────────────────────────────────────────
  mark('vsc-page', { box: await web.urlBox(), text: web.page.url() });
  for (const [id, os] of [['card-win', 'Windows'], ['card-mac', 'macOS'], ['card-linux', 'Linux']] as const)
    mark(id, { box: await elBox(await osCard(os)) });
  await pause(page, 2);

  // VS Code with an empty folder
  mark('to-vscode');
  showVSCode();
  await pause(page, 1.2);
  mark('vscode-window', { box: await screenBox(page, page.locator('.part.titlebar .window-title, .part.titlebar .command-center').first(), 4) });
  await pause(page, 2);

  // ── step 2: the extension ─────────────────────────────────────────────────
  mark('ext-open');
  await page.keyboard.press('Control+Shift+X');
  const search = page.locator('.extensions-viewlet .suggest-input-container').first();
  await search.waitFor();
  await pause(page, 0.8);
  mark('ext-view', { box: await screenBox(page, page.locator('.part.sidebar')) });
  await pause(page, 0.5);
  mark('ext-typing', { box: await screenBox(page, search, 4) });
  await typeHuman(page, 'ESP-IDF', 10);
  const row = page.locator('.extensions-viewlet .monaco-list-row', { hasText: 'Espressif Systems' }).first();
  await row.waitFor({ timeout: 30_000 });
  await pause(page, 1.5);
  mark('ext-row', { box: await screenBox(page, row, 2) });
  await pause(page, 1);
  mark('row-click');
  await row.click();
  const install = page.locator('.extension-editor .extension-action.install').first();
  await install.waitFor({ timeout: 30_000 });
  await pause(page, 1.2);
  mark('ext-page', { box: await screenBox(page, page.locator('.extension-editor .header'), 4) });
  mark('ext-install', { box: await screenBox(page, install, 6) });
  await pause(page, 1);
  mark('install-click');
  await install.click();
  const trust = page.locator('.monaco-dialog-box .monaco-button', { hasText: 'Trust Publisher & Install' });
  await trust.waitFor({ timeout: 30_000 });
  await pause(page, 0.8);
  mark('trust', { box: await screenBox(page, page.locator('.monaco-dialog-box'), 4) });
  mark('trust-btn', { box: await screenBox(page, trust, 6) });
  await pause(page, 1.2);
  mark('trust-click');
  await trust.click();
  await page.locator('.extension-editor .extension-action', { hasText: 'Uninstall' }).first().waitFor({ timeout: 120_000 });
  await pause(page, 1);
  const icon = page.locator('.activitybar .action-item').filter({ has: page.locator('[aria-label*="ESP-IDF"]') }).first();
  mark('ext-done', { box: await screenBox(page, icon, 4) });
  await pause(page, 2);

  // ── step 3: prerequisites page ────────────────────────────────────────────
  mark('to-browser');
  showBrowser();
  mark('pre-nav');
  await web.page.goto('https://docs.espressif.com/projects/idf-im-ui/en/latest/prerequisites.html', { waitUntil: 'networkidle' });
  await unfocusOmnibox();
  await pause(page, 1);
  mark('pre-page', { box: await web.urlBox(), text: web.page.url() });
  await pause(page, 1);
  mark('pre-scroll-win');
  await scrollTo('windows');
  mark('pre-win', { box: await sectionBox('windows', 'macos') });
  await pause(page, 1);
  mark('pre-scroll-mac');
  await scrollTo('macos');
  mark('pre-mac', { box: await sectionBox('macos', 'linux') });
  await pause(page, 1);
  mark('pre-scroll-linux');
  await scrollTo('linux');
  mark('pre-linux', { box: await sectionBox('linux', 'other-linux-prerequisites-based-on-distro') });
  await pause(page, 2);
  // Done with the web: close the browser so it can't raise itself over VS Code/EIM later.
  mark('to-vscode-2');
  showVSCode();
  await web.stop();
  showVSCode();
  await pause(page, 1.2);
  mark('vscode-ready-2');

  // ── step 4: ESP-IDF Installation Manager ──────────────────────────────────
  mark('palette');
  await runCommand(page, 'ESP-IDF: Open ESP-IDF Installation Manager', () => rec!.mark('palette-typing'), { instant: true });
  mark('palette-row', { box: await screenBox(page, page.locator('.quick-input-widget'), 4) });
  await page.keyboard.press('Enter');
  const activate = page.locator('.notification-toast .monaco-button', { hasText: 'Activate Anyway' });
  await activate.waitFor({ timeout: 30_000 });
  await pause(page, 0.8);
  mark('activate', { box: await screenBox(page, page.locator('.notification-toast', { hasText: 'Activate Anyway' }), 4) });
  mark('activate-btn', { box: await screenBox(page, activate, 6) });
  await pause(page, 1.2);
  mark('activate-click');
  await activate.click();
  // In a folder without a project, that first run only activates the extension:
  // it starts up and opens its guide (which also closes any quick pick). Wait
  // for that, tidy the startup toasts, then run the command again.
  await page.locator('.getting-started-step').first().waitFor({ timeout: 120_000 });
  await pause(page, 2.5);
  for (const close of await page.locator('.notification-toast .codicon-notifications-clear').all()) await close.click().catch(() => {});
  await page.keyboard.press('Escape');
  await pause(page, 0.8);
  mark('palette2');
  await runCommand(page, 'ESP-IDF: Open ESP-IDF Installation Manager', () => rec!.mark('palette2-typing'), { instant: true });
  mark('palette2-row', { box: await screenBox(page, page.locator('.quick-input-widget'), 4) });
  await page.keyboard.press('Enter');
  const github = page.locator('.quick-input-list .monaco-list-row', { hasText: 'Github' });
  await github.waitFor({ timeout: 90_000 });
  await pause(page, 1);
  mark('mirror', { box: await screenBox(page, page.locator('.quick-input-widget'), 4) });
  mark('mirror-row', { box: await screenBox(page, github, 2) });
  await pause(page, 1.2);
  mark('mirror-click');
  await github.click();
  for (let i = 0; i < 240 && !stage.xwin('list').includes('Installation Manager'); i++) await pause(page, 0.25);
  await placeEIM();
  // The activation toasts are done with; clear them while EIM covers the screen.
  for (const close of await page.locator('.notification-toast .codicon-notifications-clear').all()) await close.click().catch(() => {});
  eim = await connectWebKit({ port: EIM_INSPECTOR, windowPos: () => JSON.parse(stage.xwin('geom', 'Installation Manager')) });
  await eim.waitFor("return [...document.querySelectorAll('button')].some(b=>b.innerText.trim()==='Start Installation')", 60, 'EIM welcome');
  await pause(page, 1);
  mark('eim-open', { box: await eim.box('Welcome to') });
  mark('eim-start', { box: await eim.box('Start Installation', 'button', 6) });
  await pause(page, 1.5);
  mark('eim-start-click');
  await eim.click('Start Installation');
  await eim.waitFor("return [...document.querySelectorAll('button')].some(b=>b.innerText.trim()==='Start Easy Installation')", 30, 'Easy');
  await pause(page, 1);
  mark('eim-easy', { box: await eim.box('Quick setup with recommended defaults', '*', 24) });
  mark('eim-easy-btn', { box: await eim.box('Start Easy Installation', 'button', 6) });
  await pause(page, 1.5);
  mark('eim-easy-click');
  await eim.click('Start Easy Installation');
  await eim.waitFor("return document.body.innerText.includes('Ready to Install')", 120, 'Ready to Install');
  await pause(page, 1);
  mark('eim-ready', { box: await eim.box('Ready to Install', '*', 12) });
  mark('eim-version', { box: await eim.box('(2.35 GB)', '.n-base-selection', 6), text: (await eim.eval<string>("return document.querySelector('.n-base-selection').innerText.trim()")) });
  mark('eim-location', { box: await eim.box('Install location', '*', 8) });
  mark('eim-time', { box: await eim.box('Estimated Time', '*', 8) });
  mark('eim-go', { box: await eim.box('Start Installation', 'button', 6) });
  await pause(page, 1.5);
  mark('eim-go-click');
  await eim.click('Start Installation');
  const g = JSON.parse(stage.xwin('geom', 'Installation Manager'));
  mark('eim-installing', { box: [g.x, g.y, g.w, g.h] });
  let phase = '';
  for (;;) {
    const t = await eim.text().catch(() => '');
    if (t.includes('Installation Complete')) break;
    if (/Failed to Start Installation|Installation failed/i.test(t)) throw new Error(`EIM failed:\n${t}`);
    const p = t.includes('Downloading offline package') ? 'eim-downloading' : t.includes('Extracting') ? 'eim-extracting' : '';
    if (p && p !== phase) rec.mark((phase = p));
    await pause(page, 2);
  }
  await pause(page, 1);
  mark('eim-done', { box: await eim.box('Installation Complete', '*', 16) });
  await pause(page, 3);
  // "You can close the installer."
  mark('eim-close');
  unpinEIM();
  eim.close();
  eim = undefined;
  try {
    execFileSync('pkill', ['-f', 'eim_gui/eim gui']);
  } catch {}
  await pause(page, 0.5);
  showVSCode();
  await pause(page, 1.2);

  // ── step 5: select the version (command palette, as in the extension docs) ─
  mark('to-vscode-3');
  mark('sel-palette');
  await runCommand(page, 'ESP-IDF: Select Current ESP-IDF Version', undefined, { instant: true });
  mark('sel-palette-row', { box: await screenBox(page, page.locator('.quick-input-widget'), 4) });
  await page.keyboard.press('Enter');
  const verRow = page.locator('.quick-input-list .monaco-list-row', { hasText: 'v6.' }).first();
  await verRow.waitFor({ timeout: 30_000 });
  await pause(page, 1);
  mark('sel-pick', { box: await screenBox(page, page.locator('.quick-input-widget'), 4), text: (await verRow.innerText()).replace(/\s+/g, ' ') });
  mark('sel-row', { box: await screenBox(page, verRow, 2) });
  await pause(page, 1.2);
  mark('sel-click');
  await verRow.click();
  const status = page.locator('.statusbar-item', { hasText: /ESP-IDF v6/ }).first();
  await status.waitFor({ timeout: 60_000 });
  await pause(page, 1);
  mark('sel-done', { box: await screenBox(page, status, 6), text: (await status.innerText()).trim() });
  await pause(page, 2);

  // ── step 6: check it works ────────────────────────────────────────────────
  // The status bar's terminal icon, not the palette: VS Code's "similar
  // commands" for "…Open ESP-IDF Terminal" include an Arduino command.
  const termIcon = page.locator('.statusbar-item[aria-label*="Open ESP-IDF Terminal"]');
  mark('term-icon', { box: await screenBox(page, termIcon, 6) });
  await pause(page, 1.2);
  mark('term-click');
  await termIcon.click();
  await terminal(page).waitFor({ timeout: 30_000 });
  await waitTerminal(page, /\$\s*$/m, 60);
  await pause(page, 1);
  mark('term-open', { box: await screenBox(page, page.locator('.part.panel')) });
  // A widget layer sits over the rows: click the terminal itself to focus it.
  await page.locator('.terminal-wrapper.active .xterm').click({ force: true });
  mark('cmd-start');
  await typeHuman(page, 'idf.py --version');
  mark('typed', { box: await textBox(page, terminalRow(page, 'idf.py --version'), 6) });
  await pause(page, 0.4);
  mark('cmd-enter');
  await page.keyboard.press('Enter');
  await waitTerminal(page, /ESP-IDF v6\.\d+/, 60);
  await pause(page, 0.4);
  mark('version', { box: await textBox(page, terminalRow(page, /ESP-IDF v6\.\d+/), 6), text: (await terminalRow(page, /ESP-IDF v6/).innerText()).trim() });
  await pause(page, 4);
  mark('end');
  await pause(page, 0.5);
} catch (e) {
  if (e instanceof Stop) console.log(`stopped at ${e.message}`);
  else {
    failure = e as Error;
    console.error(`TAKE FAILED: ${failure.message}`);
    await page.screenshot({ path: 'capture/.run/fail.png' }).catch(() => {});
  }
} finally {
  // Keep what was recorded even when a step failed: a late slip shouldn't
  // throw away a long take (take.json then has "failed").
  if (rec) {
    const dur = await rec.stop();
    mkdirSync(join('public', SLUG), { recursive: true });
    mkdirSync(join('src/scenes', SLUG), { recursive: true });
    console.log('encoding take.mp4…');
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', raw, '-c:v', 'libx264', '-preset', 'medium', '-crf', '17',
      '-g', '60', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', join('public', SLUG, 'take.mp4')]);
    const take = { fps: FPS, size: [W, H], duration: +dur.toFixed(3), events: rec.events, ...(failure ? { failed: failure.message } : {}) };
    writeFileSync(join('src/scenes', SLUG, 'take.json'), JSON.stringify(take, null, 2) + '\n');
    console.log(`wrote public/${SLUG}/take.mp4 (${dur.toFixed(1)} s) + src/scenes/${SLUG}/take.json`);
  }
  unpinEIM();
  eim?.close();
  try {
    execFileSync('pkill', ['-f', 'eim_gui/eim gui']);
  } catch {}
  await web.stop();
  await stage.stop();
}
if (failure) throw failure;
