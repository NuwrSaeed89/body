import {
  devToolsAccessHint,
  isDevToolsEnvironment,
  verifyDevToolsAccess,
} from "@/lib/dev/dev-tools-access";
import {
  previewUnitsSoldForOrder,
  runUnitsSoldPayTest,
  runUnitsSoldRefundTest,
} from "@/lib/orders/verify-units-sold-webhook";

type TestUnitsSoldBody = {
  orderId?: string;
  orderNumber?: string;
  action?: "pay" | "refund";
  providerPaymentId?: string;
  reason?: string;
};

function unauthorized() {
  return Response.json(
    {
      error: "Unauthorized",
      hint: devToolsAccessHint(),
      availableOn: "local dev or NEXT_PUBLIC_APP_ENV=staging",
    },
    { status: 401 },
  );
}

function notAvailable() {
  return Response.json({ error: "Not available on production" }, { status: 404 });
}

/**
 * Phase 4 · p4-7 — verify `trg_order_units_sold` via payment webhook.
 *
 * GET  ?orderNumber=MB-...     read-only snapshot
 * POST { orderNumber, action } run pay (default) or refund test
 *
 * Staging: set NEXT_PUBLIC_APP_ENV=staging and send
 *   x-mbody-webhook-signature: <PAYMENT_WEBHOOK_SECRET>
 */
export async function GET(request: Request) {
  if (!isDevToolsEnvironment()) return notAvailable();
  if (!verifyDevToolsAccess(request)) return unauthorized();

  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId")?.trim() || undefined;
  const orderNumber = searchParams.get("orderNumber")?.trim() || undefined;

  if (!orderId && !orderNumber) {
    return Response.json({
      message: "p4-7 units_sold webhook test",
      usage: {
        preview: "GET ?orderNumber=MB-YYYYMMDD-1234",
        payTest:
          'POST { "orderNumber": "MB-...", "action": "pay" } — order must be pending_payment',
        refundTest:
          'POST { "orderNumber": "MB-...", "action": "refund" } — order must be paid',
      },
      auth: devToolsAccessHint(),
      docs: "mbody/docs/payment-provider.md#p4-7-units_sold-webhook-test",
    });
  }

  try {
    const preview = await previewUnitsSoldForOrder({ orderId, orderNumber });
    if (!preview.ok) {
      return Response.json(preview, { status: 404 });
    }
    return Response.json({
      message: "Read-only snapshot — POST with action=pay to run webhook test",
      ...preview,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Preview failed";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isDevToolsEnvironment()) return notAvailable();
  if (!verifyDevToolsAccess(request)) return unauthorized();

  let body: TestUnitsSoldBody;
  try {
    body = (await request.json()) as TestUnitsSoldBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const orderId = body.orderId?.trim() || undefined;
  const orderNumber = body.orderNumber?.trim() || undefined;
  if (!orderId && !orderNumber) {
    return Response.json(
      { error: "Provide orderId or orderNumber" },
      { status: 400 },
    );
  }

  const action = body.action === "refund" ? "refund" : "pay";

  try {
    const result =
      action === "refund"
        ? await runUnitsSoldRefundTest({
            orderId,
            orderNumber,
            providerPaymentId: body.providerPaymentId,
            reason: body.reason,
          })
        : await runUnitsSoldPayTest({
            orderId,
            orderNumber,
            providerPaymentId: body.providerPaymentId,
          });

    return Response.json(result, { status: result.ok ? 200 : 422 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Test failed";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
