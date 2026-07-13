import { revalidatePath } from "next/cache";
import { requireAdminApiAccess } from "@/lib/admin/admin-api-guard";
import { createShippingRate, mapSupabaseShippingCrudError } from "@/lib/admin/shipping/crud";
import { parseShippingRateWriteBody } from "@/lib/admin/shipping/validate";

export async function POST(request: Request) {
  const auth = await requireAdminApiAccess();
  if (auth instanceof Response) return auth;

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
    const rate = await createShippingRate(parsed.data);
    revalidatePath("/[locale]/admin/shipping", "page");
    return Response.json({ rate }, { status: 201 });
  } catch (error) {
    console.error("[admin] create shipping rate failed:", error);
    return Response.json({ error: mapSupabaseShippingCrudError(error) }, { status: 500 });
  }
}
