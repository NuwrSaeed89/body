"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/providers/auth-provider";
import { useWishlist } from "@/providers/wishlist-provider";

type WishlistHeaderLinkProps = {
  className?: string;
  isDark?: boolean;
};

export function WishlistHeaderLink({ className = "", isDark = false }: WishlistHeaderLinkProps) {
  const t = useTranslations("header.aria");
  const { isAuthenticated, mounted: authMounted } = useAuth();
  const { count, mounted: wishlistMounted } = useWishlist();

  const ready = authMounted && wishlistMounted;
  const href =
    ready && isAuthenticated
      ? "/account/wishlist"
      : "/account/login?redirect=/account/wishlist";
  const showBadge = ready && isAuthenticated && count > 0;

  return (
    <Link href={href} className={className} aria-label={t("favorite")} suppressHydrationWarning>
      <span className="material-symbols-outlined">favorite</span>
      {showBadge && (
        <span
          className={`absolute -right-1 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-0.5 text-[8px] font-semibold text-white md:h-4 md:min-w-4 md:text-[9px] ${
            isDark ? "bg-white text-primary" : "bg-primary"
          }`}
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
