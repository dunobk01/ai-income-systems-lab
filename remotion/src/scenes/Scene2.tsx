import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { Kinetic } from "../components/Kinetic";
import { C, FONT } from "../theme";

/** TURN — the promise: systems, not tools. */
export const Scene2 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const wipe = spring({ frame, fps, config: { damping: 200 } });
  const wipeX = interpolate(wipe, [0, 1], [-1920, 0]);

  const pulse = 1 + Math.sin(frame / 6) * 0.02;
  const underline = spring({ frame: frame - 34, fps, config: { damping: 14, stiffness: 120 } });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateX(${wipeX}px)`,
          background: "linear-gradient(100deg, rgba(232,184,75,0.10), rgba(255,107,61,0.06))",
        }}
      />
      <p
        style={{
          fontFamily: FONT,
          fontSize: 30,
          letterSpacing: "0.35em",
          textTransform: "uppercase",
          color: C.muted,
          opacity: interpolate(frame, [4, 18], [0, 1], { extrapolateRight: "clamp" }),
          marginBottom: 26,
        }}
      >
        You need one thing
      </p>
      <div style={{ transform: `scale(${pulse})` }}>
        <Kinetic text="A SYSTEM" delay={8} size={190} color={C.gold} shadow="0 0 70px rgba(232,184,75,0.35)" />
      </div>
      <div
        style={{
          marginTop: 18,
          height: 10,
          width: 520 * underline,
          background: C.accent,
          borderRadius: 99,
        }}
      />
      <div style={{ marginTop: 40 }}>
        <Kinetic
          text="that runs while you sleep."
          delay={40}
          size={54}
          color={C.white}
          italic
        />
      </div>
    </AbsoluteFill>
  );
};
