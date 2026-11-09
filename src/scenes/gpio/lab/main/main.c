/*
 * gpio: the video's program (ESP-IDF v6.0.2).
 * Built and run in QEMU (esp32) to get the real logs shown on screen; see FACTS.md.
 *
 * LAB_VARIANT (not on screen):
 *   0  the program as shown: blink GPIO 2
 *   1  the first try: only gpio_set_level(LED, 1) (prints the return value)
 *   2  gpio_set_direction on GPIO 34 (input only), return value printed
 *   3  the same inside ESP_ERROR_CHECK
 *   4  the blink loop with the delays taken out (task watchdog)
 */
#include "driver/gpio.h"
#include "esp_err.h"
#include "esp_log.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

#ifndef LAB_VARIANT
#define LAB_VARIANT 0
#endif

#define LED GPIO_NUM_2

void app_main(void)
{
#if LAB_VARIANT == 1
    esp_err_t err = gpio_set_level(LED, 1);
    ESP_LOGI("lab", "gpio_set_level returned %s", esp_err_to_name(err));
#elif LAB_VARIANT == 2
    esp_err_t err = gpio_set_direction(GPIO_NUM_34, GPIO_MODE_OUTPUT);
    ESP_LOGI("lab", "gpio_set_direction returned %s", esp_err_to_name(err));
#elif LAB_VARIANT == 3
    ESP_ERROR_CHECK(gpio_set_direction(GPIO_NUM_34, GPIO_MODE_OUTPUT));
#else
    gpio_reset_pin(LED);
    gpio_set_direction(LED, GPIO_MODE_OUTPUT);

    while (1) {
        gpio_set_level(LED, 1);
#if LAB_VARIANT != 4
        vTaskDelay(pdMS_TO_TICKS(500));
#endif
        gpio_set_level(LED, 0);
#if LAB_VARIANT != 4
        vTaskDelay(pdMS_TO_TICKS(500));
#endif
    }
#endif
}
