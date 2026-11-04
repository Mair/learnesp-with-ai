# Sound

Everything except the VO is synthesised by `scripts/lib/audio.ts` from the same timeline as the picture, so it can't drift. The build is deterministic.

## Layers and levels

| Layer | Level | Notes |
|---|---|---|
| VO | speech RMS −20 dBFS | `voiceover()` levels it and fit-checks every line against the next line and its scene end |
| Music | `level(music, -30, …)`, ducked to 40 % under VO (`talkingEnvelope`) | `pad()`: a minor chord bed (C3·E3·A3 over A2), low-passed 1.4 kHz; cut dead ~0.15 s before the payoff, then resolve to the major chord under the payoff line. |
| SFX | as below | `sfx(T)` |
| Sonification / literal tones | −26 to −27 dBFS on their reference window | `pulse()` |
| Master | −16 LUFS, −1.5 dBTP, stereo | `master()` |

## SFX vocabulary

Cue every SFX from the same timeline value as the visual it belongs to.

| Call | When |
|---|---|
| `tick(t)` (2350 Hz, 0.12–0.16) | a code line runs |
| `tick(t, 2600 + 250·i, 0.08)` | argument card *i* lands |
| `tick(t, 2000, 0.09)` | a new view crossfades in |
| `tick(t, 3100, 0.05)` | a mark / label / bracket appears |
| `tick(t, 2400–2800, 0.06–0.07)` | a term of an equation / a row appears |
| `thump(t, 0.18–0.3)` | the key moment of a beat (≤ 1–2 per view); 0.45 on the payoff |
| `clack(t, 0.14–0.2)` | something latches: a value committed, a switch closing, a line dropping into place |
| `buzz(t, 0.07–0.09)` | a wrong idea rejected (✗ 1.65 V, out of clock) |
| `blip(t, 660, 990, 0.06–0.08)` | it worked: steady, done(), CPU free |

## When sound may carry pitch

Pitch is reserved for scenes where **sound is the subject** (the speaker scene), plus short deliberate literal demos (one real second of 1 kHz on "a thousand times a second"). Under narration that explains a visual, sonification is **clicks only**:

- Clicks are `pulse()` edges at the on-screen rate, phase-locked to what's drawn: `pulse()` restarts at phase 0 (= high) when a voice returns from `null`, so start the voice on the exact time the trace starts.
- When the visual speeds up until the blinks fuse, the clicks fade out with it — multiply the gain by `1 - fusion(apparentHz)` (`components/pwm.ts`) and return `null` when it's ~0. No sustained drone under VO.
- Leave each sonification layer `level()`-ed against a window where it's steady, then duck it 30 % under VO.

## Checking

`ffmpeg -hide_banner -ss A -to B -i out/<section>/<slug>-stems/<layer>.wav -af volumedetect -f null -` over the window in question: silence reads −91 dB. After any refactor of an audio script, compare `md5sum` of the stems before and after.
