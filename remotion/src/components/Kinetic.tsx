import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { FONT } from "../theme";

type Props = {
  text: string;
  delay?: number;
  size?: number;
  color?: string;
  stagger?: number;
  align?: "left" | "center";
  weight?: number;
  italic?: boolean;
  shadow?: string;
};

/** Word-by-word spring pop with slight rotation and overshoot. */
export const Kinetic = ({
  text,
  delay = 0,
  size = 110,
  color = "#F7F5F0",
  stagger = 4,
  align = "center",
  weight = 900,
  italic = false,
  shadow,
}: Props) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: `0 ${size * 0.22}px`,
        justifyContent: align === "center" ? "center" : "flex-start",
        maxWidth: 1500,
      }}
    >
      {words.map((w, i) => {
        const s = spring({
          frame: frame - delay - i * stagger,
          fps,
          config: { damping: 11, stiffness: 190, mass: 0.7 },
        });
        const y = interpolate(s, [0, 1], [90, 0]);
        const rot = interpolate(s, [0, 1], [-7, 0]);
        const scale = interpolate(s, [0, 1], [0.7, 1]);
        return (
          <span
            key={`${w}-${i}`}
            style={{
              fontFamily: FONT,
              fontSize: size,
              fontWeight: weight,
              fontStyle: italic ? "italic" : "normal",
              letterSpacing: "-0.035em",
              lineHeight: 1.02,
              color,
              opacity: s,
              display: "inline-block",
              transform: `translateY(${y}px) rotate(${rot}deg) scale(${scale})`,
              textShadow: shadow,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};
