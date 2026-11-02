# Style: colour, type, shot types, layout

## Canvas

1920×1080 @ 30 fps. Every composition sits in `<Stage floor={false}>` (Backdrop + Grade, `src/Root.tsx`); every scene in `<Scene durationInFrames>` (`components/Type.tsx`), which handles the in/out transition. Dark violet backdrop, neon accents, glass panels.

## Colour carries meaning

Palette `C` in `src/theme/palette.ts`; `hexA(color, alpha)` for transparency; `GREEN = '#7dffb0'`, `RED = '#ff5470'` from `components/Explainer.tsx`. Keep each colour's meaning **across every video** — the learner reads colour before text.

| Colour | Means | PWM video uses |
|---|---|---|
| `C.cyan` | structure the hardware keeps: code, counters, clocks, steps, resolution, time axes | counter sawtooth, step ticks, code-line bar, resolution card |
| `C.magenta` | the signal on the wire and its timing: waveform, frequency, period, the peripheral | scope trace, frequency card, LEDC peripheral panel |
| `C.amber` | **your** number and its effect: the value you pass, the light, the strong highlight | duty line, LED, `your duty = 64`, strong marks |
| `C.pink` | pins | the pin card |
| `GREEN` | works · fits · done · CPU free | ✓ rows, `done()`, `CPU: FREE` |
| `RED` | wrong idea · overflow · rejected | ✗ 1.65 V, out of clock |
| `C.muted` / `C.ink` | secondary / primary text | |

For a new topic, map onto these meanings (ADC: input voltage = magenta signal; reference, steps and sample clock = cyan; the reading you get = amber).

## Type

- `FONT.sans` (Inter) for narration-like text; `FONT.mono` (JetBrains Mono) for code, numbers, axis labels, register names.
- `Kicker` — scene title, uppercase, spaced, top centre (`Setting up the pin · ledcAttach()`).
- Explainer call line: mono 50 px. Card value 36 px bold, card title 15 px mono uppercase. Caption 32 px (36 in CodeToHardware), bottom centre.
- Live numbers: `padStart(n, '\u2007')` so digits don't jitter; `tabular-nums` in HTML.
- `GRAD_TEXT` (cyan → white → magenta → amber) only for hero moments: P·W·M, `2⁸`, the payoff line.

## Shot types

| Shot | Component | Use for |
|---|---|---|
| **Explainer** | `Explainer` (`components/Explainer.tsx`) | one call: the line, one card per argument (leader lines, active cards lit), a stage of crossfading views — one view per idea. Pass `views: [{ at, component, active, label, accent, right }]`; each view gets `t` and draws in `VIEW_W × VIEW_H` (1544 × 510). |
| **CodeToHardware** | `CodeToHardware` | code on the left, the physical result (LED / speaker) on the right, scope underneath; `beats` with token `marks`; `timescale` for slow motion |
| **Scope** | `Scope` | a rolling square wave; the right edge is "now" |
| **Layer descent** | `UnderTheHood` pattern | real source quoted per layer (path in the panel header, "…" for trimmed lines), arrows labelled with the call, camera framing each new layer with its caller |
| **Marks** | `CodeLine` | underline a token and hang a short label under it, one per spoken word |
| Props | `Led`, `Speaker`, `Panel` | |

Diagram vocabulary that worked — reach for these first:
- **counter sawtooth + your value as a dashed amber line + the pin's square wave below**, with a playhead and a live LED / `pin ON` pill
- **one period zoomed** with a bracket and a ruler; **magnifier inset** for things too small to see (8 of 256 steps)
- **staircase** where a value is quantised (fade steps, 4-bit vs 8-bit bars) — the natural picture for ADC
- **✗ / ✓ side-by-side cards** for a misconception vs the truth
- **budget bars** against a limit line, overflow drawn in RED past the line
- **register card**: field · value · meaning, rows lighting on their spoken word
- **CPU lane**: your call as a short box, `loop()` boxes carrying on, the interrupt callback at the end

## Motion

- Every animation is a pure function of scene time `t` (`useCurrentFrame() / fps`); cues come from the timeline.
- Entrances: `ease((t - cue) / 0.4…0.6)` (house `EASE_OUT`), fading + rising 20–30 px. Glides between values 0.35 s smoothstep.
- Motion explains or it doesn't exist: no idle wobble on diagrams.
- Slow motion is always labelled with its honest factor in the panel's `right` slot: `slowed 2000×`, `slowed ~3× so you can watch it`, `real time`, `paused`. When playback is real time, say so.

## Layout rules

- **SVG text needs `fill`** — use `mono(size, color)`, which sets both `color` and `fill`; otherwise SVG text renders black.
- A label that would sit inside a plot where a line moves goes in a **legend** in the header row instead (dash sample + `your duty = 128`).
- Clamp playheads and markers to their axis (a looped fade holds at its end, not past it).
- Keep labels clear of brackets, ticks and moving lines; check stills at the extreme values (0, max, the longest number).
- Dense repeated rects: `shapeRendering="crispEdges"` (no seams). Thousands of ticks: low alpha, 1 px.
- Leave the bottom ~140 px for the caption; leave ~60 px top for the kicker.
- Cards: up to 4 per Explainer (480 px apart); longer argument lists need fewer words per card.
