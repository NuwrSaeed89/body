"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { MobileNav } from "@/components/layout/mobile-nav";

const filledDesktopNav = [
  { labelKey: "nav.shop", href: "/shop" as const },
  { labelKey: "nav.collections", href: "/#collections" as const },
  { labelKey: "cart.nav.sustainability", href: "#" as const },
  { labelKey: "nav.about", href: "/#about" as const },
] as const;

const emptyDesktopNav = [
  { labelKey: "nav.shop", href: "/shop" as const },
  { labelKey: "nav.collections", href: "/#collections" as const },
  { labelKey: "cart.nav.performance", href: "/shop" as const },
  { labelKey: "nav.about", href: "/#about" as const },
] as const;

type CartHeaderProps = {
  desktopEmpty?: boolean;
  mobileEmpty?: boolean;
  mobileItemCount?: number;
};

export function CartHeader({
  desktopEmpty = false,
  mobileEmpty = false,
  mobileItemCount = 0,
}: CartHeaderProps) {
  const t = useTranslations();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {desktopEmpty ? (
        <nav className="fixed top-0 z-50 hidden w-full bg-surface/90 shadow-sm backdrop-blur-md md:block">
          <div className="mx-auto flex h-20 w-full max-w-[1440px] items-center justify-between px-5 md:px-16">
            <Link
              href="/"
              className="text-2xl font-bold tracking-tighter text-primary transition-all duration-300 hover:opacity-70"
            >
              Mbody
            </Link>

            <div className="flex items-center gap-10">
              {emptyDesktopNav.map((link) => (
                <Link
                  key={link.labelKey}
                  href={link.href}
                  className="text-xs font-semibold uppercase tracking-widest text-on-secondary-container transition-colors hover:text-primary"
                >
                  {t(link.labelKey)}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-6">
              <button
                type="button"
                className="transition-opacity hover:opacity-70"
                aria-label={t("header.aria.search")}
              >
                <span className="material-symbols-outlined text-primary">search</span>
              </button>
              <Link
                href="/cart"
                className="transition-opacity hover:opacity-70"
                aria-label={t("header.aria.shopping_bag")}
                aria-current="page"
              >
                <span className="material-symbols-outlined border-b border-primary pb-1 text-primary">
                  shopping_bag
                </span>
              </Link>
              <Link
                href="/account/login"
                className="transition-opacity hover:opacity-70"
                aria-label={t("header.aria.person")}
              >
                <span className="material-symbols-outlined text-primary">person</span>
              </Link>
            </div>
          </div>
        </nav>
      ) : (
        <header className="sticky top-0 z-50 hidden w-full bg-surface/90 shadow-sm backdrop-blur-md md:block">
          <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 py-4 md:px-16">
            <Link
              href="/"
              className="text-3xl font-medium tracking-tighter text-primary md:text-5xl"
            >
              Mbody
            </Link>

            <nav className="flex items-center gap-8">
              {filledDesktopNav.map((link) => (
                <Link
                  key={link.labelKey}
                  href={link.href}
                  className="text-xs font-semibold uppercase tracking-widest text-secondary transition-colors hover:text-primary"
                >
                  {t(link.labelKey)}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-6">
              <Link
                href="/cart"
                className="transition-opacity hover:opacity-70"
                aria-label={t("header.aria.shopping_bag")}
                aria-current="page"
              >
                <span className="material-symbols-outlined text-primary">shopping_bag</span>
              </Link>
              <Link
                href="/account/login"
                className="transition-opacity hover:opacity-70"
                aria-label={t("header.aria.person")}
              >
                <span className="material-symbols-outlined text-primary">person</span>
              </Link>
            </div>
          </div>
        </header>
      )}

      <header
        className={`z-50 w-full backdrop-blur-md transition-all duration-300 md:hidden ${
          mobileEmpty
            ? "fixed top-0 border-b border-surface-container-highest bg-surface/95"
            : `sticky top-0 border-b border-outline-variant/10 bg-surface/95 ${scrolled ? "shadow-md" : ""}`
        }`}
      >
        <div
          className={`mx-auto w-full max-w-[1440px] px-5 ${
            mobileEmpty ? "flex h-16 items-center justify-between" : "grid grid-cols-3 items-center py-4"
          }`}
        >
          {mobileEmpty ? (
            <>
              <MobileNav />
              <h1 className="text-xs font-semibold uppercase tracking-widest text-primary">
                {t("cart.empty.bagLabel")}
              </h1>
              <Link
                href="/cart"
                className="relative text-primary transition-opacity hover:opacity-70 active:scale-95"
                aria-label={t("header.aria.shopping_bag")}
                aria-current="page"
              >
                <span className="material-symbols-outlined">shopping_bag</span>
                <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-primary" />
              </Link>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => router.back()}
                className="flex items-center justify-start p-1 text-primary transition-opacity hover:opacity-70"
                aria-label={t("cart.back")}
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <h1 className="text-center text-lg font-semibold uppercase tracking-[0.2em] text-primary">
                {t("cart.empty.bagLabel")}
              </h1>
              <div className="flex items-center justify-end">
                <div className="relative text-primary">
                  <span className="material-symbols-outlined">shopping_bag</span>
                  {mobileItemCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-on-primary">
                      {mobileItemCount}
                    </span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </header>
    </>
  );
}
