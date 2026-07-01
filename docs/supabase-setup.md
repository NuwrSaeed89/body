# Mbody — Supabase connection guide

Connect the Next.js app (`mbody/`) to your Supabase project (EU / Sweden launch).

## 1. Prerequisites

- Supabase project created (**EU Frankfurt**)
- `database/mbody_init.sql` executed in SQL Editor
- Keys from **Project Settings → API**

## 2. Environment variables

Copy the template and fill your keys:

```bash
cd mbody
cp .env.example .env.local
```

| Variable | Where to find it |
|----------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | API → service_role (server only) |

Example `.env.local`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_ENV=development

NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Keep true until shop/cart/auth are wired to Supabase
NEXT_PUBLIC_USE_MOCK_DATA=true
```

**Never** commit `.env.local` or expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.

## 3. Code layout

| File | Use in |
|------|--------|
| `src/lib/supabase/client.ts` | Client Components (`"use client"`) |
| `src/lib/supabase/server.ts` | Server Components, Server Actions |
| `src/lib/supabase/admin.ts` | API routes / webhooks (bypasses RLS) |
| `src/lib/supabase/middleware.ts` | Session refresh (used by `src/middleware.ts`) |
| `src/lib/supabase/config.ts` | Env validation helpers |

### Browser (client component)

```ts
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const supabase = createSupabaseBrowserClient();
const { data } = await supabase.from("products").select("slug").limit(5);
```

### Server Component / Route Handler

```ts
import { createSupabaseServerClient } from "@/lib/supabase/server";

const supabase = await createSupabaseServerClient();
const { data: { user } } = await supabase.auth.getUser();
```

### Admin / webhook (service role)

```ts
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const supabase = createSupabaseAdminClient();
await supabase.from("orders").update({ status: "paid" }).eq("id", orderId);
```

## 4. Verify connection

```bash
pnpm check:supabase
pnpm dev
# open http://localhost:3000/api/dev/supabase-config
```

Expected when wired correctly:

```json
{
  "ok": true,
  "configured": true,
  "productCount": 16,
  "useMockData": true
}
```

## 5. Supabase Auth URLs

In Supabase **Authentication → URL Configuration**:

| Field | Value |
|-------|--------|
| Site URL | `http://localhost:3000` (dev) or staging/prod URL |
| Redirect URLs | `http://localhost:3000/**`, `https://your-staging.com/**` |

## 6. Switch from mock to live data

When catalog/cart/auth are wired in code:

```env
NEXT_PUBLIC_USE_MOCK_DATA=false
```

Until then, the app keeps using mock files (`shop-data.ts`, mock auth, etc.) even with Supabase connected.

## 7. Vercel (staging / production)

1. Import the GitHub repo at [vercel.com](https://vercel.com) → **Root Directory:** `mbody`
2. Add the same env vars under **Project Settings → Environment Variables**
3. Set `NEXT_PUBLIC_APP_URL` to your `https://*.vercel.app` URL (then redeploy)
4. In Supabase Auth, add the Vercel URL to **Site URL** and **Redirect URLs**

## 8. Troubleshooting

| Issue | Fix |
|-------|-----|
| `relation "products" does not exist` | Run `database/mbody_init.sql` |
| `permission denied` / empty data | If you disabled “Automatically expose new tables”, run GRANTs (see database README) |
| `Supabase is not configured` | Fill `.env.local` and restart `pnpm dev` |
| Auth redirect loop | Match Site URL + Redirect URLs in Supabase dashboard |

## Related

- `database/README.md` — schema + init script
- `database/supabase-schema.md` — full ERD / RLS
- `todo-mbody.html` → **Mock → Supabase** tab — migration checklist
