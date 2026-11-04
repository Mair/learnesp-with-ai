# Learn ESP32 v2

Narrated, animated explainer videos for the ESP32 course, built in
[Remotion](https://www.remotion.dev/). Picture, narration and sound are all
generated from one timeline per video; every fact on screen is checked against
the ESP-IDF source (v6.0+). The videos teach how to *use* the ESP32, not how the
driver works inside: no under-the-hood scenes (see `AGENTS.md`).

| Video | Composition | Length | What it covers |
|---|---|---|---|
| PWM (Module 01, legacy Arduino — ESP-IDF rewrite in progress) | `PWM` | 4:25 | why a pin can't dim → PWM → `ledcAttach` (frequency, resolution, clock budget) → `ledcWrite` (the duty) → LED demo → `ledcFade` (staircase, fade engine) → `ledcWriteTone` → payoff |

## Making a video

Use the **explainer-video** skill in `.pi/skills/explainer-video/` — e.g. *"let's create a new video on A-to-D conversion"*.
It holds the whole process (research → storyboard → timing → build → check → sound → render) and the house standards:
`SCRIPT.md` (story arc, depth, narration), `STYLE.md` (colour meanings, type, shot types, layout), `SOUND.md` (levels, SFX, when sound may carry pitch).

## Requirements

Node 22+, `ffmpeg`, [`edge-tts`](https://github.com/rany2/edge-tts) (scratch voice-over), [`uv`](https://docs.astral.sh/uv/) (runs faster-whisper for word timings).

## Commands

```bash
npm install
npm run dev                      # Remotion Studio: scrub, preview
npm run typecheck

npm run pwm                      # soundtrack + render → out/3-advanced-gpio/pwm.mp4
npm run pwm:audio                # soundtrack only → public/pwm/mix.wav, stems in out/3-advanced-gpio/pwm-stems/

npm run vo -- pwm [scene]        # TTS every VO line (cached) + Whisper word offsets → cue times
npm run stills -- PWM 26 41.5    # stills at absolute seconds → /tmp/stills/
```

## Layout

```
src/
  Root.tsx                 one <Composition> per video
  theme/palette.ts         colours + fonts
  components/              house shot types and parts
    Explainer.tsx            the call + one card per argument + a stage of views
    CodeToHardware.tsx       code ↔ LED/speaker ↔ scope, with slow motion
    CodeLine.tsx             a line of code that underlines and labels its tokens
    Gadgets.tsx Panel.tsx Type.tsx Backdrop.tsx anim.ts
    pwm.ts                   PWM signal model (shared by picture and sound)
  scenes/
    PWM.tsx                  sequences the PWM video's scenes over its soundtrack
    pwm/
      timeline.ts            single source of truth: scenes, cues, VO, shared maths
      FACTS.md               every claim and the source file it came from
      Problem Answer Setup Write Fade Payoff .tsx
scripts/
  lib/audio.ts             synthesis, voice-over, SFX, music, mastering (shared)
  pwm-audio.ts             the PWM soundtrack
  vo.ts  stills.mjs        timing sheet, still renders
docs/course-design/        the course's story, animation language, stack rationale
```

Generated, not committed: `out/`, `.cache/` (TTS clips + word timings), `public/*/mix.wav` (rebuild with `npm run <video>:audio`).
