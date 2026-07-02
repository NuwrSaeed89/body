import { revalidatePath } from "next/cache";
import { requireAdminApiAccess } from "@/lib/admin/admin-api-guard";
import {
  deleteProduct,
  getProductById,
  mapSupabaseCrudError,
  updateProduct,
} from "@/lib/admin/products/crud";
import { parseProductWriteBody } from "@/lib/admin/products/validate";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const auth = await requireAdminApiAccess();
  if (auth instanceof Response) return auth;

  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") ?? "en";

  try {
    const product = await getProductById(id, locale);
    if (!product) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }
    return Response.json({ product });
  } catch (error) {
    console.error("[admin] get product failed:", error);
    return Response.json({ error: mapSupabaseCrudError(error) }, { status: 500 });
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

  const parsed = parseProductWriteBody(body);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const product = await updateProduct(id, parsed.data);
    revalidatePath("/[locale]/admin/products", "page");
    return Response.json({ product });
  } catch (error) {
    console.error("[admin] update product failed:", error);
    return Response.json({ error: mapSupabaseCrudError(error) }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAdminApiAccess();
  if (auth instanceof Response) return auth;

  const { id } = await context.params;

  try {
    await deleteProduct(id);
    revalidatePath("/[locale]/admin/products", "page");
    return Response.json({ ok: true });
  } catch (error) {
    console.error("[admin] delete product failed:", error);
    return Response.json({ error: mapSupabaseCrudError(error) }, { status: 500 });
  }
}
