"use client";

import { WishlistToggleButton } from "@/components/wishlist/wishlist-toggle-button";
import { useWishlist } from "@/providers/wishlist-provider";

type ProductCardWishlistActionProps = {
  productId: string;
  className?: string;
};

export function ProductCardWishlistAction({
  productId,
  className = "",
}: ProductCardWishlistActionProps) {
  const { isInWishlist, mounted } = useWishlist();
  const active = mounted && isInWishlist(productId);

  return (
    <WishlistToggleButton
      productId={productId}
      className={`absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-105 active:scale-95 max-md:pointer-events-auto max-md:!opacity-100 md:right-4 md:top-4 md:h-9 md:w-9 ${
        active
          ? "!opacity-100 text-error"
          : "text-primary md:opacity-0 md:group-hover:opacity-100"
      } ${className}`}
      iconClassName="text-[20px]"
    />
  );
}
