# Learn-ESP32-v-2 — the live project

This repo is the **only** place where explainer-video work happens. Every
change goes here: source, timelines, audio builds, renders, docs.

## Pure ESP-IDF — no Arduino. Ever.

This course is an **ESP-IDF reference**. Every line of code a learner sees is
plain ESP-IDF C:

- **No Arduino functions or concepts**: no `setup()` / `loop()`, `pinMode`,
  `digitalWrite`, `digitalRead`, `delay`, `millis`, `Serial`, `ledcWrite`,
  `analogRead`, `LED_BUILTIN`, Arduino IDE menus (Core Debug Level, etc.) or
  the arduino-esp32 core (`esp32-hal-*.c`).
- **Entry point is `void app_main(void)`**; loops are `while (1) { … }` inside it
  (or in your own FreeRTOS task).
- **The only way to wait is `vTaskDelay(pdMS_TO_TICKS(ms))`** (FreeRTOS ticks,
  default `CONFIG_FREERTOS_HZ = 100` → 1 tick = 10 ms). No `delay()`.
- **Use the ESP-IDF driver APIs** (`driver/gpio.h`, `driver/ledc.h`, …), their
  `esp_err_t` return values, `ESP_ERROR_CHECK`, `ESP_LOGx`, and `menuconfig`
  options. Research sources are ESP-IDF (`release/v5.5`), the HAL/LL headers,
  the datasheet and the TRM — never arduino-esp32.
- **The existing PWM video (`src/scenes/pwm/`) predates this rule** and uses
  Arduino calls (`ledcAttach`, `ledcWrite`, …). Copy its *visual patterns*, not
  its API; it needs an ESP-IDF rewrite (`ledc_timer_config`,
  `ledc_channel_config`, `ledc_set_duty` + `ledc_update_duty`, …).

- **Read, write, render here.** Paths: `src/scenes/<slug>/`,
  `public/<slug>/`, `out/<slug>.mp4`, `out/<slug>-stems/`.
- **Never edit the old spike** at
  `~/projects/learnesp32.com/spike-course/esp32-remotion`. It's the
  pre-migration prototype ("first-light" there = "pwm" here), kept frozen as
  a reference. If a session starts in that tree, switch here before
  changing anything.
- Videos are named by topic (`pwm`, not `first-light`).
- For video work, load the `explainer-video` skill (`.pi/skills/explainer-video`).
- Git repo: start from a clean tree; commit at each milestone the user approves.
