import { revalidatePath } from "next/cache";
import { requireAdminApiAccess, requireAdminApiReadAccess } from "@/lib/admin/admin-api-guard";
import { getAdminOrderDetail } from "@/lib/admin/get-admin-order-detail";
import { updateOrderStatus } from "@/lib/admin/orders/update-status";
import { parseOrderStatusBody } from "@/lib/admin/orders/validate-status";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const auth = await requireAdminApiReadAccess();
  if (auth instanceof Response) return auth;

  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") ?? "en";

  const order = await getAdminOrderDetail(id, locale);
  if (!order) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  return Response.json({ order });
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

  const parsed = parseOrderStatusBody(body);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") ?? "en";

  try {
    await updateOrderStatus(id, parsed.data.status);
    const order = await getAdminOrderDetail(id, locale);
    if (!order) {
      return Response.json({ error: "Order updated but could not be loaded" }, { status: 500 });
    }

    revalidatePath("/[locale]/admin/orders", "page");
    revalidatePath("/[locale]/admin/orders/[id]", "page");
    revalidatePath("/[locale]/admin", "page");

    return Response.json({ order });
  } catch (error) {
    console.error("[admin] update order status failed:", error);
    const message = error instanceof Error ? error.message : "Failed to update order status";
    const status = message.includes("not found") ? 404 : 400;
    return Response.json({ error: message }, { status });
  }
}
