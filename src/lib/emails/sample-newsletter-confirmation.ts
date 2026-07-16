import { buildNewsletterConfirmUrl } from "@/lib/newsletter/double-opt-in";
import type {
  NewsletterConfirmationEmailData,
  NewsletterConfirmationLocale,
} from "./newsletter-confirmation-types";

export function buildSampleNewsletterConfirmationData(
  locale: NewsletterConfirmationLocale,
): NewsletterConfirmationEmailData {
  const token = "sample-confirmation-token";
  return {
    customerEmail: "jane@example.com",
    locale,
    confirmUrl: buildNewsletterConfirmUrl(locale, token),
  };
}
