import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { C, FONT } from "../theme";

const CARDS = [
  { k: "01", t: "Prompts", s: "Engineered, not guessed" },
  { k: "02", t: "Automations", s: "n8n workflows that run 24/7" },
  { k: "03", t: "Products", s: "Offers people actually buy" },
];

/** PUNCH — three cards slam in and hold with float. */
export const Scene3 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const title = spring({ frame, fps, config: { damping: 13, stiffness: 170 } });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 74,
          letterSpacing: "-0.04em",
          color: C.white,
          opacity: title,
          transform: `translateY(${interpolate(title, [0, 1], [-60, 0])}px)`,
          marginBottom: 60,
        }}
      >
        Connect the <span style={{ color: C.gold }}>three layers</span>
      </div>

      <div style={{ display: "flex", gap: 36 }}>
        {CARDS.map((c, i) => {
          const s = spring({
            frame: frame - 18 - i * 9,
            fps,
            config: { damping: 10, stiffness: 200, mass: 0.7 },
          });
          const float = Math.sin((frame - i * 14) / 18) * 8;
          const tilt = interpolate(s, [0, 1], [i % 2 ? 10 : -10, 0]);
          return (
            <div
              key={c.k}
              style={{
                width: 400,
                padding: "44px 36px",
                borderRadius: 30,
                background: "linear-gradient(160deg, rgba(255,255,255,0.09), rgba(255,255,255,0.03))",
                border: "1px solid rgba(232,184,75,0.35)",
                boxShadow: "0 30px 90px rgba(0,0,0,0.55)",
                opacity: s,
                transform: `translateY(${interpolate(s, [0, 1], [160, float])}px) rotate(${tilt}deg) scale(${interpolate(
                  s,
                  [0, 1],
                  [0.8, 1],
                )})`,
              }}
            >
              <div style={{ fontFamily: FONT, fontSize: 22, letterSpacing: "0.3em", color: C.accent }}>{c.k}</div>
              <div
                style={{
                  fontFamily: FONT,
                  fontWeight: 900,
                  fontSize: 58,
                  color: C.gold,
                  letterSpacing: "-0.03em",
                  marginTop: 12,
                }}
              >
                {c.t}
              </div>
              <div style={{ fontFamily: FONT, fontSize: 26, color: C.muted, marginTop: 14, lineHeight: 1.3 }}>
                {c.s}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
