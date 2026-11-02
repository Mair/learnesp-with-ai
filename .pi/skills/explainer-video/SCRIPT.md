# Script: the arc, the depth standard, the narration

## The arc

Every explainer follows the arc the PWM video used (310 s):

| # | Scene | Job | PWM video |
|---|---|---|---|
| 1 | **Problem** | the thing you want, and why the obvious approach can't do it | dim a light — but a pin is only 3.3 V or 0 V |
| 2 | **Answer** | the idea in one image, then its name | switch it fast → P·W·M lands letter by letter |
| 3 | **One Explainer per call** | each call the learner types, in the order they type it; every argument pulled apart | `ledcAttach`, `ledcWrite`, … |
| 4 | **Demo** | real code runs, the hardware responds on the same frame (`CodeToHardware`), slowed if needed | knob 1: duty → brightness, slowed 500× |
| 5 | **Deeper calls** | any call that hides machinery gets its own Explainer after the demo that used it | `ledcFade` |
| 6 | **Second knob** | the other dimension, contrasted with the first | frequency → pitch, on a speaker |
| 7 | **Under the hood** | descend the real call path: sketch → Arduino core → ESP-IDF API doc → HAL register writes → silicon | `ledcWrite` → `ledc_update_duty` → `duty_start = 1` |
| 8 | **Payoff** | one spoken line, then a 3–4 item recap | "That's PWM." |

Mapping a new topic means finding its problem, its one-image answer, its calls, and its two knobs. For **A-to-D conversion** a plausible arc (verify every call in step 1) is: problem — a sensor gives a smooth voltage but the CPU only knows numbers → answer — sample it, chop it into steps → Explainers for the resolution / attenuation / read calls → demo: a potentiometer turning while the number tracks → second knob: attenuation (input range) vs resolution (step size) → under the hood: `esp32-hal-adc.c` → `adc_oneshot_read` → SAR conversion → payoff.

## The depth standard

Apply every point to **every argument of every call** and every concept a scene introduces. If a point doesn't apply, decide that consciously.

1. **What it is, in one plain sentence** — and, where beginners hold a wrong model, **what it is not** ("the duty isn't a voltage — it's how long the pin is on").
2. **Units and a worked chain with this video's actual numbers**, shown on screen as it's said: 1000 Hz → 1 period = 1 ms; 2⁸ = 256 steps → 1 ms ÷ 256 ≈ 3.9 µs; 2.8 s × 1000 Hz = 2800 periods ÷ 230 steps → 12.
3. **The physical picture the number controls** — the waveform, counter, staircase or bar that changes when the number changes, animated with the number.
4. **Range, and where the range comes from** (8 bits → 0…255; 10 bits → 0…1023: "the same half becomes 512").
5. **Edge values** — 0, the max, out-of-range — and what really happens (255 is bumped to 256 = fully on).
6. **Limits and trade-offs** with the arithmetic (frequency × 2^bits must fit in 80 MHz → 1 kHz × 17 bits ✗).
7. **What the code really does**, from the source — rounding, clamping, defaults, the return value (fade really takes 2.76 s; `ledcAttach` returns false if it can't fit).
8. **Who does the work** — your code or the peripheral; does the call block; what the CPU is free to do.
9. **A callback** to an earlier image when a new idea is the same mechanism ("it's the line across the counter from before").

## Narration

- Second person, conversational, short sentences, one idea per sentence. Grammatical as written.
- One VO line per view or beat, 4–16 s. ~2.6 words/s with the house voice.
- Every number spoken appears on screen on that word; every on-screen change has a spoken reason.
- Never claim more than `FACTS.md` supports; say "about" when rounding.

### `text` vs `say`
`text` is the script as written (code names in code form: `ledcWrite`, `ledc_update_duty`). `say` is what the TTS reads — set it whenever they differ:

| Write in `say` | For |
|---|---|
| `LED-C write`, `LED-C fade with interrupt` | `ledcWrite`, `ledcFadeWithInterrupt` (spelled letters "L E D C" stall) |
| `ESP-IDF` | the framework |
| `P W M` (spaced) | letters that must land one by one |
| `two thirty`, `a thousand hertz`, `two to the eighth`, `two hundred and fifty-six` | numbers — always words |

Check the transcript (step 8) for words the TTS blurs ("the duty slides" was heard as "the duties slide") and rephrase.

## Captions

One caption per idea, readable with the sound off: the claim compressed, with arrows and symbols — `1000 Hz → each cycle (the period) lasts 1 ms`, `0 → never on · 255, the top value → always on`. They live in the scene's cue object as `captions: [{ at, text }]`.
