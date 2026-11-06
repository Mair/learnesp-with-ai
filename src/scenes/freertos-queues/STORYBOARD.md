# FreeRTOS queues: storyboard v1 (simple English)

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
Demo: three quick presses wait in the queue and come out 600 ms apart, in order. A burst of
eight overflows five boxes: press 8 is dropped. The trap: create the queue after the tasks
and the LED task asserts on a NULL handle, in a boot loop.

## The scenes

| # | Scene | Take-away |
|---|---|---|
| 1 | problem | A shared flag: the LED task polls, and two presses look like one. |
| 2 | answer | A row of boxes: copy in at the back, oldest out at the front, sleep when empty → **QUEUE** |
| 3 | create | `xQueueCreate(5, sizeof(int))`: length, item size (4 bytes) → handle, NULL if no memory |
| 4 | send | `xQueueSend(press_queue, &presses, 0)`: handle, pointer (copied), ticks to wait → pdTRUE / errQUEUE_FULL |
| 5 | receive | `xQueueReceive(press_queue, &n, portMAX_DELAY)`: oldest into n; portMAX_DELAY = sleep until one arrives |
| 6 | demo | Press 1 at once; three quick presses queue up and come out 600 ms apart, in order |
| 7 | full | Eight presses, five boxes: press 8 dropped (the warning); longer queue or wait |
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
