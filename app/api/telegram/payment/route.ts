import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { fail, ok } from "@/lib/response";
import { validateTelegramApiKey } from "@/lib/telegram-auth";

const paymentSchema = z.object({
  entity_type: z.enum(["customer", "supplier"]),
  customer_id: z.string().uuid().nullable().optional(),
  supplier_id: z.string().uuid().nullable().optional(),
  amount: z.number().positive(),
  method: z.enum(["Нақд", "Карта", "Банк", "Click", "Payme", "Бошқа"]),
  direction: z.enum(["income", "expense"]),
  cash_account_id: z.string().uuid(),
  employee_id: z.string().uuid(),
  comment: z.string().optional(),
  idempotency_key: z.string().min(8),
});

export async function POST(request: Request) {
  if (!validateTelegramApiKey(request)) {
    return fail("Unauthorized", 401);
  }

  const body = await request.json();
  const parsed = paymentSchema.safeParse(body);
  if (!parsed.success) return fail("Bad request", 422);

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("payments")
    .insert({
      ...parsed.data,
      customer_id: parsed.data.customer_id ?? null,
      supplier_id: parsed.data.supplier_id ?? null,
    })
    .select("*")
    .single();

  if (error) return fail(error.message, 400);
  return ok(data, { status: 201 });
}
