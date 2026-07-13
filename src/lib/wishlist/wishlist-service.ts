import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function listWishlistProductIds(userId: string): Promise<string[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("wishlists")
    .select("product_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => String(row.product_id));
}

export async function addWishlistProduct(
  userId: string,
  productId: string,
): Promise<{ productIds: string[]; likeCount: number }> {
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.from("wishlists").insert({
    user_id: userId,
    product_id: productId,
  });
  // Ignore duplicate wishlist rows (already liked).
  if (error && error.code !== "23505") throw error;

  const [productIds, likeCount] = await Promise.all([
    listWishlistProductIds(userId),
    fetchProductLikeCount(productId),
  ]);

  return { productIds, likeCount };
}

export async function removeWishlistProduct(
  userId: string,
  productId: string,
): Promise<{ productIds: string[]; likeCount: number }> {
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase
    .from("wishlists")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);
  if (error) throw error;

  const [productIds, likeCount] = await Promise.all([
    listWishlistProductIds(userId),
    fetchProductLikeCount(productId),
  ]);

  return { productIds, likeCount };
}

export async function fetchProductLikeCount(productId: string): Promise<number> {
  const supabase = createSupabaseAdminClient();
  const { count, error } = await supabase
    .from("wishlists")
    .select("product_id", { count: "exact", head: true })
    .eq("product_id", productId);

  if (error) throw error;
  return count ?? 0;
}

/** Map of product_id → wishlist row count (authoritative like_count). */
export async function fetchWishlistLikeCounts(
  productIds: string[],
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (productIds.length === 0) return counts;

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("wishlists")
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
 * Align products.like_count with wishlist row counts for the given products.
 * Keeps denormalized counters accurate when seed data drifted from wishlists.
 */
export async function reconcileProductLikeCounts(productIds: string[]): Promise<void> {
  if (productIds.length === 0) return;

  const supabase = createSupabaseAdminClient();
  const counts = await fetchWishlistLikeCounts(productIds);

  await Promise.all(
    productIds.map(async (productId) => {
      const likeCount = counts.get(productId) ?? 0;
      const { error } = await supabase
        .from("products")
        .update({ like_count: likeCount })
        .eq("id", productId)
        .neq("like_count", likeCount);
      if (error) throw error;
    }),
  );
}
