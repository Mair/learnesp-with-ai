/**
 * FreeRTOS intro — opens section 2 (section intro, SCRIPT.md).
 *   want → what (tasks, scheduler, two cores) → map (14 videos) → needs → go
 * Picture and soundtrack are both driven by ./freertos-intro/timeline.ts.
 */
import React from 'react';
import { Audio, Sequence, staticFile } from 'remotion';
import { SCENE_COMPONENTS } from './freertos-intro/Scenes';
import { FPS, INTRO_FRAMES, sceneDur, SCENES, sceneStart } from './freertos-intro/timeline';

export const FREERTOS_INTRO_FRAMES = INTRO_FRAMES;

export const FreeRTOSIntro: React.FC = () => (
  <>
    <Audio src={staticFile('freertos-intro/mix.wav')} />
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
