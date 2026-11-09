# FreeRTOS mutexes: storyboard v1

- Slug `freertos-mutexes`, composition `FreeRTOSMutexes`, output
  `out/2-freertos/freertos-mutexes.mp4`, about 6 min. After `freertos-queues`; next:
  priority inversion. Every claim is in `FACTS.md`; every log line is a real QEMU run (`lab/`).
- Built to the arc from the queues review (`SCRIPT.md` "The problem"): want → first try
  (real run, ✓/✗) → the answer on the same picture (real run, ✓/✗) → the code, both tasks at
  once → one Explainer per call → second knob → trap → payoff.
- **Two sides**: work_a (core 0) on the left, work_b (core 1) on the right, `total` in the
  middle, the key above it. Names and colours from the two-cores video (work_a purple,
  work_b blue); total = amber (your number); the mutex/key = cyan (structure).
- New calls: `xSemaphoreCreateMutex`, `xSemaphoreTake`, `xSemaphoreGive`; new names:
  `SemaphoreHandle_t`, `freertos/semphr.h`. Known: `xTaskCreatePinnedToCore`,
  `pcTaskGetName`, `vTaskDelete`, `portMAX_DELAY`, `pdTRUE/pdFALSE`, `ESP_LOGW`.
- Plain words: "key", "take", "give back", "wait, asleep". The race is told as what you'd
  notice (read, add one, write back; both read 41, both write 42), no registers.

| # | Scene | Take-away |
|---|---|---|
| 1 | want | Let's say you want two tasks (one per core) to add to one total, a million times each → 2,000,000 |
| 2 | race | Try 1, `total++` (real): 1,455,343; a different number every run. Why: read, add, write; both read 41, both write 42. ✓ simple ✗ wrong ✗ different every run; it hides in slow code |
| 3 | mutex | Try 2, a key (real): take, add, give; the other waits asleep; taking is one step → exactly 2,000,000 → **MUTEX**. ✗ it costs time (23 s in QEMU) |
| 4 | code | One function, two tasks: take → total++ → give; two cursors (a inside, b waiting); app_main creates it first |
| 5 | create | `xSemaphoreCreateMutex()`: no args; one key, starts free; handle; NULL; `semphr.h`; before the tasks |
| 6 | take | `xSemaphoreTake(total_lock, portMAX_DELAY)`: free → at once, pdTRUE; held → asleep; portMAX_DELAY forever; a limit → pdFALSE → don't touch total |
| 7 | give | `xSemaphoreGive(total_lock)`: back at once, never waits; the waiter wakes and gets it; only the taker may give (real assert) |
| 8 | short | Keep the locked part short: count in `mine`, take once, `total += mine`, give → 2,000,000 (real) |
| 9 | trap | `break` inside the locked part → the key never comes back → the other task waits forever, silently (real); fix: give before every way out; a time limit makes it visible (real warnings) |
| 10 | payoff | "A mutex is a key… That's a mutex." Recap, next: priority inversion |

The per-line script (text, `say`, `pause`) is `VO` in `timeline.ts`.

## 1 · want
| VO | Visual |
|---|---|
| "Let's say you want two tasks to share one number: a running total." | `total` box, 0 |
| "work_a runs on core 0, on the left. work_b runs on core 1, on the right." | chips + core badges rise left / right |
| "Both run at the same moment, as in the two cores video." | both glow together |
| "Each one adds one to total, a million times." | `+1 × 1,000,000` under each, wires to total |
| "So at the end, total should be two million." | big `2,000,000` (expected) |

## 2 · race (v1, v1-run2, v1-run3)
| VO | Visual |
|---|---|
| "The first thing anyone writes is total plus plus, in a loop." | snippet `for (…) { total++; }` |
| "Flash it." | log: the two done lines |
| "The last one to finish prints the final total: one point four five million." | `1,455,343` vs expected `2,000,000` |
| "Over half a million adds are gone." | `− 544,657` RED |
| "Run it again, and you get a different number every time." | runs 2, 3 |
| "Why? total plus plus looks like one step." | `total++` big |
| "It's three: read total... add one... write it back." | read / add / write rows |
| "Both cores do it at the same moment. Both read forty-one." | left and right read 41 |
| "Both write forty-two. Two adds... but total only went up by one." | total 41 → 42, ✗ |
| "In slower code it happens less often. That's worse: it hides." | score ✗ |

## 3 · mutex (v0, v0-run2)
| VO | Visual |
|---|---|
| "What you need: only one task at a time may touch total." | — |
| "So give total a key. Only the task holding the key may change it." | key over total |
| "work_a takes the key, adds one, and gives it back." | key → a, total +1, key back |
| "If work_b wants the key meanwhile, it waits, asleep, until it comes back." | b asleep, then gets it |
| "Taking the key is one step. Two tasks can never both get it." | — |
| "Flash it." / "Two million. Exactly. Every time." | log: 2000000 (×2 runs) |
| "That key is a mutex: short for mutual exclusion." | hero MUTEX |
| "The catch: the key isn't free. In QEMU, this run took twenty-three seconds, instead of no time at all." | score ✗ |

## 9 · trap (v3, v4)
| VO | Visual |
|---|---|
| "Now the mistake everyone makes once." | — |
| "Say a task should stop early, at one and a half million. You add a break, inside the locked part." | code: `if (total >= 1500000) { break; }` between take and give |
| "work_a breaks out of the loop, still holding the key, and ends." | key leaves with a |
| "work_b waits for the key. Forever. No error, no crash. The log just stops." | real log, then nothing; a clock running |
| "The fix: give the key back before every way out." | `xSemaphoreGive(total_lock);` inserted before `break` ✓ |
| "And a time limit on the take turns a silent hang into a warning you can see." | real warnings (v4) |
