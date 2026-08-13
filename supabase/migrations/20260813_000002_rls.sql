-- AKBEL CRM RLS policies

alter table public.users enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_roles enable row level security;
alter table public.user_permissions enable row level security;

alter table public.devices enable row level security;
alter table public.settings enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.suppliers enable row level security;
alter table public.warehouses enable row level security;
alter table public.warehouse_stock enable row level security;
alter table public.stock_transactions enable row level security;
alter table public.customers enable row level security;
alter table public.customer_transactions enable row level security;
alter table public.supplier_transactions enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.purchases enable row level security;
alter table public.purchase_items enable row level security;
alter table public.payments enable row level security;
alter table public.cash_accounts enable row level security;
alter table public.cash_transactions enable row level security;
alter table public.expense_categories enable row level security;
alter table public.expenses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.deliveries enable row level security;
alter table public.sync_queue enable row level security;
alter table public.sync_conflicts enable row level security;
alter table public.audit_logs enable row level security;
alter table public.notifications enable row level security;

create policy "users_self_read"
on public.users
for select
to authenticated
using (id = auth.uid());

create policy "users_admin_manage"
on public.users
for all
to authenticated
using (public.has_permission(auth.uid(), 'employees.edit'))
with check (public.has_permission(auth.uid(), 'employees.edit'));

-- Generic read policies by module permission
create policy "products_view"
on public.products
for select
to authenticated
using (public.has_permission(auth.uid(), 'products.view'));

create policy "products_manage"
on public.products
for all
to authenticated
using (public.has_permission(auth.uid(), 'products.edit'))
with check (public.has_permission(auth.uid(), 'products.edit'));

create policy "warehouses_view"
on public.warehouses
for select
to authenticated
using (public.has_permission(auth.uid(), 'warehouse.view'));

create policy "warehouses_manage"
on public.warehouses
for all
to authenticated
using (public.has_permission(auth.uid(), 'warehouse.transfer'))
with check (public.has_permission(auth.uid(), 'warehouse.transfer'));

create policy "customers_view"
on public.customers
for select
to authenticated
using (public.has_permission(auth.uid(), 'customers.view'));

create policy "customers_manage"
on public.customers
for all
to authenticated
using (public.has_permission(auth.uid(), 'customers.edit'))
with check (public.has_permission(auth.uid(), 'customers.edit'));

create policy "suppliers_view"
on public.suppliers
for select
to authenticated
using (public.has_permission(auth.uid(), 'suppliers.view'));

create policy "suppliers_manage"
on public.suppliers
for all
to authenticated
using (public.has_permission(auth.uid(), 'suppliers.edit'))
with check (public.has_permission(auth.uid(), 'suppliers.edit'));

create policy "sales_view"
on public.sales
for select
to authenticated
using (public.has_permission(auth.uid(), 'sales.view'));

create policy "sales_manage"
on public.sales
for all
to authenticated
using (public.has_permission(auth.uid(), 'sales.create'))
with check (public.has_permission(auth.uid(), 'sales.create'));

create policy "payments_view"
on public.payments
for select
to authenticated
using (public.has_permission(auth.uid(), 'payments.view'));

create policy "payments_manage"
on public.payments
for all
to authenticated
using (public.has_permission(auth.uid(), 'payments.create'))
with check (public.has_permission(auth.uid(), 'payments.create'));

create policy "expenses_view"
on public.expenses
for select
to authenticated
using (public.has_permission(auth.uid(), 'expenses.view'));

create policy "expenses_manage"
on public.expenses
for all
to authenticated
using (public.has_permission(auth.uid(), 'expenses.create'))
with check (public.has_permission(auth.uid(), 'expenses.create'));

create policy "orders_view"
on public.orders
for select
to authenticated
using (public.has_permission(auth.uid(), 'orders.view'));

create policy "orders_manage"
on public.orders
for all
to authenticated
using (public.has_permission(auth.uid(), 'orders.edit'))
with check (public.has_permission(auth.uid(), 'orders.edit'));

create policy "deliveries_view"
on public.deliveries
for select
to authenticated
using (public.has_permission(auth.uid(), 'delivery.view'));

create policy "deliveries_manage"
on public.deliveries
for all
to authenticated
using (public.has_permission(auth.uid(), 'delivery.manage'))
with check (public.has_permission(auth.uid(), 'delivery.manage'));

create policy "sync_queue_owner"
on public.sync_queue
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "notifications_owner"
on public.notifications
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "audit_logs_view"
on public.audit_logs
for select
to authenticated
using (public.has_permission(auth.uid(), 'audit.view'));

create policy "audit_logs_insert"
on public.audit_logs
for insert
to authenticated
with check (auth.uid() is not null);
