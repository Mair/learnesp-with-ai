# Gotchas: found while building the vscode-spike take

Each one is already handled in `capture/lib/`. Keep it that way when changing the code.

| Symptom | Cause | Fix (where) |
|---|---|---|
| `Browser.getWindowForTarget wasn't found` | Electron's CDP has no window-bounds methods | `lib/xwin.py fill` resizes the X window; `stage.ts` repeats it until the size holds |
| Window stays 1440×900 with `window.newWindowDimensions: "fullscreen"` | Xvfb has no window manager to honour maximize/fullscreen | same as above (`xwin.py`) |
| `xwin.py` finds no "Visual Studio Code" window | Electron/GTK set only the UTF-8 `_NET_WM_NAME`, not `WM_NAME` | `xwin.py` reads `_NET_WM_NAME` first |
| A browser window opened on the real desktop | `WAYLAND_DISPLAY` is set inside the distrobox container | `browser.ts` runs Chromium with `env -u WAYLAND_DISPLAY DISPLAY=:99 --ozone-platform=x11` |
| "Chrome for Testing … only for automated testing" bar | Playwright's Chromium build | `--disable-infobars` (`--test-type` doesn't do it) |
| Two browser windows | connecting before the startup tab registered → `newPage()` | wait for `pages()[0]` before opening one |
| Chromium/EIM pop back over VS Code or to 0,0 after being moved | no WM: apps raise and re-place their own windows | close the browser when done with it; pin EIM's position with a 300 ms check |
| EIM installs fail: "No space left on device" | it unpacks GBs into `$TMPDIR`; `/tmp` is a 7.8 GB tmpfs shared with other sessions | `stage.ts` sets `TMPDIR=capture/.run/tmp` for sandboxed takes |
| The extension skips "download EIM" | `/usr/bin/eim` is on this machine's PATH | `hideBins: ['eim']` (a PATH of symlinks without it) |
| EIM text tiny at 4K | GTK at scale 1 | `GDK_SCALE=2` for the sandbox; VS Code keeps `--force-device-scale-factor=1` |
| Paths like `/home/mairs/projects/…/.espressif` on screen | a private home inside the repo | `home` → bubblewrap shows it as `/home/learner` |
| A home folder you wanted to keep is gone | `startStage` wipes `capture/.run/` (except `home` with `keepHome`) | keep persistent homes outside `.run/` (`capture/.devhome`) |
| Typing goes nowhere in a new terminal | focus stayed on the walkthrough/editor; a widget layer covers `.xterm-rows` | click `.terminal-wrapper.active .xterm` with `force: true` first |
| `pkill -f '[x]yz'` still kills its own shell | the same command line also contains `xyz` unbracketed (e.g. in launch args) | kill in a separate command, or by pid |
| The Read tool shows a stale or missing image | its view of new files lags | write frames to a new file name, read twice |
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
| Video sticks on one frame late in the render (e.g. "Downloading 22%") | `<Freeze frame>` is clamped to the composition's length; a take longer than the video can't be reached that way | `ScreenCapture` freezes at 0 and picks the take frame with `trimBefore` |
| A dark unpainted rectangle where another window was (palette invisible) | Electron (no GPU compositing) doesn't repaint regions uncovered by another window | `xwin.py nudge` (resize 2 px and back) after every switch; mark *after* the repaint |
| Arduino command visible while typing in the palette | VS Code's "similar commands" (TF-IDF) for queries with "ESP-IDF"; Marketplace installs can't be patched with `HIDE_COMMANDS` | `runCommand(…, { instant: true })` inserts the whole title; `runCommand` throws if any row says Arduino; for "Open ESP-IDF Terminal" (whose similar commands include it) click the status bar icon instead |
| A click happens before the word that names it | the beat was sped up (`maxRate`), so the fixed pause before the click shrank | mark right before every click (`*-click`); click beats at 1× with `lead: land(word, from, click)`; speed up only the wait *after* a click, in its own beat |
| A spotlight/callout appears before the thing it points at | cue from the word, but the UI updates later (status bar, installed icon) | split the beat at the event (`trust-click → ext-done` sped up, then `ext-done → …` with the line) |
| `inputRange must be strictly monotonically increasing` | a spot/callout window shorter than its two fades | `fade()` shortens its ramps for short windows |
| The extension's first command in an empty folder does nothing visible | it only activates the extension ("Activate Anyway"); its guide opens and closes any quick pick | wait for the guide, then run the command again |
| A take fails after a 10-minute install and everything is lost | the event log lived only in memory | the take writes take.json (with `failed`) and the mp4 in `finally` |
| `vo-plan` fails: "cue: no "<word>" in VO line" after rewording | the timeline loads with the *old* generated word timings | blank the generated block, run vo-plan, then run it again |
| Remotion stills/render fail with "disk space is low" | its bundles (a copy of `public/`, ~0.7–1 GB each) go to the shared `/tmp` tmpfs | run with `TMPDIR=~/.cache/remotion-tmp` |
| A dark oval in the middle of every frame | the explainer `<Stage>`'s backdrop scrim (radial gradient, `zIndex: 5`) renders above the content; also a spotlight's 4000 px `box-shadow` on a rounded box makes an oval | `<Stage screen>` (backdrop in its own bottom layer); spotlights dim with an SVG cut-out |
