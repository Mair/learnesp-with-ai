# Vertical slice — "Say it, and the light obeys"

**Goal:** prove the entire pipeline on 75 seconds of finished video before
committing to six modules. Animation, live action, voice, sound design, music,
grade, delivery. If this works, everything works.

Not a trailer. A **module cold open + earned win**, which is the atom the whole
course is built from.

---

## Shot list

| # | Dur | Picture | Sound | Source |
|---|---|---|---|---|
| **1** | 4s | Black. Then a dark room, barely lit. A desk. | Room tone only. A chair creaks. | Live |
| **2** | 3s | A voice, off-camera: *"Hey lamp — movie night."* Nothing happens for a beat. | Voice, dry, close. **Then one second of total silence.** | Live |
| **3** | 2s | **CLICK.** Warm light blooms across the desk. Macro, shallow focus, shot at 120 fps and stretched. | The real relay click, recorded with a contact mic. Sub-bass thump under it. Music enters here, not before. | Live |
| **4** | 4s | Slow pull back: a 3D-printed lamp, cluttered desk, warm pool of light. | Music builds. | Live |
| **5** | 3s | Hard cut to macro: the ESP32 module on a fingertip. Rack focus from fingerprint ridges to the shield can. | Music ducks. | Live |
| **6** | 3s | `XRay` transition: photograph → schematic → data flow, held in registration. | Soft digital sweep. | **Remotion** |
| **7** | 5s | First narration over the dataflow: *"That is a three dollar computer, and ninety minutes ago it could only do this."* | VO. | Remotion |
| **8** | 3s | Smash cut: same desk, bare breadboard, one LED. Blink. Blink. | A dry, sad little tick per blink. Music out. | Live |
| **9** | 8s | `CodeToHardware`: `digitalWrite(2, HIGH)` on the left, LED on the right, responding on the same frame. Waveform below. | VO: *"One pin. One instruction. No intelligence whatsoever."* | **Remotion** |
| **10** | 10s | `SignalScope`: the square wave slows down until individual edges are visible, then speeds into PWM, LED visibly fading in sync. | VO explains duty cycle in one sentence. Rising synth. | **Remotion** |
| **11** | 8s | `PacketFlight`: phone → router → chip. Payload readable: `{"on":true}`. Cut to a thumb on a phone, then the real LED obeying. | VO: *"Then it got an address."* Packet whoosh, then the physical click. | Remotion + Live |
| **12** | 10s | `IntentResolve`: waveform → spectrogram → wake word fires (lamp blinks once, for real) → `{"scene":"movie","kelvin":2200}` → each field flies to the thing it controls. | VO: *"And then it got ears."* | **Remotion** |
| **13** | 4s | `AirgapProof`: a hand physically unplugs the router on camera. Wi-Fi icon dies. | Cable click. Music drops to a single held note. | Live + Remotion |
| **14** | 5s | The same voice: *"Hey lamp — movie night."* It works anyway. | **The earned chime.** | Live |
| **15** | 3s | Back to shot 3, identical frame, identical grade. | Music resolves. | Live |

**Runtime ≈ 75 s.** Roughly 55% live action, 45% Remotion — which is the ratio
to aim for across the whole course.

---

## Why this slice specifically

It forces you to solve every hard problem exactly once:

- Macro hardware footage in low light (hardest cinematography problem here)
- Contact-mic hardware sound and a real sound-design moment
- Your own voice, recorded and processed
- Three of the Tier-1 animation components, built properly and reusably
- Remotion ↔ live action compositing in both directions
- Music that enters, ducks, drops and resolves
- The cold-open / earned-win mirror structure, end to end

And it is **honest** — you cannot shoot shot 14 without actually having built a
lamp that works offline. The slice is simultaneously a production test and a
forcing function on the curriculum.

---

## Definition of done

- [ ] Renders reproducibly from a single command
- [ ] Reads correctly on a phone at 50% brightness with the sound off
      (captions/visual clarity test)
- [ ] Reads correctly with the picture off (audio-only narrative test)
- [ ] Shot 3 makes someone in the room turn their head
- [ ] A non-technical viewer can say what the lamp does afterwards
- [ ] An embedded engineer doesn't wince at a single technical frame

---

## Build sequence

```
1. Build the lamp.                       (curriculum work, not production)
2. Shoot shots 1–5, 8, 11b, 13–15        one lighting session, 120 fps
3. Record hardware sound                 contact mic, separate session, quiet
4. Record scratch VO on a phone          cut the whole thing to scratch first
5. Lock the edit at scratch quality      ← do not animate before this
6. Build components 6, 9, 10, 11a, 12    Remotion, to the locked timing
7. Record final VO to picture
8. Score, sound design, grade, mix
```

**Step 5 is the one people skip.** Lock the edit with scratch audio and
placeholder cards *before* building a single polished animation. Otherwise you
will spend a week animating a shot that gets cut.
