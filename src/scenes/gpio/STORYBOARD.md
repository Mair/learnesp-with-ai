# GPIO — storyboard v2 (pure ESP-IDF, draft for approval)

> **Under-the-hood scene cut** (rule "teach driving, not the engine", `AGENTS.md`). The scene, its VO and its sound were removed; the video goes straight from the second knob to the payoff. Its storyboard rows and facts are kept below, marked *(cut)*, for reference only.

Slug `gpio` · composition `GPIO` · `out/gpio.mp4` · ~5½ min · every claim → `FACTS.md`.
**No Arduino**: `app_main`, ESP-IDF driver calls, `vTaskDelay(pdMS_TO_TICKS(ms))`.

The program used throughout (same calls as ESP-IDF's own `get-started/blink` example):

```c
#include "driver/gpio.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

#define LED GPIO_NUM_2

void app_main(void)
{
    gpio_reset_pin(LED);
    gpio_set_direction(LED, GPIO_MODE_OUTPUT);

    while (1) {
        gpio_set_level(LED, 1);
        vTaskDelay(pdMS_TO_TICKS(500));
        gpio_set_level(LED, 0);
        vTaskDelay(pdMS_TO_TICKS(500));
    }
}
```

## Arc

| # | Scene | Job | vs v1 |
|---|---|---|---|
| 1 | Problem | `gpio_set_level(LED, 1)` returns `ESP_OK`… and the LED stays dark | rewritten |
| 2 | Answer | make it an output, set its level → G·P·I·O | same |
| 3 | The circuit | pin → 220 Ω → LED → GND; Ohm's law; which pins; strapping | same |
| 4 | `gpio_reset_pin` | the pin number; a known state (GPIO, in/out off, pull-up on) | new (replaces half of pinMode) |
| 5 | `gpio_set_direction` | the output driver; OUTPUT is output-*only*; bad pin → `ESP_ERR_INVALID_ARG` / `ESP_ERROR_CHECK`; level first | new (replaces pinMode) |
| 6 | `gpio_set_level` | 1/0 → 3.3 V/0 V; guaranteed bands; any non-zero = high; returns at once | rewritten (was digitalWrite) |
| 7 | Blink | the whole `app_main`, real time | rewritten |
| 8 | `vTaskDelay(pdMS_TO_TICKS(500))` | ticks (100 Hz → 50 ticks), rounding down to 0, blocked = CPU free, no delay → watchdog + dimmer | rewritten (was delay) |
| 9 | Second knob: current | code = on/off, resistor = how much; signal, not supply | same |
| 10 | ~~Under the hood~~ *(cut)* | `gpio_set_level` → `gpio_ll_set_level` → `out_w1ts` → register; `gpio_set_direction`'s writes | Arduino layer removed |
| 11 | Payoff | "Make it an output. Set its level. That's GPIO." | recap updated |

## 1 · Problem

| VO | Visual |
|---|---|
| p1 "You've written a line of code, and on the breadboard there's an LED." | `main.c`: `app_main` with `gpio_set_level(LED, 1);` · breadboard LED, dark |
| p2 "But right after reset, every ESP32 pin is listening, not driving. So this call returns ESP_OK, and the LED stays dark." | pin card `GPIO 2 · listening`; line runs → green `ESP_OK` badge; LED stays dark; ✗ the LED stays dark |
| p3 "So how do you make a pin switch something on?" | caption |

## 4 · `gpio_reset_pin(LED);`

| VO | Visual |
|---|---|
| r1 "In app_main, start with gpio_reset_pin. It takes one thing: the pin." | call + card `pin · GPIO_NUM_2` |
| r2 "The pin is a GPIO number, GPIO_NUM_2, not the pin's position on the board. The ESP32 has thirty-four GPIOs, and twenty-eight of them can be outputs." | ✗ "the 2nd pin on the header" / ✓ "the label: IO2 · GPIO_NUM_2"; 34-cell strip, 34–39 struck |
| r3 "Reset puts it in a known state: a plain GPIO, input off, output off, and a weak pull-up, so it isn't left floating." | register-card rows lighting from the real source: function = GPIO · input off · output off · pull-up on (~45 kΩ) · pull-down off · interrupt off |

## 5 · `gpio_set_direction(LED, GPIO_MODE_OUTPUT);`

| VO | Visual |
|---|---|
| s1 "Then gpio_set_direction makes it an output. It takes two things: the pin, and the mode." | call + cards |
| s2 "GPIO_MODE_OUTPUT switches on the pin's output driver. Until now it was only listening. Now it can drive the wire high or low." | the pin diagram: output-enable closes; listening → driving |
| s3 "It's output only, though. The input is switched off, so gpio_get_level would always read zero. To read the pin back, use GPIO_MODE_INPUT_OUTPUT." | mode bits: OUTPUT = 0b010 (input ✗) vs INPUT_OUTPUT = 0b011; `gpio_get_level(LED) → 0` with the header's @warning quoted |
| s4 "Try it on a pin that can't drive, like thirty-four. It logs an error and returns ESP_ERR_INVALID_ARG. Put the call inside ESP_ERROR_CHECK, and that error stops the program instead of slipping by." | `gpio_set_direction(GPIO_NUM_34, GPIO_MODE_OUTPUT)` → `E (…) gpio: io_num=34 can only be input` → `ESP_ERR_INVALID_ARG (0x102)`; `ESP_ERROR_CHECK(…)` → `ESP_ERROR_CHECK failed: esp_err_t 0x102 (ESP_ERR_INVALID_ARG)` → abort |
| s5 "And the datasheet doesn't promise which level the pin starts at. If that matters, call gpio_set_level first. The level waits in its register, and the pin starts there the moment its output turns on." | GPIO_OUT bit 2 = `?` → `gpio_set_level(LED, 0)` before `gpio_set_direction` → bit = 0 → output on, starts LOW |

## 6 · `gpio_set_level(LED, 1);`

| VO | Visual |
|---|---|
| d1 "Then gpio_set_level sets the level. It takes two things: the pin, and the level: one for high, zero for low." | call + cards |
| d2 "One drives the pin to three point three volts, and the LED lights. Zero pulls it to zero volts, and it goes dark." | voltmeter + LED |
| d3 "The datasheet guarantees high is at least two point six four volts, and low is at most zero point three three. Those are the only two levels a digital output gives you." | the two green bands, nothing between |
| d4 "The level is a whole number, and any number that isn't zero counts as high." | `uint32_t level` · `if (level)` from gpio_ll.h · `gpio_set_level(LED, 7)` → HIGH |
| d5 "And it doesn't wait. gpio_set_level writes one register, returns ESP_OK, and the pin holds that level on its own until you write it again." | CPU lane + pin trace |

## 7 · Blink

| VO | Visual |
|---|---|
| b1 "Put it together and you get a blinking LED. In app_main, reset the pin and make it an output. Then, forever: high, wait half a second, low, wait half a second." | the whole `main.c`, lines lit; LED; scope; real time |
| b2 "On, off, about once a second, for as long as it has power." | 1 s period bracketed |

## 8 · `vTaskDelay(pdMS_TO_TICKS(500));`

Cards: `pdMS_TO_TICKS(500)` (ms → ticks) and `vTaskDelay` (blocks your task).

| VO | Visual |
|---|---|
| y1 "To wait, you ask FreeRTOS: vTaskDelay, with the time converted by pdMS_TO_TICKS." | call + cards |
| y2 "FreeRTOS counts time in ticks. By default there are a hundred a second, so one tick is ten milliseconds, and five hundred milliseconds is fifty ticks." | `CONFIG_FREERTOS_HZ = 100` → 1 tick = 10 ms; `500 × 100 ÷ 1000 = 50`; 50 ticks sweep in a real half second |
| y3 "The conversion rounds down. Ask for five milliseconds and you get zero ticks, and a delay of zero doesn't wait at all." | `5 × 100 ÷ 1000 = 0.5 → 0`; `vTaskDelay(0)` — "a delay time of zero just forces a reschedule" (tasks.c) |
| y4 "While your task waits, it's blocked. The CPU is free for other work, and the pin keeps its level. Nothing is holding it high. It's a bit in a register." | task lane (blocked) · CPU free · pin trace · GPIO_OUT bit 2 = 1 |
| y5 "Take the delays out, and the task watchdog complains after five seconds, because your loop never lets the idle task run." | delays struck; 5 s timer; `E (…) task_wdt: Task watchdog got triggered…` `IDLE0 (CPU 0)` |
| y6 "And the pin flips far too fast to see. The LED just looks dimmer. Hold that thought." | scope blurs; LED dims |

## 10 · Under the hood *(cut)*

| VO | Visual |
|---|---|
| i1 "So what does gpio_set_level really do? Let's follow it down." | `main.c`: `gpio_set_level(LED, 1);` |
| i2 "In the ESP-IDF driver, it checks that the pin can be an output, and passes it down to the hardware layer." | `gpio.c` `gpio_set_level` (real) |
| i3 "And at the bottom, it's one line. High writes a one to bit two of the set register. Low writes it to the clear register." | `gpio_ll.h`: `hw->out_w1ts = 1 << gpio_num;` / `out_w1tc` |
| i4 "Write-one-to-set means only your pin's bit changes. Every other pin stays exactly as it was." | W1TS @ 0x3FF44008 → GPIO_OUT bit 2 flips; TRM quote |
| i5 "gpio_set_direction, underneath, is a few writes like this one: route the plain GPIO output to the pin, and set its bit in the output-enable register." | `GPIO_FUNC2_OUT_SEL_CFG_REG ← 256` · `GPIO_ENABLE_W1TS_REG ← 1 << 2` |

## 11 · Payoff

"Make it an output. Set its level. That's GPIO." — recap: `gpio_reset_pin` → a known state · `gpio_set_direction` → output driver on · `gpio_set_level` → one bit, one register · `vTaskDelay(pdMS_TO_TICKS(ms))` → ticks, CPU free · HIGH or LOW → nothing in between → next: PWM.

Scenes 2, 3 and 9 (answer, circuit, current) are unchanged from v1.
