import { setRequestLocale } from "next-intl/server";
import { AccountMobileHeader } from "@/components/account/account-mobile-header";
import { AccountPaymentPageContent } from "@/components/account/account-payment-page-content";
import { getAccountPayments } from "@/lib/account/get-account-payments";
import { getAccountProfile } from "@/lib/account/get-account-profile";
import { requireUser } from "@/lib/auth/require-user";

type AccountPaymentPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AccountPaymentPage({ params }: AccountPaymentPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await requireUser(locale, `/${locale}/account/payment`);

  const [profile, payments] = await Promise.all([
    getAccountProfile(),
    getAccountPayments(user.id),
  ]);

  return (
    <>
      <AccountMobileHeader />
      <main id="main-content" tabIndex={-1} className="bg-surface text-on-surface">
        <div className="mx-auto max-w-[600px] overflow-x-hidden px-5 pb-[calc(var(--mobile-nav-height,72px)+env(safe-area-inset-bottom)+2rem)] pt-24 md:hidden">
          <p className="text-sm text-on-surface-variant">Payment page is available on desktop view.</p>
        </div>
        <div className="hidden md:block">
          <AccountPaymentPageContent profile={profile} payments={payments} />
        </div>
      </main>
    </>
  );
}
