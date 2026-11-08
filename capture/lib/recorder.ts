// Records the Xvfb display with ffmpeg and timestamps events against the
// video's first frame. ffmpeg prints the first frame's wall-clock time as the
// input's "start:", so event times are exact to the frame, not "roughly when
// ffmpeg was launched".
import { spawn } from 'node:child_process';

export type Box = [x: number, y: number, w: number, h: number]; // screen px
export type CaptureEvent = { t: number; id: string; box?: Box; text?: string };

export async function startRecording(opts: {
  display: string;
  size: [number, number];
  out: string;
  fps?: number;
}) {
  const fps = opts.fps ?? 30;
  const ff = spawn(
    'ffmpeg',
    [
      '-y',
      '-hide_banner',
      '-f', 'x11grab',
      '-draw_mouse', '0',
      '-framerate', String(fps),
      '-video_size', `${opts.size[0]}x${opts.size[1]}`,
      '-i', opts.display,
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-crf', '12',
      '-pix_fmt', 'yuv444p',
      opts.out,
    ],
    { stdio: ['pipe', 'ignore', 'pipe'] },
  );
  let log = '';
  const start = await new Promise<number>((res, rej) => {
    ff.stderr.on('data', (d) => {
      log += d;
      const m = log.match(/start: ([\d.]+)/);
      if (m) res(Number(m[1]));
    });
    ff.on('exit', (c) => rej(new Error(`ffmpeg exited ${c}\n${log}`)));
  });

  const events: CaptureEvent[] = [];
  const now = () => Date.now() / 1000 - start;
  return {
    now,
    events,
    mark(id: string, extra: Omit<CaptureEvent, 't' | 'id'> = {}) {
      const e = { t: +now().toFixed(3), id, ...extra };
      events.push(e);
      console.log(`  ${e.t.toFixed(2).padStart(7)}s  ${id}${e.box ? '  ' + e.box.join(',') : ''}`);
      return e;
    },
    async stop() {
      const done = new Promise((r) => ff.on('exit', r));
      ff.stdin.write('q');
      await done;
      return now();
    },
  };
}
