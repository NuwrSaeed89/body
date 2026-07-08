import { revalidatePath } from "next/cache";
import { requireAdminApiAccess } from "@/lib/admin/admin-api-guard";
import { getProductById, mapSupabaseCrudError } from "@/lib/admin/products/crud";
import {
  getProductVariantMatrix,
  syncProductVariantMatrix,
} from "@/lib/admin/products/variants";
import { parseVariantMatrixBody } from "@/lib/admin/products/validate-variants";

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

    const matrix = await getProductVariantMatrix(id, locale);
    return Response.json({ matrix });
  } catch (error) {
    console.error("[admin] get product variants failed:", error);
    return Response.json({ error: mapSupabaseCrudError(error) }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const auth = await requireAdminApiAccess();
  if (auth instanceof Response) return auth;

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = parseVariantMatrixBody(body);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const product = await getProductById(id, "en");
    if (!product) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    const matrix = await syncProductVariantMatrix(id, product.slug, parsed.data);
    revalidatePath("/[locale]/admin/products", "page");
    revalidatePath("/[locale]/admin/products/[id]/variants", "page");
    revalidatePath("/[locale]/shop", "page");
    return Response.json({ matrix });
  } catch (error) {
    console.error("[admin] sync product variants failed:", error);
    return Response.json({ error: mapSupabaseCrudError(error) }, { status: 500 });
  }
}
