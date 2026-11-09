> **Narration pass:** VO revised to `SCRIPT.md` "Sound like a teacher, not a list" ("Let's say you
> want to dim a light…"; "Second knob." / "Sixty-four: on a quarter…" style fragments became whole
> sentences); the two driver error logs are real QEMU output (`lab/`). As built: 7:42 (461.5 s).

# PWM: storyboard v2 (pure ESP-IDF rewrite, draft for approval)

- Slug `pwm`, composition `PWM`, output `out/3-advanced-gpio/pwm.mp4`. Rendered length 7:36 (v1 was 4:25): two set-up calls replace `ledcAttach`, and the fade is now three calls.
- **Rewrite of v1**, which used Arduino (`ledcAttach` / `ledcWrite` / `ledcFade` / `ledcWriteTone`). The visual patterns stay: the counter, the duty line, the staircase, the fade engine, CodeToHardware. The API is ESP-IDF LEDC throughout.
- Every claim is sourced in `FACTS.md` (ESP-IDF tag **`v6.0.2`**, ESP32 TRM ch. 28).
- **Course position: first video of section 3, Advanced GPIO** (decided), after Basic GPIO and the FreeRTOS series. Everything those taught is fair game: `app_main`, `vTaskDelay`, tasks, "your task waits, the CPU is free", `ESP_ERROR_CHECK`, structs (`blink_t` in `freertos-tasks`). New here: filling a struct in by field name (`.freq_hz = 1000`), explained once in c2b.
- **Teach driving, not the engine** (`AGENTS.md`): no under-the-hood scene, no registers, HAL or driver source on screen. Internals live in `FACTS.md` only; the VO says what the learner sees and what to do.
- LED on GPIO 2 (as in `gpio`), speaker on GPIO 4.

The program (the same calls as ESP-IDF's `ledc_basic` example). In v6, `driver/ledc.h` no longer includes `driver/gpio.h`, so `GPIO_NUM_2` needs its own include:

```c
#include "driver/gpio.h"
#include "driver/ledc.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

#define LED GPIO_NUM_2

void app_main(void)
{
    ledc_timer_config_t timer = {
        .speed_mode      = LEDC_LOW_SPEED_MODE,
        .timer_num       = LEDC_TIMER_0,
        .freq_hz         = 1000,
        .duty_resolution = LEDC_TIMER_8_BIT,
        .clk_cfg         = LEDC_AUTO_CLK,
    };
    ESP_ERROR_CHECK(ledc_timer_config(&timer));

    ledc_channel_config_t channel = {
        .speed_mode = LEDC_LOW_SPEED_MODE,
        .channel    = LEDC_CHANNEL_0,
        .timer_sel  = LEDC_TIMER_0,
        .gpio_num   = LED,
        .duty       = 0,
        .hpoint     = 0,
    };
    ESP_ERROR_CHECK(ledc_channel_config(&channel));

    ledc_set_duty(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0, 128);
    ledc_update_duty(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0);
}
```

The fade adds `ESP_ERROR_CHECK(ledc_fade_func_install(0));` after the channel config, then:

```c
    ledc_set_fade_with_time(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0, 0, 2800);
    ledc_fade_start(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0, LEDC_FADE_WAIT_DONE);
```

**Full names everywhere** (decided): no `#define` shorthand for the speed mode or channel, so every line is exactly what the ESP-IDF docs show. The lines get long, so the value that matters in each call (the duty `128`, the target `0`, the time `2800`, the frequency `440`) is **highlighted** in amber every time it appears, and long calls wrap one argument per line in the Explainer shot so the text stays large.

## Arc

| # | Scene | Job | vs v1 |
|---|---|---|---|
| 1 | Problem | dim a light / change a pitch, but a pin is 3.3 V or 0 V | same |
| 2 | Answer | switch it fast → P·W·M | same |
| 3 | Setup (context) | the whole `app_main`: a **timer** (how fast, how fine) + a **channel** (timer → pin), then two lines for brightness | **new** |
| 4 | `ledc_timer_config` | speed mode · timer 0 of 4 · 1000 Hz → 1 ms period · flicker · 8 bits → 256 steps of 3.9 µs · more bits smoother · the limit: counts per second must fit the 80 MHz clock; 17 bits → `ESP_FAIL` (the trap, in three lines) | replaces `ledcAttach` |
| 5 | `ledc_channel_config` | channel 0 of 8 · `timer_sel` (shared timer = shared frequency) · `gpio_num`: the driver connects it, no `gpio_set_direction`; pin 34 → `ESP_ERR_INVALID_ARG` · duty = where it turns off (the line) · hpoint = where it turns on · starts at 0 = off | **new** |
| 6 | `ledc_set_duty` + `ledc_update_duty` | not a voltage · 128 = half · 0 = never · **256** (not 255) = always · 10 bits → 0…1024, half = 512 · range unchecked · set = load, update = go, at the next period · both return at once | replaces `ledcWrite`; the 255/256 edge flips |
| 7 | Demo: knob 1 | real LED, slowed 500×: 128 / 64 / 230, then the fade | code updated |
| 8 | Fade | `ledc_fade_func_install` (once; forget it → `ESP_FAIL`) · `ledc_set_fade_with_time`: **no "from"**, starts at the current 230 · ramp · staircase 2800 ÷ 230 → 12 → **2.76 s** (header: "up to 2x") · the hardware does the stepping · `ledc_fade_start` WAIT_DONE → your task waits, CPU free · NO_WAIT returns, but the next duty change waits | replaces `ledcFade` |
| 9 | Knob 2: frequency | speaker gets **its own timer** (frequency is per timer) · 10 bits, duty 512 = half at any pitch · `ledc_set_freq` 440 → 523 → 659 → 880 | replaces `ledcWriteTone` |
| 10 | Payoff | "That's PWM." + recap | recap updated; v1's under-the-hood scene is gone |

**Cut:** h5 (pin 34), w7 (range unchecked), f8 (the 2x header quote, folded into f7). Kept: t2 (speed mode) and f12 (NO_WAIT). Their facts stay in FACTS.md.

## 3 · Setup (context)

Shot: the whole `main.c` (above), with the diagram building to its right.

| VO | Visual |
|---|---|
| c1 "In ESP-IDF, the LED controller, LEDC, makes the pulses for you. You set it up with two calls." | `main.c`; both config blocks glow; the title chip `LEDC · LED PWM controller` |
| c2 "A timer, which sets how fast and how fine." | timer block lit → diagram: a `TIMER 0` box with a counter |
| c2b "Each setup call takes a struct: a bundle of settings, each one filled in by name. The ampersand hands the whole bundle to the call." | the `ledc_timer_config_t timer = { … }` block outlined as one box, each `.field = value` row ticking in; `&timer` highlighted in amber with an arrow into `ledc_timer_config(…)` |
| c3 "And a channel, which connects that timer to a pin." | channel block lit → `TIMER 0 → CH 0 → GPIO 2` |
| c4 "Then two more lines set the brightness." | `ledc_set_duty` / `ledc_update_duty` lit |
| c5 "Start with the timer." | everything else fades to 15 %; the timer block lifts into the Explainer (`codeIn`) |

## 4 · `ESP_ERROR_CHECK(ledc_timer_config(&timer));`

Cards (one per field): `speed_mode · LEDC_LOW_SPEED_MODE`, `timer_num · LEDC_TIMER_0`, `freq_hz · 1000 Hz · how fast`, `duty_resolution · 8 bits · how fine`, `clk_cfg · LEDC_AUTO_CLK · which clock`.

| VO | Visual |
|---|---|
| t1 "ledc_timer_config takes a struct, and five fields matter: the speed mode, which timer, the frequency, the resolution, and the clock." | the five cards land on their field names |
| t2 "For the speed mode, use low speed. Every ESP32 chip has it, and the timer and the channel must say the same thing." | `LOW SPEED · every chip` chip lit; `.speed_mode = LEDC_LOW_SPEED_MODE` in both structs linked |
| t3 "Each group has four timers. This is timer zero." | 4 timer boxes, `TIMER 0` lit |
| t4 "The frequency is how many complete on-off cycles happen every second. At a thousand hertz, each cycle lasts one millisecond. That window is called the period." | v1 freq view: scrolling wave, one cycle bracketed, `1000 Hz → 1 ms`, "period" |
| t5 "Frequency doesn't change the brightness. It only has to be fast enough that your eye can't see the flicker." | v1 flicker view |
| t6 "The resolution is eight bits. Inside, the timer is a counter that splits every period into two to the eighth, or two hundred and fifty-six, tiny steps." | v1 counter view: `2⁸ = 256` |
| t7 "Each step is about three point nine microseconds. It counts from zero up to two fifty-five, then starts again, a thousand times a second." | `1 ms ÷ 256 ≈ 3.9 µs`; sweep 0 … 255, wrap, speed up |
| t8 "More bits means finer steps, and smoother dimming." | v1 bits view |
| t9 "The counter needs a clock. Two hundred and fifty-six steps, a thousand times a second, is two hundred and fifty-six thousand counts every second." | `256 × 1000 = 256 000 counts/s` |
| t10 "LEDC_AUTO_CLK lets the driver pick the clock for you. The fastest it has runs at eighty megahertz, and your counts per second have to fit inside it." | one clock bar `80 MHz`; `0.26 M` is a sliver of it ✓ |
| t11 "Sixteen bits still fits. Seventeen bits is a hundred and thirty-one million counts a second, and that doesn't." | rows: `1000 Hz × 8 bits = 0.26 M ✓` · `× 16 = 65.5 M ✓` · `× 17 = 131 M ✗ (> 80 M)` |
| t12 "ledc_timer_config logs that it can't be done, and returns ESP_FAIL." | `E (…) ledc: requested frequency 1000 and duty resolution 17 can not be achieved, try reducing freq_hz or duty_resolution. div_param=0` → `ESP_FAIL` |
| t13 "Inside ESP_ERROR_CHECK, the program stops right there and tells you which line. Fewer bits, or a lower frequency, fixes it." | `ESP_ERROR_CHECK failed: esp_err_t 0xffffffff (ESP_FAIL)` + `expression: ledc_timer_config(&timer)` → abort; green fix: `LEDC_TIMER_8_BIT` |

## 5 · `ESP_ERROR_CHECK(ledc_channel_config(&channel));`

Cards: `speed_mode · LEDC_LOW_SPEED_MODE`, `channel · LEDC_CHANNEL_0`, `timer_sel · LEDC_TIMER_0`, `gpio_num · GPIO 2`, `duty · 0`, `hpoint · 0`.

| VO | Visual |
|---|---|
| h1 "Next, ledc_channel_config. Its struct says which channel, which timer it follows, which pin it drives, and where it starts." | cards land |
| h2 "Same speed mode as the timer. The group has eight channels, and this is channel zero." | 8 channel boxes, `CH 0` lit |
| h3 "timer_sel picks the counter this channel watches. Several channels can share one timer, but then they share its frequency and resolution." | `TIMER 0 → CH 0`; a ghost `CH 1` also hangs off `TIMER 0` with `same 1000 Hz · same 8 bits` |
| h4 "gpio_num is the pin: GPIO two. The driver connects the channel to it for you, so you don't call gpio_set_direction." | `CH 0 → GPIO 2`; a struck `gpio_set_direction(…)` |
| h5 "Give it an input-only pin, like thirty-four, and it returns ESP_ERR_INVALID_ARG." | `E (…) ledc: ledc_channel_config(844): gpio_num argument is invalid` → `ESP_ERR_INVALID_ARG` (a callback to `gpio`'s pin 34) |
| h6 "The duty is where the pin turns off. Think of it as a line across the counter. While the count is below the line, the pin is on. Once it passes the line, the pin is off." | v1 duty view: the counter, a line at 64, the trace on below / off above |
| h7 "hpoint is where it turns on. Zero means at the start of every period." | `hpoint` marker at count 0; TRM rule: `high at hpoint · low at hpoint + duty` |
| h8 "Here the duty starts at zero, so the pin is off. And the channel is running the moment this call returns." | line drops to 0; the trace goes flat; `ESP_OK` |

## 6 · `ledc_set_duty(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0, 128);` + `ledc_update_duty(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0);`

Explainer on the first call, then the second line joins.

| VO | Visual |
|---|---|
| w1 "To change the brightness takes two calls. First, ledc_set_duty. It takes the speed mode, the channel, and a number: the duty." | cards: `LEDC_LOW_SPEED_MODE` · `LEDC_CHANNEL_0` · `duty · 128` |
| w2 "The duty doesn't set a voltage. It sets how long the pin stays on in every period. It's the line across the counter from before." | ✗ `128 ≠ a voltage` / ✓ `128 = time on`; the counter + line at 128 |
| w3 "So one twenty-eight means on for the first one twenty-eight steps, then off for the other one twenty-eight. Half of every period, so half the light." | steps on / steps off bracketed; `128 of 256 = ½` |
| w4 "Zero means never on." | line at 0, trace flat low |
| w5 "And the top isn't two fifty-five. It's two fifty-six. The line sits past the last step, so the pin never turns off." | `255 → on 255 of 256 · 99.6 %` (one off-step visible) · `256 → 100 %` |
| w6 "The range comes from the resolution. Eight bits gives you zero to two fifty-six. Ten bits would give you zero to ten twenty-four, and the same half becomes five twelve." | `8 bits → 0 … 256` · `10 bits → 0 … 1024` · `128/256 = 512/1024` |
| w7 "ledc_set_duty doesn't check that range for you, so stay inside it." | `ledc_set_duty`: checks mode ✓ channel ✓ duty — |
| w8 "And on its own, it changes nothing. It only gets the number ready." | `128` waiting beside the counter; the pin trace still at the old duty |
| w9 "ledc_update_duty says go. The new duty takes effect at the start of the next period." | the second line joins; header quote "…don't take effect until the next PWM cycle"; the trace changes on the period boundary |
| w10 "Both calls return straight away. From then on, the hardware keeps the pin switching on its own." | CPU lane free; the pin keeps toggling |

## 7 · Demo: knob 1 (CodeToHardware, LED on GPIO 2)

| VO | Visual / code beat |
|---|---|
| d0 "Now on a real LED. A thousand hertz, eight bits." | timer struct, marks `1000 Hz`, `8 bits → duty 0 … 256` |
| d1 "Duty one twenty-eight: that's half. Slowed down five hundred times, it's fully on, then fully off." | `ledc_set_duty(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0, 128);` / `ledc_update_duty(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0);` · slowed 500× |
| d2 "At full speed, a thousand times a second, your eye just sees the average." | rate → 1× |
| d3 "Sixty-four: on a quarter of the time, a quarter of the light." | `… 64 …` |
| d4 "Two thirty: nearly all the time, nearly full brightness." | `… 230 …` |
| d5 "A fade slides it down for you. The pin never dims. It just spends less time on." | `ledc_set_fade_with_time(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0, 0, 2800);` / `ledc_fade_start(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0, LEDC_FADE_WAIT_DONE);` |

## 8 · Fade

Context first: `app_main` with `ESP_ERROR_CHECK(ledc_fade_func_install(0));` inserted after the channel config (marked on its spoken word), and the two fade lines at the end.

| VO | Visual |
|---|---|
| f1 "A fade takes three calls. Call this one once, when your program starts: ledc_fade_func_install. It switches fading on. Pass zero." | the install line pulled out; card `0 · the defaults` |
| f2 "Forget it, and the fade call logs, Fade service not installed, and returns ESP_FAIL." | `E (…) ledc: Fade service not installed, call ledc_fade_func_install` → `ESP_FAIL` |
| f3 "Then ledc_set_fade_with_time. It takes the speed mode, the channel, where to end, and how long to take, in milliseconds." | cards `LEDC_LOW_SPEED_MODE` · `LEDC_CHANNEL_0` · `target · 0` · `time · 2800 ms` |
| f4 "There's no start value. It fades from wherever the duty is now, and here, that's two thirty." | the duty now: `230` → arrow → `0` |
| f5 "The duty slides from two thirty down to zero in under three seconds. But at every moment, the pin is still only on or off. Near the start, each period is mostly on. Near the end, it's barely on at all." | v1 ramp view + snapshots |
| f6 "And the duty is a whole number, so the fade is really a staircase. Two point eight seconds at a thousand hertz is two thousand eight hundred periods. That's two thirty steps, so the duty drops by one every twelve periods." | v1 stairs view: `2800 ÷ 230` |
| f7 "Twelve, not twelve point one seven. It rounds down, so this fade really takes two point seven six seconds." | `12.17 → 12` · `230 × 12 = 2760 periods = 2.76 s` |
| f8 "ESP-IDF's header warns about this: the real time can be up to two times off." | quote from `ledc.h`: "could vary by a factor of up to 2x shorter or longer" |
| f9 "It hands those numbers to the LEDC hardware: count down, two thirty steps, one every twelve periods. The hardware does the stepping, not your code." | plain card: `count down` · `230 steps` · `every 12 periods` · `by 1` |
| f10 "Then ledc_fade_start says go." | the start line pulled out; cards `LEDC_LOW_SPEED_MODE` · `LEDC_CHANNEL_0` · `LEDC_FADE_WAIT_DONE` |
| f11 "With LEDC_FADE_WAIT_DONE, your task waits until the fade ends, then carries on. While it waits, the CPU is free." | task lane `waiting…` while the staircase runs (slowed) → `running` on the last step |
| f12 "Pass LEDC_FADE_NO_WAIT instead, and it returns at once. But on the ESP32, your next duty change waits until the fade is done." | the arg flips; task keeps running; a later `ledc_set_duty` sits `waiting…` until the stairs end |

## 9 · Knob 2: frequency (CodeToHardware, speaker on GPIO 4)

Preamble: a second timer + channel: `LEDC_TIMER_1`, 440 Hz, 10 bits → `LEDC_CHANNEL_1`, `GPIO_NUM_4`, duty 512.

| VO | Visual / code beat |
|---|---|
| n1 "Second knob. A speaker on GPIO four gets its own timer, because the frequency belongs to the timer, not the channel." | `TIMER 1 · 440 Hz · 10 bits → CH 1 → GPIO 4` beside `TIMER 0 → CH 0 → GPIO 2` |
| n2 "Ten bits, and a duty of five twelve. That's half, and it stays half at any frequency, because it's counted in steps." | `512 of 1024 = ½` |
| n3 "ledc_set_freq changes the frequency, and nothing else." | `ledc_set_freq(LEDC_LOW_SPEED_MODE, LEDC_TIMER_1, 440 / 523 / 659 / 880);` audible A4 C5 E5 A5; `880 = 2 × 440 → an octave up`; then `ledc_set_duty(…, 0)` + update → off |
| n4 "Pulse width sets brightness. Frequency sets pitch." | the two side by side |

## 10 · Payoff

"That's PWM." Recap:
- `ledc_timer_config` → frequency + resolution
- `ledc_channel_config` → pin + starting duty
- `ledc_set_duty` + `ledc_update_duty` → load, then go
- LEDC hardware → does the switching, and the fade
- next: let the pin tell you → `gpio-interrupts`

## Open questions

1. **Length**: about 8½–9 min as written, about 7½ min with the cuts. Cut, or keep everything?
