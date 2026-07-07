import { getCatalogProductBySlug } from "@/lib/catalog/catalog-api-service";
import { resolveCatalogLocale } from "@/lib/catalog/constants";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const locale = resolveCatalogLocale(new URL(request.url).searchParams.get("locale") ?? "en");

  try {
    const product = await getCatalogProductBySlug(slug, locale);
    if (!product) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    return Response.json({ product });
  } catch (error) {
    console.error(`[api/products/${slug}] detail failed:`, error);
    return Response.json({ error: "Could not load product" }, { status: 500 });
  }
}
