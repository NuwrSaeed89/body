"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LEGAL_PATHS } from "@/lib/legal-pages";
import { NewsletterSignupForm } from "@/components/newsletter/newsletter-signup-form";

export function CartEmptyFooter() {
  const t = useTranslations("cart");
  const footer = useTranslations("footer");

  return (
    <footer className="hidden w-full border-t border-outline-variant/30 bg-surface-container-low py-16 md:block">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-6 px-5 md:grid-cols-4 md:px-16">
        <div className="flex flex-col space-y-6">
          <Link href="/" className="text-lg font-bold text-primary">
            Mbody
          </Link>
          <p className="text-sm leading-relaxed text-secondary">{t("empty.footerTagline")}</p>
        </div>

        <div className="flex flex-col space-y-4">
          <h4 className="mb-2 text-xs font-semibold uppercase text-primary">
            {t("footer.shop")}
          </h4>
          <Link
            href="/"
            className="text-sm text-secondary transition-colors hover:text-primary hover:underline hover:underline-offset-4"
          >
            {footer("links.newArrivals")}
          </Link>
          <Link
            href="/shop"
            className="text-sm text-secondary transition-colors hover:text-primary hover:underline hover:underline-offset-4"
          >
            {footer("links.bestSellers")}
          </Link>
          <Link
            href="/#collections"
            className="text-sm text-secondary transition-colors hover:text-primary hover:underline hover:underline-offset-4"
          >
            {footer("links.collections")}
          </Link>
          <Link
            href="#"
            className="text-sm text-secondary transition-colors hover:text-primary hover:underline hover:underline-offset-4"
          >
            {footer("links.giftCards")}
          </Link>
        </div>

        <div className="flex flex-col space-y-4">
          <h4 className="mb-2 text-xs font-semibold uppercase text-primary">
            {t("footer.support")}
          </h4>
          <Link
            href="#"
            className="text-sm text-secondary transition-colors hover:text-primary hover:underline hover:underline-offset-4"
          >
            {t("nav.sustainability")}
          </Link>
          <Link
            href={LEGAL_PATHS.returns}
            className="text-sm text-secondary transition-colors hover:text-primary hover:underline hover:underline-offset-4"
          >
            {t("footer.shippingReturns")}
          </Link>
          <Link
            href={LEGAL_PATHS.privacy}
            className="text-sm text-secondary transition-colors hover:text-primary hover:underline hover:underline-offset-4"
          >
            {footer("links.privacy")}
          </Link>
          <Link
            href={LEGAL_PATHS.terms}
            className="text-sm text-secondary transition-colors hover:text-primary hover:underline hover:underline-offset-4"
          >
            {footer("links.terms")}
          </Link>
        </div>

        <div className="flex flex-col space-y-4">
          <h4 className="mb-2 text-xs font-semibold uppercase text-primary">
            {footer("connect")}
          </h4>
          <p className="text-sm text-secondary">{t("empty.newsletterHint")}</p>
          <NewsletterSignupForm source="cart-empty" variant="cart" className="mt-2" />
        </div>
      </div>

      <div className="mx-auto mt-16 flex max-w-[1440px] flex-col items-center justify-between px-5 opacity-60 md:flex-row md:px-16">
        <p className="text-sm text-secondary">{t("empty.copyright")}</p>
        <div className="mt-4 flex space-x-6 md:mt-0">
          <span className="text-xs font-semibold uppercase">Instagram</span>
          <span className="text-xs font-semibold uppercase">TikTok</span>
          <span className="text-xs font-semibold uppercase">YouTube</span>
        </div>
      </div>
    </footer>
  );
}
