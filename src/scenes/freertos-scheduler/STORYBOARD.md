# FreeRTOS scheduler & priorities: storyboard v2 (simple English, draft for approval)

- Slug `freertos-scheduler`, composition `FreeRTOSScheduler`, output `out/2-freertos/freertos-scheduler.mp4`, about 6 min.
- Comes after `freertos-tasks`. Next video: `delay-until`. Every claim is in `FACTS.md`.
- Same board as before: LED 1 on GPIO 2, LED 2 on GPIO 19, button on GPIO 18.
- **v2:** the whole script is rewritten in very simple English. Short sentences. One idea per line. Every new word is explained the first time it is used. The words "preempt", "starve", "schedule" (as a verb) and "round robin" are not used.

## The video in one paragraph

Many tasks want the CPU, but there are only two cores. FreeRTOS has to choose who runs.
It uses one rule: **of the tasks that are ready, the one with the highest priority runs.**
We see what goes wrong when you give a long job a high number (the LED stumbles), fix it
by giving it a low number, change numbers while the program runs with a button, and
finish with the mistake everyone makes: a task that never waits.

## Words the video uses

| Word | What we say it means |
|---|---|
| priority | the number you give a task. A bigger number goes first. |
| ready | the task wants the CPU and is waiting for a turn |
| running | the task is using a CPU right now |
| blocked | the task is waiting (in `vTaskDelay`) and does not want the CPU |
| core | one CPU. The ESP32 has two. |
| tick | the clock FreeRTOS checks every 10 ms |
| idle task | a task that FreeRTOS made, at priority 0. It runs when nobody else wants the core. |
| watchdog | a check that prints an error when the idle task has not run for 5 seconds |

## The program

The two LED tasks are the same as in the tasks video. New: two **worker** tasks and a **button** task.

```c
static void work_task(void *arg)    // pretends to do a long job
{
    while (1) {
        int64_t end = esp_timer_get_time() + 300 * 1000;   // 300 ms from now
        while (esp_timer_get_time() < end) {
            // keep the CPU busy until then
        }
        vTaskDelay(pdMS_TO_TICKS(100));                     // rest for 100 ms
    }
}

static TaskHandle_t work_a, work_b;

static void button_task(void *arg)
{
    // set up GPIO 18 as an input with a pull-up (from the GPIO input video)
    int last = 1;
    while (1) {
        int level = gpio_get_level(BUTTON);
        if (last == 1 && level == 0) {                     // the button was just pressed
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

void app_main(void)
{
    xTaskCreate(blink_task,  "blink_fast", 2048, &fast, 5, NULL);
    xTaskCreate(blink_task,  "blink_slow", 2048, &slow, 5, NULL);
    xTaskCreate(work_task,   "work_a",     2048, NULL,  4, &work_a);
    xTaskCreate(work_task,   "work_b",     2048, NULL,  4, &work_b);
    xTaskCreate(button_task, "button",     2048, NULL,  7, NULL);
}
```

In scene 1 the workers start at priority **6**. Scene 5 changes them to **4**.

## The scenes

| # | Scene | What the learner should take away |
|---|---|---|
| 1 | The problem | I gave two long jobs a high number, and my LED started to stumble. Why? |
| 2 | The rule | Of the ready tasks, the highest priority runs. |
| 3 | Three states | A task is running, ready, or blocked. Two cores = two tasks running at once. |
| 4 | The rule in action | A higher task gets a core at once. A lower task waits. Equal tasks take turns. So that's why the LED stumbled. |
| 5 | The fix | Give long jobs low numbers and quick jobs high numbers. A busy loop holds the core; `vTaskDelay` lets go of it. |
| 6 | Changing priority | `vTaskPrioritySet` changes a task's number. `uxTaskPriorityGet` reads it. |
| 7 | Demo | Press the button: workers go to 6, the LED stumbles. Press again: 4, the LED is fine. |
| 8 | The trap | A task that never waits. The idle task never runs, and the watchdog prints an error. Fix: always wait somewhere. |
| 9 | Recap | One line, five points, next video. |

## 1 · The problem
*Show what goes wrong before explaining anything.*

| VO | Visual |
|---|---|
| p1 "Here are the two blinking LEDs from the tasks video. One fast, one slow." | the board; LED on GPIO 2 blinks every 200 ms, LED on GPIO 19 every 500 ms; a "wanted" lane under each |
| p2 "Now we add two more tasks. Each one does a long job." | the `work_task` code slides in |
| p3 "It works for 300 milliseconds." | a lane: an amber block labelled `busy 300 ms` |
| p4 "Then it rests for 100." | a grey gap after it: `rest 100 ms`; the pattern repeats |
| p5 "The job feels important. So we give these tasks priority six." | `app_main`: the two `work_task` lines, the **6** lit |
| p6 "The LEDs have priority five. So the workers have the bigger number." | the LEDs' **5** lit next to the **6**: `6 > 5` |
| p7 "Now watch the fast LED. It stumbles." | the real LED lane under the wanted one: some blinks come late; each late one gets a red mark |
| p8 "We didn't change the LED code at all. So what happened?" | the LED code with a ✓ "unchanged"; a big "?" |

## 2 · The rule
*Give the one rule before any details.*

| VO | Visual |
|---|---|
| a1 "Many tasks want the CPU. FreeRTOS has to choose which one runs." | five task chips around a CPU chip |
| a2 "It uses one rule." | the chips line up |
| a3 "Of the tasks that are ready, the one with the highest priority runs." | a rule card: `ready tasks → the highest priority runs` |
| a4 "Priority is just the number you gave the task in X task create. A bigger number goes first." | `xTaskCreate(…, 5, …)` with the **5** lit; an arrow "bigger = goes first" |
| a5 "Everything in this video comes from that rule." | **PRIORITY** lands letter by letter |

## 3 · Three states
*Explain "ready" — the rule depends on it.*

| VO | Visual |
|---|---|
| s1 "A task is always in one of three states." | three boxes: Blocked · Ready · Running |
| s2 "Blocked means waiting. A task in V task delay is blocked." | the LED task calls `vTaskDelay` and moves into Blocked |
| s3 "A blocked task doesn't want the CPU." | Blocked box with "doesn't want the CPU" |
| s4 "When its delay is over, it becomes ready." | a tick counter reaches 20; the task moves to Ready |
| s5 "Ready means: I want the CPU. I'm waiting for my turn." | Ready box with "wants the CPU" |
| s6 "Running means: I'm using the CPU right now." | the task moves to Running |
| s7 "The ESP32 has two cores. So two tasks can be running at the same time." | Running splits into two slots: `core 0` and `core 1` |

## 4 · The rule in action
*Four short cases, then back to the LED.*
One picture for all cases: two core slots at the top, a "ready" row below, a "blocked" row at the bottom. Each task is a chip with its priority on it.

| VO | Visual |
|---|---|
| r1 "Case one. Each core takes the ready task with the highest number." | ready row: chips 7, 5, 4; core 0 takes 7, core 1 takes 5 |
| r2 "Case two. A task with a higher number becomes ready." | a chip with 5 moves from blocked to ready |
| r3 "It doesn't wait. It takes a core right away, from a task with a lower number." | the 5 chip pushes a 4 chip out of core 1 |
| r4 "The task that was pushed out goes back to ready. Later it carries on from where it stopped." | the 4 chip sits in ready with a "paused here" pin on its code line; then it gets the core back and goes on |
| r5 "Case three. Two tasks with higher numbers are using both cores." | two 6 chips fill both core slots |
| r6 "Now a task with a lower number must wait. Even if it's ready." | a 5 chip waits in ready, greyed, with a clock |
| r7 "Case four. Tasks with the same number take turns." | three 4 chips; two cores |
| r8 "Each one gets a core for one tick, ten milliseconds, then the next one gets a go." | the chips swap every tick; `1 tick = 10 ms` |
| r9 "Now back to our LED." | the problem picture returns |
| r10 "Both workers are busy. They have priority six. They are using both cores." | both core slots amber: `work_a 6`, `work_b 6` |
| r11 "The fast LED's delay is over. It's ready to switch the LED." | `blink_fast 5` moves to ready |
| r12 "But five is lower than six. So it waits." | it waits, greyed, a timer bar runs |
| r13 "It only gets a core when a worker rests. That's why the LED is late." | a worker rests → `blink_fast` gets the core → the LED switches; on the LED lane this lines up with the red late mark |

## 5 · The fix
*Low numbers for long jobs; high numbers for quick jobs. And why a busy loop is different from a delay.*

| VO | Visual |
|---|---|
| k1 "The fix is simple. Give the workers a lower number than the LEDs." | the code changes on screen: both `6` → `4`, each change marked |
| k2 "Four instead of six." | `4 < 5` |
| k3 "Now, when the LED's delay is over, it gets a core right away." | the 5 chip takes a core from a 4 chip |
| k4 "It switches the LED and goes back to waiting. That takes a few microseconds." | a tiny sliver on the core lane; the LED lane is back on its beat ✓ |
| k5 "The workers lose almost nothing." | the work lanes look the same, with hairline gaps |
| k6 "So priority is not about how important a job is. It's about how quickly it has to happen." | hero caption: `priority = how soon, not how important` |
| k7 "Quick jobs that must be on time get high numbers." | ladder: button 7, LEDs 5 at the top, each with a tiny "runs for" bar |
| k8 "Long jobs that can wait get low numbers." | workers 4 lower, with a long "runs for" bar |
| k9 "Let's look at what makes the worker so heavy." | `work_task` code; the inner `while` lit |
| k10 "E S P timer get time tells you how many microseconds have passed since the chip started." | `esp_timer_get_time()` → "microseconds since start" |
| k11 "The loop keeps checking it, again and again, until 300 milliseconds have passed." | a counter climbing to `end`; the loop arrow spinning |
| k12 "All that time, the task is running. It keeps its core." | the task chip stays in a core slot, amber |
| k13 "V task delay is the opposite. The task is blocked, and the core is free for someone else." | side by side: busy loop → Running, core taken / `vTaskDelay` → Blocked, core free ✓ |
| k14 "One more thing. Keep your numbers low. ESP-IDF's own tasks use the top numbers, like esp_timer at twenty-two." | the ladder from the tasks video: idle 0, app_main 1, your tasks, esp_timer 22, ipc 24 |

## 6 · Changing priority while the program runs
*Two new calls. Show them in the button task first, then take them apart.*

| VO | Visual |
|---|---|
| e0 "You can change a task's priority while the program runs. This button task does that." | the whole `button_task`; the press check and the priority lines lit |
| e1 "The press check is the same as in the GPIO input video." | `last == 1 && level == 0` lit, with a "GPIO input" tag |
| e2 "To change a task, you need its handle. So app_main now keeps the handles of the two workers." | in `app_main`, `NULL` → `&work_a` and `&work_b` (marked); `static TaskHandle_t work_a, work_b;` lit |
| e3 "First call: V task priority set." | `vTaskPrioritySet(work_a, p)` lifts out; two cards |
| e4 "The first argument is the handle. It says which task to change." | card 1: `work_a` → points at the work_a task |
| e5 "If you pass NULL, it changes the task that is calling it." | `NULL` → "this task" |
| e6 "The second argument is the new priority. From zero to twenty-four." | card 2: a ladder 0…24 |
| e7 "Twenty-five or more stops the program with an error." | `25` → red ✗ "stops with an error" |
| e8 "The change happens at once. Lower a running task, and its core chooses again right away." | a worker chip goes 6 → 4 and an LED chip takes its core at the same moment |
| e9 "Second call: U X task priority get. Give it a handle. It gives you back that task's priority." | `uxTaskPriorityGet(work_a)` → `4` |
| e10 "So: if the workers are at four, the button sets them to six. Otherwise, back to four." | the `if` lit: `== 4` → `p = 6`, else stays `4` |
| e11 "Then it prints the new number." | `ESP_LOGI` line lit |
| e12 "The button task itself has priority seven, the highest. It's very quick, so it doesn't get in anyone's way." | ladder: button 7 on top, a tiny "runs for" bar |

## 7 · Demo
*Real time. The learner sees cause and effect.*

| VO | Visual |
|---|---|
| d1 "Flash it. The workers start at four. Both LEDs keep their beat." | board, LED lanes, core lanes |
| d2 "Press the button." | the button goes down |
| d3 "The log says six." | `I (8120) prio: work tasks now at 6` |
| d4 "And the fast LED stumbles again." | late blinks, red marks |
| d5 "Press it again. Four. The LED is back on its beat." | `I (11460) prio: work tasks now at 4`; the lane is smooth |

## 8 · The trap: a task that never waits
*Everyone makes this mistake. Three parts: what goes wrong, what you see, how to fix it.*

| VO | Visual |
|---|---|
| t1 "Now, the mistake everyone makes." | caption: "the trap" |
| t2 "Take the rest out of the worker. Now it never waits." | the code changes: `vTaskDelay(pdMS_TO_TICKS(100));` struck out |
| t3 "The LEDs still blink. Five is higher than four." | LED lanes fine |
| t4 "But now the two workers fill both cores whenever the LEDs and the button don't need them." | core lanes solid amber, with thin LED/button slivers |
| t5 "Remember the idle task? Priority zero. It only runs when no one else wants the core." | `IDLE0 · 0` and `IDLE1 · 0` chips in ready, greyed |
| t6 "Now it never runs." | a clock over the idle chips counts up |
| t7 "After five seconds, the watchdog sees this, and prints an error." | red log lines: `E (5310) task_wdt: Task watchdog got triggered. The following tasks/users did not reset the watchdog in time:` / ` - IDLE0 (CPU 0)` / ` - IDLE1 (CPU 1)` / `Tasks currently running:` / `CPU 0: work_a` / `CPU 1: work_b` … |
| t8 "Then again every five seconds." | the clock loops; the block prints again |
| t9 "You will see this message one day. It means some task never lets go of its core." | caption: `IDLE0 / IDLE1 in this list = a task never waits` |
| t10 "The fix: every task loop must wait somewhere. Put the delay back." | green: the `vTaskDelay` line comes back |
| t11 "The message is gone. The stacks and watchdog video tells you more." | the log goes quiet ✓ |

## 9 · Recap
z1 "The highest-priority ready task runs. That's the scheduler."

- A task is running, ready, or blocked. Two cores: two tasks run at once.
- A higher number gets a core right away. Equal numbers take turns.
- Priority means how soon, not how important.
- Every task must wait somewhere, or the watchdog complains.
- `vTaskPrioritySet(handle, p)` changes a number. `uxTaskPriorityGet(handle)` reads it.
- Next: delay-until.

## Decisions (for review)
- **Two workers, not one.** With one busy worker, the other core runs the LEDs and nothing goes wrong. Two workers fill both cores, so the problem shows. Scene 4 (r5, r10) makes this clear. Choosing a core for a task is left for the two-cores video.
- **The busy loop uses `esp_timer_get_time`**, not `esp_rom_delay_us`. You can see in the code that it keeps checking the clock. It also works the same on either core. One new call, explained in one line.
- **The button code uses a plain `if`**, not `? :`, so a beginner can read it.
- **Left out:** the Suspended state (`vTaskSuspend`, `vTaskResume`) and `taskYIELD`. Not needed for the rule.
- **The watchdog** is shown only as "the error you'll see, and the fix". How it works stays in the stacks & watchdog video.
- **The core-lane pictures** follow the rules in `FACTS.md`. They are drawings, not measurements from a real board.
