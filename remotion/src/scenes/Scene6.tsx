import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { C, FONT } from "../theme";

/** CTA — URL lockup. */
export const Scene6 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const up = spring({ frame, fps, config: { damping: 14, stiffness: 150 } });
  const btn = spring({ frame: frame - 18, fps, config: { damping: 8, stiffness: 220 } });
  const btnPulse = 1 + Math.sin(Math.max(0, frame - 34) / 7) * 0.03;
  const line = interpolate(frame, [40, 62], [0, 900], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 30,
          letterSpacing: "0.34em",
          textTransform: "uppercase",
          color: C.accent,
          opacity: up,
          transform: `translateY(${interpolate(up, [0, 1], [40, 0])}px)`,
        }}
      >
        Grab your free copy
      </div>

      <div
        style={{
          marginTop: 30,
          padding: "34px 66px",
          borderRadius: 999,
          background: `linear-gradient(120deg, ${C.gold}, ${C.goldSoft})`,
          color: C.ink,
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 62,
          letterSpacing: "-0.02em",
          boxShadow: "0 0 110px rgba(232,184,75,0.45)",
          opacity: btn,
          transform: `scale(${interpolate(btn, [0, 1], [0.5, 1]) * btnPulse})`,
        }}
      >
        ai-income-systems.com/os
      </div>

      <div style={{ height: 6, width: line, background: "rgba(232,184,75,0.5)", borderRadius: 99, marginTop: 44 }} />

      <div
        style={{
          marginTop: 34,
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 52,
          color: C.white,
          letterSpacing: "-0.03em",
          opacity: interpolate(frame, [50, 66], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        AI INCOME SYSTEMS LAB
      </div>
    </AbsoluteFill>
  );
};
