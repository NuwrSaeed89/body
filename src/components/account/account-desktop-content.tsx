"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AccountDesktopSidebar } from "@/components/account/account-desktop-sidebar";
import {
  formatAddressLocation,
  getDefaultAddress,
  getProfileFirstName,
} from "@/lib/account/format-profile";
import type {
  AccountActiveOrder,
  AccountProfileData,
  AccountRecommendedProduct,
} from "@/lib/account/types";

function formatMoney(amount: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatOrderDate(date: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

type AccountDesktopContentProps = {
  profile: AccountProfileData | null;
  activeOrder: AccountActiveOrder | null;
  recommendedProducts: AccountRecommendedProduct[];
};

export function AccountDesktopContent({
  profile,
  activeOrder,
  recommendedProducts,
}: AccountDesktopContentProps) {
  const t = useTranslations("account");
  const displayName = profile?.fullName?.trim() || t("profile.placeholderName");
  const firstName = getProfileFirstName(profile?.fullName ?? null) ?? displayName;
  const defaultAddress = getDefaultAddress(profile?.addresses ?? []);
  const shippingLabel = defaultAddress
    ? `Default: ${formatAddressLocation(defaultAddress)}`
    : "No default address saved";
  const locale = profile?.locale ?? "en";

  return (
    <>
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1440px]">
        <AccountDesktopSidebar active="dashboard" displayName={displayName} email={profile?.email} />

        <main className="flex-grow px-5 py-12 md:ml-64 md:px-16">
          <header className="mb-16 flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-medium tracking-tight text-primary">
                Welcome, {firstName}.
              </h1>
              <p className="mt-2 text-base text-secondary">
                {profile?.email
                  ? `Signed in as ${profile.email}`
                  : "You're currently an Elite tier member with 4,250 points."}
              </p>
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-outline-variant transition-colors hover:bg-surface-container"
              >
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button
                type="button"
                className="h-12 rounded-lg bg-primary px-6 text-xs font-semibold uppercase tracking-[0.1em] text-on-primary transition-opacity hover:opacity-90"
              >
                Shop New Arrivals
              </button>
            </div>
          </header>

          <section className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-3">
            <article className="flex h-48 cursor-pointer flex-col justify-between rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-8 shadow-[0_10px_40px_-10px_rgba(18,18,18,0.05)] transition-all hover:border-primary">
              <span className="material-symbols-outlined text-3xl text-primary">local_shipping</span>
              <div>
                <h3 className="text-lg font-semibold text-primary">Shipping</h3>
                <p className="mt-1 text-sm text-on-surface-variant">{shippingLabel}</p>
              </div>
            </article>
            <article className="flex h-48 cursor-pointer flex-col justify-between rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-8 shadow-[0_10px_40px_-10px_rgba(18,18,18,0.05)] transition-all hover:border-primary">
              <span className="material-symbols-outlined text-3xl text-primary">
                account_balance_wallet
              </span>
              <div>
                <h3 className="text-lg font-semibold text-primary">Payment</h3>
                <p className="mt-1 text-sm text-on-surface-variant">Visa ending in ••42</p>
              </div>
            </article>
            <article className="flex h-48 cursor-pointer flex-col justify-between rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-8 shadow-[0_10px_40px_-10px_rgba(18,18,18,0.05)] transition-all hover:border-primary">
              <span className="material-symbols-outlined text-3xl text-primary">headset_mic</span>
              <div>
                <h3 className="text-lg font-semibold text-primary">Support</h3>
                <p className="mt-1 text-sm text-on-surface-variant">24/7 Priority Assistance</p>
              </div>
            </article>
          </section>

          <section className="mb-16">
            <div className="mb-6 flex items-end justify-between">
              <h2 className="text-2xl font-medium text-primary">Active Order</h2>
              <Link
                href="/account/orders"
                className="border-b border-secondary text-xs font-semibold uppercase tracking-[0.1em] text-secondary transition-all hover:border-primary hover:text-primary"
              >
                View All Orders
              </Link>
            </div>
            {activeOrder ? (
              <article className="overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest shadow-[0_10px_40px_-10px_rgba(18,18,18,0.05)]">
                <div className="flex flex-col md:flex-row">
                  <div className="relative h-64 overflow-hidden bg-surface-container md:h-auto md:w-1/3">
                    {activeOrder.productImage ? (
                      <Image
                        src={activeOrder.productImage}
                        alt={activeOrder.itemName ?? `Order ${activeOrder.orderNumber}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-on-surface-variant">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex flex-grow flex-col justify-between p-8">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="rounded-full bg-surface-container px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-secondary">
                          Order #{activeOrder.orderNumber}
                        </span>
                        <h3 className="mt-4 text-2xl font-medium text-primary">
                          {activeOrder.itemName ?? "Order item"}
                        </h3>
                        <p className="mt-1 text-sm text-on-surface-variant">
                          Color: {activeOrder.itemColorCode ?? "N/A"} • Size: {activeOrder.itemSizeCode ?? "N/A"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-primary">
                          {formatMoney(activeOrder.total, activeOrder.currency, locale)}
                        </p>
                        <p className="mt-1 text-[10px] uppercase tracking-widest text-on-surface-variant">
                          Created {formatOrderDate(activeOrder.createdAt, locale)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-8">
                      <div className="mb-2 flex justify-between">
                        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">
                          Current Status: {activeOrder.status.replaceAll("_", " ")}
                        </span>
                      </div>
                      <div className="h-1 w-full overflow-hidden rounded-full bg-surface-container">
                        <div className="h-full w-[60%] rounded-full bg-primary" />
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ) : (
              <article className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-8 text-on-surface-variant shadow-[0_10px_40px_-10px_rgba(18,18,18,0.05)]">
                No orders yet. Your next purchase will appear here.
              </article>
            )}
          </section>

          <section className="mb-16">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-medium text-primary">Recommended for You</h2>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Based on your training profile and past purchases.
                </p>
              </div>
              <div className="flex gap-2">
                <button className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant transition-all hover:bg-primary hover:text-on-primary">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant transition-all hover:bg-primary hover:text-on-primary">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {recommendedProducts.map((product) => (
                <Link key={product.id} href={`/shop/${product.slug}`} className="group cursor-pointer">
                  <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-lg bg-surface-container-low shadow-[0_10px_40px_-10px_rgba(18,18,18,0.05)]">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
                    {product.badge}
                  </p>
                  <h4 className="text-base font-semibold text-primary">{product.name}</h4>
                  <p className="mt-1 text-sm text-secondary">
                    {formatMoney(product.priceSek, profile?.currency ?? "EUR", locale)}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
