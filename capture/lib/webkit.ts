// Drive a WebKitGTK app (the ESP-IDF Installation Manager is a Tauri app)
// through WebKit's remote inspector. Start the app with
// WEBKIT_INSPECTOR_HTTP_SERVER=127.0.0.1:<port>; this connects to its page,
// runs JavaScript in it, clicks by text and measures elements in screen px
// (window position from xwin.py + the page's devicePixelRatio).
import type { Box } from './recorder.ts';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type WebKitApp = {
  /** Evaluate a function body in the page; its return value comes back JSON-copied. */
  eval: <T = unknown>(body: string) => Promise<T>;
  /** Poll `body` until it returns truthy. */
  waitFor: (body: string, timeoutS?: number, label?: string) => Promise<void>;
  /** Wait for a visible button whose text is exactly `text`, then click it. */
  click: (text: string, timeoutS?: number) => Promise<void>;
  /** Screen box of the first visible element (matching `selector`) whose text includes `text`. */
  box: (text: string, selector?: string, pad?: number) => Promise<Box>;
  text: () => Promise<string>;
  close: () => void;
};

export async function connectWebKit(opts: {
  port: number;
  /** Returns the app window's screen position {x, y}. */
  windowPos: () => { x: number; y: number };
  timeoutS?: number;
}): Promise<WebKitApp> {
  // The inspector's index page lists targets; take the first WebPage socket.
  const end = Date.now() + (opts.timeoutS ?? 60) * 1000;
  let path: string | undefined;
  while (!path && Date.now() < end) {
    const html = await fetch(`http://127.0.0.1:${opts.port}/`).then((r) => r.text()).catch(() => '');
    path = html.match(/\/socket\/\d+\/\d+\/WebPage/)?.[0];
    if (!path) await sleep(500);
  }
  if (!path) throw new Error(`no WebKit inspector target on port ${opts.port}`);

  const ws = new WebSocket(`ws://127.0.0.1:${opts.port}${path}`);
  let target: string | undefined;
  let nextId = 1;
  const pending = new Map<number, (r: any) => void>();
  ws.onmessage = (e) => {
    const m = JSON.parse(String(e.data));
    if (m.method === 'Target.targetCreated' && m.params.targetInfo.type === 'page') target = m.params.targetInfo.targetId;
    if (m.method === 'Target.dispatchMessageFromTarget') {
      const r = JSON.parse(m.params.message);
      pending.get(r.id)?.(r);
      pending.delete(r.id);
    }
  };
  await new Promise<void>((res, rej) => {
    ws.onopen = () => res();
    ws.onerror = () => rej(new Error('WebKit inspector socket failed'));
  });
  while (!target && Date.now() < end) await sleep(100);
  if (!target) throw new Error('WebKit inspector: no page target');

  const evaluate = <T>(body: string): Promise<T> =>
    new Promise((res, rej) => {
      const id = nextId++;
      pending.set(id, (r) => {
        const v = r.result?.result;
        if (r.error || r.result?.wasThrown) rej(new Error(`WebKit eval failed: ${JSON.stringify(r.error ?? v)}`));
        else res(v?.value === undefined ? (undefined as T) : JSON.parse(v.value));
      });
      ws.send(JSON.stringify({ id: nextId++, method: 'Target.sendMessageToTarget', params: { targetId: target,
        message: JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression: `JSON.stringify((()=>{${body}})())`, returnByValue: true } }) } }));
    });

  const waitFor = async (body: string, timeoutS = 30, label = body) => {
    const until = Date.now() + timeoutS * 1000;
    while (Date.now() < until) {
      if (await evaluate<boolean>(body).catch(() => false)) return;
      await sleep(250);
    }
    throw new Error(`WebKit: timed out waiting for ${label}`);
  };
  const VISIBLE = 'const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0};';
  const findButton = (text: string) =>
    `${VISIBLE}return [...document.querySelectorAll('button')].find(b=>vis(b)&&b.innerText.trim()===${JSON.stringify(text)})`;

  return {
    eval: evaluate,
    waitFor,
    click: async (text, timeoutS = 30) => {
      await waitFor(`${findButton(text)}?true:false`, timeoutS, `button "${text}"`);
      await evaluate(`const b=(()=>{${findButton(text)}})(); b.click(); return true`);
    },
    box: async (text, selector = '*', pad = 0) => {
      const r = await evaluate<{ x: number; y: number; w: number; h: number; dpr: number } | null>(
        `${VISIBLE}const t=${JSON.stringify(text)};` +
          `const els=[...document.querySelectorAll(${JSON.stringify(selector)})].filter(e=>vis(e)&&e.innerText&&e.innerText.includes(t));` +
          // innermost match: the element that holds the text, not a page-wide wrapper
          `const e=els.filter(e=>![...e.children].some(c=>els.includes(c))).at(0); if(!e) return null;` +
          `const b=e.getBoundingClientRect(); return {x:b.x,y:b.y,w:b.width,h:b.height,dpr:devicePixelRatio}`,
      );
      if (!r) throw new Error(`WebKit: no element with text "${text}"`);
      const { x, y } = opts.windowPos();
      return [
        Math.round(x + (r.x - pad) * r.dpr),
        Math.round(y + (r.y - pad) * r.dpr),
        Math.round((r.w + 2 * pad) * r.dpr),
        Math.round((r.h + 2 * pad) * r.dpr),
      ];
    },
    text: () => evaluate<string>('return document.body.innerText'),
    close: () => ws.close(),
  };
}
