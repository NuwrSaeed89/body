import { formatOrderDate } from "./format";
import type { AdminCustomersData } from "./list-types";
import { MOCK_ADMIN_CUSTOMERS } from "./mock-list-data";
import { shouldUseAdminMock } from "./should-use-mock";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type DbProfile = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  locale: string;
  currency: string;
  created_at: string;
};

async function fetchCustomers(locale: string): Promise<AdminCustomersData> {
  const supabase = createSupabaseAdminClient();
  const contentLocale = ["en", "sv", "es", "de"].includes(locale) ? locale : "en";

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, locale, currency, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) throw error;

  const customers = ((data ?? []) as DbProfile[]).map((profile) => ({
    id: profile.id,
    name: profile.full_name?.trim() || profile.email,
    email: profile.email,
    role: profile.role,
    locale: profile.locale,
    currency: profile.currency,
    joined: formatOrderDate(profile.created_at, contentLocale),
  }));

  return {
    source: "supabase",
    customers,
    totalCount: customers.length,
  };
}

export async function getAdminCustomersData(locale: string): Promise<AdminCustomersData> {
  if (shouldUseAdminMock()) {
    return {
      source: "mock",
      customers: MOCK_ADMIN_CUSTOMERS,
      totalCount: MOCK_ADMIN_CUSTOMERS.length,
    };
  }
  try {
    return await fetchCustomers(locale);
  } catch (error) {
    console.error("[admin] customers fetch failed:", error);
    return {
      source: "mock",
      customers: MOCK_ADMIN_CUSTOMERS,
      totalCount: MOCK_ADMIN_CUSTOMERS.length,
    };
  }
}
