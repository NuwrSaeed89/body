import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getEspConfigStatus, readNewsletterEspProvider } from "./config";
import { syncSubscriberToKlaviyo } from "./klaviyo";
import { syncSubscriberToMailchimp } from "./mailchimp";
import type { EspSubscriberPayload, EspSyncResult } from "./types";

export async function syncSubscriberToEsp(
  subscriber: EspSubscriberPayload,
): Promise<EspSyncResult> {
  const { provider, configured } = getEspConfigStatus();
  if (provider === "none") {
    return { ok: false, provider, error: "NEWSLETTER_ESP is not configured" };
  }
  if (!configured) {
    return { ok: false, provider, error: "ESP credentials incomplete" };
  }

  if (provider === "klaviyo") {
    return syncSubscriberToKlaviyo(subscriber);
  }
  return syncSubscriberToMailchimp(subscriber);
}

export async function markSubscriberSyncedToEsp(subscriberId: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("newsletter_subscribers")
    .update({ synced_to_esp: true })
    .eq("id", subscriberId)
    .eq("synced_to_esp", false);

  if (error) throw error;
}

export async function syncAndMarkSubscriber(
  subscriber: EspSubscriberPayload,
): Promise<EspSyncResult> {
  const result = await syncSubscriberToEsp(subscriber);
  if (result.ok) {
    await markSubscriberSyncedToEsp(subscriber.id);
  }
  return result;
}

export type BulkEspSyncSummary = {
  provider: ReturnType<typeof readNewsletterEspProvider>;
  synced: number;
  failed: number;
  skipped: number;
  errors: string[];
};

export async function syncPendingSubscribersToEsp(): Promise<BulkEspSyncSummary> {
  const { provider, configured } = getEspConfigStatus();
  const summary: BulkEspSyncSummary = {
    provider,
    synced: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  if (provider === "none" || !configured) {
    summary.errors.push("ESP not configured — set NEWSLETTER_ESP and provider API keys.");
    return summary;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("id, email, locale, source")
    .eq("synced_to_esp", false)
    .not("confirmed_at", "is", null)
    .order("created_at", { ascending: true });

  if (error) throw error;

  for (const row of data ?? []) {
    const subscriber: EspSubscriberPayload = {
      id: String(row.id),
      email: String(row.email),
      locale: String(row.locale ?? "en"),
      source: String(row.source ?? "homepage"),
    };

    const result = await syncAndMarkSubscriber(subscriber);
    if (result.ok) {
      summary.synced += 1;
    } else {
      summary.failed += 1;
      if (result.error && summary.errors.length < 5) {
        summary.errors.push(`${subscriber.email}: ${result.error}`);
      }
    }
  }

  return summary;
}
