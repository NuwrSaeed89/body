import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SizeGuidePageContent } from "@/components/size-guide/size-guide-page-content";
import { PageContainer } from "@/components/ui/page-container";

type SizeGuidePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: SizeGuidePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "sizeGuide" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function SizeGuidePage({ params }: SizeGuidePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <SiteHeader />
      <PageContainer as="main" className="pb-40 pt-28 md:pb-24 md:pt-32">
        <SizeGuidePageContent />
      </PageContainer>
      <SiteFooter />
    </>
  );
}
