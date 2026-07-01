import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseConfigStatus } from "@/lib/supabase/config";
import { serverEnv } from "@/lib/env";

/** Development-only — verifies Supabase env + a live catalog read. */
export async function GET() {
  if (serverEnv.nodeEnv === "production") {
    return Response.json({ error: "Not available" }, { status: 404 });
  }

  const status = getSupabaseConfigStatus();

  if (!status.configured) {
    return Response.json({
      ok: false,
      ...status,
      docs: "mbody/docs/supabase-setup.md",
    });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { count, error } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true });

    if (error) {
      return Response.json({
        ok: false,
        ...status,
        dbError: error.message,
        hint: "Run database/mbody_init.sql in Supabase SQL Editor if tables are missing.",
      });
    }

    return Response.json({
      ok: true,
      ...status,
      productCount: count ?? 0,
      docs: "mbody/docs/supabase-setup.md",
    });
  } catch (error) {
    return Response.json({
      ok: false,
      ...status,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
