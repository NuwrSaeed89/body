import type { CategoryLocale } from "./constants";

export type AdminCategoryOption = {
  id: string;
  slug: string;
  name: string;
  sortOrder: number;
};

export type CategoryTranslationInput = {
  locale: CategoryLocale;
  name: string;
};

export type CategoryWriteInput = {
  slug: string;
  sortOrder: number;
  isActive: boolean;
  translations: CategoryTranslationInput[];
};

export type CategoryDetail = {
  id: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  translations: CategoryTranslationInput[];
  productCount: number;
};

export type AdminCategoryRow = {
  id: string;
  slug: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
  translations: Record<CategoryLocale, string>;
};

export type AdminCategoriesData = {
  source: "supabase" | "mock";
  categories: AdminCategoryRow[];
  totalCount: number;
};
