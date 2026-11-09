/*
 * freertos-tasks: the video's program (ESP-IDF v6.0.2).
 * Built and run in QEMU (esp32) to get the real logs shown on screen; see FACTS.md.
 *
 * LAB_VARIANT (not on screen):
 *   0  the program as shown: two blink tasks
 *   1  blink_task returns (no loop) — the "must never return" error
 *   2  blink_fast with a stack that is too small (STACK_SMALL bytes) — the overflow
 */
#include "driver/gpio.h"
#include "esp_log.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

#ifndef LAB_VARIANT
#define LAB_VARIANT 0
#endif
#ifndef STACK_SMALL
#define STACK_SMALL 400
#endif

typedef struct { gpio_num_t pin; uint32_t delay_ms; } blink_t;

static void blink_task(void *arg)
{
    const blink_t *b = arg;
    gpio_reset_pin(b->pin);
    gpio_set_direction(b->pin, GPIO_MODE_OUTPUT);
#if LAB_VARIANT == 1
    gpio_set_level(b->pin, 1);
    vTaskDelay(pdMS_TO_TICKS(b->delay_ms));
    gpio_set_level(b->pin, 0);
    return;   // the mistake: a task function returns
#else
    while (1) {
        gpio_set_level(b->pin, 1);
        vTaskDelay(pdMS_TO_TICKS(b->delay_ms));
        gpio_set_level(b->pin, 0);
        vTaskDelay(pdMS_TO_TICKS(b->delay_ms));
    }
#endif
}

static blink_t fast = { GPIO_NUM_2,  200 };
static blink_t slow = { GPIO_NUM_19, 500 };

void app_main(void)
{
#if LAB_VARIANT == 2
    xTaskCreate(blink_task, "blink_fast", STACK_SMALL, &fast, 5, NULL);
#else
    xTaskCreate(blink_task, "blink_fast", 2048, &fast, 5, NULL);
#endif
    xTaskCreate(blink_task, "blink_slow", 2048, &slow, 5, NULL);
}
