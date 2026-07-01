/** Mock order statuses that qualify for rating (mirrors database/006_rls_policies.sql). */
const RATEABLE_STATUSES = new Set(["paid", "processing", "shipped", "delivered"]);

export type MockVerifiedPurchase = {
  userId: string;
  productId: string;
  orderId: string;
  status: string;
};

/**
 * Mock verified purchases — any signed-in user shares the same demo order history
 * until Supabase orders are wired (account page MB-1042 / MB-0988).
 */
const MOCK_ACCOUNT_PURCHASES: Omit<MockVerifiedPurchase, "userId">[] = [
  { productId: "sculpt-leggings", orderId: "MB-1042", status: "delivered" },
  { productId: "zen-flow-bra", orderId: "MB-0988", status: "shipped" },
  { productId: "elite-bra", orderId: "MB-1048", status: "delivered" },
];

export function findVerifiedPurchase(
  userId: string | null | undefined,
  productId: string,
): { ok: true; orderId: string } | { ok: false; reason: "not_signed_in" | "not_purchased" } {
  if (!userId?.trim()) {
    return { ok: false, reason: "not_signed_in" };
  }

  const match = MOCK_ACCOUNT_PURCHASES.find(
    (row) => row.productId === productId && RATEABLE_STATUSES.has(row.status),
  );

  if (!match) {
    return { ok: false, reason: "not_purchased" };
  }

  return { ok: true, orderId: match.orderId };
}
