import { revalidatePath } from "next/cache";
import { requireAdminApiAccess } from "@/lib/admin/admin-api-guard";
import { getAdminOrderDetail } from "@/lib/admin/get-admin-order-detail";
import {
  mapSupabaseShippingOrderError,
  updateOrderShipping,
} from "@/lib/admin/orders/shipping/update-shipping";
import { parseOrderShippingWriteBody } from "@/lib/admin/orders/shipping/validate";

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

  const parsed = parseOrderShippingWriteBody(body, { labelStatus: "manual" });
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") ?? "en";

  try {
    await updateOrderShipping(id, parsed.data);
    const order = await getAdminOrderDetail(id, locale);
    if (!order) {
      return Response.json({ error: "Order updated but could not be loaded" }, { status: 500 });
    }

    revalidatePath("/[locale]/admin/orders", "page");
    revalidatePath("/[locale]/admin/orders/[id]", "page");
    revalidatePath("/[locale]/admin/orders/[id]/label", "page");
    revalidatePath("/[locale]/admin", "page");

    return Response.json({ order });
  } catch (error) {
    console.error("[admin] update order shipping failed:", error);
    const message = mapSupabaseShippingOrderError(error);
    const status = message.includes("not found")
      ? 404
      : message.includes("Cannot update")
        ? 400
        : 500;
    return Response.json({ error: message }, { status });
  }
}
