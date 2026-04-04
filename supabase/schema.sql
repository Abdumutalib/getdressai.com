create extension if not exists pgcrypto;

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  role text not null default 'user' check (role in ('user', 'admin')),
  image_generation_count integer not null default 0,
  referral_source text,
  stripe_customer_email text,
  last_checkout_session_id text,
  last_payment_status text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.image_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.app_users(id) on delete set null,
  prompt text not null,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  image_url text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.billing_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.app_users(id) on delete cascade,
  stripe_session_id text unique,
  payment_status text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_user_id uuid references public.app_users(id) on delete cascade,
  referred_user_id uuid references public.app_users(id) on delete cascade,
  bonus_credits integer not null default 3,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.app_shop_products (
  id bigint primary key,
  name text not null,
  brand text not null,
  store text not null,
  category text not null,
  description text,
  image text not null,
  link text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_app_users_updated_at on public.app_users;

create trigger set_app_users_updated_at
before update on public.app_users
for each row
execute function public.set_updated_at();

create index if not exists idx_app_users_email on public.app_users(email);
create index if not exists idx_image_generations_user_id on public.image_generations(user_id);
create index if not exists idx_billing_events_user_id on public.billing_events(user_id);
create index if not exists idx_referrals_referrer_user_id on public.referrals(referrer_user_id);
create index if not exists idx_app_shop_products_brand on public.app_shop_products(brand);
create index if not exists idx_app_shop_products_category on public.app_shop_products(category);
create index if not exists idx_app_shop_products_sort_order on public.app_shop_products(sort_order);