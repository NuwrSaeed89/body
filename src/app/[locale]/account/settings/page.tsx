import { setRequestLocale } from "next-intl/server";
import { AccountMobileHeader } from "@/components/account/account-mobile-header";
import { AccountSettingsPageContent } from "@/components/account/account-settings-page-content";
import { getAccountProfile } from "@/lib/account/get-account-profile";
import { requireUser } from "@/lib/auth/require-user";

type AccountSettingsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AccountSettingsPage({ params }: AccountSettingsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireUser(locale, `/${locale}/account/settings`);

  const profile = await getAccountProfile();

  return (
    <>
      <AccountMobileHeader />
      <main id="main-content" tabIndex={-1} className="bg-surface text-on-surface">
        <div className="mx-auto max-w-[600px] overflow-x-hidden px-5 pb-[calc(var(--mobile-nav-height,72px)+env(safe-area-inset-bottom)+2rem)] pt-24 md:hidden">
          <p className="text-sm text-on-surface-variant">Settings page is available on desktop view.</p>
        </div>
        <div className="hidden md:block">
          <AccountSettingsPageContent profile={profile} />
        </div>
      </main>
    </>
  );
}
