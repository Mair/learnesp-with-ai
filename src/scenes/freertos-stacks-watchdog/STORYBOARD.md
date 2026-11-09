> **v2 (narration pass):** VO revised to `SCRIPT.md` "Sound like a teacher, not a list"; opens
> "Let's say you want to give each task just the stack it needs."; fragment lines ("Don't guess.
> Measure it.", "Stack overflow. The chip restarts.", "Looks fine.") became whole sentences. Logs
> were already real (`lab/`). As built: 5:44 (343.7 s).

# FreeRTOS stacks & watchdog: storyboard v1 (simple English, as built)

- **As built:** 5:33. VO lines are in `timeline.ts` (`VO`), timed by `scripts/vo-plan.ts`.
  Wording changed where the voice or Whisper needed it: e3 "Passing NULL means this task"
  ("Null means" was heard "no means"), s3 "…612 bytes never used" ("spare" blurred),
  k2 "Plus a margin: 768" ("Add a margin" was heard "at a margin"), k5 "…code that has run
  so far", c2 "stuck, waiting for the release" ("its wait" → "its weight"), m1 "In
  menuconfig, two settings…" ("Two settings" → "To settings"), x4 "In a task on the watch
  list, every delay must be shorter than the timeout", x5 "…not inside the release loop".
- The stack is drawn filling **up** (end of the stack at the top) for the flood-line
  picture; the freertos-tasks video drew it top-down. Direction is not mentioned.
- The caught scene's log runs in real time on QEMU's clock (press at 3573 ms → errors at
  8573 / 13573 ms); the demo and trap logs appear on the VO, not in real time.

- Slug `freertos-stacks-watchdog`, composition `FreeRTOSStacksWatchdog`, output
  `out/2-freertos/freertos-stacks-watchdog.mp4`, about 5 min.
- Comes after `freertos-two-cores`. Next video: queues. Every claim is in `FACTS.md`.
- **Every log line on screen is real**: the program was built with ESP-IDF v6.0.2 and run
  in QEMU (`lab/`, `lab/logs/`). Log panels say "recorded in QEMU (ESP32 emulator)".
- Same board: LED 1 on GPIO 2 (200 ms), LED 2 on GPIO 19 (500 ms), button on GPIO 18
  (pull-up, pressed = 0).
- New calls: `uxTaskGetStackHighWaterMark`, `esp_task_wdt_add`, `esp_task_wdt_reset`;
  menuconfig: the task watchdog timeout and "Invoke panic handler".
- Very simple English. "check in" for `esp_task_wdt_reset` (named once: "that's the
  check-in"). No "TWDT", "subscribe", "canary", "0xa5", "feed".

## The video in one paragraph

Every task so far got 2048 bytes of stack. Too small crashes (the tasks video); too big
wastes memory. So measure: the **high water mark** is the most stack a task has ever
used; `uxTaskGetStackHighWaterMark(NULL)` tells you how much was never used. blink_task
prints 1556, then 1124 for good: the first log line itself took 432 bytes. Size from the
*first* reading (768) and that very log line overflows. Read the number after the task
has done everything. Then the other half: a task can get stuck while still letting go of
the core (a jammed button: it waits forever for a release), and the idle-task watchdog
can't see it. `esp_task_wdt_add(NULL)` puts the task on the watchdog's list;
`esp_task_wdt_reset()` at the top of the loop is the check-in. Jam the button and 5 s
later the watchdog names `button`. Menuconfig: the timeout and restart-on-timeout. The
mistake: a watched task that waits longer than the timeout trips it with nothing stuck.

## Words the video uses

| Word | What we say it means |
|---|---|
| stack | the task's own memory for its calls (the tasks video) |
| high water mark | the most stack the task has ever used: the highest line the level reached |
| never used | the stack above the mark: what the call returns |
| watchdog | ESP-IDF's alarm for stuck tasks; it watches a list of tasks |
| check in | tell the watchdog "still running" (`esp_task_wdt_reset`) |

## The scenes

| # | Scene | Take-away |
|---|---|---|
| 1 | problem | 2048 everywhere: too small crashes, too big wastes. Measure. |
| 2 | mark | The highest the stack ever gets = the high water mark. You get the part above it. |
| 3 | measure | `uxTaskGetStackHighWaterMark(NULL)`: this task, the least free ever, in bytes. |
| 4 | demo | 1556, then 1124 for good: the first log line took the rest. |
| 5 | size | 2048 − 1124 = 924 used; give some back, keep a margin: 1536 → 612 spare. |
| 6 | trap | Size from the first reading (768) → that log line overflows. Measure after everything has run. |
| 7 | stuck | The idle watchdog can't see a task stuck in a wait (jammed button). |
| 8 | watch | `esp_task_wdt_add(NULL)` + `esp_task_wdt_reset()` at the top of the loop. |
| 9 | caught | Jam → 5 s later: `- button (CPU 0/1)`, every 5 s. LEDs never stopped. |
| 10 | config | menuconfig: timeout 5 s (1–60); "Invoke panic handler" → restart. |
| 11 | mistake | A 10 s wait trips a 5 s watchdog; check in from the main loop, not the wait. |
| 12 | payoff | One line, five points, next video. |

## 1 · problem

| VO | Visual |
|---|---|
| p1 "Every task in this course has had a stack of 2048 bytes." | two task chips (blink_fast, blink_slow), each over a stack column `2048 bytes` |
| p2 "In the tasks video, you saw what happens when it's too small: a stack overflow, and the chip restarts." | one column floods past its top (RED); serial: `***ERROR*** A stack overflow in task blink_fast has been detected.` `Rebooting...` |
| p3 "Too big wastes memory. The whole stack is set aside when the task is created, even the part it never uses." | the other column: a low level, the rest hatched "set aside · never used" |
| p4 "So how much does blink_task really need? Don't guess. Measure it." | a "?" over the column → "measure" |

## 2 · mark

| VO | Visual |
|---|---|
| a1 "Picture the stack as the task runs." | one big column, end of stack at the top |
| a2 "Each call takes some of it, and gives it back when it returns." | the level rises and falls as call labels light: `gpio_set_level`, `vTaskDelay`, `ESP_LOGI` (illustration, no numbers) |
| a3 "The highest it ever gets leaves a mark, like a flood line on a wall." | an amber dashed line stays at the highest level |
| a4 "FreeRTOS calls it the high water mark." | hero **HIGH WATER MARK** |
| a5 "Above that line is the stack the task has never used. That's the number you can ask for." | GREEN bracket from the mark to the top: "never used → the number you get" |

## 3 · measure (Explainer, context first)

| VO | Visual |
|---|---|
| e0 "Here's blink_task from the tasks video." | context panel: `blink_task` |
| e1 "Add one line at the end of the loop." | the `ESP_LOGI(… uxTaskGetStackHighWaterMark(NULL));` line is inserted (marked) |
| e2 "It logs the task's name, and one new call: uxTaskGetStackHighWaterMark." | the call is lifted into the Explainer line |
| e3 "Its one argument is the task to check. NULL means this task, just like pcTaskGetName." | card **task** = `NULL` "this task"; view: `pcTaskGetName(NULL)` beside it |
| e4 "It returns the smallest amount of free stack this task has ever had." | view: column + mark + bracket "smallest free, ever" |
| e5 "In ESP-IDF, that's in bytes: the same unit as the 2048 you passed." | `xTaskCreate(…, 2048, …)` bytes ↔ returns bytes |
| e6 "A big number means lots of room. Close to zero means the task nearly ran out." | a 0…2048 scale: GREEN end "lots of room", RED end "nearly ran out" |

## 4 · demo (real log, v0)

| VO | Visual |
|---|---|
| d1 "Flash it." | serial (left) · the column (right) |
| d2 "The first line says 1556 bytes never used." | `I (1976) stacks: blink_fast: 1556 bytes never used`; the mark at 492 used |
| d3 "The next line says 1124. And then 1124, every time." | `… 1124 …` lines; the mark jumps to 924 used |
| d4 "Why the drop? The first number was read before the task had logged anything." | first line tagged "before the first log" |
| d5 "Printing a log line is one of the biggest users of stack." | `ESP_LOGI` → "+432 bytes" |
| d6 "After that, the number never goes back up. It's the lowest so far." | the mark holds; "never goes back up" |

## 5 · size

| VO | Visual |
|---|---|
| s1 "So blink_task uses at most 2048 minus 1124: 924 bytes." | `2048 − 1124 = 924` used |
| s2 "Espressif's advice: you can give back most of the unused part, but keep a safety margin." | quote card (ram-usage guide) |
| s3 "1536, for example, still leaves 612 bytes spare." | `xTaskCreate(…, 1536, …)`; real log `blink_fast: 612 bytes never used`; column 1536 |
| s4 "That's 512 bytes back for everything else." | `2048 − 1536 = 512` back to the heap |

## 6 · trap (the stack trap: three beats + fix)

| VO | Visual |
|---|---|
| k1 "Now the trap. Size the stack from that first number instead." | code: app_main's stack arguments lit |
| k2 "2048 minus 1556 is about 500 bytes used. Add a margin: 768." | arithmetic; stack args → `768` (amber) |
| k3 "Flash it. The first line says 272 bytes never used. Looks fine." | real log `blink_fast: 272 bytes never used` ✓? |
| k4 "But that log line itself runs past the end of the stack. Stack overflow. The chip restarts." | column floods (RED); `***ERROR*** A stack overflow in task blink_fast has been detected.` `Rebooting...` |
| k5 "The number only counts code that has already run." | caption |
| k6 "So read it after the task has done everything it ever does. Then pick the size." | GREEN verdict |

## 7 · stuck

| VO | Visual |
|---|---|
| w1 "Now the second half: a task that gets stuck." | — |
| w2 "In the scheduler video, the watchdog caught a task that never let go of its core. It does that by watching the idle tasks." | the watch list: `IDLE0`, `IDLE1`, each with a 5 s countdown refilling |
| w3 "But a task can get stuck, and still let go of the core." | — |
| w4 "This button task counts presses. After each press, it waits for the release." | code: `button_task` (no watchdog calls) |
| w5 "If the button jams, it waits for a release that never comes." | the inner `while` lit; button drawn held down |
| w6 "It waits with vTaskDelay, so the idle tasks still run. The watchdog says nothing." | idle bars keep refilling; real log: only LED lines (v3) |
| w7 "The LEDs keep blinking. Nothing tells you the button task is stuck." | LEDs blinking; "no error" |

## 8 · watch (code mutation)

| VO | Visual |
|---|---|
| h1 "So ask the watchdog to watch this task too." | — |
| h2 "esp_task_wdt_add, with NULL, adds this task to its list." | line inserted; `button` row joins the watch list |
| h3 "It returns an esp_err_t, so wrap it in ESP_ERROR_CHECK. That's the opposite of xTaskCreate." | `ESP_OK` (0) ✓ vs `pdPASS` (1) from the tasks video |
| h4 "From now on, the task must check in at least every five seconds." | the button row's countdown: 5 s |
| h5 "esp_task_wdt_reset is the check-in. Put it at the top of the loop." | line inserted at the loop's top |
| h6 "Every time round, the loop tells the watchdog: still running." | the bar refills on each check-in |
| h7 "Both come from esp_task_wdt.h." | `#include "esp_task_wdt.h"` inserted |

## 9 · caught (real log, v1)

| VO | Visual |
|---|---|
| c1 "Flash it. Press the button, and let it jam." | serial · watch list · LEDs, real time |
| c2 "Press one is logged. Then the task is stuck in its wait, and stops checking in." | `I (3573) stacks: press 1`; the button bar drains |
| c3 "Five seconds later, the watchdog prints an error, and names the task: button." | bar hits zero (RED); `E (8573) task_wdt: … - button (CPU 0/1)` |
| c4 "It repeats every five seconds, until the task checks in again." | `E (13573) …` |
| c5 "The LEDs never stopped. But now you know exactly which task is stuck." | LEDs ✓; `- button` highlighted |

## 10 · config

| VO | Visual |
|---|---|
| m1 "Two settings in menuconfig change the watchdog." | menuconfig: Component config → ESP System Settings |
| m2 "The timeout: five seconds by default, anything from one to sixty." | `(5) Task Watchdog timeout period (seconds)` lit, "1…60" |
| m3 "By default, it only prints. Turn on Invoke panic handler, and it restarts the chip instead." | `[*] Invoke panic handler …`; real log (vp): `Aborting.` `Rebooting...` |

## 11 · mistake (three beats + fix)

| VO | Visual |
|---|---|
| x1 "Now the mistake. The watchdog can't tell stuck from slow." | — |
| x2 "Make the button task wait ten seconds each time round its loop." | `vTaskDelay(pdMS_TO_TICKS(10000));` (amber) |
| x3 "Nothing is stuck. But it checks in only every ten seconds, so the watchdog fires every time round." | lane 0–30 s: check-ins every 10 s, RED errors at 6.6, 16.6, 26.6 (real, v2) |
| x4 "Every wait in a watched task must be shorter than the timeout." | GREEN verdict "or raise the timeout" |
| x5 "And keep the check-in in the main loop, not in the wait loop. Otherwise a jam is never caught." | ✓ at the top of `while (1)`, ✗ inside the release wait |

## 12 · payoff

| VO | Visual |
|---|---|
| z1 "Measure your stacks, and let the watchdog watch the tasks that matter. That's stacks and the watchdog." | hero line, recap |

Recap:
- `uxTaskGetStackHighWaterMark(NULL)` → the least free stack so far, in bytes
- size = most used + a margin · measure after everything has run
- `esp_task_wdt_add(NULL)` → watch this task
- `esp_task_wdt_reset()` → check in, every time round the main loop
- next → queues

## Left out on purpose

`esp_task_wdt_delete`, watchdog users, run-time reconfigure, the interrupt watchdog, all
tasks' marks at once (`uxTaskGetSystemState`), other overflow checks, big local arrays.
All in `FACTS.md` ("Not in this video").
