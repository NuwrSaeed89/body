import type { ProductDetail } from "@/lib/shop-data";
import type { ProductRatingSummary } from "@/lib/product-ratings/types";
import { absoluteUrl } from "@/lib/seo/paths";

type ProductJsonLdInput = {
  product: ProductDetail;
  locale: string;
  ratingSummary?: ProductRatingSummary | null;
};

function schemaAvailability(product: ProductDetail): string {
  if (
    product.isTemporarilyUnavailable ||
    product.stockStatus === "out-of-stock" ||
    product.stockLeft <= 0
  ) {
    return "https://schema.org/OutOfStock";
  }
  return "https://schema.org/InStock";
}

/**
 * schema.org Product JSON-LD for PDP rich results.
 */
export function buildProductJsonLd(input: ProductJsonLdInput): Record<string, unknown> {
  const { product, locale, ratingSummary } = input;
  const url = absoluteUrl(locale, `/shop/${product.slug}`);
  const images = product.images.map((image) => image.src).filter(Boolean);
  const sku =
    product.variants.find((variant) => variant.isActive)?.sku ??
    product.variants[0]?.sku ??
    product.slug;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: images.length > 0 ? images : undefined,
    sku,
    brand: {
      "@type": "Brand",
      name: "Mbody",
    },
    category: product.category,
    url,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "SEK",
      price: product.priceSek.toFixed(2),
      availability: schemaAvailability(product),
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: "Mbody",
      },
    },
  };

  if (ratingSummary && ratingSummary.count > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(ratingSummary.average.toFixed(1)),
      reviewCount: ratingSummary.count,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return jsonLd;
}
