"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "@/i18n/navigation";

const navLinks = [
  { labelKey: "nav.newDrops", href: "/new-drops" as const },
  { labelKey: "nav.shopAll", href: "/shop" as const },
  { labelKey: "nav.collections", href: "/#collections" as const },
  { labelKey: "nav.about", href: "#" as const },
] as const;

const footerLinks = [
  { labelKey: "utilityBar.storeLocator", href: "#" as const },
  { labelKey: "utilityBar.support", href: "#" as const },
] as const;

export function MobileNav() {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);

  const drawer =
    mounted &&
    createPortal(
      <>
        <div
          className={`fixed inset-0 z-[200] bg-background transition-opacity duration-300 md:hidden ${
            open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={close}
          aria-hidden={!open}
        />

        <aside
          className={`fixed bottom-0 left-0 top-0 z-[210] flex w-[min(320px,85vw)] flex-col border-r border-outline-variant/20 bg-surface shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
          aria-hidden={!open}
          inert={!open ? true : undefined}
        >
          <div className="flex h-full flex-col overflow-y-auto p-8">
            <div className="mb-12 flex shrink-0 items-center justify-between">
              <Link
                href="/"
                className="text-2xl font-bold tracking-tighter text-primary"
                onClick={close}
              >
                Mbody
              </Link>
              <button
                type="button"
                className="material-symbols-outlined text-2xl text-primary"
                onClick={close}
                aria-label={t("header.aria.close")}
              >
                close
              </button>
            </div>

            <nav className="flex flex-col gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.labelKey}
                  href={link.href}
                  className="border-b border-outline-variant pb-2 text-2xl font-medium tracking-tight text-primary"
                  onClick={close}
                >
                  {t(link.labelKey)}
                </Link>
              ))}
            </nav>

            <div className="mt-auto flex shrink-0 flex-col gap-4 pt-12">
              {footerLinks.map((link) => (
                <Link
                  key={link.labelKey}
                  href={link.href}
                  className="text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant"
                  onClick={close}
                >
                  {t(link.labelKey)}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </>,
      document.body,
    );

  return (
    <>
      <button
        type="button"
        className="text-2xl text-primary md:hidden"
        onClick={() => setOpen(true)}
        aria-label={t("header.aria.menu")}
        aria-expanded={open}
      >
        <span className="material-symbols-outlined text-[24px]">menu</span>
      </button>
      {drawer}
    </>
  );
}
