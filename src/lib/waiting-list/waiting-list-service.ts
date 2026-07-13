import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function asUuidOrNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return UUID_PATTERN.test(trimmed) ? trimmed : null;
}

/** Authoritative waiting list size for one product (stock_notifications rows). */
export async function fetchProductWaitingCount(productId: string): Promise<number> {
  const supabase = createSupabaseAdminClient();
  const { count, error } = await supabase
    .from("stock_notifications")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);

  if (error) throw error;
  return count ?? 0;
}

/** Map of product_id → stock_notifications row count (authoritative waiting_count). */
export async function fetchWaitingCounts(
  productIds: string[],
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (productIds.length === 0) return counts;

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("stock_notifications")
    .select("product_id")
    .in("product_id", productIds);

  if (error) throw error;

  for (const row of data ?? []) {
    const id = String(row.product_id);
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return counts;
}

/**
 * Align products.waiting_count with stock_notifications row counts.
 * Keeps denormalized counters accurate when seed data drifted from the waiting list.
 */
export async function reconcileProductWaitingCounts(productIds: string[]): Promise<void> {
  if (productIds.length === 0) return;

  const supabase = createSupabaseAdminClient();
  const counts = await fetchWaitingCounts(productIds);

  await Promise.all(
    productIds.map(async (productId) => {
      const waitingCount = counts.get(productId) ?? 0;
      const { error } = await supabase
        .from("products")
        .update({ waiting_count: waitingCount })
        .eq("id", productId)
        .neq("waiting_count", waitingCount);
      if (error) throw error;
    }),
  );
}

export async function insertStockNotification(input: {
  email: string;
  productId: string;
  variantId?: string | null;
  userId?: string | null;
}): Promise<{ alreadySubscribed: boolean; waitingCount: number }> {
  const supabase = createSupabaseAdminClient();
  const email = input.email.trim().toLowerCase();
  const variantId = asUuidOrNull(input.variantId);
  const userId = asUuidOrNull(input.userId);

  let existingQuery = supabase
    .from("stock_notifications")
    .select("id")
    .eq("email", email)
    .eq("product_id", input.productId)
    .limit(1);

  existingQuery = variantId
    ? existingQuery.eq("variant_id", variantId)
    : existingQuery.is("variant_id", null);

  const { data: existing, error: existingError } = await existingQuery.maybeSingle();
  if (existingError) throw existingError;

  if (existing) {
    return {
      alreadySubscribed: true,
      waitingCount: await fetchProductWaitingCount(input.productId),
    };
  }

  const { error: insertError } = await supabase.from("stock_notifications").insert({
    email,
    product_id: input.productId,
    variant_id: variantId,
    user_id: userId,
  });

  if (insertError) {
    // Race on unique (email, product_id, variant_id)
    if (insertError.code === "23505") {
      return {
        alreadySubscribed: true,
        waitingCount: await fetchProductWaitingCount(input.productId),
      };
    }
    throw insertError;
  }

  // Trigger increments waiting_count; reconcile to stay authoritative.
  const waitingCount = await fetchProductWaitingCount(input.productId);
  await reconcileProductWaitingCounts([input.productId]);

  return { alreadySubscribed: false, waitingCount };
}
