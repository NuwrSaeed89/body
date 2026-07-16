import { createHash } from "node:crypto";
import type { EspSubscriberPayload, EspSyncResult } from "./types";

function mailchimpServerPrefix(apiKey: string): string | null {
  const explicit = process.env.MAILCHIMP_SERVER_PREFIX?.trim();
  if (explicit) return explicit;

  const dash = apiKey.lastIndexOf("-");
  if (dash === -1 || dash === apiKey.length - 1) return null;
  return apiKey.slice(dash + 1);
}

function subscriberHash(email: string): string {
  return createHash("md5").update(email.trim().toLowerCase()).digest("hex");
}

export async function syncSubscriberToMailchimp(
  subscriber: EspSubscriberPayload,
): Promise<EspSyncResult> {
  const apiKey = process.env.MAILCHIMP_API_KEY?.trim();
  const listId = process.env.MAILCHIMP_LIST_ID?.trim();

  if (!apiKey || !listId) {
    return {
      ok: false,
      provider: "mailchimp",
      error: "Mailchimp credentials missing (MAILCHIMP_API_KEY, MAILCHIMP_LIST_ID)",
    };
  }

  const server = mailchimpServerPrefix(apiKey);
  if (!server) {
    return {
      ok: false,
      provider: "mailchimp",
      error: "Could not resolve Mailchimp server prefix from API key",
    };
  }

  const hash = subscriberHash(subscriber.email);
  const auth = Buffer.from(`anystring:${apiKey}`).toString("base64");

  const response = await fetch(
    `https://${server}.api.mailchimp.com/3.0/lists/${listId}/members/${hash}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: subscriber.email,
        status_if_new: "subscribed",
        status: "subscribed",
        merge_fields: {
          LOCALE: subscriber.locale.toUpperCase(),
          SOURCE: subscriber.source,
        },
      }),
    },
  );

  if (response.ok) {
    return { ok: true, provider: "mailchimp" };
  }

  const body = await response.text();
  return {
    ok: false,
    provider: "mailchimp",
    error: body.slice(0, 300) || `Mailchimp API error (${response.status})`,
  };
}
