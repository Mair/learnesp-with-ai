---
name: vs-code-recording
description: Make a narrated screen-recorded VS Code video for learnesp32. A scripted take (Playwright drives a clean VS Code on a hidden 4K Xvfb display, recorded with ffmpeg, with an event log of times and on-screen boxes) is cut to synthesized narration in Remotion, with camera zooms, spotlights and callouts tied to spoken words. Use when the user wants to record or show VS Code itself (the ESP-IDF terminal, idf.py, the editor, an AI agent writing code from a prompt, build/flash/monitor), or wants to re-record, re-narrate or re-time such a video.
---

A **VS Code recording** shows the real tool doing the real thing: the learner sees exactly what they'll see on their own screen. Nothing is staged by hand. A script plays the take, the take logs *when* each thing happened and *where* it is on screen, and the video is cut from that log, so a re-recorded take or a re-worded line re-times everything.

**This skill builds on `explainer-video`** (`.pi/skills/explainer-video/`). Use its `SCRIPT.md` for narration (voice, `text`/`say`, pacing, and **"Sound like a teacher, not a list"**: whole grammatical sentences, a named subject, signposts, transitions between lines, ellipses rarely, short gaps inside a beat; read every step aloud before voicing and the transcript after), its `SOUND.md` for levels, and its tools (`scripts/vo-plan.ts`, `scripts/lib/audio.ts`, `scripts/stills.mjs`). Course rules from `AGENTS.md` apply on screen too: pure ESP-IDF, v6.0 or later, **no Arduino visible anywhere** (including palette rows), teach driving not the engine, and use only what earlier videos taught.

**Reference implementation (read before building):**

| File | What it shows |
|---|---|
| `capture/lib/stage.ts` | Xvfb + clean VS Code profile + CDP connection; `HIDE_COMMANDS`; window sizing; options: `extensions: []` (fresh VS Code), `home` (bubblewrap sandbox showing a private home as `/home/learner`, own `TMPDIR`), `hideBins` (e.g. hide `eim` from PATH), `env`, `settings`, `args` |
| `capture/takes/first-project.ts` + `first-project/config.ts` | a take that opens a second window, builds, flashes and monitors a real board (`BOARD`, `TARGET`, `TAKE_SLUG` for trial runs); `serialPorts` shows only that board |
| `capture/lib/xwin.py` | windows on the WM-less display by title: `list` / `fill` / `raise` / `center` / `geom` / `move` |
| `capture/lib/browser.ts` | web pages: the distrobox Playwright Chromium on the take's display, driven over CDP from the host; `box(locator)`, `urlBox()` |
| `capture/lib/webkit.ts` | WebKitGTK/Tauri apps (EIM) through WebKit's remote inspector (`WEBKIT_INSPECTOR_HTTP_SERVER`): `eval`, `waitFor`, `click(text)`, `box(text)` |
| `capture/dev.ts` | dev server: keeps a stage up and runs JS snippets / screenshots over HTTP while you work out a take's selectors |
| `capture/takes/install-esp-idf.ts` + `install-esp-idf/config.ts` | a take across three apps (browser → VS Code → EIM), a real 14-min install, `STOP_AT=<event>` for quick dev runs |
| `src/scenes/install-esp-idf/` | multi-app timeline: `lead`, `maxRate` (×120 install), step pills (`CHAPTERS`), command `cards` |
| `capture/lib/recorder.ts` | ffmpeg x11grab; `rec.mark(id, { box, text })` timed against the first video frame |
| `capture/lib/actions.ts` | `typeHuman`, `runCommand`, `quietStartup`, `waitTerminal`, `terminalRow`, `editorLine`, `textBox`, `screenBox`, `unionBox` |
| `capture/profile/` | `settings.json` (theme, zoom 3.2, no toasts/AI/history) and `bashrc` (short prompt) for every take |
| `capture/takes/spike.ts` | a whole take: palette → ESP-IDF terminal → `idf.py --version` → Quick Open → point at lines |
| `src/scenes/vscode-spike/timeline.ts` | beats (`clip: { from, to, lead, maxRate }`), `takeTime`, `whenTake`, VO, `CUE`, `SOUND` |
| `src/scenes/vscode-spike/VSCodeSpike.tsx` | shots / spots / callouts from cues and boxes |
| `src/components/ScreenCapture.tsx` | the virtual camera, spotlights, callouts, `remap` (holds and speed-ups) |
| `scripts/vscode-spike-audio.ts` | the soundtrack from the same timeline |
| `src/scenes/vscode-spike/FACTS.md` | facts sourced from the take itself + ESP-IDF + the extension |

Gotchas already found (and fixed in the code) are in [`GOTCHAS.md`](GOTCHAS.md). Read it before changing `capture/lib/`.

## Machine setup (check before step 2)

- VS Code at `/usr/share/code/code` (the stage launches the Electron binary, not `/usr/bin/code`). The ESP-IDF extension version in `stage.ts` `EXTENSIONS` must match `~/.vscode/extensions/`.
- `Xvfb`, `ffmpeg`, `python3` with `python-xlib`, `npm install` (`playwright-core`; it needs no browsers).
- ESP-IDF installed with EIM (`~/.espressif/tools/eim_idf.json` lists it). The status bar must show the version you expect.
- Web pages: Playwright and its browsers live only in the distrobox container `ubuntu` (see the `playwright-cli` skill); `browser.ts` launches its newest Chromium (`--disable-infobars`, `WAYLAND_DISPLAY` unset) on the take's display and connects over CDP (no version match needed).
- Display `:99`, CDP ports `9333` (VS Code) / `9335` (browser) and `9444` (EIM inspector) free. Leftovers from a crashed take: `pkill -f '[c]apture/.run'; pkill -f '[X]vfb :99'` (the brackets stop `pkill` from killing your own shell).
- VO tools as in `explainer-video` (`edge-tts`, `uv`). `scripts/stills.mjs` leaves a ~600 MB bundle in `/tmp` (a tmpfs) per run. Delete **only the bundles you created** (check `ls -ld --time-style=+%H:%M /tmp/remotion-webpack-bundle-*`). `remotion render` cleans up after itself, so never "delete the newest one" after a render.

## Steps

### 1. Plan the beats
A beat = **one action in VS Code + one VO line**. Write `src/scenes/<slug>/STORYBOARD.md`: per beat, the action, the take events that start and end it, the VO line, and what gets the camera / a spotlight / a callout. Every action starts on the word that names it ("Press Ctrl+Shift+P" → the palette opens), so plan an event *before* each action, not just after it.
Write `FACTS.md` headed with the ESP-IDF tag, VS Code version and extension version. **The take is a source**: a printed line, a palette title, a status-bar item can be cited by event id.
**Done when** every beat has a start event and an end event, and every claim has a source.

### 2. Write the take
Work the steps out first with the dev server (`node … capture/dev.ts <config.ts>`, then `curl localhost:7777/run --data-binary '<js>'` and `/shot?name=x`): real UIs hold surprises (trust dialogs, "activate anyway" prompts, walkthroughs opening, toasts that come and go). Copy `capture/takes/spike.ts` (one app) or `install-esp-idf.ts` (browser + VS Code + another app) to `capture/takes/<slug>.ts` and set `SLUG`. Rules:
- Before recording: wait for the extension (status bar), `quietStartup` (clears toasts, Do Not Disturb). The recording starts after.
- `rec.mark()` **before** each action (`'palette-open'`, `'cmd-start'`, `'quick-open'`) and **after** each result (`'version'`, `'editor-open'`), with the box the narration will point at.
- Boxes: `textBox()` for an editor line or terminal row (trimmed to the visible text), `screenBox()` for a panel or widget, `unionBox()` for a block of lines (include the widest line).
- Wait on what's on screen (`waitTerminal(re)`, `locator.waitFor()`), never on fixed sleeps for things that take variable time. Use `pause()` only for human pacing.
- Work in the copied workspace (`stage.workspace`). Never edit `capture/demo-project/` from a take.
- Anything the course never shows (Arduino commands, AI chat UI, personal paths) is hidden in the profile or `HIDE_COMMANDS`, not cropped later. Paths on screen come from `home` → `/home/learner`.
- Prefer elements that are always in the DOM (a walkthrough button) over toasts (they can collapse into the notification center).
- Several apps on one WM-less screen: windows raise and re-place themselves. Close an app when you're done with it (the browser after its last page); pin a window that must stay put (`placeEIM` in `install-esp-idf.ts`).
- Never click a link that opens an external browser from VS Code (`xdg-open` could reach the real desktop); load the URL in the take's own browser.
- Long takes: `STOP_AT=<event>` stops (and still writes take.json/mp4) at that mark, so selectors can be checked in minutes before the long real run.
Add `"<slug>:take"` to `package.json` and run it.
**Done when** the take runs end to end and prints every mark.

### 3. Check the take
Draw every box on the frame at its event time and look at each one:
```
node -e 'const t=require("./src/scenes/<slug>/take.json"),{execFileSync:x}=require("child_process");
for(const e of t.events.filter(e=>e.box)){const[a,b,c,d]=e.box;x("ffmpeg",["-y","-loglevel","error","-ss",String(e.t+0.05),
"-i","public/<slug>/take.mp4","-frames:v","1","-vf",`drawbox=x=${a}:y=${b}:w=${c}:h=${d}:color=red:t=6,scale=1600:-1`,`/tmp/take-${e.id}.png`])}'
```
Also check the screen for anything off-limits (palette rows, toasts, "recently used").
**Done when** every box frames exactly its target and nothing off-limits is visible.

### 4. Timeline and narration
Copy `src/scenes/vscode-spike/timeline.ts`. Fill in `BEATS` (`clip.from`/`to` = take events, `'BEGIN'`/`'END'` for the ends), `VO` (one `L()` per line, house `say` forms), `TAIL`, then run `node --disable-warning=ExperimentalWarning scripts/vo-plan.ts <slug>`.
- Beat length = max(narration + tail, `lead` + stretch ÷ `maxRate`). The video plays 1×, then holds its last frame.
- `lead: w(line, word)` holds the first frame until that word: use it whenever an action is named in the VO.
- `maxRate` (e.g. 3) only for dead time: shell start-up, a build, an agent thinking. Never speed up typing the learner should read.
- `CUE`: camera / spot / callout times from `w(line, word)`, or `whenTake(event)` when it should follow the video ("the editor appears").
- `SOUND`: ticks/thumps from the same cues (see `SOUND.md`).
**Done when** vo-plan shows every line and the timeline loads (a bad cue word throws).

### 5. Composition and soundtrack
`src/scenes/<slug>/<Name>.tsx` (copy `VSCodeSpike.tsx`): `shots` (camera), `spots`, `callouts`, `remap={takeTime}`, `<Audio src="<slug>/mix.wav">`. Register it in `src/Root.tsx` (1920×1080 @ 30) inside **`<Stage screen>`**. The explainer `<Stage>` draws the backdrop's scrim (a dark radial gradient) *on top of* the content; over a recording that's a dark oval in the middle of the frame. `screen` keeps the backdrop behind. Copy `scripts/vscode-spike-audio.ts` and add `"<slug>:audio"` and `"<slug>"` (audio + render) to `package.json`.
Camera rules:
- At 4K, cap zoom at 2.4–2.6 (that's about 1:1 on a 1080p frame). Higher looks soft.
- Move about 0.4 s *before* the action, so the camera lands as it happens. A move takes 0.9 s, and the zoom back out at the end takes 1.2–1.4 s.
- Frame what's read: code lines, not the whole editor; the typed row, not the whole panel.
- Callouts: short (≤ 6 words), `side: 'right'` when there's room, never covering what the VO talks about.
- One spotlight at a time. It ends when the next beat starts. The dim around it is even (an SVG cut-out in `ScreenCapture`); nothing may darken the middle of the frame: no vignette, no scrim, no radial overlay over the recording.
**Done when** `npx tsc --noEmit` passes and `npm run <slug>:audio` prints every line `ok`.

Narration for a click-along video: one action per line, but still whole sentences that follow on from each other ("Then click Install.", "This time, it asks where to download the installer from."). Never a bare label as a line ("Installation complete.", "ESP-IDF v6.1. It's installed.", "Next up: Basic GPIO."); say it as a sentence ("When you see Installation Complete, you can close the installer.").

### 6. Look at it
`npm run stills -- <Name> <seconds…>` at every cue, especially just after each `lead` and each `whenTake`. Check: the camera is on the action, the box hugs its text, callouts don't cover what's being said, nothing off-limits, no frozen frame that looks broken.
**Done when** every beat has been inspected at its busiest moment.

### 7. Render and verify
`npm run <slug>` (writes `out/<section>/<slug>.mp4`, or `out/spikes/` for experiments). Transcribe it (`uv run --with faster-whisper`, as in `explainer-video` step 8) and compare it with `VO`. Grab frames at the cues and tile them into a contact sheet.
**Done when** the transcript matches the script and the frames match the stills.

### 8. Report
Beats with times, what's on screen in each, facts and their sources, what's still open, and files changed. Commit when the user approves (`take.mp4` is gitignored; `take.json` is committed and must match the mp4 the render used).

## Re-recording

`take.json` and `take.mp4` are a pair; a new take replaces both. Timings and boxes then flow through on their own (re-run `<slug>:audio`; vo-plan only if the VO changed). **If the take's content can differ between runs** (an AI agent's output, a build log), re-check every VO line and fact against the new take, and don't re-record an approved take without asking.

## Takes with an AI agent or hardware (next)

- **Agent** (Pi in the ESP-IDF terminal): mark `prompt-typed` and `agent-done` (wait for the prompt to return or for a file to change). The agent run is a `maxRate` beat. Its output is nondeterministic, so keep the session and the generated files with the take, and narrate the take you actually got.
- **Flash/monitor**: wait for `idf.py` output lines (`Hard resetting`, the app's first log line) and mark them. The board's LED is shown beside the monitor: a webcam clip, or the animated board from the explainer components.
