import type { AdminDashboardData } from "./types";
import { MOCK_ADMIN_PRODUCTS } from "./mock-list-data";
import { buildLowStockAlerts } from "./inventory/alerts";

export const MOCK_ADMIN_DASHBOARD: AdminDashboardData = {
  source: "mock",
  managerName: "Admin User",
  managerRole: "Store Manager",
  metrics: [
    { label: "Total Sales (USD)", value: "$120,048.08", delta: "+12.4%", trend: "up" },
    { label: "Orders", value: "4,122", delta: "+8.2%", trend: "up" },
    { label: "Conversion Rate", value: "3.8%", delta: "+0.5%", trend: "up" },
    { label: "Avg Order Value", value: "$29.13", delta: "-2.1%", trend: "down" },
  ],
  revenueTrends: [
    { month: "Jan", amount: 8200, amountLabel: "$8,200.00", heightPercent: 40 },
    { month: "Feb", amount: 11250, amountLabel: "$11,250.00", heightPercent: 55 },
    { month: "Mar", amount: 9200, amountLabel: "$9,200.00", heightPercent: 45 },
    { month: "Apr", amount: 14300, amountLabel: "$14,300.00", heightPercent: 70 },
    { month: "May", amount: 17400, amountLabel: "$17,400.00", heightPercent: 85 },
    { month: "Jun", amount: 19450, amountLabel: "$19,450.00", heightPercent: 95 },
    { month: "Jul", amount: 15300, amountLabel: "$15,300.00", heightPercent: 75 },
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
      total: "$235.58",
    },
    {
      id: "#MB-9819",
      customer: "Marcus Andersson",
      date: "Jun 14, 2024",
      status: "Processing",
      total: "$107.69",
    },
    {
      id: "#MB-9815",
      customer: "Sofia Lundin",
      date: "Jun 13, 2024",
      status: "Delivered",
      total: "$469.23",
    },
  ],
  lowStockAlerts: buildLowStockAlerts(MOCK_ADMIN_PRODUCTS),
};
