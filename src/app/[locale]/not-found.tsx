import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { NotFoundPage } from "@/components/errors/not-found-page";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("notFound");

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: { index: false, follow: false },
  };
}

export default function LocaleNotFound() {
  return <NotFoundPage />;
}
