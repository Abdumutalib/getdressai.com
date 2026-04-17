import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { verifyPaddleWebhook } from "@/lib/paddle";
import { createSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  const headerStore = await headers();
  const signature = headerStore.get("paddle-signature") || "";
  const rawBody = await request.text();

  try {
    const valid = verifyPaddleWebhook(rawBody, signature);
    if (!valid) {
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const supabase = createSupabaseAdmin();

    await supabase.from("billing_events").insert({
      provider: "paddle",
      event_type: payload.event_type || "unknown",
      payload
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook processing failed." },
      { status: 400 }
    );
  }
}
