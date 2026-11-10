/**
 * Install ESP-IDF in VS Code: the recorded take (capture/takes/install-esp-idf.ts)
 * cut to narration. Every time comes from timeline.ts; boxes come from the take.
 */
import React from 'react';
import { AbsoluteFill, Audio, staticFile } from 'remotion';
import { ScreenCapture, type Box, type Callout, type Card, type Shot, type Spot } from '../../components/ScreenCapture';
import { CHAPTERS, CUE, IDF, INSTALL_FRAMES, TAKE_SIZE, TAKE_SRC, box, ev, sceneStart, takeTime, whenTake } from './timeline';

export { INSTALL_FRAMES };

const union = (...bs: Box[]): Box => {
  const x0 = Math.min(...bs.map((b) => b[0]));
  const y0 = Math.min(...bs.map((b) => b[1]));
  return [x0, y0, Math.max(...bs.map((b) => b[0] + b[2])) - x0, Math.max(...bs.map((b) => b[1] + b[3])) - y0];
};
// EIM's "Ready to Install" rows: the take boxed the label; widen to the row
// (the version dropdown spans the same width) so callouts sit beside the value.
const row = (id: string): Box => {
  const [x, y, , h] = box(id);
  const [vx, , vw] = box('eim-version');
  return [x, y, vx + vw - x, h];
};
// VS Code's left side (activity bar + sidebar), at a readable zoom.
const LEFT: Box = [0, 0, 1700, 956];

const shots: Shot[] = [
  { at: CUE.url - 0.5, box: box('vsc-page'), pad: 3.2, maxZoom: 2 },
  { at: CUE.win - 0.4, box: box('card-win'), pad: 1.5 },
  { at: CUE.mac - 0.4, box: box('card-mac'), pad: 1.5 },
  { at: CUE.linux - 0.4, box: box('card-linux'), pad: 1.5 },
  { at: sceneStart('open') - 0.2, box: null },
  { at: CUE.extView - 0.5, box: LEFT },
  { at: sceneStart('ext3') + 0.3, box: union(LEFT, box('ext-install')), pad: 1.1 },
  { at: CUE.trust - 0.5, box: box('trust'), pad: 1.5 },
  { at: sceneStart('ext6'), box: LEFT },
  { at: sceneStart('pre1'), box: null },
  { at: CUE.preUrl - 0.5, box: box('pre-page'), pad: 2.2, maxZoom: 2 },
  { at: CUE.preWin - 0.5, box: box('pre-win'), pad: 1.6 },
  { at: CUE.preMac - 0.5, box: box('pre-mac'), pad: 1.4 },
  { at: CUE.preLinux - 0.5, box: box('pre-linux'), pad: 1.5 },
  { at: CUE.vscode2, box: null },
  { at: CUE.palette - 0.4, box: box('palette-row'), pad: 1.7 },
  { at: CUE.activate - 0.4, box: box('activate'), pad: 1.7 },
  { at: CUE.starting, box: null },
  { at: CUE.palette2 - 0.4, box: box('palette2-row'), pad: 1.7 },
  { at: CUE.mirror - 0.3, box: box('mirror'), pad: 1.7 },
  { at: CUE.eimOpen - 0.3, box: union(box('eim-open'), box('eim-start')), pad: 1.5 },
  { at: CUE.eimEasy - 0.3, box: union(box('eim-easy'), box('eim-easy-btn')), pad: 1.4 },
  { at: CUE.eimReady - 0.3, box: union(box('eim-ready'), box('eim-go')), pad: 1.15 },
  { at: CUE.installing - 0.2, box: box('eim-installing'), pad: 1.04 },
  { at: CUE.eimDone - 0.3, box: box('eim-done'), pad: 1.3 },
  { at: CUE.vscode3, box: null },
  { at: CUE.selPalette - 0.4, box: box('sel-palette-row'), pad: 1.7 },
  { at: CUE.selPick - 0.3, box: box('sel-pick'), pad: 1.5 },
  { at: CUE.selDone - 0.2, box: box('sel-done'), pad: 6, maxZoom: 2.2 },
  { at: CUE.termIcon - 0.4, box: box('term-icon'), pad: 6, maxZoom: 2.2 },
  { at: CUE.termOpen - 0.3, box: box('term-open'), pad: 1.05 },
  { at: CUE.typed - 0.4, box: box('typed'), pad: 2.4, maxZoom: 2.6 },
  { at: CUE.outro, box: null, move: 1.4 },
];

const S = (from: number, to: number, id: string): Spot => ({ from, to, box: box(id) });
const spots: Spot[] = [
  S(CUE.url, CUE.win - 0.2, 'vsc-page'),
  S(CUE.win, CUE.mac - 0.2, 'card-win'),
  S(CUE.mac, CUE.linux - 0.2, 'card-mac'),
  S(CUE.linux, sceneStart('open'), 'card-linux'),
  S(CUE.folder, sceneStart('ext1'), 'vscode-window'),
  S(CUE.extSearch, CUE.extRow - 0.6, 'ext-typing'),
  S(CUE.extRow, sceneStart('ext4'), 'ext-row'),
  S(CUE.extInstall, sceneStart('ext5'), 'ext-install'),
  S(CUE.trustBtn, sceneStart('ext6'), 'trust-btn'),
  S(CUE.icon, sceneStart('pre1'), 'ext-done'),
  S(CUE.preUrl, CUE.preWin - 0.6, 'pre-page'),
  S(CUE.preWin + 0.3, CUE.preMac - 0.6, 'pre-win'),
  S(CUE.linuxList, sceneStart('eim1'), 'pre-linux'),
  S(CUE.paletteRow, sceneStart('eim4'), 'palette-row'),
  S(CUE.activateBtn, sceneStart('eim6'), 'activate-btn'),
  S(CUE.palette2 + 0.5, sceneStart('eim7'), 'palette2-row'),
  S(CUE.mirrorRow, sceneStart('eim8'), 'mirror-row'),
  S(CUE.eimStart, sceneStart('eim10'), 'eim-start'),
  S(CUE.eimEasyBtn, sceneStart('eim11'), 'eim-easy-btn'),
  S(CUE.eimVersion, CUE.eimLocation - 0.2, 'eim-version'),
  { from: CUE.eimLocation, to: CUE.eimTime - 0.2, box: row('eim-location') },
  { from: CUE.eimTime, to: CUE.eimGo - 0.2, box: row('eim-time') },
  S(CUE.eimGo, sceneStart('eim12'), 'eim-go'),
  S(whenTake('sel-palette-row'), sceneStart('sel2'), 'sel-palette-row'),
  S(CUE.selRow, sceneStart('sel3'), 'sel-row'),
  S(CUE.status, sceneStart('chk1'), 'sel-done'),
  S(CUE.termIcon, sceneStart('chk1b'), 'term-icon'),
  S(CUE.version, sceneStart('serial'), 'version'),
];

const C = (from: number, to: number, id: string, text: string, side: Callout['side'] = 'right'): Callout => ({ from, to, box: box(id), text, side });
const callouts: Callout[] = [
  C(CUE.url + 0.3, CUE.win - 0.2, 'vsc-page', 'code.visualstudio.com/download', 'below'),
  C(CUE.win + 0.3, CUE.mac - 0.2, 'card-win', 'Windows: run the installer', 'below'),
  C(CUE.mac + 0.3, CUE.linux - 0.2, 'card-mac', 'Mac: drag VS Code into Applications', 'below'),
  C(CUE.linux + 0.3, sceneStart('open'), 'card-linux', '.deb (Ubuntu) · .rpm (Fedora) · not Snap', 'below'),
  C(CUE.folder + 0.3, sceneStart('ext1'), 'vscode-window', 'an empty folder: esp32', 'below'),
  C(CUE.extView + 0.6, CUE.extSearch - 0.2, 'ext-typing', 'Mac: ⇧⌘X'),
  C(CUE.extRow + 0.3, sceneStart('ext4'), 'ext-row', 'by Espressif Systems'),
  C(CUE.icon + 0.3, sceneStart('pre1'), 'ext-done', 'the Espressif icon'),
  C(CUE.preUrl + 0.3, CUE.preWin - 0.6, 'pre-page', 'ESP-IDF Installation Manager docs → Prerequisites', 'below'),
  C(CUE.preWin + 0.6, CUE.preMac - 0.6, 'pre-win', 'Windows: nothing to install here', 'above'),
  C(CUE.palette + 0.6, CUE.paletteRow - 0.2, 'palette-row', 'Mac: ⇧⌘P', 'below'),
  C(CUE.activateBtn + 0.3, sceneStart('eim6'), 'activate-btn', 'Activate Anyway', 'above'),
  C(CUE.eimVersion + 0.3, CUE.eimLocation - 0.2, 'eim-version', `newest: ${IDF}`),
  { from: CUE.eimLocation + 0.3, to: CUE.eimTime - 0.2, box: row('eim-location'), text: 'your home folder', side: 'right' },
  { from: CUE.eimTime + 0.3, to: CUE.eimGo - 0.2, box: row('eim-time'), text: '10–45 min', side: 'right' },
  C(CUE.selRow + 0.3, sceneStart('sel3'), 'sel-row', IDF),
  C(CUE.status + 0.3, sceneStart('chk1'), 'sel-done', (ev('sel-done').text ?? '').trim(), 'above'),
  C(CUE.termIcon + 0.3, sceneStart('chk1b'), 'term-icon', 'Open ESP-IDF Terminal', 'above'),
  C(CUE.version + 0.3, sceneStart('serial'), 'version', 'installed'),
];

const cards: Card[] = [
  { from: CUE.three, to: CUE.threeOut, title: 'You need three things', lines: ['1  VS Code', '2  the ESP-IDF extension', '3  ESP-IDF'], mono: false },
  { from: CUE.brew, to: CUE.brewOut, title: 'Mac · in Terminal', lines: ['brew install libgcrypt glib pixman sdl2 libslirp dfu-util cmake python'], note: 'Install Homebrew first: brew.sh' },
  {
    from: CUE.apt, to: CUE.aptOut, title: 'Ubuntu / Debian · in a terminal',
    lines: ['sudo apt-get install git wget flex bison gperf python3 python3-pip python3-venv cmake ninja-build ccache libffi-dev libssl-dev dfu-util libusb-1.0-0'],
    note: 'Other Linux: install the packages listed on the page',
  },
  { from: CUE.serial, to: CUE.serialOut, title: 'Linux · USB serial port access', lines: ['sudo usermod -a -G dialout $USER'], note: 'Then log out and back in. (Arch Linux: uucp instead of dialout)' },
  {
    from: CUE.drivers, to: sceneStart('outro'), title: "Windows / Mac · if your board doesn't show up",
    lines: ['CP210x  silabs.com/developers/usb-to-uart-bridge-vcp-drivers', 'FTDI    ftdichip.com/drivers/vcp-drivers'],
  },
];

export const InstallESPIDF: React.FC = () => (
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
    <Audio src={staticFile('install-esp-idf/mix.wav')} />
  </AbsoluteFill>
);
