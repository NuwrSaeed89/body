export type AdminMetricTrend = "up" | "down";

export type AdminMetric = {
  label: string;
  value: string;
  delta: string;
  trend: AdminMetricTrend;
};

export type AdminRevenueBar = {
  month: string;
  amountSek: number;
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

export type AdminDashboardData = {
  source: "supabase" | "mock";
  managerName: string;
  managerRole: string;
  metrics: AdminMetric[];
  revenueTrends: AdminRevenueBar[];
  topCollections: AdminTopCollection[];
  recentOrders: AdminRecentOrder[];
};
