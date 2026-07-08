import { MOCK_ADMIN_DASHBOARD } from "./mock-dashboard-data";
import {
  ADMIN_DISPLAY_CURRENCY,
  formatAdminAmount,
  formatAdminDisplayAmount,
  formatDelta,
  formatCompactCount,
  formatInteger,
  formatOrderDate,
  formatOrderStatusLabel,
  formatPercent,
  isCompletedOrderStatus,
  lastNMonthBuckets,
  monthKey,
  sumInAdminDisplayCurrency,
} from "./format";
import type { AdminDashboardData, AdminRecentOrder, AdminTopCollection } from "./types";
import { shouldUseAdminMock } from "./should-use-mock";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { buildLowStockAlerts } from "./inventory/alerts";
import { getAdminProductsData } from "./get-admin-products";

type OrderRow = {
  id: string;
  order_number: string;
  user_id: string;
  status: string;
  grand_total: number;
  currency: string;
  created_at: string;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string;
};

type ProductRow = {
  id: string;
  units_sold: number;
  view_count: number;
  product_translations: { name: string; locale: string }[];
};

function shouldUseMock(): boolean {
  return shouldUseAdminMock();
}

function customerName(
  profile: ProfileRow | undefined,
  shippingAddress: unknown,
): string {
  if (profile?.full_name?.trim()) return profile.full_name.trim();
  if (
    shippingAddress &&
    typeof shippingAddress === "object" &&
    "fullName" in shippingAddress &&
    typeof (shippingAddress as { fullName?: string }).fullName === "string"
  ) {
    return (shippingAddress as { fullName: string }).fullName;
  }
  return profile?.email ?? "Guest";
}

async function fetchDashboardFromSupabase(locale: string): Promise<AdminDashboardData> {
  const supabase = createSupabaseAdminClient();
  const contentLocale = ["en", "sv", "es", "de"].includes(locale) ? locale : "en";

  const [ordersResult, profilesResult, productsResult] = await Promise.all([
    supabase
      .from("orders")
      .select("id, order_number, user_id, status, grand_total, currency, created_at, shipping_address")
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, full_name, email"),
    supabase
      .from("products")
      .select(
        `
        id,
        units_sold,
        view_count,
        product_translations!inner(name, locale)
      `,
      )
      .eq("status", "active")
      .eq("product_translations.locale", contentLocale)
      .order("units_sold", { ascending: false })
      .limit(12),
  ]);

  if (ordersResult.error) throw ordersResult.error;
  if (profilesResult.error) throw profilesResult.error;
  if (productsResult.error) throw productsResult.error;

  const orders = (ordersResult.data ?? []) as (OrderRow & { shipping_address: unknown })[];
  const profilesById = new Map(
    ((profilesResult.data ?? []) as ProfileRow[]).map((p) => [p.id, p]),
  );

  const completedOrders = orders.filter((o) => isCompletedOrderStatus(o.status));
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixtyDaysAgo = new Date(now);
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const currentPeriod = completedOrders.filter(
    (o) => new Date(o.created_at) >= thirtyDaysAgo,
  );
  const previousPeriod = completedOrders.filter((o) => {
    const d = new Date(o.created_at);
    return d >= sixtyDaysAgo && d < thirtyDaysAgo;
  });

  const totalSales = sumInAdminDisplayCurrency(
    completedOrders.map((o) => ({ amount: Number(o.grand_total), currency: o.currency })),
  );
  const currentSales = sumInAdminDisplayCurrency(
    currentPeriod.map((o) => ({ amount: Number(o.grand_total), currency: o.currency })),
  );
  const previousSales = sumInAdminDisplayCurrency(
    previousPeriod.map((o) => ({ amount: Number(o.grand_total), currency: o.currency })),
  );
  const salesDelta = formatDelta(currentSales, previousSales);

  const orderCount = completedOrders.length;
  const ordersDelta = formatDelta(currentPeriod.length, previousPeriod.length);

  const avgOrderValue = orderCount > 0 ? totalSales / orderCount : 0;
  const currentAov =
    currentPeriod.length > 0
      ? sumInAdminDisplayCurrency(
          currentPeriod.map((o) => ({ amount: Number(o.grand_total), currency: o.currency })),
        ) / currentPeriod.length
      : 0;
  const previousAov =
    previousPeriod.length > 0
      ? sumInAdminDisplayCurrency(
          previousPeriod.map((o) => ({ amount: Number(o.grand_total), currency: o.currency })),
        ) / previousPeriod.length
      : 0;
  const aovDelta = formatDelta(currentAov, previousAov);

  const products = (productsResult.data ?? []) as ProductRow[];
  const totalViews = products.reduce((sum, p) => sum + Number(p.view_count ?? 0), 0);
  const conversionRate = totalViews > 0 ? (orderCount / totalViews) * 100 : 0;
  const conversionDelta = formatDelta(orderCount, Math.max(0, orderCount - currentPeriod.length));

  const monthBuckets = lastNMonthBuckets(7);
  const revenueByMonth = new Map(monthBuckets.map((b) => [b.key, 0]));
  for (const order of completedOrders) {
    const key = monthKey(new Date(order.created_at));
    if (revenueByMonth.has(key)) {
      const amount = sumInAdminDisplayCurrency([
        { amount: Number(order.grand_total), currency: order.currency },
      ]);
      revenueByMonth.set(key, (revenueByMonth.get(key) ?? 0) + amount);
    }
  }
  const revenueAmounts = monthBuckets.map((b) => revenueByMonth.get(b.key) ?? 0);
  const maxRevenue = Math.max(...revenueAmounts, 1);

  const topCollections: AdminTopCollection[] = products.slice(0, 3).map((product) => {
    const name =
      product.product_translations.find((t) => t.locale === contentLocale)?.name ??
      product.product_translations[0]?.name ??
      "Product";

    return {
      name,
      group: "Catalog",
      orders: formatCompactCount(Number(product.units_sold ?? 0)),
    };
  });

  const recentOrders: AdminRecentOrder[] = orders.slice(0, 10).map((order) => {
    const profile = profilesById.get(order.user_id);
    return {
      id: `#${order.order_number}`,
      customer: customerName(profile, order.shipping_address),
      date: formatOrderDate(order.created_at, contentLocale),
      status: formatOrderStatusLabel(order.status),
      total: formatAdminDisplayAmount(Number(order.grand_total), order.currency, contentLocale),
    };
  });

  const productsData = await getAdminProductsData(contentLocale);
  const lowStockAlerts = buildLowStockAlerts(productsData.products).slice(0, 8);

  return {
    source: "supabase",
    managerName: "Mbody Admin",
    managerRole: "Live store data",
    metrics: [
      {
        label: `Total Sales (${ADMIN_DISPLAY_CURRENCY})`,
        value: formatAdminAmount(totalSales, contentLocale, ADMIN_DISPLAY_CURRENCY),
        delta: salesDelta.delta,
        trend: salesDelta.trend,
      },
      {
        label: "Orders",
        value: formatInteger(orderCount, contentLocale),
        delta: ordersDelta.delta,
        trend: ordersDelta.trend,
      },
      {
        label: "Conversion Rate",
        value: formatPercent(conversionRate),
        delta: conversionDelta.delta,
        trend: conversionDelta.trend,
      },
      {
        label: "Avg Order Value",
        value: formatAdminAmount(avgOrderValue, contentLocale, ADMIN_DISPLAY_CURRENCY),
        delta: aovDelta.delta,
        trend: aovDelta.trend,
      },
    ],
    revenueTrends: monthBuckets.map((bucket, index) => {
      const amount = revenueAmounts[index] ?? 0;
      return {
        month: bucket.label,
        amount,
        amountLabel: formatAdminAmount(amount, contentLocale, ADMIN_DISPLAY_CURRENCY),
        heightPercent: Math.max(8, Math.round((amount / maxRevenue) * 100)),
      };
    }),
    topCollections,
    recentOrders,
    lowStockAlerts,
  };
}

export async function getAdminDashboardData(locale: string): Promise<AdminDashboardData> {
  if (shouldUseMock()) {
    return MOCK_ADMIN_DASHBOARD;
  }

  try {
    return await fetchDashboardFromSupabase(locale);
  } catch (error) {
    console.error("[admin] Supabase dashboard fetch failed, using mock data:", error);
    return MOCK_ADMIN_DASHBOARD;
  }
}
