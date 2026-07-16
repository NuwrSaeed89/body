import type { EspSubscriberPayload, EspSyncResult } from "./types";

const KLAVIYO_REVISION = "2024-10-15";

export async function syncSubscriberToKlaviyo(
  subscriber: EspSubscriberPayload,
): Promise<EspSyncResult> {
  const apiKey = process.env.KLAVIYO_PRIVATE_API_KEY?.trim();
  const listId = process.env.KLAVIYO_LIST_ID?.trim();

  if (!apiKey || !listId) {
    return {
      ok: false,
      provider: "klaviyo",
      error: "Klaviyo credentials missing (KLAVIYO_PRIVATE_API_KEY, KLAVIYO_LIST_ID)",
    };
  }

  const response = await fetch("https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/", {
    method: "POST",
    headers: {
      Authorization: `Klaviyo-API-Key ${apiKey}`,
      revision: KLAVIYO_REVISION,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      data: {
        type: "profile-subscription-bulk-create-job",
        attributes: {
          profiles: {
            data: [
              {
                type: "profile",
                attributes: {
                  email: subscriber.email,
                  locale: subscriber.locale,
                  properties: {
                    signup_source: subscriber.source,
                  },
                  subscriptions: {
                    email: {
                      marketing: {
                        consent: "SUBSCRIBED",
                      },
                    },
                  },
                },
              },
            ],
          },
        },
        relationships: {
          list: {
            data: {
              type: "list",
              id: listId,
            },
          },
        },
      },
    }),
  });

  if (response.ok || response.status === 202) {
    return { ok: true, provider: "klaviyo" };
  }

  const body = await response.text();
  return {
    ok: false,
    provider: "klaviyo",
    error: body.slice(0, 300) || `Klaviyo API error (${response.status})`,
  };
}
