import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { Kinetic } from "../components/Kinetic";
import { C, FONT } from "../theme";

/** THE GIFT — free PDF pops out of the screen. */
export const Scene5 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({ frame: frame - 8, fps, config: { damping: 8, stiffness: 210, mass: 0.8 } });
  const float = Math.sin(frame / 14) * 10;
  const tilt = interpolate(pop, [0, 1], [-24, -6]);
  const burst = interpolate(frame, [6, 26], [0.2, 1.6], { extrapolateRight: "clamp" });
  const burstO = interpolate(frame, [6, 30], [0.7, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 90 }}>
      <div style={{ position: "relative", width: 420, height: 560 }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(232,184,75,0.5) 0%, transparent 65%)",
            transform: `scale(${burst})`,
            opacity: burstO,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 22,
            background: "linear-gradient(150deg, #17161A 0%, #0C0C0E 100%)",
            border: `2px solid ${C.gold}`,
            boxShadow: "0 50px 120px rgba(0,0,0,0.7), 0 0 90px rgba(232,184,75,0.25)",
            transform: `translateY(${interpolate(pop, [0, 1], [420, float])}px) rotate(${tilt}deg) scale(${interpolate(
              pop,
              [0, 1],
              [0.5, 1],
            )})`,
            opacity: pop,
            padding: 40,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontFamily: FONT, fontSize: 20, letterSpacing: "0.3em", color: C.accent }}>FREE PDF</div>
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: 58,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: C.white,
            }}
          >
            The AI Income <span style={{ color: C.gold }}>Operating System</span>
          </div>
          <div style={{ fontFamily: FONT, fontSize: 22, color: C.muted }}>Prompts · Automations · Playbooks</div>
        </div>
      </div>

      <div style={{ maxWidth: 700 }}>
        <Kinetic text="Get it FREE" delay={22} size={96} color={C.gold} align="left" />
        <div style={{ marginTop: 22 }}>
          <Kinetic
            text="Drop your email. It's yours instantly."
            delay={40}
            size={44}
            color={C.white}
            align="left"
          />
        </div>
        <div
          style={{
            marginTop: 26,
            fontFamily: FONT,
            fontSize: 30,
            color: C.muted,
            opacity: interpolate(frame, [56, 72], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          No card. Free account included.
        </div>
      </div>
    </AbsoluteFill>
  );
};
