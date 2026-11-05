# FreeRTOS delay-until: facts

Every claim on screen or in the VO, with its source. **ESP-IDF tag `v6.0.2`**
(local checkout `~/.espressif/v6.0.2/esp-idf`), FreeRTOS kernel **V10.5.1** as shipped
in ESP-IDF. Paths are relative to the ESP-IDF root; line numbers are v6.0.2.

| Short | File |
|---|---|
| `task.h` | `components/freertos/FreeRTOS-Kernel/include/freertos/task.h` |
| `tasks.c` | `components/freertos/FreeRTOS-Kernel/tasks.c` |
| `projdefs.h` | `components/freertos/FreeRTOS-Kernel/include/freertos/projdefs.h` |
| `portmacro.h` | `components/freertos/FreeRTOS-Kernel/portable/xtensa/include/freertos/portmacro.h` |
| `FreeRTOSConfig.h` | `components/freertos/config/include/freertos/FreeRTOSConfig.h` |
| `arch.h` | `components/freertos/config/xtensa/include/freertos/FreeRTOSConfig_arch.h` |
| `migration` | `docs/en/migration-guides/release-6.x/6.0/system.rst` |

Reused from earlier videos' FACTS (same tag): tick = 10 ms (`CONFIG_FREERTOS_HZ` 100),
`pdMS_TO_TICKS(200)` = 20 ticks, `vTaskDelay` blocks only the calling task, two cores,
priorities, `esp_timer_get_time()` (microseconds since boot), the busy loop from the
scheduler video, `ESP_LOGI` (gpio-input).

## The program

Pure ESP-IDF; GPIO calls from Basic GPIO only; each task drives its own pin.
LED A on GPIO 2, LED B on GPIO 19 (as in the earlier FreeRTOS videos).

```c
#define LED_A GPIO_NUM_2
#define LED_B GPIO_NUM_19
static const char *TAG = "beat";

static void work_30ms(void)            // stands in for reading a sensor and logging it
{
    int64_t end = esp_timer_get_time() + 30 * 1000;
    while (esp_timer_get_time() < end) {
    }
}

static void delay_task(void *arg)      // LED A: vTaskDelay
{
    gpio_reset_pin(LED_A);
    gpio_set_direction(LED_A, GPIO_MODE_OUTPUT);
    int level = 0;
    while (1) {
        level = !level;
        gpio_set_level(LED_A, level);
        work_30ms();
        vTaskDelay(pdMS_TO_TICKS(200));
    }
}

static void until_task(void *arg)      // LED B: xTaskDelayUntil
{
    gpio_reset_pin(LED_B);
    gpio_set_direction(LED_B, GPIO_MODE_OUTPUT);
    int level = 0;
    TickType_t last = xTaskGetTickCount();
    while (1) {
        level = !level;
        gpio_set_level(LED_B, level);
        work_30ms();
        if (xTaskDelayUntil(&last, pdMS_TO_TICKS(200)) == pdFALSE) {
            ESP_LOGW(TAG, "missed a beat");
        }
    }
}

void app_main(void)
{
    xTaskCreate(delay_task, "delay", 2048, NULL, 5, NULL);
    xTaskCreate(until_task, "until", 2048, NULL, 5, NULL);
}
```

(The `if … ESP_LOGW` is added in the "running late" scene; before that the call stands
alone.)

## vTaskDelay counts from when you call it

- "vTaskDelay() specifies a time at which the task wishes to unblock relative to the time
  at which vTaskDelay() is called … vTaskDelay() does not therefore provide a good method
  of controlling the frequency of a periodic task as the path taken through the code …
  will affect the frequency" (`task.h` L802–812).
- Code: `vTaskDelay(n > 0)` → `prvAddCurrentTaskToDelayedList(xTicksToDelay, …)`
  (`tasks.c` L1584–1598) → wake time = tick count now + ticks (`tasks.c` L6393/L6429,
  `xTimeToWake = xConstTickCount + xTicksToWait`).
- `vTaskDelay(0)` only "forces a reschedule" (`tasks.c` L1583). *Not used on screen.*
- *Worked through:* delay_task wakes on a tick, sets the pin, busy for 30 ms (3 ticks),
  then `vTaskDelay(20)` from tick count +3 → wakes 23 ticks after the last wake =
  **230 ms** per switch, not 200. Derived.
- *Worked through:* in the first 10 s, counting the switch at 0, LED B (every 200 ms:
  0, 200 … 9800) switches 50 times and LED A (every 230 ms: 0, 230 … 9890) 44 times. They're opposite (200 ms apart) after about 7 switches
  (7 × 30 ms ≈ 200 ms), i.e. about 1.5 s. Derived.

## xTaskGetTickCount

- `TickType_t xTaskGetTickCount( void )` returns `xTickCount` (`task.h` L1418;
  `tasks.c` L2712–2724). The tick count = ticks since the scheduler started (one per
  tick interrupt, `xTaskIncrementTick`, see `freertos-scheduler/FACTS.md`).
- `TickType_t` is `uint32_t` (`configUSE_16_BIT_TICKS 0`, `FreeRTOSConfig.h` L95;
  `portmacro.h` L84–91). *Derived:* it wraps after 2³² ticks × 10 ms ≈ **497 days**;
  `xTaskDelayUntil` handles the wrap (the overflow branches, `tasks.c` L1511–1539).
- The `last` variable "must be initialised with the current time prior to its first use"
  and is "automatically updated within xTaskDelayUntil ()" (`task.h` L859–862; example
  L883 `xLastWakeTime = xTaskGetTickCount ();`).

## xTaskDelayUntil

- `BaseType_t xTaskDelayUntil( TickType_t * const pxPreviousWakeTime, const TickType_t
  xTimeIncrement )` (`task.h` L896–897). Available: `INCLUDE_xTaskDelayUntil 1`
  (`arch.h` L102).
- "Delay a task until a specified time. This function can be used by periodic tasks to
  ensure a constant execution frequency." "xTaskDelayUntil () specifies the absolute
  (exact) time at which it wishes to unblock." (`task.h` L841–854)
- `xTimeIncrement`: "The cycle time period. The task will be unblocked at time
  *pxPreviousWakeTime + xTimeIncrement." (`task.h` L864–867)
- Code: `xTimeToWake = *pxPreviousWakeTime + xTimeIncrement` (L1509);
  `*pxPreviousWakeTime = xTimeToWake` always (L1543); blocks only if the wake time is
  still ahead (L1511–1539, L1545–1553); returns `xShouldDelay` (L1571).
- Return: "pdTRUE if the task was delayed and pdFALSE otherwise. A task will not be
  delayed if the next expected wake time is in the past." (`task.h` L869–871)
- *Worked through:* until_task: wakes at last + 20 ticks every time; the 30 ms of work
  falls inside the 200 ms → one switch every **200 ms**. Derived.
- Period must be more than 0: `configASSERT( ( xTimeIncrement > 0U ) )` (`tasks.c`
  L1499); `configASSERT` = `assert` (`FreeRTOSConfig.h` L132), on by default (see
  `freertos-tasks/FACTS.md`). `pdMS_TO_TICKS(ms)` = ms × 100 / 1000, integer (`projdefs.h`
  L46), so anything under 10 ms is **0 ticks** → the program stops with
  `assert failed: xTaskDelayUntil …` (`components/esp_libc/src/assert.c` L14, L68).
  *Derived.* And `pdMS_TO_TICKS(255)` = 25 ticks = 250 ms: periods are whole ticks.
- The old name: `vTaskDelayUntil` is "the older version of xTaskDelayUntil() and does not
  return a value" (`task.h` L901–908, a macro). ESP-IDF v6.0 removed the
  `vTaskDelayUntil` compatibility function: "Use xTaskDelayUntil instead" (`migration`
  L300–303). The video uses `xTaskDelayUntil` only.

## Running late

- If one loop takes longer than the period, the wake time is already in the past: no
  delay, returns pdFALSE, and `last` still moves on by one period (L1543). *Derived:* the
  next loops run back to back until `last` catches up with now — the missed beats come
  out in a rush, then the beat continues on the original grid.
- *Worked through* (one loop takes 500 ms, beats at 0, 200, 400, 600 …): switch at 0,
  500 ms of work → wake 200 is past → pdFALSE, last = 200; switch at 500, 30 ms → 530,
  wake 400 past → pdFALSE, last = 400; switch at 530, 30 ms → 560, wake 600 ahead →
  wait; switch at 600, 800 … back on the beat. Derived.
- `ESP_LOGW` = the warning level of `ESP_LOGI` (`components/log/include/esp_log.h`
  L72–78). Printed as `W (…) beat: missed a beat`.

## The trap: resetting `last` inside the loop

- If `TickType_t last = xTaskGetTickCount();` is moved inside the loop, after the work
  (just before the call — the way it's shown on screen), every call computes the
  wake time from the tick count after the work → wake = now + 20 ticks, the same as
  `vTaskDelay(20)`: 230 ms again. *Derived from the code above.*
- Fix: set it once, before the loop (`task.h` L859–862, example L883).
