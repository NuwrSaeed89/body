import "server-only";

import {
  calculateCartSummary,
  formatPriceFromSek,
  extractVatFromInclusive,
} from "@/lib/currency";
import { sendOrderConfirmationEmail } from "@/lib/emails/send-order-confirmation";
import type {
  OrderConfirmationEmailData,
  OrderConfirmationLocale,
} from "@/lib/emails/order-confirmation-types";
import { publicEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type PlaceCodOrderInput = {
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

function toEmailLocale(locale: string): OrderConfirmationLocale {
  if (locale === "sv" || locale === "es" || locale === "de") return locale;
  return "en";
}

export async function placeCodOrder(input: PlaceCodOrderInput): Promise<{
  orderId: string;
  orderNumber: string;
  status: "cod_pending";
  emailSent: boolean;
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

  const contentLocale = toEmailLocale(input.locale);
  const displayLocale = contentLocale === "sv" ? "sv-SE" : "en-US";

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
      cartItemId: item.id,
      variantId: variant.id,
      productId: product.id,
      sku: variant.sku,
      productName: translation?.name ?? product.slug,
      sizeCode: size?.code ?? "ONE",
      colorCode: color?.code ?? "DEFAULT",
      quantity,
      unitPrice,
      lineTotal: unitPrice * quantity,
      currentStock: Number(variant.stock_quantity),
    };
  });

  const subtotal = orderLines.reduce((sum, line) => sum + line.lineTotal, 0);
  const summary = calculateCartSummary(subtotal, "SEK", displayLocale);
  const vatSek = extractVatFromInclusive(subtotal + summary.shippingSek);

  const orderNumber = generateOrderNumber();
  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", input.userId)
    .maybeSingle();

  const profileRow = profile as { email?: string; full_name?: string | null } | null;
  let customerEmail = profileRow?.email?.trim() || "";
  if (!customerEmail) {
    try {
      const { data } = await supabase.auth.admin.getUserById(input.userId);
      customerEmail = data.user?.email?.trim() ?? "";
    } catch {
      customerEmail = "";
    }
  }
  const customerName =
    profileRow?.full_name?.trim() ||
    input.shippingAddress.fullName.trim() ||
    "Customer";

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      user_id: input.userId,
      status: "cod_pending",
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
      is_cod: true,
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
    method: "cod",
    status: "pending",
    provider: "cash_on_delivery",
    amount: summary.grandTotalSek,
    currency: "SEK",
    metadata: { source: "checkout_cod" },
  });
  if (paymentError) throw paymentError;

  for (const line of orderLines) {
    const nextStock = line.currentStock - line.quantity;
    const { error: stockError } = await supabase
      .from("product_variants")
      .update({ stock_quantity: nextStock })
      .eq("id", line.variantId);
    if (stockError) throw stockError;
  }

  const { error: clearError } = await supabase.from("cart_items").delete().eq("cart_id", row.id);
  if (clearError) throw clearError;

  await supabase
    .from("carts")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", row.id);

  const emailData: OrderConfirmationEmailData = {
    locale: contentLocale,
    orderNumber: (order as { id: string; order_number: string }).order_number,
    orderDate: new Intl.DateTimeFormat(contentLocale, {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date()),
    customerEmail,
    customerName,
    paymentMethod: "cod",
    shippingMethod:
      contentLocale === "sv"
        ? "Standardfrakt · Betala vid leverans"
        : contentLocale === "es"
          ? "Envío estándar · Pago a la entrega"
          : contentLocale === "de"
            ? "Standardversand · Zahlung bei Lieferung"
            : "Standard Shipping · Pay on delivery",
    shippingAddress: {
      name: input.shippingAddress.fullName,
      line1: input.shippingAddress.line1,
      city: input.shippingAddress.city,
      postalCode: input.shippingAddress.postalCode,
      country: input.shippingAddress.country,
    },
    items: orderLines.map((line) => ({
      name: line.productName,
      size: line.sizeCode,
      color: line.colorCode !== "DEFAULT" ? line.colorCode : undefined,
      quantity: line.quantity,
      lineTotalFormatted: formatPriceFromSek(line.lineTotal, "SEK", contentLocale),
    })),
    subtotalFormatted: summary.subtotal,
    shippingFormatted: summary.freeShipping ? "Free" : summary.shipping,
    vatFormatted: formatPriceFromSek(vatSek, "SEK", contentLocale),
    totalFormatted: summary.grandTotal,
    accountOrderUrl: `${publicEnv.appUrl}/${contentLocale}/account/orders`,
  };

  let emailSent = false;
  try {
    const emailResult = await sendOrderConfirmationEmail(emailData);
    emailSent = emailResult.ok;
    if (!emailResult.ok) {
      console.warn("[checkout] COD confirmation email failed:", emailResult.error);
    }
  } catch (error) {
    console.error("[checkout] COD confirmation email threw:", error);
  }

  return {
    orderId,
    orderNumber: (order as { id: string; order_number: string }).order_number,
    status: "cod_pending",
    emailSent,
  };
}
