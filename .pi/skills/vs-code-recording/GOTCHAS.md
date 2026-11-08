# Gotchas: found while building the vscode-spike take

Each one is already handled in `capture/lib/`. Keep it that way when changing the code.

| Symptom | Cause | Fix (where) |
|---|---|---|
| `Browser.getWindowForTarget wasn't found` | Electron's CDP has no window-bounds methods | `lib/xfill.py` resizes the X window; `stage.ts` repeats it until the size holds |
| Window stays 1440×900 with `window.newWindowDimensions: "fullscreen"` | Xvfb has no window manager to honour maximize/fullscreen | same as above (`xfill.py`) |
| The ESP-IDF extension fails to activate: "Could not identify extension for 'vscode' require call" | the extension folder was symlinked; Node resolves `dist/` to its real path outside the extensions dir | **copy** the extension (`copyExtension` in `stage.ts`) |
| An Arduino command appears in the palette under "similar commands" | VS Code's TF-IDF "similar commands" search is always on (no setting turns it off) | `HIDE_COMMANDS` in `stage.ts` adds `commandPalette` `when: false` to the copied extension's `package.json` |
| The empty palette shows "recently used: Notifications: …" | setup commands run through the palette go into its history | `"workbench.commandPalette.history": 0` in `profile/settings.json` |
| Toasts ("compile_commands.json is missing", "extension updated") | the extension's startup notifications | `quietStartup()` before recording + `"idf.notificationMode": "Output"` |
| `(venv)` and a personal prompt in the terminal | the user's `.bashrc`, the IDF venv activation | `idf.customTerminalExecutable` + `profile/bashrc` (`PS1`, `VIRTUAL_ENV_DISABLE_PROMPT=1`) |
| Terminal text can't be read or waited on | xterm.js's GPU renderer draws to a canvas | `"terminal.integrated.gpuAcceleration": "off"` (DOM renderer) |
| Spotlight runs off-screen; the camera can't zoom in | Monaco lines and xterm rows are full-width elements | `textBox()` measures a Range over the visible text, leading spaces trimmed |
| Soft text when zoomed | a 2560-px source enlarged ×1.8 | record at 3840×2160 with `window.zoomLevel` 3.2 (same layout, zoomed shots ≈ 1:1) |
| A mark is a few hundred ms off the video | timing taken from when ffmpeg was launched | `recorder.ts` uses ffmpeg's input `start:` (the first frame's wall-clock time) |
| Matroska file broken with `-copyts` | x11grab timestamps are wall-clock µs, too large | don't use `-copyts`; parse `start:` instead |
| `pkill -f capture/.run/…` kills the shell running it | the pattern matches its own command line | `pkill -f '[c]apture/.run'` |
| Stills render fails: "Could not extract frame from compositor … ECANCELED", "disk space is low" | `/tmp` (tmpfs) full of `remotion-webpack-bundle-*` left by `stills.mjs` (~600 MB each, a copy of `public/`) | delete the bundles *you* created; leave other sessions' ones alone |
| The typed text appears before the VO says "type" | the take types right at the start of its stretch | `clip.lead: w(line, word)` holds the first frame until that word |
| The camera still frames the old widget after the new one appears | cues in narration time vs. when the video gets there | `whenTake(event)` = the output time the video reaches a take event |
| `ffmpeg … tile=4x3 -frames:v 1` writes nothing | fewer frames than tiles | use `-update 1`, or a tile count ≤ the frames you'll get |
