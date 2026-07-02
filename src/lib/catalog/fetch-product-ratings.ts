import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ProductRatingSummary } from "@/lib/product-ratings/types";

export async function fetchProductRatingSummary(
  productId: string,
): Promise<ProductRatingSummary> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("product_ratings")
    .select("stars")
    .eq("product_id", productId);

  if (error) throw error;

  const rows = data ?? [];
  if (rows.length === 0) {
    return { average: 0, count: 0 };
  }

  const totalStars = rows.reduce((sum, row) => sum + Number(row.stars), 0);
  return {
    average: Math.round((totalStars / rows.length) * 10) / 10,
    count: rows.length,
  };
}
