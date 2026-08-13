import Dexie, { type EntityTable } from "dexie";
import type {
  Customer,
  Device,
  Expense,
  Order,
  Payment,
  Product,
  Purchase,
  Sale,
  Supplier,
  SyncConflict,
  SyncOperation,
  Warehouse,
} from "@/types";

export type LocalSession = {
  id: string;
  user_id: string;
  access_token_encrypted: string;
  refresh_token_encrypted: string;
  expires_at: number;
};

export class AkbelLocalDB extends Dexie {
  session!: EntityTable<LocalSession, "id">;
  products!: EntityTable<Product, "id">;
  customers!: EntityTable<Customer, "id">;
  suppliers!: EntityTable<Supplier, "id">;
  warehouses!: EntityTable<Warehouse, "id">;
  sales!: EntityTable<Sale, "id">;
  purchases!: EntityTable<Purchase, "id">;
  payments!: EntityTable<Payment, "id">;
  expenses!: EntityTable<Expense, "id">;
  orders!: EntityTable<Order, "id">;
  devices!: EntityTable<Device, "id">;
  sync_conflicts!: EntityTable<SyncConflict, "id">;
  sync_queue!: EntityTable<SyncOperation, "id">;

  constructor() {
    super("akbel_crm_local");

    this.version(1).stores({
      session: "id, user_id, expires_at",
      products: "id, sku, barcode, name, updated_at",
      customers: "id, phone, company_name, updated_at",
      suppliers: "id, phone, company_name, updated_at",
      warehouses: "id, name, updated_at",
      sales: "id, invoice_number, created_at, status",
      purchases: "id, purchase_number, created_at, status",
      payments: "id, created_at, method, direction",
      expenses: "id, created_at, category_id",
      orders: "id, order_number, status, created_at",
      devices: "id, user_id, last_active, last_sync",
      sync_queue: "id, sync_status, created_at, operation_type, entity, entity_id, idempotency_key",
      sync_conflicts: "id, entity, entity_id, resolved, created_at, resolved_by, resolution",
    });
  }
}

export const localDB = new AkbelLocalDB();
