import type {
  CatalogAvailability,
  CatalogProductFlag,
  CatalogSort,
  ProductListQuery,
} from "./catalog-api-types";

const SORT_VALUES: CatalogSort[] = ["newest", "price-asc", "price-desc", "best-selling"];
const FLAG_VALUES: CatalogProductFlag[] = ["is_latest_drop", "is_best_seller", "is_premium"];
const AVAILABILITY_VALUES: CatalogAvailability[] = ["in-stock", "out-of-stock"];

function readNumber(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function readEnum<T extends string>(value: string | null, allowed: T[]): T | undefined {
  if (!value) return undefined;
  return allowed.includes(value as T) ? (value as T) : undefined;
}

/** Maps shop UI sort keys to API sort values. */
export function mapShopSortToApi(sort: string): CatalogSort | undefined {
  switch (sort) {
    case "newest":
      return "newest";
    case "priceAsc":
      return "price-asc";
    case "priceDesc":
      return "price-desc";
    case "bestSelling":
      return "best-selling";
    default:
      return readEnum(sort, SORT_VALUES);
  }
}

export function parseProductListQuery(searchParams: URLSearchParams): ProductListQuery {
  const categoryParam = searchParams.get("category")?.trim();
  const category =
    categoryParam && categoryParam !== "all" ? categoryParam : undefined;
  const sort =
    readEnum(searchParams.get("sort"), SORT_VALUES) ??
    mapShopSortToApi(searchParams.get("sort") ?? "");

  return {
    locale: searchParams.get("locale") ?? "en",
    q: searchParams.get("q")?.trim() || searchParams.get("query")?.trim() || undefined,
    category,
    collection: searchParams.get("collection")?.trim() || undefined,
    size: searchParams.get("size")?.trim().toUpperCase() || undefined,
    color: searchParams.get("color")?.trim() || undefined,
    minPrice: readNumber(searchParams.get("minPrice")),
    maxPrice: readNumber(searchParams.get("maxPrice")),
    availability: readEnum(searchParams.get("availability"), AVAILABILITY_VALUES),
    sort: sort ?? "newest",
    flag: readEnum(searchParams.get("flag"), FLAG_VALUES),
    limit: readNumber(searchParams.get("limit")),
  };
}
