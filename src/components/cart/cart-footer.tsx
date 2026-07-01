"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LEGAL_PATHS } from "@/lib/legal-pages";

export function CartFooter() {
  const t = useTranslations("cart");
  const footer = useTranslations("footer");
  const newsletter = useTranslations("newsletter");

  return (
    <footer className="mt-20 border-t border-outline-variant/20 bg-surface-container-low py-16">
      {/* Desktop footer */}
      <div className="mx-auto hidden max-w-[1440px] grid-cols-4 gap-6 px-5 md:grid md:px-16">
        <div className="col-span-2 flex flex-col justify-between md:col-span-1">
          <span className="text-3xl font-medium tracking-tighter text-primary md:text-5xl">
            Mbody
          </span>
          <p className="mt-8 text-sm text-secondary">{t("footerTagline")}</p>
        </div>

        <div className="flex flex-col gap-4">
          <h5 className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
            {t("footer.shop")}
          </h5>
          <Link href="#" className="text-sm text-secondary transition-all hover:text-primary">
            {t("nav.sustainability")}
          </Link>
          <Link
            href="/#collections"
            className="text-sm text-secondary transition-all hover:text-primary"
          >
            {footer("links.collections")}
          </Link>
          <Link href="#" className="text-sm text-secondary transition-all hover:text-primary">
            {t("nav.sizeGuide")}
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          <h5 className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
            {t("footer.support")}
          </h5>
          <Link href={LEGAL_PATHS.returns} className="text-sm text-secondary transition-all hover:text-primary">
            {t("footer.shippingReturns")}
          </Link>
          <Link href="#" className="text-sm text-secondary transition-all hover:text-primary">
            {footer("links.contact")}
          </Link>
          <Link href={LEGAL_PATHS.privacy} className="text-sm text-secondary transition-all hover:text-primary">
            {footer("links.privacy")}
          </Link>
        </div>

        <div className="col-span-2 md:col-span-1">
          <h5 className="mb-4 text-xs font-semibold uppercase tracking-widest text-primary">
            {footer("connect")}
          </h5>
          <div className="relative">
            <input
              type="email"
              placeholder={newsletter("emailLabel")}
              className="w-full border-b border-outline-variant bg-transparent py-2 text-sm transition-colors focus:border-primary focus:outline-none"
              aria-label={newsletter("emailLabel")}
            />
            <button type="button" className="absolute bottom-2 right-0" aria-hidden>
              <span className="material-symbols-outlined text-primary">arrow_forward</span>
            </button>
          </div>
          <p className="mt-4 text-[10px] uppercase tracking-wider text-secondary">
            {t("footerNewsletterHint")}
          </p>
        </div>
      </div>

      <div className="mx-auto mt-20 hidden max-w-[1440px] items-center justify-between px-5 md:flex md:px-16">
        <p className="text-xs text-secondary">{t("copyright")}</p>
        <div className="flex gap-6 opacity-60 grayscale">
          <span className="material-symbols-outlined">public</span>
          <span className="material-symbols-outlined">camera</span>
        </div>
      </div>

      {/* Mobile footer */}
      <div className="mx-auto max-w-[1440px] px-5 md:hidden">
        <div className="mb-10 grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">
              {t("footer.shop")}
            </span>
            <Link href="/#collections" className="text-sm text-secondary hover:text-primary">
              {footer("links.collections")}
            </Link>
            <Link href="/" className="text-sm text-secondary hover:text-primary">
              {footer("links.newArrivals")}
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">
              {t("footer.support")}
            </span>
            <Link href={LEGAL_PATHS.returns} className="text-sm text-secondary hover:text-primary">
              {footer("links.shipping")}
            </Link>
            <Link href={LEGAL_PATHS.returns} className="text-sm text-secondary hover:text-primary">
              {footer("links.returns")}
            </Link>
          </div>
        </div>
        <div className="flex flex-col items-center gap-6 border-t border-outline-variant/10 pt-10">
          <p className="text-sm text-secondary">{t("copyright")}</p>
        </div>
      </div>
    </footer>
  );
}
