# FreeRTOS mutexes: facts

Every claim on screen or in the VO, with its source. **ESP-IDF tag `v6.0.2`** (local
checkout `~/.espressif/v6.0.2/esp-idf`), FreeRTOS kernel **V10.5.1** as shipped in
ESP-IDF (SMP, two cores on the ESP32). Paths are relative to
`components/freertos/FreeRTOS-Kernel/` unless they start with `components/` or
`examples/`; line numbers are v6.0.2.

**Every log line on screen is real output**: the program in `lab/main/main.c` was built with
ESP-IDF v6.0.2 (target `esp32`, all defaults: `-Og` (`CONFIG_COMPILER_OPTIMIZATION_DEBUG`),
Picolibc, GCC `esp-15.2.0_20251204`) and run in Espressif's QEMU (`qemu-xtensa
esp_develop_9.2.2_20250817`, machine `esp32`, both cores). Raw logs: `lab/logs/`; the
variants are listed at the top of `main.c`. QEMU's clock is not a board's: **times and the
lost counts differ on a board** (and from run to run); panels say "recorded in QEMU".

| Short | File |
|---|---|
| `semphr.h` | `include/freertos/semphr.h` |
| `queue.c` | `queue.c` |
| `tasks.c` | `tasks.c` |
| `FreeRTOSConfig.h` | `components/freertos/config/include/freertos/FreeRTOSConfig.h` |
| `lock example` | `examples/system/freertos/basic_freertos_smp_usage/main/lock_example.c` |
| `log_lock.c` | `components/log/src/os/log_lock.c` |

Reused from earlier videos' FACTS (same tag): `xTaskCreatePinnedToCore` and the two cores,
both running at the same moment (freertos-two-cores; the `work_task` / `work_a` / `work_b`
names come from there); `pcTaskGetName(NULL)` (freertos-stacks-watchdog); `vTaskDelete(NULL)`
ends the task (freertos-tasks); a blocked task costs no CPU (freertos-scheduler);
`portMAX_DELAY` = wait forever, `pdTRUE`/`pdFALSE`, not `esp_err_t` (freertos-queues);
`ESP_LOGW` (freertos-delay-until); `assert failed: …` → restart (freertos-queues); create
the queue *before* the tasks that use it (freertos-queues trap).

## The program (variant 0, as shown)

```c
#include "esp_log.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/semphr.h"

static const char *TAG = "total";

static int total = 0;
static SemaphoreHandle_t total_lock;

static void work_task(void *arg)
{
    for (int i = 0; i < 1000000; i++) {
        xSemaphoreTake(total_lock, portMAX_DELAY);
        total++;
        xSemaphoreGive(total_lock);
    }
    ESP_LOGI(TAG, "%s done: total = %d", pcTaskGetName(NULL), total);
    vTaskDelete(NULL);
}

void app_main(void)
{
    total_lock = xSemaphoreCreateMutex();
    xTaskCreatePinnedToCore(work_task, "work_b", 2048, NULL, 5, NULL, 1);
    xTaskCreatePinnedToCore(work_task, "work_a", 2048, NULL, 5, NULL, 0);
}
```

- Same shape as Espressif's own `lock example` (two tasks, `s_global_num++` under a mutex,
  `ITERATION_NUMBER 100000`, L13, L31–35).
- **Why core 1's task is created first** (shown, not explained in depth): app_main runs on
  core 0 at priority 1; creating a priority-5 task on core 0 runs it at once (freertos-tasks),
  so if work_a (core 0) came first it would finish its million before app_main even created
  work_b, and the two would never overlap. Creating work_b (core 1) first starts it without
  stopping app_main. *Seen in the lab:* the first build created a then b, and printed
  exactly 1,000,000 then 2,000,000 with no guard.
- `int total` (no `volatile`): at `-Og` GCC keeps the load, add, store inside the loop (the
  lab binary disassembled: `l32i` / `add` / `s32i` each time round), so the race shows. At
  higher optimisation the compiler may keep it in a register; not covered.

## The want: two tasks, one total

- Two workers, one pinned to each core (freertos-two-cores), each adds 1 to `total` a
  million times → expected **2,000,000**.

## Try 1: just `total++` (QEMU, `lab/logs/v1*.log`)

```
I (1583) total: work_b done: total = 1149796
I (1583) total: work_a done: total = 1455343        ← v1.log
I (1604) total: work_a done: total = 1260172        ← v1-run2.log
I (1608) total: work_a done: total = 1284719        ← v1-run3.log
```

- The last task to finish prints the final total: **1,455,343, not 2,000,000** → 544,657
  adds lost. Three runs, three different totals.
- *Why (plain words, the behaviour, not the engine):* `total++` reads total, adds one, writes
  it back. When both cores do that at the same moment, both read the same value and both
  write value + 1: two adds, total goes up by one. (Load/add/store in the disassembly above.)
- "In slower code it happens less often, so it hides": *derived* — the collision needs both
  tasks between the read and the write at the same moment; fewer updates, fewer collisions.
  No number is claimed.

## Try 2: a mutex (QEMU, `lab/logs/v0.log`, `v0-run2.log`)

```
I (1600) main_task: Returned from app_main()
I (24930) total: work_b done: total = 1939261
I (25140) total: work_a done: total = 2000000
```

- **2,000,000 exactly** (v0 and v0-run2).
- Cost: in QEMU the guarded run took ~23.5 s (1600 → 25140 ms) against ~0 ms unguarded
  (v1: app_main returned and both "done" lines at the same ms). *QEMU's times, not a board's*;
  the VO says "in QEMU" and only claims that taking the lock a million times costs time.

## What a mutex is (ESP-IDF FreeRTOS)

- `SemaphoreHandle_t` is a `QueueHandle_t` (`semphr.h` L42). A mutex is a queue of length 1,
  item size 0 (`queue.c` L664–672, `xQueueCreateMutex`: `uxMutexLength = 1, uxMutexSize = 0`).
- It **starts free**: "Start with the semaphore in the expected state" → one give at creation
  (`queue.c` L649–650 in `prvInitialiseMutex`).
- **Take is one step**: inside `taskENTER_CRITICAL( &( pxQueue->xQueueLock ) )` (`queue.c`
  L1727) it checks the count and takes it (L1731–1742), and records the holder
  (`xMutexHolder = pvTaskIncrementMutexHeldCount()`, L1750). Two tasks can't both get it.
  VO: "Taking the key is one step: two tasks can never both get it."
- A task that can't take it blocks (no CPU) until it's given or its wait runs out (same
  queue machinery as `xQueueReceive`, freertos-queues FACTS).
- "This type of semaphore uses a priority inheritance mechanism so a task 'taking' a
  semaphore MUST ALWAYS 'give' the semaphore back once the semaphore it is no longer
  required." (`semphr.h` L643–645). Priority inheritance → the next video (priority
  inversion); not explained here.
- "Mutex type semaphores cannot be used from within interrupt service routines."
  (`semphr.h` L647) — not in the VO (interrupts come later).
- Enabled: `configUSE_MUTEXES 1` (`FreeRTOSConfig.h` L104).
- Aside (not on screen): ESP-IDF's own logging keeps each log line whole with a mutex
  (`log_lock.c` L23–32, `xSemaphoreCreateMutex` / `xSemaphoreTake`).

## `xSemaphoreCreateMutex()`

- `#define xSemaphoreCreateMutex() xQueueCreateMutex( queueQUEUE_TYPE_MUTEX )` (`semphr.h`
  L678). No arguments.
- "@return If the mutex was successfully created then a handle to the created semaphore is
  returned. If there was not enough heap to allocate the mutex data structures then NULL is
  returned." (`semphr.h` L654–656)
- From the heap, once (dynamic allocation; queue of length 1, item size 0 → just the
  queue's own bookkeeping, `queue.c` L534/L545 with `uxItemSize` 0).
- Header `freertos/semphr.h`. The name says "semaphore": a mutex is one kind of semaphore;
  semaphores have their own video later (course order).
- Like the queue: make it in app_main **before** the tasks that use it (same reason as the
  queues trap: a higher-priority task runs at once, freertos-queues FACTS).

## `xSemaphoreTake(xSemaphore, xBlockTime)`

- `#define xSemaphoreTake( xSemaphore, xBlockTime ) xQueueSemaphoreTake(…)` (`semphr.h` L279).
- "@param xBlockTime The time in ticks to wait for the semaphore to become available. …
  A block time of zero can be used to poll the semaphore. A block time of portMAX_DELAY can
  be used to block indefinitely (provided INCLUDE_vTaskSuspend is set to 1 …)" (L229–233).
- "@return pdTRUE if the semaphore was obtained. pdFALSE if xBlockTime expired without the
  semaphore becoming available." (L235–236) → with a time limit, check it: pdFALSE = you
  don't have the key, don't touch `total`.

## `xSemaphoreGive(xSemaphore)`

- `#define xSemaphoreGive( xSemaphore ) xQueueGenericSend( …, NULL, semGIVE_BLOCK_TIME,
  queueSEND_TO_BACK )` (`semphr.h` L428), `semGIVE_BLOCK_TIME` = 0 (L46): it never waits.
- "@return pdTRUE if the semaphore was released. pdFALSE if an error occurred. …
  indicating that the semaphore was not first obtained correctly." (L385–388)
- The holder clears (`xMutexHolder = NULL`, `queue.c` L2469–2470), and the highest-priority
  waiting task is woken and can take it.
- **Only the task that took it may give it back.** Giving from another task trips
  `configASSERT( pxTCB == pxCurrentTCBs[ portGET_CORE_ID() ] )` in `xTaskPriorityDisinherit`
  (`tasks.c` L5156). QEMU, `lab/logs/v6.log` (work_a takes and keeps it; work_b gives):

```
I (1574) total: work_a took total_lock
I (1674) total: work_b gives total_lock
assert failed: xTaskPriorityDisinherit tasks.c:5156 (pxTCB == pxCurrentTCBs[ xPortGetCoreID() ])
```

## Keep it short (QEMU, `lab/logs/v5.log`)

Variant 5: count in a local `int mine`, then take once, `total += mine;`, give:

```
I (1767) total: work_a done: total = 1000000
I (1767) total: work_b done: total = 2000000
```

- Correct, and one take and one give per task instead of a million. *Not claimed:* a time
  for this run (the compiler folds the local loop, so its speed isn't the lock's doing).

## The trap: leaving without giving it back (QEMU, `lab/logs/v3.log`, `v4.log`)

Variant 3: inside the locked part, `if (total >= 1500000) { break; }` — the task leaves the
loop still holding `total_lock`, prints, and deletes itself:

```
I (1574) main_task: Returned from app_main()
I (20234) total: work_a done: total = 1500000
```

…then nothing, for the rest of the 40 s run: work_b waits on `portMAX_DELAY` forever. No
error, no crash, no watchdog (a blocked task isn't hogging a CPU; the idle tasks still run).
FreeRTOS doesn't hand back a mutex held by a deleted task (`semphr.h` L643–645: the taker
must give).

Variant 4: the same bug, but the take waits at most `pdMS_TO_TICKS(1000)` and logs on
pdFALSE:

```
I (20144) total: work_b done: total = 1500000
W (21144) total: work_a: total_lock not free for 1 s
W (22144) total: work_a: total_lock not free for 1 s
W (23144) total: work_a: total_lock not free for 1 s
```

(Which worker stops first differs between runs.) Fix: give it back before every way out
(`xSemaphoreGive(total_lock); break;`).

## Not in this video

Priority inheritance / inversion (next video), recursive mutexes, `xSemaphoreGetMutexHolder`,
mutexes in ISRs (not allowed), spinlocks / critical sections (later), atomics, `volatile`.
