import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseConfig, publicEnv } from "@/lib/env";
import { getStorefrontProductBySlug } from "@/lib/catalog/get-storefront-catalog";

type ViewRequestBody = {
  sessionId?: string;
};

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const product = await getStorefrontProductBySlug(slug, "en");

  if (!product) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }

  let body: ViewRequestBody = {};
  try {
    body = (await request.json()) as ViewRequestBody;
  } catch {
    body = {};
  }

  if (publicEnv.useMockData || !hasSupabaseConfig()) {
    const sessionId = body.sessionId?.trim();
    const alreadyViewed = !sessionId;
    const viewCount = alreadyViewed
      ? product.stats.viewCount
      : product.stats.viewCount + 1;

    return Response.json({
      recorded: !alreadyViewed,
      viewCount,
      likeCount: product.stats.likeCount,
      waitingCount: product.stats.waitingCount,
      unitsSold: product.stats.unitsSold,
    });
  }

  const sessionId = body.sessionId?.trim() || null;
  const supabase = createSupabaseAdminClient();

  const { data: viewCount, error } = await supabase.rpc("record_product_view", {
    p_product_id: product.id,
    p_session_id: sessionId,
    p_user_id: null,
  });

  if (error) {
    console.error("[catalog] record_product_view failed:", error);
    return Response.json({
      recorded: false,
      viewCount: product.stats.viewCount,
      likeCount: product.stats.likeCount,
      waitingCount: product.stats.waitingCount,
      unitsSold: product.stats.unitsSold,
    });
  }

  return Response.json({
    recorded: true,
    viewCount: Number(viewCount ?? product.stats.viewCount),
    likeCount: product.stats.likeCount,
    waitingCount: product.stats.waitingCount,
    unitsSold: product.stats.unitsSold,
  });
}
