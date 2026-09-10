import { Link } from "@tanstack/react-router";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid gap-8 md:grid-cols-5">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-3 text-sm text-muted-foreground max-w-sm">
            Learn AI by building real money-making systems. Master ChatGPT, Claude, Perplexity, Lovable, and n8n.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Product</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/pricing" className="hover:text-foreground">Pricing</Link></li>
            <li><Link to="/free" className="hover:text-foreground">Free 7-Day Plan</Link></li>
            <li><Link to="/ai-business-engine" className="hover:text-foreground">Free AI Prompts + n8n Guide</Link></li>
            <li><Link to="/os" className="hover:text-foreground">Free AI Income Operating System</Link></li>
            <li><Link to="/blog" className="hover:text-foreground">Blog</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
            <li><a href="/#curriculum" className="hover:text-foreground">Curriculum</a></li>
            <li><a href="/#faq" className="hover:text-foreground">FAQ</a></li>

          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Legal</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-foreground">Terms of Service</Link></li>
            <li><Link to="/security" className="hover:text-foreground">Security Policy</Link></li>
            <li><Link to="/refund" className="hover:text-foreground">Refund & Cancellation</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Account</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/login" className="hover:text-foreground">Log in</Link></li>
            <li><Link to="/signup" className="hover:text-foreground">Sign up</Link></li>
            <li><Link to="/unsubscribe" search={{ token: "", email: "" }} className="hover:text-foreground">Unsubscribe</Link></li>

          </ul>
        </div>
      </div>
      <div className="border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 text-xs text-muted-foreground flex justify-between">
          <span>© {new Date().getFullYear()} AI Income Systems Lab</span>
          <span>Built for builders, not gurus.</span>
        </div>
      </div>
    </footer>
  );
}
