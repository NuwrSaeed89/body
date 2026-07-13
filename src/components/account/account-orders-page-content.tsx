"use client";

import Image from "next/image";
import { AccountDesktopSidebar } from "@/components/account/account-desktop-sidebar";
import { getProfileFirstName } from "@/lib/account/format-profile";
import type { AccountOrderListItem, AccountProfileData } from "@/lib/account/types";

type AccountOrdersPageContentProps = {
  profile: AccountProfileData | null;
  orders: AccountOrderListItem[];
};

function formatMoney(amount: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatOrderDate(date: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function AccountOrdersPageContent({ profile, orders }: AccountOrdersPageContentProps) {
  const displayName = profile?.fullName?.trim() || "Member";
  const firstName = getProfileFirstName(profile?.fullName ?? null) ?? displayName;
  const locale = profile?.locale ?? "en";
  const defaultCurrency = profile?.currency ?? "EUR";

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-[1440px]">
      <AccountDesktopSidebar active="orders" displayName={displayName} email={profile?.email} />

      <main className="flex-grow px-5 py-12 md:ml-64 md:px-16">
        <header className="mb-12">
          <h1 className="text-5xl font-medium tracking-tight text-primary">Orders, {firstName}.</h1>
          <p className="mt-2 text-base text-secondary">
            Review all your orders and their latest statuses.
          </p>
        </header>

        {orders.length === 0 ? (
          <section className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-8 text-on-surface-variant">
            No orders yet. Your first checkout will appear here.
          </section>
        ) : (
          <section className="space-y-4">
            {orders.map((order) => (
              <article
                key={order.id}
                className="flex flex-col gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-[0_10px_40px_-10px_rgba(18,18,18,0.05)] md:flex-row md:items-center"
              >
                <div className="relative h-24 w-20 overflow-hidden rounded bg-surface-container md:h-28 md:w-24">
                  {order.firstItemImage ? (
                    <Image
                      src={order.firstItemImage}
                      alt={order.firstItemName ?? `Order ${order.orderNumber}`}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-secondary">
                    Order #{order.orderNumber}
                  </p>
                  <h2 className="mt-1 truncate text-lg font-semibold text-primary">
                    {order.firstItemName ?? "Order item"}
                  </h2>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    {formatOrderDate(order.createdAt, locale)} · {order.itemCount} items
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-lg font-semibold text-primary">
                    {formatMoney(order.total, order.currency ?? defaultCurrency, locale)}
                  </p>
                  <p className="text-xs uppercase tracking-[0.1em] text-on-surface-variant">
                    {order.status.replaceAll("_", " ")}
                  </p>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
