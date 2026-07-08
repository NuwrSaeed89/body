"use client";

import { Link } from "@/i18n/navigation";
import type { AdminProductRow } from "@/lib/admin/list-types";
import { AdminProductVariantMatrix } from "./admin-product-variant-matrix";
import { AdminProductThumbnail } from "./admin-products-table";
import { AdminPageHeader } from "./admin-page-header";
import { adminPageSectionClass } from "./admin-layout-styles";
import { AdminSourceBadge } from "./admin-source-badge";

type AdminProductVariantsViewProps = {
  product: AdminProductRow;
  locale: string;
  source: "supabase" | "mock";
  canMutate: boolean;
};

export function AdminProductVariantsView({
  product,
  locale,
  source,
  canMutate,
}: AdminProductVariantsViewProps) {
  return (
    <section className={adminPageSectionClass}>
      <div className="mb-6">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant transition-colors hover:text-primary"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to products
        </Link>
      </div>

      <AdminPageHeader
        title="Product Variants"
        description="Manage size × color combinations, SKU, and stock for this product."
        source={source}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(240px,300px)_minmax(0,1fr)] lg:items-start">
        <aside className="rounded-xl border border-outline-variant bg-surface-container-low p-5 lg:sticky lg:top-24">
          <div className="flex items-start gap-4">
            <AdminProductThumbnail imageUrl={product.imageUrl} alt={product.name} />
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-primary">{product.name}</h3>
              <p className="mt-1 truncate font-mono text-xs text-on-surface-variant">
                {product.slug}
              </p>
            </div>
          </div>

          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-on-surface-variant">Category</dt>
              <dd className="truncate font-medium text-primary">
                {product.categoryName ?? "—"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-on-surface-variant">Price</dt>
              <dd className="font-semibold text-primary">{product.price}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-on-surface-variant">Status</dt>
              <dd className="font-medium text-primary">{product.status}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-on-surface-variant">Stock</dt>
              <dd className="font-medium text-primary">{product.stock}</dd>
            </div>
          </dl>

          {product.flags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {product.flags.map((flag) => (
                <span
                  key={flag}
                  className="rounded-full bg-surface-container-high px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant"
                >
                  {flag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-2 border-t border-outline-variant/40 pt-5">
            <Link
              href={`/shop/${product.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-outline-variant px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-primary transition-colors hover:bg-surface-container"
            >
              <span className="material-symbols-outlined text-[18px]">open_in_new</span>
              View storefront
            </Link>
            {!canMutate && (
              <p className="text-xs text-on-surface-variant">
                Variant editing requires live Supabase (
                <AdminSourceBadge source={source} />
                ).
              </p>
            )}
          </div>
        </aside>

        <div className="min-w-0">
          <AdminProductVariantMatrix
            productId={product.id}
            productSlug={product.slug}
            locale={locale}
            disabled={!canMutate}
          />
        </div>
      </div>
    </section>
  );
}
