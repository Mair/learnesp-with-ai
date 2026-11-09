/*
 * freertos-two-cores: the pinning call, run in QEMU (ESP-IDF v6.0.2); see FACTS.md.
 * QEMU can't run this video's two-core busy load faithfully (see freertos-scheduler/FACTS.md),
 * so the lanes and the per-loop log lines stay worked out from the rules; this lab only checks
 * what QEMU can show.
 *
 * LAB_VARIANT (not on screen):
 *   0  the workers pinned to core 1 (as shown)
 *   1  the mistake: core 2
 */
#include "esp_cpu.h"
#include "esp_log.h"
#include "esp_timer.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

#ifndef LAB_VARIANT
#define LAB_VARIANT 0
#endif

static const char *TAG = "cores";

static void work_task(void *arg)
{
    while (1) {
        ESP_LOGI(TAG, "%s on core %d", pcTaskGetName(NULL), esp_cpu_get_core_id());
        int64_t end = esp_timer_get_time() + 300 * 1000;
        while (esp_timer_get_time() < end) {
            // busy: keep the CPU until then
        }
        vTaskDelay(pdMS_TO_TICKS(100));   // rest
    }
}

void app_main(void)
{
#if LAB_VARIANT == 1
    xTaskCreatePinnedToCore(work_task, "work_a", 2048, NULL, 6, NULL, 2);
#else
    xTaskCreatePinnedToCore(work_task, "work_a", 2048, NULL, 6, NULL, 1);
    xTaskCreatePinnedToCore(work_task, "work_b", 2048, NULL, 6, NULL, 1);
#endif
}
