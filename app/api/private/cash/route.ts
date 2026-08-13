import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth";
import { fail, ok } from "@/lib/response";
import { isServerOnlyMode } from "@/lib/runtime-mode";

const cashTransactionSchema = z.object({
  cash_account_id: z.string().uuid(),
  type: z.enum(["income", "expense"]),
  amount: z.number().positive(),
  employee_id: z.string().uuid().optional(),
  source: z.string().nullable().optional(),
  reference_id: z.string().uuid().nullable().optional(),
  reference_type: z.string().nullable().optional(),
  comment: z.string().nullable().optional(),
  idempotency_key: z.string().min(8),
});

export async function GET() {
  if (isServerOnlyMode()) {
    return ok([]);
  }

  try {
    await requirePermission("cash.view");
    const supabase = await createClient();
    const { data, error } = await supabase.from("cash_accounts").select("*").order("created_at", { ascending: false });

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
    const user = await requirePermission("cash.manage");
    const supabase = await createClient();
    const body = await request.json();
    const parsed = cashTransactionSchema.safeParse(body);

    if (!parsed.success) return fail("Киритилган маълумотларда хато бор.", 422);

    const payload = {
      ...parsed.data,
      employee_id: parsed.data.employee_id ?? user.id,
    };

    const { data, error } = await supabase.rpc("register_cash_transaction", {
      p_cash_transaction: payload,
      p_user_id: user.id,
      p_device_id: request.headers.get("x-device-id"),
    });

    if (error) return fail(error.message, 400);

    return ok(data, { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Хатолик", 403);
  }
}
