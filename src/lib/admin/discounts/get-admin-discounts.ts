import { shouldUseAdminMock } from "@/lib/admin/should-use-mock";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { mapDiscountRow } from "./format";
import type { AdminDiscountRow, AdminDiscountsData } from "./types";

const MOCK_ADMIN_DISCOUNTS: AdminDiscountRow[] = [
  {
    id: "d1",
    code: "WELCOME10",
    description: "New customer welcome offer",
    type: "percent",
    typeLabel: "Percentage",
    valueLabel: "10%",
    percentOff: 10,
    amountOff: null,
    currency: null,
    maxUses: 500,
    usedCount: 42,
    usageLabel: "42 / 500",
    startsAt: "2026-01-01",
    expiresAt: "2026-12-31",
    startsAtLabel: "01 Jan 2026",
    expiresAtLabel: "31 Dec 2026",
    isActive: true,
    statusLabel: "Active",
    createdAt: "2026-01-01T10:00:00.000Z",
  },
  {
    id: "d2",
    code: "SUMMER50",
    description: "Fixed summer discount",
    type: "fixed",
    typeLabel: "Fixed",
    valueLabel: "$50.00",
    percentOff: null,
    amountOff: 50,
    currency: "USD",
    maxUses: 100,
    usedCount: 18,
    usageLabel: "18 / 100",
    startsAt: "2026-06-01",
    expiresAt: "2026-08-31",
    startsAtLabel: "01 Jun 2026",
    expiresAtLabel: "31 Aug 2026",
    isActive: true,
    statusLabel: "Active",
    createdAt: "2026-05-20T10:00:00.000Z",
  },
  {
    id: "d3",
    code: "VIP25",
    description: "Inactive VIP code",
    type: "percent",
    typeLabel: "Percentage",
    valueLabel: "25%",
    percentOff: 25,
    amountOff: null,
    currency: null,
    maxUses: null,
    usedCount: 7,
    usageLabel: "7 / ∞",
    startsAt: null,
    expiresAt: "2025-12-31",
    startsAtLabel: "—",
    expiresAtLabel: "31 Dec 2025",
    isActive: false,
    statusLabel: "Inactive",
    createdAt: "2025-01-10T10:00:00.000Z",
  },
];

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

async function fetchDiscounts(locale: string): Promise<AdminDiscountsData> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("discount_codes")
    .select(
      "id, code, description, percent_off, amount_off, currency, max_uses, used_count, starts_at, expires_at, is_active, created_at",
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  const discounts = ((data ?? []) as DbDiscount[]).map((row) => mapDiscountRow(row, locale));
  return {
    source: "supabase",
    discounts,
    totalCount: discounts.length,
  };
}

export async function getAdminDiscountsData(locale: string): Promise<AdminDiscountsData> {
  if (shouldUseAdminMock()) {
    return {
      source: "mock",
      discounts: MOCK_ADMIN_DISCOUNTS,
      totalCount: MOCK_ADMIN_DISCOUNTS.length,
    };
  }

  try {
    return await fetchDiscounts(locale);
  } catch (error) {
    console.error("[admin] discounts fetch failed:", error);
    return {
      source: "mock",
      discounts: MOCK_ADMIN_DISCOUNTS,
      totalCount: MOCK_ADMIN_DISCOUNTS.length,
    };
  }
}
