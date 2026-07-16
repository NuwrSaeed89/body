import { publicEnv } from "@/lib/env";
import type { NewsletterWelcomeEmailData, NewsletterWelcomeLocale } from "./newsletter-welcome-types";

export function buildSampleNewsletterWelcomeData(
  locale: NewsletterWelcomeLocale = "en",
): NewsletterWelcomeEmailData {
  return {
    locale,
    customerEmail: "jane@example.com",
    shopUrl: `${publicEnv.appUrl}/${locale}/shop`,
  };
}
