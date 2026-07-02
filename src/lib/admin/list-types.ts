import type { AdminDashboardData } from "./types";

export type AdminOrderRow = {
  id: string;
  orderNumber: string;
  customer: string;
  email: string;
  date: string;
  status: string;
  statusRaw: string;
  total: string;
  currency: string;
  isCod: boolean;
};

export type AdminOrdersData = {
  source: "supabase" | "mock";
  orders: AdminOrderRow[];
  totalCount: number;
};

export type AdminProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  status: string;
  statusRaw: string;
  price: string;
  basePrice: number;
  stock: number;
  unitsSold: number;
  views: number;
  flags: string[];
  isLatestDrop: boolean;
  isPremium: boolean;
  isBestSeller: boolean;
  isTemporarilyUnavailable: boolean;
  categoryId: string | null;
  categorySlug: string | null;
  categoryName: string | null;
  imageUrl: string | null;
};

export type AdminProductsData = {
  source: "supabase" | "mock";
  products: AdminProductRow[];
  totalCount: number;
};

export type AdminCustomerRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  locale: string;
  currency: string;
  joined: string;
};

export type AdminCustomersData = {
  source: "supabase" | "mock";
  customers: AdminCustomerRow[];
  totalCount: number;
};

export type AdminListData =
  | AdminOrdersData
  | AdminProductsData
  | AdminCustomersData
  | AdminDashboardData;
