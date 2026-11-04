# GPIO — facts and where they come from

**Pure ESP-IDF** (no Arduino). Sources: **ESP-IDF tag `v6.0.2`** (local checkout
`~/.espressif/v6.0.2/esp-idf`: driver, HAL/LL, FreeRTOS, Kconfig,
`examples/get-started/blink`), ESP32 Series Datasheet v5.3, ESP32 TRM v5.9, ESP-IDF
GPIO docs (`docs/en/api-reference/peripherals/gpio/esp32.inc`). Line numbers are v6.0.2.

**Re-checked v5.5 → v6.0.2:** every fact still holds. Only paths and lines moved.
v6 moved the HAL to `components/esp_hal_gpio/` (`gpio_ll.h`, `gpio_hal.h`,
`gpio_types.h`). `gpio_reset_pin` now also calls `esp_gpio_revoke` (it releases the
pin's reservation; nothing on screen depends on that). The matrix-default routing is now
the `gpio_hal_matrix_out_default` macro → `gpio_ll_set_output_signal_matrix_source`,
which writes the `func_sel` field = 256.

## The program

| Fact (as said or shown) | Source |
|---|---|
| Your code starts in `void app_main(void)`, called by the "main" task the startup code creates; if `app_main` returns, that task deletes itself (`vTaskDelete(NULL)`) | `components/freertos/app_startup.c` l.80–82, l.204–208 |
| Main task: priority `ESP_TASK_PRIO_MIN + 1` = **1**, pinned to **CPU 0** by default | `components/esp_system/include/esp_task.h` l.28, l.56–58; `esp_system/Kconfig` l.240–254 (`ESP_MAIN_TASK_AFFINITY_CPU0`) |
| Official blink example: `gpio_reset_pin(BLINK_GPIO);` then `gpio_set_direction(BLINK_GPIO, GPIO_MODE_OUTPUT);`, then `gpio_set_level` + `vTaskDelay` in `while (1)` inside `app_main` | `examples/get-started/blink/main/blink_example_main.c` l.72–85, l.91–104 |
| Headers: `driver/gpio.h`, `freertos/FreeRTOS.h`, `freertos/task.h` | blink example l.10–12 |

## The calls

| Fact | Source |
|---|---|
| `gpio_reset_pin(n)`: invalid GPIO → `ESP_ERR_INVALID_ARG`; else interrupt off, **pull-up on** (output-capable pins, "so the GPIO should not be floating"), pull-down off, **input off, output off**, IO MUX function = GPIO; returns `ESP_OK` | `components/esp_driver_gpio/src/gpio.c` `gpio_reset_pin` l.465–484 |
| `gpio_set_direction(n, mode)`: invalid GPIO → `ESP_ERR_INVALID_ARG`; output mode on an input-only pin → `ESP_LOGE("io_num=%d can only be input")` + `ESP_ERR_INVALID_ARG`; else input on/off, output on/off, open-drain on/off per mode bits | `gpio.c` l.318–348 |
| Mode bits: INPUT = bit 0, OUTPUT = bit 1, OD = bit 2. `GPIO_MODE_OUTPUT` = output only (**input off**); `GPIO_MODE_INPUT_OUTPUT` = both | `components/esp_hal_gpio/include/hal/gpio_types.h` l.102–114 |
| `gpio_get_level` "@warning If the pad is not configured for input (or input and output) the returned value is always 0" → with `GPIO_MODE_OUTPUT` you can't read your own pin back | `driver/gpio.h` l.135 |
| `gpio_set_level(n, level)`: not an output-capable GPIO → `ESP_ERR_INVALID_ARG` (logged by `GPIO_CHECK`); else writes the level and returns `ESP_OK`. **It does not enable the output**, so on a pin that was never made an output it returns `ESP_OK` and the pin doesn't drive | `gpio.c` l.248–253; `gpio_ll.h` l.491–506 (only `out_w1ts`/`out_w1tc`) |
| …which also means: set the level *before* `gpio_set_direction`, and the pin starts at that level the moment its output turns on | follows from the above |
| **Any non-zero `level` is HIGH**: `uint32_t level`; `if (level) out_w1ts … else out_w1tc` | `components/esp_hal_gpio/esp32/include/hal/gpio_ll.h` `gpio_ll_set_level` l.491–506 |
| Errors are `esp_err_t` (`ESP_OK` = 0, `ESP_ERR_INVALID_ARG` = 0x102). `ESP_ERROR_CHECK(x)` on failure prints `ESP_ERROR_CHECK failed: esp_err_t 0x102 (ESP_ERR_INVALID_ARG) at 0x…` + file/line/expression, then `abort()` | `esp_common/include/esp_err.h` l.22, 26, 115–121; `esp_system/esp_err.c` l.26–50 |
| Logs print by default: `LOG_DEFAULT_LEVEL` defaults to INFO, so `E (…) gpio: io_num=34 can only be input` appears | `components/log/Kconfig.level` l.3–5 |

## Waiting

| Fact | Source |
|---|---|
| `pdMS_TO_TICKS(ms)` = `(ms × configTICK_RATE_HZ) / 1000` — **integer division, rounds down** | `FreeRTOS-Kernel/include/freertos/projdefs.h` l.45–47 |
| `configTICK_RATE_HZ = CONFIG_FREERTOS_HZ`, **default 100** (range 1–1000) → 1 tick = 10 ms | `freertos/config/include/freertos/FreeRTOSConfig.h` l.92; `components/freertos/Kconfig` l.33–37 |
| → `pdMS_TO_TICKS(500)` = 500 × 100 / 1000 = **50 ticks**; `pdMS_TO_TICKS(5)` = 500 / 1000 = **0** | arithmetic on the above |
| `portTICK_PERIOD_MS` = 1000 / configTICK_RATE_HZ = 10 (the blink example's `CONFIG_BLINK_PERIOD / portTICK_PERIOD_MS` is the same idea) | `portable/xtensa/include/freertos/portmacro.h` l.106 |
| `vTaskDelay(n)`: n > 0 → the task goes on the delayed list (blocked) for n ticks; **n = 0 "just forces a reschedule"** — it doesn't wait | `FreeRTOS-Kernel/tasks.c` `vTaskDelay` (comment "A delay time of zero just forces a reschedule") |
| While blocked, the scheduler runs other ready tasks — or the idle task | FreeRTOS scheduling; `tasks.c` |
| No delay at all: the main task (prio 1, CPU 0) never blocks → IDLE0 (prio 0) never runs → the Task Watchdog (on by default, 5 s, watches IDLE0 and IDLE1, panic off) prints `E (…) task_wdt: Task watchdog got triggered. The following tasks/users did not reset the watchdog in time:` … `IDLE0 (CPU 0)` — and the program keeps running | `esp_system/Kconfig` l.295–355 (`ESP_TASK_WDT_EN/INIT` y, `TIMEOUT_S` 5, `CHECK_IDLE_TASK_CPU0/1` y, `PANIC` n); `esp_system/task_wdt/task_wdt.c` l.790–791 |
| The pin toggling with no delay is far too fast to see → the LED looks dimmer (persistence of vision) | physics — **not yet verified on hardware** |

## What `gpio_set_direction(…, GPIO_MODE_OUTPUT)` does to the hardware *(cut: the under-the-hood scene was removed; kept for reference)*

| Fact | Source |
|---|---|
| `gpio_output_enable`: ① route "simple GPIO output" through the GPIO matrix (`SIG_GPIO_OUT_IDX` = 256 → `GPIO_FUNC2_OUT_SEL_CFG_REG` for pin 2), ② set the pin's bit in the output-enable register, ③ IO MUX function → GPIO | `gpio.c` l.225–232; `gpio_hal.h` `gpio_hal_matrix_out_default` l.195 → `gpio_ll.h` `gpio_ll_set_output_signal_matrix_source` l.744–748, `gpio_ll_output_enable` l.390–397, `gpio_ll_func_sel` l.478–481; `soc/esp32/include/soc/gpio_sig_map.h` l.399 |
| Output enable = `hw->enable_w1ts = 1 << pin` → `GPIO_ENABLE_W1TS_REG` @ `0x3FF44024` | `gpio_ll.h` l.393; TRM v5.9 GPIO register summary |

## What `gpio_set_level` does to the hardware *(cut: the under-the-hood scene was removed; kept for reference)*

| Fact | Source |
|---|---|
| `gpio_set_level` → `gpio_hal_set_level` → `gpio_ll_set_level`: HIGH: `hw->out_w1ts = 1 << pin` → `GPIO_OUT_W1TS_REG` @ `0x3FF44008`; LOW: `out_w1tc` → `GPIO_OUT_W1TC_REG` @ `0x3FF4400C` (pins 32–39 use `out1_w1ts/tc`) | `gpio.c` l.248–253; `gpio_ll.h` l.491–506; TRM v5.9 register summary |
| W1TS: "For every bit that is 1 in the value written here, the corresponding bit in GPIO_OUT_REG will be set." → one write touches only that pin's bit | TRM v5.9 Register 6.2 |
| The pin then holds that level with no further CPU work, until written again | `gpio_ll_set_level` is a single store into a latch register |
| `GPIO_OUT_REG` reset value is **x (undefined)** in the TRM | TRM v5.9 Register 6.1 |

## Pins

| Fact | Source |
|---|---|
| **ESP32-WROOM-32E module: 38 pins (+ GND pad 39).** Pin numbers are positions on the module; names are GPIOs. Left 1–14: GND, 3V3, EN, SENSOR_VP (GPIO36), SENSOR_VN (GPIO39), IO34, IO35, IO32, IO33, IO25, IO26, IO27, IO14, IO12. Bottom 15–24: GND, IO13, NC ×6 (17–22), IO15, **IO2 = pin 24**. Right 25–38 (bottom → top): IO0, IO4, IO16, IO17, IO5, IO18, IO19, NC, IO21, RXD0 (GPIO3), TXD0 (GPIO1), IO22, IO23, GND | ESP32-WROOM-32E/32UE datasheet v2.1, Figure 3 (Pin Layout, top view) + Table 3 (Pin Definitions) |
| Pins 17–22 are NC: "GPIO6 to GPIO11 … are connected to the SPI flash integrated on the module and are not led out" | WROOM-32E datasheet v2.1, Table 3 note 2 |
| Boot log before your code: `I (…) main_task: Calling app_main()` | `app_startup.c` l.138 (`MAIN_TAG = "main_task"`), l.204 |
| 220 Ω through-hole resistor colour code: red (2) · red (2) · brown (×10) · gold (±5 %) | IEC 60062 resistor colour code |
| ESP32 has 34 GPIOs: 0–19, 21–23, 25–27, 32–39 | IDF docs `gpio/esp32.inc` l.12 |
| GPIO 34–39: input only, no software pull-up/pull-down | `esp32.inc` l.200; `soc_caps.h` l.187 (`SOC_GPIO_VALID_OUTPUT_GPIO_MASK` excludes 34–39) → 28 can be outputs |
| GPIO 6–11 (and 16–17 on PSRAM modules) are wired to the module's flash/PSRAM: don't use | `esp32.inc` l.198 |
| GPIO 1 / 3 = U0TXD / U0RXD: flashing and the serial console | `esp32.inc` l.201 ("TXD & RXD are usually used for flashing and debugging") |
| Strapping pins: 0, 2, 5, 12, 15 — sampled at reset, free as normal IO afterwards | `esp32.inc` l.197; datasheet §3 |
| GPIO 2 default at reset: pull-down (0). Download mode needs GPIO0 = 0 and GPIO2 = 0. An LED + resistor **to ground** on GPIO 2 keeps it low → doesn't block flashing | datasheet v5.3 Table 3-1, Table 3-3 |
| "During reset, all pins are output-disabled" → every pin starts listening, not driving | datasheet v5.3, IO_MUX notes ("At Reset") |
| Espressif's ESP32-DevKitC has only a 5 V power LED. Many third-party boards put an LED on GPIO 2 — board-specific, check yours | DevKitC user guide (docs.espressif.com/projects/esp-dev-kits, "5V Power On LED"); third-party claim **not** from an Espressif source |

## Electrical

| Fact | Source |
|---|---|
| VOH ≥ 0.8 × VDD = **2.64 V**; VOL ≤ 0.1 × VDD = **0.33 V** (VDD = 3.3 V) | datasheet v5.3 Table 5-3 (DC characteristics) |
| Drive strength: 0 ≈ 5 mA, 1 ≈ 10 mA, **2 ≈ 20 mA (default)**, 3 ≈ 40 mA | datasheet v5.3, notes on pin list ("The default value is 2"); `gpio_types.h` l.135–139 (`GPIO_DRIVE_CAP_DEFAULT = 2`) |
| Max source ≈ 40 mA per pin at drive 3 (VOH ≥ 2.64 V), falling to ≈ 29 mA as more pins source at once; sink ≈ 28 mA | datasheet v5.3 Table 5-3 + notes 2 |
| Internal pull-up/down ≈ 45 kΩ (≈ 75 µA) | datasheet v5.3 Table 5-3; pin-list notes |
| Absolute max cumulative IO output current 1200 mA | datasheet v5.3 Table 5-1 |

## Circuit maths (physics, not Espressif)

| Fact | Basis |
|---|---|
| Red LED forward voltage ≈ 2.0 V (typical; varies 1.8–2.2 V by part — **check the kit's LED datasheet**) | typical LED datasheet value — UNVERIFIED for our kit |
| 220 Ω: (3.3 − 2.0) / 220 ≈ **5.9 mA**; 1 kΩ: 1.3 / 1000 = **1.3 mA**; 330 Ω ≈ 3.9 mA | Ohm's law |
| Without a resistor nothing limits the current except the pin's driver → asks for more than the ~20 mA default drive; voltage sags, pin and LED stressed | follows from drive strength above; don't put a number on "what happens" |
