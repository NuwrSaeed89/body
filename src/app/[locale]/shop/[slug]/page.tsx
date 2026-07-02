import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ProductGallery } from "@/components/pdp/product-gallery";
import { ProductPurchasePanel } from "@/components/pdp/product-purchase-panel";
import { PageContainer } from "@/components/ui/page-container";
import { Link } from "@/i18n/navigation";
import {
  getStorefrontProductBySlug,
  getStorefrontProductSlugs,
} from "@/lib/catalog/get-storefront-catalog";
import { getProductRatingState } from "@/lib/product-ratings/get-product-rating-state";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getStorefrontProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getStorefrontProductBySlug(slug, locale);

  if (!product) {
    return { title: "Product not found | Mbody" };
  }

  const description =
    product.description.length > 160
      ? `${product.description.slice(0, 157)}…`
      : product.description;

  return {
    title: `${product.name} | Mbody`,
    description,
    openGraph: {
      title: product.name,
      description,
      images: product.images[0]?.src ? [{ url: product.images[0].src }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const product = await getStorefrontProductBySlug(slug, locale);
  if (!product) notFound();

  const t = await getTranslations("pdp");
  const ratingState = await getProductRatingState(slug, undefined, product.id);
  const initialRatingSummary = ratingState?.summary;

  return (
    <>
      <SiteHeader />
      <PageContainer as="main" className="pb-40 pt-28 md:pb-24 md:pt-32">
        <nav className="mb-6 hidden items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant md:flex">
          <Link href="/" className="hover:text-primary">
            {t("breadcrumb.home")}
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <Link href="/shop" className="hover:text-primary">
            {t("breadcrumb.shop")}
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-primary">{product.name}</span>
        </nav>

        <div className="grid gap-8 md:grid-cols-2 md:gap-12 lg:gap-16">
          <ProductGallery product={product} />
          <ProductPurchasePanel
            product={product}
            initialRatingSummary={initialRatingSummary}
          />
        </div>
      </PageContainer>
      <SiteFooter />
    </>
  );
}
