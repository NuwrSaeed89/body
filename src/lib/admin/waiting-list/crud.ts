import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function deleteWaitingListSubscription(id: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("stock_notifications").delete().eq("id", id);
  if (error) throw error;
}

export function mapSupabaseWaitingListError(error: unknown): string {
  const message =
    error && typeof error === "object" && "message" in error
      ? String((error as { message: unknown }).message)
      : error instanceof Error
        ? error.message
        : "Unknown error";

  if (message.toLowerCase().includes("stock_notifications")) {
    return "Waiting list table missing — run database/004_engagement.sql in Supabase.";
  }

  return message || "Waiting list operation failed";
}
