import "server-only";

import { scheduleNewsletterWelcomeEmail } from "@/lib/emails/send-newsletter-welcome";
import { hasSupabaseConfig, publicEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  buildNewsletterConfirmUrl,
  confirmationTokenExpiresAt,
  createConfirmationToken,
  requiresDoubleOptIn,
} from "./double-opt-in";
import { getEspConfigStatus } from "./esp/config";
import { syncAndMarkSubscriber } from "./esp/sync-subscriber";
import { addMockNewsletterSubscriber } from "./mock-store";
import { sendNewsletterConfirmationEmail } from "@/lib/emails/send-newsletter-confirmation";
import type { SubscribeNewsletterInput, SubscribeNewsletterResult } from "./types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LOCALES = new Set(["en", "sv", "es", "de"]);
const SOURCES = new Set(["homepage", "cart", "cart-empty"]);

type ExistingSubscriberRow = {
  id: string;
  confirmed_at: string | null;
};

export function isValidNewsletterEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim());
}

function normalizeLocale(locale: string): string {
  return LOCALES.has(locale) ? locale : "en";
}

function normalizeSource(source: string): SubscribeNewsletterInput["source"] | null {
  return SOURCES.has(source) ? (source as SubscribeNewsletterInput["source"]) : null;
}

async function sendConfirmationEmail(input: {
  email: string;
  locale: string;
  token: string;
}): Promise<void> {
  const confirmUrl = buildNewsletterConfirmUrl(input.locale, input.token);
  await sendNewsletterConfirmationEmail({
    customerEmail: input.email,
    locale: input.locale as "en" | "sv" | "es" | "de",
    confirmUrl,
  });
}

async function upsertPendingConfirmation(input: {
  email: string;
  locale: string;
  source: SubscribeNewsletterInput["source"];
  existing?: ExistingSubscriberRow;
}): Promise<SubscribeNewsletterResult> {
  const token = createConfirmationToken();
  const expiresAt = confirmationTokenExpiresAt();
  const supabase = createSupabaseAdminClient();

  if (input.existing) {
    const { error: updateError } = await supabase
      .from("newsletter_subscribers")
      .update({
        locale: input.locale,
        source: input.source,
        confirmation_token: token,
        confirmation_token_expires_at: expiresAt,
        consented_at: new Date().toISOString(),
      })
      .eq("id", input.existing.id)
      .is("confirmed_at", null);

    if (updateError) throw updateError;
  } else {
    const { error: insertError } = await supabase.from("newsletter_subscribers").insert({
      email: input.email,
      locale: input.locale,
      source: input.source,
      synced_to_esp: false,
      confirmed_at: null,
      confirmation_token: token,
      confirmation_token_expires_at: expiresAt,
    });

    if (insertError) {
      if (insertError.code === "23505") {
        return { ok: true, alreadySubscribed: true };
      }
      throw insertError;
    }
  }

  await sendConfirmationEmail({ email: input.email, locale: input.locale, token });
  return { ok: true, alreadySubscribed: false, pendingConfirmation: true };
}

export async function subscribeNewsletter(
  input: SubscribeNewsletterInput,
): Promise<SubscribeNewsletterResult> {
  const email = input.email.trim().toLowerCase();

  if (!isValidNewsletterEmail(email)) {
    return { ok: false, alreadySubscribed: false, error: "invalid_email" };
  }

  if (!input.consented) {
    return { ok: false, alreadySubscribed: false, error: "consent_required" };
  }

  const locale = normalizeLocale(input.locale);
  const source = normalizeSource(input.source);
  if (!source) {
    return { ok: false, alreadySubscribed: false, error: "subscribe_failed" };
  }

  const useDoubleOptIn = requiresDoubleOptIn(locale);

  if (publicEnv.useMockData || !hasSupabaseConfig()) {
    const { alreadySubscribed, pendingConfirmation } = addMockNewsletterSubscriber({
      email,
      locale,
      source,
      doubleOptIn: useDoubleOptIn,
    });
    if (!alreadySubscribed && !pendingConfirmation) {
      scheduleNewsletterWelcomeEmail({ customerEmail: email, locale });
    }
    return {
      ok: true,
      alreadySubscribed,
      pendingConfirmation: pendingConfirmation && !alreadySubscribed,
    };
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data: existing, error: existingError } = await supabase
      .from("newsletter_subscribers")
      .select("id, confirmed_at")
      .eq("email", email)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existing?.confirmed_at) {
      return { ok: true, alreadySubscribed: true };
    }

    if (useDoubleOptIn) {
      return upsertPendingConfirmation({
        email,
        locale,
        source,
        existing: existing as ExistingSubscriberRow | undefined,
      });
    }

    if (existing) {
      const { error: confirmError } = await supabase
        .from("newsletter_subscribers")
        .update({
          confirmed_at: new Date().toISOString(),
          confirmation_token: null,
          confirmation_token_expires_at: null,
          locale,
          source,
        })
        .eq("id", existing.id);

      if (confirmError) throw confirmError;

      const { configured } = getEspConfigStatus();
      if (configured) {
        void syncAndMarkSubscriber({
          id: String(existing.id),
          email,
          locale,
          source,
        }).catch((syncError) => {
          console.error("[newsletter] ESP sync failed:", syncError);
        });
      }

      return { ok: true, alreadySubscribed: true };
    }

    const confirmedAt = new Date().toISOString();
    const { data: inserted, error: insertError } = await supabase
      .from("newsletter_subscribers")
      .insert({
        email,
        locale,
        source,
        synced_to_esp: false,
        confirmed_at: confirmedAt,
      })
      .select("id")
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        return { ok: true, alreadySubscribed: true };
      }
      throw insertError;
    }

    const { configured } = getEspConfigStatus();
    if (inserted?.id && configured) {
      void syncAndMarkSubscriber({
        id: String(inserted.id),
        email,
        locale,
        source,
      }).catch((syncError) => {
        console.error("[newsletter] ESP sync failed:", syncError);
      });
    }

    scheduleNewsletterWelcomeEmail({ customerEmail: email, locale });

    return { ok: true, alreadySubscribed: false };
  } catch (error) {
    console.error("[newsletter] subscribe failed:", error);
    return { ok: false, alreadySubscribed: false, error: "subscribe_failed" };
  }
}
