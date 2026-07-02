import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { AccountNav } from "@/components/account/account-nav";
import { AccountSignOutButton } from "@/components/account/account-sign-out-button";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { PageContainer } from "@/components/ui/page-container";
import { Link } from "@/i18n/navigation";
import { getServerProfile } from "@/lib/auth/get-session";
import { requireUser } from "@/lib/auth/require-user";

type AccountPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AccountPage({ params }: AccountPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireUser(locale, `/${locale}/account`);
  const t = await getTranslations("account");
  const profile = await getServerProfile();

  const welcomeTitle = profile?.full_name
    ? t("welcomeNamed", { name: profile.full_name })
    : t("welcome");

  const orders = [
    { id: "MB-1042", date: "12 Jun 2026", status: "Delivered", total: "€157" },
    { id: "MB-0988", date: "28 May 2026", status: "Shipped", total: "€89" },
  ];

  return (
    <>
      <SiteHeader />
      <PageContainer as="main" className="pb-24 pt-28 md:pt-32">
        <h1 className="mb-8 text-2xl font-medium text-primary md:text-4xl">
          {t("title")}
        </h1>

        <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
          <AccountNav />

          <div className="min-w-0 flex-1 space-y-10">
            <section className="rounded-xl border border-outline-variant/30 p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-primary">
                  {welcomeTitle}
                </h2>
                <AccountSignOutButton />
              </div>
              <p className="text-sm text-secondary">
                {profile?.email ? `${profile.email} · ` : ""}
                {t("welcomeDescription")}
              </p>
              <Link
                href="/shop"
                className="mt-6 inline-block text-xs font-semibold uppercase tracking-[0.1em] text-primary underline underline-offset-4"
              >
                {t("continueShopping")}
              </Link>
            </section>

            <section>
              <h2 className="mb-6 text-sm font-semibold uppercase tracking-[0.1em] text-primary">
                {t("recentOrders")}
              </h2>
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col gap-3 rounded-xl border border-outline-variant/30 p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-on-surface">{order.id}</p>
                      <p className="text-sm text-secondary">{order.date}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-xs font-semibold uppercase tracking-[0.1em] text-secondary">
                        {order.status}
                      </span>
                      <span className="font-medium">{order.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </PageContainer>
      <SiteFooter />
    </>
  );
}
