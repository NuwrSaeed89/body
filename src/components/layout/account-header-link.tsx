"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { MaterialIcon } from "@/components/ui/material-icon";
import { useAuth } from "@/providers/auth-provider";

type AccountHeaderLinkProps = {
  className?: string;
};

const menuItemClassName =
  "flex w-full items-center gap-3 whitespace-nowrap px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors";

function AccountMenuItem({
  icon,
  children,
  className = "",
}: {
  icon: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <>
      <span className="material-symbols-outlined shrink-0 text-[18px] leading-none">{icon}</span>
      <span className={`truncate ${className}`}>{children}</span>
    </>
  );
}

export function AccountHeaderLink({ className = "" }: AccountHeaderLinkProps) {
  const t = useTranslations("header");
  const tAria = useTranslations("header.aria");
  const tAccount = useTranslations("account");
  const router = useRouter();
  const { isAuthenticated, mounted, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const signedIn = mounted && isAuthenticated;

  useEffect(() => {
    if (!open) return;

    const closeOnOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      setOpen(false);
      router.push("/");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  };

  if (!signedIn) {
    return (
      <Link
        href="/account/login"
        className={className}
        aria-label={tAria("person")}
        suppressHydrationWarning
      >
        <MaterialIcon name="person" />
      </Link>
    );
  }

  return (
    <div ref={menuRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={tAria("accountMenu")}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-0.5 transition-opacity hover:opacity-70"
      >
        <MaterialIcon name="person" />
        <span
          className={`material-symbols-outlined text-base leading-none transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          expand_more
        </span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-[100] mt-3 w-max min-w-[13.5rem] overflow-hidden rounded-xl border border-outline-variant/25 bg-surface/95 py-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.14)] backdrop-blur-md"
        >
          <Link
            href="/account"
            role="menuitem"
            onClick={() => setOpen(false)}
            className={`${menuItemClassName} text-primary hover:bg-surface-container-low`}
          >
            <AccountMenuItem icon="account_circle">{t("viewProfile")}</AccountMenuItem>
          </Link>

          <div className="mx-3 my-1 h-px bg-outline-variant/25" aria-hidden />

          <button
            type="button"
            role="menuitem"
            disabled={signingOut}
            onClick={() => void handleSignOut()}
            className={`${menuItemClassName} text-secondary hover:bg-surface-container-low hover:text-primary disabled:opacity-50`}
          >
            <AccountMenuItem icon="logout">{tAccount("signOut")}</AccountMenuItem>
          </button>
        </div>
      ) : null}
    </div>
  );
}
