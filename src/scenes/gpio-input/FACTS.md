# GPIO input — facts and where they come from

**Pure ESP-IDF** (no Arduino). Sources: **ESP-IDF tag `v6.0.2`** (local checkout
`~/.espressif/v6.0.2/esp-idf`: driver, HAL/LL,
soc register headers, docs, `examples/peripherals/gpio/generic_gpio`), ESP32
Series Datasheet v5.3, ESP32 TRM v5.9, Jack Ganssle *A Guide to Debouncing*
(rev 3, June 2008, hosted at my.eng.utah.edu/~cs5780/debouncing.pdf).
Line numbers are v6.0.2.

**Re-checked v5.5 → v6.0.2:** every fact still holds. What moved: the HAL is now in
`components/esp_hal_gpio/`; `gpio_pullup_en`'s check is on **line 88** (v5.5: 85), so
its log line reads `gpio_pullup_en(88): …`, and the on-screen line was updated; the ESP32
RTC-pull condition is now `GPIO_RTCIO_ARE_INDEPENDENT` (0 on ESP32, `gpio.c` l.36–42)
instead of `SOC_GPIO_SUPPORT_RTC_INDEPENDENT`. Fixed while re-checking: the
`gpio_dump_io_configuration` sample in the docs shows `FuncSel: 1`, but on ESP32
`PIN_FUNC_GPIO` = 2, so pin 18 prints `FuncSel: 2 (GPIO)`.
Facts already proven in `src/scenes/gpio/FACTS.md` (output video) are referenced, not repeated.


## Lab: the log lines on screen are real (v3, narration pass)

`lab/main/main.c`, ESP-IDF v6.0.2 (target `esp32`, defaults), Espressif QEMU
`esp_develop_9.2.2_20250817`. Raw logs: `lab/logs/`. QEMU has no button: variant 2 scripts one
press (down 2000–2100 ms after the scheduler started).

- v1, `gpio_set_pull_mode(GPIO_NUM_34, GPIO_PULLUP_ONLY)`, return value printed:
  `E (1583) gpio: gpio_pullup_en(88): GPIO number error (input-only pad has no internal PU)` /
  `I (1583) lab: gpio_set_pull_mode returned ESP_OK` → logs an error, returns ESP_OK anyway.
- v2, the count loop with one simulated press: `I (5085) button: presses: 1`.

## The program

```c
#define LED    GPIO_NUM_2
#define BUTTON GPIO_NUM_18
```

| Fact | Source |
|---|---|
| Espressif's own input example configures inputs "pulled up" (`pull_up_en = 1`, `GPIO_MODE_INPUT`) and reads them with `gpio_get_level` | `examples/peripherals/gpio/generic_gpio/main/gpio_example_main.c` l.23–24, l.97–100, l.70 |
| **Why GPIO 18 for the button:** output-capable (so it has internal pulls), not a strapping pin, not flash/PSRAM, not UART, not JTAG, **not an RTC pad** (so its pull-up lives in its plain IO_MUX register — no RTC detour under the hood). The docs list no special function for it | `gpio/esp32.inc` l.115–118 (GPIO18 row: no ADC, no RTC, no comment), l.197–201 |
| GPIO 18 = **pin 30** on the ESP32-WROOM-32E module | WROOM-32E datasheet v2.1 Table 3 (see output FACTS "Pins") |
| On ESP32, pads with an RTC function (0, 2, 4, 12–15, 25–27, 32–39) get their pulls through the RTC IO registers instead (`rtc_gpio_pullup_en`) | `gpio.c` l.90–100 (`!rtc_gpio_is_valid_gpio(n) \|\| GPIO_RTCIO_ARE_INDEPENDENT`, the latter 0 on ESP32 per `gpio.c` l.38–39); `esp32.inc` RTC_GPIO column |

## Floating and the pull-up (the problem and the answer)

| Fact | Source |
|---|---|
| Input thresholds: **VIH ≥ 0.75 × VDD = 2.475 V**, **VIL ≤ 0.25 × VDD = 0.825 V** (VDD = 3.3 V). Between 0.825 V and 2.475 V the datasheet promises nothing | datasheet v5.3 Table 5-3 |
| Input leakage **IIH / IIL ≤ 50 nA**; pin capacitance **2 pF** → an unconnected input is held by almost nothing: it can read 0 or 1 and change on its own ("floating") | datasheet v5.3 Table 5-3; "floating" behaviour is physics — **not an Espressif quote** |
| Internal pull-up **RPU ≈ 45 kΩ** (typ.), pull-down **RPD ≈ 45 kΩ**; their drive is "**~75 µA**" | datasheet v5.3 Table 5-3; pin-list note 8 ("The drive strength of the internal pull-up (wpu) and pull-down (wpd) is ~75 µA") |
| Button pressed with pull-up: pin tied to GND through the switch (≈ 0 Ω) → **0 V**; current through the pull-up 3.3 V / 45 kΩ ≈ **73 µA** (≈ the datasheet's ~75 µA) | Ohm's law on the above |
| Button released: pin = 3.3 V − (≤ 50 nA × 45 kΩ) = 3.3 V − ≤ 2.25 mV ≈ **3.3 V** → well above 2.475 V → reads 1 | Ohm's law on the above |
| "Weak": 45 kΩ vs a closed switch's ≈ 0 Ω — the button always wins; the resistor only sets the level when nothing else does | follows from the above |
| TRM names the bits **FUN_WPU / FUN_WPD** ("internal **weak** pull-up / pull-down resistor") | TRM v5.9 §6 (IO_MUX pad list, "WPU: internal weak pull-up resistor"); Register IO_MUX_x_REG field descriptions |
| Classic ESP32 has **no hardware glitch filter and no input hysteresis control** in ESP-IDF (`SOC_GPIO_SUPPORT_PIN_GLITCH_FILTER`, `SOC_GPIO_FLEX_GLITCH_FILTER_NUM`, `SOC_GPIO_SUPPORT_PIN_HYS_FILTER` are not defined for esp32); the GPIO docs' "Glitch Filter" / "Hysteresis" sections are excluded for ESP32 | `soc/esp32/include/soc/soc_caps.h` + `Kconfig.soc_caps.in` (grep: absent); `gpio.rst` l.108–145 (`.. only::` blocks) → debouncing is your code's job |

## `gpio_reset_pin(BUTTON)` (callback to the output video)

| Fact | Source |
|---|---|
| Reset: interrupt off, **pull-up on** (output-capable pins; comment "for powersave reasons, the GPIO should not be floating"), pull-down off, **input off**, output off, function = GPIO | `gpio.c` l.465–484 |
| → after `gpio_reset_pin` alone, the pin **can't be read**: input is off, so `gpio_get_level` returns 0 | `gpio.c` l.474 (`gpio_input_disable`); `driver/gpio.h` l.135 (@warning) |

## `gpio_set_direction(BUTTON, GPIO_MODE_INPUT)`

| Fact | Source |
|---|---|
| `GPIO_MODE_INPUT` = `GPIO_MODE_DEF_INPUT` = BIT0 = **0b001** ("input only") | `components/esp_hal_gpio/include/hal/gpio_types.h` l.103, l.110 |
| INPUT → `gpio_input_enable` (sets **FUN_IE**), and because bit 1 is clear → `gpio_output_disable` (driver off), OD off | `gpio.c` l.318–348 (`gpio_set_direction`), l.202–223 |
| `gpio_input_enable` → `gpio_ll_input_enable` → `PIN_INPUT_ENABLE(reg)` = `SET_PERI_REG_MASK(reg, FUN_IE)`; **FUN_IE = bit 9** | `esp_hal_gpio/esp32/include/hal/gpio_ll.h` l.362–365; `soc/esp32/register/soc/io_mux_reg.h` l.53, l.79 |
| TRM: the input value "can be read at any time … However, it is necessary to enable the input in the IO MUX by setting the FUN_IE bit" | TRM v5.9 §6.2.3 Simple GPIO Input |
| `gpio_get_level` "@warning If the pad is not configured for input (or input and output) the returned value is always 0" → **forget `gpio_set_direction` and an active-low button reads "pressed" forever** | `driver/gpio.h` l.135 + active-low logic below |
| GPIO 34–39 **can** be inputs (input-only); `gpio_set_direction(34, GPIO_MODE_INPUT)` is fine (the error is only for output modes) | `gpio.c` l.322–325 (`mode & GPIO_MODE_DEF_OUTPUT`) |

## `gpio_set_pull_mode(BUTTON, GPIO_PULLUP_ONLY)`

| Fact | Source |
|---|---|
| Four modes: `GPIO_PULLUP_ONLY` (0), `GPIO_PULLDOWN_ONLY` (1), `GPIO_PULLUP_PULLDOWN` (2), `GPIO_FLOATING` (3) | `gpio_types.h` l.127–132 |
| "This function always overwrite the current pull-up/pull-down configurations" — PULLUP_ONLY = `gpio_pulldown_dis` + `gpio_pullup_en` | `driver/gpio.h` l.177; `gpio.c` l.282–316 |
| ESP32 note: "Only pins that support both input & output have integrated pull-up and pull-down resistors. Input-only GPIOs 34-39 do not." | `driver/gpio.h` l.178; `esp32.inc` l.200; TRM FUN_WPU description ("their FUN_WPU is always 0") |
| **Surprise:** `gpio_set_pull_mode(GPIO_NUM_34, GPIO_PULLUP_ONLY)`: passes its own check (`GPIO_IS_VALID_GPIO`), calls `gpio_pullup_en(34)`, which logs `E (…) gpio: gpio_pullup_en(88): GPIO number error (input-only pad has no internal PU)` and returns `ESP_ERR_INVALID_ARG` — **but `gpio_set_pull_mode` ignores that return and returns `ESP_OK`**. `ESP_ERROR_CHECK` would not catch it → GPIO 34–39 need an external resistor | `gpio.c` l.88 (check + message), l.282–316 (return values of `gpio_pullup_en` etc. discarded, `ret` stays `ESP_OK`); log format `"%s(%d): " format` with `__FUNCTION__`, `__LINE__` from `esp_common/include/esp_check.h` `ESP_RETURN_ON_FALSE` (l.168 / l.191) |
| `gpio_reset_pin` already turned the pull-up on — but as a power-saving side effect; `gpio_set_pull_mode` states it in your code | `gpio.c` l.469–471 (comment) |
| Pull-up hardware for GPIO 18: `gpio_ll_pullup_en` → `REG_SET_BIT(GPIO_PIN_MUX_REG[18], FUN_PU)`; `GPIO_PIN_MUX_REG[18]` = `IO_MUX_GPIO18_REG` = `DR_REG_IO_MUX_BASE + 0x70` = **0x3FF49070**; **FUN_PU = bit 8**, FUN_PD = bit 7 | `gpio_ll.h` l.77–80, l.112–115; `soc/esp32/gpio_periph.c` l.30; `io_mux_reg.h` l.43–51, l.249–250; `reg_base.h` l.25 |

## `gpio_get_level(BUTTON)`

| Fact | Source |
|---|---|
| Signature `int gpio_get_level(gpio_num_t gpio_num)` — returns **0 or 1**, an `int`, **not an `esp_err_t`** → no error to check; don't wrap it in `ESP_ERROR_CHECK` (a 1 would abort as "error 0x1") | `driver/gpio.h` l.133–144; `gpio.c` l.255–258 (no `GPIO_CHECK`); `esp_err.h` (`ESP_ERROR_CHECK` aborts on any value ≠ `ESP_OK`) |
| `gpio_get_level` → `gpio_hal_get_level` → `gpio_ll_get_level`: `return (hw->in >> gpio_num) & 0x1;` (GPIO 32–39 use `in1`) | `gpio.c` l.255–258; `gpio_hal.h` l.239; `gpio_ll.h` l.521–527 |
| `hw->in` = **GPIO_IN_REG @ 0x3FF4403C**, read-only, "GPIO0-31 input value. Each bit represents a pin input value, 1 for high level and 0 for low level"; GPIO_IN1_REG @ 0x3FF44040 = GPIO 32–39 | `soc/esp32/register/soc/gpio_reg.h` l.130, l.138; TRM v5.9 Register 6.14 / 6.15, register summary |
| One read of GPIO_IN_REG captures **all 32 pins at once**; `>> 18 & 1` keeps pin 18 | `gpio_ll.h` l.524 |
| It is a **snapshot**: the level at the instant of the read. It doesn't wait for a press and doesn't remember one | single register load, `gpio_ll.h` l.524 |
| With a pull-up and a button to GND: **pressed = 0, released = 1** ("active low") → `bool pressed = (gpio_get_level(BUTTON) == 0);` | circuit above |

## Polling, edges and bounce

| Fact | Source |
|---|---|
| `pdMS_TO_TICKS(10)` = 10 × 100 / 1000 = **1 tick** = the shortest non-zero wait at the default 100 Hz | output FACTS "Waiting" (`projdefs.h` l.45–47, `CONFIG_FREERTOS_HZ` = 100) |
| A `while (1)` loop with `vTaskDelay(1)` wakes once per tick → reads the pin about **100 times a second**, ~10 ms apart; the task is blocked (CPU free) in between | `tasks.c` `vTaskDelay`; output FACTS |
| Worst-case reaction ≈ 10 ms. Ganssle: "a 100 msec delay is quite noticeable … 50 msec, though, seemed instantaneous" | Ganssle §"how fast is fast enough", pdf l.665–673 |
| **Level vs edge:** reading the level tells you "held down", not "pressed once". Holding for 1 s at 100 reads/s = 100 reads of 0. Counting presses = remembering the last level and counting the **1 → 0 change** (falling edge; ESP-IDF's name: `GPIO_INTR_NEGEDGE`, "falling edge") | arithmetic; `gpio_types.h` l.83 |
| **Bounce:** Ganssle tested 18 switches. Excluding two, "the other 16 switches exhibited an average **1557 µsec** of bouncing, with … a max of **6200 µsec**." One switch bounced **157 ms** on opening; another took **11.3 ms** to close once. "Most switches seem to exhibit under **10 msec** bounce rates." | Ganssle pdf l.118–129, l.855–858 |
| Some bounces last "less than **1 µsec**" | Ganssle pdf l.132–134 |
| Ganssle's recommendation: "a debounce period in the **20 to 50 msec** range" | Ganssle pdf l.858–859 |
| **Sampling slower than the bounce debounces:** if samples are T apart and the bounce lasts < T, at most one sample lands inside it → the readings go old … (old or new) … new → **exactly one** change counted. A switch bouncing longer than T (like Ganssle's 157 ms one) can still double-count | derived from the above (logic, not a quote) |
| Reading in a tight loop with no delay would see every bounce — and starve the idle task → task watchdog after 5 s | output FACTS "Waiting" (task_wdt) |
| Log line format `I (<ms since boot>) <tag>: <message>`, e.g. `I (5230) button: presses: 1`; timestamp default = RTOS ms | `log/include/esp_log.h` l.194–198 (`LOG_FORMAT`, `esp_log_timestamp()`); `log/Kconfig.format` l.26–28 |

## Second knob: pull-up vs pull-down

| Fact | Source |
|---|---|
| Button to **3.3 V** + `GPIO_PULLDOWN_ONLY`: released → pulled to 0 V → 0; pressed → 3.3 V → 1 ("active high"). Same 45 kΩ, same ~73 µA when pressed | `gpio_types.h` l.129; datasheet RPD 45 kΩ |
| Pull-up + button to GND is the arrangement in Espressif's example (`pull_up_en = 1`) | `gpio_example_main.c` l.22–24, l.97 |
| Never enable both on a button pin: `GPIO_PULLUP_PULLDOWN` = 45 k + 45 k divider ≈ 1.65 V when released → between VIL 0.825 V and VIH 2.475 V → undefined | datasheet thresholds + divider arithmetic |
| An external pull-up (e.g. 10 kΩ → 0.33 mA) is stronger: use it for long wires or GPIO 34–39 | Ohm's law; 34–39 fact above. "long wires" is general practice — **keep off-screen or soften** |

## `gpio_dump_io_configuration` (optional on-screen proof)

| Fact | Source |
|---|---|
| `gpio_dump_io_configuration(stdout, 1ULL << 18)` prints `IO[18] -` / `Pullup: 1, Pulldown: 0, DriveCap: 2` / `InputEn: 1, OutputEn: 0, OpenDrain: 0` / `FuncSel: 2 (GPIO)` / `GPIO Matrix SigOut ID: …` / `GPIO Matrix SigIn ID: (simple GPIO input)` / `SleepSelEn: …` | `gpio.c` l.1091–1138; `gpio.rst` l.47–80 (sample dump, from a chip where `PIN_FUNC_GPIO` = 1) |

## Other chips (context only — not claimed on screen)

| Fact | Source |
|---|---|
| ESP32-S3 / C3 define `SOC_GPIO_SUPPORT_PIN_GLITCH_FILTER` (filters pulses < 2 IO_MUX clock cycles — far too short for switch bounce); C6 / H2 / P4 also have 8 configurable "flex" glitch filters | `soc/<chip>/include/soc/soc_caps.h` (v6.0.2); `gpio.rst` l.113–125 |

## Under the hood (as shown) *(cut: the under-the-hood scene was removed; kept for reference)*

| Fact | Source |
|---|---|
| IO_MUX_GPIO18_REG fields: MCU_SEL bits 14–12 (`MCU_SEL_S` 12), FUN_DRV bits 11–10 (`FUN_DRV_S` 10, reset 2), FUN_IE bit 9, FUN_WPU (`FUN_PU`) bit 8, FUN_WPD (`FUN_PD`) bit 7 | `soc/esp32/register/soc/io_mux_reg.h` l.43–66; TRM v5.9 IO_MUX_x_REG figure |
| `PIN_FUNC_GPIO` = 2 on ESP32 → MCU_SEL = 2 after `gpio_reset_pin` | `io_mux_reg.h` l.85; `gpio.c` l.481 (`gpio_hal_func_sel(…, PIN_FUNC_GPIO)`) |
| The other 31 bits of GPIO_IN shown on screen are an arbitrary, dimmed pattern — illustration, not a claim | — |
| Bounce shape on screen is illustrative; its length (≈ 1.6 ms) matches Ganssle's average | Ganssle pdf l.128–129 |
| Demo press timing: the zoomed press lands 4 ms after a tick → the LED follows 6 ms later (computed by `demoRead` from the same schedule) | `timeline.ts` `DEMO.presses`, `demoRead` |
