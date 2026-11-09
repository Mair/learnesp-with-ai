/*
 * pwm: the video's LEDC setup, run in QEMU (ESP-IDF v6.0.2) for the log lines on screen; see FACTS.md.
 * QEMU has no LED or speaker: only the driver's own messages are checked here.
 *
 * LAB_VARIANT (not on screen):
 *   0  timer (1000 Hz, 8 bits) + channel on GPIO 2, then a 2.8 s fade (as shown)
 *   1  the timer at 17 bits: can't be done → log + ESP_FAIL
 *   2  the fade without ledc_fade_func_install → log + ESP_FAIL
 *   3  the timer at 17 bits, inside ESP_ERROR_CHECK
 */
#include "driver/ledc.h"
#include "esp_err.h"
#include "esp_log.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

#ifndef LAB_VARIANT
#define LAB_VARIANT 0
#endif

void app_main(void)
{
    ledc_timer_config_t timer = {
        .speed_mode      = LEDC_LOW_SPEED_MODE,
        .timer_num       = LEDC_TIMER_0,
        .freq_hz         = 1000,
#if LAB_VARIANT == 1 || LAB_VARIANT == 3
        .duty_resolution = LEDC_TIMER_17_BIT,
#else
        .duty_resolution = LEDC_TIMER_8_BIT,
#endif
        .clk_cfg         = LEDC_AUTO_CLK,
    };
#if LAB_VARIANT == 1
    esp_err_t err = ledc_timer_config(&timer);
    ESP_LOGI("lab", "ledc_timer_config returned %s", esp_err_to_name(err));
    return;
#else
    ESP_ERROR_CHECK(ledc_timer_config(&timer));
#endif

    ledc_channel_config_t channel = {
        .speed_mode = LEDC_LOW_SPEED_MODE,
        .channel    = LEDC_CHANNEL_0,
        .timer_sel  = LEDC_TIMER_0,
        .gpio_num   = 2,
        .duty       = 0,
        .hpoint     = 0,
    };
    ESP_ERROR_CHECK(ledc_channel_config(&channel));

    ESP_ERROR_CHECK(ledc_set_duty(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0, 230));
    ESP_ERROR_CHECK(ledc_update_duty(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0));

#if LAB_VARIANT == 2
    esp_err_t err = ledc_set_fade_with_time(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0, 0, 2800);
    ESP_LOGI("lab", "ledc_set_fade_with_time returned %s", esp_err_to_name(err));
#else
    ESP_ERROR_CHECK(ledc_fade_func_install(0));
    ESP_ERROR_CHECK(ledc_set_fade_with_time(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0, 0, 2800));
    ESP_ERROR_CHECK(ledc_fade_start(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0, LEDC_FADE_WAIT_DONE));
    ESP_LOGI("lab", "fade done");
#endif
}
