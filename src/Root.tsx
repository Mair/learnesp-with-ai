import React from 'react';
import { AbsoluteFill, Composition } from 'remotion';
import { Backdrop, Grade } from './components/Backdrop';
import { GPIO, GPIO_FRAMES } from './scenes/GPIO';
import { GPIOInput, INPUT_FRAMES } from './scenes/GPIOInput';
import { FreeRTOSTasks, TASKS_FRAMES } from './scenes/FreeRTOSTasks';
import { FreeRTOSScheduler, SCHED_FRAMES } from './scenes/FreeRTOSScheduler';
import { FreeRTOSDelayUntil, UNTIL_FRAMES } from './scenes/FreeRTOSDelayUntil';
import { CORES_FRAMES, FreeRTOSTwoCores } from './scenes/FreeRTOSTwoCores';
import { FreeRTOSStacksWatchdog, STACKS_FRAMES } from './scenes/FreeRTOSStacksWatchdog';
import { FreeRTOSQueues, QUEUES_FRAMES } from './scenes/FreeRTOSQueues';
import { FreeRTOSMutexes, MUTEXES_FRAMES } from './scenes/FreeRTOSMutexes';
import { FreeRTOSPriorityInversion, INVERSION_FRAMES } from './scenes/FreeRTOSPriorityInversion';
import { GPIOInterrupts, IRQ_FRAMES } from './scenes/GPIOInterrupts';
import { PWM, PWM_FRAMES } from './scenes/PWM';
import { BasicGPIOIntro, BASIC_INTRO_FRAMES } from './scenes/BasicGPIOIntro';
import { FreeRTOSIntro, FREERTOS_INTRO_FRAMES } from './scenes/FreeRTOSIntro';
import { AdvancedGPIOIntro, ADVANCED_INTRO_FRAMES } from './scenes/AdvancedGPIOIntro';
import { VSCodeSpike, SPIKE_FRAMES } from './scenes/vscode-spike/VSCodeSpike';
import { InstallESPIDF, INSTALL_FRAMES } from './scenes/install-esp-idf/InstallESPIDF';
import { FirstProject, FIRST_FRAMES } from './scenes/first-project/FirstProject';

const W = 1920;
const H = 1080;
const FPS = 30;

/** Every composition shares the backdrop + grade sandwich. */
const Stage: React.FC<{ children: React.ReactNode; floor?: boolean; screen?: boolean }> = ({ children, floor, screen }) => (
  <AbsoluteFill style={{ background: '#000' }}>
    {screen ? (
      // Screen recordings: keep the whole backdrop (its scrim and noise layers
      // have z-indexes) in its own layer behind the recording. Otherwise the
      // scrim's radial gradient sits on top as a dark oval in the middle.
      <AbsoluteFill style={{ zIndex: 0, isolation: 'isolate' }}>
        <Backdrop floor={false} />
      </AbsoluteFill>
    ) : (
      <Backdrop floor={floor} />
    )}
    {screen ? <AbsoluteFill style={{ zIndex: 1 }}>{children}</AbsoluteFill> : children}
    <Grade />
  </AbsoluteFill>
);

/**
 * One <Composition> per explainer video. Add a new one with the
 * explainer-video skill (.pi/skills/explainer-video).
 */
export const RemotionRoot: React.FC = () => (
  <>
    {/* Section 1 intro: Basic GPIO */}
    <Composition
      id="BasicGPIOIntro"
      component={() => (
        <Stage floor={false}>
          <BasicGPIOIntro />
        </Stage>
      )}
      durationInFrames={BASIC_INTRO_FRAMES}
      fps={FPS}
      width={W}
      height={H}
    />

    {/* Section 2 intro: FreeRTOS */}
    <Composition
      id="FreeRTOSIntro"
      component={() => (
        <Stage floor={false}>
          <FreeRTOSIntro />
        </Stage>
      )}
      durationInFrames={FREERTOS_INTRO_FRAMES}
      fps={FPS}
      width={W}
      height={H}
    />

    {/* Section 3 intro: Advanced GPIO */}
    <Composition
      id="AdvancedGPIOIntro"
      component={() => (
        <Stage floor={false}>
          <AdvancedGPIOIntro />
        </Stage>
      )}
      durationInFrames={ADVANCED_INTRO_FRAMES}
      fps={FPS}
      width={W}
      height={H}
    />

    {/* PWM (pure ESP-IDF LEDC): ledc_timer_config → ledc_channel_config → ledc_set_duty + ledc_update_duty → fade → ledc_set_freq */}
    <Composition
      id="PWM"
      component={() => (
        <Stage floor={false}>
          <PWM />
        </Stage>
      )}
      durationInFrames={PWM_FRAMES}
      fps={FPS}
      width={W}
      height={H}
    />

    {/* GPIO (pure ESP-IDF): circuit → gpio_reset_pin → gpio_set_direction → gpio_set_level → blink → vTaskDelay → current */}
    <Composition
      id="GPIO"
      component={() => (
        <Stage floor={false}>
          <GPIO />
        </Stage>
      )}
      durationInFrames={GPIO_FRAMES}
      fps={FPS}
      width={W}
      height={H}
    />

    {/* GPIO input (pure ESP-IDF): floating → pull-up → gpio_set_direction(INPUT) → gpio_set_pull_mode → gpio_get_level → demo → bounce */}
    <Composition
      id="GPIOInput"
      component={() => (
        <Stage floor={false}>
          <GPIOInput />
        </Stage>
      )}
      durationInFrames={INPUT_FRAMES}
      fps={FPS}
      width={W}
      height={H}
    />

    {/* GPIO interrupts (pure ESP-IDF): gpio_config → gpio_install_isr_service → gpio_isr_handler_add → ISR → queue → bounce */}
    <Composition
      id="GPIOInterrupts"
      component={() => (
        <Stage floor={false}>
          <GPIOInterrupts />
        </Stage>
      )}
      durationInFrames={IRQ_FRAMES}
      fps={FPS}
      width={W}
      height={H}
    />
    {/* FreeRTOS tasks (pure ESP-IDF): xTaskCreate's six arguments, vTaskDelay */}
    <Composition
      id="FreeRTOSTasks"
      component={() => (
        <Stage floor={false}>
          <FreeRTOSTasks />
        </Stage>
      )}
      durationInFrames={TASKS_FRAMES}
      fps={FPS}
      width={W}
      height={H}
    />
    {/* FreeRTOS scheduler & priorities (pure ESP-IDF): the rule, vTaskPrioritySet, the watchdog trap */}
    <Composition
      id="FreeRTOSScheduler"
      component={() => (
        <Stage floor={false}>
          <FreeRTOSScheduler />
        </Stage>
      )}
      durationInFrames={SCHED_FRAMES}
      fps={FPS}
      width={W}
      height={H}
    />
    {/* FreeRTOS delay-until (pure ESP-IDF): xTaskGetTickCount + xTaskDelayUntil, a steady beat */}
    <Composition
      id="FreeRTOSDelayUntil"
      component={() => (
        <Stage floor={false}>
          <FreeRTOSDelayUntil />
        </Stage>
      )}
      durationInFrames={UNTIL_FRAMES}
      fps={FPS}
      width={W}
      height={H}
    />
    {/* FreeRTOS two cores (pure ESP-IDF): xTaskCreatePinnedToCore, esp_cpu_get_core_id */}
    <Composition
      id="FreeRTOSTwoCores"
      component={() => (
        <Stage floor={false}>
          <FreeRTOSTwoCores />
        </Stage>
      )}
      durationInFrames={CORES_FRAMES}
      fps={FPS}
      width={W}
      height={H}
    />
    {/* FreeRTOS stacks & watchdog (pure ESP-IDF): uxTaskGetStackHighWaterMark, esp_task_wdt_add / _reset */}
    <Composition
      id="FreeRTOSStacksWatchdog"
      component={() => (
        <Stage floor={false}>
          <FreeRTOSStacksWatchdog />
        </Stage>
      )}
      durationInFrames={STACKS_FRAMES}
      fps={FPS}
      width={W}
      height={H}
    />
    {/* FreeRTOS queues (pure ESP-IDF): xQueueCreate, xQueueSend, xQueueReceive */}
    <Composition
      id="FreeRTOSQueues"
      component={() => (
        <Stage floor={false}>
          <FreeRTOSQueues />
        </Stage>
      )}
      durationInFrames={QUEUES_FRAMES}
      fps={FPS}
      width={W}
      height={H}
    />
    {/* FreeRTOS mutexes (pure ESP-IDF): xSemaphoreCreateMutex, xSemaphoreTake, xSemaphoreGive */}
    <Composition
      id="FreeRTOSMutexes"
      component={() => (
        <Stage floor={false}>
          <FreeRTOSMutexes />
        </Stage>
      )}
      durationInFrames={MUTEXES_FRAMES}
      fps={FPS}
      width={W}
      height={H}
    />
    <Composition
      id="FreeRTOSPriorityInversion"
      component={() => (
        <Stage floor={false}>
          <FreeRTOSPriorityInversion />
        </Stage>
      )}
      durationInFrames={INVERSION_FRAMES}
      fps={FPS}
      width={W}
      height={H}
    />
    {/* Setup: install VS Code, the ESP-IDF extension and ESP-IDF (recorded take, capture/takes/install-esp-idf.ts) */}
    <Composition
      id="InstallESPIDF"
      component={() => (
        <Stage screen>
          <InstallESPIDF />
        </Stage>
      )}
      durationInFrames={INSTALL_FRAMES}
      fps={FPS}
      width={W}
      height={H}
    />
    {/* Setup: a first project that prints Hello world (recorded take, capture/takes/first-project.ts) */}
    <Composition
      id="FirstProject"
      component={() => (
        <Stage screen>
          <FirstProject />
        </Stage>
      )}
      durationInFrames={FIRST_FRAMES}
      fps={FPS}
      width={W}
      height={H}
    />
    {/* Spike: recorded VS Code take (capture/) + event-driven camera */}
    <Composition
      id="VSCodeSpike"
      component={() => (
        <Stage screen>
          <VSCodeSpike />
        </Stage>
      )}
      durationInFrames={SPIKE_FRAMES}
      fps={FPS}
      width={W}
      height={H}
    />
  </>
);
