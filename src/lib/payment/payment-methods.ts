import type { PaymentConfigStatus } from "@/lib/payment/provider-env";

/** Matches `public.payment_method` in Supabase (`database/001_extensions_enums.sql`). */
export const ORDER_PAYMENT_METHODS = [
  "card",
  "apple_pay",
  "google_pay",
  "klarna",
  "cod",
] as const;

export type OrderPaymentMethod = (typeof ORDER_PAYMENT_METHODS)[number];

export type CheckoutPaymentMethodOption = {
  id: OrderPaymentMethod;
  icon: string;
  labelKey: `methods.${OrderPaymentMethod}.label`;
  descriptionKey: `methods.${OrderPaymentMethod}.description`;
};

export const CHECKOUT_PAYMENT_METHOD_OPTIONS: CheckoutPaymentMethodOption[] = [
  {
    id: "card",
    icon: "credit_card",
    labelKey: "methods.card.label",
    descriptionKey: "methods.card.description",
  },
  {
    id: "apple_pay",
    icon: "phone_iphone",
    labelKey: "methods.apple_pay.label",
    descriptionKey: "methods.apple_pay.description",
  },
  {
    id: "google_pay",
    icon: "account_balance_wallet",
    labelKey: "methods.google_pay.label",
    descriptionKey: "methods.google_pay.description",
  },
  {
    id: "klarna",
    icon: "payments",
    labelKey: "methods.klarna.label",
    descriptionKey: "methods.klarna.description",
  },
  {
    id: "cod",
    icon: "local_shipping",
    labelKey: "methods.cod.label",
    descriptionKey: "methods.cod.description",
  },
];

const PAYMENT_METHOD_LABELS: Record<OrderPaymentMethod, string> = {
  card: "Card",
  apple_pay: "Apple Pay",
  google_pay: "Google Pay",
  klarna: "Klarna",
  cod: "Cash on Delivery",
};

export function isOrderPaymentMethod(value: string): value is OrderPaymentMethod {
  return (ORDER_PAYMENT_METHODS as readonly string[]).includes(value);
}

export function isOnlinePaymentMethod(method: OrderPaymentMethod): boolean {
  return method !== "cod";
}

export function normalizeOrderPaymentMethod(
  method: string | undefined,
  isCod = false,
): OrderPaymentMethod {
  if (isCod) return "cod";
  if (method && isOrderPaymentMethod(method)) return method;
  return "card";
}

export function formatPaymentMethodLabel(method: string, isCod = false): string {
  if (isCod) return PAYMENT_METHOD_LABELS.cod;
  if (isOrderPaymentMethod(method)) return PAYMENT_METHOD_LABELS[method];
  return method
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export type CheckoutPaymentAvailability = Record<OrderPaymentMethod, boolean>;

/** Server-side availability; card + COD are always enabled until gateways go live. */
export function getCheckoutPaymentAvailability(
  config?: PaymentConfigStatus,
): CheckoutPaymentAvailability {
  return {
    card: true,
    cod: true,
    apple_pay: config?.stripe.configured ?? false,
    google_pay: config?.stripe.configured ?? false,
    klarna: config?.klarna.configured ?? false,
  };
}

export function getDefaultSelectedPaymentMethod(
  availability: CheckoutPaymentAvailability,
): OrderPaymentMethod {
  const firstEnabled = CHECKOUT_PAYMENT_METHOD_OPTIONS.find((option) => availability[option.id]);
  return firstEnabled?.id ?? "card";
}
