// ============================================================
// AKBEL CRM — Core Types
// ============================================================

export type UUID = string;

// ── Roles ────────────────────────────────────────────────────
export type UserRole =
  | "super_admin"
  | "director"
  | "manager"
  | "warehouse"
  | "cashier"
  | "courier"
  | "accountant";

// ── Permission actions ─────────────────────────────────────
export type Permission =
  | "products.view"
  | "products.create"
  | "products.edit"
  | "products.delete"
  | "warehouse.view"
  | "warehouse.income"
  | "warehouse.expense"
  | "warehouse.transfer"
  | "sales.view"
  | "sales.create"
  | "sales.cancel"
  | "purchases.view"
  | "purchases.create"
  | "purchases.cancel"
  | "customers.view"
  | "customers.create"
  | "customers.edit"
  | "suppliers.view"
  | "suppliers.create"
  | "suppliers.edit"
  | "payments.view"
  | "payments.create"
  | "payments.cancel"
  | "cash.view"
  | "cash.manage"
  | "expenses.view"
  | "expenses.create"
  | "reports.view"
  | "employees.view"
  | "employees.create"
  | "employees.edit"
  | "orders.view"
  | "orders.create"
  | "orders.edit"
  | "delivery.view"
  | "delivery.manage"
  | "settings.manage"
  | "audit.view"
  | "sync.manage";

// ── User ─────────────────────────────────────────────────────
export interface User {
  id: UUID;
  full_name: string;
  phone: string | null;
  email: string | null;
  username: string;
  role: UserRole;
  active: boolean;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  permissions?: Permission[];
}

// ── Product ───────────────────────────────────────────────────
export type UnitType = "кг" | "дона" | "қути" | "литр" | "метр";

export interface Category {
  id: UUID;
  name: string;
  created_at: string;
}

export interface Product {
  id: UUID;
  sku: string;
  barcode: string | null;
  name: string;
  category_id: UUID | null;
  category?: Category;
  unit: UnitType;
  purchase_price: number;
  retail_price: number;
  wholesale_price: number;
  minimum_price: number;
  minimum_stock: number;
  supplier_id: UUID | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ProductStock {
  product_id: UUID;
  warehouse_id: UUID;
  warehouse_name: string;
  quantity: number;
}

// ── Warehouse ─────────────────────────────────────────────────
export interface Warehouse {
  id: UUID;
  name: string;
  address: string | null;
  responsible_employee_id: UUID | null;
  responsible_employee?: Pick<User, "id" | "full_name">;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type StockTransactionType =
  | "income"
  | "sale"
  | "expense"
  | "return"
  | "transfer_in"
  | "transfer_out"
  | "inventory"
  | "adjustment";

export interface StockTransaction {
  id: UUID;
  product_id: UUID;
  product?: Pick<Product, "id" | "name" | "unit">;
  warehouse_id: UUID;
  warehouse?: Pick<Warehouse, "id" | "name">;
  type: StockTransactionType;
  quantity: number;
  price: number;
  reference_id: UUID | null;
  reference_type: string | null;
  reason: string | null;
  employee_id: UUID;
  employee?: Pick<User, "id" | "full_name">;
  created_at: string;
}

// ── Customer ──────────────────────────────────────────────────
export interface Customer {
  id: UUID;
  company_name: string;
  contact_person: string | null;
  phone: string;
  telegram: string | null;
  address: string | null;
  responsible_manager_id: UUID | null;
  responsible_manager?: Pick<User, "id" | "full_name">;
  credit_limit: number;
  current_debt: number;
  total_purchase: number;
  last_purchase_at: string | null;
  notes: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// ── Supplier ──────────────────────────────────────────────────
export interface Supplier {
  id: UUID;
  company_name: string;
  contact_person: string | null;
  phone: string;
  address: string | null;
  current_debt: number;
  total_purchase: number;
  notes: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// ── Sale ─────────────────────────────────────────────────────
export type SaleStatus = "draft" | "confirmed" | "cancelled";
export type PaymentMethod =
  | "Нақд"
  | "Карта"
  | "Банк"
  | "Click"
  | "Payme"
  | "Бошқа";

export interface SaleItem {
  id: UUID;
  sale_id: UUID;
  product_id: UUID;
  product?: Pick<Product, "id" | "name" | "unit">;
  warehouse_id: UUID;
  quantity: number;
  price: number;
  cost_price: number;
  discount: number;
  total: number;
  profit: number;
}

export interface Sale {
  id: UUID;
  invoice_number: string;
  customer_id: UUID | null;
  customer?: Pick<Customer, "id" | "company_name" | "phone">;
  employee_id: UUID;
  employee?: Pick<User, "id" | "full_name">;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  paid_amount: number;
  debt_amount: number;
  payment_method: PaymentMethod;
  cash_account_id: UUID | null;
  status: SaleStatus;
  notes: string | null;
  cogs: number;
  gross_profit: number;
  idempotency_key: string;
  created_at: string;
  updated_at: string;
}

// ── Purchase ──────────────────────────────────────────────────
export type PurchaseStatus = "draft" | "confirmed" | "cancelled";

export interface PurchaseItem {
  id: UUID;
  purchase_id: UUID;
  product_id: UUID;
  product?: Pick<Product, "id" | "name" | "unit">;
  warehouse_id: UUID;
  quantity: number;
  price: number;
  total: number;
}

export interface Purchase {
  id: UUID;
  supplier_id: UUID;
  supplier?: Pick<Supplier, "id" | "company_name">;
  employee_id: UUID;
  employee?: Pick<User, "id" | "full_name">;
  items: PurchaseItem[];
  total: number;
  paid_amount: number;
  debt_amount: number;
  payment_method: PaymentMethod;
  cash_account_id: UUID | null;
  status: PurchaseStatus;
  notes: string | null;
  idempotency_key: string;
  created_at: string;
  updated_at: string;
}

// ── Payment ───────────────────────────────────────────────────
export type PaymentDirection = "income" | "expense";
export type PaymentEntityType = "customer" | "supplier";

export interface Payment {
  id: UUID;
  entity_type: PaymentEntityType;
  customer_id: UUID | null;
  customer?: Pick<Customer, "id" | "company_name">;
  supplier_id: UUID | null;
  supplier?: Pick<Supplier, "id" | "company_name">;
  amount: number;
  method: PaymentMethod;
  cash_account_id: UUID;
  direction: PaymentDirection;
  employee_id: UUID;
  employee?: Pick<User, "id" | "full_name">;
  reference_id: UUID | null;
  reference_type: string | null;
  comment: string | null;
  cancelled: boolean;
  cancelled_at: string | null;
  cancelled_by: UUID | null;
  idempotency_key: string;
  created_at: string;
}

// ── Cash Account ──────────────────────────────────────────────
export interface CashAccount {
  id: UUID;
  name: string;
  type: "cash" | "bank" | "other";
  balance: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CashTransaction {
  id: UUID;
  cash_account_id: UUID;
  cash_account?: Pick<CashAccount, "id" | "name">;
  type: "income" | "expense";
  amount: number;
  employee_id: UUID;
  employee?: Pick<User, "id" | "full_name">;
  source: string | null;
  reference_id: UUID | null;
  reference_type: string | null;
  comment: string | null;
  idempotency_key: string;
  created_at: string;
}

// ── Expense ───────────────────────────────────────────────────
export interface ExpenseCategory {
  id: UUID;
  name: string;
  created_at: string;
}

export interface Expense {
  id: UUID;
  category_id: UUID;
  category?: Pick<ExpenseCategory, "id" | "name">;
  amount: number;
  cash_account_id: UUID;
  cash_account?: Pick<CashAccount, "id" | "name">;
  employee_id: UUID;
  employee?: Pick<User, "id" | "full_name">;
  comment: string | null;
  idempotency_key: string;
  created_at: string;
}

// ── Order ─────────────────────────────────────────────────────
export type OrderStatus =
  | "new"
  | "confirmed"
  | "preparing"
  | "delivering"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  id: UUID;
  order_id: UUID;
  product_id: UUID;
  product?: Pick<Product, "id" | "name" | "unit">;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  id: UUID;
  order_number: string;
  customer_id: UUID;
  customer?: Pick<Customer, "id" | "company_name" | "phone" | "address">;
  employee_id: UUID;
  employee?: Pick<User, "id" | "full_name">;
  items: OrderItem[];
  total: number;
  delivery_address: string | null;
  status: OrderStatus;
  comment: string | null;
  idempotency_key: string;
  created_at: string;
  updated_at: string;
}

// ── Delivery ──────────────────────────────────────────────────
export type DeliveryStatus =
  | "ready"
  | "on_way"
  | "delivered"
  | "not_received"
  | "cancelled";

export interface Delivery {
  id: UUID;
  order_id: UUID;
  order?: Pick<Order, "id" | "order_number" | "total">;
  courier_id: UUID;
  courier?: Pick<User, "id" | "full_name">;
  customer_id: UUID;
  customer?: Pick<Customer, "id" | "company_name" | "phone" | "address">;
  delivery_address: string;
  amount: number;
  payment_status: "pending" | "paid";
  status: DeliveryStatus;
  comment: string | null;
  idempotency_key: string;
  created_at: string;
  updated_at: string;
}

// ── Audit Log ─────────────────────────────────────────────────
export interface AuditLog {
  id: UUID;
  user_id: UUID;
  user?: Pick<User, "id" | "full_name">;
  action: string;
  entity: string;
  entity_id: UUID | null;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  device_id: string | null;
  ip_address: string | null;
  created_at: string;
}

// ── Sync ──────────────────────────────────────────────────────
export type SyncStatus =
  | "pending"
  | "syncing"
  | "synced"
  | "failed"
  | "conflict";

export interface SyncOperation {
  id: UUID;
  device_id: string;
  user_id: UUID;
  timestamp: string;
  operation_type: string;
  entity: string;
  entity_id: UUID;
  payload: Record<string, unknown>;
  sync_status: SyncStatus;
  idempotency_key: string;
  error: string | null;
  retry_count: number;
  created_at: string;
  synced_at: string | null;
}

export interface SyncConflict {
  id: UUID;
  entity: string;
  entity_id: UUID;
  operation_a: SyncOperation;
  operation_b: SyncOperation;
  resolved: boolean;
  resolved_by: UUID | null;
  resolution: "a" | "b" | null;
  created_at: string;
  resolved_at: string | null;
}

// ── Notification ──────────────────────────────────────────────
export type NotificationType =
  | "low_stock"
  | "overdue_debt"
  | "large_debt"
  | "sync_error"
  | "conflict"
  | "new_order"
  | "new_payment";

export interface AppNotification {
  id: UUID;
  user_id: UUID;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  reference_id: UUID | null;
  reference_type: string | null;
  created_at: string;
}

// ── Device ────────────────────────────────────────────────────
export interface Device {
  id: string;
  user_id: UUID;
  user?: Pick<User, "id" | "full_name">;
  name: string;
  app_version: string;
  last_active: string;
  last_sync: string | null;
  active: boolean;
  created_at: string;
}

// ── Stock Expense Reason ───────────────────────────────────────
export type StockExpenseReason =
  | "ишлаб чиқариш"
  | "бузилган"
  | "реклама"
  | "ички фойдаланиш"
  | "бошқа";

// ── API Response Wrapper ──────────────────────────────────────
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ── Filter/Query types ─────────────────────────────────────────
export interface DateRange {
  from: string;
  to: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
}
