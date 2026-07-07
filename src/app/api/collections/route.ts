import {
  getCatalogCollectionWithProducts,
  listCatalogCollections,
} from "@/lib/catalog/catalog-api-service";
import { resolveCatalogLocale } from "@/lib/catalog/constants";
import { parseProductListQuery } from "@/lib/catalog/parse-catalog-query";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = resolveCatalogLocale(searchParams.get("locale") ?? "en");
  const slug = searchParams.get("slug")?.trim();
  const includeProductCounts = searchParams.get("includeCounts") === "true";

  try {
    if (slug) {
      const query = parseProductListQuery(searchParams);
      const result = await getCatalogCollectionWithProducts(slug, locale, query);
      if (!result.collection) {
        return Response.json({ error: "Collection not found" }, { status: 404 });
      }
      return Response.json(result);
    }

    const collections = await listCatalogCollections(locale, {
      includeProductCounts,
    });
    return Response.json({ collections });
  } catch (error) {
    console.error("[api/collections] list failed:", error);
    return Response.json({ error: "Could not load collections" }, { status: 500 });
  }
}
