import type { AdminCustomersData } from "@/lib/admin/list-types";
import {
  adminPageSectionClass,
  adminTableBodyCellClass,
  adminTableHeadCellClass,
} from "./admin-layout-styles";
import { AdminPageHeader } from "./admin-page-header";

type AdminCustomersViewProps = {
  data: AdminCustomersData;
};

export function AdminCustomersView({ data }: AdminCustomersViewProps) {
  return (
    <section className={adminPageSectionClass}>
      <AdminPageHeader
        title="Customers"
        description="Registered shoppers and admins from public.profiles."
        source={data.source}
        count={data.totalCount}
        countLabel="profiles"
      />

      <article className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low">
        <ul className="divide-y divide-outline-variant md:hidden">
          {data.customers.length === 0 ? (
            <li className="px-4 py-10 text-center text-sm text-on-surface-variant">
              No customer profiles yet. Sign-ups via Supabase Auth will appear here.
            </li>
          ) : (
            data.customers.map((customer) => (
              <li key={customer.id} className="px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-primary">{customer.name}</p>
                    <p className="mt-0.5 truncate text-xs text-on-surface-variant">
                      {customer.email}
                    </p>
                    <p className="mt-2 text-xs text-on-surface-variant">{customer.joined}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${
                        customer.role === "admin"
                          ? "bg-primary/10 text-primary"
                          : "bg-surface-container-high text-on-surface-variant"
                      }`}
                    >
                      {customer.role}
                    </span>
                    <p className="mt-2 text-[10px] uppercase tracking-wider text-on-surface-variant">
                      {customer.locale} · {customer.currency}
                    </p>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>

        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-[760px] w-full text-left">
            <thead className="bg-surface-container-high">
              <tr>
                {["Name", "Email", "Role", "Locale", "Currency", "Joined"].map((heading) => (
                  <th key={heading} className={adminTableHeadCellClass}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {data.customers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className={`${adminTableBodyCellClass} py-10 text-center text-on-surface-variant`}
                  >
                    No customer profiles yet. Sign-ups via Supabase Auth will appear here.
                  </td>
                </tr>
              ) : (
                data.customers.map((customer) => (
                  <tr key={customer.id}>
                    <td className={`${adminTableBodyCellClass} font-medium text-primary`}>
                      {customer.name}
                    </td>
                    <td className={`${adminTableBodyCellClass} text-on-surface-variant`}>
                      {customer.email}
                    </td>
                    <td className={adminTableBodyCellClass}>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-[0.08em] ${
                          customer.role === "admin"
                            ? "bg-primary/10 text-primary"
                            : "bg-surface-container-high text-on-surface-variant"
                        }`}
                      >
                        {customer.role}
                      </span>
                    </td>
                    <td className={`${adminTableBodyCellClass} uppercase`}>{customer.locale}</td>
                    <td className={adminTableBodyCellClass}>{customer.currency}</td>
                    <td className={`${adminTableBodyCellClass} text-on-surface-variant`}>
                      {customer.joined}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
