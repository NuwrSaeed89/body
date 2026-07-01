"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  EMPTY_DESKTOP_ARRIVALS,
  EMPTY_MOBILE_MUST_HAVES,
} from "@/lib/cart-data";
import { useCurrency } from "@/providers/currency-provider";

type CartEmptyContentProps = {
  onAddDesktopItem?: (cartItemId: string) => void;
  onAddMobileItem?: (cartItemId: string) => void;
};

export function CartEmptyContent({
  onAddMobileItem,
}: CartEmptyContentProps) {
  const t = useTranslations("cart");
  const { formatFromSek } = useCurrency();

  return (
    <>
      {/* Desktop empty state */}
      <div className="hidden pt-20 md:block">
        <section className="flex min-h-[614px] flex-col items-center justify-center px-5 py-24 text-center">
          <div className="mb-8 opacity-20">
            <span className="material-symbols-outlined empty-cart-icon block text-[80px] leading-none">
              shopping_bag
            </span>
          </div>
          <h1 className="mb-6 text-3xl font-medium tracking-tight text-primary md:text-5xl">
            {t("empty.title")}
          </h1>
          <p className="mb-12 max-w-xl text-base text-secondary">
            {t("empty.description")}
          </p>
          <Link
            href="/shop"
            className="luxury-shadow rounded-lg bg-primary px-12 py-5 text-xs font-semibold uppercase tracking-widest text-on-primary transition-all duration-300 hover:opacity-90"
          >
            {t("empty.startShopping")}
          </Link>
        </section>

        <section className="bg-surface-container-low py-24">
          <div className="mx-auto max-w-[1440px] px-5 md:px-16">
            <div className="mb-12 flex items-end justify-between">
              <div>
                <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-on-secondary-container">
                  {t("empty.curatedSelection")}
                </span>
                <h2 className="text-2xl font-medium text-primary">{t("empty.newArrivals")}</h2>
              </div>
              <Link
                href="/"
                className="border-b border-primary pb-1 text-xs font-semibold uppercase text-primary transition-opacity hover:opacity-60"
              >
                {t("empty.viewAll")}
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {EMPTY_DESKTOP_ARRIVALS.map((item, index) => (
                <Link
                  key={item.id}
                  href="/shop"
                  className="group cursor-pointer"
                  style={{
                    animation: `fadeInUp 0.8s ease ${index * 0.1}s both`,
                  }}
                >
                  <div className="relative mb-4 aspect-[4/5] overflow-hidden bg-surface-container luxury-shadow">
                    <Image
                      src={item.image}
                      alt={item.imageAlt}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 25vw"
                    />
                    {item.badgeKey && (
                      <div className="absolute left-4 top-4">
                        <span className="bg-white/90 px-3 py-1 text-xs font-semibold uppercase text-primary backdrop-blur">
                          {t(`empty.badges.${item.badgeKey}`)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold tracking-wide text-primary">
                      {t(`empty.products.${item.id}.name`)}
                    </h3>
                    <p className="text-sm text-secondary">
                      {t(`empty.products.${item.id}.color`)}
                    </p>
                    <p className="mt-2 text-base font-medium text-primary">
                      {formatFromSek(item.priceSek)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Mobile empty state */}
      <div className="mx-auto max-w-[1440px] px-5 pb-32 pt-24 antialiased md:hidden">
        <section className="mb-16 flex flex-col items-center space-y-6 text-center">
          <div className="relative flex h-48 w-48 items-center justify-center rounded-full bg-surface-container">
            <div className="absolute inset-0 scale-110 animate-pulse rounded-full border border-primary/5" />
            <span
              className="material-symbols-outlined text-6xl text-outline-variant"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 100, 'GRAD' 0, 'opsz' 48" }}
            >
              shopping_bag
            </span>
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-medium tracking-wide text-primary">
              {t("empty.titleMobile")}
            </h2>
            <p className="mx-auto max-w-[280px] text-sm leading-relaxed text-secondary">
              {t("empty.descriptionMobile")}
            </p>
          </div>
          <Link
            href="/shop"
            className="flex h-14 w-full items-center justify-center rounded-lg bg-primary text-xs font-semibold uppercase tracking-[0.2em] text-on-primary shadow-xl shadow-primary/10 transition-all duration-300 active:scale-95"
          >
            {t("empty.shopNewArrivals")}
          </Link>
        </section>

        <section className="space-y-8">
          <div className="flex items-end justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-primary">
              {t("empty.mustHaves")}
            </h3>
            <Link
              href="/shop"
              className="text-xs font-semibold uppercase tracking-widest text-secondary underline decoration-outline-variant underline-offset-4"
            >
              {t("empty.viewAll")}
            </Link>
          </div>

          <div className="space-y-6 pb-4">
            {EMPTY_MOBILE_MUST_HAVES.map((item) => (
              <div key={item.id} className="group flex items-center gap-4">
                <div className="h-[7.5rem] w-24 shrink-0 overflow-hidden rounded bg-surface-container">
                  <Image
                    src={item.image}
                    alt={item.imageAlt}
                    width={96}
                    height={120}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="min-w-0 flex-grow space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-secondary-fixed-dim">
                    {t(`empty.categories.${item.categoryKey}`)}
                  </p>
                  <h4 className="text-base font-medium text-primary">
                    {t(`empty.products.${item.id}.name`)}
                  </h4>
                  <p className="text-sm text-secondary">{formatFromSek(item.priceSek)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onAddMobileItem?.(item.cartItemId)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-outline-variant transition-colors duration-300 hover:bg-primary hover:text-on-primary"
                  aria-label={t("addToBag")}
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
