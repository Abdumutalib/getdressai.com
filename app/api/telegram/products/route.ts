import { createClient } from "@/lib/supabase/server";
import { fail, ok } from "@/lib/response";
import { validateTelegramApiKey } from "@/lib/telegram-auth";

export async function GET(request: Request) {
  if (!validateTelegramApiKey(request)) {
    return fail("Unauthorized", 401);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, sku, barcode, name, unit, retail_price, wholesale_price, active")
    .is("deleted_at", null)
    .eq("active", true)
    .order("name", { ascending: true })
    .limit(500);

  if (error) return fail(error.message, 400);
  return ok(data ?? []);
}
