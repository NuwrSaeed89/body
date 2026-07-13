import "server-only";

import { cache } from "react";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AccountPaymentRecord } from "@/lib/account/types";

type DbPayment = {
  id: string;
  method: string;
  status: string;
  amount: number;
  currency: string;
  created_at: string;
  orders: { order_number: string } | { order_number: string }[] | null;
};

export const getAccountPayments = cache(
  async (userId: string): Promise<AccountPaymentRecord[]> => {
    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase
      .from("order_payments")
      .select("id, method, status, amount, currency, created_at, orders!inner(order_number, user_id)")
      .eq("orders.user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("[account] payments fetch failed:", error);
      return [];
    }

    return ((data ?? []) as DbPayment[]).map((payment) => {
      const order = Array.isArray(payment.orders) ? payment.orders[0] : payment.orders;

      return {
        id: payment.id,
        method: payment.method,
        status: payment.status,
        amount: Number(payment.amount ?? 0),
        currency: payment.currency,
        orderNumber: order?.order_number ?? "—",
        createdAt: payment.created_at,
      };
    });
  },
);
