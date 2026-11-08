// Spike take: open the ESP-IDF terminal, run `idf.py --version`, open main.c,
// point at one line. Writes the video + event log the Remotion comp reads.
//
//   node --disable-warning=ExperimentalWarning capture/takes/spike.ts
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { startStage, W, H } from '../lib/stage.ts';
import { startRecording } from '../lib/recorder.ts';
import {
  editorLine, pause, quietStartup, runCommand, screenBox, textBox,
  terminal, terminalRow, typeHuman, unionBox, waitTerminal,
} from '../lib/actions.ts';

const SLUG = 'vscode-spike';
const FPS = 30;
const raw = 'capture/.run/take.mkv';

const stage = await startStage({ workspace: 'capture/demo-project', root: 'capture' });
const { page } = stage;
let rec: Awaited<ReturnType<typeof startRecording>> | undefined;
try {
  // Wait for the ESP-IDF extension to finish activating, then quiet it down.
  await page.locator('.statusbar-item', { hasText: 'ESP-IDF v6' }).first().waitFor({ timeout: 60_000 });
  await pause(page, 2);
  await quietStartup(page);
  await pause(page, 1);

  console.log('recording');
  rec = await startRecording({ display: stage.display, size: [W, H], out: raw, fps: FPS });
  await pause(page, 1.5);
  rec.mark('start', {
    box: await screenBox(page, page.locator('.statusbar-item', { hasText: 'ESP-IDF v6' }).first(), 6),
  });
  await pause(page, 1.5);

  // 1. Command palette → ESP-IDF terminal.
  rec.mark('palette-open');
  await runCommand(page, 'ESP-IDF: Open ESP-IDF Terminal', () => rec!.mark('palette-typing'));
  rec.mark('palette', { box: await screenBox(page, page.locator('.quick-input-widget'), 6) });
  rec.mark('run-terminal');
  await page.keyboard.press('Enter');
  await terminal(page).waitFor();
  await waitTerminal(page, /\$\s*$/m, 30);
  await pause(page, 0.8);
  rec.mark('terminal-open', { box: await screenBox(page, page.locator('.part.panel')) });

  // 2. Run a command in it.
  rec.mark('cmd-start');
  await typeHuman(page, 'idf.py --version');
  rec.mark('typed', { box: await textBox(page, terminalRow(page, 'idf.py --version'), 6) });
  await pause(page, 0.4);
  await page.keyboard.press('Enter');
  await waitTerminal(page, /ESP-IDF v6\.\d+\.\d+/, 60);
  await pause(page, 0.3);
  rec.mark('version', {
    box: await textBox(page, terminalRow(page, /ESP-IDF v6\.\d+\.\d+/), 6),
    text: (await terminalRow(page, /ESP-IDF v6/).innerText()).trim(),
  });
  await pause(page, 2);

  // 3. Open main.c with Quick Open.
  rec.mark('quick-open');
  await page.keyboard.press('Control+P');
  await page.locator('.quick-input-widget input').waitFor();
  await pause(page, 0.3);
  await typeHuman(page, 'main.c');
  await page.locator('.quick-input-list .monaco-list-row.focused', { hasText: 'main.c' }).waitFor();
  await pause(page, 0.4);
  await page.keyboard.press('Enter');
  await editorLine(page, 'app_main').waitFor();
  await pause(page, 0.8);
  rec.mark('editor-open', { box: await screenBox(page, page.locator('.editor-group-container.active')) });
  // Boxes the narration points at (the editor doesn't move, so measure once).
  rec.mark('line-define', { box: await textBox(page, editorLine(page, '#define LED_PIN'), 6) });
  const loop = await Promise.all(
    ['while (1)', 'gpio_set_level(LED_PIN, 1)', 'vTaskDelay', 'gpio_set_level(LED_PIN, 0)', '}'].map((x) => textBox(page, editorLine(page, x), 6)),
  );
  rec.mark('line-loop', { box: unionBox(...loop) }); // while (1) { … }

  // 4. The line we want to talk about.
  await pause(page, 1);
  const line = editorLine(page, 'gpio_set_direction');
  rec.mark('show-line', { box: await textBox(page, line, 6), text: (await line.innerText()).replace(/\u00a0/g, ' ').trim() });
  await pause(page, 4);
  rec.mark('end');
  await pause(page, 0.5);
  const dur = await rec.stop();

  // Outputs: delivery mp4 for Remotion + the event log.
  mkdirSync(join('public', SLUG), { recursive: true });
  mkdirSync(join('src/scenes', SLUG), { recursive: true });
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', raw, '-c:v', 'libx264', '-preset', 'slow',
    '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', join('public', SLUG, 'take.mp4')]);
  const take = { fps: FPS, size: [W, H], duration: +dur.toFixed(3), events: rec.events };
  writeFileSync(join('src/scenes', SLUG, 'take.json'), JSON.stringify(take, null, 2) + '\n');
  console.log(`wrote public/${SLUG}/take.mp4 (${dur.toFixed(1)} s) + src/scenes/${SLUG}/take.json`);
} catch (e) {
  await page.screenshot({ path: '/tmp/capture-fail.png' }).catch(() => {});
  if (rec) await rec.stop().catch(() => {});
  throw e;
} finally {
  await stage.stop();
}
