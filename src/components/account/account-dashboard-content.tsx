"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AccountOrderCard } from "@/components/account/account-order-card";
import { AccountSignOutButton } from "@/components/account/account-sign-out-button";
import { AccountTabs, type AccountTab } from "@/components/account/account-tabs";
import { AuthUnderlineField } from "@/components/auth/auth-underline-field";
import { FormattedPrice } from "@/components/ui/formatted-price";
import { Link } from "@/i18n/navigation";
import {
  MOCK_ACCOUNT_ORDERS,
  MOCK_WISHLIST_ITEMS,
} from "@/lib/account-data";
import type { ShopProduct } from "@/lib/shop-data";
import { useWishlist } from "@/providers/wishlist-provider";

type AccountProfile = {
  fullName: string | null;
  email: string | null;
};

type AccountDashboardContentProps = {
  profile: AccountProfile;
  catalog: ShopProduct[];
  layout?: "mobile" | "desktop" | "responsive";
  initialTab?: AccountTab;
};

function getInitials(name: string | null, email: string | null) {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    return parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }
  return email?.[0]?.toUpperCase() ?? "M";
}

export function AccountDashboardContent({
  profile,
  catalog,
  layout = "responsive",
  initialTab = "orders",
}: AccountDashboardContentProps) {
  const t = useTranslations("account");
  const [activeTab, setActiveTab] = useState<AccountTab>(initialTab);
  const [firstName, setFirstName] = useState(
    profile.fullName?.split(/\s+/)[0] ?? "",
  );
  const [lastName, setLastName] = useState(
    profile.fullName?.split(/\s+/).slice(1).join(" ") ?? "",
  );
  const [email, setEmail] = useState(profile.email ?? "");
  const { productIds } = useWishlist();

  const isMobileLayout = layout === "mobile";
  const isDesktopLayout = layout === "desktop";

  const savedProducts = useMemo(() => {
    const fromWishlist = productIds
      .map((id) => catalog.find((product) => product.id === id || product.slug === id))
      .filter((product): product is ShopProduct => product != null);

    if (fromWishlist.length > 0) {
      return fromWishlist;
    }

    return MOCK_WISHLIST_ITEMS.map((item) => ({
      id: item.id,
      slug: item.id,
      name: item.name,
      priceSek: item.priceSek,
      image: item.image,
      imageAlt: item.imageAlt,
      category: "leggings" as const,
    }));
  }, [catalog, productIds]);

  const welcomeTitle = profile.fullName
    ? t("welcomeNamed", { name: profile.fullName })
    : t("welcome");
  const isWishlistView = activeTab === "wishlist";

  return (
    <div className="space-y-8 md:space-y-10">
      {!isWishlistView && (
        <section
          className={`rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-[0_10px_30px_rgba(18,18,18,0.02)] md:p-6 ${
            isDesktopLayout ? "" : ""
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-semibold text-on-primary"
              aria-hidden
            >
              {getInitials(profile.fullName, profile.email)}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-semibold tracking-wide text-primary md:text-sm md:uppercase md:tracking-[0.1em]">
                {welcomeTitle}
              </h2>
              <p className="mt-1 text-sm text-secondary">
                {profile.email ? `${profile.email} · ` : ""}
                {t("welcomeDescription")}
              </p>
              <Link
                href="/shop"
                className="mt-4 inline-block text-xs font-semibold uppercase tracking-[0.1em] text-primary underline underline-offset-4"
              >
                {t("continueShopping")}
              </Link>
            </div>
            <div className="hidden shrink-0 md:block">
              <AccountSignOutButton />
            </div>
          </div>
          <div className="mt-5 flex justify-end md:hidden">
            <AccountSignOutButton />
          </div>
        </section>
      )}

      <AccountTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "orders" && (
        <section aria-labelledby="account-orders-heading" className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <h2
              id="account-orders-heading"
              className="text-xl font-medium text-primary md:text-2xl"
            >
              {t("recentOrders")}
            </h2>
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-secondary">
              {t("orders.found", { count: MOCK_ACCOUNT_ORDERS.length })}
            </span>
          </div>
          <div className="space-y-5">
            {MOCK_ACCOUNT_ORDERS.map((order) => (
              <AccountOrderCard
                key={order.id}
                order={order}
                variant={isMobileLayout ? "mobile" : isDesktopLayout ? "desktop" : "mobile"}
              />
            ))}
          </div>
        </section>
      )}

      {activeTab === "wishlist" && (
        <section aria-labelledby="account-wishlist-heading" className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <h2
              id="account-wishlist-heading"
              className="text-xl font-medium text-primary md:text-2xl"
            >
              {t("savedItems")}
            </h2>
            <Link
              href="/account/wishlist"
              className="text-xs font-semibold uppercase tracking-[0.1em] text-primary underline underline-offset-4"
            >
              {t("viewAllWishlist")}
            </Link>
          </div>
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {savedProducts.map((product) => (
              <li key={product.id} className="group relative">
                <div className="relative mb-3 aspect-[4/5] overflow-hidden rounded bg-surface-container-high">
                  <Image
                    src={product.image}
                    alt={product.imageAlt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-lowest/80 text-primary shadow-sm backdrop-blur-sm">
                    <span
                      className="material-symbols-outlined text-[20px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                      aria-hidden
                    >
                      favorite
                    </span>
                  </span>
                </div>
                <h3 className="text-sm text-primary">{product.name}</h3>
                <p className="text-sm text-secondary">
                  <FormattedPrice amountSek={product.priceSek} />
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {activeTab === "profile" && (
        <section aria-labelledby="account-profile-heading" className="max-w-4xl space-y-10">
          <div>
            <h2
              id="account-profile-heading"
              className="mb-6 text-xl font-medium text-primary md:text-2xl"
            >
              {t("profile.personalInfo")}
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
              <AuthUnderlineField
                id="account-first-name"
                label={t("login.firstName")}
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                autoComplete="given-name"
              />
              <AuthUnderlineField
                id="account-last-name"
                label={t("login.lastName")}
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                autoComplete="family-name"
              />
              <div className="md:col-span-2">
                <AuthUnderlineField
                  id="account-email"
                  label={t("login.email")}
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>
            <button
              type="button"
              className="mt-8 rounded bg-primary px-10 py-4 text-xs font-semibold uppercase tracking-[0.1em] text-on-primary transition-opacity hover:opacity-90"
            >
              {t("profile.saveChanges")}
            </button>
          </div>

          <div>
            <div className="mb-6 flex items-center justify-between gap-4">
              <h3 className="text-xl font-medium text-primary md:text-2xl">
                {t("profile.savedAddresses")}
              </h3>
              <button
                type="button"
                className="text-xs font-semibold uppercase tracking-[0.1em] text-primary"
              >
                {t("profile.addAddress")}
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
              <article className="relative rounded-lg border border-primary bg-surface-container-lowest p-6 shadow-[0_10px_30px_rgba(18,18,18,0.02)]">
                <span className="absolute right-6 top-6 rounded bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-on-primary">
                  {t("profile.default")}
                </span>
                <h4 className="mb-4 text-base font-semibold tracking-wide text-primary">
                  {t("profile.home")}
                </h4>
                <address className="space-y-1 text-sm not-italic text-secondary">
                  <p>{profile.fullName ?? t("profile.placeholderName")}</p>
                  <p>842 Madison Avenue</p>
                  <p>New York, NY 10021</p>
                  <p>{t("profile.unitedStates")}</p>
                </address>
              </article>
              <article className="rounded-lg border border-outline-variant/30 bg-surface p-6 transition-colors hover:border-primary/30">
                <h4 className="mb-4 text-base font-semibold tracking-wide text-primary">
                  {t("profile.studio")}
                </h4>
                <address className="space-y-1 text-sm not-italic text-secondary">
                  <p>{profile.fullName ?? t("profile.placeholderName")}</p>
                  <p>120 Wooster St, Loft 4</p>
                  <p>New York, NY 10012</p>
                  <p>{t("profile.unitedStates")}</p>
                </address>
              </article>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
