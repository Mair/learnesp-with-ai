/*
 * freertos-mutexes: the video's program (ESP-IDF v6.0.2).
 * Built and run in QEMU (esp32, two cores) to get the real logs shown on screen; see FACTS.md.
 *
 * LAB_VARIANT (not on screen):
 *   0  the program as shown: total++ guarded by a mutex
 *   1  the first try: no guard (both workers do total++ at the same time)
 *   2  as 1, both workers on core 0 (one core, task switches only)
 *   3  the trap: a worker stops early with break, still holding total_lock
 *   4  as 3, the take waits at most 1 s and logs a warning (the fix that shows it)
 *   5  keep the lock short: count in a local, add it to total once, under the lock
 *   6  the wrong task gives: work_a holds total_lock, work_b calls xSemaphoreGive
 */
#include "esp_cpu.h"
#include "esp_log.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/semphr.h"

#ifndef LAB_VARIANT
#define LAB_VARIANT 0
#endif

static const char *TAG = "total";

static int total = 0;
static SemaphoreHandle_t total_lock;

#if LAB_VARIANT == 6
static void work_task(void *arg)
{
    if (esp_cpu_get_core_id() == 0) {            // work_a: takes the key and keeps it a while
        xSemaphoreTake(total_lock, portMAX_DELAY);
        ESP_LOGI(TAG, "%s took total_lock", pcTaskGetName(NULL));
        vTaskDelay(pdMS_TO_TICKS(1000));
    } else {                                     // work_b: gives back a key it never took
        vTaskDelay(pdMS_TO_TICKS(100));
        ESP_LOGI(TAG, "%s gives total_lock", pcTaskGetName(NULL));
        xSemaphoreGive(total_lock);
    }
    vTaskDelete(NULL);
}
#else
static void work_task(void *arg)
{
#if LAB_VARIANT == 5
    int mine = 0;
    for (int i = 0; i < 1000000; i++) {
        mine++;
    }
    xSemaphoreTake(total_lock, portMAX_DELAY);
    total += mine;
    xSemaphoreGive(total_lock);
#else
    for (int i = 0; i < 1000000; i++) {
#if LAB_VARIANT == 1 || LAB_VARIANT == 2
        total++;
#elif LAB_VARIANT == 4
        if (xSemaphoreTake(total_lock, pdMS_TO_TICKS(1000)) != pdTRUE) {
            ESP_LOGW(TAG, "%s: total_lock not free for 1 s", pcTaskGetName(NULL));
            i--;
            continue;
        }
        if (total >= 1500000) {   // enough: stop early
            break;
        }
        total++;
        xSemaphoreGive(total_lock);
#elif LAB_VARIANT == 3
        xSemaphoreTake(total_lock, portMAX_DELAY);
        if (total >= 1500000) {   // enough: stop early
            break;
        }
        total++;
        xSemaphoreGive(total_lock);
#else
        xSemaphoreTake(total_lock, portMAX_DELAY);
        total++;
        xSemaphoreGive(total_lock);
#endif
    }
#endif
    ESP_LOGI(TAG, "%s done: total = %d", pcTaskGetName(NULL), total);
    vTaskDelete(NULL);
}
#endif

void app_main(void)
{
    total_lock = xSemaphoreCreateMutex();
#if LAB_VARIANT == 2
    xTaskCreatePinnedToCore(work_task, "work_b", 2048, NULL, 5, NULL, 0);
    xTaskCreatePinnedToCore(work_task, "work_a", 2048, NULL, 5, NULL, 0);
#else
    xTaskCreatePinnedToCore(work_task, "work_b", 2048, NULL, 5, NULL, 1);
    xTaskCreatePinnedToCore(work_task, "work_a", 2048, NULL, 5, NULL, 0);
#endif
}
