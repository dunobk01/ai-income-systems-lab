import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

const stats = [
  { value: 2400, suffix: "+", label: "builders enrolled" },
  { value: 11, suffix: "", label: "modules" },
  { value: 90, suffix: "+", label: "lessons" },
  { value: 7, suffix: "", label: "days to first system" },
];

function formatNumber(n: number) {
  return n.toLocaleString();
}

export const Scene4 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOpacity = spring({ frame, fps, config: { damping: 20, stiffness: 100 } });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 64,
      }}
    >
      <div style={{ opacity: headerOpacity, textAlign: "center" }}>
        <p
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: 28,
            fontWeight: 700,
            color: "#94A3B8",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          By the numbers
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "48px 80px",
          zIndex: 1,
        }}
      >
        {stats.map((stat, i) => {
          const delay = i * 5;
          const statProgress = spring({
            frame: frame - 15 - delay,
            fps,
            config: { damping: 15, stiffness: 60 },
          });
          const countUp = Math.round(stat.value * statProgress);

          return (
            <div
              key={stat.label}
              style={{
                textAlign: "center",
                opacity: spring({
                  frame: frame - 10 - delay,
                  fps,
                  config: { damping: 20, stiffness: 100 },
                }),
              }}
            >
              <p
                style={{
                  fontFamily: "Arial, sans-serif",
                  fontSize: 96,
                  fontWeight: 900,
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                  background: "linear-gradient(135deg, #6366F1, #A855F7)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                {formatNumber(countUp)}{stat.suffix}
              </p>
              <p
                style={{
                  fontFamily: "Arial, sans-serif",
                  fontSize: 22,
                  fontWeight: 500,
                  color: "#94A3B8",
                  marginTop: 12,
                }}
              >
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
