import {
  formatOrderDate,
  formatOrderStatusLabel,
  formatSekAmount,
} from "./format";
import type { AdminOrdersData } from "./list-types";
import { MOCK_ADMIN_ORDERS } from "./mock-list-data";
import { shouldUseAdminMock } from "./should-use-mock";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type DbOrder = {
  id: string;
  order_number: string;
  user_id: string;
  status: string;
  grand_total: number;
  currency: string;
  is_cod: boolean;
  created_at: string;
  shipping_address: unknown;
};

type DbProfile = {
  id: string;
  full_name: string | null;
  email: string;
};

function resolveCustomer(
  profile: DbProfile | undefined,
  shippingAddress: unknown,
): { name: string; email: string } {
  const email = profile?.email ?? "—";
  if (profile?.full_name?.trim()) {
    return { name: profile.full_name.trim(), email };
  }
  if (
    shippingAddress &&
    typeof shippingAddress === "object" &&
    "fullName" in shippingAddress &&
    typeof (shippingAddress as { fullName?: string }).fullName === "string"
  ) {
    return { name: (shippingAddress as { fullName: string }).fullName, email };
  }
  return { name: email, email };
}

async function fetchOrders(locale: string): Promise<AdminOrdersData> {
  const supabase = createSupabaseAdminClient();
  const contentLocale = ["en", "sv", "es", "de"].includes(locale) ? locale : "en";

  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      "id, order_number, user_id, status, grand_total, currency, is_cod, created_at, shipping_address",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw error;

  const rows = (orders ?? []) as DbOrder[];
  const userIds = [...new Set(rows.map((o) => o.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", userIds.length > 0 ? userIds : ["00000000-0000-0000-0000-000000000000"]);

  const profileMap = new Map(((profiles ?? []) as DbProfile[]).map((p) => [p.id, p]));

  return {
    source: "supabase",
    totalCount: rows.length,
    orders: rows.map((order) => {
      const customer = resolveCustomer(profileMap.get(order.user_id), order.shipping_address);
      return {
        id: order.id,
        orderNumber: order.order_number,
        customer: customer.name,
        email: customer.email,
        date: formatOrderDate(order.created_at, contentLocale),
        status: formatOrderStatusLabel(order.status),
        statusRaw: order.status,
        total: formatSekAmount(Number(order.grand_total), contentLocale),
        currency: order.currency,
        isCod: order.is_cod,
      };
    }),
  };
}

export async function getAdminOrdersData(locale: string): Promise<AdminOrdersData> {
  if (shouldUseAdminMock()) {
    return { source: "mock", orders: MOCK_ADMIN_ORDERS, totalCount: MOCK_ADMIN_ORDERS.length };
  }
  try {
    return await fetchOrders(locale);
  } catch (error) {
    console.error("[admin] orders fetch failed:", error);
    return { source: "mock", orders: MOCK_ADMIN_ORDERS, totalCount: MOCK_ADMIN_ORDERS.length };
  }
}
