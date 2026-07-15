import "server-only";

import { hasSupabaseConfig, publicEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendBackInStockEmail } from "@/lib/emails/send-back-in-stock";
import type { BackInStockLocale } from "@/lib/emails/back-in-stock-types";
import { asUuidOrNull } from "./waiting-list-service";

type NotifyOnRestockInput = {
  productId: string;
  /** Variants that transitioned 0 → >0. Empty/omitted = notify all pending for the product. */
  restockedVariantIds?: string[];
  locale?: string;
};

export type NotifyOnRestockResult = {
  emailed: number;
  skipped: number;
  errors: number;
};

type DbNotificationRow = {
  id: string;
  email: string;
  variant_id: string | null;
};

type DbProductRow = {
  id: string;
  slug: string;
  product_translations: { name: string; locale: string }[] | null;
  product_media: { public_url: string | null; is_primary: boolean | null }[] | null;
};

function resolveLocale(locale?: string): BackInStockLocale {
  if (locale === "sv" || locale === "es" || locale === "de" || locale === "en") {
    return locale;
  }
  return "en";
}

function pickProductName(
  translations: DbProductRow["product_translations"],
  locale: string,
  fallback: string,
): string {
  if (!translations?.length) return fallback;
  return (
    translations.find((row) => row.locale === locale)?.name ??
    translations.find((row) => row.locale === "en")?.name ??
    translations[0]?.name ??
    fallback
  );
}

function pickPrimaryImage(
  media: DbProductRow["product_media"],
): string | null {
  if (!media?.length) return null;
  const primary = media.find((row) => row.is_primary && row.public_url);
  return primary?.public_url ?? media.find((row) => row.public_url)?.public_url ?? null;
}

/**
 * Email waiting-list subscribers when a product/variant returns to stock (0 → >0).
 * Marks each successful send with notified_at so subscribers are not emailed twice.
 */
export async function notifyWaitingListOnRestock(
  input: NotifyOnRestockInput,
): Promise<NotifyOnRestockResult> {
  const result: NotifyOnRestockResult = { emailed: 0, skipped: 0, errors: 0 };

  if (!hasSupabaseConfig()) {
    return result;
  }

  const productId = asUuidOrNull(input.productId) ?? input.productId.trim();
  if (!productId) return result;

  const restockedVariantIds = (input.restockedVariantIds ?? [])
    .map((id) => asUuidOrNull(id) ?? id.trim())
    .filter(Boolean);
  const locale = resolveLocale(input.locale);
  const supabase = createSupabaseAdminClient();

  const { data: productRaw, error: productError } = await supabase
    .from("products")
    .select(
      `
      id,
      slug,
      product_translations ( name, locale ),
      product_media ( public_url, is_primary )
    `,
    )
    .eq("id", productId)
    .maybeSingle();

  if (productError) throw productError;
  if (!productRaw) return result;

  const product = productRaw as unknown as DbProductRow;
  const productName = pickProductName(product.product_translations, locale, product.slug);
  const imageUrl = pickPrimaryImage(product.product_media);
  const productUrl = `${publicEnv.appUrl}/${locale}/shop/${product.slug}`;

  const { data: pendingRaw, error: pendingError } = await supabase
    .from("stock_notifications")
    .select("id, email, variant_id")
    .eq("product_id", productId)
    .is("notified_at", null);

  if (pendingError) throw pendingError;

  const pending = ((pendingRaw ?? []) as DbNotificationRow[]).filter((row) => {
    if (restockedVariantIds.length === 0) return true;
    if (!row.variant_id) return true;
    return restockedVariantIds.includes(row.variant_id);
  });

  if (pending.length === 0) return result;

  const now = new Date().toISOString();

  for (const row of pending) {
    try {
      const sendResult = await sendBackInStockEmail({
        locale,
        customerEmail: String(row.email),
        productName,
        productUrl,
        imageUrl,
        variantLabel: null,
      });

      if (!sendResult.ok) {
        result.errors += 1;
        continue;
      }

      const { error: markError } = await supabase
        .from("stock_notifications")
        .update({ notified_at: now })
        .eq("id", row.id)
        .is("notified_at", null);

      if (markError) {
        console.error("[waiting-list] mark notified_at failed:", markError);
        result.errors += 1;
        continue;
      }

      result.emailed += 1;
    } catch (error) {
      console.error("[waiting-list] back-in-stock email failed:", error);
      result.errors += 1;
    }
  }

  return result;
}

/** Fire-and-forget wrapper so inventory writes are not blocked by email latency. */
export function scheduleWaitingListRestockNotify(input: NotifyOnRestockInput): void {
  void notifyWaitingListOnRestock(input).then(
    (summary) => {
      if (summary.emailed > 0 || summary.errors > 0) {
        console.info("[waiting-list] restock notify:", summary);
      }
    },
    (error) => {
      console.error("[waiting-list] restock notify failed:", error);
    },
  );
}

/** Detect variant IDs that transitioned from out-of-stock to in-stock. */
export function findRestockedVariantIds(
  previous: Array<{ id: string; stock_quantity: number }>,
  nextById: Map<string, number>,
): string[] {
  const previousById = new Map(
    previous.map((row) => [row.id, Number(row.stock_quantity ?? 0)]),
  );
  const restocked: string[] = [];

  for (const [id, nextStock] of nextById) {
    const prevStock = previousById.get(id) ?? 0;
    if (prevStock <= 0 && nextStock > 0) {
      restocked.push(id);
    }
  }

  return restocked;
}
