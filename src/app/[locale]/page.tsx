import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { ComingSoonPage } from "@/components/coming-soon/coming-soon-page";
import { HomePageClientShell } from "@/components/home/home-page-client-shell";
import { HomePageContentWithFallback } from "@/components/home/home-page-content";
import { isComingSoonActive } from "@/lib/launch-config";
import { buildPageMetadata } from "@/lib/seo";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale } = await params;

  if (isComingSoonActive()) {
    const t = await getTranslations({ locale, namespace: "launch" });
    return buildPageMetadata({
      locale,
      path: "",
      title: `Mbody | ${t("title")}`,
      description: t("description"),
    });
  }

  const t = await getTranslations({ locale, namespace: "metadata" });
  return buildPageMetadata({
    locale,
    path: "",
    title: t("title"),
    description: t("description"),
  });
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  if (isComingSoonActive()) {
    return <ComingSoonPage />;
  }

  return (
    <HomePageClientShell>
      <HomePageContentWithFallback />
    </HomePageClientShell>
  );
}
