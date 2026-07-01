const metrics = [
  { label: "Total Sales (SEK)", value: "1,248,500", delta: "+12.4%", trend: "up" },
  { label: "Orders", value: "4,122", delta: "+8.2%", trend: "up" },
  { label: "Conversion Rate", value: "3.8%", delta: "+0.5%", trend: "up" },
  { label: "Avg Order Value", value: "302 SEK", delta: "-2.1%", trend: "down" },
] as const;

const topCollections = [
  { name: "Sculpt Tight High-Rise", group: "Core Essentials", orders: "12.5k" },
  { name: "AeroFlow Crop Top", group: "Limited Edition", orders: "8.2k" },
  { name: "Element Shield Shell", group: "Outerwear", orders: "4.1k" },
] as const;

const recentOrders = [
  { id: "#MB-9821", customer: "Elena Svensson", date: "Jun 14, 2024", status: "Shipped", total: "2,450 SEK" },
  { id: "#MB-9819", customer: "Marcus Andersson", date: "Jun 14, 2024", status: "Processing", total: "1,120 SEK" },
  { id: "#MB-9815", customer: "Sofia Lundin", date: "Jun 13, 2024", status: "Delivered", total: "4,890 SEK" },
] as const;

export function AdminDashboard() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto flex w-full max-w-[1440px]">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-outline-variant bg-surface-container-low p-6 lg:flex lg:flex-col">
          <div>
            <h1 className="text-xl font-semibold text-primary">Mbody Admin</h1>
            <p className="mt-1 text-xs uppercase tracking-[0.12em] text-on-surface-variant">Management Portal</p>
          </div>
          <nav className="mt-8 space-y-1">
            {["Dashboard", "Orders", "Products", "Customers", "Settings"].map((item, index) => (
              <button
                key={item}
                type="button"
                className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                  index === 0
                    ? "bg-surface-container-high font-semibold text-primary"
                    : "text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
          <div className="mt-auto border-t border-outline-variant pt-4">
            <p className="text-sm font-medium text-primary">Admin User</p>
            <p className="text-xs uppercase tracking-[0.12em] text-on-surface-variant">Store Manager</p>
          </div>
        </aside>

        <section className="min-w-0 flex-1 p-5 md:p-8">
          <header className="mb-8 flex flex-col gap-4 border-b border-outline-variant pb-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-primary md:text-3xl">Sales Overview</h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Real-time performance tracking for Mbody Sweden.
              </p>
            </div>
            <input
              type="search"
              placeholder="Search data, orders, customers..."
              className="w-full rounded-lg border border-outline-variant bg-surface px-4 py-2.5 text-sm outline-none transition focus:border-primary md:w-80"
            />
          </header>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <article key={metric.label} className="rounded-xl border border-outline-variant bg-surface-container-low p-5">
                <p className="text-xs uppercase tracking-[0.1em] text-on-surface-variant">{metric.label}</p>
                <div className="mt-3 flex items-end gap-2">
                  <p className="text-2xl font-semibold text-primary">{metric.value}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      metric.trend === "up" ? "bg-surface-container-high text-primary" : "bg-surface-variant text-on-surface"
                    }`}
                  >
                    {metric.delta}
                  </span>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 xl:grid-cols-3">
            <article className="rounded-xl border border-outline-variant bg-surface-container-low p-6 xl:col-span-2">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-primary">Revenue Trends</h3>
                <button className="rounded-full border border-outline-variant px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em]">
                  Export CSV
                </button>
              </div>
              <div className="flex h-48 items-end gap-2">
                {[40, 55, 45, 70, 85, 95, 75].map((height, index) => (
                  <div
                    key={height}
                    className={`flex-1 rounded-t ${index === 5 ? "bg-primary/30" : "bg-primary/15"}`}
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
              <div className="mt-3 grid grid-cols-7 text-center text-[11px] uppercase tracking-[0.1em] text-on-surface-variant">
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"].map((month) => (
                  <span key={month}>{month}</span>
                ))}
              </div>
            </article>

            <article className="rounded-xl border border-outline-variant bg-surface-container-low p-6">
              <h3 className="text-lg font-semibold text-primary">Top Collections</h3>
              <div className="mt-6 space-y-4">
                {topCollections.map((collection) => (
                  <div key={collection.name} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-primary">{collection.name}</p>
                      <p className="text-xs uppercase tracking-[0.1em] text-on-surface-variant">{collection.group}</p>
                    </div>
                    <p className="text-sm font-semibold text-primary">{collection.orders}</p>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <article className="mt-8 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low">
            <div className="flex items-center justify-between border-b border-outline-variant px-5 py-4">
              <h3 className="text-lg font-semibold text-primary">Recent Premium Orders</h3>
              <button className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-surface-container-high">
                  <tr className="text-xs uppercase tracking-[0.1em] text-on-surface-variant">
                    <th className="px-5 py-3 font-semibold">Order ID</th>
                    <th className="px-5 py-3 font-semibold">Customer</th>
                    <th className="px-5 py-3 font-semibold">Date</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="text-sm">
                      <td className="px-5 py-4 font-medium text-primary">{order.id}</td>
                      <td className="px-5 py-4">{order.customer}</td>
                      <td className="px-5 py-4 text-on-surface-variant">{order.date}</td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-surface-container-high px-2 py-1 text-xs font-semibold text-primary">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-semibold text-primary">{order.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
