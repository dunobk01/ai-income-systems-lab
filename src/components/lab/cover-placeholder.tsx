/** Deterministic gradient + grid placeholder so the wall never shows a broken image. */
function hash(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function CoverPlaceholder({ seed, title }: { seed: string; title: string }) {
  const h = hash(seed);
  const angle = h % 360;
  const x = 20 + (h % 60);
  const y = 15 + ((h >> 3) % 55);
  return (
    <div
      role="img"
      aria-label={`Cover artwork for ${title}`}
      className="grid-fade absolute inset-0"
      style={{
        backgroundImage: `radial-gradient(60% 70% at ${x}% ${y}%, oklch(0.78 0.13 88 / 26%) 0%, transparent 70%), linear-gradient(${angle}deg, oklch(0.20 0.006 260), oklch(0.14 0.003 260))`,
      }}
    />
  );
}
