/*
 * freertos-delay-until: the video's program (ESP-IDF v6.0.2).
 * Built and run in QEMU (esp32) to get the real logs shown on screen; see FACTS.md.
 *
 * LAB_VARIANT (not on screen):
 *   0  the program as shown: delay_task (vTaskDelay) and until_task (xTaskDelayUntil)
 *   1  as 0, and each task logs how many times it switched its LED after 10 s
 *   2  the late loop: until_task's 5th job takes 500 ms, with the pdFALSE check + ESP_LOGW
 *   3  a period under one tick: xTaskDelayUntil(&last, pdMS_TO_TICKS(5))
 */
#include "driver/gpio.h"
#include "esp_log.h"
#include "esp_timer.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

#ifndef LAB_VARIANT
#define LAB_VARIANT 0
#endif

#define LED_A GPIO_NUM_2
#define LED_B GPIO_NUM_19
static const char *TAG = "beat";

static void work_ms(int ms)   // stands in for reading a sensor
{
    int64_t end = esp_timer_get_time() + ms * 1000;
    while (esp_timer_get_time() < end) {
    }
}
#define work_30ms() work_ms(30)

static void setup(gpio_num_t pin)
{
    gpio_reset_pin(pin);
    gpio_set_direction(pin, GPIO_MODE_OUTPUT);
}

static void delay_task(void *arg)
{
    setup(LED_A);
    int level = 0;
#if LAB_VARIANT == 1
    int n = 0;
    TickType_t start = xTaskGetTickCount();
#endif
    while (1) {
        level = !level;
        gpio_set_level(LED_A, level);
        work_30ms();
        vTaskDelay(pdMS_TO_TICKS(200));
#if LAB_VARIANT == 1
        if (++n && xTaskGetTickCount() - start >= pdMS_TO_TICKS(10000)) {
            ESP_LOGI(TAG, "LED A switched %d times in 10 s", n);
            vTaskDelete(NULL);
        }
#endif
    }
}

static void until_task(void *arg)
{
    setup(LED_B);
    int level = 0;
#if LAB_VARIANT == 1 || LAB_VARIANT == 2
    int n = 0;
#endif
#if LAB_VARIANT == 1
    TickType_t start = xTaskGetTickCount();
#endif
    TickType_t last = xTaskGetTickCount();
    while (1) {
        level = !level;
        gpio_set_level(LED_B, level);
#if LAB_VARIANT == 2
        work_ms(++n == 5 ? 500 : 30);
        if (xTaskDelayUntil(&last, pdMS_TO_TICKS(200)) == pdFALSE) {
            ESP_LOGW(TAG, "missed a beat");
        }
#elif LAB_VARIANT == 3
        work_30ms();
        xTaskDelayUntil(&last, pdMS_TO_TICKS(5));
#else
        work_30ms();
        xTaskDelayUntil(&last, pdMS_TO_TICKS(200));
#endif
#if LAB_VARIANT == 1
        if (++n && xTaskGetTickCount() - start >= pdMS_TO_TICKS(10000)) {
            ESP_LOGI(TAG, "LED B switched %d times in 10 s", n);
            vTaskDelete(NULL);
        }
#endif
    }
}

void app_main(void)
{
#if LAB_VARIANT != 2 && LAB_VARIANT != 3
    xTaskCreate(delay_task, "delay_task", 2048, NULL, 5, NULL);
#endif
    xTaskCreate(until_task, "until_task", 2048, NULL, 5, NULL);
}
