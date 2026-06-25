import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const footerLinks = {
  shop: [
    { labelKey: "footer.links.newArrivals", href: "/new-drops" as const },
    { labelKey: "footer.links.bestSellers", href: "/shop" as const },
    { labelKey: "footer.links.collections", href: "/#collections" as const },
    { labelKey: "footer.links.giftCards", href: "#" as const },
  ],
  support: [
    { labelKey: "footer.links.shipping", href: "#" },
    { labelKey: "footer.links.returns", href: "#" },
    { labelKey: "footer.links.faq", href: "#" },
    { labelKey: "footer.links.contact", href: "#" },
  ],
} as const;

export async function SiteFooter() {
  const t = await getTranslations();

  return (
    <footer className="bg-surface-container-low px-5 py-16 md:mt-20 md:border-t md:border-outline-variant/30">
      <div className="mx-auto max-w-[1440px] md:px-16">
        {/* Mobile layout */}
        <div className="mb-16 grid grid-cols-2 gap-x-6 gap-y-12 md:hidden">
          <div className="col-span-2">
            <span className="mb-4 block text-lg font-semibold tracking-wide text-primary">
              Mbody
            </span>
            <p className="max-w-[240px] text-sm leading-relaxed text-on-surface-variant">
              {t("footer.taglineMobile")}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h5 className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">
              {t("footer.shop")}
            </h5>
            <nav className="flex flex-col gap-2">
              {footerLinks.shop.map((link) => (
                <Link
                  key={link.labelKey}
                  href={link.href}
                  className="text-sm text-on-surface-variant transition-colors hover:text-primary"
                >
                  {t(link.labelKey)}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-4">
            <h5 className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">
              {t("footer.support")}
            </h5>
            <nav className="flex flex-col gap-2">
              {footerLinks.support.map((link) => (
                <Link
                  key={link.labelKey}
                  href={link.href}
                  className="text-sm text-on-surface-variant transition-colors hover:text-primary"
                >
                  {t(link.labelKey)}
                </Link>
              ))}
            </nav>
          </div>

          <div className="col-span-2 flex justify-start gap-8 pt-4">
            {(["facebook", "photo_camera", "music_note"] as const).map((icon) => (
              <Link
                key={icon}
                href="#"
                className="text-on-surface-variant transition-colors hover:text-primary"
              >
                <span className="material-symbols-outlined">{icon}</span>
              </Link>
            ))}
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
          </div>
          <div>
            <h4 className="mb-6 text-xs font-semibold uppercase tracking-[0.1em] text-primary">
              {t("footer.support")}
            </h4>
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
          </div>
        </div>

        <div className="border-t border-outline-variant pt-8">
          <div className="mb-8 flex flex-wrap justify-center gap-6 opacity-60 md:hidden">
            {(["credit_card", "account_balance", "payments", "contactless"] as const).map(
              (icon) => (
                <span key={icon} className="material-symbols-outlined">
                  {icon}
                </span>
              ),
            )}
          </div>
          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
              {t("footer.copyright")}
            </p>
            <div className="mt-2 flex justify-center gap-4">
              <Link
                href="#"
                className="text-[10px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant underline"
              >
                {t("footer.links.privacy")}
              </Link>
              <Link
                href="#"
                className="text-[10px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant underline"
              >
                {t("footer.links.terms")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
