"use client";

import { useEffect, useRef, useState } from "react";
import type { AdminProductRow } from "@/lib/admin/list-types";
import { adminFieldClassName } from "./admin-form-styles";

type AdminInventoryStockEditorProps = {
  product: AdminProductRow;
  canMutate: boolean;
  saving?: boolean;
  onSave: (productId: string, values: { stock: number; lowStockThreshold: number }) => void;
  onVariants: (product: AdminProductRow) => void;
};

export function AdminInventoryStockEditor({
  product,
  canMutate,
  saving = false,
  onSave,
  onVariants,
}: AdminInventoryStockEditorProps) {
  const [open, setOpen] = useState(false);
  const [stock, setStock] = useState(String(product.stock));
  const [threshold, setThreshold] = useState(String(product.lowStockThreshold));
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setStock(String(product.stock));
    setThreshold(String(product.lowStockThreshold));
  }, [open, product.stock, product.lowStockThreshold]);

  useEffect(() => {
    if (!open) return;

    const closeOnOutside = (event: MouseEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutside);
    return () => document.removeEventListener("mousedown", closeOnOutside);
  }, [open]);

  const handleSave = () => {
    const nextStock = Number(stock);
    const nextThreshold = Number(threshold);
    if (!Number.isInteger(nextStock) || nextStock < 0) return;
    if (!Number.isInteger(nextThreshold) || nextThreshold < 0) return;

    onSave(product.id, { stock: nextStock, lowStockThreshold: nextThreshold });
    setOpen(false);
  };

  if (!canMutate) {
    return (
      <div className="text-sm">
        <p className="font-semibold text-primary">{product.stock}</p>
        <p className="text-[10px] text-on-surface-variant">Alert ≤ {product.lowStockThreshold}</p>
      </div>
    );
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        className="group rounded-lg px-1 py-0.5 text-left transition-colors hover:bg-surface-container"
        aria-expanded={open}
        aria-label={`Update stock for ${product.name}`}
      >
        <p className="font-semibold text-primary">{product.stock}</p>
        <p className="text-[10px] text-on-surface-variant group-hover:text-primary">
          Alert ≤ {product.lowStockThreshold}
        </p>
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-30 mt-2 w-56 rounded-lg border border-outline-variant bg-surface-container-lowest p-3 shadow-lg"
          onClick={(event) => event.stopPropagation()}
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
            Update inventory
          </p>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
                Stock
              </label>
              <input
                type="number"
                min={0}
                step={1}
                value={stock}
                onChange={(event) => setStock(event.target.value)}
                className={`${adminFieldClassName} py-2 text-sm`}
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
                Low-stock alert
              </label>
              <input
                type="number"
                min={0}
                step={1}
                value={threshold}
                onChange={(event) => setThreshold(event.target.value)}
                className={`${adminFieldClassName} py-2 text-sm`}
              />
            </div>
          </div>
          {product.variantCount > 1 && (
            <p className="mt-3 text-[10px] leading-relaxed text-on-surface-variant">
              Total stock is redistributed across {product.variantCount} variants. For per-size
              stock, use{" "}
              <button
                type="button"
                className="font-semibold text-primary underline"
                onClick={() => {
                  setOpen(false);
                  onVariants(product);
                }}
              >
                variants
              </button>
              .
            </p>
          )}
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-on-surface-variant hover:bg-surface-container"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-on-primary disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
