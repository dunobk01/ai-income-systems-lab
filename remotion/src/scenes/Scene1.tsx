import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { Kinetic } from "../components/Kinetic";
import { C, FONT } from "../theme";

/** HOOK — hard-cut flash, oversized word slam. */
export const Scene1 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const flash = interpolate(frame, [0, 4, 10], [1, 0.55, 0], { extrapolateRight: "clamp" });
  const slam = spring({ frame: frame - 2, fps, config: { damping: 9, stiffness: 240, mass: 0.6 } });
  const slamScale = interpolate(slam, [0, 1], [2.6, 1]);
  const shake = frame < 22 ? Math.sin(frame * 2.4) * (22 - frame) * 0.7 : 0;

  const barW = interpolate(frame, [16, 34], [0, 640], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill
      style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}
    >
      <div style={{ transform: `translate(${shake}px, ${shake * 0.4}px)`, textAlign: "center" }}>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 260,
            letterSpacing: "-0.06em",
            color: C.gold,
            transform: `scale(${slamScale})`,
            opacity: slam,
            textShadow: "0 0 80px rgba(232,184,75,0.45)",
            lineHeight: 0.9,
          }}
        >
          STOP.
        </div>
        <div
          style={{
            width: barW,
            height: 8,
            background: C.accent,
            margin: "26px auto 0",
            borderRadius: 99,
          }}
        />
        <div style={{ marginTop: 34 }}>
          <Kinetic text="Collecting AI tools isn't a business." delay={30} size={62} color={C.white} />
        </div>
      </div>

      <AbsoluteFill style={{ background: "#FFFFFF", opacity: flash, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
