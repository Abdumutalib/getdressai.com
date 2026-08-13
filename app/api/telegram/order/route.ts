import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { fail, ok } from "@/lib/response";
import { validateTelegramApiKey } from "@/lib/telegram-auth";

const orderSchema = z.object({
  customer_id: z.string().uuid(),
  employee_id: z.string().uuid(),
  delivery_address: z.string().min(3),
  items: z
    .array(
      z.object({
        product_id: z.string().uuid(),
        quantity: z.number().positive(),
        price: z.number().nonnegative(),
      })
    )
    .min(1),
  comment: z.string().optional(),
  idempotency_key: z.string().min(8),
});

export async function POST(request: Request) {
  if (!validateTelegramApiKey(request)) {
    return fail("Unauthorized", 401);
  }

  const body = await request.json();
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) return fail("Bad request", 422);

  const supabase = await createClient();

  const total = parsed.data.items.reduce((sum, i) => sum + i.quantity * i.price, 0);

  const orderInsert = await supabase
    .from("orders")
    .insert({
      customer_id: parsed.data.customer_id,
      employee_id: parsed.data.employee_id,
      total,
      delivery_address: parsed.data.delivery_address,
      status: "new",
      comment: parsed.data.comment ?? null,
      idempotency_key: parsed.data.idempotency_key,
    })
    .select("*")
    .single();

  if (orderInsert.error) {
    return fail(orderInsert.error.message, 400);
  }

  const order = orderInsert.data;

  const itemRows = parsed.data.items.map((it) => ({
    order_id: order.id,
    product_id: it.product_id,
    quantity: it.quantity,
    price: it.price,
    total: it.quantity * it.price,
  }));

  const itemInsert = await supabase.from("order_items").insert(itemRows);
  if (itemInsert.error) {
    return fail(itemInsert.error.message, 400);
  }

  return ok(order, { status: 201 });
}
