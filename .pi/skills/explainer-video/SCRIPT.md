# Script: the arc, the depth standard, the narration

## The arc

Every explainer is **pure ESP-IDF** — `app_main`, driver APIs, `vTaskDelay(pdMS_TO_TICKS(ms))`, no Arduino (the PWM video's Arduino calls are legacy; its *structure* still applies).

Every explainer follows this arc (the PWM video, 310 s, minus its cut under-the-hood scene):

| # | Scene | Job | PWM video |
|---|---|---|---|
| 1 | **Problem** | the thing you want, and why the obvious approach can't do it | dim a light — but a pin is only 3.3 V or 0 V |
| 2 | **Answer** | the idea in one image, then its name | switch it fast → P·W·M lands letter by letter |
| 3 | **One Explainer per call** | each call the learner types, in the order they type it; every argument pulled apart | `ledc_timer_config`, `ledc_set_duty`, … |
| 4 | **Demo** | real code runs, the hardware responds on the same frame (`CodeToHardware`), slowed if needed | knob 1: duty → brightness, slowed 500× |
| 5 | **Deeper calls** | any call that hides machinery gets its own Explainer after the demo that used it | `ledcFade` |
| 6 | **Second knob** | the other dimension, contrasted with the first | frequency → pitch, on a speaker |
| 7 | **Payoff** | one spoken line, then a 3–4 item recap | "That's PWM." |

**There is no under-the-hood scene.** The course teaches how to *use* the ESP32 — you don't need to know how an engine works to drive a car. Never descend into driver source, HAL/LL functions, registers or bit fields. Research them (they keep `FACTS.md` honest), then say only what the learner will notice and what to do about it.

Mapping a new topic means finding its problem, its one-image answer, its calls, and its two knobs. For **A-to-D conversion** a plausible arc (verify every call in step 1) is: problem — a sensor gives a smooth voltage but the CPU only knows numbers → answer — sample it, chop it into steps → Explainers for the resolution / attenuation / read calls → demo: a potentiometer turning while the number tracks → second knob: attenuation (input range) vs resolution (step size) → payoff.

## Section intro

Every course section (Basic GPIO, FreeRTOS, Advanced GPIO, …) opens with an intro video, slug `<section>-intro`. It is **not** an explainer: no call is pulled apart, no argument cards. Its job is to make the learner want the section and know where it goes. About 1½–2½ minutes.

| # | Beat | Job |
|---|---|---|
| 1 | **The want** | a concrete thing the learner can't do yet, shown on hardware ("blink an LED, read a button"; "do two things at once"; "dim a light, catch a press the instant it happens, read a voltage") |
| 2 | **What it is** | the section's idea in one plain sentence and one picture (a pin that can be an output or an input; the scheduler sharing the CPU) |
| 3 | **The map** | the section's videos in order, one card each: name, the one-line promise, the result on hardware. Highlight the first one |
| 4 | **What you need** | the parts on the bench (board, LED, resistor, button…) and which earlier sections it builds on |
| 5 | **Go** | "First up: …" → the first video of the section |

A section with many videos (FreeRTOS has 14) gets **compact cards** (name + one-line promise) in rows lit by the VO; only the first card carries a hardware result. Videos that don't exist yet get no slug on their card.

Same house style, voice, palette and sound as the explainers; captions on every beat. Function names may appear on the map cards, but nothing is explained there. Every claim still goes in `FACTS.md`.

## The depth standard

Apply every point to **every argument of every call** and every concept a scene introduces. If a point doesn't apply, decide that consciously.

1. **What it is, in one plain sentence** — and, where beginners hold a wrong model, **what it is not** ("the duty isn't a voltage — it's how long the pin is on").
2. **Units and a worked chain with this video's actual numbers**, shown on screen as it's said: 1000 Hz → 1 period = 1 ms; 2⁸ = 256 steps → 1 ms ÷ 256 ≈ 3.9 µs; 2.8 s × 1000 Hz = 2800 periods ÷ 230 steps → 12.
3. **The physical picture the number controls** — the waveform, counter, staircase or bar that changes when the number changes, animated with the number.
4. **Range, and where the range comes from** (8 bits → 0…255; 10 bits → 0…1023: "the same half becomes 512").
5. **Edge values** — 0, the max, out-of-range — and what really happens (255 is bumped to 256 = fully on).
6. **Limits and trade-offs** with the arithmetic (frequency × 2^bits must fit in 80 MHz → 1 kHz × 17 bits ✗).
7. **What you'll actually get** — rounding, clamping, defaults, the return value, as the learner sees them (the fade really takes 2.76 s; the config returns `ESP_FAIL` if it can't fit). Say *what* happens, not the code path that makes it happen.
8. **Who does the work** — your code or the peripheral; does the call block; what the CPU is free to do.
9. **A callback** to an earlier image when a new idea is the same mechanism ("it's the line across the counter from before").

## Context before detail

A call is never shown out of nowhere. Open on the code the learner has in front of them (`app_main`, both calls, each argument that differs labelled), say what the lines do together, pick one out (the others fade to ~15 %), and only then lift it into the Explainer shot with its cards (`Explainer` prop `codeIn`). Same for an alternative: "to end a task on purpose" is shown by **editing the code the learner is looking at** (`while (1)` → `for (…)`, a line inserted, each change marked on its spoken word), not by a snippet beside it.

## Narration

- Second person, conversational, short sentences, one idea per sentence. Grammatical as written.
- One VO line per view or beat, 4–16 s. ~2.6 words/s with the house voice.
- Every number spoken appears on screen on that word; every on-screen change has a spoken reason.
- **Every identifier the VO names is defined on screen** at that moment ("its own b" → `const blink_t *b = arg;` visible). If you can't point at it, don't say it.
- Never claim more than `FACTS.md` supports; say "about" when rounding.

### Pacing

- **Steps, one per line.** "LED on, wait, LED off, wait" in one sentence sounds rushed. Make each step its own VO line (`f2a` … `f2d`: "LED on." / "Wait." / …) ~0.85 s apart, each with its own cue. Short clips are fine; the gap is the point.
- **A number that matters gets its own line** and a big glyph: "… and a word is four bytes." / "Four times as much memory." with a 130 px `×4` popping in — not a clause at the end of a longer sentence.
- **A trap everyone hits gets three lines, not one**: what goes wrong (the picture fills up and runs past the end) → what the system does (the check, the log line, the reboot) → "you will meet this one" + the fix, shown in green. ~25 s. Overflow, dangling pointers, pdPASS ≠ ESP_OK are this kind.
- **Say the rule, not just the numbers.** A priority ladder with 0, 1, 5, 24 on it doesn't say "higher runs first"; a line does ("when two tasks are ready, the scheduler runs the one with the higher priority first"), with the two contenders on screen.

### `text` vs `say`
`text` is the script as written (code names in code form: `gpio_set_level`, `ledc_update_duty`). `say` is what the TTS reads — set it whenever they differ:

| Write in `say` | For |
|---|---|
| `GPIO set level`, `LED-C set duty` | `gpio_set_level`, `ledc_set_duty` (spelled letters "L E D C" stall) |
| `V task delay`, `P D M S to ticks` | `vTaskDelay`, `pdMS_TO_TICKS` — check the transcript |
| `ESP-IDF` | the framework |
| `P W M` (spaced) | letters that must land one by one |
| `two thirty`, `a thousand hertz`, `two to the eighth`, `two hundred and fifty-six` | numbers — always words |

Check the transcript (step 8) for words the TTS blurs ("the duty slides" was heard as "the duties slide"; "Say you only want…" as "So you only want…" → "Suppose you only want…") and rephrase. Whisper writing `App May` / `X-TASTE create` for `app main` / `X task create` is its hearing, not the voice's — the house `say` forms are fine. More blurs found in the intros: "Make a pin an output" → "Take a pin and output" (say "Make one an output"); "you read a button" → "you write a button" (present-tense *read* is ambiguous — say "your code reads"); "every wait" / "its own waits" → "every way" / "its own weights" (say "delay", which is also the word in the code); "does a pin" → "does a pen". Cue words must match what Whisper heard in the clip (`task` for "tasks" → `w(id, 'task')`), or `w()` throws when the timeline loads.

## Captions

One caption per idea, readable with the sound off: the claim compressed, with arrows and symbols — `1000 Hz → each cycle (the period) lasts 1 ms`, `0 → never on · 255, the top value → always on`. They live in the scene's cue object as `captions: [{ at, text }]`.
