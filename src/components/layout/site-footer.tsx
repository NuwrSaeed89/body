import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LEGAL_PATHS } from "@/lib/legal-pages";

const footerLinksMobile = {
  shop: [
    { labelKey: "footer.links.newArrivals", href: "/new-drops" as const },
    { labelKey: "footer.links.collections", href: "/#collections" as const },
  ],
  support: [
    { labelKey: "footer.links.shipping", href: LEGAL_PATHS.returns },
    { labelKey: "footer.links.returns", href: LEGAL_PATHS.returns },
  ],
} as const;

const footerLinks = {
  shop: [
    ...footerLinksMobile.shop,
    { labelKey: "footer.links.bestSellers", href: "/shop" as const },
    { labelKey: "footer.links.giftCards", href: "#" as const },
  ],
  support: [
    ...footerLinksMobile.support,
    { labelKey: "footer.links.faq", href: "#" },
    { labelKey: "footer.links.contact", href: "#" },
  ],
} as const;

export async function SiteFooter() {
  const t = await getTranslations();
  const a11y = await getTranslations("a11y");

  return (
    <footer
      className="mb-16 bg-surface-container-low px-5 py-12 md:mb-0 md:mt-20 md:border-t md:border-outline-variant/30 md:py-16"
      aria-label={a11y("siteFooter")}
    >
      <div className="mx-auto max-w-[1440px] md:px-16">
        {/* Mobile layout */}
        <div className="mb-12 grid grid-cols-2 gap-8 md:hidden">
          <div className="col-span-2">
            <span className="mb-2 block text-lg font-semibold tracking-wide text-primary">
              Mbody
            </span>
            <p className="text-xs leading-relaxed text-on-surface-variant">
              {t("footer.taglineMobile")}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h5 className="text-[10px] font-semibold uppercase tracking-[0.1em] text-primary">
              {t("footer.shop")}
            </h5>
            <nav
              className="flex flex-col gap-2"
              aria-label={`${t("footer.shop")} — ${a11y("footerNav")}`}
            >
              {footerLinksMobile.shop.map((link) => (
                <Link
                  key={link.labelKey}
                  href={link.href}
                  className="text-xs text-on-surface-variant transition-colors hover:text-primary"
                >
                  {t(link.labelKey)}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-3">
            <h5 className="text-[10px] font-semibold uppercase tracking-[0.1em] text-primary">
              {t("footer.support")}
            </h5>
            <nav
              className="flex flex-col gap-2"
              aria-label={`${t("footer.support")} — ${a11y("footerNav")}`}
            >
              {footerLinksMobile.support.map((link) => (
                <Link
                  key={link.labelKey}
                  href={link.href}
                  className="text-xs text-on-surface-variant transition-colors hover:text-primary"
                >
                  {t(link.labelKey)}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Desktop layout */}
        <div className="hidden grid-cols-4 gap-6 py-20 lg:grid-cols-6 md:grid">
          <div className="col-span-2">
            <Link href="/" className="text-lg font-semibold tracking-wide text-primary">
              Mbody
            </Link>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-secondary">
              {t("footer.tagline")}
            </p>
          </div>
          <div>
            <h4 className="mb-6 text-xs font-semibold uppercase tracking-[0.1em] text-primary">
              {t("footer.shop")}
            </h4>
            <nav aria-label={`${t("footer.shop")} — ${a11y("footerNav")}`}>
            <ul className="space-y-4">
              {footerLinks.shop.map((link) => (
                <li key={link.labelKey}>
                  <Link
                    href={link.href}
                    className="text-sm text-secondary underline decoration-1 underline-offset-4 hover:text-primary"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
            </nav>
          </div>
          <div>
            <h4 className="mb-6 text-xs font-semibold uppercase tracking-[0.1em] text-primary">
              {t("footer.support")}
            </h4>
            <nav aria-label={`${t("footer.support")} — ${a11y("footerNav")}`}>
            <ul className="space-y-4">
              {footerLinks.support.map((link) => (
                <li key={link.labelKey}>
                  <Link
                    href={link.href}
                    className="text-sm text-secondary underline decoration-1 underline-offset-4 hover:text-primary"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
            </nav>
          </div>
        </div>

        <div className="border-t border-outline-variant/30 pt-8 text-center md:border-outline-variant">
          <p className="text-[8px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant md:text-[10px]">
            {t("footer.copyright")}
          </p>
          <div className="mt-2 hidden justify-center gap-4 md:flex">
            <Link
              href={LEGAL_PATHS.privacy}
              className="text-[10px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant underline"
            >
              {t("footer.links.privacy")}
            </Link>
            <Link
              href={LEGAL_PATHS.terms}
              className="text-[10px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant underline"
            >
              {t("footer.links.terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
