import { NextResponse } from "next/server";
import { z } from "zod";
import { createPaddleCheckout } from "@/lib/paddle";
import { absoluteUrl } from "@/lib/utils";
import { createSupabaseServerClient } from "@/lib/supabase";

const schema = z.object({
  plan: z.enum(["starter", "popular", "pro", "credits"]),
  billingCycle: z.enum(["yearly", "monthly"]).optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional()
});

function ensureSameOriginUrl(candidate: string | undefined, fallbackPath: string) {
  const fallback = absoluteUrl(fallbackPath);
  if (!candidate) {
    return fallback;
  }

  try {
    const url = new URL(candidate);
    const expectedOrigin = new URL(fallback).origin;
    return url.origin === expectedOrigin ? url.toString() : fallback;
  } catch {
    return fallback;
  }
}

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const supabase = await createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user?.id || !user.email) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const data = await createPaddleCheckout({
      plan: body.plan,
      billingCycle: body.billingCycle ?? "yearly",
      email: user.email,
      userId: user.id,
      successUrl: ensureSameOriginUrl(body.successUrl, "/dashboard?checkout=success"),
      cancelUrl: ensureSameOriginUrl(body.cancelUrl, "/pricing?checkout=cancelled")
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Checkout failed." },
      { status: 400 }
    );
  }
}
