import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { fail, ok } from "@/lib/response";
import { validateTelegramApiKey } from "@/lib/telegram-auth";

const customerSchema = z.object({
  company_name: z.string().min(2),
  phone: z.string().min(7),
  contact_person: z.string().optional(),
  address: z.string().optional(),
});

export async function GET(request: Request) {
  if (!validateTelegramApiKey(request)) {
    return fail("Unauthorized", 401);
  }

  const supabase = await createClient();
  const url = new URL(request.url);
  const phone = url.searchParams.get("phone");

  let query = supabase.from("customers").select("id, company_name, phone, current_debt, credit_limit").is("deleted_at", null);
  if (phone) query = query.eq("phone", phone);

  const { data, error } = await query.limit(100);
  if (error) return fail(error.message, 400);
  return ok(data ?? []);
}

export async function POST(request: Request) {
  if (!validateTelegramApiKey(request)) {
    return fail("Unauthorized", 401);
  }

  const body = await request.json();
  const parsed = customerSchema.safeParse(body);
  if (!parsed.success) return fail("Bad request", 422);

  const supabase = await createClient();
  const { data, error } = await supabase.from("customers").insert(parsed.data).select("*").single();

  if (error) return fail(error.message, 400);
  return ok(data, { status: 201 });
}
