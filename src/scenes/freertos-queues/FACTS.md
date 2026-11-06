# FreeRTOS queues: facts

Every claim on screen or in the VO, with its source. **ESP-IDF tag `v6.0.2`** (local
checkout `~/.espressif/v6.0.2/esp-idf`), FreeRTOS kernel **V10.5.1** as shipped in
ESP-IDF. Paths are relative to `components/freertos/FreeRTOS-Kernel/` unless they start
with `components/`, `docs/` or `examples/`; line numbers are v6.0.2.

**Every log line on screen is real output**: the program in `lab/main/main.c` was built
with ESP-IDF v6.0.2 (target `esp32`, all defaults) and run in Espressif's QEMU
(`qemu-xtensa esp_develop_9.2.2_20250817`, machine `esp32`). Raw logs: `lab/logs/v0…v4.log`;
the variants are listed at the top of `main.c`. QEMU has no button, so variants 1–4 replace
`gpio_get_level(BUTTON)` with a script of presses (60 ms each, times in ms since the
scheduler started); everything else is the program as shown. Panels say "recorded in QEMU
· the presses are simulated". Timestamps are QEMU's (boot ≈ 1.6 s); the gaps are real.

| Short | File |
|---|---|
| `queue.h` | `include/freertos/queue.h` |
| `queue.c` | `queue.c` |
| `tasks.c` | `tasks.c` |
| `projdefs.h` | `include/freertos/projdefs.h` |
| `portmacro.h` | `portable/xtensa/include/freertos/portmacro.h` |
| `FreeRTOSConfig.h` | `components/freertos/config/include/freertos/FreeRTOSConfig.h` |
| `gpio example` | `examples/peripherals/gpio/generic_gpio/main/gpio_example_main.c` |

Reused from earlier videos' FACTS (same tag): tick = 10 ms, `pdMS_TO_TICKS`; a task
created with a higher priority than the running task runs straight away (app_main is
priority 1) (freertos-tasks); blocked tasks cost no CPU (freertos-scheduler); the button on
GPIO 18 with pull-up and the edge detection `last == 1 && level == 0` (freertos-scheduler,
gpio-input); `ESP_LOGW` = the warning version of `ESP_LOGI` (freertos-delay-until);
`assert failed: …` stops the program and the chip restarts (freertos-two-cores,
freertos-tasks); `pdPASS` = `pdTRUE` = 1 (freertos-tasks).

## The program

```c
#include "driver/gpio.h"
#include "esp_log.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/queue.h"

#define LED    GPIO_NUM_2
#define BUTTON GPIO_NUM_18
static const char *TAG = "queue";

static QueueHandle_t press_queue;

static void button_task(void *arg)
{
    gpio_reset_pin(BUTTON);
    gpio_set_direction(BUTTON, GPIO_MODE_INPUT);
    gpio_set_pull_mode(BUTTON, GPIO_PULLUP_ONLY);
    int last = 1;
    int presses = 0;
    while (1) {
        int level = gpio_get_level(BUTTON);
        if (last == 1 && level == 0) {             // just pressed
            presses++;
            if (xQueueSend(press_queue, &presses, 0) != pdTRUE) {
                ESP_LOGW(TAG, "queue full: press %d dropped", presses);
            }
        }
        last = level;
        vTaskDelay(pdMS_TO_TICKS(10));
    }
}

static void led_task(void *arg)
{
    gpio_reset_pin(LED);
    gpio_set_direction(LED, GPIO_MODE_OUTPUT);
    int press;
    while (1) {
        xQueueReceive(press_queue, &press, portMAX_DELAY);   // sleeps until a press arrives
        ESP_LOGI(TAG, "press %d: blink", press);
        for (int i = 0; i < 3; i++) {
            gpio_set_level(LED, 1);
            vTaskDelay(pdMS_TO_TICKS(250));
            gpio_set_level(LED, 0);
            vTaskDelay(pdMS_TO_TICKS(250));
        }
    }
}

void app_main(void)
{
    press_queue = xQueueCreate(5, sizeof(int));
    xTaskCreate(button_task, "button", 2048, NULL, 5, NULL);
    xTaskCreate(led_task,    "led",    2048, NULL, 5, NULL);
}
```

- Builds with no warnings (`lab`, v0). Header `freertos/queue.h`, as in Espressif's GPIO
  example (`gpio example` L13).
- Three blinks of 250 ms on + 250 ms off = **1.5 s** per press (3 × 500 ms). Slow enough
  to see presses wait in the queue in real time.
- `sizeof(int)` = **4** on the ESP32 (32-bit Xtensa, `int` is 32 bits; `portmacro.h` L79
  `portBASE_TYPE int` is the 32-bit base type). VO: "four bytes".
- The NULL check on `xQueueCreate` is not in the program (Espressif's own GPIO example
  doesn't check either, `gpio example` L106); the VO says what NULL means.

## The problem: a shared variable (illustration)

- A `bool pressed` flag set by one task and polled by another: the reader has to wake up
  and look every time round its loop, and two presses before it looks set the same flag
  once → it sees one press. *Derived (plain C logic).* Drawn as an illustration, no log.
- Sharing a variable between tasks safely is the mutex video (course order); the VO only
  points there.

## What a queue is

- "Items are queued by copy, not by reference" (`queue.h` L108–109, L403, L478…). Receive:
  "The item is received by copy so a buffer of adequate size must be provided"
  (L746–748). "Successfully received items are removed from the queue" (L750).
- `xQueueSend` = `xQueueSendToBack` (L400–401, L469–470: `queueSEND_TO_BACK`); receive
  takes from the front → oldest first (FIFO). Confirmed: v1/v2 logs come out 1, 2, 3, 4 …
- An empty queue makes the receiver block (`queue.c` L1619 / L1654:
  `vTaskPlaceOnEventList( &( pxQueue->xTasksWaitingToReceive ), …)`); a send unblocks the
  highest-priority waiting receiver. Blocked = no CPU (freertos-scheduler FACTS).

## `xQueueCreate(uxQueueLength, uxItemSize)`

- `#define xQueueCreate( uxQueueLength, uxItemSize ) xQueueGenericCreate(…)` (`queue.h`
  L149). Returns a `QueueHandle_t` (`queue.h` L55, a pointer to the queue).
- "@param uxQueueLength The maximum number of items that the queue can contain."
  (L105). "@param uxItemSize The number of bytes each item in the queue will require. Items
  are queued by copy … this is the number of bytes that will be copied for each posted item.
  Each item on the queue must be the same size." (L107–110)
- "@return If the queue is successfully create then a handle to the newly created queue is
  returned. If the queue cannot be created then 0 is returned." (L112–114) → NULL.
- Memory: one `pvPortMalloc( sizeof( Queue_t ) + xQueueSizeInBytes )` (`queue.c` L545),
  `xQueueSizeInBytes = uxQueueLength * uxItemSize` (L534) → 5 × 4 = **20 bytes** for the
  items, plus the queue's own bookkeeping, from the heap, once, at creation. Length 0 is
  rejected (L525 `uxQueueLength > 0`). *The size of `Queue_t` is not shown.*
- Espressif's example creates its queue **before** the task that uses it
  (`gpio example` L106–108).

## `xQueueSend(xQueue, pvItemToQueue, xTicksToWait)`

- "@param pvItemToQueue A pointer to the item that is to be placed on the queue. The size
  of the items the queue will hold was defined when the queue was created, so this many
  bytes will be copied from pvItemToQueue into the queue storage area." (`queue.h`
  L407–410) → `&presses`, 4 bytes copied. *Derived:* because it's a copy, `presses` can
  change straight after; the queue keeps the value it had.
- "@param xTicksToWait The maximum amount of time the task should block waiting for space
  to become available on the queue, should it already be full. The call will return
  immediately if this is set to 0 and the queue is full." (L412–415). In ticks →
  `pdMS_TO_TICKS(…)`.
- "@return pdTRUE if the item was successfully posted, otherwise errQUEUE_FULL." (L420)
  `errQUEUE_FULL` = 0 (`projdefs.h` L64). Not an `esp_err_t` (like `xTaskCreate`'s
  `pdPASS`, freertos-tasks) → compare with `pdTRUE`, no `ESP_ERROR_CHECK`.
- "This function must not be called from an interrupt service routine" (L404) — not in
  the VO (interrupts come later, gpio-interrupts).

## `xQueueReceive(xQueue, pvBuffer, xTicksToWait)`

- Declaration `queue.h` L825–827. "@param pvBuffer Pointer to the buffer into which the
  received item will be copied." (L758–759) → `&press`.
- "@param xTicksToWait The maximum amount of time the task should block waiting for an
  item to receive should the queue be empty at the time of the call. xQueueReceive() will
  return immediately if xTicksToWait is zero and the queue is empty." (L761–764)
- "@return pdTRUE if an item was successfully received from the queue, otherwise pdFALSE."
  (L768–769)
- `portMAX_DELAY` = `0xffffffff` ticks (`portmacro.h` L90). With `INCLUDE_vTaskSuspend 1`
  (`FreeRTOSConfig.h` L211) it means **wait forever**: "the task should block indefinitely,
  and therefore never time out" (`tasks.c` L4189–4194); the task goes on the suspended list
  "to ensure it is not woken by a timing event" (`tasks.c` L6381–6386). Espressif's GPIO
  example waits the same way (`gpio example` L69).
- Timeout example (v4, `pdMS_TO_TICKS(2000)` instead of `portMAX_DELAY`, the press at
  5000 ms): `I (3613) queue: no press for 2 s` / `I (5613) … no press for 2 s` /
  `I (6613) queue: press 1: blink` / `I (10113) queue: no press for 2 s` (1.5 s of blinks,
  then 2 s of waiting). Shown as a variant
  in the Explainer, labelled.

## Demo (QEMU, `lab/logs/v1.log`): one press, then three quick ones

Presses at 1000 ms, then 8940, 9090, 9240 ms (scheduler time; timed to the narration's
"press once" / "now press three times, quickly"):

```
I (1633) main_task: Returned from app_main()
I (2633) queue: press 1: blink
I (10573) queue: press 2: blink
I (12073) queue: press 3: blink
I (13573) queue: press 4: blink
```

- Press 1 = log 2633 → received at once, the LED task was waiting. Press 2 (log 10573) is
  taken at once; presses 3 and 4 (log ~10723, ~10873) wait in the queue and come out
  **1.5 s apart, in order** (12073, 13573) — each as soon as the blinks before it end.
- *Derived for the picture:* send times = press times (±10 ms poll); the box holding press 3
  is filled ~10723–12073, press 4 ~10873–13573. Receive times are the logged ones.
- The button task never waited: `xQueueSend` with 0 ticks returns at once (`queue.h`
  L412–415) and there was room.

## A burst (QEMU, `lab/logs/v2.log`): eight presses, room for five

Presses every 120 ms from 1000 ms (log 2643 …):

```
I (2643) queue: press 1: blink
W (3363) queue: queue full: press 7 dropped
W (3483) queue: queue full: press 8 dropped
I (4143) queue: press 2: blink
I (5643) queue: press 3: blink
I (7143) queue: press 4: blink
I (8643) queue: press 5: blink
I (10143) queue: press 6: blink
```

- Press 1 is taken straight away; presses 2–6 (log 2763 … 3123) fill the 5 boxes; presses
  7 (3363 = 2643 + 720) and 8 (3483) find 5 waiting → with 0 ticks to wait, `xQueueSend`
  returns `errQUEUE_FULL` at once and the warning prints. Press 2 only leaves at 4143.
- Fixes (VO): a longer queue, or let the sender wait (`xTicksToWait` > 0). *Not shown
  running.*

## The trap (QEMU, `lab/logs/v3.log`): the queue created after the tasks

```
I (1591) main_task: Calling app_main()
assert failed: xQueueReceive queue.c:1531 (( pxQueue ))
Backtrace: …
Rebooting...
```

…and again after every reboot (8 times in the log): a boot loop.

- `xTaskCreate(led_task, …)` at priority 5 outranks app_main (1), so `led_task` runs
  straight away (freertos-tasks FACTS) and calls `xQueueReceive` while `press_queue` is
  still NULL (a static is zero until assigned). `configASSERT( ( pxQueue ) )` (`queue.c`
  L1531) fails. Fix: create the queue first (Espressif's order, `gpio example` L106–108).
- `xQueueSend` has the same check (`queue.c` L936).

## Not in this video

- `…FromISR` variants (gpio-interrupts), `xQueueSendToFront`, `xQueueOverwrite`,
  `xQueuePeek`, `uxQueueMessagesWaiting` (`queue.h` L839), queue sets, static queues.
- Sending structs or pointers (Espressif's example sends pointers for big structs,
  `queue.h` L135–137).
