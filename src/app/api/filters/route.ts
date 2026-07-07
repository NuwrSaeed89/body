import { getCatalogFilterOptions } from "@/lib/catalog/catalog-api-service";
import { resolveCatalogLocale } from "@/lib/catalog/constants";

export async function GET(request: Request) {
  const locale = resolveCatalogLocale(new URL(request.url).searchParams.get("locale") ?? "en");

  try {
    const filters = await getCatalogFilterOptions(locale);
    return Response.json(filters);
  } catch (error) {
    console.error("[api/filters] load failed:", error);
    return Response.json({ error: "Could not load filter options" }, { status: 500 });
  }
}
