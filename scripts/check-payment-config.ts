#!/usr/bin/env npx tsx
/**
 * Prints payment provider env status — run after client returns credentials.
 * Usage: pnpm exec tsx scripts/check-payment-config.ts
 */
import { getPaymentConfigStatus } from "../src/lib/payment/provider-env";

const status = getPaymentConfigStatus();

console.log("Mbody payment provider config\n");
console.log(`  PAYMENT_PROVIDER: ${status.provider}`);
console.log(`  Ready for staging: ${status.readyForStaging ? "yes" : "no"}`);
console.log(`  Stripe keys present: ${status.stripe.configured}`);
console.log(`  Swedish bank gateway: ${status.swedishBank.configured}`);
console.log(`  Klarna credentials: ${status.klarna.configured}`);
console.log(`  PAYMENT_WEBHOOK_SECRET: ${status.webhooks.paymentWebhookSecret}`);

if (status.missing.length > 0) {
  console.log("\n  Missing:");
  for (const key of status.missing) {
    console.log(`    - ${key}`);
  }
  console.log(
    "\n  Client intake: client-deliverables/Mbody-Payment-Provider-Credentials.md",
  );
  process.exit(1);
}

console.log("\n  All required credentials present for selected provider.");
