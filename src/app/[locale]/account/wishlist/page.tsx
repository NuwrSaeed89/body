import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { AccountMobileHeader } from "@/components/account/account-mobile-header";
import { WishlistPageContent } from "@/components/wishlist/wishlist-page-content";
import { getAccountProfile } from "@/lib/account/get-account-profile";
import { getStorefrontProducts } from "@/lib/catalog/get-storefront-catalog";
import { requireUser } from "@/lib/auth/require-user";

type WishlistPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: WishlistPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "wishlist" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function WishlistPage({ params }: WishlistPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireUser(locale, `/${locale}/account/wishlist`);
  const [catalog, profile] = await Promise.all([
    getStorefrontProducts(locale),
    getAccountProfile(),
  ]);

  return (
    <>
      <AccountMobileHeader />
      <main id="main-content" tabIndex={-1} className="bg-surface text-on-surface">
        <div className="mx-auto max-w-[1440px] overflow-x-hidden px-5 pb-[calc(var(--mobile-nav-height,72px)+env(safe-area-inset-bottom)+2rem)] pt-0 md:px-16 md:pt-12">
          <WishlistPageContent catalog={catalog} profile={profile} />
        </div>
      </main>
    </>
  );
}
