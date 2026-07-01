import { hasSupabaseConfig, publicEnv } from "@/lib/env";
import { getProductBySlug } from "@/lib/shop-data";

type ViewRequestBody = {
  sessionId?: string;
};

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const product = getProductBySlug(slug);

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

  // Supabase: call record_product_view RPC when client is wired
  // const supabase = createServerClient();
  // const { data } = await supabase.rpc('record_product_view', {
  //   p_product_id: product.id,
  //   p_session_id: body.sessionId,
  // });
  return Response.json(
    { error: "Supabase product view tracking not wired yet" },
    { status: 501 },
  );
}
