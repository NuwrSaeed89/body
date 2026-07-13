import { revalidatePath } from "next/cache";
import { requireAdminApiAccess } from "@/lib/admin/admin-api-guard";
import { getAdminOrderDetail } from "@/lib/admin/get-admin-order-detail";
import {
  generateOrderShippingLabel,
  mapSupabaseShippingOrderError,
} from "@/lib/admin/orders/shipping/update-shipping";
import { parseGenerateLabelBody } from "@/lib/admin/orders/shipping/validate";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireAdminApiAccess();
  if (auth instanceof Response) return auth;

  const { id } = await context.params;

  let body: unknown = {};
  try {
    const text = await request.text();
    if (text.trim()) body = JSON.parse(text) as unknown;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = parseGenerateLabelBody(body);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") ?? "en";

  try {
    const result = await generateOrderShippingLabel(id, parsed.data);
    const order = await getAdminOrderDetail(id, locale);
    if (!order) {
      return Response.json({ error: "Label saved but order could not be loaded" }, { status: 500 });
    }

    revalidatePath("/[locale]/admin/orders", "page");
    revalidatePath("/[locale]/admin/orders/[id]", "page");
    revalidatePath("/[locale]/admin/orders/[id]/label", "page");
    revalidatePath("/[locale]/admin", "page");

    return Response.json({ order, mode: result.mode });
  } catch (error) {
    console.error("[admin] generate shipping label failed:", error);
    const message = mapSupabaseShippingOrderError(error);
    const status = message.includes("not found")
      ? 404
      : message.includes("Cannot update")
        ? 400
        : 500;
    return Response.json({ error: message }, { status });
  }
}
