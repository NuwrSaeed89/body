import { listCatalogCategories } from "@/lib/catalog/catalog-api-service";
import { resolveCatalogLocale } from "@/lib/catalog/constants";

export async function GET(request: Request) {
  const locale = resolveCatalogLocale(new URL(request.url).searchParams.get("locale") ?? "en");

  try {
    const categories = await listCatalogCategories(locale);
    return Response.json({ categories });
  } catch (error) {
    console.error("[api/categories] list failed:", error);
    return Response.json({ error: "Could not load categories" }, { status: 500 });
  }
}
