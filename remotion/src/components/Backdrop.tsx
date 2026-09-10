import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { C } from "../theme";

/** Persistent animated backdrop shared by every scene. */
export const Backdrop = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 40) * 30;
  const drift2 = Math.cos(frame / 55) * 40;
  const gridShift = interpolate(frame, [0, 600], [0, -120]);

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: -200,
          backgroundImage:
            "linear-gradient(rgba(232,184,75,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(232,184,75,0.07) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          transform: `translate(${gridShift}px, ${gridShift / 2}px)`,
          maskImage: "radial-gradient(ellipse at 50% 45%, black 25%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 45%, black 25%, transparent 78%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          left: -200 + drift,
          top: -300 + drift2,
          background: "radial-gradient(circle, rgba(232,184,75,0.16) 0%, transparent 68%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 820,
          height: 820,
          borderRadius: "50%",
          right: -260 - drift,
          bottom: -320 - drift2,
          background: "radial-gradient(circle, rgba(255,107,61,0.14) 0%, transparent 68%)",
        }}
      />
      {/* vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.65) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
