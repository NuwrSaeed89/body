"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useAuth } from "@/providers/auth-provider";

const NAV_ITEMS = [
  {
    icon: "home",
    labelKey: "home",
    href: "/" as const,
    match: (path: string) => path === "/",
  },
  {
    icon: "grid_view",
    labelKey: "shop",
    href: "/shop" as const,
    match: (path: string) => path === "/shop" || path.startsWith("/shop/"),
  },
  {
    icon: "favorite",
    labelKey: "wishlist",
    href: "/account/wishlist" as const,
    match: (path: string) => path === "/account/wishlist",
  },
  {
    icon: "person",
    labelKey: "account",
    href: "/account/login" as const,
    authenticatedHref: "/account" as const,
    match: (path: string) =>
      path.startsWith("/account") && path !== "/account/wishlist",
  },
] as const;

export const MOBILE_NAV_HEIGHT = 72;

export function shouldHideMobileBottomNav(pathname: string) {
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/checkout") ||
    pathname === "/account/login"
  );
}

export function MobileBottomNav() {
  const t = useTranslations("bottomNav");
  const pathname = usePathname();
  const { isAuthenticated, mounted } = useAuth();

  if (shouldHideMobileBottomNav(pathname)) {
    return null;
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[80] flex h-[72px] items-center justify-between border-t border-outline-variant/30 bg-white px-6 pb-safe shadow-[0_-4px_12px_rgba(0,0,0,0.05)] md:hidden"
      aria-label={t("ariaLabel")}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = item.match(pathname);
        const href =
          item.labelKey === "account" &&
          mounted &&
          isAuthenticated &&
          "authenticatedHref" in item
            ? item.authenticatedHref
            : item.href;

        return (
          <Link
            key={item.labelKey}
            href={href}
            className={`flex flex-col items-center gap-1 ${
              isActive ? "text-primary" : "text-on-surface-variant"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            <span
              className="material-symbols-outlined text-[24px]"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {item.icon}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-normal">
              {t(item.labelKey)}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
