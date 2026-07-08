import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ADMIN_STATUS_UPDATABLE_FROM } from "./constants";
import type { AdminFulfillmentStatus } from "./constants";

export async function updateOrderStatus(
  orderId: string,
  status: AdminFulfillmentStatus,
): Promise<{ id: string; status: string }> {
  const supabase = createSupabaseAdminClient();

  const { data: existing, error: loadError } = await supabase
    .from("orders")
    .select("id, status")
    .eq("id", orderId)
    .maybeSingle();

  if (loadError) throw loadError;
  if (!existing) throw new Error("Order not found");

  if (!ADMIN_STATUS_UPDATABLE_FROM.has(existing.status)) {
    throw new Error(
      `Cannot update fulfillment status while order is "${existing.status}"`,
    );
  }

  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .select("id, status")
    .single();

  if (error) throw error;
  return data;
}
