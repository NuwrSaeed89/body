import { revalidatePath } from "next/cache";
import { requireAdminApiAccess } from "@/lib/admin/admin-api-guard";
import {
  createProduct,
  mapSupabaseCrudError,
} from "@/lib/admin/products/crud";
import { parseProductWriteBody } from "@/lib/admin/products/validate";

export async function POST(request: Request) {
  const auth = await requireAdminApiAccess();
  if (auth instanceof Response) return auth;

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
    const product = await createProduct(parsed.data);
    revalidatePath("/[locale]/admin/products", "page");
    return Response.json({ product }, { status: 201 });
  } catch (error) {
    console.error("[admin] create product failed:", error);
    return Response.json({ error: mapSupabaseCrudError(error) }, { status: 500 });
  }
}
