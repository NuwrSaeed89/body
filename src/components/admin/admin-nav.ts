export type AdminNavKey =
  | "dashboard"
  | "orders"
  | "products"
  | "categories"
  | "media"
  | "customers"
  | "settings";

export type AdminNavItem = {
  key: AdminNavKey;
  label: string;
  icon: string;
  href:
    | "/admin"
    | "/admin/orders"
    | "/admin/products"
    | "/admin/categories"
    | "/admin/media"
    | "/admin/customers"
    | "/admin/settings";
  enabled: boolean;
};

export const ADMIN_NAV: AdminNavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: "dashboard", href: "/admin", enabled: true },
  { key: "orders", label: "Orders", icon: "shopping_cart", href: "/admin/orders", enabled: true },
  { key: "products", label: "Products", icon: "inventory_2", href: "/admin/products", enabled: true },
  {
    key: "categories",
    label: "Categories",
    icon: "category",
    href: "/admin/categories",
    enabled: true,
  },
  { key: "media", label: "Media", icon: "perm_media", href: "/admin/media", enabled: true },
  { key: "customers", label: "Customers", icon: "group", href: "/admin/customers", enabled: true },
  { key: "settings", label: "Settings", icon: "settings", href: "/admin/settings", enabled: false },
];
