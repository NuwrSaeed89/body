import "server-only";

import { calculateCartSummary } from "@/lib/currency";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type PlacePendingPaymentOrderInput = {
  userId: string;
  locale: string;
  shippingAddress: {
    fullName: string;
    line1: string;
    city: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
};

type DbCartRow = {
  id: string;
  cart_items: {
    id: string;
    quantity: number;
    variant_id: string;
    product_variants: {
      id: string;
      sku: string;
      stock_quantity: number;
      is_active: boolean;
      sizes: { code: string } | { code: string }[] | null;
      colors:
        | {
            code: string;
          }
        | {
            code: string;
          }[]
        | null;
      products:
        | {
            id: string;
            slug: string;
            status: string;
            base_price: number;
            product_translations: { locale: string; name: string }[];
          }
        | {
            id: string;
            slug: string;
            status: string;
            base_price: number;
            product_translations: { locale: string; name: string }[];
          }[]
        | null;
    } | null;
  }[];
};

const unwrap = <T,>(value: T | T[] | null | undefined): T | null =>
  !value ? null : Array.isArray(value) ? (value[0] ?? null) : value;

function generateOrderNumber() {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `MB-${y}${m}${d}-${rand}`;
}

/** Creates a Supabase order in pending_payment until the card gateway is connected (Phase 4). */
export async function placePendingPaymentOrder(input: PlacePendingPaymentOrderInput): Promise<{
  orderId: string;
  orderNumber: string;
}> {
  const supabase = createSupabaseAdminClient();

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
          stock_quantity,
          is_active,
          sizes(code),
          colors(code),
          products(
            id,
            slug,
            status,
            base_price,
            product_translations(locale, name)
          )
        )
      )
    `,
    )
    .eq("user_id", input.userId)
    .maybeSingle();

  if (cartError) throw cartError;
  if (!cart) throw new Error("Cart not found");

  const row = cart as unknown as DbCartRow;
  const cartItems = row.cart_items ?? [];
  if (cartItems.length === 0) throw new Error("Cart is empty");

  const contentLocale = ["en", "sv", "de", "es"].includes(input.locale) ? input.locale : "en";

  const orderLines = cartItems.map((item) => {
    const variant = unwrap(item.product_variants);
    const product = variant ? unwrap(variant.products) : null;
    const size = variant ? unwrap(variant.sizes) : null;
    const color = variant ? unwrap(variant.colors) : null;

    if (!variant || !product || !variant.is_active || product.status !== "active") {
      throw new Error("One or more cart items are unavailable");
    }

    if (item.quantity > variant.stock_quantity) {
      throw new Error(`Insufficient stock for ${variant.sku}`);
    }

    const translation =
      product.product_translations.find((t) => t.locale === contentLocale) ??
      product.product_translations.find((t) => t.locale === "en") ??
      product.product_translations[0];

    const unitPrice = Number(product.base_price);
    const quantity = Number(item.quantity);

    return {
      variantId: variant.id,
      productId: product.id,
      sku: variant.sku,
      productName: translation?.name ?? product.slug,
      sizeCode: size?.code ?? "ONE",
      colorCode: color?.code ?? "DEFAULT",
      quantity,
      unitPrice,
      lineTotal: unitPrice * quantity,
    };
  });

  const subtotal = orderLines.reduce((sum, line) => sum + line.lineTotal, 0);
  const summary = calculateCartSummary(subtotal, "SEK", contentLocale === "sv" ? "sv-SE" : "en-US");
  const orderNumber = generateOrderNumber();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      user_id: input.userId,
      status: "pending_payment",
      currency: "SEK",
      subtotal,
      discount_total: 0,
      shipping_total: summary.shippingSek,
      tax_total: summary.vatSek,
      grand_total: summary.grandTotalSek,
      shipping_address: {
        fullName: input.shippingAddress.fullName,
        line1: input.shippingAddress.line1,
        city: input.shippingAddress.city,
        postalCode: input.shippingAddress.postalCode,
        country: input.shippingAddress.country,
        phone: input.shippingAddress.phone || null,
      },
      is_cod: false,
    })
    .select("id, order_number")
    .single();

  if (orderError) throw orderError;

  const orderId = (order as { id: string; order_number: string }).id;

  const { error: orderItemsError } = await supabase.from("order_items").insert(
    orderLines.map((line) => ({
      order_id: orderId,
      variant_id: line.variantId,
      product_id: line.productId,
      sku: line.sku,
      product_name: line.productName,
      size_code: line.sizeCode,
      color_code: line.colorCode,
      unit_price: line.unitPrice,
      quantity: line.quantity,
      line_total: line.lineTotal,
    })),
  );
  if (orderItemsError) throw orderItemsError;

  const { error: paymentError } = await supabase.from("order_payments").insert({
    order_id: orderId,
    method: "card",
    status: "pending",
    provider: "tbd",
    amount: summary.grandTotalSek,
    currency: "SEK",
    metadata: { source: "checkout_pending_gateway" },
  });
  if (paymentError) throw paymentError;

  const { error: clearError } = await supabase.from("cart_items").delete().eq("cart_id", row.id);
  if (clearError) throw clearError;

  await supabase
    .from("carts")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", row.id);

  return {
    orderId,
    orderNumber: (order as { id: string; order_number: string }).order_number,
  };
}
