export type AdminMetricTrend = "up" | "down";

export type AdminMetric = {
  label: string;
  value: string;
  delta: string;
  trend: AdminMetricTrend;
};

export type AdminRevenueBar = {
  month: string;
  amount: number;
  amountLabel: string;
  heightPercent: number;
};

export type AdminTopCollection = {
  name: string;
  group: string;
  orders: string;
};

export type AdminRecentOrder = {
  id: string;
  customer: string;
  date: string;
  status: string;
  total: string;
};

export type AdminLowStockAlert = {
  id: string;
  name: string;
  slug: string;
  stock: number;
  lowStockThreshold: number;
  imageUrl: string | null;
  status: "low" | "out";
};

export type AdminDashboardData = {
  source: "supabase" | "mock";
  managerName: string;
  managerRole: string;
  metrics: AdminMetric[];
  revenueTrends: AdminRevenueBar[];
  topCollections: AdminTopCollection[];
  recentOrders: AdminRecentOrder[];
  lowStockAlerts: AdminLowStockAlert[];
};
