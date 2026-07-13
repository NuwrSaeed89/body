type InitiateReturnParseResult =
  | { ok: true; data: { orderItemId: string; quantity: number; reason: string | null } }
  | { ok: false; error: string };

export function parseInitiateReturnBody(body: unknown): InitiateReturnParseResult {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid JSON body" };
  }

  const raw = body as Record<string, unknown>;
  const orderItemId = typeof raw.orderItemId === "string" ? raw.orderItemId.trim() : "";
  const quantity = typeof raw.quantity === "number" ? raw.quantity : Number(raw.quantity);
  const reason = typeof raw.reason === "string" ? raw.reason.trim() : null;

  if (!orderItemId) return { ok: false, error: "orderItemId is required" };
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return { ok: false, error: "quantity must be a positive integer" };
  }

  return {
    ok: true,
    data: {
      orderItemId,
      quantity,
      reason: reason && reason.length > 0 ? reason : null,
    },
  };
}
