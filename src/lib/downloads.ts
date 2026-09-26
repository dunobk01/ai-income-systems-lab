import { supabase } from "@/integrations/supabase/client";

export type DownloadResource =
  | "ai-income-operating-system"
  | "ai-business-engine"
  | "ai-income-starter-kit"
  | "7-day-checklist"
  | "savings-blueprint";

/** Record a real download click. Fire-and-forget; never blocks the download. */
export function trackDownload(resource: DownloadResource) {
  if (typeof window === "undefined") return;
  void supabase
    .from("download_events")
    .insert({ resource, page: window.location.pathname.slice(0, 200) })
    .then(() => undefined, () => undefined);
}
