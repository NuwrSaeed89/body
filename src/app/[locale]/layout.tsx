import type { Metadata } from "next";
import { cookies } from "next/headers";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { LocaleHtmlAttributes } from "@/components/i18n/locale-html-attributes";
import { CURRENCY_COOKIE, parseCurrency } from "@/lib/currency";
import { CurrencyProvider } from "@/providers/currency-provider";
import { CookieConsentProvider } from "@/providers/cookie-consent-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { CartProvider } from "@/providers/cart-provider";
import { WishlistProvider } from "@/providers/wishlist-provider";
import { SkipLink } from "@/components/a11y/skip-link";
import { MobileLayoutShell } from "@/components/layout/mobile-layout-shell";
import { routing } from "@/i18n/routing";
import { publicEnv } from "@/lib/env";
import { languageAlternates, openGraphLocale } from "@/lib/seo";

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    metadataBase: new URL(publicEnv.appUrl),
    title: {
      default: t("title"),
      template: "%s | Mbody",
    },
    description: t("description"),
    applicationName: "Mbody",
    authors: [{ name: "Mbody" }],
    creator: "Mbody",
    publisher: "Mbody",
    alternates: {
      languages: languageAlternates(""),
    },
    openGraph: {
      type: "website",
      locale: openGraphLocale(locale),
      siteName: "Mbody",
      title: t("title"),
      description: t("description"),
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const cookieStore = await cookies();
  const initialCurrency = parseCurrency(cookieStore.get(CURRENCY_COOKIE)?.value);

  return (
    <NextIntlClientProvider messages={messages}>
      <LocaleHtmlAttributes />
      <CurrencyProvider initialCurrency={initialCurrency}>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <CookieConsentProvider>
                <SkipLink />
                <MobileLayoutShell>{children}</MobileLayoutShell>
              </CookieConsentProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </CurrencyProvider>
    </NextIntlClientProvider>
  );
}
