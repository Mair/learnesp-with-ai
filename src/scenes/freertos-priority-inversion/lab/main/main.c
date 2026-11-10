/*
 * freertos-priority-inversion: the video's program (ESP-IDF v6.0.2).
 * Built and run in QEMU (esp32) to get the real logs shown on screen; see FACTS.md.
 * All three tasks are pinned to core 0, so they really compete for one CPU.
 *
 * LAB_VARIANT (not on screen):
 *   0  the program as shown: the shared thing is guarded by a mutex (priority inheritance)
 *   1  the first try: a home-made lock, a flag (busy) that high polls (priority inversion)
 *   2  the trap: low sleeps (vTaskDelay) while it holds the mutex
 *   3  the fix for the trap: a short locked part (5 ms of work instead of 50)
 */
#include <stdbool.h>
#include "esp_log.h"
#include "esp_timer.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/semphr.h"

#ifndef LAB_VARIANT
#define LAB_VARIANT 0
#endif

static const char *TAG = "inv";

#if LAB_VARIANT == 1
static volatile bool busy = false;
#else
static SemaphoreHandle_t lock;
#endif

// Keep the CPU busy for about ms milliseconds of this task's own running time.
static void work(int ms)
{
    for (int i = 0; i < ms; i++) {
        int64_t end = esp_timer_get_time() + 1000;
        while (esp_timer_get_time() < end) {
        }
    }
}

static void low_task(void *arg)
{
#if LAB_VARIANT == 1
    while (busy) {
        vTaskDelay(pdMS_TO_TICKS(10));
    }
    busy = true;
#else
    xSemaphoreTake(lock, portMAX_DELAY);
#endif
    ESP_LOGI(TAG, "low: took the lock");
#if LAB_VARIANT == 2
    vTaskDelay(pdMS_TO_TICKS(500));    // the trap: sleeping while holding it
#elif LAB_VARIANT == 3
    work(5);                           // a short locked part
#else
    work(50);                          // uses the shared thing: 50 ms of work
#endif
    ESP_LOGI(TAG, "low: priority %u, giving it back", uxTaskPriorityGet(NULL));
#if LAB_VARIANT == 1
    busy = false;
#else
    xSemaphoreGive(lock);
#endif
    vTaskDelete(NULL);
}

static void medium_task(void *arg)
{
    vTaskDelay(pdMS_TO_TICKS(20));
    ESP_LOGI(TAG, "medium: busy for 1000 ms");
    work(1000);                        // never touches the shared thing
    ESP_LOGI(TAG, "medium: done");
    vTaskDelete(NULL);
}

static void high_task(void *arg)
{
    vTaskDelay(pdMS_TO_TICKS(30));
    ESP_LOGI(TAG, "high: needs the lock");
    int64_t start = esp_timer_get_time();
#if LAB_VARIANT == 1
    while (busy) {
        vTaskDelay(pdMS_TO_TICKS(10));
    }
    busy = true;
#else
    xSemaphoreTake(lock, portMAX_DELAY);
#endif
    ESP_LOGI(TAG, "high: got it after %lld ms", (esp_timer_get_time() - start) / 1000);
#if LAB_VARIANT == 1
    busy = false;
#else
    xSemaphoreGive(lock);
#endif
    vTaskDelete(NULL);
}

void app_main(void)
{
#if LAB_VARIANT != 1
    lock = xSemaphoreCreateMutex();
#endif
    xTaskCreatePinnedToCore(low_task, "low", 2048, NULL, 1, NULL, 0);
    xTaskCreatePinnedToCore(medium_task, "medium", 2048, NULL, 2, NULL, 0);
    xTaskCreatePinnedToCore(high_task, "high", 2048, NULL, 3, NULL, 0);
}
