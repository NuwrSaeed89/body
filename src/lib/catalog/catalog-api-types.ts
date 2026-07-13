import type { ProductDetail, ShopCategory, ShopProduct } from "@/lib/shop-data";

export type CatalogSort = "newest" | "price-asc" | "price-desc" | "best-selling";

export type CatalogAvailability = "in-stock" | "out-of-stock";

export type CatalogProductFlag = "is_latest_drop" | "is_best_seller" | "is_premium";

export type ProductListQuery = {
  locale: string;
  q?: string;
  category?: string;
  collection?: string;
  size?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  availability?: CatalogAvailability;
  sort?: CatalogSort;
  flag?: CatalogProductFlag;
  limit?: number;
};

export type CatalogCategoryItem = {
  id: string;
  slug: string;
  name: string;
  sortOrder: number;
};

export type CatalogCollectionItem = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  collectionType: string;
  sortOrder: number;
  productCount?: number;
};

export type CatalogSizeOption = {
  id: string;
  code: string;
  sortOrder: number;
};

export type CatalogColorOption = {
  id: string;
  code: string;
  hex: string;
  name: string;
};

export type CatalogFilterOptions = {
  categories: CatalogCategoryItem[];
  collections: CatalogCollectionItem[];
  sizes: CatalogSizeOption[];
  colors: CatalogColorOption[];
  priceRange: {
    minSek: number;
    maxSek: number;
  };
};

export type CatalogProductsResponse = {
  items: ShopProduct[];
  total: number;
};

export type CatalogProductDetailResponse = {
  product: ProductDetail;
};
