import { resolvePrimaryCategoryFromLinks } from "@/lib/admin/products/resolve-category";
import type { ProductStats } from "@/lib/product-stats";
import type { ShopCategory, ShopProduct, ProductDetail, ProductVariantOption } from "@/lib/shop-data";
import { CATALOG_IMAGE_PLACEHOLDER } from "./constants";

type DbMedia = {
  public_url: string;
  alt_text: string | null;
  is_primary: boolean;
  sort_order: number;
  kind: string;
};

type DbVariant = {
  id: string;
  sku: string;
  stock_quantity: number;
  is_active: boolean;
  sizes: { code: string } | { code: string }[] | null;
  colors:
    | {
        id: string;
        code: string;
        hex: string;
        color_translations: { locale: string; name: string }[];
      }
    | {
        id: string;
        code: string;
        hex: string;
        color_translations: { locale: string; name: string }[];
      }[]
    | null;
};

export type DbCatalogProduct = {
  id: string;
  slug: string;
  status: string;
  base_price: number;
  low_stock_threshold: number;
  is_latest_drop: boolean;
  is_premium: boolean;
  is_best_seller: boolean;
  is_temporarily_unavailable: boolean;
  view_count: number;
  like_count: number;
  waiting_count: number;
  units_sold: number;
  product_translations: {
    name: string;
    locale: string;
    description: string | null;
    series_label: string | null;
  }[];
  product_variants: DbVariant[];
  product_categories: {
    is_primary: boolean;
    categories: {
      id: string;
      slug: string;
      category_translations: { locale: string; name: string }[];
    } | {
      id: string;
      slug: string;
      category_translations: { locale: string; name: string }[];
    }[] | null;
  }[];
  product_media: DbMedia[];
};

function pickTranslation<T extends { locale: string }>(
  rows: T[],
  locale: string,
): T | undefined {
  return rows.find((row) => row.locale === locale) ?? rows.find((row) => row.locale === "en");
}

export function resolveCategorySlug(
  links: DbCatalogProduct["product_categories"],
  locale: string,
): ShopCategory {
  const { categorySlug } = resolvePrimaryCategoryFromLinks(links, locale);
  const valid: ShopCategory[] = [
    "leggings",
    "sports-bras",
    "tops",
    "shorts",
    "matching-sets",
    "accessories",
  ];
  if (categorySlug && valid.includes(categorySlug as ShopCategory)) {
    return categorySlug as ShopCategory;
  }
  return "leggings";
}

function sortedMedia(media: DbMedia[]): DbMedia[] {
  return [...media].sort((a, b) => {
    if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
    return a.sort_order - b.sort_order;
  });
}

export function pickSecondaryImageUrl(product: DbCatalogProduct): string | null {
  const media = sortedMedia(product.product_media ?? []);
  return media[1]?.public_url ?? null;
}

function totalActiveStock(variants: DbVariant[]): number {
  return variants
    .filter((variant) => variant.is_active)
    .reduce((sum, variant) => sum + Number(variant.stock_quantity ?? 0), 0);
}

function stockStatus(
  stock: number,
  threshold: number,
): Pick<ShopProduct, "stockStatus" | "stockLeft"> {
  if (stock <= 0) return { stockStatus: "out-of-stock", stockLeft: 0 };
  if (stock <= threshold) return { stockStatus: "low", stockLeft: stock };
  return {};
}

function resolveBadge(product: DbCatalogProduct): ShopProduct["badgeKey"] {
  if (product.is_latest_drop) return "new";
  if (product.is_best_seller) return "bestSeller";
  if (product.is_premium) return "limitedRelease";
  return undefined;
}

function toStats(product: DbCatalogProduct): ProductStats {
  return {
    viewCount: Number(product.view_count ?? 0),
    likeCount: Number(product.like_count ?? 0),
    waitingCount: Number(product.waiting_count ?? 0),
    unitsSold: Number(product.units_sold ?? 0),
  };
}

function unwrapOne<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function mapVariants(variants: DbVariant[], locale: string): ProductVariantOption[] {
  return variants
    .filter((variant) => variant.is_active)
    .map((variant) => {
      const size = unwrapOne(variant.sizes);
      const color = unwrapOne(variant.colors);
      const colorTranslation = color
        ? pickTranslation(color.color_translations, locale)
        : undefined;

      return {
        id: variant.id,
        sku: variant.sku,
        size: size?.code ?? "M",
        colorName: colorTranslation?.name ?? color?.code ?? "Default",
        colorHex: color?.hex ?? "#121212",
        stockQuantity: Number(variant.stock_quantity ?? 0),
        isActive: variant.is_active,
      };
    });
}

function uniqueColors(
  variants: DbVariant[],
  locale: string,
): Array<{ name: string; hex: string }> {
  const seen = new Set<string>();
  const colors: Array<{ name: string; hex: string }> = [];

  for (const variant of variants) {
    if (!variant.is_active) continue;
    const color = unwrapOne(variant.colors);
    if (!color || seen.has(color.id)) continue;
    seen.add(color.id);
    const translation = pickTranslation(color.color_translations, locale);
    colors.push({
      name: translation?.name ?? color.code,
      hex: color.hex,
    });
  }

  if (colors.length === 0) {
    colors.push({ name: "Charcoal Black", hex: "#121212" });
  }

  return colors;
}

function uniqueSizes(variants: DbVariant[]): string[] {
  const order = ["XS", "S", "M", "L", "XL", "XXL"];
  const codes = new Set<string>();

  for (const variant of variants) {
    if (!variant.is_active) continue;
    const size = unwrapOne(variant.sizes);
    if (size?.code) codes.add(size.code);
  }

  const sizes = Array.from(codes);
  sizes.sort((a, b) => order.indexOf(a) - order.indexOf(b));
  return sizes.length > 0 ? sizes : ["XS", "S", "M", "L"];
}

export function mapDbProductToShopProduct(
  product: DbCatalogProduct,
  locale: string,
): ShopProduct {
  const contentLocale = locale;
  const translation = pickTranslation(product.product_translations, contentLocale);
  const name = translation?.name ?? product.slug;
  const media = sortedMedia(product.product_media ?? []);
  const primary = media[0];
  const stock = totalActiveStock(product.product_variants ?? []);
  const threshold = Number(product.low_stock_threshold ?? 5);

  return {
    id: product.id,
    slug: product.slug,
    name,
    priceSek: Number(product.base_price),
    category: resolveCategorySlug(product.product_categories, contentLocale),
    badgeKey: resolveBadge(product),
    ...stockStatus(stock, threshold),
    image: primary?.public_url ?? CATALOG_IMAGE_PLACEHOLDER,
    imageAlt: primary?.alt_text ?? name,
  };
}

export function mapDbProductToDetail(
  product: DbCatalogProduct,
  locale: string,
): ProductDetail {
  const shop = mapDbProductToShopProduct(product, locale);
  const translation = pickTranslation(product.product_translations, locale);
  const media = sortedMedia(product.product_media ?? []);
  const images =
    media.length > 0
      ? media
          .filter((item) => item.kind === "image")
          .map((item) => ({
            src: item.public_url,
            alt: item.alt_text ?? shop.name,
          }))
      : [{ src: shop.image, alt: shop.imageAlt }];

  const model = media.find((item) => item.kind === "glb");
  const stock = totalActiveStock(product.product_variants ?? []);
  const variants = mapVariants(product.product_variants ?? [], locale);

  return {
    ...shop,
    series: translation?.series_label?.toUpperCase() ?? "MBODY",
    description:
      translation?.description ??
      `${shop.name} — premium performance activewear with sculpted fit and technical fabrics.`,
    stats: toStats(product),
    stockLeft: stock,
    stockStatus: stock <= 0 ? "out-of-stock" : shop.stockStatus,
    images,
    modelGlbUrl: model?.public_url,
    sizes: uniqueSizes(product.product_variants ?? []),
    colors: uniqueColors(product.product_variants ?? [], locale),
    variants,
    isTemporarilyUnavailable: product.is_temporarily_unavailable,
  };
}
