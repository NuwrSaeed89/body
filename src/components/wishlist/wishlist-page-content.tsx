"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { AccountNav } from "@/components/account/account-nav";
import { FormattedPrice } from "@/components/ui/formatted-price";
import { Link, useRouter } from "@/i18n/navigation";
import { getStorefrontProducts } from "@/lib/catalog/get-storefront-catalog";
import type { ShopProduct } from "@/lib/shop-data";
import { useAuth } from "@/providers/auth-provider";
import { useWishlist } from "@/providers/wishlist-provider";

type WishlistPageContentProps = {
  catalog: ShopProduct[];
};

export function WishlistPageContent({ catalog }: WishlistPageContentProps) {
  const t = useTranslations("wishlist");
  const router = useRouter();
  const { isAuthenticated, mounted: authMounted, signOut, user } = useAuth();
  const { productIds, remove, mounted: wishlistMounted } = useWishlist();

  const ready = authMounted && wishlistMounted;

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
      <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
        <AccountNav />
        <section className="flex min-h-[40vh] flex-1 flex-col items-center justify-center rounded-xl border border-outline-variant/30 px-6 py-16 text-center">
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
            className="bg-primary px-8 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-on-primary"
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
    <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
      <AccountNav />

      <div className="min-w-0 flex-1 space-y-8">
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
                signOut();
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
                      className="flex-1 border border-primary py-3 text-center text-[10px] font-semibold uppercase tracking-[0.1em] text-primary transition-colors hover:bg-primary hover:text-on-primary"
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
  );
}
