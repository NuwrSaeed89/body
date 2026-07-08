import { revalidatePath } from "next/cache";
import { requireAdminApiAccess } from "@/lib/admin/admin-api-guard";
import { updateProductInventory } from "@/lib/admin/products/inventory";
import { mapSupabaseCrudError } from "@/lib/admin/products/crud";
import { parseInventoryWriteBody } from "@/lib/admin/products/validate-inventory";

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

  const parsed = parseInventoryWriteBody(body);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") ?? "en";

  try {
    const product = await updateProductInventory(id, parsed.data, locale);
    revalidatePath("/[locale]/admin/products", "page");
    revalidatePath("/[locale]/admin", "page");
    return Response.json({ product });
  } catch (error) {
    console.error("[admin] update inventory failed:", error);
    return Response.json({ error: mapSupabaseCrudError(error) }, { status: 500 });
  }
}
