# Script: the arc, the depth standard, the narration

## The arc

Every explainer is **pure ESP-IDF** — `app_main`, driver APIs, `vTaskDelay(pdMS_TO_TICKS(ms))`, no Arduino (the PWM video's Arduino calls are legacy; its *structure* still applies).

Every explainer follows this arc (the PWM video, 310 s, minus its cut under-the-hood scene):

| # | Scene | Job | PWM video |
|---|---|---|---|
| 1 | **Problem** | opens on **"Let's say you want to …"**: the thing you want, then the obvious approach tried on screen, with what works and what breaks (see "The problem" below) | dim a light — but a pin is only 3.3 V or 0 V |
| 2 | **Answer** | the idea in one image, then its name | switch it fast → P·W·M lands letter by letter |
| 3 | **One Explainer per call** | each call the learner types, in the order they type it; every argument pulled apart | `ledc_timer_config`, `ledc_set_duty`, … |
| 4 | **Demo** | real code runs, the hardware responds on the same frame (`CodeToHardware`), slowed if needed | knob 1: duty → brightness, slowed 500× |
| 5 | **Deeper calls** | any call that hides machinery gets its own Explainer after the demo that used it | `ledcFade` |
| 6 | **Second knob** | the other dimension, contrasted with the first | frequency → pitch, on a speaker |
| 7 | **Payoff** | one spoken line, then a 3–4 item recap | "That's PWM." |

**There is no under-the-hood scene.** The course teaches how to *use* the ESP32 — you don't need to know how an engine works to drive a car. Never descend into driver source, HAL/LL functions, registers or bit fields. Research them (they keep `FACTS.md` honest), then say only what the learner will notice and what to do about it.

## The problem: want → first try → answer → code → calls

The freertos-queues review set this order; it applies to every explainer:

1. **Open with the want, in the learner's words.** The first VO line is "Let's say you want to …" + the concrete result on hardware ("Let's say you want an LED to blink three times every time you press a button"). No mechanism, no API name yet. (Say "Let's say", not "Say you want": the TTS blurs that into "So you want".)
2. **Lay the problem out as parts on screen**, each in a fixed place it keeps for the rest of the video. When something passes between two parties (a sender and a receiver, a task and an ISR, a producer and a consumer), show **two sides**: the sender on the left, the receiver on the right, the thing between them in the middle.
3. **Try the obvious approach first, on that picture**, and run it for real when you can (a lab variant, its real log). Say plainly what works and what breaks, one VO line each, and keep a ✓ / ✗ score on screen. No hedges: never "sort of works" or "kind of"; say exactly what works ("for one press, it works") and exactly what doesn't ("three presses, the LED task saw two").
4. **Then the answer, on the same picture with the same inputs**, so the difference is the only thing that changes. Give it its own ✓ and ✗: every tool has a catch ("only so many boxes"), and the catch gets its own scene later. Name it after the picture has done the work ("That's a queue.").
5. **Then the code, both sides at once** (each side's code in its own panel), lighting each call as the picture underneath moves.
6. **Then one Explainer per call.** When a call moves something between two parties, **every view shows both ends at the same time**: the item going in at one end while the other end takes one out. A call shown on one side only is too abstract.

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

### Sound like a teacher, not a list (grammar and flow)

The freertos-mutexes review: "the content is great, but it starts and stops; the grammar sounds wrong in places." The script has to read like someone who knows the subject explaining it to a person in front of them, and pulling them along.

- **Whole sentences only.** Every line is grammatical as spoken: subject, verb, object. No headline fragments in the VO ("Two million. Exactly. Every time.", "What you need... only one task may touch total", "That's worse. It hides."). Say them in full: "This time, the total is exactly two million, and it's the same on every run." / "What you need is a simple rule: …" / "…which actually makes it worse: the bug hides, and only shows up once in a while."
- **Name the thing; never leave a bare pronoun or a missing noun.** "It hides" → "the bug hides". "Read total" → "First, the task reads the value of total."
- **Signpost what's coming.** Before steps or a mechanism, say what it is: "Behind the scenes, it happens in three steps. First, … Then … Then …". Before the calls: "Let's look at each call, starting with …". Before a run: "Let's flash it, and see what we get."
- **Join lines with transitions** so each line follows from the last: *so, and, but, now, then, that's why, this time, in that case, there's a catch, though*. A scene should read as one paragraph, not a stack of captions.
- **Ellipses (`...`) are rare.** At most one or two in a whole video, only where a word truly needs to land. Lots of them make the voice halt and restart all the time. Let commas and full stops do the pacing.
- **Gaps between lines stay short inside a beat** (0.4–0.6 s). Use 0.8–1.0 s only where the topic really changes, or while a run plays on screen.
- **Before voicing: read the whole scene aloud, top to bottom,** and check every line for grammar, a clear subject, and a link to the line before it. After voicing, read the vo-plan sheet and the render's transcript the same way. Whisper mishearing a word is fine; a sentence that reads badly is not.

### Pauses and emphasis

The voice reads every line at one even pace unless you shape it. Shape every line; uneven pauses are what make it sound like someone explaining rather than reading.

- **Between lines: the `pause`** (the silence before a line; default 0.6 s). About **1.0 s for a new beat** or a new view, **0.3–0.4 s** for a line that finishes the previous line's thought, **0.8 s after a question**, and longer when the picture carries the moment alone (a run playing out, presses landing). Never leave every gap at the default.
- **Inside a line, in `say`** (all measured on the house voice):
  - `...` = a beat of about 0.5 s, and the words after it are lifted and stressed. Put it right before the words that matter ("The queue copies that... many bytes"), but keep it rare: see "Sound like a teacher" above.
  - `.` = a new phrase (~0.45 s and a fresh pitch). Split a long line into short sentences rather than chaining clauses with commas.
  - `,` = a short breath (~0.2 s).
  - Capitals do nothing; emphasis comes from the pause before a word and from putting the key word **last** in a short sentence.
- **Look at it, don't guess:** `scripts/vo-plan.ts` prints every line with the silence before it (`+1.00`) and every pause the voice makes inside it (`‖0.52`, measured from the audio). Read the sheet after every wording change: a key word with no pause before it, or a list said in one breath, shows up there.
- A `...` changes how Whisper hears the line (it can merge or mishear words around it: "Here... five" → "Heater 5"). Re-check the cue words after adding one.

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
