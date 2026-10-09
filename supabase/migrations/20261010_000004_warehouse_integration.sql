-- AKBEL warehouse integration: preserve legacy customer fields and stable external identity.
-- Additive and reversible: existing customer records and transactions are not rewritten.
alter table public.customers
  add column if not exists phones text[] not null default '{}',
  add column if not exists telegram_ids text[] not null default '{}',
  add column if not exists location text,
  add column if not exists payment_categories text[] not null default '{}',
  add column if not exists cash_price_per_kg numeric(18,2),
  add column if not exists transfer_price_per_kg numeric(18,2),
  add column if not exists seller_balance_visible boolean not null default true,
  add column if not exists warehouse_external_id text,
  add column if not exists external_source text,
  add column if not exists external_updated_at timestamptz,
  add column if not exists last_synced_at timestamptz,
  add column if not exists sync_status text not null default 'local',
  add column if not exists sync_error text;

alter table public.customers
  drop constraint if exists customers_payment_categories_check;
alter table public.customers
  add constraint customers_payment_categories_check
  check (payment_categories <@ array['cash','transfer']::text[]);

alter table public.customers
  drop constraint if exists customers_sync_status_check;
alter table public.customers
  add constraint customers_sync_status_check
  check (sync_status in ('local','pending','synced','conflict','failed'));

create unique index if not exists idx_customers_warehouse_external_id
  on public.customers(warehouse_external_id)
  where warehouse_external_id is not null;
create index if not exists idx_customers_payment_categories
  on public.customers using gin(payment_categories);

-- Idempotent references allow a later importer to reconcile legacy events without duplicates.
alter table public.customer_transactions
  add column if not exists warehouse_external_id text,
  add column if not exists external_source text,
  add column if not exists metadata jsonb not null default '{}'::jsonb;
create unique index if not exists idx_customer_transactions_warehouse_external_id
  on public.customer_transactions(warehouse_external_id)
  where warehouse_external_id is not null;

alter table public.sales
  add column if not exists warehouse_external_id text,
  add column if not exists external_source text,
  add column if not exists legacy_metadata jsonb not null default '{}'::jsonb;
create unique index if not exists idx_sales_warehouse_external_id
  on public.sales(warehouse_external_id)
  where warehouse_external_id is not null;

alter table public.payments
  add column if not exists warehouse_external_id text,
  add column if not exists external_source text,
  add column if not exists legacy_metadata jsonb not null default '{}'::jsonb;
create unique index if not exists idx_payments_warehouse_external_id
  on public.payments(warehouse_external_id)
  where warehouse_external_id is not null;
