// Stage for the first-project take: VS Code with the ESP-IDF extension and the
// ESP-IDF v6.1 that the install-esp-idf take installed (capture/.devhome, kept
// between runs, shown as /home/learner). The workspace is the empty "esp32"
// folder the learner made in install-esp-idf.
import type { StageOptions } from '../../lib/stage.ts';

export const stageOptions: StageOptions = {
  workspace: 'capture/takes/first-project/esp32', // doesn't exist → a new, empty folder
  root: 'capture',
  home: 'capture/.devhome',
  keepHome: true,
  hideBins: ['eim'], // also gives eim_idf.json's gitPath (capture/.run/bin/git)
  settings: 'capture/profile/settings-project.json',
  workspaceInHome: true, // /home/learner/esp32 in paths and dialogs
  args: ['--force-device-scale-factor=1'],
  // The learner has run the extension before (install-esp-idf): no "just got updated" toast.
  // The port picker shows only the take's board (this machine has other boards attached).
  serialPorts: process.env.BOARD ? [process.env.BOARD] : undefined,
  globalState: { 'espressif.esp-idf-extension': { 'esp.extension.version': '2.3.0' } },
};
