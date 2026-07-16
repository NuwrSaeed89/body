import "server-only";

import { scheduleNewsletterWelcomeEmail } from "@/lib/emails/send-newsletter-welcome";
import { hasSupabaseConfig, publicEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getEspConfigStatus } from "./esp/config";
import { syncAndMarkSubscriber } from "./esp/sync-subscriber";
import { confirmMockNewsletterSubscriber } from "./mock-store";
import type { ConfirmNewsletterResult } from "./types";

type DbNewsletterRow = {
  id: string;
  email: string;
  locale: string | null;
  source: string | null;
  confirmed_at: string | null;
  confirmation_token_expires_at: string | null;
};

export async function confirmNewsletter(token: string): Promise<ConfirmNewsletterResult> {
  const normalizedToken = token.trim();
  if (!normalizedToken) {
    return { ok: false, error: "invalid_token" };
  }

  if (publicEnv.useMockData || !hasSupabaseConfig()) {
    const result = await confirmMockNewsletterSubscriber(normalizedToken);
    if (result.ok && !result.alreadyConfirmed && result.email) {
      scheduleNewsletterWelcomeEmail({
        customerEmail: result.email,
        locale: result.locale ?? "en",
      });
    }
    return result;
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("id, email, locale, source, confirmed_at, confirmation_token_expires_at")
      .eq("confirmation_token", normalizedToken)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return { ok: false, error: "invalid_token" };
    }

    const row = data as DbNewsletterRow;
    if (row.confirmed_at) {
      return {
        ok: true,
        alreadyConfirmed: true,
        email: String(row.email),
        locale: row.locale ?? "en",
      };
    }

    const expiresAt = row.confirmation_token_expires_at
      ? new Date(row.confirmation_token_expires_at)
      : null;
    if (expiresAt && expiresAt.getTime() < Date.now()) {
      return { ok: false, error: "expired_token" };
    }

    const confirmedAt = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("newsletter_subscribers")
      .update({
        confirmed_at: confirmedAt,
        confirmation_token: null,
        confirmation_token_expires_at: null,
      })
      .eq("id", row.id)
      .is("confirmed_at", null);

    if (updateError) throw updateError;

    const email = String(row.email);
    const locale = row.locale ?? "en";
    const source = String(row.source ?? "homepage");
    const { configured } = getEspConfigStatus();

    if (configured) {
      void syncAndMarkSubscriber({
        id: String(row.id),
        email,
        locale,
        source,
      }).catch((syncError) => {
        console.error("[newsletter] ESP sync after confirm failed:", syncError);
      });
    }

    scheduleNewsletterWelcomeEmail({ customerEmail: email, locale });

    return { ok: true, alreadyConfirmed: false, email, locale };
  } catch (error) {
    console.error("[newsletter] confirm failed:", error);
    return { ok: false, error: "confirm_failed" };
  }
}
