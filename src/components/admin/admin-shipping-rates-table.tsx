import type { AdminShippingRateRow } from "@/lib/admin/shipping/types";
import {
  adminTableBodyCellClass,
  adminTableHeadCellClass,
} from "./admin-layout-styles";

type AdminShippingRatesTableProps = {
  rates: AdminShippingRateRow[];
  emptyMessage: string;
  canMutate: boolean;
  deletingId: string | null;
  onEdit: (rate: AdminShippingRateRow) => void;
  onDelete: (rate: AdminShippingRateRow) => void;
};

export function AdminShippingStatusBadge({ active }: { active: boolean }) {
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

export function AdminShippingRatesTable({
  rates,
  emptyMessage,
  canMutate,
  deletingId,
  onEdit,
  onDelete,
}: AdminShippingRatesTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[1100px] w-full text-left">
        <thead className="bg-surface-container-high">
          <tr>
            {[
              "Carrier",
              "Service",
              "Zone",
              "Countries",
              "Price",
              "ETA",
              "Status",
              "Actions",
            ].map((heading) => (
              <th key={heading} className={adminTableHeadCellClass}>
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant">
          {rates.length === 0 ? (
            <tr>
              <td
                colSpan={8}
                className={`${adminTableBodyCellClass} py-10 text-center text-on-surface-variant`}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rates.map((rate) => (
              <tr key={rate.id} className="transition-colors hover:bg-surface-container">
                <td className={`${adminTableBodyCellClass} font-semibold text-primary`}>
                  {rate.carrierLabel}
                </td>
                <td className={`${adminTableBodyCellClass} text-on-surface-variant`}>
                  {rate.serviceLabel}
                </td>
                <td className={adminTableBodyCellClass}>
                  <p className="font-semibold text-primary">{rate.zoneLabel}</p>
                  <p className="mt-0.5 font-mono text-xs uppercase text-on-surface-variant">
                    {rate.zoneCode}
                  </p>
                </td>
                <td
                  className={`${adminTableBodyCellClass} max-w-[220px] font-mono text-xs uppercase text-on-surface-variant`}
                >
                  {rate.countriesLabel}
                </td>
                <td className={`${adminTableBodyCellClass} font-semibold text-primary`}>
                  {rate.priceLabel}
                </td>
                <td className={`${adminTableBodyCellClass} text-on-surface-variant`}>
                  {rate.etaLabel}
                </td>
                <td className={adminTableBodyCellClass}>
                  <AdminShippingStatusBadge active={rate.isActive} />
                </td>
                <td className={adminTableBodyCellClass}>
                  {canMutate ? (
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(rate)}
                        className="material-symbols-outlined rounded-full p-1 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                        aria-label={`Edit ${rate.zoneLabel} ${rate.carrierLabel}`}
                      >
                        edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(rate)}
                        disabled={deletingId === rate.id}
                        className="material-symbols-outlined rounded-full p-1 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-error disabled:opacity-50"
                        aria-label={`Delete ${rate.zoneLabel} ${rate.carrierLabel}`}
                      >
                        {deletingId === rate.id ? "hourglass_empty" : "delete"}
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
