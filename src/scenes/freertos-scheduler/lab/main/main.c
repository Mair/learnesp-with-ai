/*
 * freertos-scheduler: the video's program (ESP-IDF v6.0.2).
 * Built and run in QEMU (esp32) to get the real logs shown on screen; see FACTS.md.
 *
 * LAB_VARIANT (not on screen). QEMU has no button: variant 1 scripts two presses
 * (6000–6060 ms and 13920–13980 ms after the scheduler started), spaced as in the demo.
 *   0  the program as shown, workers at 4 (no presses)
 *   1  the demo: two simulated presses (4 → 6 → 4)
 *   2  the trap: the workers' rest taken out (workers at 4)
 *   3  vTaskPrioritySet(NULL, 25): out of range
 *   4  the trap, with the workers pinned to core 0 and core 1 (QEMU keeps unpinned tasks on
 *      core 0; a board spreads them over both cores)
 */
#include "driver/gpio.h"
#include "esp_log.h"
#include "esp_timer.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

#ifndef LAB_VARIANT
#define LAB_VARIANT 0
#endif

#define BUTTON GPIO_NUM_18
static const char *TAG = "prio";

typedef struct { gpio_num_t pin; uint32_t delay_ms; } blink_t;
static TaskHandle_t work_a, work_b;

static void blink_task(void *arg)
{
    const blink_t *b = arg;
    gpio_reset_pin(b->pin);
    gpio_set_direction(b->pin, GPIO_MODE_OUTPUT);
    while (1) {
        gpio_set_level(b->pin, 1);
        vTaskDelay(pdMS_TO_TICKS(b->delay_ms));
        gpio_set_level(b->pin, 0);
        vTaskDelay(pdMS_TO_TICKS(b->delay_ms));
    }
}

static void work_task(void *arg)
{
    while (1) {
        int64_t end = esp_timer_get_time() + 300 * 1000;
        while (esp_timer_get_time() < end) {
            // busy: keep the CPU until then
        }
#if LAB_VARIANT != 2 && LAB_VARIANT != 4
        vTaskDelay(pdMS_TO_TICKS(100));   // rest
#endif
    }
}

#if LAB_VARIANT == 1
static int button_level(void)
{
    int ms = xTaskGetTickCount() * portTICK_PERIOD_MS;
    return ((ms >= 6000 && ms < 6060) || (ms >= 13920 && ms < 13980)) ? 0 : 1;
}
#else
#define button_level() gpio_get_level(BUTTON)
#endif

static void button_task(void *arg)
{
    gpio_reset_pin(BUTTON);
    gpio_set_direction(BUTTON, GPIO_MODE_INPUT);
    gpio_set_pull_mode(BUTTON, GPIO_PULLUP_ONLY);
    int last = 1;
    while (1) {
        int level = button_level();
        if (last == 1 && level == 0) {      // just pressed
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

static blink_t fast = { GPIO_NUM_2,  200 };
static blink_t slow = { GPIO_NUM_19, 500 };

void app_main(void)
{
#if LAB_VARIANT == 3
    vTaskPrioritySet(NULL, 25);
#endif
    xTaskCreate(blink_task, "blink_fast", 2048, &fast, 5, NULL);
    xTaskCreate(blink_task, "blink_slow", 2048, &slow, 5, NULL);
#if LAB_VARIANT == 4
    xTaskCreatePinnedToCore(work_task, "work_a", 2048, NULL, 4, &work_a, 0);
    xTaskCreatePinnedToCore(work_task, "work_b", 2048, NULL, 4, &work_b, 1);
#else
    xTaskCreate(work_task, "work_a", 2048, NULL, 4, &work_a);
    xTaskCreate(work_task, "work_b", 2048, NULL, 4, &work_b);
#endif
#if LAB_VARIANT != 2 && LAB_VARIANT != 4
    xTaskCreate(button_task, "button", 2048, NULL, 7, NULL);
#endif
}
