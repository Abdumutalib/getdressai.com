import { createClient } from "@supabase/supabase-js";

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").trim();
const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "").trim();

function hasConfiguredValue(value: string) {
  if (!value) {
    return false;
  }

  return !/(your-|your_|placeholder|example)/i.test(value);
}

export function createBrowserSafeSupabase() {
  if (!hasConfiguredValue(url) || !hasConfiguredValue(anonKey)) {
    return null;
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce"
    }
  });
}

export async function getBrowserAccessToken() {
  const supabase = createBrowserSafeSupabase();

  if (!supabase) {
    return "";
  }

  const {
    data: { session }
  } = await supabase.auth.getSession();

  return session?.access_token ?? "";
}

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const token = await getBrowserAccessToken();
  const headers = new Headers(init.headers ?? {});

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(input, {
    ...init,
    credentials: "same-origin",
    headers
  });
}
