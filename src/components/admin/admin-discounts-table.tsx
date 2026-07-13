import type { AdminDiscountRow } from "@/lib/admin/discounts/types";
import {
  adminTableBodyCellClass,
  adminTableHeadCellClass,
} from "./admin-layout-styles";

type AdminDiscountsTableProps = {
  discounts: AdminDiscountRow[];
  emptyMessage: string;
  canMutate: boolean;
  deletingId: string | null;
  onEdit: (discount: AdminDiscountRow) => void;
  onDelete: (discount: AdminDiscountRow) => void;
};

export function AdminDiscountStatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${
        active
          ? "bg-primary/10 text-primary"
          : "bg-surface-variant text-on-surface-variant"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export function AdminDiscountsTable({
  discounts,
  emptyMessage,
  canMutate,
  deletingId,
  onEdit,
  onDelete,
}: AdminDiscountsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[980px] w-full text-left">
        <thead className="bg-surface-container-high">
          <tr>
            {["Code", "Type", "Value", "Usage", "Starts", "Expires", "Status", "Actions"].map(
              (heading) => (
                <th key={heading} className={adminTableHeadCellClass}>
                  {heading}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant">
          {discounts.length === 0 ? (
            <tr>
              <td
                colSpan={8}
                className={`${adminTableBodyCellClass} py-10 text-center text-on-surface-variant`}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            discounts.map((discount) => (
              <tr key={discount.id} className="transition-colors hover:bg-surface-container">
                <td className={adminTableBodyCellClass}>
                  <p className="font-mono text-sm font-semibold uppercase text-primary">
                    {discount.code}
                  </p>
                  {discount.description && (
                    <p className="mt-0.5 max-w-[220px] truncate text-xs text-on-surface-variant">
                      {discount.description}
                    </p>
                  )}
                </td>
                <td className={`${adminTableBodyCellClass} text-on-surface-variant`}>
                  {discount.typeLabel}
                </td>
                <td className={`${adminTableBodyCellClass} font-semibold text-primary`}>
                  {discount.valueLabel}
                </td>
                <td className={`${adminTableBodyCellClass} text-on-surface-variant`}>
                  {discount.usageLabel}
                </td>
                <td className={`${adminTableBodyCellClass} text-on-surface-variant`}>
                  {discount.startsAtLabel}
                </td>
                <td className={`${adminTableBodyCellClass} text-on-surface-variant`}>
                  {discount.expiresAtLabel}
                </td>
                <td className={adminTableBodyCellClass}>
                  <AdminDiscountStatusBadge active={discount.isActive} />
                </td>
                <td className={adminTableBodyCellClass}>
                  {canMutate ? (
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(discount)}
                        className="material-symbols-outlined rounded-full p-1 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                        aria-label={`Edit ${discount.code}`}
                      >
                        edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(discount)}
                        disabled={deletingId === discount.id}
                        className="material-symbols-outlined rounded-full p-1 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-error disabled:opacity-50"
                        aria-label={`Delete ${discount.code}`}
                      >
                        {deletingId === discount.id ? "hourglass_empty" : "delete"}
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-on-surface-variant">—</span>
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
