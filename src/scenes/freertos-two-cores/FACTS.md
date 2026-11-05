# FreeRTOS two cores: facts

Every claim on screen or in the VO, with its source. **ESP-IDF tag `v6.0.2`**
(local checkout `~/.espressif/v6.0.2/esp-idf`), FreeRTOS kernel **V10.5.1** as shipped
in ESP-IDF (the "IDF FreeRTOS" kernel, not Amazon SMP: `CONFIG_FREERTOS_SMP` is off by
default). Paths are relative to the ESP-IDF root; line numbers are v6.0.2.

| Short | File |
|---|---|
| `task.h` | `components/freertos/FreeRTOS-Kernel/include/freertos/task.h` |
| `idf_additions.h` | `components/freertos/esp_additions/include/freertos/idf_additions.h` |
| `additions.h` | `components/freertos/esp_additions/freertos_tasks_c_additions.h` |
| `FreeRTOSConfig.h` | `components/freertos/config/include/freertos/FreeRTOSConfig.h` |
| `portmacro.h` | `components/freertos/FreeRTOS-Kernel/portable/xtensa/include/freertos/portmacro.h` |
| `esp_cpu.h` | `components/esp_hw_support/include/esp_cpu.h` |
| `freertos_idf.rst` | `docs/en/api-reference/system/freertos_idf.rst` |
| `speed.rst` | `docs/en/api-guides/performance/speed.rst` |
| `smp example` | `examples/system/freertos/basic_freertos_smp_usage/` |

Reused from earlier videos' FACTS (same tag): tick = 10 ms; priorities, the rule
"highest-priority ready task runs", up to two tasks at once on two cores, equal
priorities take turns a tick at a time, the idle task per core, the task watchdog
(freertos-scheduler); `xTaskCreate` and its six arguments, `pdPASS`, the main task
pinned to CPU 0 at priority 1 (freertos-tasks); `ESP_LOGI` (gpio-input);
`esp_timer_get_time()` and the busy worker (freertos-scheduler).

## The program

The scheduler video's program without the button: the same two LED tasks (GPIO 2
every 200 ms, GPIO 19 every 500 ms, priority 5, `xTaskCreate`), and the same two
workers at priority 6 — now pinned to core 1 and printing which core they're on.

```c
#include "esp_cpu.h"          // esp_cpu_get_core_id()

static const char *TAG = "cores";

static void work_task(void *arg)
{
    while (1) {
        ESP_LOGI(TAG, "%s on core %d", pcTaskGetName(NULL), esp_cpu_get_core_id());
        int64_t end = esp_timer_get_time() + 300 * 1000;
        while (esp_timer_get_time() < end) {
            // busy: keep the CPU until then
        }
        vTaskDelay(pdMS_TO_TICKS(100));   // rest
    }
}

void app_main(void)
{
    xTaskCreate(blink_task, "blink_fast", 2048, &fast, 5, NULL);
    xTaskCreate(blink_task, "blink_slow", 2048, &slow, 5, NULL);
    xTaskCreatePinnedToCore(work_task, "work_a", 2048, NULL, 6, NULL, 1);
    xTaskCreatePinnedToCore(work_task, "work_b", 2048, NULL, 6, NULL, 1);
}
```

- Stack 2048 for a task that logs: Espressif's `generic_gpio` example gives its task
  2048 bytes (L108) and calls a formatted `printf` from it (L70). How much stack a task
  really uses is the next video's topic.
- `TAG` "cores" → lines print as `I (…) cores: work_a on core 1` (`ESP_LOGI` format, as
  in gpio-input).

## Two cores

- "Within ESP-IDF, Core 0 and Core 1 are sometimes referred to as `PRO_CPU` and
  `APP_CPU` … Typically, the tasks responsible for handling protocol related
  processing such as Wi-Fi or Bluetooth are pinned to Core 0 … where as the tasks
  handling the remainder of the application are pinned to Core 1" (`freertos_idf.rst`
  L62). The VO uses only "core 0" and "core 1".
- The ESP32 has 2 cores: `SOC_CPU_CORES_NUM 2`
  (`components/soc/esp32/include/soc/soc_caps.h` L165).

## What lives on core 0 by default (ESP32, two cores)

From `speed.rst` "Built-in task priorities" (L214–234):
- the main task that runs `app_main`: priority 1, "pinned to Core 0 by default"
  (L218; Kconfig `ESP_MAIN_TASK_AFFINITY` default `CPU0`,
  `components/esp_system/Kconfig` L240–261);
- the esp_timer task: priority 22, pinned to Core 0 (L219);
- the Wi-Fi task: priority 23, "pinned to Core 0 by default" (L223);
- the Bluetooth controller task: priority 23, pinned to Core 0 by default (L225);
  NimBLE (L226) and Bluedroid (L232) tasks too;
- exception: the lwIP TCP/IP task is not pinned (L222).
- The VO says: "app_main runs on core 0. So do ESP-IDF's own tasks, like Wi-Fi and
  Bluetooth when you use them." *Simplified:* "most built-in tasks"; lwIP is the
  exception, not mentioned.
- "most built-in tasks are pinned to Core 0. This makes it quite easy for the
  application to place high priority tasks on Core 1" (`speed.rst` L257). (That
  paragraph sits under an `only:: not SOC_HP_CPU_HAS_MULTIPLE_CORES` block in v6.0.2,
  which looks like a docs slip: its text is about two cores. The L214–226 list, which
  is correctly guarded, says the same per task.)

## `xTaskCreate` = either core

- "If configNUMBER_OF_CORES > 1, this function will create an unpinned task"
  (`task.h` L305–306). `xTaskCreate` is an inline that calls
  `xTaskCreatePinnedToCore(…, tskNO_AFFINITY)` (`task.h` L382–400).
- "the standard functions have been modified to essentially invoke their respective
  `...PinnedToCore()` counterparts while setting the core affinity to
  `tskNO_AFFINITY`" (`freertos_idf.rst` L88).
- Each core picks "the highest priority ready-state task that can be run by the core":
  pinned to that core or unpinned, and not running on the other core
  (`freertos_idf.rst` L140–143). So an unpinned task runs on whichever core picks it,
  and can run on a different core next time.
- Espressif's SMP example shows an unpinned task logging core 0 and later core 1
  ("`unpinned_task` can be running on both core#0 and core#1", `smp example`
  `README.md` L44, output L46–67). *Note:* in that example the unpinned task is on core
  0 most of the time; it moves only when core 0 is busy (the example keeps core 0 busy
  on purpose, `create_task_example.c` L35). The VO says "can run on either core" and
  "can move", not "moves all the time".

## `xTaskCreatePinnedToCore`

- Declaration: `BaseType_t xTaskCreatePinnedToCore( TaskFunction_t pxTaskCode, const
  char * const pcName, const uint32_t ulStackDepth, void * const pvParameters,
  UBaseType_t uxPriority, TaskHandle_t * const pxCreatedTask, const BaseType_t xCoreID
  )` (`idf_additions.h` L63–69). "similar to xTaskCreate(), but allows the creation of
  a pinned task" (L41–44). Returns `pdPASS` on success, like `xTaskCreate` (L60–61, `@return pdPASS`).
- So: the same six arguments as `xTaskCreate`, in the same order, plus `xCoreID` last
  (`freertos_idf.rst` L82: "differ from their vanilla counterparts by having an extra
  `xCoreID` parameter").
- Valid values (`freertos_idf.rst` L82–86):
  - `0` pins the task to Core 0;
  - `1` pins the task to Core 1;
  - `tskNO_AFFINITY` "allows the task to be run on both cores" (= what `xTaskCreate`
    does). `tskNO_AFFINITY` is `( ( BaseType_t ) 0x7FFFFFFF )` (`task.h` L206) — not
    shown; the learner types the name.
- A pinned task only runs on its core: a core may run a task only if it "is either
  pinned to that core or is unpinned" (`freertos_idf.rst` L142; `tasks.c` L196
  `taskIS_AFFINITY_COMPATIBLE`).
- Any other number: `configASSERT( taskVALID_CORE_ID( xCoreID ) == pdTRUE || xCoreID
  == tskNO_AFFINITY )` (`additions.h` L161); `taskVALID_CORE_ID` = 0 ≤ id <
  `configNUMBER_OF_CORES` (`task.h` L216). `configASSERT` = `assert`
  (`FreeRTOSConfig.h` L132); assertions are on by default (root `Kconfig` L392–398). It
  prints `assert failed: xTaskCreatePinnedToCore <file>:<line> (<expression>)`
  (`components/esp_libc/src/assert.c` L14, L68) and the program stops (abort). On
  screen: `assert failed: xTaskCreatePinnedToCore …`.
- Not on screen: on a one-core chip (`configNUMBER_OF_CORES == 1`), only `0` is valid
  and `tskNO_AFFINITY` is treated as 0 (`idf_additions.h` L46–47). Espressif's example
  guards core 1 with `CONFIG_FREERTOS_NUMBER_OF_CORES > 1` (`create_task_example.c`
  L14).

## Which core am I on? `esp_cpu_get_core_id()`

- "This function will return the ID of the current CPU (i.e., the CPU that calls this
  function)", returns `[0..SOC_CPU_CORES_NUM - 1]` → 0 or 1 on the ESP32 (`esp_cpu.h`
  L120–128). Header `esp_cpu.h`.
- It's the call Espressif's SMP example uses (`create_task_example.c` L33–34; README
  L44).
- Not on screen: `xPortGetCoreID()` returns the same thing (`portmacro.h` L608–611);
  the IDF FreeRTOS kernel itself uses it.
- `pcTaskGetName(NULL)`: "A task can query its own name by … setting xTaskToQuery to
  NULL"; returns the name given at creation (`task.h` L1444–1452). The VO: "the name of
  the task that calls it".
- *Derived:* for an unpinned task, the number is the core it is on *at that moment*;
  it can be different next time round the loop.

## The demo, worked through (model: `sim.ts`)

Rules (all sourced above or in freertos-scheduler FACTS): tick 10 ms; delays end on a
tick; each core runs the highest-priority ready task it may run; an unpinned task that
becomes ready takes a core it outranks; equal priorities on one core take turns a tick
at a time (`freertos_idf.rst` L166–178; "To achieve ideal round-robin time slicing,
users should ensure that all tasks of a particular priority are pinned to the same
core", L245); creating a task that outranks app_main runs it on core 0 first (from
freertos-scheduler FACTS).

- **Before (the scheduler video's problem):** workers unpinned at 6. The workers fill
  both cores for most of each 300 ms job, so blink_fast misses beats: switches at 0,
  200, then ~600, 1000, 1400 … (every 400 ms instead of 200; model: 26 switches in
  10 s, 24 late). Same as freertos-scheduler's model.
- **Pinned to core 1:** the workers can never take core 0. The LED tasks (5, unpinned)
  wake on core 0's tick, find core 0 free (idle or app_main at 1) and run at once.
  *Derived:* every LED switch on time — model: fast LED 51 switches in 10 s
  (0, 200, 400 …), none late; slow LED 21. The workers still have priority 6.
- Why core 0 is free: app_main has finished creating its tasks; the only other things
  on core 0 in this program are the idle task (0) and ESP-IDF's own tasks, which are
  blocked unless used (esp_timer task: no timers here). *Simplification:* drawn as idle.
- **The cost:** both workers now share core 1 (same priority → turns, a tick each).
  Model, 10 s: each worker gets ~3.8–4.0 s of CPU, against ~7.3–7.5 s when unpinned →
  **about half**. Core 0 has no worker time at all. The VO says "each worker gets core
  1 only about half the time" and "core 0 sits almost empty".
- *Note:* the busy loop counts clock time (`esp_timer_get_time`), so a worker's job
  still ends 300 ms after it started; it just gets the CPU for only part of that time.
  The VO does **not** say "the job takes twice as long".
- Watchdog: idle task on core 1 still runs. In the model both workers rest at roughly
  the same time (they start together, since app_main isn't held up: e.g. rests
  ~300–400 and ~310–410 ms), so IDLE1 gets core 1 for ~90 ms every 400 ms, far inside
  the 5 s watchdog (freertos-scheduler FACTS; `ESP_TASK_WDT_CHECK_IDLE_TASK_CPU1`
  default y, `components/esp_system/Kconfig` L350–353).
- **Example log** (illustrative, timestamps made up but spaced as the model):
  pinned: `work_a on core 1` / `work_b on core 1` every ~400 ms. Unpinned: workers print
  core 0 or core 1. Labelled "example output".
- **The better fix is still the priority** (scheduler video): workers unpinned at 4 →
  LEDs on time (model: 51 switches, none late) *and* each worker gets ~7.5 s of CPU in
  10 s. Espressif: pinning isn't required to run ahead of built-in tasks; "Using
  unpinned tasks can improve the overall CPU utilization, however it makes reasoning
  about task scheduling more complex" (`speed.rst` L265).

## A pinned task never moves (the trap)

- "please do not assume that the two highest priority ready-state tasks are always run
  by the scheduler, as a task's core affinity must also be accounted for" — Task A (10)
  and B (9) pinned to Core 0, C (8) on Core 1: "Task B is not run even though it is the
  second-highest priority task" (`freertos_idf.rst` L145–151).
- In this program: a worker waiting for its turn on core 1 does not use core 0, even
  when core 0 is idle. *Derived from L142.*

## Not in this video (kept for later or left out)

- Floating point: a task that uses `float` is automatically pinned to the core it is
  running on (`freertos_idf.rst` L420). Would matter if a learner printed the core of
  an unpinned task that uses `float`; not used here.
- Core 0 does all the tick work; core 1 only time-slices (`freertos_idf.rst` L257–260).
- `CONFIG_FREERTOS_UNICORE` (run on one core only), one-core chips (ESP32-S2, -C3).
- `vTaskCoreAffinityGet` / `xTaskGetCoreID(handle)` (`idf_additions.h` L132).
- Changing a task's core after creation (not in IDF FreeRTOS's public API).
