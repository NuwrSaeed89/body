import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AccountHeaderLink } from "@/components/layout/account-header-link";
import { WishlistHeaderLink } from "@/components/layout/wishlist-header-link";
import { MobileNav } from "./mobile-nav";
import { UtilityBar } from "./utility-bar";

const navLinks = [
  { labelKey: "nav.new", href: "/new-drops" as const },
  { labelKey: "nav.shop", href: "/shop" as const },
  { labelKey: "nav.collections", href: "/#collections" as const },
] as const;

type SiteHeaderProps = {
  variant?: "light" | "dark";
  layout?: "default" | "home";
};

export async function SiteHeader({
  variant = "light",
  layout = "default",
}: SiteHeaderProps) {
  const t = await getTranslations();
  const isDark = variant === "dark";
  const isHome = layout === "home";

  const mobileHomeIcons = ["search", "shopping_bag"] as const;
  const defaultIcons = ["search", "favorite", "person", "shopping_bag"] as const;
  const headerIcons = isHome ? mobileHomeIcons : defaultIcons;

  const headerClass = isHome
    ? "sticky top-0 z-50 w-full bg-surface/80 backdrop-blur-md"
    : `fixed top-0 z-50 w-full ${
        isDark
          ? "bg-transparent"
          : "border-b border-outline-variant/20 bg-surface/90 shadow-[0_4px_30px_rgba(18,18,18,0.03)] backdrop-blur-md"
      }`;

  return (
    <>
      {isHome && (
        <div className="hidden md:block">
          <UtilityBar />
        </div>
      )}
      <header
        className={`${headerClass} ${
          isHome ? "border-b border-outline-variant/30 bg-surface/90 backdrop-blur-md" : ""
        }`}
      >
        <div
          className={`mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 py-4 md:px-16 ${
            isHome ? "" : "h-20"
          }`}
        >
          <div className="flex items-center gap-4 md:gap-10">
            <MobileNav />
            <Link
              href="/"
              className={`text-2xl font-bold tracking-tighter md:text-2xl ${
                isDark ? "text-white" : "text-primary"
              }`}
            >
              Mbody
            </Link>
            <nav
              className="ml-0 hidden items-center gap-8 md:ml-12 md:flex"
              aria-label={t("a11y.primaryNav")}
            >
              {navLinks.map((link) => (
                <Link
                  key={link.labelKey}
                  href={link.href}
                  className={`text-xs font-semibold uppercase tracking-[0.1em] transition-colors ${
                    isDark
                      ? "text-white/70 hover:text-white"
                      : "text-secondary hover:text-primary"
                  }`}
                >
                  {t(link.labelKey)}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {headerIcons.map((icon) => {
                const className = `relative transition-opacity hover:opacity-70 ${
                  isDark ? "text-white" : "text-primary"
                }`;
                const iconEl = (
                  <>
                    <span className="material-symbols-outlined">{icon}</span>
                    {icon === "shopping_bag" && (
                      <span
                        className={`absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] font-semibold text-white md:h-2 md:w-2 ${
                          isDark ? "bg-white text-primary" : "bg-primary"
                        }`}
                      >
                        <span className="md:hidden">2</span>
                      </span>
                    )}
                  </>
                );

                return icon === "person" ? (
                  <AccountHeaderLink key={icon} className={className}>
                    {iconEl}
                  </AccountHeaderLink>
                ) : icon === "shopping_bag" ? (
                  <Link
                    key={icon}
                    href="/cart"
                    className={className}
                    aria-label={t(`header.aria.${icon}`)}
                  >
                    {iconEl}
                  </Link>
                ) : icon === "favorite" ? (
                  <WishlistHeaderLink
                    key={icon}
                    className={className}
                    isDark={isDark}
                  />
                ) : (
                  <button
                    key={icon}
                    type="button"
                    className={className}
                    aria-label={t(`header.aria.${icon}`)}
                  >
                    {iconEl}
                  </button>
                );
              })}
            {isHome &&
              defaultIcons
                .filter((icon) => icon !== "search" && icon !== "shopping_bag")
                .map((icon) => {
                  const className = `relative hidden transition-opacity hover:opacity-70 md:block ${
                    isDark ? "text-white" : "text-primary"
                  }`;
                  const iconEl = (
                    <>
                      <span className="material-symbols-outlined">{icon}</span>
                    </>
                  );

                  return icon === "person" ? (
                    <AccountHeaderLink key={icon} className={className}>
                      {iconEl}
                    </AccountHeaderLink>
                  ) : icon === "favorite" ? (
                    <WishlistHeaderLink
                      key={icon}
                      className={className}
                      isDark={isDark}
                    />
                  ) : null;
                })}
          </div>
        </div>
      </header>
    </>
  );
}
