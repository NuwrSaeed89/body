import type { AdminCategoryRow } from "@/lib/admin/categories/types";

const TABLE_HEAD_CLASS =
  "px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-on-surface-variant";

const TABLE_CELL_CLASS = "px-6 py-3 align-middle text-sm";

type AdminCategoriesTableProps = {
  categories: AdminCategoryRow[];
  emptyMessage: string;
  canMutate: boolean;
  deletingId: string | null;
  onEdit: (category: AdminCategoryRow) => void;
  onDelete: (category: AdminCategoryRow) => void;
};

export function AdminCategoryStatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap text-[10px] font-bold uppercase tracking-tighter ${
        active ? "text-primary" : "text-on-surface-variant"
      }`}
    >
      <span
        className={`size-1.5 shrink-0 rounded-full ${
          active ? "bg-primary" : "bg-on-surface-variant"
        }`}
      />
      {active ? "Active" : "Hidden"}
    </span>
  );
}

export function AdminCategoriesTable({
  categories,
  emptyMessage,
  canMutate,
  deletingId,
  onEdit,
  onDelete,
}: AdminCategoriesTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse">
        <thead className="border-b border-outline-variant/30 bg-surface-container-low/50">
          <tr>
            <th className={TABLE_HEAD_CLASS}>Name</th>
            <th className={TABLE_HEAD_CLASS}>Slug</th>
            <th className={TABLE_HEAD_CLASS}>Order</th>
            <th className={TABLE_HEAD_CLASS}>Products</th>
            <th className={TABLE_HEAD_CLASS}>Status</th>
            {canMutate && <th className={`${TABLE_HEAD_CLASS} text-right`}>Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/20">
          {categories.length === 0 ? (
            <tr>
              <td
                colSpan={canMutate ? 6 : 5}
                className="px-6 py-10 text-center text-sm text-on-surface-variant"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            categories.map((category) => (
              <tr
                key={category.id}
                className={canMutate ? "cursor-pointer transition-colors hover:bg-surface-container-low/40" : ""}
                onClick={() => canMutate && onEdit(category)}
              >
                <td className={`${TABLE_CELL_CLASS} font-medium text-primary`}>{category.name}</td>
                <td className={`${TABLE_CELL_CLASS} font-mono text-xs text-on-surface-variant`}>
                  {category.slug}
                </td>
                <td className={TABLE_CELL_CLASS}>{category.sortOrder}</td>
                <td className={TABLE_CELL_CLASS}>{category.productCount}</td>
                <td className={TABLE_CELL_CLASS}>
                  <AdminCategoryStatusBadge active={category.isActive} />
                </td>
                {canMutate && (
                  <td className={`${TABLE_CELL_CLASS} text-right`}>
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onEdit(category);
                        }}
                        className="material-symbols-outlined rounded-full p-1 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                        aria-label={`Edit ${category.name}`}
                      >
                        edit
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onDelete(category);
                        }}
                        disabled={deletingId === category.id}
                        className="material-symbols-outlined rounded-full p-1 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-error disabled:opacity-50"
                        aria-label={`Delete ${category.name}`}
                      >
                        {deletingId === category.id ? "hourglass_empty" : "delete"}
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
