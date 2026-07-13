import { setRequestLocale } from "next-intl/server";
import { AccountAddressesPageContent } from "@/components/account/account-addresses-page-content";
import { AccountMobileHeader } from "@/components/account/account-mobile-header";
import { getAccountProfile } from "@/lib/account/get-account-profile";
import { requireUser } from "@/lib/auth/require-user";

type AccountAddressesPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AccountAddressesPage({ params }: AccountAddressesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireUser(locale, `/${locale}/account/addresses`);

  const profile = await getAccountProfile();

  return (
    <>
      <AccountMobileHeader />
      <main id="main-content" tabIndex={-1} className="bg-surface text-on-surface">
        <div className="mx-auto max-w-[600px] overflow-x-hidden px-5 pb-[calc(var(--mobile-nav-height,72px)+env(safe-area-inset-bottom)+2rem)] pt-24 md:hidden">
          <p className="text-sm text-on-surface-variant">Addresses page is available on desktop view.</p>
        </div>
        <div className="hidden md:block">
          <AccountAddressesPageContent profile={profile} />
        </div>
      </main>
    </>
  );
}
