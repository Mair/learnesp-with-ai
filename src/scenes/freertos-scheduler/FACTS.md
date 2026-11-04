# FreeRTOS scheduler & priorities: facts

Every claim on screen or in the VO, with its source. **ESP-IDF tag `v6.0.2`**
(local checkout `~/.espressif/v6.0.2/esp-idf`), FreeRTOS kernel **V10.5.1** as
shipped in ESP-IDF. Paths are relative to the ESP-IDF root; line numbers are v6.0.2.

| Short | File |
|---|---|
| `task.h` | `components/freertos/FreeRTOS-Kernel/include/freertos/task.h` |
| `tasks.c` | `components/freertos/FreeRTOS-Kernel/tasks.c` |
| `additions` | `components/freertos/esp_additions/freertos_tasks_c_additions.h` |
| `FreeRTOSConfig.h` | `components/freertos/config/include/freertos/FreeRTOSConfig.h` |
| `portmacro.h` | `components/freertos/FreeRTOS-Kernel/portable/xtensa/include/freertos/portmacro.h` |
| `freertos.rst` | `docs/en/api-reference/system/freertos.rst` |
| `freertos_idf.rst` | `docs/en/api-reference/system/freertos_idf.rst` |
| `speed.rst` | `docs/en/api-guides/performance/speed.rst` |
| `task_wdt.c` | `components/esp_system/task_wdt/task_wdt.c` |
| `twdt_tg.c` | `components/esp_system/task_wdt/task_wdt_impl_timergroup.c` |
| `esp_system/Kconfig` | `components/esp_system/Kconfig` |

Facts already established in `src/scenes/freertos-tasks/FACTS.md` (same tag) and
reused here without re-deriving: priorities 0…24, idle 0, main 1, esp_timer 22,
ipc 24; `xTaskCreate` creates an **unpinned** task; two cores by default; tick =
10 ms; `pdMS_TO_TICKS(200)` = 20 ticks; `vTaskDelay` blocks only the caller;
the handle argument; the main task is pinned to CPU 0 at priority 1.

## The program

Pure ESP-IDF. GPIO is limited to what Basic GPIO taught (`gpio_reset_pin`,
`gpio_set_direction`, `gpio_set_pull_mode`, `gpio_get_level`, `gpio_set_level`,
polled). Each task touches only its own pin. LED 1 on GPIO 2, LED 2 on GPIO 19,
button on GPIO 18 (pull-up, active low), as in `freertos-intro` and `gpio-input`.

```c
#include "driver/gpio.h"
#include "esp_log.h"
#include "esp_timer.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

#define BUTTON GPIO_NUM_18
static const char *TAG = "prio";

typedef struct { gpio_num_t pin; uint32_t delay_ms; } blink_t;

static void blink_task(void *arg)            // from freertos-tasks, unchanged
{
    const blink_t *b = arg;
    gpio_reset_pin(b->pin);
    gpio_set_direction(b->pin, GPIO_MODE_OUTPUT);
    while (1) {
        gpio_set_level(b->pin, 1);
        vTaskDelay(pdMS_TO_TICKS(b->delay_ms));
        gpio_set_level(b->pin, 0);
        vTaskDelay(pdMS_TO_TICKS(b->delay_ms));
    }
}

static void work_task(void *arg)             // stands in for heavy number crunching
{
    while (1) {
        int64_t end = esp_timer_get_time() + 300 * 1000;   // 300 ms from now
        while (esp_timer_get_time() < end) {
            // busy: keeps the CPU the whole time
        }
        vTaskDelay(pdMS_TO_TICKS(100));                     // then rest 100 ms
    }
}

static TaskHandle_t work_a, work_b;

static void button_task(void *arg)
{
    gpio_reset_pin(BUTTON);
    gpio_set_direction(BUTTON, GPIO_MODE_INPUT);
    gpio_set_pull_mode(BUTTON, GPIO_PULLUP_ONLY);
    int last = 1;
    while (1) {
        int level = gpio_get_level(BUTTON);
        if (last == 1 && level == 0) {
            UBaseType_t p = 4;
            if (uxTaskPriorityGet(work_a) == 4) {
                p = 6;
            }
            vTaskPrioritySet(work_a, p);
            vTaskPrioritySet(work_b, p);
            ESP_LOGI(TAG, "work tasks now at %u", p);
        }
        last = level;
        vTaskDelay(pdMS_TO_TICKS(10));
    }
}

static blink_t fast = { GPIO_NUM_2,  200 };
static blink_t slow = { GPIO_NUM_19, 500 };

void app_main(void)
{
    xTaskCreate(blink_task,  "blink_fast", 2048, &fast, 5, NULL);
    xTaskCreate(blink_task,  "blink_slow", 2048, &slow, 5, NULL);
    xTaskCreate(work_task,   "work_a",     2048, NULL,  4, &work_a);
    xTaskCreate(work_task,   "work_b",     2048, NULL,  4, &work_b);
    xTaskCreate(button_task, "button",     2048, NULL,  7, NULL);
}
```

- The edge detection (`last == 1 && level == 0`, `last = level`, 10 ms poll) is
  the loop from `gpio-input` scene 9 (`src/scenes/gpio-input/STORYBOARD.md`).
- `UBaseType_t` is `unsigned int` on the ESP32 port (`portmacro.h` L79, L83), so
  `%u` is the right format.
- `esp_timer_get_time()`: "Get time in microseconds since boot", returns
  `int64_t` (`components/esp_timer/include/esp_timer.h` L219–223). One counter
  for the whole chip, so the busy loop measures wall-clock time no matter which
  core the task is on. *Derived:* if the task is preempted mid-loop, the clock
  keeps running, so it ends at the same moment; it just did less "work". With the
  workers at 4 the blink tasks take them off a core for microseconds only.
- **Why not `esp_rom_delay_us`** (`components/esp_rom/include/esp_rom_sys.h`
  L86–91, "Pauses execution for us microseconds"): it counts the CPU's own cycle
  counter, which is per core; an unpinned task that moves cores mid-wait could end
  early. *Unverified in ROM source; avoided.* `esp_timer_get_time` has no such
  issue and makes the busy-wait visible in the code.
- CPU clock default 160 MHz (`components/esp_system/port/soc/esp32/Kconfig.cpu`
  L1–4). Not shown on screen.

## Task states

- "IDF FreeRTOS tasks … can only be in one of the following states: Running,
  Ready, Blocked, or Suspended" (`freertos_idf.rst` L96–101). `eTaskState`:
  `eRunning`, `eReady`, `eBlocked`, `eSuspended`, `eDeleted` (`task.h` L101–109).
- `vTaskDelay(n > 0)` → the caller goes to the delayed list (Blocked) and yields
  (see `freertos-tasks/FACTS.md`, "vTaskDelay underneath").
- Each tick, core 0 moves tasks whose delay has run out to the ready list
  (`tasks.c` L3250 `if( xConstTickCount >= xNextTaskUnblockTime )`, L3304
  `prvAddTaskToReadyList( pxTCB )`). "Core 0 executes all of the tick interrupt
  responsibilities", including "unblocking any blocked tasks that have timed out"
  (`freertos_idf.rst` L247–262).
- Suspended (`vTaskSuspend`): "When suspended a task will never get any
  microcontroller processing time, no matter what its priority" (`task.h`
  L1108–1110). *Not used in this video* (see storyboard decisions).

## The rule: highest-priority ready task runs

- The scheduler is "a **fixed priority preemptive scheduler with time slicing**":
  "The scheduler executes the highest priority ready-state task"; "can switch
  execution to another task without the cooperation of the currently running task";
  "periodically switches execution between ready-state tasks of the same priority
  in a round-robin fashion. Time slicing is governed by a tick interrupt"
  (`freertos_idf.rst` L129–135).
- `configUSE_PREEMPTION 1`, `configUSE_TIME_SLICING 1`, `configMAX_PRIORITIES 25`
  (`FreeRTOSConfig.h` L86, L94, L93).
- Two cores: "each core independently schedules tasks to run. When a particular
  core selects a task, the core will select the highest priority ready-state task
  that can be run by the core" — compatible affinity, and "not currently being run
  by another core" (`freertos_idf.rst` L137–146). So with two cores, up to **two**
  tasks run at the same moment. *Derived.*
- Caveat (not on screen): pinned tasks can make the two highest not both run
  (`freertos_idf.rst` L148–151). All tasks here are unpinned (`xTaskCreate`).

## Preemption

- "each core can be individually preempted by the scheduler if the scheduler
  determines that a higher-priority task can run on that core" (`freertos_idf.rst`
  L155–158).
- When a delay ends (core 0's tick): if the woken task can run on core 0 and
  outranks core 0's current task, core 0 switches (`xSwitchRequired`, `tasks.c`
  L3306–3329); otherwise, if it's unpinned and outranks core 1's current task,
  core 1 gets a yield pending (`tasks.c` L3331–3357, `xYieldPending[ 1 ]`),
  which core 1 acts on at its own tick (`additions` L81, L123). *Derived:* the
  woken task takes a core within one tick at most. It does not wait for the lower
  task to finish or to block.
- A task created or raised above the running task: yield on the current core if
  it can run there and outranks its task (`prvIsYieldRequiredSMP`, `tasks.c`
  L815–846).
- The preempted task goes back to Ready and later continues where it stopped
  (its context is saved on its stack, see `freertos-tasks/FACTS.md`). *Derived.*

## Time slicing (equal priority)

- With preemption and time slicing on, at each tick, if more than one task is
  ready at the running task's priority, a switch is requested (`tasks.c`
  L3370–3384, `listCURRENT_LIST_LENGTH(...) > 1 → xSwitchRequired`). One tick =
  10 ms (`CONFIG_FREERTOS_HZ` 100).
- ESP-IDF does "Best Effort Round Robin": the selected task goes to the back of the
  list; "given enough ticks, a task will eventually be given some processing
  time"; perfect round robin isn't guaranteed across two cores
  (`freertos_idf.rst` L166–245). The VO says "take turns, a tick at a time".

## Starvation and the watchdog

- `speed.rst` L179: "it is necessary to ensure that high-throughput or
  low-latency tasks are granted a high priority in order to run immediately.
  Priority is set when calling xTaskCreate … and can be changed at runtime by
  calling vTaskPrioritySet."
- `speed.rst` L181: "It is also necessary to ensure that tasks yield CPU (by
  calling vTaskDelay, … or by blocking on semaphores, queues, task notifications,
  etc) in order to not starve lower-priority tasks … The Task Watchdog Timer
  provides a mechanism to automatically detect if task starvation happens."
- `speed.rst` L190: "perform a time-critical operation in a high-priority task …
  and do the non-time-critical part in a lower-priority task." → the video's rule
  of thumb: **priority is urgency, not importance**; quick, frequent jobs high,
  long jobs low.
- Idle tasks: one per core, priority 0, pinned (`IDLE0`, `IDLE1`) (`freertos.rst`
  L97–101; `freertos_idf.rst` L266–274). A task that never blocks keeps every
  lower priority off its core, idle included. *Derived from the rule.*
- Task watchdog defaults: enabled and initialised at startup (`esp_system/Kconfig`
  L295–319), timeout **5 s** (L330–334), watches the CPU0 idle task (L339–348)
  and the CPU1 idle task (L350–356), panic **off** (L321–328).
- The idle hook resets the watchdog for its core (`task_wdt.c` L457 `idle_hook_cb`,
  registered per core L308/L313). So an idle task that never runs for 5 s trips
  it. "the Idle Task not being called is usually a symptom of CPU starvation"
  (`esp_system/Kconfig` L344–348).
- What's printed (tag `task_wdt`, `task_wdt.c` L87):
  - `Task watchdog got triggered. The following tasks/users did not reset the watchdog in time:` (L790–794)
  - ` - IDLE0 (CPU 0)` / ` - IDLE1 (CPU 1)` (L803–816; idle tasks are pinned, so one CPU each)
  - `Tasks currently running:` then `CPU 0: <name>` / `CPU 1: <name>` (L491–494)
  - then `Print CPU n (current core) backtrace` and a backtrace (L398–442, L36).
  Format `E (<ms>) task_wdt: …` (ESP_EARLY_LOGE). *Which worker is on which CPU
  varies; the frame shows one example.*
- With panic off, the ISR feeds the hardware timer and returns
  (`twdt_tg.c` L203–212), so the message repeats every 5 s. *Derived.*
- The demo trap: delete `vTaskDelay(pdMS_TO_TICKS(100))` from `work_task`. At
  priority 4 the blink tasks (5) and the button (7) still run (they outrank the
  workers), but the two workers fill both cores whenever the others are blocked, so
  `IDLE0` and `IDLE1` (0) never run → the watchdog message after 5 s. At 6 the LEDs
  freeze as well. *Derived.*

## vTaskPrioritySet / uxTaskPriorityGet

- `UBaseType_t uxTaskPriorityGet( const TaskHandle_t xTask )`: "Obtain the priority
  of any task." "Passing a NULL handle results in the priority of the calling task
  being returned." (`task.h` L945–948, L982)
- `void vTaskPrioritySet( TaskHandle_t xTask, UBaseType_t uxNewPriority )`: "Set the
  priority of any task. A context switch will occur before the function returns if
  the priority being set is higher than the currently executing task." "Passing a
  NULL handle results in the priority of the calling task being set." (`task.h`
  L1067–1073, L1099–1100)
- Out of range: `configASSERT( uxNewPriority < configMAX_PRIORITIES )`, then a clamp
  to 24 (`tasks.c` L1792–1798). Asserts are on by default (see
  `freertos-tasks/FACTS.md`), so 25 or more aborts.
- Lowering a task running on a core makes that core reschedule (`tasks.c`
  L1853–1866, including `taskYIELD_CORE( !xCurCoreID )` for the other core). So the
  change takes effect straight away. *Derived.*
- The handle comes from `xTaskCreate`'s last argument (`&work_a`); see
  `freertos-tasks/FACTS.md`, "6 · handle".
- `speed.rst` L179 names `vTaskPrioritySet` as the way to change priority at run
  time.

## The demo, worked through

*Derived from the rules above; the pictures are schematic, not measured.*

- Workers at **6** (problem): each is busy 300 ms, then blocked 100 ms. While both
  are busy, both cores are taken by priority 6, so the blink tasks (5) stay Ready
  when their delay ends and the LED switches late, by up to the rest of the
  worker's 300 ms. The fast LED (200 ms) visibly misses its beat. The button task
  (7) still runs (it outranks them).
- One worker alone would not show it: the other core would pick up the LEDs.
  *Derived from per-core scheduling.* That's why the program has two.
- Workers at **4** (fix): a blink task whose delay ends outranks the workers, so it
  takes a core within a tick, sets its pin and blocks again. The workers lose a few
  microseconds. *Derived; "microseconds" = a GPIO write plus a vTaskDelay call, not
  measured.*
