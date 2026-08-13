import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth";
import { fail, ok } from "@/lib/response";
import { isServerOnlyMode } from "@/lib/runtime-mode";

const schema = z.object({
  warehouse_id: z.string().uuid(),
  product_id: z.string().uuid(),
  quantity: z.number().positive(),
  reason: z.enum(["ишлаб чиқариш", "бузилган", "реклама", "ички фойдаланиш", "бошқа"]),
  comment: z.string().nullable().optional(),
  idempotency_key: z.string().min(8),
});

export async function POST(request: Request) {
  if (isServerOnlyMode()) {
    return fail("Server-only режимда database уланмаган. POST вақтинча ўчирилган.", 503);
  }

  try {
    const user = await requirePermission("warehouse.expense");
    const supabase = await createClient();
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) return fail("Киритилган маълумотларда хато бор.", 422);

    const { data, error } = await supabase.rpc("register_stock_expense", {
      p_stock_expense: {
        ...parsed.data,
        employee_id: user.id,
      },
      p_user_id: user.id,
      p_device_id: request.headers.get("x-device-id"),
    });

    if (error) return fail(error.message, 400);
    return ok(data, { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Хатолик", 403);
  }
}
