export const WISHLIST_STORAGE_PREFIX = "mbody-wishlist-";
export const WISHLIST_CHANGE_EVENT = "mbody-wishlist-change";
export const LIKE_COUNT_UPDATE_EVENT = "mbody-like-count-update";

function storageKey(userId: string) {
  return `${WISHLIST_STORAGE_PREFIX}${userId}`;
}

export function readWishlist(userId: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

export function writeWishlist(userId: string, productIds: string[]) {
  window.localStorage.setItem(storageKey(userId), JSON.stringify(productIds));
  window.dispatchEvent(
    new CustomEvent(WISHLIST_CHANGE_EVENT, { detail: { userId } }),
  );
}

/** Push an absolute like count (from API) or a +/- delta (optimistic / mock). */
export function dispatchLikeCountUpdate(
  productId: string,
  update: { likeCount: number } | { delta: number },
): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(LIKE_COUNT_UPDATE_EVENT, {
      detail: { productId, ...update },
    }),
  );
}
