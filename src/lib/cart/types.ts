export type CartItem = {
  id: string;
  variantId: string;
  productId: string;
  productSlug: string;
  productName: string;
  size: string;
  colorName: string;
  quantity: number;
  priceSek: number;
  image: string;
  imageAlt: string;
};

export type AddToCartResult =
  | { ok: true; itemCount: number }
  | { ok: false; error: "not_signed_in" | "profile_not_found" | "variant_not_found" | "out_of_stock" | "server_error" };

export type CartMutationResult =
  | { ok: true; itemCount: number }
  | { ok: false; error: "item_not_found" | "out_of_stock" | "invalid_quantity" | "server_error" };
