import { useEffect, useState } from "react";
import { Check } from "lucide-react";

/** Interactive checklist persisted in localStorage per post. */
export function ChecklistCard({
  postSlug,
  title = "Install checklist",
  items,
}: {
  postSlug: string;
  title?: string;
  items: string[];
}) {
  const key = `lab-checklist:${postSlug}`;
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setDone(JSON.parse(raw) as Record<string, boolean>);
    } catch {
      /* ignore */
    }
  }, [key]);

  const toggle = (item: string) => {
    setDone((prev) => {
      const next = { ...prev, [item]: !prev[item] };
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const completed = items.filter((i) => done[i]).length;

  return (
    <div className="glass my-8 rounded-xl p-5">
      <div className="flex items-center justify-between gap-3">
        <h4 className="font-display text-base font-bold">{title}</h4>
        <span className="text-xs text-muted-foreground">
          {completed}/{items.length} done
        </span>
      </div>
      <ul className="mt-4 space-y-2">
        {items.map((item) => {
          const checked = !!done[item];
          return (
            <li key={item}>
              <button
                type="button"
                aria-pressed={checked}
                onClick={() => toggle(item)}
                className="flex w-full items-start gap-3 rounded-md p-2 text-left text-sm transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]"
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                    checked
                      ? "border-[color:var(--brand)] bg-[color:var(--brand)] text-[color:var(--primary-foreground)]"
                      : "border-white/20"
                  }`}
                  aria-hidden="true"
                >
                  {checked && <Check className="h-3.5 w-3.5" />}
                </span>
                <span className={checked ? "text-muted-foreground line-through" : "text-foreground/90"}>
                  {item}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
