/**
 * Server-only MailerLite synchronisation worker.
 *
 * Reads jobs from the `mailerlite_sync_jobs` outbox and pushes them to
 * MailerLite. Never imported from client code — it reads MAILERLITE_API_KEY.
 *
 * Group assignment is additive: we call the per-group assign endpoint rather
 * than sending a `groups` array, so an existing OS-nurture or lead-magnet
 * membership is never stripped.
 */

import {
  MAILERLITE_GROUPS,
  backoffMinutes,
  freeMemberFields,
  isRetryableStatus,
  normalizeEmail,
} from "@/lib/member-rules";

const ML_BASE = "https://connect.mailerlite.com/api";

type SyncJob = {
  id: string;
  user_id: string | null;
  email: string;
  event_type: string;
  payload: Record<string, unknown>;
  attempt_count: number;
};

class MailerliteError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

function headers(apiKey: string) {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
}

/** Truncate provider text so a failure note can never carry a secret or a payload dump. */
function safeError(message: string): string {
  return message.replace(/Bearer\s+\S+/gi, "Bearer [redacted]").slice(0, 300);
}

const groupCache = new Map<string, string>();

async function resolveGroupId(apiKey: string, name: string): Promise<string | undefined> {
  const cached = groupCache.get(name);
  if (cached) return cached;

  const res = await fetch(`${ML_BASE}/groups?limit=200`, { headers: headers(apiKey) });
  if (res.ok) {
    const body = (await res.json()) as { data?: Array<{ id: string; name: string }> };
    const found = body.data?.find((g) => g.name === name);
    if (found) {
      groupCache.set(name, found.id);
      return found.id;
    }
  } else if (isRetryableStatus(res.status)) {
    throw new MailerliteError(`group lookup failed (${res.status})`, res.status);
  }

  const created = await fetch(`${ML_BASE}/groups`, {
    method: "POST",
    headers: headers(apiKey),
    body: JSON.stringify({ name }),
  });
  if (created.ok) {
    const body = (await created.json()) as { data?: { id: string } };
    if (body.data?.id) {
      groupCache.set(name, body.data.id);
      return body.data.id;
    }
  }
  throw new MailerliteError(`group create failed (${created.status})`, created.status);
}

/**
 * Upsert the subscriber (fields + active status) without touching groups, then
 * additively assign the group. Returns the subscriber id.
 */
async function upsertSubscriber(
  apiKey: string,
  email: string,
  fields: Record<string, string>,
): Promise<{ id: string; status: string }> {
  const res = await fetch(`${ML_BASE}/subscribers`, {
    method: "POST",
    headers: headers(apiKey),
    body: JSON.stringify({ email, status: "active", fields }),
  });
  if (!res.ok) {
    throw new MailerliteError(`subscriber upsert failed (${res.status})`, res.status);
  }
  const body = (await res.json()) as { data?: { id?: string; status?: string } };
  if (!body.data?.id) throw new MailerliteError("subscriber upsert returned no id", 502);
  return { id: body.data.id, status: body.data.status ?? "unknown" };
}

async function assignGroup(apiKey: string, subscriberId: string, groupId: string) {
  const res = await fetch(`${ML_BASE}/subscribers/${subscriberId}/groups/${groupId}`, {
    method: "POST",
    headers: headers(apiKey),
  });
  // 200/201 on assign; MailerLite is idempotent here, re-assigning an existing
  // member does not restart the group's automation.
  if (!res.ok && isRetryableStatus(res.status)) {
    throw new MailerliteError(`group assign failed (${res.status})`, res.status);
  }
}

/** Run one outbox job. Throws MailerliteError on a failure worth retrying. */
async function runJob(apiKey: string, job: SyncJob): Promise<void> {
  const email = normalizeEmail(job.email);
  const payload = job.payload ?? {};

  if (job.event_type === "free_member_signup") {
    const fields = freeMemberFields({
      userId: job.user_id ?? "",
      signupSource: String(payload.signup_source ?? "account-signup-email"),
      signupProvider: String(payload.signup_provider ?? "email"),
      accountCreatedAt: (payload.account_created_at as string | undefined) ?? null,
    });
    const subscriber = await upsertSubscriber(apiKey, email, fields);
    const groupId = await resolveGroupId(apiKey, MAILERLITE_GROUPS.freeMembers);
    if (groupId) await assignGroup(apiKey, subscriber.id, groupId);
    return;
  }

  throw new MailerliteError(`unknown event_type ${job.event_type}`, 400);
}

type Admin = Awaited<typeof import("@/integrations/supabase/client.server")>["supabaseAdmin"];

/**
 * Drain due jobs from the outbox. Safe to call repeatedly and concurrently —
 * completed jobs are never re-run, and failures get exponential backoff.
 */
export async function processMailerliteSyncJobs(
  limit = 25,
): Promise<{ completed: number; failed: number; skipped: number }> {
  const apiKey = process.env.MAILERLITE_API_KEY;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const admin = supabaseAdmin as Admin;

  if (!apiKey) {
    console.warn("[mailerlite-sync] MAILERLITE_API_KEY not configured; jobs left pending");
    return { completed: 0, failed: 0, skipped: 0 };
  }

  const { data: jobs, error } = await admin
    .from("mailerlite_sync_jobs")
    .select("id, user_id, email, event_type, payload, attempt_count")
    .in("status", ["pending", "failed"])
    .lte("next_attempt_at", new Date().toISOString())
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("[mailerlite-sync] could not read jobs", error.message);
    return { completed: 0, failed: 0, skipped: 0 };
  }

  let completed = 0;
  let failed = 0;
  let skipped = 0;

  for (const raw of jobs ?? []) {
    const job = raw as unknown as SyncJob;

    // Respect suppression at send time as well as at enqueue time.
    const { data: suppression } = await admin
      .from("suppressed_emails")
      .select("reason")
      .eq("email", normalizeEmail(job.email))
      .maybeSingle();
    const reason = (suppression as { reason?: string } | null)?.reason;
    if (reason === "bounce" || reason === "complaint" || reason === "unsubscribe") {
      await admin
        .from("mailerlite_sync_jobs")
        .update({
          status: "skipped",
          last_error: `suppressed (${reason})`,
          completed_at: new Date().toISOString(),
        })
        .eq("id", job.id);
      skipped += 1;
      continue;
    }

    try {
      await runJob(apiKey, job);
      await admin
        .from("mailerlite_sync_jobs")
        .update({
          status: "completed",
          last_error: null,
          attempt_count: job.attempt_count + 1,
          completed_at: new Date().toISOString(),
        })
        .eq("id", job.id);
      completed += 1;
    } catch (err) {
      const status = err instanceof MailerliteError ? err.status : 503;
      const attempt = job.attempt_count + 1;
      const retryable = isRetryableStatus(status) && attempt < 8;
      const nextAttempt = new Date(Date.now() + backoffMinutes(attempt) * 60_000).toISOString();
      await admin
        .from("mailerlite_sync_jobs")
        .update({
          status: retryable ? "failed" : "dead",
          attempt_count: attempt,
          last_error: safeError(err instanceof Error ? err.message : "unknown error"),
          next_attempt_at: nextAttempt,
          ...(retryable ? {} : { completed_at: new Date().toISOString() }),
        })
        .eq("id", job.id);
      failed += 1;
      console.error("[mailerlite-sync] job failed", job.event_type, status);
    }
  }

  return { completed, failed, skipped };
}
