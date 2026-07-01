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

export function WishlistProvider({ children }: WishlistProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const [productIds, setProductIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  const syncFromStorage = useCallback(() => {
    if (!user) {
      setProductIds([]);
      return;
    }
    setProductIds(readWishlist(user.id));
  }, [user]);

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

  const persist = useCallback(
    (next: string[]) => {
      if (!user) return;
      writeWishlist(user.id, next);
      setProductIds(next);
    },
    [user],
  );

  const add = useCallback(
    (productId: string) => {
      if (!isAuthenticated || !user) return false;
      if (productIds.includes(productId)) return true;
      persist([...productIds, productId]);
      return true;
    },
    [isAuthenticated, user, productIds, persist],
  );

  const remove = useCallback(
    (productId: string) => {
      if (!isAuthenticated || !user) return false;
      persist(productIds.filter((id) => id !== productId));
      return true;
    },
    [isAuthenticated, user, productIds, persist],
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
