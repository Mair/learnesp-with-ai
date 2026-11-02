---
name: explainer-video
description: Make a narrated, animated ESP32 explainer video (Remotion + synthesized VO and sound) in the learnesp32 house style. Use when the user wants a new explainer video or lesson animation on a topic (e.g. "a video on A-to-D conversion"), or wants to add, re-time or deepen a scene in an existing one.
---

An **explainer** teaches one peripheral the way the PWM video does: every number the learner types is pulled apart until they can *see* what it does to the pin, every claim is checked against the real source, and picture, narration and sound are all driven by one timeline.

**Project:** `/home/mairs/projects/learnesp32.com/Learn-ESP32-v-2` (a git repo — start from a clean tree and commit at each approved milestone).
**Reference implementation — read before building, copy its patterns:**

| File | What it shows |
|---|---|
| `src/scenes/pwm/timeline.ts` | single source of truth: scenes, cues, VO, shared maths |
| `src/scenes/pwm/Setup.tsx`, `Write.tsx`, `Fade.tsx` | the **Explainer** shot: one call, one card per argument, one view per idea |
| `src/components/Explainer.tsx` | the shell + `mono()`, `ease`, `GREEN`, `RED`, `VIEW_W/H` |
| `src/components/CodeToHardware.tsx`, `CodeLine.tsx`, `Gadgets.tsx`, `Panel.tsx`, `Type.tsx` | other shot types and parts |
| `src/scenes/pwm/UnderTheHood.tsx` | descending real source, layer by layer |
| `scripts/pwm-audio.ts` + `scripts/lib/audio.ts` | the soundtrack, built from the same timeline |

Standards live in three files — load each at the step that points to it:
- [`SCRIPT.md`](SCRIPT.md) — the arc, the **depth standard**, narration and TTS rules.
- [`STYLE.md`](STYLE.md) — palette with its colour meanings, typography, shot types, layout rules.
- [`SOUND.md`](SOUND.md) — layers, levels, the SFX vocabulary, when sound may carry pitch.

## Steps

### 1. Research
List every Arduino-ESP32 call the learner will type for this topic, then read each one's real implementation down to the register writes: `arduino-esp32` (`cores/esp32/esp32-hal-*.c`, master), ESP-IDF (`components/esp_driver_*/src/*.c`, `components/hal/esp32/include/hal/*_ll.h`, `release/v5.5`), and the ESP32 TRM for limits. Fetch raw files; work every number through the real code path (integer division, clamps, max values, defaults).
Write `src/scenes/<slug>/FACTS.md`: each fact, the file/line or doc it came from, and any surprise ("rounds 12.17 down → 2.76 s", "255 is bumped to 256 = fully on").
**Done when** every number and claim you intend to put on screen or in the VO has a source line in `FACTS.md`.

### 2. Script + storyboard → approval
Load `SCRIPT.md`. Write the arc and, per scene, a table of beats: VO line (`text`, plus `say` where TTS needs it) and the visual for that line. Apply the depth standard to every argument of every call. Show the user the storyboard and wait for a go-ahead before building.
**Done when** the user has approved the storyboard.

### 3. Scaffold
- `src/scenes/<slug>/timeline.ts` — copy pwm's skeleton: `FPS`, `SCENES` (id + dur), `sceneStart`, `sceneDur`, `SECONDS`, `<NAME>_FRAMES`, one cue object per scene, `VoLine`/`VO`/`VOICE` (`en-US-AndrewMultilingualNeural`). Import-free (type-only imports allowed): Node runs it directly.
- `src/scenes/<Name>.tsx` — sequences every scene over `<Audio src={staticFile('<slug>/mix.wav')}/>`, like `PWM.tsx`.
- `src/Root.tsx` — a `<Composition>` wrapped in `<Stage floor={false}>`, 1920×1080 @ 30 fps.
- `scripts/<slug>-audio.ts` — built on `scripts/lib/audio.ts`, structured like `pwm-audio.ts`; outputs `public/<slug>/mix.wav`, stems in `out/<slug>-stems/`.
- `package.json` — `"<slug>:audio"` and `"<slug>": "npm run <slug>:audio && remotion render <Name> out/<slug>.mp4"`.
**Done when** `npx tsc --noEmit` passes and `npm run list` shows the composition.

### 4. Time it to the voice
Put every VO line in `VO` with a provisional `at`, then `npm run vo -- <slug> [scene]`. It generates each clip and prints `word@offset`. Set each line's `at` to the previous line's end + ~0.6 s, every cue to `line.at + word offset` with the arithmetic in a comment (`// "the period" 8.3+14.4`), and each scene's `dur` to its last line's end + ~1.5 s. Re-run after any wording change.
**Done when** the sheet shows every line `FITS`, and every visual change in the storyboard has a cue tied to a spoken word.

### 5. Build the scenes
Load `STYLE.md`. Build each scene from the house shot types; drive every animation from the timeline's cues (pure functions of `t`); put maths the picture and sound both need (a counter position, a duty over time) in `timeline.ts` as an exported function.
**Done when** `npx tsc --noEmit` passes.

### 6. Look at it
`npm run stills -- <Name> <seconds…>` (absolute seconds = `sceneStart(scene) + t`) and read every PNG. Check against the layout rules in `STYLE.md`: collisions, black SVG text, labels crossing moving lines, playheads off their axis, empty or crowded views. Fix and re-render.
**Done when** every view has been inspected at its busiest moment with nothing overlapping or unreadable.

### 7. Sound
Load `SOUND.md`. Write the scene's layers in the audio script; `npm run <slug>:audio`. Measure new layers with `ffmpeg -ss A -to B -i out/<slug>-stems/<layer>.wav -af volumedetect -f null -`.
**Done when** the build prints every VO line `ok`, and each new layer is at its target level (silent where it should be silent).

### 8. Render and verify
`npm run <slug>`. Transcribe the render (faster-whisper via `uv run --with faster-whisper`) and compare it with the script; listen-check any word Whisper hears differently (rephrase `say` if TTS is ambiguous). Grab a few frames with `ffmpeg -ss T -i out/<slug>.mp4 -frames:v 1`.
**Done when** the transcript matches the script and the frames match the stills.

### 9. Report
Tell the user: the scene list with times, what each view shows, every fact you verified (and where), anything still unverified, and files changed.

## Changing an existing video
Same loop on the affected scenes only: edit `VO`/cues → step 4 (re-time; shifting a scene's later cues means shifting every cue after the change by the same amount) → 5 → 6 → 7 → 8. Before refactoring the audio script, `md5sum` the stems; an unchanged timeline must rebuild byte-identical (the build is deterministic).
