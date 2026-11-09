> **v2 (narration pass):** VO rewritten to `SCRIPT.md` "Sound like a teacher, not a list"; opens
> "Let's say you want the LEDs from the scheduler video to keep their beat…"; the pinned log and
> the core-2 assert are real QEMU output; the model's logs are labelled illustrations. As built:
> 3:26 (206.4 s).

# FreeRTOS two cores: storyboard v1 (simple English, as built)

- **As built:** VO lines are in `timeline.ts` (`VO`), timed by `scripts/vo-plan.ts`; 3:17. Wording changed where the voice or Whisper needed it: h1 "Which core should the workers use?" ("pick" → heard "course"), a3/t5 "A task you pin…" ("a pinned task" was heard "a pin task"), e5 "One pins the task to core 1", c7 "With pinning, they always say core 1", t6 "Only pin a task when you have a reason", z1 "…That's how you use both cores." ("That's two cores" was heard "too coarse"). The scenes' slugs: problem, answer, home, pin, which, demo, price, payoff.
- The lanes, the logs and the LED ticks come from `sim.ts` (three runs: unpinned at 6, pinned to core 1 at 6, unpinned at 4). The unpinned log is the model's too (work_a: core 0, then core 1), not a made-up example.

- Slug `freertos-two-cores`, composition `FreeRTOSTwoCores`, output `out/2-freertos/freertos-two-cores.mp4`, about 4 min.
- Comes after `freertos-delay-until`. Next video: stacks & watchdog. Every claim is in `FACTS.md`.
- Same board and program as the scheduler video, without the button: LED 1 on GPIO 2 (every 200 ms), LED 2 on GPIO 19 (every 500 ms), both priority 5; two busy workers at priority 6.
- New calls: `xTaskCreatePinnedToCore`, `esp_cpu_get_core_id`, `pcTaskGetName(NULL)`. New name: `tskNO_AFFINITY`.
- Very simple English: short sentences, one idea per line, every new word explained the first time. No "affinity" in the VO except when reading `tskNO_AFFINITY` out loud; no "SMP", "PRO_CPU", "APP_CPU".

## The video in one paragraph

In the scheduler video, two busy workers at priority 6 made an LED stumble, because they
could take **both** cores. `xTaskCreate` lets a task run on either core; FreeRTOS picks.
`xTaskCreatePinnedToCore` lets **you** pick: pin the workers to core 1 and core 0 is
always free for the LEDs, without touching a priority. We ask a task which core it's on
(`esp_cpu_get_core_id`), then see the price: the two workers now share one core and get
half as much done, while core 0 sits almost empty. Pin only when you have a reason.

## Words the video uses

| Word | What we say it means |
|---|---|
| core | one CPU. The ESP32 has two: core 0 and core 1. |
| pin | tell FreeRTOS a task may only run on one core |
| either core | the task can run on core 0 or core 1; FreeRTOS picks each time |

## The program

```c
#include "esp_cpu.h"          // esp_cpu_get_core_id()

static const char *TAG = "cores";

static void work_task(void *arg)      // the worker from the scheduler video
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

## The scenes

| # | Scene | What the learner should take away |
|---|---|---|
| 1 | The problem | The workers could take both cores, so the LED stumbled. `xTaskCreate` = either core. |
| 2 | The answer | Pin the workers to core 1 → core 0 stays free. → hero **PIN** |
| 3 | Who lives on core 0 | `app_main` and ESP-IDF's own tasks (Wi-Fi, Bluetooth) → core 1 for your heavy work. |
| 4 | `xTaskCreatePinnedToCore` | The same six arguments + the core: 0, 1 or `tskNO_AFFINITY`. Anything else stops the program. |
| 5 | Which core am I on? | `esp_cpu_get_core_id()` → 0 or 1. Pinned workers always print core 1. |
| 6 | Demo | Workers on core 1, still priority 6. Both LEDs keep their beat. |
| 7 | The price | Two workers share core 1: half as much done each; core 0 almost empty. A pinned task never moves. |
| 8 | Recap | One line, four points, next video. |

The CPU lanes, LED lanes and LED ticks come from one model (`sim.ts`, "worked out from
the rules", like the scheduler video's).

## 1 · The problem
*Start from the stumble the learner has already seen.*

| VO | Visual |
|---|---|
| p1 "In the scheduler video, two busy workers had priority six." | two core lanes "core 0", "core 1" (as in the scheduler video); worker chips `work_a`, `work_b` (6) |
| p2 "The LEDs had priority five, so the workers went first." | LED chips (5) beside them; "6 > 5" |
| p3 "And the workers could use both cores." | lanes fill with the workers' spans on **both** cores (model: unpinned, 6) |
| p4 "So sometimes the LED found no free core, and it was late." | LED 1 trace below: switches at 0, 200, then 600, 1000 …; red "late" marks |
| p5 "That's because X task create lets a task run on either core." | code: the two `xTaskCreate(work_task, …)` lines lit; caption "xTaskCreate → either core" |
| p6 "FreeRTOS picks the core. It can pick a different one next time." | a worker chip hops core 0 → core 1 → core 0 |
| p7 "What if the workers could only use core 1?" | core 0's lane empties of workers; "?" |

## 2 · The answer

| VO | Visual |
|---|---|
| a1 "Then core 0 would always be free for the LEDs." | core 0 lane: only LED blips; core 1: the workers |
| a2 "You can do that. You pin a task to a core." | a pin drops onto each worker chip, fixing it to core 1 |
| a3 "A pinned task only runs on that core. It never moves." | the chip tries to slide to core 0, bounces back |
| a4 "That's called pinning." | hero **PIN** (gradient) |

## 3 · Who lives on core 0

| VO | Visual |
|---|---|
| h1 "Which core should you pick?" | two big core boxes |
| h2 "app_main runs on core 0." | chip `app_main` (1) in core 0 |
| h3 "So do ESP-IDF's own tasks, like Wi-Fi and Bluetooth, when you use them." | chips `Wi-Fi`, `Bluetooth` join core 0 (dashed: "when you use them") |
| h4 "So core 1 is a good home for your own heavy work." | worker chips land in core 1 ✓ |

## 4 · `xTaskCreatePinnedToCore`
*Context first: the code the learner knows, then one line lifted out.*

| VO | Visual |
|---|---|
| e0 "Here's app_main from the scheduler video." | code: `app_main` with four `xTaskCreate` calls |
| e1 "Change the two workers to X task create pinned to core." | the two worker lines change on screen: name → `xTaskCreatePinnedToCore`, `, 1` added at the end (marked) |
| e2 "It takes the same six arguments as X task create, in the same order." | Explainer: the work_a line lifted out; one card over the first six: "same as xTaskCreate" |
| e3 "The new one is last: the core." | card **core** = `1` |
| e4 "Zero pins the task to core 0." | view: core boxes; `0` → chip pinned in core 0 |
| e5 "One pins it to core 1." | `1` → chip pinned in core 1 |
| e6 "T S K no affinity means either core. That's what X task create does." | `tskNO_AFFINITY` → chip between the boxes, free to go either way; "= xTaskCreate" |
| e7 "Any other number, like two, is a mistake." | `2` in red; no core 2 box |
| e8 "The program stops, with an error that starts with assert failed." | serial: `assert failed: xTaskCreatePinnedToCore …` |
| e9 "Like X task create, it returns P D pass when the task is made." | card: returns `pdPASS` |

## 5 · Which core am I on?

| VO | Visual |
|---|---|
| c1 "How can you tell which core a task is on?" | `work_task` code |
| c2 "Ask it. E S P C P U get core ID returns the core that is running this line." | a line is inserted at the top of the loop: `ESP_LOGI(TAG, "%s on core %d", pcTaskGetName(NULL), esp_cpu_get_core_id());`; `esp_cpu_get_core_id()` marked |
| c3 "On the ESP32 that's zero or one." | big `0` / `1` |
| c4 "It comes from E S P C P U dot H." | `#include "esp_cpu.h"` inserted at the top (marked) |
| c5 "P C task get name, with NULL, gives the name of the task that calls it." | `pcTaskGetName(NULL)` marked: "this task's own name" |
| c6 "Each worker now prints its name and its core, every time round the loop." | serial panel opens |
| c7 "Pinned, they always say core 1." | log: `I (…) cores: work_a on core 1`, `work_b on core 1` … ("example output") |
| c8 "Without pinning, the same line could say core 0 or core 1." | second log: mixed core 0 / core 1 ("example output") |

## 6 · Demo

| VO | Visual |
|---|---|
| d1 "Flash it." | LED panel + CPU lanes + LED traces, real time |
| d2 "The workers are on core 1. They still have priority six." | core 1 lane: workers; core 0 lane: only LED blips |
| d3 "But core 0 is always free, so both LEDs keep their beat." | LED traces on every beat, ✓ |
| d4 "Pinning fixed the stumble, without changing a single priority." | caption |

## 7 · The price
*The trap: three lines on what goes wrong, then the rule and the better fix.*

| VO | Visual |
|---|---|
| t1 "But look at core 1." | core 1 lane zooms in |
| t2 "Both workers are on it, with the same priority. So they take turns, a tick at a time." | the lane in 10 ms slices: a, b, a, b … |
| t3 "Each worker now gets about half as much CPU time as before." | two bars per worker: unpinned ≈ 7.5 s of 10 s, pinned ≈ 3.8 s → "about ½" |
| t4 "And core 0 sits almost empty." | core 0 lane: nearly blank |
| t5 "A pinned task never moves. Not even to a free core." | a waiting worker chip leans toward the empty core 0, ✗ |
| t6 "So pin a task only when you have a reason." | caption |
| t7 "Here, the better fix was the one from the scheduler video: priority four, and no pinning." | code mutates back: `xTaskCreate(work_task, …, 4, NULL)` |
| t8 "Both LEDs keep their beat, and the workers get both cores." | lanes: workers on both cores, LEDs on the beat ✓ |

## 8 · Recap

| VO | Visual |
|---|---|
| z1 "Pin a task when you have a reason. Otherwise, let FreeRTOS choose. That's two cores." | hero line, then the recap list |

Recap list:
- `xTaskCreate(…)` → either core, FreeRTOS picks
- `xTaskCreatePinnedToCore(…, 1)` → only core 1, never moves
- `tskNO_AFFINITY` → either core
- `esp_cpu_get_core_id()` → the core running this line
- next → stacks & watchdog

## Left out on purpose

Floating point pinning a task automatically, core 0 doing the tick work, one-core chips
and `CONFIG_FREERTOS_UNICORE`, reading another task's core, lwIP being unpinned.
All are in `FACTS.md` ("Not in this video").
