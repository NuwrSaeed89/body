import { getPaymentConfigStatus } from "@/lib/payment/provider-env";
import { serverEnv } from "@/lib/env";

/** Development-only — shows which payment env vars are set (no secret values). */
export async function GET() {
  if (serverEnv.nodeEnv === "production") {
    return Response.json({ error: "Not available" }, { status: 404 });
  }

  const status = getPaymentConfigStatus();

  return Response.json({
    ...status,
    intakeForm: "client-deliverables/Mbody-Payment-Provider-Credentials.md",
    docs: "mbody/docs/payment-provider.md",
  });
}
