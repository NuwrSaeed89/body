import type { Currency } from "@/lib/currency";

export type DiscountType = "percent" | "fixed";

export type DiscountWriteInput = {
  code: string;
  description: string | null;
  type: DiscountType;
  percentOff: number | null;
  amountOff: number | null;
  currency: Currency | null;
  maxUses: number | null;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
};

export type AdminDiscountRow = {
  id: string;
  code: string;
  description: string | null;
  type: DiscountType;
  typeLabel: string;
  valueLabel: string;
  percentOff: number | null;
  amountOff: number | null;
  currency: Currency | null;
  maxUses: number | null;
  usedCount: number;
  usageLabel: string;
  startsAt: string | null;
  expiresAt: string | null;
  startsAtLabel: string;
  expiresAtLabel: string;
  isActive: boolean;
  statusLabel: string;
  createdAt: string;
};

export type DiscountDetail = {
  id: string;
  code: string;
  description: string | null;
  type: DiscountType;
  percentOff: number | null;
  amountOff: number | null;
  currency: Currency | null;
  maxUses: number | null;
  usedCount: number;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
};

export type AdminDiscountsData = {
  source: "supabase" | "mock";
  discounts: AdminDiscountRow[];
  totalCount: number;
};
