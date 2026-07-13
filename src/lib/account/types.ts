export type AccountAddress = {
  id: string;
  label: string | null;
  fullName: string;
  line1: string;
  line2: string | null;
  city: string;
  region: string | null;
  postalCode: string;
  countryCode: string;
  phone: string | null;
  isDefault: boolean;
};

export type AccountProfileData = {
  id: string;
  fullName: string | null;
  email: string;
  phone: string | null;
  locale: string;
  currency: string;
  addresses: AccountAddress[];
};

export type AccountActiveOrder = {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  currency: string;
  createdAt: string;
  itemName: string | null;
  itemColorCode: string | null;
  itemSizeCode: string | null;
  productImage: string | null;
};

export type AccountRecommendedProduct = {
  id: string;
  slug: string;
  name: string;
  priceSek: number;
  image: string;
  badge: string;
};

export type AccountOrderListItem = {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  currency: string;
  createdAt: string;
  itemCount: number;
  firstItemName: string | null;
  firstItemImage: string | null;
};

export type AccountPaymentRecord = {
  id: string;
  method: string;
  status: string;
  amount: number;
  currency: string;
  orderNumber: string;
  createdAt: string;
};
