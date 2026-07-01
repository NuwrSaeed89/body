export type PaymentProviderId = "stripe" | "swedish_bank" | "tbd";

export type PaymentConfigStatus = {
  provider: PaymentProviderId;
  readyForStaging: boolean;
  missing: string[];
  stripe: { configured: boolean };
  swedishBank: { configured: boolean };
  klarna: { configured: boolean };
  webhooks: { paymentWebhookSecret: boolean };
};

function readProvider(): PaymentProviderId {
  const value = process.env.PAYMENT_PROVIDER?.trim().toLowerCase();
  if (value === "stripe" || value === "swedish_bank") return value;
  return "tbd";
}

function isStripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY?.trim() &&
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim(),
  );
}

function isSwedishBankConfigured(): boolean {
  return Boolean(
    process.env.PAYMENT_GATEWAY_API_URL?.trim() &&
      process.env.PAYMENT_GATEWAY_API_KEY?.trim() &&
      process.env.PAYMENT_GATEWAY_MERCHANT_ID?.trim(),
  );
}

function isKlarnaConfigured(): boolean {
  return Boolean(
    process.env.KLARNA_USERNAME?.trim() &&
      process.env.KLARNA_PASSWORD?.trim() &&
      process.env.KLARNA_API_URL?.trim(),
  );
}

/** Lists env vars still required for the selected PAYMENT_PROVIDER. */
export function getMissingPaymentCredentials(): string[] {
  const provider = readProvider();
  const missing: string[] = [];

  if (provider === "tbd") {
    missing.push("PAYMENT_PROVIDER (stripe | swedish_bank)");
    return missing;
  }

  if (provider === "stripe") {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim()) {
      missing.push("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
    }
    if (!process.env.STRIPE_SECRET_KEY?.trim()) {
      missing.push("STRIPE_SECRET_KEY");
    }
    if (!process.env.STRIPE_WEBHOOK_SECRET?.trim()) {
      missing.push("STRIPE_WEBHOOK_SECRET");
    }
  }

  if (provider === "swedish_bank") {
    if (!process.env.PAYMENT_GATEWAY_API_URL?.trim()) {
      missing.push("PAYMENT_GATEWAY_API_URL");
    }
    if (!process.env.PAYMENT_GATEWAY_MERCHANT_ID?.trim()) {
      missing.push("PAYMENT_GATEWAY_MERCHANT_ID");
    }
    if (!process.env.PAYMENT_GATEWAY_API_KEY?.trim()) {
      missing.push("PAYMENT_GATEWAY_API_KEY");
    }
    if (!process.env.PAYMENT_GATEWAY_WEBHOOK_SECRET?.trim()) {
      missing.push("PAYMENT_GATEWAY_WEBHOOK_SECRET");
    }
  }

  return missing;
}

export function getPaymentConfigStatus(): PaymentConfigStatus {
  const provider = readProvider();
  const missing = getMissingPaymentCredentials();
  const stripe = { configured: isStripeConfigured() };
  const swedishBank = { configured: isSwedishBankConfigured() };
  const klarna = { configured: isKlarnaConfigured() };

  const providerReady =
    provider === "stripe"
      ? stripe.configured && missing.length === 0
      : provider === "swedish_bank"
        ? swedishBank.configured && missing.length === 0
        : false;

  return {
    provider,
    readyForStaging: providerReady,
    missing,
    stripe,
    swedishBank,
    klarna,
    webhooks: {
      paymentWebhookSecret: Boolean(process.env.PAYMENT_WEBHOOK_SECRET?.trim()),
    },
  };
}
