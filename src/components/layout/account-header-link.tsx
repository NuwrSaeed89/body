"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/providers/auth-provider";

type AccountHeaderLinkProps = {
  className?: string;
  children: ReactNode;
};

export function AccountHeaderLink({ className = "", children }: AccountHeaderLinkProps) {
  const t = useTranslations("header.aria");
  const { isAuthenticated, mounted } = useAuth();
  const href = mounted && isAuthenticated ? "/account" : "/account/login";

  return (
    <Link
      href={href}
      className={className}
      aria-label={t("person")}
      suppressHydrationWarning
    >
      {children}
    </Link>
  );
}
