"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { DEFAULT_PROFILE_AVATAR } from "@/lib/account-data";

export type AccountSidebarSection =
  | "dashboard"
  | "orders"
  | "wishlist"
  | "addresses"
  | "payment"
  | "settings";

type AccountDesktopSidebarProps = {
  active: AccountSidebarSection;
  displayName: string;
  email?: string | null;
};

function navClass(isActive: boolean): string {
  if (isActive) {
    return "flex w-full scale-[0.98] items-center gap-3 rounded-lg bg-secondary-container px-4 py-3 font-bold text-on-secondary-container transition-all duration-200";
  }
  return "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-on-surface-variant transition-colors duration-200 hover:bg-surface-container";
}

export function AccountDesktopSidebar({
  active,
  displayName,
  email,
}: AccountDesktopSidebarProps) {
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-full w-64 flex-col border-r border-outline-variant bg-surface-container-lowest p-4 md:flex">
      <div className="mb-10 px-4 pt-6">
        <span className="text-2xl font-bold tracking-tighter text-primary">Mbody</span>
        <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
          Management Portal
        </p>
      </div>

      <nav className="space-y-1">
        <Link href="/account" className={navClass(active === "dashboard")}>
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-xs font-semibold uppercase tracking-[0.1em]">Dashboard</span>
        </Link>
        <Link href="/account/orders" className={navClass(active === "orders")}>
          <span className="material-symbols-outlined">shopping_cart</span>
          <span className="text-xs font-semibold uppercase tracking-[0.1em]">Orders</span>
        </Link>
        <Link href="/account/wishlist" className={navClass(active === "wishlist")}>
          <span className="material-symbols-outlined">favorite</span>
          <span className="text-xs font-semibold uppercase tracking-[0.1em]">Wishlist</span>
        </Link>
        <Link href="/account/addresses" className={navClass(active === "addresses")}>
          <span className="material-symbols-outlined">location_on</span>
          <span className="text-xs font-semibold uppercase tracking-[0.1em]">Addresses</span>
        </Link>
        <Link href="/account/payment" className={navClass(active === "payment")}>
          <span className="material-symbols-outlined">payments</span>
          <span className="text-xs font-semibold uppercase tracking-[0.1em]">Payment</span>
        </Link>
        <Link href="/account/settings" className={navClass(active === "settings")}>
          <span className="material-symbols-outlined">settings</span>
          <span className="text-xs font-semibold uppercase tracking-[0.1em]">Settings</span>
        </Link>
      </nav>

      <div className="mt-auto border-t border-outline-variant p-4">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-surface-container-high">
            <Image src={DEFAULT_PROFILE_AVATAR} alt={displayName} fill className="object-cover" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">{displayName}</p>
            <p className="text-[10px] uppercase tracking-tighter text-on-surface-variant">
              {email ?? "Customer"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
