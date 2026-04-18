import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

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
    const anon = createSupabaseAnonClient();
    const { data, error } = await anon.auth.signInWithPassword({
      email: body.email,
      password: body.password
    });

    if (error || !data.session) {
      return NextResponse.json(
        { error: error?.message || "Login failed." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      session: data.session,
      user: data.user ?? null
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Login failed." },
      { status: 400 }
    );
  }
}
