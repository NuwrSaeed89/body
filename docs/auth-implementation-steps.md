# Mbody — خطوات تنفيذ صفحات المصادقة (Auth)

> **المرجع:** `requirements.html` — UR-01, PY-05, MVP-01, NFR-04  
> **الحالة الحالية:** واجهة `/account/login` جاهزة، لكن المصادقة **mock** (بريد فقط في `localStorage`)  
> **الهدف:** Supabase Auth حقيقي + `profiles` + حماية checkout + ربط السلة والأمنيات

---

## قبل أن تبدأ — تحقق من هذه النقاط

| # | ماذا تفعل | أين |
|---|-----------|-----|
| 1 | تأكد أن `.env.local` يحتوي على `NEXT_PUBLIC_SUPABASE_URL` و `NEXT_PUBLIC_SUPABASE_ANON_KEY` و `SUPABASE_SERVICE_ROLE_KEY` | `mbody/.env.local` |
| 2 | نفّذ schema قاعدة البيانات إن لم يكن منفّذاً | `database/mbody_init.sql` في Supabase SQL Editor |
| 3 | اقرأ دليل الربط | `mbody/docs/supabase-setup.md` |
| 4 | عرّف `NEXT_PUBLIC_USE_MOCK_DATA=false` عند اختبار auth الحقيقي | `mbody/.env.local` |

---

## المرحلة 0 — إعداد Supabase (تفعلها أنت في لوحة Supabase)

### الخطوة 0.1 — URL Configuration

**المسار:** Supabase Dashboard → **Authentication** → **URL Configuration**

| الحقل | قيمة التطوير | قيمة الإنتاج |
|-------|--------------|--------------|
| Site URL | `http://localhost:3000` | `https://your-domain.com` |
| Redirect URLs | `http://localhost:3000/**` | `https://your-domain.com/**` |

### الخطوة 0.2 — مزوّد Email

**المسار:** Authentication → **Providers** → **Email**

- [ ] تفعيل **Email**
- [ ] قرار: هل **تأكيد البريد** مطلوب عند التسجيل؟ (موصى به لـ EU/GDPR)
- [ ] حد أدنى لكلمة المرور: 8 أحرف (يطابق `passwordHint` في الواجهة)

### الخطوة 0.3 — قوالب البريد (اختياري للإطلاق)

**المسار:** Authentication → **Email Templates**

- [ ] Confirm signup
- [ ] Reset password
- [ ] (لاحقاً) ترجمة القوالب لـ SV, ES, DE

### الخطوة 0.4 — اختبار يدوي سريع

في Supabase → Authentication → **Users** → Add user يدوياً للتجربة، أو انتظر حتى تربط النماذج.

---

## المرحلة 1 — ملفات جديدة (أنشئها في الكود)

### الخطوة 1.1 — طبقة auth منفصلة

أنشئ المجلد `mbody/src/lib/auth/` بالملفات التالية:

| ملف | المسؤولية | الدوال الرئيسية |
|-----|-----------|-----------------|
| `types.ts` | أنواع المستخدم والجلسة | `AuthUser`, `AuthProfile` |
| `sign-in.ts` | تسجيل الدخول | `signInWithEmail(email, password)` |
| `sign-up.ts` | إنشاء حساب | `signUpWithEmail({ email, password, firstName, lastName })` |
| `sign-out.ts` | تسجيل الخروج | `signOut()` |
| `get-session.ts` | قراءة الجلسة (سيرفر) | `getServerSession()`, `getServerProfile()` |
| `should-use-auth-mock.ts` | fallback للتطوير | مثل `should-use-cart-mock.ts` |

**مثال `sign-in.ts` (client):**

```ts
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export async function signInWithEmail(email: string, password: string) {
  const supabase = createSupabaseBrowserClient();
  return supabase.auth.signInWithPassword({ email, password });
}
```

**مثال `sign-up.ts` — مرّر الاسم في metadata:**

```ts
return supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      full_name: [firstName, lastName].filter(Boolean).join(" "),
      first_name: firstName,
      last_name: lastName,
    },
  },
});
```

> الـ trigger `handle_new_user` في `database/003_profiles_auth.sql` ينشئ صفاً في `profiles` تلقائياً عند كل مستخدم جديد في `auth.users`.

---

### الخطوة 1.2 — مسار callback (إلزامي لروابط البريد)

**أنشئ:** `mbody/src/app/auth/callback/route.ts`

**ماذا يفعل:**
1. يستقبل `?code=...` من Supabase (تأكيد بريد / reset password)
2. يستبدل الكود بجلسة عبر `exchangeCodeForSession`
3. يعيد التوجيه إلى `redirect` أو `/account`

```ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect") ?? "/account";

  if (code) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}${redirect}`);
}
```

**أضف في Supabase Redirect URLs:**  
`http://localhost:3000/auth/callback`  
`https://your-domain.com/auth/callback`

---

### الخطوة 1.3 — حماية المسارات (server helper)

**أنشئ:** `mbody/src/lib/auth/require-user.ts`

```ts
import { redirect } from "next/navigation";
import { getServerSession } from "./get-session";

export async function requireUser(redirectPath: string) {
  const session = await getServerSession();
  if (!session?.user) {
    redirect(`/account/login?redirect=${encodeURIComponent(redirectPath)}`);
  }
  return session.user;
}
```

---

## المرحلة 2 — تعديل ملفات موجودة

### الخطوة 2.1 — `auth-provider.tsx` (الأهم)

**الملف:** `mbody/src/providers/auth-provider.tsx`

| قبل (mock) | بعد (Supabase) |
|------------|----------------|
| `localStorage` + `AUTH_STORAGE_KEY` | `createSupabaseBrowserClient()` |
| `user.id` = البريد | `user.id` = UUID من `auth.users` |
| `signIn(email)` فقط | `signIn(email, password)` |
| لا يوجد `profile` | جلب `profiles` بعد الدخول |

**قائمة مهام:**

- [ ] عند mount: `supabase.auth.getSession()` ثم `setUser`
- [ ] اشترك في `supabase.auth.onAuthStateChange`
- [ ] `signIn` / `signUp` / `signOut` تستدعي دوال `src/lib/auth/`
- [ ] أضف `profile: AuthProfile | null` للسياق (اسم، locale، currency)
- [ ] احذف أو عطّل `persistSession` في `localStorage` عند عدم mock
- [ ] أبقِ `mounted` لتجنب وميض hydration في الهيدر

**ملف مرتبط:** `mbody/src/lib/auth-session.ts` — يمكن الإبقاء على `AUTH_COOKIE` للتوافق أو الاعتماد على كوكيز Supabase فقط.

---

### الخطوة 2.2 — `auth-forms.tsx`

**الملف:** `mbody/src/components/auth/auth-forms.tsx`

| المهمة | التفاصيل |
|--------|----------|
| تسجيل الدخول | اقرأ `password` من النموذج — حالياً يُتجاهل |
| التسجيل | تحقق من checkbox الشروط قبل الإرسال |
| أخطاء | `error.message` من Supabase → عرض للمستخدم |
| تحميل | `isSubmitting` على الأزرار |
| بعد النجاح | `router.push(redirectTo)` |
| تأكيد بريد | إن كان مفعّلاً: اعرض «تحقق من بريدك» بدل التوجيه المباشر |

**تحديث `signIn` / `signUp` في provider** ليقبلا كلمة المرور.

---

### الخطوة 2.3 — صفحة نسيت كلمة المرور

**أنشئ:** `mbody/src/app/[locale]/account/forgot-password/page.tsx`  
**أنشئ:** `mbody/src/components/auth/forgot-password-form.tsx`

- [ ] نموذج بريد واحد
- [ ] `supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/auth/callback?redirect=/account/reset-password` })`
- [ ] رسالة نجاح عامة (لا تكشف إن كان البريد مسجّلاً — أمان)

**عدّل في `auth-forms.tsx`:** رابط `Forgot?` من `href="#"` إلى `/account/forgot-password`

---

### الخطوة 2.4 — صفحة إعادة تعيين كلمة المرور

**أنشئ:** `mbody/src/app/[locale]/account/reset-password/page.tsx`

- [ ] يتطلب جلسة (بعد فتح رابط البريد)
- [ ] نموذج: كلمة مرور جديدة + تأكيد
- [ ] `supabase.auth.updateUser({ password })`
- [ ] توجيه إلى `/account` بعد النجاح

---

### الخطوة 2.5 — حماية الصفحات الحساسة

طبّق `requireUser()` في بداية هذه الصفحات (Server Components):

| صفحة | ملف | أولوية |
|------|-----|--------|
| الحساب | `src/app/[locale]/account/page.tsx` | Must |
| الأمنيات | `src/app/[locale]/account/wishlist/page.tsx` | Must |
| شحن | `src/app/[locale]/checkout/shipping/page.tsx` | **Must (PY-05)** |
| دفع | `src/app/[locale]/checkout/payment/page.tsx` | **Must (PY-05)** |

**مثال في `checkout/shipping/page.tsx`:**

```ts
import { requireUser } from "@/lib/auth/require-user";

export default async function ShippingPage({ params }) {
  await requireUser("/checkout/shipping");
  // ...
}
```

**صفحة login:** إن كان المستخدم مسجّلاً → `redirect("/account")` (أنشئ helper `redirectIfAuthenticated`).

---

### الخطوة 2.6 — صفحة الحساب من القاعدة

**الملف:** `mbody/src/app/[locale]/account/page.tsx`

- [ ] اجلب `profiles` للمستخدم الحالي
- [ ] اعرض `full_name` بدل نص عام
- [ ] اجلب `orders` من Supabase بدل المصفوفة الوهمية
- [ ] زر تسجيل خروج يعمل عبر `signOut()`

---

### الخطوة 2.7 — إعدادات الحساب (جديد — موصى به)

**أنشئ:** `mbody/src/app/[locale]/account/settings/page.tsx`

- [ ] تعديل `full_name`, `phone`
- [ ] تعديل `locale` و `currency` في `profiles`
- [ ] RLS يسمح: `profiles_update_own` (موجود في `006_rls_policies.sql`)

**حدّث:** `mbody/src/components/account/account-nav.tsx` — رابط Settings

---

## المرحلة 3 — ربط السلة والأمنيات والـ API

بعد auth الحقيقي، **لا تعتمد على البريد** في API السلة.

### الخطوة 3.1 — Cart API

**الملفات:**
- `mbody/src/app/api/cart/route.ts`
- `mbody/src/app/api/cart/items/route.ts`

| قبل | بعد |
|-----|-----|
| `email` في query/body | `createSupabaseServerClient()` → `getUser()` |
| `resolveProfileIdByEmail` | `user.id` مباشرة (= `profiles.id`) |
| admin client للكتابة | يمكن الإبقاء على admin أو استخدام RLS + anon مع جلسة |

**احذف أو أبقِ:** `mbody/src/app/api/auth/resolve-profile/route.ts` — لن تحتاجه بعد الربط.

### الخطوة 3.2 — Cart provider

**الملف:** `mbody/src/providers/cart-provider.tsx`

- [ ] `refresh` و `addItem` بدون إرسال `email` في body
- [ ] الاعتماد على كوكي الجلسة في الطلبات

### الخطوة 3.3 — Wishlist

راجع `wishlist-provider` و API الأمنيات — نفس النمط: `auth.uid()` بدل البريد.

---

## المرحلة 4 — الترجمة والامتثال (GDPR)

### الخطوة 4.1 — مفاتيح جديدة في `messages/*.json`

أضف تحت `account.login` في **en, sv, es, de**:

```json
"errors": {
  "invalidCredentials": "Invalid email or password.",
  "emailInUse": "An account with this email already exists.",
  "weakPassword": "Password must be at least 8 characters.",
  "termsRequired": "You must accept the Terms of Service.",
  "generic": "Something went wrong. Please try again."
},
"checkEmail": "Check your inbox to confirm your account.",
"forgotPasswordTitle": "Reset your password",
"forgotPasswordSent": "If an account exists, we sent a reset link.",
"resetPasswordTitle": "Choose a new password"
```

### الخطوة 4.2 — checkbox الشروط

في `auth-forms.tsx`:

- [ ] `required` على checkbox
- [ ] رابط Privacy + Terms (`LEGAL_PATHS`)
- [ ] يمنع الإرسال إن لم يُحدَّد

---

## المرحلة 5 — الاختبار (قائمة تحقق UAT)

### تسجيل ودخول

- [ ] إنشاء حساب جديد → يظهر في Supabase **Authentication → Users**
- [ ] يظهر صف في **`profiles`** بنفس `id`
- [ ] تسجيل دخول بكلمة مرور صحيحة
- [ ] رسالة خطأ بكلمة مرور خاطئة
- [ ] تسجيل خروج يمسح الجلسة

### السلة والأمنيات

- [ ] إضافة للسلة بعد الدخول → صفوف في `carts` / `cart_items`
- [ ] العدد في الهيدر يتحدث
- [ ] الأمنيات تُحفظ لـ `user_id` الصحيح

### Checkout (PY-05)

- [ ] `/checkout/shipping` يعيد توجيه غير المسجّل إلى login
- [ ] بعد الدخول يعود إلى checkout عبر `?redirect=`

### لغات

- [ ] `/en/account/login`, `/sv/account/login`, إلخ — النصوص مترجمة

### جوال

- [ ] النماذج قابلة للاستخدام على عرض ضيق
- [ ] شريط التنقل السفلي يوجّه لـ `/account` عند الدخول

---

## ترتيب التنفيذ الموصى به (للمطوّر)

```
1. Supabase Dashboard (المرحلة 0)          ← أنت
2. src/lib/auth/*                            ← كود
3. app/auth/callback/route.ts                ← كود
4. auth-provider.tsx                         ← كود (أهم ملف)
5. auth-forms.tsx                            ← كود
6. forgot-password + reset-password pages    ← كود
7. require-user على checkout + account     ← كود
8. cart/wishlist API بـ session              ← كود
9. ترجمات + GDPR checkbox                    ← كود
10. UAT حسب القائمة أعلاه                    ← أنت
```

---

## ملفات المشروع — مرجع سريع

### موجود ويحتاج ربط فقط

| ملف | الدور |
|-----|-------|
| `src/app/[locale]/account/login/page.tsx` | صفحة الدخول/التسجيل |
| `src/components/auth/auth-forms.tsx` | النماذج |
| `src/components/auth/auth-visual-panel.tsx` | اللوحة البصرية |
| `src/components/auth/auth-utility-bar.tsx` | شريط علوي |
| `src/components/auth/auth-footer.tsx` | تذييل |
| `src/providers/auth-provider.tsx` | **يحتاج استبدال mock** |
| `src/lib/supabase/client.ts` | عميل المتصفح |
| `src/lib/supabase/server.ts` | عميل السيرفر |
| `src/lib/supabase/middleware.ts` | تحديث الجلسة |
| `src/middleware.ts` | يستدعي `updateSupabaseSession` |
| `database/003_profiles_auth.sql` | `profiles` + trigger |

### أنشئه أنت

| ملف |
|-----|
| `src/lib/auth/types.ts` |
| `src/lib/auth/sign-in.ts` |
| `src/lib/auth/sign-up.ts` |
| `src/lib/auth/sign-out.ts` |
| `src/lib/auth/get-session.ts` |
| `src/lib/auth/require-user.ts` |
| `src/lib/auth/should-use-auth-mock.ts` |
| `src/app/auth/callback/route.ts` |
| `src/app/[locale]/account/forgot-password/page.tsx` |
| `src/app/[locale]/account/reset-password/page.tsx` |
| `src/components/auth/forgot-password-form.tsx` |
| `src/app/[locale]/account/settings/page.tsx` (موصى به) |

---

## ماذا تفعل أنت vs ماذا يفعل الكود

| أنت (يدوياً) | الكود (تطوير) |
|--------------|----------------|
| إعداد Supabase URLs و Providers | ملفات `src/lib/auth/` |
| تنفيذ SQL إن لم يكن منفّذاً | `auth-provider` + `auth-forms` |
| إنشاء مستخدم تجريبي للاختبار | callback + forgot/reset |
| مراجعة قوالب البريد | حماية checkout |
| UAT على جوال وسطح مكتب | ربط cart/wishlist |
| قرار: تأكيد بريد نعم/لا | ترجمات الأخطاء |

---

## مشاكل شائعة وحلولها

| المشكلة | السبب المحتمل | الحل |
|---------|---------------|------|
| «Profile not found» عند الإضافة للسلة | mock auth بالبريد بدون `profiles` | أكمل auth الحقيقي أو سجّل عبر Supabase |
| الجلسة لا تُحفظ | callback أو middleware | تحقق من Redirect URLs و `middleware.ts` |
| `exchangeCodeForSession` يفشل | redirect URL غير مسجّل | أضف `/auth/callback` في Supabase |
| CORS / redirect loop | Site URL خاطئ | طابق `NEXT_PUBLIC_APP_URL` |
| RLS يمنع القراءة | لا جلسة في API route | استخدم `createSupabaseServerClient` مع كوكيز الطلب |

---

## بعد الإكمال

- [ ] حدّث `todo-1-7.html` — علّم مهمة auth كـ done
- [ ] حدّث `mbody/docs/supabase-setup.md` — أزل «auth mock»
- [ ] `NEXT_PUBLIC_USE_MOCK_DATA=false` في staging

---

*آخر تحديث: يوليو 2026 · Mbody spark-ecommerce*
