"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/providers/auth-provider";
import { useWishlist } from "@/providers/wishlist-provider";

type WishlistToggleButtonProps = {
  productId: string;
  variant?: "icon" | "labeled";
  className?: string;
  iconClassName?: string;
  labelClassName?: string;
  filledWhenActive?: boolean;
  onToggle?: (added: boolean) => void;
};

export function WishlistToggleButton({
  productId,
  variant = "icon",
  className = "",
  iconClassName = "text-[20px]",
  labelClassName = "",
  filledWhenActive = true,
  onToggle,
}: WishlistToggleButtonProps) {
  const t = useTranslations("wishlist");
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, mounted: authMounted } = useAuth();
  const { isInWishlist, toggle, mounted: wishlistMounted } = useWishlist();

  const active = wishlistMounted && isInWishlist(productId);
  const label = active ? t("removeFromWishlist") : t("addToWishlist");

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!authMounted || !wishlistMounted) return;

    if (!isAuthenticated) {
      const redirect = encodeURIComponent(pathname);
      router.push(`/account/login?redirect=${redirect}`);
      return;
    }

    const added = toggle(productId);
    onToggle?.(added);
  };

  const labeledClassName =
    variant === "labeled"
      ? "flex w-full items-center justify-center gap-2 border border-primary py-4 text-xs font-semibold uppercase tracking-[0.15em] text-primary transition-colors hover:bg-primary hover:text-on-primary"
      : "";

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${labeledClassName} ${className}`.trim()}
      aria-label={variant === "icon" ? label : undefined}
      aria-pressed={active}
    >
      <span
        className={`material-symbols-outlined ${iconClassName}`}
        style={
          active && filledWhenActive
            ? { fontVariationSettings: "'FILL' 1" }
            : undefined
        }
      >
        favorite
      </span>
      {variant === "labeled" && (
        <span className={labelClassName}>{label}</span>
      )}
    </button>
  );
}
