import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { LegalPageShell } from "@/components/legal/legal-page-shell";

type TermsPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: TermsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.terms" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function TermsPage({ params }: TermsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <LegalPageShell page="terms" />;
}
