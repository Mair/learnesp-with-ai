/*
 * freertos-stacks-watchdog: the video's program (ESP-IDF v6.0.2).
 * Built and run in QEMU (esp32) to get the real numbers shown on screen; see FACTS.md.
 *
 * LAB_VARIANT (not on screen):
 *   0  the program as shown
 *   1  the button is "jammed": treat it as held from 2 s on (QEMU has no button)
 *   2  the trap: the button task waits 10 s each time round its loop
 *   3  before: the button task without esp_task_wdt_add / esp_task_wdt_reset (jammed as in 1)
 *   4  the stack trap: blink tasks sized from the first reading (768 bytes)
 *   5  blink tasks with 1536 bytes (the resized example)
 *   (panic on: build with -DSDKCONFIG_DEFAULTS=sdkconfig.panic)
 */
#include "driver/gpio.h"
#include "esp_log.h"
#include "esp_task_wdt.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

#ifndef LAB_VARIANT
#define LAB_VARIANT 0
#endif

#define BUTTON GPIO_NUM_18
static const char *TAG = "stacks";

typedef struct { gpio_num_t pin; uint32_t delay_ms; } blink_t;

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
        ESP_LOGI(TAG, "%s: %u bytes never used", pcTaskGetName(NULL), uxTaskGetStackHighWaterMark(NULL));
    }
}

#if LAB_VARIANT == 1 || LAB_VARIANT == 3
static int button_level(void)
{
    // QEMU has no button: up (1) until 2 s, then jammed down (0) for good
    return xTaskGetTickCount() < pdMS_TO_TICKS(2000) ? 1 : 0;
}
#elif LAB_VARIANT == 2
#define button_level() 1   // QEMU reads GPIO 18 as 0: keep the button up for the trap
#else
#define button_level() gpio_get_level(BUTTON)
#endif

static void button_task(void *arg)
{
    gpio_reset_pin(BUTTON);
    gpio_set_direction(BUTTON, GPIO_MODE_INPUT);
    gpio_set_pull_mode(BUTTON, GPIO_PULLUP_ONLY);
#if LAB_VARIANT != 3
    ESP_ERROR_CHECK(esp_task_wdt_add(NULL));
#endif
    int presses = 0;
    while (1) {
#if LAB_VARIANT != 3
        esp_task_wdt_reset();
#endif
        if (button_level() == 0) {
            presses++;
            ESP_LOGI(TAG, "press %d", presses);
            while (button_level() == 0) {
                vTaskDelay(pdMS_TO_TICKS(10));
            }
        }
#if LAB_VARIANT == 2
        vTaskDelay(pdMS_TO_TICKS(10000));
#else
        vTaskDelay(pdMS_TO_TICKS(10));
#endif
    }
}

static blink_t fast = { GPIO_NUM_2,  200 };
static blink_t slow = { GPIO_NUM_19, 500 };

#if LAB_VARIANT == 4
#define BLINK_STACK 768
#elif LAB_VARIANT == 5
#define BLINK_STACK 1536
#else
#define BLINK_STACK 2048
#endif

void app_main(void)
{
    xTaskCreate(blink_task,  "blink_fast", BLINK_STACK, &fast, 5, NULL);
    xTaskCreate(blink_task,  "blink_slow", BLINK_STACK, &slow, 5, NULL);
    xTaskCreate(button_task, "button",     2048, NULL,  5, NULL);
}
