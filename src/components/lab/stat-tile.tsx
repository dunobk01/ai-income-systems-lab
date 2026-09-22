import { Reveal } from "./reveal";

export function StatTile({
  figure,
  label,
  sublabel,
}: {
  figure: string;
  label: string;
  sublabel?: string;
}) {
  return (
    <Reveal className="glass rounded-xl p-5 text-center">
      <div className="font-display text-4xl font-black tracking-tight text-gradient">{figure}</div>
      <div className="mt-1 text-sm font-medium">{label}</div>
      {sublabel && <div className="mt-1 text-xs text-muted-foreground">{sublabel}</div>}
    </Reveal>
  );
}

export function StatTileRow({ children }: { children: React.ReactNode }) {
  return <div className="my-8 grid gap-3 sm:grid-cols-3">{children}</div>;
}
