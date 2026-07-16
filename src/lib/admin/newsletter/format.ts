import { formatOrderDate } from "@/lib/admin/format";
import type { NewsletterSource } from "@/lib/newsletter/types";
import type { AdminNewsletterRow } from "./types";

const SOURCE_LABELS: Record<NewsletterSource, string> = {
  homepage: "Homepage",
  cart: "Cart footer",
  "cart-empty": "Empty cart",
};

export function newsletterSourceLabel(source: NewsletterSource): string {
  return SOURCE_LABELS[source] ?? source;
}

function newsletterStatusLabels(input: {
  confirmed: boolean;
  syncedToEsp: boolean;
}): { confirmationLabel: string; espLabel: string } {
  if (!input.confirmed) {
    return { confirmationLabel: "Awaiting confirm", espLabel: "—" };
  }
  if (input.syncedToEsp) {
    return { confirmationLabel: "Confirmed", espLabel: "Synced" };
  }
  return { confirmationLabel: "Confirmed", espLabel: "Pending ESP" };
}

export function mapNewsletterRow(input: {
  id: string;
  email: string;
  locale: string;
  source: NewsletterSource;
  confirmed: boolean;
  syncedToEsp: boolean;
  consentedAt: string;
  createdAt: string;
  localeForFormat: string;
}): AdminNewsletterRow {
  const labels = newsletterStatusLabels(input);

  return {
    id: input.id,
    email: input.email,
    locale: input.locale,
    source: input.source,
    sourceLabel: newsletterSourceLabel(input.source),
    confirmed: input.confirmed,
    confirmationLabel: labels.confirmationLabel,
    syncedToEsp: input.syncedToEsp,
    espLabel: labels.espLabel,
    consentedAt: input.consentedAt,
    consentedAtLabel: formatOrderDate(input.consentedAt, input.localeForFormat),
    createdAt: input.createdAt,
    createdAtLabel: formatOrderDate(input.createdAt, input.localeForFormat),
  };
}
