import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth";
import { fail, ok } from "@/lib/response";
import { isServerOnlyMode } from "@/lib/runtime-mode";

const warehouseSchema = z.object({
  name: z.string().min(2),
  address: z.string().nullable().optional(),
  responsible_employee_id: z.string().uuid().nullable().optional(),
  active: z.boolean().default(true),
});

export async function GET() {
  if (isServerOnlyMode()) {
    return ok([]);
  }

  try {
    await requirePermission("warehouse.view");
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("warehouses")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

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
    const user = await requirePermission("warehouse.income");
    const supabase = await createClient();

    const body = await request.json();
    const parsed = warehouseSchema.safeParse(body);

    if (!parsed.success) {
      return fail("Киритилган маълумотларда хато бор.", 422);
    }

    const { data, error } = await supabase.from("warehouses").insert(parsed.data).select("*").single();

    if (error) return fail(error.message, 400);

    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "create",
      entity: "warehouses",
      entity_id: data.id,
      old_value: null,
      new_value: data,
    } as never);

    return ok(data, { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Хатолик", 403);
  }
}
