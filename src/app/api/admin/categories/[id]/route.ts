import { revalidatePath } from "next/cache";
import { requireAdminApiAccess } from "@/lib/admin/admin-api-guard";
import {
  deleteCategory,
  getCategoryById,
  mapSupabaseCategoryCrudError,
  updateCategory,
} from "@/lib/admin/categories/crud";
import { parseCategoryWriteBody } from "@/lib/admin/categories/validate";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireAdminApiAccess();
  if (auth instanceof Response) return auth;

  const { id } = await context.params;

  try {
    const category = await getCategoryById(id);
    if (!category) {
      return Response.json({ error: "Category not found" }, { status: 404 });
    }
    return Response.json({ category });
  } catch (error) {
    console.error("[admin] get category failed:", error);
    return Response.json({ error: mapSupabaseCategoryCrudError(error) }, { status: 500 });
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

  const parsed = parseCategoryWriteBody(body);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const category = await updateCategory(id, parsed.data);
    revalidatePath("/[locale]/admin/categories", "page");
    revalidatePath("/[locale]/admin/products", "page");
    return Response.json({ category });
  } catch (error) {
    console.error("[admin] update category failed:", error);
    return Response.json({ error: mapSupabaseCategoryCrudError(error) }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAdminApiAccess();
  if (auth instanceof Response) return auth;

  const { id } = await context.params;

  try {
    await deleteCategory(id);
    revalidatePath("/[locale]/admin/categories", "page");
    revalidatePath("/[locale]/admin/products", "page");
    return Response.json({ ok: true });
  } catch (error) {
    console.error("[admin] delete category failed:", error);
    return Response.json({ error: mapSupabaseCategoryCrudError(error) }, { status: 500 });
  }
}
