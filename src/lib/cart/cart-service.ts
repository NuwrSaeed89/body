import "server-only";

import { CATALOG_IMAGE_PLACEHOLDER } from "@/lib/catalog/constants";
import { resolveCatalogLocale } from "@/lib/catalog/constants";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { CartItem, CartMutationResult } from "./types";

export async function resolveProfileIdByEmail(email: string): Promise<string | null> {
  const supabase = createSupabaseAdminClient();
  const normalized = email.trim().toLowerCase();

  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", normalized)
    .maybeSingle();

  if (error) throw error;
  return data?.id ?? null;
}

async function getOrCreateCartId(userId: string): Promise<string> {
  const supabase = createSupabaseAdminClient();

  const { data: existing, error: readError } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (readError) throw readError;
  if (existing?.id) return existing.id;

  const { data: created, error: insertError } = await supabase
    .from("carts")
    .insert({ user_id: userId })
    .select("id")
    .single();

  if (insertError) throw insertError;
  return created.id;
}

async function getCartIdForUser(userId: string): Promise<string | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data?.id ?? null;
}

async function countCartItems(userId: string, locale: string): Promise<number> {
  const items = await fetchCartItems(userId, locale);
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

async function touchCart(cartId: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  await supabase.from("carts").update({ updated_at: new Date().toISOString() }).eq("id", cartId);
}

export async function addItemToCart(
  userId: string,
  variantId: string,
  quantity: number,
): Promise<{ ok: true; itemCount: number } | { ok: false; error: "variant_not_found" | "out_of_stock" }> {
  const supabase = createSupabaseAdminClient();

  const { data: variant, error: variantError } = await supabase
    .from("product_variants")
    .select("id, stock_quantity, is_active, products(status)")
    .eq("id", variantId)
    .maybeSingle();

  if (variantError) throw variantError;

  const productStatus = (variant?.products as { status: string } | { status: string }[] | null);
  const status = Array.isArray(productStatus) ? productStatus[0]?.status : productStatus?.status;

  if (!variant || !variant.is_active || status !== "active") {
    return { ok: false, error: "variant_not_found" };
  }

  const variantRow = variant;

  const cartId = await getOrCreateCartId(userId);

  const { data: existingItem, error: itemError } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("cart_id", cartId)
    .eq("variant_id", variantId)
    .maybeSingle();

  if (itemError) throw itemError;

  const nextQuantity = (existingItem?.quantity ?? 0) + quantity;
  if (nextQuantity > variantRow.stock_quantity) {
    return { ok: false, error: "out_of_stock" };
  }

  if (existingItem) {
    const { error: updateError } = await supabase
      .from("cart_items")
      .update({ quantity: nextQuantity })
      .eq("id", existingItem.id);
    if (updateError) throw updateError;
  } else {
    const { error: insertError } = await supabase.from("cart_items").insert({
      cart_id: cartId,
      variant_id: variantId,
      quantity,
    });
    if (insertError) throw insertError;
  }

  await supabase.from("carts").update({ updated_at: new Date().toISOString() }).eq("id", cartId);

  const items = await fetchCartItems(userId, "en");
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return { ok: true, itemCount };
}

export async function fetchCartItems(userId: string, locale: string): Promise<CartItem[]> {
  const supabase = createSupabaseAdminClient();
  const contentLocale = resolveCatalogLocale(locale);

  const { data: cart, error: cartError } = await supabase
    .from("carts")
    .select(
      `
      id,
      cart_items(
        id,
        quantity,
        variant_id,
        product_variants(
          id,
          sku,
          sizes(code),
          colors(
            code,
            color_translations(locale, name)
          ),
          products(
            id,
            slug,
            base_price,
            status,
            product_translations(locale, name),
            product_media(public_url, alt_text, is_primary, sort_order)
          )
        )
      )
    `,
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (cartError) throw cartError;
  if (!cart?.cart_items) return [];

  type DbCartItem = {
    id: string;
    quantity: number;
    variant_id: string;
    product_variants: {
      id: string;
      sku: string;
      sizes: { code: string } | { code: string }[] | null;
      colors: {
        code: string;
        color_translations: { locale: string; name: string }[];
      } | {
        code: string;
        color_translations: { locale: string; name: string }[];
      }[] | null;
      products: {
        id: string;
        slug: string;
        base_price: number;
        status: string;
        product_translations: { locale: string; name: string }[];
        product_media: {
          public_url: string;
          alt_text: string | null;
          is_primary: boolean;
          sort_order: number;
        }[];
      } | {
        id: string;
        slug: string;
        base_price: number;
        status: string;
        product_translations: { locale: string; name: string }[];
        product_media: {
          public_url: string;
          alt_text: string | null;
          is_primary: boolean;
          sort_order: number;
        }[];
      }[] | null;
    } | {
      id: string;
      sku: string;
      sizes: { code: string } | { code: string }[] | null;
      colors: {
        code: string;
        color_translations: { locale: string; name: string }[];
      } | null;
      products: {
        id: string;
        slug: string;
        base_price: number;
        status: string;
        product_translations: { locale: string; name: string }[];
        product_media: {
          public_url: string;
          alt_text: string | null;
          is_primary: boolean;
          sort_order: number;
        }[];
      } | null;
    }[] | null;
  };

  const unwrap = <T,>(value: T | T[] | null | undefined): T | null =>
    !value ? null : Array.isArray(value) ? (value[0] ?? null) : value;

  return ((cart.cart_items ?? []) as unknown as DbCartItem[])
    .map((row) => {
      const variant = unwrap(row.product_variants);
      const product = variant ? unwrap(variant.products) : null;
      if (!variant || !product || product.status !== "active") return null;

      const translation =
        product.product_translations.find((t) => t.locale === contentLocale) ??
        product.product_translations.find((t) => t.locale === "en") ??
        product.product_translations[0];

      const media = [...(product.product_media ?? [])].sort((a, b) => {
        if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
        return a.sort_order - b.sort_order;
      });
      const primaryImage = media[0];

      const size = unwrap(variant.sizes);
      const color = unwrap(variant.colors);
      const colorName =
        color?.color_translations.find((t) => t.locale === contentLocale)?.name ??
        color?.color_translations.find((t) => t.locale === "en")?.name ??
        color?.code ??
        "";

      return {
        id: row.id,
        variantId: row.variant_id,
        productId: product.id,
        productSlug: product.slug,
        productName: translation?.name ?? product.slug,
        size: size?.code ?? "",
        colorName,
        quantity: row.quantity,
        priceSek: Number(product.base_price),
        image: primaryImage?.public_url ?? CATALOG_IMAGE_PLACEHOLDER,
        imageAlt: primaryImage?.alt_text ?? translation?.name ?? product.slug,
      } satisfies CartItem;
    })
    .filter((item): item is CartItem => item !== null);
}

export async function updateCartItemQuantity(
  userId: string,
  cartItemId: string,
  quantity: number,
  locale = "en",
): Promise<CartMutationResult> {
  if (!Number.isInteger(quantity) || quantity < 0) {
    return { ok: false, error: "invalid_quantity" };
  }

  if (quantity === 0) {
    return removeCartItem(userId, cartItemId, locale);
  }

  const supabase = createSupabaseAdminClient();
  const cartId = await getCartIdForUser(userId);
  if (!cartId) return { ok: false, error: "item_not_found" };

  const { data: row, error: readError } = await supabase
    .from("cart_items")
    .select("id, quantity, variant_id, product_variants(stock_quantity, is_active, products(status))")
    .eq("id", cartItemId)
    .eq("cart_id", cartId)
    .maybeSingle();

  if (readError) throw readError;
  if (!row) return { ok: false, error: "item_not_found" };

  const variant = row.product_variants as
    | { stock_quantity: number; is_active: boolean; products: { status: string } | { status: string }[] | null }
    | { stock_quantity: number; is_active: boolean; products: { status: string } | { status: string }[] | null }[]
    | null;

  const variantRow = Array.isArray(variant) ? variant[0] : variant;
  const productStatus = variantRow?.products;
  const status = Array.isArray(productStatus) ? productStatus[0]?.status : productStatus?.status;

  if (!variantRow || !variantRow.is_active || status !== "active") {
    return { ok: false, error: "item_not_found" };
  }

  if (quantity > variantRow.stock_quantity) {
    return { ok: false, error: "out_of_stock" };
  }

  const { error: updateError } = await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("id", cartItemId)
    .eq("cart_id", cartId);

  if (updateError) throw updateError;

  await touchCart(cartId);

  const itemCount = await countCartItems(userId, locale);
  return { ok: true, itemCount };
}

export async function removeCartItem(
  userId: string,
  cartItemId: string,
  locale = "en",
): Promise<CartMutationResult> {
  const supabase = createSupabaseAdminClient();
  const cartId = await getCartIdForUser(userId);
  if (!cartId) return { ok: false, error: "item_not_found" };

  const { data: deleted, error: deleteError } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", cartItemId)
    .eq("cart_id", cartId)
    .select("id")
    .maybeSingle();

  if (deleteError) throw deleteError;
  if (!deleted) return { ok: false, error: "item_not_found" };

  await touchCart(cartId);

  const itemCount = await countCartItems(userId, locale);
  return { ok: true, itemCount };
}

type VariantPreviewRow = {
  id: string;
  sku: string;
  stock_quantity: number;
  is_active: boolean;
  sizes: { code: string } | { code: string }[] | null;
  colors: {
    code: string;
    color_translations: { locale: string; name: string }[];
  } | {
    code: string;
    color_translations: { locale: string; name: string }[];
  }[] | null;
  products: {
    id: string;
    slug: string;
    base_price: number;
    status: string;
    product_translations: { locale: string; name: string }[];
    product_media: {
      public_url: string;
      alt_text: string | null;
      is_primary: boolean;
      sort_order: number;
    }[];
  } | {
    id: string;
    slug: string;
    base_price: number;
    status: string;
    product_translations: { locale: string; name: string }[];
    product_media: {
      public_url: string;
      alt_text: string | null;
      is_primary: boolean;
      sort_order: number;
    }[];
  }[] | null;
};

const unwrapPreviewRow = <T,>(value: T | T[] | null | undefined): T | null =>
  !value ? null : Array.isArray(value) ? (value[0] ?? null) : value;

function mapVariantToCartItem(
  variant: VariantPreviewRow,
  quantity: number,
  contentLocale: string,
  itemId?: string,
): CartItem | null {
  const product = unwrapPreviewRow(variant.products);
  if (!variant.is_active || !product || product.status !== "active" || quantity < 1) {
    return null;
  }

  const cappedQuantity = Math.min(quantity, variant.stock_quantity);
  if (cappedQuantity < 1) return null;

  const translation =
    product.product_translations.find((t) => t.locale === contentLocale) ??
    product.product_translations.find((t) => t.locale === "en") ??
    product.product_translations[0];

  const media = [...(product.product_media ?? [])].sort((a, b) => {
    if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
    return a.sort_order - b.sort_order;
  });
  const primaryImage = media[0];

  const size = unwrapPreviewRow(variant.sizes);
  const color = unwrapPreviewRow(variant.colors);
  const colorName =
    color?.color_translations.find((t) => t.locale === contentLocale)?.name ??
    color?.color_translations.find((t) => t.locale === "en")?.name ??
    color?.code ??
    "";

  return {
    id: itemId ?? variant.id,
    variantId: variant.id,
    productId: product.id,
    productSlug: product.slug,
    productName: translation?.name ?? product.slug,
    size: size?.code ?? "",
    colorName,
    quantity: cappedQuantity,
    priceSek: Number(product.base_price),
    image: primaryImage?.public_url ?? CATALOG_IMAGE_PLACEHOLDER,
    imageAlt: primaryImage?.alt_text ?? translation?.name ?? product.slug,
  };
}

export async function previewCartItems(
  entries: { variantId: string; quantity: number }[],
  locale: string,
): Promise<CartItem[]> {
  if (entries.length === 0) return [];

  const supabase = createSupabaseAdminClient();
  const contentLocale = resolveCatalogLocale(locale);
  const variantIds = [...new Set(entries.map((entry) => entry.variantId))];

  const { data: variants, error } = await supabase
    .from("product_variants")
    .select(
      `
      id,
      sku,
      stock_quantity,
      is_active,
      sizes(code),
      colors(
        code,
        color_translations(locale, name)
      ),
      products(
        id,
        slug,
        base_price,
        status,
        product_translations(locale, name),
        product_media(public_url, alt_text, is_primary, sort_order)
      )
    `,
    )
    .in("id", variantIds);

  if (error) throw error;

  const variantById = new Map(
    ((variants ?? []) as unknown as VariantPreviewRow[]).map((variant) => [variant.id, variant]),
  );

  return entries
    .map((entry) => {
      const variant = variantById.get(entry.variantId);
      if (!variant) return null;
      return mapVariantToCartItem(variant, entry.quantity, contentLocale, entry.variantId);
    })
    .filter((item): item is CartItem => item !== null);
}

export async function mergeGuestCartItems(
  userId: string,
  entries: { variantId: string; quantity: number }[],
  locale = "en",
): Promise<{ ok: true; itemCount: number } | { ok: false; error: "server_error" }> {
  for (const entry of entries) {
    if (!Number.isInteger(entry.quantity) || entry.quantity < 1) continue;
    try {
      const result = await addItemToCart(userId, entry.variantId, entry.quantity);
      if (!result.ok && result.error !== "out_of_stock" && result.error !== "variant_not_found") {
        return { ok: false, error: "server_error" };
      }
    } catch {
      return { ok: false, error: "server_error" };
    }
  }

  const itemCount = await countCartItems(userId, locale);
  return { ok: true, itemCount };
}
