import { revalidatePath } from "next/cache";
import { requireAdminApiAccess } from "@/lib/admin/admin-api-guard";
import {
  deleteShippingRate,
  mapSupabaseShippingCrudError,
  updateShippingRate,
} from "@/lib/admin/shipping/crud";
import { parseShippingRateWriteBody } from "@/lib/admin/shipping/validate";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAdminApiAccess();
  if (auth instanceof Response) return auth;

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = parseShippingRateWriteBody(body);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const rate = await updateShippingRate(id, parsed.data);
    revalidatePath("/[locale]/admin/shipping", "page");
    return Response.json({ rate });
  } catch (error) {
    console.error("[admin] update shipping rate failed:", error);
    return Response.json({ error: mapSupabaseShippingCrudError(error) }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAdminApiAccess();
  if (auth instanceof Response) return auth;

  const { id } = await context.params;

  try {
    await deleteShippingRate(id);
    revalidatePath("/[locale]/admin/shipping", "page");
    return Response.json({ ok: true });
  } catch (error) {
    console.error("[admin] delete shipping rate failed:", error);
    return Response.json({ error: mapSupabaseShippingCrudError(error) }, { status: 500 });
  }
}
