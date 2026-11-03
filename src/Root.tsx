import React from 'react';
import { AbsoluteFill, Composition } from 'remotion';
import { Backdrop, Grade } from './components/Backdrop';
import { GPIO, GPIO_FRAMES } from './scenes/GPIO';
import { GPIOInput, INPUT_FRAMES } from './scenes/GPIOInput';
import { GPIOInterrupts, IRQ_FRAMES } from './scenes/GPIOInterrupts';
import { PWM, PWM_FRAMES } from './scenes/PWM';

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
    {/* Module 01 · PWM: ledcAttach → ledcWrite → ledcFade → ledcWriteTone → under the hood */}
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

    {/* GPIO (pure ESP-IDF): circuit → gpio_reset_pin → gpio_set_direction → gpio_set_level → blink → vTaskDelay → current → under the hood */}
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

    {/* GPIO input (pure ESP-IDF): floating → pull-up → gpio_set_direction(INPUT) → gpio_set_pull_mode → gpio_get_level → demo → bounce → under the hood */}
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

    {/* GPIO interrupts (pure ESP-IDF): gpio_config → gpio_install_isr_service → gpio_isr_handler_add → ISR → queue → bounce → under the hood */}
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
  </>
);
