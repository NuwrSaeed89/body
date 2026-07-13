import { revalidatePath } from "next/cache";
import { requireAdminApiAccess } from "@/lib/admin/admin-api-guard";
import { getAdminOrderDetail } from "@/lib/admin/get-admin-order-detail";
import { approveOrderReturn } from "@/lib/admin/orders/returns";

type RouteContext = {
  params: Promise<{ id: string; returnId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireAdminApiAccess();
  if (auth instanceof Response) return auth;

  const { id, returnId } = await context.params;
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") ?? "en";

  try {
    await approveOrderReturn({
      orderId: id,
      returnId,
      adminUserId: auth.user.id,
    });

    const order = await getAdminOrderDetail(id, locale);
    if (!order) {
      return Response.json({ error: "Return approved but order could not be loaded" }, { status: 500 });
    }

    revalidatePath("/[locale]/admin/orders", "page");
    revalidatePath("/[locale]/admin/orders/[id]", "page");
    revalidatePath("/[locale]/admin/products", "page");
    revalidatePath("/[locale]/admin", "page");

    return Response.json({ order });
  } catch (error) {
    console.error("[admin] approve return failed:", error);
    const message = error instanceof Error ? error.message : "Failed to approve return";
    const status = message.includes("not found") ? 404 : 400;
    return Response.json({ error: message }, { status });
  }
}
