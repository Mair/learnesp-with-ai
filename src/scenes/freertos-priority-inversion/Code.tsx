/**
 * 4 · CODE — the whole program: three task functions side by side (low, medium, high), and
 * app_main under them. Low and high take / give the one mutex; medium never touches it;
 * app_main creates the mutex, then pins all three to core 0 with priorities 1, 2, 3.
 * Nothing extra for priority inheritance. (Exactly lab/main/main.c, variant 0.)
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { mono } from '../../components/Explainer';
import { C } from '../../theme/palette';
import { after, rise, Shell, Snippet } from './parts';
import { CODE as S, FPS, LANE_COLOR, sceneDur } from './timeline';

export const LOW = [
  'static void low_task(void *arg)',
  '{',
  '    xSemaphoreTake(lock, portMAX_DELAY);',
  '    ESP_LOGI(TAG, "low: took the lock");',
  '    work(50);',
  '    ESP_LOGI(TAG, "low: priority %u, giving it back",',
  '             uxTaskPriorityGet(NULL));',
  '    xSemaphoreGive(lock);',
  '    vTaskDelete(NULL);',
  '}',
];
export const MEDIUM = [
  'static void medium_task(void *arg)',
  '{',
  '    vTaskDelay(pdMS_TO_TICKS(20));',
  '    ESP_LOGI(TAG, "medium: busy for 1000 ms");',
  '    work(1000);   // never touches the buffer',
  '    ESP_LOGI(TAG, "medium: done");',
  '    vTaskDelete(NULL);',
  '}',
];
export const HIGH = [
  'static void high_task(void *arg)',
  '{',
  '    vTaskDelay(pdMS_TO_TICKS(30));',
  '    ESP_LOGI(TAG, "high: needs the lock");',
  '    int64_t start = esp_timer_get_time();',
  '    xSemaphoreTake(lock, portMAX_DELAY);',
  '    ESP_LOGI(TAG, "high: got it after %lld ms",',
  '             (esp_timer_get_time() - start) / 1000);',
  '    xSemaphoreGive(lock);',
  '    vTaskDelete(NULL);',
  '}',
];
export const APP_MAIN = [
  'void app_main(void)',
  '{',
  '    lock = xSemaphoreCreateMutex();',
  '    xTaskCreatePinnedToCore(low_task,    "low",    2048, NULL, 1, NULL, 0);',
  '    xTaskCreatePinnedToCore(medium_task, "medium", 2048, NULL, 2, NULL, 0);',
  '    xTaskCreatePinnedToCore(high_task,   "high",   2048, NULL, 3, NULL, 0);',
  '}',
];

export const Code: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const size = 17;
  const dimMedium = t >= S.take && t < S.medium ? 0.35 : 1;
  return (
    <Shell frames={Math.round(sceneDur('code') * FPS)} kicker="The whole program" captions={S.captions} t={t}>
      <div style={{ position: 'absolute', left: 60, top: 108, display: 'flex', gap: 18, alignItems: 'flex-start' }}>
        <div style={rise(after(t, 0.1))}>
          <Snippet t={t} title="low · priority 1" color={LANE_COLOR.low} size={size} w={590} lines={LOW} lit={[{ line: 2, at: S.take }, { line: 7, at: S.take + 0.5 }]} />
        </div>
        <div style={{ ...rise(after(t, 0.25)), opacity: after(t, 0.25) * dimMedium }}>
          <Snippet t={t} title="medium · priority 2" color={LANE_COLOR.medium} size={size} w={590} lines={MEDIUM} lit={[{ line: 4, at: S.medium }]} />
        </div>
        <div style={rise(after(t, 0.4))}>
          <Snippet t={t} title="high · priority 3" color={LANE_COLOR.high} size={size} w={590} lines={HIGH} lit={[{ line: 5, at: S.take }, { line: 8, at: S.take + 0.5 }]} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 960 - 470, top: 540, ...rise(after(t, 0.6)) }}>
        <Snippet t={t} title="app_main" color={C.cyan} size={18} w={940} lines={APP_MAIN} lit={[{ line: 3, at: S.one }, { line: 4, at: S.two }, { line: 5, at: S.three }, { line: 2, at: S.create }]} />
        <div style={{ ...mono(17, C.muted), marginTop: 10, textAlign: 'center' }}>work(ms) keeps the CPU busy for that many milliseconds: an esp_timer_get_time loop, as in the scheduler video</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 830, textAlign: 'center', ...mono(30, C.ink, { fontWeight: 700 }), ...rise(after(t, S.noExtra - 0.2)) }}>
        no extra call: <span style={{ color: C.cyan }}>a mutex does priority inheritance by itself</span>
      </div>
    </Shell>
  );
};
