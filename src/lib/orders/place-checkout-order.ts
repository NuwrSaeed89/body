import "server-only";

import {
  getCheckoutPaymentAvailability,
  isOnlinePaymentMethod,
  type OrderPaymentMethod,
} from "@/lib/payment/payment-methods";
import { getPaymentConfigStatus } from "@/lib/payment/provider-env";
import { placeCodOrder } from "@/lib/orders/place-cod-order";
import { placePendingPaymentOrder } from "@/lib/orders/place-pending-payment-order";

export type PlaceCheckoutOrderInput = {
  userId: string;
  locale: string;
  paymentMethod: OrderPaymentMethod;
  shippingAddress: {
    fullName: string;
    line1: string;
    city: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
};

export async function placeCheckoutOrder(input: PlaceCheckoutOrderInput): Promise<{
  orderId: string;
  orderNumber: string;
  status: "pending_payment" | "cod_pending";
}> {
  const availability = getCheckoutPaymentAvailability(getPaymentConfigStatus());
  if (!availability[input.paymentMethod]) {
    throw new Error("Payment method is not available");
  }

  if (input.paymentMethod === "cod") {
    const result = await placeCodOrder(input);
    return { ...result, status: "cod_pending" };
  }

  if (!isOnlinePaymentMethod(input.paymentMethod)) {
    throw new Error("Invalid payment method");
  }

  const result = await placePendingPaymentOrder({
    ...input,
    paymentMethod: input.paymentMethod,
  });

  return { ...result, status: "pending_payment" };
}
