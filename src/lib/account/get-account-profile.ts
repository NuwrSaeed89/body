import "server-only";

import { cache } from "react";
import { getServerSessionUser } from "@/lib/auth/get-session";
import { shouldUseAuthMock } from "@/lib/auth/should-use-auth-mock";
import type { AccountAddress, AccountProfileData } from "@/lib/account/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type DbProfile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  locale: string;
  currency: string;
};

type DbAddress = {
  id: string;
  label: string | null;
  full_name: string;
  line1: string;
  line2: string | null;
  city: string;
  region: string | null;
  postal_code: string;
  country_code: string;
  phone: string | null;
  is_default: boolean;
};

function mapAddress(row: DbAddress): AccountAddress {
  return {
    id: row.id,
    label: row.label,
    fullName: row.full_name,
    line1: row.line1,
    line2: row.line2,
    city: row.city,
    region: row.region,
    postalCode: row.postal_code,
    countryCode: row.country_code,
    phone: row.phone,
    isDefault: row.is_default,
  };
}

export const getAccountProfile = cache(async (): Promise<AccountProfileData | null> => {
  if (shouldUseAuthMock()) return null;

  const user = await getServerSessionUser();
  if (!user) return null;

  const supabase = createSupabaseAdminClient();

  const [profileResult, addressesResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, full_name, phone, locale, currency")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("addresses")
      .select(
        "id, label, full_name, line1, line2, city, region, postal_code, country_code, phone, is_default",
      )
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);

  const profile = profileResult.data as DbProfile | null;

  return {
    id: user.id,
    email: profile?.email?.toLowerCase() ?? user.email,
    fullName: profile?.full_name?.trim() || null,
    phone: profile?.phone?.trim() || null,
    locale: profile?.locale ?? "en",
    currency: profile?.currency ?? "EUR",
    addresses: ((addressesResult.data ?? []) as DbAddress[]).map(mapAddress),
  };
});
