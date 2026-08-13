export function hasSupabaseEnv(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function isExternalServerMode(): boolean {
  return process.env.APP_MODE === "external_server" || process.env.NEXT_PUBLIC_APP_MODE === "external_server";
}

export function isServerOnlyMode(): boolean {
  return (
    process.env.APP_MODE === "server_only" ||
    process.env.NEXT_PUBLIC_APP_MODE === "server_only" ||
    isExternalServerMode() ||
    !hasSupabaseEnv()
  );
}
