import { revalidatePath } from "next/cache";
import { requireAdminApiAccess } from "@/lib/admin/admin-api-guard";
import { createDiscount, mapSupabaseDiscountCrudError } from "@/lib/admin/discounts/crud";
import { parseDiscountWriteBody } from "@/lib/admin/discounts/validate";

export async function POST(request: Request) {
  const auth = await requireAdminApiAccess();
  if (auth instanceof Response) return auth;

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
    const discount = await createDiscount(parsed.data);
    revalidatePath("/[locale]/admin/discounts", "page");
    return Response.json({ discount }, { status: 201 });
  } catch (error) {
    console.error("[admin] create discount failed:", error);
    return Response.json({ error: mapSupabaseDiscountCrudError(error) }, { status: 500 });
  }
}
