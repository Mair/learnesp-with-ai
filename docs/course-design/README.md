# Course design

Planning docs for turning the `esp32-intro` prototype into a story-driven,
animation-rich course.

| Doc | What's in it |
|---|---|
| [`01-STORY.md`](01-STORY.md) | Why the current cut is a brochure. The one-device spine, the six-module arc, the per-episode shape, the rewritten trailer. |
| [`02-ANIMATION.md`](02-ANIMATION.md) | A named vocabulary of 12 shot types where motion *is* the explanation. Plus the live-action rig. |
| [`03-STACK.md`](03-STACK.md) | Remotion vs the current CSS pipeline, Blender for hero shots, Resolve for live action, voice and music and sound design. |
| [`04-VERTICAL-SLICE.md`](04-VERTICAL-SLICE.md) | A 75 s shot list to build first and prove the whole pipeline. |

## Prototype

[`../esp32-remotion/`](../esp32-remotion/) — working Remotion build.

- **`Story`** — 31 s animatic of shots 1–9 of `04-VERTICAL-SLICE.md`. A
  persistent room, a keyframed camera, and a match cut on the ESP32 that holds
  the chip in place while the world changes from finished lamp to bare
  breadboard. This is the storytelling grammar, working.
- `ColdOpen` — 1:1 port of `esp32-intro` scene 1 at visual parity.
- `FirstLight` — the `CodeToHardware` shot type.

**6.7× faster renders** on the same machine. See its README for the measured
comparison and how the match cut is built.

`out/story.mp4` · `out/story-preview.gif`

## The three decisions that unblock everything else

1. **Which spine device?** (`01-STORY.md`) — recommend the Listening Lamp.
2. **ESP32-S3 or classic ESP32?** On-device wake word and vision need the S3,
   which changes the kit price and the "~$3" claim.
3. **Do learners buy a kit?** A fixed BOM constrains every module and
   substantially raises completion rates.

## Shortest path to knowing if this works

Build the lamp → shoot it → cut `04-VERTICAL-SLICE.md` at scratch quality →
decide.
