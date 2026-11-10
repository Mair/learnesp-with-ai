# FreeRTOS priority inversion: storyboard

- Slug `freertos-priority-inversion`, composition `FreeRTOSPriorityInversion`, output
  `out/2-freertos/freertos-priority-inversion.mp4`, about 5½ min. After `freertos-mutexes`;
  next: semaphores. Every claim is in `FACTS.md`; every log line is a real QEMU run (`lab/`).
- Arc (`SCRIPT.md` "The problem"): want → first try on the picture (real run, ✓/✗) → the
  answer on the same picture and timing (real run, ✓/✗) → the code → the rules → the trap →
  payoff. No new calls: the answer is the mutex the learner already has; the new idea is what
  it does for priorities. `uxTaskPriorityGet` (scheduler video) makes it visible.
- **The picture**: a lanes chart, one lane per task (high magenta, medium purple, low blue),
  bars where a task runs, hatching where it waits for the lock, low's bar in high's colour
  when it runs at the borrowed priority, a cyan line while low holds the lock, a playhead
  stepping through the run on the VO's words. Broken axis (0–100 ms | squeezed | 1000–1100
  ms) so both the first 100 ms and the whole second fit; labelled on screen.
- Plain words: "lock", "takes over the CPU", "lends / raises to high's priority", "drops
  back". No kernel internals (ready lists, TCBs) on screen or in the VO.
- Whisper writes "high" as "Hye"/"I" in a few clips and "FreeRTOS" as "Freer 2's"; the voice
  says them correctly. Cue words avoid those (and spoken numbers, which Whisper writes as
  digits: `w('k1', '1')`).

| # | Scene | Take-away |
|---|---|---|
| 1 | want | high (3) must react fast and shares a buffer with low (1) behind a lock; medium (2) does a second of work and never touches it; all three on core 0. How long does high wait? |
| 2 | flag | Try 1, a flag (`while (busy) vTaskDelay; busy = true; … busy = false`): low takes it; medium takes the CPU from low; high waits; low can't run to clear it, so medium runs its whole second (real, v1): **high waited 1019 ms** → PRIORITY INVERSION. ✓ high and low never overlap ✗ 1019 ms ✗ the wait depends on medium |
| 3 | mutex | Try 2, the mutex (code changes on screen). Same timing: when high waits, low is raised to 3, medium can't interrupt it, low finishes its last 20 ms, gives, drops back to 1, high gets it (real, v0): **28 ms**, low printed priority 3 → PRIORITY INHERITANCE. ✓ 28 ms ✓ medium can't get in between ✗ high still waits for the locked part |
| 4 | code | the whole program (lab v0): low and high take/give the one mutex, medium doesn't; app_main creates it, pins all three to core 0 with priorities 1, 2, 3. No extra call for inheritance |
| 5 | inherit | rule 1: a higher task waits for your mutex → you run at its priority; rule 2: you give it back → straight back to your own. `uxTaskPriorityGet(NULL)` = my priority right now: flag run → 1, mutex run → 3 (real lines). Only a mutex does it (not a flag, not the semaphores of the next video) |
| 6 | trap | low calls `vTaskDelay(500 ms)` inside the locked part (real, v2): it's at 3 but asleep → high waited 470 ms. Fix: keep the locked part short; wait and do slow work outside it. 5 ms inside (real, v3) → done before high wakes → 0 ms |
| 7 | payoff | "…that's priority inversion. A mutex fixes it by lending the waiting task's priority to the holder, and that's priority inheritance." Recap; next: semaphores |

The per-line script (text, `say`, `pause`) is `VO` in `timeline.ts`; the runs' times are
`RUN_FLAG` / `RUN_MUTEX` / `RUN_SLEEP` there, taken from `lab/logs/`.
