import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MobileNav } from "./mobile-nav";
import { UtilityBar } from "./utility-bar";
import { LocaleSwitcher } from "./locale-switcher";

const navLinks = [
  { labelKey: "nav.shop", href: "/shop" as const },
  { labelKey: "nav.newDrops", href: "/new-drops" as const },
  { labelKey: "nav.collections", href: "/#collections" as const },
  { labelKey: "nav.about", href: "/#about" as const },
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

  const headerClass = isHome
    ? "sticky top-0 z-50 w-full bg-surface/80 backdrop-blur-md md:fixed md:border-b md:border-outline-variant/20 md:bg-surface/90 md:shadow-[0_4px_30px_rgba(18,18,18,0.03)]"
    : `fixed top-0 z-50 w-full ${
        isDark
          ? "bg-transparent"
          : "border-b border-outline-variant/20 bg-surface/90 shadow-[0_4px_30px_rgba(18,18,18,0.03)] backdrop-blur-md"
      }`;

  return (
    <>
      {isHome && <UtilityBar />}
      <header className={headerClass}>
        <div
          className={`mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 md:h-20 md:px-16 ${
            isHome ? "py-4" : "h-20"
          }`}
        >
          <div className="flex items-center gap-4 md:gap-10">
            <MobileNav />
            <Link
              href="/"
              className={`text-2xl font-medium tracking-tighter md:text-3xl ${
                isDark ? "text-white" : "text-primary"
              }`}
            >
              Mbody
            </Link>
            <nav className="ml-0 hidden gap-8 md:ml-12 md:flex">
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

          <div className="flex items-center gap-3 md:gap-4">
            <div className="hidden items-center gap-3 text-xs font-semibold uppercase tracking-[0.08em] md:flex">
              <LocaleSwitcher variant={variant} />
              <span className={isDark ? "text-white/30" : "text-outline-variant"}>
                |
              </span>
              <span className={isDark ? "text-white/70" : "text-secondary"}>
                {t("header.currency")}
              </span>
            </div>
            {(["search", "favorite", "person", "shopping_bag"] as const).map(
              (icon) => {
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
                  <Link
                    key={icon}
                    href="/account/login"
                    className={className}
                    aria-label={t(`header.aria.${icon}`)}
                  >
                    {iconEl}
                  </Link>
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
              },
            )}
          </div>
        </div>
      </header>
    </>
  );
}
