// Stage for the install-esp-idf take: a fresh VS Code (no extensions), a
// private home shown as /home/learner (empty: no ESP-IDF, no EIM), `eim`
// hidden from PATH, and EIM's WebKit inspector on :9444 so the take can
// drive the installer window. GDK_SCALE=2 makes EIM sharp at 4K;
// VS Code keeps scale 1 (its zoom comes from the profile).
import type { StageOptions } from '../../lib/stage.ts';

export const EIM_INSPECTOR = 9444;
export const stageOptions: StageOptions = {
  workspace: 'capture/takes/install-esp-idf/esp32', // doesn't exist → opens as an empty folder
  root: 'capture',
  // DEV_EXT=1: start with the extension already in (to work on the later steps).
  extensions: process.env.DEV_EXT ? ['espressif.esp-idf-extension-2.3.0'] : [],
  home: process.env.TAKE_HOME ?? 'capture/.run/home',
  keepHome: !!process.env.TAKE_HOME,
  hideBins: ['eim'],
  settings: 'capture/profile/settings-install.json',
  args: ['--force-device-scale-factor=1'],
  env: {
    WEBKIT_INSPECTOR_HTTP_SERVER: `127.0.0.1:${EIM_INSPECTOR}`,
    GDK_BACKEND: 'x11',
    GDK_SCALE: '2',
    WEBKIT_DISABLE_COMPOSITING_MODE: '1',
    EGL_LOG_LEVEL: 'fatal', // no MESA-EGL warnings in the EIM terminal
  },
};
export const browser = true;
