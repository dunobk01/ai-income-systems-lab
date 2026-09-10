import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { C, FONT } from "../theme";

const STATS = [
  { v: "15", l: "modules" },
  { v: "89", l: "lessons" },
  { v: "$0", l: "to start" },
];

/** BRAND REVEAL. */
export const Scene4 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const reveal = spring({ frame, fps, config: { damping: 16, stiffness: 130 } });
  const clip = interpolate(reveal, [0, 1], [100, 0]);
  const glow = 0.35 + Math.sin(frame / 9) * 0.15;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 130,
          letterSpacing: "-0.05em",
          color: C.white,
          textAlign: "center",
          lineHeight: 1.0,
          clipPath: `inset(0 ${clip}% 0 0)`,
          textShadow: `0 0 90px rgba(232,184,75,${glow})`,
        }}
      >
        AI INCOME
        <br />
        <span style={{ color: C.gold }}>SYSTEMS LAB</span>
      </div>

      <div style={{ display: "flex", gap: 70, marginTop: 62 }}>
        {STATS.map((s, i) => {
          const sp = spring({ frame: frame - 26 - i * 7, fps, config: { damping: 9, stiffness: 220 } });
          return (
            <div
              key={s.l}
              style={{
                textAlign: "center",
                opacity: sp,
                transform: `scale(${interpolate(sp, [0, 1], [0.4, 1])})`,
              }}
            >
              <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 96, color: C.gold, lineHeight: 1 }}>
                {s.v}
              </div>
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: 24,
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: C.muted,
                  marginTop: 10,
                }}
              >
                {s.l}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
