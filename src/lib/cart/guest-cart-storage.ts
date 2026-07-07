export const GUEST_CART_STORAGE_KEY = "mbody-guest-cart";
export const GUEST_CART_CHANGE_EVENT = "mbody-guest-cart-change";

export type GuestCartEntry = {
  variantId: string;
  quantity: number;
};

function dispatchGuestCartChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(GUEST_CART_CHANGE_EVENT));
}

export function readGuestCart(): GuestCartEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GUEST_CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (entry): entry is GuestCartEntry =>
          typeof entry?.variantId === "string" &&
          typeof entry?.quantity === "number" &&
          entry.quantity > 0,
      )
      .map((entry) => ({
        variantId: entry.variantId,
        quantity: Math.floor(entry.quantity),
      }));
  } catch {
    return [];
  }
}

export function writeGuestCart(entries: GuestCartEntry[]) {
  if (typeof window === "undefined") return;
  const normalized = entries.filter((entry) => entry.quantity > 0);
  if (normalized.length === 0) {
    window.localStorage.removeItem(GUEST_CART_STORAGE_KEY);
  } else {
    window.localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(normalized));
  }
  dispatchGuestCartChange();
}

export function clearGuestCart() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(GUEST_CART_STORAGE_KEY);
  dispatchGuestCartChange();
}

export function addGuestCartEntry(variantId: string, quantity: number): GuestCartEntry[] {
  const entries = readGuestCart();
  const existing = entries.find((entry) => entry.variantId === variantId);
  const next = existing
    ? entries.map((entry) =>
        entry.variantId === variantId
          ? { ...entry, quantity: entry.quantity + quantity }
          : entry,
      )
    : [...entries, { variantId, quantity }];
  writeGuestCart(next);
  return next;
}

export function setGuestCartEntryQuantity(variantId: string, quantity: number): GuestCartEntry[] {
  const next =
    quantity <= 0
      ? readGuestCart().filter((entry) => entry.variantId !== variantId)
      : readGuestCart().map((entry) =>
          entry.variantId === variantId ? { ...entry, quantity } : entry,
        );
  if (quantity > 0 && !next.some((entry) => entry.variantId === variantId)) {
    next.push({ variantId, quantity });
  }
  writeGuestCart(next);
  return next;
}

export function removeGuestCartEntry(variantId: string): GuestCartEntry[] {
  const next = readGuestCart().filter((entry) => entry.variantId !== variantId);
  writeGuestCart(next);
  return next;
}

export function guestCartItemCount(entries: GuestCartEntry[] = readGuestCart()): number {
  return entries.reduce((sum, entry) => sum + entry.quantity, 0);
}
