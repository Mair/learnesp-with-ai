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
  options. Research sources are ESP-IDF, the HAL/LL headers, the datasheet and
  the TRM — never arduino-esp32.
- **The existing PWM video (`src/scenes/pwm/`) predates this rule** and uses
  Arduino calls (`ledcAttach`, `ledcWrite`, …). Copy its *visual patterns*, not
  its API; it needs an ESP-IDF rewrite (`ledc_timer_config`,
  `ledc_channel_config`, `ledc_set_duty` + `ledc_update_duty`, …).

## ESP-IDF v6.0 or later. Always.

Every API, default, file path, line number and log message a video shows or
a `FACTS.md` cites comes from **ESP-IDF v6.0 or later**, never v5.x or older.

- **Current reference: tag `v6.0.2`.** A local checkout is at
  `~/.espressif/v6.0.2/esp-idf`; read it there, or fetch raw files from
  `github.com/espressif/esp-idf` at tag `v6.0.2` (or `release/v6.0`). If a
  newer v6.x/v7.x is installed, use the newest one and say which in `FACTS.md`.
- **Name the exact version at the top of every `FACTS.md`** (tag, not just
  "v6"), so a later re-check knows what was read.
- **v6 moved the HAL.** The LL headers are in
  `components/esp_hal_<periph>/<target>/include/hal/*_ll.h` (e.g.
  `esp_hal_ledc/esp32/include/hal/ledc_ll.h`), not `components/hal/<target>/…`.
  Drivers are still in `components/esp_driver_<periph>/`.
- An API that is deprecated or removed in v6 is not used on screen, even if
  it still compiles.
- `gpio`, `gpio-input`, `freertos-tasks`, `gpio-interrupts` and the PWM v2
  draft were first researched on v5.5 and have been re-checked against v6.0.2
  (each `FACTS.md` has a "Re-checked v5.5 → v6.0.2" note). Anything quoted on
  screen that carries a source line number (e.g. `gpio_isr_handler_add(564):`
  in a log line) must be re-checked whenever the reference tag changes.

## Course order — use only what's been taught

A video may only use APIs and concepts that earlier videos taught.
The order so far:

1. `gpio` (output) → 2. `gpio-input` (polled input) →
3. **FreeRTOS series**: `freertos-tasks` → scheduler & priorities →
   delay-until → two cores → stacks & watchdog → queues → mutexes →
   priority inversion → semaphores → task notifications → event groups →
   timers → critical sections → task stats →
4. `gpio-interrupts`, which **needs** FreeRTOS: tasks, queues, `…FromISR`,
   `portYIELD_FROM_ISR`.

So in the FreeRTOS videos, GPIO is limited to what videos 1–2 taught:
`gpio_reset_pin`, `gpio_set_direction`, `gpio_set_level`,
`gpio_set_pull_mode`, `gpio_get_level`, polled in a loop. No `gpio_config`
with `intr_type`, no ISR service, no interrupts. Each task drives its own
pin(s), and no two tasks touch the same pin.

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
