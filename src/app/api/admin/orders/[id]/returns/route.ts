import { revalidatePath } from "next/cache";
import { requireAdminApiAccess } from "@/lib/admin/admin-api-guard";
import { getAdminOrderDetail } from "@/lib/admin/get-admin-order-detail";
import { initiateOrderReturn } from "@/lib/admin/orders/returns";
import { parseInitiateReturnBody } from "@/lib/admin/orders/validate-returns";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireAdminApiAccess();
  if (auth instanceof Response) return auth;

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = parseInitiateReturnBody(body);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") ?? "en";

  try {
    await initiateOrderReturn({
      orderId: id,
      orderItemId: parsed.data.orderItemId,
      quantity: parsed.data.quantity,
      reason: parsed.data.reason,
    });

    const order = await getAdminOrderDetail(id, locale);
    if (!order) {
      return Response.json({ error: "Return created but order could not be loaded" }, { status: 500 });
    }

    revalidatePath("/[locale]/admin/orders", "page");
    revalidatePath("/[locale]/admin/orders/[id]", "page");
    revalidatePath("/[locale]/admin", "page");

    return Response.json({ order }, { status: 201 });
  } catch (error) {
    console.error("[admin] initiate return failed:", error);
    const message = error instanceof Error ? error.message : "Failed to initiate return";
    const status = message.includes("not found") ? 404 : 400;
    return Response.json({ error: message }, { status });
  }
}
