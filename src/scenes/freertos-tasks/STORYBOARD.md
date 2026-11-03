# FreeRTOS tasks: storyboard v1 (pure ESP-IDF)

- Slug `freertos-tasks`, composition `FreeRTOSTasks`, output `out/freertos-tasks.mp4`, about 5½ min.
- **v2 (review pass):** steps paced one at a time; the task-function code *mutates* to show ending a task; `xTaskCreate` is first shown inside `app_main`; ×4 is emphatic; the overflow trap gets three lines; "higher priority runs first" is said; `b` is defined in the demo; the under-the-hood scene is dropped.
- Every claim is sourced in `FACTS.md`.
- First video in the FreeRTOS series. It follows `gpio` and `gpio-input` and comes **before** `gpio-interrupts` (see `AGENTS.md`, "Course order").
- GPIO is limited to the output calls from the `gpio` video, with each task driving its own pin.
- LED 1 is on GPIO 2 (as before) and LED 2 is on GPIO 19.

```c
#include "driver/gpio.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

typedef struct {
    gpio_num_t pin;
    uint32_t   delay_ms;
} blink_t;

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

## Arc

| # | Scene | Job |
|---|---|---|
| 1 | Problem | two LEDs at two rates; one loop makes both wait: 200+200+500+500 = 1400 ms |
| 2 | Answer | one loop per LED. The scheduler interleaves them, and app_main is already a task. Ends on the word **TASK** |
| 3 | The task function | `void fn(void *)`; set up the pin, loop forever (on · wait · off · wait, one at a time); never return (wrapper → abort); the code mutates: `while (1)` → `for (… 10 …)`, then `vTaskDelete(NULL)` |
| 4 | `xTaskCreate` ①: function, name, stack | opens in `app_main` (both calls; the first is pulled out); no brackets; 15 characters (`gpio_task_examp`); **bytes** not words — **×4**; what's on a stack; heap; 4096 / 1536; the trap: overflow → checked at each switch → name printed, reboot → the fix is a bigger stack |
| 5 | `xTaskCreate` ②: parameter, priority, handle, return | arg arrives; one function and two tasks; `static` lifetime; higher number runs first when both are ready; 0…24 (idle 0, main 1, esp_timer 22, ipc 24); 5 preempts app_main right away; NULL handle; pdPASS = 1 ≠ ESP_OK (don't use ESP_ERROR_CHECK); −1 when out of memory |
| 6 | Demo | the log shows `Returned from app_main()` and the LEDs keep going at 200 / 500 ms, in real time; two stacks, two copies of `b` (= `const blink_t *b = arg;`): one → `&fast`, one → `&slow` |
| 7 | What vTaskDelay does | Running → Blocked for N ticks; 10 ms tick, 200 ms = 20 ticks; tick check → Ready → Running; idle runs the rest; two cores (teaser) |
| 8 | Payoff | "Give every job its own loop. That's a task." + recap, next: the scheduler |

The VO lines are in `timeline.ts` (`VO`). The visual for each line:

## 1 · Problem
| VO | Visual |
|---|---|
| p1 two LEDs, two speeds | board: Wroom + LED on GPIO 2 + LED on GPIO 19. Wanted lanes: GPIO 2 square wave with 200 ms halves; GPIO 19 with 500 ms halves |
| p2 one loop … 1400 ms for both | code panel with the one-loop version, lines lighting as a playhead walks through them. Actual lanes draw underneath: the fast LED is on for 200 ms, then off for 1200 ms. Sum chip `200 + 200 + 500 + 500 = 1400 ms` ✗ |
| p3 juggle by hand … something already running | the counter-juggling sketch flashes in, dimmed, with "a scheduler, by hand" |

## 2 · Answer
| VO | Visual |
|---|---|
| a1 own loop, own delay | two loops side by side, each with its own lane, now at the right rates |
| a2 scheduler shares the CPU | a CPU lane: short `fast`/`slow` slices with idle between them |
| a3 FreeRTOS started first; app_main runs in task main | startup chain: `ESP-IDF startup → FreeRTOS scheduler → task "main" (priority 1 · CPU 0 · 4096 B) → app_main()` |
| a4 that's a task | TASK lands (word hero) |

## 3 · The task function (CodeAndViews: `blink_task` on the left)
| VO | Visual |
|---|---|
| f1 one void pointer, returns nothing | signature lit; `typedef void (*TaskFunction_t)(void *);` |
| f2 sets up its pin, loops forever | setup lines, then the loop lit; a mini LED blinking |
| f2a–f2d LED on. · Wait. · LED off. · Wait. | one step box per line, ~0.85 s apart |
| f2e the same calls as the blink video | pill |
| f3 must never return | wrapper diagram: `vPortTaskWrapper → blink_task(arg) → returns?` → red log `E (…) FreeRTOS: FreeRTOS Task "blink_fast" should not return, Aborting now!` → abort |
| f4 ten blinks; swap the loop; deletes itself | **the code panel mutates**: line 6 `while (1) {` → `for (int i = 0; i < 10; i++) {` (marked), then `vTaskDelete(NULL);` is inserted before the closing brace (marked). Right: an LED that blinks ten times and stops; the two edits as before → after chips |
| f5 NULL = the calling task; idle frees the stack | pill, verdict, note |

## 4 · xTaskCreate ① (Explainer, six cards)
| VO | Visual |
|---|---|
| c0 back in app_main, two calls | the `app_main` panel: both `xTaskCreate` lines, `&fast`/`&slow` labelled with their LED |
| c0b take the first one | the other lines fade to 15 %; the first call lights |
| c1 six arguments | the panel lifts away as the big call line arrives; cards in turn |
| c2 the function, no brackets | `blink_task` ✓ vs `blink_task()` ✗ "calls it now" |
| c3 name, 15 characters | the 16-cell name buffer: `blink_fast\0` fits; `gpio_task_example` → `gpio_task_examp\0` with "le" cut off |
| c4 bytes, not words; a word is four bytes | 2048 bytes vs vanilla 2048 words × 4 = 8192 bytes; `1 word = 32 bits = 4 bytes` |
| c4b four times as much | a big amber **×4** pops in |
| c5 what's on the stack; heap | stack column: locals (`b`), call frames (`gpio_set_level`), saved registers; "allocated from the heap at xTaskCreate" |
| c6 for scale | bars: main 4096 · ours 2048 · idle 1536 |
| c7 the trap: too small → past the end | "the trap: stack overflow"; the stack column fills call by call (`printf` among them) and runs past the end, red |
| c7b checked at every task switch → name printed, restarts | red log `***ERROR*** A stack overflow in task blink_fast has been detected.` → panic → restarts (… and again) |
| c7c you will meet this one; the fix | "this message = the task has outgrown its stack"; green verdict `xTaskCreate(…, 4096, …)`; the column turns into a bigger, green one |

## 5 · xTaskCreate ② (Explainer, same call)
| VO | Visual |
|---|---|
| q1 parameter arrives as arg | `&fast` → `void *arg` → `const blink_t *b = arg;` |
| q2 one function, two LEDs | `fast {GPIO 2, 200}` and `slow {GPIO 19, 500}` → two tasks, the same function |
| q3 must stay valid; static | app_main's stack is freed when it returns, so a pointer into it ✗ dangles; `static` lives for the whole program ✓ |
| q4 higher numbers win; ready at the same time → higher runs first | ladder with **5** on it; `higher number → runs first`; `both ready: main · 1` vs `blink_fast · 5 ← runs first` |
| q4b 0 idle, 1 app_main, top 24 | the other ladder marks: IDLE 0, main 1, esp_timer 22, ipc 24 |
| q5 preempts at once | CPU0 lane: `main` → xTaskCreate → `blink_fast` runs → blocks → `main` resumes |
| q6 handle | `TaskHandle_t h; … &h` → `vTaskDelete(h)`; or NULL |
| q7 pdPASS = 1, not esp_err_t | `pdPASS = 1` vs `ESP_OK = 0` → ESP_ERROR_CHECK(1) → abort ✗ |
| q8 −1 if out of memory | `errCOULD_NOT_ALLOCATE_REQUIRED_MEMORY = -1` |

## 6 · Demo
| VO | Visual |
|---|---|
| d1 creates both tasks, returns | log: `main_task: Calling app_main()` … `main_task: Returned from app_main()` |
| d2 each at its own pace | board with two LEDs blinking in real time at 200 / 500 ms; lanes |
| d3 own stack, own b: the pointer read from arg | two stack columns, each with a `b` row; between them `const blink_t *b = arg;` — "a local → one per stack" |
| d3b one b → fast, the other → slow | the rows become `b → &fast { GPIO_NUM_2, 200 }` and `b → &slow { GPIO_NUM_19, 500 }` |

## 7 · What vTaskDelay does
| VO | Visual |
|---|---|
| v1 off the CPU, blocked | state diagram Running → Blocked |
| v2 10 ms tick, 200 ms = 20 ticks | tick ruler, `pdMS_TO_TICKS(200) = 200 × 100 / 1000 = 20` |
| v3 tick check → ready → runs | counter 0→20; Blocked → Ready → Running |
| v4 idle the rest | lanes: tiny task slivers, a long idle span |
| v5 two cores (teaser) | CPU 0 / CPU 1 lanes; "unpinned: either core, see the two-cores video" |

## 8 · Payoff
"Give every job its own loop. That's a task." Recap:
- `void fn(void *arg) { while (1) … }` → never returns
- `xTaskCreate(fn, name, bytes, arg, prio, &h)` → a task
- `vTaskDelay` → blocks only this task
- `static` params · pdPASS, not ESP_OK
- next: the scheduler

## Decisions
- The under-the-hood descent (xTaskCreatePinnedToCore → heap → 0xA5 → wrapper frame → ready list) was cut in the review pass: too much for a first FreeRTOS video. Its facts stay in `FACTS.md`.
- No `ESP_LOGI` inside the tasks; logging is left to the stacks video. Only the startup log from `main_task` is shown.
- Two cores are mentioned once, as a teaser. Priorities beyond "5 outranks 1" are left for the scheduler video.
- Built without stopping for storyboard approval, as with the interrupts video.
