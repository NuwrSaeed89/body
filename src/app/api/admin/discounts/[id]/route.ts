import { revalidatePath } from "next/cache";
import { requireAdminApiAccess } from "@/lib/admin/admin-api-guard";
import {
  deleteDiscount,
  getDiscountById,
  mapSupabaseDiscountCrudError,
  updateDiscount,
} from "@/lib/admin/discounts/crud";
import { parseDiscountWriteBody } from "@/lib/admin/discounts/validate";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireAdminApiAccess();
  if (auth instanceof Response) return auth;

  const { id } = await context.params;

  try {
    const discount = await getDiscountById(id);
    if (!discount) {
      return Response.json({ error: "Discount code not found" }, { status: 404 });
    }
    return Response.json({ discount });
  } catch (error) {
    console.error("[admin] get discount failed:", error);
    return Response.json({ error: mapSupabaseDiscountCrudError(error) }, { status: 500 });
  }
}

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

  const parsed = parseDiscountWriteBody(body);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const discount = await updateDiscount(id, parsed.data);
    revalidatePath("/[locale]/admin/discounts", "page");
    return Response.json({ discount });
  } catch (error) {
    console.error("[admin] update discount failed:", error);
    return Response.json({ error: mapSupabaseDiscountCrudError(error) }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAdminApiAccess();
  if (auth instanceof Response) return auth;

  const { id } = await context.params;

  try {
    await deleteDiscount(id);
    revalidatePath("/[locale]/admin/discounts", "page");
    return Response.json({ ok: true });
  } catch (error) {
    console.error("[admin] delete discount failed:", error);
    return Response.json({ error: mapSupabaseDiscountCrudError(error) }, { status: 500 });
  }
}
