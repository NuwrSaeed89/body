import { shouldUseAdminMock } from "@/lib/admin/should-use-mock";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getEspConfigStatus } from "@/lib/newsletter/esp/config";
import { listMockNewsletterSubscribers } from "@/lib/newsletter/mock-store";
import type { NewsletterSource } from "@/lib/newsletter/types";
import { mapNewsletterRow } from "./format";
import type { AdminNewsletterData, AdminNewsletterRow } from "./types";

type DbNewsletterRow = {
  id: string;
  email: string;
  locale: string | null;
  source: string | null;
  confirmed_at: string | null;
  synced_to_esp: boolean;
  consented_at: string;
  created_at: string;
};

const MOCK_SEED: AdminNewsletterRow[] = [
  mapNewsletterRow({
    id: "nl-mock-1",
    email: "jane@example.com",
    locale: "en",
    source: "homepage",
    confirmed: true,
    syncedToEsp: false,
    consentedAt: "2026-07-01T10:00:00.000Z",
    createdAt: "2026-07-01T10:00:00.000Z",
    localeForFormat: "en",
  }),
  mapNewsletterRow({
    id: "nl-mock-2",
    email: "maria@example.com",
    locale: "sv",
    source: "cart",
    confirmed: false,
    syncedToEsp: false,
    consentedAt: "2026-07-05T14:00:00.000Z",
    createdAt: "2026-07-05T14:00:00.000Z",
    localeForFormat: "en",
  }),
];

function normalizeSource(value: string | null): NewsletterSource {
  if (value === "cart" || value === "cart-empty" || value === "homepage") return value;
  return "homepage";
}

function getMockNewsletterData(locale: string): AdminNewsletterData {
  const liveMock = listMockNewsletterSubscribers().map((row) =>
    mapNewsletterRow({
      id: row.id,
      email: row.email,
      locale: row.locale,
      source: row.source,
      confirmed: Boolean(row.confirmedAt),
      syncedToEsp: row.syncedToEsp,
      consentedAt: row.consentedAt,
      createdAt: row.createdAt,
      localeForFormat: locale,
    }),
  );

  const subscribers = liveMock.length > 0 ? liveMock : MOCK_SEED;

  return {
    source: "mock",
    subscribers,
    totalCount: subscribers.length,
    pendingConfirmationCount: subscribers.filter((row) => !row.confirmed).length,
    pendingEspSyncCount: subscribers.filter((row) => row.confirmed && !row.syncedToEsp).length,
    esp: getEspConfigStatus(),
  };
}

async function fetchNewsletterSubscribers(locale: string): Promise<AdminNewsletterData> {
  const contentLocale = ["en", "sv", "es", "de"].includes(locale) ? locale : "en";
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("id, email, locale, source, confirmed_at, synced_to_esp, consented_at, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const subscribers = ((data ?? []) as DbNewsletterRow[]).map((row) =>
    mapNewsletterRow({
      id: row.id,
      email: String(row.email),
      locale: row.locale ?? "en",
      source: normalizeSource(row.source),
      confirmed: Boolean(row.confirmed_at),
      syncedToEsp: Boolean(row.synced_to_esp),
      consentedAt: row.consented_at,
      createdAt: row.created_at,
      localeForFormat: contentLocale,
    }),
  );

  return {
    source: "supabase",
    subscribers,
    totalCount: subscribers.length,
    pendingConfirmationCount: subscribers.filter((row) => !row.confirmed).length,
    pendingEspSyncCount: subscribers.filter((row) => row.confirmed && !row.syncedToEsp).length,
    esp: getEspConfigStatus(),
  };
}

export async function getAdminNewsletterData(locale: string): Promise<AdminNewsletterData> {
  if (shouldUseAdminMock()) {
    return getMockNewsletterData(locale);
  }

  try {
    return await fetchNewsletterSubscribers(locale);
  } catch (error) {
    console.error("[admin] newsletter fetch failed:", error);
    return getMockNewsletterData(locale);
  }
}
