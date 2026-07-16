import { revalidatePath } from "next/cache";
import { requireAdminApiAccess } from "@/lib/admin/admin-api-guard";
import { getEspConfigStatus } from "@/lib/newsletter/esp/config";
import { syncPendingSubscribersToEsp } from "@/lib/newsletter/esp/sync-subscriber";

export async function POST() {
  const auth = await requireAdminApiAccess();
  if (auth instanceof Response) return auth;

  const esp = getEspConfigStatus();
  if (esp.provider === "none") {
    return Response.json(
      { error: "Set NEWSLETTER_ESP=klaviyo or mailchimp to enable ESP sync." },
      { status: 400 },
    );
  }
  if (!esp.configured) {
    return Response.json(
      { error: `Missing ESP credentials: ${esp.missing.join(", ")}` },
      { status: 400 },
    );
  }

  try {
    const summary = await syncPendingSubscribersToEsp();
    revalidatePath("/[locale]/admin/newsletter", "page");
    return Response.json(summary);
  } catch (error) {
    console.error("[admin] newsletter ESP sync failed:", error);
    return Response.json({ error: "ESP sync failed" }, { status: 500 });
  }
}
