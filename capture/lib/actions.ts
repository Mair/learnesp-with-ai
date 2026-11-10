// Human-paced VS Code actions, plus helpers that turn UI elements into screen
// boxes for the event log (the zoom targets in Remotion).
import type { Locator, Page } from 'playwright-core';
import type { Box } from './recorder.ts';

export const pause = (page: Page, s: number) => page.waitForTimeout(s * 1000);

/** Type like a person: steady pace with a little jitter, pauses after spaces. */
export async function typeHuman(page: Page, text: string, cps = 14) {
  for (const ch of text) {
    await page.keyboard.type(ch);
    const base = 1000 / cps;
    const jitter = (Math.random() - 0.5) * base * 0.6;
    await page.waitForTimeout(base + jitter + (ch === ' ' ? base * 0.5 : 0));
  }
}

/** Element box in screen pixels (window sits at 0,0 and fills the screen). */
export async function screenBox(page: Page, loc: Locator, pad = 0): Promise<Box> {
  const b = await loc.boundingBox();
  if (!b) throw new Error(`no box for ${loc}`);
  const dpr = await page.evaluate(() => devicePixelRatio);
  return [
    Math.round((b.x - pad) * dpr),
    Math.round((b.y - pad) * dpr),
    Math.round((b.width + 2 * pad) * dpr),
    Math.round((b.height + 2 * pad) * dpr),
  ];
}

/**
 * Box around the visible text inside an element (leading/trailing spaces
 * trimmed), in screen pixels. Editor lines and terminal rows are full-width
 * elements; this is the part a viewer actually reads.
 */
export async function textBox(page: Page, loc: Locator, pad = 0): Promise<Box> {
  const b = await loc.evaluate((el) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    while (walker.nextNode()) nodes.push(walker.currentNode as Text);
    const isText = (c: string) => !/[\s\u00a0]/.test(c);
    let first: [Text, number] | undefined;
    let last: [Text, number] | undefined;
    for (const n of nodes) {
      const s = n.data;
      for (let i = 0; i < s.length; i++) if (isText(s[i])) { first ??= [n, i]; last = [n, i + 1]; }
    }
    if (!first || !last) return null;
    const r = document.createRange();
    r.setStart(first[0], first[1]);
    r.setEnd(last[0], last[1]);
    const rect = r.getBoundingClientRect();
    const row = el.getBoundingClientRect();
    return { x: rect.x, y: row.y, width: rect.width, height: row.height };
  });
  if (!b) throw new Error(`no text in ${loc}`);
  const dpr = await page.evaluate(() => devicePixelRatio);
  return [
    Math.round((b.x - pad) * dpr),
    Math.round((b.y - pad) * dpr),
    Math.round((b.width + 2 * pad) * dpr),
    Math.round((b.height + 2 * pad) * dpr),
  ];
}

/**
 * Open the command palette and enter a command title.
 * `instant`: insert the whole title at once. Typing it shows the in-between
 * filter states, and VS Code's "similar commands" can list anything on the
 * way (e.g. an Arduino command, which this course never shows).
 */
export async function runCommand(page: Page, title: string, onOpen?: () => void, opts: { instant?: boolean } = {}) {
  await page.keyboard.press('Control+Shift+P');
  const input = page.locator('.quick-input-widget input');
  await input.waitFor();
  await pause(page, 0.4);
  onOpen?.();
  if (opts.instant) await page.keyboard.insertText(title);
  else await typeHuman(page, title);
  await page
    .locator('.quick-input-list .monaco-list-row.focused', { hasText: title })
    .waitFor({ timeout: 10_000 });
  const rows = (await page.locator('.quick-input-list .monaco-list-row').allInnerTexts()).join(' | ');
  if (/arduino/i.test(rows)) throw new Error(`palette shows an Arduino command: ${rows}`);
  await pause(page, 0.5);
}

export async function quietStartup(page: Page) {
  // Silently, before recording: clear toasts and mute future ones.
  for (const cmd of ['Notifications: Clear All Notifications', 'Notifications: Toggle Do Not Disturb Mode']) {
    await page.keyboard.press('Control+Shift+P');
    await page.locator('.quick-input-widget input').waitFor();
    await page.keyboard.type(cmd);
    await page.locator('.quick-input-list .monaco-list-row.focused', { hasText: cmd }).waitFor();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
  }
}

export const terminal = (page: Page) => page.locator('.terminal-wrapper.active .xterm-rows');

export async function terminalText(page: Page) {
  return (await terminal(page).innerText().catch(() => '')).replace(/\u00a0/g, ' ');
}

export async function waitTerminal(page: Page, re: RegExp, timeoutS = 60) {
  const end = Date.now() + timeoutS * 1000;
  while (Date.now() < end) {
    if (re.test(await terminalText(page))) return;
    await page.waitForTimeout(150);
  }
  throw new Error(`terminal never showed ${re}\n---\n${await terminalText(page)}`);
}

/** The terminal row whose text matches (last match wins: newest output). */
export function terminalRow(page: Page, text: string | RegExp) {
  return terminal(page).locator(':scope > div', { hasText: text }).last();
}

/** The rendered Monaco line containing `text` in the active editor. */
export function editorLine(page: Page, text: string) {
  return page.locator('.editor-group-container.active .monaco-editor .view-lines .view-line', { hasText: text }).first();
}

/** Smallest box containing all of `boxes`. */
export function unionBox(...boxes: Box[]): Box {
  const x0 = Math.min(...boxes.map((b) => b[0]));
  const y0 = Math.min(...boxes.map((b) => b[1]));
  const x1 = Math.max(...boxes.map((b) => b[0] + b[2]));
  const y1 = Math.max(...boxes.map((b) => b[1] + b[3]));
  return [x0, y0, x1 - x0, y1 - y0];
}
