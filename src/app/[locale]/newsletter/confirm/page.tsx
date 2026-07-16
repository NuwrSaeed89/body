import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { NewsletterConfirmContent } from "@/components/newsletter/newsletter-confirm-content";

type NewsletterConfirmPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
};

export async function generateMetadata({
  params,
}: NewsletterConfirmPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "newsletter.confirm" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function NewsletterConfirmPage({
  params,
  searchParams,
}: NewsletterConfirmPageProps) {
  const { locale } = await params;
  const { token } = await searchParams;
  setRequestLocale(locale);

  return <NewsletterConfirmContent token={token} />;
}
