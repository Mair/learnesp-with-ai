# FreeRTOS intro: facts

**ESP-IDF tag: `v6.0.2`** (`~/.espressif/v6.0.2/esp-idf`). Most facts are
carried over from `freertos-tasks/FACTS.md`, which already sources them.

| Claim (screen / VO) | Source |
|---|---|
| FreeRTOS comes with ESP-IDF; ESP-IDF starts it before `app_main` ("Users … must never call vTaskStartScheduler … ESP-IDF starts FreeRTOS automatically") | `freertos-tasks/FACTS.md` l.87–93 (`freertos.rst`, `app_startup.c` L80–97) |
| `app_main` runs inside a task called `main` (priority 1, CPU 0) | `freertos-tasks/FACTS.md` l.88, l.98, l.107 |
| One loop with two LEDs: every `vTaskDelay` holds up the other LED (200 + 200 + 500 + 500 = 1400 ms for one round) | `freertos-tasks/STORYBOARD.md` scene 1 |
| `vTaskDelay` blocks the calling task; while it's blocked, the scheduler runs another task (or idle) | `freertos-tasks/FACTS.md` l.72–73 (`tasks.c` L1579–1611) |
| Preemptive scheduler with time slicing (`configUSE_PREEMPTION 1`, `configUSE_TIME_SLICING 1`) | `freertos-tasks/FACTS.md` l.123 |
| Tick 100 Hz by default → 10 ms per tick. **Not on screen**; "switches fast" is the only claim | `components/freertos/Kconfig` (v6.0.2) l.33–37 `FREERTOS_HZ` default 100 |
| The ESP32 has two cores, so two tasks can run at the same instant | `soc_caps.h` (v6.0.2) l.165 `SOC_CPU_CORES_NUM 2`; `freertos-tasks/FACTS.md` l.85 |
| Second LED on GPIO 19 (with its own resistor) | `freertos-tasks/STORYBOARD.md` ("LED 2 is on GPIO 19") |
| GPIO used in this section = only what Basic GPIO taught (`gpio_reset_pin`, `gpio_set_direction`, `gpio_set_level`, `gpio_set_pull_mode`, `gpio_get_level`, polled) | `AGENTS.md` course order |
| The section's videos, in order: tasks · scheduler & priorities · delay-until · two cores · stacks & watchdog · queues · mutexes · priority inversion · semaphores · task notifications · event groups · timers · critical sections · task stats | `AGENTS.md` course order |

The one-line promises on the map cards describe what each FreeRTOS feature is
for (FreeRTOS reference manual, "Kernel" chapters; `freertos/task.h`,
`queue.h`, `semphr.h`, `event_groups.h`, `timers.h`). Only `freertos-tasks`
exists so far: each later video re-checks its own card when it's made.
