"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { AdminCategoryOption } from "@/lib/admin/categories/types";
import type { ProductImageItem } from "@/lib/admin/products/upload-product-image";
import { countLowStockAlerts } from "@/lib/admin/inventory/alerts";
import { isLowStockProduct, isOutOfStockProduct } from "@/lib/admin/inventory/status";
import type { AdminProductRow } from "@/lib/admin/list-types";
import type { ProductDetail } from "@/lib/admin/products/types";
import { DEFAULT_PRODUCT_CURRENCY } from "@/lib/currency";
import { adminCardToolbarClass } from "./admin-layout-styles";
import { AdminInventoryStockEditor } from "./admin-inventory-stock-editor";
import { AdminProductFormModal } from "./admin-product-form-modal";
import {
  AdminProductStockBadge,
  AdminProductThumbnail,
  AdminProductsTable,
} from "./admin-products-table";

type AdminProductsClientProps = {
  products: AdminProductRow[];
  categories: AdminCategoryOption[];
  locale: string;
  canMutate: boolean;
};

type StockFilter = "all" | "in-stock" | "low-stock" | "out-of-stock";

function rowToProductDetail(product: AdminProductRow, locale: string): ProductDetail {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    status: product.statusRaw as ProductDetail["status"],
    basePrice: product.basePrice,
    compareAtPrice: null,
    currency: DEFAULT_PRODUCT_CURRENCY,
    stock: product.stock,
    isLatestDrop: product.isLatestDrop,
    isPremium: product.isPremium,
    isBestSeller: product.isBestSeller,
    isTemporarilyUnavailable: product.isTemporarilyUnavailable,
    lowStockThreshold: product.lowStockThreshold,
    locale,
    categoryId: product.categoryId,
    categorySlug: product.categorySlug,
    categoryName: product.categoryName,
  };
}

function matchesStockFilter(product: AdminProductRow, filter: StockFilter): boolean {
  if (filter === "all") return true;
  if (filter === "out-of-stock") return isOutOfStockProduct(product.stock);
  if (filter === "low-stock") {
    return isLowStockProduct(product.stock, product.lowStockThreshold);
  }
  return (
    !isOutOfStockProduct(product.stock) &&
    !isLowStockProduct(product.stock, product.lowStockThreshold)
  );
}

export function AdminProductsClient({
  products,
  categories,
  locale,
  canMutate,
}: AdminProductsClientProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingProduct, setEditingProduct] = useState<ProductDetail | null>(null);
  const [editingImages, setEditingImages] = useState<ProductImageItem[]>([]);
  const [editingModelUrl, setEditingModelUrl] = useState<string | null>(null);
  const [editingModelFileName, setEditingModelFileName] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [savingInventoryId, setSavingInventoryId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StockFilter>("all");
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const filtersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showCategoryMenu && !showStatusMenu) return;

    const closeMenus = (event: MouseEvent) => {
      if (!filtersRef.current?.contains(event.target as Node)) {
        setShowCategoryMenu(false);
        setShowStatusMenu(false);
      }
    };

    document.addEventListener("mousedown", closeMenus);
    return () => document.removeEventListener("mousedown", closeMenus);
  }, [showCategoryMenu, showStatusMenu]);

  const categoryOptions = useMemo(() => {
    const names = new Set<string>();
    for (const product of products) {
      if (product.categoryName) names.add(product.categoryName);
    }
    return Array.from(names).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return products.filter((product) => {
      const matchesQuery =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.slug.toLowerCase().includes(query);
      const matchesCategory = !categoryFilter || product.categoryName === categoryFilter;
      const matchesStatus = matchesStockFilter(product, statusFilter);
      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [products, searchQuery, categoryFilter, statusFilter]);

  const emptyMessage =
    products.length === 0
      ? "No products found. Run database/mbody_init.sql to seed the catalog."
      : "No products match your filters.";

  const openCreate = () => {
    setFormMode("create");
    setEditingProduct(null);
    setEditingImages([]);
    setEditingModelUrl(null);
    setEditingModelFileName(null);
    setFormOpen(true);
    setActionError(null);
  };

  const openEdit = (product: AdminProductRow) => {
    setFormMode("edit");
    setEditingProduct(rowToProductDetail(product, locale));
    setEditingImages(product.images);
    setEditingModelUrl(product.modelGlbUrl);
    setEditingModelFileName(product.modelFileName);
    setFormOpen(true);
    setActionError(null);
  };

  const openStoreProduct = (product: AdminProductRow) => {
    window.open(`/${locale}/shop/${product.slug}`, "_blank", "noopener,noreferrer");
  };

  const openVariants = (product: AdminProductRow) => {
    router.push(`/admin/products/${product.id}/variants`);
  };

  const handleDelete = async (product: AdminProductRow) => {
    const confirmed = window.confirm(
      `Delete "${product.name}"? This removes variants, translations, and media links.`,
    );
    if (!confirmed) return;

    setDeletingId(product.id);
    setActionError(null);

    try {
      const response = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        setActionError(body.error ?? "Delete failed");
        return;
      }
      router.refresh();
    } catch {
      setActionError("Network error — could not delete product");
    } finally {
      setDeletingId(null);
    }
  };

  const alertCounts = useMemo(() => countLowStockAlerts(products), [products]);

  const handleInventorySave = async (
    productId: string,
    values: { stock: number; lowStockThreshold: number },
  ) => {
    setSavingInventoryId(productId);
    setActionError(null);

    try {
      const response = await fetch(`/api/admin/products/${productId}/inventory?locale=${locale}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        setActionError(body.error ?? "Inventory update failed");
        return;
      }
      router.refresh();
    } catch {
      setActionError("Network error — could not update inventory");
    } finally {
      setSavingInventoryId(null);
    }
  };

  const statusFilterLabel =
    statusFilter === "all"
      ? "All status"
      : statusFilter === "in-stock"
        ? "In stock"
        : statusFilter === "low-stock"
          ? "Low stock"
          : "Out of stock";

  return (
    <>
      <section className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h2 className="mb-1 text-xl font-medium tracking-tight text-primary sm:text-2xl">
            Product Inventory
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-on-surface-variant sm:text-base">
            Manage your premium athletic collection and stock levels.
          </p>
        </div>
        {canMutate ? (
          <button
            type="button"
            onClick={openCreate}
            className="flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-on-primary transition-opacity hover:opacity-90 sm:w-auto"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add New Product
          </button>
        ) : (
          <p className="text-sm text-on-surface-variant">
            Enable live Supabase to create, edit, or delete products.
          </p>
        )}
      </section>

      {actionError && (
        <p className="mb-4 rounded-lg border border-outline-variant bg-surface-container-high px-4 py-3 text-sm text-primary">
          {actionError}
        </p>
      )}

      {alertCounts.total > 0 && (
        <div className="mb-4 rounded-xl border border-error/30 bg-error/5 px-4 py-3 sm:px-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="material-symbols-outlined text-error">warning</span>
            <p className="text-sm font-semibold text-primary">Inventory alerts</p>
          </div>
          <p className="mt-2 text-sm text-on-surface-variant">
            {alertCounts.out > 0 && (
              <span>
                {alertCounts.out} out of stock
                {alertCounts.low > 0 ? " · " : ""}
              </span>
            )}
            {alertCounts.low > 0 && <span>{alertCounts.low} low stock</span>}
            {" — "}
            Use the stock column to update quantities and alert thresholds.
          </p>
        </div>
      )}

      <article className="mb-6 overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest shadow-[0_30px_50px_-12px_rgba(18,18,18,0.03)] sm:mb-8">
        <div className={adminCardToolbarClass}>
          <div className="relative w-full sm:max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
              search
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by name or SKU..."
              className="w-full rounded-lg border-none bg-surface-container-low py-2 pl-10 pr-4 text-sm transition-all focus:ring-1 focus:ring-primary"
            />
          </div>
          <div ref={filtersRef} className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowCategoryMenu((open) => !open);
                  setShowStatusMenu(false);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-outline-variant px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] transition-colors hover:bg-surface-container sm:w-auto"
              >
                <span className="material-symbols-outlined text-[18px]">filter_list</span>
                <span className="truncate">{categoryFilter || "Category"}</span>
              </button>
              {showCategoryMenu && (
                <div className="absolute left-0 z-20 mt-2 min-w-[180px] rounded-lg border border-outline-variant bg-surface-container-lowest py-1 shadow-lg sm:left-auto sm:right-0">
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryFilter("");
                      setShowCategoryMenu(false);
                    }}
                    className="block w-full px-4 py-2 text-left text-sm hover:bg-surface-container"
                  >
                    All categories
                  </button>
                  {categoryOptions.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => {
                        setCategoryFilter(name);
                        setShowCategoryMenu(false);
                      }}
                      className="block w-full px-4 py-2 text-left text-sm hover:bg-surface-container"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowStatusMenu((open) => !open);
                  setShowCategoryMenu(false);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-outline-variant px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] transition-colors hover:bg-surface-container sm:w-auto"
              >
                <span className="material-symbols-outlined text-[18px]">inventory</span>
                <span className="truncate">{statusFilterLabel}</span>
              </button>
              {showStatusMenu && (
                <div className="absolute left-0 z-20 mt-2 min-w-[180px] rounded-lg border border-outline-variant bg-surface-container-lowest py-1 shadow-lg sm:left-auto sm:right-0">
                  {(
                    [
                      ["all", "All status"],
                      ["in-stock", "In stock"],
                      ["low-stock", "Low stock"],
                      ["out-of-stock", "Out of stock"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setStatusFilter(value);
                        setShowStatusMenu(false);
                      }}
                      className="block w-full px-4 py-2 text-left text-sm hover:bg-surface-container"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <ul className="divide-y divide-outline-variant/20 md:hidden">
          {filteredProducts.length === 0 ? (
            <li className="px-4 py-10 text-center text-sm text-on-surface-variant">{emptyMessage}</li>
          ) : (
            filteredProducts.map((product) => (
              <li
                key={product.id}
                className={`px-4 py-4 ${canMutate ? "cursor-pointer active:bg-surface-container-low/50" : ""}`}
                onClick={() => canMutate && openEdit(product)}
              >
                <div className="flex items-start gap-3">
                  <AdminProductThumbnail imageUrl={product.imageUrl} alt={product.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-primary">{product.name}</p>
                    <p className="mt-0.5 truncate font-mono text-xs text-on-surface-variant">
                      {product.slug}
                    </p>
                    <p className="mt-1 text-xs text-on-surface-variant">
                      {product.categoryName ?? "—"}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-bold text-primary">{product.price}</p>
                      <AdminProductStockBadge product={product} />
                    </div>
                    <div
                      className="mt-2"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <AdminInventoryStockEditor
                        product={product}
                        canMutate={canMutate}
                        saving={savingInventoryId === product.id}
                        onSave={handleInventorySave}
                        onVariants={openVariants}
                      />
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        openStoreProduct(product);
                      }}
                      className="material-symbols-outlined rounded-full p-1 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                      aria-label={`View ${product.name}`}
                    >
                      open_in_new
                    </button>
                    {canMutate && (
                      <>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            openVariants(product);
                          }}
                          className="material-symbols-outlined rounded-full p-1 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                          aria-label={`Variants for ${product.name}`}
                          title="Manage variants"
                        >
                          view_module
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            openEdit(product);
                          }}
                          className="material-symbols-outlined rounded-full p-1 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                          aria-label={`Edit ${product.name}`}
                        >
                          edit
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            void handleDelete(product);
                          }}
                          disabled={deletingId === product.id}
                          className="material-symbols-outlined rounded-full p-1 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-error disabled:opacity-50"
                          aria-label={`Delete ${product.name}`}
                        >
                          {deletingId === product.id ? "hourglass_empty" : "delete"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>

        <div className="hidden md:block">
          <AdminProductsTable
            products={filteredProducts}
            emptyMessage={emptyMessage}
            canMutate={canMutate}
            deletingId={deletingId}
            savingInventoryId={savingInventoryId}
            onView={openStoreProduct}
            onVariants={openVariants}
            onEdit={openEdit}
            onDelete={(product) => void handleDelete(product)}
            onInventorySave={handleInventorySave}
          />
        </div>
      </article>

      <AdminProductFormModal
        open={formOpen}
        mode={formMode}
        locale={locale}
        categories={categories}
        initial={editingProduct}
        images={editingImages}
        modelGlbUrl={editingModelUrl}
        modelFileName={editingModelFileName}
        canMutate={canMutate}
        onClose={() => setFormOpen(false)}
        onSaved={() => router.refresh()}
      />
    </>
  );
}
