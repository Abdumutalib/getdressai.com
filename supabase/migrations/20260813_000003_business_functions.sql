-- =============================================================
-- AKBEL CRM business RPC functions
-- Atomic operations for purchase, sale, payment, cash sale, and expense.
-- =============================================================

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.ensure_stock_row(p_warehouse_id uuid, p_product_id uuid)
returns void
language plpgsql
as $$
begin
  insert into public.warehouse_stock (warehouse_id, product_id, quantity, avg_cost)
  values (p_warehouse_id, p_product_id, 0, 0)
  on conflict (warehouse_id, product_id) do nothing;
end;
$$;

create or replace function public.record_audit_log(
  p_user_id uuid,
  p_action text,
  p_entity text,
  p_entity_id uuid,
  p_old_value jsonb,
  p_new_value jsonb,
  p_device_id text default null,
  p_ip_address inet default null
)
returns void
language plpgsql
as $$
begin
  insert into public.audit_logs (
    user_id, action, entity, entity_id, old_value, new_value, device_id, ip_address
  ) values (
    p_user_id, p_action, p_entity, p_entity_id, p_old_value, p_new_value, p_device_id, p_ip_address
  );
end;
$$;

create or replace function public.confirm_purchase(
  p_purchase jsonb,
  p_items jsonb,
  p_user_id uuid,
  p_device_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_purchase_id uuid;
  v_total numeric(18,2) := 0;
  v_paid_amount numeric(18,2) := 0;
  v_debt_amount numeric(18,2) := 0;
  v_supplier_id uuid;
  v_employee_id uuid;
  v_warehouse_id uuid;
  v_cash_account_id uuid;
  v_idempotency_key text;
  v_status text;
  v_payment_method text;
  v_item jsonb;
  v_product_id uuid;
  v_quantity numeric(18,4);
  v_price numeric(18,4);
  v_line_total numeric(18,2);
  v_old_stock numeric(18,4);
  v_new_stock numeric(18,4);
  v_old_cost numeric(18,4);
  v_new_avg_cost numeric(18,4);
  v_existing numeric(18,4);
  v_supplier_old_debt numeric(18,2);
  v_supplier_old_purchase numeric(18,2);
begin
  v_supplier_id := (p_purchase->>'supplier_id')::uuid;
  v_employee_id := coalesce((p_purchase->>'employee_id')::uuid, p_user_id);
  v_warehouse_id := (p_purchase->>'warehouse_id')::uuid;
  v_cash_account_id := nullif(p_purchase->>'cash_account_id','')::uuid;
  v_idempotency_key := p_purchase->>'idempotency_key';
  v_status := coalesce(p_purchase->>'status', 'confirmed');
  v_payment_method := coalesce(p_purchase->>'payment_method', 'Нақд');
  v_paid_amount := coalesce((p_purchase->>'paid_amount')::numeric, 0);
  v_debt_amount := coalesce((p_purchase->>'debt_amount')::numeric, 0);

  if exists(select 1 from public.purchases where idempotency_key = v_idempotency_key) then
    return jsonb_build_object('duplicate', true);
  end if;

  select coalesce(sum((item->>'quantity')::numeric * (item->>'price')::numeric), 0)
    into v_total
  from jsonb_array_elements(p_items) as item;

  insert into public.purchases (
    supplier_id, employee_id, warehouse_id, total, paid_amount, debt_amount,
    payment_method, cash_account_id, status, notes, idempotency_key, device_id
  ) values (
    v_supplier_id, v_employee_id, v_warehouse_id, v_total, v_paid_amount, v_debt_amount,
    v_payment_method, v_cash_account_id, v_status, p_purchase->>'notes', v_idempotency_key, p_device_id
  ) returning id into v_purchase_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity := (v_item->>'quantity')::numeric;
    v_price := (v_item->>'price')::numeric;
    v_line_total := round(v_quantity * v_price, 2);

    perform public.ensure_stock_row(v_warehouse_id, v_product_id);

    select quantity, avg_cost into v_old_stock, v_old_cost
    from public.warehouse_stock
    where warehouse_id = v_warehouse_id and product_id = v_product_id
    for update;

    v_new_stock := coalesce(v_old_stock, 0) + v_quantity;
    v_new_avg_cost := case
      when coalesce(v_old_stock, 0) + v_quantity = 0 then v_price
      else round(((coalesce(v_old_stock, 0) * coalesce(v_old_cost, 0)) + (v_quantity * v_price)) / (coalesce(v_old_stock, 0) + v_quantity), 4)
    end;

    update public.warehouse_stock
    set quantity = v_new_stock,
        avg_cost = v_new_avg_cost
    where warehouse_id = v_warehouse_id and product_id = v_product_id;

    insert into public.purchase_items (purchase_id, product_id, warehouse_id, quantity, price, total)
    values (v_purchase_id, v_product_id, v_warehouse_id, v_quantity, v_price, v_line_total);

    insert into public.stock_transactions (
      product_id, warehouse_id, type, quantity, price, reference_id, reference_type, reason, employee_id, device_id, idempotency_key
    ) values (
      v_product_id, v_warehouse_id, 'income', v_quantity, v_price, v_purchase_id, 'purchase', null, v_employee_id, p_device_id,
      v_idempotency_key || ':' || v_product_id::text || ':income'
    );
  end loop;

  update public.suppliers
  set total_purchase = total_purchase + v_total,
      current_debt = current_debt + v_debt_amount
  where id = v_supplier_id;

  insert into public.supplier_transactions (
    supplier_id, type, amount, direction, reference_id, reference_type, comment, created_by
  ) values (
    v_supplier_id,
    'purchase',
    v_total,
    'debit',
    v_purchase_id,
    'purchase',
    p_purchase->>'notes',
    v_employee_id
  );

  if v_paid_amount > 0 and v_cash_account_id is not null then
    update public.cash_accounts set balance = balance + v_paid_amount where id = v_cash_account_id;
    insert into public.cash_transactions (
      cash_account_id, type, amount, employee_id, source, reference_id, reference_type, comment, idempotency_key, device_id
    ) values (
      v_cash_account_id, 'income', v_paid_amount, v_employee_id, 'purchase', v_purchase_id, 'purchase', p_purchase->>'notes', v_idempotency_key || ':cash'
    );
  end if;

  perform public.record_audit_log(v_employee_id, 'purchase.confirmed', 'purchases', v_purchase_id, null, p_purchase, p_device_id, null);

  return jsonb_build_object('id', v_purchase_id, 'total', v_total, 'status', v_status, 'duplicate', false);
end;
$$;

create or replace function public.confirm_sale(
  p_sale jsonb,
  p_items jsonb,
  p_user_id uuid,
  p_device_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sale_id uuid;
  v_total numeric(18,2) := 0;
  v_subtotal numeric(18,2) := 0;
  v_discount numeric(18,2) := 0;
  v_paid_amount numeric(18,2) := 0;
  v_debt_amount numeric(18,2) := 0;
  v_cogs numeric(18,2) := 0;
  v_gross_profit numeric(18,2) := 0;
  v_net_profit numeric(18,2) := 0;
  v_customer_id uuid;
  v_employee_id uuid;
  v_warehouse_id uuid;
  v_cash_account_id uuid;
  v_idempotency_key text;
  v_status text;
  v_payment_method text;
  v_item jsonb;
  v_product_id uuid;
  v_quantity numeric(18,4);
  v_price numeric(18,4);
  v_cost_price numeric(18,4);
  v_line_discount numeric(18,4);
  v_line_total numeric(18,2);
  v_line_profit numeric(18,2);
  v_old_stock numeric(18,4);
  v_new_stock numeric(18,4);
  v_allow_negative boolean;
begin
  v_customer_id := nullif(p_sale->>'customer_id','')::uuid;
  v_employee_id := coalesce((p_sale->>'employee_id')::uuid, p_user_id);
  v_warehouse_id := (p_sale->>'warehouse_id')::uuid;
  v_cash_account_id := nullif(p_sale->>'cash_account_id','')::uuid;
  v_idempotency_key := p_sale->>'idempotency_key';
  v_status := coalesce(p_sale->>'status', 'confirmed');
  v_payment_method := coalesce(p_sale->>'payment_method', 'Нақд');
  v_discount := coalesce((p_sale->>'discount')::numeric, 0);
  v_paid_amount := coalesce((p_sale->>'paid_amount')::numeric, 0);
  v_debt_amount := coalesce((p_sale->>'debt_amount')::numeric, 0);

  if exists(select 1 from public.sales where idempotency_key = v_idempotency_key) then
    return jsonb_build_object('duplicate', true);
  end if;

  select coalesce(offline_negative_stock_allowed, false) into v_allow_negative from public.settings limit 1;

  select coalesce(sum((item->>'quantity')::numeric * (item->>'price')::numeric), 0)
    into v_subtotal
  from jsonb_array_elements(p_items) as item;

  v_total := greatest(v_subtotal - v_discount, 0);

  insert into public.sales (
    customer_id, employee_id, warehouse_id, subtotal, discount, total, paid_amount, debt_amount,
    payment_method, cash_account_id, status, cogs, gross_profit, net_profit, notes, idempotency_key, device_id
  ) values (
    v_customer_id, v_employee_id, v_warehouse_id, v_subtotal, v_discount, v_total, v_paid_amount, v_debt_amount,
    v_payment_method, v_cash_account_id, v_status, 0, 0, 0, p_sale->>'notes', v_idempotency_key, p_device_id
  ) returning id into v_sale_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity := (v_item->>'quantity')::numeric;
    v_price := (v_item->>'price')::numeric;
    v_cost_price := coalesce((v_item->>'cost_price')::numeric, v_price);
    v_line_discount := coalesce((v_item->>'discount')::numeric, 0);
    v_line_total := round((v_quantity * v_price) - v_line_discount, 2);
    v_line_profit := round(v_line_total - (v_quantity * v_cost_price), 2);

    perform public.ensure_stock_row(v_warehouse_id, v_product_id);

    select quantity into v_old_stock
    from public.warehouse_stock
    where warehouse_id = v_warehouse_id and product_id = v_product_id
    for update;

    if coalesce(v_old_stock, 0) < v_quantity and coalesce(v_allow_negative, false) = false then
      raise exception 'Омборда етарли товар йўқ';
    end if;

    v_new_stock := coalesce(v_old_stock, 0) - v_quantity;

    update public.warehouse_stock
    set quantity = v_new_stock
    where warehouse_id = v_warehouse_id and product_id = v_product_id;

    insert into public.sale_items (
      sale_id, product_id, warehouse_id, quantity, price, cost_price, discount, total, profit
    ) values (
      v_sale_id, v_product_id, v_warehouse_id, v_quantity, v_price, v_cost_price, v_line_discount, v_line_total, v_line_profit
    );

    insert into public.stock_transactions (
      product_id, warehouse_id, type, quantity, price, reference_id, reference_type, reason, employee_id, device_id, idempotency_key
    ) values (
      v_product_id, v_warehouse_id, 'sale', v_quantity, v_price, v_sale_id, 'sale', null, v_employee_id, p_device_id,
      v_idempotency_key || ':' || v_product_id::text || ':sale'
    );

    v_cogs := v_cogs + (v_quantity * v_cost_price);
    v_gross_profit := v_gross_profit + v_line_profit;
  end loop;

  v_net_profit := v_gross_profit;

  update public.sales
  set cogs = v_cogs,
      gross_profit = v_gross_profit,
      net_profit = v_net_profit
  where id = v_sale_id;

  if v_customer_id is not null then
    update public.customers
    set current_debt = current_debt + v_debt_amount,
        total_purchase = total_purchase + v_total,
        last_purchase_at = now()
    where id = v_customer_id;

    insert into public.customer_transactions (
      customer_id, type, amount, direction, due_date, is_overdue, reference_id, reference_type, comment, created_by
    ) values (
      v_customer_id,
      'sale',
      v_total,
      'debit',
      null,
      false,
      v_sale_id,
      'sale',
      p_sale->>'notes',
      v_employee_id
    );
  end if;

  if v_paid_amount > 0 and v_cash_account_id is not null then
    update public.cash_accounts set balance = balance + v_paid_amount where id = v_cash_account_id;
    insert into public.cash_transactions (
      cash_account_id, type, amount, employee_id, source, reference_id, reference_type, comment, idempotency_key, device_id
    ) values (
      v_cash_account_id, 'income', v_paid_amount, v_employee_id, 'sale', v_sale_id, 'sale', p_sale->>'notes', v_idempotency_key || ':cash'
    );
  end if;

  perform public.record_audit_log(v_employee_id, 'sale.confirmed', 'sales', v_sale_id, null, p_sale, p_device_id, null);

  return jsonb_build_object('id', v_sale_id, 'total', v_total, 'cogs', v_cogs, 'gross_profit', v_gross_profit, 'duplicate', false);
end;
$$;

create or replace function public.register_payment(
  p_payment jsonb,
  p_user_id uuid,
  p_device_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment_id uuid;
  v_amount numeric(18,2);
  v_entity_type text;
  v_customer_id uuid;
  v_supplier_id uuid;
  v_cash_account_id uuid;
  v_employee_id uuid;
  v_direction text;
  v_idempotency_key text;
begin
  v_amount := (p_payment->>'amount')::numeric;
  v_entity_type := p_payment->>'entity_type';
  v_customer_id := nullif(p_payment->>'customer_id','')::uuid;
  v_supplier_id := nullif(p_payment->>'supplier_id','')::uuid;
  v_cash_account_id := (p_payment->>'cash_account_id')::uuid;
  v_employee_id := coalesce((p_payment->>'employee_id')::uuid, p_user_id);
  v_direction := coalesce(p_payment->>'direction', 'income');
  v_idempotency_key := p_payment->>'idempotency_key';

  if exists(select 1 from public.payments where idempotency_key = v_idempotency_key) then
    return jsonb_build_object('duplicate', true);
  end if;

  insert into public.payments (
    entity_type, customer_id, supplier_id, amount, method, direction, cash_account_id, employee_id,
    reference_id, reference_type, comment, cancelled, idempotency_key, device_id
  ) values (
    v_entity_type, v_customer_id, v_supplier_id, v_amount, p_payment->>'method', v_direction, v_cash_account_id, v_employee_id,
    nullif(p_payment->>'reference_id','')::uuid, p_payment->>'reference_type', p_payment->>'comment', false, v_idempotency_key, p_device_id
  ) returning id into v_payment_id;

  if v_direction = 'income' then
    update public.cash_accounts set balance = balance + v_amount where id = v_cash_account_id;
    insert into public.cash_transactions (cash_account_id, type, amount, employee_id, source, reference_id, reference_type, comment, idempotency_key, device_id)
    values (v_cash_account_id, 'income', v_amount, v_employee_id, v_entity_type, v_payment_id, 'payment', p_payment->>'comment', v_idempotency_key || ':cash');
  else
    update public.cash_accounts set balance = balance - v_amount where id = v_cash_account_id;
    insert into public.cash_transactions (cash_account_id, type, amount, employee_id, source, reference_id, reference_type, comment, idempotency_key, device_id)
    values (v_cash_account_id, 'expense', v_amount, v_employee_id, v_entity_type, v_payment_id, 'payment', p_payment->>'comment', v_idempotency_key || ':cash');
  end if;

  if v_entity_type = 'customer' and v_customer_id is not null then
    update public.customers set current_debt = greatest(current_debt - v_amount, 0) where id = v_customer_id;
    insert into public.customer_transactions (customer_id, type, amount, direction, reference_id, reference_type, comment, created_by)
    values (v_customer_id, 'payment', v_amount, 'credit', v_payment_id, 'payment', p_payment->>'comment', v_employee_id);
  end if;

  if v_entity_type = 'supplier' and v_supplier_id is not null then
    update public.suppliers set current_debt = greatest(current_debt - v_amount, 0) where id = v_supplier_id;
    insert into public.supplier_transactions (supplier_id, type, amount, direction, reference_id, reference_type, comment, created_by)
    values (v_supplier_id, 'payment', v_amount, 'credit', v_payment_id, 'payment', p_payment->>'comment', v_employee_id);
  end if;

  perform public.record_audit_log(v_employee_id, 'payment.registered', 'payments', v_payment_id, null, p_payment, p_device_id, null);

  return jsonb_build_object('id', v_payment_id, 'duplicate', false);
end;
$$;

create or replace function public.register_expense(
  p_expense jsonb,
  p_user_id uuid,
  p_device_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_expense_id uuid;
  v_amount numeric(18,2);
  v_cash_account_id uuid;
  v_employee_id uuid;
  v_idempotency_key text;
begin
  v_amount := (p_expense->>'amount')::numeric;
  v_cash_account_id := (p_expense->>'cash_account_id')::uuid;
  v_employee_id := coalesce((p_expense->>'employee_id')::uuid, p_user_id);
  v_idempotency_key := p_expense->>'idempotency_key';

  if exists(select 1 from public.expenses where idempotency_key = v_idempotency_key) then
    return jsonb_build_object('duplicate', true);
  end if;

  insert into public.expenses (category_id, amount, cash_account_id, employee_id, comment, idempotency_key, device_id)
  values (
    (p_expense->>'category_id')::uuid,
    v_amount,
    v_cash_account_id,
    v_employee_id,
    p_expense->>'comment',
    v_idempotency_key,
    p_device_id
  ) returning id into v_expense_id;

  update public.cash_accounts set balance = balance - v_amount where id = v_cash_account_id;

  insert into public.cash_transactions (cash_account_id, type, amount, employee_id, source, reference_id, reference_type, comment, idempotency_key, device_id)
  values (v_cash_account_id, 'expense', v_amount, v_employee_id, 'expense', v_expense_id, 'expense', p_expense->>'comment', v_idempotency_key || ':cash', p_device_id);

  perform public.record_audit_log(v_employee_id, 'expense.created', 'expenses', v_expense_id, null, p_expense, p_device_id, null);

  return jsonb_build_object('id', v_expense_id, 'duplicate', false);
end;
$$;

create or replace function public.register_cash_transaction(
  p_cash_transaction jsonb,
  p_user_id uuid,
  p_device_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cash_transaction_id uuid;
  v_cash_account_id uuid;
  v_amount numeric(18,2);
  v_employee_id uuid;
  v_type text;
  v_idempotency_key text;
begin
  v_cash_account_id := (p_cash_transaction->>'cash_account_id')::uuid;
  v_amount := (p_cash_transaction->>'amount')::numeric;
  v_employee_id := coalesce((p_cash_transaction->>'employee_id')::uuid, p_user_id);
  v_type := p_cash_transaction->>'type';
  v_idempotency_key := p_cash_transaction->>'idempotency_key';

  if exists(select 1 from public.cash_transactions where idempotency_key = v_idempotency_key) then
    return jsonb_build_object('duplicate', true);
  end if;

  insert into public.cash_transactions (
    cash_account_id, type, amount, employee_id, source, reference_id, reference_type, comment, idempotency_key, device_id
  ) values (
    v_cash_account_id,
    v_type,
    v_amount,
    v_employee_id,
    p_cash_transaction->>'source',
    nullif(p_cash_transaction->>'reference_id','')::uuid,
    p_cash_transaction->>'reference_type',
    p_cash_transaction->>'comment',
    v_idempotency_key,
    p_device_id
  ) returning id into v_cash_transaction_id;

  if v_type = 'income' then
    update public.cash_accounts set balance = balance + v_amount where id = v_cash_account_id;
  else
    update public.cash_accounts set balance = balance - v_amount where id = v_cash_account_id;
  end if;

  perform public.record_audit_log(v_employee_id, 'cash.transaction.created', 'cash_transactions', v_cash_transaction_id, null, p_cash_transaction, p_device_id, null);

  return jsonb_build_object('id', v_cash_transaction_id, 'duplicate', false);
end;
$$;

create or replace function public.register_stock_expense(
  p_stock_expense jsonb,
  p_user_id uuid,
  p_device_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_stock_expense_id uuid;
  v_warehouse_id uuid;
  v_product_id uuid;
  v_quantity numeric(18,4);
  v_reason text;
  v_comment text;
  v_idempotency_key text;
  v_employee_id uuid;
  v_old_stock numeric(18,4);
  v_new_stock numeric(18,4);
begin
  v_warehouse_id := (p_stock_expense->>'warehouse_id')::uuid;
  v_product_id := (p_stock_expense->>'product_id')::uuid;
  v_quantity := (p_stock_expense->>'quantity')::numeric;
  v_reason := p_stock_expense->>'reason';
  v_comment := p_stock_expense->>'comment';
  v_idempotency_key := p_stock_expense->>'idempotency_key';
  v_employee_id := coalesce((p_stock_expense->>'employee_id')::uuid, p_user_id);

  if exists(select 1 from public.stock_transactions where idempotency_key = v_idempotency_key) then
    return jsonb_build_object('duplicate', true);
  end if;

  perform public.ensure_stock_row(v_warehouse_id, v_product_id);

  select quantity into v_old_stock
  from public.warehouse_stock
  where warehouse_id = v_warehouse_id and product_id = v_product_id
  for update;

  if coalesce(v_old_stock, 0) < v_quantity then
    raise exception 'Омборда етарли товар йўқ';
  end if;

  v_new_stock := coalesce(v_old_stock, 0) - v_quantity;

  update public.warehouse_stock
  set quantity = v_new_stock
  where warehouse_id = v_warehouse_id and product_id = v_product_id;

  insert into public.stock_transactions (
    product_id, warehouse_id, type, quantity, price, reference_id, reference_type, reason, employee_id, device_id, idempotency_key
  ) values (
    v_product_id, v_warehouse_id, 'expense', v_quantity, 0, null, 'warehouse.expense', v_reason, v_employee_id, p_device_id, v_idempotency_key
  ) returning id into v_stock_expense_id;

  perform public.record_audit_log(v_employee_id, 'warehouse.expense', 'stock_transactions', v_stock_expense_id, null, p_stock_expense, p_device_id, null);

  return jsonb_build_object('id', v_stock_expense_id, 'duplicate', false);
end;
$$;

create or replace function public.register_cash_sale(
  p_sale jsonb,
  p_items jsonb,
  p_user_id uuid,
  p_device_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  p_sale := jsonb_set(p_sale, '{customer_id}', 'null', true);
  p_sale := jsonb_set(p_sale, '{debt_amount}', '0', true);
  v_result := public.confirm_sale(p_sale, p_items, p_user_id, p_device_id);
  return v_result;
end;
$$;
