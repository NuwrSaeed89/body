"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { CartHeaderLink } from "@/components/layout/cart-header-link";
import { MobileNav } from "@/components/layout/mobile-nav";

export function AccountMobileHeader() {
  const t = useTranslations("account");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 z-50 w-full bg-surface/80 backdrop-blur-md transition-shadow md:hidden ${
        scrolled ? "shadow-[0_10px_40px_-10px_rgba(18,18,18,0.05)]" : ""
      }`}
    >
      <div className="mx-auto grid h-16 w-full max-w-[600px] grid-cols-3 items-center px-5">
        <div className="flex justify-start">
          <MobileNav />
        </div>
        <h1 className="text-center text-lg font-semibold uppercase tracking-widest text-primary">
          {t("mobileTitle")}
        </h1>
        <div className="flex justify-end">
          <CartHeaderLink className="relative text-primary transition-transform active:scale-95" />
        </div>
      </div>
    </header>
  );
}
