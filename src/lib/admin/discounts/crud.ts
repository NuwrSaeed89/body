import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { mapDiscountDetail } from "./format";
import type { DiscountDetail, DiscountWriteInput } from "./types";

type DbDiscount = {
  id: string;
  code: string;
  description: string | null;
  percent_off: number | null;
  amount_off: number | null;
  currency: string | null;
  max_uses: number | null;
  used_count: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
};

const DISCOUNT_SELECT = `
  id,
  code,
  description,
  percent_off,
  amount_off,
  currency,
  max_uses,
  used_count,
  starts_at,
  expires_at,
  is_active,
  created_at
`;

function toDbPayload(input: DiscountWriteInput) {
  return {
    code: input.code,
    description: input.description,
    percent_off: input.type === "percent" ? input.percentOff : null,
    amount_off: input.type === "fixed" ? input.amountOff : null,
    currency: input.type === "fixed" ? input.currency : null,
    max_uses: input.maxUses,
    starts_at: input.startsAt,
    expires_at: input.expiresAt,
    is_active: input.isActive,
  };
}

export async function getDiscountById(id: string): Promise<DiscountDetail | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("discount_codes")
    .select(DISCOUNT_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapDiscountDetail(data as DbDiscount);
}

export async function createDiscount(input: DiscountWriteInput): Promise<DiscountDetail> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("discount_codes")
    .insert(toDbPayload(input))
    .select(DISCOUNT_SELECT)
    .single();

  if (error) throw error;
  return mapDiscountDetail(data as DbDiscount);
}

export async function updateDiscount(
  id: string,
  input: DiscountWriteInput,
): Promise<DiscountDetail> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("discount_codes")
    .update(toDbPayload(input))
    .eq("id", id)
    .select(DISCOUNT_SELECT)
    .single();

  if (error) throw error;
  return mapDiscountDetail(data as DbDiscount);
}

export async function deleteDiscount(id: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("discount_codes").delete().eq("id", id);
  if (error) throw error;
}

export function mapSupabaseDiscountCrudError(error: unknown): string {
  if (!error || typeof error !== "object") return "Unknown error";
  const record = error as { code?: string; message?: string };
  if (record.code === "23505") {
    return "A discount code with this name already exists";
  }
  if (record.code === "23503") {
    return "This discount is linked to existing orders and cannot be deleted";
  }
  return record.message ?? "Database operation failed";
}
