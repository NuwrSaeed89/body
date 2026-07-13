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
import {
  readWishlist,
  WISHLIST_CHANGE_EVENT,
  writeWishlist,
} from "@/lib/wishlist-storage";
import { publicEnv } from "@/lib/env";
import { useAuth } from "@/providers/auth-provider";

type WishlistContextValue = {
  productIds: string[];
  count: number;
  mounted: boolean;
  isInWishlist: (productId: string) => boolean;
  add: (productId: string) => boolean;
  remove: (productId: string) => boolean;
  toggle: (productId: string) => boolean;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

type WishlistProviderProps = {
  children: ReactNode;
};

function useLiveWishlist(): boolean {
  return !publicEnv.useMockData && Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey);
}

export function WishlistProvider({ children }: WishlistProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const [productIds, setProductIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const live = useLiveWishlist();

  const syncFromStorage = useCallback(() => {
    if (!user) {
      setProductIds([]);
      return;
    }
    setProductIds(readWishlist(user.id));
  }, [user]);

  const persistLocal = useCallback(
    (next: string[]) => {
      if (!user) return;
      writeWishlist(user.id, next);
      setProductIds(next);
    },
    [user],
  );

  useEffect(() => {
    syncFromStorage();
    setMounted(true);
  }, [syncFromStorage]);

  useEffect(() => {
    const onWishlistChange = (event: Event) => {
      const detail = (event as CustomEvent<{ userId: string }>).detail;
      if (user && detail?.userId === user.id) {
        syncFromStorage();
      }
    };
    window.addEventListener(WISHLIST_CHANGE_EVENT, onWishlistChange);
    return () => window.removeEventListener(WISHLIST_CHANGE_EVENT, onWishlistChange);
  }, [user, syncFromStorage]);

  // Hydrate from Supabase wishlists so like_count stays in sync via DB trigger.
  useEffect(() => {
    if (!live || !isAuthenticated || !user) return;

    const controller = new AbortController();

    fetch("/api/wishlist", { signal: controller.signal, credentials: "include" })
      .then(async (response) => {
        if (!response.ok) return;
        const body = (await response.json()) as { productIds?: string[] };
        if (!Array.isArray(body.productIds)) return;
        persistLocal(body.productIds);
      })
      .catch(() => {
        /* keep local cache */
      });

    return () => controller.abort();
  }, [live, isAuthenticated, user, persistLocal]);

  const syncAdd = useCallback(
    async (productId: string) => {
      if (!live || !user) return;
      try {
        const response = await fetch("/api/wishlist", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        if (!response.ok) throw new Error("add failed");
        const body = (await response.json()) as { productIds?: string[] };
        if (Array.isArray(body.productIds)) {
          persistLocal(body.productIds);
        }
      } catch {
        // Rollback optimistic local add on failure.
        persistLocal(readWishlist(user.id).filter((id) => id !== productId));
      }
    },
    [live, user, persistLocal],
  );

  const syncRemove = useCallback(
    async (productId: string) => {
      if (!live || !user) return;
      try {
        const response = await fetch(
          `/api/wishlist?productId=${encodeURIComponent(productId)}`,
          { method: "DELETE", credentials: "include" },
        );
        if (!response.ok) throw new Error("remove failed");
        const body = (await response.json()) as { productIds?: string[] };
        if (Array.isArray(body.productIds)) {
          persistLocal(body.productIds);
        }
      } catch {
        const current = readWishlist(user.id);
        if (!current.includes(productId)) {
          persistLocal([...current, productId]);
        }
      }
    },
    [live, user, persistLocal],
  );

  const add = useCallback(
    (productId: string) => {
      if (!isAuthenticated || !user) return false;
      if (productIds.includes(productId)) return true;
      const next = [...productIds, productId];
      persistLocal(next);
      void syncAdd(productId);
      return true;
    },
    [isAuthenticated, user, productIds, persistLocal, syncAdd],
  );

  const remove = useCallback(
    (productId: string) => {
      if (!isAuthenticated || !user) return false;
      persistLocal(productIds.filter((id) => id !== productId));
      void syncRemove(productId);
      return true;
    },
    [isAuthenticated, user, productIds, persistLocal, syncRemove],
  );

  const toggle = useCallback(
    (productId: string) => {
      if (!isAuthenticated || !user) return false;
      if (productIds.includes(productId)) {
        remove(productId);
        return false;
      }
      add(productId);
      return true;
    },
    [isAuthenticated, user, productIds, add, remove],
  );

  const value = useMemo(
    () => ({
      productIds,
      count: productIds.length,
      mounted,
      isInWishlist: (productId: string) => productIds.includes(productId),
      add,
      remove,
      toggle,
    }),
    [productIds, mounted, add, remove, toggle],
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return context;
}
