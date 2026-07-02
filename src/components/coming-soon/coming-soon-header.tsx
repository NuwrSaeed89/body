import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ComingSoonHeaderIcons } from "./coming-soon-header-icons";

const shellNav = [
  { labelKey: "navShop" as const },
  { labelKey: "navCollections" as const },
  { labelKey: "navPerformance" as const },
  { labelKey: "navAbout" as const },
] as const;

export async function ComingSoonHeader() {
  const t = await getTranslations("launch");

  return (
    <header className="fixed top-0 z-50 w-full bg-gradient-to-b from-black/40 to-transparent">
      <div className="mx-auto grid h-20 max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 md:px-16">
        <Link
          href="/"
          className="justify-self-start text-2xl font-medium tracking-tighter text-white"
        >
          Mbody
        </Link>

        <nav
          className="hidden items-center gap-5 whitespace-nowrap lg:flex"
          aria-hidden
        >
          {shellNav.map((item) => (
            <span
              key={item.labelKey}
              className="cursor-default text-xs font-semibold uppercase tracking-[0.1em] text-white/70"
            >
              {t(item.labelKey)}
            </span>
          ))}
        </nav>

        <ComingSoonHeaderIcons />
      </div>
    </header>
  );
}
