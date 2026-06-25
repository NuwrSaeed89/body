"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";

const navLinks = [
  { labelKey: "nav.newDrops", href: "/new-drops" as const },
  { labelKey: "nav.shopAll", href: "/shop" as const },
  { labelKey: "nav.collections", href: "/#collections" as const },
  { labelKey: "nav.about", href: "/#about" as const },
] as const;

const footerLinks = [
  { labelKey: "utilityBar.storeLocator", href: "#" as const },
  { labelKey: "utilityBar.support", href: "#" as const },
] as const;

export function MobileNav() {
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="text-primary md:hidden"
        onClick={() => setOpen(true)}
        aria-label={t("header.aria.menu")}
        aria-expanded={open}
      >
        <span className="material-symbols-outlined">menu</span>
      </button>

      <nav
        className={`fixed inset-0 z-[70] flex flex-col bg-white transition-transform duration-500 ease-in-out md:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!open}
      >
        <div className="flex h-full flex-col p-8">
          <div className="mb-12 flex items-center justify-between">
            <Link
              href="/"
              className="text-2xl font-medium tracking-tighter text-primary"
              onClick={() => setOpen(false)}
            >
              Mbody
            </Link>
            <button
              type="button"
              className="material-symbols-outlined text-3xl text-primary"
              onClick={() => setOpen(false)}
              aria-label={t("header.aria.close")}
            >
              close
            </button>
          </div>

          <div className="flex flex-col gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.labelKey}
                href={link.href}
                className="border-b border-outline-variant pb-2 text-3xl font-medium tracking-tight text-primary"
                onClick={() => setOpen(false)}
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </div>

          <div className="mt-auto flex flex-col gap-4">
            {footerLinks.map((link) => (
              <Link
                key={link.labelKey}
                href={link.href}
                className="text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant"
                onClick={() => setOpen(false)}
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}
