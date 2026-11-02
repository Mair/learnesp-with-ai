# Animation language

## The problem with the current visual grammar

Everything in `index.html` is one of four moves: `up`, `fade`, `pop`, `wipe`.
Text arrives, text leaves. It's clean and it is *decorative* — the animation
carries no information. Nothing on screen is ever a model of anything.

What follows is a vocabulary of **named shot types** where the motion *is* the
explanation. Build each one once as a reusable component, then the course has a
house style instead of a pile of one-offs.

---

## Tier 1 — the three that matter most

### 1. `CodeToHardware` — the causality split

The single highest-value animation pattern in embedded teaching, and almost
nobody does it properly.

```
┌──────────────────────────┬──────────────────────────┐
│  ledcWrite(0, 128);      │   [macro shot of LED]    │
│  ^^^^^^^^^^^^^^^^^^^     │   ◖ half brightness      │
│  ← highlight sweeps      │   ← responds in the SAME  │
│                          │      frame               │
└──────────────────────────┴──────────────────────────┘
                  ╰─ 50% duty ─╮
         ┌──┐  ┌──┐  ┌──┐      │  ← live waveform under both
      ───┘  └──┘  └──┘  └───   ╯
```

A line of code illuminates; the physical result happens on the *same frame*; the
waveform underneath shows why. Change `128` to `255`, all three panels respond
together.

This destroys the usual "write code… cut to… it works!" gap where the learner
loses the thread. **Causality is the thing being taught.** Make it visible.

Build it as a component that takes `(codeLines, highlightFrame, hardwareClip,
signalData)`. Reuse it in every single module.

### 2. `SignalScope` — show the actual signal

Beginners have no mental model of what a pin *is*. Every pin concept gets a real
trace, drawn as the thing happens:

- **PWM** — duty cycle animating as the dial turns, with the LED keeping pace.
- **I²C** — the full transaction, drawn byte by byte: start condition, address
  frame, the ACK bit arriving from the sensor, register pointer, data. Pause on
  the ACK. *That little low pulse is the sensor saying "yes, that's me"* — this
  one beat demystifies an entire protocol.
- **UART** — a start bit, eight data bits, stop. Then show what 115200 vs 9600
  actually means by slowing time down.
- **I²S** — audio samples streaming into a buffer, then the buffer becoming a
  waveform, then the waveform becoming a spectrogram feeding the wake word.
- **ADC** — a continuous voltage being chopped into 12-bit steps, with the
  quantisation visibly lossy.

Draw real captured data where possible (logic analyser export → JSON → the
component). Fake it only when real data is unreadable.

### 3. `XRay` — the same object at three depths

A transition, used at the opening of every build beat:

```
  real photographed board   →   schematic   →   data flow
   (live footage, macro)       (vector lines     (abstract blocks
                                tracing the       and packets)
                                same pins)
```

Cross-dissolve while *holding registration* — the GPIO21 pad on the photograph
sits exactly where the GPIO21 node sits in the schematic, which sits exactly
where the "SDA" block sits in the diagram. The viewer's eye stays locked and
they learn that the abstraction and the object are the same thing.

This is the antidote to the universal beginner complaint: "I understand the
diagram and I don't know where to put the wire."

---

## Tier 2 — network and intelligence

### 4. `PacketFlight`
Camera-tracks a single packet from the chip's antenna → router → ISP → cloud →
back. Show the actual payload as readable text on the packet. Then do it again
with the latency rendered honestly: 180 ms of real dead time, which *sets up*
the on-device inference argument later. Worth building in 3D (see stack doc).

### 5. `AirgapProof`
The literal demonstration: router unplugged on camera, Wi-Fi icon dies, and the
wake word still fires. Overlay shows inference happening entirely inside the
chip outline. This proves the edge-AI claim that scene 5 of the current trailer
can only assert.

### 6. `TensorSqueeze`
A float32 model visibly compressing to int8 — weights snapping to a coarser
grid, a filesize counter falling from 14 MB to 380 KB, with accuracy ticking
down 2%. Quantisation as a *visual trade*, which is exactly what it is.

### 7. `IntentResolve`
Raw audio waveform → spectrogram → wake word fires (lamp blinks once) → speech
to intent → JSON `{"scene":"movie","brightness":18,"kelvin":2200}` → each JSON
field flying to the physical thing it controls. Ends on the lamp actually doing
it. The whole voice pipeline in one unbroken visual sentence.

### 8. `DatasheetCollapse`
The proof shot for the course's central claim. 400 pages of register tables
cascade down the screen, get swallowed, and twelve lines of working code crawl
out. Then — critically — **cut to those twelve lines running on the real
sensor.** The animation is the joke; the hardware is the punchline.

---

## Tier 3 — texture and rhythm

### 9. `BootSequence`
Real serial output, typed at real speed, with the boot ROM messages scrolling.
Highlight the one line that matters. Learners find the boot log terrifying;
annotating it once removes that fear permanently.

### 10. `PowerBudget`
A live-draining battery with a current trace beneath it. Deep sleep drops the
trace to a flat line, the battery's projected life jumps from 9 hours to 4
months — then the reveal that the dev board's regulator ruins it. A
*numerically honest* animation, which is rare and memorable.

### 11. `TimelapseBuild`
The enclosure: print timelapse, parts laid out flat-lay, assembly, lid closing.
30 seconds, no narration, music up. This is the "ooh" moment that makes people
share the course.

### 12. `StateMachine`
For anything with modes (listening / thinking / acting / failed). The active
node pulses — **and the real lamp's LED pulses in the same colour at the same
time.** Diagram and object in sync. Again: causality.

---

## Three craft rules

**Animate the thing, not the text about the thing.**
If a card says "I²C", the card is wasted. Show the bus. Reserve typography for
section markers and emotional beats, not for information delivery.

**Every abstract visual earns its place by cutting to hardware within 10s.**
The diagram is a claim. The hardware is the evidence. Never leave a claim
unsettled — and never run two abstractions back to back.

**Motion should have mass.**
Current easings are all `cubic-bezier(.2,.8,.25,1)` — pleasant and weightless.
Give physical objects physical motion: springs with overshoot for things that
*snap* (relay, switch), heavy damping for things that *settle* (a value
converging), and linear for things that are *machine-driven* (a progress bar, a
clock, a scrolling log). The audience reads mass subconsciously and it's a large
part of why something "feels expensive."

---

## Live action is not optional

The biggest single upgrade available is not a better animation library — it's
**real footage of real hardware**, cut against the vector work.

Minimum viable physical setup:

- **Top-down rig** over the breadboard. An arm clamp and a phone will do.
- **A second angle**, low and raking across the board, so you can *cut*. One
  angle is a lecture; two angles is film.
- **Macro**, close enough that the LED fills a third of the frame and you can
  see the die glow and the solder.
- **Hard, controlled light** — one key with a grid, one rim to separate the
  black PCB from a black background. Black-on-black is the default failure mode
  of all hardware footage.
- **Shoot hardware at 60–120 fps** so the moment the LED comes on can be
  stretched. That tiny slow-motion on the payoff frame is worth
  disproportionate emotional weight.
- **Contact mic or a close dynamic on the board** for real relay clicks and
  switch actuation. Real hardware sound beats any library sample (see audio
  doc).

Budget guidance: a used mirrorless + cheap macro + two lights is a few hundred,
and it will improve the course more than any software decision in this
repository.
