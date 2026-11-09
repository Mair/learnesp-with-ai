/*
 * gpio-interrupts: the driver's checks, run in QEMU (ESP-IDF v6.0.2) for the log lines on screen;
 * see FACTS.md. QEMU has no button, so no edge ever arrives: the press and bounce logs in the
 * video stay illustrations.
 *
 * LAB_VARIANT (not on screen):
 *   1  gpio_config with an empty mask
 *   2  gpio_install_isr_service called twice
 *   3  gpio_isr_handler_add before the service is installed
 *   4  gpio_wakeup_enable with an edge type
 */
#include "driver/gpio.h"
#include "esp_err.h"
#include "esp_log.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

#ifndef LAB_VARIANT
#define LAB_VARIANT 1
#endif

#define BUTTON GPIO_NUM_18
static const char *TAG = "lab";

static void button_isr(void *arg) {}

void app_main(void)
{
    esp_err_t err = ESP_OK;
#if LAB_VARIANT == 1
    gpio_config_t io = {
        .pin_bit_mask = 0,
        .mode         = GPIO_MODE_INPUT,
        .pull_up_en   = GPIO_PULLUP_ENABLE,
        .pull_down_en = GPIO_PULLDOWN_DISABLE,
        .intr_type    = GPIO_INTR_NEGEDGE,
    };
    err = gpio_config(&io);
    ESP_LOGI(TAG, "gpio_config returned %s", esp_err_to_name(err));
#elif LAB_VARIANT == 2
    gpio_install_isr_service(0);
    err = gpio_install_isr_service(0);
    ESP_LOGI(TAG, "second gpio_install_isr_service returned %s", esp_err_to_name(err));
#elif LAB_VARIANT == 3
    err = gpio_isr_handler_add(BUTTON, button_isr, (void *) BUTTON);
    ESP_LOGI(TAG, "gpio_isr_handler_add returned %s", esp_err_to_name(err));
#elif LAB_VARIANT == 4
    err = gpio_wakeup_enable(BUTTON, GPIO_INTR_NEGEDGE);
    ESP_LOGI(TAG, "gpio_wakeup_enable returned %s", esp_err_to_name(err));
#endif
}
