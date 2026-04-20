import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").trim();
const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "").trim();
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

function hasConfiguredValue(value: string) {
  if (!value) {
    return false;
  }

  return !/(your-|your_|placeholder|example)/i.test(value);
}

export function isSupabaseAuthConfigured() {
  return hasConfiguredValue(url) && hasConfiguredValue(anonKey);
}

export function isSupabaseAdminConfigured() {
  return hasConfiguredValue(url) && hasConfiguredValue(serviceRoleKey);
}

export async function createSupabaseServerClient() {
  if (!isSupabaseAuthConfigured()) {
    throw new Error("Missing Supabase public environment variables.");
  }

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options as never);
        });
      }
    }
  });
}

export async function createSupabaseRequestClient(request: Request) {
  if (!isSupabaseAuthConfigured()) {
    throw new Error("Missing Supabase public environment variables.");
  }

  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
  const bearer = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();

  if (bearer) {
    return createClient(url, anonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${bearer}`
        }
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }

  return createSupabaseServerClient();
}

export function createSupabaseAdmin() {
  if (!isSupabaseAdminConfigured()) {
    throw new Error("Missing Supabase admin environment variables.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
