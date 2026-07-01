import type { Locale } from "@/i18n/routing";

export type OrderConfirmationLocale = Locale;

export type OrderPaymentMethod =
  | "card"
  | "klarna"
  | "apple_pay"
  | "google_pay"
  | "cod";

export type OrderConfirmationLineItem = {
  name: string;
  size: string;
  color?: string;
  quantity: number;
  lineTotalFormatted: string;
};

export type OrderConfirmationShippingAddress = {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  country: string;
};

export type OrderConfirmationEmailData = {
  locale: OrderConfirmationLocale;
  orderNumber: string;
  orderDate: string;
  customerEmail: string;
  customerName: string;
  paymentMethod: OrderPaymentMethod;
  shippingMethod: string;
  shippingAddress: OrderConfirmationShippingAddress;
  items: OrderConfirmationLineItem[];
  subtotalFormatted: string;
  shippingFormatted: string;
  vatFormatted: string;
  totalFormatted: string;
  accountOrderUrl: string;
};

export type RenderedOrderConfirmationEmail = {
  subject: string;
  html: string;
  text: string;
};

export type SendOrderConfirmationResult = {
  ok: boolean;
  mode: "resend" | "log";
  messageId?: string;
  error?: string;
};
