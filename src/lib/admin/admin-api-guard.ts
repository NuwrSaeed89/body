import { getServerAdminUser } from "@/lib/auth/get-session";
import { hasSupabaseConfig } from "@/lib/env";
import { shouldUseAdminMock } from "@/lib/admin/should-use-mock";

export function adminWritesDisabledResponse(): Response | null {
  if (shouldUseAdminMock()) {
    return Response.json(
      {
        error:
          "Product CRUD requires live Supabase. Set NEXT_PUBLIC_USE_MOCK_DATA=false and SUPABASE_SERVICE_ROLE_KEY.",
      },
      { status: 503 },
    );
  }
  return null;
}

type AdminApiUser = {
  id: string;
  email: string;
};

/** Verifies an authenticated admin session before service-role writes. */
export async function requireAdminApiAccess(): Promise<
  { user: AdminApiUser } | Response
> {
  const blocked = adminWritesDisabledResponse();
  if (blocked) return blocked;

  if (!hasSupabaseConfig()) {
    return { user: { id: "dev-admin", email: "dev@localhost" } };
  }

  const admin = await getServerAdminUser();
  if (!admin) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return { user: { id: admin.id, email: admin.email } };
}
