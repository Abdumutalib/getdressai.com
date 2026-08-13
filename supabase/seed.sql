-- =============================================================
-- AKBEL CRM dev seed data
-- NOTE: Use only in development/staging.
-- =============================================================

insert into public.roles (code, name_uz, description, system_role)
values
  ('super_admin', 'SUPER ADMIN', 'Тўлиқ ҳуқуқ', true),
  ('director', 'DIRECTOR', 'Бизнес ҳисоботлари ва операциялар', true),
  ('manager', 'MANAGER', 'Мижозлар, буюртмалар, сотув', true),
  ('warehouse', 'WAREHOUSE', 'Омбор операциялари', true),
  ('cashier', 'CASHIER', 'Касса ва тўловлар', true),
  ('courier', 'COURIER', 'Етказиб бериш', true),
  ('accountant', 'ACCOUNTANT', 'Молиявий ҳисоботлар', true)
on conflict (code) do nothing;

insert into public.permissions (code, name_uz, module)
values
  ('products.view', 'Товарни кўриш', 'products'),
  ('products.create', 'Товар яратиш', 'products'),
  ('products.edit', 'Товар таҳрирлаш', 'products'),
  ('products.delete', 'Товар ўчириш', 'products'),
  ('warehouse.view', 'Омборни кўриш', 'warehouse'),
  ('warehouse.income', 'Омбор кирими', 'warehouse'),
  ('warehouse.expense', 'Омбор чиқими', 'warehouse'),
  ('warehouse.transfer', 'Омбор кўчириш', 'warehouse'),
  ('sales.view', 'Сотувни кўриш', 'sales'),
  ('sales.create', 'Сотув яратиш', 'sales'),
  ('sales.cancel', 'Сотувни бекор қилиш', 'sales'),
  ('customers.view', 'Мижозни кўриш', 'customers'),
  ('customers.create', 'Мижоз яратиш', 'customers'),
  ('customers.edit', 'Мижоз таҳрирлаш', 'customers'),
  ('suppliers.view', 'Етказиб берувчини кўриш', 'suppliers'),
  ('suppliers.create', 'Етказиб берувчи яратиш', 'suppliers'),
  ('suppliers.edit', 'Етказиб берувчи таҳрирлаш', 'suppliers'),
  ('payments.view', 'Тўловни кўриш', 'payments'),
  ('payments.create', 'Тўлов яратиш', 'payments'),
  ('payments.cancel', 'Тўловни бекор қилиш', 'payments'),
  ('reports.view', 'Ҳисоботларни кўриш', 'reports'),
  ('employees.view', 'Ходимларни кўриш', 'employees'),
  ('employees.create', 'Ходим яратиш', 'employees'),
  ('employees.edit', 'Ходим таҳрирлаш', 'employees'),
  ('orders.view', 'Буюртмаларни кўриш', 'orders'),
  ('orders.create', 'Буюртма яратиш', 'orders'),
  ('orders.edit', 'Буюртма таҳрирлаш', 'orders'),
  ('delivery.view', 'Етказиб беришни кўриш', 'delivery'),
  ('delivery.manage', 'Етказиб бериш бошқаруви', 'delivery'),
  ('settings.manage', 'Созламаларни бошқариш', 'settings'),
  ('audit.view', 'Аудит журналини кўриш', 'audit')
on conflict (code) do nothing;

insert into public.settings (company_name, company_phone, default_currency, currency_symbol, setup_completed)
values ('AKBEL', '+998900000000', 'UZS', 'сўм', true)
on conflict do nothing;

insert into public.cash_accounts (name, type, balance)
values
  ('Асосий касса', 'cash', 0),
  ('Қўшимча касса', 'cash', 0),
  ('Банк', 'bank', 0)
on conflict do nothing;

insert into public.expense_categories (name)
values
  ('транспорт'),
  ('ёқилғи'),
  ('ижара'),
  ('иш ҳақи'),
  ('реклама'),
  ('телефон'),
  ('интернет'),
  ('солиқ'),
  ('бошқа')
on conflict (name) do nothing;

insert into public.categories (name)
values
  ('Умумий'),
  ('Озиқ-овқат'),
  ('Ичимлик'),
  ('Маиший')
on conflict (name) do nothing;

insert into public.warehouses (name, address, active)
values
  ('Марказий омбор', 'Тошкент', true),
  ('Қўшимча омбор', 'Самарқанд', true);

insert into public.suppliers (company_name, contact_person, phone, address, active)
select
  'Supplier ' || gs,
  'Контакт ' || gs,
  '+99890' || lpad((1000000 + gs)::text, 7, '0'),
  'Манзил ' || gs,
  true
from generate_series(1, 5) gs;

insert into public.customers (company_name, contact_person, phone, address, credit_limit, active)
select
  'Customer ' || gs,
  'Масъул ' || gs,
  '+99891' || lpad((1000000 + gs)::text, 7, '0'),
  'Манзил ' || gs,
  5000000,
  true
from generate_series(1, 10) gs;

insert into public.products (
  sku,
  name,
  unit,
  purchase_price,
  retail_price,
  wholesale_price,
  minimum_price,
  minimum_stock,
  active
)
select
  'AKB-' || lpad(gs::text, 4, '0'),
  'Товар ' || gs,
  (array['кг','дона','қути','литр','метр'])[1 + (gs % 5)],
  10000 + gs * 300,
  14000 + gs * 350,
  13000 + gs * 320,
  12000 + gs * 300,
  10,
  true
from generate_series(1, 10) gs;
