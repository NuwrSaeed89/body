import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ShopPageContent } from "@/components/shop/shop-page-content";
import { PageContainer } from "@/components/ui/page-container";
import { Link } from "@/i18n/navigation";
import { SHOP_PRODUCTS } from "@/lib/shop-data";

type ShopPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ShopPage({ params }: ShopPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("shop");

  return (
    <>
      <SiteHeader />
      <PageContainer as="main" className="pb-24 pt-28 md:pt-32">
        <nav className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
          <Link href="/" className="hover:text-primary">
            {t("breadcrumb.home")}
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-primary">{t("breadcrumb.shop")}</span>
        </nav>
        <ShopPageContent products={SHOP_PRODUCTS} />
      </PageContainer>
      <SiteFooter />
    </>
  );
}
