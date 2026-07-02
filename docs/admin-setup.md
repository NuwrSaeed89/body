# Mbody Admin Dashboard

Back-office UI at `/[locale]/admin` — reads live data from Supabase via **service role** (server only).

## Routes

| Path | Content |
|------|---------|
| `/en/admin` | Dashboard KPIs + revenue chart |
| `/en/admin/orders` | All orders |
| `/en/admin/products` | Catalog + stock |
| `/en/admin/customers` | Profiles (shoppers + admins) |

## Required env (`.env.local` / Vercel)

```env
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Restart `pnpm dev` after changes.

## Required SQL (run once in Supabase SQL Editor)

If you disabled **Automatically expose new tables**, run:

```bash
# File: database/010_api_grants.sql
```

Paste the full file contents and click **Run**. This fixes `permission denied (42501)` for `service_role`.

## Admin authentication

Staff use a **separate login** at `/[locale]/admin/login` (not the customer `/account/login` page).

| Item | Detail |
|------|--------|
| Login URL | `/en/admin/login` |
| Access | `profiles.role = 'admin'` only |
| Session | Supabase Auth cookies (refreshed by middleware) |
| API | `/api/admin/*` requires admin session before service-role writes |

### Promote two full-access admin accounts

1. Create two users in **Supabase → Authentication → Users** (email + password), or sign up once and promote.
2. Run in SQL Editor:

```sql
-- database/011_promote_admin.sql
update public.profiles
set role = 'admin'
where email in ('admin1@mbody.example', 'admin2@mbody.example');
```

3. Sign in at `/en/admin/login` with one of those accounts.

Non-admin users who sign in on the admin page are signed out immediately with an error message.

## Promote admin user (legacy one-liner)

After you sign up via Supabase Auth:

```sql
-- database/011_promote_admin.sql
update public.profiles set role = 'admin' where email = 'you@mbody.com';
```

## Verify data

```sql
select count(*) from public.products;
select count(*) from public.orders;
select count(*) from public.profiles;
```

- **Products:** 16 after `mbody_init.sql`
- **Orders:** 0 until checkout is wired to Supabase
- **Customers:** 0 until users register

## Product CRUD

On `/admin/products` (live mode only):

- **Create** — Add product (slug, name, price, stock, **category**, flags). Creates EN translation + default M variant.
- **Edit** — Update fields including **primary category**; stock scales across active variants proportionally.
- **Delete** — Removes product and cascades variants/translations.

API routes (service role, server-only):

| Method | Path |
|--------|------|
| `POST` | `/api/admin/products` |
| `GET` | `/api/admin/products/[id]` |
| `PATCH` | `/api/admin/products/[id]` |
| `DELETE` | `/api/admin/products/[id]` |

No extra SQL beyond `010_api_grants.sql` — `service_role` already has full table access.

### Categories in Supabase

Shop categories are seeded in `mbody_init.sql` (`leggings`, `sports-bras`, `tops`, `shorts`, `matching-sets`, `accessories`). Assign them per product in **Edit product → Category**.

To add a new category manually (SQL Editor):

```sql
insert into public.categories (slug, sort_order)
values ('new-category', 10)
returning id;

-- Then add EN name (replace :category_id):
insert into public.category_translations (category_id, locale, name)
values ('YOUR-CATEGORY-UUID', 'en', 'New Category');
```

Link a product to a category:

```sql
insert into public.product_categories (product_id, category_id, is_primary)
values ('PRODUCT-UUID', 'CATEGORY-UUID', true);
```

## Mock mode

With `NEXT_PUBLIC_USE_MOCK_DATA=true` (default), all admin pages show demo data. Product CRUD buttons are hidden until live mode is enabled.
