import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from "remotion";

export const Scene1 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = spring({ frame, fps, config: { damping: 20, stiffness: 100 } });
  const x = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const translateX = x * -100 + 100;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Subtle grid background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      {/* Glowing orb */}
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          opacity: 0.6,
        }}
      />

      <div
        style={{
          opacity,
          transform: `translateX(${translateX}px)`,
          textAlign: "center",
          zIndex: 1,
        }}
      >
        <p
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: 72,
            fontWeight: 800,
            color: "#F8FAFC",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            maxWidth: 1200,
          }}
        >
          Stop watching AI tutorials.
        </p>
      </div>
    </AbsoluteFill>
  );
};
