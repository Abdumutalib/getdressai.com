import { createClient } from "@/lib/supabase/server";
import { ok, fail } from "@/lib/response";
import { isServerOnlyMode } from "@/lib/runtime-mode";

export async function GET() {
  if (isServerOnlyMode()) {
    return ok({
      auth_user: {
        id: "00000000-0000-0000-0000-000000000001",
        email: "local@akbel.crm",
      },
      profile: {
        id: "00000000-0000-0000-0000-000000000001",
        full_name: "Local Admin",
        phone: null,
        email: "local@akbel.crm",
        username: "local-admin",
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
      },
    });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return fail("Илтимос, тизимга киринг.", 401);
  }

  const { data: profile } = await supabase
    .from("users")
    .select("id, full_name, phone, email, username, active, created_at, updated_at, last_login")
    .eq("id", user.id)
    .single();

  return ok({
    auth_user: user,
    profile,
  });
}
