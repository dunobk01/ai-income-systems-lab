import { AbsoluteFill, useCurrentFrame, spring, interpolate, useVideoConfig } from "remotion";

export const Scene2 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const mainOpacity = spring({ frame: frame - 5, fps, config: { damping: 20, stiffness: 100 } });
  const mainScale = spring({ frame: frame - 5, fps, config: { damping: 12, stiffness: 60 } });
  const subtitleOpacity = spring({ frame: frame - 30, fps, config: { damping: 20, stiffness: 100 } });

  const gradientShift = interpolate(frame, [0, 90], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(168,85,247,${0.15 + gradientShift * 0.1}) 0%, transparent 70%)`,
          top: "5%",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      />

      <div
        style={{
          opacity: mainOpacity,
          transform: `scale(${0.85 + mainScale * 0.15})`,
          textAlign: "center",
          zIndex: 1,
        }}
      >
        <p
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: 80,
            fontWeight: 900,
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            color: "#F8FAFC",
            maxWidth: 1200,
          }}
        >
          Start shipping{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #6366F1, #A855F7)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            income systems.
          </span>
        </p>
      </div>

      <div
        style={{
          opacity: subtitleOpacity,
          transform: `translateY(${(1 - subtitleOpacity) * 20}px)`,
          textAlign: "center",
          zIndex: 1,
        }}
      >
        <p
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: 36,
            fontWeight: 600,
            color: "#94A3B8",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          AI Income Systems Lab
        </p>
      </div>
    </AbsoluteFill>
  );
};
