# PWM: facts (v2, pure ESP-IDF)

Every claim on screen or in the VO, with its source. **ESP-IDF tag `v6.0.2`**
(local checkout `~/.espressif/v6.0.2/esp-idf`), target **ESP32**. First drafted
against v5.5, then re-based on v6.0.2 (see "v6 changes" below); every line
number here is v6.0.2.
The ESP32 TRM (v5.x, `esp32_technical_reference_manual_en.pdf`) is cited as **TRM 28.x**.
v1 of this video used the Arduino core (`ledcAttach`, `ledcWrite`, `ledcFade`,
`ledcWriteTone`). Those facts are retired; nothing below cites arduino-esp32.

**Research only:** register names, HAL/LL calls and driver internals below keep the claims honest. They are not shown on screen or said in the VO ("teach driving, not the engine", `AGENTS.md`).

| Short | File |
|---|---|
| `ledc.c` | `components/esp_driver_ledc/src/ledc.c` |
| `ledc.h` | `components/esp_driver_ledc/include/driver/ledc.h` |
| `ledc_types.h` | `components/esp_hal_ledc/include/hal/ledc_types.h` |
| `ledc_ll.h` | `components/esp_hal_ledc/esp32/include/hal/ledc_ll.h` |
| `ledc_hal_iram.c` | `components/esp_hal_ledc/ledc_hal_iram.c` |
| `gpio_hal.c` | `components/esp_hal_gpio/gpio_hal.c` |
| `ledc_reg.h` | `components/soc/esp32/register/soc/ledc_reg.h` |
| `soc_caps.h` | `components/soc/<target>/include/soc/soc_caps.h` |
| `clk_tree_defs.h` | `components/soc/esp32/include/soc/clk_tree_defs.h` |
| `basic` | `examples/peripherals/ledc/ledc_basic/main/ledc_basic_example_main.c` |
| `fade` | `examples/peripherals/ledc/ledc_fade/main/ledc_fade_example_main.c` |

## The program

The same calls as ESP-IDF's `ledc_basic` example (`basic` l.35–80): a
timer config, a channel config, then `ledc_set_duty` + `ledc_update_duty`.
LED on GPIO 2: v6 `basic` uses it as its output pin too (`basic` l.17), and it's the pin from `gpio`. Speaker on GPIO 4, which
`fade` also uses on ESP32 (`fade` l.49).

## v6 changes that touch this video

| Change | Source |
|---|---|
| `driver/ledc.h` **no longer includes `driver/gpio.h`** (v5.5 did), so `GPIO_NUM_2` needs `#include "driver/gpio.h"` in the program | v6 `ledc.h` l.8–15 vs v5.5 l.12; `GPIO_NUM_2` lives in `esp_hal_gpio/esp32/include/soc/gpio_num.h` |
| `ledc_channel_config_t.intr_type` is **deprecated** ("no need to explicitly configure interrupt, handled in the driver"); v6 `basic` dropped it. Not shown | `ledc.h` l.40; `basic` l.49–58 |
| `ledc_channel_config_t` gained `deconfigure`; `ledc_isr_register` is deprecated; `ledc_timer_set` removed. None used | `ledc.h` l.48–51, l.338 |
| Pin routing now goes through `gpio_matrix_output` → `gpio_hal_matrix_out` | `ledc.c` l.831; `gpio_hal.c` l.60–69 |
| Divider, duty, update and fade logic: unchanged from v5.5 (same code, shifted lines) | diff of `ledc.c`, `ledc_ll.h` v5.5 → v6.0.2 |

## Problem / answer (unchanged from v1)

| Fact | Source |
|---|---|
| A **digital output** pin has two levels. Scoped to digital output on purpose: the original ESP32 has an 8-bit DAC on GPIO 25/26, but GPIO 2 has no DAC | ESP32 datasheet / TRM DAC chapter; `SOC_DAC_SUPPORTED` in esp32 `soc_caps.h` l.71 |
| The guaranteed bands are high ≥ 2.64 V and low ≤ 0.33 V | `gpio/FACTS.md` (datasheet) |

## The peripheral: LEDC

| Fact | Source |
|---|---|
| "The LED_PWM controller … can automatically increase or decrease the duty cycle gradually, allowing for fades without any processor interference" | TRM 28.1 |
| ESP32: 8 high-speed + 8 low-speed channels, 4 timers per group (16 channels in total) | TRM 28.1; esp32 `soc_caps.h` l.228–229 (`SOC_LEDC_TIMER_NUM 4`, `SOC_LEDC_CHANNEL_NUM 8`) |
| High-speed mode exists **only on ESP32**. S2/S3/C3/C6 have only low-speed mode, which is why `basic` uses `LEDC_LOW_SPEED_MODE` | `ledc.h` l.38, 58 ("high-speed mode (only exists on esp32) or low-speed mode"); `SOC_LEDC_SUPPORT_HS_MODE` defined only in esp32 `soc_caps.h` l.227 |
| **Trap:** on ESP32 `LEDC_HIGH_SPEED_MODE = 0`, so a struct that leaves `.speed_mode` out gets high-speed, not low-speed | `ledc_types.h` l.18–23 |
| Low-speed timers and channels only pick up a new divider, resolution, duty or hpoint when their `PARA_UP` bit is set. The driver sets it for you | TRM 28.2.2 ("…only when LEDC_LSTIMERx_PARA_UP is set"); TRM reg `LEDC_PARA_UP_LSCHn`; `ledc.c` `ledc_ls_timer_update`, `ledc_ls_channel_update` l.159–172 |
| Max resolution: 20 bits on ESP32 and C6, 14 on S2/S3/C3 | `SOC_LEDC_TIMER_BIT_WIDTH` in each `soc_caps.h` (esp32 l.230) |

## `ledc_timer_config(&timer)`: frequency and resolution

| Fact | Source |
|---|---|
| Fields: `speed_mode`, `duty_resolution`, `timer_num`, `freq_hz`, `clk_cfg` (+ `deconfigure`) | `ledc.h` l.57–74 |
| Returns `ESP_OK`, `ESP_ERR_INVALID_ARG` (parameter error), `ESP_FAIL` ("Can not find a proper pre-divider number base on the given frequency and the current duty_resolution") | `ledc.h` l.141–147 |
| `freq_hz == 0`, `duty_resolution == 0` or `≥ LEDC_TIMER_BIT_MAX` (21 on ESP32) → logs `freq_hz=… duty_resolution=…`, returns `ESP_ERR_INVALID_ARG` | `ledc.c` l.801–804; `ledc_types.h` l.111–133 |
| `LEDC_TIMER_8_BIT` = 8 (the enum value *is* the bit count) | `ledc_types.h` l.111–118 |
| Frequency = clock ÷ (divider × 2^bits). A timer is a counter that counts 0 … 2^bits − 1 and restarts; its cycle *is* the PWM period | TRM 28.2.2 (formula, "count up to … 2^DUTY_RES − 1, at which point the counter restarts") |
| **1000 Hz → period 1 ms. 8 bits → 2⁸ = 256 steps → 1 ms ÷ 256 ≈ 3.9 µs per step** | arithmetic |
| Divider is 10.8 fixed point: `div = ((clk << 8) + f·2^b/2) / (f·2^b)`; invalid if ≤ 255 (< 1.0) or > 0x3FFFF (≈ 1024) | `ledc.c` `ledc_calculate_divisor` l.468–497, `LEDC_IS_DIV_INVALID` l.114; `ledc_ll.h` l.23–24; TRM 28.2.2 ("division factor ranges from 1 ∼ 1023") |
| **So frequency × 2^bits must fit inside the clock** (divider ≥ 1) | same |
| `LEDC_AUTO_CLK` on ESP32 low-speed tries **REF_TICK (1 MHz) first**, then the global clocks **APB (80 MHz)**, then **RC_FAST (≈ 8 MHz)** | `ledc.c` `ledc_auto_clk_divisor` l.571–604, `ledc_auto_timer_specific_clk_divisor` l.529–569, `ledc_auto_global_clk_divisor` l.499–527; `ledc_ll.h` l.28–34 (`LEDC_LL_GLOBAL_CLOCKS {APB, RC_FAST}`, `TIMER_SPECIFIC {REF_TICK}`); `clk_tree_defs.h` l.142 (REF_TICK fixed 1 MHz) |
| 1000 Hz × 256 = **256 000 counts/s → fits the 1 MHz tick**: div = (256 000 000 + 128 000) / 256 000 = 1000 (= 3.906) → exactly 1000 Hz | arithmetic through `ledc_calculate_divisor` |
| 1000 Hz × 2¹⁶ = **65.5 M counts/s → only APB fits** (div 313 = 1.22; real 998.4 Hz) | same; TRM table 28.2-1 (APB, 1 kHz → highest 16 bits; REF_TICK, 1 kHz → 9 bits) |
| 1000 Hz × 2¹⁷ = **131 M counts/s → nothing fits** (APB div 156 < 256) → `ESP_FAIL` | same |
| The log line: `E (…) ledc: requested frequency 1000 and duty resolution 17 can not be achieved, try reducing freq_hz or duty_resolution. div_param=0` (0 = `LEDC_CLK_NOT_FOUND`, AUTO returns it when no clock fits) | `ledc.c` l.746, l.36, l.666–668 |
| `ESP_ERROR_CHECK` on `ESP_FAIL` prints `ESP_ERROR_CHECK failed: esp_err_t 0xffffffff (ESP_FAIL) at 0x…` + file/line/expression, then `abort()` (ESP_FAIL = −1, printed `%x`) | `esp_common/include/esp_err.h` l.23; `esp_system/esp_err.c` l.26–50 |
| Lower limit (not shown): divider ≤ 1023.99, so at 8 bits the slowest is 1 MHz ÷ (1024 × 256) ≈ 3.8 Hz | arithmetic |
| After a good config the timer is resumed and reset: it's counting when the call returns | `ledc.c` l.814–819 |

## `ledc_channel_config(&channel)`: pin, timer, starting duty

| Fact | Source |
|---|---|
| Fields: `gpio_num`, `speed_mode`, `channel`, `timer_sel`, `duty` ("range … [0, (2**duty_resolution)]"), `hpoint` ("[0, (2**duty_resolution)-1]"), `sleep_mode`, `flags.output_invert`, `deconfigure` (+ the deprecated `intr_type`) | `ledc.h` l.36–52 |
| Returns `ESP_OK` or `ESP_ERR_INVALID_ARG`. GPIO 34–39 (input-only) fail `GPIO_IS_VALID_OUTPUT_GPIO` → `E (…) ledc: ledc_channel_config(886): gpio_num argument is invalid` | `ledc.h` l.116–121; `ledc.c` l.32, l.886; esp32 `soc_caps.h` l.187; `esp_check.h` `ESP_RETURN_ON_FALSE` (`"%s(%d): "` prefix) |
| Fields left out of a designated initializer are zero (`flags`, `sleep_mode`, `deconfigure` = false) | C99 |
| It writes the duty + hpoint, calls `ledc_update_duty`, binds the channel to the timer, then routes the channel's signal to the pin through the GPIO matrix: `gpio_matrix_output` → `gpio_hal_matrix_out` selects the GPIO function, sets the output source and **enables the output**. **No `gpio_set_direction` needed** (`basic` has none) | `ledc.c` l.927–935, `_ledc_set_pin` l.823–836; `gpio_hal.c` l.60–69; `basic` l.49–59 |
| Warns `GPIO %d is not usable, maybe conflict with others` if the pin is already reserved | `ledc.c` l.825–830 |
| Several channels can use one timer; "if different channels use one timer, then frequency and bit_num of these channels will be the same" | `fade` l.118–121 |
| A channel compares the timer's count with two values: at `hpoint` the output goes **high**; at `hpoint + duty` it goes **low** | TRM 28.2.3 |
| So with hpoint 0: **on while the count is below the duty**. Duty 0 → never on. Duty 256 (8 bits) → the low point is never reached → always on | TRM 28.2.3 + `ledc.h` l.42 range `[0, 2**duty_resolution]` |
| ESP32 errata: at the *maximum* resolution (20 bits) 100 % (2^20) is not reachable. Doesn't affect 8 or 10 bits | `ledc.c` l.922–926; `basic` l.29–33 |

## `ledc_set_duty` + `ledc_update_duty`: load, then go

| Fact | Source |
|---|---|
| `ledc_set_duty(speed_mode, channel, duty)`: "only after calling ledc_update_duty will the duty update" | `ledc.h` l.265–283 |
| `ledc_update_duty`: "Call this function to activate the LEDC updated parameters. After ledc_set_duty, we need to call this function to update the settings. And the new LEDC parameters don't take effect until the next PWM cycle." | `ledc.h` l.150–169 |
| Duty range 0 … 2^bits: **8 bits → 0 … 256; 10 bits → 0 … 1024.** Half = 128 of 256 = 512 of 1024 | `ledc.h` l.42, l.277 |
| **255 is not "full" in ESP-IDF**: on for 255 of 256 steps = 99.6 %. 256 is fully on. (Arduino's `ledcWrite` bumped 255 → 256; ESP-IDF doesn't) | TRM 28.2.3 + range above |
| `ledc_set_duty` does **not** check the range (only mode, channel, initialised); `ledc_set_fade_with_time` and `ledc_set_duty_and_update` do (`target_duty <= max_duty` → `ESP_ERR_INVALID_ARG`) | `ledc.c` l.1101–1121 vs l.1489, l.1645 |
| `ledc_get_max_duty` = `1 << duty_resolution` = 256 at 8 bits | `ledc_ll.h` `ledc_ll_get_max_duty` l.327–330 |
| Not thread-safe across tasks; `ledc_set_duty_and_update` is the thread-safe one | `ledc.h` l.155–157 |
| Under the hood, `ledc_set_duty(…, 64)` writes `duty.duty = 64 << 4` (4 fractional bits) and sets conf1 to **increase, 1 step, every 1 period, by 0** — a plain duty change is a one-step "fade" of size zero | `ledc.c` `ledc_set_duty` l.1101–1121 → `ledc_duty_config` l.263–280; `ledc_ll.h` `ledc_ll_set_duty_int_part` l.386–389, `ledc_ll_set_fade_param` l.479–488 |
| `ledc_update_duty` → `sig_out_en = 1`, `duty_start = 1`, `low_speed_update = 1` (PARA_UP) | `ledc.c` `_ledc_update_duty` l.1021–1026; `ledc_ll.h` l.341–344, 501–522 |
| On ESP32 `ledc_ll_set_duty_start` first **waits until the previous `duty_start` has cleared** ("self-cleared when duty update or fade is done"). Two updates within one period → the second waits for the next period (≤ 1 ms at 1 kHz; inferred from the TRM "takes effect next cycle") | `ledc_ll.h` l.515–522; TRM reg `LEDC_DUTY_START` ("automatically cleared by hardware") |
| Registers: LSCH0 CONF0 0x3FF590A0, HPOINT …A4, DUTY …A8, CONF1 …AC | `ledc_reg.h` l.698–744; `reg_base.h` (`DR_REG_LEDC_BASE 0x3ff59000`) |
| The duty register's low 4 bits dither: "with a statistical chance of DUTY[3..0]/16, the actual PWM pulse will be one cycle longer" | TRM 28.2.3 |

## Fade: `ledc_fade_func_install` → `ledc_set_fade_with_time` → `ledc_fade_start`

| Fact | Source |
|---|---|
| `ledc_fade_func_install(int intr_alloc_flags)`: "This function will occupy interrupt of LEDC module". `0` = default flags (the driver ORs in `ESP_INTR_FLAG_IRAM`). Call it once; twice → `ESP_ERR_INVALID_STATE` "fade function already installed" | `ledc.h` l.469–480; `ledc.c` l.1580–1602 |
| Call it **after** a channel is configured (it looks up the configured speed mode; `fade` calls it after `ledc_channel_config`) | `ledc.c` l.1584–1590; `fade` l.185 vs l.189 |
| Forget it → `E (…) ledc: Fade service not installed, call ledc_fade_func_install` and `ledc_set_fade_with_time` returns `ESP_FAIL` | `ledc.c` l.1352–1357, l.1491, l.118 |
| `ledc_set_fade_with_time(mode, channel, target_duty, ms)` has **no "from"**: it fades from the **current duty** (read back from the hardware's duty register) to the target | `ledc.c` `_ledc_set_fade_with_time` l.1426–1431 (`ledc_hal_get_duty`); `ledc_ll.h` `ledc_ll_get_duty` l.401–404 (`duty_rd >> 4`) |
| total periods = ms × Hz ÷ 1000; if > Δduty: step size (scale) 1, periods per step = total ÷ Δ (integer) | `ledc.c` l.1438–1458 |
| **230 → 0 over 2800 ms at 1000 Hz: 2800 periods ÷ 230 steps = 12.17 → 12 → 230 × 12 = 2760 periods = 2.76 s** | arithmetic through the above; `ledc_get_freq` returns 1000 for this timer (l.1155–1176) |
| The header warns: "the actual time it takes to complete the fade could vary by a factor of up to 2x shorter or longer than the expected time due to internal rounding" | `ledc.h` l.448–457 |
| (Candidate, not scripted) 230 → 0 over 400 ms: 400 ÷ 230 = 1.74 → 1 → 230 ms, nearly half | arithmetic |
| The hardware: "every time the LEDC_DUTY_CYCLE cycles, the content of LEDC_DUTY_SCALE is added to or subtracted from LEDC_DUTY … the fade will only last [DUTY_NUM] … A finished fade also generates an interrupt." Fields `duty_inc` (0 = down), `duty_num` (230), `duty_cycle` (12), `duty_scale` (1), each 10 bits (max 1023) | TRM 28.2.3; `ledc_ll.h` l.479–488; `ledc_reg.h` l.764–778 (`0x3FF`) |
| `ledc_fade_start(mode, channel, fade_mode)` triggers it with `ledc_update_duty` (duty_start) after enabling the fade-end interrupt | `ledc.c` `_ledc_fade_start` l.1462–1483 |
| `LEDC_FADE_WAIT_DONE` "will block until fading to the target duty": the task takes the fade semaphore a second time and is **Blocked** until the driver's fade ISR gives it at the end | `ledc_types.h` l.136–140; `ledc.c` l.1477–1482, `_ledc_fade_hw_acquire` l.199–208 (`xSemaphoreTake(…, portMAX_DELAY)`), ISR l.1316 (`xSemaphoreGiveFromISR`) |
| `LEDC_FADE_NO_WAIT` "will return immediately". But on ESP32, "hardware does not support any duty change while a fade operation is running … Other duty operations will have to wait until the fade operation has finished": the next `ledc_set_duty` blocks on the same semaphore | `ledc_types.h` l.137; `ledc.h` l.272–273; `ledc.c` l.1107 |
| `ledc_fade_stop` doesn't exist on ESP32 (`SOC_LEDC_SUPPORT_FADE_STOP` is S2/S3/C3/C6 only) | `ledc.c` l.1526–1527; `soc_caps.h` per target |
| `ledc_cb_register(mode, ch, &cbs, arg)`: "The callbacks are all running under ISR environment"; warns if not in IRAM. `fade` gives a semaphore from it with `xSemaphoreGiveFromISR` and returns whether a task woke | `ledc.h` l.104–109 (l.105); `ledc.c` l.1619–1638; `fade` l.75–85 |
| Steps > 1023 (e.g. a 13-bit fade) are chained by the ISR in 1023-step runs; never needed at 8 bits | `ledc.c` l.1282, l.1397–1405 |

## Second knob: `ledc_set_freq`

| Fact | Source |
|---|---|
| Frequency belongs to the **timer**, so the speaker needs its own timer (LEDC_TIMER_1), not just its own channel | `ledc_set_freq(speed_mode, timer_num, freq_hz)` signature, `ledc.h` l.206–217; `fade` l.118–121 |
| `ledc_set_freq` keeps the timer's resolution and clock, recomputes only the divider | `ledc.c` l.1143–1153 |
| 10 bits, duty 512 of 1024 = half, set once. The duty is counted in steps, so it stays half at any frequency | `ledc.h` l.42; TRM 28.2.3 |
| 440 Hz × 1024 = 450 560 counts/s → REF_TICK; div 568 → **440.1 Hz**; 523 → 523.0; 659 → 659.6; 880 → 880.3 Hz | arithmetic through `ledc_calculate_divisor` |
| Trap kept off screen: `ledc_set_freq` keeps REF_TICK, so 1000 Hz at 10 bits (1.024 M > 1 MHz) would return `ESP_FAIL`; the notes stay ≤ 880 Hz. `ledc_set_freq(…, 0)` isn't checked and would divide by zero; the video turns the tone off with duty 0 | `ledc.c` l.1143–1153, l.639–662, l.494–496 |
| 880 = 2 × 440 → one octave up | music |

## Retired v1 facts (Arduino core, not used)
`ledcAttach` channel picking, `ledcWrite` 255 → 256 bump, `ledcFade(pin, from, to, ms)`,
`ledcFadeWithInterrupt`, `ledcWriteTone` (10 bits, 0x1FF). See git history (`938c24d`).
