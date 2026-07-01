import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ProductGallery } from "@/components/pdp/product-gallery";
import {
  ProductPurchasePanel,
  ProductStickyBar,
} from "@/components/pdp/product-purchase-panel";
import { PageContainer } from "@/components/ui/page-container";
import { Link } from "@/i18n/navigation";
import { getProductRatingState } from "@/lib/product-ratings/get-product-rating-state";
import { getAllProductSlugs, getProductBySlug } from "@/lib/shop-data";

type ProductPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return getAllProductSlugs().map((slug) => ({ slug }));
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const t = await getTranslations("pdp");
  const ratingState = getProductRatingState(slug);
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
      <ProductStickyBar product={product} />
      <SiteFooter />
    </>
  );
}
