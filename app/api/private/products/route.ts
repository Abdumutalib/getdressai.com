import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth";
import { fail, ok } from "@/lib/response";
import { isServerOnlyMode } from "@/lib/runtime-mode";

const productSchema = z.object({
  sku: z.string().min(1),
  barcode: z.string().nullable().optional(),
  name: z.string().min(2),
  category_id: z.string().uuid().nullable().optional(),
  unit: z.enum(["кг", "дона", "қути", "литр", "метр"]),
  purchase_price: z.number().nonnegative(),
  retail_price: z.number().nonnegative(),
  wholesale_price: z.number().nonnegative(),
  minimum_price: z.number().nonnegative(),
  minimum_stock: z.number().nonnegative(),
  supplier_id: z.string().uuid().nullable().optional(),
  active: z.boolean().default(true),
});

export async function GET(request: Request) {
  if (isServerOnlyMode()) {
    return ok([]);
  }

  try {
    await requirePermission("products.view");
    const supabase = await createClient();

    const url = new URL(request.url);
    const q = url.searchParams.get("q");

    let query = supabase.from("products").select("*").is("deleted_at", null).order("created_at", { ascending: false });

    if (q) {
      query = query.or(`name.ilike.%${q}%,sku.ilike.%${q}%,barcode.ilike.%${q}%`);
    }

    const { data, error } = await query.limit(100);

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
    const user = await requirePermission("products.create");
    const supabase = await createClient();

    const body = await request.json();
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      return fail("Киритилган маълумотларда хато бор.", 422);
    }

    const { data, error } = await supabase
      .from("products")
      .insert({
        ...parsed.data,
      })
      .select("*")
      .single();

    if (error) return fail(error.message, 400);

    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "create",
      entity: "products",
      entity_id: data.id,
      old_value: null,
      new_value: data,
    } as never);

    return ok(data, { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Хатолик", 403);
  }
}
