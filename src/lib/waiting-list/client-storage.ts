export const STOCK_NOTIFY_STORAGE_PREFIX = "mbody-stock-notify-";
export const STOCK_NOTIFY_CHANGE_EVENT = "mbody-stock-notify-change";

export function stockNotifyStorageKey(productId: string, variantId: string | null): string {
  return `${STOCK_NOTIFY_STORAGE_PREFIX}${productId}::${variantId ?? "all"}`;
}

export function hasClientStockNotifySubscription(
  productId: string,
  variantId: string | null,
): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(stockNotifyStorageKey(productId, variantId)) === "1";
}

export function markClientStockNotifySubscription(
  productId: string,
  variantId: string | null,
): void {
  window.localStorage.setItem(stockNotifyStorageKey(productId, variantId), "1");
  window.dispatchEvent(
    new CustomEvent(STOCK_NOTIFY_CHANGE_EVENT, {
      detail: { productId, variantId },
    }),
  );
}

export function dispatchWaitingCountUpdate(slug: string, waitingCount: number): void {
  window.dispatchEvent(
    new CustomEvent("mbody-waiting-count-update", {
      detail: { slug, waitingCount },
    }),
  );
}
