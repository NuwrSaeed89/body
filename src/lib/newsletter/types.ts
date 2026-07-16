export type NewsletterSource = "homepage" | "cart" | "cart-empty";

export type SubscribeNewsletterInput = {
  email: string;
  locale: string;
  source: NewsletterSource;
  consented: boolean;
};

export type SubscribeNewsletterResult = {
  ok: boolean;
  alreadySubscribed: boolean;
  pendingConfirmation?: boolean;
  error?: "invalid_email" | "consent_required" | "subscribe_failed";
};

export type ConfirmNewsletterResult = {
  ok: boolean;
  alreadyConfirmed?: boolean;
  email?: string;
  locale?: string;
  error?: "invalid_token" | "expired_token" | "confirm_failed";
};
