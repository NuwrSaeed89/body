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
