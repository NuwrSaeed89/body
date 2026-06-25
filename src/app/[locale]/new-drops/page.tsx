import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ProductSection } from "@/components/home/product-section";
import { PageContainer } from "@/components/ui/page-container";
import { NEW_DROPS } from "@/lib/home-data";

type NewDropsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function NewDropsPage({ params }: NewDropsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("newDrops");

  return (
    <>
      <SiteHeader />
      <main className="pb-24 pt-28 md:pt-32">
        <PageContainer className="mb-12 md:mb-16">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
            {t("eyebrow")}
          </p>
          <h1 className="max-w-3xl text-3xl font-medium tracking-tight text-primary md:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-secondary md:text-lg">
            {t("description")}
          </p>
        </PageContainer>

        <ProductSection
          id="new-drops-grid"
          titleKey="home.latestDrop.title"
          descriptionKey="home.latestDrop.description"
          products={NEW_DROPS}
          ctaLabelKey="home.latestDrop.cta"
          layout="bento"
        />
      </main>
      <SiteFooter />
    </>
  );
}
