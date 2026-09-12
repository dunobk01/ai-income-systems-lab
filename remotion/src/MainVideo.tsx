import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, Sequence, Series, staticFile } from "remotion";
import { Backdrop } from "./components/Backdrop";
import { Scene1 } from "./scenes/Scene1";
import { Scene2 } from "./scenes/Scene2";
import { Scene3 } from "./scenes/Scene3";
import { Scene4 } from "./scenes/Scene4";
import { Scene5 } from "./scenes/Scene5";
import { Scene6 } from "./scenes/Scene6";
import { C } from "./theme";

export const MainVideo = () => {
  const voiceovers = [
    { from: 3, duration: 87, file: "voice-1.mp3", rate: 1.32 },
    { from: 94, duration: 86, file: "voice-2.mp3", rate: 1 },
    { from: 184, duration: 116, file: "voice-3.mp3", rate: 1.14 },
    { from: 304, duration: 101, file: "voice-4.mp3", rate: 1.7 },
    { from: 409, duration: 86, file: "voice-5.mp3", rate: 1.1 },
    { from: 499, duration: 101, file: "voice-6.mp3", rate: 1.34 },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Backdrop />
      <Series>
        <Series.Sequence durationInFrames={90}>
          <Scene1 />
        </Series.Sequence>
        <Series.Sequence durationInFrames={90}>
          <Scene2 />
        </Series.Sequence>
        <Series.Sequence durationInFrames={120}>
          <Scene3 />
        </Series.Sequence>
        <Series.Sequence durationInFrames={105}>
          <Scene4 />
        </Series.Sequence>
        <Series.Sequence durationInFrames={90}>
          <Scene5 />
        </Series.Sequence>
        <Series.Sequence durationInFrames={105}>
          <Scene6 />
        </Series.Sequence>
      </Series>

      <Audio
        src={staticFile("audio/upbeat-bed.mp3")}
        volume={(frame) =>
          interpolate(frame, [0, 18, 550, 599], [0, 0.075, 0.075, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />

      {voiceovers.map((voice) => (
        <Sequence key={voice.file} from={voice.from} durationInFrames={voice.duration}>
          <Audio
            src={staticFile(`audio/${voice.file}`)}
            playbackRate={voice.rate}
            volume={(frame) =>
              interpolate(frame, [0, 3, Math.max(4, voice.duration - 4), voice.duration], [0, 1, 1, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            }
          />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
