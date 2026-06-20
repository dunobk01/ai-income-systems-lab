import { AbsoluteFill, useCurrentFrame, spring, interpolate, useVideoConfig } from "remotion";

export const Scene5 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const mainOpacity = spring({ frame, fps, config: { damping: 20, stiffness: 100 } });
  const mainY = spring({ frame, fps, config: { damping: 12, stiffness: 60 } });

  const subtitleOpacity = spring({ frame: frame - 20, fps, config: { damping: 20, stiffness: 100 } });
  const urlOpacity = spring({ frame: frame - 40, fps, config: { damping: 20, stiffness: 100 } });

  const pulse = interpolate(frame % 60, [0, 30, 60], [1, 1.08, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
      }}
    >
      {/* Large background glow */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 65%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => {
        const offset = (i * 60) % 120;
        const y = interpolate(
          (frame + offset) % 120,
          [0, 60, 120],
          [400, 350, 400],
          { extrapolateRight: "clamp" }
        );
        const xPos = 300 + i * 250;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: i % 2 === 0 ? "#6366F1" : "#A855F7",
              left: xPos,
              top: y,
              opacity: 0.4,
            }}
          />
        );
      })}

      <div
        style={{
          opacity: mainOpacity,
          transform: `translateY(${(1 - mainY) * -30}px)`,
          textAlign: "center",
          zIndex: 1,
        }}
      >
        <p
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: 22,
            fontWeight: 700,
            color: "#6366F1",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: 24,
          }}
        >
          Free download
        </p>
        <p
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: 64,
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            color: "#F8FAFC",
            maxWidth: 1000,
          }}
        >
          AI Income Systems Stack
        </p>
      </div>

      <div
        style={{
          opacity: subtitleOpacity,
          textAlign: "center",
          zIndex: 1,
        }}
      >
        <p
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: 28,
            fontWeight: 500,
            color: "#94A3B8",
            maxWidth: 700,
            lineHeight: 1.4,
          }}
        >
          The exact 5-tool framework + starter prompts.
          <br />
          Instant PDF. No spam.
        </p>
      </div>

      {/* CTA Button */}
      <div
        style={{
          opacity: urlOpacity,
          transform: `scale(${pulse})`,
          zIndex: 1,
          marginTop: 16,
        }}
      >
        <div
          style={{
            padding: "20px 48px",
            borderRadius: 16,
            background: "linear-gradient(135deg, #6366F1, #A855F7)",
            fontFamily: "Arial, sans-serif",
            fontSize: 24,
            fontWeight: 700,
            color: "#fff",
            boxShadow: "0 0 40px rgba(99,102,241,0.4)",
          }}
        >
          Grab your free guide
        </div>
      </div>

      <div
        style={{
          opacity: urlOpacity,
          textAlign: "center",
          zIndex: 1,
          marginTop: 32,
        }}
      >
        <p
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: 18,
            fontWeight: 500,
            color: "#64748B",
            letterSpacing: "0.02em",
          }}
        >
          ai-income-systems.netlify.app
        </p>
      </div>
    </AbsoluteFill>
  );
};
