import { permanentRedirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

type LaunchPageProps = {
  params: Promise<{ locale: string }>;
};

/** Legacy route — homepage is the coming-soon / launch landing. */
export default async function LaunchPage({ params }: LaunchPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  permanentRedirect(`/${locale}`);
}
