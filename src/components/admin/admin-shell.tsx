"use client";

import { Link, usePathname } from "@/i18n/navigation";
import type { ReactNode } from "react";
import { ADMIN_NAV, type AdminNavKey } from "./admin-nav";
import { AdminSourceBadge } from "./admin-source-badge";

type AdminShellProps = {
  children: ReactNode;
  source: "supabase" | "mock";
  managerName?: string;
  managerRole?: string;
};

function activeKey(pathname: string): AdminNavKey {
  if (pathname.startsWith("/admin/orders")) return "orders";
  if (pathname.startsWith("/admin/products")) return "products";
  if (pathname.startsWith("/admin/customers")) return "customers";
  if (pathname.startsWith("/admin/settings")) return "settings";
  return "dashboard";
}

export function AdminShell({
  children,
  source,
  managerName = "Mbody Admin",
  managerRole = "Management Portal",
}: AdminShellProps) {
  const pathname = usePathname();
  const current = activeKey(pathname);

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <aside className="fixed left-0 top-0 z-50 hidden h-full w-64 flex-col border-r border-outline-variant bg-surface-container-lowest p-4 md:flex">
        <div className="mb-10 px-4">
          <h1 className="text-lg font-black text-primary">Mbody Admin</h1>
          <p className="mt-1 text-sm text-on-surface-variant">Management Portal</p>
        </div>
        <nav className="flex-grow space-y-1" aria-label="Admin navigation">
          {ADMIN_NAV.map((item) => {
            const isActive = item.key === current;
            const className = `flex items-center gap-3 rounded-lg px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] transition-colors ${
              isActive
                ? "bg-secondary-container font-bold text-on-secondary-container"
                : "text-on-surface-variant hover:bg-surface-container hover:text-primary"
            }`;

            if (!item.enabled) {
              return (
                <span
                  key={item.key}
                  className={`${className} cursor-not-allowed opacity-40`}
                  aria-disabled
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  {item.label}
                </span>
              );
            }

            return (
              <Link key={item.key} href={item.href} className={className}>
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex items-center gap-3 border-t border-outline-variant px-2 pt-4">
          <div className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-secondary-container">
            <span className="material-symbols-outlined text-on-surface-variant">person</span>
          </div>
          <div className="min-w-0">
            <AdminSourceBadge source={source} />
            <p className="truncate text-xs font-semibold uppercase tracking-[0.1em] text-primary">
              {managerName}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">
              {managerRole}
            </p>
          </div>
        </div>
      </aside>

      <div className="md:ml-64">
        <header className="sticky top-0 z-40 border-b border-outline-variant bg-surface/95 backdrop-blur-sm md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-primary">Mbody Admin</p>
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">
                Management Portal
              </p>
            </div>
            <AdminSourceBadge source={source} />
          </div>
          <nav
            className="flex gap-2 overflow-x-auto px-4 pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Admin navigation mobile"
          >
            {ADMIN_NAV.filter((item) => item.enabled).map((item) => {
              const isActive = item.key === current;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] ${
                    isActive
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-high text-on-surface-variant"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>
        <main className="mx-auto w-full min-w-0 max-w-[1440px] pb-[env(safe-area-inset-bottom)]">
          {children}
        </main>
      </div>
    </div>
  );
}
