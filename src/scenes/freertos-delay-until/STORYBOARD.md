> **v2 (narration pass):** VO rewritten to `SCRIPT.md` "Sound like a teacher, not a list"; opens
> "Let's say you want an LED to switch every 200 milliseconds, on a steady beat."; the 50/44
> count, the "missed a beat" warnings and the assert are real QEMU output (`lab/`). As built:
> 3:44 (223.7 s).

# FreeRTOS delay-until: storyboard v1 (simple English, draft for approval)

- Slug `freertos-delay-until`, composition `FreeRTOSDelayUntil`, output `out/2-freertos/freertos-delay-until.mp4`, about 4½ min.
- Comes after `freertos-scheduler`. Next video: two cores. Every claim is in `FACTS.md`.
- Same board: LED A on GPIO 2, LED B on GPIO 19.
- New calls: `xTaskGetTickCount`, `xTaskDelayUntil`, and `ESP_LOGW` (the warning version of `ESP_LOGI`).
- Written in very simple English: short sentences, one idea per line, every new word explained the first time.

## The video in one paragraph

You want an LED to switch exactly every 200 ms, while the task also does a little work each time.
With `vTaskDelay` the beat slowly drifts, because the delay starts counting **after** the work.
`xTaskDelayUntil` waits **until** a time on the clock instead, so the beat stays steady.
We see what happens when one loop runs late (it catches up), and the mistake that brings the drift back.

## Words the video uses

| Word | What we say it means |
|---|---|
| tick | the clock FreeRTOS counts, one every 10 ms |
| tick count | how many ticks since the program started |
| beat / period | how often you want the loop to run: 200 ms |
| drift | the beat slowly getting later and later |

## The program

Two tasks, the same except for how they wait. Each loop switches its LED, does 30 ms of work, then waits.

```c
static void work_30ms(void)            // stands in for reading a sensor and logging it
{
    int64_t end = esp_timer_get_time() + 30 * 1000;
    while (esp_timer_get_time() < end) {
    }
}

static void delay_task(void *arg)      // LED A, GPIO 2
{
    // set up LED_A as an output
    int level = 0;
    while (1) {
        level = !level;
        gpio_set_level(LED_A, level);
        work_30ms();
        vTaskDelay(pdMS_TO_TICKS(200));
    }
}

static void until_task(void *arg)      // LED B, GPIO 19
{
    // set up LED_B as an output
    int level = 0;
    TickType_t last = xTaskGetTickCount();
    while (1) {
        level = !level;
        gpio_set_level(LED_B, level);
        work_30ms();
        xTaskDelayUntil(&last, pdMS_TO_TICKS(200));
    }
}
```

## The scenes

| # | Scene | What the learner should take away |
|---|---|---|
| 1 | The problem | Two LEDs, both "every 200 ms". One drifts behind. |
| 2 | Why it drifts | `vTaskDelay` starts counting when you call it: 30 + 200 = 230 ms. |
| 3 | The answer | Wait **until** a time, not **for** a time. → hero **UNTIL** |
| 4 | `xTaskGetTickCount` | Read the clock once, before the loop. |
| 5 | `xTaskDelayUntil` | Two arguments: the last wake time (it updates it) and the period. |
| 6 | Demo | The two LEDs side by side for 10 seconds: 50 switches against 44. |
| 7 | Running late | If one loop takes too long, it doesn't wait: it catches up. The return value tells you. |
| 8 | The trap | Reading the clock inside the loop brings the drift back. |
| 9 | Recap | One line, four points, next video. |

## 1 · The problem
*Show the drift before explaining it.*

| VO | Visual |
|---|---|
| p1 "You want an LED to switch every 200 milliseconds. A steady beat." | LED A on GPIO 2; a "wanted" lane: a square wave with 200 ms halves; a metronome mark on every beat |
| p2 "Each time, the task also does a little work. Say, 30 milliseconds of it." | the `work_30ms` code slides in; a small amber block "work 30 ms" |
| p3 "Here are two tasks. They do the same thing." | `delay_task` and `until_task` side by side, the same lines lit in both |
| p4 "The only difference is how they wait." | the last line of each lit: `vTaskDelay(…)` vs `xTaskDelayUntil(…)` |
| p5 "Start them together, and watch." | two LEDs, A and B, blinking in real time; both lanes under the wanted beat |
| p6 "At first they blink together. But LED A slowly falls behind." | LED A's lane slides later and later against the beat marks; LED B stays on them |
| p7 "After a second and a half, they're opposite." | both LEDs: A on while B is off; a marker "1.5 s" |

## 2 · Why it drifts
*Explain with one picture: a time line.*

| VO | Visual |
|---|---|
| w1 "Let's follow LED A for one loop." | a time line, one loop of `delay_task` |
| w2 "It switches the LED." | a sliver at 0 ms |
| w3 "It works for 30 milliseconds." | an amber block 0–30 ms |
| w4 "Then V task delay waits 200 milliseconds. Counted from now." | a magenta bracket from 30 to 230 ms, starting where the work ended |
| w5 "So one loop takes 230 milliseconds, not 200." | `30 + 200 = 230` in big type; the next switch lands at 230, past the 200 mark (red) |
| w6 "Every loop adds 30 milliseconds. The beat drifts." | four loops: the switches at 230, 460, 690, 920 against the beat marks 200, 400, 600, 800; the gap grows |

## 3 · The answer

| VO | Visual |
|---|---|
| a1 "So don't wait for 200 milliseconds." | the bracket "wait 200 ms" struck out |
| a2 "Wait until the next beat on the clock." | the beat marks 200, 400, 600 light up; arrows from each loop's end to the next mark |
| a3 "The work happens inside the 200, so the beat stays put." | one loop: switch at 0, work 0–30, wait 30–200, switch at 200 ✓ |
| a4 "That's delay until." | **UNTIL** lands letter by letter |

## 4 · `xTaskGetTickCount` (short Explainer)

| VO | Visual |
|---|---|
| g1 "First, the task needs to know where the beat starts." | `until_task` in context; the line `TickType_t last = xTaskGetTickCount();` lit |
| g2 "X task get tick count tells you how many ticks have passed since the program started." | a tick counter running: 0, 1, 2 … ; `1 tick = 10 ms` |
| g3 "One tick is 10 milliseconds." | ruler with 10 ms marks |
| g4 "We store it in last. That's our first beat." | `last = 123` on the clock ruler, a flag "beat 0" |
| g5 "Do this once, before the loop." | the line's position before `while (1)` marked |

## 5 · `xTaskDelayUntil` (Explainer, two cards)

| VO | Visual |
|---|---|
| e0 "Now the wait at the end of the loop." | context: the loop, last line lit |
| e1 "X task delay until takes two things." | `xTaskDelayUntil(&last, pdMS_TO_TICKS(200));` big; two cards |
| e2 "First, the address of last. The ampersand lets the call read it, and change it." | card 1 `&last`: "the last beat · it updates it" |
| e3 "Second, the period: 200 milliseconds, which is 20 ticks." | card 2 `pdMS_TO_TICKS(200)` = 20 ticks |
| e4 "The call works out the next beat: last, plus 20 ticks." | `123 + 20 = 143` on the ruler |
| e5 "It waits until the tick count reaches it." | the counter runs to 143; the task chip goes Blocked → Ready |
| e6 "Then it moves last on to that beat, ready for the next loop." | `last = 143`; the flag moves |
| e7 "So the beats are always 20 ticks apart, no matter how long the work took." | flags at 123, 143, 163, 183 evenly spaced; work blocks of different lengths inside them |
| e8 "Periods are whole ticks. Anything under 10 milliseconds is zero ticks, and the program stops with an error." | `pdMS_TO_TICKS(5) = 0` → red: `assert failed: xTaskDelayUntil …` |
| e9 "You may see V task delay until in older examples. In ESP-IDF 6, use X task delay until." | `vTaskDelayUntil` struck → `xTaskDelayUntil` ✓, "removed in ESP-IDF v6.0" |

## 6 · Demo
*Real time, 10 seconds.*

| VO | Visual |
|---|---|
| d1 "Flash it. Both LEDs start together." | the board: LED A and LED B; lanes against the beat marks |
| d2 "LED B stays on the beat. LED A drifts." | A's switches slide off the marks; B's stay on |
| d3 "After 10 seconds, LED B has switched 50 times. LED A, only 44." | two counters: B 50 ✓, A 44 ✗ |
| d4 "Same work, same 200. Only the wait is different." | the two last lines side by side again |

## 7 · Running late
*What happens if one loop takes longer than the beat.*

| VO | Visual |
|---|---|
| l1 "What if one loop takes too long? Say the work takes 500 milliseconds, just once." | LED B's lane: one long amber block 0–500 ms, over the beat marks 200 and 400 |
| l2 "The next beat is already in the past. So the call doesn't wait at all." | at 500: the wake mark 200 is behind "now"; no wait |
| l3 "It runs again straight away, to catch up." | quick switches at 500 and 530 |
| l4 "Then it's back on the beat, at 600." | the switch at 600 lands on the mark ✓ |
| l5 "You can tell when this happens. The call returns false when it didn't wait." | the code changes: `if (xTaskDelayUntil(...) == pdFALSE) {` added |
| l6 "Here we print a warning with E S P log W, the warning version of log I." | `ESP_LOGW(TAG, "missed a beat");` added; log line `W (5120) beat: missed a beat` in yellow, twice |

## 8 · The trap
*A small mistake that brings the drift back.*

| VO | Visual |
|---|---|
| t1 "Here's a mistake that's easy to make." | caption: "the trap" |
| t2 "Move the line that reads the clock inside the loop." | the code changes: `TickType_t last = xTaskGetTickCount();` moves inside `while (1)` (marked) |
| t3 "Now every loop starts its beat from now, after the work." | time line: `last` set at 30 ms each time; next beat at 230 |
| t4 "That's the same as V task delay. LED B drifts too." | LED B's lane drifts like A's ✗ |
| t5 "The fix: read the clock once, before the loop." | the line moves back out (green); B back on the beat ✓ |

## 9 · Recap
z1 "Wait until the next beat, not for a while. That's delay until."

- `vTaskDelay` → waits for a time, counted from now → work makes it drift
- `TickType_t last = xTaskGetTickCount();` → once, before the loop
- `xTaskDelayUntil(&last, period)` → waits until the next beat
- returns false → you were late; it catches up
- next: two cores

## Decisions (for review)
- **Two tasks side by side**, the same except for the wait, so the only difference on screen is the one line.
- **The 30 ms of work** is the busy loop from the scheduler video (`esp_timer_get_time`), so nothing new is needed to make it.
- **`level = !level`** switches the LED each loop, so one loop = one switch, and the drift is easy to count.
- **The old name** `vTaskDelayUntil` gets one line, because learners will meet it in older examples and ESP-IDF 6 removed its compatibility function.
- **Left out:** tick count overflow (it wraps after about 497 days and the call handles it), and `vTaskDelay`'s up-to-one-tick early wake-up.
- The lane pictures are worked out from the code (`FACTS.md`), not measured.
