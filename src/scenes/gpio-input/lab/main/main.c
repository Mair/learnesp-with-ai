/*
 * gpio-input: the video's program (ESP-IDF v6.0.2).
 * Built and run in QEMU (esp32) to get the real logs shown on screen; see FACTS.md.
 *
 * LAB_VARIANT (not on screen). QEMU has no button: variant 2 replaces gpio_get_level(BUTTON)
 * with one scripted press (down 2000–2100 ms after the scheduler started).
 *   0  the demo program as shown (button → LED)
 *   1  gpio_set_pull_mode on GPIO 34 (no pull resistors), return value printed
 *   2  counting presses (the count scene's loop), one simulated press
 */
#include <stdbool.h>
#include "driver/gpio.h"
#include "esp_err.h"
#include "esp_log.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

#ifndef LAB_VARIANT
#define LAB_VARIANT 0
#endif

#define LED    GPIO_NUM_2
#define BUTTON GPIO_NUM_18
static const char *TAG = "button";

#if LAB_VARIANT == 2
static int button_level(void)
{
    int ms = xTaskGetTickCount() * portTICK_PERIOD_MS;
    return (ms >= 2000 && ms < 2100) ? 0 : 1;
}
#else
#define button_level() gpio_get_level(BUTTON)
#endif

void app_main(void)
{
#if LAB_VARIANT == 1
    esp_err_t err = gpio_set_pull_mode(GPIO_NUM_34, GPIO_PULLUP_ONLY);
    ESP_LOGI("lab", "gpio_set_pull_mode returned %s", esp_err_to_name(err));
#else
    gpio_reset_pin(LED);
    gpio_set_direction(LED, GPIO_MODE_OUTPUT);
    gpio_reset_pin(BUTTON);
    gpio_set_direction(BUTTON, GPIO_MODE_INPUT);
    gpio_set_pull_mode(BUTTON, GPIO_PULLUP_ONLY);
#if LAB_VARIANT == 2
    int last = 1, presses = 0;
    while (1) {
        int level = button_level();
        if (last == 1 && level == 0) {
            presses++;
            ESP_LOGI(TAG, "presses: %d", presses);
        }
        last = level;
        vTaskDelay(pdMS_TO_TICKS(10));
    }
#else
    while (1) {
        bool pressed = (button_level() == 0);
        gpio_set_level(LED, pressed);
        vTaskDelay(pdMS_TO_TICKS(10));
    }
#endif
#endif
}
