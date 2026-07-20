# دليل التنفيذ — بريد تأكيد الطلب وبيانات مزود الدفع

دليل عملي **من جانب فريق التطوير** لإكمال مهمتين في مشروع Mbody:

| المهمة | المعرف | المرحلة |
|--------|--------|---------|
| قالب بريد تأكيد الطلب (يُفعَّل عند نجاح الدفع) | **p3-9** | المرحلة 3 |
| الحصول على بيانات مزود الدفع من العميل | **p4-0** | المرحلة 4 |

---

## نظرة عامة

```
العميل يدفع (Stripe / بنك / Klarna)
        ↓
Webhook → POST /api/webhooks/payment
        ↓
applyPaymentWebhook() حسب الحدث:
  payment.succeeded → order=paid, payment=captured + بريد تأكيد
  payment.failed    → payment=failed (الطلب يبقى pending_payment)
  payment.refunded  → order=cancelled, payment=refunded
```

**الحالة الحالية:** قالب البريد وWebhooks الثلاثة جاهزة في الكود. الإرسال الفعلي يحتاج Resend وربط مزود الدفع (بعد استلام المفاتيح).

---

# الجزء 1 — بريد تأكيد الطلب (p3-9)

## ما تم إنجازه في المستودع

| الملف | الوظيفة |
|-------|---------|
| `src/lib/emails/order-confirmation-template.ts` | HTML + نص عادي متجاوب |
| `src/lib/emails/order-confirmation-copy.ts` | نصوص EN / SV / ES / DE |
| `src/lib/emails/order-confirmation-types.ts` | أنواع بيانات الطلب |
| `src/lib/emails/send-order-confirmation.ts` | الإرسال عبر Resend أو log |
| `src/lib/orders/payment-webhook-types.ts` | أنواع أحداث الدفع الثلاثة |
| `src/lib/orders/apply-payment-webhook.ts` | تحديث الطلب/الدفع حسب الحدث |
| `src/lib/orders/on-payment-succeeded.ts` | واجهات succeeded / failed / refunded |
| `src/app/api/webhooks/payment/route.ts` | Webhook الدفع + التحقق من التوقيع |
| `src/app/api/dev/emails/order-confirmation/route.ts` | معاينة القالب محلياً |

---

## الخطوات من جانبك

### الخطوة 1 — تشغيل المشروع محلياً

```bash
cd mbody
cp .env.example .env.local
pnpm install
pnpm dev
```

تأكد أن `NEXT_PUBLIC_APP_URL=http://localhost:3000` في `.env.local`.

---

### الخطوة 2 — معاينة القالب في المتصفح

افتح الروابط التالية (بيئة التطوير فقط):

| الغرض | الرابط |
|-------|--------|
| HTML (إنجليزي) | `http://localhost:3000/api/dev/emails/order-confirmation?locale=en` |
| HTML (سويدي) | `http://localhost:3000/api/dev/emails/order-confirmation?locale=sv` |
| نص عادي | `...?locale=en&format=text` |
| JSON (بيانات العينة) | `...?locale=en&format=json` |

راجع التصميم والنصوص في اللغات الأربع قبل إرسال أي شيء للعميل.

---

### الخطوة 3 — اختبار المحفّز (بدون مزود دفع حقيقي)

```bash
# في المتصفح أو curl
curl http://localhost:3000/api/webhooks/payment
```

هذا يستدعي `onPaymentSucceeded()` ببيانات عينة ويطبع معاينة البريد في **طرفية** السيرفر (وضع `log` الافتراضي).

تحقق من الطرفية: يجب أن ترى سطراً مثل `[mbody] Order confirmation email (log mode)`.

---

### الخطوة 4 — إعداد Resend (للإرسال الحقيقي)

1. أنشئ حساباً على [Resend](https://resend.com).
2. أضِف نطاق البريد (مثلاً `mbody.com`) وفعّل DNS (SPF / DKIM).
3. أنشئ API Key.
4. أضِف في `mbody/.env.local`:

```env
EMAIL_PROVIDER=resend
EMAIL_FROM=Mbody <orders@mbody.com>
RESEND_API_KEY=re_xxxxxxxx
```

5. أعد تشغيل `pnpm dev` وكرر:

```bash
curl http://localhost:3000/api/webhooks/payment
```

يجب أن يصل بريد حقيقي إلى عنوان العينة في `sample-order-confirmation.ts` (غيّره لبريدك للاختبار).

---

### الخطوة 5 — نفس المتغيرات على Staging (Vercel)

في لوحة Vercel → المشروع → **Settings → Environment Variables**:

| المتغير | القيمة |
|---------|--------|
| `EMAIL_PROVIDER` | `resend` |
| `EMAIL_FROM` | `Mbody <orders@mbody.com>` |
| `RESEND_API_KEY` | مفتاح Resend (staging أو production حسب النطاق) |
| `NEXT_PUBLIC_APP_URL` | `https://mbody-staging.vercel.app` (أو نطاقك) |

بعد النشر، اختبر:

```bash
curl https://<staging-domain>/api/webhooks/payment
```

> **ملاحظة:** مسار `GET /api/webhooks/payment` معطّل في `production` — للاختبار على الإنتاج استخدم `POST` مع payload حقيقي بعد ربط الدفع.

---

### الخطوة 6 — مراجعة المحتوى مع العميل (اختياري قبل الإطلاق)

- راجع `order-confirmation-copy.ts` للنصوص القانونية (رقم الطلب، الشحن، الإجمالي).
- إن طلب العميل تعديلات على النص أو الشعار، عدّل القالب أو النسخ ثم أعد المعاينة.
- لا تغيّر بنية `OrderConfirmationEmailData` دون تحديث webhook الدفع لاحقاً.

---

### الخطوة 7 — التحقق من اكتمال p3-9

| # | معيار القبول | ✓ |
|---|--------------|---|
| 1 | المعاينة تعمل لـ EN / SV / ES / DE | ☐ |
| 2 | `GET /api/webhooks/payment` يطبع/يرسل البريد | ☐ |
| 3 | Resend مضبوط على staging (إن كان الإطلاق قريباً) | ☐ |
| 4 | `EMAIL_FROM` يطابق نطاقاً مُتحققاً في Resend | ☐ |

---

# الجزء 2 — بيانات مزود الدفع من العميل (p4-0)

## السياق

حسب اكتشاف المتطلبات ([`client-discovery-answers.md`](../../client-discovery-answers.md) §15): مزود الدفع **لم يُحدَّد بعد** — إعداد بنك سويدي قيد التقدم.

**هذه المهمة من جانبك = تحضير النموذج + متابعة العميل + إدخال المفاتيح عند الاستلام.** تكامل SDK (p4-1+) يبدأ بعد اكتمال p4-0.

---

## الخطوات من جانبك

### الخطوة 1 — إرسال نموذج الاستلام للعميل

أرسل للعميل الملف:

[`client-deliverables/Mbody-Payment-Provider-Credentials.md`](../../client-deliverables/Mbody-Payment-Provider-Credentials.md)

**اطلب منهم صراحةً:**

1. اختيار المزود: **Stripe** أو **بنك سويدي / PSP**.
2. إرجاع مفاتيح **اختبار (sandbox)** أولاً — وليس مفاتيح الإنتاج.
3. بيانات **Klarna** (EU: ادفع الآن + خلال 30 يوم).
4. تأكيد **COD** (الدفع عند الاستلام) إن وُجد.
5. التوقيع في قسم Sign-off.

**قناة التسليم:** مدير كلمات مرور / Bitwarden Send / 1Password — **لا ترسل المفاتيح الحية في بريد عادي.**

---

### الخطوة 2 — متابعة العميل

| ما تتابعه | متى |
|-----------|-----|
| قرار Stripe vs بنك سويدي | أول أسبوع |
| حساب تاجر / sandbox جاهز | قبل بدء p4-1 |
| Klarna playground credentials | مع مفاتيح البطاقة |
| تسجيل webhook URL على staging | بعد نشر staging |

إذا تأخر العميل، Phase 4 (p4-1+) تبقى **معلّقة** — يمكنك متابعة Phase 1–3 وSupabase.

---

### الخطوة 3 — إدخال المفاتيح في `.env.local`

انسخ القالب:

```bash
cd mbody
cp .env.example .env.local
```

#### إذا اختار العميل Stripe

```env
PAYMENT_PROVIDER=stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### إذا اختار بنكاً سويدياً (PSP عام)

```env
PAYMENT_PROVIDER=swedish_bank
PAYMENT_GATEWAY_API_URL=https://...
PAYMENT_GATEWAY_MERCHANT_ID=...
PAYMENT_GATEWAY_API_KEY=...
PAYMENT_GATEWAY_WEBHOOK_SECRET=...
NEXT_PUBLIC_PAYMENT_GATEWAY_PUBLIC_KEY=...
```

#### Klarna (مطلوب لـ EU)

```env
KLARNA_USERNAME=...
KLARNA_PASSWORD=...
KLARNA_API_URL=https://api.playground.klarna.com
```

#### أمان webhook (إنتاج)

```env
PAYMENT_WEBHOOK_SECRET=قيمة_سرية_طويلة_عشوائية
```

---

### الخطوة 4 — التحقق من اكتمال الإعداد

```bash
cd mbody
pnpm check:payment
```

**النتيجة المتوقعة بعد إدخال المفاتيح:**

```
Ready for staging: yes
```

أو في التطوير:

```bash
curl http://localhost:3000/api/dev/payment-config
```

يعرض `provider` و `missing` و `readyForStaging` بدون كشف قيم الأسرار.

---

### الخطوة 5 — إعداد Staging على Vercel

1. أضِف نفس متغيرات الدفع في **mbody-staging** (مفاتيح test فقط).
2. سجّل عند المزود عنوان webhook:

   `https://<staging-domain>/api/webhooks/payment`

3. فعّل الأحداث (Stripe كمثال): `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`.
4. تأكد من `NEXT_PUBLIC_APP_URL` على نطاق staging.

---

### الخطوة 6 — اختبار ربط البريد + الدفع معاً

بعد p4-1 (تكامل SDK)، المسار الكامل:

```
دفع تجريبي → webhook المزود → POST /api/webhooks/payment
→ applyPaymentWebhook() → (succeeded) sendOrderConfirmationEmail()
```

حتى قبل p4-1 يمكنك محاكاة الأحداث يدوياً:

```bash
# نجاح الدفع
curl -X POST http://localhost:3000/api/webhooks/payment \
  -H "Content-Type: application/json" \
  -d '{
    "event": "payment.succeeded",
    "providerPaymentId": "pi_test_123",
    "orderId": "<uuid>",
    "orderNumber": "MB-10042",
    "paymentMethod": "card"
  }'

# فشل الدفع
curl -X POST http://localhost:3000/api/webhooks/payment \
  -H "Content-Type: application/json" \
  -d '{
    "event": "payment.failed",
    "providerPaymentId": "pi_test_123",
    "orderNumber": "MB-10042",
    "reason": "card_declined"
  }'

# استرجاع
curl -X POST http://localhost:3000/api/webhooks/payment \
  -H "Content-Type: application/json" \
  -d '{
    "event": "payment.refunded",
    "providerPaymentId": "pi_test_123",
    "orderNumber": "MB-10042"
  }'
```

أو مع بيانات بريد كاملة لـ succeeded (وضع mock بدون طلب في DB):

```bash
curl -X POST http://localhost:3000/api/webhooks/payment \
  -H "Content-Type: application/json" \
  -d '{
    "event": "payment.succeeded",
    "providerPaymentId": "pi_test_123",
    "order": {
      "locale": "en",
      "orderNumber": "MB-10042",
      "orderDate": "2026-06-24",
      "customerEmail": "you@example.com",
      "customerName": "Test User",
      "paymentMethod": "card",
      "shippingMethod": "Standard",
      "shippingAddress": {
        "name": "Test User",
        "line1": "Storgatan 1",
        "city": "Stockholm",
        "postalCode": "11122",
        "country": "SE"
      },
      "items": [{
        "name": "Sculpt Leggings",
        "size": "M",
        "color": "Black",
        "quantity": 1,
        "lineTotalFormatted": "899 SEK"
      }],
      "subtotalFormatted": "899 SEK",
      "shippingFormatted": "0 SEK",
      "vatFormatted": "180 SEK",
      "totalFormatted": "899 SEK",
      "accountOrderUrl": "http://localhost:3000/en/account/orders"
    }
  }'
```

غيّر `customerEmail` لبريدك وتحقق من وصول البريد (Resend) أو من log في الطرفية.

---

### الخطوة 7 — التحقق من اكتمال p4-0

| # | معيار القبول | ✓ |
|---|--------------|---|
| 1 | نموذج الاستلام أُرسل للعميل | ☐ |
| 2 | العميل حدّد المزود (Stripe أو بنك) | ☐ |
| 3 | مفاتيح sandbox مستلمة عبر قناة آمنة | ☐ |
| 4 | `pnpm check:payment` → `Ready for staging: yes` | ☐ |
| 5 | متغيرات staging مضافة في Vercel | ☐ |
| 6 | webhook URL مسجّل عند المزود | ☐ |

عند اكتمال الجدول أعلاه → يمكن البدء في **p4-1** (تكامل SDK).

---

## ملخص متغيرات البيئة

| المتغير | p3-9 (بريد) | p4-0 (دفع) |
|---------|-------------|------------|
| `EMAIL_PROVIDER` | ✓ | |
| `EMAIL_FROM` | ✓ | |
| `RESEND_API_KEY` | ✓ | |
| `PAYMENT_PROVIDER` | | ✓ |
| `STRIPE_*` أو `PAYMENT_GATEWAY_*` | | ✓ |
| `KLARNA_*` | | ✓ |
| `PAYMENT_WEBHOOK_SECRET` | | ✓ (إنتاج) |
| `NEXT_PUBLIC_APP_URL` | ✓ | ✓ |

القالب الكامل: [`mbody/.env.example`](../.env.example)

---

## مراجع إضافية

| المورد | المسار |
|--------|--------|
| نموذج استلام العميل | `client-deliverables/Mbody-Payment-Provider-Credentials.md` |
| توثيق الدفع (إنجليزي) | `mbody/docs/payment-provider.md` |
| قائمة المهام | `todo-mbody.html` — p3-9 و p4-0 |
| اكتشاف المتطلبات Q15 | `client-discovery-answers.md` |

---

## استكشاف الأخطاء

| المشكلة | الحل |
|---------|------|
| المعاينة 404 | تأكد `NODE_ENV=development` وليس `production` |
| Resend يفشل | تحقق من النطاق المتحقق و`EMAIL_FROM` |
| `check:payment` يخرج بـ 1 | `PAYMENT_PROVIDER` غير مضبوط أو مفاتيح ناقصة |
| البريد لا يصل بعد POST | راجع `EMAIL_PROVIDER=resend` و`RESEND_API_KEY` |
| webhook 401 في الإنتاج | أضف header `x-mbody-webhook-signature` = `PAYMENT_WEBHOOK_SECRET` |

---

*آخر تحديث: يونيو 2026 — يتوافق مع `PROGRESS_VERSION` 15 في `todo-mbody.html`*
