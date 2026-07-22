import { timingSafeEqual } from "node:crypto";

import { publicEnv, serverEnv } from "@/lib/env";

/** Dev/staging tooling — blocked on production storefront. */
export function isDevToolsEnvironment(): boolean {
  if (serverEnv.nodeEnv !== "production") return true;
  return publicEnv.appEnv === "staging";
}

function readDevToolsSecret(): string | undefined {
  return (
    process.env.MBODY_DEV_TOOLS_SECRET?.trim() ||
    process.env.PAYMENT_WEBHOOK_SECRET?.trim() ||
    undefined
  );
}

/** Local dev without a secret is open; staging requires x-mbody-webhook-signature. */
export function verifyDevToolsAccess(request: Request): boolean {
  if (!isDevToolsEnvironment()) return false;

  const secret = readDevToolsSecret();
  if (!secret) {
    return serverEnv.nodeEnv !== "production";
  }

  const signature = request.headers.get("x-mbody-webhook-signature")?.trim();
  if (!signature) return false;

  try {
    const expected = Buffer.from(secret);
    const provided = Buffer.from(signature);
    if (expected.length !== provided.length) return false;
    return timingSafeEqual(expected, provided);
  } catch {
    return false;
  }
}

export function devToolsAccessHint(): string {
  const secret = readDevToolsSecret();
  if (!secret) {
    return "No PAYMENT_WEBHOOK_SECRET — open on local dev only.";
  }
  return 'Send header x-mbody-webhook-signature matching PAYMENT_WEBHOOK_SECRET (or MBODY_DEV_TOOLS_SECRET).';
}
