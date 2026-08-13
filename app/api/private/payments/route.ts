import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth";
import { fail, ok } from "@/lib/response";
import { isServerOnlyMode } from "@/lib/runtime-mode";

const paymentSchema = z.object({
  entity_type: z.enum(["customer", "supplier"]),
  customer_id: z.string().uuid().nullable().optional(),
  supplier_id: z.string().uuid().nullable().optional(),
  amount: z.number().positive(),
  method: z.enum(["Нақд", "Карта", "Банк", "Click", "Payme", "Бошқа"]),
  direction: z.enum(["income", "expense"]).default("income"),
  cash_account_id: z.string().uuid(),
  employee_id: z.string().uuid().optional(),
  comment: z.string().nullable().optional(),
  reference_id: z.string().uuid().nullable().optional(),
  reference_type: z.string().nullable().optional(),
  idempotency_key: z.string().min(8),
});

export async function GET() {
  if (isServerOnlyMode()) {
    return ok([]);
  }

  try {
    await requirePermission("payments.view");
    const supabase = await createClient();
    const { data, error } = await supabase.from("payments").select("*, customer:customers(id, company_name), supplier:suppliers(id, company_name), employee:users(id, full_name)").order("created_at", { ascending: false }).limit(100);

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
    const user = await requirePermission("payments.create");
    const supabase = await createClient();
    const body = await request.json();
    const parsed = paymentSchema.safeParse(body);

    if (!parsed.success) return fail("Киритилган маълумотларда хато бор.", 422);

    const payload = {
      ...parsed.data,
      employee_id: parsed.data.employee_id ?? user.id,
    };

    const { data, error } = await supabase.rpc("register_payment", {
      p_payment: payload,
      p_user_id: user.id,
      p_device_id: request.headers.get("x-device-id"),
    });

    if (error) return fail(error.message, 400);
    return ok(data, { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Хатолик", 403);
  }
}
