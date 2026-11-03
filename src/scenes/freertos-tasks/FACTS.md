# FreeRTOS tasks: facts

Every claim on screen or in the VO, with its source. ESP-IDF **release/v5.5**
(raw files from `github.com/espressif/esp-idf/release/v5.5`), FreeRTOS kernel
**V10.5.1** as shipped in ESP-IDF. Paths are relative to the ESP-IDF root.
Short names used below:

| Short | File |
|---|---|
| `task.h` | `components/freertos/FreeRTOS-Kernel/include/freertos/task.h` |
| `tasks.c` | `components/freertos/FreeRTOS-Kernel/tasks.c` |
| `additions` | `components/freertos/esp_additions/freertos_tasks_c_additions.h` |
| `projdefs.h` | `components/freertos/FreeRTOS-Kernel/include/freertos/projdefs.h` |
| `stack_macros.h` | `components/freertos/FreeRTOS-Kernel/include/freertos/stack_macros.h` |
| `FreeRTOSConfig.h` | `components/freertos/config/include/freertos/FreeRTOSConfig.h` |
| `portmacro.h` | `components/freertos/FreeRTOS-Kernel/portable/xtensa/include/freertos/portmacro.h` |
| `port.c` | `components/freertos/FreeRTOS-Kernel/portable/xtensa/port.c` |
| `app_startup.c` | `components/freertos/app_startup.c` |
| `esp_task.h` | `components/esp_system/include/esp_task.h` |
| `freertos.rst` | `docs/en/api-reference/system/freertos.rst` |
| `freertos_idf.rst` | `docs/en/api-reference/system/freertos_idf.rst` |

## The program

Pure ESP-IDF. GPIO is limited to the output calls from the `gpio` video
(`gpio_reset_pin`, `gpio_set_direction(…, GPIO_MODE_OUTPUT)`,
`gpio_set_level`), see `src/scenes/gpio/FACTS.md`. LED 1 is on GPIO 2 (as in
`gpio`); LED 2 is on GPIO 19 (WROOM module pin 31, `src/scenes/gpio/board.tsx`).
GPIO 19 is not a strapping pin (strapping pins are 0, 2, 5, 12, 15; see
`gpio/FACTS.md`).

```c
typedef struct { gpio_num_t pin; uint32_t delay_ms; } blink_t;

static void blink_task(void *arg)
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

static blink_t fast = { GPIO_NUM_2,  200 };
static blink_t slow = { GPIO_NUM_19, 500 };

void app_main(void)
{
    xTaskCreate(blink_task, "blink_fast", 2048, &fast, 5, NULL);
    xTaskCreate(blink_task, "blink_slow", 2048, &slow, 5, NULL);
}
```

Each task drives only its own pin. *Derived:* the two tasks never touch the
same pin. `gpio_set_level` is a single write to the set/clear registers
(`out_w1ts`/`out_w1tc`, see `gpio/FACTS.md`), and each pin has its own IO_MUX
register. So the two tasks don't interfere.

## The problem: one loop, two rates

- `vTaskDelay` blocks the task that called it for the given number of ticks
  (`tasks.c` L1579–1611: `prvAddCurrentTaskToDelayedList(xTicksToDelay, …)`,
  then yield). While `app_main` is in a delay, nothing else in its loop runs.
- *Arithmetic:* one loop doing fast on/off (200 + 200) then slow on/off
  (500 + 500) repeats every 200 + 200 + 500 + 500 = **1400 ms**. Both LEDs go
  through one on/off cycle per 1400 ms. The fast LED is on for 200 ms, then
  off for 200 + 500 + 500 = 1200 ms.
- Wanted: the fast LED cycles every 400 ms (200 on, 200 off) and the slow one
  every 1000 ms.

## FreeRTOS is already running

- ESP-IDF FreeRTOS is based on vanilla FreeRTOS v10.5.1, changed to support
  two cores (`freertos.rst` L21; `task.h` L62 `tskKERNEL_VERSION_NUMBER
  "V10.5.1"`).
- "Users of FreeRTOS in ESP-IDF **must never call** vTaskStartScheduler … ESP-IDF
  starts FreeRTOS automatically." `app_main` "is called from the `main` task"
  (`freertos.rst` L75–79).
- `esp_startup_start_app()` creates `main_task` with
  `xTaskCreatePinnedToCore(main_task, "main", ESP_TASK_MAIN_STACK, NULL,
  ESP_TASK_MAIN_PRIO, NULL, ESP_TASK_MAIN_CORE)` and then calls
  `vTaskStartScheduler()` (`app_startup.c` L83–99).
- `main_task` logs `Started on CPU%d`, then `Calling app_main()`, calls
  `app_main()`, logs `Returned from app_main()`, and calls `vTaskDelete(NULL)`
  (`app_startup.c` L185–217; tag `"main_task"`, L147). The log line reads
  `I (…) main_task: Returned from app_main()`.
- Main task priority `ESP_TASK_MAIN_PRIO = ESP_TASK_PRIO_MIN + 1` = **1**
  (`esp_task.h` L28, L56; `freertos.rst` L107–111 "1").
- Main task stack = `CONFIG_ESP_MAIN_TASK_STACK_SIZE` (default **3584**,
  `components/esp_system/Kconfig` L225–227) + `TASK_EXTRA_STACK_SIZE`
  (`esp_task.h` L57). `TASK_EXTRA_STACK_SIZE` is 512 unless nano printf
  formatting is enabled (`esp_task.h` L33–37). `LIBC_NEWLIB_NANO_FORMAT`
  defaults to y only on ESP32-C2 (`components/newlib/Kconfig` L105–107;
  `CONFIG_NEWLIB_NANO_FORMAT` is its old name, `components/newlib/sdkconfig.rename`
  L12). So on the ESP32 it's 3584 + 512 = **4096 bytes**.
- Main task affinity defaults to **CPU0** (`esp_system/Kconfig` L233–235).
- "If app_main() returns then this task is deleted and its stack memory is
  freed" (`esp_system/Kconfig` L229–231).
- The other tasks keep running after `app_main` returns: `vTaskDelete(NULL)`
  removes only the calling task (`tasks.c` L1342–1360; `task.h` L785).

## A task

- A task uses two blocks of memory: one for its data structures (the TCB) and
  one for its stack. `xTaskCreate` allocates both dynamically (`task.h`
  L285–292).
- TCB fields: `pxTopOfStack` (first member), `xStateListItem` ("Ready,
  Blocked, Suspended"), `uxPriority`, `pxStack`, `pcTaskName[
  configMAX_TASK_NAME_LEN ]`, `xCoreID`, `pxEndOfStack` (`tasks.c` L417–436).
- Task states include Running, Ready, Blocked, Suspended and Deleted
  (`task.h` L101–109, `eTaskState`).
- Scheduler: `configUSE_PREEMPTION 1`, `configUSE_TIME_SLICING 1`
  (`FreeRTOSConfig.h` L86, L94).

## The task function

- `typedef void (* TaskFunction_t)( void * );` takes one `void *` and returns
  nothing (`projdefs.h` L40).
- "Tasks must be implemented to never return (i.e. continuous loop)"
  (`task.h` L308–309). "Task functions should never return"
  (`freertos_idf.rst` L101).
- If one does return: ESP-IDF wraps every task function in
  `vPortTaskWrapper`. It calls `pxCode(pvParameters)`. If that returns, it
  logs `ESP_LOGE("FreeRTOS", "FreeRTOS Task \"%s\" should not return, Aborting
  now!", …)` and calls `abort()` (`port.c` L141–148). The log line reads
  `E (…) FreeRTOS: FreeRTOS Task "blink_fast" should not return, Aborting now!`.
- The wrapper is `CONFIG_FREERTOS_TASK_FUNCTION_WRAPPER`, default y. It
  depends on `COMPILER_OPTIMIZATION_DEBUG` (or core dump / GDB stub)
  (`components/freertos/Kconfig` L362–367). The default optimisation level is
  Debug (`Kconfig` root L338–340, L363–364). So it's on by default.
  *Unverified:* what happens with `-O2` and no core dump. The VO says "by
  default".
- The initial stack frame's `pc` is `vPortTaskWrapper`; the task function and
  its parameter are its arguments (`port.c` L349–360, inside
  `pxPortInitialiseStack`, L392).
- To end a task on purpose: `vTaskDelete(NULL)` deletes the calling task
  (`task.h` L785 and doc above it; `freertos_idf.rst` L106, L120 "Tasks
  self-deleting via vTaskDelete(NULL)").
- Self-deletion: the TCB and stack are freed later by the idle task
  (`tasks.c` L1385–1396 comment; `prvCheckTasksWaitingTermination()` in the
  idle task, L4301).

## xTaskCreate: the six arguments

`xTaskCreate(pxTaskCode, pcName, usStackDepth, pvParameters, uxPriority,
pxCreatedTask)` (`task.h` L370–376).

### 1 · function
- `pxTaskCode`: "Pointer to the task entry function" (`task.h` L308). C: a
  function name without `()` is a pointer to it.

### 2 · name
- "A descriptive name for the task. This is mainly used to facilitate
  debugging. Max length defined by configMAX_TASK_NAME_LEN - default is 16"
  (`task.h` L311–313).
- `CONFIG_FREERTOS_MAX_TASK_NAME_LEN` default **16** (`freertos/Kconfig`
  L146–149) → `configMAX_TASK_NAME_LEN` (`FreeRTOSConfig.h` L114).
- Copy: up to 16 chars, then `pcTaskName[ configMAX_TASK_NAME_LEN - 1 ] =
  '\0'` (`tasks.c` L1078–1103). So at most **15 characters** plus the
  terminator.
- Espressif's `examples/peripherals/gpio/generic_gpio/main/gpio_example_main.c`
  L109: `xTaskCreate(gpio_task_example, "gpio_task_example", 2048, NULL, 10,
  NULL);`. "gpio_task_example" is 17 characters, so it's stored as
  **"gpio_task_examp"** (15). *Derived from the copy loop.*
- "blink_fast" = 10 characters, which fits.

### 3 · stack size
- "The size of the task stack specified as the NUMBER OF BYTES. Note that this
  differs from vanilla FreeRTOS" (`task.h` L315–316). "Task stack sizes in
  Vanilla FreeRTOS are specified in a number of words, whereas in IDF FreeRTOS,
  the task stack sizes are specified in bytes" (`freertos_idf.rst` L92).
- `StackType_t` is `uint8_t` on the ESP32 port (`portmacro.h` L88, L91), so
  depth × sizeof(StackType_t) = bytes.
- *Arithmetic:* in vanilla FreeRTOS on a 32-bit CPU, 2048 words = 2048 × 4 =
  8192 bytes, four times as much.
- 2048 is the stack Espressif's generic_gpio example gives its task (L109
  above).
- Comparison: main task 4096 bytes (above); idle task
  `CONFIG_FREERTOS_IDLE_TASK_STACKSIZE` default **1536** bytes
  (`freertos/Kconfig` L92–97: "ESP-IDF specifies stack sizes in bytes instead
  of words").
- Allocated from the heap at creation: stack first, then TCB
  (`pvPortMallocStack(usStackDepth * sizeof(StackType_t))`, then
  `pvPortMalloc(sizeof(TCB_t))`; the stack grows down, so it's allocated
  first, `additions` L197–262; `portmacro.h` L115 `portSTACK_GROWTH (-1)`).
- ESP-IDF maps FreeRTOS allocations to `heap_caps_malloc`, placed in internal
  memory (`freertos.rst` L136).
- The new stack is filled with `0xa5` (`tasks.c` L90 `tskSTACK_FILL_BYTE`,
  L1044 `memset`).
- What's on a task's stack: its local variables and function calls; and, while
  it's switched out, its saved registers. *Partly derived:* the initial
  exception frame `XtExcFrame` is built on the task's stack (`port.c`
  L335–360). The scheduler saves the context there on a switch; the TCB's
  first member is `pxTopOfStack`, "the last item placed on the task's stack"
  (`tasks.c` L419).
- Overflow check: `CONFIG_FREERTOS_CHECK_STACKOVERFLOW` defaults to **CANARY**
  (method 2) (`freertos/Kconfig` L51–53; `FreeRTOSConfig.h` L153–158). On
  every context switch (`tasks.c` L3698, in `vTaskSwitchContext`) it checks
  that the lowest 16 bytes at `pxStack` are still `0xa5a5a5a5` ×4
  (`stack_macros.h` L91–105).
- If not: `vApplicationStackOverflowHook` → `esp_system_abort("***ERROR*** A
  stack overflow in task blink_fast has been detected.")` (`port.c` L561–574).
- Panic default: `ESP_SYSTEM_PANIC_PRINT_REBOOT`, print registers and reboot
  (`esp_system/Kconfig` L31–33).
- The check only runs on a context switch, so the overflow "may already be long
  gone" (`freertos/Kconfig` L378–381).

### 4 · parameter
- "Pointer that will be used as the parameter for the task being created"
  (`task.h` L318–319). It's passed to the task function as its argument
  (`port.c` L354–358: `a3`/`a7 = pvParameters`).
- Lifetime: "the passed parameter … must exist for the lifetime of the task,
  so in this case is declared static. If it was just an automatic stack
  variable it might no longer exist, or at least have been corrupted, by the
  time the new task attempts to access it" (`task.h` L354–356).
- A local in `app_main` lives on the main task's stack, which is freed when
  `app_main` returns (`esp_system/Kconfig` L229–231). So a pointer to it
  dangles. *Derived.*
- `static blink_t fast` has static storage duration and lives for the whole
  program (C standard).

### 5 · priority
- `configMAX_PRIORITIES` = **25** (`FreeRTOSConfig.h` L93), so priorities run
  0…24.
- `tskIDLE_PRIORITY` = 0 (`task.h` L199). An idle task is created for and
  pinned to each core, at priority 0, named `IDLE0`/`IDLE1` (`freertos.rst`
  L97–101; `freertos_idf.rst` L274).
- The main task (app_main) is priority 1 (above).
- System tasks for reference: `esp_timer` 22 (`esp_task.h` L46,
  `ESP_TASK_PRIO_MAX - 3` = 25 − 3; `freertos.rst` L121); `ipc0/ipc1` 24
  (`freertos.rst` L116; `esp_ipc.c` L22 `configMAX_PRIORITIES - 1`).
- Out of range: `configASSERT( uxPriority < configMAX_PRIORITIES )`, then a
  clamp to 24 (`tasks.c` L1111–1116). `configASSERT(a)` is `assert(a)`
  (`FreeRTOSConfig.h` L132). Asserts are enabled by default
  (`COMPILER_OPTIMIZATION_ASSERTIONS_ENABLE`, root `Kconfig` L374–376). So 25
  or more aborts by default.
- 5: one higher than main (1), well below the system tasks above.
- Higher number = higher priority, and the scheduler always runs the
  highest-priority Ready task: "the scheduler ensures the highest priority
  task that is able to run is the task selected to enter the Running state"
  (FreeRTOS kernel docs, Task Priorities; `taskSELECT_HIGHEST_PRIORITY_TASK`
  in `tasks.c` — line number not re-checked). The VO says "when two tasks are
  ready, the one with the higher priority runs first".
- Created higher than the running task means it runs straight away:
  `prvAddNewTaskToReadyList` → `if (taskIS_YIELD_REQUIRED(pxNewTCB, pdTRUE))
  taskYIELD_IF_USING_PREEMPTION()` (`tasks.c` L1315–1323). In the two-core
  build, `prvIsYieldRequiredSMP` yields the **current** core if the new task
  can run there and outranks its current task (`tasks.c` L827–846). app_main
  runs on CPU0 at 1; blink_fast (5, unpinned) outranks it. So CPU0 switches to
  blink_fast before `xTaskCreate` returns; app_main resumes when blink_fast
  blocks in `vTaskDelay`. *Derived from the code path.*

### 6 · handle
- "Used to pass back a handle by which the created task can be referenced"
  (`task.h` L327–328). `TaskHandle_t` is a pointer to the TCB (`task.h` L84–92).
  E.g. `vTaskDelete(handle)` deletes another task (`task.h` L84–86 comment).
- Passing NULL: the handle isn't written. *Derived:* `prvInitialiseNewTask`
  writes `*pxCreatedTask` only `if( pxCreatedTask != NULL )` (`tasks.c` L1220, end of
  `prvInitialiseNewTask`).

### Return value
- "@return pdPASS if the task was successfully created and added to a ready
  list, otherwise an error code defined in the file projdefs.h" (`task.h`
  L330–331).
- `pdPASS` = `pdTRUE` = **1**; `errCOULD_NOT_ALLOCATE_REQUIRED_MEMORY` =
  **-1** (`projdefs.h` L59–67). Returned when the stack or TCB allocation
  fails (`additions` L273–276).
- Not an `esp_err_t`: `ESP_OK` = **0** (`esp_err.h` L22). `ESP_ERROR_CHECK(x)`
  calls `_esp_error_check_failed` → `abort()` when `x != ESP_OK` (`esp_err.h`
  L115–121; `esp_system/esp_err.c` L46–50). So `ESP_ERROR_CHECK(xTaskCreate(…))`
  aborts on **success** (1 ≠ 0). *Derived.*

### Unpinned
- `xTaskCreate` calls `xTaskCreatePinnedToCore(…, tskNO_AFFINITY)` (`task.h`
  L370–395). "If configNUMBER_OF_CORES > 1, this function will create an
  unpinned task" (`task.h` L305–306). Unpinned tasks may run on either core
  (`freertos_idf.rst` L45, L86–88).
- The ESP32 runs FreeRTOS on both cores by default (`CONFIG_FREERTOS_UNICORE`
  default n on ESP32, `freertos/Kconfig` L23–26;
  `CONFIG_FREERTOS_NUMBER_OF_CORES` = 2, L652–658).

## vTaskDelay underneath

- `vTaskDelay(ticks)` with ticks > 0 puts the calling task on the delayed list
  (`prvAddCurrentTaskToDelayedList`, `tasks.c` L1579–1611, L6335) and yields.
  `vTaskDelay(0)` just forces a reschedule (L1583 comment).
- Ticks: `CONFIG_FREERTOS_HZ` default **100** (`freertos/Kconfig` L33–37) →
  `portTICK_PERIOD_MS` = 1000 / 100 = **10 ms** (`portmacro.h` L116).
- `pdMS_TO_TICKS(ms)` = ms × 100 / 1000 (integer) (`projdefs.h` L46). So 200
  → **20 ticks**, 500 → **50 ticks**.
- On each tick, `xTaskIncrementTick` checks `if( xConstTickCount >=
  xNextTaskUnblockTime )` and moves tasks whose time is up to the ready list
  (`tasks.c` L3203, L3250).
- When no other task is ready, the idle task runs (priority 0;
  `freertos_idf.rst` L269–274).

## Under the hood: xTaskCreate's path

*(The scene built on this was cut in the review pass; kept for reference.)*

1. `xTaskCreate` (static inline) → `xTaskCreatePinnedToCore(…,
   tskNO_AFFINITY)` (`task.h` L370–395).
2. `xTaskCreatePinnedToCore`: allocate the stack (`pvPortMallocStack`), then
   the TCB (`pvPortMalloc(sizeof(TCB_t))`). If either fails, return
   `errCOULD_NOT_ALLOCATE_REQUIRED_MEMORY` (`additions` L153–281).
3. `prvInitialiseNewTask`: `memset(pxStack, 0xa5, …)` (L1044); top of stack =
   the highest address, aligned (L1052–1056); copy the name and terminate it at
   15 (L1078–1103); `configASSERT(uxPriority < configMAX_PRIORITIES)`, store
   priority (L1111–1122); `xCoreID` (L1125).
4. `pxPortInitialiseStack`: build the first exception frame with `pc =
   vPortTaskWrapper`, args = your function + parameter (`port.c` L349–360).
5. `prvAddNewTaskToReadyList`: `prvAddTaskToReadyList(pxNewTCB)`; if the
   scheduler is running and the new task outranks the running task, yield
   (`tasks.c` L1233–1330, yield at L1319).
