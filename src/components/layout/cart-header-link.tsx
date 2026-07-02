"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MaterialIcon } from "@/components/ui/material-icon";
import { useAuth } from "@/providers/auth-provider";
import { useCart } from "@/providers/cart-provider";

type CartHeaderLinkProps = {
  className?: string;
  isDark?: boolean;
  children?: React.ReactNode;
};

export function CartHeaderLink({
  className = "",
  isDark = false,
  children,
}: CartHeaderLinkProps) {
  const t = useTranslations("header.aria");
  const { isAuthenticated, mounted: authMounted } = useAuth();
  const { itemCount, mounted: cartMounted } = useCart();

  const ready = authMounted && cartMounted;
  const showBadge = ready && isAuthenticated && itemCount > 0;
  const badgeLabel = itemCount > 9 ? "9+" : String(itemCount);

  return (
    <Link
      href="/cart"
      className={className}
      aria-label={t("shopping_bag")}
      suppressHydrationWarning
    >
      {children ?? <MaterialIcon name="shopping_bag" />}
      {showBadge && (
        <span
          className={`absolute -right-1 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-0.5 text-[8px] font-semibold text-white md:h-4 md:min-w-4 md:text-[9px] ${
            isDark ? "bg-white text-primary" : "bg-primary"
          }`}
        >
          <span className="md:hidden">{badgeLabel}</span>
          <span className="hidden md:inline">{badgeLabel}</span>
        </span>
      )}
    </Link>
  );
}
