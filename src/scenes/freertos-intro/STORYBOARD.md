# FreeRTOS intro: storyboard v1 (draft for approval)

- Slug `freertos-intro`, composition `FreeRTOSIntro`, output `out/2-freertos/freertos-intro.mp4`, about 2 min.
- **Section intro** (`SCRIPT.md`, "Section intro"). It follows `gpio-input` and comes before `freertos-tasks`.
- Every claim is sourced in `FACTS.md`.
- Hardware: the `Wroom` drawing with LED 1 on GPIO 2, LED 2 on GPIO 19 and the button on GPIO 18.

| # | Scene | Job |
|---|---|---|
| 1 | The want | two LEDs at two speeds plus a button, all at once; one loop makes them wait for each other |
| 2 | What it is | FreeRTOS: tasks, each its own loop; the scheduler shares the CPU; it's already running; two cores |
| 3 | The map | 14 videos in three groups: tasks and scheduling · tasks working together · tools |
| 4 | What you need | the board from Basic GPIO plus a second LED; the GPIO calls from that section |
| 5 | Go | "First up: tasks" |

## 1 · The want
| VO | Visual |
|---|---|
| w1 "One LED blinking fast, another blinking slow, and a button you can press at any moment." | the board: LED on GPIO 2 blinking fast, LED on GPIO 19 blinking slow, the button on GPIO 18. Three "wanted" lanes underneath |
| w2 "Each one is easy on its own. Put all three in one loop, and every delay holds up the others." | one `while (1)` loop with its four `vTaskDelay` lines; a playhead walks through it, and the actual lanes stretch: the fast LED stalls, and a press goes unseen |
| w3 "So how do you do several things at once?" | the stretched lanes dim |

## 2 · What it is
| VO | Visual |
|---|---|
| g1 "With FreeRTOS, a small operating system that comes built into ESP-IDF." | the hero word **FreeRTOS**, with a small `ESP-IDF` badge around it |
| g2 "You split your program into tasks. Each task is a loop of its own, with its own delays." | three task boxes: `fast LED`, `slow LED`, `button`, each with its own small loop |
| g3 "The scheduler shares the CPU between them. Whenever one task waits, another one runs." | a CPU lane: short coloured slices (fast · button · slow …) with idle gaps; each slice starts when another task begins to wait |
| g4 "It switches so fast that they all seem to run at once." | the lanes snap back to the wanted rates |
| g5 "And it's already running. Your app_main is itself a task." | startup chain: `ESP-IDF startup → FreeRTOS → task "main" → app_main()` |
| g6 "The ESP32 has two cores, so two tasks can even run at the very same moment." | the CPU lane splits into `CPU 0` and `CPU 1` |

## 3 · The map
Fourteen videos is too many for "one card each with its hardware result" (the intro arc), so the map shows **compact cards** (name + one-line promise) in three rows, lit row by row. Only the first card gets a hardware result (the two LEDs at their own rates).

| VO | Visual |
|---|---|
| m1 "This section builds it up one piece at a time." | 14 dimmed cards in three rows |
| m2 "First, tasks themselves: how the scheduler picks which one runs, keeping a steady beat, using both cores, and giving each task enough memory." | row 1 lights: **tasks** (own loop each) · **scheduler & priorities** (who runs first) · **delay-until** (a steady beat) · **two cores** (pin a task to a CPU) · **stacks & watchdog** (enough memory; the stuck-task alarm) |
| m3 "Then tasks working together: passing data, sharing safely, a trap called priority inversion, and ways to signal each other." | row 2 lights: **queues** (pass data) · **mutexes** (share one thing) · **priority inversion** (the trap) · **semaphores** (signal and count) · **task notifications** (the light signal) · **event groups** (wait for several things) |
| m4 "And the tools around them: timers, critical sections, and stats on where the CPU time goes." | row 3 lights: **timers** (run code later, or every N ms) · **critical sections** (lines nothing can interrupt) · **task stats** (who uses the CPU) |

## 4 · What you need
| VO | Visual |
|---|---|
| n1 "The same board as Basic GPIO, with a second LED and resistor, on GPIO nineteen." | the board; a second LED + 220 Ω drops in on GPIO 19 |
| n2 "And the calls from that section: set a pin's direction, write a level, read one." | three chips: `gpio_set_direction` · `gpio_set_level` · `gpio_get_level`, each with a tick and "Basic GPIO" |

## 5 · Go
| VO | Visual |
|---|---|
| z1 "First up: tasks." | the **tasks** card grows to fill the frame: "next: tasks → `freertos-tasks`" |
