import { shouldUseAdminMock } from "@/lib/admin/should-use-mock";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { listMockStockNotifications } from "@/lib/waiting-list/mock-store";
import { getProductBySlug } from "@/lib/shop-data";
import { mapWaitingListRow } from "./format";
import type { AdminWaitingListData, AdminWaitingListRow } from "./types";

type DbTranslation = { name: string; locale: string };

type DbWaitingRow = {
  id: string;
  email: string;
  product_id: string;
  variant_id: string | null;
  user_id: string | null;
  notified_at: string | null;
  created_at: string;
  products: {
    id: string;
    slug: string;
    product_translations: DbTranslation[] | null;
  } | null;
  product_variants: {
    id: string;
    sizes: { code: string } | null;
    colors: {
      code: string;
      color_translations: DbTranslation[] | null;
    } | null;
  } | null;
};

function pickTranslatedName(
  translations: DbTranslation[] | null | undefined,
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

function summarize(rows: AdminWaitingListRow[]): Pick<
  AdminWaitingListData,
  "totalCount" | "waitingCount" | "notifiedCount"
> {
  return {
    totalCount: rows.length,
    waitingCount: rows.filter((row) => row.status === "waiting").length,
    notifiedCount: rows.filter((row) => row.status === "notified").length,
  };
}

const MOCK_SEED: AdminWaitingListRow[] = [
  mapWaitingListRow({
    id: "wl-mock-1",
    email: "sara@example.com",
    productId: "terra-ribbed-shorts",
    productSlug: "terra-ribbed-shorts",
    productName: "Terra Ribbed Shorts",
    variantId: null,
    size: "M",
    color: "Sage",
    userId: null,
    notifiedAt: null,
    createdAt: "2026-07-10T09:15:00.000Z",
    locale: "en",
  }),
  mapWaitingListRow({
    id: "wl-mock-2",
    email: "alex@example.com",
    productId: "aero-shell-jacket",
    productSlug: "aero-shell-jacket",
    productName: "Aero Shell Jacket",
    variantId: null,
    size: "XL",
    color: "Eclipse",
    userId: null,
    notifiedAt: null,
    createdAt: "2026-07-11T14:40:00.000Z",
    locale: "en",
  }),
  mapWaitingListRow({
    id: "wl-mock-3",
    email: "nina@example.com",
    productId: "terra-ribbed-shorts",
    productSlug: "terra-ribbed-shorts",
    productName: "Terra Ribbed Shorts",
    variantId: null,
    size: "S",
    color: "Sage",
    userId: null,
    notifiedAt: "2026-07-12T08:00:00.000Z",
    createdAt: "2026-07-01T11:00:00.000Z",
    locale: "en",
  }),
];

function getMockWaitingList(locale: string): AdminWaitingListData {
  const liveMock = listMockStockNotifications().map((record) => {
    const product = getProductBySlug(record.slug);
    return mapWaitingListRow({
      id: record.id,
      email: record.email,
      productId: record.productId,
      productSlug: record.slug,
      productName: product?.name ?? record.slug,
      variantId: record.variantId,
      size: record.size,
      color: record.color,
      userId: record.userId,
      notifiedAt: null,
      createdAt: record.createdAt,
      locale,
    });
  });

  // Prefer session mock subscriptions; keep seed for empty demos.
  const rows =
    liveMock.length > 0
      ? liveMock
      : MOCK_SEED.map((row) =>
          mapWaitingListRow({
            id: row.id,
            email: row.email,
            productId: row.productId,
            productSlug: row.productSlug,
            productName: row.productName,
            variantId: row.variantId,
            size: row.size,
            color: row.color,
            userId: row.userId,
            notifiedAt: row.notifiedAt,
            createdAt: row.createdAt,
            locale,
          }),
        );

  return {
    source: "mock",
    rows,
    ...summarize(rows),
  };
}

async function fetchWaitingList(locale: string): Promise<AdminWaitingListData> {
  const contentLocale = ["en", "sv", "es", "de"].includes(locale) ? locale : "en";
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("stock_notifications")
    .select(
      `
      id,
      email,
      product_id,
      variant_id,
      user_id,
      notified_at,
      created_at,
      products (
        id,
        slug,
        product_translations ( name, locale )
      ),
      product_variants (
        id,
        sizes ( code ),
        colors (
          code,
          color_translations ( name, locale )
        )
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  const rows = ((data ?? []) as unknown as DbWaitingRow[]).map((row) => {
    const slug = row.products?.slug ?? row.product_id;
    const productName = pickTranslatedName(
      row.products?.product_translations,
      contentLocale,
      slug,
    );
    const size = row.product_variants?.sizes?.code ?? null;
    const color = pickTranslatedName(
      row.product_variants?.colors?.color_translations,
      contentLocale,
      row.product_variants?.colors?.code ?? "",
    );

    return mapWaitingListRow({
      id: row.id,
      email: String(row.email),
      productId: row.product_id,
      productSlug: slug,
      productName,
      variantId: row.variant_id,
      size,
      color: color || null,
      userId: row.user_id,
      notifiedAt: row.notified_at,
      createdAt: row.created_at,
      locale: contentLocale,
    });
  });

  return {
    source: "supabase",
    rows,
    ...summarize(rows),
  };
}

export async function getAdminWaitingListData(locale: string): Promise<AdminWaitingListData> {
  if (shouldUseAdminMock()) {
    return getMockWaitingList(locale);
  }

  try {
    return await fetchWaitingList(locale);
  } catch (error) {
    console.error("[admin] waiting list fetch failed:", error);
    return getMockWaitingList(locale);
  }
}
