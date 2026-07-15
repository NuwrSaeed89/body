import { publicEnv, serverEnv } from "@/lib/env";
import { renderBackInStockEmail } from "./back-in-stock-template";
import type {
  BackInStockEmailData,
  SendBackInStockResult,
} from "./back-in-stock-types";

function readEmailFrom(): string {
  return process.env.EMAIL_FROM ?? "Mbody <orders@mbody.com>";
}

async function sendViaResend(
  to: string,
  rendered: ReturnType<typeof renderBackInStockEmail>,
): Promise<SendBackInStockResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, mode: "log", error: "RESEND_API_KEY is not set" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: readEmailFrom(),
      to: [to],
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return { ok: false, mode: "resend", error: errorText };
  }

  const payload = (await response.json()) as { id?: string };
  return { ok: true, mode: "resend", messageId: payload.id };
}

function logEmailPreview(to: string, rendered: ReturnType<typeof renderBackInStockEmail>) {
  console.info("[mbody] Back-in-stock email (log mode)");
  console.info(`  to: ${to}`);
  console.info(`  subject: ${rendered.subject}`);
  console.info(`  preview: ${publicEnv.appUrl}/api/dev/emails/back-in-stock`);
}

/** Sends back-in-stock notice to a waiting-list subscriber. */
export async function sendBackInStockEmail(
  data: BackInStockEmailData,
): Promise<SendBackInStockResult> {
  const rendered = renderBackInStockEmail(data);
  const to = data.customerEmail.trim();

  if (!to) {
    return { ok: false, mode: "log", error: "Missing customer email" };
  }

  const provider = process.env.EMAIL_PROVIDER ?? "log";
  const canUseResend =
    provider === "resend" && process.env.RESEND_API_KEY && serverEnv.nodeEnv !== "test";

  if (canUseResend) {
    const result = await sendViaResend(to, rendered);
    if (result.ok) return result;
    console.warn("[mbody] Resend failed, falling back to log mode:", result.error);
  }

  logEmailPreview(to, rendered);
  return { ok: true, mode: "log" };
}

export { renderBackInStockEmail };
