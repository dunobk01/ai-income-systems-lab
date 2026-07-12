import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background bg-hero px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-black text-gradient">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex h-10 items-center justify-center rounded-md px-5 text-sm font-semibold text-background"
            style={{ backgroundImage: "var(--gradient-brand)" }}
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong. Try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium text-background"
            style={{ backgroundImage: "var(--gradient-brand)" }}
          >
            Try again
          </button>
          <a href="/" className="inline-flex h-9 items-center justify-center rounded-md border border-white/15 bg-white/5 px-4 text-sm font-medium">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "google-site-verification", content: "8HOsPtjN19kPsUFU_8CGyWZ7YlB0ogYjA0pXIrNldpM" },
      { name: "p:domain_verify", content: "964370f2f81337f7db6b2575b2fd55da" },
      { title: "AI Income Systems Lab — Build Real AI Income Systems" },
      { name: "description", content: "Master ChatGPT, Claude, Perplexity, Lovable, and n8n to build digital products, funnels, and automations you can actually sell." },
      { property: "og:site_name", content: "AI Income Systems Lab" },
      { property: "og:title", content: "AI Income Systems Lab — Build Real AI Income Systems" },
      { property: "og:description", content: "Master ChatGPT, Claude, Perplexity, Lovable, and n8n to build digital products, funnels, and automations you can actually sell." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "AI Income Systems Lab — Build Real AI Income Systems" },
      { name: "twitter:description", content: "Master ChatGPT, Claude, Perplexity, Lovable, and n8n to build digital products, funnels, and automations you can actually sell." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" },
    ],
    scripts: [
      {
        type: "text/javascript",
        children: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-PJLPBQGH');`,
      },
      { async: true, src: "https://www.googletagmanager.com/gtag/js?id=G-DX6FSQ0P9V" },
      {
        type: "text/javascript",
        children: `window.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag('js', new Date());\ngtag('config', 'G-DX6FSQ0P9V');`,
      },
      {
        type: "text/javascript",
        children: `!function (w, d, t) {w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};ttq.load('D8VTDLBC77UEAKLA0EM0');ttq.page();}(window, document, 'ttq');`,
      },
      {
        type: "text/javascript",
        children: `!function(e){if(!window.pintrk){window.pintrk=function(){window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var n=window.pintrk;n.queue=[],n.version="3.0";var t=document.createElement("script");t.async=!0,t.src=e;var r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");pintrk('load','2613894747736');pintrk('page');`,
      },


      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "AI Income Systems Lab",
          url: "https://ai-income-systems.com",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "AI Income Systems Lab",
          url: "https://ai-income-systems.com",
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head><HeadContent /></head>
      <body>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PJLPBQGH"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            alt=""
            src="https://ct.pinterest.com/v3/?event=init&tid=2613894747736&noscript=1"
          />
        </noscript>

        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    // Fire a TikTok pageview on every SPA route change.
    import("@/lib/tiktok").then((m) => m.tiktokPage()).catch(() => {});
    // Pinterest pageview on SPA route change.
    if (typeof window !== "undefined" && (window as any).pintrk) {
      try { (window as any).pintrk("page"); } catch {}
    }
    // Standardized GTM page_view.
    import("@/lib/datalayer").then((m) =>
      m.dlPageView({ path: pathname, title: typeof document !== "undefined" ? document.title : "" }),
    ).catch(() => {});
  }, [pathname]);


  useEffect(() => {
    if (typeof window === "undefined") return;
    // Delegated button_click tracker. Opt-in via data-track="button"
    // with optional data-track-label, data-track-location, data-track-category.
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const el = target.closest<HTMLElement>("[data-track='button'], [data-track-label]");
      if (!el) return;
      const label =
        el.getAttribute("data-track-label") ||
        el.getAttribute("aria-label") ||
        (el.textContent || "").trim().slice(0, 80);
      if (!label) return;
      const destination =
        el.getAttribute("data-track-destination") ||
        el.getAttribute("href") ||
        undefined;
      import("@/lib/datalayer").then((m) =>
        m.dlButtonClick({
          label,
          location: el.getAttribute("data-track-location") ?? window.location.pathname,
          destination: destination ?? undefined,
          category: el.getAttribute("data-track-category") ?? undefined,
        }),
      ).catch(() => {});
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true } as EventListenerOptions);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        <Toaster theme="dark" position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}

