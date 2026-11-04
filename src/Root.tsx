import React from 'react';
import { AbsoluteFill, Composition } from 'remotion';
import { Backdrop, Grade } from './components/Backdrop';
import { GPIO, GPIO_FRAMES } from './scenes/GPIO';
import { GPIOInput, INPUT_FRAMES } from './scenes/GPIOInput';
import { FreeRTOSTasks, TASKS_FRAMES } from './scenes/FreeRTOSTasks';
import { GPIOInterrupts, IRQ_FRAMES } from './scenes/GPIOInterrupts';
import { PWM, PWM_FRAMES } from './scenes/PWM';
import { BasicGPIOIntro, BASIC_INTRO_FRAMES } from './scenes/BasicGPIOIntro';
import { FreeRTOSIntro, FREERTOS_INTRO_FRAMES } from './scenes/FreeRTOSIntro';
import { AdvancedGPIOIntro, ADVANCED_INTRO_FRAMES } from './scenes/AdvancedGPIOIntro';

const W = 1920;
const H = 1080;
const FPS = 30;

/** Every composition shares the backdrop + grade sandwich. */
const Stage: React.FC<{ children: React.ReactNode; floor?: boolean }> = ({ children, floor }) => (
  <AbsoluteFill style={{ background: '#000' }}>
    <Backdrop floor={floor} />
    {children}
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
  </>
);
