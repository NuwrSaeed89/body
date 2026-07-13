"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminCategoryOption } from "@/lib/admin/categories/types";
import type { ProductStatus } from "@/lib/admin/products/constants";
import { slugifyProductName } from "@/lib/admin/products/slug";
import type { ProductDetail } from "@/lib/admin/products/types";
import { DEFAULT_PRODUCT_CURRENCY } from "@/lib/currency";
import type { ProductImageItem } from "@/lib/admin/products/upload-product-image";
import {
  adminCheckboxClassName,
  adminFieldClassName,
  adminLabelClassName,
} from "./admin-form-styles";
import {
  AdminProductEngagementPanel,
  type ProductEngagementStats,
} from "./admin-product-engagement-panel";
import {
  AdminProductRatingPanel,
  type ProductRatingStats,
} from "./admin-product-rating-panel";
import { AdminProductImageUpload } from "./admin-product-image-upload";
import { AdminProductModelUpload } from "./admin-product-model-upload";
import type { ProductModelChangePayload } from "./admin-product-model-upload";
import { AdminConfirmDialog } from "./admin-confirm-dialog";

export type ProductFormValues = {
  slug: string;
  name: string;
  description: string;
  status: ProductStatus;
  basePrice: string;
  stock: string;
  lowStockThreshold: string;
  isLatestDrop: boolean;
  isPremium: boolean;
  isBestSeller: boolean;
  isTemporarilyUnavailable: boolean;
  categoryId: string;
};

type AdminProductFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  locale: string;
  categories: AdminCategoryOption[];
  initial?: ProductDetail | null;
  images?: ProductImageItem[];
  engagement?: ProductEngagementStats | null;
  rating?: ProductRatingStats | null;
  modelGlbUrl?: string | null;
  modelFileName?: string | null;
  canMutate?: boolean;
  onClose: () => void;
  onSaved: () => void;
  onImagesChange?: (images: ProductImageItem[]) => void;
};

const EMPTY_FORM: ProductFormValues = {
  slug: "",
  name: "",
  description: "",
  status: "draft",
  basePrice: "",
  stock: "0",
  lowStockThreshold: "5",
  isLatestDrop: false,
  isPremium: false,
  isBestSeller: false,
  isTemporarilyUnavailable: false,
  categoryId: "",
};

function toFormValues(product?: ProductDetail | null): ProductFormValues {
  if (!product) return EMPTY_FORM;
  return {
    slug: product.slug,
    name: product.name,
    description: product.description ?? "",
    status: product.status,
    basePrice: String(product.basePrice),
    stock: String(product.stock),
    lowStockThreshold: String(product.lowStockThreshold ?? 5),
    isLatestDrop: product.isLatestDrop,
    isPremium: product.isPremium,
    isBestSeller: product.isBestSeller,
    isTemporarilyUnavailable: product.isTemporarilyUnavailable,
    categoryId: product.categoryId ?? "",
  };
}

export function AdminProductFormModal({
  open,
  mode: modeProp,
  locale,
  categories,
  initial,
  images = [],
  engagement = null,
  rating = null,
  modelGlbUrl,
  modelFileName,
  canMutate = true,
  onClose,
  onSaved,
  onImagesChange,
}: AdminProductFormModalProps) {
  const [form, setForm] = useState<ProductFormValues>(EMPTY_FORM);
  const [mode, setMode] = useState<"create" | "edit">(modeProp);
  const [activeProduct, setActiveProduct] = useState<ProductDetail | null>(initial ?? null);
  const [activeModelUrl, setActiveModelUrl] = useState<string | null>(modelGlbUrl ?? null);
  const [activeModelFileName, setActiveModelFileName] = useState<string | null>(
    modelFileName ?? null,
  );
  const [slugTouched, setSlugTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [modelUploading, setModelUploading] = useState(false);
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMode(modeProp);
    setActiveProduct(initial ?? null);
    setActiveModelUrl(modelGlbUrl ?? null);
    setActiveModelFileName(modelFileName ?? null);
    setForm(toFormValues(initial));
    setSlugTouched(modeProp === "edit");
    setError(null);
    requestAnimationFrame(() => setVisible(true));
  }, [open, initial, modeProp, modelGlbUrl, modelFileName]);

  useEffect(() => {
    if (open) return;
    setVisible(false);
    setModelUploading(false);
    setImageUploading(false);
  }, [open]);

  const requestClose = useCallback(() => {
    if (modelUploading || imageUploading) {
      setConfirmCloseOpen(true);
      return;
    }
    onClose();
  }, [modelUploading, imageUploading, onClose]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") requestClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, requestClose]);

  if (!open) return null;

  const updateField = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleNameChange = (name: string) => {
    updateField("name", name);
    if (!slugTouched) {
      updateField("slug", slugifyProductName(name));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      slug: form.slug,
      name: form.name,
      description: form.description || null,
      status: form.status,
      basePrice: Number(form.basePrice),
      stock: Number(form.stock),
      lowStockThreshold: Number(form.lowStockThreshold),
      isLatestDrop: form.isLatestDrop,
      isPremium: form.isPremium,
      isBestSeller: form.isBestSeller,
      isTemporarilyUnavailable: form.isTemporarilyUnavailable,
      categoryId: form.categoryId || null,
      currency: DEFAULT_PRODUCT_CURRENCY,
      locale,
      ...(mode === "edit" ? { syncVariantStock: false } : {}),
    };

    const url =
      mode === "create"
        ? "/api/admin/products"
        : `/api/admin/products/${activeProduct?.id ?? initial?.id}`;
    const method = mode === "create" ? "POST" : "PATCH";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json()) as { error?: string; product?: ProductDetail };
      if (!response.ok) {
        setError(body.error ?? "Save failed");
        return;
      }

      onSaved();

      if (mode === "create" && body.product) {
        setMode("edit");
        setActiveProduct(body.product);
        setForm(toFormValues(body.product));
        setSlugTouched(true);
        return;
      }

      onClose();
    } catch {
      setError("Network error — could not save product");
    } finally {
      setSubmitting(false);
    }
  };

  const title = mode === "create" ? "Add Product" : "Product Details";
  const productId = activeProduct?.id ?? initial?.id ?? null;
  const productSlug = form.slug;

  const handleModelChange = (model: ProductModelChangePayload) => {
    if (model) {
      setActiveModelUrl(model.publicUrl);
      setActiveModelFileName(model.fileName);
    } else {
      setActiveModelUrl(null);
      setActiveModelFileName(null);
    }
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-[60]" role="presentation">
      <button
        type="button"
        aria-label="Close product drawer"
        onClick={requestClose}
        className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-form-title"
        className={`absolute right-0 top-0 flex h-[100dvh] w-full max-w-xl flex-col border-l border-outline-variant bg-surface-bright shadow-2xl transition-transform duration-300 ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-outline-variant p-4 sm:p-6 md:p-8">
          <h3 id="product-form-title" className="text-lg font-semibold text-primary">
            {title}
          </h3>
          <button
            type="button"
            onClick={requestClose}
            className="material-symbols-outlined rounded-full p-2 transition-colors hover:bg-surface-container"
            aria-label="Close"
          >
            close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-grow space-y-6 overflow-y-auto p-4 sm:space-y-8 sm:p-6 md:p-8">
            {error && (
              <p className="rounded-lg border border-outline-variant bg-surface-container-high px-4 py-3 text-sm text-primary">
                {error}
              </p>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              <div>
                <label className={adminLabelClassName} htmlFor="product-name">
                  Product Name
                </label>
                <input
                  id="product-name"
                  required
                  value={form.name}
                  onChange={(event) => handleNameChange(event.target.value)}
                  className={adminFieldClassName}
                />
              </div>
              <div>
                <label className={adminLabelClassName} htmlFor="product-slug">
                  SKU / Slug
                </label>
                <input
                  id="product-slug"
                  required
                  value={form.slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    updateField("slug", event.target.value);
                  }}
                  className={`${adminFieldClassName} font-mono text-xs`}
                />
              </div>
            </div>

            <div>
              <label className={adminLabelClassName} htmlFor="product-description">
                Description
              </label>
              <textarea
                id="product-description"
                rows={5}
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
                className={`${adminFieldClassName} h-32`}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              <div>
                <label className={adminLabelClassName} htmlFor="product-category">
                  Category
                </label>
                <select
                  id="product-category"
                  value={form.categoryId}
                  onChange={(event) => updateField("categoryId", event.target.value)}
                  className={adminFieldClassName}
                >
                  <option value="">— No category —</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={adminLabelClassName} htmlFor="product-price">
                  Price ({DEFAULT_PRODUCT_CURRENCY})
                </label>
                <input
                  id="product-price"
                  type="number"
                  min={0}
                  step="0.01"
                  required
                  value={form.basePrice}
                  onChange={(event) => updateField("basePrice", event.target.value)}
                  className={adminFieldClassName}
                />
              </div>
            </div>

            {mode === "edit" && engagement && (
              <AdminProductEngagementPanel stats={engagement} />
            )}

            {mode === "edit" && rating && (
              <AdminProductRatingPanel stats={rating} />
            )}

            <AdminProductImageUpload
              productId={productId}
              images={images}
              disabled={!canMutate}
              onImagesChange={(next) => {
                onImagesChange?.(next);
                onSaved();
              }}
              onUploadingChange={setImageUploading}
            />

            <AdminProductModelUpload
              productId={productId}
              productSlug={productSlug}
              modelUrl={activeModelUrl}
              modelFileName={activeModelFileName}
              disabled={!canMutate}
              onModelChange={handleModelChange}
              onUploadingChange={setModelUploading}
            />

            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">
                Inventory &amp; Variants
              </h4>
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1">
                  <label className={adminLabelClassName} htmlFor="product-stock">
                    Stock Quantity
                  </label>
                  <input
                    id="product-stock"
                    type="number"
                    min={0}
                    step={1}
                    required
                    readOnly={mode === "edit" && Boolean(productId)}
                    value={form.stock}
                    onChange={(event) => updateField("stock", event.target.value)}
                    className={`${adminFieldClassName}${
                      mode === "edit" && productId ? " bg-surface-container text-on-surface-variant" : ""
                    }`}
                  />
                  {mode === "edit" && productId && (
                    <p className="mt-2 text-xs text-on-surface-variant">
                      For size × color matrix, use the{" "}
                      <span className="font-semibold text-primary">variants</span> action (
                      <span className="material-symbols-outlined align-middle text-[14px]">
                        view_module
                      </span>
                      ) in the product list.
                    </p>
                  )}
                </div>
                <div className="flex-1">
                  <label className={adminLabelClassName} htmlFor="product-low-stock-threshold">
                    Low-stock alert
                  </label>
                  <input
                    id="product-low-stock-threshold"
                    type="number"
                    min={0}
                    step={1}
                    required
                    value={form.lowStockThreshold}
                    onChange={(event) => updateField("lowStockThreshold", event.target.value)}
                    className={adminFieldClassName}
                  />
                  <p className="mt-2 text-xs text-on-surface-variant">
                    Alert when total stock is at or below this number.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1">
                  <label className={adminLabelClassName} htmlFor="product-status">
                    Status
                  </label>
                  <select
                    id="product-status"
                    value={form.status}
                    onChange={(event) => updateField("status", event.target.value as ProductStatus)}
                    className={adminFieldClassName}
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            </div>

            <fieldset className="space-y-3">
              <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-primary">
                Flags
              </legend>
              {(
                [
                  ["isLatestDrop", "Latest drop"],
                  ["isPremium", "Premium"],
                  ["isBestSeller", "Best seller"],
                  ["isTemporarilyUnavailable", "Temporarily unavailable"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form[key]}
                    onChange={(event) => updateField(key, event.target.checked)}
                    className={adminCheckboxClassName}
                  />
                  {label}
                </label>
              ))}
            </fieldset>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-outline-variant p-4 sm:flex-row sm:gap-4 sm:p-6 md:p-8">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-primary py-3 text-xs font-semibold uppercase tracking-[0.1em] text-on-primary transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? "Saving…" : mode === "create" ? "Create Product" : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={requestClose}
              disabled={submitting}
              className="flex-1 rounded-lg border border-outline-variant py-3 text-xs font-semibold uppercase tracking-[0.1em] transition-colors hover:bg-surface-container disabled:opacity-60"
            >
              Discard
            </button>
          </div>
        </form>
      </aside>

      <AdminConfirmDialog
        open={confirmCloseOpen}
        title="Close editor?"
        description={
          modelUploading
            ? "3D model upload is in progress. Cancel upload and close?"
            : "Image upload is in progress. Cancel upload and close?"
        }
        confirmLabel="Close"
        cancelLabel="Stay"
        tone="primary"
        onCancel={() => setConfirmCloseOpen(false)}
        onConfirm={() => {
          setConfirmCloseOpen(false);
          onClose();
        }}
      />
    </div>
  );
}
