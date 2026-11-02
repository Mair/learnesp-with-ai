# Tech stack

## What you have now, honestly assessed

`esp32-intro/` is hand-written CSS keyframes, frame-scraped by headless
chromium, encoded by ffmpeg. It is genuinely elegant — one master clock, the
same code path for preview and render, zero drift. **Keep the philosophy.**

But it has four ceilings that will stop a six-module course dead:

| Ceiling | Evidence |
|---|---|
| **Render throughput** | 55 s took ~10 min → ≈11 fps. A course with 3–4 hours of motion graphics is weeks of single-threaded rendering. |
| **Manual timeline bookkeeping** | Your own README: *"All `animation-delay` values are absolute times on the 55 s timeline."* Moving one scene means hand-editing every descendant's `--d`. That does not survive 40 scenes. |
| **No composition** | Four cards = four copy-pasted divs. No props, no reuse, no `<StatCard>`. |
| **No audio-aware animation** | The score and the visuals are two separate universes glued together in `mix.sh`. Nothing can be driven by the waveform. |

---

## Recommendation: Remotion for the motion graphics

React components that render to video. It keeps everything you already have —
web tech, the same CSS, the same palette, deterministic frame-accurate output —
and removes all four ceilings.

**Licensing (checked):** free for individuals and teams **up to 3 people**,
*including commercial use*. A paid Company Licence kicks in at 4+ headcount.
For a solo or small course business, you are clear — but re-verify at
[remotion.dev/docs/license/pricing](https://www.remotion.dev/docs/license/pricing)
before you ship, since terms change.

What it fixes, concretely:

```tsx
// Scenes compose. Moving this scene moves everything inside it.
// No absolute delays anywhere.
<Sequence from={0}   durationInFrames={210}><ColdOpen /></Sequence>
<Sequence from={210} durationInFrames={240}><TheHardware /></Sequence>

// Components take props.
<StatCard value="240" unit="MHz" title="Dual-core Xtensa" accent="cyan" />

// Motion comes from springs, not guessed beziers.
const scale = spring({ frame, fps, config: { damping: 12, mass: 0.6 } });

// Animation can be driven BY the audio.
const amp = visualizeAudio({ fps, frame, audioData, numberOfSamples: 16 });
```

Plus: multi-core parallel rendering (10–40× faster in practice), `<Audio>` and
`<Video>` as first-class primitives so live hardware footage composites *inside*
the same timeline, and still-frame export from the same components for
thumbnails and social cards.

**Migration is incremental.** Your existing CSS drops in nearly verbatim; the
work is replacing `animation-delay: var(--d)` with `useCurrentFrame()`
interpolation. Port one scene, confirm it matches, continue.

### Honest alternatives

| Tool | Use it for | Why not as the primary |
|---|---|---|
| **Motion Canvas** | The `SignalScope` / `I²C transaction` / diagram work specifically. Generator-based timelines and built-in voiceover sync make it *better* than Remotion at exactly this. | Canvas-based, no React reuse, smaller ecosystem. Consider it as a **second tool for diagram segments**, exported as transparent clips and composited in Remotion. |
| **Blender** (already installed) | Hero shots only — board beauty renders, PCB fly-throughs, exploded enclosure views, `PacketFlight` in 3D. This is your "looks genuinely expensive" differentiator. | Catastrophic as a primary pipeline. Slow iteration, no text workflow. |
| **Manim** | Nothing here. | Built for mathematical exposition; wrong idiom, slow iteration. |
| **After Effects** | Nothing here. | Abandons determinism, reproducibility and version control — the three things your current setup does best. |
| **Keep raw CSS** | Prototyping a single look. | Dies at scale, as above. |

### Blender specifics worth knowing

- Espressif publish board **STEP models**; KiCad also exports STEP → import to
  Blender for an accurate ESP32 dev board.
- Use **Eevee Next**, not Cycles, for the glowy synthwave look — it's real-time
  and matches your existing neon palette.
- Reserve it for **6–10 hero shots across the whole course**. Render them once
  as transparent-background ProRes 4444 or PNG sequences, composite in Remotion.

---

## Live-action and assembly

### Screen capture — OBS (installed)
- 60 fps, lossless or high-bitrate intermediate, **never** capture at final
  delivery bitrate.
- Separate scenes for: editor, serial monitor, AI chat window, oscilloscope/logic
  analyser. Switching scenes is cleaner than cropping in post.
- Capture the editor at a **zoomed-in font size** (18–22 pt) so 1080p viewers
  can read it. The single most common failure in coding video.

### NLE — switch from kdenlive to DaVinci Resolve (free)
The free version is a full NLE with node-based colour, Fusion compositing and
the Fairlight audio suite, no watermark, no time limit, exports up to 4K/60.
That matters here because:

- **Colour grading macro hardware footage** is where Resolve is untouchable, and
  black PCBs under hard light absolutely need grading.
- **Fusion** does motion-tracked overlays — annotating a *moving* board, which
  is the thing that will make the live segments feel authored.
- **Fairlight** handles the full voice chain in one place.

Caveat: free Resolve refuses some 10/12-bit H.264/H.265 camera files. Transcode
to DNxHR or ProRes with ffmpeg on ingest and the problem disappears.

### Where the edit actually lives

Important architectural call: **don't rebuild the whole course in an NLE.**

```
Remotion  ──→  all motion graphics, titles, diagrams, lower-thirds
   │            (versioned, reproducible, re-renderable on a script change)
   ↓
Resolve   ──→  live action only: multicam hardware, screen capture,
                colour, final audio mix, delivery
```

Motion graphics stay in code so a typo fix is a one-line commit and a re-render,
not an hour of manual timeline surgery. Live action goes in the NLE because
footage is inherently manual. Keep that boundary clean.

---

## Audio

### Voice: record yourself for the course body

Your `edge-tts` Andrew is a good *trailer* voice. It is the wrong choice for six
hours of paid instruction:

- TTS fatigue is real and sets in within ~10 minutes.
- Learners bond with a human. In a paid course, a synthetic voice reads as
  low-effort and undermines trust in everything else.
- TTS cannot do the thing that makes teaching work: *audible* thinking.
  Hesitation, emphasis, the small laugh when a board browns out again.

**Split the difference:** TTS for the trailer, interstitials and module stings
(where its polish is an asset). Your own voice for all instruction.

Gear, in order of impact per pound:
1. **Treated space** beats any microphone. A wardrobe, a duvet, a corner with
   blankets. Room reflection is the thing that makes audio sound amateur.
2. **A dynamic mic** — Shure MV7, Rode PodMic. Dynamics reject room noise; a
   condenser in an untreated room will punish you.
3. An interface or the USB side of the MV7. Don't overthink it.

Post chain (works in Fairlight, Audacity, Reaper, or ffmpeg):
```
high-pass 80 Hz  →  de-ess ~6 kHz  →  compress 3:1 @ -18 dB
                 →  RNNoise if needed  →  loudnorm
```
Targets: **-16 LUFS mono** for web/self-hosted, **-14 LUFS** for YouTube, true
peak **-1.5 dBTP**. You're already hitting -16/-1.5 in `mix.sh` — keep that.

Script discipline matters more than gear: write for the ear, one idea per
breath, short sentences, and **read every line aloud before recording it.**

If you later want scale, a cloned voice of *yourself* (ElevenLabs et al.) is the
honest middle ground — disclose it.

### Music: make it functional, not constant

Your oscillator-synthesised score in `mix.sh` is clever and licence-free, but
it's tonally one-note and won't carry 6 modules.

- **Trailers and transitions: music up.** Instruction: music absent or very low.
  Constant music under teaching is fatiguing and masks consonants.
- **Licence a small set** (Artlist / Epidemic / Musicbed) or commission 4–6
  loops **in the same key and tempo** so they intercut cleanly.
- **Keep the synthwave identity.** It's a genuine differentiator in a category
  of beige tutorials. Don't sand it off.
- Extend what you already built: the sidechain duck in `mix.sh` is the right
  mechanism. Keep it automatic.

### Sound design is where immersion actually comes from

More than music. This is the most underrated item in this entire document.

- **Record the real hardware.** A contact mic or a close dynamic on the board:
  the actual relay click, the actual tactile switch, the actual fan spinning up.
  Diegetic hardware sound is immersion; library samples are set dressing.
- **Give UI events sonic identity** — a PCB-pad "ting" on reveal, a soft UART
  chirp as serial text arrives, a sub-bass thump when a scene lands.
- **One earned chime**, identical in all six modules, that plays *only* at the
  moment the device works. Six repetitions and it becomes Pavlovian. That is
  what people remember about a course.
- **Use silence.** Cut the music dead one beat before the cold-open payoff. The
  drop to near-silence is what makes the light coming on feel like an event.

---

## Suggested build order

1. **Vertical slice first.** Rebuild *one* 60–90 s piece — the new cold open,
   "say it, and the light obeys" — in Remotion, with real hardware footage, your
   own voice, and one sound-designed payoff. Prove the whole pipeline end to end
   before committing to six modules. See `04-VERTICAL-SLICE.md`.
2. **Extract the component library** from that slice: `StatCard`,
   `CodeToHardware`, `SignalScope`, `XRay`, scene wrapper, title system.
3. **Build the physical capture rig** and shoot the lamp at all six stages
   *in one session*, before any teaching is recorded. You need the final-form
   footage to cut the trailer, and you need stage footage for every cold open.
4. **Record module 3 first**, not module 1. "An Address" (Wi-Fi → phone → light)
   is the most representative module and the one with the clearest payoff. If
   the format works there, it works everywhere. Module 1 is deceptively easy
   and will teach you nothing about the format.
5. **Then the trailer**, last — cut from real course footage, so it promises
   only what the course delivers.

## Open questions worth deciding early

- **Which spine device?** (see `01-STORY.md`) Everything downstream depends on it.
- **Target board:** ESP32-S3 is required for on-device wake word and vision. If
  edge AI is in the story, the starter kit must be S3 — this affects the "~$3"
  claim and the kit price promise.
- **Delivery platform** — self-hosted vs course platform — determines whether
  you can do per-module interactive elements or only linear video.
- **Does the viewer buy a kit?** A defined BOM makes the course concrete and
  massively increases completion rates. It also constrains every module.
