import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setCodec('h264');
Config.setCrf(17);
Config.setChromiumOpenGlRenderer('angle-egl');
Config.setConcurrency(null); // null = auto, uses all cores
