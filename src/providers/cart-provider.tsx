"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocale } from "next-intl";
import { CART_CHANGE_EVENT } from "@/lib/cart/cart-events";
import {
  addGuestCartEntry,
  clearGuestCart,
  GUEST_CART_CHANGE_EVENT,
  guestCartItemCount,
  readGuestCart,
  removeGuestCartEntry,
  setGuestCartEntryQuantity,
} from "@/lib/cart/guest-cart-storage";
import { shouldUseCartMock } from "@/lib/cart/should-use-cart-mock";
import type { AddToCartResult, CartItem, CartMutationResult } from "@/lib/cart/types";
import { useAuth } from "@/providers/auth-provider";

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  mounted: boolean;
  loading: boolean;
  isGuestCart: boolean;
  refresh: (options?: { silent?: boolean }) => Promise<void>;
  addItem: (variantId: string, quantity?: number) => Promise<AddToCartResult>;
  updateItemQuantity: (itemId: string, quantity: number) => Promise<CartMutationResult>;
  removeItem: (itemId: string) => Promise<CartMutationResult>;
};

const CartContext = createContext<CartContextValue | null>(null);

type CartProviderProps = {
  children: ReactNode;
};

export function CartProvider({ children }: CartProviderProps) {
  const locale = useLocale();
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [itemCount, setItemCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const mergingRef = useRef(false);

  const useGuestCart = !shouldUseCartMock() && !isAuthenticated;

  const fetchGuestPreview = useCallback(async (): Promise<{
    items: CartItem[];
    itemCount: number;
  }> => {
    const entries = readGuestCart();
    if (entries.length === 0) {
      setItems([]);
      setItemCount(0);
      return { items: [], itemCount: 0 };
    }

    const params = new URLSearchParams({ locale });
    const response = await fetch(`/api/cart/preview?${params.toString()}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ items: entries }),
    });

    if (!response.ok) throw new Error("guest cart preview failed");

    const body = (await response.json()) as {
      items?: CartItem[];
      itemCount?: number;
    };
    const nextItems = body.items ?? [];
    const nextCount = body.itemCount ?? guestCartItemCount(entries);
    setItems(nextItems);
    setItemCount(nextCount);
    return { items: nextItems, itemCount: nextCount };
  }, [locale]);

  const fetchAuthenticatedCart = useCallback(async () => {
    const params = new URLSearchParams({ locale });
    const response = await fetch(`/api/cart?${params.toString()}`, {
      credentials: "include",
      cache: "no-store",
    });
    if (response.status === 401) {
      setItems([]);
      setItemCount(0);
      return;
    }
    if (!response.ok) throw new Error("cart fetch failed");
    const body = (await response.json()) as {
      items?: CartItem[];
      itemCount?: number;
    };
    setItems(body.items ?? []);
    setItemCount(body.itemCount ?? 0);
  }, [locale]);

  const refresh = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    if (shouldUseCartMock()) {
      if (!isAuthenticated || !user?.id) {
        setItems([]);
        setItemCount(0);
        return;
      }
      if (!silent) setLoading(true);
      try {
        await fetchAuthenticatedCart();
      } catch {
        setItems([]);
        setItemCount(0);
      } finally {
        if (!silent) setLoading(false);
      }
      return;
    }

    if (!isAuthenticated) {
      if (!silent) setLoading(true);
      try {
        await fetchGuestPreview();
      } catch {
        setItems([]);
        setItemCount(guestCartItemCount());
      } finally {
        if (!silent) setLoading(false);
      }
      return;
    }

    if (!silent) setLoading(true);
    try {
      await fetchAuthenticatedCart();
    } catch {
      setItems([]);
      setItemCount(0);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [isAuthenticated, user?.id, fetchAuthenticatedCart, fetchGuestPreview]);

  const mergeGuestCart = useCallback(async () => {
    if (!isAuthenticated || !user?.id || shouldUseCartMock() || mergingRef.current) return;

    const entries = readGuestCart();
    if (entries.length === 0) return;

    mergingRef.current = true;
    setLoading(true);
    try {
      const params = new URLSearchParams({ locale });
      const response = await fetch(`/api/cart/merge?${params.toString()}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: entries }),
      });

      if (response.ok) {
        clearGuestCart();
        await fetchAuthenticatedCart();
        window.dispatchEvent(new CustomEvent(CART_CHANGE_EVENT));
      }
    } catch {
      // Keep guest cart for a later retry.
    } finally {
      mergingRef.current = false;
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, locale, fetchAuthenticatedCart]);

  useEffect(() => {
    void refresh().finally(() => setMounted(true));
  }, [refresh]);

  useEffect(() => {
    if (!isAuthenticated || shouldUseCartMock()) return;
    void mergeGuestCart();
  }, [isAuthenticated, user?.id, mergeGuestCart]);

  useEffect(() => {
    const onCartChange = () => {
      void refresh({ silent: true });
    };
    window.addEventListener(CART_CHANGE_EVENT, onCartChange);
    window.addEventListener(GUEST_CART_CHANGE_EVENT, onCartChange);
    return () => {
      window.removeEventListener(CART_CHANGE_EVENT, onCartChange);
      window.removeEventListener(GUEST_CART_CHANGE_EVENT, onCartChange);
    };
  }, [refresh]);

  const addItem = useCallback(
    async (variantId: string, quantity = 1): Promise<AddToCartResult> => {
      if (shouldUseCartMock()) {
        if (!isAuthenticated || !user?.id) {
          return { ok: false, error: "not_signed_in" };
        }
      } else if (!isAuthenticated) {
        try {
          const previous = readGuestCart().find((entry) => entry.variantId === variantId)?.quantity ?? 0;
          addGuestCartEntry(variantId, quantity);
          const { items: previewItems } = await fetchGuestPreview();

          const previewItem = readGuestCart().find((entry) => entry.variantId === variantId);
          const displayed = previewItems.find((item) => item.variantId === variantId);

          if (!previewItem || !displayed) {
            if (previous > 0) {
              setGuestCartEntryQuantity(variantId, previous);
            } else {
              removeGuestCartEntry(variantId);
            }
            await fetchGuestPreview();
            return { ok: false, error: "variant_not_found" };
          }

          const requested = previous + quantity;
          if (displayed.quantity < requested) {
            setGuestCartEntryQuantity(variantId, displayed.quantity);
            await fetchGuestPreview();
            if (displayed.quantity <= previous) {
              return { ok: false, error: "out_of_stock" };
            }
          }

          const nextCount = guestCartItemCount();
          setItemCount(nextCount);
          window.dispatchEvent(new CustomEvent(GUEST_CART_CHANGE_EVENT));
          return { ok: true, itemCount: nextCount };
        } catch {
          return { ok: false, error: "server_error" };
        }
      }

      if (!isAuthenticated || !user?.id) {
        return { ok: false, error: "not_signed_in" };
      }

      try {
        const response = await fetch("/api/cart/items", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variantId, quantity }),
        });

        const body = (await response.json()) as
          | { ok: true; itemCount: number }
          | { ok: false; error: string };

        if (response.status === 401) {
          return { ok: false, error: "not_signed_in" };
        }

        if (!response.ok || !body.ok) {
          const error = !body.ok ? body.error : "server_error";
          if (error === "profile_not_found") {
            return { ok: false, error: "profile_not_found" };
          }
          if (error === "out_of_stock") {
            return { ok: false, error: "out_of_stock" };
          }
          if (error === "variant_not_found") {
            return { ok: false, error: "variant_not_found" };
          }
          return { ok: false, error: "server_error" };
        }

        setItemCount(body.itemCount);
        await refresh({ silent: true });
        window.dispatchEvent(new CustomEvent(CART_CHANGE_EVENT));
        return { ok: true, itemCount: body.itemCount };
      } catch {
        return { ok: false, error: "server_error" };
      }
    },
    [isAuthenticated, user?.id, refresh, fetchGuestPreview],
  );

  const mutateCartItem = useCallback(
    async (itemId: string, init: RequestInit): Promise<CartMutationResult> => {
      const snapshot = { items, itemCount };
      const targetItem = items.find((item) => item.id === itemId);

      const applyOptimisticUpdate = () => {
        if (!targetItem) return;

        if (init.method === "DELETE") {
          setItems((current) => current.filter((item) => item.id !== itemId));
          setItemCount((current) => Math.max(0, current - targetItem.quantity));
          return;
        }

        const body = init.body ? (JSON.parse(String(init.body)) as { quantity?: number }) : {};
        const quantity = body.quantity ?? 0;

        if (quantity <= 0) {
          setItems((current) => current.filter((item) => item.id !== itemId));
          setItemCount((current) => Math.max(0, current - targetItem.quantity));
          return;
        }

        setItems((current) =>
          current.map((item) => (item.id === itemId ? { ...item, quantity } : item)),
        );
        setItemCount((current) => current - targetItem.quantity + quantity);
      };

      if (!shouldUseCartMock() && !isAuthenticated) {
        try {
          const entry = readGuestCart().find((row) => row.variantId === itemId);
          if (!entry) return { ok: false, error: "item_not_found" };

          applyOptimisticUpdate();

          if (init.method === "DELETE") {
            removeGuestCartEntry(itemId);
          } else {
            const body = init.body ? (JSON.parse(String(init.body)) as { quantity?: number }) : {};
            const quantity = body.quantity ?? 0;
            if (!Number.isInteger(quantity) || quantity < 0) {
              setItems(snapshot.items);
              setItemCount(snapshot.itemCount);
              return { ok: false, error: "invalid_quantity" };
            }
            if (quantity === 0) {
              removeGuestCartEntry(itemId);
            } else {
              setGuestCartEntryQuantity(itemId, quantity);
            }
          }

          const preview = await fetchGuestPreview();
          const nextCount = preview.itemCount;
          setItemCount(nextCount);
          window.dispatchEvent(new CustomEvent(GUEST_CART_CHANGE_EVENT));
          return { ok: true, itemCount: nextCount };
        } catch {
          setItems(snapshot.items);
          setItemCount(snapshot.itemCount);
          return { ok: false, error: "server_error" };
        }
      }

      if (!isAuthenticated || !user?.id) {
        return { ok: false, error: "item_not_found" };
      }

      applyOptimisticUpdate();

      try {
        const params = new URLSearchParams({ locale });
        const response = await fetch(`/api/cart/items/${encodeURIComponent(itemId)}?${params.toString()}`, {
          credentials: "include",
          cache: "no-store",
          ...init,
        });

        const body = (await response.json()) as
          | { ok: true; itemCount: number }
          | { ok: false; error: string };

        if (!response.ok || !body.ok) {
          setItems(snapshot.items);
          setItemCount(snapshot.itemCount);
          const error = !body.ok ? body.error : "server_error";
          if (error === "out_of_stock") {
            return { ok: false, error: "out_of_stock" };
          }
          if (error === "invalid_quantity") {
            return { ok: false, error: "invalid_quantity" };
          }
          if (error === "item_not_found") {
            return { ok: false, error: "item_not_found" };
          }
          return { ok: false, error: "server_error" };
        }

        setItemCount(body.itemCount);
        window.dispatchEvent(new CustomEvent(CART_CHANGE_EVENT));
        return { ok: true, itemCount: body.itemCount };
      } catch {
        setItems(snapshot.items);
        setItemCount(snapshot.itemCount);
        return { ok: false, error: "server_error" };
      }
    },
    [isAuthenticated, user?.id, locale, items, itemCount, fetchGuestPreview],
  );

  const updateItemQuantity = useCallback(
    async (itemId: string, quantity: number): Promise<CartMutationResult> => {
      return mutateCartItem(itemId, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
    },
    [mutateCartItem],
  );

  const removeItem = useCallback(
    async (itemId: string): Promise<CartMutationResult> => {
      return mutateCartItem(itemId, { method: "DELETE" });
    },
    [mutateCartItem],
  );

  const value = useMemo(
    () => ({
      items,
      itemCount,
      mounted,
      loading,
      isGuestCart: useGuestCart,
      refresh,
      addItem,
      updateItemQuantity,
      removeItem,
    }),
    [items, itemCount, mounted, loading, useGuestCart, refresh, addItem, updateItemQuantity, removeItem],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
