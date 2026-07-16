import type { NewsletterSource } from "./types";
import type { ConfirmNewsletterResult } from "./types";

export type MockNewsletterSubscriber = {
  id: string;
  email: string;
  locale: string;
  source: NewsletterSource;
  syncedToEsp: boolean;
  consentedAt: string;
  createdAt: string;
  confirmedAt: string | null;
  confirmationToken: string | null;
  confirmationTokenExpiresAt: string | null;
};

type MockStoreGlobal = typeof globalThis & {
  __mbodyNewsletterSubscribers?: MockNewsletterSubscriber[];
};

function getStore(): MockNewsletterSubscriber[] {
  const g = globalThis as MockStoreGlobal;
  if (!g.__mbodyNewsletterSubscribers) {
    g.__mbodyNewsletterSubscribers = [];
  }
  return g.__mbodyNewsletterSubscribers;
}

export function listMockNewsletterSubscribers(): MockNewsletterSubscriber[] {
  return [...getStore()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function addMockNewsletterSubscriber(input: {
  email: string;
  locale: string;
  source: NewsletterSource;
  doubleOptIn?: boolean;
}): {
  record: MockNewsletterSubscriber;
  alreadySubscribed: boolean;
  pendingConfirmation: boolean;
} {
  const store = getStore();
  const email = input.email.trim().toLowerCase();
  const existing = store.find((row) => row.email === email);
  const now = new Date().toISOString();
  const useDoubleOptIn = input.doubleOptIn ?? true;

  if (existing?.confirmedAt) {
    return { record: existing, alreadySubscribed: true, pendingConfirmation: false };
  }

  if (existing && useDoubleOptIn) {
    existing.locale = input.locale;
    existing.source = input.source;
    existing.consentedAt = now;
    existing.confirmationToken = crypto.randomUUID();
    existing.confirmationTokenExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    return { record: existing, alreadySubscribed: false, pendingConfirmation: true };
  }

  if (existing) {
    existing.confirmedAt = now;
    existing.confirmationToken = null;
    existing.confirmationTokenExpiresAt = null;
    return { record: existing, alreadySubscribed: true, pendingConfirmation: false };
  }

  const record: MockNewsletterSubscriber = {
    id: `nl_${crypto.randomUUID()}`,
    email,
    locale: input.locale,
    source: input.source,
    syncedToEsp: false,
    consentedAt: now,
    createdAt: now,
    confirmedAt: useDoubleOptIn ? null : now,
    confirmationToken: useDoubleOptIn ? crypto.randomUUID() : null,
    confirmationTokenExpiresAt: useDoubleOptIn
      ? new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
      : null,
  };
  store.push(record);
  return {
    record,
    alreadySubscribed: false,
    pendingConfirmation: useDoubleOptIn,
  };
}

export function confirmMockNewsletterSubscriber(token: string): ConfirmNewsletterResult {
  const store = getStore();
  const row = store.find((item) => item.confirmationToken === token);
  if (!row) {
    return { ok: false, error: "invalid_token" };
  }

  if (row.confirmedAt) {
    return {
      ok: true,
      alreadyConfirmed: true,
      email: row.email,
      locale: row.locale,
    };
  }

  const expiresAt = row.confirmationTokenExpiresAt
    ? new Date(row.confirmationTokenExpiresAt)
    : null;
  if (expiresAt && expiresAt.getTime() < Date.now()) {
    return { ok: false, error: "expired_token" };
  }

  row.confirmedAt = new Date().toISOString();
  row.confirmationToken = null;
  row.confirmationTokenExpiresAt = null;

  return {
    ok: true,
    alreadyConfirmed: false,
    email: row.email,
    locale: row.locale,
  };
}
