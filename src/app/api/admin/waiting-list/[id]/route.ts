import { revalidatePath } from "next/cache";
import { requireAdminApiAccess } from "@/lib/admin/admin-api-guard";
import {
  deleteWaitingListSubscription,
  mapSupabaseWaitingListError,
} from "@/lib/admin/waiting-list/crud";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAdminApiAccess();
  if (auth instanceof Response) return auth;

  const { id } = await context.params;

  try {
    await deleteWaitingListSubscription(id);
    revalidatePath("/[locale]/admin/waiting-list", "page");
    revalidatePath("/[locale]/admin/products", "page");
    return Response.json({ ok: true });
  } catch (error) {
    console.error("[admin] delete waiting list subscription failed:", error);
    return Response.json({ error: mapSupabaseWaitingListError(error) }, { status: 500 });
  }
}
