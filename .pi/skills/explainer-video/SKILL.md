---
name: explainer-video
description: Make a narrated, animated ESP32 explainer video (Remotion + synthesized VO and sound) in the learnesp32 house style. Use when the user wants a new explainer video or lesson animation on a topic (e.g. "a video on A-to-D conversion"), or wants to add, re-time or deepen a scene in an existing one. Also for a course section's intro video (`<section>-intro`).
---

An **explainer** teaches someone **how to use** one peripheral: every number the learner types is pulled apart until they can *see* what it does to the pin, every claim is checked against the real source, and picture, narration and sound are all driven by one timeline.

**Section intros** (`<section>-intro`) follow the same steps but use the intro arc in `SCRIPT.md` ("Section intro") instead of the explainer arc. Build them from `src/scenes/intro/kit.tsx` (Bench, MapCards, PartsList, Checklist, Terminal, GoCard) and `intro/vignettes.tsx`; copy `basic-gpio-intro/` (timeline with a `SOUND` list + `Scenes.tsx`). The soundtrack is shared: `scripts/intro-audio.ts <slug>`.

**Teach driving, not the engine** (see `AGENTS.md`). You don't need to know how an engine works to drive a car. No under-the-hood scenes: no driver source, HAL/LL calls, register names or bit fields on screen or in the VO. Show what to type, what each argument means in plain words, what the hardware does, and the mistakes people make with their fix. Research goes all the way down to keep every claim true, but it stays in `FACTS.md`. Keep it simple.

**Project:** `~/projects/learnesp32.com/Learn-ESP32-v-2` (a git repo — start from a clean tree and commit at each approved milestone). The old spike at `~/projects/learnesp32.com/spike-course/esp32-remotion` is frozen; never edit it.

**Machine setup (check before step 4; a fresh clone has none of this):**
- `npm install` (esbuild's postinstall warning from `allow-scripts` is harmless; `node -e "require('esbuild')"` to confirm).
- `edge-tts` and `uv` (for faster-whisper) via `pip3 install --user edge-tts uv`; on macOS they land in `~/Library/Python/3.13/bin`, which is **not on PATH** — `export PATH="$HOME/Library/Python/3.13/bin:$PATH"` in every shell that runs `npm run vo` / `<slug>:audio`.
- `.cache/vo` is gitignored and machine-local: the first run regenerates every clip (edge-tts is deterministic, so word offsets come back identical) and downloads the whisper model — run it in the background (`nohup npm run vo -- <slug> > /tmp/vo.log 2>&1 &`) and poll; a killed run leaves a **0-byte .mp3** that must be deleted before retrying. The first render also downloads Chrome Headless Shell.
- Renders (~4 min for 5 min of video) likewise go in the background with a log.
- Stills are written to `/tmp/stills/…`, which the read tool only resolves as `/private/tmp/stills/…` on macOS.
- **QEMU for the lab (step 1b):** ESP-IDF's environment comes from `source ~/.espressif/tools/activate_idf_v6.0.2.sh` (EIM install; `idf.py` is `python $IDF_PATH/tools/idf.py`). Espressif's QEMU: `python $IDF_PATH/tools/idf_tools.py install qemu-xtensa` (lands in `~/.espressif/tools/tools/qemu-xtensa/<ver>/qemu/bin/qemu-system-xtensa`).
**Reference implementation — read before building (pure ESP-IDF LEDC):**

| File | What it shows |
|---|---|
| `src/scenes/pwm/timeline.ts` | single source of truth: scenes, cues, VO, shared maths |
| `src/scenes/pwm/Context.tsx` | the whole program (`CodeAndViews`): code on the left, one view per call on the right |
| `src/scenes/pwm/Timer.tsx`, `Channel.tsx`, `Write.tsx`, `Fade.tsx` | the **Explainer** shot: one call, one card per argument, one view per idea |
| `src/components/Explainer.tsx` | the shell + `mono()`, `ease`, `GREEN`, `RED`, `VIEW_W/H` |
| `src/components/CodeToHardware.tsx`, `CodeLine.tsx`, `Gadgets.tsx`, `Panel.tsx`, `Type.tsx` | other shot types and parts |
| `scripts/pwm-audio.ts` + `scripts/lib/audio.ts` | the soundtrack, built from the same timeline |

Standards live in three files — load each at the step that points to it:
- [`SCRIPT.md`](SCRIPT.md) — the arc, the **depth standard**, narration and TTS rules.
- [`STYLE.md`](STYLE.md) — palette with its colour meanings, typography, shot types, layout rules.
- [`SOUND.md`](SOUND.md) — layers, levels, the SFX vocabulary, when sound may carry pitch.

## Steps

### 1. Research
**Pure ESP-IDF only — no Arduino** (see the project's `AGENTS.md`): code lives in `void app_main(void)`, waits are `vTaskDelay(pdMS_TO_TICKS(ms))`, errors are `esp_err_t` / `ESP_ERROR_CHECK`. List every ESP-IDF call the learner will type for this topic, then read each one's real implementation down to the register writes: **ESP-IDF v6.0 or later only** (currently tag `v6.0.2`, local checkout `~/.espressif/v6.0.2/esp-idf`; see `AGENTS.md` — never v5.x): `components/esp_driver_*/src/*.c`, `components/esp_hal_<periph>/esp32/include/hal/*_ll.h` (v6 moved the HAL here), FreeRTOS in `components/freertos/`, Kconfig defaults, the official examples (`examples/`), and the ESP32 datasheet / TRM for limits. Never cite arduino-esp32. Fetch raw files; work every number through the real code path (integer division, clamps, max values, defaults).
Write `src/scenes/<slug>/FACTS.md`, headed by the exact ESP-IDF tag you read: each fact, the file/line or doc it came from, and any surprise ("rounds 12.17 down → 2.76 s", "255 is bumped to 256 = fully on").
**Done when** every number and claim you intend to put on screen or in the VO has a source line in `FACTS.md`.

### 1b. Lab: run the real program (QEMU)
Every log line, number the chip prints, error message and timing the video shows comes from **running the video's program**, not from a model or a made-up example. With no board attached, run it in Espressif's QEMU (machine `esp32`, same machine code as the chip). Reference: `src/scenes/freertos-stacks-watchdog/lab/`.
- `src/scenes/<slug>/lab/`: `CMakeLists.txt`, `main/CMakeLists.txt`, `main/main.c` = **the program exactly as shown on screen**. Variants for the traps and for things QEMU can't do (a button press, a jam) go behind `#if LAB_VARIANT == n`, listed at the top of `main.c`, selected with `idf.py -DLAB_VARIANT=n` (`main/CMakeLists.txt` passes it as a compile definition). Config variants: an `sdkconfig.<name>` fragment passed as `-DSDKCONFIG_DEFAULTS=… -DSDKCONFIG=/tmp/…` (don't overwrite the lab's own `sdkconfig`, which is gitignored).
- Build out of tree and run headless:
  `idf.py -B /tmp/<slug>lab/vN -DLAB_VARIANT=N build` →
  `(cd /tmp/<slug>lab/vN && python -m esptool --chip esp32 merge-bin --fill-flash-size 4MB -o flash.bin @flash_args)` →
  `timeout 15 qemu-system-xtensa -nographic -machine esp32 -drive file=flash.bin,if=mtd,format=raw -serial mon:stdio > vN.log`.
- Keep the logs: `lab/logs/vN.log` (strip `\r` and blank lines), committed with `FACTS.md`. `FACTS.md` names the QEMU version, the build config (defaults: `-Og`, Picolibc) and quotes each log excerpt it uses.
- QEMU can't run a two-core busy load faithfully: unpinned tasks that busy-wait on `esp_timer_get_time` stay on core 0 (even pinned to core 1 under that load), and the watchdog fires where a board wouldn't (freertos-scheduler `FACTS.md`). Pinned tasks that block regularly do run on core 1 (freertos-two-cores, freertos-mutexes). When QEMU can't show it, keep the panel but label it `illustration · …`, and say so in `FACTS.md`.
- QEMU limits, say them on screen: no buttons (GPIO inputs read 0, the pull-up isn't modelled), boot is slower than a board (timestamps differ; gaps between lines are real), numbers like stack use depend on compiler/config ("a board prints numbers close to these"). Label log panels `recorded in QEMU (ESP32 emulator)`, plus `· <thing> is simulated` when a variant fakes an input.
- Logs shown in real time (`right="real time"`) keep QEMU's clock between lines; logs paced to the VO say nothing about time. Real serial output is near-instant: don't type it out slowly in a real-time panel.
**Done when** every log line, printed number and error message in the storyboard is in a `lab/logs/*.log` and quoted in `FACTS.md`.

### 2. Script + storyboard
Load `SCRIPT.md`. Write the arc and, per scene, a table of beats: VO line (`text`, plus `say` where TTS needs it) and the visual for that line. Apply the depth standard to every argument of every call. Commit `FACTS.md` + `STORYBOARD.md` and **go straight on to building** — don't stop to ask whether to start (the user's standing instruction). The user reviews the render instead.
**Done when** the storyboard is committed.

### 3. Scaffold
- `src/scenes/<slug>/timeline.ts` — copy pwm's skeleton: `FPS`, `SCENES` (id + dur), `sceneStart`, `sceneDur`, `SECONDS`, `<NAME>_FRAMES`, one cue object per scene, `VoLine`/`VO`/`VOICE` (`en-US-AndrewMultilingualNeural`). Import-free (type-only imports allowed): Node runs it directly.
- `src/scenes/<Name>.tsx` — sequences every scene over `<Audio src={staticFile('<slug>/mix.wav')}/>`, like `PWM.tsx`.
- `src/Root.tsx` — a `<Composition>` wrapped in `<Stage floor={false}>`, 1920×1080 @ 30 fps.
- `scripts/<slug>-audio.ts` — built on `scripts/lib/audio.ts`, structured like `pwm-audio.ts`; outputs `public/<slug>/mix.wav`, stems in `out/<section>/<slug>-stems/`.
- `package.json` — `"<slug>:audio"` and `"<slug>": "npm run <slug>:audio && remotion render <Name> out/<section>/<slug>.mp4"`.
**Done when** `npx tsc --noEmit` passes and `npm run list` shows the composition.

### 4. Time it to the voice
Put every VO line in `VO` with a provisional `at`, then `npm run vo -- <slug> [scene]`. It generates each clip and prints `word@offset`. Set each line's `at` to the previous line's end + ~0.6 s, every cue to `line.at + word offset` with the arithmetic in a comment (`// "the period" 8.3+14.4`), and each scene's `dur` to its last line's end + ~1.5 s. Re-run after any wording change.
**Faster: `node --disable-warning=ExperimentalWarning scripts/vo-plan.ts <slug>`** voices every line, gets Whisper word timings, lays the lines out (0.5 s lead, 0.6 s gap or a line's `pause`, `fixed` lines keep their `at`, scene `dur` = last end + `TAIL[scene]`) and rewrites the generated `VO_AT` / `SCENE_DUR` / `VO_WORDS` block at the top of `timeline.ts`. Cues then use `at(id)`, `w(id, word, n, plus)`, `end(id)` (see `pwm/timeline.ts`), so a wording change re-times everything.
**Every time lives in `timeline.ts`** — never a literal second inside a view (`after(t, 13.3)`); when a scene is re-timed those are the cues that silently stay behind.
**Done when** the sheet shows every line `FITS`, and every visual change in the storyboard has a cue tied to a spoken word.

### 5. Build the scenes
Load `STYLE.md`. Build each scene from the house shot types; drive every animation from the timeline's cues (pure functions of `t`); put maths the picture and sound both need (a counter position, a duty over time) in `timeline.ts` as an exported function.
**Done when** `npx tsc --noEmit` passes.

### 6. Look at it
`npm run stills -- <Name> <seconds…>` (absolute seconds = `sceneStart(scene) + t`) and read every PNG. Check against the layout rules in `STYLE.md`: collisions, black SVG text, labels crossing moving lines, playheads off their axis, empty or crowded views. Fix and re-render.
**Done when** every view has been inspected at its busiest moment with nothing overlapping or unreadable.

### 7. Sound
Load `SOUND.md`. Write the scene's layers in the audio script; `npm run <slug>:audio`. Measure new layers with `ffmpeg -ss A -to B -i out/<section>/<slug>-stems/<layer>.wav -af volumedetect -f null -`.
Check each layer against the VO at its loudest moments, not just its reference window: `level(x, target, a, b)` scales the **whole** layer to the window `a…b`, so a window that falls on near-silence (a signal faded out, clicks that have fused) blows everything else up by 20+ dB. Re-check the window whenever the beats it points at change.
**Done when** the build prints every VO line `ok`, and each new layer is at its target level (silent where it should be silent).

### 8. Render and verify
`npm run <slug>` (writes `out/<section>/<slug>.mp4`; `<section>` = `1-basic-gpio` / `2-freertos` / `3-advanced-gpio`). Transcribe the render (faster-whisper via `uv run --with faster-whisper`) and compare it with the script; listen-check any word Whisper hears differently (rephrase `say` if TTS is ambiguous). Grab a few frames with `ffmpeg -ss T -i out/<slug>.mp4 -frames:v 1`.
**Done when** the transcript matches the script and the frames match the stills.

### 9. Report
Tell the user: the scene list with times, what each view shows, every fact you verified (and where), anything still unverified, and files changed.

## Changing an existing video
Same loop on the affected scenes only: edit `VO`/cues → step 4 (re-time; shifting a scene's later cues means shifting every cue after the change by the same amount) → 5 → 6 → 7 → 8. Before refactoring the audio script, `md5sum` the stems; an unchanged timeline must rebuild byte-identical (the build is deterministic).

## Review pass
The user watches the render and reports critiques by timestamp. Map each timestamp to `sceneStart + t` → the scene and the VO line, then apply the pacing and context rules in `SCRIPT.md` ("Pacing", "Context before detail"). Lessons from the freertos-tasks review, now in the standards:
- a list of steps said in one breath sounds rushed → one short VO line per step;
- "here's the other way to write it" → mutate the code on screen, don't show a snippet beside it;
- a call shown out of nowhere → show it inside `app_main` first, then pull it out;
- a number that matters (×4) → its own short line and a big glyph;
- a trap everyone hits (stack overflow) → three lines, not one;
- every identifier the VO names ("its own b") must be defined on screen;
- no under-the-hood descents at all: they were cut from every video ("teach driving, not the engine").

Lessons from the freertos-queues review (now in `SCRIPT.md`, "The problem" and "Pauses and emphasis"):
- open on "Let's say you want to …", then lay the problem out as two sides (sender left, receiver right);
- try the obvious approach on that picture first (run for real), with its ✓ and ✗; then the answer on the same picture and inputs, with its own ✓ and ✗;
- no hedges ("a shared flag sort of works" was unclear): say exactly what works and what breaks;
- show the code of both sides together before pulling out each call; every view of a call that moves something shows both ends at once;
- shape every pause (`pause` per line; `...` before the stressed words in `say`) and read the `‖` pauses on the vo-plan sheet.

Lessons from the freertos-mutexes review (now in `SCRIPT.md`, "Sound like a teacher, not a list"):
- whole, grammatical sentences only; no headline fragments; name the subject ("the bug hides", not "it hides");
- signpost ("Behind the scenes, it happens in three steps. First, … Then …") and join lines with transitions;
- ellipses rarely (too many made the voice stop and start); short gaps inside a beat;
- read every scene aloud before voicing, and the transcript after, checking grammar and flow.
After the pass, update `STORYBOARD.md` (an "v2 (review pass)" note + the per-line tables) and `FACTS.md` (facts for cut scenes stay, marked as cut).
