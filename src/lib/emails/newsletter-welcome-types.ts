import type { Locale } from "@/i18n/routing";

export type NewsletterWelcomeLocale = Locale;

export type NewsletterWelcomeEmailData = {
  locale: NewsletterWelcomeLocale;
  customerEmail: string;
  shopUrl: string;
};

export type RenderedNewsletterWelcomeEmail = {
  subject: string;
  html: string;
  text: string;
};

export type SendNewsletterWelcomeResult = {
  ok: boolean;
  mode: "resend" | "log";
  messageId?: string;
  error?: string;
};
