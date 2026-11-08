// Launch the stage, wait for the workbench, take one screenshot.
import { startStage } from './lib/stage.ts';

const stage = await startStage({ workspace: 'capture/demo-project', root: 'capture' });
try {
  await stage.page.waitForTimeout(4000);
  await stage.page.screenshot({ path: '/tmp/vscode-smoke.png' });
  console.log('ok', stage.page.viewportSize(), await stage.page.evaluate(() => [innerWidth, innerHeight, devicePixelRatio]));
  const { execSync } = await import('node:child_process');
  execSync(`ffmpeg -y -loglevel error -f x11grab -video_size 2560x1440 -i ${stage.display} -frames:v 1 /tmp/vscode-x11.png`);
} finally {
  await stage.stop();
}
