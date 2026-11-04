# Basic GPIO intro: storyboard v1 (draft for approval)

- Slug `basic-gpio-intro`, composition `BasicGPIOIntro`, output `out/1-basic-gpio/basic-gpio-intro.mp4`, about 2 min.
- The first video of the course. A **section intro**: no call is pulled apart, and there are no argument cards (`SCRIPT.md`, "Section intro").
- Every claim is sourced in `FACTS.md`.
- Hardware picture: the `Wroom` board drawing from `gpio/board.tsx`, with the LED + 220 Ω on GPIO 2 and the button on GPIO 18 (the same as the section's videos).

| # | Scene | Job |
|---|---|---|
| 1 | The want | the board, a dark LED, a button: by the end, your code switches one and reads the other |
| 2 | What it is | pins → GPIO = general-purpose input/output; output = you set 3.3 V or 0 V; input = you read which; two levels |
| 3 | The map | two cards: GPIO output (blink) → GPIO input (button, count presses) |
| 4 | What you need | the parts on the bench, and ESP-IDF v6 on the computer |
| 5 | Go | "First up: GPIO output" |

## 1 · The want
| VO | Visual |
|---|---|
| w1 "Here's an ESP32 on a breadboard, with an LED and a button." | the board fades in; the LED (dark) and the button are wired to it; labels `LED` and `button` |
| w2 "By the end of this section, your code will switch that LED on and off, and read that button." | the LED blinks twice; the button is pressed, and a `1 → 0` chip pops beside it |
| w3 "So how does code reach the outside world?" | everything dims except the pins along the module's edge |

## 2 · What it is
| VO | Visual |
|---|---|
| g1 "Through its pins. Most of them are GPIO: general-purpose input and output." | the pins light up one after another; the hero word **GPIO** spells out as **G**eneral-**P**urpose **I**nput / **O**utput |
| g2 "General-purpose, because your code decides what each pin does." | one pin is picked out, with two switches beside it: `output` / `input` |
| g3 "Make one an output, and your code sets it high, 3.3 volts, or low, zero." | output side: pin → LED; a level chip toggles `1 · 3.3 V` / `0 · 0 V`, and the LED follows |
| g4 "Make it an input, and your code reads which of the two it sees." | input side: button → pin → code; pressing turns the chip from `1` to `0` |
| g5 "Two levels, nothing in between. That's what digital means." | the two levels as a square wave, with `3.3 V` and `0 V` rails and nothing between them |

## 3 · The map
| VO | Visual |
|---|---|
| m1 "This section has two videos." | two cards slide in, dimmed, with a numbered path between them |
| m2 "First, GPIO output. You set up a pin to drive an LED, then blink it." | card 1 lights: **GPIO output** · `gpio_set_direction` · `gpio_set_level` · a mini board with a blinking LED |
| m3 "Then GPIO input. Your code reads a button, lights the LED while it's held, and counts the presses." | card 2 lights: **GPIO input** · `gpio_set_pull_mode` · `gpio_get_level` · press → LED on, and a log `presses: 3` |

## 4 · What you need
| VO | Visual |
|---|---|
| n1 "On the bench: an ESP32 board, a USB cable, a breadboard and a few wires." | parts laid out one by one, each with a label |
| n2 "An LED, with a two hundred and twenty ohm resistor to go with it, and a push button." | the LED, the resistor (red-red-brown-gold bands), the button |
| n3 "On your computer: ESP-IDF, version six, so you can build, flash and watch the log." | a terminal: `idf.py build`, `idf.py -p PORT flash monitor` |
| n4 "This is the first section, so that's all you need." | a checklist ticks: board · LED + 220 Ω · button · ESP-IDF v6 |

## 5 · Go
| VO | Visual |
|---|---|
| z1 "First up: GPIO output." | the card for GPIO output grows to fill the frame: "next: GPIO output → `gpio`" |
