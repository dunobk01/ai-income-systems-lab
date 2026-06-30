import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, MapPin, MessageSquare } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — AI Income Systems Lab" },
      {
        name: "description",
        content:
          "Get in touch with AI Income Systems Lab. Support, partnerships, and general inquiries.",
      },
      {
        property: "og:title",
        content: "Contact Us — AI Income Systems Lab",
      },
      {
        property: "og:description",
        content:
          "Get in touch with AI Income Systems Lab. Support, partnerships, and general inquiries.",
      },
      { property: "og:url", content: "https://ai-income-systems.com/contact" },
    ],
    links: [
      { rel: "canonical", href: "https://ai-income-systems.com/contact" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-hero opacity-80" />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-20 pb-12 text-center">
          <h1 className="mt-5 text-4xl sm:text-5xl font-black tracking-tight">
            Contact <span className="text-gradient">Us</span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            Have a question, need support, or want to partner? Reach out — we
            read every message.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-24">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="glass rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center">
                <Mail className="h-5 w-5 text-[color:var(--brand-2)]" />
              </div>
              <div>
                <p className="text-sm font-semibold">Email us</p>
                <p className="text-xs text-muted-foreground">
                  We typically reply within 24 hours
                </p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Support:</span>{" "}
                <a
                  href="mailto:support@ai-income-systems.com"
                  className="text-[color:var(--brand-2)] hover:underline"
                >
                  support@ai-income-systems.com
                </a>
              </p>
              <p>
                <span className="text-muted-foreground">General:</span>{" "}
                <a
                  href="mailto:aiincomesystemslab@gmail.com"
                  className="text-[color:var(--brand-2)] hover:underline"
                >
                  aiincomesystemslab@gmail.com
                </a>
              </p>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-[color:var(--brand-2)]" />
              </div>
              <div>
                <p className="text-sm font-semibold">Mailing address</p>
                <p className="text-xs text-muted-foreground">
                  AI Income Systems Lab
                </p>
              </div>
            </div>
            <div className="text-sm leading-relaxed">
              <p>383 S Stone Ave</p>
              <p>Unit 203</p>
              <p>Tucson, AZ 85701</p>
            </div>
          </div>
        </div>

        <div className="mt-8 glass rounded-2xl p-6 text-center">
          <MessageSquare className="h-6 w-6 text-[color:var(--brand-2)] mx-auto mb-3" />
          <h2 className="text-lg font-semibold">Community support</h2>
          <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
            Builder and Accelerator members get priority support inside the
            members-only community.
          </p>
          <Button asChild variant="brand" className="mt-4">
            <Link to="/pricing">Join the Lab</Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
