/**
 * Spike: a real VS Code take (capture/takes/spike.ts) cut to narration.
 * Every time comes from timeline.ts: beats re-time the take to the voice,
 * cues tie camera moves, spotlights and callouts to spoken words, and boxes
 * come from the take's event log.
 */
import React from 'react';
import { AbsoluteFill, Audio, staticFile } from 'remotion';
import { ScreenCapture, type Box, type Callout, type Shot, type Spot } from '../../components/ScreenCapture';
import { CUE, SPIKE_FRAMES, TAKE_SIZE, TAKE_SRC, box, sceneStart, takeTime } from './timeline';

export { SPIKE_FRAMES };

const union = (...bs: Box[]): Box => {
  const x0 = Math.min(...bs.map((b) => b[0]));
  const y0 = Math.min(...bs.map((b) => b[1]));
  return [x0, y0, Math.max(...bs.map((b) => b[0] + b[2])) - x0, Math.max(...bs.map((b) => b[1] + b[3])) - y0];
};

const shots: Shot[] = [
  { at: CUE.status - 0.5, box: box('start'), pad: 5, maxZoom: 2.2 },
  { at: CUE.palette, box: box('palette'), pad: 1.6 },
  { at: CUE.terminal, box: box('terminal-open'), pad: 1.05 },
  { at: CUE.command, box: box('typed'), pad: 2.2, maxZoom: 2.6 },
  { at: CUE.open, box: box('palette'), pad: 1.6 },
  { at: CUE.editor - 0.2, box: union(box('line-define'), box('line-loop'), box('show-line')), pad: 1.5, maxZoom: 2.4 },
  { at: CUE.line - 0.3, box: box('show-line'), pad: 2.4, maxZoom: 2.4 },
  { at: CUE.outro, box: null, move: 1.4 },
];

const spots: Spot[] = [
  { from: CUE.status, to: CUE.palette, box: box('start') },
  { from: CUE.version, to: CUE.versionOut, box: box('version') },
  { from: CUE.gpio2, to: CUE.loop - 0.1, box: box('line-define') },
  { from: CUE.loop, to: sceneStart('line'), box: box('line-loop') },
  { from: CUE.lineSpot, to: CUE.outro, box: box('show-line') },
];

const callouts: Callout[] = [
  { from: CUE.status + 0.3, to: CUE.palette, box: box('start'), text: 'the ESP-IDF version it found', side: 'right' },
  { from: CUE.version + 0.2, to: CUE.versionOut, box: box('version'), text: 'this course uses ESP-IDF v6', side: 'right' },
  { from: CUE.gpio2 + 0.2, to: CUE.loop - 0.1, box: box('line-define'), text: 'the LED is on GPIO 2', side: 'right' },
  { from: CUE.loop + 0.2, to: sceneStart('line'), box: box('line-loop'), text: 'on 500 ms · off 500 ms · forever', side: 'right' },
  { from: CUE.output, to: CUE.outro, box: box('show-line'), text: 'make the pin an output', side: 'right' },
];

export const VSCodeSpike: React.FC = () => (
  <AbsoluteFill>
    <ScreenCapture src={TAKE_SRC} size={TAKE_SIZE} shots={shots} spots={spots} callouts={callouts} remap={takeTime} />
    <Audio src={staticFile('vscode-spike/mix.wav')} />
  </AbsoluteFill>
);
