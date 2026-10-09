import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth";
import { isServerOnlyMode } from "@/lib/runtime-mode";
import { fail, ok } from "@/lib/response";

const customerSchema = z.object({
  company_name: z.string().trim().min(2).max(200),
  contact_person: z.string().trim().max(200).nullable().optional(),
  phone: z.string().trim().min(3).max(80).optional(),
  phones: z.array(z.string().trim().min(3).max(80)).max(20).optional(),
  telegram: z.string().trim().max(100).nullable().optional(),
  telegram_ids: z.array(z.string().trim().max(100)).max(20).optional(),
  address: z.string().trim().max(500).nullable().optional(),
  location: z.string().trim().max(1000).nullable().optional(),
  payment_categories: z.array(z.enum(["cash", "transfer"])).max(2).default([]),
  cash_price_per_kg: z.number().positive().nullable().optional(),
  transfer_price_per_kg: z.number().positive().nullable().optional(),
  seller_balance_visible: z.boolean().default(true),
  responsible_manager_id: z.string().uuid().nullable().optional(),
  credit_limit: z.number().nonnegative().default(0),
  notes: z.string().trim().max(5000).nullable().optional(),
  active: z.boolean().default(true),
  warehouse_external_id: z.string().trim().max(100).nullable().optional(),
}).refine((value) => Boolean(value.phone || value.phones?.length), {
  message: "Камида битта телефон рақамини киритинг.",
  path: ["phones"],
});

function normalizeCustomer(input: z.infer<typeof customerSchema>) {
  const phones = [...new Set((input.phones?.length ? input.phones : input.phone ? [input.phone] : []).map((v) => v.trim()).filter(Boolean))];
  const telegramIds = [...new Set((input.telegram_ids ?? (input.telegram ? [input.telegram] : [])).map((v) => v.trim()).filter(Boolean))];
  return {
    ...input,
    phone: phones[0] ?? input.phone ?? "",
    phones,
    telegram: telegramIds[0] ?? null,
    telegram_ids: telegramIds,
    location: input.location ?? null,
    address: input.address ?? null,
    contact_person: input.contact_person ?? null,
    external_source: input.warehouse_external_id ? "syr-akbel-warehouse" : null,
    sync_status: input.warehouse_external_id ? "pending" : "local",
    sync_error: null,
  };
}

export async function GET(request: Request) {
  if (isServerOnlyMode()) return ok([]);
  try {
    await requirePermission("customers.view");
    const supabase = await createClient();
    const url = new URL(request.url);
    const query = url.searchParams.get("q")?.trim();
    const category = url.searchParams.get("category");
    let requestQuery = supabase
      .from("customers")
      .select("id,company_name,contact_person,phone,phones,telegram,telegram_ids,address,location,payment_categories,cash_price_per_kg,transfer_price_per_kg,seller_balance_visible,responsible_manager_id,credit_limit,current_debt,total_purchase,last_purchase_at,notes,active,warehouse_external_id,external_source,last_synced_at,sync_status,sync_error,created_at,updated_at")
      .is("deleted_at", null)
      .order("company_name", { ascending: true })
      .limit(500);
    if (query) requestQuery = requestQuery.or(`company_name.ilike.%${query}%,contact_person.ilike.%${query}%,phone.ilike.%${query}%`);
    if (category === "cash" || category === "transfer") requestQuery = requestQuery.contains("payment_categories", [category]);
    const { data, error } = await requestQuery;
    if (error) return fail(error.message, 400);
    return ok(data ?? []);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Рухсат йўқ", 403);
  }
}

export async function POST(request: Request) {
  if (isServerOnlyMode()) return fail("Database уланмаган: мижоз сақланмади.", 503);
  try {
    const user = await requirePermission("customers.edit");
    const body = await request.json();
    const parsed = customerSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Мижоз маълумотлари нотўғри.", 422);
    const supabase = await createClient();
    const { data, error } = await supabase.from("customers").insert(normalizeCustomer(parsed.data)).select("*").single();
    if (error) return fail(error.message, error.code === "23505" ? 409 : 400);
    await supabase.from("audit_logs").insert({
      user_id: user.id, action: "create", entity: "customers", entity_id: data.id,
      old_value: null, new_value: data,
    } as never);
    return ok(data, { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Мижоз сақланмади.", 403);
  }
}
