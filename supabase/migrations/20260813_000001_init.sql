-- =============================================================
-- AKBEL CRM V2 — PostgreSQL / Supabase Schema
-- =============================================================
-- Production-oriented schema with UUID PK, timestamps, soft-delete,
-- role/permission model, offline sync primitives, and audit trails.

create extension if not exists pgcrypto;

-- =============================================================
-- Helpers
-- =============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.generate_code(prefix text)
returns text
language plpgsql
as $$
declare
  generated text;
begin
  generated := prefix || '-' || to_char(now(), 'YYYYMMDD') || '-' || lpad((floor(random() * 1000000))::text, 6, '0');
  return generated;
end;
$$;

-- =============================================================
-- Core auth & RBAC
-- =============================================================
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name_uz text not null,
  description text,
  system_role boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name_uz text not null,
  module text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text unique,
  email text unique,
  username text unique not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login timestamptz
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, role_id)
);

create table if not exists public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (role_id, permission_id)
);

create table if not exists public.user_permissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  allowed boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, permission_id)
);

-- =============================================================
-- Device and settings
-- =============================================================
create table if not exists public.devices (
  id text primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  app_version text not null,
  last_active timestamptz not null default now(),
  last_sync timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  company_phone text,
  default_currency text not null default 'UZS',
  currency_symbol text not null default 'сўм',
  timezone text not null default 'Asia/Tashkent',
  offline_negative_stock_allowed boolean not null default false,
  setup_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================
-- Catalog
-- =============================================================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_person text,
  phone text not null,
  address text,
  current_debt numeric(18,2) not null default 0,
  total_purchase numeric(18,2) not null default 0,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  barcode text unique,
  name text not null,
  category_id uuid references public.categories(id) on delete set null,
  unit text not null check (unit in ('кг','дона','қути','литр','метр')),
  purchase_price numeric(18,4) not null default 0,
  retail_price numeric(18,4) not null default 0,
  wholesale_price numeric(18,4) not null default 0,
  minimum_price numeric(18,4) not null default 0,
  minimum_stock numeric(18,4) not null default 0,
  supplier_id uuid references public.suppliers(id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists idx_products_name on public.products using gin (to_tsvector('simple', name));
create index if not exists idx_products_sku on public.products(sku);
create index if not exists idx_products_barcode on public.products(barcode);

-- =============================================================
-- Warehouses and stock
-- =============================================================
create table if not exists public.warehouses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  responsible_employee_id uuid references public.users(id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.warehouse_stock (
  id uuid primary key default gen_random_uuid(),
  warehouse_id uuid not null references public.warehouses(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity numeric(18,4) not null default 0,
  avg_cost numeric(18,4) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (warehouse_id, product_id)
);

create table if not exists public.stock_transactions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id),
  warehouse_id uuid not null references public.warehouses(id),
  type text not null check (type in ('income','sale','expense','return','transfer_in','transfer_out','inventory','adjustment')),
  quantity numeric(18,4) not null,
  price numeric(18,4) not null default 0,
  reference_id uuid,
  reference_type text,
  reason text,
  employee_id uuid not null references public.users(id),
  device_id text,
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (idempotency_key)
);

create index if not exists idx_stock_transactions_product on public.stock_transactions(product_id);
create index if not exists idx_stock_transactions_warehouse on public.stock_transactions(warehouse_id);
create index if not exists idx_stock_transactions_created on public.stock_transactions(created_at desc);

-- =============================================================
-- Customers and debt ledger
-- =============================================================
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_person text,
  phone text not null,
  telegram text,
  address text,
  responsible_manager_id uuid references public.users(id) on delete set null,
  credit_limit numeric(18,2) not null default 0,
  current_debt numeric(18,2) not null default 0,
  total_purchase numeric(18,2) not null default 0,
  last_purchase_at timestamptz,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists idx_customers_name on public.customers using gin (to_tsvector('simple', company_name));
create index if not exists idx_customers_phone on public.customers(phone);

create table if not exists public.customer_transactions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  type text not null check (type in ('sale','payment','adjustment')),
  amount numeric(18,2) not null,
  direction text not null check (direction in ('debit','credit')),
  due_date date,
  is_overdue boolean not null default false,
  reference_id uuid,
  reference_type text,
  comment text,
  created_by uuid not null references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.supplier_transactions (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  type text not null check (type in ('purchase','payment','adjustment')),
  amount numeric(18,2) not null,
  direction text not null check (direction in ('debit','credit')),
  reference_id uuid,
  reference_type text,
  comment text,
  created_by uuid not null references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================
-- Sales
-- =============================================================
create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique default public.generate_code('INV'),
  customer_id uuid references public.customers(id) on delete set null,
  employee_id uuid not null references public.users(id),
  warehouse_id uuid not null references public.warehouses(id),
  subtotal numeric(18,2) not null default 0,
  discount numeric(18,2) not null default 0,
  total numeric(18,2) not null default 0,
  paid_amount numeric(18,2) not null default 0,
  debt_amount numeric(18,2) not null default 0,
  payment_method text not null,
  cash_account_id uuid,
  status text not null check (status in ('draft','confirmed','cancelled')),
  cogs numeric(18,2) not null default 0,
  gross_profit numeric(18,2) not null default 0,
  net_profit numeric(18,2) not null default 0,
  notes text,
  idempotency_key text not null unique,
  device_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales(id) on delete cascade,
  product_id uuid not null references public.products(id),
  warehouse_id uuid not null references public.warehouses(id),
  quantity numeric(18,4) not null,
  price numeric(18,4) not null,
  cost_price numeric(18,4) not null,
  discount numeric(18,4) not null default 0,
  total numeric(18,2) not null,
  profit numeric(18,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================
-- Purchases
-- =============================================================
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  purchase_number text not null unique default public.generate_code('PUR'),
  supplier_id uuid not null references public.suppliers(id),
  employee_id uuid not null references public.users(id),
  warehouse_id uuid not null references public.warehouses(id),
  total numeric(18,2) not null default 0,
  paid_amount numeric(18,2) not null default 0,
  debt_amount numeric(18,2) not null default 0,
  payment_method text not null,
  cash_account_id uuid,
  status text not null check (status in ('draft','confirmed','cancelled')),
  notes text,
  idempotency_key text not null unique,
  device_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.purchase_items (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references public.purchases(id) on delete cascade,
  product_id uuid not null references public.products(id),
  warehouse_id uuid not null references public.warehouses(id),
  quantity numeric(18,4) not null,
  price numeric(18,4) not null,
  total numeric(18,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================
-- Payments and cash
-- =============================================================
create table if not exists public.cash_accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('cash','bank','other')),
  balance numeric(18,2) not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('customer','supplier')),
  customer_id uuid references public.customers(id),
  supplier_id uuid references public.suppliers(id),
  amount numeric(18,2) not null,
  method text not null,
  direction text not null check (direction in ('income','expense')),
  cash_account_id uuid not null references public.cash_accounts(id),
  employee_id uuid not null references public.users(id),
  reference_id uuid,
  reference_type text,
  comment text,
  cancelled boolean not null default false,
  cancelled_at timestamptz,
  cancelled_by uuid references public.users(id),
  idempotency_key text not null unique,
  device_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cash_transactions (
  id uuid primary key default gen_random_uuid(),
  cash_account_id uuid not null references public.cash_accounts(id),
  type text not null check (type in ('income','expense')),
  amount numeric(18,2) not null,
  employee_id uuid not null references public.users(id),
  source text,
  reference_id uuid,
  reference_type text,
  comment text,
  idempotency_key text not null unique,
  device_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================
-- Expenses
-- =============================================================
create table if not exists public.expense_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.expense_categories(id),
  amount numeric(18,2) not null,
  cash_account_id uuid not null references public.cash_accounts(id),
  employee_id uuid not null references public.users(id),
  comment text,
  idempotency_key text not null unique,
  device_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================
-- Orders and delivery
-- =============================================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default public.generate_code('ORD'),
  customer_id uuid not null references public.customers(id),
  employee_id uuid not null references public.users(id),
  total numeric(18,2) not null default 0,
  delivery_address text,
  status text not null check (status in ('new','confirmed','preparing','delivering','delivered','cancelled')),
  comment text,
  idempotency_key text not null unique,
  device_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity numeric(18,4) not null,
  price numeric(18,4) not null,
  total numeric(18,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.deliveries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  courier_id uuid not null references public.users(id),
  customer_id uuid not null references public.customers(id),
  delivery_address text not null,
  amount numeric(18,2) not null,
  payment_status text not null check (payment_status in ('pending','paid')),
  status text not null check (status in ('ready','on_way','delivered','not_received','cancelled')),
  comment text,
  idempotency_key text not null unique,
  device_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================
-- Sync and conflict
-- =============================================================
create table if not exists public.sync_queue (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  user_id uuid not null references public.users(id),
  operation_type text not null,
  entity text not null,
  entity_id uuid not null,
  payload jsonb not null,
  sync_status text not null check (sync_status in ('pending','syncing','synced','failed','conflict')),
  idempotency_key text not null unique,
  error text,
  retry_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  synced_at timestamptz
);

create index if not exists idx_sync_queue_status on public.sync_queue(sync_status, created_at);

create table if not exists public.sync_conflicts (
  id uuid primary key default gen_random_uuid(),
  entity text not null,
  entity_id uuid not null,
  operation_a_id uuid not null references public.sync_queue(id),
  operation_b_id uuid not null references public.sync_queue(id),
  resolved boolean not null default false,
  resolved_by uuid references public.users(id),
  resolution text check (resolution in ('a','b')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

-- =============================================================
-- Notifications and audit
-- =============================================================
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id),
  type text not null check (type in ('low_stock','overdue_debt','large_debt','sync_error','conflict','new_order','new_payment')),
  title text not null,
  message text not null,
  read boolean not null default false,
  reference_id uuid,
  reference_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id),
  action text not null,
  entity text not null,
  entity_id uuid,
  old_value jsonb,
  new_value jsonb,
  device_id text,
  ip_address inet,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_audit_logs_created on public.audit_logs(created_at desc);
create index if not exists idx_audit_logs_user on public.audit_logs(user_id);

-- =============================================================
-- Triggers for updated_at
-- =============================================================
do $$
declare
  r record;
begin
  for r in (
    select table_name
    from information_schema.columns
    where table_schema = 'public'
      and column_name = 'updated_at'
  )
  loop
    execute format('drop trigger if exists trg_%I_set_updated_at on public.%I;', r.table_name, r.table_name);
    execute format('create trigger trg_%I_set_updated_at before update on public.%I for each row execute function public.set_updated_at();', r.table_name, r.table_name);
  end loop;
end $$;

-- =============================================================
-- Core permission functions
-- =============================================================
create or replace function public.get_current_user_permissions(p_user_id uuid)
returns table(permission_code text)
language sql
stable
as $$
  select distinct p.code
  from public.permissions p
  join public.role_permissions rp on rp.permission_id = p.id
  join public.user_roles ur on ur.role_id = rp.role_id
  where ur.user_id = p_user_id

  union

  select p.code
  from public.permissions p
  join public.user_permissions up on up.permission_id = p.id
  where up.user_id = p_user_id and up.allowed = true;
$$;

create or replace function public.has_permission(p_user_id uuid, p_permission text)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.get_current_user_permissions(p_user_id) gp
    where gp.permission_code = p_permission
  );
$$;

-- =============================================================
-- Prevent negative stock by default
-- =============================================================
create or replace function public.ensure_non_negative_stock()
returns trigger
language plpgsql
as $$
declare
  allow_negative boolean;
begin
  select offline_negative_stock_allowed into allow_negative from public.settings limit 1;

  if coalesce(allow_negative, false) = false and new.quantity < 0 then
    raise exception 'Омборда манфий қолдиқ мумкин эмас';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_warehouse_stock_non_negative on public.warehouse_stock;
create trigger trg_warehouse_stock_non_negative
before insert or update on public.warehouse_stock
for each row execute function public.ensure_non_negative_stock();
