import "server-only";

import type { DropProduct, LookItem, Product } from "@/lib/home-data";
import {
  BOUTIQUE_FAVORITES,
  COMPLETE_THE_LOOK,
  LATEST_DROP_PRODUCTS,
  NEW_DROPS,
  SCULPT_COLLECTION,
} from "@/lib/home-data";
import type { ProductDetail, ShopProduct } from "@/lib/shop-data";
import {
  getAllProductSlugs,
  getProductBySlug as getMockProductBySlug,
  getShopProductById as getMockShopProductById,
  PRODUCT_DETAILS,
  SHOP_PRODUCTS,
} from "@/lib/shop-data";
import {
  fetchActiveCatalogProducts,
  fetchActiveProductSlugs,
  fetchProductDetailBySlug,
  fetchProductRowsByCollectionSlug,
  fetchProductRowsByFlag,
  fetchProductsByCollectionSlug,
  fetchProductsByFlag,
} from "./fetch-from-supabase";
import { pickSecondaryImageUrl, mapDbProductToShopProduct, type DbCatalogProduct } from "./map-catalog-product";
import { resolveCatalogLocale } from "./constants";
import { shouldUseStorefrontMock } from "./should-use-storefront-mock";

export type SculptCollectionData = {
  image: string;
  imageAlt: string;
  fabricImage: string;
  fabricImageAlt: string;
  href: `/shop` | `/shop/${string}`;
};

export type CompleteTheLookData = {
  image: string;
  imageAlt: string;
  bundlePriceSek: number;
  items: LookItem[];
};

export type PremiumEditorialColumn = {
  product: {
    id: string;
    name: string;
    color: string;
    priceSek: number;
    aspectRatio: "3/4" | "4/5";
    image: string;
    imageAlt: string;
    href: `/shop` | `/shop/${string}`;
  };
  tile: {
    aspectRatio: "square" | "16/9";
    image: string;
    imageAlt: string;
    labelKey?: "fabricLabel";
  };
};

function shopToDropProduct(product: ShopProduct, color = ""): DropProduct {
  return {
    id: product.slug,
    name: product.name,
    color,
    priceSek: product.priceSek,
    badgeKey: product.badgeKey === "limitedRelease" ? "limited" : undefined,
    image: product.image,
    imageAlt: product.imageAlt,
    href: `/shop/${product.slug}`,
  };
}

function shopToHomeProduct(product: ShopProduct, index: number): Product {
  return {
    id: product.slug,
    series: `0${index + 1} / MBODY`,
    name: product.name.toUpperCase(),
    priceSek: product.priceSek,
    badgeKey:
      product.badgeKey === "new"
        ? "limitedRelease"
        : product.badgeKey === "bestSeller"
          ? "bestSeller"
          : product.badgeKey === "limitedRelease"
            ? "exclusive"
            : undefined,
    colSpan: index === 0 ? "feature" : "default",
    image: product.image,
    imageAlt: product.imageAlt,
    href: `/shop/${product.slug}`,
  };
}

export async function getStorefrontProducts(locale: string): Promise<ShopProduct[]> {
  if (shouldUseStorefrontMock()) return SHOP_PRODUCTS;
  try {
    const products = await fetchActiveCatalogProducts(locale);
    return products.length > 0 ? products : SHOP_PRODUCTS;
  } catch (error) {
    console.error("[catalog] shop products fetch failed, using mock:", error);
    return SHOP_PRODUCTS;
  }
}

export async function getStorefrontProductBySlug(
  slug: string,
  locale: string,
): Promise<ProductDetail | undefined> {
  if (shouldUseStorefrontMock()) return getMockProductBySlug(slug);
  try {
    return (await fetchProductDetailBySlug(slug, locale)) ?? undefined;
  } catch (error) {
    console.error(`[catalog] product "${slug}" fetch failed:`, error);
    return undefined;
  }
}

export async function getStorefrontProductSlugs(): Promise<string[]> {
  if (shouldUseStorefrontMock()) return getAllProductSlugs();
  try {
    const slugs = await fetchActiveProductSlugs();
    return slugs.length > 0 ? slugs : getAllProductSlugs();
  } catch (error) {
    console.error("[catalog] slug list fetch failed, using mock:", error);
    return getAllProductSlugs();
  }
}

export async function getStorefrontShopProductById(
  id: string,
  locale: string,
): Promise<ShopProduct | undefined> {
  if (shouldUseStorefrontMock()) return getMockShopProductById(id);
  try {
    const products = await fetchActiveCatalogProducts(locale);
    return products.find((product) => product.id === id || product.slug === id);
  } catch (error) {
    console.error(`[catalog] product id "${id}" fetch failed:`, error);
    return getMockShopProductById(id);
  }
}

export async function getStorefrontLatestDrops(
  locale: string,
  limit = 4,
): Promise<DropProduct[]> {
  if (shouldUseStorefrontMock()) return LATEST_DROP_PRODUCTS.slice(0, limit);
  try {
    let products = await fetchProductsByCollectionSlug(locale, "aero-series", limit);
    if (products.length === 0) {
      products = await fetchProductsByFlag(locale, "is_latest_drop", limit);
    }
    if (products.length === 0) return LATEST_DROP_PRODUCTS.slice(0, limit);
    return products.map((product) => shopToDropProduct(product));
  } catch (error) {
    console.error("[catalog] latest drops fetch failed:", error);
    return LATEST_DROP_PRODUCTS.slice(0, limit);
  }
}

export async function getStorefrontBestSellers(
  locale: string,
  limit = 4,
): Promise<DropProduct[]> {
  if (shouldUseStorefrontMock()) return BOUTIQUE_FAVORITES.slice(0, limit);
  try {
    let products = await fetchProductsByCollectionSlug(locale, "boutique-favorites", limit);
    if (products.length === 0) {
      products = await fetchProductsByFlag(locale, "is_best_seller", limit);
    }
    if (products.length === 0) return BOUTIQUE_FAVORITES.slice(0, limit);
    return products.map((product) => shopToDropProduct(product));
  } catch (error) {
    console.error("[catalog] best sellers fetch failed:", error);
    return BOUTIQUE_FAVORITES.slice(0, limit);
  }
}

export async function getStorefrontPremiumProducts(
  locale: string,
  limit = 4,
): Promise<ShopProduct[]> {
  if (shouldUseStorefrontMock()) {
    return SHOP_PRODUCTS.filter((product) => product.badgeKey === "limitedRelease").slice(
      0,
      limit,
    );
  }
  try {
    let products = await fetchProductsByCollectionSlug(locale, "premium-collection", limit);
    if (products.length === 0) {
      products = await fetchProductsByFlag(locale, "is_premium", limit);
    }
    return products.length > 0 ? products : SHOP_PRODUCTS.slice(0, limit);
  } catch (error) {
    console.error("[catalog] premium products fetch failed:", error);
    return SHOP_PRODUCTS.slice(0, limit);
  }
}

export async function getStorefrontPremiumEditorial(
  locale: string,
): Promise<PremiumEditorialColumn[]> {
  const { PREMIUM_COLLECTION_EDITORIAL } = await import("@/lib/home-data");

  if (shouldUseStorefrontMock()) {
    return PREMIUM_COLLECTION_EDITORIAL.columns.map((column) => ({
      product: {
        id: column.product.id,
        name: column.product.name,
        color: column.product.color,
        priceSek: column.product.priceSek,
        aspectRatio: column.product.aspectRatio,
        image: column.product.image,
        imageAlt: column.product.imageAlt,
        href: column.product.href ?? "/shop",
      },
      tile: column.tile,
    }));
  }

  try {
    const rows = await fetchProductRowsByCollectionSlug(locale, "premium-collection", 2);
    if (rows.length < 2) {
      const flagRows = await fetchProductRowsByFlag(locale, "is_premium", 2);
      if (flagRows.length >= 2) {
        return buildPremiumEditorialColumns(flagRows, locale);
      }
      return PREMIUM_COLLECTION_EDITORIAL.columns.map((column) => ({
        product: {
          id: column.product.id,
          name: column.product.name,
          color: column.product.color,
          priceSek: column.product.priceSek,
          aspectRatio: column.product.aspectRatio,
          image: column.product.image,
          imageAlt: column.product.imageAlt,
          href: column.product.href ?? "/shop",
        },
        tile: column.tile,
      }));
    }
    return buildPremiumEditorialColumns(rows, locale);
  } catch (error) {
    console.error("[catalog] premium editorial fetch failed:", error);
    return PREMIUM_COLLECTION_EDITORIAL.columns.map((column) => ({
      product: {
        id: column.product.id,
        name: column.product.name,
        color: column.product.color,
        priceSek: column.product.priceSek,
        aspectRatio: column.product.aspectRatio,
        image: column.product.image,
        imageAlt: column.product.imageAlt,
        href: column.product.href ?? "/shop",
      },
      tile: column.tile,
    }));
  }
}

function buildPremiumEditorialColumns(
  rows: DbCatalogProduct[],
  locale: string,
): PremiumEditorialColumn[] {
  const contentLocale = resolveCatalogLocale(locale);
  return rows.slice(0, 2).map((row, index) => {
    const shop = mapDbProductToShopProduct(row, contentLocale);
    const secondaryImage = pickSecondaryImageUrl(row);
    return {
      product: {
        id: shop.slug,
        name: shop.name,
        color: "",
        priceSek: shop.priceSek,
        aspectRatio: index === 0 ? "3/4" : "4/5",
        image: shop.image,
        imageAlt: shop.imageAlt,
        href: `/shop/${shop.slug}` as `/shop/${string}`,
      },
      tile: {
        aspectRatio: index === 0 ? "square" : "16/9",
        image: secondaryImage ?? shop.image,
        imageAlt: shop.imageAlt,
        labelKey: index === 0 ? "fabricLabel" : undefined,
      },
    };
  });
}

function rowPreview(row: DbCatalogProduct, locale: string) {
  const shop = mapDbProductToShopProduct(row, resolveCatalogLocale(locale));
  return {
    slug: shop.slug,
    name: shop.name,
    priceSek: shop.priceSek,
    image: shop.image,
    imageAlt: shop.imageAlt,
  };
}

export async function getStorefrontSculptCollection(locale: string): Promise<SculptCollectionData> {
  if (shouldUseStorefrontMock()) return SCULPT_COLLECTION as SculptCollectionData;

  try {
    const rows = await fetchProductRowsByCollectionSlug(locale, "sculpt-collection", 2);
    if (rows.length === 0) return SCULPT_COLLECTION as SculptCollectionData;

    const featured = rowPreview(rows[0], locale);
    const secondary = rows[1] ? rowPreview(rows[1], locale) : featured;
    const fabricImage = pickSecondaryImageUrl(rows[0]) ?? secondary.image;

    return {
      image: featured.image,
      imageAlt: featured.imageAlt,
      fabricImage,
      fabricImageAlt: secondary.imageAlt,
      href: `/shop/${featured.slug}` as `/shop/${string}`,
    };
  } catch (error) {
    console.error("[catalog] sculpt collection fetch failed:", error);
    return SCULPT_COLLECTION as SculptCollectionData;
  }
}

export async function getStorefrontCompleteTheLook(locale: string): Promise<CompleteTheLookData> {
  if (shouldUseStorefrontMock()) return COMPLETE_THE_LOOK;

  try {
    const hero = await fetchProductDetailBySlug("power-set", locale);
    const products = await fetchProductsByCollectionSlug(locale, "sculpt-collection", 3);

    if (!hero || products.length === 0) return COMPLETE_THE_LOOK;

    const items: LookItem[] = products.map((product) => ({
      id: product.slug,
      name: product.name,
      priceSek: product.priceSek,
      image: product.image,
      imageAlt: product.imageAlt,
      href: `/shop/${product.slug}`,
    }));

    return {
      image: hero.images[0]?.src ?? hero.image,
      imageAlt: hero.name,
      bundlePriceSek: items.reduce((sum, item) => sum + item.priceSek, 0),
      items,
    };
  } catch (error) {
    console.error("[catalog] complete the look fetch failed:", error);
    return COMPLETE_THE_LOOK;
  }
}

export async function getStorefrontNewDropsGrid(locale: string): Promise<Product[]> {
  if (shouldUseStorefrontMock()) return NEW_DROPS;
  try {
    let products = await fetchProductsByCollectionSlug(locale, "aero-series");
    if (products.length === 0) {
      products = await fetchProductsByFlag(locale, "is_latest_drop");
    }
    if (products.length === 0) return NEW_DROPS;
    return products.slice(0, 4).map((product, index) => shopToHomeProduct(product, index));
  } catch (error) {
    console.error("[catalog] new drops grid fetch failed:", error);
    return NEW_DROPS;
  }
}

/** Sync lookup for legacy API routes — mock catalog only. */
export function getLegacyMockProductBySlug(slug: string): ProductDetail | undefined {
  if (PRODUCT_DETAILS[slug]) return PRODUCT_DETAILS[slug];
  return getMockProductBySlug(slug);
}
