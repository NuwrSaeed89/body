"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import {
  DEFAULT_PROFILE_AVATAR,
  FEATURED_ACCOUNT_ORDER,
} from "@/lib/account-data";
import { useAuth } from "@/providers/auth-provider";

type AccountProfile = {
  fullName: string | null;
  email: string | null;
};

type AccountMobileContentProps = {
  profile: AccountProfile;
};

const MANAGEMENT_LINKS = [
  { key: "wishlist", href: "/account/wishlist", icon: "favorite" },
  { key: "shippingAddresses", href: "#addresses", icon: "location_on" },
  { key: "payment", href: "#payment", icon: "credit_card" },
  { key: "support", href: "#support", icon: "support_agent" },
] as const;

export function AccountMobileContent({ profile }: AccountMobileContentProps) {
  const t = useTranslations("account");
  const router = useRouter();
  const { signOut } = useAuth();
  const displayName = profile.fullName?.trim() || t("profile.placeholderName");
  const featuredOrder = FEATURED_ACCOUNT_ORDER;

  return (
    <div className="space-y-12">
      <section className="flex items-center gap-6">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-surface-container-highest shadow-[0_10px_40px_-10px_rgba(18,18,18,0.05)]">
          <Image
            src={DEFAULT_PROFILE_AVATAR}
            alt={t("mobile.avatarAlt", { name: displayName })}
            fill
            className="object-cover"
            sizes="96px"
            priority
          />
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="text-2xl font-medium tracking-wide text-on-surface">
            {displayName}
          </h2>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary" aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-widest text-secondary">
              {t("mobile.eliteMember")}
            </span>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-secondary">
            {t("mobile.recentOrder")}
          </h3>
          <button
            type="button"
            className="border-b border-primary/20 pb-0.5 text-sm font-semibold uppercase tracking-[0.1em] text-primary"
          >
            {t("mobile.viewAll")}
          </button>
        </div>
        <article className="flex flex-col gap-4 rounded-xl border border-surface-container-highest/30 bg-surface-container-lowest p-5 shadow-[0_10px_40px_-10px_rgba(18,18,18,0.05)]">
          <div className="flex gap-4">
            <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-container">
              <Image
                src={featuredOrder.image}
                alt={featuredOrder.imageAlt}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-center">
              <p className="mb-1 text-lg font-semibold tracking-wide text-on-surface">
                {featuredOrder.title}
              </p>
              <div className="mb-3 flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-base text-on-secondary-container"
                  aria-hidden
                >
                  package_2
                </span>
                <span className="text-sm text-secondary">
                  {t("mobile.orderStatus", {
                    status: t(`orders.status.${featuredOrder.status}`),
                    delivery: featuredOrder.estDelivery ?? "",
                  })}
                </span>
              </div>
              <button
                type="button"
                className="w-full rounded-lg bg-primary py-3 text-xs font-semibold uppercase tracking-[0.1em] text-on-primary transition-transform active:scale-95"
              >
                {t("orders.trackOrder")}
              </button>
            </div>
          </div>
        </article>
      </section>

      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-secondary">
          {t("mobile.management")}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {MANAGEMENT_LINKS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="flex flex-col items-center gap-3 rounded-xl bg-surface-container-low p-6 transition-colors active:bg-surface-container"
            >
              <span className="material-symbols-outlined text-primary">{item.icon}</span>
              <span className="text-center text-xs font-semibold uppercase tracking-[0.1em] text-on-surface">
                {t(`mobile.managementLinks.${item.key}`)}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-1">
        <Link
          href="#settings"
          className="group flex items-center justify-between border-b border-surface-container-highest/50 py-4"
        >
          <span className="text-base text-on-surface transition-all group-hover:pl-1">
            {t("mobile.accountSettings")}
          </span>
          <span className="material-symbols-outlined text-sm text-outline">chevron_right</span>
        </Link>
        <Link
          href="/privacy"
          className="group flex items-center justify-between border-b border-surface-container-highest/50 py-4"
        >
          <span className="text-base text-on-surface transition-all group-hover:pl-1">
            {t("mobile.privacyPreferences")}
          </span>
          <span className="material-symbols-outlined text-sm text-outline">chevron_right</span>
        </Link>
        <button
          type="button"
          onClick={() => {
            void signOut().then(() => router.push("/account/login"));
          }}
          className="group mt-4 flex items-center justify-between py-6"
        >
          <span className="text-base font-medium text-error transition-all group-hover:opacity-70">
            {t("mobile.logOut")}
          </span>
          <span className="material-symbols-outlined text-error">logout</span>
        </button>
      </section>
    </div>
  );
}
