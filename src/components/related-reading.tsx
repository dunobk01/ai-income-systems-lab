type Item = { slug: string; title: string; excerpt: string | null; post_type: string };

const PREFIX: Record<string, string> = { blog: "/blog", lab: "/thelab", newsletter: "/newsletter" };
const LABEL: Record<string, string> = { blog: "Blog", lab: "The Lab", newsletter: "Newsletter" };

export function RelatedReading({ items }: { items?: Item[] }) {
  if (!items || items.length === 0) return null;
  return (
    <nav aria-labelledby="related-heading" className="mt-16">
      <h2 id="related-heading" className="text-xl font-bold">Keep reading</h2>
      <ul className="mt-4 grid gap-3">
        {items.map((r) => (
          <li key={`${r.post_type}-${r.slug}`}>
            <a
              href={`${PREFIX[r.post_type] ?? "/blog"}/${r.slug}`}
              className="block glass rounded-xl p-4 hover:border-[color:var(--brand)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--brand)]"
            >
              <span className="text-xs uppercase tracking-widest text-[color:var(--brand)]">{LABEL[r.post_type] ?? "Blog"}</span>
              <span className="mt-1 block font-semibold">{r.title}</span>
              {r.excerpt && <span className="mt-1 block text-sm text-muted-foreground line-clamp-2">{r.excerpt}</span>}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
