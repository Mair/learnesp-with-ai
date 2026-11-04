# Basic GPIO intro: facts

**ESP-IDF tag: `v6.0.2`** (`~/.espressif/v6.0.2/esp-idf`). Most facts are
carried over from the section's own videos, which already source them; the
source column says where.

| Claim (screen / VO) | Source |
|---|---|
| A GPIO pin can be an output (code sets it high or low) or an input (code reads high or low) | `gpio/FACTS.md` (`gpio_set_direction`, `GPIO_MODE_OUTPUT` / `GPIO_MODE_INPUT`); `gpio-input/FACTS.md` |
| Output high = 3.3 V, low = 0 V; "two levels, nothing in between" | `gpio/FACTS.md` (VDD3P3 = 3.3 V; `gpio_set_level` 0/1) |
| Input: above ~2.475 V reads 1, below ~0.825 V reads 0 (VIH = 0.75 × VDD, VIL = 0.25 × VDD). **Not on screen**: the intro just says "reads high or low" | `gpio-input/FACTS.md` (datasheet v5.3 Table 5-3) |
| "GPIO" = general-purpose input/output | ESP32 TRM v5.x ch. 6 title "IO_MUX and GPIO Matrix (GPIO, IO_MUX)"; `driver/gpio.h` |
| Not every pin can be an output: GPIO 34–39 are input only | `soc_caps.h` (v6.0.2) l.187 `SOC_GPIO_VALID_OUTPUT_GPIO_MASK` excludes BIT34…BIT39; `gpio/FACTS.md`. **Not on screen** (the `gpio` video covers it) |
| LED on GPIO 2, button on GPIO 18 | `gpio/STORYBOARD.md`, `gpio-input/STORYBOARD.md` (`#define LED GPIO_NUM_2`, `#define BUTTON GPIO_NUM_18`) |
| The LED needs a resistor: 220 Ω → (3.3 − 2.0) / 220 ≈ 5.9 mA | `gpio/FACTS.md` l.99 |
| The button goes from the pin to GND, with the pin's internal pull-up | `gpio-input/FACTS.md` (`GPIO_PULLUP_ONLY`, active low) |
| `gpio` video: `gpio_reset_pin`, `gpio_set_direction`, `gpio_set_level`; blinks the LED with `vTaskDelay` | `gpio/STORYBOARD.md` program |
| `gpio-input` video: `gpio_set_pull_mode`, `gpio_get_level`; the LED follows the button within 10 ms, then counts presses (`ESP_LOGI`) | `gpio-input/STORYBOARD.md` scenes 8–9 |
| Build / flash / monitor: `idf.py build`, `idf.py -p PORT flash monitor` | ESP-IDF Get Started guide (docs.espressif.com, v6.0, "Build the Project", "Flash onto the Device", "Monitor the Output") |
| Espressif's ESP32-DevKitC has no user LED (only a 5 V power LED), so the course uses an external LED | `gpio/FACTS.md` l.82 |
