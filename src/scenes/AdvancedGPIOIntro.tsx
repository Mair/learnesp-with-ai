/**
 * Advanced GPIO intro — opens section 3 (section intro, SCRIPT.md).
 *   want → what (peripherals) → map (pwm, gpio-interrupts, adc, dac) → needs → go
 * Picture and soundtrack are both driven by ./advanced-gpio-intro/timeline.ts.
 */
import React from 'react';
import { Audio, Sequence, staticFile } from 'remotion';
import { SCENE_COMPONENTS } from './advanced-gpio-intro/Scenes';
import { FPS, INTRO_FRAMES, sceneDur, SCENES, sceneStart } from './advanced-gpio-intro/timeline';

export const ADVANCED_INTRO_FRAMES = INTRO_FRAMES;

export const AdvancedGPIOIntro: React.FC = () => (
  <>
    <Audio src={staticFile('advanced-gpio-intro/mix.wav')} />
    {SCENES.map(({ id }) => {
      const C = SCENE_COMPONENTS[id];
      return (
        <Sequence key={id} from={Math.round(sceneStart(id) * FPS)} durationInFrames={Math.round(sceneDur(id) * FPS)} name={id}>
          <C />
        </Sequence>
      );
    })}
  </>
);
