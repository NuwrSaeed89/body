import { revalidatePath } from "next/cache";
import { requireAdminApiAccess } from "@/lib/admin/admin-api-guard";
import {
  createCategory,
  mapSupabaseCategoryCrudError,
} from "@/lib/admin/categories/crud";
import { parseCategoryWriteBody } from "@/lib/admin/categories/validate";

export async function POST(request: Request) {
  const auth = await requireAdminApiAccess();
  if (auth instanceof Response) return auth;

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
    const category = await createCategory(parsed.data);
    revalidatePath("/[locale]/admin/categories", "page");
    revalidatePath("/[locale]/admin/products", "page");
    return Response.json({ category }, { status: 201 });
  } catch (error) {
    console.error("[admin] create category failed:", error);
    return Response.json({ error: mapSupabaseCategoryCrudError(error) }, { status: 500 });
  }
}
