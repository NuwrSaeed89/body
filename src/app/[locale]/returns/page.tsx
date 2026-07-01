import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { LegalPageShell } from "@/components/legal/legal-page-shell";

type ReturnsPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: ReturnsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.returns" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function ReturnsPage({ params }: ReturnsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <LegalPageShell page="returns" />;
}
