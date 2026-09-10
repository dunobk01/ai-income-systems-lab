import { AbsoluteFill, Series } from "remotion";
import { Backdrop } from "./components/Backdrop";
import { Scene1 } from "./scenes/Scene1";
import { Scene2 } from "./scenes/Scene2";
import { Scene3 } from "./scenes/Scene3";
import { Scene4 } from "./scenes/Scene4";
import { Scene5 } from "./scenes/Scene5";
import { Scene6 } from "./scenes/Scene6";
import { C } from "./theme";

export const MainVideo = () => {
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
    </AbsoluteFill>
  );
};
