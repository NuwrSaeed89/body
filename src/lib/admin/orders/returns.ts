import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type ReturnStatus = "pending" | "approved" | "rejected";

type CreateReturnInput = {
  orderId: string;
  orderItemId: string;
  quantity: number;
  reason?: string | null;
};

type ApproveReturnInput = {
  orderId: string;
  returnId: string;
  adminUserId?: string;
};

type DbOrderItem = {
  id: string;
  order_id: string;
  variant_id: string;
  quantity: number;
};

type DbReturn = {
  id: string;
  order_id: string;
  order_item_id: string;
  variant_id: string;
  quantity: number;
  reason: string | null;
  status: ReturnStatus;
};

export async function initiateOrderReturn(input: CreateReturnInput) {
  const supabase = createSupabaseAdminClient();

  const { data: orderItem, error: orderItemError } = await supabase
    .from("order_items")
    .select("id, order_id, variant_id, quantity")
    .eq("id", input.orderItemId)
    .eq("order_id", input.orderId)
    .maybeSingle();

  if (orderItemError) throw orderItemError;
  if (!orderItem) throw new Error("Order item not found");

  const item = orderItem as DbOrderItem;
  if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
    throw new Error("Return quantity must be a positive integer");
  }
  if (input.quantity > item.quantity) {
    throw new Error(`Return quantity cannot exceed ordered quantity (${item.quantity})`);
  }

  const { data: existing, error: existingError } = await supabase
    .from("order_returns")
    .select("quantity, status")
    .eq("order_item_id", item.id);
  if (existingError) throw existingError;

  const alreadyReserved = (existing ?? [])
    .filter((row) => {
      const status = (row as { status: ReturnStatus }).status;
      return status === "pending" || status === "approved";
    })
    .reduce((sum, row) => sum + Number((row as { quantity: number }).quantity ?? 0), 0);

  if (alreadyReserved + input.quantity > item.quantity) {
    throw new Error("Return quantity exceeds remaining returnable amount");
  }

  const { data, error } = await supabase
    .from("order_returns")
    .insert({
      order_id: input.orderId,
      order_item_id: item.id,
      variant_id: item.variant_id,
      quantity: input.quantity,
      reason: input.reason?.trim() || null,
      status: "pending",
    })
    .select("id, order_id, order_item_id, variant_id, quantity, reason, status")
    .single();

  if (error) throw error;
  return data as DbReturn;
}

export async function approveOrderReturn(input: ApproveReturnInput) {
  const supabase = createSupabaseAdminClient();

  const { data: existing, error: existingError } = await supabase
    .from("order_returns")
    .select("id, order_id, order_item_id, variant_id, quantity, reason, status")
    .eq("id", input.returnId)
    .eq("order_id", input.orderId)
    .maybeSingle();
  if (existingError) throw existingError;
  if (!existing) throw new Error("Return request not found");

  const row = existing as DbReturn;
  if (row.status !== "pending") {
    throw new Error(`Return is already ${row.status}`);
  }

  const { data: variant, error: variantError } = await supabase
    .from("product_variants")
    .select("id, stock_quantity")
    .eq("id", row.variant_id)
    .maybeSingle();
  if (variantError) throw variantError;
  if (!variant) throw new Error("Variant not found for return item");

  const nextStock = Number((variant as { stock_quantity: number }).stock_quantity ?? 0) + row.quantity;
  const { error: stockError } = await supabase
    .from("product_variants")
    .update({ stock_quantity: nextStock })
    .eq("id", row.variant_id);
  if (stockError) throw stockError;

  const now = new Date().toISOString();
  const { data: approved, error: approveError } = await supabase
    .from("order_returns")
    .update({
      status: "approved",
      approved_at: now,
      restocked_at: now,
      approved_by: input.adminUserId ?? null,
    })
    .eq("id", row.id)
    .eq("status", "pending")
    .select("id, order_id, order_item_id, variant_id, quantity, reason, status")
    .maybeSingle();
  if (approveError) throw approveError;
  if (!approved) throw new Error("Return was updated by another admin; try again");
  
  return approved as DbReturn;
}
