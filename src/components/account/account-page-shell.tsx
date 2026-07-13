import { AccountDesktopContent } from "@/components/account/account-desktop-content";
import { AccountMobileContent } from "@/components/account/account-mobile-content";
import { AccountMobileHeader } from "@/components/account/account-mobile-header";
import { getAccountDashboardData } from "@/lib/account/get-account-dashboard-data";
import { getAccountProfile } from "@/lib/account/get-account-profile";

export async function AccountPageShell() {
  const profile = await getAccountProfile();
  const dashboardData = await getAccountDashboardData(profile);

  return (
    <>
      <AccountMobileHeader />

      <main
        id="main-content"
        tabIndex={-1}
        className="bg-surface text-on-surface"
      >
        <div className="mx-auto max-w-[600px] overflow-x-hidden px-5 pb-[calc(var(--mobile-nav-height,72px)+env(safe-area-inset-bottom)+2rem)] pt-24 md:hidden">
          <AccountMobileContent profile={profile} />
        </div>

        <div className="hidden md:block">
          <AccountDesktopContent
            profile={profile}
            activeOrder={dashboardData.activeOrder}
            recommendedProducts={dashboardData.recommendedProducts}
          />
        </div>
      </main>
    </>
  );
}
