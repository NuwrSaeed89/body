"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const NAV_ITEMS = [
  { key: "overview", href: "/account" },
  { key: "orders", href: "/account" },
  { key: "wishlist", href: "/account/wishlist" },
  { key: "settings", href: "/account" },
] as const;

export function AccountNav() {
  const t = useTranslations("account.nav");
  const pathname = usePathname();

  return (
    <nav className="flex gap-4 overflow-x-auto hide-scrollbar lg:w-56 lg:shrink-0 lg:flex-col lg:gap-2 lg:overflow-visible">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.key === "wishlist"
            ? pathname === "/account/wishlist"
            : item.key === "overview" && pathname === "/account";

        return (
          <Link
            key={item.key}
            href={item.href}
            className={`shrink-0 py-2 text-left text-xs font-semibold uppercase tracking-[0.1em] lg:px-0 ${
              isActive
                ? "text-primary"
                : "text-on-surface-variant hover:text-primary"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            {t(item.key)}
          </Link>
        );
      })}
    </nav>
  );
}
