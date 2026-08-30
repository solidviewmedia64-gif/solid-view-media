-- ============================================================================
-- SVM Client Delivery Portal — initial schema, RLS, storage buckets
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Tables
-- ----------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'client' check (role in ('client','admin')),
  stripe_customer_id text,
  created_at timestamptz default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price_cents int not null,
  stripe_price_id text not null,
  billing_type text not null check (billing_type in ('one_time','subscription')),
  active boolean default true
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) not null,
  service_id uuid references public.services(id) not null,
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  property_label text,
  status text not null default 'awaiting_upload'
    check (status in (
      'awaiting_upload','in_production','demo_ready',
      'changes_requested','approved','delivered'
    )),
  amount_paid_cents int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.raw_uploads (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) not null,
  storage_path text not null,
  uploaded_at timestamptz default now()
);

create table public.demo_assets (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) not null,
  storage_path text not null,
  uploaded_at timestamptz default now()
);

create table public.final_assets (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) not null,
  storage_path text not null,
  delivered_at timestamptz default now()
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) not null,
  stripe_subscription_id text not null unique,
  status text not null check (status in ('active','past_due','canceled')),
  current_period_end timestamptz
);

create table public.access_tokens (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) not null,
  token text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

create index orders_user_id_idx on public.orders(user_id);
create index orders_status_idx on public.orders(status);
create index raw_uploads_order_id_idx on public.raw_uploads(order_id);
create index demo_assets_order_id_idx on public.demo_assets(order_id);
create index final_assets_order_id_idx on public.final_assets(order_id);
create index memberships_user_id_idx on public.memberships(user_id);
create index access_tokens_order_id_idx on public.access_tokens(order_id);

-- ----------------------------------------------------------------------------
-- updated_at trigger for orders
-- ----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Auto-create a profile row whenever a new auth user is created.
-- The initial admin account (business owner) is promoted automatically by
-- email match; every other new user defaults to 'client'.
-- ----------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    case
      when lower(new.email) in ('eunice.solidpiecescompanies@gmail.com')
        then 'admin'
      else 'client'
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- is_admin() helper for RLS
-- ----------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable set search_path = public;

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.orders enable row level security;
alter table public.raw_uploads enable row level security;
alter table public.demo_assets enable row level security;
alter table public.final_assets enable row level security;
alter table public.memberships enable row level security;
alter table public.access_tokens enable row level security;

-- profiles: users can see/update their own row; admins see all
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own_or_admin"
  on public.profiles for update
  using (id = auth.uid() or public.is_admin());

-- services: readable by anyone (public pricing page), writable only by admin
create policy "services_select_all"
  on public.services for select
  using (true);

create policy "services_admin_write"
  on public.services for all
  using (public.is_admin())
  with check (public.is_admin());

-- orders: client sees/creates own orders; admin sees/updates all
create policy "orders_select_own_or_admin"
  on public.orders for select
  using (user_id = auth.uid() or public.is_admin());

create policy "orders_insert_own_or_admin"
  on public.orders for insert
  with check (user_id = auth.uid() or public.is_admin());

create policy "orders_update_own_or_admin"
  on public.orders for update
  using (user_id = auth.uid() or public.is_admin());

-- raw_uploads: client can select/insert for their own orders; admin all
create policy "raw_uploads_select_own_or_admin"
  on public.raw_uploads for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

create policy "raw_uploads_insert_own_or_admin"
  on public.raw_uploads for insert
  with check (
    public.is_admin()
    or exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

-- demo_assets: client can select for their own orders (read-only); admin all
create policy "demo_assets_select_own_or_admin"
  on public.demo_assets for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

create policy "demo_assets_admin_write"
  on public.demo_assets for insert
  with check (public.is_admin());

-- final_assets: client can select for their own orders (read-only); admin all
create policy "final_assets_select_own_or_admin"
  on public.final_assets for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

create policy "final_assets_admin_write"
  on public.final_assets for insert
  with check (public.is_admin());

-- memberships: client sees own; admin sees all. Writes happen via service role (webhooks).
create policy "memberships_select_own_or_admin"
  on public.memberships for select
  using (user_id = auth.uid() or public.is_admin());

-- access_tokens: client can see tokens for their own orders; admin all.
-- Tokens are minted server-side with the service role.
create policy "access_tokens_select_own_or_admin"
  on public.access_tokens for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- Storage buckets (all private — access via signed URLs only)
-- ----------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values
  ('raw-uploads', 'raw-uploads', false),
  ('demo-assets', 'demo-assets', false),
  ('final-assets', 'final-assets', false)
on conflict (id) do nothing;

-- raw-uploads/{order_id}/filename — client uploads to their own order folder
create policy "raw_uploads_storage_select"
  on storage.objects for select
  using (
    bucket_id = 'raw-uploads'
    and (
      public.is_admin()
      or exists (
        select 1 from public.orders o
        where o.id::text = (storage.foldername(name))[1]
          and o.user_id = auth.uid()
      )
    )
  );

create policy "raw_uploads_storage_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'raw-uploads'
    and (
      public.is_admin()
      or exists (
        select 1 from public.orders o
        where o.id::text = (storage.foldername(name))[1]
          and o.user_id = auth.uid()
      )
    )
  );

-- demo-assets and final-assets: only admins (service role) write; reads are
-- served exclusively through server-generated signed URLs, so no client-side
-- select policy is granted here.
create policy "demo_assets_storage_admin_all"
  on storage.objects for all
  using (bucket_id = 'demo-assets' and public.is_admin())
  with check (bucket_id = 'demo-assets' and public.is_admin());

create policy "final_assets_storage_admin_all"
  on storage.objects for all
  using (bucket_id = 'final-assets' and public.is_admin())
  with check (bucket_id = 'final-assets' and public.is_admin());
