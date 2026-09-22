import { useNavigate } from "@tanstack/react-router";
import type { LabPost } from "@/lib/lab.functions";
import { CoverPlaceholder } from "./cover-placeholder";
import { LabActions } from "./lab-actions";

const DIFF_LABEL: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export function LabCard({
  post,
  liked = false,
  saved = false,
}: {
  post: LabPost;
  liked?: boolean;
  saved?: boolean;
}) {
  const navigate = useNavigate();
  const open = () => void navigate({ to: "/thelab/$slug", params: { slug: post.slug } });

  return (
    <article
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      }}
      tabIndex={0}
      role="link"
      aria-label={`Open ${post.title}`}
      className="glass group flex cursor-pointer flex-col overflow-hidden rounded-xl transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:ring-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] motion-reduce:transform-none motion-reduce:transition-none"
    >
      <div className="relative aspect-video w-full overflow-hidden">
        {post.cover_image_url ? (
          <img
            src={post.cover_image_url}
            alt={`Cover image for ${post.title}`}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <CoverPlaceholder seed={post.slug} title={post.title} />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-20"
          style={{ background: "linear-gradient(to top, oklch(0.78 0.13 88 / 22%), transparent)" }}
        />
        <div className="absolute right-2 top-2 flex items-center gap-1.5">
          {post.difficulty && (
            <span className="rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[color:var(--brand)] backdrop-blur">
              {DIFF_LABEL[post.difficulty] ?? post.difficulty}
            </span>
          )}
          {post.time_to_implement && (
            <span className="rounded-full bg-background/80 px-2 py-0.5 text-[10px] text-foreground/90 backdrop-blur">
              {post.time_to_implement}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="line-clamp-2 font-display text-lg font-bold leading-snug">{post.title}</h3>

        {post.pain_point && (
          <p className="text-sm">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Pain point</span>
            <br />
            <span className="italic text-muted-foreground">{post.pain_point}</span>
          </p>
        )}

        {post.audience.length > 0 && (
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Who it's for</span>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {post.audience.map((a) => (
                <span key={a} className="rounded-full border border-white/12 px-2 py-0.5 text-[11px] text-foreground/80">
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        {post.problem_solved && (
          <p className="text-sm">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">What it solves</span>
            <br />
            <span className="line-clamp-2 text-foreground/85">{post.problem_solved}</span>
          </p>
        )}

        {post.tools_used.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tools_used.map((t) => (
              <span
                key={t}
                className="rounded-md bg-[color:var(--brand)]/10 px-2 py-0.5 font-mono text-[11px] text-[color:var(--brand)]"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto border-t border-white/10 pt-3">
          <LabActions post={post} liked={liked} saved={saved} />
        </div>
      </div>
    </article>
  );
}

export function LabCardSkeleton() {
  return (
    <div className="glass overflow-hidden rounded-xl">
      <div className="aspect-video w-full animate-pulse bg-white/5" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-3/4 animate-pulse rounded bg-white/5" />
        <div className="h-3 w-full animate-pulse rounded bg-white/5" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-white/5" />
        <div className="h-8 w-1/2 animate-pulse rounded bg-white/5" />
      </div>
    </div>
  );
}
