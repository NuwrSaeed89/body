import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { LegalPageShell } from "@/components/legal/legal-page-shell";

type PrivacyPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PrivacyPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.privacy" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <LegalPageShell page="privacy" />;
}
