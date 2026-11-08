# capture/: scripted VS Code screen takes

Records real VS Code sessions (ESP-IDF terminal, editor, later the agent and
flashing) without touching your desktop. A Remotion comp then reads the
take's event log and drives the camera, spotlights and callouts.

```
node --disable-warning=ExperimentalWarning capture/takes/spike.ts
npx remotion render VSCodeSpike out/spikes/vscode-spike.mp4
```

## How a take works

1. **Stage** (`lib/stage.ts`): starts `Xvfb :99` at 3840×2160 with no window
   manager, and a clean VS Code profile in `capture/.run/` built from
   `profile/settings.json` (theme, zoom 3.2, no minimap/toasts/AI, ESP-IDF
   v6.0.2 from `~/.espressif/tools/eim_idf.json`). The ESP-IDF extension is
   copied in with `HIDE_COMMANDS` removed from the palette (no Arduino on
   screen). The demo project is copied too, so a take never edits
   `demo-project/`. The ESP-IDF terminal uses `profile/bashrc` (short prompt,
   no history, no `(venv)`). `lib/xfill.py` sizes the window to the screen.
2. **Driver**: Playwright (`playwright-core`, no browsers) connects over CDP
   (`--remote-debugging-port`); `lib/actions.ts` types at a human pace,
   runs palette commands, waits for terminal text (the DOM renderer is on, so
   the terminal is readable) and measures UI boxes.
3. **Recorder** (`lib/recorder.ts`): `ffmpeg -f x11grab`. Event times are
   measured from the first video frame (ffmpeg's `start:`), so
   `rec.mark('show-line', { box })` lines up with the video to the frame.
4. **Outputs**: `public/<slug>/take.mp4` (4K, gitignored) and
   `src/scenes/<slug>/take.json` `{ fps, size, duration, events[] }`.
   Boxes are in source pixels; `textBox()` trims to the visible text of a
   full-width editor line or terminal row.

## Remotion side

`src/components/ScreenCapture.tsx`: `shots` (camera keyframes → box, eased
log-zoom, clamped to the screen, capped zoom), `spots` (dim everything but a
box) and `callouts` (constant-size labels pinned to a box, `above`, `below` or
`right`). The scene file only maps event ids to those; re-record, and every
move follows.

## Workflow and gotchas

The full workflow (plan → take → check → timeline → render) is the
`vs-code-recording` skill: `.pi/skills/vs-code-recording/SKILL.md`. Known
pitfalls and their fixes: `.pi/skills/vs-code-recording/GOTCHAS.md`.
