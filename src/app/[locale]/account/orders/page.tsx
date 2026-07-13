import { setRequestLocale } from "next-intl/server";
import { AccountMobileHeader } from "@/components/account/account-mobile-header";
import { AccountOrdersPageContent } from "@/components/account/account-orders-page-content";
import { getAccountOrders } from "@/lib/account/get-account-orders";
import { getAccountProfile } from "@/lib/account/get-account-profile";
import { requireUser } from "@/lib/auth/require-user";

type AccountOrdersPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AccountOrdersPage({ params }: AccountOrdersPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await requireUser(locale, `/${locale}/account/orders`);

  const [profile, orders] = await Promise.all([
    getAccountProfile(),
    getAccountOrders(user.id),
  ]);

  return (
    <>
      <AccountMobileHeader />
      <main
        id="main-content"
        tabIndex={-1}
        className="bg-surface text-on-surface"
      >
        <div className="mx-auto max-w-[600px] overflow-x-hidden px-5 pb-[calc(var(--mobile-nav-height,72px)+env(safe-area-inset-bottom)+2rem)] pt-24 md:hidden">
          <p className="text-sm text-on-surface-variant">Orders page is available on desktop view.</p>
        </div>
        <div className="hidden md:block">
          <AccountOrdersPageContent profile={profile} orders={orders} />
        </div>
      </main>
    </>
  );
}
