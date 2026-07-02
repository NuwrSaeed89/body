"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocale } from "next-intl";
import { CART_CHANGE_EVENT } from "@/lib/cart/cart-events";
import type { AddToCartResult, CartItem } from "@/lib/cart/types";
import { useAuth } from "@/providers/auth-provider";

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  mounted: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
  addItem: (variantId: string, quantity?: number) => Promise<AddToCartResult>;
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

  const refresh = useCallback(async () => {
    if (!user?.email) {
      setItems([]);
      setItemCount(0);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        email: user.email,
        locale,
      });
      const response = await fetch(`/api/cart?${params.toString()}`);
      if (!response.ok) throw new Error("cart fetch failed");
      const body = (await response.json()) as {
        items?: CartItem[];
        itemCount?: number;
      };
      setItems(body.items ?? []);
      setItemCount(body.itemCount ?? 0);
    } catch {
      setItems([]);
      setItemCount(0);
    } finally {
      setLoading(false);
    }
  }, [user?.email, locale]);

  useEffect(() => {
    void refresh().finally(() => setMounted(true));
  }, [refresh]);

  useEffect(() => {
    const onCartChange = () => {
      void refresh();
    };
    window.addEventListener(CART_CHANGE_EVENT, onCartChange);
    return () => window.removeEventListener(CART_CHANGE_EVENT, onCartChange);
  }, [refresh]);

  const addItem = useCallback(
    async (variantId: string, quantity = 1): Promise<AddToCartResult> => {
      if (!isAuthenticated || !user?.email) {
        return { ok: false, error: "not_signed_in" };
      }

      try {
        const response = await fetch("/api/cart/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email,
            variantId,
            quantity,
          }),
        });

        const body = (await response.json()) as
          | { ok: true; itemCount: number }
          | { ok: false; error: string };

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
        await refresh();
        window.dispatchEvent(new CustomEvent(CART_CHANGE_EVENT));
        return { ok: true, itemCount: body.itemCount };
      } catch {
        return { ok: false, error: "server_error" };
      }
    },
    [isAuthenticated, user?.email, refresh],
  );

  const value = useMemo(
    () => ({
      items,
      itemCount,
      mounted,
      loading,
      refresh,
      addItem,
    }),
    [items, itemCount, mounted, loading, refresh, addItem],
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
