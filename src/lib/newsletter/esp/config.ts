import type { EspConfigStatus, NewsletterEspProvider } from "./types";

const PROVIDERS: NewsletterEspProvider[] = ["none", "klaviyo", "mailchimp"];

export function readNewsletterEspProvider(): NewsletterEspProvider {
  const value = process.env.NEWSLETTER_ESP?.trim().toLowerCase();
  if (value === "klaviyo" || value === "mailchimp") return value;
  return "none";
}

export function newsletterEspProviderLabel(provider: NewsletterEspProvider): string {
  if (provider === "klaviyo") return "Klaviyo";
  if (provider === "mailchimp") return "Mailchimp";
  return "None (DB only)";
}

export function getMissingEspCredentials(provider: NewsletterEspProvider): string[] {
  if (provider === "none") return [];

  if (provider === "klaviyo") {
    const missing: string[] = [];
    if (!process.env.KLAVIYO_PRIVATE_API_KEY?.trim()) {
      missing.push("KLAVIYO_PRIVATE_API_KEY");
    }
    if (!process.env.KLAVIYO_LIST_ID?.trim()) {
      missing.push("KLAVIYO_LIST_ID");
    }
    return missing;
  }

  const missing: string[] = [];
  if (!process.env.MAILCHIMP_API_KEY?.trim()) {
    missing.push("MAILCHIMP_API_KEY");
  }
  if (!process.env.MAILCHIMP_LIST_ID?.trim()) {
    missing.push("MAILCHIMP_LIST_ID");
  }
  return missing;
}

export function getEspConfigStatus(): EspConfigStatus {
  const provider = readNewsletterEspProvider();
  const missing = getMissingEspCredentials(provider);

  return {
    provider,
    configured: provider !== "none" && missing.length === 0,
    missing,
    providerLabel: newsletterEspProviderLabel(provider),
  };
}

export function isEspProvider(value: string): value is NewsletterEspProvider {
  return (PROVIDERS as readonly string[]).includes(value);
}
