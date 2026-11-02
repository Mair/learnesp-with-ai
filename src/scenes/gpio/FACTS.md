# GPIO — facts and where they come from

Sources: arduino-esp32 `master` (3.3), ESP-IDF `release/v5.5`, ESP32 Series
Datasheet v5.3, ESP32 TRM v5.9, ESP-IDF GPIO docs (`docs/en/api-reference/peripherals/gpio/esp32.inc`).
Raw files fetched and read. Line numbers are from the fetched files.

## The calls

| Fact (as said or shown) | Source |
|---|---|
| `pinMode(pin, mode)`: pin ≥ 40 (`SOC_GPIO_PIN_COUNT`) → logs `Invalid IO %u selected` and returns | `cores/esp32/esp32-hal-gpio.c` `__pinMode` (l.117–120); `soc/esp32/include/soc/soc_caps.h` l.175 |
| `pinMode` takes the pin back from whatever peripheral had it (`perimanClearPinBus` → that bus's deinit) before configuring it | `esp32-hal-gpio.c` l.122–128; `esp32-hal-periman.c` `perimanSetPinBus` (deinit of previous bus) |
| `pinMode` builds a `gpio_config_t` for that one pin (`1ULL << pin`), pull-up/down **off** unless the mode asks, and calls `gpio_config()` | `esp32-hal-gpio.c` l.133–155 |
| `OUTPUT` is `0x03` = input **and** output enabled ("so you can read the state of pin even when it is set as OUTPUT") → `GPIO_MODE_INPUT_OUTPUT` | `cores/esp32/esp32-hal-gpio.h` l.47–50; `hal/include/hal/gpio_types.h` l.92–103 |
| Other modes: `INPUT 0x01`, `INPUT_PULLUP 0x05`, `INPUT_PULLDOWN 0x09`, `OUTPUT_OPEN_DRAIN 0x13` | `esp32-hal-gpio.h` l.46–57 |
| `HIGH = 0x1`, `LOW = 0x0` | `esp32-hal-gpio.h` l.42–43 |
| `pinMode(34…39, OUTPUT)` fails: `gpio_config` rejects output on input-only pins (`GPIO can only be used as input mode`, `ESP_ERR_INVALID_ARG`) → `pinMode` logs `IO %u config failed` and returns | `esp_driver_gpio/src/gpio.c` `gpio_config` l.363–366; `esp32-hal-gpio.c` l.156–159 |
| `digitalWrite(pin, val)` **before** `pinMode`: logs `IO %u is not set as GPIO. Execute pinMode(%u, OUTPUT) first.` and does nothing | `esp32-hal-gpio.c` `__digitalWrite` l.182–186 |
| `digitalWrite` → `gpio_set_level(pin, val)` → `gpio_hal_set_level` → `gpio_ll_set_level` | `esp32-hal-gpio.c` l.183; `gpio.c` l.245–250; `hal/esp32/include/hal/gpio_ll.h` l.504 |
| **Any non-zero value is HIGH**: `if (level) out_w1ts … else out_w1tc` | `gpio_ll.h` `gpio_ll_set_level` l.506–518 |
| Surprise: `val` is a `uint8_t`, so `digitalWrite(pin, 256)` wraps to 0 → LOW | `esp32-hal-gpio.h` l.75 (`uint8_t val`) |
| `delay(ms)` = `vTaskDelay(ms / portTICK_PERIOD_MS)`; Arduino builds use `CONFIG_FREERTOS_HZ=1000` → 1 tick = 1 ms → `delay(500)` = 500 ticks. The task sleeps; the scheduler runs other tasks | `cores/esp32/esp32-hal-misc.c` l.212–214; `esp32-arduino-lib-builder/configs/defconfig.common` l.45 |
| Generic `esp32` variant (ESP32 Dev Module) defines **no** `LED_BUILTIN`, so we write `const int LED = 2;` | `variants/esp32/pins_arduino.h` (no `LED_BUILTIN`) |

## What `pinMode(…, OUTPUT)` does to the hardware (ESP-IDF → HAL)

| Fact | Source |
|---|---|
| `gpio_config` per pin: input enable, open-drain off, **output enable**, pulls, interrupt type, then IO MUX function = GPIO | `gpio.c` `gpio_config` l.347–443 |
| `gpio_output_enable`: ① route "simple GPIO output" through the GPIO matrix (`SIG_GPIO_OUT_IDX` = 256), ② set the pin's bit in the output-enable register, ③ IO MUX function → GPIO | `gpio.c` l.222–228; `gpio_ll.h` `gpio_ll_matrix_out_default` l.478–481, `gpio_ll_output_enable` l.391–398, `gpio_ll_func_sel` l.491–494; `soc/esp32/include/soc/gpio_sig_map.h` l.399 |
| Output enable = `hw->enable_w1ts = 1 << pin` → `GPIO_ENABLE_W1TS_REG` @ `0x3FF44024` | `gpio_ll.h` l.394; TRM v5.9 GPIO register summary |

## What `digitalWrite` does to the hardware

| Fact | Source |
|---|---|
| HIGH: `hw->out_w1ts = 1 << pin` → `GPIO_OUT_W1TS_REG` @ `0x3FF44008`; LOW: `out_w1tc` → `GPIO_OUT_W1TC_REG` @ `0x3FF4400C` (pins 32–39 use `out1_w1ts/tc`) | `gpio_ll.h` l.504–518; TRM v5.9 register summary |
| W1TS: "For every bit that is 1 in the value written here, the corresponding bit in GPIO_OUT_REG will be set." → one write touches only that pin's bit | TRM v5.9 Register 6.2 |
| The pin then holds that level with no further CPU work, until written again (it's a register bit driving the pad) | follows from the above; `gpio_ll_set_level` is a single store |
| `GPIO_OUT_REG` reset value is **x (undefined)** in the TRM → don't rely on a starting level after `pinMode`; write the one you want | TRM v5.9 Register 6.1 |

## Pins

| Fact | Source |
|---|---|
| ESP32 has 34 GPIOs: 0–19, 21–23, 25–27, 32–39 | IDF docs `gpio/esp32.inc` l.12 |
| GPIO 34–39: input only, no software pull-up/pull-down | `esp32.inc` l.200; `soc_caps.h` l.184 (`SOC_GPIO_VALID_OUTPUT_GPIO_MASK` excludes 34–39) → 28 can be outputs |
| GPIO 6–11 (and 16–17 on PSRAM modules) are wired to the module's flash/PSRAM: don't use | `esp32.inc` l.198 |
| GPIO 1 / 3 = TX / RX, used for uploading and Serial | `esp32.inc` l.201; `variants/esp32/pins_arduino.h` l.6–7 |
| Strapping pins: 0, 2, 5, 12, 15 — sampled at reset, free as normal IO afterwards | `esp32.inc` l.197; datasheet §3 |
| GPIO 2 default at reset: pull-down (0). Download mode needs GPIO0 = 0 and GPIO2 = 0. An LED + resistor **to ground** on GPIO 2 keeps it low → doesn't block flashing | datasheet v5.3 Table 3-1, Table 3-3 |
| "During reset, all pins are output-disabled" → every pin starts listening, not driving | datasheet v5.3, IO_MUX notes ("At Reset") |
| Espressif's ESP32-DevKitC has only a 5 V power LED. Many third-party boards put an LED on GPIO 2 — board-specific, check yours | DevKitC user guide (docs.espressif.com/projects/esp-dev-kits, "5V Power On LED"); third-party claim **not** from an Espressif source |

## Electrical

| Fact | Source |
|---|---|
| VOH ≥ 0.8 × VDD = **2.64 V**; VOL ≤ 0.1 × VDD = **0.33 V** (VDD = 3.3 V) | datasheet v5.3 Table 5-3 (DC characteristics) |
| Drive strength: 0 ≈ 5 mA, 1 ≈ 10 mA, **2 ≈ 20 mA (default)**, 3 ≈ 40 mA | datasheet v5.3, notes on pin list ("The default value is 2"); `gpio_types.h` l.124–128 (`GPIO_DRIVE_CAP_DEFAULT = 2`) |
| Max source ≈ 40 mA per pin at drive 3 (VOH ≥ 2.64 V), falling to ≈ 29 mA as more pins source at once; sink ≈ 28 mA | datasheet v5.3 Table 5-3 + notes 2 |
| Internal pull-up/down ≈ 45 kΩ (≈ 75 µA) | datasheet v5.3 Table 5-3; pin-list notes |
| Absolute max cumulative IO output current 1200 mA | datasheet v5.3 Table 5-1 |

## Circuit maths (physics, not Espressif)

| Fact | Basis |
|---|---|
| Red LED forward voltage ≈ 2.0 V (typical; varies 1.8–2.2 V by part — **check the kit's LED datasheet**) | typical LED datasheet value — UNVERIFIED for our kit |
| 220 Ω: (3.3 − 2.0) / 220 ≈ **5.9 mA**; 1 kΩ: 1.3 / 1000 = **1.3 mA**; 330 Ω ≈ 3.9 mA | Ohm's law |
| Without a resistor nothing limits the current except the pin's driver → asks for more than the ~20 mA default drive; voltage sags, pin and LED stressed | follows from drive strength above; don't put a number on "what happens" |
