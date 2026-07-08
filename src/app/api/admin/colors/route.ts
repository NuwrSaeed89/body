import { revalidatePath } from "next/cache";
import { requireAdminApiAccess } from "@/lib/admin/admin-api-guard";
import { createColor, mapSupabaseColorCrudError } from "@/lib/admin/colors/crud";
import { parseColorWriteBody } from "@/lib/admin/colors/validate";

export async function POST(request: Request) {
  const auth = await requireAdminApiAccess();
  if (auth instanceof Response) return auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = parseColorWriteBody(body);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const color = await createColor(parsed.data);
    revalidatePath("/[locale]/admin/products", "page");
    revalidatePath("/[locale]/shop", "page");
    return Response.json({ color }, { status: 201 });
  } catch (error) {
    console.error("[admin] create color failed:", error);
    return Response.json({ error: mapSupabaseColorCrudError(error) }, { status: 500 });
  }
}
