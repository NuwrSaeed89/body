"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { AccountDesktopSidebar } from "@/components/account/account-desktop-sidebar";
import { CartHeaderLink } from "@/components/layout/cart-header-link";
import { MobileNav } from "@/components/layout/mobile-nav";
import { FormattedPrice } from "@/components/ui/formatted-price";
import { Link, useRouter } from "@/i18n/navigation";
import { getProfileFirstName } from "@/lib/account/format-profile";
import type { ShopProduct } from "@/lib/shop-data";
import type { AccountProfileData } from "@/lib/account/types";
import { useAuth } from "@/providers/auth-provider";
import { useWishlist } from "@/providers/wishlist-provider";

type WishlistPageContentProps = {
  catalog: ShopProduct[];
  profile: AccountProfileData | null;
};

export function WishlistPageContent({ catalog, profile }: WishlistPageContentProps) {
  const t = useTranslations("wishlist");
  const router = useRouter();
  const { isAuthenticated, mounted: authMounted, signOut, user } = useAuth();
  const { productIds, remove, mounted: wishlistMounted } = useWishlist();

  const ready = authMounted && wishlistMounted;
  const displayName =
    profile?.fullName?.trim() ??
    getProfileFirstName(user?.firstName ?? null) ??
    "Member";
  const email = profile?.email ?? user?.email ?? null;

  if (!ready) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 rounded bg-surface-container" />
        <div className="h-40 rounded-xl bg-surface-container" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col gap-10 md:flex-row md:gap-16">
        <AccountDesktopSidebar active="wishlist" displayName={displayName} email={email} />
        <section className="flex min-h-[40vh] flex-1 flex-col items-center justify-center rounded-xl border border-outline-variant/30 px-6 py-16 text-center md:ml-64">
          <span
            className="material-symbols-outlined mb-4 text-4xl text-on-surface-variant"
            aria-hidden
          >
            favorite
          </span>
          <h2 className="mb-3 text-lg font-medium text-primary">{t("signInTitle")}</h2>
          <p className="mb-8 max-w-sm text-sm text-secondary">{t("signInDescription")}</p>
          <Link
            href="/account/login?redirect=/account/wishlist"
            className="inline-flex rounded-lg bg-primary px-8 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-on-primary transition-opacity hover:opacity-90"
          >
            {t("signInCta")}
          </Link>
        </section>
      </div>
    );
  }

  const products = productIds
    .map((id) => catalog.find((product) => product.id === id || product.slug === id))
    .filter((product) => product != null);

  return (
    <>
      <div className="md:hidden">
        <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between bg-surface/80 px-5 backdrop-blur-md">
          <div className="text-primary transition-opacity active:scale-95">
            <MobileNav />
          </div>
          <h1 className="text-lg font-semibold uppercase tracking-widest text-primary">
            {t("mobile.title")}
          </h1>
          <CartHeaderLink className="relative text-primary transition-opacity active:scale-95" />
        </header>

        <main className="mt-16 px-5 pb-24">
          <div className="py-8 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-secondary">
              {t("mobile.savedItems")}
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-primary">
              {t("mobile.collection")}
            </h2>
            <div className="mt-4 flex justify-center gap-3">
              <span className="rounded-full bg-surface-container-highest px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em]">
                {t("mobile.itemPill", { count: products.length })}
              </span>
              <span className="rounded-full bg-surface-container-highest px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em]">
                {t("mobile.sortedNewest")}
              </span>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="material-symbols-outlined mb-6 text-[64px] text-outline-variant">
                favorite_border
              </span>
              <h3 className="mb-2 text-2xl font-medium text-primary">{t("emptyTitle")}</h3>
              <p className="mb-8 max-w-[240px] text-sm text-secondary">{t("emptyDescription")}</p>
              <Link
                href="/shop"
                className="rounded-lg bg-primary px-8 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-on-primary transition-transform active:scale-95"
              >
                {t("browseShop")}
              </Link>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-4">
              {products.map((product, idx) => (
                <li key={product.id} className="flex flex-col">
                  <div className="group relative aspect-[4/5] overflow-hidden rounded-lg bg-surface-container-low shadow-[0_10px_30px_-15px_rgba(18,18,18,0.05)] transition-transform duration-300 active:scale-[0.98]">
                    <Image
                      src={product.image}
                      alt={product.imageAlt}
                      fill
                      className="object-cover grayscale-[0.2] transition-all duration-500 group-hover:grayscale-0"
                      sizes="50vw"
                      priority={idx < 4}
                    />
                    <button
                      aria-label={t("removeFromWishlist")}
                      onClick={() => remove(product.id)}
                      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-primary shadow-sm backdrop-blur transition-colors active:scale-90"
                    >
                      <span
                        className="material-symbols-outlined text-[18px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        favorite
                      </span>
                    </button>
                    <div className="absolute bottom-3 right-3">
                      <button
                        type="button"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg transition-colors active:scale-90"
                        aria-label={t("mobile.quickAdd")}
                      >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 px-1">
                    <h3 className="truncate text-sm font-semibold tracking-tight text-primary">
                      {product.name.toUpperCase()}
                    </h3>
                    <p className="mt-0.5 text-sm text-secondary">
                      <FormattedPrice amountSek={product.priceSek} />
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>

      <div className="hidden md:flex md:flex-row md:gap-16">
        <AccountDesktopSidebar active="wishlist" displayName={displayName} email={email} />

        <div className="min-w-0 flex-1 space-y-8 md:ml-64">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-primary">
                {t("title")}
              </h2>
              <p className="mt-1 text-sm text-secondary">
                {t("itemCount", { count: products.length })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {user?.email && (
                <p className="text-xs text-on-surface-variant">{user.email}</p>
              )}
              <button
                type="button"
                onClick={() => {
                  void signOut();
                  router.push("/account/login");
                }}
                className="text-xs font-semibold uppercase tracking-[0.1em] text-secondary underline underline-offset-4 hover:text-primary"
              >
                {t("signOut")}
              </button>
            </div>
          </div>

          {products.length === 0 ? (
            <section className="rounded-xl border border-outline-variant/30 px-6 py-16 text-center">
              <span
                className="material-symbols-outlined mb-4 text-4xl text-on-surface-variant"
                aria-hidden
              >
                favorite
              </span>
              <h3 className="mb-3 text-lg font-medium text-primary">{t("emptyTitle")}</h3>
              <p className="mb-8 text-sm text-secondary">{t("emptyDescription")}</p>
              <Link
                href="/shop"
                className="inline-block text-xs font-semibold uppercase tracking-[0.1em] text-primary underline underline-offset-4"
              >
                {t("browseShop")}
              </Link>
            </section>
          ) : (
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <li
                  key={product.id}
                  className="flex flex-col overflow-hidden rounded-xl border border-outline-variant/30 bg-surface"
                >
                  <Link
                    href={`/shop/${product.slug}`}
                    className="relative aspect-[3/4] w-full overflow-hidden bg-surface-container"
                  >
                    <Image
                      src={product.image}
                      alt={product.imageAlt}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <div>
                      <Link
                        href={`/shop/${product.slug}`}
                        className="text-sm font-medium text-on-surface hover:text-primary"
                      >
                        {product.name}
                      </Link>
                      <FormattedPrice
                        amountSek={product.priceSek}
                        className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant"
                      />
                    </div>
                    <div className="mt-auto flex flex-col gap-2 sm:flex-row">
                      <Link
                        href={`/shop/${product.slug}`}
                        className="flex-1 rounded-lg border border-primary py-3 text-center text-[10px] font-semibold uppercase tracking-[0.1em] text-primary transition-colors hover:bg-primary hover:text-on-primary"
                      >
                        {t("viewProduct")}
                      </Link>
                      <button
                        type="button"
                        onClick={() => remove(product.id)}
                        className="flex-1 py-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-secondary underline underline-offset-4 hover:text-primary"
                      >
                        {t("remove")}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
