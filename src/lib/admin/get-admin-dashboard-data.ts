import { MOCK_ADMIN_DASHBOARD } from "./mock-dashboard-data";
import {
  formatCompactCount,
  formatDelta,
  formatInteger,
  formatOrderDate,
  formatOrderStatusLabel,
  formatPercent,
  formatSekAmount,
  isCompletedOrderStatus,
  lastNMonthBuckets,
  monthKey,
} from "./format";
import type { AdminDashboardData, AdminRecentOrder, AdminTopCollection } from "./types";
import { shouldUseAdminMock } from "./should-use-mock";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type OrderRow = {
  id: string;
  order_number: string;
  user_id: string;
  status: string;
  grand_total: number;
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
      .select("id, order_number, user_id, status, grand_total, created_at, shipping_address")
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

  const totalSalesSek = completedOrders.reduce((sum, o) => sum + Number(o.grand_total), 0);
  const currentSales = currentPeriod.reduce((sum, o) => sum + Number(o.grand_total), 0);
  const previousSales = previousPeriod.reduce((sum, o) => sum + Number(o.grand_total), 0);
  const salesDelta = formatDelta(currentSales, previousSales);

  const orderCount = completedOrders.length;
  const ordersDelta = formatDelta(currentPeriod.length, previousPeriod.length);

  const avgOrderValue = orderCount > 0 ? totalSalesSek / orderCount : 0;
  const currentAov =
    currentPeriod.length > 0
      ? currentPeriod.reduce((s, o) => s + Number(o.grand_total), 0) / currentPeriod.length
      : 0;
  const previousAov =
    previousPeriod.length > 0
      ? previousPeriod.reduce((s, o) => s + Number(o.grand_total), 0) / previousPeriod.length
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
      revenueByMonth.set(key, (revenueByMonth.get(key) ?? 0) + Number(order.grand_total));
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
      total: formatSekAmount(Number(order.grand_total), contentLocale),
    };
  });

  return {
    source: "supabase",
    managerName: "Mbody Admin",
    managerRole: "Live store data",
    metrics: [
      {
        label: "Total Sales (SEK)",
        value: formatInteger(Math.round(totalSalesSek), contentLocale),
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
        value: formatSekAmount(Math.round(avgOrderValue), contentLocale),
        delta: aovDelta.delta,
        trend: aovDelta.trend,
      },
    ],
    revenueTrends: monthBuckets.map((bucket, index) => {
      const amountSek = revenueAmounts[index] ?? 0;
      return {
        month: bucket.label,
        amountSek,
        heightPercent: Math.max(8, Math.round((amountSek / maxRevenue) * 100)),
      };
    }),
    topCollections,
    recentOrders,
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
