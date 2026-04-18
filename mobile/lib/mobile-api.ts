import { getMobileAccessToken } from '@/lib/mobile-supabase';

const APP_ORIGIN =
  (typeof process !== 'undefined' &&
    process.env?.EXPO_PUBLIC_APP_ORIGIN &&
    String(process.env.EXPO_PUBLIC_APP_ORIGIN).trim()) ||
  'https://getdressai.com';

export function getAppOrigin() {
  return APP_ORIGIN.replace(/\/$/, '');
}

export async function createAuthedHeaders(extra?: Record<string, string>) {
  const token = await getMobileAccessToken();

  return {
    ...(extra ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}
