export type NewsletterConfirmationLocale = "en" | "sv" | "es" | "de";

export type NewsletterConfirmationEmailData = {
  customerEmail: string;
  locale: NewsletterConfirmationLocale;
  confirmUrl: string;
};

export type RenderedNewsletterConfirmationEmail = {
  subject: string;
  html: string;
  text: string;
};

export type SendNewsletterConfirmationResult = {
  ok: boolean;
  mode: "log" | "resend";
  messageId?: string;
  error?: string;
};
