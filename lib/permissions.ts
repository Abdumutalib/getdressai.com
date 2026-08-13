import { createClient } from "@/lib/supabase/server";
import { isServerOnlyMode } from "@/lib/runtime-mode";

export async function hasPermission(userId: string, permission: string): Promise<boolean> {
  if (isServerOnlyMode()) {
    return true;
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("has_permission", {
    p_user_id: userId,
    p_permission: permission,
  });

  if (error) {
    return false;
  }

  return Boolean(data);
}
