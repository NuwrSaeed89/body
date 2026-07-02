import type { AdminDashboardData } from "./types";

export const MOCK_ADMIN_DASHBOARD: AdminDashboardData = {
  source: "mock",
  managerName: "Admin User",
  managerRole: "Store Manager",
  metrics: [
    { label: "Total Sales (SEK)", value: "1,248,500", delta: "+12.4%", trend: "up" },
    { label: "Orders", value: "4,122", delta: "+8.2%", trend: "up" },
    { label: "Conversion Rate", value: "3.8%", delta: "+0.5%", trend: "up" },
    { label: "Avg Order Value", value: "302 SEK", delta: "-2.1%", trend: "down" },
  ],
  revenueTrends: [
    { month: "Jan", amountSek: 0, heightPercent: 40 },
    { month: "Feb", amountSek: 0, heightPercent: 55 },
    { month: "Mar", amountSek: 0, heightPercent: 45 },
    { month: "Apr", amountSek: 0, heightPercent: 70 },
    { month: "May", amountSek: 0, heightPercent: 85 },
    { month: "Jun", amountSek: 0, heightPercent: 95 },
    { month: "Jul", amountSek: 0, heightPercent: 75 },
  ],
  topCollections: [
    { name: "Sculpt Tight High-Rise", group: "Core Essentials", orders: "12.5k" },
    { name: "AeroFlow Crop Top", group: "Limited Edition", orders: "8.2k" },
    { name: "Element Shield Shell", group: "Outerwear", orders: "4.1k" },
  ],
  recentOrders: [
    {
      id: "#MB-9821",
      customer: "Elena Svensson",
      date: "Jun 14, 2024",
      status: "Shipped",
      total: "2,450 SEK",
    },
    {
      id: "#MB-9819",
      customer: "Marcus Andersson",
      date: "Jun 14, 2024",
      status: "Processing",
      total: "1,120 SEK",
    },
    {
      id: "#MB-9815",
      customer: "Sofia Lundin",
      date: "Jun 13, 2024",
      status: "Delivered",
      total: "4,890 SEK",
    },
  ],
};
