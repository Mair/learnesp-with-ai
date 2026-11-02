# Story architecture

## The diagnosis

The existing `esp32-intro` is a *brochure*. Seven scenes, twenty-one bullet
points, zero demonstrations. It tells the viewer the chip has 34 GPIO; it never
shows one pin doing one thing.

Three structural problems:

| Problem | Symptom in the current cut |
|---|---|
| **No protagonist** | Nothing is at stake for anyone. "Machines can think now" is a claim about the world, not about *you*. |
| **No tension** | Every scene is a win. Feature → feature → feature → CTA. Nothing is ever hard, so nothing is ever earned. |
| **No proof** | The viewer is asked to believe "paste a datasheet, get working firmware" with no evidence. That's the single most load-bearing claim in the course and it's delivered as text on a card. |

The fix is not more animation. It's giving the animation *something to be about*.

---

## The spine: one device, six times

The highest-leverage decision available: **the course builds one object, and the
story is that object becoming more alive.**

Not six disconnected projects. One lamp.

> **"The Lamp That Listens"**
>
> Module 1 it's a bare LED on a breadboard that blinks when you tell it to.
> Module 6 it's a voice-controlled, presence-aware, self-updating light in a
> printed enclosure that someone else can install in their house.

Why a lamp:

- **It's the user's own example.** "Communicating with the Wi-Fi device and
  actually turning a light on" is the instinct to trust. It's legible to
  literally everyone.
- **Light is a free status display.** Every internal state — booting, connected,
  listening, thinking, failed — can be shown *on the object itself*, with no
  serial monitor. This is enormous for video. The audience always knows what the
  machine is feeling.
- **It scales from trivial to genuinely hard** without changing the object.
  `digitalWrite` → PWM → Wi-Fi → sensor fusion → on-device wake word → OTA and
  power budgets. Same lamp throughout.
- **The final form is emotionally satisfying.** A thing you can put on a shelf
  and a non-technical person says "wait, *you made that?*"

### Alternates, if the lamp feels too soft

| Spine | Final form | Trade-off |
|---|---|---|
| **The Listening Lamp** | Voice + presence desk light | Most legible, widest appeal, weakest "impressive" ceiling |
| **The Watcher** | ESP32-S3-CAM that recognises who's at the door and speaks | Strongest edge-AI showcase; camera work is harder to film |
| **The Ear** | Contact-mic anomaly detector on a machine ("hear a bearing fail") | Most *professional* story, narrowest audience |
| **The Companion** | Battery desk creature, LLM-backed, e-ink face | Highest charm, most scope creep risk |

Pick one and commit. **Do not run two spines.** The entire value of this approach
is cumulative recognition — the audience should feel the object as a character.

---

## The engine: every payoff creates the next problem

This is the mechanism that turns a syllabus into a story. Each module ends by
*breaking its own win*.

| # | Title | The win (shown, not claimed) | The limitation revealed at the end |
|---|---|---|---|
| **1** | **First Light** | An LED obeys an instruction you wrote. | "It only works while you're standing next to it." |
| **2** | **A Nervous System** | Smooth PWM fade, a touch pin, a dial. Real analog response. | "It's still tethered to your hand." |
| **3** | **An Address** | Phone on the sofa, light on the desk, across the room. | "Anyone on your Wi-Fi can do that. And it forgets everything the moment you unplug it." |
| **4** | **Senses** | Walks-in-the-room detection, ambient-matched brightness, settings that survive a reboot. | "It *reacts*. It doesn't *understand*." |
| **5** | **Ears** | "Hey lamp — movie night." Wake word on-device, intent via LLM, lamp dims warm. | "It works on *your* desk, on *your* Wi-Fi, with a laptop attached." |
| **6** | **It Leaves Home** | OTA update pushed to a lamp in someone else's house. Runs for weeks on a battery. In a case. | — (this is where the audience becomes a builder) |

Read that limitation column top to bottom. **That's the trailer script.** It's
also a promise structure: the viewer always knows what they don't have yet.

---

## Per-episode shape

A template, so every module feels authored rather than recorded.

```
0:00  COLD OPEN          8–20s   The thing working. No context. No talking over it.
                                 Diegetic sound only — relay click, LED, a voice saying
                                 "movie night", the lamp responding.
0:20  THE CUT            30s     "You just watched a $3 chip do that. Here's the one
                                 thing standing between you and it." State the obstacle.
0:50  THE BUILD          bulk    Beats of 5–8 min. EVERY beat ends in something
                                 observable on the hardware. Never two concepts
                                 without a payoff between them.
      THE BREAK          2–6 min 1–2 per module. A REAL failure, unstaged, diagnosed
                                 on camera. Brownout. Guru Meditation. Floating pin.
                                 Wrong I²C address. Show the fix loop.
      THE EARNED WIN     60s     Replay the cold open shot-for-shot. Now the viewer
                                 can read every frame of it.
      THE HOOK           20s     Break it. Reveal the limitation. Name the next module.
```

Two rules that matter more than they sound:

1. **The cold open and the earned win are the same footage.** Identical shot,
   identical cut. The meaning changes because the viewer changed. This is cheap
   to produce and does more narrative work than anything else on this page.
2. **Never explain before you've shown.** The urge to front-load "what is PWM"
   is the single thing that makes technical video feel like homework.

---

## The Break: why deliberate failure is the highest-trust content you can make

Most courses present a clean path and the learner concludes they're uniquely
incompetent when their board browns out. Filming real failure does three things
no polished tutorial can:

- It **teaches the actual skill**, which is not "write firmware" but "interpret
  a thing that is misbehaving."
- It **builds trust** faster than any credential. A person who shows you their
  mistake is a person you believe about everything else.
- It is **where AI pair-programming is genuinely revelatory**, as opposed to a
  bullet point. Paste a backtrace, watch it get decoded, verify it on the
  hardware. That's the course's core claim, demonstrated instead of asserted.

Candidate breaks, one per module, all real and all common:

| Module | Break |
|---|---|
| 1 | GPIO that can't actually drive what you attached. Why the LED is dim. |
| 2 | PWM on a pin that fights the Wi-Fi radio / ADC2 unusable with Wi-Fi on. |
| 3 | Hard-coded credentials, then the board that boot-loops on a bad reconnect. |
| 4 | I²C device at the wrong address; pull-ups missing; the datasheet that lies. |
| 5 | Wake word that fires on the dog. Heap exhaustion mid-inference. |
| 6 | Deep sleep that draws 40 mA because the dev board's regulator never sleeps. |

That last one is a gift: the datasheet says ~10 µA, the dev board on the desk
says otherwise, and understanding *why* is a genuine engineering moment.

---

## Rewriting the trailer

The existing trailer's problem in one line: it spends 55 seconds on
specifications and 0 seconds on the lamp.

A replacement structure, same runtime:

```
0:00–0:10  BLACK. A voice in a dark room: "Hey lamp — movie night."
           A click. Warm light blooms across a desk. Macro, shallow focus.
           No narration. No music yet. Just the room.

0:10–0:18  Pull back: it's a 3D-printed lamp on a cluttered desk.
           Cut to the thing inside it — the ESP32, macro, on a fingertip.
           FIRST NARRATION: "That's a three dollar computer."

0:18–0:30  THE REWIND. Hard cut to the same desk, six weeks earlier:
           one LED, one breadboard, one wire. Blink.
           "Six weeks ago it could do this."

0:30–0:45  THE CLIMB. Rapid, rhythmic build — each shot 1.5s, cut to the
           music's pulse, each one a real frame from a real module:
           fade → phone control → presence trigger → waveform → wake word →
           OTA progress bar → the enclosure closing.

0:45–0:55  Back to the lamp, lit. "You don't need an EE degree.
           You need six weekends and something that answers back."
           learnesp32.com

0:55–0:58  Black. One last relay click in the dark.
```

The whole trailer is the *course* compressed, not the *chip* described. Keep the
synthwave palette — it's a real differentiator in a field of beige tutorials —
but let real hardware footage carry the proof.

---

## Narration voice: what to stop doing

The current script is written in Trailer Voice: declarative, portentous, built
from sentence fragments. "Private. Instant." It's well-executed and it is
exactly wrong for a course, because it positions the narrator *above* the
learner.

Shift to a second person, present tense, slightly conspiratorial register:

| Current | Rewritten |
|---|---|
| "Machines can think now. They still can't feel a room, or turn a motor." | "Your model can write a sonnet and it cannot turn on a light. That's the gap you're about to close." |
| "A decade of Espressif code is in the training data. Paste a datasheet, get working firmware." | "Watch this. I'm going to paste 400 pages of Bosch's worst PDF into a chat window and ask for twelve lines." *(then do it on screen)* |
| "Wake words and vision run on the chip itself. Private. Instant." | "Unplug the Wi-Fi. Say it again. It still works — and nothing you said ever left the room." *(unplug it on camera)* |

Rule: **if a line can't be followed by a shot that proves it, cut the line.**
