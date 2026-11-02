# PWM — facts and where they come from

Sources: arduino-esp32 `master` (3.3), ESP-IDF `release/v5.5`. Raw files fetched and read.

| Fact (as said or shown) | Source |
|---|---|
| `ledcAttach(pin, freq, resolution)` picks a free channel + timer; returns `false` if it can't (no free timer, resolution 0 or > `SOC_LEDC_TIMER_BIT_WIDTH`, timer config fails) | `cores/esp32/esp32-hal-ledc.c` — `ledcAttach`, `ledcAttachChannel` |
| Channel output goes high at `hpoint = 0` and low when the counter reaches the duty → pin ON while counter < duty | `esp32-hal-ledc.c` (`ledc_channel.hpoint = 0`); TRM LEDC chapter |
| Max resolution 20 bits on ESP32, 14 on S2/S3/C3 | `SOC_LEDC_TIMER_BIT_WIDTH` in `components/soc/<target>/include/soc/soc_caps.h` (20 / 14 / 14 / 14) |
| frequency × 2^bits must fit the source clock; APB = 80 MHz is the fastest (1 kHz × 16 bits = 65.5 MHz ✓, × 17 = 131 MHz ✗) | `esp_driver_ledc/src/ledc.c` — `ledc_calculate_divisor`, `LEDC_IS_DIV_INVALID` (8.8 fixed-point divider must be ≥ 256 = 1.0) |
| `ledcWrite` with duty ≥ 2^bits − 1 writes 2^bits ("LEDC FULL ON") → 255 = fully on | `esp32-hal-ledc.c` — `ledcWrite` |
| `ledcWrite` = `ledc_set_duty` + `ledc_update_duty` | `esp32-hal-ledc.c` — `ledcWrite` |
| "Call this function to activate the LEDC updated parameters … don't take effect until the next PWM cycle" | `esp_driver_ledc/include/driver/ledc.h` — `ledc_update_duty` doc comment |
| duty register = `duty_val << 4` (low 4 bits fraction); go = `conf1.duty_start = 1` | `hal/esp32/include/hal/ledc_ll.h` — `ledc_ll_set_duty_int_part`, `ledc_ll_set_duty_start` |
| `ledcFade`: total periods = ms × Hz / 1000; if > Δduty: scale 1, cycle = total / Δduty (integer) → 230 → 0 in 2800 ms at 1 kHz = −1 every 12 periods = 2760 periods = 2.76 s | `esp_driver_ledc/src/ledc.c` — `_ledc_set_fade_with_time` |
| Fade engine fields `conf1.duty_inc` (0 = down), `duty_num`, `duty_cycle`, `duty_scale`; started via `ledc_update_duty` (duty_start) | `ledc_ll.h` — `ledc_ll_set_fade_param`; `ledc.c` — `_ledc_fade_start` |
| `ledcFade` returns at once (`LEDC_FADE_NO_WAIT`); `ledcFadeWithInterrupt` calls your function on the fade-end interrupt | `esp32-hal-ledc.c` — `ledcFadeConfig`, `ledcFnWrapper` (`LEDC_FADE_END_EVT`) |
| `ledcWriteTone` sets the timer to the frequency at 10 bits and duty 0x1FF (half) | `esp32-hal-ledc.c` — `ledcWriteTone` |
