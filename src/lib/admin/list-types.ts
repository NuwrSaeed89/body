import type { ProductImageItem } from "@/lib/admin/products/upload-product-image";
import type { AdminDashboardData } from "./types";

export type AdminOrderRow = {
  id: string;
  orderNumber: string;
  customer: string;
  email: string;
  date: string;
  createdAt: string;
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

export type AdminOrderDetailItem = {
  id: string;
  productName: string;
  sku: string;
  sizeCode: string;
  colorCode: string;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
};

export type AdminOrderDetail = {
  id: string;
  orderNumber: string;
  customer: string;
  email: string;
  date: string;
  status: string;
  statusRaw: string;
  currency: string;
  isCod: boolean;
  subtotal: string;
  discountTotal: string;
  shippingTotal: string;
  taxTotal: string;
  grandTotal: string;
  paymentMethod: string | null;
  paymentStatus: string | null;
  shippingAddressLines: string[];
  items: AdminOrderDetailItem[];
  source: "supabase" | "mock";
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
  lowStockThreshold: number;
  variantCount: number;
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
  images: ProductImageItem[];
  modelGlbUrl: string | null;
  modelFileName: string | null;
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
