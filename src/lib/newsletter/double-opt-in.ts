import "server-only";

const EU_LOCALES = new Set(["en", "sv", "es", "de"]);
const TOKEN_TTL_HOURS = 48;

export function requiresDoubleOptIn(locale?: string): boolean {
  const mode = process.env.NEWSLETTER_DOUBLE_OPT_IN?.trim().toLowerCase();

  if (mode === "false" || mode === "off" || mode === "never") {
    return false;
  }
  if (mode === "eu") {
    return !locale || EU_LOCALES.has(locale);
  }
  if (mode === "true" || mode === "always" || mode === "all" || !mode) {
    return true;
  }

  return true;
}

export function createConfirmationToken(): string {
  return crypto.randomUUID();
}

export function confirmationTokenExpiresAt(from = new Date()): string {
  const expires = new Date(from);
  expires.setHours(expires.getHours() + TOKEN_TTL_HOURS);
  return expires.toISOString();
}

export function buildNewsletterConfirmUrl(locale: string, token: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const normalizedLocale = EU_LOCALES.has(locale) ? locale : "en";
  return `${base.replace(/\/$/, "")}/${normalizedLocale}/newsletter/confirm?token=${encodeURIComponent(token)}`;
}
