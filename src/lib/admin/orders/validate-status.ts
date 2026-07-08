import {
  ADMIN_FULFILLMENT_STATUSES,
  type AdminFulfillmentStatus,
} from "./constants";

type ParseResult =
  | { ok: true; data: { status: AdminFulfillmentStatus } }
  | { ok: false; error: string };

export function parseOrderStatusBody(body: unknown): ParseResult {
  if (!body || typeof body !== "object" || !("status" in body)) {
    return { ok: false, error: "status is required" };
  }

  const status = (body as { status: unknown }).status;
  if (typeof status !== "string") {
    return { ok: false, error: "status must be a string" };
  }

  if (!ADMIN_FULFILLMENT_STATUSES.includes(status as AdminFulfillmentStatus)) {
    return {
      ok: false,
      error: `status must be one of: ${ADMIN_FULFILLMENT_STATUSES.join(", ")}`,
    };
  }

  return { ok: true, data: { status: status as AdminFulfillmentStatus } };
}
