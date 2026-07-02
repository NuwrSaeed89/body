import type { AdminProductRow } from "@/lib/admin/list-types";

type ProductThumbnailProps = {
  imageUrl: string | null;
  alt: string;
};

export function AdminProductThumbnail({ imageUrl, alt }: ProductThumbnailProps) {
  return (
    <div className="h-12 w-10 shrink-0 overflow-hidden rounded bg-surface-container">
      {imageUrl ? (
        // Admin thumbnails use external URLs; native img avoids optimizer/layout issues in tables.
        <img src={imageUrl} alt={alt} className="size-full object-cover" loading="lazy" />
      ) : (
        <div className="flex size-full items-center justify-center">
          <span className="material-symbols-outlined text-base text-on-surface-variant">image</span>
        </div>
      )}
    </div>
  );
}

export function stockStatus(product: AdminProductRow): {
  label: string;
  tone: "primary" | "error" | "muted";
} {
  if (product.stock === 0) return { label: "Out of Stock", tone: "muted" };
  if (product.stock <= 5) return { label: "Low Stock", tone: "error" };
  return { label: "In Stock", tone: "primary" };
}

export function AdminProductStockBadge({ product }: { product: AdminProductRow }) {
  const stock = stockStatus(product);
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap text-[10px] font-bold uppercase tracking-tighter ${
        stock.tone === "error"
          ? "text-error"
          : stock.tone === "muted"
            ? "text-on-surface-variant"
            : "text-primary"
      }`}
    >
      <span
        className={`size-1.5 shrink-0 rounded-full ${
          stock.tone === "error"
            ? "bg-error"
            : stock.tone === "muted"
              ? "bg-on-surface-variant"
              : "bg-primary"
        }`}
      />
      {stock.label}
    </span>
  );
}

const TABLE_HEAD_CLASS =
  "px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-on-surface-variant";

const TABLE_CELL_CLASS = "px-6 py-3 align-middle text-sm";

type AdminProductsTableProps = {
  products: AdminProductRow[];
  emptyMessage: string;
  canMutate: boolean;
  deletingId: string | null;
  onEdit: (product: AdminProductRow) => void;
  onDelete: (product: AdminProductRow) => void;
};

export function AdminProductsTable({
  products,
  emptyMessage,
  canMutate,
  deletingId,
  onEdit,
  onDelete,
}: AdminProductsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed border-collapse text-left">
        <colgroup>
          <col style={{ width: "34%" }} />
          <col style={{ width: "18%" }} />
          <col style={{ width: "14%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "10%" }} />
        </colgroup>
        <thead className="bg-surface-container-low">
          <tr>
            <th className={TABLE_HEAD_CLASS}>Product</th>
            <th className={TABLE_HEAD_CLASS}>SKU</th>
            <th className={TABLE_HEAD_CLASS}>Category</th>
            <th className={TABLE_HEAD_CLASS}>Price</th>
            <th className={TABLE_HEAD_CLASS}>Stock</th>
            <th className={`${TABLE_HEAD_CLASS} text-right`}>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/20">
          {products.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-10 text-center text-sm text-on-surface-variant">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            products.map((product) => (
              <tr
                key={product.id}
                className={`transition-colors ${
                  canMutate ? "cursor-pointer hover:bg-surface-container-low/50" : ""
                }`}
                onClick={() => canMutate && onEdit(product)}
              >
                <td className={TABLE_CELL_CLASS}>
                  <div className="flex min-w-0 items-center gap-3">
                    <AdminProductThumbnail imageUrl={product.imageUrl} alt={product.name} />
                    <span className="min-w-0 truncate font-medium text-primary">{product.name}</span>
                  </div>
                </td>
                <td className={`${TABLE_CELL_CLASS} truncate font-mono text-xs text-on-surface-variant`}>
                  {product.slug}
                </td>
                <td className={`${TABLE_CELL_CLASS} truncate text-on-surface-variant`}>
                  {product.categoryName ?? "—"}
                </td>
                <td className={`${TABLE_CELL_CLASS} whitespace-nowrap font-bold text-primary`}>
                  {product.price}
                </td>
                <td className={TABLE_CELL_CLASS}>
                  <AdminProductStockBadge product={product} />
                </td>
                <td className={`${TABLE_CELL_CLASS} text-right`}>
                  {canMutate && (
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onEdit(product);
                        }}
                        className="material-symbols-outlined rounded-full p-1 text-[20px] text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                        aria-label={`Edit ${product.name}`}
                      >
                        edit
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onDelete(product);
                        }}
                        disabled={deletingId === product.id}
                        className="material-symbols-outlined rounded-full p-1 text-[20px] text-on-surface-variant transition-colors hover:bg-surface-container hover:text-error disabled:opacity-50"
                        aria-label={`Delete ${product.name}`}
                      >
                        {deletingId === product.id ? "hourglass_empty" : "delete"}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
