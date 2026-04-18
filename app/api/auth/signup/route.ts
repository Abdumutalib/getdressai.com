import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseAdmin } from "@/lib/supabase";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").trim();
const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "").trim();

function createSupabaseAnonClient() {
  if (!url || !anonKey) {
    throw new Error("Supabase auth is not configured.");
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const admin = createSupabaseAdmin();

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true
    });

    if (createError) {
      const normalizedMessage = createError.message.toLowerCase();
      const code =
        normalizedMessage.includes("already") && normalizedMessage.includes("registered")
          ? "EMAIL_EXISTS"
          : "SIGNUP_FAILED";

      return NextResponse.json({ error: createError.message, code }, { status: 400 });
    }

    const anon = createSupabaseAnonClient();
    const { data: signedIn, error: signInError } = await anon.auth.signInWithPassword({
      email: body.email,
      password: body.password
    });

    if (signInError || !signedIn.session) {
      return NextResponse.json(
        { error: signInError?.message || "Account created, but sign in failed." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      session: signedIn.session,
      user: signedIn.user ?? created.user ?? null
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Signup failed.", code: "SIGNUP_FAILED" },
      { status: 400 }
    );
  }
}
