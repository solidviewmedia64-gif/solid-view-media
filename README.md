# Solid View Media — Client Delivery Portal

A Next.js (App Router) + Supabase + Stripe portal that takes a real estate
client from checkout to a finished, watermark-free property reel:

Pricing → Stripe Checkout → raw photo upload → admin production → watermarked
demo review (approve / request changes) → final delivery → download +
membership upsell.

## Tech Stack

- Next.js 16 (App Router), TypeScript, Tailwind CSS
- Supabase (Postgres + Auth + Storage) — magic-link auth, no passwords
- Stripe Checkout + Customer Portal + Webhooks
- Resend for transactional email

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create a Supabase project**, then run the migration and seed:

   ```bash
   # In the Supabase SQL editor, run (in order):
   supabase/migrations/0001_init.sql
   supabase/seed.sql   # optional example service catalog
   ```

   The migration creates all tables, RLS policies, an `is_admin()` helper,
   and three private storage buckets (`raw-uploads`, `demo-assets`,
   `final-assets`). A trigger auto-creates a `profiles` row for every new
   Supabase auth user, and promotes the email in the trigger's admin list to
   `role = 'admin'` on signup — edit `handle_new_user()` in the migration to
   change which email(s) become the initial admin.

3. **Create Stripe Prices** for each service tier (one-time or recurring),
   then update `supabase/seed.sql` (or the `services` table directly) with
   the real `stripe_price_id` values.

4. **Copy `.env.example` to `.env.local`** and fill in:
   - Supabase URL / anon key / service role key
   - Stripe secret key + webhook signing secret + publishable key
   - Resend API key + from-address
   - `ADMIN_EMAILS` — comma-separated list notified of new orders

5. **Run the dev server**

   ```bash
   npm run dev
   ```

6. **Forward Stripe webhooks locally**

   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

## How the pieces fit together

- **`/pricing`** — reads the `services` table (public, RLS-readable) and
  starts a Stripe Checkout session via `POST /api/checkout`.
- **`/api/webhooks/stripe`** — on `checkout.session.completed`, finds or
  creates the client's account (via Supabase Admin API), creates an `orders`
  row for one-time services, emails a magic login link + upload link, and
  notifies the admin. Subscription events upsert the `memberships` table.
- **`/dashboard`** — the client's order list, plus a "+ New Property" form
  for active members (creates an order without a new Stripe Checkout).
- **`/dashboard/orders/[id]`** — renders the right UI for the order's
  current status: photo upload (direct-to-Supabase-Storage, RLS-scoped to
  the order's folder), demo review + approve/request changes, or a final
  download panel with a membership upsell.
- **`/admin`** — order table, filterable by status.
- **`/admin/orders/[id]`** — view the client's raw uploads, upload the
  watermarked demo and final delivery files, and manually advance status
  (which triggers the relevant client email).
- **Downloads** are never served from public storage URLs. Both demo
  playback and final delivery links are minted server-side with the
  service-role key as short-lived signed URLs; every final-asset link also
  logs a row to `access_tokens` for auditing, and can be refreshed anytime
  from the dashboard.

## Database

See `supabase/migrations/0001_init.sql` for the full schema, RLS policies,
and storage bucket policies. Key tables: `profiles`, `services`, `orders`,
`raw_uploads`, `demo_assets`, `final_assets`, `memberships`, `access_tokens`.
