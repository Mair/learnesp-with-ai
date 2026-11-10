# FreeRTOS priority inversion: facts

Every claim on screen or in the VO, with its source. **ESP-IDF tag `v6.0.2`** (local
checkout `~/.espressif/v6.0.2/esp-idf`), FreeRTOS kernel **V10.5.1** as shipped in ESP-IDF
(`include/freertos/task.h` 62; SMP, two cores on the ESP32). Paths are relative to
`components/freertos/FreeRTOS-Kernel/` unless they start with `components/`; line numbers
are v6.0.2.

**Every log line on screen is real output**: the program in `lab/main/main.c` was built
with ESP-IDF v6.0.2 (target `esp32`, all defaults: `-Og`, Picolibc, GCC
`esp-15.2.0_20251204`, `CONFIG_FREERTOS_HZ` 100) and run in Espressif's QEMU
(`qemu-xtensa esp_develop_9.2.2_20250817`, machine `esp32`). Raw logs: `lab/logs/v0–v3.log`;
the variants are listed at the top of `main.c`. All three tasks are pinned to core 0, so the
load is one core (QEMU runs single-core busy loads faithfully; it's two-core busy loads it
can't, see freertos-scheduler `FACTS.md`). QEMU's clock is not a board's: **a board's times
differ a little**; the panels say "recorded in QEMU". The runs are repeatable: v0 gave 28 ms,
v1 1019 ms, v2 470 ms, v3 0 ms on every clean run (a run made while the machine was busy
rendering gave 32–39 ms for v0; those logs were discarded and re-run on an idle machine).

## Course order (what the program may use)

| Used | Taught in |
|---|---|
| `xTaskCreatePinnedToCore`, core 0 | freertos-two-cores |
| priorities, "higher runs first", `uxTaskPriorityGet` | freertos-scheduler |
| busy work on `esp_timer_get_time` | freertos-scheduler (`work_task`) |
| `xSemaphoreCreateMutex`, `xSemaphoreTake(…, portMAX_DELAY)`, `xSemaphoreGive`, `SemaphoreHandle_t` | freertos-mutexes |
| `vTaskDelay(pdMS_TO_TICKS(ms))`, `vTaskDelete(NULL)`, `ESP_LOGI` | freertos-tasks |
| a `volatile bool` flag | freertos-queues (try 1, the shared flag) |

`work(ms)` (lab `main.c`): `ms` times "busy-wait 1 ms on `esp_timer_get_time()`", so a task
that is pre-empted mid-way still owes the rest of its work (a single 50 ms wall-clock wait
would finish "for free" while the task wasn't running). On screen it's named, with a one-line
note; it's the scheduler video's busy loop in 1 ms steps.

## Priority inheritance: what FreeRTOS does

| # | Claim | Source |
|---|---|---|
| 1 | A task that blocks on a **mutex** makes the holder inherit its priority, if the holder's is lower | `queue.c` 1817–1821 (`xQueueSemaphoreTake`: "If this is a mutex, make the holder inherit our priority, then block": `if( pxQueue->uxQueueType == queueQUEUE_IS_MUTEX ) xInheritanceOccurred = xTaskPriorityInherit( … xMutexHolder )`); `tasks.c` 5061 (`if( pxMutexHolderTCB->uxPriority < pxCurrentTCBs[ xCurCoreID ]->uxPriority )` → the holder is moved to the waiter's priority) |
| 2 | When the holder gives the mutex back, it drops to its own (base) priority | `queue.c` 2466–2469 (give on a mutex → `xTaskPriorityDisinherit`); `tasks.c` 5184 (`pxTCB->uxPriority = pxTCB->uxBasePriority`, "only disinherit if no other mutexes are held", 5164) |
| 3 | If the waiter times out instead, the holder's priority is lowered again | `queue.c` 1842 / 1945 `vTaskPriorityDisinheritAfterTimeout`, `tasks.c` 5228 (not on screen) |
| 4 | Mutexes do this; binary semaphores don't ("does not use a priority inheritance mechanism") | `semphr.h` 66–72 (xSemaphoreCreateBinary: "…For this reason this type of semaphore does not use a priority inheritance mechanism. For an alternative that does use priority inheritance see xSemaphoreCreateMutex()"); `semphr.h` 643 (xSemaphoreCreateMutex: "This type of semaphore uses a priority inheritance mechanism") |
| 5 | A flag is plain memory: no kernel object, nothing to lend priorities | C semantics; the flag version's log prints `priority 1` (v1) |
| 6 | `uxTaskPriorityGet(NULL)` returns the calling task's **current** priority, inherited or not (the base one is separate) | `tasks.c` 1723–1735 (`pxTCB = prvGetTCBFromHandle( xTask ); uxReturn = pxTCB->uxPriority;` with the comment "If null is passed in here then it is the priority of the task that called uxTaskPriorityGet()"); base priority is `uxBasePriority` |
| 7 | Nothing to switch on: `configUSE_MUTEXES` is 1 in ESP-IDF | `components/freertos/config/include/freertos/FreeRTOSConfig.h` 104 |
| 8 | Inheritance can't make a task that is asleep finish sooner: it only changes who gets the CPU when the holder is ready | follows from 1 (it changes `uxPriority`, i.e. scheduling order); real run v2 (low sleeps 500 ms holding it at priority 3 → high waits 470 ms) |

## The runs (QEMU)

Times are relative to "low: took the lock". `vTaskDelay(pdMS_TO_TICKS(20/30))` = 2 / 3 ticks
at 100 Hz.

**Try 1, a flag (v1, `lab/logs/v1.log`)**
```
I (1636) inv: low: took the lock
I (1666) inv: medium: busy for 1000 ms
I (1686) inv: high: needs the lock
I (2666) inv: medium: done
I (2696) inv: low: priority 1, giving it back
I (2706) inv: high: got it after 1019 ms
```
Medium (2) pre-empts low (1) at +30 ms; high (3) polls the flag from +50 ms; low can't run
until medium is done (+1030); low finishes (+1060); high gets it at its next poll (+1070) →
1019 ms (high's own `esp_timer_get_time` measurement). VO: "one thousand and nineteen
milliseconds … almost all of that time, it was waiting for medium".

**Try 2, the mutex (v0, `lab/logs/v0.log`)**
```
I (1602) inv: low: took the lock
I (1632) inv: medium: busy for 1000 ms
I (1652) inv: high: needs the lock
I (1672) inv: low: priority 3, giving it back
I (1672) inv: high: got it after 28 ms
I (2662) inv: medium: done
```
Low ran 30 ms before medium took the CPU, so it owed 20 ms ("its last twenty milliseconds");
high blocked at +50 and low ran them at priority 3 (it prints 3); give at +70; high got it.
28 ms is high's measurement (it starts timing after its own log line).

**The trap (v2, `lab/logs/v2.log`)**: low calls `vTaskDelay(pdMS_TO_TICKS(500))` while holding
the mutex.
```
I (1620) inv: low: took the lock
I (1640) inv: medium: busy for 1000 ms
I (1650) inv: high: needs the lock
I (2120) inv: low: priority 3, giving it back
I (2120) inv: high: got it after 470 ms
I (2640) inv: medium: done
```

**The fix (v3, `lab/logs/v3.log`)**: 5 ms of work inside instead of 50.
```
I (1625) inv: low: took the lock
I (1635) inv: low: priority 1, giving it back
I (1655) inv: medium: busy for 1000 ms
I (1665) inv: high: needs the lock
I (1665) inv: high: got it after 0 ms
I (2655) inv: medium: done
```
Low is done (+10 ms, including its two log lines) before medium (+30) or high (+40) wake.

## Chart

The lanes chart is drawn from those log times (`timeline.ts` `RUN_FLAG`, `RUN_MUTEX`,
`RUN_SLEEP`), with high's short run after it gets the lock drawn as 15 ms (it only logs and
gives back). The axis is broken (0–100 ms, a squeezed 100–1000, 1000–1100) and says so on
screen ("900 ms squeezed").

## Not said (on purpose)

- Nested mutexes (a holder keeps the boost until it has given back **all** its mutexes,
  `tasks.c` 5164) and the timeout case (claim 3): true, not needed to use a mutex.
- The Mars Pathfinder story: no primary source read for this video.
- Two cores: with medium on core 1 the flag version wouldn't invert here; the video pins all
  three to core 0 and says so ("so they really do take turns on one CPU").
