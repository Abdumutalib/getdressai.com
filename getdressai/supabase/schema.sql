-- GetdressAI — Supabase database (Dashboard → SQL Editor → New query → Run)
-- Tables: profiles (app "user" row = gender/style/budget, links auth.users),
--         products, outfits, orders, subscriptions (Stripe + trial), user_quotas
--         (AI generations / try-on limits). RLS enabled.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Profiles (linked to auth.users — holds gender, style, budget)
-- Note: Supabase already has auth.users; this is your app "user" row.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  gender text default '',
  style text default '',
  budget text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile when a user signs up
create or replace function public.handle_new_user ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Products (shop catalog)
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid (),
  name text not null,
  description text default '',
  price numeric(12, 2) not null default 0,
  image_url text default '',
  category text default '',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Saved AI outfits
-- ---------------------------------------------------------------------------
create table if not exists public.outfits (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text default '',
  prompt text not null,
  suggestions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  items jsonb not null default '[]'::jsonb,
  total numeric(12, 2) not null default 0,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.outfits enable row level security;
alter table public.orders enable row level security;

-- Profiles: each user sees/updates only their row
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid () = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid () = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid () = id);

-- Products: public read (shop works for browsing); optional: restrict to authenticated
drop policy if exists "products_select_all" on public.products;
create policy "products_select_all"
  on public.products for select
  using (true);

-- Allow service role / dashboard inserts; for app admin use Supabase dashboard or service key.
-- Authenticated users cannot insert products by default (no insert policy).

-- Outfits: own rows only
drop policy if exists "outfits_select_own" on public.outfits;
create policy "outfits_select_own"
  on public.outfits for select
  using (auth.uid () = user_id);

drop policy if exists "outfits_insert_own" on public.outfits;
create policy "outfits_insert_own"
  on public.outfits for insert
  with check (auth.uid () = user_id);

drop policy if exists "outfits_delete_own" on public.outfits;
create policy "outfits_delete_own"
  on public.outfits for delete
  using (auth.uid () = user_id);

-- Orders: own rows only
drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own"
  on public.orders for select
  using (auth.uid () = user_id);

drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own"
  on public.orders for insert
  with check (auth.uid () = user_id);

-- ---------------------------------------------------------------------------
-- Sample products (safe to re-run — skips if same name exists)
-- ---------------------------------------------------------------------------
insert into public.products (name, description, price, category, image_url)
select v.name, v.description, v.price, v.category, v.image_url
from (
  values
    ('Minimal Linen Shirt', 'Breathable oversized shirt, off-white.', 49.00::numeric, 'tops', ''),
    ('Tailored Black Trousers', 'Slim taper, stretch cotton.', 89.00::numeric, 'bottoms', ''),
    ('Leather Sneakers', 'Clean white cupsole.', 120.00::numeric, 'shoes', ''),
    ('Wool Overcoat', 'Charcoal, mid-length.', 220.00::numeric, 'outerwear', ''),
    ('Silver Watch', '40mm case, mesh band.', 165.00::numeric, 'accessories', '')
) as v(name, description, price, category, image_url)
where not exists (
  select 1 from public.products p where p.name = v.name
);

-- ---------------------------------------------------------------------------
-- Subscriptions (Stripe + trial)
-- ---------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id uuid default gen_random_uuid () primary key,
  user_id uuid references auth.users (id) on delete cascade unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text default 'inactive', -- trial, active, cancelled, past_due
  plan_type text default 'monthly',
  trial_start timestamptz,
  trial_end timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz default now (),
  updated_at timestamptz default now ()
);

-- Paddle Billing (мажбурий эмас; мавжуд базага бир марта ишлатинг)
alter table public.subscriptions
  add column if not exists paddle_customer_id text,
  add column if not exists paddle_subscription_id text,
  add column if not exists paddle_last_transaction_id text;

-- ---------------------------------------------------------------------------
-- User quotas (generations, try-on, saved outfits)
-- ---------------------------------------------------------------------------
create table if not exists public.user_quotas (
  id uuid default gen_random_uuid () primary key,
  user_id uuid references auth.users (id) on delete cascade unique,
  is_premium boolean default false,
  is_trial boolean default false,
  trial_days_left int default 0,
  ai_generations_used int default 0,
  ai_generations_limit int default 5,
  tryon_used int default 0,
  tryon_limit int default 3,
  saved_outfits_limit int default 10,
  last_reset_date date default current_date,
  created_at timestamptz default now (),
  updated_at timestamptz default now ()
);

-- Daily quota reset (call from pg_cron or edge function)
create or replace function public.reset_daily_quotas ()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.user_quotas
  set
    ai_generations_used = 0,
    tryon_used = 0,
    last_reset_date = current_date
  where last_reset_date < current_date;
end;
$$;

-- Trial expiry → subscription / quota sync (call from pg_cron or edge function)
create or replace function public.check_expired_trials ()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.subscriptions s
  set status = 'active'
  from public.user_quotas q
  where s.user_id = q.user_id
    and s.status = 'trial'
    and s.trial_end < now ()
    and q.is_trial = true;

  update public.user_quotas q
  set
    is_premium = true,
    is_trial = false,
    trial_days_left = 0,
    ai_generations_limit = -1,
    tryon_limit = -1,
    saved_outfits_limit = -1
  from public.subscriptions s
  where q.user_id = s.user_id
    and s.status = 'active'
    and q.is_premium = false;
end;
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security (subscriptions, user_quotas)
-- ---------------------------------------------------------------------------
alter table public.subscriptions enable row level security;
alter table public.user_quotas enable row level security;

-- Subscriptions: own row only (writes from Stripe webhooks use service role)
drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own"
  on public.subscriptions for select
  using (auth.uid () = user_id);

drop policy if exists "subscriptions_update_own" on public.subscriptions;
create policy "subscriptions_update_own"
  on public.subscriptions for update
  using (auth.uid () = user_id);

-- User quotas: own row only
drop policy if exists "user_quotas_select_own" on public.user_quotas;
create policy "user_quotas_select_own"
  on public.user_quotas for select
  using (auth.uid () = user_id);

drop policy if exists "user_quotas_update_own" on public.user_quotas;
create policy "user_quotas_update_own"
  on public.user_quotas for update
  using (auth.uid () = user_id);
