"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildVariantSku } from "@/lib/admin/products/variant-sku";
import type {
  AdminColorOption,
  AdminSizeOption,
  AdminVariantMatrix,
  VariantCellWrite,
} from "@/lib/admin/products/variant-types";
import { adminCheckboxClassName, adminFieldClassName, adminLabelClassName } from "./admin-form-styles";
import { AdminColorPalettePicker } from "./admin-color-palette-picker";
import { AdminVariantMatrixSkeleton } from "./admin-product-variants-skeleton";

type AdminProductVariantMatrixProps = {
  productId: string;
  productSlug: string;
  locale: string;
  disabled?: boolean;
  onTotalStockChange?: (total: number) => void;
};

type CellState = {
  id?: string;
  sku: string;
  stockQuantity: number;
  isActive: boolean;
  skuTouched: boolean;
};

function cellKey(sizeId: string, colorId: string): string {
  return `${sizeId}:${colorId}`;
}

function matrixToState(matrix: AdminVariantMatrix): {
  selectedColorIds: string[];
  cells: Map<string, CellState>;
} {
  const colorIds = new Set<string>();
  const cells = new Map<string, CellState>();

  for (const cell of matrix.cells) {
    colorIds.add(cell.colorId);
    cells.set(cellKey(cell.sizeId, cell.colorId), {
      id: cell.id,
      sku: cell.sku,
      stockQuantity: cell.stockQuantity,
      isActive: cell.isActive,
      skuTouched: true,
    });
  }

  if (colorIds.size === 0 && matrix.colors.length > 0) {
    colorIds.add(matrix.colors[0].id);
  }

  return {
    selectedColorIds: matrix.colors
      .filter((color) => colorIds.has(color.id))
      .map((color) => color.id),
    cells,
  };
}

function buildCellsPayload(
  sizes: AdminSizeOption[],
  selectedColorIds: string[],
  cells: Map<string, CellState>,
  productSlug: string,
  colors: AdminColorOption[],
): VariantCellWrite[] {
  const colorById = new Map(colors.map((color) => [color.id, color]));
  const payload: VariantCellWrite[] = [];

  for (const size of sizes) {
    for (const colorId of selectedColorIds) {
      const color = colorById.get(colorId);
      if (!color) continue;

      const key = cellKey(size.id, colorId);
      const current = cells.get(key);
      const stockQuantity = current?.stockQuantity ?? 0;
      const isActive = current?.isActive ?? stockQuantity > 0;
      const sku =
        current?.skuTouched && current.sku
          ? current.sku
          : buildVariantSku(productSlug, size.code, color.code);

      if (!isActive && stockQuantity === 0 && !current?.id) continue;

      payload.push({
        sizeId: size.id,
        colorId,
        sku,
        stockQuantity: Math.floor(stockQuantity),
        isActive,
      });
    }
  }

  return payload;
}

function sumStock(
  sizes: AdminSizeOption[],
  selectedColorIds: string[],
  cells: Map<string, CellState>,
): number {
  let total = 0;
  for (const size of sizes) {
    for (const colorId of selectedColorIds) {
      const current = cells.get(cellKey(size.id, colorId));
      if (!current?.isActive) continue;
      total += Math.max(0, current.stockQuantity ?? 0);
    }
  }
  return total;
}

const VARIANTS_REQUEST_TIMEOUT_MS = 30_000;

async function fetchVariantsApi(
  url: string,
  init: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), VARIANTS_REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...init,
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Request timed out — check your connection and try again.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export function AdminProductVariantMatrix({
  productId,
  productSlug,
  locale,
  disabled = false,
  onTotalStockChange,
}: AdminProductVariantMatrixProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sizes, setSizes] = useState<AdminSizeOption[]>([]);
  const [colors, setColors] = useState<AdminColorOption[]>([]);
  const [selectedColorIds, setSelectedColorIds] = useState<string[]>([]);
  const [cells, setCells] = useState<Map<string, CellState>>(new Map());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [dirty, setDirty] = useState(false);
  const [bulkStock, setBulkStock] = useState("");
  const saveInFlightRef = useRef(false);

  const markDirty = useCallback(() => {
    setDirty(true);
    setSaveFeedback(null);
  }, []);

  const handleUnauthorized = useCallback(() => {
    const redirect = encodeURIComponent(pathname);
    router.push(`/admin/login?redirect=${redirect}`);
    return "Session expired — redirecting to login…";
  }, [pathname, router]);

  const loadMatrix = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await fetchVariantsApi(
        `/api/admin/products/${productId}/variants?locale=${encodeURIComponent(locale)}`,
        { method: "GET" },
      );
      const data = (await response.json()) as { matrix?: AdminVariantMatrix; error?: string };
      if (response.status === 401) {
        setLoadError(handleUnauthorized());
        return;
      }
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to load variants");
      }
      if (!data.matrix) throw new Error("Variant matrix missing from response");

      const next = matrixToState(data.matrix);
      setSizes(data.matrix.sizes);
      setColors(data.matrix.colors);
      setSelectedColorIds(next.selectedColorIds);
      setCells(next.cells);
      setDirty(false);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load variants");
    } finally {
      setLoading(false);
    }
  }, [handleUnauthorized, locale, productId]);

  useEffect(() => {
    void loadMatrix();
  }, [loadMatrix]);

  const totalStock = useMemo(
    () => sumStock(sizes, selectedColorIds, cells),
    [cells, selectedColorIds, sizes],
  );

  useEffect(() => {
    onTotalStockChange?.(totalStock);
  }, [onTotalStockChange, totalStock]);

  const updateCell = (
    sizeId: string,
    colorId: string,
    patch: Partial<CellState>,
  ) => {
    setCells((prev) => {
      const key = cellKey(sizeId, colorId);
      const current = prev.get(key) ?? {
        sku: "",
        stockQuantity: 0,
        isActive: true,
        skuTouched: false,
      };
      const next = new Map(prev);
      next.set(key, { ...current, ...patch });
      return next;
    });
    markDirty();
  };

  const handleColorAdded = (color: AdminColorOption) => {
    setColors((prev) => {
      if (prev.some((entry) => entry.id === color.id)) return prev;
      return [...prev, color];
    });
    setSelectedColorIds((prev) => {
      if (prev.includes(color.id)) return prev;
      return [...prev, color.id];
    });
    markDirty();
  };

  const toggleColor = (colorId: string) => {
    setSelectedColorIds((prev) => {
      if (prev.includes(colorId)) {
        if (prev.length === 1) return prev;
        return prev.filter((id) => id !== colorId);
      }
      return [...prev, colorId];
    });
    markDirty();
  };

  const selectedColors = colors.filter((color) => selectedColorIds.includes(color.id));

  const applyBulkStock = () => {
    const quantity = Math.max(0, Math.floor(Number(bulkStock) || 0));
    const colorById = new Map(colors.map((color) => [color.id, color]));

    setCells((prev) => {
      const next = new Map(prev);
      for (const size of sizes) {
        for (const colorId of selectedColorIds) {
          const color = colorById.get(colorId);
          if (!color) continue;

          const key = cellKey(size.id, colorId);
          const current = next.get(key) ?? {
            sku: buildVariantSku(productSlug, size.code, color.code),
            stockQuantity: 0,
            isActive: true,
            skuTouched: false,
          };

          next.set(key, {
            ...current,
            stockQuantity: quantity,
            isActive: quantity > 0 ? true : current.isActive,
          });
        }
      }
      return next;
    });
    markDirty();
  };

  const handleSave = useCallback(async () => {
    if (disabled || saveInFlightRef.current) return;
    saveInFlightRef.current = true;
    setSaving(true);
    setSaveFeedback(null);
    try {
      const payload = buildCellsPayload(
        sizes,
        selectedColorIds,
        cells,
        productSlug,
        colors,
      );

      const response = await fetchVariantsApi(`/api/admin/products/${productId}/variants`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cells: payload }),
      });
      const data = (await response.json()) as { matrix?: AdminVariantMatrix; error?: string };
      if (response.status === 401) {
        throw new Error(handleUnauthorized());
      }
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to save variants");
      }
      if (data.matrix) {
        const next = matrixToState(data.matrix);
        setCells(next.cells);
        setSelectedColorIds(next.selectedColorIds);
        const savedTotal = sumStock(data.matrix.sizes, next.selectedColorIds, next.cells);
        setSaveFeedback({
          type: "success",
          message: `Variants saved successfully. Total active stock: ${savedTotal}.`,
        });
      } else {
        setSaveFeedback({
          type: "success",
          message: "Variants saved successfully.",
        });
      }
      setDirty(false);
      router.refresh();
    } catch (saveError) {
      const message =
        saveError instanceof Error ? saveError.message : "Failed to save variants";
      setSaveFeedback({ type: "error", message });
    } finally {
      saveInFlightRef.current = false;
      setSaving(false);
    }
  }, [cells, colors, disabled, handleUnauthorized, productId, productSlug, router, selectedColorIds, sizes]);

  useEffect(() => {
    if (!dirty || disabled) return;

    const warnOnLeave = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", warnOnLeave);
    return () => window.removeEventListener("beforeunload", warnOnLeave);
  }, [dirty, disabled]);

  if (loading) {
    return <AdminVariantMatrixSkeleton />;
  }

  return (
    <div className="space-y-5 rounded-xl border border-outline-variant bg-surface-container-low p-4 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">
            Size × Color Matrix
          </h4>
          <p className="mt-1 text-xs text-on-surface-variant">
            SKU is generated automatically. Set stock per size and color. Total active stock:{" "}
            <span className="font-semibold text-primary">{totalStock}</span>
            {disabled
              ? " — editing disabled in mock mode."
              : dirty
                ? " — unsaved changes."
                : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={disabled || saving || !dirty}
          className="hidden rounded-lg border border-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-primary transition-colors hover:bg-primary hover:text-on-primary disabled:opacity-50 sm:inline-flex"
        >
          {saving ? "Saving…" : "Save Variants"}
        </button>
      </div>

      {loadError && (
        <p className="rounded-lg border border-error/30 bg-error/5 px-3 py-2 text-sm text-error">
          {loadError}
        </p>
      )}

      {dirty && !disabled && !saving && (
        <p className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-xs text-on-surface-variant">
          Apply to all and manual edits are kept locally until you press{" "}
          <span className="font-semibold text-primary">Save Variants</span>. Adjust individual
          cells first if needed.
        </p>
      )}

      <div className="space-y-4">
        <div>
          <p className={adminLabelClassName}>Colors for this product</p>
          <p className="mt-1 text-xs text-on-surface-variant">
            Check colors to include in the matrix. Add new colors from the palette below.
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
          {colors.map((color) => {
            const checked = selectedColorIds.includes(color.id);
            const inputId = `variant-color-${color.id}`;
            return (
              <label
                key={color.id}
                htmlFor={inputId}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm"
              >
                <input
                  id={inputId}
                  type="checkbox"
                  checked={checked}
                  disabled={disabled || (checked && selectedColorIds.length === 1)}
                  onChange={() => toggleColor(color.id)}
                  className={adminCheckboxClassName}
                />
                <span
                  className="inline-block size-3 rounded-full border border-outline-variant"
                  style={{ backgroundColor: color.hex ?? "#ccc" }}
                  aria-hidden
                />
                <span>{color.name}</span>
              </label>
            );
          })}
          </div>
        </div>

        <AdminColorPalettePicker
          disabled={disabled}
          existingColors={colors}
          onColorAdded={handleColorAdded}
        />
      </div>

      <div className="rounded-lg border border-outline-variant/60 bg-surface p-4">
        <p className={adminLabelClassName}>Quick fill stock</p>
        <p className="mb-3 text-xs text-on-surface-variant">
          Fill every size × color with the same quantity, then tweak individual cells below. Nothing
          is saved until you press Save Variants.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="sm:w-40">
            <label className="sr-only" htmlFor="bulk-stock-quantity">
              Stock for all variants
            </label>
            <input
              id="bulk-stock-quantity"
              type="number"
              min={0}
              step={1}
              disabled={disabled || selectedColorIds.length === 0}
              value={bulkStock}
              onChange={(event) => setBulkStock(event.target.value)}
              placeholder="0"
              className={adminFieldClassName}
            />
          </div>
          <button
            type="button"
            onClick={applyBulkStock}
            disabled={disabled || selectedColorIds.length === 0 || bulkStock === ""}
            className="rounded-lg bg-primary px-5 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            Apply to all
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[640px] w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-outline-variant">
              <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
                Size
              </th>
              {selectedColors.map((color) => (
                <th
                  key={color.id}
                  className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant"
                >
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="inline-block size-2.5 rounded-full border border-outline-variant"
                      style={{ backgroundColor: color.hex ?? "#ccc" }}
                      aria-hidden
                    />
                    {color.name}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sizes.map((size) => (
              <tr key={size.id} className="border-b border-outline-variant/60">
                <td className="px-3 py-3 font-mono text-xs font-semibold text-primary">
                  {size.code}
                </td>
                {selectedColors.map((color) => {
                  const key = cellKey(size.id, color.id);
                  const current = cells.get(key) ?? {
                    sku: buildVariantSku(productSlug, size.code, color.code),
                    stockQuantity: 0,
                    isActive: true,
                    skuTouched: false,
                  };

                  return (
                    <td key={color.id} className="px-3 py-3 align-top">
                      <div className="space-y-2">
                        <input
                          type="number"
                          min={0}
                          step={1}
                          disabled={disabled}
                          value={current.stockQuantity}
                          onChange={(event) => {
                            const stockQuantity = Math.max(0, Number(event.target.value) || 0);
                            updateCell(size.id, color.id, {
                              stockQuantity,
                              isActive: stockQuantity > 0 ? true : current.isActive,
                            });
                          }}
                          className="w-full rounded-lg border border-outline-variant bg-surface px-2 py-1.5 text-xs"
                          aria-label={`Stock ${size.code} ${color.name}`}
                        />
                        <input
                          type="text"
                          readOnly
                          tabIndex={-1}
                          value={
                            current.sku || buildVariantSku(productSlug, size.code, color.code)
                          }
                          className="w-full cursor-default rounded-lg border border-outline-variant/60 bg-surface-container-low px-2 py-1.5 font-mono text-[10px] uppercase text-on-surface-variant"
                          aria-label={`SKU ${size.code} ${color.name}`}
                          aria-readonly="true"
                        />
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        className="flex flex-col gap-3 border-t border-outline-variant/40 pt-4 sm:flex-row sm:items-center sm:justify-between"
        role="status"
        aria-live="polite"
      >
        <div className="min-h-10 flex-1">
          {saving && (
            <p className="flex items-center gap-2 text-sm text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
              Saving variants…
            </p>
          )}
          {!saving && saveFeedback?.type === "success" && (
            <p className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary">
              <span className="material-symbols-outlined shrink-0 text-[18px]">check_circle</span>
              <span>{saveFeedback.message}</span>
            </p>
          )}
          {!saving && saveFeedback?.type === "error" && (
            <p className="flex items-start gap-2 rounded-lg border border-error/30 bg-error/5 px-3 py-2 text-sm text-error">
              <span className="material-symbols-outlined shrink-0 text-[18px]">error</span>
              <span>{saveFeedback.message}</span>
            </p>
          )}
          {!saving && !saveFeedback && dirty && (
            <p className="text-xs text-on-surface-variant">You have unsaved changes.</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={disabled || saving || !dirty}
          className="w-full shrink-0 rounded-lg border border-primary px-5 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-primary transition-colors hover:bg-primary hover:text-on-primary disabled:opacity-50 sm:w-auto"
        >
          {saving ? "Saving…" : "Save Variants"}
        </button>
      </div>
    </div>
  );
}
