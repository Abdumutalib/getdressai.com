import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth";
import { fail, ok } from "@/lib/response";
import { isServerOnlyMode } from "@/lib/runtime-mode";

const expenseSchema = z.object({
  category_id: z.string().uuid(),
  amount: z.number().positive(),
  cash_account_id: z.string().uuid(),
  employee_id: z.string().uuid().optional(),
  comment: z.string().nullable().optional(),
  idempotency_key: z.string().min(8),
});

export async function GET() {
  if (isServerOnlyMode()) {
    return ok([]);
  }

  try {
    await requirePermission("expenses.view");
    const supabase = await createClient();
    const { data, error } = await supabase.from("expenses").select("*, category:expense_categories(id, name), employee:users(id, full_name)").order("created_at", { ascending: false }).limit(100);

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
    const user = await requirePermission("expenses.create");
    const supabase = await createClient();
    const body = await request.json();
    const parsed = expenseSchema.safeParse(body);

    if (!parsed.success) return fail("Киритилган маълумотларда хато бор.", 422);

    const payload = {
      ...parsed.data,
      employee_id: parsed.data.employee_id ?? user.id,
    };

    const { data, error } = await supabase.rpc("register_expense", {
      p_expense: payload,
      p_user_id: user.id,
      p_device_id: request.headers.get("x-device-id"),
    });

    if (error) return fail(error.message, 400);
    return ok(data, { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Хатолик", 403);
  }
}
