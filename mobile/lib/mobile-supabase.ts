import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  (typeof process !== 'undefined' &&
    (process.env?.EXPO_PUBLIC_SUPABASE_URL || process.env?.SUPABASE_URL) &&
    String(process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL).trim()) ||
  '';

const SUPABASE_ANON_KEY =
  (typeof process !== 'undefined' &&
    (process.env?.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env?.SUPABASE_ANON_KEY) &&
    String(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY).trim()) ||
  '';

let supabaseSingleton: ReturnType<typeof createClient> | null = null;

export function getMobileSupabase() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return null;
  }

  if (!supabaseSingleton) {
    supabaseSingleton = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }

  return supabaseSingleton;
}

export async function getMobileAccessToken() {
  const supabase = getMobileSupabase();
  if (!supabase) {
    return null;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token ?? null;
}
