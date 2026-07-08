import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { PageContainer } from "@/components/ui/page-container";
import { WishlistPageContent } from "@/components/wishlist/wishlist-page-content";
import { getStorefrontProducts } from "@/lib/catalog/get-storefront-catalog";
import { requireUser } from "@/lib/auth/require-user";

type WishlistPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: WishlistPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "wishlist" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function WishlistPage({ params }: WishlistPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireUser(locale, `/${locale}/account/wishlist`);
  const t = await getTranslations("wishlist");
  const catalog = await getStorefrontProducts(locale);

  return (
    <>
      <div className="hidden md:block">
        <SiteHeader />
      </div>
      <PageContainer as="main" className="-mx-5 pb-24 pt-0 md:mx-0 md:pt-32">
        <h1 className="mb-8 hidden text-2xl font-medium text-primary md:block md:text-4xl">
          {t("title")}
        </h1>
        <WishlistPageContent catalog={catalog} />
      </PageContainer>
      <div className="hidden md:block">
        <SiteFooter />
      </div>
    </>
  );
}
