import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { createSupabaseServerClient, createSupabaseAdmin } from "@/lib/supabase";

const schema = z.object({
  invitedEmail: z.string().email(),
  conversionType: z.enum(["join", "purchase"])
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const supabaseServer = await createSupabaseServerClient();
    const {
      data: { user }
    } = await supabaseServer.auth.getUser();

    if (!user?.id || !user.email) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (body.invitedEmail.toLowerCase() === user.email.toLowerCase()) {
      return NextResponse.json({ error: "You cannot invite yourself." }, { status: 400 });
    }

    const supabase = createSupabaseAdmin();
    const resendKey = process.env.RESEND_API_KEY || "";
    const creditAmount = body.conversionType === "join" ? 2 : 5;

    await supabase.from("referral_events").insert({
      referrer_id: user.id,
      invited_email: body.invitedEmail,
      conversion_type: body.conversionType,
      credit_amount: creditAmount
    });

    if (resendKey) {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: "GetDressAI <growth@getdressai.com>",
        to: body.invitedEmail,
        subject: "You were invited to GetDressAI",
        html: `<div style="font-family:Inter,Arial,sans-serif;padding:24px">
          <h1 style="font-size:24px;margin:0 0 12px">Try any outfit on your photo in seconds</h1>
          <p style="font-size:15px;line-height:1.7;color:#475569">A friend invited you to GetDressAI. Join now and explore premium AI try-on flows with fast, shareable results.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://getdressai.com"}/login" style="display:inline-block;margin-top:16px;background:#0B1020;color:#fff;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:600">Join GetDressAI</a>
        </div>`
      });
    }

    return NextResponse.json({ success: true, creditAmount });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Referral event failed." },
      { status: 400 }
    );
  }
}
