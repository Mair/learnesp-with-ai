> **Narration pass:** VO rewritten to `SCRIPT.md` "Sound like a teacher, not a list"; opens "Let's
> say you want your program to react the instant someone presses a button…" with polling as the
> first try; the four driver messages are real QEMU output (`lab/`); press/bounce logs labelled
> illustrations; register names and internal driver names removed from the screen; cues ported to
> `vo-plan` word cues. As built: 5:47 (346.6 s).

# GPIO interrupts — storyboard v1 (pure ESP-IDF)

> **Course sections:** this is now in section 3 (Advanced GPIO), after PWM. p1 and f3 say "back in the GPIO input video" instead of "last time" (re-voiced, re-timed); the payoff's "next:" points to ADC.

> **Under-the-hood scene cut** (rule "teach driving, not the engine", `AGENTS.md`). The scene, its VO and its sound were removed; the video goes straight from the second knob to the payoff. Its storyboard rows and facts are kept below, marked *(cut)*, for reference only.

Slug `gpio-interrupts` · composition `GPIOInterrupts` · `out/3-advanced-gpio/gpio-interrupts.mp4` · ~6 min · every claim → `FACTS.md`.
Third in the series: same board, same button on GPIO 18 (pull-up, active low).
Planned and built without a stop for approval (user's request); decisions noted at the end.

```c
#include "driver/gpio.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/queue.h"
#include "esp_log.h"

#define BUTTON GPIO_NUM_18
static const char *TAG = "button";
static QueueHandle_t button_events;

static void button_isr(void *arg)
{
    uint32_t pin = (uint32_t) arg;
    BaseType_t woken = pdFALSE;
    xQueueSendFromISR(button_events, &pin, &woken);
    portYIELD_FROM_ISR(woken);
}

void app_main(void)
{
    button_events = xQueueCreate(10, sizeof(uint32_t));

    gpio_config_t io = {
        .pin_bit_mask = 1ULL << BUTTON,
        .mode         = GPIO_MODE_INPUT,
        .pull_up_en   = GPIO_PULLUP_ENABLE,
        .pull_down_en = GPIO_PULLDOWN_DISABLE,
        .intr_type    = GPIO_INTR_NEGEDGE,
    };
    ESP_ERROR_CHECK(gpio_config(&io));
    ESP_ERROR_CHECK(gpio_install_isr_service(0));
    ESP_ERROR_CHECK(gpio_isr_handler_add(BUTTON, button_isr, (void *) BUTTON));

    int presses = 0;
    uint32_t pin;
    while (1) {
        xQueueReceive(button_events, &pin, portMAX_DELAY);
        vTaskDelay(pdMS_TO_TICKS(30));      // let the bounce settle
        xQueueReset(button_events);          // drop the extra edges
        if (gpio_get_level(BUTTON) == 0) {
            presses++;
            ESP_LOGI(TAG, "presses: %d", presses);
        }
    }
}
```

## Arc

| # | Scene | Job |
|---|---|---|
| 1 | Problem | polling: 360 000 reads an hour "just in case"; a pulse between two reads is never seen |
| 2 | Answer | the hardware watches for the edge, interrupts the CPU, runs your function → **INTERRUPT** |
| 3 | `gpio_config(&io)` | one struct: 64-bit mask (`1ULL << 18`), mode, pulls, **intr_type = NEGEDGE**; errors |
| 4 | `gpio_install_isr_service(0)` | one CPU interrupt for all GPIOs → the driver's dispatcher; flags 0; install once |
| 5 | `gpio_isr_handler_add(…)` | pin, function, argument (handed back); enables the pin's interrupt; order matters |
| 6 | The ISR | interrupt context rules: no blocking, no ESP_LOGI, 1536-byte stack; xQueueSendFromISR; woken + portYIELD_FROM_ISR; IRAM_ATTR not needed with flags 0 |
| 7 | The queue | 10 × 4 bytes; xQueueReceive(…, portMAX_DELAY) → suspended list → zero cost while waiting |
| 8 | Demo | press → status bit → dispatcher → button_isr → queue → task logs; 100 wake-ups/s vs one per press |
| 9 | Bounce | one press = five interrupts; release bounces too; fix in the task: wait 30 ms, xQueueReset, read once |
| 10 | Second knob: the trigger | NEG / POS / ANY edge; level types keep firing while held → for waking from light sleep |
| 11 | ~~Under the hood~~ *(cut)* | GPIO_PIN18_REG INT_TYPE = 2, INT_ENA = PRO CPU → GPIO_STATUS bit 18 → `gpio_intr_service` → `__builtin_ffs` → clear first (edge) → `fn(args)` |
| 12 | Payoff | "Don't keep asking. Let the pin tell you." |

Narration and per-line cues: `timeline.ts` (VO + cue objects, each cue noted with its word).

## Decisions

1. **`gpio_config`** introduced here (deferred from the input video).
2. **Debounce in the task**, not in the ISR (no timers or interrupt re-enabling in interrupt context — simplest correct pattern).
3. **`portYIELD_FROM_ISR(woken)`** shown, unlike Espressif's example (which passes NULL), because it's the difference between "now" and "next tick".
4. **No `IRAM_ATTR`**: with flags 0 the driver header says it isn't needed; the scene says why the example has it.
5. No interrupt-latency numbers on screen (no primary source found).
