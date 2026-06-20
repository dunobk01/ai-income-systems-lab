import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from "remotion";

const tools = [
  { name: "ChatGPT", color: "#10A37F", desc: "Execution + content" },
  { name: "Claude", color: "#CC785C", desc: "Long-form + strategy" },
  { name: "Perplexity", color: "#22C55E", desc: "Research + validation" },
  { name: "Lovable", color: "#F97316", desc: "Apps + funnels" },
  { name: "n8n", color: "#FF6D5A", desc: "Automation glue" },
];

export const Scene3 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOpacity = spring({ frame, fps, config: { damping: 20, stiffness: 100 } });
  const headerY = spring({ frame, fps, config: { damping: 15, stiffness: 80 } });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 56,
      }}
    >
      {/* Top accent line */}
      <div
        style={{
          position: "absolute",
          top: 120,
          left: "50%",
          transform: "translateX(-50%)",
          width: 80,
          height: 4,
          borderRadius: 2,
          background: "linear-gradient(90deg, #6366F1, #A855F7)",
          opacity: headerOpacity,
        }}
      />

      <div
        style={{
          opacity: headerOpacity,
          transform: `translateY(${(1 - headerY) * -30}px)`,
          textAlign: "center",
          marginTop: -40,
        }}
      >
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
          The 5-Tool AI Stack
        </p>
        <p
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: 56,
            fontWeight: 800,
            color: "#F8FAFC",
            marginTop: 12,
            letterSpacing: "-0.02em",
          }}
        >
          One proven stack. Real income.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: 24,
          justifyContent: "center",
          zIndex: 1,
        }}
      >
        {tools.map((tool, i) => {
          const delay = i * 8;
          const cardOpacity = spring({
            frame: frame - 20 - delay,
            fps,
            config: { damping: 18, stiffness: 120 },
          });
          const cardY = spring({
            frame: frame - 20 - delay,
            fps,
            config: { damping: 12, stiffness: 80 },
          });

          return (
            <div
              key={tool.name}
              style={{
                width: 280,
                height: 180,
                borderRadius: 20,
                background: "linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))",
                border: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                opacity: cardOpacity,
                transform: `translateY(${(1 - cardY) * 40}px)`,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: tool.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "Arial, sans-serif",
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#fff",
                }}
              >
                {tool.name[0]}
              </div>
              <p
                style={{
                  fontFamily: "Arial, sans-serif",
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#F8FAFC",
                }}
              >
                {tool.name}
              </p>
              <p
                style={{
                  fontFamily: "Arial, sans-serif",
                  fontSize: 14,
                  color: "#94A3B8",
                }}
              >
                {tool.desc}
              </p>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
