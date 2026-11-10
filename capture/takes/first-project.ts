// Take: a first ESP-IDF project in VS Code. Picks up where install-esp-idf
// left off (VS Code open on the empty "esp32" folder, ESP-IDF v6.1 installed):
// ESP-IDF: Create New Empty Project → hello_world → open it → type one
// printf → set the target (esp32) → build. With BOARD=<port> it then selects
// the port, flashes and opens the monitor to show "Hello world!".
//
//   npm run first-project:take                      (≈ 5 min: the first build compiles all of ESP-IDF)
//   BOARD=/dev/ttyUSB0 npm run first-project:take   (+ flash and monitor on a real ESP32)
//   STOP_AT=open-click npm run first-project:take   (dev: stop at that mark)
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { startStage, W, H } from '../lib/stage.ts';
import { startRecording } from '../lib/recorder.ts';
import { editorLine, pause, runCommand, screenBox, terminal, terminalRow, textBox, typeHuman, unionBox, waitTerminal } from '../lib/actions.ts';
import { stageOptions } from './first-project/config.ts';

const SLUG = 'first-project';
const FPS = 30;
const raw = 'capture/.run/take.mkv';
const STOP_AT = process.env.STOP_AT;
const BOARD = process.env.BOARD;
const PROJECT = 'hello_world';

const stage = await startStage(stageOptions);
let page: Page = stage.page;
let rec: Awaited<ReturnType<typeof startRecording>> | undefined;
let failure: Error | undefined;

class Stop extends Error {}
const mark = (id: string, extra: Parameters<NonNullable<typeof rec>['mark']>[1] = {}) => {
  rec!.mark(id, extra);
  if (STOP_AT === id) throw new Stop(id);
};
const toast = (text: string | RegExp) => page.locator('.notification-toast', { hasText: text }).last();
const toastButton = (label: string) => page.locator('.notification-toast .monaco-button', { hasText: label }).last();
const clearToasts = async () => {
  for (const c of await page.locator('.notification-toast .codicon-notifications-clear').all()) await c.click().catch(() => {});
};
const status = (label: string) => page.locator(`.statusbar-item[aria-label*="${label}"]`).first();
const row = (text: string | RegExp) => page.locator('.quick-input-list .monaco-list-row', { hasText: text }).first();
const quickInput = () => page.locator('.quick-input-widget');

try {
  // ── pre-roll (not recorded): VS Code on the empty esp32 folder ───────────
  await pause(page, 3);
  await clearToasts();
  console.log('recording');
  rec = await startRecording({ display: stage.display, size: [W, H], out: raw, fps: FPS });
  await pause(page, 1);
  mark('begin', { box: await screenBox(page, page.locator('.part.sidebar')) });
  await pause(page, 2);

  // ── 1. a new, empty project ──────────────────────────────────────────────
  mark('palette');
  await runCommand(page, 'ESP-IDF: Create New Empty Project', () => rec!.mark('palette-typing'), { instant: true });
  mark('palette-row', { box: await screenBox(page, quickInput(), 4) });
  await pause(page, 0.6);
  mark('palette-enter');
  await page.keyboard.press('Enter');
  // An empty folder: the extension asks before it starts (as in install-esp-idf).
  const activate = toastButton('Activate Anyway');
  await activate.waitFor({ timeout: 30_000 });
  await pause(page, 0.8);
  mark('activate', { box: await screenBox(page, toast('Activate Anyway'), 4) });
  mark('activate-btn', { box: await screenBox(page, activate, 6) });
  await pause(page, 1.2);
  mark('activate-click');
  await activate.click();
  const nameInput = page.locator('.quick-input-widget input');
  await page.locator('.quick-input-widget', { hasText: 'Press \'Enter\' to confirm' }).waitFor({ timeout: 120_000 });
  await pause(page, 1);
  mark('name', { box: await screenBox(page, quickInput(), 4), text: (await nameInput.getAttribute('placeholder')) ?? '' });
  await pause(page, 0.8);
  mark('name-typing');
  await typeHuman(page, PROJECT, 10);
  await pause(page, 0.5);
  mark('name-typed', { box: await screenBox(page, nameInput, 4) });
  await pause(page, 0.8);
  mark('name-enter');
  await page.keyboard.press('Enter');
  const ok = page.locator('.quick-input-widget .monaco-button', { hasText: 'OK' });
  await ok.waitFor({ timeout: 30_000 });
  await pause(page, 1);
  mark('folder', { box: await screenBox(page, quickInput(), 4), text: await nameInput.inputValue() });
  mark('folder-ok', { box: await screenBox(page, ok, 6) });
  await pause(page, 1.2);
  mark('folder-click');
  await ok.click();
  const open = toastButton(`Open ${PROJECT}`);
  await open.waitFor({ timeout: 60_000 });
  await pause(page, 0.8);
  mark('created', { box: await screenBox(page, toast('has been created'), 4), text: (await toast('has been created').innerText()).replace(/\s+/g, ' ') });
  mark('open-btn', { box: await screenBox(page, open, 6) });
  await pause(page, 1.2);
  mark('open-click');
  await open.click();

  // ── the project opens in a new window ────────────────────────────────────
  let p2: Page | undefined;
  for (let i = 0; i < 120 && !p2; i++) {
    for (const q of stage.browser.contexts().flatMap((c) => c.pages()))
      if (q !== page && (await q.title().catch(() => '')).startsWith(PROJECT)) p2 = q;
    if (!p2) await pause(page, 0.25);
  }
  if (!p2) throw new Error('the project window never opened');
  page = p2;
  await page.locator('.monaco-workbench').waitFor({ timeout: 30_000 });
  // No window manager: size it to the screen and bring it to the front.
  for (let i = 0; i < 40; i++) {
    try {
      stage.xwin('fill', `${PROJECT} - Visual Studio Code`);
      stage.xwin('raise', `${PROJECT} - Visual Studio Code`);
    } catch {}
    await pause(page, 0.25);
    const [iw, ih] = await page.evaluate(() => [innerWidth, innerHeight]);
    if (iw >= W - 2 && ih >= H - 2) break;
  }
  stage.xwin('nudge', `${PROJECT} - Visual Studio Code`);
  await status('ESP-IDF v6').waitFor({ timeout: 120_000 });
  await pause(page, 1.5);
  await clearToasts();
  // The extension's start-up opens the Output panel (OpenOCD's detect JSON): close it,
  // as a learner would; the build opens it again.
  if (await page.locator('.part.panel').isVisible().catch(() => false)) {
    await page.keyboard.press('Control+J');
    await pause(page, 0.8);
  }
  const tree = page.locator('.explorer-folders-view .monaco-list');
  mark('win2', { box: await screenBox(page, tree, 4) });
  mark('win2-title', { box: await screenBox(page, page.locator('.part.titlebar .command-center').first(), 4) });
  await pause(page, 2);

  // ── 2. what's in it ──────────────────────────────────────────────────────
  const explorerRow = (name: string | RegExp) => page.locator('.explorer-folders-view .monaco-list-row', { hasText: name }).first();
  mark('cmake', { box: await screenBox(page, explorerRow(/^CMakeLists\.txt$/).last(), 2) });
  await pause(page, 1);
  mark('main-click', { box: await screenBox(page, explorerRow(/^main$/), 2) });
  await explorerRow(/^main$/).click();
  await explorerRow('main.c').waitFor();
  await pause(page, 1);
  mark('mainc', { box: await screenBox(page, explorerRow('main.c'), 2) });
  await pause(page, 1);
  mark('mainc-click');
  await explorerRow('main.c').click();
  await editorLine(page, 'app_main').waitFor({ timeout: 15_000 });
  await pause(page, 1);
  const lines = page.locator('.editor-group-container.active .monaco-editor .view-lines .view-line');
  mark('editor', { box: unionBox(await textBox(page, editorLine(page, '#include'), 6), await textBox(page, editorLine(page, 'void app_main'), 6), await screenBox(page, lines.nth(5), 6)) });
  mark('app-main', { box: await textBox(page, editorLine(page, 'void app_main'), 6) });
  mark('include', { box: await textBox(page, editorLine(page, '#include'), 6) });
  await pause(page, 2);

  // ── 3. one line of code ──────────────────────────────────────────────────
  // Line 5 is the empty line between the braces.
  const sorted = async () => {
    const ls = await lines.all();
    const ys = await Promise.all(ls.map(async (l) => (await l.boundingBox())!.y));
    return ls.map((l, i) => [ys[i], l] as const).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
  };
  mark('type-start');
  await (await sorted())[4].click();
  await page.keyboard.press('End');
  await typeHuman(page, '    printf("Hello world!\\n");', 11);
  await pause(page, 0.5);
  mark('typed', { box: await textBox(page, editorLine(page, 'printf'), 6) });
  await pause(page, 1.5);
  mark('save');
  await page.keyboard.press('Control+S');
  await page.locator('.tab.active:not(.dirty)').waitFor({ timeout: 10_000 });
  await pause(page, 0.5);
  mark('saved', { box: await screenBox(page, page.locator('.tab.active'), 2) });
  await pause(page, 1.5);

  // ── 4. the target chip ───────────────────────────────────────────────────
  const target = status('Set Espressif Device Target');
  mark('target-item', { box: await screenBox(page, target, 6), text: (await target.innerText()).trim() });
  await pause(page, 1.2);
  mark('target-click');
  await target.click();
  const esp32 = row(/^esp32$/);
  await esp32.waitFor({ timeout: 30_000 });
  await pause(page, 1);
  mark('target-pick', { box: await screenBox(page, quickInput(), 4) });
  mark('target-row', { box: await screenBox(page, esp32, 2) });
  await pause(page, 1.2);
  mark('target-row-click');
  await esp32.click();
  const prog = row('ESP32 chip (via ESP-PROG)');
  await prog.waitFor({ timeout: 30_000 });
  await pause(page, 1);
  mark('ocd', { box: await screenBox(page, quickInput(), 4), text: await nameInput.getAttribute('placeholder') ?? '' });
  mark('ocd-row', { box: await screenBox(page, prog, 2) });
  await pause(page, 1.2);
  mark('ocd-click');
  await prog.click();
  const setOk = toast('Set Successfully');
  await setOk.waitFor({ timeout: 120_000 });
  await pause(page, 0.8);
  mark('target-done', { box: await screenBox(page, setOk, 4), text: (await setOk.innerText()).replace(/\s+/g, ' ') });
  await pause(page, 2.5);
  await clearToasts();
  await pause(page, 0.5);

  // ── 5. build ─────────────────────────────────────────────────────────────
  const build = status('Build Project');
  mark('build-item', { box: await screenBox(page, build, 6) });
  await pause(page, 1.2);
  mark('build-click');
  await build.click();
  await page.locator('.part.panel').waitFor({ timeout: 30_000 });
  await pause(page, 2);
  mark('building', { box: await screenBox(page, page.locator('.part.panel')) });
  const built = toast(/Build Successful/);
  for (let i = 0; ; i++) {
    if (await built.isVisible().catch(() => false)) break;
    if (await toast(/Build failed|error/i).isVisible().catch(() => false)) throw new Error(`build failed: ${await toast(/Build failed|error/i).innerText()}`);
    if (i > 1200) throw new Error('build never finished');
    await pause(page, 0.5);
  }
  await pause(page, 0.8);
  mark('build-done', { box: await screenBox(page, built, 4), text: (await built.innerText()).replace(/\s+/g, ' ') });
  mark('build-size', { box: await screenBox(page, page.locator('.part.panel')) });
  await pause(page, 3);

  if (BOARD) {
    // ── 6. port, flash, monitor (needs a real ESP32 on BOARD) ──────────────
    await clearToasts();
    const port = status('Select Port to Use');
    mark('port-item', { box: await screenBox(page, port, 6) });
    await pause(page, 1.2);
    mark('port-click');
    await port.click();
    const portRow = row(BOARD);
    await portRow.waitFor({ timeout: 90_000 });
    await pause(page, 1);
    mark('port-pick', { box: await screenBox(page, quickInput(), 4) });
    mark('port-row', { box: await screenBox(page, portRow, 2), text: (await portRow.innerText()).replace(/\s+/g, ' ') });
    await pause(page, 1.2);
    mark('port-row-click');
    await portRow.click();
    await page.locator('.statusbar-item', { hasText: BOARD.split('/').pop()! }).first().waitFor({ timeout: 30_000 });
    await pause(page, 1);
    mark('port-done', { box: await screenBox(page, status('Select Port to Use'), 6) });
    await pause(page, 1.5);

    const flash = status('Flash Device');
    mark('flash-item', { box: await screenBox(page, flash, 6) });
    await pause(page, 1.2);
    mark('flash-click');
    await flash.click();
    // The first flash asks how to flash: UART (over the USB cable).
    const uart = row(/^UART/);
    if (await uart.waitFor({ timeout: 8_000 }).then(() => true, () => false)) {
      await pause(page, 1);
      mark('method', { box: await screenBox(page, quickInput(), 4) });
      mark('method-row', { box: await screenBox(page, uart, 2) });
      await pause(page, 1.2);
      mark('method-click');
      await uart.click();
    }
    mark('flashing');
    const flashed = toast(/Flash Done/);
    await flashed.waitFor({ timeout: 180_000 });
    await pause(page, 0.8);
    mark('flash-done', { box: await screenBox(page, flashed, 4), text: (await flashed.innerText()).replace(/\s+/g, ' ') });
    await pause(page, 2.5);
    await clearToasts();

    const monitor = status('Monitor Device');
    mark('monitor-item', { box: await screenBox(page, monitor, 6) });
    await pause(page, 1.2);
    mark('monitor-click');
    await monitor.click();
    await terminal(page).waitFor({ timeout: 30_000 });
    await waitTerminal(page, /Hello world!/, 60);
    await pause(page, 1);
    mark('hello', { box: await textBox(page, terminalRow(page, 'Hello world!'), 6), text: 'Hello world!' });
    mark('monitor', { box: await screenBox(page, page.locator('.part.panel')) });
    await pause(page, 4);
    mark('monitor-exit');
    await page.keyboard.press('Control+]');
    await pause(page, 1.5);
  }
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
  if (rec) {
    const dur = await rec.stop();
    mkdirSync(join('public', SLUG), { recursive: true });
    mkdirSync(join('src/scenes', SLUG), { recursive: true });
    console.log('encoding take.mp4…');
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', raw, '-c:v', 'libx264', '-preset', 'medium', '-crf', '17',
      '-g', '60', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', join('public', SLUG, 'take.mp4')]);
    const take = { fps: FPS, size: [W, H], duration: +dur.toFixed(3), board: BOARD ?? null, events: rec.events, ...(failure ? { failed: failure.message } : {}) };
    writeFileSync(join('src/scenes', SLUG, 'take.json'), JSON.stringify(take, null, 2) + '\n');
    console.log(`wrote public/${SLUG}/take.mp4 (${dur.toFixed(1)} s) + src/scenes/${SLUG}/take.json`);
  }
  await stage.stop();
}
if (failure) throw failure;
