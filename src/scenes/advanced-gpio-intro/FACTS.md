# Advanced GPIO intro: facts

**ESP-IDF tag: `v6.0.2`** (`~/.espressif/v6.0.2/esp-idf`). PWM and
interrupt facts are carried over from `pwm/FACTS.md` and
`gpio-interrupts/FACTS.md`. ADC and DAC have no videos yet; the facts below
are the only ones the intro states, and each was read in v6.0.2.

| Claim (screen / VO) | Source |
|---|---|
| Polling: the `gpio-input` loop asks the button 100 times a second | `gpio-input/STORYBOARD.md` (reads 100×/s) |
| PWM: the LEDC hardware keeps the pin switching on its own; duty → brightness, frequency → pitch; `ledc_set_duty`, `ledc_set_freq` | `pwm/FACTS.md` |
| LEDC: 8 channels, 4 timers | `soc_caps.h` l.228–229 `SOC_LEDC_TIMER_NUM (4)`, `SOC_LEDC_CHANNEL_NUM (8)`. **Not on screen** |
| Interrupts: the pin tells you on an edge; the handler hands the event to a task through a queue; `gpio_isr_handler_add`, `xQueueReceive` | `gpio-interrupts/FACTS.md`, `gpio-interrupts/STORYBOARD.md` program |
| The interrupt video needs FreeRTOS: tasks, queues, `…FromISR` | `AGENTS.md` course order |
| ADC: the ESP32 has two ADC units (8 + 10 channels) | `soc_caps.h` l.132–133 `SOC_ADC_PERIPH_NUM (2)`, `SOC_ADC_CHANNEL_NUM` 8 / 10. **Not on screen** |
| ADC: a reading is 12 bits by default on the ESP32 → 0 … 4095 | `esp_hal_ana_conv/include/hal/adc_types.h` l.57 (`ADC_BITWIDTH_DEFAULT` = "max supported width"); `soc_caps.h` l.150 `SOC_ADC_RTC_MAX_BITWIDTH (12)`; `esp_hal_ana_conv/esp32/include/hal/adc_ll.h` l.378 (DEFAULT → the 12-bit setting) |
| ADC read call: `adc_oneshot_read(handle, channel, &raw)` | `examples/peripherals/adc/oneshot_read/main/oneshot_read_main.c` l.92 |
| DAC: two 8-bit channels, on GPIO 25 and GPIO 26; value 0 … 255 → 0 … Vref (≈ the 3.3 V supply); `out = Vref × value / 255` | `soc_caps.h` l.175–176; `soc/esp32/include/soc/dac_channel.h` l.10, l.14; `docs/en/api-reference/peripherals/dac.rst` l.13–15 |
| DAC call: `dac_oneshot_output_voltage(handle, value)` | `esp_driver_dac/include/driver/dac_oneshot.h` l.64; `examples/peripherals/dac/dac_oneshot` l.44 |
| The DAC exists only on the ESP32 and the ESP32-S2 (not S3, C3, C6…) | `SOC_DAC_SUPPORTED 1` only in `soc/esp32/…/soc_caps.h` l.71 and `soc/esp32s2/…/soc_caps.h` l.47 (no other target defines it) |
| Espressif's own DAC example reads the DAC pin back with the ADC | `examples/peripherals/dac/dac_oneshot/main/dac_oneshot_example_main.c` l.22–44, l.79–80 |
| LED on GPIO 2, speaker on GPIO 4, button on GPIO 18 | `pwm/STORYBOARD.md`, `gpio-interrupts/STORYBOARD.md` |

**Open (needs a decision, see the storyboard):** what drives the speaker
(a passive piezo buzzer is safe on a pin; a magnetic 8 Ω speaker needs a
transistor), and the potentiometer's pin and value. Both get sourced when the
`adc` video is researched.
