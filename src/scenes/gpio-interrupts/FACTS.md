# GPIO interrupts — facts and where they come from

**Pure ESP-IDF** (no Arduino). Sources: ESP-IDF `release/v5.5` (`esp_driver_gpio`,
HAL/LL, soc register headers, `esp_intr_alloc.h`, FreeRTOS kernel + port, docs
`intr_alloc.rst`, `log.rst`, `examples/peripherals/gpio/generic_gpio`), ESP32 TRM v5.9,
ESP32 datasheet v5.3, Ganssle *A Guide to Debouncing*. Raw files fetched and read.
Input-video facts (pull-ups, thresholds, bounce numbers, GPIO 18 choice) are in
`src/scenes/gpio-input/FACTS.md` and not repeated.

## The program (modelled on Espressif's `generic_gpio` example)

| Fact | Source |
|---|---|
| Espressif's example: `gpio_config_t` with `intr_type = GPIO_INTR_POSEDGE`, `mode = GPIO_MODE_INPUT`, `pull_up_en = 1`; `xQueueCreate(10, sizeof(uint32_t))`; `gpio_install_isr_service(ESP_INTR_FLAG_DEFAULT /* 0 */)`; `gpio_isr_handler_add(pin, gpio_isr_handler, (void*) pin)`; ISR does `xQueueSendFromISR(gpio_evt_queue, &gpio_num, NULL)`; a task does `xQueueReceive(…, portMAX_DELAY)` | `examples/peripherals/gpio/generic_gpio/main/gpio_example_main.c` l.53, l.57–61, l.63–72, l.92–98, l.103–112 |
| The example's ISR is declared `static void IRAM_ATTR gpio_isr_handler(void* arg)` | same, l.60 |

## Polling's cost (the problem)

| Fact | Source |
|---|---|
| The input video's loop reads once per tick: 100 reads/s → 100 × 3600 = **360 000 reads an hour** | `CONFIG_FREERTOS_HZ` = 100 (output FACTS); arithmetic |
| A level that changes and changes back between two reads is never seen (each read is a snapshot) | `gpio_ll_get_level` = one load (input FACTS) |

## `gpio_config(&io)`

| Fact | Source |
|---|---|
| `gpio_config_t`: `uint64_t pin_bit_mask` ("each bit maps to a GPIO"), `mode`, `pull_up_en`, `pull_down_en`, `intr_type` (+ `hys_ctrl_mode` only on chips with hysteresis — not ESP32) | `driver/gpio.h` l.44–55 |
| "This function always overwrite all the current IO configurations"; returns `ESP_OK` / `ESP_ERR_INVALID_ARG` | `driver/gpio.h` l.57–71 |
| Mask 0, or bits outside `SOC_GPIO_VALID_GPIO_MASK` → `ESP_LOGE("GPIO_PIN mask error ")` + `ESP_ERR_INVALID_ARG`; an output mode with any of 34–39 in the mask → `"GPIO can only be used as input mode"` + `ESP_ERR_INVALID_ARG` | `gpio.c` l.357–367 |
| For every pin in the mask: input/OD/output enable per mode, pull-up/down per flags, `gpio_set_intr_type`, and **if `intr_type` ≠ 0 → `gpio_intr_enable`**, function = GPIO | `gpio.c` l.369–440 (l.414–420) |
| Why `1ULL`: the mask is 64-bit because GPIOs go up to 39; `1 << 39` on a 32-bit `int` is undefined (`int` is 32-bit on Xtensa) | `gpio.h` l.47 (`uint64_t`); C rule — **general C, not an IDF quote** |
| `1ULL << 18` = 0x40000 = bit 18 | arithmetic |
| `GPIO_PULLUP_ENABLE` = 1, `GPIO_PULLDOWN_DISABLE` = 0 | `hal/gpio_types.h` l.106–114 |

## Interrupt types

| Fact | Source |
|---|---|
| `GPIO_INTR_DISABLE` 0, `POSEDGE` 1 (rising), `NEGEDGE` 2 (falling), `ANYEDGE` 3, `LOW_LEVEL` 4, `HIGH_LEVEL` 5 | `hal/gpio_types.h` l.80–88 (l.81–86) |
| Same encoding in silicon: GPIO_PINn_INT_TYPE "0: disable; 1: rising edge; 2: falling edge; 3: any edge; 4: low level; 5: high level" | TRM v5.9 Register GPIO_PINn_REG |
| With a pull-up and a button to GND, a press is 1 → 0 = a **falling edge** → NEGEDGE; release = rising → POSEDGE | input FACTS (active low) |
| A level type keeps the interrupt asserted for as long as the level holds, so a held button re-triggers again and again | TRM type definitions; `gpio.c` `gpio_isr_loop` clears a level type's status only *after* the handler (l.483–506) — **derived** |
| `gpio_wakeup_enable(…, intr_type)`: "Only GPIO_INTR_LOW_LEVEL or GPIO_INTR_HIGH_LEVEL can be used." GPIO wake-up "will only wake up the CPU from Light-sleep" | `driver/gpio.h` l.201–212; TRM GPIO_PINn_WAKEUP_ENABLE |

## `gpio_install_isr_service(0)`

| Fact | Source |
|---|---|
| "Install the GPIO driver's ETS_GPIO_INTR_SOURCE ISR handler service, which allows per-pin GPIO interrupt handlers." → **one** CPU interrupt for all GPIOs; the driver's `gpio_intr_service` dispatches to per-pin handlers | `driver/gpio.h` l.296–310; `gpio.c` l.508–530 |
| Returns `ESP_ERR_INVALID_STATE` "ISR service already installed" on a second call; also `ESP_ERR_NO_MEM`, `ESP_ERR_NOT_FOUND` (no free interrupt) | `driver/gpio.h` l.303–309; `gpio.c` l.532–557 |
| `intr_alloc_flags` = `ESP_INTR_FLAG_*`; **0** → "a non-shared interrupt of level 1, 2 or 3" (low/medium priority — "These can be handled in C") | `esp_intr_alloc.h` l.45, l.131–136 |
| Without `ESP_INTR_FLAG_IRAM`, handlers "may access code and (read-only) data in flash" and "In case of flash operations, these interrupt handlers are postponed" | `docs/en/api-reference/system/intr_alloc.rst` l.97–114 |
| The service allocates a table of handlers (`GPIO_NUM_MAX` entries) on the heap | `gpio.c` l.536 |

## `gpio_isr_handler_add(BUTTON, button_isr, (void *) BUTTON)`

| Fact | Source |
|---|---|
| `typedef void (*gpio_isr_t)(void *arg);` — your function receives the `args` pointer you registered | `driver/gpio.h` l.36–41; `gpio.c` l.497 (`fn(args)`) |
| Not installed → `ESP_ERR_INVALID_STATE` "GPIO isr service is not installed, call gpio_install_isr_service() first" | `gpio.c` l.561 |
| Stores fn + args for the pin, then **enables the pin's interrupt** on the CPU the service runs on | `gpio.c` l.559–572 |
| "The pin ISR handlers no longer need to be declared with IRAM_ATTR, unless you pass the ESP_INTR_FLAG_IRAM flag" | `driver/gpio.h` l.323–325 |
| "This ISR handler will be called from an ISR. So there is a stack size limit (configurable as "ISR stack size" in menuconfig)" — `CONFIG_FREERTOS_ISR_STACKSIZE` default **1536** bytes | `driver/gpio.h` l.328–331; `freertos/Kconfig` l.441–446 |

## Inside the ISR

| Fact | Source |
|---|---|
| `xQueueReceive` "must not be used in an interrupt service routine. See xQueueReceiveFromISR" | `FreeRTOS-Kernel/include/freertos/queue.h` l.752–753 |
| `ESP_LOGx`: use in application code "avoiding use in ISRs" | `docs/en/api-reference/system/log.rst` l.149 |
| `xQueueSendFromISR`: "safe to use … from within an interrupt service routine"; items are copied; sets `*pxHigherPriorityTaskWoken = pdTRUE` "if sending to the queue caused a task to unblock, and the unblocked task has a priority higher than the currently running task … a context switch should be requested before the interrupt is exited"; returns pdTRUE or `errQUEUE_FULL` | `queue.h` l.1070–1133 |
| `portYIELD_FROM_ISR(x)`: if `x == pdTRUE`, `_frxt_setup_switch()` → switch on interrupt exit | `portable/xtensa/include/freertos/portmacro.h` l.473–492 |
| Passing NULL instead: the kernel only marks `xYieldPending` ("in case the user is not using the xHigherPriorityTaskWoken parameter"); the switch then happens at the next tick interrupt (`xTaskIncrementTick` checks `xYieldPending`) — up to one tick (10 ms) later if the CPU is idle | `tasks.c` l.3935–3943, l.3401–3405 — **"up to 10 ms" is derived** |
| Main task priority 1 > idle priority 0 → waking it from idle counts as "higher priority" | output FACTS (`esp_task.h`) |

## The queue and the waiting task

| Fact | Source |
|---|---|
| `xQueueCreate(10, sizeof(uint32_t))` → 10 slots × 4 bytes; items copied in and out | `queue.h` l.149; l.1076–1079 |
| `xQueueReceive(q, &pin, portMAX_DELAY)`: `portMAX_DELAY` = 0xFFFFFFFF; with `INCLUDE_vTaskSuspend == 1` the task goes on the **suspended list** "to ensure it is not woken by a timing event. It will block indefinitely." | `portmacro.h` (portMAX_DELAY); `FreeRTOSConfig.h` l.213; `tasks.c` l.6379–6386 |
| `xQueueReset(q)` empties the queue | `queue.h` l.1372 |
| `pdMS_TO_TICKS(30)` = 3 ticks; `vTaskDelay(3)` wakes after the 3rd tick interrupt → between 20 and 30 ms when called between ticks | `projdefs.h`; `tasks.c` `vTaskDelay` (`prvAddCurrentTaskToDelayedList(xTicksToDelay)`) — range derived |
| Ganssle: "a debounce period in the 20 to 50 msec range" | Ganssle pdf l.858–859 |
| Bounce happens on release too ("Seven of the switches consistently bounced much longer when closed than when opened" — both directions bounce; one switch's worst was 157 ms on opening) → a release can produce a falling edge | Ganssle pdf l.118–134 |

## Under the hood

| Fact | Source |
|---|---|
| `gpio_set_intr_type` → `gpio_ll_set_intr_type`: `hw->pin[n].int_type = intr_type` → GPIO_PIN18_REG (`0x3FF440D0`) bits 9:7 | `gpio_ll.h` l.260–263; `gpio_reg.h` l.908, l.928–934 |
| Enable on core 0: `hw->pin[n].int_ena = GPIO_LL_PRO_CPU_INTR_ENA` = BIT(2) → INT_ENA bits 17:13 = 0b00100 ("bit2: PRO CPU interrupt enable") | `gpio_ll.h` l.39–41, l.323–330; TRM GPIO_PINn_INT_ENA |
| GPIO_STATUS_REG `0x3FF44044` "GPIO0-31 interrupt status"; GPIO_STATUS_W1TC_REG `0x3FF4404C`; GPIO_PCPU_INT_REG `0x3FF44068` "GPIO 0-31 PRO_CPU interrupt status" | TRM v5.9 register summary; `gpio_reg.h` l.146, l.162, l.210 |
| `gpio_intr_service` (IRAM_ATTR): reads the core's status (`hw->pcpu_int` on core 0), then `gpio_isr_loop`: `__builtin_ffs(status)` finds each set bit; **edge types: clear the status bit first** ("interrupt status bits should be cleared before entering per-pin handlers"), then call `fn(args)`; level types: clear after | `gpio.c` l.66, l.483–530; `gpio_ll.h` l.273–276, l.298–301 (`status_w1tc`) |
| `app_main` runs on CPU 0 → the service and the pin interrupt are on CPU 0 (PRO CPU) | output FACTS (main task affinity); `gpio.c` l.181–190, l.567 |

## Misc (as shown)

| Fact | Source |
|---|---|
| `SOC_GPIO_VALID_GPIO_MASK` = bits 0–39 except 24 and 28–31 → `1ULL << 24` fails `gpio_config`'s mask check | `soc/esp32/include/soc/soc_caps.h` l.182; `gpio.c` l.357–360 |
| The answer scene's CPU lane and the demo pipeline are narration-paced, labelled "not to scale" — no timing claims | — |
| Other ISR-safe FreeRTOS calls shown as examples: `xSemaphoreGiveFromISR` (semphr.h l.595), `xTaskNotifyFromISR` (task.h l.2142) | `FreeRTOS-Kernel/include/freertos/semphr.h`, `task.h` |
| `gpio_wakeup_enable` with an edge type: `ESP_LOGE("GPIO wakeup only supports level mode, but edge mode set. gpio_num:%u")` → `ESP_ERR_INVALID_ARG` | `gpio.c` l.650–679 |
