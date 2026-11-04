/**
 * Basic GPIO intro — the course's first video (section intro, SCRIPT.md).
 *   want → what (GPIO) → map (gpio, gpio-input) → needs → go
 * Picture and soundtrack are both driven by ./basic-gpio-intro/timeline.ts.
 */
import React from 'react';
import { Audio, Sequence, staticFile } from 'remotion';
import { SCENE_COMPONENTS } from './basic-gpio-intro/Scenes';
import { FPS, INTRO_FRAMES, sceneDur, SCENES, sceneStart } from './basic-gpio-intro/timeline';

export const BASIC_INTRO_FRAMES = INTRO_FRAMES;

export const BasicGPIOIntro: React.FC = () => (
  <>
    <Audio src={staticFile('basic-gpio-intro/mix.wav')} />
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
