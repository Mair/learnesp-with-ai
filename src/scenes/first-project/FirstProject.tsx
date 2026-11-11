/**
 * A first ESP-IDF project in VS Code: the recorded take
 * (capture/takes/first-project.ts) cut to narration. Every time comes from
 * timeline.ts; boxes come from the take.
 */
import React from 'react';
import { AbsoluteFill, Audio, staticFile } from 'remotion';
import { ScreenCapture, type Box, type Callout, type Card, type Shot, type Spot } from '../../components/ScreenCapture';
import { CHAPTERS, CUE, FIRST_FRAMES, SCENES, TAKE_SIZE, TAKE_SRC, box, sceneStart, takeTime } from './timeline';

export { FIRST_FRAMES };

const union = (...bs: Box[]): Box => {
  const x0 = Math.min(...bs.map((b) => b[0]));
  const y0 = Math.min(...bs.map((b) => b[1]));
  return [x0, y0, Math.max(...bs.map((b) => b[0] + b[2])) - x0, Math.max(...bs.map((b) => b[1] + b[3])) - y0];
};
// VS Code's left side (activity bar + sidebar), at a readable zoom.
const LEFT: Box = [0, 0, 1700, 956];
// The six lines of main.c (the take's boxes: #include … the typed printf).
// The "Total image size: … bytes" line at the top of the build output's last screen.
const SIZE: Box = [470, 1885, 1100, 52];
// The monitor's lines (left part of the panel) and the "Returned from app_main()" row under "Hello world!".
// The Flash Done toast moves once the clip plays on (other toasts go away): spot it during the hold only.
const A_FLASH4_LEAD = sceneStart('flash4') + (SCENES.find((x) => x.id === 'flash4')!.clip.lead ?? 0);
const MON: Box = [453, 1817, 1700, 286];
const RET: Box = [479, 1975, 720, 58];
const CODE: Box = union(box('include'), box('app-main'), box('typed'), [581, 110, 900, 330]);

const shots: Shot[] = [
  { at: CUE.folder - 0.5, box: LEFT },
  { at: CUE.palette - 0.4, box: box('palette-row'), pad: 1.7 },
  { at: CUE.activate - 0.4, box: box('activate'), pad: 1.7 },
  { at: CUE.name - 0.3, box: box('name'), pad: 1.7 },
  { at: CUE.folderBox - 0.3, box: box('folder'), pad: 1.7 },
  { at: CUE.created - 0.3, box: box('created'), pad: 1.7 },
  { at: CUE.win2, box: null },
  { at: CUE.cmake - 0.5, box: LEFT },
  { at: CUE.editor - 0.3, box: CODE, pad: 1.3 },
  { at: CUE.chipIcon - 0.4, box: box('target-item'), pad: 6, maxZoom: 2.2 },
  { at: CUE.targetPick - 0.3, box: box('target-pick'), pad: 1.25 },
  { at: CUE.ocd - 0.3, box: box('ocd'), pad: 1.25 },
  { at: sceneStart('chip4'), box: null },
  { at: CUE.targetDone - 0.4, box: box('target-done'), pad: 2.2 },
  { at: CUE.buildIcon - 0.4, box: box('build-item'), pad: 8, maxZoom: 2.2 },
  { at: CUE.building - 0.3, box: null },
  { at: CUE.buildDone - 0.3, box: box('build-done'), pad: 2.2 },
  { at: CUE.size - 0.5, box: SIZE, pad: 1.5, maxZoom: 2.4 },
  { at: CUE.plug - 0.4, box: box('port-item'), pad: 8, maxZoom: 2.2 },
  { at: CUE.portPick - 0.3, box: box('port-pick'), pad: 1.4 },
  { at: CUE.portDone - 0.2, box: box('port-done'), pad: 8, maxZoom: 2.2 },
  { at: CUE.flashIcon - 0.4, box: box('flash-item'), pad: 8, maxZoom: 2.2 },
  { at: CUE.method - 0.3, box: box('method'), pad: 1.5 },
  { at: sceneStart('flash3'), box: null },
  { at: CUE.flashDone - 0.3, box: box('flash-done'), pad: 2.2 },
  { at: A_FLASH4_LEAD, box: null },
  { at: CUE.monIcon - 0.4, box: box('monitor-item'), pad: 8, maxZoom: 2.2 },
  { at: CUE.monitor, box: MON, pad: 1.1 },
  { at: CUE.outro, box: null, move: 1.4 },
];

const S = (from: number, to: number, id: string): Spot => ({ from, to, box: box(id) });
const spots: Spot[] = [
  S(CUE.paletteRow, sceneStart('act1'), 'palette-row'),
  S(CUE.activateBtn, sceneStart('act3'), 'activate-btn'),
  S(CUE.nameTyped - 0.6, sceneStart('folder'), 'name-typed'),
  S(CUE.folderOk, sceneStart('created'), 'folder-ok'),
  S(CUE.openBtn, sceneStart('win2'), 'open-btn'),
  S(CUE.cmake, CUE.main - 0.2, 'cmake'),
  S(CUE.main, CUE.mainc - 0.2, 'main-click'),
  S(CUE.mainc, sceneStart('tour3'), 'mainc'),
  S(CUE.include, CUE.appMain - 0.2, 'include'),
  S(CUE.appMain, sceneStart('code1'), 'app-main'),
  S(CUE.typed, sceneStart('code3'), 'typed'),
  S(CUE.saved, sceneStart('chip1'), 'saved'),
  S(CUE.chipIcon, sceneStart('chip2'), 'target-item'),
  S(CUE.targetRow, CUE.targetClick + 0.2, 'target-row'),
  S(CUE.ocdRow - 0.6, CUE.ocdRow + 0.2, 'ocd-row'),
  S(CUE.targetDone, sceneStart('build1'), 'target-done'),
  S(CUE.buildIcon, sceneStart('build2'), 'build-item'),
  S(CUE.buildDone, CUE.size - 0.5, 'build-done'),
  { from: CUE.size + 0.3, to: sceneStart('port1'), box: SIZE },
  S(CUE.plug, sceneStart('port2'), 'port-item'),
  S(CUE.portRow, CUE.portClick + 0.2, 'port-row'),
  S(CUE.portDone, sceneStart('flash1'), 'port-done'),
  S(CUE.flashIcon, sceneStart('flash2'), 'flash-item'),
  S(CUE.uart - 0.6, CUE.uart + 0.2, 'method-row'),
  S(CUE.flashDone, A_FLASH4_LEAD, 'flash-done'),
  S(CUE.monIcon, sceneStart('mon2'), 'monitor-item'),
  S(CUE.hello, CUE.returned - 0.2, 'hello'),
  { from: CUE.returned, to: sceneStart('mon4'), box: RET },
];

const w3 = (t: number) => t - 0.6;
const C = (from: number, to: number, id: string, text: string, side: Callout['side'] = 'right'): Callout => ({ from, to, box: box(id), text, side });
const callouts: Callout[] = [
  C(CUE.palette + 0.6, CUE.paletteRow - 0.2, 'palette-row', 'Mac: ⇧⌘P', 'below'),
  C(CUE.activateBtn + 0.3, sceneStart('act3'), 'activate-btn', 'Activate Anyway', 'left'),
  C(CUE.nameTyped, sceneStart('folder'), 'name-typed', 'hello_world', 'below'),
  C(CUE.folderOk + 0.3, sceneStart('created'), 'folder', 'your esp32 folder → OK', 'below'),
  C(CUE.cmake + 0.3, CUE.main - 0.2, 'cmake', 'this folder is a project'),
  C(CUE.mainc + 0.3, sceneStart('tour3'), 'mainc', 'your code'),
  C(CUE.boots, sceneStart('code1'), 'app-main', 'your program starts here'),
  C(CUE.newline, sceneStart('code3'), 'typed', '\\n = end of the line', 'below'),
  C(CUE.save + 0.3, sceneStart('chip1'), 'saved', 'Mac: ⌘S', 'right'),
  C(CUE.chipIcon + 0.3, sceneStart('chip2'), 'target-item', 'Set Espressif Device Target', 'above'),
  C(CUE.targetRow + 0.3, CUE.targetClick + 0.2, 'target-row', 'my board: ESP32-S3', 'below'),
  C(w3(CUE.ocdRow), CUE.ocdRow + 0.2, 'ocd-row', 'not used in this course', 'below'),
  C(CUE.buildIcon + 0.3, sceneStart('build2'), 'build-item', 'Build Project', 'above'),
  { from: CUE.size + 0.4, to: sceneStart('port1'), box: SIZE, text: 'how big your program is', side: 'above' },
  C(CUE.plug + 0.3, sceneStart('port2'), 'port-item', 'Select Port to Use', 'above'),
  C(CUE.portRow + 0.4, CUE.portClick + 0.2, 'port-row', 'Linux /dev/tty… · Windows COM… · Mac /dev/cu.…', 'below'),
  C(CUE.flashIcon + 0.3, sceneStart('flash2'), 'flash-item', 'Flash Device', 'above'),
  C(CUE.uart - 0.4, CUE.uart + 0.2, 'method-row', 'over the USB cable', 'below'),
  C(CUE.monIcon + 0.3, sceneStart('mon2'), 'monitor-item', 'Monitor Device', 'above'),
  C(CUE.hello + 0.3, CUE.returned - 0.2, 'hello', 'your printf'),
  { from: CUE.returned + 0.3, to: sceneStart('mon4'), box: RET, text: 'app_main is done', side: 'right' },
  { from: CUE.exit + 0.2, to: sceneStart('outro'), box: MON, text: 'Ctrl + ]  stops the monitor', side: 'above' },
];

const cards: Card[] = [
  {
    from: CUE.steps, to: CUE.stepsOut, title: 'Your first program', mono: false,
    lines: ['1  Create the project', '2  Write one line of code', '3  Pick the chip', '4  Build', '5  Run it on the board'],
  },
];

export const FirstProject: React.FC = () => (
  <AbsoluteFill>
    <ScreenCapture
      src={TAKE_SRC}
      size={TAKE_SIZE}
      shots={shots}
      spots={spots}
      callouts={callouts}
      cards={cards}
      chapters={CHAPTERS}
      remap={takeTime}
    />
    <Audio src={staticFile('first-project/mix.wav')} />
  </AbsoluteFill>
);
