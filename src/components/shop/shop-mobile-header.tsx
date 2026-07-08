"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SearchOverlayTrigger } from "@/components/search/search-overlay-trigger";

export function ShopMobileHeader() {
  const t = useTranslations();

  return (
    <header className="sticky top-0 z-50 flex h-14 w-full items-center justify-between border-b border-outline-variant/10 bg-surface/90 px-5 backdrop-blur-md md:hidden">
      <MobileNav />

      <div className="text-lg font-bold uppercase tracking-tighter text-primary">Mbody</div>

      <div className="flex items-center gap-4">
        <SearchOverlayTrigger
          className="text-primary transition-opacity active:opacity-60"
          ariaLabel={t("header.aria.search")}
        />
        <Link
          href="/cart"
          className="relative text-primary transition-opacity active:opacity-60"
          aria-label={t("header.aria.shopping_bag")}
        >
          <span className="material-symbols-outlined text-[24px]">shopping_bag</span>
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-on-primary">
            2
          </span>
        </Link>
      </div>
    </header>
  );
}
