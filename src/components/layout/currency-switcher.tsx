"use client";

import { useEffect, useRef, useState } from "react";
import { CURRENCIES, type Currency } from "@/lib/currency";
import { useCurrency } from "@/providers/currency-provider";

type CurrencySwitcherProps = {
  className?: string;
};

export function CurrencySwitcher({ className = "" }: CurrencySwitcherProps) {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const selectCurrency = (next: Currency) => {
    setOpen(false);
    setCurrency(next);
  };

  return (
    <div ref={rootRef} className={`relative z-[70] ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.08em] text-on-surface-variant transition-colors hover:text-primary"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Change currency"
      >
        {currency}
        <span className="material-symbols-outlined text-[14px]">expand_more</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-[calc(100%+6px)] z-[70] min-w-[88px] overflow-hidden rounded-md border border-outline-variant/40 bg-background shadow-[0_10px_30px_rgba(18,18,18,0.12)]"
        >
          {CURRENCIES.map((item) => (
            <button
              key={item}
              type="button"
              role="menuitem"
              onClick={() => selectCurrency(item)}
              className={`block w-full px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.08em] transition-colors ${
                item === currency
                  ? "bg-surface-container-low text-primary"
                  : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
              }`}
              aria-current={item === currency ? "true" : undefined}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
