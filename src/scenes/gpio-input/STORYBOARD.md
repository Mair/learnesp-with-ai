# GPIO input — storyboard v1 (as built)

> **Course order change:** `pwm` now sits between `gpio` and this video, so "last time" no longer means the GPIO output video. r1 and s4 were reworded to not depend on it, and the payoff's "next:" now points to the FreeRTOS section.

> **Under-the-hood scene cut** (rule "teach driving, not the engine", `AGENTS.md`). The scene, its VO and its sound were removed; the video goes straight from the second knob to the payoff. Its storyboard rows and facts are kept below, marked *(cut)*, for reference only.

Slug `gpio-input` · composition `GPIOInput` · `out/gpio-input.mp4` · ~6 min · every claim → `FACTS.md`.
Sequel to the `gpio` (output) video: same board, same LED on GPIO 2, same visual language.
**No Arduino**: `app_main`, ESP-IDF driver calls, `vTaskDelay(pdMS_TO_TICKS(ms))`.

The program used throughout:

```c
#include <stdbool.h>
#include "driver/gpio.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

#define LED    GPIO_NUM_2
#define BUTTON GPIO_NUM_18

void app_main(void)
{
    gpio_reset_pin(LED);
    gpio_set_direction(LED, GPIO_MODE_OUTPUT);

    gpio_reset_pin(BUTTON);
    gpio_set_direction(BUTTON, GPIO_MODE_INPUT);
    gpio_set_pull_mode(BUTTON, GPIO_PULLUP_ONLY);

    while (1) {
        bool pressed = (gpio_get_level(BUTTON) == 0);
        gpio_set_level(LED, pressed);
        vTaskDelay(pdMS_TO_TICKS(10));
    }
}
```

Scene 9 extends the loop to count presses (edge + `ESP_LOGI`).

## Arc

| # | Scene | Job |
|---|---|---|
| 1 | Problem | a button wired pin → GND reads fine when pressed… and garbage when released: the pin floats |
| 2 | Answer | a weak resistor holds it high; the button, stronger, pulls it low → **PULL-UP** lands |
| 3 | The circuit | button between GPIO 18 and GND, no external resistor; why GPIO 18; thresholds |
| 4 | `gpio_reset_pin(BUTTON)` | callback: known state — but **input off**, so it can't be read yet |
| 5 | `gpio_set_direction(BUTTON, GPIO_MODE_INPUT)` | input buffer on, driver off; forget it → reads 0 → "pressed" forever |
| 6 | `gpio_set_pull_mode(BUTTON, GPIO_PULLUP_ONLY)` | four modes; 45 kΩ / ~75 µA; GPIO 34–39 have none — and the call still returns ESP_OK |
| 7 | `gpio_get_level(BUTTON)` | 0 or 1, an `int` not an `esp_err_t`; a snapshot; active low → `== 0` |
| 8 | Demo: button → LED | the whole program, real time; reads 100×/s; ≤ 10 ms feels instant |
| 9 | Counting presses | level vs edge; bounce (Ganssle's numbers); polling every 10 ms is the debouncer |
| 10 | Second knob: pull-up vs pull-down | wiring + one word in code flips the logic; never both |
| 11 | ~~Under the hood~~ *(cut)* | `gpio_get_level` → `(hw->in >> 18) & 1` → GPIO_IN_REG; FUN_IE / FUN_WPU bits in IO_MUX_GPIO18_REG |
| 12 | Payoff | "Make it an input. Give it a pull. Read its level." → next: FreeRTOS |

## 1 · Problem

| VO | Visual |
|---|---|
| p1 "Last time, the ESP32 drove an LED. Now let's go the other way, and let it listen to a button." | output video's board + LED; a push-button drops onto the breadboard |
| p2 "Wire the button from a pin to ground. Press it, and the pin is tied to zero volts. The program reads zero." | button closes → pin trace 0 V → `gpio_get_level → 0` ✓ |
| p3 "But let go, and the pin is connected to nothing at all. It floats. It might read one, it might read zero, and it can change on its own." | button opens → pin trace wanders in the grey band between thresholds; read sequence `1 0 1 1 0 0 1…` flickers; ✗ released = ? |
| p4 "So how do you give a pin a level when nothing is driving it?" | caption |

## 2 · Answer

| VO | Visual |
|---|---|
| a1 "Give it a gentle default. A resistor to three point three volts holds the pin high, as long as nothing else is in charge." | resistor to 3V3 fades in; trace snaps to 3.3 V; reads `1 1 1 1` |
| a2 "Press the button, and its short path to ground wins easily. The pin drops to zero." | button closes; current arrow through resistor; trace 0 V; reads `0 0 0` |
| a3 "Released is one. Pressed is zero. That resistor is called a pull-up." | `released → 1 · pressed → 0`; **PULL-UP** lands letter by letter |

## 3 · The circuit

| VO | Visual |
|---|---|
| c1 "On the breadboard, one leg of the button goes to GPIO eighteen, and the other to ground. No resistor needed: the ESP32 has the pull-up built in." | breadboard: IO18 (module pin 30) → button → GND; dotted internal 45 kΩ inside the chip outline |
| c2 "Why eighteen? It isn't a strapping pin, it isn't wired to the flash, and it has an internal pull-up. GPIO thirty-four to thirty-nine don't have one." | 34-cell strip: 18 ✓; strapping 0 2 5 12 15 amber; 6–11 struck; 34–39 marked "no pull" |
| c3 "The datasheet guarantees a one above two point four seven five volts, and a zero below zero point eight two five. In between, it promises nothing. That's where a floating pin lives." | vertical voltage axis: green HIGH band ≥ 2.475 V, green LOW band ≤ 0.825 V, grey "undefined" middle; the p3 floating trace replays inside the grey |

## 4 · `gpio_reset_pin(BUTTON);`

| VO | Visual |
|---|---|
| r1 "In app_main, start the same way as for an output: gpio_reset_pin, with the button's pin." | call + card `pin · GPIO_NUM_18` |
| r2 "It puts the pin in a known state: a plain GPIO, output off, and, for saving power, a weak pull-up. But the input is off too." | register-card rows from the source: function = GPIO ✓ · output off ✓ · pull-up on ✓ · **input off** (red) |
| r3 "So right now, the pin can't be read at all." | `gpio_get_level(BUTTON) → 0`, whatever the button does |

## 5 · `gpio_set_direction(BUTTON, GPIO_MODE_INPUT);`

| VO | Visual |
|---|---|
| s1 "gpio_set_direction makes it an input. Two things: the pin, and the mode." | call + cards |
| s2 "GPIO_MODE_INPUT switches on the pin's input buffer, and leaves its output driver off. The pin only listens." | pin diagram (output video's, mirrored): input buffer gate closes, output driver greyed; mode bits `0b001` |
| s3 "Forget this line, and gpio_get_level always returns zero. With a button to ground, zero means pressed, so your program sees the button held down forever." | header @warning quoted; button released but reads `0 0 0 …` → "pressed" ✗ |
| s4 "Input mode works on every GPIO, even thirty-four to thirty-nine. The pin thirty-four error you've seen was only for outputs." | `gpio_set_direction(GPIO_NUM_34, GPIO_MODE_INPUT) → ESP_OK` ✓ (vs struck OUTPUT) |

## 6 · `gpio_set_pull_mode(BUTTON, GPIO_PULLUP_ONLY);`

| VO | Visual |
|---|---|
| u1 "Then gpio_set_pull_mode chooses the pin's default level. Two things again: the pin, and the pull." | call + cards |
| u2 "There are four pulls: up only, down only, both, or floating. GPIO_PULLUP_ONLY connects the internal resistor to three point three volts, and disconnects the one to ground." | four-option card; pin diagram: WPU switch closes, WPD opens |
| u3 "It's about forty-five kilo-ohms. When you press the button, about seventy-three microamps flow through it. Tiny, and harmless." | `3.3 V ÷ 45 kΩ ≈ 73 µA` (datasheet: ~75 µA) |
| u4 "gpio_reset_pin had already turned it on, but only as a power-saving side effect. Say it in your code, so the next reader knows the button needs it." | reset row "pull-up on" ↔ this line, linked |
| u5 "On GPIO thirty-four, there's no resistor to connect. The call logs an error, then returns ESP_OK anyway, so ESP_ERROR_CHECK won't catch it. Those pins need a resistor on the board." | `gpio_set_pull_mode(GPIO_NUM_34, …)` → `E (…) gpio: gpio_pullup_en(85): GPIO number error (input-only pad has no internal PU)` → `ESP_OK` (amber "!"); external 10 kΩ sketch |

## 7 · `gpio_get_level(BUTTON)`

| VO | Visual |
|---|---|
| g1 "Now read it. gpio_get_level takes the pin, and returns its level: one or zero." | call + card; return badge `int · 0 or 1` |
| g2 "Notice what it returns: a plain int, not an esp_err_t. There's no error to check, so don't wrap it in ESP_ERROR_CHECK. A one would look like a failure." | `ESP_ERROR_CHECK(gpio_get_level(BUTTON))` struck; `1 ≠ ESP_OK → abort` |
| g3 "It's a snapshot: the level at the moment you ask. It doesn't wait for a press, and it doesn't remember one." | pin trace with a short press; a single read tick before/after it → both `1`; the press slips between |
| g4 "And with a pull-up, pressed is zero. So compare with zero to get the answer you mean." | `bool pressed = (gpio_get_level(BUTTON) == 0);` with `0 → true`, `1 → false` |

## 8 · Demo: button → LED

| VO | Visual |
|---|---|
| d1 "Put it together. Set up the LED and the button, then forever: read the button, copy it to the LED, and wait one tick." | full `main.c`, lines lit; button + LED; pin traces for GPIO 18 and GPIO 2; real time |
| d2 "Ten milliseconds is one tick, the shortest wait there is. So the loop reads the button about a hundred times a second, and the CPU is free in between." | `pdMS_TO_TICKS(10) = 1 tick`; read ticks along the GPIO 18 trace, 10 ms apart; task lane blocked between |
| d3 "Press, and the LED follows within ten milliseconds. Jack Ganssle found fifty milliseconds already feels instant." | press → LED on; latency bracket ≤ 10 ms vs 50 ms "feels instant" |

## 9 · Counting presses

Loop becomes:

```c
int last = 1, presses = 0;
while (1) {
    int level = gpio_get_level(BUTTON);
    if (last == 1 && level == 0) {
        presses++;
        ESP_LOGI(TAG, "presses: %d", presses);
    }
    last = level;
    vTaskDelay(pdMS_TO_TICKS(10));
}
```

| VO | Visual |
|---|---|
| e1 "Now count presses. Counting zeros doesn't work: hold the button for one second, and that's a hundred zeros." | hold 1 s → counter races to 100 ✗ |
| e2 "A press is a change: one, then zero. Remember the last level, and count only when it falls." | the trace's falling edge highlighted; `last == 1 && level == 0`; counter 1 ✓; log `I (5230) button: presses: 1` |
| e3 "But zoom in on that edge. A real switch bounces. The metal contacts hit, spring apart, and hit again." | zoom µs-scale: trace chatters 0/1 several times before settling |
| e4 "In Jack Ganssle's tests, most switches bounced for about one and a half milliseconds, and the worst of them for six." | `average ≈ 1.6 ms · max 6.2 ms` (16 switches) |
| e5 "Read the pin a million times a second, and one press counts as five. Read it every ten milliseconds, and at most one read lands inside the bounce. One press, one count." | two read-grids over the same bounce: fast grid → counter 5 ✗; 10 ms grid → old · (either) · new → 1 ✓ |
| e6 "That one-tick wait is your debouncer. The ESP32 has no hardware filter for this, so it's your code's job. Most switches settle in well under ten milliseconds, but a bad one can bounce for longer." | "no glitch filter on ESP32" chip note; Ganssle "most under 10 ms"; footnote: one switch bounced 157 ms |

## 10 · Second knob: pull-up vs pull-down

| VO | Visual |
|---|---|
| k1 "You can also flip it. Wire the button to three point three volts instead, and choose GPIO_PULLDOWN_ONLY." | split screen: left pull-up/button-to-GND, right pull-down/button-to-3V3 |
| k2 "Now released is zero, and pressed is one. Same resistor, same tiny current, opposite logic." | truth tables side by side: `released 1 / pressed 0` vs `released 0 / pressed 1`; `== 0` vs `== 1` |
| k3 "Just never turn on both. Two equal resistors split the voltage in half, about one point six five volts, right in the zone the datasheet doesn't promise." | `GPIO_PULLUP_PULLDOWN`: 45 k / 45 k divider → 1.65 V dot in the grey band (callback to c3) |

## 11 · Under the hood *(cut)*

| VO | Visual |
|---|---|
| i1 "So what does gpio_get_level really do? Follow it down." | `main.c` line |
| i2 "In the driver, there's no checking at all. It goes straight to the hardware layer." | `gpio.c` `gpio_get_level` (3 real lines) |
| i3 "And at the bottom, one line: read the input register, shift right by the pin number, and keep one bit." | `gpio_ll.h`: `return (hw->in >> gpio_num) & 0x1;` |
| i4 "That register holds the level of all thirty-two lower pins at once. Bit eighteen is your button." | GPIO_IN_REG @ 0x3FF4403C, 32 cells live; bit 18 flips with the press; TRM quote "Each bit represents a pin input value" |
| i5 "The setup calls each flip a bit in the pin's own IO MUX register: bit nine turns the input on, bit eight connects the pull-up." | IO_MUX_GPIO18_REG @ 0x3FF49070: FUN_IE (9) ← set_direction, FUN_WPU (8) ← set_pull_mode, FUN_WPD (7) = 0 |

## 12 · Payoff

"Make it an input. Give it a pull. Read its level. That's a GPIO input." — recap: `gpio_set_direction(…, GPIO_MODE_INPUT)` → input buffer on · `gpio_set_pull_mode` → a default level (45 kΩ) · `gpio_get_level` → one bit, a snapshot · read every tick → presses counted, bounce ignored → next: interrupts (let the pin tell you).

## Decisions (taken when producing)

1. **Pin:** GPIO 18 (non-RTC pad: its pull-up is one IO_MUX bit).
2. **Scope:** polling + software debounce only; interrupts are the next video.
3. **`gpio_config`:** deferred to the interrupts video (where `intr_type` makes it natural).
