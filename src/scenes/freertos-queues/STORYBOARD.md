# FreeRTOS queues: storyboard v2 (review pass)

## v2 (review pass)

The user's notes on the v1 render (4:11), and what changed:

- **Open with the want.** "Let's say you want an LED to blink three times every time you
  press a button." New scene `want`: the press and its blinks, why one loop can't do both,
  two tasks (button left, LED right), "how does it tell the LED task?" Rule added to
  `SCRIPT.md` ("The problem").
- **"A shared flag sort of works" (0:17) was unclear.** The flag is now its own scene,
  `flag`, run for real (lab variant 5, `v5.log`): "It works. And it's simple." /
  "…keep checking, a hundred times a second…" / "Three presses. But the LED task saw only
  two. One press is lost." A ✓/✗ score on screen. No hedges (rule added).
- **Two sides, the queue between, before any call (2:10, 2:38).** The old demo picture
  (button · queue · LED) is now the problem domain: the `queue` scene swaps the flag for the
  row of boxes on the same picture with the same presses (`v1.log`): every press, in order,
  the LED task sleeps (✓✓) → "That's a queue." → the catch: only so many boxes (✗). The old
  `demo` scene is cut (its run is here).
- **Then the tasks, then the calls.** New scene `tasks`: both tasks' code side by side over
  the same queue, the send and receive lines lit as a press goes in and comes out. Then
  `send`, `receive` (both ends visible in every view: something goes in while the other end
  takes one out), then `create` ("where press_queue comes from").
- **"That many bytes" (1:07) wasn't stressed.** `say`: "The queue copies that... many
  bytes, every time." plus a big "4 bytes copied, every time" on the word.
- **Pauses.** Every line has a chosen `pause` (≈1.0 s new beat, 0.3–0.4 s continuation,
  longer while a run plays out); `...` before stressed words in `say`. `vo-plan` now prints
  the pauses inside each clip (`‖0.52`) so they can be reviewed. Rule: `SCRIPT.md` "Pauses
  and emphasis".
- As built: 5:44 (344 s), 10 scenes.

| # | Scene | Take-away |
|---|---|---|
| 1 | want | Let's say you want: a press → three blinks (1.5 s). One loop misses presses mid-blink → two tasks, left and right. How do they talk? |
| 2 | flag | Try 1, real run: a shared `bool pressed`. ✓ one press works ✓ simple ✗ checks 100×/s ✗ three presses, two seen |
| 3 | queue | Try 2, same picture, same presses, real run: in at the back, oldest out at the front; ✓ sleeps until a press ✓ every press, in order → **QUEUE**; ✗ only so many boxes |
| 4 | tasks | The code of both tasks side by side: `xQueueSend` in button_task, `xQueueReceive` in led_task, both name `press_queue` |
| 5 | send | `xQueueSend(press_queue, &presses, 0)`, both ends in every view |
| 6 | receive | `xQueueReceive(press_queue, &press, portMAX_DELAY)`, both ends in every view |
| 7 | create | `xQueueCreate(5, sizeof(int))`: app_main makes it before the tasks; "that... many bytes" |
| 8 | full | Eight presses, five boxes: 7 and 8 dropped (real) |
| 9 | trap | Queue created after the tasks → assert → boot loop (real) |
| 10 | payoff | One line, recap, next: mutexes |

`timeline.ts` (`VO`) is the script as built, with every line's `say` and `pause`.

---

# v1 (first build, kept for reference)


- **v1.1 (while building):** blinks slowed from 100 to 250 ms (1.5 s per press) so the
  queued presses can be seen waiting in real time; the lab re-run gives presses 7 *and* 8
  dropped in the burst. The per-line tables below are the first draft; `timeline.ts` (`VO`)
  is the script as built.
- **As built:** 4:11 (250.9 s), 9 scenes. Wording changed where the voice or Whisper
  needed it: "queue" is heard as "cue", so word cues target "cue"; app_main is spoken
  "app main"; f3/f4 merged ("Presses seven and eight find it full…"); f5 → f4 "let the
  button task wait a few ticks"; d5 "one and a half seconds apart".
- The demo and full scenes run in **real time on the lab clock** (scene time =
  t0 + (ms − 1000)/1000, t0 just after "once" / "fast"); the scripted demo presses were
  timed in `main.c` to land on "press once" and "press three times, quickly".
- Problem: the flag is checked once every 1.2 s so the lost press is visible; tallies
  "presses: 2" vs "seen: 1" make it explicit.
- Trap: the crash log types from the start of t5 (cps 600), not in real time.

- Slug `freertos-queues`, composition `FreeRTOSQueues`, output
  `out/2-freertos/freertos-queues.mp4`, about 5 min.
- Comes after `freertos-stacks-watchdog`. Next video: mutexes. Every claim is in `FACTS.md`.
- **Every log line is real**: the program was run in QEMU (`lab/`, `lab/logs/`); presses
  are simulated (panels say so).
- Board: LED on GPIO 2, button on GPIO 18 (pull-up, pressed = 0).
- New calls: `xQueueCreate`, `xQueueSend`, `xQueueReceive`; new names: `QueueHandle_t`,
  `portMAX_DELAY`, `errQUEUE_FULL`, header `freertos/queue.h`.
- Very simple English. "box" for a slot; "copy"; "oldest first". No "FIFO".

## The video in one paragraph

The button task knows about presses; the LED task should blink three times for each. A
shared flag means polling and losing presses. A queue is a row of boxes: the sender copies
each item in at the back, the receiver takes the oldest from the front, and sleeps when
it's empty. `xQueueCreate(5, sizeof(int))` makes room for five ints (20 bytes, from the
heap); `xQueueSend(q, &presses, 0)` copies one in, or returns `errQUEUE_FULL`;
`xQueueReceive(q, &n, portMAX_DELAY)` copies the oldest out, sleeping until one arrives.
Demo: three quick presses wait in the queue and come out 1.5 s apart, in order. A burst of
eight overflows five boxes: presses 7 and 8 are dropped. The trap: create the queue after the tasks
and the LED task asserts on a NULL handle, in a boot loop.

## The scenes

| # | Scene | Take-away |
|---|---|---|
| 1 | problem | A shared flag: the LED task polls, and two presses look like one. |
| 2 | answer | A row of boxes: copy in at the back, oldest out at the front, sleep when empty → **QUEUE** |
| 3 | create | `xQueueCreate(5, sizeof(int))`: length, item size (4 bytes) → handle, NULL if no memory |
| 4 | send | `xQueueSend(press_queue, &presses, 0)`: handle, pointer (copied), ticks to wait → pdTRUE / errQUEUE_FULL |
| 5 | receive | `xQueueReceive(press_queue, &n, portMAX_DELAY)`: oldest into n; portMAX_DELAY = sleep until one arrives |
| 6 | demo | Press 1 at once; three quick presses queue up and come out 1.5 s apart, in order |
| 7 | full | Eight presses, five boxes: presses 7 and 8 dropped (the warnings); longer queue or wait |
| 8 | trap | Queue created after the tasks → `assert failed: xQueueReceive …` → boot loop; create it first |
| 9 | payoff | One line, five points, next video |

## 1 · problem
| VO | Visual |
|---|---|
| p1 "The button task knows when you press the button." | chip `button` with the button; a press flashes |
| p2 "Now you want the LED task to blink three times for every press." | chip `led` with the LED blinking ×3 |
| p3 "How does the button task tell it?" | arrow between the chips with "?" |
| p4 "A shared variable, like a pressed flag, sort of works." | a box `pressed = 0/1` between them |
| p5 "But the LED task has to keep checking it." | the led chip polls: ticks "is it set?" every loop |
| p6 "And two quick presses set the same flag. The LED task sees only one." | two presses → flag 1, 1 → one blink burst; ✗ "1 press lost" (illustration) |

## 2 · answer
| VO | Visual |
|---|---|
| a1 "Picture a row of boxes between the two tasks." | five empty boxes between the chips |
| a2 "The button task puts a copy of each press in at the back." | `1`, `2` slide in from the right |
| a3 "The LED task takes them out at the front, oldest first." | `1` leaves on the left, the rest shift |
| a4 "When the row is empty, the LED task sleeps until something arrives." | led chip dims "sleeping"; a new item wakes it |
| a5 "That's a queue." | hero **QUEUE** |

## 3 · create (Explainer, context first)
| VO | Visual |
|---|---|
| e0 "First, make the queue, at the top of app_main." | context: `static QueueHandle_t press_queue;` + app_main, the create line lit |
| e1 "xQueueCreate takes two numbers." | Explainer line `xQueueCreate(5, sizeof(int))` |
| e2 "The length: how many items it can hold at once. Here, five." | card **length** 5; five boxes |
| e3 "The item size, in bytes. Each press is an int, and sizeof int is four." | card **item size** 4 bytes; each box "4 bytes" |
| e4 "Every item has the same size. The queue copies that many bytes, each time." | boxes all 4 bytes |
| e5 "So it takes five times four, twenty bytes, plus a little bookkeeping, from the heap, once." | 5 × 4 = 20 bytes + bookkeeping |
| e6 "It returns a handle: the name both tasks use for this queue." | `press_queue` → both chips |
| e7 "If the heap is too full, it returns NULL instead." | NULL ✗ |
| e8 "It comes from freertos/queue.h." | `#include "freertos/queue.h"` |

## 4 · send
| VO | Visual |
|---|---|
| s0 "The button task sends each press." | context: button_task, the send block lit |
| s1 "xQueueSend. First, the queue's handle." | card **queue** `press_queue` |
| s2 "Then a pointer to the item. The queue copies four bytes from there." | card **item** `&presses`; 4 bytes copied into a box |
| s3 "It's a copy, so presses can change straight away. The queue keeps the value it had." | presses 1 → 2, the box still holds 1 |
| s4 "Last, how many ticks to wait if the queue is full. Zero: don't wait." | card **wait** 0 |
| s5 "It returns pdTRUE when the item went in." | ✓ pdTRUE |
| s6 "If the queue is full, it returns errQUEUE_FULL, and this press is dropped. So log a warning." | full row; `W … queue full: press 8 dropped` (real, v2) |

## 5 · receive
| VO | Visual |
|---|---|
| r0 "The LED task waits for presses." | context: led_task, the receive line lit |
| r1 "xQueueReceive. The handle, then where to put the item: here, n." | cards **queue**, **into** `&n` |
| r2 "It copies the oldest item into n, and takes it out of the queue." | front box → n |
| r3 "The last argument is how long to wait, if the queue is empty." | card **wait** portMAX_DELAY |
| r4 "portMAX_DELAY means forever. The task sleeps, and costs nothing, until a press arrives." | led chip asleep → wakes on an item |
| r5 "It returns pdTRUE when it got an item." | ✓ |
| r6 "With a time limit instead, like two seconds, it can return pdFALSE: nothing came." | variant line + real log v4 `no press for 2 s` |

## 6 · demo (real, v1, real time)
| VO | Visual |
|---|---|
| d1 "Flash it, and press the button once." | button, queue row, LED, log |
| d2 "Press one goes into the queue, and the LED task wakes up at once, and blinks." | `I (2651) queue: press 1: blink`, LED ×3 |
| d3 "Now press three times, quickly." | presses 2, 3, 4 |
| d4 "The LED task is busy blinking, so presses three and four wait in the queue." | boxes 3, 4 waiting |
| d5 "Each one comes out when the blink before it ends: six hundred milliseconds apart, in order." | log 4651, 5251, 5851 |
| d6 "No press is lost, and the button task never waited." | ✓ |

## 7 · full (real, v2)
| VO | Visual |
|---|---|
| f1 "But there are only five boxes. Press eight times, fast." | burst |
| f2 "Press one is taken straight away. Presses two to six fill the queue." | 5 boxes full |
| f3 "Press seven just fits: press two has left by then." | 2 leaves, 7 in |
| f4 "Press eight finds the queue full. xQueueSend gives up at once, and the warning prints." | `W (3454) queue: queue full: press 8 dropped` |
| f5 "If every press matters, make the queue longer, or let the sender wait a few ticks." | ✓ fixes |

## 8 · trap (real, v3)
| VO | Visual |
|---|---|
| t1 "Now the mistake everyone makes once." | — |
| t2 "Create the queue after the tasks." | the create line moves below the xTaskCreate lines |
| t3 "Remember: a new task with a higher priority than app_main runs straight away." | 5 > 1 |
| t4 "So the LED task calls xQueueReceive before the queue exists. Its handle is still NULL." | press_queue = NULL |
| t5 "The program stops with assert failed, in xQueueReceive. The chip restarts, and does it again, forever." | real log v3, repeating |
| t6 "The fix: create the queue first, then the tasks that use it." | code moves back ✓ |

## 9 · payoff
| VO | Visual |
|---|---|
| z1 "A queue carries copies from one task to another, in order, and the receiver sleeps until they arrive. That's a queue." | hero + recap |

Recap: `xQueueCreate(5, sizeof(int))` → room for five ints · `xQueueSend(q, &x, 0)` → a copy
in at the back · errQUEUE_FULL when full · `xQueueReceive(q, &n, portMAX_DELAY)` → the
oldest out · sleeps until one arrives · create the queue before its tasks · next → mutexes.
