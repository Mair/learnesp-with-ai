/*
 * freertos-queues: the video's program (ESP-IDF v6.0.2).
 * Built and run in QEMU (esp32) to get the real logs shown on screen; see FACTS.md.
 *
 * LAB_VARIANT (not on screen). QEMU has no button, so every variant but 0 replaces
 * gpio_get_level(BUTTON) with a script of presses (times in ms since the scheduler started):
 *   0  the program as shown (QEMU reads GPIO 18 as 0: one "press" at boot, then held)
 *   1  the demo: one press at 1000 ms, then three quick presses at 8940, 9090, 9240 ms
 *      (timed to the narration: "press once" … "now press three times, quickly")
 *   2  a burst: eight presses 120 ms apart from 1000 ms — more than the queue holds
 *   3  the trap: the queue is created after the tasks (no presses)
 *   4  the receive timeout example: led_task waits at most 2 s (no presses until 5000 ms)
 */
#include "driver/gpio.h"
#include "esp_log.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/queue.h"

#ifndef LAB_VARIANT
#define LAB_VARIANT 0
#endif

#define LED    GPIO_NUM_2
#define BUTTON GPIO_NUM_18
static const char *TAG = "queue";

static QueueHandle_t press_queue;

#if LAB_VARIANT != 0
static const int script[][2] = {   // {down at, up at} in ms
#if LAB_VARIANT == 1
    {1000, 1060}, {8940, 9000}, {9090, 9150}, {9240, 9300},
#elif LAB_VARIANT == 2
    {1000, 1060}, {1120, 1180}, {1240, 1300}, {1360, 1420},
    {1480, 1540}, {1600, 1660}, {1720, 1780}, {1840, 1900},
#elif LAB_VARIANT == 4
    {5000, 5060},
#else
    {999999, 999999},
#endif
};
static int button_level(void)
{
    int ms = xTaskGetTickCount() * portTICK_PERIOD_MS;
    for (int i = 0; i < sizeof(script) / sizeof(script[0]); i++) {
        if (ms >= script[i][0] && ms < script[i][1]) {
            return 0;   // pressed
        }
    }
    return 1;
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
    int presses = 0;
    while (1) {
        int level = button_level();
        if (last == 1 && level == 0) {             // just pressed
            presses++;
            if (xQueueSend(press_queue, &presses, 0) != pdTRUE) {
                ESP_LOGW(TAG, "queue full: press %d dropped", presses);
            }
        }
        last = level;
        vTaskDelay(pdMS_TO_TICKS(10));
    }
}

static void led_task(void *arg)
{
    gpio_reset_pin(LED);
    gpio_set_direction(LED, GPIO_MODE_OUTPUT);
    int press;
    while (1) {
#if LAB_VARIANT == 4
        if (xQueueReceive(press_queue, &press, pdMS_TO_TICKS(2000)) != pdTRUE) {
            ESP_LOGI(TAG, "no press for 2 s");
            continue;
        }
#else
        xQueueReceive(press_queue, &press, portMAX_DELAY);   // sleeps until a press arrives
#endif
        ESP_LOGI(TAG, "press %d: blink", press);
        for (int i = 0; i < 3; i++) {
            gpio_set_level(LED, 1);
            vTaskDelay(pdMS_TO_TICKS(250));
            gpio_set_level(LED, 0);
            vTaskDelay(pdMS_TO_TICKS(250));
        }
    }
}

void app_main(void)
{
#if LAB_VARIANT != 3
    press_queue = xQueueCreate(5, sizeof(int));
#endif
    xTaskCreate(button_task, "button", 2048, NULL, 5, NULL);
    xTaskCreate(led_task,    "led",    2048, NULL, 5, NULL);
#if LAB_VARIANT == 3
    press_queue = xQueueCreate(5, sizeof(int));
#endif
}
