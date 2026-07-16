export type NewsletterEspProvider = "none" | "klaviyo" | "mailchimp";

export type EspSubscriberPayload = {
  id: string;
  email: string;
  locale: string;
  source: string;
};

export type EspSyncResult = {
  ok: boolean;
  provider: NewsletterEspProvider;
  error?: string;
};

export type EspConfigStatus = {
  provider: NewsletterEspProvider;
  configured: boolean;
  missing: string[];
  providerLabel: string;
};
