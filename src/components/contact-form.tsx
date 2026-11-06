import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2 } from "lucide-react";
import { submitContactMessage } from "@/lib/contact.functions";
import { Button } from "@/components/ui/button";

const field =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function ContactForm() {
  const submit = useServerFn(submitContactMessage);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "", company: "" });
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [err, setErr] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "sending") return;
    setErr(null);
    if (form.message.trim().length < 10) return setErr("Message must be at least 10 characters.");
    setState("sending");
    try {
      await submit({ data: form });
      setState("done");
    } catch (e: any) {
      let msg = e?.message ?? "Something went wrong. Please try again.";
      try {
        const parsed = JSON.parse(msg);
        if (Array.isArray(parsed)) msg = parsed[0]?.message ?? msg;
      } catch {}
      setErr(msg);
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <div className="glass rounded-2xl p-6 text-center" role="status">
        <CheckCircle2 className="h-8 w-8 text-[color:var(--brand-2)] mx-auto" />
        <h2 className="mt-3 text-lg font-semibold">Message sent</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Thanks — we'll reply to {form.email} as soon as we can, usually within 24 hours.
          A confirmation is on its way to your inbox.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="glass rounded-2xl p-6 space-y-4" noValidate>
      <h2 className="text-lg font-semibold">Send us a message</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block text-muted-foreground">Name</span>
          <input required maxLength={100} value={form.name} onChange={set("name")} className={field} autoComplete="name" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-muted-foreground">Email</span>
          <input required type="email" maxLength={255} value={form.email} onChange={set("email")} className={field} autoComplete="email" />
        </label>
      </div>
      <label className="block text-sm">
        <span className="mb-1 block text-muted-foreground">Subject</span>
        <input required maxLength={150} value={form.subject} onChange={set("subject")} className={field} />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-muted-foreground">Message</span>
        <textarea required rows={6} maxLength={5000} value={form.message} onChange={set("message")} className={field} />
      </label>
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.company} onChange={set("company")} className="hidden" />
      {err && <p className="text-sm text-destructive" role="alert">{err}</p>}
      <Button type="submit" variant="brand" disabled={state === "sending"} className="w-full sm:w-auto">
        {state === "sending" ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : "Send message"}
      </Button>
    </form>
  );
}
