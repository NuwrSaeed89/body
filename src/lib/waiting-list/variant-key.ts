/** Mock variant key until Supabase product_variants UUID is wired. */
export function buildVariantKey(input: {
  productId: string;
  size?: string | null;
  color?: string | null;
}): string | null {
  const size = input.size?.trim();
  const color = input.color?.trim();
  if (!size && !color) return null;
  return [input.productId, size ?? "", color ?? ""].join("::");
}

export function subscriptionDedupeKey(
  productId: string,
  variantId: string | null,
  email: string,
): string {
  return `${productId}::${variantId ?? ""}::${email.trim().toLowerCase()}`;
}
