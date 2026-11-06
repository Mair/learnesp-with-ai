# FreeRTOS stacks & watchdog: facts

Every claim on screen or in the VO, with its source. **ESP-IDF tag `v6.0.2`**
(local checkout `~/.espressif/v6.0.2/esp-idf`), FreeRTOS kernel **V10.5.1** as shipped
in ESP-IDF. Paths are relative to the ESP-IDF root; line numbers are v6.0.2.

**Every log line on screen is real output**, not a model: the program in `lab/main/main.c`
was built with ESP-IDF v6.0.2 (target `esp32`, all defaults: `-Og`
`CONFIG_COMPILER_OPTIMIZATION_DEBUG`, Picolibc `CONFIG_LIBC_PICOLIBC`, tick 100 Hz, stack
canary check) and run in Espressif's QEMU (`qemu-xtensa esp_develop_9.2.2_20250817`,
machine `esp32`). The raw logs are in `lab/logs/` (`v0` … `v5`, `vp`; variants listed at
the top of `main.c`). Rebuild: `idf.py -B /tmp/swlab/vN -DLAB_VARIANT=N build`, merge with
`esptool merge-bin --fill-flash-size 4MB`, run `qemu-system-xtensa -nographic -machine esp32
-drive file=flash.bin,if=mtd,format=raw`.

- *Stack numbers are exact for this binary.* They depend on the compiler, the options and
  the C library (Espressif: Picolibc "reduces the stack usage of `printf()` calls
  significantly", `ram-usage.rst` L99), so a learner on a different version or config
  sees numbers *close to* these. QEMU runs the same machine code as the chip, so the
  stack use is the same as on a board for the same build.
- *Timestamps are QEMU's* (boot to `app_main` ≈ 1.5 s in QEMU, shorter on a board). The
  gaps between lines (the 5 s watchdog, the 10 s trap) are what matter and are real.
- QEMU has no button and reads GPIO 18 as 0 (= pressed, with the pull-up not modelled).
  Variant 0 (the program exactly as shown) therefore sees one press at boot and stays
  stuck: that's the jam, for real. For the on-screen demo the press is at 3.57 s
  (variant 1: the button reads 1 until 2 s, then 0 for good; the press logs at the next
  10 ms poll after the 2 s boundary in task time). Labelled "recorded in QEMU (ESP32
  emulator) · the jam is simulated".

| Short | File |
|---|---|
| `task.h` | `components/freertos/FreeRTOS-Kernel/include/freertos/task.h` |
| `tasks.c` | `components/freertos/FreeRTOS-Kernel/tasks.c` |
| `FreeRTOSConfig.h` | `components/freertos/config/include/freertos/FreeRTOSConfig.h` |
| `portmacro.h` | `components/freertos/FreeRTOS-Kernel/portable/xtensa/include/freertos/portmacro.h` |
| `port.c` | `components/freertos/FreeRTOS-Kernel/portable/xtensa/port.c` |
| `ram-usage.rst` | `docs/en/api-guides/performance/ram-usage.rst` |
| `wdts.rst` | `docs/en/api-reference/system/wdts.rst` |
| `esp_task_wdt.h` | `components/esp_system/include/esp_task_wdt.h` |
| `task_wdt.c` | `components/esp_system/task_wdt/task_wdt.c` |
| `twdt_tg.c` | `components/esp_system/task_wdt/task_wdt_impl_timergroup.c` |
| `esp_system/Kconfig` | `components/esp_system/Kconfig` |
| `wdt example` | `examples/system/task_watchdog/main/task_watchdog_example_main.c` |

Reused from earlier videos' FACTS (same tag): stack size in **bytes** in ESP-IDF, words
in vanilla FreeRTOS; the stack comes from the heap when the task is created; too small →
`***ERROR*** A stack overflow in task blink_fast has been detected.` and a reboot; the
idle task stack 1536, the main task 4096 (freertos-tasks). The task watchdog watches
`IDLE0`/`IDLE1`, 5 s timeout, prints, panic off, repeats every 5 s; the button on GPIO 18
with pull-up, active low (freertos-scheduler). `pcTaskGetName(NULL)` (freertos-two-cores).
`ESP_ERROR_CHECK` (gpio); `xTaskCreate` returns `pdPASS`, not an `esp_err_t`
(freertos-tasks).

## The program

The tasks video's `blink_task` with one log line added, and a button task that counts
presses. All three at priority 5 (no workers in this video).

```c
#include "driver/gpio.h"
#include "esp_log.h"
#include "esp_task_wdt.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

#define BUTTON GPIO_NUM_18
static const char *TAG = "stacks";

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
        ESP_LOGI(TAG, "%s: %u bytes never used", pcTaskGetName(NULL), uxTaskGetStackHighWaterMark(NULL));
    }
}

static void button_task(void *arg)
{
    gpio_reset_pin(BUTTON);
    gpio_set_direction(BUTTON, GPIO_MODE_INPUT);
    gpio_set_pull_mode(BUTTON, GPIO_PULLUP_ONLY);
    ESP_ERROR_CHECK(esp_task_wdt_add(NULL));
    int presses = 0;
    while (1) {
        esp_task_wdt_reset();
        if (gpio_get_level(BUTTON) == 0) {          // pressed
            presses++;
            ESP_LOGI(TAG, "press %d", presses);
            while (gpio_get_level(BUTTON) == 0) {   // wait for the release
                vTaskDelay(pdMS_TO_TICKS(10));
            }
        }
        vTaskDelay(pdMS_TO_TICKS(10));
    }
}

static blink_t fast = { GPIO_NUM_2,  200 };
static blink_t slow = { GPIO_NUM_19, 500 };

void app_main(void)
{
    xTaskCreate(blink_task,  "blink_fast", 2048, &fast, 5, NULL);
    xTaskCreate(blink_task,  "blink_slow", 2048, &slow, 5, NULL);
    xTaskCreate(button_task, "button",     2048, NULL,  5, NULL);
}
```

- Builds with no warnings: `UBaseType_t` is `unsigned int` (`portmacro.h` L79, L83), so
  `%u` is right (as in freertos-scheduler).
- The "wait for the release" loop is plain polling with the calls Basic GPIO taught;
  the 10 ms poll is the scheduler video's.

## Too big wastes memory

- "In FreeRTOS, task stacks are usually allocated from the heap. The stack size for each
  task is fixed and passed as an argument to `xTaskCreate`. Each task can use up to its
  allocated stack size" (`ram-usage.rst` L51). The whole stack is allocated at creation
  (`pvPortMallocStack(usStackDepth * sizeof(StackType_t))`, freertos-tasks FACTS), so the
  unused part is still taken. VO: "The whole stack is set aside when the task is created,
  even the part it never uses."
- "determining the optimum sizes of each task stack … can all substantially reduce RAM
  usage" (`ram-usage.rst` L53).

## The high water mark: `uxTaskGetStackHighWaterMark`

- Declaration `UBaseType_t uxTaskGetStackHighWaterMark( TaskHandle_t xTask )`
  (`task.h` L1513). Enabled: `INCLUDE_uxTaskGetStackHighWaterMark 1`
  (`FreeRTOSConfig.h` L217). Header: `freertos/task.h` (already included).
- "Returns the high water mark of the stack associated with xTask. That is, the minimum
  free stack space there has been in bytes (as opposed to words in the standard FreeRTOS
  documentation) since the task started. The smaller the returned number the closer the
  task has come to overflowing its stack." (`task.h` L1495–1498).
- "@param xTask … Set xTask to NULL to check the stack of the calling task." (L1506–1507).
  VO: "NULL means this task, just like pcTaskGetName."
- "@return The smallest amount of free stack space there has been in bytes … since the
  task referenced by xTask was created." (L1509–1511).
- `ram-usage.rst` L86: "returns the minimum free stack memory of a task throughout the
  task's lifetime in bytes … Note that on ESP32, the function returns the value in bytes
  (not words…)". Same unit as the stack size passed to `xTaskCreate` (bytes, freertos-tasks).
- *Range:* 0 … the stack size. It never goes back up: it counts the untouched bytes from
  the far end of the stack (`tasks.c` L4807–4820 `prvTaskCheckFreeStackSpace` counts bytes
  still equal to the fill byte `0xa5`, `tasks.c` L90, L1044; once a byte has been
  written it is not refilled). *Not on screen* (engine); the VO says "it's the lowest so
  far, it never goes back up".
- *Who does the work:* it only reads; it changes nothing. (`tasks.c` L4867–4887: reads,
  returns.) Not said in the VO.
- *The picture:* the stack drawn as a column that fills **upward** as calls use it, with
  the end of the stack at the top. (The real stack grows down in memory; the direction is
  engine detail and not mentioned.) The level between marks is drawn for illustration;
  only the two marks carry numbers, and those are real (492 and 924 bytes used, below).

## Measured (QEMU, `lab/logs/v0.log`, stack 2048)

```
I (1976) stacks: blink_fast: 1556 bytes never used
I (2376) stacks: blink_fast: 1124 bytes never used
I (2576) stacks: blink_slow: 1552 bytes never used
I (2776) stacks: blink_fast: 1124 bytes never used
I (3176) stacks: blink_fast: 1124 bytes never used
I (3576) stacks: blink_slow: 1120 bytes never used
… blink_fast 1124 / blink_slow 1120 from then on
```

- First reading **1556**, then **1124** for good. The first is taken *before* the task's
  first `ESP_LOGI` has run (the argument is evaluated before the call). *Derived:* the
  first log line needed 1556 − 1124 = **432** more bytes.
- "String formatting functions (like `printf()`) are particularly heavy users of the
  stack, so any task which does not ever call these can usually have its stack size
  reduced." (`ram-usage.rst` L97). VO: "Printing a log line is one of the biggest users of
  stack." (`ESP_LOGI` formats like `printf`.)
- *Arithmetic:* used at most = 2048 − 1124 = **924** bytes. (First reading: 2048 − 1556 =
  **492**, "about 500".)
- blink_slow reads 4 bytes fewer (1552 / 1120). *Not explained* (same function; the
  difference is in what ran before the reading). The video shows blink_fast.
- "call `uxTaskGetStackHighWaterMark(NULL)` … after the time that the task has achieved
  its peak stack usage, i.e., if there is a main loop, execute the main loop a number of
  times with all possible states, and then call `uxTaskGetStackHighWaterMark`."
  (`ram-usage.rst` L88). → the trap's fix: "read it after the task has done everything it
  ever does".
- "Often, it is possible to subtract almost the entire value returned here from the total
  stack size of a task, but allow some safety margin to account for unexpected small
  increases in stack usage at runtime." (`ram-usage.rst` L89). → VO "you can give back
  most of the unused part, but keep a safety margin". Espressif gives no number for the
  margin; the video's 1536 is *an example*, not a rule.

## Resized (QEMU, `lab/logs/v5.log`, stack 1536)

```
I (1971) stacks: blink_fast: 1044 bytes never used
I (2371) stacks: blink_fast: 612 bytes never used
```

- 1536 − 924 = **612** ✓ (the same 924 used). 2048 − 1536 = **512** bytes given back.

## The stack trap (QEMU, `lab/logs/v4.log`, stack 768)

Sized from the first reading: 492 used + a margin → 768.

```
I (1957) stacks: blink_fast: 272 bytes never used
***ERROR*** A stack overflow in task blink_fast has been detected.
Backtrace: 0x40085cf9:0x3ffafc80 … |<-CORRUPTED
Rebooting...
rst:0xc (SW_CPU_RESET),boot:0x12 (SPI_FAST_FLASH_BOOT)
```

- 768 − 272 = 496 used before the first log (≈ 492 at 2048; the few bytes' difference is
  where the reading happens). Then the first `ESP_LOGI` needs ~924 > 768: it runs past the
  end. The canary check (on a task switch) catches it and the chip restarts
  (`port.c` L565–578 `vApplicationStackOverflowHook` → `esp_system_abort`; freertos-tasks
  FACTS). The message is the one freertos-tasks showed.
- Note the irony shown on screen: the line that says "272 bytes never used" is the line
  that overflows.

## The task watchdog (TWDT)

- "The TWDT primarily watches the Idle Tasks of each CPU, however any task can subscribe
  to be watched by the TWDT." (`wdts.rst` L89). By watching the idle tasks it detects
  "tasks running for a prolonged period of time without yielding" (L89) — the scheduler
  video's case.
- A task that waits with `vTaskDelay` yields, so the idle tasks still run and the idle
  check is satisfied. *Derived:* the idle hook resets the watchdog for its core
  (`task_wdt.c` `idle_hook_cb`, L457); idle tasks run whenever nothing else is ready.
  Confirmed: variant 3 (button jammed, task **not** subscribed) prints nothing at all
  (`lab/logs/v3.log`, 14 s: only `press 1`).
- Defaults: enabled, initialised at startup, **5 s**, range **1–60** s, watches CPU0 and
  CPU1 idle tasks, panic **off** (`esp_system/Kconfig` L295–356:
  `ESP_TASK_WDT_EN` y, `ESP_TASK_WDT_INIT` y, `ESP_TASK_WDT_PANIC` n,
  `ESP_TASK_WDT_TIMEOUT_S` default 5 range 1 60, `…CHECK_IDLE_TASK_CPU0/1` y).
  Menu: **Component config → ESP System Settings** (`esp_system/Kconfig` L2
  `menu "ESP System Settings"`). Prompts: "Task Watchdog timeout period (seconds)" (L331),
  "Invoke panic handler on Task Watchdog timeout" (L322).

### `esp_task_wdt_add(TaskHandle_t task_handle)`

- "Subscribe a task to the Task Watchdog Timer (TWDT). … Each subscribed task must
  periodically call esp_task_wdt_reset() to prevent the TWDT from elapsing its timeout
  period. Failure to do so will result in a TWDT timeout." (`esp_task_wdt.h` L80–83).
- "@param task_handle Handle of the task. Input NULL to subscribe the current running task"
  (L85). Returns `esp_err_t`: `ESP_OK` on success (L86–88). Implementation: NULL →
  `xTaskGetCurrentTaskHandle()` (`task_wdt.c` L673–675).
- Errors: `ESP_ERR_INVALID_STATE` "TWDT was never initialized" (L671; only if
  `ESP_TASK_WDT_INIT` is turned off), `ESP_ERR_INVALID_ARG` "task is already subscribed"
  (L196). → `ESP_ERROR_CHECK` is right: unlike `xTaskCreate` (pdPASS = 1), this returns
  `ESP_OK` (0). Espressif's example does exactly `ESP_ERROR_CHECK(esp_task_wdt_add(NULL));`
  (`wdt example` L39).
- Header `esp_task_wdt.h` (`wdt example` L16). Component `esp_system` (the lab's
  `main/CMakeLists.txt` lists it in `PRIV_REQUIRES`; a default project needs nothing).

### `esp_task_wdt_reset(void)`

- "Reset the Task Watchdog Timer (TWDT) on behalf of the currently running task. … Each
  subscribed task must periodically call this function to prevent the TWDT from timing
  out." (`esp_task_wdt.h` L108–112). No arguments: it always means *this* task
  (`task_wdt.c` L700 `xTaskGetCurrentTaskHandle()`).
- From a task that was never added: returns `ESP_ERR_NOT_FOUND` "task not found"
  (`task_wdt.c` L707). *Not in the video.*
- Espressif's example calls it once per loop, at the top (`wdt example` L53, loop L48–58).
  VO: "the check-in"; "at least every five seconds".
- *Simplification:* the hardware timer is shared; it is fed when every watched task has
  reset since the last feed (`task_wdt.c` L702–711, `task_wdt_timer_feed` L105–114).
  The idle tasks reset all the time, so in practice the watchdog fires 5 s after the
  watched task's last check-in. The video draws one countdown per task; the timings it
  shows are the real ones (below).

### Caught (QEMU, `lab/logs/v1.log`)

```
I (3573) stacks: press 1
E (8573) task_wdt: Task watchdog got triggered. The following tasks/users did not reset the watchdog in time:
E (8573) task_wdt:  - button (CPU 0/1)
E (8573) task_wdt: Tasks currently running:
E (8573) task_wdt: CPU 0: IDLE0
E (8573) task_wdt: CPU 1: IDLE1
E (8573) task_wdt: Print CPU 0 (current core) backtrace
…
E (13573) task_wdt: Task watchdog got triggered. …
E (13573) task_wdt:  - button (CPU 0/1)
```

- Exactly **5.000 s** after the press (the last check-in), then every 5 s. Format:
  `task_wdt.c` L789–817 (`" - %s%s"` L816; name + `" (CPU 0/1)"` for an unpinned task, L813).
  Running: L491–493 → both cores idle: the LEDs and the stuck task are all waiting.
- Panic off → it keeps running and repeats (`wdts.rst` L148: "the default behaviour is to
  simply print a warning and a backtrace before continuing running the app"; freertos-
  scheduler FACTS for the 5 s repeat).
- *Derived:* once the task checks in again (the button comes free → the loop resumes), the
  timer is fed and the messages stop (`task_wdt.c` L702–711). VO: "until the task checks
  in again". Not shown running.
- The LED logs keep going between the errors (v0/v1 logs) → "The LEDs never stopped."

### Panic on (QEMU, `lab/logs/vp.log`, `CONFIG_ESP_TASK_WDT_PANIC=y`)

```
E (8553) task_wdt:  - button (CPU 0/1)
…
E (8553) task_wdt: Aborting.
…
Rebooting...
rst:0xc (SW_CPU_RESET),boot:0x12 (SPI_FAST_FLASH_BOOT)
```

- "If you want a timeout to cause a panic and a system reset then this can be configured
  through `CONFIG_ESP_TASK_WDT_PANIC`." (`wdts.rst` L148). "Aborting." `task_wdt.c` L379.
  Reset reason hint `ESP_RST_TASK_WDT` (L380). Then it boots, and the jam (still there)
  trips it again 5 s after the next press (log L158–187).

### The watchdog trap (QEMU, `lab/logs/v2.log`): a 10 s wait

`vTaskDelay(pdMS_TO_TICKS(10000))` at the end of the button loop, button up:

```
E (6576) task_wdt:  - button (CPU 0/1)
E (16566) task_wdt:  - button (CPU 0/1)
E (26566) task_wdt:  - button (CPU 0/1)
```

- First 5 s after the first check-in (~1.57 s), then once every 10 s loop: the task checks
  in at ~11.57, 21.57 … and each time the next 5 s run out first. Nothing is stuck; the
  watchdog can't tell a long wait from a jam. *Derived from the reset rule above;
  confirmed by the log.*
- Fix: every wait in a watched task shorter than the timeout, or a longer timeout:
  "This should be set to at least as long as you expect any single task needs to
  monopolize the CPU" (`wdts.rst` L123) — Espressif's wording is about CPU hogging; the
  same timeout applies to a subscribed task's check-ins (`esp_task_wdt.h` L82–83).
- *Derived:* a check-in placed inside the release-wait loop would reset the watchdog
  every 10 ms even while jammed, so the jam would never be reported. VO: "keep the
  check-in in the main loop, not in the wait loop".

## Not in this video

- `esp_task_wdt_delete(NULL)` (`esp_task_wdt.h` L134–144), users
  (`esp_task_wdt_add_user`), `esp_task_wdt_init/reconfigure` at run time.
- The interrupt watchdog (IWDT, `wdts.rst` L48–82): needs interrupts (Advanced GPIO).
- `uxTaskGetSystemState` / all tasks' marks (`ram-usage.rst` L91): task stats video.
- Other overflow checks: end-of-stack watchpoint (`CONFIG_FREERTOS_WATCHPOINT_END_OF_STACK`);
  the hardware stack guard is only on chips with the Debug Assistant (not the ESP32)
  (`ram-usage.rst` L58–81).
- Big local arrays on the stack (`ram-usage.rst` L102); `static` buffers.
