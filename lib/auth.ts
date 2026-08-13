import { createClient } from "@/lib/supabase/server";
import { UZ_ERRORS } from "@/lib/errors";
import { hasPermission } from "@/lib/permissions";
import { isServerOnlyMode } from "@/lib/runtime-mode";

const LOCAL_MODE_USER = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "local@akbel.crm",
};

export async function requireUser() {
  if (isServerOnlyMode()) {
    return LOCAL_MODE_USER;
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error(UZ_ERRORS.UNAUTHORIZED);
  }

  return user;
}

export async function requirePermission(permission: string) {
  if (isServerOnlyMode()) {
    return LOCAL_MODE_USER;
  }

  const user = await requireUser();
  const allowed = await hasPermission(user.id, permission);

  if (!allowed) {
    throw new Error(UZ_ERRORS.FORBIDDEN);
  }

  return user;
}
