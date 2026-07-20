# Payment provider setup (Phase 4)

Phase 4 is **blocked** until the client returns a completed intake form:

[`client-deliverables/Mbody-Payment-Provider-Credentials.md`](../../client-deliverables/Mbody-Payment-Provider-Credentials.md)

Discovery status: **TBD** — Swedish bank setup in progress (see `client-discovery-answers.md` §15).

**Client decision guide:** [`client-deliverables/Mbody-Payment-Choices-and-SDK.md`](../../client-deliverables/Mbody-Payment-Choices-and-SDK.md)

---

## Provider options

| Option | Typical use | Mbody env prefix |
|--------|-------------|------------------|
| **Stripe** | Cards, Apple Pay, Google Pay, optional Klarna via Stripe | `STRIPE_*` |
| **Swedish bank PSP** | Bank-provided acquirer API | `PAYMENT_GATEWAY_*` |
| **Klarna** (direct) | Pay now + Pay in 30 days (EU) | `KLARNA_*` |

Set `PAYMENT_PROVIDER=stripe` | `swedish_bank` | `tbd` in environment.

---

## Environment variables

Copy from [`mbody/.env.example`](../.env.example). **Never commit real secrets.**

### Stripe

```env
PAYMENT_PROVIDER=stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Swedish bank / generic gateway

```env
PAYMENT_PROVIDER=swedish_bank
PAYMENT_GATEWAY_API_URL=https://...
PAYMENT_GATEWAY_MERCHANT_ID=
PAYMENT_GATEWAY_API_KEY=
PAYMENT_GATEWAY_WEBHOOK_SECRET=
NEXT_PUBLIC_PAYMENT_GATEWAY_PUBLIC_KEY=
```

### Klarna (EU)

```env
KLARNA_USERNAME=
KLARNA_PASSWORD=
KLARNA_API_URL=https://api.playground.klarna.com
```

### Webhooks (Phase 4 — p4-6)

```env
PAYMENT_WEBHOOK_SECRET=   # required in production; header x-mbody-webhook-signature
```

Route: `POST /api/webhooks/payment`

Supported events:

| Event | Order status | Payment status | Side effects |
|-------|--------------|----------------|--------------|
| `payment.succeeded` | `paid` | `captured` | Confirmation email; `units_sold` trigger |
| `payment.failed` | stays `pending_payment` | `failed` | — |
| `payment.refunded` | `cancelled` | `refunded` | Reverses `units_sold` if was paid |

Example body:

```json
{
  "event": "payment.succeeded",
  "providerPaymentId": "pi_123",
  "orderId": "<uuid>",
  "orderNumber": "MB-20260719-1234",
  "paymentMethod": "card"
}
```

Dev sample: `GET /api/webhooks/payment` or `?event=payment.failed`

---

## Staging checklist (after credentials received)

1. Add **test** keys to Vercel staging environment variables.
2. Register webhook URL: `https://<staging>/api/webhooks/payment`
3. Set `NEXT_PUBLIC_APP_URL` to staging domain.
4. Run test card / Klarna playground transaction.
5. Verify order status + confirmation email (log or Resend).
6. Only then add **live** keys to production.

---

## Config status (development)

```bash
cd mbody && pnpm check:payment
```

Or `GET /api/dev/payment-config` when `NODE_ENV=development`.

**Arabic runbook (developer steps):** [`ar-email-and-payments.md`](./ar-email-and-payments.md)

---

## PCI note

- Card PAN/CVV are **never** stored in Supabase (`order_payments` holds gateway IDs only).
- Checkout uses provider JS/SDK or hosted fields — see Phase 4 implementation steps in `todo-mbody.html`.
