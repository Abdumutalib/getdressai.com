import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth";
import { fail, ok } from "@/lib/response";
import { isServerOnlyMode } from "@/lib/runtime-mode";

const saleItemSchema = z.object({
  product_id: z.string().uuid(),
  warehouse_id: z.string().uuid(),
  quantity: z.number().positive(),
  price: z.number().nonnegative(),
  cost_price: z.number().nonnegative().optional(),
  discount: z.number().nonnegative().default(0),
});

const saleSchema = z.object({
  customer_id: z.string().uuid().nullable().optional(),
  employee_id: z.string().uuid().optional(),
  warehouse_id: z.string().uuid(),
  items: z.array(saleItemSchema).min(1),
  subtotal: z.number().nonnegative().optional(),
  discount: z.number().nonnegative().default(0),
  total: z.number().nonnegative().optional(),
  paid_amount: z.number().nonnegative().default(0),
  debt_amount: z.number().nonnegative().default(0),
  payment_method: z.enum(["Нақд", "Карта", "Банк", "Click", "Payme", "Бошқа"]),
  cash_account_id: z.string().uuid().nullable().optional(),
  notes: z.string().nullable().optional(),
  idempotency_key: z.string().min(8),
  status: z.enum(["draft", "confirmed", "cancelled"]).default("confirmed"),
});

export async function GET() {
  if (isServerOnlyMode()) {
    return ok([]);
  }

  try {
    await requirePermission("sales.view");
    const supabase = await createClient();
    const { data, error } = await supabase.from("sales").select("*, customer:customers(id, company_name, phone), employee:users(id, full_name), items:sale_items(*)").order("created_at", { ascending: false }).limit(100);

    if (error) return fail(error.message, 400);
    return ok(data ?? []);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Хатолик", 403);
  }
}

export async function POST(request: Request) {
  if (isServerOnlyMode()) {
    return fail("Server-only режимда database уланмаган. POST вақтинча ўчирилган.", 503);
  }

  try {
    const user = await requirePermission("sales.create");
    const supabase = await createClient();
    const body = await request.json();
    const parsed = saleSchema.safeParse(body);

    if (!parsed.success) return fail("Киритилган маълумотларда хато бор.", 422);

    const payload = {
      ...parsed.data,
      employee_id: parsed.data.employee_id ?? user.id,
    };

    const { data, error } = await supabase.rpc("confirm_sale", {
      p_sale: {
        customer_id: payload.customer_id,
        employee_id: payload.employee_id,
        warehouse_id: payload.warehouse_id,
        discount: payload.discount,
        paid_amount: payload.paid_amount,
        debt_amount: payload.debt_amount,
        payment_method: payload.payment_method,
        cash_account_id: payload.cash_account_id,
        notes: payload.notes,
        idempotency_key: payload.idempotency_key,
        status: payload.status,
      },
      p_items: payload.items,
      p_user_id: user.id,
      p_device_id: request.headers.get("x-device-id"),
    });

    if (error) return fail(error.message, 400);
    return ok(data, { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Хатолик", 403);
  }
}
