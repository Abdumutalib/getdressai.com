import { NextResponse } from "next/server";
import { createPaddleCheckout } from "@/lib/paddle";
import { absoluteUrl } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await createPaddleCheckout({
      plan: body.plan,
      email: body.email,
      userId: body.userId,
      successUrl: body.successUrl || absoluteUrl("/dashboard?checkout=success"),
      cancelUrl: body.cancelUrl || absoluteUrl("/pricing?checkout=cancelled")
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Checkout failed." },
      { status: 400 }
    );
  }
}
