import { listCatalogProducts } from "@/lib/catalog/catalog-api-service";
import { parseProductListQuery } from "@/lib/catalog/parse-catalog-query";

export async function GET(request: Request) {
  try {
    const query = parseProductListQuery(new URL(request.url).searchParams);
    const result = await listCatalogProducts(query);
    return Response.json(result);
  } catch (error) {
    console.error("[api/products] list failed:", error);
    return Response.json({ error: "Could not load products" }, { status: 500 });
  }
}
