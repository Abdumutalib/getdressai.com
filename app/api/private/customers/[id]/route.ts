import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth";
import { isServerOnlyMode } from "@/lib/runtime-mode";
import { fail, ok } from "@/lib/response";

const patchSchema = z.object({
  company_name: z.string().trim().min(2).max(200).optional(),
  contact_person: z.string().trim().max(200).nullable().optional(),
  phone: z.string().trim().min(3).max(80).optional(),
  phones: z.array(z.string().trim().min(3).max(80)).max(20).optional(),
  telegram: z.string().trim().max(100).nullable().optional(),
  telegram_ids: z.array(z.string().trim().max(100)).max(20).optional(),
  address: z.string().trim().max(500).nullable().optional(),
  location: z.string().trim().max(1000).nullable().optional(),
  payment_categories: z.array(z.enum(["cash", "transfer"])).max(2).optional(),
  cash_price_per_kg: z.number().positive().nullable().optional(),
  transfer_price_per_kg: z.number().positive().nullable().optional(),
  seller_balance_visible: z.boolean().optional(),
  responsible_manager_id: z.string().uuid().nullable().optional(),
  credit_limit: z.number().nonnegative().optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
  active: z.boolean().optional(),
  warehouse_external_id: z.string().trim().max(100).nullable().optional(),
});

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (isServerOnlyMode()) return fail("Database уланмаган.", 503);
  try {
    await requirePermission("customers.view");
    const { id } = await context.params;
    const supabase = await createClient();
    const { data, error } = await supabase.from("customers").select("*").eq("id", id).is("deleted_at", null).maybeSingle();
    if (error) return fail(error.message, 400);
    if (!data) return fail("Мижоз топилмади.", 404);
    const [transactions, sales] = await Promise.all([
      supabase.from("customer_transactions").select("*").eq("customer_id", id).order("created_at", { ascending: false }).limit(200),
      supabase.from("sales").select("id,invoice_number,total,paid_amount,debt_amount,status,created_at,warehouse_external_id,legacy_metadata").eq("customer_id", id).order("created_at", { ascending: false }).limit(200),
    ]);
    if (transactions.error) return fail(transactions.error.message, 400);
    if (sales.error) return fail(sales.error.message, 400);
    return ok({ customer: data, transactions: transactions.data ?? [], sales: sales.data ?? [] });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Рухсат йўқ", 403);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (isServerOnlyMode()) return fail("Database уланмаган: ўзгариш сақланмади.", 503);
  try {
    const user = await requirePermission("customers.edit");
    const { id } = await context.params;
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Мижоз маълумотлари нотўғри.", 422);
    const patch = { ...parsed.data, updated_at: new Date().toISOString(), sync_status: "pending", sync_error: null };
    if (patch.phones?.length) patch.phone = patch.phones[0];
    if (patch.telegram_ids) patch.telegram = patch.telegram_ids[0] ?? null;
    if (patch.warehouse_external_id) patch.external_source = "syr-akbel-warehouse";
    const supabase = await createClient();
    const { data: oldData, error: oldError } = await supabase.from("customers").select("*").eq("id", id).is("deleted_at", null).maybeSingle();
    if (oldError) return fail(oldError.message, 400);
    if (!oldData) return fail("Мижоз топилмади.", 404);
    const { data, error } = await supabase.from("customers").update(patch).eq("id", id).select("*").single();
    if (error) return fail(error.message, error.code === "23505" ? 409 : 400);
    await supabase.from("audit_logs").insert({ user_id: user.id, action: "update", entity: "customers", entity_id: id, old_value: oldData, new_value: data } as never);
    return ok(data);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Мижоз янгиланмади.", 403);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (isServerOnlyMode()) return fail("Database уланмаган.", 503);
  try {
    const user = await requirePermission("customers.edit");
    const { id } = await context.params;
    const supabase = await createClient();
    const { data: oldData, error: oldError } = await supabase.from("customers").select("*").eq("id", id).is("deleted_at", null).maybeSingle();
    if (oldError) return fail(oldError.message, 400);
    if (!oldData) return fail("Мижоз топилмади.", 404);
    const { data, error } = await supabase.from("customers").update({ active: false, deleted_at: new Date().toISOString(), sync_status: "pending" }).eq("id", id).select("id,company_name,active,deleted_at").single();
    if (error) return fail(error.message, 400);
    await supabase.from("audit_logs").insert({ user_id: user.id, action: "soft_delete", entity: "customers", entity_id: id, old_value: oldData, new_value: data } as never);
    return ok(data);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Мижоз ўчирилмади.", 403);
  }
}
