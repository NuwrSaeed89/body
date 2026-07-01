"use client";

import { useMemo, useState } from "react";
import { CartEmptyContent } from "./cart-empty-content";
import { CartEmptyFooter } from "./cart-empty-footer";
import { CartFilledContent } from "./cart-filled-content";
import { CartFooter } from "./cart-footer";
import { CartHeader } from "./cart-header";
import {
  DESKTOP_CART_ITEMS,
  MOBILE_CART_ITEMS,
  type CartLineItem,
} from "@/lib/cart-data";

type Quantities = Record<string, number>;

function buildInitialQuantities(items: CartLineItem[]) {
  return Object.fromEntries(items.map((item) => [item.id, 0]));
}

function isCartEmpty(items: CartLineItem[], quantities: Quantities) {
  return items.every((item) => (quantities[item.id] ?? 0) === 0);
}

export function CartPageShell() {
  const [desktopQty, setDesktopQty] = useState(() =>
    buildInitialQuantities(DESKTOP_CART_ITEMS),
  );
  const [mobileQty, setMobileQty] = useState(() =>
    buildInitialQuantities(MOBILE_CART_ITEMS),
  );

  const desktopEmpty = useMemo(
    () => isCartEmpty(DESKTOP_CART_ITEMS, desktopQty),
    [desktopQty],
  );
  const mobileEmpty = useMemo(
    () => isCartEmpty(MOBILE_CART_ITEMS, mobileQty),
    [mobileQty],
  );

  const addDesktopItem = (id: string) => {
    setDesktopQty((current) => ({ ...current, [id]: (current[id] ?? 0) + 1 }));
  };

  const addMobileItem = (id: string) => {
    setMobileQty((current) => ({ ...current, [id]: (current[id] ?? 0) + 1 }));
  };

  const mobileItemCount = useMemo(
    () =>
      MOBILE_CART_ITEMS.reduce(
        (sum, item) => sum + (mobileQty[item.id] ?? 0),
        0,
      ),
    [mobileQty],
  );

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="overflow-x-hidden bg-surface text-on-surface selection:bg-primary selection:text-on-primary"
    >
      <CartHeader
        desktopEmpty={desktopEmpty}
        mobileEmpty={mobileEmpty}
        mobileItemCount={mobileItemCount}
      />

      {desktopEmpty ? (
        <div className="hidden md:block">
          <CartEmptyContent onAddDesktopItem={addDesktopItem} />
          <CartEmptyFooter />
        </div>
      ) : (
        <div className="hidden md:block">
          <CartFilledContent
            variant="desktop"
            quantities={desktopQty}
            setQuantities={setDesktopQty}
          />
          <CartFooter />
        </div>
      )}

      {mobileEmpty ? (
        <div className="md:hidden">
          <CartEmptyContent onAddMobileItem={addMobileItem} />
        </div>
      ) : (
        <div className="md:hidden">
          <CartFilledContent
            variant="mobile"
            quantities={mobileQty}
            setQuantities={setMobileQty}
          />
        </div>
      )}
    </main>
  );
}
