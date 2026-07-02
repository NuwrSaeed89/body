export const CART_CHANGE_EVENT = "mbody-cart-change";

export function dispatchCartChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CART_CHANGE_EVENT));
}
