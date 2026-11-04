# Learn ESP32 v2

Narrated, animated explainer videos for the ESP32 course, built in
[Remotion](https://www.remotion.dev/). Picture, narration and sound are all
generated from one timeline per video; every fact on screen is checked against
the ESP-IDF source (v6.0+). The videos teach how to *use* the ESP32, not how the
driver works inside: no under-the-hood scenes (see `AGENTS.md`).

| Video | Composition | Length | What it covers |
|---|---|---|---|
| Basic GPIO intro (section 1) | `BasicGPIOIntro` | 1:38 | the want (switch an LED, read a button) → GPIO = general-purpose input/output, two levels → map: `gpio`, `gpio-input` → parts + ESP-IDF v6 → first up |
| FreeRTOS intro (section 2) | `FreeRTOSIntro` | 1:46 | one loop makes two LEDs and a button wait → tasks, the scheduler, `app_main` is a task, two cores → map: 14 videos → second LED + Basic GPIO calls → first up |
| Advanced GPIO intro (section 3) | `AdvancedGPIOIntro` | 1:38 | more than on/off → peripherals → map: `pwm`, `gpio-interrupts`, `adc`, `dac` → parts + both earlier sections → first up |
| PWM (Advanced GPIO, ESP-IDF LEDC) | `PWM` | 7:36 | why a pin can't dim → PWM → the whole program → `ledc_timer_config` (speed mode, frequency, resolution, clock, the 17-bit error) → `ledc_channel_config` (channel, timer, pin, duty, hpoint) → `ledc_set_duty` + `ledc_update_duty` (0…256) → LED demo → fades (`ledc_fade_func_install`, `ledc_set_fade_with_time`, `ledc_fade_start`) → tones with `ledc_set_freq` → payoff |

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

npm run basic-gpio-intro         # likewise freertos-intro, advanced-gpio-intro (scripts/intro-audio.ts)

npm run vo -- pwm [scene]        # TTS every VO line (cached) + Whisper word offsets → cue times
node scripts/vo-plan.ts <slug>   # voice + time every line, rewrite the timeline's VO plan
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
    intro/kit.tsx            section-intro shots: Bench, MapCards, PartsList, Checklist, Terminal, GoCard
    intro/vignettes.tsx      small looping hardware results for the map cards
    <section>-intro/         timeline.ts (VO, cues, SOUND list) + Scenes.tsx
    pwm/
      timeline.ts            single source of truth: scenes, cues, VO, shared maths
      FACTS.md               every claim and the source file it came from
      Problem Answer Context Timer Channel Write Fade Payoff parts .tsx
scripts/
  lib/audio.ts             synthesis, voice-over, SFX, music, mastering (shared)
  pwm-audio.ts             the PWM soundtrack
  intro-audio.ts <slug>    any section intro's soundtrack (VO · SFX list · music)
  vo.ts  stills.mjs        timing sheet, still renders
  vo-plan.ts               voice every line + Whisper → writes VO_AT/SCENE_DUR into a timeline.ts
docs/course-design/        the course's story, animation language, stack rationale
```

Generated, not committed: `out/`, `.cache/` (TTS clips + word timings), `public/*/mix.wav` (rebuild with `npm run <video>:audio`).
